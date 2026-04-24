"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { Search, Menu, Heart, ArrowRight, ArrowLeft, User, Plane, Clock3, Info, ShieldCheck, Home as HomeIcon, Compass, Briefcase, MapPinned, CalendarDays, Users, BadgeCheck, PhoneCall, X, PlaneTakeoff, PlaneLanding, MessageSquare, ChevronLeft, ChevronRight, Luggage, Wind, CheckCircle2, Crown, Leaf, CreditCard, Timer, Star } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerHeader, DrawerDescription } from "@/components/ui/drawer";

const MapBox = dynamic(() => import("@/components/MapBox"), { ssr: false });

type Airport = { code: string; name: string; city: string; country: string; vip?: boolean; coords: [number, number] };
type Vehicle = { id: string; name: string; seats: number; time: string; speed: string; range: string; bag: string; subtitle: string; price: string; avail: string; images: string[]; desc: string; pop?: boolean; };
type TripType = "simple" | "retour";
type Flight = { id: number; from: string; to: string; type: string; details: string; image: string; highlight: string; duration: string; distance: string; origin: [number, number]; dest: [number, number]; maxSeats: number; vehicles: Vehicle[]; };
type BookingPayload = { dep: Airport | null; arr: Airport | null; pax: number; date: string; returnDate?: string; tripType?: TripType; note?: string; jet?: Vehicle | null; contact?: { name: string; phone: string; email: string; }; services?: Record<string, boolean>; };

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const vibrate = (pattern: number | number[]) => { if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern); };
const generateBookingId = () => `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

const styles = {
  goldGrad: "bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)] shadow-[0_10px_30px_rgba(217,184,79,0.22),inset_0_1px_0_rgba(255,255,255,0.45)]",
  goldText: "text-transparent bg-clip-text bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)]",
  glass: "border border-white/5 bg-[#050608]/90 backdrop-blur-[24px] shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
  glassCard: "rounded-[32px] border border-[#d9b84f]/20 bg-black/40 backdrop-blur-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
  inputDark: "w-full rounded-2xl border border-white/12 bg-white/[0.04] pl-12 pr-4 py-3.5 text-sm text-white/90 outline-none transition-all focus:border-[#d9b84f]/50 focus:bg-white/[0.05] placeholder:text-white/30",
};

const airports: Airport[] = [
  { code: "LFMN", name: "Nice Côte d’Azur", city: "Nice", country: "France", vip: true, coords: [43.658, 7.215] },
  { code: "LFPB", name: "Paris Le Bourget", city: "Paris", country: "France", vip: true, coords: [48.969, 2.441] },
  { code: "LSGG", name: "Genève Cointrin", city: "Genève", country: "Suisse", coords: [46.238, 6.108] },
  { code: "OMDW", name: "Dubaï Al Maktoum", city: "Dubaï", country: "E.A.U.", vip: true, coords: [25.204, 55.27] },
  { code: "MRS", name: "Marseille Provence", city: "Marseille", country: "France", coords: [43.436, 5.215] },
  { code: "FAB", name: "Farnborough", city: "Londres", country: "Royaume-Uni", vip: true, coords: [51.47, -0.454] },
];

const flights: Flight[] = [
  { id: 1, from: "Nice", to: "Marseille", type: "Jet privé", details: "1 à 8 passagers · Vol sur mesure", image: "/vols/nice-marseille-main.jpg", highlight: "Signature Méditerranée", duration: "1h05", distance: "159 km", origin: [43.658, 7.215], dest: [43.436, 5.215], maxSeats: 8, vehicles: [
    { id: "light1", name: "Light Jet", seats: 4, time: "1h05", subtitle: "Rapide · Léger · Accès express", speed: "720 km/h", range: "2 200 km", bag: "2 valises", price: "À partir de 4 500 €", avail: "Départ sous 4h", pop: false, desc: "Le choix idéal pour les vols courts. Une cabine intime pour rejoindre rapidement votre destination.", images: ["/jet.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"] },
    { id: "mid1", name: "Midsize Jet", seats: 6, time: "0h55", subtitle: "Équilibre confort / vitesse", speed: "850 km/h", range: "4 500 km", bag: "4 valises", price: "À partir de 7 200 €", avail: "Départ sous 6h", pop: true, desc: "L'équilibre parfait entre confort et performance, avec une cabine spacieuse pour travailler ou se détendre.", images: ["/jet2.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"] },
    { id: "heavy1", name: "Heavy Jet", seats: 8, time: "0h50", subtitle: "Cabine spacieuse · Sur-mesure", speed: "900 km/h", range: "7 000 km", bag: "8 valises", price: "À partir de 12 000 €", avail: "Sur demande", pop: false, desc: "Le summum du luxe. De grands espaces, une capacité bagages optimale et un service de bord personnalisé.", images: ["/jet3.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"] },
  ]},
  { id: 2, from: "Genève", to: "Londres", type: "Jet privé", details: "1 à 4 passagers · Business express", image: "/vols/geneve-londres-main.jpg", highlight: "Business express", duration: "1h50", distance: "747 km", origin: [46.238, 6.108], dest: [51.47, -0.454], maxSeats: 4, vehicles: [
    { id: "vlight2", name: "Very Light Jet", seats: 2, time: "2h00", subtitle: "Intimité absolue · Idéal duo", speed: "650 km/h", range: "1 800 km", bag: "1 valise", price: "À partir de 3 800 €", avail: "Départ sous 4h", pop: false, desc: "Idéal pour les déplacements rapides en comité restreint. Agile et parfaitement optimisé.", images: ["/jet.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"] },
    { id: "light2", name: "Light Jet", seats: 4, time: "1h50", subtitle: "Business express · Accès direct", speed: "780 km/h", range: "2 800 km", bag: "3 valises", price: "À partir de 5 500 €", avail: "Départ sous 6h", pop: true, desc: "Le jet d'affaires par excellence en Europe. Fiable, élégant et idéal pour de courtes distances.", images: ["/jet2.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"] },
  ]},
  { id: 3, from: "Paris", to: "Dubaï", type: "Jet privé", details: "1 à 8 passagers · Service signature", image: "/vols/paris-dubai-main.jpg", highlight: "Long-courrier prestige", duration: "6h40", distance: "5 250 km", origin: [48.969, 2.441], dest: [25.204, 55.27], maxSeats: 8, vehicles: [
    { id: "mid3", name: "Midsize Jet", seats: 6, time: "7h10", subtitle: "Confort supérieur long-courrier", speed: "860 km/h", range: "5 500 km", bag: "6 valises", price: "À partir de 28 000 €", avail: "Départ sous 12h", pop: false, desc: "Traversez les continents avec style. Une cabine pensée pour le confort sur les longs trajets.", images: ["/jet2.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"] },
    { id: "heavy3", name: "Heavy Jet", seats: 8, time: "6h40", subtitle: "Luxe · Espace · Signature VIP", speed: "920 km/h", range: "9 000 km", bag: "10 valises", price: "À partir de 45 000 €", avail: "Sur demande", pop: true, desc: "Notre fleuron long-courrier. Vivez une expérience First Class incomparable, de votre domicile à l'arrivée.", images: ["/jet3.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"] },
  ]},
];

const emptyLegs = [
  { id: "el1", from: "Paris (LFPB)", to: "Ibiza (IBZ)", cityFrom: "Paris", cityTo: "Ibiza", date: "Demain, 14h00", jet: "Light Jet", price: "-40%", pax: 4, origin: [48.969, 2.441] as [number, number], dest: [38.872, 1.373] as [number, number] },
  { id: "el2", from: "Nice (LFMN)", to: "Genève (LSGG)", cityFrom: "Nice", cityTo: "Genève", date: "Jeu. 28 Mai", jet: "Midsize Jet", price: "-35%", pax: 6, origin: [43.658, 7.215] as [number, number], dest: [46.238, 6.108] as [number, number] },
  { id: "el3", from: "Dubaï (OMDW)", to: "Londres (FAB)", cityFrom: "Dubaï", cityTo: "Londres", date: "Sam. 30 Mai", jet: "Heavy Jet", price: "-50%", pax: 8, origin: [25.204, 55.27] as [number, number], dest: [51.47, -0.454] as [number, number] }
];

const flightOptions = [
  { id: "vip", name: "Accès Salon VIP", icon: BadgeCheck, desc: "Embarquement privatif et prioritaire" },
  { id: "pets", name: "Animaux en cabine", icon: Heart, desc: "Voyagez avec votre animal de compagnie" },
  { id: "luggage", name: "Bagages hors format", icon: Luggage, desc: "Skis, matériel de golf, malles volumineuses" }
];

const bottomNav = [{ id: "explorer", icon: Search, label: "Explorer" }, { id: "voyages", icon: Plane, label: "Vols" }, { id: "client", icon: User, label: "À propos" }, { id: "menu", icon: Menu, label: "Menu" }] as const;
const M_TABS = ["Menu", "Recherche", "Vols à vide", "Flotte", "Privilège"] as const;
const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } };

function CustomSelect({ val, setVal, Icon, ph, type, pax, setPax, maxPax = 8 }: any) {
  const [open, setOpen] = useState(false); const [search, setSearch] = useState("");
  const display = type === "pax" ? `${pax} Passager${(pax ?? 1) > 1 ? "s" : ""}` : val ? `${val.city} (${val.code})` : ph;
  const filtered = airports.filter((a) => a.city.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full min-w-0">
      <button type="button" onClick={() => { vibrate(8); setOpen(!open); }} className={cx(styles.inputDark, "relative text-left truncate")}><Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60" size={18} />{display}</button>
      <AnimatePresence mode="wait">
        {open && (
          <><div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-[#d9b84f]/20 bg-[#0a0a0c] shadow-2xl">
              {type === "airport" && (
                <><div className="flex items-center border-b border-white/10 bg-white/[0.02] px-4 py-3"><Search size={16} className="mr-2 text-[#d9b84f]/60" /><input autoFocus type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" /></div>
                  <div className="max-h-56 overflow-y-auto p-2">{filtered.length > 0 ? filtered.map((a) => (<button type="button" key={a.code} onClick={() => { vibrate(8); setVal?.(a); setOpen(false); setSearch(""); }} className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#d9b84f]/10"><span className="min-w-0 truncate text-sm text-white">{a.city} <span className="text-xs text-white/40">- {a.name}</span></span>{a.vip && <span className="rounded-full bg-[#d9b84f]/20 px-2 py-0.5 text-[8px] font-bold text-[#d9b84f]">VIP</span>}</button>)) : <div className="px-4 py-4 text-sm text-white/40">Aucun aéroport trouvé</div>}</div></>
              )}
              {type === "pax" && (
                <div className="p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-white">Passagers</span><div className="flex items-center gap-4"><button type="button" onClick={() => { vibrate(8); setPax?.(Math.max(1, (pax ?? 1) - 1)); }} className="flex h-8 w-8 items-center justify-center rounded-full transition bg-white/10 text-white hover:bg-[#d9b84f]/20">-</button><span className="w-4 text-center text-sm font-bold text-white">{pax}</span><button type="button" onClick={() => { vibrate(8); setPax?.(Math.min(maxPax, (pax ?? 1) + 1)); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b84f] text-black transition hover:bg-[#ebd57e]">+</button></div></div><p className="mt-3 text-[11px] text-[#d9b84f]/60">Capacité maximale : {maxPax} passagers</p></div>
              )}
            </motion.div></>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightSearchForm({ withTextarea, onValider, maxPax, mobileStepMode = false }: { withTextarea?: boolean; onValider: (payload: BookingPayload) => void; maxPax: number; mobileStepMode?: boolean; }) {
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState<TripType>("simple");
  const [dep, setDep] = useState<Airport | null>(null); const [arr, setArr] = useState<Airport | null>(null);
  const [pax, setPax] = useState(1); const [date, setDate] = useState(""); const [returnDate, setReturnDate] = useState(""); const [note, setNote] = useState("");

  const isStep1Valid = dep !== null && arr !== null && dep.code !== arr.code;
  const isStep2Valid = date !== "" && (tripType === "simple" || returnDate !== "");
  const submit = () => onValider({ dep, arr, pax, date, returnDate, tripType, note, contact: {name: "", phone: "", email: ""}, services: {} });

  if (!mobileStepMode) return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{(["simple", "retour"] as const).map((t) => (<button key={t} type="button" onClick={() => { vibrate(8); setTripType(t); }} className={cx("rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all", tripType === t ? "bg-[#d9b84f] text-black shadow-md" : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10")}>{t === "simple" ? "Aller simple" : "Aller-retour"}</button>))}</div>
      <CustomSelect type="airport" val={dep} setVal={setDep} Icon={PlaneTakeoff} ph="Aéroport de départ" />
      <CustomSelect type="airport" val={arr} setVal={setArr} Icon={PlaneLanding} ph="Aéroport d'arrivée" />
      {!isStep1Valid && dep && arr && dep.code === arr.code && <p className="text-xs text-[#d9b84f]">Le départ et l’arrivée doivent être différents.</p>}
      <div className={cx("grid gap-4", tripType === "retour" ? "grid-cols-2" : "grid-cols-1")}>
        <div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cx(styles.inputDark, "pl-12 h-[48px] [color-scheme:dark]")} /></div>
        {tripType === "retour" && (<div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={cx(styles.inputDark, "pl-12 h-[48px] [color-scheme:dark]")} /></div>)}
      </div>
      <CustomSelect type="pax" pax={pax} setPax={setPax} maxPax={maxPax} Icon={Users} ph="Passagers" />
      {withTextarea && <div className="relative w-full"><MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} /><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Exigences particulières (animaux, bagages hors format...)" className={cx(styles.inputDark, "h-24 resize-none")} /></div>}
      <motion.button type="button" disabled={!isStep1Valid || !isStep2Valid} onClick={() => { vibrate([10, 20, 10]); submit(); }} whileTap={{ scale: !isStep1Valid || !isStep2Valid ? 1 : 0.98 }} className={cx("mt-4 w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black transition-all", !isStep1Valid || !isStep2Valid ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.goldGrad)}>OBTENIR UN DEVIS</motion.button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">{[1, 2, 3].map((s) => (<div key={s} className={cx("h-1 rounded-full transition-all duration-300", step >= s ? "w-6 bg-[#d9b84f]" : "w-3 bg-white/20")} />))}</div>
        {step > 1 && <button onClick={() => { vibrate(8); setStep((p) => Math.max(1, p - 1)); }} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-white"><ArrowLeft size={10} /> Retour</button>}
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <CustomSelect type="airport" val={dep} setVal={setDep} Icon={PlaneTakeoff} ph="Aéroport de départ" />
            <CustomSelect type="airport" val={arr} setVal={setArr} Icon={PlaneLanding} ph="Aéroport d'arrivée" />
            {!isStep1Valid && dep && arr && dep.code === arr.code && <p className="text-xs text-[#d9b84f]">Le départ et l’arrivée doivent être différents.</p>}
            <motion.button type="button" disabled={!isStep1Valid} onClick={() => { vibrate(8); setStep(2); }} whileTap={{ scale: isStep1Valid ? 0.98 : 1 }} className={cx("mt-2 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all", isStep1Valid ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white/30 cursor-not-allowed")}>Continuer</motion.button>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className="flex flex-wrap gap-2">{(["simple", "retour"] as const).map((t) => (<button key={t} type="button" onClick={() => { vibrate(8); setTripType(t); }} className={cx("rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all", tripType === t ? "bg-[#d9b84f] text-black shadow-md" : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10")}>{t === "simple" ? "Aller simple" : "Aller-retour"}</button>))}</div>
            <div className={cx("grid gap-4", tripType === "retour" ? "grid-cols-2" : "grid-cols-1")}>
              <div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cx(styles.inputDark, "pl-12 h-[48px] [color-scheme:dark]")} /></div>
              {tripType === "retour" && <div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={cx(styles.inputDark, "pl-12 h-[48px] [color-scheme:dark]")} /></div>}
            </div>
            <CustomSelect type="pax" pax={pax} setPax={setPax} maxPax={maxPax} Icon={Users} ph="Passagers" />
            <motion.button type="button" disabled={!isStep2Valid} onClick={() => { vibrate(8); setStep(3); }} whileTap={{ scale: isStep2Valid ? 0.98 : 1 }} className={cx("mt-2 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all", isStep2Valid ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white/30 cursor-not-allowed")}>Détails finaux</motion.button>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className="rounded-2xl border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-4"><p className="mb-1 text-[10px] uppercase tracking-widest text-[#d9b84f]">Résumé du vol</p><p className="text-sm font-medium text-white">{dep?.city ?? "Départ"} ➔ {arr?.city ?? "Arrivée"}</p><p className="mt-1 text-xs text-white/50">{pax} passager(s) · {date || "Date à préciser"}</p></div>
            {withTextarea && <div className="relative w-full"><MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} /><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Exigences particulières..." className={cx(styles.inputDark, "h-24 resize-none")} /></div>}
            <motion.button type="button" onClick={() => { vibrate([10, 20, 10]); submit(); }} whileTap={{ scale: 0.98 }} className={`mt-4 w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black ${styles.goldGrad}`}>CONFIRMER LA DEMANDE</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [uberDrawerOpen, setUberDrawerOpen] = useState(false);
  const [jetCardOpen, setJetCardOpen] = useState(false);
  const [emptyLegDrawerOpen, setEmptyLegDrawerOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("explorer");
  const [menuTab, setMenuTab] = useState<typeof M_TABS[number]>("Menu");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  
  const [selectedFlight, setSelectedFlight] = useState<number>(flights[0].id);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(flights[0].vehicles[0].id);
  const [detailedVehicle, setDetailedVehicle] = useState<string | null>(null);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [lastBooking, setLastBooking] = useState<BookingPayload | null>(null);
  
  const [drawerStep, setDrawerStep] = useState(1);
  const [bd, setBd] = useState<BookingPayload>({ dep: airports[0], arr: airports[1], pax: 1, date: "", jet: flights[0].vehicles[0], services: { catering: false, chauffeur: false, pets: false }, contact: { name: "", phone: "", email: "" } });
  
  const [jcForm, setJcForm] = useState({ hours: 25, name: '', email: '', phone: '' });
  const [selectedEmptyLeg, setSelectedEmptyLeg] = useState<typeof emptyLegs[0] | null>(null);

  const selectedFlightData = flights.find((f) => f.id === selectedFlight) ?? flights[0];
  const detailedVehicleData = selectedFlightData.vehicles.find((v) => v.id === detailedVehicle);
  const selectedVehicleData = selectedFlightData.vehicles.find((v) => v.id === selectedVehicle) ?? selectedFlightData.vehicles[0];

  const refs: Record<string, any> = { experiences: useRef<HTMLDivElement>(null), devis: useRef<HTMLDivElement>(null), about: useRef<HTMLDivElement>(null), emptylegs: useRef<HTMLDivElement>(null), privilege: useRef<HTMLDivElement>(null) };

  useEffect(() => { if (!selectedFlightData.vehicles.some((v) => v.id === selectedVehicle)) setSelectedVehicle(selectedFlightData.vehicles[0].id); }, [selectedFlightData, selectedVehicle]);

  const goTo = (t?: string) => { if (t && refs[t].current) refs[t].current?.scrollIntoView({ behavior: "smooth", block: "start" }); setPanelOpen(false); };
  const handleFlightClick = (id: number) => { vibrate(8); const f = flights.find((x) => x.id === id) ?? flights[0]; setSelectedFlight(f.id); setSelectedVehicle(f.vehicles[0].id); setDetailedVehicle(null); setPhotoIndex(0); setUberDrawerOpen(true); };
  const toggleFav = (id: number) => { vibrate(8); setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])); };
  const handleDrawerDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.y > 140 || info.velocity.y > 800) setPanelOpen(false); };
  const triggerSuccessScreen = (payload: BookingPayload) => { setPanelOpen(false); setUberDrawerOpen(false); setShowSuccess(true); setBookingId(generateBookingId()); setLastBooking(payload); setTimeout(() => setShowSuccess(false), 5000); };
  const startBooking = () => { vibrate(8); setDrawerStep(1); setUberDrawerOpen(true); setPanelOpen(false); };
  const nextPhoto = () => { if (!detailedVehicleData) return; vibrate(8); setPhotoIndex((i) => (i === detailedVehicleData.images.length - 1 ? 0 : i + 1)); };
  const prevPhoto = () => { if (!detailedVehicleData) return; vibrate(8); setPhotoIndex((i) => (i === 0 ? detailedVehicleData.images.length - 1 : i - 1)); };

  const isNextDisabled = useMemo(() => {
    if (drawerStep === 1) return !bd.dep || !bd.arr || !bd.date;
    if (drawerStep === 2) return !bd.jet;
    if (drawerStep === 4) return !bd.contact?.name || !bd.contact?.phone;
    return false;
  }, [drawerStep, bd]);

  const handleNextStep = () => {
    vibrate(8);
    if (drawerStep === 5) { setUberDrawerOpen(false); setShowSuccess(true); setBookingId(generateBookingId()); setLastBooking(bd); setTimeout(() => setShowSuccess(false), 5000); } 
    else { setDrawerStep(s => s + 1); }
  };

  const featureBlocks = useMemo(() => [
    { Icon: Clock3, t: "Gain de temps", d: "Embarquez en quelques minutes. Nous optimisons votre emploi du temps." },
    { Icon: ShieldCheck, t: "Discrétion absolue", d: "Voyagez en toute sérénité. Votre vie privée est notre priorité absolue." },
    { Icon: BadgeCheck, t: "Service sur-mesure", d: "Un accompagnement d'excellence. Nous anticipons chacune de vos attentes." },
  ], []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <AnimatePresence mode="wait">
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="fixed top-6 md:top-10 left-1/2 -translate-x-1/2 z-[300] w-[calc(100%-2rem)] max-w-fit flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-[#d9b84f]/50 bg-black/90 px-5 py-3.5 shadow-[0_10px_40px_rgba(217,184,79,0.2)] backdrop-blur-xl">
              <CheckCircle2 size={20} className="text-[#d9b84f] shrink-0" />
              <span className="text-[13px] font-medium text-[#d9b84f] whitespace-nowrap">Demande envoyée : Un conseiller vous contactera sous 15 min.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0" suppressHydrationWarning>
        <Image src="/jet.jpg" alt="Jet privé ESIJET" fill priority sizes="100vw" quality={100} className="object-cover opacity-[0.45]" suppressHydrationWarning />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/70 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,184,79,0.1),transparent_45%)] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] xl:max-w-[1800px] flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-16 xl:px-24 lg:pb-16">
        
        <header className="py-1 sm:py-4 lg:py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="hidden items-center justify-between lg:flex">
            <h1 className={`text-[18px] font-bold tracking-[0.34em] sm:text-2xl ${styles.goldText}`}>ESIJET</h1>
            <nav className="flex items-center gap-5 xl:gap-8">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm">Accueil</button>
              <button onClick={() => goTo("experiences")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm">Flotte</button>
              <button onClick={() => goTo("emptylegs")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm">Vols à vide</button>
              <button onClick={() => goTo("privilege")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm">Privilège</button>
              <button onClick={() => goTo("about")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm">À propos</button>
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => goTo("devis")} className={`ml-2 rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black ${styles.goldGrad}`}>Planifier un vol</motion.button>
            </nav>
          </motion.div>
          <div className="lg:hidden mt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`rounded-[24px] px-3 py-3 ${styles.glassCard}`}>
              <button onClick={() => { vibrate(8); setPanelOpen(true); setMenuTab("Recherche"); }} className="flex w-full items-center gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebd57e]/15 shadow-inner border border-[#d9b84f]/20"><Search size={18} className="text-[#f4e08f]" /></div>
                <div className="min-w-0 flex-1"><p className="text-[8px] uppercase tracking-[0.24em] text-white/40">Votre prochaine destination ?</p><p className="truncate text-sm font-light text-white/95">Planifier un vol privé</p></div>
              </button>
            </motion.div>
          </div>
        </header>

        <section className="mt-6 hidden min-h-[70vh] items-center gap-10 md:grid lg:grid-cols-[1fr_540px] xl:grid-cols-[1fr_600px] lg:gap-16 xl:gap-24 xl:min-h-[78vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-3xl xl:max-w-4xl">
            <h2 className="max-w-4xl text-[34px] font-light leading-[0.98] tracking-tight sm:text-5xl md:text-[52px] lg:text-[64px] xl:text-[78px]">Le ciel aura une<br /><span className="mt-1 block text-[34px] font-normal tracking-tight text-white/95 sm:text-[44px] md:text-[54px] lg:text-[68px] xl:text-[82px]">nouvelle signature.</span></h2>
            <p className="mt-6 max-w-2xl border-l border-[#d9b84f]/30 pl-5 text-[14px] leading-relaxed text-white/70 sm:text-[15px] md:text-base lg:max-w-xl xl:max-w-2xl">L'aviation privée, repensée pour ceux dont le temps est précieux. Nous vous garantissons un voyage fluide, discret et orchestré dans les moindres détails.</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("experiences")} className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-all ${styles.goldGrad}`}>Explorer nos vols</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("about")} className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-[#d9b84f] hover:border-[#d9b84f]/40">Découvrir ESIJET</motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className={`hidden w-full justify-self-end rounded-[32px] p-6 lg:block lg:p-10 ${styles.glassCard}`}>
            <div className="mb-8"><h3 className="text-2xl font-light text-white">Demander une cotation</h3><p className="mt-2 text-sm text-[#d9b84f]/70">Renseignez vos critères pour un vol sur-mesure.</p></div>
            <FlightSearchForm onValider={triggerSuccessScreen} maxPax={selectedFlightData.maxSeats} withTextarea />
          </motion.div>
        </section>

        <section ref={refs.experiences} className="mt-5 md:mt-20">
          <motion.div {...fadeUp} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[#d9b84f]/20 pb-4">
            <div><h3 className="text-lg font-light tracking-wide text-white sm:text-xl lg:text-2xl">Flotte & Itinéraires</h3><p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">Aviation d’affaires · Départs privés · Service premium</p></div>
            <button onClick={() => goTo("devis")} className={`self-start text-[11px] font-bold tracking-[0.2em] sm:self-auto ${styles.goldText} transition hover:opacity-80`}>PLANIFIER UN VOL</button>
          </motion.div>
          <div className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 px-2 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-8 md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:pb-0 xl:grid-cols-3 xl:gap-8">
            {flights.map((f, i) => {
              const liked = favorites.includes(f.id);
              return (
                <motion.article key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }} className={`group min-w-[280px] max-w-[320px] snap-center overflow-hidden rounded-[32px] ${styles.glassCard} transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d9b84f]/40 hover:bg-[#050608]/80 md:min-w-0 md:max-w-none`}>
                  <div role="button" tabIndex={0} onClick={() => handleFlightClick(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlightClick(f.id); } }} className="block cursor-pointer text-left outline-none">
                    <div className="relative h-52 overflow-hidden sm:h-56 lg:h-60">
                      <Image src={f.image} alt={`${f.from} vers ${f.to}`} fill sizes="(max-width: 768px) 100vw, 33vw" quality={100} className="object-cover opacity-[0.85] transition-transform duration-1000 ease-out group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                      <button type="button" aria-label="Favoris" onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }} className={cx("absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:scale-105", liked ? "border-[#d9b84f]/60 bg-black/70 text-[#f7e49d]" : "hover:border-[#d9b84f]/50 hover:text-[#d9b84f]")}><Heart size={16} className={liked ? "fill-current" : ""} /></button>
                      <span className="absolute left-4 top-4 rounded-full border border-[#d9b84f]/40 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.20em] text-[#f2db89] backdrop-blur-md shadow-lg">{f.highlight}</span>
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.20em] text-white/95 backdrop-blur-md">{f.type}</span>
                    </div>
                    <div className="p-6"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/70">{f.from} <ArrowRight size={10} /> {f.to}</p><h4 className="mt-2.5 text-[15px] font-light leading-snug text-white/95 sm:text-base">{f.details}</h4></div>
                  </div>
                  <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-xs font-medium tracking-wide text-white/40">{f.duration} · {f.maxSeats} places</div>
                    <motion.button type="button" aria-label="Réserver" whileTap={{ scale: 0.95 }} onClick={() => handleFlightClick(f.id)} className="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 pl-4 pr-1.5 py-1.5 transition-colors hover:bg-white/15 group-hover:border-[#d9b84f]/40"><span className="text-[11px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[#d9b84f]">Réserver</span><div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#d9b84f]/20"><ArrowRight size={14} className="text-white group-hover:text-[#d9b84f]" /></div></motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* SECTION MOBILE : VOLS A VIDE */}
        <section ref={refs.emptylegs} className="mt-16 md:mt-20 block">
          <motion.div {...fadeUp} className="flex items-end justify-between border-b border-[#d9b84f]/20 pb-4">
            <div><h3 className="text-xl md:text-2xl font-light tracking-wide text-white">Vols à vide </h3><p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">Tarifs privilégiés • Disponibilité immédiate</p></div>
          </motion.div>
          <div className="mt-6 md:mt-8 flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {emptyLegs.map(leg => (
              <div key={leg.id} className={`rounded-[24px] ${styles.glassCard} p-6 lg:p-8 hover:border-[#d9b84f]/60 transition`}>
                <div className="flex justify-between items-center mb-4"><span className="rounded-full bg-[#d9b84f]/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">{leg.date}</span><span className="text-[11px] uppercase tracking-widest text-white/40">{leg.jet} · {leg.pax} pax</span></div>
                <p className="text-xl font-bold text-white mb-1">{leg.from}</p><p className="text-xl font-bold text-white"><ArrowRight size={16} className="inline text-[#d9b84f] mr-2" />{leg.to}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-[11px] uppercase tracking-widest text-[#d9b84f] font-bold">Avantage {leg.price}</span><button onClick={() => { vibrate(8); setSelectedEmptyLeg(leg); setEmptyLegDrawerOpen(true); setPanelOpen(false); }} className="rounded-full bg-[#d9b84f]/10 border border-[#d9b84f]/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20">Saisir l'opportunité</button></div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION MOBILE : APPEL RAPIDE VIP */}
        <section className="mt-12 block md:hidden">
          <motion.div {...fadeUp} className={`rounded-[32px] border border-[#d9b84f]/30 ${styles.glassCard} p-8 text-center bg-[radial-gradient(ellipse_at_center,rgba(217,184,79,0.15),transparent_70%)]`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f] mb-4">
              <PhoneCall size={28} />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Ligne VIP 24/7</h3>
            <p className="text-xs text-[#d9b84f]/70 mb-6">Un conseiller personnel à votre disposition pour toute demande urgente.</p>
            <a href="tel:+33651960631" className={`w-full block rounded-full py-4 text-[12px] font-bold uppercase tracking-widest text-black ${styles.goldGrad}`}>
              Appeler maintenant
            </a>
          </motion.div>
        </section>

        {/* SECTION MOBILE : PRIVILEGE */}
        <section ref={refs.privilege} className="mt-16 md:mt-24 block">
          <motion.div {...fadeUp} className={`rounded-[40px] border border-[#d9b84f]/30 ${styles.glass} p-8 md:p-12 lg:p-16 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)]`}>
            <Crown size={250} className="absolute -top-10 -right-10 text-[#d9b84f]/5 rotate-12 pointer-events-none" />
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_0.8fr] gap-10 lg:gap-16 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#d9b84f] mb-6"><Crown size={14}/> Programme exclusif</div>
                <h3 className="text-3xl md:text-4xl font-light text-white md:text-5xl mb-6">Jet Card ESIJET</h3>
                <p className="text-sm md:text-[15px] leading-relaxed text-white/70 mb-8">La sérénité d'avoir un jet privé toujours à disposition. Achetez vos heures de vol à l'avance et profitez de tarifs bloqués toute l'année, sans les contraintes de l'affrètement classique.</p>
                <button onClick={() => { vibrate(8); setJetCardOpen(true); setPanelOpen(false); }} className={`w-full md:w-auto rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black ${styles.goldGrad} transition hover:scale-105`}>Découvrir le programme</button>
              </div>
              <div className="flex flex-col gap-4">
                {[ { t: "Tarifs garantis", d: "Vos heures de vol sans aucune fluctuation.", i: CreditCard }, { t: "Disponibilité 48h", d: "Un appareil prêt à décoller sur simple appel.", i: Timer }, { t: "Flotte d'exception", d: "Un accès prioritaire aux jets les plus récents.", i: PlaneTakeoff } ].map((s, i) => (
                  <div key={i} className="flex items-center gap-6 rounded-[24px] border border-[#d9b84f]/15 bg-[#050608]/50 p-6 backdrop-blur-md hover:border-[#d9b84f]/30 transition"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><s.i size={20} /></div><div><p className="text-base font-bold text-white">{s.t}</p><p className="text-xs text-white/50 mt-1">{s.d}</p></div></div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-12 md:mt-24 lg:hidden">
          <motion.div {...fadeUp} className="hidden gap-6 md:grid md:grid-cols-3">
            {featureBlocks.map((f, i) => (
              <div key={i} className={`rounded-[32px] ${styles.glassCard} p-8 transition-all hover:border-[#d9b84f]/30`}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#d9b84f]/10 shadow-inner border border-[#d9b84f]/20"><f.Icon className="text-[#e5c96d]" size={24} /></div>
                <h3 className="text-lg font-medium text-white">{f.t}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{f.d}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section ref={refs.devis} className="mt-10 lg:hidden">
          <motion.div {...fadeUp} className={`${styles.glassCard} p-6 border-[#d9b84f]/20`}>
            <div className="mb-6"><h3 className="text-2xl font-light text-white">Demander un devis</h3><p className="mt-2 text-xs leading-relaxed text-[#d9b84f]/70">Décrivez votre besoin pour une proposition sur mesure.</p></div>
            <FlightSearchForm onValider={startBooking} maxPax={selectedFlightData.maxSeats} mobileStepMode />
          </motion.div>
        </section>

        <section ref={refs.about} className="mt-12 md:mt-28">
          <motion.div {...fadeUp} className={`rounded-[40px] border border-[#d9b84f]/20 ${styles.glass} p-8 shadow-2xl backdrop-blur-3xl md:p-14 lg:p-20`}>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
              <div className="flex flex-col justify-center">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d9b84f]">Notre Vision</p>
                <h3 className="text-3xl font-light leading-[1.1] text-white md:text-5xl">L'exigence comme seul standard.</h3>
                <div className="mt-8 space-y-5"><p className="text-[15px] leading-relaxed text-white/60 md:text-[17px]">Chez ESIJET, nous savons qu'un vol privé n'est pas qu'une question de destination. C'est la garantie d'un temps préservé, d'une intimité respectée et d'un service d'une fiabilité irréprochable.</p></div>
              </div>
              <div className="grid gap-4">
                {[
                  { Icon: Briefcase, t: "Pour qui ?", d: "Entrepreneurs, personnalités et familles exigeantes." },
                  { Icon: MapPinned, t: "Votre expérience", d: "Simple, rapide et sans compromis sur l'élégance." },
                  { Icon: PhoneCall, t: "À vos côtés", d: "Une équipe dédiée disponible 24h/24, 7j/7." },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-5 rounded-[24px] border border-[#d9b84f]/15 bg-[#050608]/50 p-6 transition hover:border-[#d9b84f]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><c.Icon size={20} /></div>
                    <div><h4 className="text-[15px] font-medium text-white">{c.t}</h4><p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{c.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="mt-20 hidden border-t border-[#d9b84f]/20 pt-10 pb-12 md:block">
          <div className="flex items-start justify-between">
            <div className="flex gap-10 text-[11px] font-bold uppercase tracking-[0.30em] text-[#d9b84f]/50"><span>Excellence</span><span>Discrétion</span><span>Élévation</span></div>
            <div className="flex flex-col items-end gap-5">
              <div className="flex gap-8 text-[10px] uppercase tracking-[0.25em] text-white/30"><a href="#" className="transition hover:text-[#d9b84f]">Mentions légales</a><a href="#" className="transition hover:text-[#d9b84f]">Confidentialité</a></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/15">© 2026 ESIJET. Luxe Privé.</p>
            </div>
          </div>
        </footer>

        {/* MOBILE FOOTER : ULTRACORT */}
        <footer className="mt-14 border-t border-[#d9b84f]/20 pt-8 pb-32 md:hidden flex justify-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#d9b84f]/50">© 2026 ESIJET.</p>
        </footer>
      </div>

      <div className="fixed bottom-10 right-10 z-40 hidden lg:block">
        <a href="tel:+33651960631" aria-label="Appeler la ligne VIP" className="group flex h-16 items-center gap-4 rounded-full border border-[#d9b84f]/30 bg-[#000000]/90 pl-2.5 pr-7 backdrop-blur-2xl shadow-[0_15px_50px_rgba(217,184,79,0.15)] transition-all hover:scale-105 hover:border-[#d9b84f]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9b84f] text-black shadow-inner"><PhoneCall size={20} fill="currentColor" /></div>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#d9b84f] transition-colors">Ligne VIP</span>
        </a>
      </div>

      <Drawer open={emptyLegDrawerOpen} onOpenChange={setEmptyLegDrawerOpen}>
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only"><DrawerTitle>Vol à vide</DrawerTitle><DrawerDescription>Réservation d'un vol à vide</DrawerDescription></DrawerHeader>
          <div className="relative z-50 mx-auto mb-4 flex h-[85svh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[32px] bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[80dvh] md:max-w-[1000px] md:flex-row border border-[#d9b84f]/30">
            <div className="relative h-[35%] w-full shrink-0 md:order-2 md:h-full md:w-[50%] border-b md:border-b-0 md:border-l border-[#d9b84f]/20">
              <div className="pointer-events-none absolute inset-0 grayscale opacity-40 mix-blend-screen">{emptyLegDrawerOpen && selectedEmptyLeg && (<MapBox origin={selectedEmptyLeg.origin} dest={selectedEmptyLeg.dest} />)}</div>
              <button onClick={() => setEmptyLegDrawerOpen(false)} className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#050608]/80 text-[#d9b84f] border border-[#d9b84f]/30 backdrop-blur-xl transition hover:bg-[#d9b84f]/10"><X size={18} /></button>
              <div className="absolute bottom-5 left-5 z-20">
                <span className="rounded-full bg-[#d9b84f] px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(217,184,79,0.5)]">Offre {selectedEmptyLeg?.price}</span>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col text-white md:order-1 relative overflow-y-auto p-6 md:p-10 bg-[#0a0a0c]">
              <h2 className="text-3xl font-light mb-1 text-white">Vol de positionnement</h2>
              <p className="text-xs text-[#d9b84f]/70 mb-10 uppercase tracking-widest">Opportunité de dernière minute.</p>
              
              {selectedEmptyLeg && (
                <div className="space-y-8">
                  <div className="rounded-[24px] border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-6">
                     <div className="flex items-center gap-3 mb-6"><PlaneTakeoff size={20} className="text-[#d9b84f]"/> <span className="font-bold text-xl text-white">{selectedEmptyLeg.cityFrom} <ArrowRight size={16} className="inline mx-2 text-[#d9b84f]/50"/> {selectedEmptyLeg.cityTo}</span></div>
                     <div className="space-y-4 text-sm text-white/80">
                       <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Départ</span><span className="font-medium text-[#d9b84f] text-base">{selectedEmptyLeg.date}</span></div>
                       <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Appareil</span><span className="font-medium">{selectedEmptyLeg.jet}</span></div>
                       <div className="flex justify-between pb-1"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Capacité max</span><span className="font-medium">{selectedEmptyLeg.pax} passagers</span></div>
                     </div>
                  </div>
                  
                  <div>
                     <label className="text-[10px] uppercase tracking-widest text-[#d9b84f] font-bold mb-4 block">Vos coordonnées</label>
                     <div className="space-y-4">
                       <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input placeholder="Nom complet" className={styles.inputDark} /></div>
                       <div className="relative"><PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input placeholder="Téléphone" type="tel" className={styles.inputDark} /></div>
                     </div>
                  </div>

                  <button onClick={() => { vibrate(8); setEmptyLegDrawerOpen(false); triggerSuccessScreen({} as any); }} className={`w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all ${styles.goldGrad}`}>Réserver ce vol</button>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={jetCardOpen} onOpenChange={setJetCardOpen}>
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only"><DrawerTitle>Abonnement Jet Card</DrawerTitle><DrawerDescription>Formulaire d'abonnement</DrawerDescription></DrawerHeader>
          <div className="relative z-50 mx-auto mb-4 flex h-[85svh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[32px] bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[80dvh] md:max-w-[800px] md:flex-row border border-[#d9b84f]/30">
            <div className="relative h-[30%] w-full shrink-0 md:order-2 md:h-full md:w-[45%] bg-black">
              <Image src="/jet.jpg" alt="Jet Card ESIJET" fill className="object-cover opacity-40 grayscale mix-blend-screen" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-[#000000] to-transparent">
                 <Crown size={56} className="text-[#d9b84f] mb-4 drop-shadow-[0_0_15px_rgba(217,184,79,0.5)]" />
                 <h3 className="text-3xl font-light text-white mb-2">Jet Card</h3>
                 <p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">L'ultime liberté de voler.</p>
              </div>
              <button onClick={() => setJetCardOpen(false)} aria-label="Fermer" className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"><X size={18} /></button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col text-white md:order-1 relative overflow-y-auto p-6 md:p-10 bg-[#0a0a0c]">
               <h2 className="text-2xl font-light mb-1">Adhésion Jet Card</h2>
               <p className="text-xs text-white/50 mb-10">Configurez votre abonnement d'heures de vol.</p>
               <div className="space-y-8">
                  <div>
                     <label className="text-[10px] uppercase tracking-widest text-[#d9b84f] font-bold mb-4 block">Volume d'heures</label>
                     <div className="grid grid-cols-3 gap-3">
                        {[25, 50, 100].map(h => (
                           <button key={h} onClick={() => { vibrate(8); setJcForm({...jcForm, hours: h}); }} className={cx("rounded-2xl border py-4 text-sm font-bold transition-all", jcForm.hours === h ? "border-[#d9b84f] bg-[#d9b84f]/10 text-[#d9b84f] shadow-[0_4px_15px_rgba(217,184,79,0.2)]" : "border-white/10 bg-white/[0.02] text-white/50 hover:border-[#d9b84f]/50")}>{h}h</button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] uppercase tracking-widest text-[#d9b84f] font-bold mb-4 block">Vos coordonnées</label>
                     <div className="space-y-4">
                       <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input placeholder="Nom complet" value={jcForm.name} onChange={e => setJcForm({...jcForm, name: e.target.value})} className={styles.inputDark} /></div>
                       <div className="relative"><PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input placeholder="Téléphone" type="tel" value={jcForm.phone} onChange={e => setJcForm({...jcForm, phone: e.target.value})} className={styles.inputDark} /></div>
                       <div className="relative"><MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} /><input placeholder="Email" type="email" value={jcForm.email} onChange={e => setJcForm({...jcForm, email: e.target.value})} className={styles.inputDark} /></div>
                     </div>
                  </div>
                  <button disabled={!jcForm.name || !jcForm.phone} onClick={() => { vibrate(8); setJetCardOpen(false); triggerSuccessScreen({} as any); }} className={cx("mt-4 w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", (!jcForm.name || !jcForm.phone) ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.goldGrad)}>Demander mon adhésion</button>
               </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={uberDrawerOpen} onOpenChange={(open) => { setUberDrawerOpen(open); if (!open) { setDetailedVehicle(null); setPhotoIndex(0); } }}>
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only"><DrawerTitle>Sélection</DrawerTitle><DrawerDescription>Choix du jet</DrawerDescription></DrawerHeader>
          <div className="relative z-50 mx-auto mb-4 flex h-[82svh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[32px] bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[78dvh] md:max-w-[1150px] md:flex-row border border-[#d9b84f]/30">
            <div className="relative h-[28%] w-full shrink-0 border-b md:border-b-0 md:border-l border-[#d9b84f]/20 md:order-2 md:h-full md:w-[50%]">
              <div className="pointer-events-none absolute inset-0 grayscale opacity-40 mix-blend-screen">{uberDrawerOpen && (<MapBox origin={selectedFlightData.origin} dest={selectedFlightData.dest} />)}</div>
              <button onClick={() => { vibrate(8); setUberDrawerOpen(false); }} aria-label="Fermer" className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#050608]/80 text-[#d9b84f] border border-[#d9b84f]/30 backdrop-blur-xl transition hover:bg-[#d9b84f]/10"><X size={18} /></button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col bg-[#050608] text-white md:order-1">
              <div className="min-h-[80px] shrink-0 px-5 pt-5 md:px-6 md:pt-10 flex items-center justify-between">
                {detailedVehicle ? (
                  <button onClick={() => { vibrate(8); setDetailedVehicle(null); setPhotoIndex(0); }} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition hover:border-[#d9b84f]/50 hover:text-[#d9b84f]"><ArrowLeft size={16} /> Retour aux jets</button>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {flights.map((f) => (<button key={f.id} onClick={() => { vibrate(8); setSelectedFlight(f.id); setSelectedVehicle(f.vehicles[0].id); setDetailedVehicle(null); setPhotoIndex(0); }} className={cx("whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition", selectedFlight === f.id ? "bg-[#d9b84f] text-black shadow-lg" : "border border-white/15 text-white/60 hover:bg-white/5 hover:border-[#d9b84f]/30")}>{f.from} → {f.to}</button>))}
                  </div>
                )}
                {drawerStep === 2 && detailedVehicle && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#d9b84f] ml-auto">Étape 2 / 5</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-4 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait">
                  {drawerStep === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5 pb-10 mt-4">
                      <div><h2 className="text-2xl font-light mb-1 text-white">Votre itinéraire</h2><p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">Où souhaitez-vous aller ?</p></div>
                      <CustomSelect type="airport" val={bd.dep} setVal={(v:any)=>setBd({...bd, dep:v})} Icon={PlaneTakeoff} ph="Aéroport de départ" />
                      <CustomSelect type="airport" val={bd.arr} setVal={(v:any)=>setBd({...bd, arr:v})} Icon={PlaneLanding} ph="Aéroport d'arrivée" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60" size={18} /><input type="date" value={bd.date} onChange={(e) => setBd({...bd, date: e.target.value})} className={styles.inputDark} /></div>
                        <CustomSelect type="pax" pax={bd.pax} setPax={(p:number)=>setBd({...bd, pax:p})} maxPax={8} Icon={Users} ph="Passagers" />
                      </div>
                    </motion.div>
                  )}

                  {drawerStep === 2 && detailedVehicle && detailedVehicleData ? (
                    <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-2 space-y-6 pb-12">
                      <div className="relative h-56 w-full overflow-hidden rounded-[24px] border border-[#d9b84f]/20">
                        <AnimatePresence mode="wait">
                          <motion.div key={photoIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0 cursor-grab active:cursor-grabbing" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, { offset }) => { if (offset.x <= -40) nextPhoto(); if (offset.x >= 40) prevPhoto(); }}>
                            <Image src={detailedVehicleData.images[photoIndex]} alt={detailedVehicleData.name} fill sizes="(max-width: 768px) 100vw, 50vw" quality={100} className="pointer-events-none object-cover opacity-90" />
                          </motion.div>
                        </AnimatePresence>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <button onClick={prevPhoto} aria-label="Photo précédente" className="absolute left-3 top-1/2 z-10 rounded-full bg-[#050608]/60 border border-[#d9b84f]/30 p-2 text-[#d9b84f] -translate-y-1/2 backdrop-blur-md"><ChevronLeft size={20} /></button>
                        <button onClick={nextPhoto} aria-label="Photo suivante" className="absolute right-3 top-1/2 z-10 rounded-full bg-[#050608]/60 border border-[#d9b84f]/30 p-2 text-[#d9b84f] -translate-y-1/2 backdrop-blur-md"><ChevronRight size={20} /></button>
                        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">{detailedVehicleData.images.map((_, i) => (<div key={i} className={cx("h-1.5 rounded-full transition-all duration-300", photoIndex === i ? "w-8 bg-[#d9b84f]" : "w-1.5 bg-white/40")} />))}</div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between"><h2 className="text-2xl font-bold text-white">{detailedVehicleData.name}</h2>{detailedVehicleData.pop && (<span className="rounded-full bg-[#d9b84f]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#d9b84f] border border-[#d9b84f]/30 shadow-[0_0_10px_rgba(217,184,79,0.2)]">Recommandé</span>)}</div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/80">{detailedVehicleData.subtitle}</p><p className="text-[15px] leading-relaxed text-white/70">{detailedVehicleData.desc}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 border-t border-[#d9b84f]/15 pt-6">
                        <div className="rounded-[20px] bg-white/[0.03] p-3 text-center shadow-sm border border-white/5"><Users className="mx-auto mb-2 text-[#d9b84f]" size={18} /><p className="text-sm font-bold text-white">{detailedVehicleData.seats} pax</p></div>
                        <div className="rounded-[20px] bg-white/[0.03] p-3 text-center shadow-sm border border-white/5"><Wind className="mx-auto mb-2 text-[#d9b84f]" size={18} /><p className="text-sm font-bold text-white">{detailedVehicleData.speed}</p></div>
                        <div className="rounded-[20px] bg-white/[0.03] p-3 text-center shadow-sm border border-white/5"><Luggage className="mx-auto mb-2 text-[#d9b84f]" size={18} /><p className="text-sm font-bold text-white">{detailedVehicleData.bag}</p></div>
                      </div>
                    </motion.div>
                  ) : drawerStep === 2 ? (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-4 pb-12">
                      <div className="mb-4"><h2 className="text-xl font-light mb-1 text-white">Choix de l'appareil</h2><p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">Sélectionnez le jet adapté à vos besoins.</p></div>
                      {selectedFlightData.vehicles.map((v) => {
                        const isSelected = bd.jet?.id === v.id;
                        return (
                          <div key={v.id} onClick={() => { vibrate(8); setSelectedVehicle(v.id); setBd({...bd, jet: v}); }} className={cx("cursor-pointer rounded-[28px] border p-5 transition-all", isSelected ? "scale-[1.02] bg-[#d9b84f]/10 border-[#d9b84f] text-white shadow-[0_10px_30px_rgba(217,184,79,0.15)]" : "border-white/10 bg-transparent hover:border-[#d9b84f]/40 text-white")}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-3"><h3 className="text-lg font-bold">{v.name}</h3> <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-[#d9b84f] px-2 py-0.5 rounded-sm">{v.price}</span></div>
                                <p className={cx("mt-1 text-xs font-medium uppercase tracking-widest", isSelected ? "text-[#d9b84f]" : "text-white/50")}>{v.subtitle}</p>
                                <div className={cx("mt-3 flex items-center gap-3 text-[11px]", isSelected ? "text-white/90" : "text-white/50")}><span>{v.seats} pax</span><span>•</span><span>{v.time}</span>{v.pop && (<><span>•</span><span className={isSelected ? "text-[#d9b84f]" : "text-[#d9b84f]/70"}>Recommandé</span></>)}</div>
                              </div>
                              <button aria-label="Voir les détails" onClick={(e) => { e.stopPropagation(); vibrate(8); setSelectedVehicle(v.id); setDetailedVehicle(v.id); setPhotoIndex(0); setBd({...bd, jet: v}); }} className={cx("rounded-full p-3 transition", isSelected ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white hover:bg-white/10 hover:text-[#d9b84f]")}><Info size={20} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : null}

                  {drawerStep === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 pb-10 mt-4">
                      <div className="mb-6"><h2 className="text-2xl font-light mb-1 text-white">Options de vol</h2><p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">Sélectionnez vos besoins spécifiques à bord.</p></div>
                      {flightOptions.map((s) => {
                        const isActive = bd.services?.[s.id];
                        return (
                          <div key={s.id} onClick={() => { vibrate(8); setBd({...bd, services: {...(bd.services || {}), [s.id]: !isActive}}); }} className={cx("cursor-pointer rounded-[24px] border p-5 flex items-center gap-5 transition-all", isActive ? "border-[#d9b84f] bg-[#d9b84f]/10 shadow-[0_10px_20px_rgba(217,184,79,0.15)]" : "border-white/10 bg-white/[0.02] hover:border-[#d9b84f]/40")}>
                            <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors", isActive ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white/40")}><s.icon size={20} /></div>
                            <div><h3 className="text-sm font-bold text-white">{s.name}</h3><p className="text-[11px] text-white/50 mt-1">{s.desc}</p></div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {drawerStep === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4 pb-10 mt-4">
                      <div className="mb-6"><h2 className="text-2xl font-light mb-1 text-white">Vos coordonnées</h2><p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">Pour que votre conseiller puisse vous contacter.</p></div>
                      <div className="space-y-4">
                        <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60" size={18} /><input placeholder="Nom complet" value={bd.contact?.name} onChange={(e) => setBd({...bd, contact: {...(bd.contact||{name:'',phone:'',email:''}), name: e.target.value}})} className={styles.inputDark} /></div>
                        <div className="relative"><PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60" size={18} /><input placeholder="Téléphone (avec indicatif)" type="tel" value={bd.contact?.phone} onChange={(e) => setBd({...bd, contact: {...(bd.contact||{name:'',phone:'',email:''}), phone: e.target.value}})} className={styles.inputDark} /></div>
                        <div className="relative"><MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60" size={18} /><input placeholder="Adresse email" type="email" value={bd.contact?.email} onChange={(e) => setBd({...bd, contact: {...(bd.contact||{name:'',phone:'',email:''}), email: e.target.value}})} className={styles.inputDark} /></div>
                      </div>
                    </motion.div>
                  )}

                  {drawerStep === 5 && (
                    <motion.div key="s5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 pb-10 mt-4">
                      <div className="mb-2"><h2 className="text-2xl font-light mb-1 text-white">Récapitulatif</h2><p className="text-xs text-[#d9b84f]/70 uppercase tracking-widest">Vérifiez les détails avant l'envoi de la demande.</p></div>
                      <div className="rounded-[24px] bg-[#d9b84f]/5 p-6 border border-[#d9b84f]/20 shadow-sm">
                        <div className="flex items-center gap-3 mb-6"><PlaneTakeoff size={18} className="text-[#d9b84f]"/> <span className="font-bold text-white text-lg">{bd.dep?.city} <ArrowRight size={14} className="inline mx-2 text-[#d9b84f]/50"/> {bd.arr?.city}</span></div>
                        <div className="space-y-4 text-sm text-white/90">
                          <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Départ</span><span className="font-medium text-[#d9b84f]">{bd.date || "Date flexible"}</span></div>
                          <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Passagers</span><span className="font-medium">{bd.pax} pers.</span></div>
                          <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Appareil</span><span className="font-medium">{bd.jet?.name}</span></div>
                          <div className="flex justify-between pt-2"><span className="text-[#d9b84f] uppercase tracking-widest text-[10px] font-bold">Estimation</span><span className="font-bold text-[#d9b84f] text-lg">{bd.jet?.price}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="shrink-0 border-t border-[#d9b84f]/20 bg-[#050608] p-4 md:p-6 mb-2">
                <button disabled={isNextDisabled} onClick={handleNextStep} className={cx("w-full rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", isNextDisabled ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.goldGrad)}>
                  {detailedVehicle ? "Choisir cet appareil" : drawerStep === 5 ? "Confirmer la demande" : "Étape suivante"}
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} />
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 260 }} dragElastic={0.18} onDragEnd={handleDrawerDragEnd} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 bottom-0 top-[64px] z-[60] flex flex-col rounded-t-[36px] border-t border-[#d9b84f]/20 bg-[#050608]/98 px-5 pb-6 pt-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden">
              <div className="sr-only"><h2>Menu principal</h2></div>
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
              
              <div className="mb-5 flex items-center gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {M_TABS.map((tab) => (<button key={tab} onClick={() => { vibrate(8); setMenuTab(tab); }} className={cx("whitespace-nowrap border-b-2 pb-2 text-[14px] font-medium transition-all", menuTab === tab ? "border-[#d9b84f] text-[#d9b84f]" : "border-transparent text-white/40 hover:text-white/70")}>{tab}</button>))}
              </div>

              {menuTab === "Menu" && (
                <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {[
                      { Icon: Compass, t: "Vols", a: () => { setPanelOpen(false); goTo("experiences"); } }, 
                      { Icon: CalendarDays, t: "Réserver", a: () => setMenuTab("Recherche") }, 
                      { Icon: BadgeCheck, t: "À propos", a: () => goTo("about") },
                      { Icon: HomeIcon, t: "Accueil", bg: styles.goldGrad, a: () => { setPanelOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); } },
                    ].map((b, i) => (
                      <button key={i} onClick={() => { vibrate(8); b.a(); }} className={b.bg ? `rounded-[24px] p-5 text-left text-black ${b.bg} shadow-lg shadow-[#d9b84f]/10` : `rounded-[24px] border border-white/10 ${styles.glassCard} p-5 text-left transition hover:border-[#d9b84f]/30`}>
                        <b.Icon size={20} className={`mb-4 ${b.bg ? "" : "text-[#e5c96d]"}`} /><p className={`text-[15px] ${b.bg ? "font-bold" : "font-medium text-white"}`}>{b.t}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-[#d9b84f]/15 pt-6">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]">Espace VIP</p>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => vibrate(8)} className="flex items-center gap-4 rounded-[20px] bg-white/[0.02] p-4 border border-white/5 transition hover:border-[#d9b84f]/30">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><PhoneCall size={18} /></div>
                        <div className="text-left"><p className="text-sm font-bold text-white">Assistance 24/7</p><p className="text-xs text-white/40">Contact direct & WhatsApp</p></div>
                      </button>
                      <button onClick={() => vibrate(8)} className="flex items-center gap-4 rounded-[20px] bg-white/[0.02] p-4 border border-white/5 transition hover:border-[#d9b84f]/30">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><Heart size={18} /></div>
                        <div className="text-left"><p className="text-sm font-bold text-white">Mes Favoris</p><p className="text-xs text-white/40">{favorites.length} vols et jets enregistrés</p></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {menuTab === "Recherche" && (
                <div className={`${styles.glassCard} rounded-[32px] p-6 border-[#d9b84f]/20`}>
                  <h3 className="mb-6 text-xl font-light text-white">Demander une cotation</h3>
                  <FlightSearchForm onValider={startBooking} maxPax={selectedFlightData.maxSeats} mobileStepMode />
                </div>
              )}

              {menuTab === "Vols à vide" && (
                <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <p className="px-1 mb-4 text-[11px] text-[#d9b84f]/70 leading-relaxed uppercase tracking-widest">Profitez de nos vols de positionnement à des tarifs préférentiels exclusifs.</p>
                  <div className="flex flex-col gap-4">
                    {emptyLegs.map(leg => (
                      <div key={leg.id} className="rounded-[24px] border border-[#d9b84f]/30 bg-[#050608] p-5 shadow-[0_0_15px_rgba(217,184,79,0.05)]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="rounded-full bg-[#d9b84f]/20 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#d9b84f]">{leg.date}</span>
                          <span className="text-[10px] uppercase tracking-widest text-white/40">{leg.jet} · {leg.pax} pax</span>
                        </div>
                        <p className="text-lg font-bold text-white mb-1">{leg.cityFrom}</p>
                        <p className="text-lg font-bold text-white"><ArrowRight size={14} className="inline text-[#d9b84f] mr-1.5" />{leg.cityTo}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-[#d9b84f] font-bold">Avantage {leg.price}</span>
                          <button onClick={() => { vibrate(8); setSelectedEmptyLeg(leg); setEmptyLegDrawerOpen(true); setPanelOpen(false); }} className="rounded-full bg-[#d9b84f]/10 border border-[#d9b84f]/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20">Réserver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {menuTab === "Flotte" && (
                <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="mt-2 flex flex-col gap-4">
                    {flights[0].vehicles.map((v) => (
                      <div key={v.id} onClick={() => { vibrate(8); setPanelOpen(false); setSelectedFlight(flights[0].id); setSelectedVehicle(v.id); setDetailedVehicle(v.id); setPhotoIndex(0); startBooking(); }} className="group relative flex h-32 cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-[#050608] transition hover:border-[#d9b84f]/40">
                        <div className="relative w-2/5 shrink-0">
                          <Image src={v.images[0]} alt={v.name} fill className="object-cover opacity-80 transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-[#050608]" />
                        </div>
                        <div className="flex flex-1 flex-col justify-center p-4">
                          <h4 className="text-sm font-bold text-white">{v.name}</h4>
                          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-[#d9b84f]">{v.price}</p>
                          <div className="mt-2 flex gap-3 text-[11px] text-white/50"><span>{v.seats} pax</span><span>•</span><span>{v.speed}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {menuTab === "Privilège" && (
                <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className={`rounded-[24px] border border-[#d9b84f]/30 ${styles.glassCard} bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)] p-6 mb-4 text-center relative overflow-hidden`}>
                    <Crown size={120} className="absolute -top-4 -right-4 text-[#d9b84f]/10 rotate-12 pointer-events-none" />
                    <Crown size={28} className="mx-auto mb-3 text-[#d9b84f] relative z-10" />
                    <h3 className="text-xl font-light text-white mb-2 relative z-10">Jet Card ESIJET</h3>
                    <p className="text-xs text-white/60 leading-relaxed relative z-10">L'ultime liberté. Bloquez 25h ou 50h de vol à tarif fixe garanti, avec une disponibilité assurée en 48h.</p>
                    <button onClick={() => { vibrate(8); setJetCardOpen(true); setPanelOpen(false); }} className={`mt-5 w-full rounded-full py-3 text-[11px] font-bold uppercase tracking-widest text-black relative z-10 ${styles.goldGrad}`}>Devenir Membre</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { t: "Tarifs Fixes Garantis", d: "Aucune fluctuation saisonnière", i: CreditCard },
                      { t: "Disponibilité 48h", d: "Votre jet garanti partout en Europe", i: Timer },
                      { t: "Carburant SAF", d: "Aviation d'affaires éco-responsable", i: Leaf }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-[20px] bg-[#050608]/50 p-4 border border-[#d9b84f]/15">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><s.i size={16} /></div>
                        <div><p className="text-sm font-bold text-white">{s.t}</p><p className="text-[10px] text-white/40 mt-0.5">{s.d}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 rounded-[28px] border border-[#d9b84f]/25 bg-[#050608]/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden">
        <div className="mx-auto flex items-center justify-around px-4 py-3">
          {bottomNav.map((item) => (
            <button key={item.id} aria-label={item.label} onClick={() => { vibrate(8); if (item.id === "menu") { setPanelOpen(true); setMenuTab("Menu"); } else { setActiveTab(item.id); if (item.id === "voyages") { setPanelOpen(true); setMenuTab("Flotte"); } else if (item.id === "explorer") { window.scrollTo({ top: 0, behavior: "smooth" }); } else if (item.id === "client") { goTo("about"); } } }} className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105">
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} className={activeTab === item.id ? "text-[#e9d57c]" : "text-white/40"} />
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${activeTab === item.id ? "text-[#e9d57c]" : "text-white/30"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}