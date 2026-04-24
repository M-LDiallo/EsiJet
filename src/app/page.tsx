"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import {
  Search,
  Menu,
  Heart,
  ArrowRight,
  ArrowLeft,
  User,
  Plane,
  Clock3,
  Info,
  ShieldCheck,
  Home as HomeIcon,
  Compass,
  Briefcase,
  MapPinned,
  CalendarDays,
  Users,
  BadgeCheck,
  PhoneCall,
  X,
  PlaneTakeoff,
  PlaneLanding,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Luggage,
  Wind,
  CheckCircle2,
  Crown,
  Leaf,
  CreditCard,
  Timer,
  Star,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerDescription,
} from "@/components/ui/drawer";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const isValidEmail = (email?: string) => {
  if (!email) return false;
  return emailRegex.test(email.trim());
};
const isValidInternationalPhone = (phone?: string) => {
  if (!phone) return false;
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

const MapBox = dynamic(() => import("@/components/MapBox"), { ssr: false });

type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  vip?: boolean;
  coords: [number, number];
};

type Vehicle = {
  id: string;
  name: string;
  seats: number;
  time: string;
  speed: string;
  range: string;
  bag: string;
  subtitle: string;
  price: string;
  avail: string;
  images: string[];
  desc: string;
  pop?: boolean;
};

type TripType = "simple" | "retour";

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

type BookingPayload = {
  dep: Airport | null;
  arr: Airport | null;
  pax: number;
  date: string;
  returnDate?: string;
  tripType?: TripType;
  note?: string;
  jet?: Vehicle | null;
  contact?: {
    name: string;
    phone: string;
    email: string;
  };
  services?: Record<string, boolean>;
};

type EmptyLeg = {
  id: string;
  from: string;
  to: string;
  cityFrom: string;
  cityTo: string;
  date: string;
  jet: string;
  price: string;
  pax: number;
  origin: [number, number];
  dest: [number, number];
};

type CustomSelectAirportProps = {
  type: "airport";
  val: Airport | null;
  setVal: (airport: Airport) => void;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  ph: string;
  pax?: never;
  setPax?: never;
  maxPax?: never;
};

type CustomSelectPaxProps = {
  type: "pax";
  val?: never;
  setVal?: never;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  ph: string;
  pax: number;
  setPax: (pax: number) => void;
  maxPax?: number;
};

type CustomSelectProps = CustomSelectAirportProps | CustomSelectPaxProps;

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const vibrate = (pattern: number | number[]) => {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "vibrate" in navigator
  ) {
    navigator.vibrate(pattern);
  }
};

const generateBookingId = () => `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

const styles = {
  goldGrad:
    "bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)] shadow-[0_10px_30px_rgba(217,184,79,0.22),inset_0_1px_0_rgba(255,255,255,0.45)]",
  goldText:
    "text-transparent bg-clip-text bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)]",
  glass:
    "border border-white/5 bg-[#050608]/90 backdrop-blur-[24px] shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
  glassCard:
    "rounded-[32px] border border-[#d9b84f]/20 bg-black/40 backdrop-blur-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
  inputDark:
    "w-full rounded-2xl border border-white/12 bg-white/[0.04] pl-12 pr-4 py-3.5 text-sm text-white/90 outline-none transition-all focus:border-[#d9b84f]/50 focus:bg-white/[0.05] placeholder:text-white/30",
  inputWrapper:
    "flex items-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3.5 transition-all focus-within:border-[#d9b84f]/50 focus-within:bg-white/[0.05]",
  inputField:
    "w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/30 [color-scheme:dark]",
};

const airports: Airport[] = [
  {
    code: "LFMN",
    name: "Nice Côte d’Azur",
    city: "Nice",
    country: "France",
    vip: true,
    coords: [43.658, 7.215],
  },
  {
    code: "LFPB",
    name: "Paris Le Bourget",
    city: "Paris",
    country: "France",
    vip: true,
    coords: [48.969, 2.441],
  },
  {
    code: "LSGG",
    name: "Genève Cointrin",
    city: "Genève",
    country: "Suisse",
    coords: [46.238, 6.108],
  },
  {
    code: "OMDW",
    name: "Dubaï Al Maktoum",
    city: "Dubaï",
    country: "E.A.U.",
    vip: true,
    coords: [25.204, 55.27],
  },
  {
    code: "MRS",
    name: "Marseille Provence",
    city: "Marseille",
    country: "France",
    coords: [43.436, 5.215],
  },
  {
    code: "FAB",
    name: "Farnborough",
    city: "Londres",
    country: "Royaume-Uni",
    vip: true,
    coords: [51.47, -0.454],
  },
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
        speed: "720 km/h",
        range: "2 200 km",
        bag: "2 valises",
        price: "À partir de 4 500 €",
        avail: "Départ sous 4h",
        pop: false,
        desc: "Le choix idéal pour les vols courts. Une cabine intime pour rejoindre rapidement votre destination.",
        images: ["/jet.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
      },
      {
        id: "mid1",
        name: "Midsize Jet",
        seats: 6,
        time: "0h55",
        subtitle: "Équilibre confort / vitesse",
        speed: "850 km/h",
        range: "4 500 km",
        bag: "4 valises",
        price: "À partir de 7 200 €",
        avail: "Départ sous 6h",
        pop: true,
        desc: "L'équilibre parfait entre confort et performance, avec une cabine spacieuse pour travailler ou se détendre.",
        images: ["/jet2.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
      },
      {
        id: "heavy1",
        name: "Heavy Jet",
        seats: 8,
        time: "0h50",
        subtitle: "Cabine spacieuse · Sur-mesure",
        speed: "900 km/h",
        range: "7 000 km",
        bag: "8 valises",
        price: "À partir de 12 000 €",
        avail: "Sur demande",
        pop: false,
        desc: "Le summum du luxe. De grands espaces, une capacité bagages optimale et un service de bord personnalisé.",
        images: ["/jet3.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
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
        speed: "650 km/h",
        range: "1 800 km",
        bag: "1 valise",
        price: "À partir de 3 800 €",
        avail: "Départ sous 4h",
        pop: false,
        desc: "Idéal pour les déplacements rapides en comité restreint. Agile et parfaitement optimisé.",
        images: ["/jet.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"],
      },
      {
        id: "light2",
        name: "Light Jet",
        seats: 4,
        time: "1h50",
        subtitle: "Business express · Accès direct",
        speed: "780 km/h",
        range: "2 800 km",
        bag: "3 valises",
        price: "À partir de 5 500 €",
        avail: "Départ sous 6h",
        pop: true,
        desc: "Le jet d'affaires par excellence en Europe. Fiable, élégant et idéal pour de courtes distances.",
        images: ["/jet2.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"],
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
        speed: "860 km/h",
        range: "5 500 km",
        bag: "6 valises",
        price: "À partir de 28 000 €",
        avail: "Départ sous 12h",
        pop: false,
        desc: "Traversez les continents avec style. Une cabine pensée pour le confort sur les longs trajets.",
        images: ["/jet2.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
      },
      {
        id: "heavy3",
        name: "Heavy Jet",
        seats: 8,
        time: "6h40",
        subtitle: "Luxe · Espace · Signature VIP",
        speed: "920 km/h",
        range: "9 000 km",
        bag: "10 valises",
        price: "À partir de 45 000 €",
        avail: "Sur demande",
        pop: true,
        desc: "Notre fleuron long-courrier. Vivez une expérience First Class incomparable, de votre domicile à l'arrivée.",
        images: ["/jet3.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
      },
    ],
  },
];

const emptyLegs: EmptyLeg[] = [
  {
    id: "el1",
    from: "Paris (LFPB)",
    to: "Ibiza (IBZ)",
    cityFrom: "Paris",
    cityTo: "Ibiza",
    date: "Demain, 14h00",
    jet: "Light Jet",
    price: "-40%",
    pax: 4,
    origin: [48.969, 2.441],
    dest: [38.872, 1.373],
  },
  {
    id: "el2",
    from: "Nice (LFMN)",
    to: "Genève (LSGG)",
    cityFrom: "Nice",
    cityTo: "Genève",
    date: "Jeu. 28 Mai",
    jet: "Midsize Jet",
    price: "-35%",
    pax: 6,
    origin: [43.658, 7.215],
    dest: [46.238, 6.108],
  },
  {
    id: "el3",
    from: "Dubaï (OMDW)",
    to: "Londres (FAB)",
    cityFrom: "Dubaï",
    cityTo: "Londres",
    date: "Sam. 30 Mai",
    jet: "Heavy Jet",
    price: "-50%",
    pax: 8,
    origin: [25.204, 55.27],
    dest: [51.47, -0.454],
  },
];

const flightOptions = [
  {
    id: "vip",
    name: "Accès Salon VIP",
    icon: BadgeCheck,
    desc: "Embarquement privatif et prioritaire",
  },
  {
    id: "pets",
    name: "Animaux en cabine",
    icon: Heart,
    desc: "Voyagez avec votre animal de compagnie",
  },
  {
    id: "luggage",
    name: "Bagages hors format",
    icon: Luggage,
    desc: "Skis, matériel de golf, malles volumineuses",
  },
];

const bottomNav = [
  { id: "explorer", icon: Search, label: "Explorer" },
  { id: "voyages", icon: Plane, label: "Vols" },
  { id: "client", icon: User, label: "À propos" },
  { id: "menu", icon: Menu, label: "Menu" },
] as const;

const M_TABS = ["Menu", "Recherche", "Vols à vide", "Flotte", "Privilège"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function CustomSelect(props: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const display =
    props.type === "pax"
      ? `${props.pax} Passager${props.pax > 1 ? "s" : ""}`
      : props.val
        ? `${props.val.city} (${props.val.code})`
        : props.ph;

  const filtered = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => {
          vibrate(8);
          setOpen(!open);
        }}
        className={cx(styles.inputDark, "relative text-left truncate")}
      >
        <props.Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60"
          size={18}
        />
        {display}
      </button>

      <AnimatePresence mode="wait">
        {open && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-0 top-full z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-[#d9b84f]/20 bg-[#0a0a0c] shadow-2xl"
            >
              {props.type === "airport" && (
                <>
                  <div className="flex items-center border-b border-white/10 bg-white/[0.02] px-4 py-3">
                    <Search size={16} className="mr-2 text-[#d9b84f]/60" />
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
                    {filtered.length > 0 ? (
                      filtered.map((a) => (
                        <button
                          type="button"
                          key={a.code}
                          onClick={() => {
                            vibrate(8);
                            props.setVal(a);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#d9b84f]/10"
                        >
                          <span className="min-w-0 truncate text-sm text-white">
                            {a.city} <span className="text-xs text-white/40">- {a.name}</span>
                          </span>
                          {a.vip && (
                            <span className="rounded-full bg-[#d9b84f]/20 px-2 py-0.5 text-[8px] font-bold text-[#d9b84f]">
                              VIP
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-white/40">Aucun aéroport trouvé</div>
                    )}
                  </div>
                </>
              )}

              {props.type === "pax" && (
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Passagers</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(8);
                          props.setPax(Math.max(1, props.pax - 1));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f]/20"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-white">
                        {props.pax}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(8);
                          props.setPax(Math.min(props.maxPax ?? 8, props.pax + 1));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b84f] text-black transition hover:bg-[#ebd57e]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#d9b84f]/60">
                    Capacité maximale : {props.maxPax ?? 8} passagers
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
  mobileStepMode = false,
}: {
  withTextarea?: boolean;
  onValider: (payload: BookingPayload) => void;
  maxPax: number;
  mobileStepMode?: boolean;
}) {
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState<TripType>("simple");
  const [dep, setDep] = useState<Airport | null>(null);
  const [arr, setArr] = useState<Airport | null>(null);
  const [pax, setPax] = useState(1);
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [note, setNote] = useState("");

  const isStep1Valid = dep !== null && arr !== null && dep.code !== arr.code;
  const isStep2Valid = date !== "" && (tripType === "simple" || returnDate !== "");

  const submit = () =>
    onValider({
      dep,
      arr,
      pax,
      date,
      returnDate,
      tripType,
      note,
      contact: { name: "", phone: "", email: "" },
      services: {},
    });

  if (!mobileStepMode) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["simple", "retour"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                vibrate(8);
                setTripType(t);
              }}
              className={cx(
                "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
                tripType === t
                  ? "bg-[#d9b84f] text-black shadow-md"
                  : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10",
              )}
            >
              {t === "simple" ? "Aller simple" : "Aller-retour"}
            </button>
          ))}
        </div>

        <CustomSelect
          type="airport"
          val={dep}
          setVal={setDep}
          Icon={PlaneTakeoff}
          ph="Aéroport de départ"
        />
        <CustomSelect
          type="airport"
          val={arr}
          setVal={setArr}
          Icon={PlaneLanding}
          ph="Aéroport d'arrivée"
        />

        {!isStep1Valid && dep && arr && dep.code === arr.code && (
          <p className="text-xs text-[#d9b84f]">Le départ et l’arrivée doivent être différents.</p>
        )}

        <div className={cx("grid gap-4", tripType === "retour" ? "grid-cols-2" : "grid-cols-1")}>
          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50"
              size={18}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cx(styles.inputDark, "h-[48px] pl-12 [color-scheme:dark]")}
            />
          </div>

          {tripType === "retour" && (
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50"
                size={18}
              />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={cx(styles.inputDark, "h-[48px] pl-12 [color-scheme:dark]")}
              />
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
            <MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Exigences particulières (animaux, bagages hors format...)"
              className={cx(styles.inputDark, "h-24 resize-none")}
            />
          </div>
        )}

        <motion.button
          type="button"
          disabled={!isStep1Valid || !isStep2Valid}
          onClick={() => {
            vibrate([10, 20, 10]);
            submit();
          }}
          whileTap={{ scale: !isStep1Valid || !isStep2Valid ? 1 : 0.98 }}
          className={cx(
            "mt-4 w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black transition-all",
            !isStep1Valid || !isStep2Valid
              ? "cursor-not-allowed bg-white/10 text-white/30"
              : styles.goldGrad,
          )}
        >
          OBTENIR UN DEVIS
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cx(
                "h-1 rounded-full transition-all duration-300",
                step >= s ? "w-6 bg-[#d9b84f]" : "w-3 bg-white/20",
              )}
            />
          ))}
        </div>

        {step > 1 && (
          <button
            onClick={() => {
              vibrate(8);
              setStep((p) => Math.max(1, p - 1));
            }}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-white"
          >
            <ArrowLeft size={10} /> Retour
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <CustomSelect
              type="airport"
              val={dep}
              setVal={(v: Airport) => setDep(v)}
              Icon={PlaneTakeoff}
              ph="Aéroport de départ"
            />
            <CustomSelect
              type="airport"
              val={arr}
              setVal={(v: Airport) => setArr(v)}
              Icon={PlaneLanding}
              ph="Aéroport d'arrivée"
            />
            {!isStep1Valid && dep && arr && dep.code === arr.code && (
              <p className="text-xs text-[#d9b84f]">Le départ et l’arrivée doivent être différents.</p>
            )}
            <motion.button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => {
                vibrate(8);
                setStep(2);
              }}
              whileTap={{ scale: isStep1Valid ? 0.98 : 1 }}
              className={cx(
                "mt-2 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all",
                isStep1Valid
                  ? "bg-[#d9b84f] text-black"
                  : "cursor-not-allowed bg-white/5 text-white/30",
              )}
            >
              Continuer
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {(["simple", "retour"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    vibrate(8);
                    setTripType(t);
                  }}
                  className={cx(
                    "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
                    tripType === t
                      ? "bg-[#d9b84f] text-black shadow-md"
                      : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10",
                  )}
                >
                  {t === "simple" ? "Aller simple" : "Aller-retour"}
                </button>
              ))}
            </div>

            <div className={cx("grid gap-4", tripType === "retour" ? "grid-cols-2" : "grid-cols-1")}>
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50"
                  size={18}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cx(styles.inputDark, "h-[48px] pl-12 [color-scheme:dark]")}
                />
              </div>

              {tripType === "retour" && (
                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50"
                    size={18}
                  />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={cx(styles.inputDark, "h-[48px] pl-12 [color-scheme:dark]")}
                  />
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

            <motion.button
              type="button"
              disabled={!isStep2Valid}
              onClick={() => {
                vibrate(8);
                setStep(3);
              }}
              whileTap={{ scale: isStep2Valid ? 0.98 : 1 }}
              className={cx(
                "mt-2 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all",
                isStep2Valid
                  ? "bg-[#d9b84f] text-black"
                  : "cursor-not-allowed bg-white/5 text-white/30",
              )}
            >
              Détails finaux
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-4">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[#d9b84f]">Résumé du vol</p>
              <p className="text-sm font-medium text-white">
                {dep?.city ?? "Départ"} ➔ {arr?.city ?? "Arrivée"}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {pax} passager(s) · {date || "Date à préciser"}
              </p>
            </div>

            {withTextarea && (
              <div className="relative w-full">
                <MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Exigences particulières..."
                  className={cx(styles.inputDark, "h-24 resize-none")}
                />
              </div>
            )}

            <motion.button
              type="button"
              onClick={() => {
                vibrate([10, 20, 10]);
                submit();
              }}
              whileTap={{ scale: 0.98 }}
              className={`mt-4 w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black ${styles.goldGrad}`}
            >
              CONFIRMER LA DEMANDE
            </motion.button>
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
  const [menuTab, setMenuTab] = useState<(typeof M_TABS)[number]>("Menu");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [selectedFlight, setSelectedFlight] = useState<number>(flights[0].id);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(flights[0].vehicles[0].id);
  const [detailedVehicle, setDetailedVehicle] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [lastBooking, setLastBooking] = useState<BookingPayload | null>(null);

  const [drawerStep, setDrawerStep] = useState(1);
  const [bd, setBd] = useState<BookingPayload>({
    dep: null,
    arr: null,
    pax: 1,
    date: "",
    jet: flights[0].vehicles[0],
    contact: { name: "", phone: "", email: "" },
    services: {},
  });

  const [jcForm, setJcForm] = useState({ hours: 25, name: "", email: "", phone: "" });
  const [selectedEmptyLeg, setSelectedEmptyLeg] = useState<EmptyLeg | null>(null);

  const experiencesRef = useRef<HTMLDivElement>(null);
  const devisRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const emptylegsRef = useRef<HTMLDivElement>(null);
  const privilegeRef = useRef<HTMLDivElement>(null);

  const refs = {
    experiences: experiencesRef,
    devis: devisRef,
    about: aboutRef,
    emptylegs: emptylegsRef,
    privilege: privilegeRef,
  } as const;

  const selectedFlightData = flights.find((f) => f.id === selectedFlight) ?? flights[0];
  const selectedVehicleData =
    selectedFlightData.vehicles.find((v) => v.id === selectedVehicle) ?? selectedFlightData.vehicles[0];
  const detailedVehicleData = selectedFlightData.vehicles.find((v) => v.id === detailedVehicle);

  useEffect(() => {
    if (!selectedFlightData.vehicles.some((v) => v.id === selectedVehicle)) {
      setSelectedVehicle(selectedFlightData.vehicles[0].id);
    }
  }, [selectedFlightData, selectedVehicle]);

  useEffect(() => {
    if (bd.jet && !selectedFlightData.vehicles.some((v) => v.id === bd.jet?.id)) {
      setBd((prev) => ({ ...prev, jet: selectedFlightData.vehicles[0] }));
    }
  }, [selectedFlightData, bd.jet]);

  const goTo = (t?: keyof typeof refs) => {
    if (t && refs[t].current) {
      refs[t].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setPanelOpen(false);
  };

  const getDefaultServices = () => ({
    vip: false,
    pets: false,
    luggage: false,
  });

  const closeAllOverlays = () => {
    setPanelOpen(false);
    setEmptyLegDrawerOpen(false);
    setJetCardOpen(false);
  };

  const openBookingDrawer = () => {
    closeAllOverlays();
    setUberDrawerOpen(true);
    setDetailedVehicle(null);
    setPhotoIndex(0);
  };

  const finalizeBooking = (payload: BookingPayload) => {
    setUberDrawerOpen(false);
    setPanelOpen(false);
    setEmptyLegDrawerOpen(false);
    setShowSuccess(true);
    setBookingId(generateBookingId());
    setLastBooking(payload);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const startBooking = (payload: BookingPayload) => {
    vibrate(8);

    const matchedFlight =
      flights.find((f) => f.from === payload.dep?.city && f.to === payload.arr?.city) ?? selectedFlightData;

    const matchedJet =
      payload.jet ?? matchedFlight.vehicles.find((v) => v.seats >= payload.pax) ?? matchedFlight.vehicles[0];

    setSelectedFlight(matchedFlight.id);
    setSelectedVehicle(matchedJet.id);
    setDrawerStep(1);
    setSelectedEmptyLeg(null);
    setBd({
      dep: payload.dep ?? null,
      arr: payload.arr ?? null,
      pax: payload.pax ?? 1,
      date: payload.date ?? "",
      returnDate: payload.returnDate ?? "",
      tripType: payload.tripType ?? "simple",
      note: payload.note ?? "",
      jet: matchedJet,
      contact: {
        name: payload.contact?.name ?? "",
        phone: payload.contact?.phone ?? "",
        email: payload.contact?.email ?? "",
      },
      services: { ...getDefaultServices(), ...(payload.services ?? {}) },
    });
    openBookingDrawer();
  };

  const startEmptyLegBooking = (leg: EmptyLeg) => {
    vibrate(8);

    const depAirport = airports.find((a) => leg.from.includes(a.code) || a.city === leg.cityFrom) ?? null;
    const arrAirport = airports.find((a) => leg.to.includes(a.code) || a.city === leg.cityTo) ?? null;

    const matchedFlight =
      flights.find((f) => f.from === leg.cityFrom && f.to === leg.cityTo) ?? flights[0];

    const matchedJet =
      matchedFlight.vehicles.find(
        (v) => v.name.toLowerCase().includes(leg.jet.toLowerCase().split(" ")[0]) || v.seats >= leg.pax,
      ) ?? matchedFlight.vehicles[0];

    setSelectedEmptyLeg(leg);
    setSelectedFlight(matchedFlight.id);
    setSelectedVehicle(matchedJet.id);
    setDrawerStep(4);
    setBd({
      dep: depAirport,
      arr: arrAirport,
      pax: leg.pax,
      date: leg.date,
      returnDate: "",
      tripType: "simple",
      note: `Demande issue d’un empty leg ${leg.from} → ${leg.to}`,
      jet: matchedJet,
      contact: { name: "", phone: "", email: "" },
      services: getDefaultServices(),
    });

    setEmptyLegDrawerOpen(false);
    openBookingDrawer();
  };

  const submitJetCardRequest = () => {
    if (!jcForm.name.trim() || !isValidInternationalPhone(jcForm.phone) || !isValidEmail(jcForm.email)) return;
    vibrate(8);
    setJetCardOpen(false);
    setPanelOpen(false);
    setShowSuccess(true);
    setBookingId(generateBookingId());
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleFlightClick = (id: number) => {
    vibrate(8);
    const f = flights.find((x) => x.id === id) ?? flights[0];
    setSelectedFlight(f.id);
    setSelectedVehicle(f.vehicles[0].id);
    setBd((prev) => ({ ...prev, jet: f.vehicles[0] }));
    setDetailedVehicle(null);
    setPhotoIndex(0);
    setDrawerStep(2);
    setUberDrawerOpen(true);
  };

  const toggleFav = (id: number) => {
    vibrate(8);
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDrawerDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 140 || info.velocity.y > 800) setPanelOpen(false);
  };

  const nextPhoto = () => {
    if (!detailedVehicleData) return;
    vibrate(8);
    setPhotoIndex((i) => (i === detailedVehicleData.images.length - 1 ? 0 : i + 1));
  };

  const prevPhoto = () => {
    if (!detailedVehicleData) return;
    vibrate(8);
    setPhotoIndex((i) => (i === 0 ? detailedVehicleData.images.length - 1 : i - 1));
  };

  const isStep1Valid = useMemo(() => {
    if (!bd.dep || !bd.arr || !bd.date) return false;
    if (bd.dep.code === bd.arr.code) return false;
    if (bd.tripType === "retour" && !bd.returnDate) return false;
    return true;
  }, [bd]);

  const isStep2Valid = useMemo(() => !!bd.jet, [bd]);
  const isStep4Valid = useMemo(
    () => !!bd.contact?.name?.trim() && isValidInternationalPhone(bd.contact?.phone) && isValidEmail(bd.contact?.email),
    [bd],
  );

  const isNextDisabled = useMemo(() => {
    if (detailedVehicle) return false;
    if (drawerStep === 1) return !isStep1Valid;
    if (drawerStep === 2) return !isStep2Valid;
    if (drawerStep === 4) return !isStep4Valid;
    return false;
  }, [drawerStep, detailedVehicle, isStep1Valid, isStep2Valid, isStep4Valid]);

  const handleNextStep = () => {
    vibrate(8);

    if (detailedVehicle && detailedVehicleData) {
      setSelectedVehicle(detailedVehicleData.id);
      setBd((prev) => ({ ...prev, jet: detailedVehicleData }));
      setDetailedVehicle(null);
      setPhotoIndex(0);
      return;
    }

    if (drawerStep < 5) {
      setDrawerStep((s) => s + 1);
      return;
    }

    finalizeBooking(bd);
  };

  const featureBlocks = useMemo(
    () => [
      {
        Icon: Clock3,
        t: "Gain de temps",
        d: "Embarquez en quelques minutes. Nous optimisons votre emploi du temps.",
      },
      {
        Icon: ShieldCheck,
        t: "Discrétion absolue",
        d: "Voyagez en toute sérénité. Votre vie privée est notre priorité absolue.",
      },
      {
        Icon: BadgeCheck,
        t: "Service sur-mesure",
        d: "Un accompagnement d'excellence. Nous anticipons chacune de vos attentes.",
      },
    ],
    [],
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <AnimatePresence mode="wait">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed left-1/2 top-6 z-[300] flex w-[calc(100%-2rem)] max-w-fit -translate-x-1/2 justify-center md:top-10"
          >
            <div className="flex items-center gap-3 rounded-full border border-[#d9b84f]/50 bg-black/90 px-5 py-3.5 shadow-[0_10px_40px_rgba(217,184,79,0.2)] backdrop-blur-xl">
              <CheckCircle2 size={20} className="shrink-0 text-[#d9b84f]" />
              <span className="whitespace-nowrap text-[13px] font-medium text-[#d9b84f]">
                Demande envoyée : Un conseiller vous contactera sous 15 min.
              </span>
            </div>
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
          className="object-cover opacity-[0.45]"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/70 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,184,79,0.1),transparent_45%)] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-28 pt-5 sm:px-6 lg:max-w-[1800px] lg:px-16 lg:pb-16 xl:px-24">
        <header className="py-1 sm:py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hidden items-center justify-between lg:flex"
          >
            <h1 className={`text-[18px] font-bold tracking-[0.34em] sm:text-2xl ${styles.goldText}`}>
              ESIJET
            </h1>

            <nav className="flex items-center gap-5 xl:gap-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm"
              >
                Accueil
              </button>
              <button
                onClick={() => goTo("experiences")}
                className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm"
              >
                Flotte
              </button>
              <button
                onClick={() => goTo("emptylegs")}
                className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm"
              >
                Vols à vide
              </button>
              <button
                onClick={() => goTo("privilege")}
                className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm"
              >
                Privilège
              </button>
              <button
                onClick={() => goTo("about")}
                className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm"
              >
                À propos
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => goTo("devis")}
                className={`ml-2 rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black ${styles.goldGrad}`}
              >
                Planifier un vol
              </motion.button>
            </nav>
          </motion.div>

          <div className="mt-2 lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-[24px] px-3 py-3 ${styles.glassCard}`}
            >
              <button
                onClick={() => {
                  vibrate(8);
                  setPanelOpen(true);
                  setMenuTab("Recherche");
                }}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/20 bg-[#ebd57e]/15 shadow-inner">
                  <Search size={18} className="text-[#f4e08f]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] uppercase tracking-[0.24em] text-white/40">
                    Votre prochaine destination ?
                  </p>
                  <p className="truncate text-sm font-light text-white/95">Planifier un vol privé</p>
                </div>
              </button>
            </motion.div>
          </div>
        </header>

        <section className="mt-6 hidden min-h-[70vh] items-center gap-10 md:grid lg:grid-cols-[1fr_540px] lg:gap-16 xl:min-h-[78vh] xl:grid-cols-[1fr_600px] xl:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl xl:max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#d9b84f]">
              <Star size={12} className="fill-[#d9b84f]" /> Aviation d'affaires premium
            </div>
            <h2 className="max-w-4xl text-[34px] font-light leading-[0.98] tracking-tight sm:text-5xl md:text-[52px] lg:text-[64px] xl:text-[78px]">
              Le ciel aura une
              <br />
              <span className="mt-1 block text-[34px] font-normal tracking-tight text-white/95 sm:text-[44px] md:text-[54px] lg:text-[68px] xl:text-[82px]">
                nouvelle signature.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl border-l border-[#d9b84f]/30 pl-5 text-[14px] leading-relaxed text-white/70 sm:text-[15px] md:text-base lg:max-w-xl xl:max-w-2xl">
              L'aviation privée, repensée pour ceux dont le temps est précieux. Nous vous
              garantissons un voyage fluide, discret et orchestré dans les moindres détails.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => goTo("experiences")}
                className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-all ${styles.goldGrad}`}
              >
                Explorer nos vols
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => goTo("about")}
                className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:border-[#d9b84f]/40 hover:bg-white/10 hover:text-[#d9b84f]"
              >
                Découvrir ESIJET
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`hidden w-full justify-self-end rounded-[32px] p-6 lg:block lg:p-10 ${styles.glassCard}`}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-light text-white">Demander une cotation</h3>
              <p className="mt-2 text-sm text-[#d9b84f]/70">
                Renseignez vos critères pour un vol sur-mesure.
              </p>
            </div>
            <FlightSearchForm onValider={startBooking as any} maxPax={selectedFlightData.maxSeats} withTextarea />
          </motion.div>
        </section>

        <section ref={experiencesRef} className="mt-5 md:mt-20">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-2 border-b border-[#d9b84f]/20 pb-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h3 className="text-lg font-light tracking-wide text-white sm:text-xl lg:text-2xl">
                Flotte & Itinéraires
              </h3>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">
                Aviation d’affaires · Départs privés · Service premium
              </p>
            </div>
            <button
              onClick={() => goTo("devis")}
              className={`self-start text-[11px] font-bold tracking-[0.2em] transition hover:opacity-80 sm:self-auto ${styles.goldText}`}
            >
              PLANIFIER UN VOL
            </button>
          </motion.div>

          <div className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-8 md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3 xl:gap-8">
            {flights.map((f, i) => {
              const liked = favorites.includes(f.id);
              return (
                <motion.article
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className={`group min-w-[280px] max-w-[320px] snap-center overflow-hidden rounded-[32px] ${styles.glassCard} transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d9b84f]/40 hover:bg-[#050608]/80 md:min-w-0 md:max-w-none`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleFlightClick(f.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleFlightClick(f.id);
                      }
                    }}
                    className="block cursor-pointer text-left outline-none"
                  >
                    <div className="relative h-52 overflow-hidden sm:h-56 lg:h-60">
                      <Image
                        src={f.image}
                        alt={`${f.from} vers ${f.to}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={100}
                        className="object-cover opacity-[0.85] transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />

                      <button
                        type="button"
                        aria-label="Favoris"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(f.id);
                        }}
                        className={cx(
                          "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:scale-105",
                          liked
                            ? "border-[#d9b84f]/60 bg-black/70 text-[#f7e49d]"
                            : "hover:border-[#d9b84f]/50 hover:text-[#d9b84f]",
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
                      <h4 className="mt-2.5 text-[15px] font-light leading-snug text-white/95 sm:text-base">
                        {f.details}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-xs font-medium tracking-wide text-white/40">
                      {f.duration} · {f.maxSeats} places
                    </div>
                    <motion.button
                      type="button"
                      aria-label="Réserver"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFlightClick(f.id)}
                      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-4 pr-1.5 transition-colors hover:bg-white/15 group-hover:border-[#d9b84f]/40"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[#d9b84f]">
                        Réserver
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#d9b84f]/20">
                        <ArrowRight size={14} className="text-white group-hover:text-[#d9b84f]" />
                      </div>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section ref={emptylegsRef} className="mt-20 hidden lg:block">
          <motion.div
            {...fadeUp}
            className="flex items-end justify-between border-b border-[#d9b84f]/20 pb-4"
          >
            <div>
              <h3 className="text-2xl font-light tracking-wide text-white">Vols à vide</h3>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">
                Tarifs privilégiés • Disponibilité immédiate
              </p>
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-3 gap-6 lg:gap-8">
            {emptyLegs.map((leg) => (
              <div
                key={leg.id}
                className={`rounded-[24px] ${styles.glassCard} p-6 transition hover:border-[#d9b84f]/60 lg:p-8`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">
                    {leg.date}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-white/40">
                    {leg.jet} · {leg.pax} pax
                  </span>
                </div>
                <p className="mb-1 text-xl font-bold text-white">{leg.from}</p>
                <p className="text-xl font-bold text-white">
                  <ArrowRight size={16} className="mr-2 inline text-[#d9b84f]" />
                  {leg.to}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#d9b84f]">
                    Avantage {leg.price}
                  </span>
                  <button
                    onClick={() => startEmptyLegBooking(leg)}
                    className="rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20"
                  >
                    Saisir l'opportunité
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={privilegeRef} className="mt-24 hidden lg:block">
          <motion.div
            {...fadeUp}
            className={`relative overflow-hidden rounded-[40px] border border-[#d9b84f]/30 ${styles.glass} bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)] p-12 lg:p-16`}
          >
            <Crown size={250} className="pointer-events-none absolute -right-10 -top-10 rotate-12 text-[#d9b84f]/5" />
            <div className="relative z-10 grid grid-cols-[1fr_0.8fr] items-center gap-16">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#d9b84f]">
                  <Crown size={14} /> Programme exclusif
                </div>
                <h3 className="mb-6 text-4xl font-light text-white md:text-5xl">Jet Card ESIJET</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-white/70">
                  La sérénité d'avoir un jet privé toujours à disposition. Achetez vos heures de vol
                  à l'avance et profitez de tarifs bloqués toute l'année, sans les contraintes de
                  l'affrètement classique.
                </p>
                <button
                  onClick={() => {
                    vibrate(8);
                    setJetCardOpen(true);
                    setPanelOpen(false);
                  }}
                  className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition hover:scale-105 ${styles.goldGrad}`}
                >
                  Découvrir le programme
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    t: "Tarifs garantis",
                    d: "Vos heures de vol sans aucune fluctuation.",
                    i: CreditCard,
                  },
                  {
                    t: "Disponibilité 48h",
                    d: "Un appareil prêt à décoller sur simple appel.",
                    i: Timer,
                  },
                  {
                    t: "Flotte d'exception",
                    d: "Un accès prioritaire aux jets les plus récents.",
                    i: PlaneTakeoff,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-6 rounded-[24px] border border-[#d9b84f]/15 bg-[#050608]/50 p-6 backdrop-blur-md transition hover:border-[#d9b84f]/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]">
                      <s.i size={20} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{s.t}</p>
                      <p className="mt-1 text-xs text-white/50">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="mt-12 lg:hidden">
          <div className="mb-6 flex items-center justify-between border-b border-[#d9b84f]/20 pb-4">
            <h3 className="text-xl font-light tracking-wide text-white">Vols à vide</h3>
          </div>
          <div className="flex flex-col gap-4">
            {emptyLegs.map((leg) => (
              <div
                key={leg.id}
                className={`rounded-[24px] ${styles.glassCard} p-6 transition hover:border-[#d9b84f]/60`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">
                    {leg.date}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-white/40">
                    {leg.jet} · {leg.pax} pax
                  </span>
                </div>
                <p className="mb-1 text-xl font-bold text-white">{leg.from}</p>
                <p className="text-xl font-bold text-white">
                  <ArrowRight size={16} className="mr-2 inline text-[#d9b84f]" />
                  {leg.to}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#d9b84f]">
                    Avantage {leg.price}
                  </span>
                  <button
                    onClick={() => startEmptyLegBooking(leg)}
                    className="rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20"
                  >
                    Saisir l'opportunité
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3">
            <button
              onClick={() => (window.location.href = "tel:+33651960631")}
              className={`rounded-[22px] px-4 py-4 text-left ${styles.glassCard}`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/25 bg-[#d9b84f]/15">
                <PhoneCall size={18} className="text-[#f4e08f]" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d9b84f]">VIP 24h/7j</p>
              <p className="mt-1 text-sm text-white/90">Ligne directe concierge</p>
            </button>

            <button
              onClick={() => {
                vibrate(8);
                setJetCardOpen(true);
                setPanelOpen(false);
              }}
              className={`rounded-[22px] px-4 py-4 text-left ${styles.glassCard}`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/25 bg-[#d9b84f]/15">
                <Crown size={18} className="text-[#f4e08f]" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d9b84f]">Jet Card ESIJET</p>
              <p className="mt-1 text-sm text-white/90">Adhésion premium</p>
            </button>
          </div>
        </div>

        <section className="mt-12 md:mt-24 lg:hidden">
          <motion.div {...fadeUp} className="hidden gap-6 md:grid md:grid-cols-3">
            {featureBlocks.map((f, i) => (
              <div key={i} className={`rounded-[32px] ${styles.glassCard} p-8 transition-all hover:border-[#d9b84f]/30`}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#d9b84f]/20 bg-[#d9b84f]/10 shadow-inner">
                  <f.Icon className="text-[#e5c96d]" size={24} />
                </div>
                <h3 className="text-lg font-medium text-white">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{f.d}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section ref={devisRef} className="mt-10 lg:hidden">
          <motion.div {...fadeUp} className={`${styles.glassCard} border-[#d9b84f]/20 p-6`}>
            <div className="mb-6">
              <h3 className="text-2xl font-light text-white">Demander un devis</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#d9b84f]/70">
                Décrivez votre besoin pour une proposition sur mesure.
              </p>
            </div>
            <FlightSearchForm onValider={startBooking as any} maxPax={selectedFlightData.maxSeats} mobileStepMode />
          </motion.div>
        </section>

        <section ref={aboutRef} className="mt-12 md:mt-28">
          <motion.div
            {...fadeUp}
            className={`rounded-[40px] border border-[#d9b84f]/20 ${styles.glass} p-8 shadow-2xl backdrop-blur-3xl md:p-14 lg:p-20`}
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
              <div className="flex flex-col justify-center">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d9b84f]">
                  Notre Vision
                </p>
                <h3 className="text-3xl font-light leading-[1.1] text-white md:text-5xl">
                  L'exigence comme seul standard.
                </h3>
                <div className="mt-8 space-y-5">
                  <p className="text-[15px] leading-relaxed text-white/60 md:text-[17px]">
                    Chez ESIJET, nous savons qu'un vol privé n'est pas qu'une question de destination.
                    C'est la garantie d'un temps préservé, d'une intimité respectée et d'un service
                    d'une fiabilité irréprochable.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    Icon: Briefcase,
                    t: "Pour qui ?",
                    d: "Entrepreneurs, personnalités et familles exigeantes.",
                  },
                  {
                    Icon: MapPinned,
                    t: "Votre expérience",
                    d: "Simple, rapide et sans compromis sur l'élégance.",
                  },
                  {
                    Icon: PhoneCall,
                    t: "À vos côtés",
                    d: "Une équipe dédiée disponible 24h/24, 7j/7.",
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-5 rounded-[24px] border border-[#d9b84f]/15 bg-[#050608]/50 p-6 transition hover:border-[#d9b84f]/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]">
                      <c.Icon size={20} />
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

        <footer className="mt-20 hidden border-t border-[#d9b84f]/20 pb-12 pt-10 md:block">
          <div className="flex items-start justify-between">
            <div className="flex gap-10 text-[11px] font-bold uppercase tracking-[0.30em] text-[#d9b84f]/50">
              <span>Excellence</span>
              <span>Discrétion</span>
              <span>Élévation</span>
            </div>
            <div className="flex flex-col items-end gap-5">
              <div className="flex gap-8 text-[10px] uppercase tracking-[0.25em] text-white/30">
                <a href="#" className="transition hover:text-[#d9b84f]">
                  Mentions légales
                </a>
                <a href="#" className="transition hover:text-[#d9b84f]">
                  Confidentialité
                </a>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/15">© 2026 ESIJET. Luxe Privé.</p>
            </div>
          </div>
        </footer>

        <footer className="mt-14 flex justify-center border-t border-[#d9b84f]/20 pb-28 pt-8 md:hidden">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#d9b84f]/50">© 2026 ESIJET.</p>
        </footer>
      </div>

      <div className="fixed bottom-10 right-10 z-40 hidden lg:block">
        <a
          href="tel:+33651960631"
          aria-label="Appeler la ligne VIP"
          className="group flex h-16 items-center gap-4 rounded-full border border-[#d9b84f]/30 bg-[#000000]/90 pl-2.5 pr-7 shadow-[0_15px_50px_rgba(217,184,79,0.15)] backdrop-blur-2xl transition-all hover:scale-105 hover:border-[#d9b84f]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9b84f] text-black shadow-inner">
            <PhoneCall size={20} fill="currentColor" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#d9b84f] transition-colors">
            Ligne VIP
          </span>
        </a>
      </div>

      <Drawer open={emptyLegDrawerOpen} onOpenChange={setEmptyLegDrawerOpen}>
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Vol à vide</DrawerTitle>
            <DrawerDescription>Réservation d'un vol à vide</DrawerDescription>
          </DrawerHeader>

          <div className="relative z-50 mx-auto mb-4 flex h-[85svh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[80dvh] md:max-w-[1000px] md:flex-row">
            <div className="relative h-[35%] w-full shrink-0 border-b border-[#d9b84f]/20 md:order-2 md:h-full md:w-[50%] md:border-b-0 md:border-l">
              <div className="pointer-events-none absolute inset-0 grayscale opacity-40 mix-blend-screen">
                {emptyLegDrawerOpen && selectedEmptyLeg && (
                  <MapBox origin={selectedEmptyLeg.origin} dest={selectedEmptyLeg.dest} />
                )}
              </div>

              <button
                onClick={() => setEmptyLegDrawerOpen(false)}
                className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] backdrop-blur-xl transition hover:bg-[#d9b84f]/10"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-5 left-5 z-20">
                <span className="rounded-full bg-[#d9b84f] px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest text-black shadow-[0_0_15px_rgba(217,184,79,0.5)]">
                  Offre {selectedEmptyLeg?.price}
                </span>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#0a0a0c] p-6 text-white md:order-1 md:p-10">
              <h2 className="mb-1 text-3xl font-light text-white">Vol de positionnement</h2>
              <p className="mb-10 text-xs uppercase tracking-widest text-[#d9b84f]/70">
                Opportunité de dernière minute.
              </p>

              {selectedEmptyLeg && (
                <div className="space-y-8">
                  <div className="rounded-[24px] border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-6">
                    <div className="mb-6 flex items-center gap-3">
                      <PlaneTakeoff size={20} className="text-[#d9b84f]" />
                      <span className="text-xl font-bold text-white">
                        {selectedEmptyLeg.cityFrom}
                        <ArrowRight size={16} className="mx-2 inline text-[#d9b84f]/50" />
                        {selectedEmptyLeg.cityTo}
                      </span>
                    </div>

                    <div className="space-y-4 text-sm text-white/80">
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          Départ
                        </span>
                        <span className="text-base font-medium text-[#d9b84f]">
                          {selectedEmptyLeg.date}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          Appareil
                        </span>
                        <span className="font-medium">{selectedEmptyLeg.jet}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          Capacité max
                        </span>
                        <span className="font-medium">{selectedEmptyLeg.pax} passagers</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      vibrate(8);
                      startEmptyLegBooking(selectedEmptyLeg);
                    }}
                    className={`w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all ${styles.goldGrad}`}
                  >
                    Poursuivre la réservation
                  </button>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={jetCardOpen} onOpenChange={setJetCardOpen}>
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Abonnement Jet Card</DrawerTitle>
            <DrawerDescription>Formulaire d'abonnement</DrawerDescription>
          </DrawerHeader>

          <div className="relative z-50 mx-auto mb-4 flex h-[85svh] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[80dvh] md:max-w-[800px] md:flex-row">
            <div className="relative h-[30%] w-full shrink-0 bg-black md:order-2 md:h-full md:w-[45%]">
              <Image src="/jet.jpg" alt="Jet Card ESIJET" fill className="object-cover opacity-40 grayscale mix-blend-screen" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#000000] to-transparent p-6 text-center">
                 <Crown size={56} className="mb-4 text-[#d9b84f] drop-shadow-[0_0_15px_rgba(217,184,79,0.5)]" />
                 <h3 className="mb-2 text-3xl font-light text-white">Jet Card</h3>
                 <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                   L'ultime liberté de voler.
                 </p>
              </div>
              <button
                onClick={() => setJetCardOpen(false)}
                aria-label="Fermer"
                className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#0a0a0c] p-6 text-white md:order-1 md:p-10">
               <h2 className="mb-1 text-2xl font-light">Adhésion Jet Card</h2>
               <p className="mb-10 text-xs text-white/50">Configurez votre abonnement d'heures de vol.</p>

               <div className="space-y-8">
                  <div>
                     <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">
                       Volume d'heures
                     </label>
                     <div className="grid grid-cols-3 gap-3">
                        {[25, 50, 100].map((h) => (
                           <button
                             key={h}
                             onClick={() => { vibrate(8); setJcForm({ ...jcForm, hours: h }); }}
                             className={cx(
                               "rounded-2xl border py-4 text-sm font-bold transition-all",
                               jcForm.hours === h
                                 ? "border-[#d9b84f] bg-[#d9b84f]/10 text-[#d9b84f] shadow-[0_4px_15px_rgba(217,184,79,0.2)]"
                                 : "border-white/10 bg-white/[0.02] text-white/50 hover:border-[#d9b84f]/50"
                             )}
                           >
                             {h}h
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">
                       Vos coordonnées
                     </label>
                     <div className="space-y-4">
                       <div className={styles.inputWrapper}>
                         <User className="mr-3 shrink-0 text-[#d9b84f]/50" size={18} />
                         <input
                           placeholder="Nom complet"
                           value={jcForm.name}
                           onChange={(e) => setJcForm({ ...jcForm, name: e.target.value })}
                           className={styles.inputField}
                         />
                       </div>
                       <div className={styles.inputWrapper}>
                         <PhoneCall className="mr-3 shrink-0 text-[#d9b84f]/50" size={18} />
                         <div className="flex-1">
                           <PhoneInput
                             international
                             defaultCountry="FR"
                             countryCallingCodeEditable={false}
                             placeholder="Téléphone avec indicatif"
                             value={jcForm.phone}
                             onChange={(value) => setJcForm({ ...jcForm, phone: value || "" })}
                             className="phone-input-esijet"
                           />
                         </div>
                       </div>
                       {jcForm.phone && !isValidInternationalPhone(jcForm.phone) && (
                         <p className="text-xs text-red-400">Entrez un numéro valide avec indicatif international.</p>
                       )}
                       <div className={styles.inputWrapper}>
                         <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/50" size={18} />
                         <input
                           placeholder="Email"
                           type="email"
                           value={jcForm.email}
                           onChange={(e) => setJcForm({ ...jcForm, email: e.target.value })}
                           className={styles.inputField}
                         />
                       </div>
                       {jcForm.email && !isValidEmail(jcForm.email) && (
                         <p className="text-xs text-red-400">Entrez une adresse email valide.</p>
                       )}
                     </div>
                  </div>

                  <button
                    disabled={!jcForm.name.trim() || !isValidInternationalPhone(jcForm.phone) || !isValidEmail(jcForm.email)}
                    onClick={submitJetCardRequest}
                    className={cx(
                      "mt-4 w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all",
                      !jcForm.name.trim() || !isValidInternationalPhone(jcForm.phone) || !isValidEmail(jcForm.email)
                        ? "cursor-not-allowed bg-white/10 text-white/30"
                        : styles.goldGrad
                    )}
                  >
                    Demander mon adhésion
                  </button>
               </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={uberDrawerOpen}
        onOpenChange={(open) => {
          setUberDrawerOpen(open);
          if (!open) {
            setDetailedVehicle(null);
            setPhotoIndex(0);
          }
        }}
      >
        <DrawerContent aria-describedby={undefined} aria-labelledby={undefined} className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Sélection</DrawerTitle>
            <DrawerDescription>Choix du jet</DrawerDescription>
          </DrawerHeader>

          <div className="relative z-50 mx-auto mb-4 flex h-[82svh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:mb-auto md:h-[78dvh] md:max-w-[1150px] md:flex-row">
            <div className="relative h-[28%] w-full shrink-0 border-b border-[#d9b84f]/20 md:order-2 md:h-full md:w-[50%] md:border-b-0 md:border-l">
              <div className="pointer-events-none absolute inset-0 grayscale opacity-40 mix-blend-screen">
                {uberDrawerOpen && bd.dep && bd.arr ? (
                  <MapBox origin={bd.dep.coords} dest={bd.arr.coords} />
                ) : uberDrawerOpen ? (
                  <MapBox origin={selectedFlightData.origin} dest={selectedFlightData.dest} />
                ) : null}
              </div>

              <button
                onClick={() => {
                  vibrate(8);
                  setUberDrawerOpen(false);
                }}
                aria-label="Fermer"
                className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] backdrop-blur-xl transition hover:bg-[#d9b84f]/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-[#050608] text-white md:order-1">
              <div className="flex min-h-[80px] shrink-0 items-center justify-between px-5 pt-5 md:px-6 md:pt-10">
                {detailedVehicle ? (
                  <button
                    onClick={() => {
                      vibrate(8);
                      setDetailedVehicle(null);
                      setPhotoIndex(0);
                    }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition hover:border-[#d9b84f]/50 hover:text-[#d9b84f]"
                  >
                    <ArrowLeft size={16} /> Retour aux jets
                  </button>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {flights.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          vibrate(8);
                          setSelectedFlight(f.id);
                          setSelectedVehicle(f.vehicles[0].id);
                          setBd((prev) => ({ ...prev, jet: f.vehicles[0] }));
                          setDetailedVehicle(null);
                          setPhotoIndex(0);
                        }}
                        className={cx(
                          "whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition",
                          selectedFlight === f.id
                            ? "bg-[#d9b84f] text-black shadow-lg"
                            : "border border-white/15 text-white/60 hover:border-[#d9b84f]/30 hover:bg-white/5",
                        )}
                      >
                        {f.from} → {f.to}
                      </button>
                    ))}
                  </div>
                )}

                {drawerStep === 2 && detailedVehicle && (
                  <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-[#d9b84f]">
                    Étape 2 / 5
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-4 md:px-6 [-ms-overflow-style:none] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait">
                  {drawerStep === 1 && (
                    <motion.div
                      key="s1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="mt-4 space-y-5 pb-10"
                    >
                      <div>
                        <h2 className="mb-1 text-2xl font-light text-white">Votre itinéraire</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                          Où souhaitez-vous aller ?
                        </p>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {(["simple", "retour"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              vibrate(8);
                              setBd({ ...bd, tripType: t });
                            }}
                            className={cx(
                              "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
                              bd.tripType === t
                                ? "bg-[#d9b84f] text-black shadow-md"
                                : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10",
                            )}
                          >
                            {t === "simple" ? "Aller simple" : "Aller-retour"}
                          </button>
                        ))}
                      </div>

                      <CustomSelect
                        type="airport"
                        val={bd.dep}
                        setVal={(v: Airport) => setBd({ ...bd, dep: v })}
                        Icon={PlaneTakeoff}
                        ph="Aéroport de départ"
                      />
                      <CustomSelect
                        type="airport"
                        val={bd.arr}
                        setVal={(v: Airport) => setBd({ ...bd, arr: v })}
                        Icon={PlaneLanding}
                        ph="Aéroport d'arrivée"
                      />

                      <div className={cx("grid gap-4", bd.tripType === "retour" ? "grid-cols-2" : "grid-cols-1")}>
                        <div className={styles.inputWrapper}>
                          <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <input
                            type="date"
                            value={bd.date}
                            onChange={(e) => setBd({ ...bd, date: e.target.value })}
                            className={styles.inputField}
                          />
                        </div>

                        {bd.tripType === "retour" && (
                          <div className={styles.inputWrapper}>
                            <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input
                              type="date"
                              value={bd.returnDate || ""}
                              onChange={(e) => setBd({ ...bd, returnDate: e.target.value })}
                              className={styles.inputField}
                            />
                          </div>
                        )}
                      </div>

                      <CustomSelect
                        type="pax"
                        pax={bd.pax}
                        setPax={(p: number) => setBd({ ...bd, pax: p })}
                        maxPax={8}
                        Icon={Users}
                        ph="Passagers"
                      />
                    </motion.div>
                  )}

                  {drawerStep === 2 && detailedVehicle && detailedVehicleData ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="mt-2 space-y-6 pb-12"
                    >
                      <div className="relative h-56 w-full overflow-hidden rounded-[24px] border border-[#d9b84f]/20">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={photoIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 cursor-grab active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, { offset }) => {
                              if (offset.x <= -40) nextPhoto();
                              if (offset.x >= 40) prevPhoto();
                            }}
                          >
                            <Image
                              src={detailedVehicleData.images[photoIndex]}
                              alt={detailedVehicleData.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              quality={100}
                              className="pointer-events-none object-cover opacity-90"
                            />
                          </motion.div>
                        </AnimatePresence>

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <button
                          onClick={prevPhoto}
                          aria-label="Photo précédente"
                          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d9b84f]/30 bg-[#050608]/60 p-2 text-[#d9b84f] backdrop-blur-md"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextPhoto}
                          aria-label="Photo suivante"
                          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d9b84f]/30 bg-[#050608]/60 p-2 text-[#d9b84f] backdrop-blur-md"
                        >
                          <ChevronRight size={20} />
                        </button>

                        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                          {detailedVehicleData.images.map((_, i) => (
                            <div
                              key={i}
                              className={cx(
                                "h-1.5 rounded-full transition-all duration-300",
                                photoIndex === i ? "w-8 bg-[#d9b84f]" : "w-1.5 bg-white/40",
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-white">{detailedVehicleData.name}</h2>
                          {detailedVehicleData.pop && (
                            <span className="rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#d9b84f] shadow-[0_0_10px_rgba(217,184,79,0.2)]">
                              Recommandé
                            </span>
                          )}
                        </div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/80">
                          {detailedVehicleData.subtitle}
                        </p>
                        <p className="text-[15px] leading-relaxed text-white/70">
                          {detailedVehicleData.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 border-t border-[#d9b84f]/15 pt-6">
                        <div className="rounded-[20px] border border-white/5 bg-white/[0.03] p-3 text-center shadow-sm">
                          <Users className="mx-auto mb-2 text-[#d9b84f]" size={18} />
                          <p className="text-sm font-bold text-white">{detailedVehicleData.seats} pax</p>
                        </div>
                        <div className="rounded-[20px] border border-white/5 bg-white/[0.03] p-3 text-center shadow-sm">
                          <Wind className="mx-auto mb-2 text-[#d9b84f]" size={18} />
                          <p className="text-sm font-bold text-white">{detailedVehicleData.speed}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/5 bg-white/[0.03] p-3 text-center shadow-sm">
                          <Luggage className="mx-auto mb-2 text-[#d9b84f]" size={18} />
                          <p className="text-sm font-bold text-white">{detailedVehicleData.bag}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : drawerStep === 2 ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 space-y-4 pb-12"
                    >
                      <div className="mb-4">
                        <h2 className="mb-1 text-xl font-light text-white">Choix de l'appareil</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                          Sélectionnez le jet adapté à vos besoins.
                        </p>
                      </div>

                      {selectedFlightData.vehicles.map((v) => {
                        const isSelected = bd.jet?.id === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => {
                              vibrate(8);
                              setSelectedVehicle(v.id);
                              setBd({ ...bd, jet: v });
                            }}
                            className={cx(
                              "cursor-pointer rounded-[28px] border p-5 transition-all",
                              isSelected
                                ? "scale-[1.02] border-[#d9b84f] bg-[#d9b84f]/10 text-white shadow-[0_10px_30px_rgba(217,184,79,0.15)]"
                                : "border-white/10 bg-transparent text-white hover:border-[#d9b84f]/40",
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold">{v.name}</h3>
                                  <span className="rounded-sm bg-[#d9b84f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                                    {v.price}
                                  </span>
                                </div>
                                <p
                                  className={cx(
                                    "mt-1 text-xs font-medium uppercase tracking-widest",
                                    isSelected ? "text-[#d9b84f]" : "text-white/50",
                                  )}
                                >
                                  {v.subtitle}
                                </p>
                                <div
                                  className={cx(
                                    "mt-3 flex items-center gap-3 text-[11px]",
                                    isSelected ? "text-white/90" : "text-white/50",
                                  )}
                                >
                                  <span>{v.seats} pax</span>
                                  <span>•</span>
                                  <span>{v.time}</span>
                                  {v.pop && (
                                    <>
                                      <span>•</span>
                                      <span className={isSelected ? "text-[#d9b84f]" : "text-[#d9b84f]/70"}>
                                        Recommandé
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                aria-label="Voir les détails"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vibrate(8);
                                  setSelectedVehicle(v.id);
                                  setDetailedVehicle(v.id);
                                  setPhotoIndex(0);
                                  setBd({ ...bd, jet: v });
                                }}
                                className={cx(
                                  "rounded-full p-3 transition",
                                  isSelected
                                    ? "bg-[#d9b84f] text-black"
                                    : "bg-white/5 text-white hover:bg-white/10 hover:text-[#d9b84f]",
                                )}
                              >
                                <Info size={20} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : null}

                  {drawerStep === 3 && (
                    <motion.div
                      key="s3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="mt-4 space-y-4 pb-10"
                    >
                      <div className="mb-6">
                        <h2 className="mb-1 text-2xl font-light text-white">Options de vol</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                          Sélectionnez vos besoins spécifiques à bord.
                        </p>
                      </div>

                      {flightOptions.map((s) => {
                        const isActive = bd.services?.[s.id];
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              vibrate(8);
                              setBd({
                                ...bd,
                                services: { ...(bd.services || {}), [s.id]: !isActive },
                              });
                            }}
                            className={cx(
                              "flex cursor-pointer items-center gap-5 rounded-[24px] border p-5 transition-all",
                              isActive
                                ? "border-[#d9b84f] bg-[#d9b84f]/10 shadow-[0_10px_20px_rgba(217,184,79,0.15)]"
                                : "border-white/10 bg-white/[0.02] hover:border-[#d9b84f]/40",
                            )}
                          >
                            <div
                              className={cx(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                                isActive ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white/40",
                              )}
                            >
                              <s.icon size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{s.name}</h3>
                              <p className="mt-1 text-[11px] text-white/50">{s.desc}</p>
                            </div>
                          </div>
                        );
                      })}

                      <div className={cx(styles.inputWrapper, "items-start")}>
                        <MessageSquare className="mr-3 mt-0.5 shrink-0 text-[#d9b84f]/60" size={18} />
                        <textarea
                          value={bd.note || ""}
                          onChange={(e) => setBd({ ...bd, note: e.target.value })}
                          placeholder="Notes (ex: 3 sacs de golf)"
                          className={cx(styles.inputField, "h-20 resize-none")}
                        />
                      </div>
                    </motion.div>
                  )}

                  {drawerStep === 4 && (
                    <motion.div
                      key="s4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="mt-4 space-y-4 pb-10"
                    >
                      <div className="mb-6">
                        <h2 className="mb-1 text-2xl font-light text-white">Vos coordonnées</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                          Pour que votre conseiller puisse vous contacter.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className={styles.inputWrapper}>
                          <User className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <input
                            placeholder="Nom complet"
                            value={bd.contact?.name ?? ""}
                            onChange={(e) =>
                              setBd({
                                ...bd,
                                contact: {
                                  ...(bd.contact || { name: "", phone: "", email: "" }),
                                  name: e.target.value,
                                },
                              })
                            }
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputWrapper}>
                          <PhoneCall className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <div className="flex-1">
                            <PhoneInput
                              international
                              defaultCountry="FR"
                              countryCallingCodeEditable={false}
                              placeholder="Téléphone avec indicatif"
                              value={bd.contact?.phone || ""}
                              onChange={(value) =>
                                setBd({
                                  ...bd,
                                  contact: {
                                    ...(bd.contact || { name: "", phone: "", email: "" }),
                                    phone: value || "",
                                  },
                                })
                              }
                              className="phone-input-esijet"
                            />
                          </div>
                        </div>
                        {bd.contact?.phone && !isValidInternationalPhone(bd.contact.phone) && (
                          <p className="text-xs text-red-400">Entrez un numéro valide avec indicatif international.</p>
                        )}
                        <div className={styles.inputWrapper}>
                          <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <input
                            placeholder="Adresse email"
                            type="email"
                            value={bd.contact?.email ?? ""}
                            onChange={(e) =>
                              setBd({
                                ...bd,
                                contact: {
                                  ...(bd.contact || { name: "", phone: "", email: "" }),
                                  email: e.target.value,
                                },
                              })
                            }
                            className={styles.inputField}
                          />
                        </div>
                        {bd.contact?.email && !isValidEmail(bd.contact.email) && (
                          <p className="text-xs text-red-400">Entrez une adresse email valide.</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {drawerStep === 5 && (
                    <motion.div
                      key="s5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="mt-4 space-y-6 pb-10"
                    >
                      <div className="mb-2">
                        <h2 className="mb-1 text-2xl font-light text-white">Récapitulatif</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">
                          Vérifiez les détails avant l'envoi de la demande.
                        </p>
                      </div>

                      <div className="rounded-[24px] border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                          <PlaneTakeoff size={18} className="text-[#d9b84f]" />
                          <span className="text-lg font-bold text-white">
                            {bd.dep?.city}
                            <ArrowRight size={14} className="mx-2 inline text-[#d9b84f]/50" />
                            {bd.arr?.city}
                          </span>
                        </div>

                        <div className="space-y-4 text-sm text-white/90">
                          <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                              Trajet
                            </span>
                            <span className="font-medium text-right">
                              {bd.tripType === "retour" ? "Aller-retour" : "Aller simple"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                              Dates
                            </span>
                            <span className="font-medium text-right text-[#d9b84f]">
                              {bd.date || "Date flexible"}{" "}
                              {bd.tripType === "retour" && bd.returnDate ? ` - ${bd.returnDate}` : ""}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                              Passagers
                            </span>
                            <span className="font-medium text-right">{bd.pax} pers.</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                              Appareil
                            </span>
                            <span className="font-medium text-right">{bd.jet?.name}</span>
                          </div>
                          {Object.entries(bd.services || {}).filter(([_, v]) => v).length > 0 && (
                            <div className="flex justify-between border-b border-white/10 pb-4">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                Options
                              </span>
                              <span className="font-medium text-right">
                                {Object.keys(bd.services || {})
                                  .filter((k) => bd.services?.[k])
                                  .map((k) => flightOptions.find((o) => o.id === k)?.name)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-white/10 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                              Contact
                            </span>
                            <span className="font-medium text-right">
                              {bd.contact?.name}
                              <br />
                              <span className="text-xs text-white/50">{bd.contact?.phone}</span>
                            </span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">
                              Estimation
                            </span>
                            <span className="text-lg font-bold text-[#d9b84f]">{bd.jet?.price}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-2 flex shrink-0 gap-4 border-t border-[#d9b84f]/20 bg-[#050608] p-4 md:p-6">
                {drawerStep > 1 && (
                  <button
                    onClick={() => setDrawerStep((s) => s - 1)}
                    className="flex-1 rounded-2xl border border-white/10 py-4.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5"
                  >
                    Retour
                  </button>
                )}
                <button
                  disabled={isNextDisabled}
                  onClick={handleNextStep}
                  className={cx(
                    "flex-[2] rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all",
                    isNextDisabled ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad,
                  )}
                >
                  {detailedVehicle
                    ? "Choisir cet appareil"
                    : drawerStep === 5
                      ? "Envoyer la demande"
                      : "Étape suivante"}
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 260 }}
              onDragEnd={handleDrawerDragEnd}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35 }}
              className="fixed inset-x-0 bottom-0 top-[64px] z-[60] flex flex-col rounded-t-[36px] border-t border-[#d9b84f]/20 bg-[#050608]/98 px-5 pb-6 pt-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden"
            >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />

              <div className="mb-5 flex items-center gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {M_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      vibrate(8);
                      setMenuTab(tab);
                    }}
                    className={cx(
                      "whitespace-nowrap border-b-2 pb-2 text-[14px] font-medium transition-all",
                      menuTab === tab
                        ? "border-[#d9b84f] text-[#d9b84f]"
                        : "border-transparent text-white/40 hover:text-white/70",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {menuTab === "Recherche" && (
                  <FlightSearchForm onValider={startBooking as any} maxPax={8} mobileStepMode />
                )}

                {menuTab === "Menu" && (
                  <>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {[
                        {
                          Icon: Compass,
                          t: "Vols",
                          a: () => {
                            setPanelOpen(false);
                            goTo("experiences");
                          },
                        },
                        {
                          Icon: CalendarDays,
                          t: "Réserver",
                          a: () => setMenuTab("Recherche"),
                        },
                        {
                          Icon: BadgeCheck,
                          t: "À propos",
                          a: () => goTo("about"),
                        },
                        {
                          Icon: HomeIcon,
                          t: "Accueil",
                          bg: styles.goldGrad,
                          a: () => {
                            setPanelOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          },
                        },
                      ].map((b, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            vibrate(8);
                            b.a();
                          }}
                          className={
                            b.bg
                              ? `rounded-[24px] p-5 text-left text-black ${b.bg} shadow-lg shadow-[#d9b84f]/10`
                              : `rounded-[24px] border border-white/10 ${styles.glassCard} p-5 text-left transition hover:border-[#d9b84f]/30`
                          }
                        >
                          <b.Icon size={20} className={`mb-4 ${b.bg ? "" : "text-[#e5c96d]"}`} />
                          <p className={`text-[15px] ${b.bg ? "font-bold" : "font-medium text-white"}`}>
                            {b.t}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-[#d9b84f]/15 pt-6">
                      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]">
                        Espace VIP
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => vibrate(8)}
                          className="flex items-center gap-4 rounded-[20px] border border-white/5 bg-white/[0.02] p-4 transition hover:border-[#d9b84f]/30"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]">
                            <PhoneCall size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">Assistance 24/7</p>
                            <p className="text-xs text-white/40">Contact direct & WhatsApp</p>
                          </div>
                        </button>

                        <button
                          onClick={() => vibrate(8)}
                          className="flex items-center gap-4 rounded-[20px] border border-white/5 bg-white/[0.02] p-4 transition hover:border-[#d9b84f]/30"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]">
                            <Heart size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">Mes Favoris</p>
                            <p className="text-xs text-white/40">
                              {favorites.length} vols et jets enregistrés
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {menuTab === "Flotte" && (
                  <div className="mt-2 flex flex-col gap-4">
                    {flights[0].vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          vibrate(8);
                          setPanelOpen(false);
                          setSelectedFlight(flights[0].id);
                          setSelectedVehicle(v.id);
                          setDetailedVehicle(v.id);
                          setPhotoIndex(0);
                          startBooking({} as any);
                        }}
                        className="group relative flex h-32 cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-[#050608] transition hover:border-[#d9b84f]/40"
                      >
                        <div className="relative w-2/5 shrink-0">
                          <Image
                            src={v.images[0]}
                            alt={v.name}
                            fill
                            className="object-cover opacity-80 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-[#050608]" />
                        </div>
                        <div className="flex flex-1 flex-col justify-center p-4">
                          <h4 className="text-sm font-bold text-white">{v.name}</h4>
                          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-[#d9b84f]">
                            {v.price}
                          </p>
                          <div className="mt-2 flex gap-3 text-[11px] text-white/50">
                            <span>{v.seats} pax</span>
                            <span>•</span>
                            <span>{v.speed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {menuTab === "Vols à vide" && (
                  <div className="mt-2 flex flex-col gap-4">
                    {emptyLegs.map((leg) => (
                      <div
                        key={leg.id}
                        className="rounded-[24px] border border-[#d9b84f]/30 bg-[#050608] p-5 shadow-[0_0_15px_rgba(217,184,79,0.05)]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full bg-[#d9b84f]/20 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#d9b84f]">
                            {leg.date}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-white/40">
                            {leg.jet} · {leg.pax} pax
                          </span>
                        </div>
                        <p className="mb-1 text-lg font-bold text-white">{leg.cityFrom}</p>
                        <p className="text-lg font-bold text-white">
                          <ArrowRight size={14} className="mr-1.5 inline text-[#d9b84f]" />
                          {leg.cityTo}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">
                            Avantage {leg.price}
                          </span>
                          <button
                            onClick={() => {
                              vibrate(8);
                              startEmptyLegBooking(leg);
                            }}
                            className="rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {menuTab === "Privilège" && (
                  <div className="mt-2">
                    <div
                      className={`relative mb-4 overflow-hidden rounded-[24px] border border-[#d9b84f]/30 ${styles.glassCard} bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)] p-6 text-center`}
                    >
                      <Crown size={28} className="relative z-10 mx-auto mb-3 text-[#d9b84f]" />
                      <h3 className="relative z-10 mb-2 text-xl font-light text-white">Jet Card ESIJET</h3>
                      <p className="relative z-10 text-xs leading-relaxed text-white/60">
                        Bloquez vos heures de vol à tarif fixe garanti.
                      </p>
                      <button
                        onClick={() => {
                          vibrate(8);
                          setJetCardOpen(true);
                          setPanelOpen(false);
                        }}
                        className={`relative z-10 mt-5 w-full rounded-full py-3 text-[11px] font-bold uppercase tracking-widest text-black ${styles.goldGrad}`}
                      >
                        Adhérer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 rounded-[28px] border border-[#d9b84f]/25 bg-[#050608]/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden">
        <div className="mx-auto flex items-center justify-around px-4 py-3">
          {bottomNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "menu") {
                  setPanelOpen(true);
                  setMenuTab("Menu");
                } else {
                  setActiveTab(item.id);
                  if (item.id === "explorer") window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
            >
              <item.icon
                size={20}
                className={activeTab === item.id ? "text-[#e9d57c]" : "text-white/40"}
              />
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.15em] ${
                  activeTab === item.id ? "text-[#e9d57c]" : "text-white/30"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}