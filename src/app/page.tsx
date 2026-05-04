"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState, Component } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import {
  Search,
  Heart,
  ArrowRight,
  ArrowLeft,
  User,
  Plane,
  Clock3,
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
  CreditCard,
  Timer,
  Globe,
  Utensils,
  LogOut,
  Building2,
  IdCard,
  FileText,
  Download,
  Lock,
  Scale
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

import { allAirports, searchAirports, type Airport } from "@/lib/airports";

const translations = {
  fr: { explorer: "Explorer", vols: "Vols", about: "À propos" },
  en: { explorer: "Explore", vols: "Flights", about: "About us" }
};

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
const isValidPassport = (passport?: string) => {
  if (!passport) return false;
  return /^[A-Z0-9]{6,15}$/i.test(passport.trim());
};

const MapBox = dynamic(() => import("@/components/MapBox"), { ssr: false });

class MapErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("MapBox Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050608]/80">
          <span className="text-[10px] uppercase tracking-widest text-white/30">Carte indisponible</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const getMapOriginFromAirport = (airport: any): [number, number] | null => {
  if (!airport) return null;
  if (typeof airport.lat === "number" && typeof airport.lon === "number") return [airport.lat, airport.lon];
  if (typeof airport.latitude === "number" && typeof airport.longitude === "number") return [airport.latitude, airport.longitude];
  if (typeof airport.lat === "number" && typeof airport.lng === "number") return [airport.lat, airport.lng];
  if (Array.isArray(airport.coords) && airport.coords.length === 2) return [airport.coords[0], airport.coords[1]];
  return null;
};

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const vibrate = (pattern: number | number[]) => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};

const generateBookingId = () => `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

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
  pricePerKm?: number;
  avail: string;
  images: string[];
  desc: string;
  pop?: boolean;
  isHelicopter?: boolean;
};

type TripType = "simple" | "retour";

type Passenger = {
  civility: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  passport: string;
  weight: string;
  email?: string;
  phone?: string;
  company?: string;
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

type BookingPayload = {
  dep: Airport | null;
  arr: Airport | null;
  pax: number;
  date: string;
  returnDate?: string;
  tripType?: TripType;
  note?: string;
  jet?: Vehicle | null;
  passengers: Passenger[];
  services?: Record<string, boolean>;
  catering?: string[];
  luggageCount?: number;
  isLocked?: boolean;
  isCustomRoute?: boolean;
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
  type: "Jet Privé" | "Hélicoptère";
};

type CustomSelectProps = 
  | { type: "airport"; val: Airport | null; setVal: (airport: Airport) => void; Icon: any; ph: string; pax?: never; setPax?: never; maxPax?: never; disabled?: boolean; }
  | { type: "pax"; val?: never; setVal?: never; Icon: any; ph: string; pax: number; setPax: (pax: number) => void; maxPax?: number; disabled?: boolean; };

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const getEstimatedPrice = (dep: any, arr: any, jet: Vehicle | null | undefined, tripType: string, fallbackOrigin?: [number, number], fallbackDest?: [number, number]) => {
  if (!jet) return "";
  let origin = getMapOriginFromAirport(dep) || fallbackOrigin;
  let dest = getMapOriginFromAirport(arr) || fallbackDest;
  if (!origin || !dest || !jet.pricePerKm) return jet.price;
  const staticPriceNum = parseInt(jet.price.replace(/\D/g, '')) || 0;
  const dist = getDistanceFromLatLonInKm(origin[0], origin[1], dest[0], dest[1]);
  let estimatedPrice = dist * jet.pricePerKm;
  if (tripType === "retour") estimatedPrice *= 2;
  estimatedPrice = Math.max(estimatedPrice, staticPriceNum * (tripType === "retour" ? 2 : 1));
  const rounded = Math.round(estimatedPrice / 100) * 100;
  return `~ ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`;
};

const getDynamicFlightInfo = (dep: any, arr: any, jet: Vehicle, fallbackOrigin: [number, number], fallbackDest: [number, number]) => {
  let origin = getMapOriginFromAirport(dep) || fallbackOrigin;
  let dest = getMapOriginFromAirport(arr) || fallbackDest;
  if (!origin || !dest) return { time: jet.time, stops: 0 };
  const dist = getDistanceFromLatLonInKm(origin[0], origin[1], dest[0], dest[1]);
  const speedKmH = parseInt(jet.speed.replace(/\D/g, '')) || 800;
  const rangeKm = parseInt(jet.range.replace(/\D/g, '')) || 3000;
  const timeHours = dist / speedKmH;
  const h = Math.floor(timeHours);
  const m = Math.round((timeHours - h) * 60);
  const formattedTime = `${h}h${m.toString().padStart(2, '0')}`;
  const safeRange = rangeKm * 0.95; 
  const stops = Math.floor(dist / safeRange);
  return { time: formattedTime, stops };
};

const getPredefinedAirport = (city: string): Airport | null => {
  const codes: Record<string, string> = {
    "Nice": "NCE", "Marseille": "MRS", "Genève": "GVA", "Londres": "LHR",
    "Paris": "LBG", "Dubaï": "DWC", "Cannes": "CEQ", "Courchevel": "CVF",
    "Saint-Tropez": "LTT", "Ibiza": "IBZ", "Marrakech": "RAK", "Reykjavik": "RKV", "Milan": "LIN", "Olbia": "OLB",
    "Megève": "MVV", "Rome": "CIA", "Capri": "PRJ", "Formentera": "FXX"
  };
  if (codes[city]) {
    const found = allAirports.find((a) => a.code === codes[city]);
    if (found) return found;
  }
  return searchAirports(city)[0] ?? null;
};


const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.26.71 3.03.76.88-.06 1.94-.78 3.19-.71 1.83.11 3.07.82 3.86 1.95-3.15 1.84-2.63 5.76.44 6.94-.76 1.86-1.55 3.04-2.52 4.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.45-2.12 4.31-3.74 4.25z"/>
  </svg>
);

const NATIONALITIES = [
  "Afghane", "Sud-africaine", "Albanaise", "Algérienne", "Allemande", "Américaine", "Andorrane", "Angolaise", 
  "Antiguaise", "Argentine", "Arménienne", "Australienne", "Autrichienne", "Azerbaïdjanaise", "Bahaméenne", 
  "Bahreïnienne", "Bangladaise", "Barbadienne", "Belge", "Bélizienne", "Béninoise", "Bhoutanaise", 
  "Biélorusse", "Birmane", "Bolivienne", "Bosnienne", "Botswanaise", "Brésilienne", "Britannique", 
  "Brunéienne", "Bulgare", "Burkinabé", "Burundaise", "Cambodgienne", "Camerounaise", "Canadienne", 
  "Cap-verdienne", "Centrafricaine", "Chilienne", "Chinoise", "Chypriote", "Colombienne", "Comorienne", 
  "Congolaise", "Costaricaine", "Croate", "Cubaine", "Danoise", "Djiboutienne", "Dominicaine", "Dominiquaise", 
  "Égyptienne", "Émiratie", "Équatorienne", "Érythréenne", "Espagnole", "Estonienne", "Swazie", "Éthiopienne", 
  "Fidjienne", "Finlandaise", "Française", "Gabonaise", "Gambienne", "Géorgienne", "Ghanéenne", "Grecque", 
  "Grenadienne", "Guatémaltèque", "Guinéenne", "Équato-guinéenne", "Bissaoguinéenne", "Guyanienne", 
  "Haïtienne", "Hondurienne", "Hongroise", "Indienne", "Indonésienne", "Irakienne", "Iranienne", "Irlandaise", 
  "Islandaise", "Israélienne", "Italienne", "Ivoirienne", "Jamaïcaine", "Japonaise", "Jordanienne", "Kazakhe", 
  "Kényane", "Kirghize", "Kiribatienne", "Koweïtienne", "Laotienne", "Lesothane", "Lettone", "Libanaise", 
  "Libérienne", "Libyenne", "Liechtensteinoise", "Lituanienne", "Luxembourgeoise", "Macédonienne", "Malgache", 
  "Malaisienne", "Malawienne", "Maldivienne", "Malienne", "Maltaise", "Marocaine", "Marshallaise", "Mauricienne", 
  "Mauritanienne", "Mexicaine", "Micronésienne", "Moldave", "Monégasque", "Mongole", "Monténégrine", 
  "Mozambicaine", "Namibienne", "Nauruane", "Népalaise", "Nicaraguayenne", "Nigérienne", "Nigériane", 
  "Nord-coréenne", "Norvégienne", "Néo-zélandaise", "Omanaise", "Ougandaise", "Ouzbèke", "Pakistanaise", 
  "Palaosienne", "Palestinienne", "Panaméenne", "Papouane-néo-guinéenne", "Paraguayenne", "Néerlandaise", 
  "Péruvienne", "Philippine", "Polonaise", "Portoricaine", "Portugaise", "Qatarienne", "Roumaine", 
  "Russe", "Rwandaise", "Lucienne", "Christophienne", "Vincentaise", "Salomonaise", "Salvadorienne", 
  "Samoane", "Santoméenne", "Saoudienne", "Sénégalaise", "Serbe", "Seychelloise", "Léonaise", "Singapourienne", 
  "Slovaque", "Slovène", "Somalienne", "Soudanaise", "Sri-lankaise", "Sud-coréenne", "Sud-soudanaise", 
  "Suédoise", "Suisse", "Surinamienne", "Syrienne", "Tadjike", "Tanzanienne", "Tchadienne", "Tchèque", 
  "Thaïlandaise", "Togolaise", "Tongienne", "Trinidadienne", "Tunisienne", "Turkmène", "Turque", "Tuvaluane", 
  "Ukrainienne", "Uruguayenne", "Vanuatuane", "Vénézuélienne", "Vietnamienne", "Yéménite", "Zambienne", "Zimbabwéenne"
].sort();

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
    "w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-white/30 appearance-none [color-scheme:dark]",
};

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
        pricePerKm: 6,
        avail: "Départ sous 4h",
        pop: false,
        desc: "Le choix idéal pour les vols courts. Une cabine intime pour rejoindre rapidement votre destination.",
        images: ["/jet.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
      },
      {
        id: "mid1",
        name: "Midsize Jet",
        seats: 8,
        time: "0h55",
        subtitle: "Équilibre confort / vitesse",
        speed: "850 km/h",
        range: "4 500 km",
        bag: "4 valises",
        price: "À partir de 7 200 €",
        pricePerKm: 9,
        avail: "Départ sous 6h",
        pop: true,
        desc: "L'équilibre parfait entre confort et performance, avec une cabine spacieuse pour travailler ou se détendre.",
        images: ["/jet2.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
      }
    ]
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
        pricePerKm: 4.5,
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
        pricePerKm: 6,
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
        pricePerKm: 9,
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
        pricePerKm: 14,
        avail: "Sur demande",
        pop: true,
        desc: "Notre fleuron long-courrier. Vivez une expérience First Class incomparable, de votre domicile à l'arrivée.",
        images: ["/jet3.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
      }
    ],
  },
  {
    id: 4,
    from: "Genève",
    to: "Megève",
    type: "Hélicoptère",
    details: "1 à 6 passagers · Navette VIP",
    image: "/vols/nice-marseille-main.jpg",
    highlight: "Alpin Express",
    duration: "0h20",
    distance: "70 km",
    origin: [46.238, 6.108],
    dest: [45.823, 6.618],
    maxSeats: 6,
    vehicles: [
      {
        id: "heli1",
        name: "Airbus H130",
        seats: 6,
        time: "0h20",
        subtitle: "Confort absolu · Silencieux",
        speed: "240 km/h",
        range: "600 km",
        bag: "4 petits sacs",
        price: "À partir de 1 800 €",
        pricePerKm: 30,
        avail: "Départ sous 2h",
        pop: true,
        isHelicopter: true,
        desc: "Hélicoptère monomoteur spacieux offrant une cabine large, idéal pour vos transferts vers les sommets.",
        images: ["/jet.jpg", "/vols/nice-marseille-int.jpg", "/vols/nice-marseille-detail.jpg"],
      },
    ],
  },
  {
    id: 5,
    from: "Ibiza",
    to: "Formentera",
    type: "Hélicoptère",
    details: "1 à 5 passagers · Island Hopping",
    image: "/vols/geneve-londres-main.jpg", 
    highlight: "Baléares Express",
    duration: "0h15",
    distance: "25 km",
    origin: [38.872, 1.373],
    dest: [38.695, 1.455],
    maxSeats: 5,
    vehicles: [
      {
        id: "heli2",
        name: "AgustaWestland AW109",
        seats: 5,
        time: "0h15",
        subtitle: "Bimoteur prestige · Accès exclusif",
        speed: "285 km/h",
        range: "800 km",
        bag: "3 petits sacs",
        price: "À partir de 1 400 €",
        pricePerKm: 35,
        avail: "Départ sous 3h",
        pop: false,
        isHelicopter: true,
        desc: "L'option parfaite pour une escapade luxueuse et rapide entre les îles des Baléares.",
        images: ["/jet2.jpg", "/vols/geneve-londres-int.jpg", "/vols/geneve-londres-detail.jpg"],
      }
    ]
  },
  {
    id: 6,
    from: "Rome",
    to: "Capri",
    type: "Hélicoptère",
    details: "1 à 4 passagers · Dolce Vita",
    image: "/vols/paris-dubai-main.jpg", 
    highlight: "Amalfi Navette",
    duration: "0h55",
    distance: "210 km",
    origin: [41.799, 12.246],
    dest: [40.550, 14.242],
    maxSeats: 4,
    vehicles: [
      {
        id: "heli3",
        name: "Alouette II",
        seats: 4,
        time: "0h55",
        subtitle: "Vintage · Vue panoramique",
        speed: "185 km/h",
        range: "500 km",
        bag: "2 sacs de voyage",
        price: "À partir de 2 500 €",
        pricePerKm: 25,
        avail: "Départ sous 3h",
        pop: true,
        isHelicopter: true,
        desc: "L'hélicoptère icônique pour relier la capitale italienne à la mythique île de Capri avec une vue imprenable.",
        images: ["/jet.jpg", "/vols/paris-dubai-int.jpg", "/vols/paris-dubai-detail.jpg"],
      }
    ]
  }
];

const emptyLegs: EmptyLeg[] = [
  {
    id: "el1",
    from: "Paris (LBG)",
    to: "Ibiza (IBZ)",
    cityFrom: "Paris",
    cityTo: "Ibiza",
    date: "Demain, 14h00",
    jet: "Light Jet",
    price: "-40%",
    pax: 4,
    origin: [48.969, 2.441],
    dest: [38.872, 1.373],
    type: "Jet Privé"
  },
  {
    id: "el2",
    from: "Nice (NCE)",
    to: "Genève (GVA)",
    cityFrom: "Nice",
    cityTo: "Genève",
    date: "Jeu. 28 Mai",
    jet: "Midsize Jet",
    price: "-35%",
    pax: 6,
    origin: [43.658, 7.215],
    dest: [46.238, 6.108],
    type: "Jet Privé"
  },
  {
    id: "el3",
    from: "Dubaï (DWC)",
    to: "Londres (LHR)",
    cityFrom: "Dubaï",
    cityTo: "Londres",
    date: "Sam. 30 Mai",
    jet: "Heavy Jet",
    price: "-50%",
    pax: 8,
    origin: [25.204, 55.27],
    dest: [51.47, -0.454],
    type: "Jet Privé"
  },
  {
    id: "el4",
    from: "Saint-Tropez (LTT)",
    to: "Nice (NCE)",
    cityFrom: "Saint-Tropez",
    cityTo: "Nice",
    date: "Aujourd'hui, 18h30",
    jet: "Airbus H130",
    price: "-60%",
    pax: 2,
    origin: [43.205, 6.511],
    dest: [43.658, 7.215],
    type: "Hélicoptère"
  },
];

const flightOptions = [
  { id: "vip", name: "Accès Salon VIP", icon: BadgeCheck, desc: "Embarquement privatif et prioritaire" },
  { id: "pets", name: "Animaux en cabine", icon: Heart, desc: "Voyagez avec votre animal de compagnie" },
  { id: "luggage", name: "Bagages hors format", icon: Briefcase, desc: "Skis, matériel de golf, malles volumineuses" },
];

const cateringOptions = [
  { id: "veg", label: "Végétarien" },
  { id: "gluten", label: "Sans Gluten" },
  { id: "halal", label: "Halal" },
  { id: "casher", label: "Casher" },
  { id: "premium", label: "Traiteur Sur-Mesure" },
];

const bottomNav = [
  { id: "explorer", icon: Search, label: "explorer" },
  { id: "voyages", icon: Plane, label: "vols" },
  { id: "client", icon: User, label: "about" },
] as const;

const M_TABS = ["Recherche", "Vols à vide", "Transferts", "Privilège"] as const;

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

  const filtered = props.type === "airport" ? searchAirports(search).slice(0, 50) : [];

  return (
    <div className="relative w-full min-w-0">
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => {
          if (props.disabled) return;
          vibrate(8);
          setOpen(!open);
        }}
        className={cx(
          styles.inputDark, 
          "relative text-left truncate", 
          props.disabled ? "opacity-60 cursor-not-allowed bg-white/[0.02] border-[#d9b84f]/30" : "cursor-pointer"
        )}
      >
        <props.Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/60"
          size={18}
        />
        {display}
        {props.disabled && props.type === "airport" && (
          <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {open && !props.disabled && (
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
                      placeholder="Rechercher une ville, un aéroport..."
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
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#d9b84f]/10 cursor-pointer"
                        >
                          <span className="min-w-0 truncate text-sm text-white">
                            {a.city} <span className="text-xs text-white/40">- {a.name} ({a.country})</span>
                          </span>
                          {a.vip && (
                            <span className="rounded-full bg-[#d9b84f]/20 px-2 py-0.5 text-[8px] font-bold text-[#d9b84f]">
                              VIP
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-white/40">Aucun aéroport trouvé</div>
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
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f]/20 cursor-pointer"
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
                          props.setPax(Math.min(props.maxPax ?? 30, props.pax + 1));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9b84f] text-black transition hover:bg-[#ebd57e] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-[#d9b84f]/60">
                    Capacité maximale : {props.maxPax ?? 30} passagers
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
  maxPax = 30,
  mobileStepMode = false,
}: {
  withTextarea?: boolean;
  onValider: (payload: BookingPayload) => void;
  maxPax?: number;
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

  const today = new Date().toISOString().split("T")[0];

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (returnDate && newDate > returnDate) {
      setReturnDate("");
    }
  };

  const submit = () =>
    onValider({
      dep,
      arr,
      pax,
      date,
      returnDate,
      tripType,
      note,
      jet: null,
      passengers: Array.from({ length: pax }).map((_, i) => ({
        civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "",
        ...(i === 0 ? { email: "", phone: "", company: "" } : {})
      })),
      services: {},
      catering: [],
      luggageCount: pax,
      isLocked: false,
      isCustomRoute: true,
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
                if (t === "simple") setReturnDate("");
              }}
              className={cx(
                "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                tripType === t
                  ? "bg-[#d9b84f] text-black shadow-md"
                  : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10",
              )}
            >
              {t === "simple" ? "Aller simple" : "Aller-retour"}
            </button>
          ))}
        </div>

        <CustomSelect type="airport" val={dep} setVal={setDep} Icon={PlaneTakeoff} ph="Aéroport de départ" />
        <CustomSelect type="airport" val={arr} setVal={setArr} Icon={PlaneLanding} ph="Aéroport d'arrivée" />

        <div className={cx("grid gap-4 mt-2", tripType === "retour" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de départ</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} />
              <input type="date" min={today} value={date} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => handleDateChange(e.target.value)} className={cx(styles.inputDark, "h-[48px] pl-12 w-full [color-scheme:dark] cursor-pointer")} />
            </div>
          </div>

          {tripType === "retour" && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de retour</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} />
                <input type="date" min={date || today} value={returnDate} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setReturnDate(e.target.value)} className={cx(styles.inputDark, "h-[48px] pl-12 w-full [color-scheme:dark] cursor-pointer")} />
              </div>
            </div>
          )}
        </div>

        <CustomSelect type="pax" pax={pax} setPax={setPax} maxPax={maxPax} Icon={Users} ph="Passagers" />

        {withTextarea && (
          <div className="relative w-full mt-2">
            <MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Exigences particulières (animaux, bagages hors format...)" className={cx(styles.inputDark, "h-24 resize-none")} />
          </div>
        )}

        <div className="mt-4 flex flex-col items-center w-full">
          {!isStep1Valid ? (
            <p className="text-[11px] text-[#d9b84f] font-medium mb-3 bg-[#d9b84f]/10 py-2 px-4 rounded-full border border-[#d9b84f]/20">
              ⚠️ Veuillez sélectionner un départ et une arrivée distincts.
            </p>
          ) : !isStep2Valid ? (
            <p className="text-[11px] text-[#d9b84f] font-medium mb-3 bg-[#d9b84f]/10 py-2 px-4 rounded-full border border-[#d9b84f]/20">
              ⚠️ Veuillez sélectionner vos dates de voyage.
            </p>
          ) : null}

          <motion.button type="button" disabled={!isStep1Valid || !isStep2Valid} onClick={() => { vibrate([10, 20, 10]); submit(); }} whileTap={{ scale: !isStep1Valid || !isStep2Valid ? 1 : 0.98 }} className={cx("w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black transition-all cursor-pointer", !isStep1Valid || !isStep2Valid ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad)}>
            DEMANDER UN DEVIS
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cx("h-1 rounded-full transition-all duration-300", step >= s ? "w-6 bg-[#d9b84f]" : "w-3 bg-white/20")} />
          ))}
        </div>
        {step > 1 && (
          <button onClick={() => { vibrate(8); setStep((p) => Math.max(1, p - 1)); }} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 hover:text-white cursor-pointer">
            <ArrowLeft size={10} /> Retour
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <CustomSelect type="airport" val={dep} setVal={(v: Airport) => setDep(v)} Icon={PlaneTakeoff} ph="Aéroport de départ" />
            <CustomSelect type="airport" val={arr} setVal={(v: Airport) => setArr(v)} Icon={PlaneLanding} ph="Aéroport d'arrivée" />
            
            <div className="mt-4 flex flex-col items-center w-full">
              {!isStep1Valid && (
                <p className="text-[11px] text-[#d9b84f] font-medium mb-3 bg-[#d9b84f]/10 py-2 px-4 rounded-full border border-[#d9b84f]/20 text-center w-full">
                  ⚠️ Sélection d'aéroports distincts requise.
                </p>
              )}
              <motion.button type="button" disabled={!isStep1Valid} onClick={() => { vibrate(8); setStep(2); }} whileTap={{ scale: isStep1Valid ? 0.98 : 1 }} className={cx("w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all cursor-pointer", isStep1Valid ? "bg-[#d9b84f] text-black" : "cursor-not-allowed bg-white/5 text-white/30")}>
                Continuer
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["simple", "retour"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { vibrate(8); setTripType(t); if (t === "simple") setReturnDate(""); }} className={cx("rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer", tripType === t ? "bg-[#d9b84f] text-black shadow-md" : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10")}>
                  {t === "simple" ? "Aller simple" : "Aller-retour"}
                </button>
              ))}
            </div>

            <div className={cx("grid gap-4 mt-2", tripType === "retour" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de départ</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} />
                  <input type="date" min={today} value={date} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => handleDateChange(e.target.value)} className={cx(styles.inputDark, "h-[48px] pl-12 w-full [color-scheme:dark] cursor-pointer")} />
                </div>
              </div>

              {tripType === "retour" && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de retour</label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d9b84f]/50" size={18} />
                    <input type="date" min={date || today} value={returnDate} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setReturnDate(e.target.value)} className={cx(styles.inputDark, "h-[48px] pl-12 w-full [color-scheme:dark] cursor-pointer")} />
                  </div>
                </div>
              )}
            </div>

            <CustomSelect type="pax" pax={pax} setPax={setPax} maxPax={maxPax} Icon={Users} ph="Passagers" />

            <div className="mt-4 flex flex-col items-center w-full">
              {!isStep2Valid && (
                <p className="text-[11px] text-[#d9b84f] font-medium mb-3 bg-[#d9b84f]/10 py-2 px-4 rounded-full border border-[#d9b84f]/20 text-center w-full">
                  ⚠️ Veuillez sélectionner vos dates de vol.
                </p>
              )}

              <motion.button type="button" disabled={!isStep2Valid} onClick={() => { vibrate(8); setStep(3); }} whileTap={{ scale: isStep2Valid ? 0.98 : 1 }} className={cx("w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.18em] transition-all cursor-pointer", isStep2Valid ? "bg-[#d9b84f] text-black" : "cursor-not-allowed bg-white/5 text-white/30")}>
                Détails finaux
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className="rounded-2xl border border-[#d9b84f]/20 bg-[#d9b84f]/5 p-4">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[#d9b84f]">Résumé du vol</p>
              <p className="text-sm font-medium text-white">{dep?.city ?? "Départ"} ➔ {arr?.city ?? "Arrivée"}</p>
              <p className="mt-1 text-xs text-white/50">{pax} passager(s) · {date || "Date à préciser"}</p>
            </div>

            {withTextarea && (
              <div className="relative w-full">
                <MessageSquare className="absolute left-4 top-4 text-[#d9b84f]/50" size={18} />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Exigences particulières..." className={cx(styles.inputDark, "h-24 resize-none")} />
              </div>
            )}

            <motion.button type="button" onClick={() => { vibrate([10, 20, 10]); submit(); }} whileTap={{ scale: 0.98 }} className={`mt-4 w-full rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[0.18em] text-black cursor-pointer ${styles.goldGrad}`}>
              CONFIRMER LA DEMANDE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function Home() {
  const [isDesktop, setIsDesktop] = useState(true);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vipMode, setVipMode] = useState<"login" | "register">("login");
  const [vipEmail, setVipEmail] = useState("");
  const [vipPassword, setVipPassword] = useState("");
  
  const today = new Date().toISOString().split("T")[0];
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [panelOpen, setPanelOpen] = useState(false);
  const [uberDrawerOpen, setUberDrawerOpen] = useState(false);
  const [jetCardOpen, setJetCardOpen] = useState(false);
  const [emptyLegDrawerOpen, setEmptyLegDrawerOpen] = useState(false);
  const [vipDashboardOpen, setVipDashboardOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("explorer");
  const [menuTab, setMenuTab] = useState<(typeof M_TABS)[number]>("Recherche");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [selectedFlight, setSelectedFlight] = useState<number>(flights[0].id);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(flights[0].vehicles[0].id);
  const [detailedVehicle, setDetailedVehicle] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [drawerStep, setDrawerStep] = useState(1);
  const [bd, setBd] = useState<BookingPayload>({
    dep: null,
    arr: null,
    pax: 1,
    date: "",
    tripType: "simple",
    returnDate: "",
    jet: flights[0].vehicles[0],
    passengers: [{ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "", email: "", phone: "", company: "" }],
    services: {},
    catering: [],
    luggageCount: 1,
    note: "",
    isLocked: false,
    isCustomRoute: false,
  });

  const [jcAuthMode, setJcAuthMode] = useState<"login" | "register">("register");
  const [jcAccountType, setJcAccountType] = useState<"individual"|"family"|"business">("individual");
  const [jcForm, setJcForm] = useState({ 
    hours: 25, 
    paxCount: 1,
    email: "", 
    phone: "", 
    password: "", 
    language: "Français",
    passengers: [{ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "" }]
  });
  const [jcStep, setJcStep] = useState(1);
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
  const selectedVehicleData = selectedFlightData.vehicles.find((v) => v.id === selectedVehicle) ?? selectedFlightData.vehicles[0];
  const detailedVehicleData = selectedFlightData.vehicles.find((v) => v.id === detailedVehicle);

  useEffect(() => {
    const saved = localStorage.getItem("esijet_favorites");
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

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

  const handlePaxChange = (newPax: number) => {
    setBd((prev) => {
      let newPassengers = [...prev.passengers];
      if (newPax > newPassengers.length) {
        while(newPassengers.length < newPax) {
          newPassengers.push({ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "" });
        }
      } else if (newPax < newPassengers.length) {
        newPassengers = newPassengers.slice(0, newPax);
      }
      return { ...prev, pax: newPax, luggageCount: newPax, passengers: newPassengers };
    });
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setBd(prev => {
      const newPass = [...prev.passengers];
      newPass[index] = { ...newPass[index], [field]: value };
      return { ...prev, passengers: newPass };
    });
  };

  const handleJcPaxChange = (newPax: number) => {
    setJcForm((prev) => {
      let newPassengers = [...prev.passengers];
      if (newPax > newPassengers.length) {
        while(newPassengers.length < newPax) {
          newPassengers.push({ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "" });
        }
      } else if (newPax < newPassengers.length) {
        newPassengers = newPassengers.slice(0, newPax);
      }
      return { ...prev, paxCount: newPax, passengers: newPassengers };
    });
  };

  const updateJcPassenger = (index: number, field: string, value: string) => {
    setJcForm(prev => {
      const newPass = [...prev.passengers];
      newPass[index] = { ...newPass[index], [field]: value };
      return { ...prev, passengers: newPass };
    });
  };

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
    setVipDashboardOpen(false);
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
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const startBooking = (payload: BookingPayload, forceFlightId?: number) => {
    vibrate(8);
    const isCustom = !forceFlightId;
    let matchedFlight = selectedFlightData;
    
    if (forceFlightId) {
      matchedFlight = flights.find(f => f.id === forceFlightId) ?? flights[0];
    } else {
      matchedFlight = flights.find((f) => f.from === payload.dep?.city && f.to === payload.arr?.city) ?? selectedFlightData;
    }

    const matchedJet = payload.jet ?? matchedFlight.vehicles.find((v) => v.seats >= payload.pax) ?? matchedFlight.vehicles[0];

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
      passengers: payload.passengers || Array.from({ length: payload.pax ?? 1 }).map((_, i) => ({
        civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "",
        ...(i === 0 ? { email: "", phone: "", company: "" } : {})
      })),
      services: { ...getDefaultServices(), ...(payload.services ?? {}) },
      catering: payload.catering ?? [],
      luggageCount: payload.pax ?? 1,
      isLocked: payload.isLocked ?? false,
      isCustomRoute: isCustom,
    });
    openBookingDrawer();
  };

  const startEmptyLegBooking = (leg: EmptyLeg) => {
    vibrate(8);
    const depAirport = searchAirports(leg.cityFrom)[0] ?? null;
    const arrAirport = searchAirports(leg.cityTo)[0] ?? null;

    const matchedFlight = flights.find((f) => f.from === leg.cityFrom && f.to === leg.cityTo) ?? flights[0];
    const matchedJet = matchedFlight.vehicles.find((v) => v.name.toLowerCase().includes(leg.jet.toLowerCase().split(" ")[0]) || v.seats >= leg.pax) ?? matchedFlight.vehicles[0];

    setSelectedEmptyLeg(leg);
    setSelectedFlight(matchedFlight.id);
    setSelectedVehicle(matchedJet.id);
    setDrawerStep(4);
    
    setBd({
      dep: depAirport, arr: arrAirport, pax: leg.pax, date: leg.date, returnDate: "", tripType: "simple",
      note: `Demande issue d’un empty leg ${leg.from} → ${leg.to}`, jet: matchedJet,
      passengers: Array.from({ length: leg.pax }).map((_, i) => ({
        civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "",
        ...(i === 0 ? { email: "", phone: "", company: "" } : {})
      })),
      services: getDefaultServices(), catering: [], luggageCount: leg.pax, isLocked: true, isCustomRoute: false,
    });

    setEmptyLegDrawerOpen(false);
    openBookingDrawer();
  };

  const submitJetCardRequest = () => {
    if (jcAuthMode === "register") {
      const isJcValid = !!(isValidInternationalPhone(jcForm.phone) && isValidEmail(jcForm.email) && jcForm.password.trim());
      if (!isJcValid) return;
    } else {
      const isLoginValid = !!(isValidEmail(jcForm.email) && jcForm.password.trim());
      if (!isLoginValid) return;
    }
    
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
    const depAirport = getPredefinedAirport(f.from);
    const arrAirport = getPredefinedAirport(f.to);
    
    startBooking({ 
      dep: depAirport, arr: arrAirport, pax: 1, date: "", tripType: "simple", 
      passengers: [{ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "", email: "", phone: "", company: "" }],
      isLocked: true 
    }, f.id);
  };

  const toggleFav = (id: number) => {
    vibrate(8);
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("esijet_favorites", JSON.stringify(next));
      return next;
    });
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

  const handleDateChangeDrawer = (newDate: string) => {
    setBd(prev => ({
      ...prev,
      date: newDate,
      returnDate: prev.returnDate && newDate > prev.returnDate ? "" : prev.returnDate
    }));
  };

  const isStep1Valid = useMemo(() => {
    if (!bd.dep || !bd.arr || !bd.date) return false;
    if (bd.dep.code === bd.arr.code) return false;
    if (bd.tripType === "retour" && !bd.returnDate) return false;
    return true;
  }, [bd]);

  const isStep2Valid = useMemo(() => !!bd.jet, [bd]);
  
  const isStep4Valid = useMemo(() => {
    return bd.passengers.every((p, i) => {
      if (!p.firstName.trim() || !p.lastName.trim() || !p.nationality.trim() || !p.dob.trim()) return false;
      if (bd.jet?.isHelicopter) {
        if (!p.weight?.trim()) return false;
      } else {
        if (!p.passport?.trim() || !isValidPassport(p.passport)) return false;
      }
      if (i === 0) {
        if (!isValidInternationalPhone(p.phone) || !isValidEmail(p.email)) return false;
      }
      return true;
    });
  }, [bd]);

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

  const handleUberDrawerChange = (open: boolean) => {
    setUberDrawerOpen(open);
    if (!open) {
      setDetailedVehicle(null);
      setPhotoIndex(0);
    }
  };

  const featureBlocks = useMemo(() => [
    { Icon: Clock3, t: "Gain de temps", d: "Embarquez en quelques minutes. Nous optimisons votre emploi du temps." },
    { Icon: ShieldCheck, t: "Discrétion absolue", d: "Voyagez en toute sérénité. Votre vie privée est notre priorité absolue." },
    { Icon: BadgeCheck, t: "Service sur-mesure", d: "Un accompagnement d'excellence. Nous anticipons chacune de vos attentes." },
  ], []);

  const getMapOrigin = (): [number, number] | null => {
    if (selectedEmptyLeg) return selectedEmptyLeg.origin;
    return getMapOriginFromAirport(bd.dep) || selectedFlightData.origin;
  };

  const getMapDest = (): [number, number] | null => {
    if (selectedEmptyLeg) return selectedEmptyLeg.dest;
    return getMapOriginFromAirport(bd.arr) || selectedFlightData.dest;
  };

  // Validations Jet Card
  const isJcLoginValid = !!(isValidEmail(jcForm.email) && jcForm.password.trim());
  const isJcStep1Valid = true; // Select hours -> always valid because it has a default
  const isJcStep3Valid = jcForm.passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.nationality.trim() && p.dob.trim());
  const isJcStep4Valid = !!(isValidEmail(jcForm.email) && isValidInternationalPhone(jcForm.phone) && jcForm.password.trim());

  const emptyLegContent = (
    <div className="relative z-50 mx-auto flex h-[85svh] w-full max-w-[1000px] flex-col overflow-hidden rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:h-[80vh] md:flex-row">
      <div className="relative h-[35%] w-full shrink-0 border-b border-[#d9b84f]/20 md:order-2 md:h-full md:w-[50%] md:border-b-0 md:border-l">
        <div className="pointer-events-none absolute inset-0 grayscale opacity-40 mix-blend-screen bg-black">
          {emptyLegDrawerOpen && selectedEmptyLeg && (
            <MapErrorBoundary>
              <MapBox origin={selectedEmptyLeg.origin} dest={selectedEmptyLeg.dest} minZoom={4} maxZoom={8} padding={80} />
            </MapErrorBoundary>
          )}
        </div>

        <button onClick={() => setEmptyLegDrawerOpen(false)} className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] backdrop-blur-xl transition hover:bg-[#d9b84f]/10 cursor-pointer">
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
        <p className="mb-10 text-xs uppercase tracking-widest text-[#d9b84f]/70">Opportunité de dernière minute.</p>
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Départ</span>
                  <span className="text-base font-medium text-[#d9b84f]">{selectedEmptyLeg.date}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Appareil</span>
                  <span className="font-medium flex items-center gap-2">
                    {selectedEmptyLeg.type === "Hélicoptère" ? <Wind size={14} className="text-[#d9b84f]" /> : <Plane size={14} className="text-[#d9b84f]" />}
                    {selectedEmptyLeg.jet}
                  </span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Capacité max</span>
                  <span className="font-medium">{selectedEmptyLeg.pax} passagers</span>
                </div>
              </div>
            </div>
            <button onClick={() => { vibrate(8); startEmptyLegBooking(selectedEmptyLeg); }} className={`cursor-pointer w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all ${styles.goldGrad}`}>
              Poursuivre la réservation
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const jetCardContent = (
    <div className="relative z-50 mx-auto flex h-[90svh] w-full max-w-[1300px] flex-col overflow-hidden rounded-t-[32px] md:rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:h-[80vh] md:flex-row">
      <div className="relative h-[120px] w-full shrink-0 bg-black border-b border-[#d9b84f]/20 md:order-2 md:h-full md:w-[55%] md:border-b-0 md:border-l">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]">
          <Image src="/jet.jpg" alt="Jet Card ESIJET" fill className="object-cover opacity-40 grayscale mix-blend-screen pointer-events-none" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#000000] to-transparent p-4 text-center pointer-events-none">
            <Crown size={32} className="mb-2 md:mb-4 md:w-14 md:h-14 text-[#d9b84f] drop-shadow-[0_0_15px_rgba(217,184,79,0.5)]" />
            <h3 className="mb-1 text-xl md:text-3xl font-light text-white">Jet Card</h3>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#d9b84f]/70">L'ultime liberté de voler.</p>
        </div>
        <button onClick={() => { setJetCardOpen(false); setJcStep(1); setJcAuthMode("register"); }} aria-label="Fermer" className="cursor-pointer absolute right-4 top-4 md:right-5 md:top-5 z-20 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] backdrop-blur-xl transition hover:bg-[#d9b84f]/10">
          <X size={16} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#0a0a0c] text-white md:order-1 md:w-[45%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-5 pt-5 md:px-10 md:pt-10 mb-4 md:mb-6 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">{jcAuthMode === "register" ? "Adhésion" : "Connexion"} Jet Card</h2>
              <button onClick={() => { setJcAuthMode(jcAuthMode === "register" ? "login" : "register"); setJcStep(1); }} className="text-xs text-[#d9b84f] hover:text-white transition cursor-pointer underline">
                {jcAuthMode === "register" ? "Déjà membre ?" : "Créer un compte"}
              </button>
            </div>
            {jcAuthMode === "register" && (
              <div className="flex w-full gap-1.5 justify-between mb-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={cx("h-1.5 flex-1 rounded-full transition-all duration-500", jcStep >= s ? "bg-[#d9b84f]" : "bg-white/10")} />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 md:px-10 md:pb-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence mode="wait">
              {jcAuthMode === "login" && (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 flex items-center justify-center gap-3 bg-white text-black py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:opacity-90 cursor-pointer">
                      <GoogleIcon /> Google
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-3 bg-black border border-white/20 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:border-white/50 cursor-pointer">
                      <AppleIcon /> Apple
                    </button>
                  </div>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] uppercase tracking-widest text-white/30">ou par email</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className={styles.inputWrapper}>
                        <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <input placeholder="Adresse email" type="email" value={jcForm.email} onChange={(e) => setJcForm({ ...jcForm, email: e.target.value })} className={styles.inputField} />
                      </div>
                      {jcForm.email && !isValidEmail(jcForm.email) && <p className="text-[10px] text-red-400 px-2">⚠️ Email invalide.</p>}
                    </div>
                    <div className={styles.inputWrapper}>
                      <Lock className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                      <input placeholder="Mot de passe" type="password" value={jcForm.password} onChange={(e) => setJcForm({ ...jcForm, password: e.target.value })} className={styles.inputField} />
                    </div>
                  </div>
                  <button disabled={!isJcLoginValid} onClick={submitJetCardRequest} className={cx("cursor-pointer mt-4 w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", !isJcLoginValid ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad)}>
                    Me connecter
                  </button>
                </motion.div>
              )}

              {jcAuthMode === "register" && jcStep === 1 && (
                <motion.div key="jc-s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-white">Sélection du forfait</h3>
                    <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Combien d'heures de vol ?</p>
                  </div>
                  <div>
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
                      {[10, 25, 50].map((h) => (
                          <button key={h} onClick={() => { vibrate(8); setJcForm({ ...jcForm, hours: h }); }} className={cx("cursor-pointer rounded-2xl border py-4 text-sm font-bold transition-all", jcForm.hours === h ? "border-[#d9b84f] bg-[#d9b84f]/10 text-[#d9b84f] shadow-[0_4px_15px_rgba(217,184,79,0.2)]" : "border-white/10 bg-white/[0.02] text-white/50 hover:border-[#d9b84f]/50")}>
                            {h}h
                          </button>
                      ))}
                    </div>
                    <button onClick={() => { vibrate(8); setJcForm({ ...jcForm, hours: 100 }); }} className={cx("relative overflow-hidden w-full cursor-pointer rounded-2xl border py-4 text-sm font-bold transition-all", jcForm.hours === 100 ? styles.goldGrad + " border-transparent text-black shadow-[0_0_20px_rgba(217,184,79,0.5)]" : "border-[#d9b84f]/50 bg-[#d9b84f]/5 text-[#d9b84f] hover:border-[#d9b84f]")}>
                      {jcForm.hours !== 100 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      )}
                      100h
                    </button>
                  </div>
                  <button onClick={() => { vibrate(8); setJcStep(2); }} className={cx("cursor-pointer w-full rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", styles.goldGrad)}>
                    Suivant
                  </button>
                </motion.div>
              )}

              {jcAuthMode === "register" && jcStep === 2 && (
                <motion.div key="jc-s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-white">Type de compte</h3>
                    <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Définissez vos bénéficiaires</p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { id: "individual", t: "Individuel", d: "1 passager autorisé", pax: 1, i: User },
                      { id: "family", t: "Famille", d: "Jusqu'à 5 passagers", pax: 2, i: Users },
                      { id: "business", t: "Entreprise", d: "Jusqu'à 30 passagers", pax: 6, i: Building2 }
                    ].map((type) => (
                      <button key={type.id} onClick={() => { vibrate(8); setJcAccountType(type.id as any); handleJcPaxChange(type.pax); }} className={cx("flex items-center gap-4 p-4 rounded-[20px] border transition-all text-left cursor-pointer", jcAccountType === type.id ? "border-[#d9b84f] bg-[#d9b84f]/10" : "border-white/10 bg-white/[0.02] hover:border-[#d9b84f]/30")}>
                        <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", jcAccountType === type.id ? "bg-[#d9b84f] text-black" : "bg-white/5 text-[#d9b84f]")}>
                          <type.i size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{type.t}</p>
                          <p className="text-xs text-white/50">{type.d}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {jcAccountType !== "individual" && (
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      <div>
                        <h3 className="text-[13px] font-bold text-white flex items-center gap-2 mb-1">
                          <Users size={16} className="text-[#d9b84f]" /> Nombre exact de bénéficiaires
                        </h3>
                      </div>
                      <div className="flex items-center gap-5 bg-black/40 rounded-full px-4 py-2 border border-white/10">
                        <button type="button" onClick={() => { vibrate(8); handleJcPaxChange(Math.max(2, jcForm.paxCount - 1)); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f] hover:text-black cursor-pointer">-</button>
                        <span className="w-6 text-center text-sm font-bold text-white">{jcForm.paxCount}</span>
                        <button type="button" onClick={() => { vibrate(8); handleJcPaxChange(Math.min(30, jcForm.paxCount + 1)); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f] hover:text-black cursor-pointer">+</button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={() => setJcStep(1)} className="cursor-pointer flex-1 rounded-2xl border border-white/10 py-4.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5">Retour</button>
                    <button onClick={() => setJcStep(3)} className={cx("cursor-pointer flex-[2] rounded-2xl py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", styles.goldGrad)}>Suivant</button>
                  </div>
                </motion.div>
              )}

              {/* --- REGISTER MODE : STEP 3 (Informations Passagers) --- */}
              {jcAuthMode === "register" && jcStep === 3 && (
                <motion.div key="jc-s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-white">Identités</h3>
                    <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Veuillez renseigner les {jcForm.paxCount} bénéficiaires.</p>
                  </div>

                  <div className="space-y-8">
                    {jcForm.passengers.map((p, i) => (
                      <div key={i} className="space-y-4 pt-6 border-t border-white/10 first:border-0 first:pt-0">
                        <h4 className="text-sm font-bold text-[#d9b84f] uppercase tracking-widest flex items-center gap-2 mb-4">
                          <User size={16} /> Bénéficiaire {i + 1} {i === 0 && <span className="text-[9px] text-white/50">(Principal)</span>}
                        </h4>
                        
                        <div className="flex gap-3 mb-2">
                          {["M.", "Mme"].map((civ) => (
                            <button key={civ} onClick={() => { vibrate(8); updateJcPassenger(i, 'civility', civ); }} className={cx("px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer", p.civility === civ ? "bg-[#d9b84f] text-black shadow-[0_0_15px_rgba(217,184,79,0.3)]" : "bg-white/[0.02] border border-white/10 text-white/50 hover:border-white/30 hover:text-white")}>
                              {civ}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={styles.inputWrapper}>
                            <User className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input placeholder="Prénom" value={p.firstName} onChange={(e) => updateJcPassenger(i, 'firstName', e.target.value)} className={styles.inputField} />
                          </div>
                          <div className={styles.inputWrapper}>
                            <input placeholder="Nom" value={p.lastName} onChange={(e) => updateJcPassenger(i, 'lastName', e.target.value)} className={styles.inputField} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Nationalité</label>
                            <div className={styles.inputWrapper}>
                              <Globe className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                              <select value={p.nationality} onChange={(e) => updateJcPassenger(i, 'nationality', e.target.value)} className={cx(styles.inputField, "appearance-none bg-transparent")}>
                                <option value="" disabled hidden>Sélectionner...</option>
                                {NATIONALITIES.map(n => <option key={n} value={n} className="bg-[#0a0a0c]">{n}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de naissance</label>
                            <div className={styles.inputWrapper}>
                              <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                              <input type="date" value={p.dob} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => updateJcPassenger(i, 'dob', e.target.value)} className={cx(styles.inputField, "cursor-pointer")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex w-full gap-4 pt-4">
                    <button onClick={() => setJcStep(2)} className="cursor-pointer flex-1 rounded-2xl border border-white/10 py-4.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5">Retour</button>
                    <button disabled={!isJcStep3Valid} onClick={() => setJcStep(4)} className={cx("cursor-pointer flex-[2] rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", !isJcStep3Valid ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad)}>Étape finale</button>
                  </div>
                </motion.div>
              )}

              {jcAuthMode === "register" && jcStep === 4 && (
                <motion.div key="jc-s4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-white">Finaliser le compte</h3>
                    <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Coordonnées du compte principal.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 flex items-center justify-center gap-3 bg-white text-black py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:opacity-90 cursor-pointer">
                      <GoogleIcon /> Lier Google
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-3 bg-black border border-white/20 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:border-white/50 cursor-pointer">
                      <AppleIcon /> Lier Apple
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] uppercase tracking-widest text-white/30">ou manuellement</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className={styles.inputWrapper}>
                        <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <input placeholder="Adresse email" type="email" value={jcForm.email} onChange={(e) => setJcForm({ ...jcForm, email: e.target.value })} className={styles.inputField} />
                      </div>
                      {jcForm.email && !isValidEmail(jcForm.email) && <p className="text-[10px] text-red-400 px-2">⚠️ Email invalide.</p>}
                    </div>

                    <div className="space-y-1">
                      <div className={styles.inputWrapper}>
                        <PhoneCall className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <div className="flex-1 w-full overflow-hidden">
                          <PhoneInput international defaultCountry="FR" countryCallingCodeEditable={false} placeholder="Téléphone" value={jcForm.phone} onChange={(value) => setJcForm({ ...jcForm, phone: value || "" })} className="phone-input-esijet" />
                        </div>
                      </div>
                      {jcForm.phone && !isValidInternationalPhone(jcForm.phone) && <p className="text-[10px] text-red-400 px-2">⚠️ Numéro invalide.</p>}
                    </div>

                    <div className={styles.inputWrapper}>
                      <Lock className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                      <input placeholder="Créer un mot de passe" type="password" value={jcForm.password} onChange={(e) => setJcForm({ ...jcForm, password: e.target.value })} className={styles.inputField} />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full pt-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Langue de communication</label>
                      <div className={styles.inputWrapper}>
                        <Globe className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <select value={jcForm.language} onChange={(e) => setJcForm({ ...jcForm, language: e.target.value })} className={cx(styles.inputField, "appearance-none bg-transparent")}>
                          <option value="Français" className="bg-[#0a0a0c]">Français</option>
                          <option value="Anglais" className="bg-[#0a0a0c]">Anglais</option>
                          <option value="Russe" className="bg-[#0a0a0c]">Russe</option>
                          <option value="Arabe" className="bg-[#0a0a0c]">Arabe</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-4 pt-4">
                    <button onClick={() => setJcStep(3)} className="cursor-pointer flex-1 rounded-2xl border border-white/10 py-4.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5">Retour</button>
                    <button disabled={!isJcStep4Valid} onClick={submitJetCardRequest} className={cx("cursor-pointer flex-[2] rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", !isJcStep4Valid ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad)}>Souscrire</button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
      </div>
    </div>
  );

  const vipDashboardContent = (
    <div className="relative z-50 mx-auto flex h-[90svh] w-full max-w-[1300px] flex-col overflow-hidden rounded-t-[32px] md:rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:h-[80vh] md:flex-row">
      {!isLoggedIn ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,184,79,0.1),transparent_50%)]" />
          <button onClick={() => setVipDashboardOpen(false)} className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] cursor-pointer hover:bg-[#d9b84f]/10">
            <X size={18} />
          </button>
          
          <div className="w-full max-w-sm relative z-10 flex flex-col justify-center flex-1 py-8">
            <div className="mb-8 text-center flex flex-col items-center">
              <h2 className="text-3xl font-light mb-2 text-white">{vipMode === "login" ? "Connexion VIP" : "Inscription VIP"}</h2>
              <p className="text-white/50 text-sm mb-4">Accédez à vos factures, vols et Jet Card.</p>
              <button onClick={() => setVipMode(vipMode === "login" ? "register" : "login")} className="text-xs text-[#d9b84f] underline cursor-pointer hover:text-white transition">
                {vipMode === "login" ? "Créer un compte" : "Déjà membre ? Se connecter"}
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {vipMode === "register" && (
                <div className={styles.inputWrapper}>
                  <User className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                  <input placeholder="Nom complet" type="text" className={styles.inputField} />
                </div>
              )}
              <div className={styles.inputWrapper}>
                <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                <input placeholder="Adresse email" type="email" value={vipEmail} onChange={(e) => setVipEmail(e.target.value)} className={styles.inputField} />
              </div>
              <div className={styles.inputWrapper}>
                <Lock className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                <input placeholder="Mot de passe" type="password" value={vipPassword} onChange={(e) => setVipPassword(e.target.value)} className={styles.inputField} />
              </div>
              <button disabled={!vipEmail || !vipPassword} onClick={() => setIsLoggedIn(true)} className={cx("w-full py-4 rounded-2xl font-bold text-[13px] uppercase tracking-widest transition cursor-pointer", (!vipEmail || !vipPassword) ? "bg-white/10 text-white/30 cursor-not-allowed" : `${styles.goldGrad} text-black hover:opacity-90`)}>
                {vipMode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </div>

            <div className="flex items-center gap-4 py-2 mb-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] uppercase tracking-widest text-white/30">ou</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
            
            <div className="space-y-3">
              <button className="flex items-center justify-center gap-3 w-full bg-white text-black py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:opacity-90 cursor-pointer">
                <GoogleIcon /> Continuer avec Google
              </button>
              <button className="flex items-center justify-center gap-3 w-full bg-black border border-white/20 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition hover:border-white/50 cursor-pointer">
                <AppleIcon /> Continuer avec Apple
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <button onClick={() => setIsLoggedIn(true)} className="text-[#d9b84f] text-[10px] uppercase tracking-widest underline hover:text-white transition cursor-pointer">Mode démo : Forcer la connexion</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full shrink-0 border-b border-[#d9b84f]/20 bg-[#0a0a0c] md:w-[35%] md:border-b-0 md:border-r p-8 flex flex-col justify-center items-center text-center">
            <button onClick={() => setVipDashboardOpen(false)} className="md:hidden absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f]">
              <X size={18} />
            </button>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d9b84f]/10 border border-[#d9b84f]/30">
              <User size={32} className="text-[#d9b84f]" />
            </div>
            <h2 className="text-2xl font-light text-white mb-1">M. Jean Dupont</h2>
            <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#d9b84f] border border-[#d9b84f]/30 mb-10">
              Membre Jet Card
            </span>
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-white/5 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#d9b84f] border-r-[#d9b84f] rotate-45" />
              <div className="text-center">
                <p className="text-3xl font-light text-white">14<span className="text-xl">h</span>30</p>
                <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Restantes sur 25h</p>
              </div>
            </div>
            <button onClick={() => { setIsLoggedIn(false); setVipDashboardOpen(false); }} className="cursor-pointer flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors mt-auto">
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050608] p-6 text-white md:p-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button onClick={() => setVipDashboardOpen(false)} className="hidden md:flex absolute right-5 top-5 z-20 h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] transition hover:bg-[#d9b84f]/10 cursor-pointer">
              <X size={18} />
            </button>

            <h3 className="text-xl font-light mb-6 flex items-center gap-3">
              <Plane className="text-[#d9b84f]" size={20} /> Prochain vol
            </h3>
            <div className="rounded-[24px] border border-[#d9b84f]/30 bg-[#d9b84f]/5 p-6 mb-10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/70">12 Novembre 2026</span>
                <span className="text-[10px] uppercase tracking-widest text-[#d9b84f] font-bold">En préparation</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-right">
                  <p className="text-2xl font-light">Paris</p>
                  <p className="text-xs text-white/50 uppercase tracking-widest">LBG</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#d9b84f] to-transparent relative">
                    <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#d9b84f]" />
                  </div>
                  <p className="text-[10px] mt-2 text-white/40">1h10</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-light">Genève</p>
                  <p className="text-xs text-white/50 uppercase tracking-widest">GVA</p>
                </div>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-xs text-white/70">
                <span>Appareil : Midsize Jet</span>
                <span>4 Passagers</span>
              </div>
            </div>

            <h3 className="text-xl font-light mb-6 flex items-center gap-3">
              <FileText className="text-[#d9b84f]" size={20} /> Dernières factures
            </h3>
            <div className="space-y-3">
              {[
                { id: "F-2026-089", date: "02 Oct 2026", desc: "Vol Ibiza -> Nice", amount: "4 500 €" },
                { id: "F-2026-042", date: "15 Sep 2026", desc: "Abonnement Jet Card 25h", amount: "175 000 €" },
              ].map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-white">{inv.id} <span className="text-xs font-normal text-white/50 ml-2">{inv.date}</span></p>
                    <p className="text-xs text-white/60">{inv.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[#d9b84f]">{inv.amount}</span>
                    <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d9b84f] hover:text-black transition cursor-pointer">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const mOrigin = getMapOrigin();
  const mDest = getMapDest();

  const bookingContent = (
    <div className="relative z-50 mx-auto flex h-[82svh] w-full max-w-[1300px] flex-col overflow-hidden rounded-[32px] border border-[#d9b84f]/30 bg-[#050608] shadow-[0_0_50px_rgba(217,184,79,0.15)] md:h-[75vh] md:flex-row">
      
      <div className="relative h-[25%] flex items-center justify-center w-full shrink-0 border-b border-[#d9b84f]/20 md:order-2 md:h-full md:w-[55%] md:border-b-0 md:border-l bg-[#050608]">
        <div className="absolute inset-0 grayscale opacity-40 mix-blend-screen pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_5%,black_20%,black_80%,transparent_95%)] bg-black">
          {uberDrawerOpen && mOrigin && mDest && (
            <MapErrorBoundary>
              <MapBox origin={mOrigin} dest={mDest} minZoom={4} maxZoom={8} padding={80} />
            </MapErrorBoundary>
          )}
        </div>
        <button onClick={() => { vibrate(8); setUberDrawerOpen(false); }} aria-label="Fermer" className="cursor-pointer absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/30 bg-[#050608]/80 text-[#d9b84f] backdrop-blur-xl transition hover:bg-[#d9b84f]/10">
          <X size={18} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-[#050608] text-white md:order-1 md:w-[45%]">
        
        <div className="px-5 pt-6 pb-2 md:px-6 md:pt-8 w-full shrink-0">
          <div className="flex w-full gap-1.5 justify-between">
            {Array.from({ length: selectedEmptyLeg ? 2 : 5 }).map((_, i) => (
              <div key={i} className={cx("h-1.5 flex-1 rounded-full transition-all duration-500", (selectedEmptyLeg ? drawerStep - 3 : drawerStep) >= i + 1 ? "bg-[#d9b84f]" : "bg-white/10")} />
            ))}
          </div>
          <p className="mt-2 text-right text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">Étape {selectedEmptyLeg ? drawerStep - 3 : drawerStep} sur {selectedEmptyLeg ? 2 : 5}</p>
        </div>

        <div className="flex min-h-[60px] shrink-0 items-center justify-between px-5 md:px-6 pb-2">
          {detailedVehicle ? (
            <button onClick={() => { vibrate(8); setDetailedVehicle(null); setPhotoIndex(0); }} className="cursor-pointer flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition hover:border-[#d9b84f]/50 hover:text-[#d9b84f]">
              <ArrowLeft size={16} /> Retour aux appareils
            </button>
          ) : selectedEmptyLeg ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">Vol à vide</span>
              <span className="text-[12px] font-bold uppercase tracking-widest text-white truncate max-w-[200px] md:max-w-none">
                {selectedEmptyLeg.cityFrom} <ArrowRight className="inline mx-1" size={12} /> {selectedEmptyLeg.cityTo}
              </span>
            </div>
          ) : bd.isCustomRoute ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">Vol sur mesure</span>
              <span className="text-[12px] font-bold uppercase tracking-widest text-white truncate max-w-[200px] md:max-w-none">
                {bd.dep?.city} <ArrowRight className="inline mx-1" size={12} /> {bd.arr?.city}
              </span>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {flights.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    vibrate(8);
                    setSelectedFlight(f.id);
                    setSelectedVehicle(f.vehicles[0].id);
                    setBd((prev) => ({
                      ...prev, jet: f.vehicles[0], dep: getPredefinedAirport(f.from), arr: getPredefinedAirport(f.to),
                      isLocked: true, isCustomRoute: false,
                    }));
                    setDetailedVehicle(null);
                    setPhotoIndex(0);
                  }}
                  className={cx("cursor-pointer whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition", selectedFlight === f.id ? "bg-[#d9b84f] text-black shadow-lg" : "border border-white/15 text-white/60 hover:border-[#d9b84f]/30 hover:bg-white/5")}
                >
                  {f.from} → {f.to}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 md:px-6 [-ms-overflow-style:none] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence mode="wait">
            {drawerStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="mt-2 space-y-5 pb-10">
                <div>
                  <h2 className="mb-1 text-2xl font-light text-white">Votre itinéraire</h2>
                  <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Où souhaitez-vous aller ?</p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {(["simple", "retour"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => { vibrate(8); setBd({ ...bd, tripType: t, returnDate: t === "simple" ? "" : bd.returnDate }); }} className={cx("cursor-pointer rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all", bd.tripType === t ? "bg-[#d9b84f] text-black shadow-md" : "border border-[#d9b84f]/30 bg-transparent text-[#d9b84f]/60 hover:bg-[#d9b84f]/10")}>
                      {t === "simple" ? "Aller simple" : "Aller-retour"}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <CustomSelect type="airport" val={bd.dep} setVal={(v: Airport) => setBd({ ...bd, dep: v })} Icon={PlaneTakeoff} ph="Aéroport de départ" disabled={bd.isLocked} />
                  <CustomSelect type="airport" val={bd.arr} setVal={(v: Airport) => setBd({ ...bd, arr: v })} Icon={PlaneLanding} ph="Aéroport d'arrivée" disabled={bd.isLocked} />
                  {bd.isLocked && (
                    <p className="text-[10px] uppercase tracking-widest text-[#d9b84f]/60 text-center flex items-center justify-center gap-1.5 mt-[-5px]">
                      <Lock size={12} /> Itinéraire prédéfini verrouillé
                    </p>
                  )}
                </div>

                <div className={cx("grid gap-4 mt-2", bd.tripType === "retour" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de départ</label>
                    <div className={styles.inputWrapper}>
                      <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                      <input type="date" min={today} value={bd.date} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => handleDateChangeDrawer(e.target.value)} className={cx(styles.inputField, "cursor-pointer")} />
                    </div>
                  </div>
                  {bd.tripType === "retour" && (
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de retour</label>
                      <div className={styles.inputWrapper}>
                        <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <input type="date" min={bd.date || today} value={bd.returnDate || ""} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => setBd({ ...bd, returnDate: e.target.value })} className={cx(styles.inputField, "cursor-pointer")} />
                      </div>
                    </div>
                  )}
                </div>

                <CustomSelect type="pax" pax={bd.pax} setPax={handlePaxChange} maxPax={bd.isLocked ? (bd.jet?.seats || 30) : 30} Icon={Users} ph="Passagers" />
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
                  <button onClick={prevPhoto} aria-label="Photo précédente" className="cursor-pointer absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d9b84f]/30 bg-[#050608]/60 p-2 text-[#d9b84f] backdrop-blur-md">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextPhoto} aria-label="Photo suivante" className="cursor-pointer absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d9b84f]/30 bg-[#050608]/60 p-2 text-[#d9b84f] backdrop-blur-md">
                    <ChevronRight size={20} />
                  </button>
                  <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {detailedVehicleData.images.map((_, i) => (
                      <div key={i} className={cx("h-1.5 rounded-full transition-all duration-300", photoIndex === i ? "w-8 bg-[#d9b84f]" : "w-1.5 bg-white/40")} />
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
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-4 pb-12">
                <div className="mb-4">
                  <h2 className="mb-1 text-xl font-light text-white">Choix de l'appareil</h2>
                  <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Sélectionnez le jet ou l'hélicoptère.</p>
                </div>

                {selectedFlightData.vehicles.map((v) => {
                  const isSelected = bd.jet?.id === v.id;
                  const { time: dynamicTime, stops } = getDynamicFlightInfo(bd.dep, bd.arr, v, selectedFlightData.origin, selectedFlightData.dest);

                  return (
                    <div key={v.id} onClick={() => { vibrate(8); setSelectedVehicle(v.id); setBd({ ...bd, jet: v }); }} className={cx("cursor-pointer rounded-[28px] border p-5 transition-all", isSelected ? "scale-[1.02] border-[#d9b84f] bg-[#d9b84f]/10 shadow-[0_10px_30px_rgba(217,184,79,0.15)]" : "border-white/10 bg-transparent hover:border-[#d9b84f]/40")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="text-lg font-bold text-white truncate max-w-full">{v.name}</h3>
                            <span className="shrink-0 rounded-sm bg-[#d9b84f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                              {getEstimatedPrice(bd.dep, bd.arr, v, bd.tripType || "simple", selectedFlightData.origin, selectedFlightData.dest)}
                            </span>
                          </div>
                          
                          <p className={cx("text-xs font-medium uppercase tracking-widest mb-3 line-clamp-2 leading-relaxed", isSelected ? "text-[#d9b84f]" : "text-white/50")}>
                            {v.subtitle}
                          </p>

                          <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]", isSelected ? "text-white/90" : "text-white/50")}>
                            <span>{v.seats} pax</span>
                            <span>•</span>
                            <span>{dynamicTime}</span>
                            {stops > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-orange-400 font-bold">{stops} escale{stops > 1 ? 's' : ''}</span>
                              </>
                            )}
                            {v.pop && stops === 0 && (
                              <>
                                <span>•</span>
                                <span className={isSelected ? "text-[#d9b84f]" : "text-[#d9b84f]/70"}>Recommandé</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button aria-label="Voir les photos" onClick={(e) => { e.stopPropagation(); vibrate(8); setSelectedVehicle(v.id); setDetailedVehicle(v.id); setPhotoIndex(0); setBd({ ...bd, jet: v }); }} className={cx("relative shrink-0 w-16 h-12 md:w-20 md:h-14 overflow-hidden rounded-xl border transition-all cursor-pointer group", isSelected ? "border-[#d9b84f] shadow-[0_0_15px_rgba(217,184,79,0.3)]" : "border-white/10 hover:border-[#d9b84f]/50")}>
                          <Image src={v.images[0]} alt={v.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] md:text-xs font-bold tracking-widest text-white shadow-sm drop-shadow-md">+{v.images.length - 1}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : null}

            {drawerStep === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="mt-2 space-y-4 pb-10">
                <div className="mb-6">
                  <h2 className="mb-1 text-2xl font-light text-white">Options de vol</h2>
                  <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Sélectionnez vos besoins spécifiques à bord.</p>
                </div>

                {flightOptions.map((s) => {
                  const isActive = bd.services?.[s.id];
                  return (
                    <div key={s.id} onClick={() => { vibrate(8); setBd({ ...bd, services: { ...(bd.services || {}), [s.id]: !isActive } }); }} className={cx("cursor-pointer flex items-center gap-5 rounded-[24px] border p-5 transition-all", isActive ? "border-[#d9b84f] bg-[#d9b84f]/10 shadow-[0_10px_20px_rgba(217,184,79,0.15)]" : "border-white/10 bg-white/[0.02] hover:border-[#d9b84f]/40")}>
                      <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors", isActive ? "bg-[#d9b84f] text-black" : "bg-white/5 text-white/40")}>
                        <s.icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{s.name}</h3>
                        <p className="mt-1 text-[11px] text-white/50">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                    <div>
                      <h3 className="text-[13px] font-bold text-white flex items-center gap-2 mb-1">
                        <Luggage size={16} className="text-[#d9b84f]" /> Bagages en soute
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#d9b84f]/70">Standards (Max 23kg / valise)</p>
                    </div>
                    <div className="flex items-center gap-5 bg-black/40 rounded-full px-4 py-2 border border-white/10">
                      <button type="button" onClick={() => { vibrate(8); setBd({...bd, luggageCount: Math.max(0, (bd.luggageCount || 0) - 1)}); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f] hover:text-black cursor-pointer">-</button>
                      <span className="w-6 text-center text-sm font-bold text-white">{bd.luggageCount || 0}</span>
                      <button type="button" onClick={() => { vibrate(8); setBd({...bd, luggageCount: (bd.luggageCount || 0) + 1}); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#d9b84f] hover:text-black cursor-pointer">+</button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#d9b84f] flex items-center gap-2">
                    <Utensils size={14} /> Restauration à bord
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cateringOptions.map((c) => {
                      const isActive = bd.catering?.includes(c.id);
                      return (
                        <button key={c.id} type="button" onClick={() => { vibrate(8); const current = bd.catering || []; const next = isActive ? current.filter(id => id !== c.id) : [...current, c.id]; setBd({ ...bd, catering: next }); }} className={cx("cursor-pointer rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all", isActive ? "bg-[#d9b84f] text-black shadow-md border border-[#d9b84f]" : "border border-white/10 bg-white/[0.02] text-white/50 hover:border-[#d9b84f]/40 hover:text-white")}>
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className={cx(styles.inputWrapper, "items-start mt-6")}>
                  <MessageSquare className="mr-3 mt-0.5 shrink-0 text-[#d9b84f]/60" size={18} />
                  <textarea value={bd.note || ""} onChange={(e) => setBd({ ...bd, note: e.target.value })} placeholder="Notes particulières (ex: demandes diététiques, transferts...)" className={cx(styles.inputField, "h-20 resize-none")} />
                </div>
              </motion.div>
            )}

            {drawerStep === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="mt-2 space-y-8 pb-10">
                <div className="mb-2">
                  <h2 className="mb-1 text-2xl font-light text-white">Informations passagers</h2>
                  <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Coordonnées et détails d'identité.</p>
                </div>

                {bd.passengers.map((p, i) => (
                  <div key={i} className="space-y-4 pt-6 border-t border-white/10 first:border-0 first:pt-0">
                    <h3 className="text-sm font-bold text-[#d9b84f] uppercase tracking-widest flex items-center gap-2 mb-4">
                      <User size={16} /> Passager {i + 1} {i === 0 && <span className="text-[9px] text-white/50">(Contact principal)</span>}
                    </h3>
                    
                    <div className="flex gap-3 mb-2">
                      {["M.", "Mme"].map((civ) => (
                        <button key={civ} onClick={() => { vibrate(8); updatePassenger(i, 'civility', civ); }} className={cx("px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer", p.civility === civ ? "bg-[#d9b84f] text-black shadow-[0_0_15px_rgba(217,184,79,0.3)]" : "bg-white/[0.02] border border-white/10 text-white/50 hover:border-white/30 hover:text-white")}>
                          {civ}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={styles.inputWrapper}>
                        <User className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                        <input placeholder="Prénom" value={p.firstName} onChange={(e) => updatePassenger(i, 'firstName', e.target.value)} className={styles.inputField} />
                      </div>
                      <div className={styles.inputWrapper}>
                        <input placeholder="Nom" value={p.lastName} onChange={(e) => updatePassenger(i, 'lastName', e.target.value)} className={styles.inputField} />
                      </div>
                    </div>

                    {i === 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className={styles.inputWrapper}>
                            <MessageSquare className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input placeholder="Adresse email" type="email" value={p.email || ""} onChange={(e) => updatePassenger(i, 'email', e.target.value)} className={styles.inputField} />
                          </div>
                          {p.email && !isValidEmail(p.email) && <p className="text-[10px] text-red-400 px-2">⚠️ Email invalide.</p>}
                        </div>
                        <div className="space-y-1">
                          <div className={styles.inputWrapper}>
                            <PhoneCall className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <div className="flex-1 w-full overflow-hidden">
                              <PhoneInput international defaultCountry="FR" countryCallingCodeEditable={false} placeholder="Téléphone" value={p.phone || ""} onChange={(v) => updatePassenger(i, 'phone', v || "")} className="phone-input-esijet" />
                            </div>
                          </div>
                          {p.phone && !isValidInternationalPhone(p.phone) && <p className="text-[10px] text-red-400 px-2">⚠️ Numéro invalide.</p>}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Nationalité</label>
                        <div className={styles.inputWrapper}>
                          <Globe className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <select value={p.nationality} onChange={(e) => updatePassenger(i, 'nationality', e.target.value)} className={cx(styles.inputField, "appearance-none bg-transparent")}>
                            <option value="" disabled hidden>Sélectionner...</option>
                            {NATIONALITIES.map(n => <option key={n} value={n} className="bg-[#0a0a0c]">{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Date de naissance</label>
                        <div className={styles.inputWrapper}>
                          <CalendarDays className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                          <input type="date" value={p.dob} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e) => updatePassenger(i, 'dob', e.target.value)} className={cx(styles.inputField, "cursor-pointer")} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bd.jet?.isHelicopter ? (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Poids (KG) *Requis</label>
                          <div className={styles.inputWrapper}>
                            <Scale className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input type="number" placeholder="Ex: 75" value={p.weight} onChange={(e) => updatePassenger(i, 'weight', e.target.value)} className={styles.inputField} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] pl-1">Numéro de Passeport</label>
                          <div className={styles.inputWrapper}>
                            <IdCard className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input type="text" placeholder="Requis pour le vol" value={p.passport} onChange={(e) => updatePassenger(i, 'passport', e.target.value)} className={styles.inputField} />
                          </div>
                          {p.passport && !isValidPassport(p.passport) && <p className="text-[10px] text-red-400 px-2 mt-1">⚠️ Format invalide.</p>}
                        </div>
                      )}

                      {i === 0 && !bd.jet?.isHelicopter && (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]/50 pl-1">Société (Optionnel)</label>
                          <div className={styles.inputWrapper}>
                            <Building2 className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input type="text" placeholder="Nom de l'entreprise" value={p.company || ""} onChange={(e) => updatePassenger(i, 'company', e.target.value)} className={styles.inputField} />
                          </div>
                        </div>
                      )}

                      {i === 0 && bd.jet?.isHelicopter && (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]/50 pl-1">Société (Optionnel)</label>
                          <div className={styles.inputWrapper}>
                            <Building2 className="mr-3 shrink-0 text-[#d9b84f]/60" size={18} />
                            <input type="text" placeholder="Nom de l'entreprise" value={p.company || ""} onChange={(e) => updatePassenger(i, 'company', e.target.value)} className={styles.inputField} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {drawerStep === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="mt-2 space-y-6 pb-10">
                <div className="mb-2">
                  <h2 className="mb-1 text-2xl font-light text-white">Récapitulatif final</h2>
                  <p className="text-xs uppercase tracking-widest text-[#d9b84f]/70">Vérifiez les détails avant l'envoi de la demande.</p>
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Trajet</span>
                      <span className="font-medium text-right">{bd.tripType === "retour" ? "Aller-retour" : "Aller simple"}</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Dates</span>
                      <span className="font-medium text-right text-[#d9b84f]">{bd.date || "Date flexible"} {bd.tripType === "retour" && bd.returnDate ? ` - ${bd.returnDate}` : ""}</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Passagers & Bagages</span>
                      <span className="font-medium text-right">{bd.pax} pers. • {bd.luggageCount} bagage(s)</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Appareil</span>
                      <span className="font-medium text-right flex items-center justify-end gap-1.5">
                        {bd.jet?.isHelicopter ? <Wind size={12} className="text-[#d9b84f]" /> : <Plane size={12} className="text-[#d9b84f]" />} 
                        {bd.jet?.name}
                      </span>
                    </div>

                    {(() => {
                      const finalDynamicInfo = getDynamicFlightInfo(bd.dep, bd.arr, bd.jet!, selectedFlightData.origin, selectedFlightData.dest);
                      return (
                        <div className="flex justify-between border-b border-white/10 pb-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Temps de vol</span>
                          <span className="font-medium text-right">{finalDynamicInfo.time} {finalDynamicInfo.stops > 0 && <span className="text-orange-400 ml-1">(+ {finalDynamicInfo.stops} escale{finalDynamicInfo.stops > 1 ? 's' : ''})</span>}</span>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Contact Principal</span>
                      <span className="font-medium text-right">
                        {bd.passengers[0]?.civility} {bd.passengers[0]?.firstName} {bd.passengers[0]?.lastName}
                        {bd.passengers[0]?.company && <span className="block text-xs text-[#d9b84f]">{bd.passengers[0].company}</span>}
                        <span className="block text-xs text-white/50 mt-1">{bd.passengers[0]?.phone} • {bd.passengers[0]?.email}</span>
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Identité</span>
                      <span className="font-medium text-right">
                        {bd.jet?.isHelicopter ? `Poids: ${bd.passengers[0]?.weight}kg` : `Passport : ${bd.passengers[0]?.passport}`}
                        <span className="block text-xs text-white/50 mt-1">{bd.passengers[0]?.nationality} • Né(e) le {bd.passengers[0]?.dob}</span>
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">Estimation</span>
                      <span className="text-lg font-bold text-[#d9b84f]">
                        {getEstimatedPrice(bd.dep, bd.arr, bd.jet, bd.tripType || "simple", selectedFlightData.origin, selectedFlightData.dest)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mb-2 flex flex-col shrink-0 gap-3 border-t border-[#d9b84f]/20 bg-[#050608] p-4 md:p-6">
          {(isNextDisabled || (selectedEmptyLeg && drawerStep === 4 && !isStep4Valid)) && (
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#d9b84f]/10 border border-[#d9b84f]/20 px-4 py-2 text-[11px] font-medium text-[#d9b84f]">
                ⚠️
                {drawerStep === 1 && "Aéroports distincts et date requis."}
                {drawerStep === 2 && "Sélectionnez un appareil."}
                {drawerStep === 4 && "Informations passagers manquantes ou invalides."}
              </span>
            </div>
          )}

          <div className="flex w-full gap-4">
            {(selectedEmptyLeg ? drawerStep > 4 : drawerStep > 1) && (
              <button onClick={() => setDrawerStep((s) => s - 1)} className="cursor-pointer flex-1 rounded-2xl border border-white/10 py-4.5 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/5">
                Retour
              </button>
            )}
            <button disabled={isNextDisabled || (selectedEmptyLeg && drawerStep === 4 && !isStep4Valid)} onClick={handleNextStep} className={cx("cursor-pointer flex-[2] rounded-[20px] py-4.5 text-[13px] font-bold uppercase tracking-[0.2em] text-black transition-all", (isNextDisabled || (selectedEmptyLeg && drawerStep === 4 && !isStep4Valid)) ? "cursor-not-allowed bg-white/10 text-white/30" : styles.goldGrad)}>
              {detailedVehicle ? "Choisir cet appareil" : drawerStep === 5 ? "Envoyer la demande" : "Étape suivante"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = (
    open: boolean,
    onOpenChange: (o: boolean) => void,
    title: string,
    desc: string,
    content: React.ReactNode
  ) => {
    if (isDesktop) {
      return (
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => onOpenChange(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full px-6 flex justify-center">
                {content}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      );
    }

    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="border-none bg-transparent p-0 shadow-none">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{desc}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">
      <AnimatePresence mode="wait">
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="fixed left-1/2 top-6 z-[300] flex w-[calc(100%-2rem)] max-w-fit -translate-x-1/2 justify-center md:top-10">
            <div className="flex items-center gap-3 rounded-full border border-[#d9b84f]/50 bg-black/90 px-5 py-3.5 shadow-[0_10px_40px_rgba(217,184,79,0.2)] backdrop-blur-xl">
              <CheckCircle2 size={20} className="shrink-0 text-[#d9b84f]" />
              <span className="whitespace-nowrap text-[13px] font-medium text-[#d9b84f]">Demande envoyée : Un conseiller vous contactera sous 15 min.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0" suppressHydrationWarning>
        <Image src="/jet.jpg" alt="Jet privé ESIJET" fill priority sizes="100vw" quality={100} className="object-cover opacity-[0.45]" suppressHydrationWarning />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/70 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,184,79,0.1),transparent_45%)] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-28 pt-5 sm:px-6 lg:max-w-[1800px] lg:px-16 lg:pb-16 xl:px-24">
        <header className="py-1 sm:py-4 lg:py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="hidden items-center justify-between lg:flex">
            <h1 className={`text-[18px] font-bold tracking-[0.34em] sm:text-2xl ${styles.goldText}`}>ESIJET</h1>
            <nav className="flex items-center gap-4 xl:gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm cursor-pointer">Accueil</button>
              <button onClick={() => goTo("experiences")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm cursor-pointer">Transferts</button>
              <button onClick={() => goTo("emptylegs")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm cursor-pointer">Vols à vide</button>
              <button onClick={() => goTo("privilege")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm cursor-pointer">Privilège</button>
              <button onClick={() => goTo("about")} className="text-xs text-white/70 transition hover:text-[#d9b84f] sm:text-sm cursor-pointer">À propos</button>
              
              <div className="flex items-center gap-3 border-l border-white/20 pl-4 ml-2">
                <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-[#d9b84f] transition cursor-pointer">
                  <Globe size={14} />{lang === "fr" ? "EN" : "FR"}
                </button>
                <button onClick={() => { setVipDashboardOpen(true); }} className={cx("flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer", isLoggedIn ? "border-[#d9b84f]/50 bg-[#d9b84f]/10 text-[#d9b84f]" : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white")}>
                  {isLoggedIn ? <User size={14} className="text-[#d9b84f]" /> : <User size={14} className="opacity-50" />}
                  {isLoggedIn ? "Mon Espace VIP" : "Connexion VIP"}
                </button>
              </div>

              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`ml-2 rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-black cursor-pointer ${styles.goldGrad}`}>
                Planifier un vol
              </motion.button>
            </nav>
          </motion.div>

          <div className="mt-2 lg:hidden flex gap-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`flex-1 rounded-[24px] px-3 py-3 ${styles.glassCard}`}>
              <button onClick={() => { vibrate(8); setPanelOpen(true); setMenuTab("Recherche"); }} className="flex w-full items-center gap-3 text-left cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9b84f]/20 bg-[#ebd57e]/15 shadow-inner">
                  <Search size={18} className="text-[#f4e08f]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] uppercase tracking-[0.24em] text-white/40">Votre prochaine destination ?</p>
                  <p className="truncate text-sm font-light text-white/95">Planifier un vol privé</p>
                </div>
              </button>
            </motion.div>
          </div>
        </header>

        <section className="mt-6 hidden min-h-[70vh] items-center gap-10 md:grid lg:grid-cols-[1fr_540px] lg:gap-16 xl:min-h-[78vh] xl:grid-cols-[1fr_600px] xl:gap-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="max-w-3xl xl:max-w-4xl">
            <h2 className="max-w-4xl text-[34px] font-light leading-[0.98] tracking-tight sm:text-5xl md:text-[52px] lg:text-[64px] xl:text-[78px]">Le ciel aura une<br /><span className="mt-1 block text-[34px] font-normal tracking-tight text-white/95 sm:text-[44px] md:text-[54px] lg:text-[68px] xl:text-[82px]">nouvelle signature.</span></h2>
            <p className="mt-6 max-w-2xl border-l border-[#d9b84f]/30 pl-5 text-[14px] leading-relaxed text-white/70 sm:text-[15px] md:text-base lg:max-w-xl xl:max-w-2xl">
              L'aviation privée, repensée pour ceux dont le temps est précieux. Nous vous garantissons un voyage fluide, discret et orchestré dans les moindres détails.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("experiences")} className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-all cursor-pointer ${styles.goldGrad}`}>Explorer nos vols</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => goTo("about")} className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:border-[#d9b84f]/40 hover:bg-white/10 hover:text-[#d9b84f] cursor-pointer">Découvrir ESIJET</motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className={`hidden w-full justify-self-end rounded-[32px] p-6 lg:block lg:p-10 ${styles.glassCard}`}>
            <div className="mb-8">
              <h3 className="text-2xl font-light text-white">Demander un devis</h3>
              <p className="mt-2 text-sm text-[#d9b84f]/70">Renseignez vos critères pour un vol sur-mesure.</p>
            </div>
            <FlightSearchForm onValider={startBooking} maxPax={30} withTextarea />
          </motion.div>
        </section>

        <section ref={experiencesRef} className="mt-5 md:mt-20">
          <motion.div {...fadeUp} className="flex flex-col gap-2 border-b border-[#d9b84f]/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-light tracking-wide text-white sm:text-xl lg:text-2xl">Transferts & Itinéraires</h3>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">Aviation d’affaires · Départs privés · Service premium</p>
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`self-start text-[11px] font-bold tracking-[0.2em] transition hover:opacity-80 sm:self-auto cursor-pointer ${styles.goldText}`}>PLANIFIER UN VOL</button>
          </motion.div>

          <h4 className="mt-8 mb-4 px-2 md:px-0 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d9b84f]">Jets Privés</h4>
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3 xl:gap-8">
            {flights.filter(f => f.type === "Jet privé").map((f, i) => {
              const liked = favorites.includes(f.id);
              return (
                <motion.article key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }} className={`group min-w-[280px] max-w-[320px] snap-center overflow-hidden rounded-[32px] ${styles.glassCard} transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d9b84f]/40 hover:bg-[#050608]/80 md:min-w-0 md:max-w-none`}>
                  <div role="button" tabIndex={0} onClick={() => handleFlightClick(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlightClick(f.id); } }} className="block cursor-pointer text-left outline-none">
                    <div className="relative h-52 overflow-hidden sm:h-56 lg:h-60">
                      <Image src={f.image} alt={`${f.from} vers ${f.to}`} fill sizes="(max-width: 768px) 100vw, 33vw" quality={100} className="object-cover opacity-[0.85] transition-transform duration-1000 ease-out group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                      <button type="button" aria-label="Favoris" onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }} className={cx("absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:scale-105 cursor-pointer", liked ? "border-[#d9b84f]/60 bg-black/70 text-[#f7e49d]" : "hover:border-[#d9b84f]/50 hover:text-[#d9b84f]")}>
                        <Heart size={16} className={liked ? "fill-current" : ""} />
                      </button>
                      <span className="absolute left-4 top-4 rounded-full border border-[#d9b84f]/40 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.20em] text-[#f2db89] backdrop-blur-md shadow-lg">{f.highlight}</span>
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.20em] text-white/95 backdrop-blur-md flex items-center gap-1.5">
                        <Plane size={10} />
                        {f.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/70">{f.from} <ArrowRight size={10} /> {f.to}</p>
                      <h4 className="mt-2.5 text-[15px] font-light leading-snug text-white/95 sm:text-base">{f.details}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-xs font-medium tracking-wide text-white/40">{f.duration} · {f.maxSeats} places</div>
                    <motion.button type="button" aria-label="Réserver" whileTap={{ scale: 0.95 }} onClick={() => handleFlightClick(f.id)} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-4 pr-1.5 transition-colors hover:bg-white/15 group-hover:border-[#d9b84f]/40 cursor-pointer">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[#d9b84f]">Réserver</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#d9b84f]/20"><ArrowRight size={14} className="text-white group-hover:text-[#d9b84f]" /></div>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <h4 className="mt-12 mb-4 px-2 md:px-0 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d9b84f]">Hélicoptères</h4>
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3 xl:gap-8">
            {flights.filter(f => f.type === "Hélicoptère").map((f, i) => {
              const liked = favorites.includes(f.id);
              return (
                <motion.article key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }} className={`group min-w-[280px] max-w-[320px] snap-center overflow-hidden rounded-[32px] ${styles.glassCard} transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d9b84f]/40 hover:bg-[#050608]/80 md:min-w-0 md:max-w-none`}>
                  <div role="button" tabIndex={0} onClick={() => handleFlightClick(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlightClick(f.id); } }} className="block cursor-pointer text-left outline-none">
                    <div className="relative h-52 overflow-hidden sm:h-56 lg:h-60">
                      <Image src={f.image} alt={`${f.from} vers ${f.to}`} fill sizes="(max-width: 768px) 100vw, 33vw" quality={100} className="object-cover opacity-[0.85] transition-transform duration-1000 ease-out group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
                      <button type="button" aria-label="Favoris" onClick={(e) => { e.stopPropagation(); toggleFav(f.id); }} className={cx("absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:scale-105 cursor-pointer", liked ? "border-[#d9b84f]/60 bg-black/70 text-[#f7e49d]" : "hover:border-[#d9b84f]/50 hover:text-[#d9b84f]")}>
                        <Heart size={16} className={liked ? "fill-current" : ""} />
                      </button>
                      <span className="absolute left-4 top-4 rounded-full border border-[#d9b84f]/40 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.20em] text-[#f2db89] backdrop-blur-md shadow-lg">{f.highlight}</span>
                      <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.20em] text-white/95 backdrop-blur-md flex items-center gap-1.5">
                        <Wind size={10} />
                        {f.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]/70">{f.from} <ArrowRight size={10} /> {f.to}</p>
                      <h4 className="mt-2.5 text-[15px] font-light leading-snug text-white/95 sm:text-base">{f.details}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-xs font-medium tracking-wide text-white/40">{f.duration} · {f.maxSeats} places</div>
                    <motion.button type="button" aria-label="Réserver" whileTap={{ scale: 0.95 }} onClick={() => handleFlightClick(f.id)} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-4 pr-1.5 transition-colors hover:bg-white/15 group-hover:border-[#d9b84f]/40 cursor-pointer">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[#d9b84f]">Réserver</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#d9b84f]/20"><ArrowRight size={14} className="text-white group-hover:text-[#d9b84f]" /></div>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section ref={emptylegsRef} className="mt-12 md:mt-20">
          <motion.div {...fadeUp} className="flex items-end justify-between border-b border-[#d9b84f]/20 pb-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-light tracking-wide text-white">Vols à vide</h3>
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#d9b84f]/80">Tarifs privilégiés • Disponibilité immédiate</p>
            </div>
          </motion.div>
          <div className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-8 lg:grid lg:grid-cols-4 lg:gap-6 lg:pb-0">
            {emptyLegs.map((leg) => (
              <div key={leg.id} className={`min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center rounded-[24px] ${styles.glassCard} p-6 transition hover:border-[#d9b84f]/60 lg:p-8 relative overflow-hidden`}>
                {leg.type === "Hélicoptère" && (
                  <div className="absolute top-0 right-0 bg-[#d9b84f]/10 px-4 py-1.5 rounded-bl-[20px] border-b border-l border-[#d9b84f]/20">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#d9b84f] flex items-center gap-1.5">
                      <Wind size={10} /> Hélicoptère
                    </span>
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#d9b84f]/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#d9b84f]">{leg.date}</span>
                </div>
                <span className="text-[11px] uppercase tracking-widest text-white/40 block mb-2">{leg.jet} · {leg.pax} pax</span>
                <p className="mb-1 text-xl font-bold text-white">{leg.cityFrom}</p>
                <p className="text-xl font-bold text-white"><ArrowRight size={16} className="mr-2 inline text-[#d9b84f]" />{leg.cityTo}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#d9b84f]">Avantage {leg.price}</span>
                  <button onClick={() => startEmptyLegBooking(leg)} className="rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20 cursor-pointer">Saisir l'opportunité</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 flex gap-4 lg:hidden">
          <a href="tel:+33123456789" onClick={() => vibrate(8)} className="flex flex-1 flex-col justify-center rounded-[24px] border border-white/10 bg-[#050608]/50 p-5 backdrop-blur-md transition hover:border-[#d9b84f]/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/20 bg-[#d9b84f]/10 text-[#d9b84f]"><PhoneCall size={18} /></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]">VIP 24H/7J</p>
            <p className="mt-1 text-[13px] font-medium text-white/90">Ligne directe concierge</p>
          </a>
          <button onClick={() => { vibrate(8); setJetCardOpen(true); setPanelOpen(false); }} className="flex flex-1 flex-col justify-center rounded-[24px] border border-white/10 bg-[#050608]/50 p-5 text-left backdrop-blur-md transition hover:border-[#d9b84f]/30 cursor-pointer">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9b84f]/20 bg-[#d9b84f]/10 text-[#d9b84f]"><Crown size={18} /></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b84f]">Jet Card ESIJET</p>
            <p className="mt-1 text-[13px] font-medium text-white/90">Adhésion premium</p>
          </button>
        </section>

        <section ref={privilegeRef} className="mt-24 hidden lg:block">
          <motion.div {...fadeUp} className={`relative overflow-hidden rounded-[40px] border border-[#d9b84f]/30 ${styles.glass} bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)] p-12 lg:p-16`}>
            <Crown size={250} className="pointer-events-none absolute -right-10 -top-10 rotate-12 text-[#d9b84f]/5" />
            <div className="relative z-10 grid grid-cols-[1fr_0.8fr] items-center gap-16">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#d9b84f]"><Crown size={14} /> Programme exclusif</div>
                <h3 className="mb-6 text-4xl font-light text-white md:text-5xl">Jet Card ESIJET</h3>
                <p className="mb-8 text-[15px] leading-relaxed text-white/70">La sérénité d'avoir un jet privé toujours à disposition. Achetez vos heures de vol à l'avance et profitez de tarifs bloqués toute l'année, sans les contraintes de l'affrètement classique.</p>
                <button onClick={() => { vibrate(8); setJetCardOpen(true); setPanelOpen(false); }} className={`rounded-full px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition hover:scale-105 cursor-pointer ${styles.goldGrad}`}>Découvrir le programme</button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { t: "Tarifs garantis", d: "Vos heures de vol sans aucune fluctuation.", i: CreditCard },
                  { t: "Disponibilité 48h", d: "Un appareil prêt à décoller sur simple appel.", i: Timer },
                  { t: "Flotte d'exception", d: "Un accès prioritaire aux jets les plus récents.", i: PlaneTakeoff },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-6 rounded-[24px] border border-[#d9b84f]/15 bg-[#050608]/50 p-6 backdrop-blur-md transition hover:border-[#d9b84f]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><s.i size={20} /></div>
                    <div><p className="text-base font-bold text-white">{s.t}</p><p className="mt-1 text-xs text-white/50">{s.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

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
              <p className="mt-2 text-xs leading-relaxed text-[#d9b84f]/70">Décrivez votre besoin pour une proposition sur mesure.</p>
            </div>
            <FlightSearchForm onValider={startBooking} maxPax={30} mobileStepMode />
          </motion.div>
        </section>

        <section ref={aboutRef} className="mt-12 md:mt-28">
          <motion.div {...fadeUp} className={`rounded-[40px] border border-[#d9b84f]/20 ${styles.glass} p-8 shadow-2xl backdrop-blur-3xl md:p-14 lg:p-20`}>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
              <div className="flex flex-col justify-center">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#d9b84f]">Notre Vision</p>
                <h3 className="text-3xl font-light leading-[1.1] text-white md:text-5xl">L'exigence comme seul standard.</h3>
                <div className="mt-8 space-y-5">
                  <p className="text-[15px] leading-relaxed text-white/60 md:text-[17px]">Chez ESIJET, nous savons qu'un vol privé n'est pas qu'une question de destination. C'est la garantie d'un temps préservé, d'une intimité respectée et d'un service d'une fiabilité irréprochable.</p>
                </div>
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

        <footer className="mt-20 hidden border-t border-[#d9b84f]/20 pb-12 pt-10 md:block">
          <div className="flex items-start justify-between">
            <div className="flex gap-10 text-[11px] font-bold uppercase tracking-[0.30em] text-[#d9b84f]/50"><span>Excellence</span><span>Discrétion</span><span>Élévation</span></div>
            <div className="flex flex-col items-end gap-5">
              <div className="flex gap-8 text-[10px] uppercase tracking-[0.25em] text-white/30"><a href="#" className="transition hover:text-[#d9b84f]">Mentions légales</a><a href="#" className="transition hover:text-[#d9b84f]">Confidentialité</a></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/15">© 2026 ESIJET. Luxe Privé.</p>
            </div>
          </div>
        </footer>

        <footer className="mt-14 flex justify-center border-t border-[#d9b84f]/20 pb-32 pt-8 md:hidden">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#d9b84f]/50">© 2026 ESIJET.</p>
        </footer>
      </div>

      <div className="fixed bottom-10 right-10 z-40 hidden lg:block">
        <a href="tel:+33123456789" aria-label="Appeler la ligne VIP" className="group flex h-16 items-center gap-4 rounded-full border border-[#d9b84f]/30 bg-[#000000]/90 pl-2.5 pr-7 shadow-[0_15px_50px_rgba(217,184,79,0.15)] backdrop-blur-2xl transition-all hover:scale-105 hover:border-[#d9b84f]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9b84f] text-black shadow-inner">
            <PhoneCall size={20} fill="currentColor" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#d9b84f] transition-colors">Ligne VIP</span>
        </a>
      </div>

      {renderModal(emptyLegDrawerOpen, setEmptyLegDrawerOpen, "Vol à vide", "Réservation", emptyLegContent)}
      {renderModal(jetCardOpen, setJetCardOpen, "Jet Card", "Abonnement", jetCardContent)}
      {renderModal(uberDrawerOpen, handleUberDrawerChange, "Sélection", "Choix du jet", bookingContent)}
      {renderModal(vipDashboardOpen, setVipDashboardOpen, "Espace VIP", "Tableau de bord", vipDashboardContent)}

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} />
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 260 }} onDragEnd={handleDrawerDragEnd} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.35 }} className="fixed inset-x-0 bottom-0 top-[64px] z-[60] flex flex-col rounded-t-[36px] border-t border-[#d9b84f]/20 bg-[#050608]/98 px-5 pb-6 pt-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden">
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
              <div className="mb-5 flex items-center gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {M_TABS.map((tab) => (
                  <button key={tab} onClick={() => { vibrate(8); setMenuTab(tab); }} className={cx("cursor-pointer whitespace-nowrap border-b-2 pb-2 text-[14px] font-medium transition-all", menuTab === tab ? "border-[#d9b84f] text-[#d9b84f]" : "border-transparent text-white/40 hover:text-white/70")}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto pb-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {menuTab === "Recherche" && (
                  <div className="mt-2 rounded-[28px] border border-[#d9b84f]/20 bg-white/[0.03] p-5">
                    <FlightSearchForm onValider={startBooking} maxPax={30} mobileStepMode />
                  </div>
                )}
                {menuTab === "Transferts" && (
                  <div className="mt-2 flex flex-col gap-6">
                    <div>
                      <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">Jets Privés</h4>
                      <div className="flex flex-col gap-4">
                        {flights.filter(f => f.type === "Jet privé").map((f) => (
                          <div key={f.id} onClick={() => { vibrate(8); setPanelOpen(false); setSelectedFlight(f.id); setSelectedVehicle(f.vehicles[0].id); setDetailedVehicle(f.vehicles[0].id); setPhotoIndex(0); startBooking({ dep: getPredefinedAirport(f.from), arr: getPredefinedAirport(f.to), pax: 1, date: "", tripType: "simple", passengers: [{ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "", email: "", phone: "", company: "" }], isLocked: true, isCustomRoute: false }, f.id); }} className="group relative flex h-40 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[24px] border border-white/10 transition hover:border-[#d9b84f]/40">
                            <Image src={f.vehicles[0].images[0]} alt={f.vehicles[0].name} fill className="object-cover opacity-50 transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-10 p-5">
                              <h4 className="text-lg font-bold text-white">{f.from} ➔ {f.to}</h4>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#d9b84f]">{getEstimatedPrice(null, null, f.vehicles[0], "simple", f.origin, f.dest)}</p>
                              <div className="mt-2 flex gap-3 text-[11px] font-medium text-white/70">
                                <span className="flex items-center gap-1.5"><Plane size={10} className="text-[#d9b84f]" />{f.type}</span>
                                <span>•</span>
                                <span>{f.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">Hélicoptères</h4>
                      <div className="flex flex-col gap-4">
                        {flights.filter(f => f.type === "Hélicoptère").map((f) => (
                          <div key={f.id} onClick={() => { vibrate(8); setPanelOpen(false); setSelectedFlight(f.id); setSelectedVehicle(f.vehicles[0].id); setDetailedVehicle(f.vehicles[0].id); setPhotoIndex(0); startBooking({ dep: getPredefinedAirport(f.from), arr: getPredefinedAirport(f.to), pax: 1, date: "", tripType: "simple", passengers: [{ civility: "M.", firstName: "", lastName: "", nationality: "", dob: "", passport: "", weight: "", email: "", phone: "", company: "" }], isLocked: true, isCustomRoute: false }, f.id); }} className="group relative flex h-40 w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[24px] border border-white/10 transition hover:border-[#d9b84f]/40">
                            <Image src={f.vehicles[0].images[0]} alt={f.vehicles[0].name} fill className="object-cover opacity-50 transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="relative z-10 p-5">
                              <h4 className="text-lg font-bold text-white">{f.from} ➔ {f.to}</h4>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#d9b84f]">{getEstimatedPrice(null, null, f.vehicles[0], "simple", f.origin, f.dest)}</p>
                              <div className="mt-2 flex gap-3 text-[11px] font-medium text-white/70">
                                <span className="flex items-center gap-1.5"><Wind size={10} className="text-[#d9b84f]" />{f.type}</span>
                                <span>•</span>
                                <span>{f.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {menuTab === "Vols à vide" && (
                  <div className="mt-2 flex flex-col gap-4">
                    {emptyLegs.map((leg) => (
                      <div key={leg.id} className="rounded-[24px] border border-[#d9b84f]/30 bg-[#050608] p-5 shadow-[0_0_15px_rgba(217,184,79,0.05)] relative overflow-hidden">
                        {leg.type === "Hélicoptère" && (
                          <div className="absolute top-0 right-0 bg-[#d9b84f]/10 px-4 py-1.5 rounded-bl-[20px] border-b border-l border-[#d9b84f]/20">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#d9b84f] flex items-center gap-1.5">
                              <Wind size={10} /> Hélicoptère
                            </span>
                          </div>
                        )}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full bg-[#d9b84f]/20 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#d9b84f]">{leg.date}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">{leg.jet} · {leg.pax} pax</span>
                        <p className="mb-1 text-lg font-bold text-white">{leg.cityFrom}</p>
                        <p className="text-lg font-bold text-white"><ArrowRight size={14} className="mr-1.5 inline text-[#d9b84f]" />{leg.cityTo}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d9b84f]">Avantage {leg.price}</span>
                          <button onClick={() => { vibrate(8); startEmptyLegBooking(leg); }} className="cursor-pointer rounded-full border border-[#d9b84f]/30 bg-[#d9b84f]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#d9b84f] transition hover:bg-[#d9b84f]/20">Réserver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {menuTab === "Privilège" && (
                  <div className="mt-2 space-y-4">
                    <div className={`relative overflow-hidden rounded-[32px] border border-[#d9b84f]/30 ${styles.glassCard} bg-[radial-gradient(ellipse_at_top_right,rgba(217,184,79,0.15),transparent_50%)] p-6 text-center flex flex-col justify-center`}>
                      <Crown size={32} className="relative z-10 mx-auto mb-4 text-[#d9b84f]" />
                      <h3 className="relative z-10 mb-2 text-2xl font-light text-white">Jet Card ESIJET</h3>
                      <p className="relative z-10 mb-6 text-sm leading-relaxed text-white/60">La sérénité d'avoir un jet privé toujours à disposition. Achetez vos heures de vol à l'avance et profitez de tarifs bloqués toute l'année, sans les contraintes de l'affrètement classique.</p>
                      <div className="relative z-10 flex flex-col gap-3 text-left mb-6">
                        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><CreditCard size={18} /></div>
                          <div><p className="text-sm font-bold text-white">Tarifs garantis</p><p className="text-xs text-white/50">Aucune fluctuation à l'année</p></div>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><Timer size={18} /></div>
                          <div><p className="text-sm font-bold text-white">Disponibilité 48h</p><p className="text-xs text-white/50">Un appareil prêt à décoller</p></div>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9b84f]/10 text-[#d9b84f]"><PlaneTakeoff size={18} /></div>
                          <div><p className="text-sm font-bold text-white">Flotte d'exception</p><p className="text-xs text-white/50">Accès prioritaire aux jets</p></div>
                        </div>
                      </div>
                      <button onClick={() => { vibrate(8); setJetCardOpen(true); setPanelOpen(false); }} className={`cursor-pointer relative z-10 w-full rounded-full py-4 text-[13px] font-bold uppercase tracking-widest text-black ${styles.goldGrad}`}>Devenir Membre</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-[320px] -translate-x-1/2 rounded-full border border-[#d9b84f]/25 bg-[#050608]/80 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl lg:hidden">
        <div className="mx-auto flex items-center justify-around px-4 py-3">
          {bottomNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                vibrate(8);
                setActiveTab(item.id);
                if (item.id === "explorer") window.scrollTo({ top: 0, behavior: "smooth" });
                if (item.id === "voyages") goTo("experiences");
                if (item.id === "client") goTo("about");
              }}
              className="cursor-pointer flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
            >
              <item.icon size={20} className={activeTab === item.id ? "text-[#e9d57c]" : "text-white/40"} />
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${activeTab === item.id ? "text-[#e9d57c]" : "text-white/30"}`}>
                {translations[lang as keyof typeof translations][item.label as keyof typeof translations['fr']]}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}