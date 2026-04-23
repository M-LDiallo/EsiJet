"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Menu, Heart, ArrowRight, ArrowLeft, User, Plane, Clock3, Info,
  ShieldCheck, Home as HomeIcon, Compass, Briefcase, MapPinned, CalendarDays,
  Users, BadgeCheck, PhoneCall, X, PlaneTakeoff, PlaneLanding, MessageSquare,
  ChevronLeft, ChevronRight, Luggage, Wind
} from "lucide-react";
import {
  Drawer, DrawerContent, DrawerTitle, DrawerHeader, DrawerDescription
} from "@/components/ui/drawer";

const MapBox = dynamic(() => import("@/components/MapBox"), { ssr: false });

type Vehicle = {
  id: string;
  name: string;
  seats: number;
  time: string;
  subtitle: string;
  pop?: boolean;
  desc: string;
  images: string[];
  specs: { speed: string; range: string; bag: string };
};

type Flight = {
  id: number;
  from: string;
  to: string;
  type: string;
  details: string;
  image: string;
  highlight: string;
  duration: string;
  distance: string;
  origin: [number, number];
  dest: [number, number];
  maxSeats: number;
  vehicles: Vehicle[];
};

type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  vip?: boolean;
};

type TripType = "simple" | "retour";

const airports: Airport[] = [
  { code: "LFMN", name: "Nice Côte d’Azur", city: "Nice", country: "France", vip: true },
  { code: "LFPB", name: "Paris Le Bourget", city: "Paris", country: "France", vip: true },
  { code: "LSGG", name: "Genève Cointrin", city: "Genève", country: "Suisse" },
  { code: "OMDW", name: "Dubaï Al Maktoum", city: "Dubaï", country: "Émirats Arabes Unis", vip: true },
  { code: "MRS", name: "Marseille Provence", city: "Marseille", country: "France" },
  { code: "FAB", name: "Farnborough", city: "Londres", country: "Royaume-Uni", vip: true },
];

const flights: Flight[] = [
  {
    id: 1,
    from: "Nice",
    to: "Marseille",
    type: "Jet privé",
    details: "1 à 8 passagers · Vol sur mesure",
    image: "/vols/nice-marseille-main.jpg",
    highlight: "Signature Méditerranée",
    duration: "1h05",
    distance: "159 km",
    origin: [43.658, 7.215],
    dest: [43.436, 5.215],
    maxSeats: 8,
    vehicles: [
      {
        id: "light1",
        name: "Light Jet",
        seats: 4,
        time: "1h05",
        subtitle: "Rapide · Léger · Accès express",
        pop: false,
        desc: "L'appareil parfait pour de courts sauts régionaux. Cabine intime.",
        images: ["/vols/nice-marseille-main.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
        specs: { speed: "720 km/h", range: "2 200 km", bag: "2 valises" },
      },
      {
        id: "mid1",
        name: "Midsize Jet",
        seats: 6,
        time: "0h55",
        subtitle: "Le meilleur équilibre confort / vitesse",
        pop: true,
        desc: "Un compromis idéal offrant une cabine spacieuse, un minibar et un confort optimal.",
        images: ["/vols/nice-marseille-main.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
        specs: { speed: "850 km/h", range: "4 500 km", bag: "4 valises" },
      },
      {
        id: "heavy1",
        name: "Heavy Jet",
        seats: 8,
        time: "0h50",
        subtitle: "Cabine spacieuse · Sur-mesure",
        pop: false,
        desc: "Le luxe absolu. Hauteur debout en cabine, service d'hôtesse possible.",
        images: ["/vols/nice-marseille-main.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
        specs: { speed: "900 km/h", range: "7 000 km", bag: "8 valises" },
      },
    ],
  },
  {
    id: 2,
    from: "Genève",
    to: "Londres",
    type: "Jet privé",
    details: "1 à 4 passagers · Business express",
    image: "/vols/geneve-londres-main.jpg",
    highlight: "Business express",
    duration: "1h50",
    distance: "747 km",
    origin: [46.238, 6.108],
    dest: [51.47, -0.454],
    maxSeats: 4,
    vehicles: [
      {
        id: "vlight2",
        name: "Very Light Jet",
        seats: 2,
        time: "2h00",
        subtitle: "Intimité absolue · Idéal duo",
        pop: false,
        desc: "Agile et économique, ce jet ultra-léger est conçu pour des trajets rapides à deux.",
        images: ["/vols/geneve-londres-main.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"],
        specs: { speed: "650 km/h", range: "1 800 km", bag: "1 valise" },
      },
      {
        id: "light2",
        name: "Light Jet",
        seats: 4,
        time: "1h50",
        subtitle: "Business express · Accès direct",
        pop: true,
        desc: "Le classique de l'aviation d'affaires européenne. Fiable et confortable.",
        images: ["/vols/geneve-londres-main.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"],
        specs: { speed: "780 km/h", range: "2 800 km", bag: "3 valises" },
      },
    ],
  },
  {
    id: 3,
    from: "Paris",
    to: "Dubaï",
    type: "Jet privé",
    details: "1 à 8 passagers · Service signature",
    image: "/vols/paris-dubai-main.jpg",
    highlight: "Long-courrier prestige",
    duration: "6h40",
    distance: "5 250 km",
    origin: [48.969, 2.441],
    dest: [25.204, 55.27],
    maxSeats: 8,
    vehicles: [
      {
        id: "mid3",
        name: "Midsize Jet",
        seats: 6,
        time: "7h10",
        subtitle: "Confort supérieur long-courrier",
        pop: false,
        desc: "Traversez les continents avec style. Ce jet de taille moyenne offre un bel espace.",
        images: ["/vols/paris-dubai-main.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
        specs: { speed: "860 km/h", range: "5 500 km", bag: "6 valises" },
      },
      {
        id: "heavy3",
        name: "Heavy Jet",
        seats: 8,
        time: "6h40",
        subtitle: "Luxe · Espace · Signature VIP",
        pop: true,
        desc: "Notre fleuron long-courrier. Vivez une expérience First Class incomparable.",
        images: ["/vols/paris-dubai-main.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
        specs: { speed: "920 km/h", range: "9 000 km", bag: "10 valises" },
      },
    ],
  },
];

const bottomNav = [
  { id: "explorer", icon: Search, label: "Explorer" },
  { id: "voyages", icon: Plane, label: "Vols" },
  { id: "client", icon: User, label: "À propos" },
  { id: "menu", icon: Menu, label: "Menu" },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

function CustomSelect({
  val, setVal, Icon, ph, type, pax, setPax, maxPax = 8,
}: {
  val?: Airport | null;
  setVal?: (a: Airport) => void;
  Icon: any;
  ph: string;
  type: "airport" | "pax";
  pax?: number;
  setPax?: (n: number) => void;
  maxPax?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const display =
    type === "pax"
      ? `${pax} Passager${(pax ?? 1) > 1 ? "s" : ""}`
      : val
      ? `${val.city} (${val.code})`
      : ph;

  const filtered = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-full truncate rounded-2xl border border-white/12 bg-white/[0.04] pl-12 pr-4 py-3.5 text-left text-sm text-white/80 transition-all hover:bg-white/[0.08]"
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        {display}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0c] shadow-2xl"
            >
              {type === "airport" && (
                <>
                  <div className="flex items-center border-b border-white/10 bg-white/[0.02] px-4 py-3">
                    <Search size={16} className="mr-2 text-white/40" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto p-2">
                    {filtered.map((a) => (
                      <div
                        key={a.code}
                        onClick={() => {
                          setVal?.(a);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition hover:bg-white/10"
                      >
                        <span className="min-w-0 truncate text-sm text-white">
                          {a.city} <span className="text-xs text-white/40">- {a.name}</span>
                        </span>
                        {a.vip && (
                          <span className="rounded-full bg-[#d9b84f]/20 px-2 py-0.5 text-[8px] font-bold text-[#d9b84f]">
                            VIP
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {type === "pax" && (
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Passagers</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setPax?.(Math.max(1, (pax ?? 1) - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-white">{pax}</span>
                      <button
                        type="button"
                        onClick={() => setPax?.(Math.min(maxPax, (pax ?? 1) + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b84f] text-black transition hover:bg-[#ebd57e]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-white/40">
                    Capacité maximale : {maxPax} passagers
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightSearchForm({
  withTextarea,
  onValider,
  maxPax,
}: {
  withTextarea?: boolean;
  onValider: () => void;
  maxPax: number;
}) {
  const [tripType, setTripType] = useState<TripType>("simple");
  const [dep, setDep] = useState<Airport | null>(null);
  const [arr, setArr] = useState<Airport | null>(null);
  const [pax, setPax] = useState(1);
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const field =
    "w-full rounded-2xl border border-white/12 bg-white/[0.04] pl-12 pr-4 py-3 text-sm text-white/80 outline-none focus:border-[#d9b84f]/60 h-[48px] [color-scheme:dark] cursor-pointer";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTripType("simple")}
          className={cx(
            "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
            tripType === "simple"
              ? "bg-white text-black shadow-md"
              : "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
          )}
        >
          Aller simple
        </button>
        <button
          type="button"
          onClick={() => setTripType("retour")}
          className={cx(
            "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
            tripType === "retour"
              ? "bg-white text-black shadow-md"
              : "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
          )}
        >
          Aller-retour
        </button>
      </div>

      <CustomSelect type="airport" val={dep} setVal={setDep} Icon={PlaneTakeoff} ph="Aéroport de départ" />
      <CustomSelect type="airport" val={arr} setVal={setArr} Icon={PlaneLanding} ph="Aéroport d'arrivée" />

      <div className={cx("grid gap-4", tripType === "retour" ? "md:grid-cols-2" : "md:grid-cols-1")}>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </div>

        {tripType === "retour" && (
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={field} />
          </div>
        )}
      </div>

      <CustomSelect
        type="pax"
        pax={pax}
        setPax={setPax}
        maxPax={maxPax}
        Icon={Users}
        ph="Passagers"
      />

      {withTextarea && (
        <div className="relative w-full">
          <MessageSquare className="absolute left-4 top-4 text-white/40" size={18} />
          <textarea
            placeholder="Exigences spécifiques (animaux, catering...)"
            className="h-28 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-xl transition-all focus:border-[#d9b84f]/60"
          />
        </div>
      )}

      <motion.button
        type="button"
        onClick={onValider}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full rounded-2xl bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)] py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_10px_20px_rgba(217,184,79,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]"
      >
        Obtenir un devis
      </motion.button>
    </div>
  );
}

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [uberDrawerOpen, setUberDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<number>(flights[0].id);
  const [selectedVehicle, setSelectedVehicle] = useState(flights[0].vehicles[0].id);
  const [activeTab, setActiveTab] = useState("explorer");
  const [menuTab, setMenuTab] = useState<"Activités" | "Vols">("Activités");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [detailedVehicle, setDetailedVehicle] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const selectedFlightData = flights.find((f) => f.id === selectedFlight) ?? flights[0];
  const detailedVehicleData = selectedFlightData.vehicles.find((v) => v.id === detailedVehicle);

  const refs = {
    experiences: useRef<HTMLDivElement>(null),
    devis: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
  };

  const styles = useMemo(
    () => ({
      goldGradient:
        "bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)] shadow-[0_10px_20px_rgba(217,184,79,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]",
      goldText:
        "text-transparent bg-clip-text bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)]",
      glass:
        "border border-white/10 bg-black/50 backdrop-blur-3xl shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
    }),
    []
  );

  const goTo = (t?: "experiences" | "devis" | "about") => {
    if (t && refs[t].current) refs[t].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPanelOpen(false);
  };

  const handleFlightClick = (id: number) => {
    const f = flights.find((x) => x.id === id) ?? flights[0];
    setSelectedFlight(f.id);
    setSelectedVehicle(f.vehicles[0].id);
    setDetailedVehicle(null);
    setPhotoIndex(0);
    setUberDrawerOpen(true);
  };

  const toggleFav = (id: number) =>
    setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const triggerDevisToast = () => {
    setPanelOpen(false);
    setToastMsg("Demande envoyée : Un conseiller vous contactera sous 15 min.");
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleDrawerDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 140 || info.velocity.y > 800) setPanelOpen(false);
  };

  const sortedFlights = [...flights].sort((a, b) => a.id - b.id);

  const glassCard = "rounded-[32px] border border-white/10 bg-white/[0.03] shadow-2xl";
  const sectionLabel = "mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-[100] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#d9b84f]/30 bg-[#050608] px-5 py-3.5 text-sm font-medium text-[#d9b84f] shadow-2xl"
          >
            <BadgeCheck size={18} /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0" suppressHydrationWarning>
        <Image
          src="/jet.jpg"
          alt="Jet privé ESIJET"
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover opacity-[0.32]"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/75 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,184,79,0.15),transparent_45%)] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 lg:pb-16">
        <header className="py-1 sm:py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hidden items-center justify-between md:flex"
          >
            <h1 className={`text-[18px] font-bold tracking-[0.34em] sm:text-2xl ${styles.goldText}`}>ESIJET</h1>
            <nav className="flex items-center gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xs text-white/70 transition hover:text-white sm:text-sm">Accueil</button>
              <button onClick={() => goTo("experiences")} className="text-xs text-white/70 transition hover:text-white sm:text-sm">Vols</button>
              <button onClick={() => goTo("about")} className="text-xs text-white/70 transition hover:text-white sm:text-sm">À propos</button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => goTo("devis")}
                className={`rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black ${styles.goldGradient}`}
              >
                Réserver
              </motion.button>
            </nav>
          </motion.div>

          <div className="space-y-3 md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-[24px] px-3 py-3 ${styles.glass} border-[#d9b84f]/20`}
            >
              <button onClick={() => { setPanelOpen(true); setMenuTab("Vols"); }} className="flex w-full items-center gap-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebd57e]/15 shadow-inner">
                  <Search size={18} className="text-[#f4e08f]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] uppercase tracking-[0.24em] text-white/40">Où souhaitez-vous aller ?</p>
                  <p className="truncate text-sm font-light text-white/95">Recherche d’itinéraire privé</p>
                </div>
              </button>
            </motion.div>
          </div>
        </header>

        <section className="mt-3 hidden min-h-[70vh] items-center gap-10 md:grid lg:grid-cols-[1.18fr_0.82fr] lg:gap-16 xl:min-h-[78vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-3xl xl:max-w-4xl">
            <h2 className="max-w-4xl text-[34px] font-light leading-[0.98] tracking-tight sm:text-5xl md:text-[52px] lg:text-[64px] xl:text-[78px]">
              Le ciel aura une
              <br />
              <span className="mt-1 block text-[34px] font-normal tracking-tight text-white/95 sm:text-[44px] md:text-[54px] lg:text-[68px] xl:text-[82px]">
                nouvelle signature.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl border-l border-[#d9b84f]/30 pl-5 text-[14px] leading-relaxed text-white/70 sm:text-[15px] md:text-base lg:max-w-xl xl:max-w-2xl">
              Une aviation d’affaires pensée pour les dirigeants, les familles et les voyageurs exigeants qui attendent un service rapide, confidentiel et impeccablement orchestré.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("experiences")} className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-all ${styles.goldGradient}`}>
                Voir la sélection
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("about")} className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white">
                Découvrir la flotte
              </motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className={`hidden w-full max-w-[520px] justify-self-end rounded-[32px] p-6 md:block lg:p-8 ${styles.glass}`}>
            <div className="mb-6">
              <h3 className="text-xl font-light text-white">Demander une cotation</h3>
              <p className="mt-1.5 text-sm text-white/50">Renseignez vos critères pour un vol sur-mesure.</p>
            </div>
            <FlightSearchForm onValider={triggerDevisToast} maxPax={selectedFlightData.maxSeats} />
          </motion.div>
        </section>

        <section ref={refs.experiences} className="mt-5 md:mt-20">
          <motion.div {...fadeUp} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-light tracking-wide text-white sm:text-xl lg:text-2xl">Vols & Itinéraires</h3>
              <p className={sectionLabel}>Aviation d’affaires · Départs privés · Service premium</p>
            </div>
            <button onClick={() => goTo("devis")} className={`self-start text-[11px] font-bold tracking-[0.2em] sm:self-auto ${styles.goldText} transition hover:opacity-80`}>
              RÉSERVER
            </button>
          </motion.div>

          <div className="mt-6 flex gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-8 md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:pb-0 xl:grid-cols-3 xl:gap-8">
            {sortedFlights.map((f, i) => {
              const liked = favorites.includes(f.id);
              return (
                <motion.article
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="group min-w-[280px] max-w-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-[24px] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d9b84f]/40 hover:bg-white/[0.06] hover:shadow-[0_15px_40px_rgba(217,184,79,0.12)] md:min-w-0 md:max-w-none"
                >
                  <div role="button" tabIndex={0} onClick={() => handleFlightClick(f.id)} className="block cursor-pointer text-left outline-none">
                    <div className="relative h-52 overflow-hidden sm:h-56 lg:h-60">
                      <Image src={f.image} alt={f.to} fill sizes="(max-width: 768px) 100vw, 33vw" quality={100} className="object-cover opacity-[0.85] transition-transform duration-1000 ease-out group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }}
                        className={cx(
                          "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:scale-105",
                          liked ? "border-[#d9b84f]/60 bg-black/70 text-[#f7e49d]" : "hover:border-[#d9b84f]/50 hover:text-[#d9b84f]"
                        )}
                      >
                        <Heart size={16} className={liked ? "fill-current" : ""} />
                      </button>
                      <span className="absolute left-4 top-4 rounded-full border border-[#d9b84f]/40 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.20em] text-[#f2db89] backdrop-blur-md shadow-lg">
                        {f.highlight}
                      </span>
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.20em] text-white/95 backdrop-blur-md">
                        {f.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/70">
                        {f.from} <ArrowRight size={10} /> {f.to}
                      </p>
                      <h4 className="mt-2.5 text-[15px] font-light leading-snug text-white/95 sm:text-base">{f.details}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-xs font-medium tracking-wide text-white/40">{f.duration} · {f.maxSeats} places</div>
                    <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => handleFlightClick(f.id)} className="flex items-center gap-3 rounded-full bg-white/5 pl-4 pr-1.5 py-1.5 transition-colors hover:bg-white/15 group-hover:bg-[#d9b84f]/15">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[#d9b84f]">Réserver</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#d9b84f]/30">
                        <ArrowRight size={14} className="text-white group-hover:text-[#d9b84f]" />
                      </div>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 md:mt-24">
          <motion.div {...fadeUp} className="hidden gap-6 md:grid md:grid-cols-3">
            {[
              { Icon: Clock3, t: "Réactivité", d: "Départs organisés rapidement avec une fluidité totale." },
              { Icon: ShieldCheck, t: "Confidentialité", d: "Une bulle de sérénité pensée pour les plus exigeants." },
              { Icon: BadgeCheck, t: "Exigence VIP", d: "Service premium et sur-mesure de bout en bout." },
            ].map((f, i) => (
              <div key={i} className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10 hover:bg-white/[0.04]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#d9b84f]/10 shadow-inner">
                  <f.Icon className="text-[#e5c96d]" size={24} />
                </div>
                <h3 className="text-lg font-medium text-white">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{f.d}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section ref={refs.devis} className="mt-10 md:hidden">
          <motion.div {...fadeUp} className={`${glassCard} p-6`}>
            <div className="mb-6">
              <h3 className="text-2xl font-light text-white">Demander un devis</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">Décrivez votre besoin pour une proposition sur mesure.</p>
            </div>
            <FlightSearchForm withTextarea onValider={triggerDevisToast} maxPax={selectedFlightData.maxSeats} />
          </motion.div>
        </section>

        <section ref={refs.about} className="mt-12 md:mt-28">
          <motion.div {...fadeUp} className="rounded-[40px] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-3xl md:p-14">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
              <div className="flex flex-col justify-center">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d9b84f]">Vision & Valeurs</p>
                <h3 className="text-3xl font-light leading-[1.1] text-white md:text-5xl">L&apos;aviation privée, redéfinie.</h3>
                <div className="mt-8 space-y-5">
                  <p className="text-[15px] leading-relaxed text-white/60 md:text-[17px]">
                    ESIJET conçoit une expérience d’aviation d’affaires pensée pour celles et ceux qui attendent plus qu’un simple vol : une prise en charge fluide, une discrétion absolue et un niveau de service constant.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {[
                  { Icon: Briefcase, t: "Clientèle visée", d: "Dirigeants, personnalités et voyageurs exigeants." },
                  { Icon: MapPinned, t: "Promesse", d: "Une expérience rapide, claire et ultra-élégante." },
                  { Icon: PhoneCall, t: "Disponibilité", d: "Présence continue 24/7 pour le sur-mesure." },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-5 rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition hover:bg-white/[0.04]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10">
                      <c.Icon size={20} className="text-[#efd983]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-medium text-white">{c.t}</h4>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{c.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="mt-20 hidden border-t border-white/10 pt-10 pb-12 md:block">
          <div className="flex items-start justify-between">
            <div className="flex gap-10 text-[11px] font-bold uppercase tracking-[0.30em] text-white/30">
              <span>Excellence</span><span>Discrétion</span><span>Élévation</span>
            </div>
            <div className="flex flex-col items-end gap-5">
              <div className="flex gap-8 text-[10px] uppercase tracking-[0.25em] text-white/30">
                <a href="#" className="transition hover:text-[#d9b84f]">Mentions légales</a>
                <a href="#" className="transition hover:text-[#d9b84f]">Confidentialité</a>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/15">© 2026 ESIJET</p>
            </div>
          </div>
        </footer>

        <footer className="mt-14 border-t border-white/10 pt-8 pb-28 md:hidden">
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
              <span>Excellence</span><span>Discrétion</span><span>Élévation</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/15">© 2026 ESIJET</p>
          </div>
        </footer>
      </div>

      <div className="fixed bottom-10 right-10 z-40 hidden md:block">
        <a href="tel:+33651960631" className="group flex h-16 items-center gap-4 rounded-full border border-white/15 bg-black/80 pl-2.5 pr-7 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] transition-all hover:scale-105 hover:border-[#d9b84f]/60">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9b84f] text-black shadow-inner">
            <PhoneCall size={20} fill="currentColor" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors group-hover:text-[#d9b84f]">Ligne VIP</span>
        </a>
      </div>

      <Drawer
        open={uberDrawerOpen}
        onOpenChange={(open) => {
          setUberDrawerOpen(open);
          if (!open) setDetailedVehicle(null);
        }}
      >
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Sélection</DrawerTitle>
            <DrawerDescription>Choix du jet</DrawerDescription>
          </DrawerHeader>

          <div className="relative z-50 mx-auto mb-5 flex h-[88dvh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[36px] bg-[#050608] shadow-[0_0_100px_rgba(0,0,0,0.9)] md:my-auto md:h-[78dvh] md:max-w-[1150px] md:flex-row">
            <div className="relative h-[38%] w-full shrink-0 border-l border-white/10 bg-[#050608] md:order-2 md:h-full md:w-[55%]">
              <div className="absolute left-1/2 top-4 z-50 h-1.5 w-14 -translate-x-1/2 rounded-full bg-white/40 md:hidden" />
              <div className="pointer-events-none absolute inset-0 grayscale opacity-[0.35] mix-blend-screen">
                <MapBox origin={selectedFlightData.origin} dest={selectedFlightData.dest} />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,184,79,0.1),transparent_50%)]" />
              <div className="absolute left-5 right-5 top-7 z-20 flex items-center justify-between md:left-8 md:right-8 md:top-8">
                <button onClick={() => setUberDrawerOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-2xl transition hover:bg-black/90 md:order-2">
                  <X size={18} />
                </button>
                <div className="rounded-full border border-white/20 bg-black/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 backdrop-blur-2xl shadow-xl md:order-1">
                  Itinéraire privé
                </div>
              </div>
            </div>

            <div className="relative z-20 flex flex-1 flex-col overflow-hidden border-t border-white/10 bg-[#f8f6f0] text-black md:order-1 md:w-[45%] md:border-none">
              <div className="flex min-h-[90px] shrink-0 flex-col justify-center px-6 pt-6 sm:px-8 md:pt-10">
                {detailedVehicle ? (
                  <button
                    onClick={() => { setDetailedVehicle(null); setPhotoIndex(0); }}
                    className="flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black/70 shadow-sm transition-all hover:bg-black/5 hover:text-black"
                  >
                    <ArrowLeft size={16} /> Retour aux jets
                  </button>
                ) : (
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-black/35">Modifier le trajet</p>
                    <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {flights.map((f) => {
                        const isSelected = selectedFlight === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => { setSelectedFlight(f.id); setSelectedVehicle(f.vehicles[0].id); setDetailedVehicle(null); }}
                            className={cx(
                              "whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                              isSelected
                                ? "bg-black text-white shadow-lg shadow-black/20"
                                : "border border-black/15 bg-transparent text-black/60 hover:border-black/40 hover:bg-black/5 hover:text-black"
                            )}
                          >
                            {f.from} → {f.to}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait">
                  {detailedVehicle && detailedVehicleData ? (
                    <motion.div key="details" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="mt-2 space-y-7 pb-20">
                      <div className="relative h-56 w-full overflow-hidden rounded-[24px] shadow-md">
                        <AnimatePresence mode="wait">
                          <motion.div key={photoIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                            <Image src={detailedVehicleData.images[photoIndex]} alt="Intérieur jet" fill sizes="(max-width: 768px) 100vw, 50vw" quality={100} priority={photoIndex === 0} className="object-cover" />
                          </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <button onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => i === 0 ? detailedVehicleData.images.length - 1 : i - 1); }} className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70">
                          <ChevronLeft size={20} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => i === detailedVehicleData.images.length - 1 ? 0 : i + 1); }} className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70">
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                          {detailedVehicleData.images.map((_, i) => (
                            <button key={i} onClick={() => setPhotoIndex(i)} className={cx("h-1.5 rounded-full transition-all duration-300", photoIndex === i ? "w-8 bg-[#d9b84f]" : "w-1.5 bg-white/60 hover:bg-white")} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h2 className="text-2xl font-semibold tracking-tight text-black">{detailedVehicleData.name}</h2>
                          {detailedVehicleData.pop && <span className="rounded-full bg-[#d9b84f] px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-black shadow-sm">Recommandé</span>}
                        </div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-black/40">{detailedVehicleData.subtitle}</p>
                        <p className="text-[15px] leading-relaxed text-black/70">{detailedVehicleData.desc}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 border-t border-black/10 pt-6">
                        <div className="flex flex-col items-center rounded-[20px] border border-black/5 bg-white p-3 text-center shadow-sm">
                          <Users size={18} className="mb-2 text-[#d9b84f]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-black/35">Capacité</span>
                          <span className="mt-1 text-sm font-bold text-black">{detailedVehicleData.seats} pax</span>
                        </div>
                        <div className="flex flex-col items-center rounded-[20px] border border-black/5 bg-white p-3 text-center shadow-sm">
                          <Wind size={18} className="mb-2 text-[#d9b84f]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-black/35">Vitesse</span>
                          <span className="mt-1 text-sm font-bold text-black">{detailedVehicleData.specs.speed}</span>
                        </div>
                        <div className="flex flex-col items-center rounded-[20px] border border-black/5 bg-white p-3 text-center shadow-sm">
                          <Luggage size={18} className="mb-2 text-[#d9b84f]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-black/35">Bagages</span>
                          <span className="mt-1 text-sm font-bold text-black">{detailedVehicleData.specs.bag}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 space-y-4 pb-20">
                      {selectedFlightData.vehicles.map((v, i) => {
                        const isSelected = selectedVehicle === v.id;
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={v.id}
                            onClick={() => setSelectedVehicle(v.id)}
                            className={cx(
                              "group relative w-full cursor-pointer rounded-[28px] border p-4 text-left transition-all duration-300 sm:p-5",
                              isSelected ? "scale-[1.02] border-black bg-black shadow-2xl" : "border-black/10 bg-white hover:border-black/30 hover:bg-black/5"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-300", isSelected ? "bg-white/10 text-[#d9b84f] shadow-inner" : "bg-[#f8f6f0] text-black/40 group-hover:text-black/80")}>
                                  <Plane size={22} className={isSelected ? "rotate-45" : ""} style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-3">
                                    <p className={cx("truncate text-[15px] font-semibold tracking-tight", isSelected ? "text-white" : "text-black")}>{v.name}</p>
                                    {v.pop && <span className={cx("rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest", isSelected ? "bg-[#d9b84f] text-black" : "bg-black text-white")}>Recommandé</span>}
                                  </div>
                                  <p className={cx("mt-1 text-[11px] font-medium", isSelected ? "text-white/60" : "text-black/50")}>{v.subtitle}</p>
                                  <div className={cx("mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", isSelected ? "text-[#d9b84f]" : "text-black/40")}>
                                    <Users size={12} /> {v.seats} passagers <span className="mx-0.5 text-black/20">|</span> <Clock3 size={12} /> {v.time}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v.id); setDetailedVehicle(v.id); setPhotoIndex(0); }}
                                className={cx("rounded-full p-2.5 transition-all", isSelected ? "text-white/40 hover:bg-white/15 hover:text-white" : "text-black/30 hover:bg-black/10 hover:text-black")}
                              >
                                <Info size={22} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="shrink-0 border-t border-black/5 bg-[#f8f6f0] p-5 sm:px-8">
                <motion.button
                  onClick={() => {
                    if (!detailedVehicle) {
                      triggerDevisToast();
                      setUberDrawerOpen(false);
                    } else {
                      setDetailedVehicle(null);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all ${styles.goldGradient} hover:shadow-[0_15px_30px_rgba(217,184,79,0.3)]`}
                >
                  {detailedVehicle ? "Choisir cet appareil" : "Valider le jet et continuer"}
                </motion.button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 260 }}
              dragElastic={0.18}
              onDragEnd={handleDrawerDragEnd}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 top-[64px] z-[60] flex flex-col rounded-t-[36px] border-t border-[#d9b84f]/20 bg-[#050608]/98 px-5 pb-6 pt-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl md:hidden"
            >
              <div className="sr-only"><h2>Menu principal</h2></div>
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
              <div className="mb-5 flex items-center gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(["Activités", "Vols"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMenuTab(tab)}
                    className={cx(
                      "whitespace-nowrap border-b-2 pb-2 text-[14px] font-medium transition-all",
                      menuTab === tab ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {menuTab === "Activités" ? (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[
                    { Icon: Compass, t: "Vols", a: () => goTo("experiences") },
                    { Icon: CalendarDays, t: "Réserver", a: () => goTo("devis") },
                    { Icon: BadgeCheck, t: "À propos", a: () => goTo("about") },
                    {
                      Icon: HomeIcon,
                      t: "Accueil",
                      bg: styles.goldGradient,
                      a: () => { setPanelOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); },
                    },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={b.a}
                      className={b.bg ? `rounded-[24px] p-5 text-left text-black ${b.bg} shadow-lg shadow-[#d9b84f]/10` : "rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:bg-white/[0.06]"}
                    >
                      <b.Icon size={20} className={`mb-4 ${b.bg ? "" : "text-[#e5c96d]"}`} />
                      <p className={`text-[15px] ${b.bg ? "font-bold" : "font-medium text-white"}`}>{b.t}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`${glassCard} rounded-[32px] p-6`}>
                  <h3 className="mb-6 text-xl font-light text-white">Recherche détaillée</h3>
                  <FlightSearchForm onValider={triggerDevisToast} maxPax={selectedFlightData.maxSeats} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 rounded-[28px] border border-[#d9b84f]/25 bg-[#050608]/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl md:hidden">
        <div className="mx-auto flex items-center justify-around px-4 py-3">
          {bottomNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "menu") setPanelOpen(true);
                else {
                  setActiveTab(item.id);
                  if (item.id === "voyages") {
                    setSelectedFlight(flights[0].id);
                    setSelectedVehicle(flights[0].vehicles[0].id);
                    setUberDrawerOpen(true);
                  } else if (item.id === "explorer") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (item.id === "client") {
                    goTo("about");
                  }
                }
              }}
              className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} className={activeTab === item.id ? "text-[#e9d57c]" : "text-white/40"} />
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${activeTab === item.id ? "text-[#e9d57c]" : "text-white/30"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}