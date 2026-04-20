"use client";

import Image from "next/image";
import {
  Search,
  Ticket,
  User,
  Menu,
  Heart,
  Settings2,
  ArrowRight,
  X,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const experiences = [
  {
    id: 1,
    to: "Dubaï",
    from: "Paris",
    price: "1 €",
    type: "Jet Privé",
    details: "8 passagers · Vol en Frais partagé",
    highlight: true,
  },
  {
    id: 2,
    to: "Genève",
    from: "Lognes",
    price: "2 €",
    type: "Jet Privé",
    details: "4 passagers · Vol en Frais partagé",
  },
  {
    id: 3,
    to: "Marseille",
    from: "Nice",
    price: "6 €",
    type: "Jet Privé",
    details: "6 passagers · Vol en Frais partagé",
  },
];

export default function Home() {
  const [active, setActive] = useState("explorer");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const devisSectionRef = useRef<HTMLDivElement | null>(null);

  const goldGradient =
    "bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)]";

  const goldText =
    "text-transparent bg-clip-text bg-[linear-gradient(135deg,#d9b84f_0%,#f7ecb2_50%,#cfa131_100%)]";

  const glass =
    "border border-white/14 bg-white/[0.08] backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.30)]";

  const inputClass =
    "w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-xl transition focus:border-[#d9b84f]/60 focus:bg-white/[0.10]";

  const scrollToDevis = () => {
    if (devisSectionRef.current) {
      devisSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setDrawerOpen(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#050505] text-white antialiased">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/jet.jpg"
          alt="ESIJET Private Jet"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/88 via-black/60 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,184,79,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(247,236,178,0.08),transparent_30%)]" />
      </div>

      {/* PAGE CONTAINER */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 lg:pb-16">
        {/* HEADER */}
        <header className="flex items-center justify-between py-2 sm:py-4 lg:py-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className={`text-xl font-bold tracking-[0.30em] sm:text-2xl ${goldText}`}
            >
              ESIJET
            </h1>
          </motion.div>

          {/* DESKTOP NAV */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="hidden items-center gap-6 md:flex"
          >
            <a
              href="#"
              className="text-xs text-white/70 transition hover:text-white sm:text-sm"
            >
              Accueil
            </a>
            <a
              href="#experiences"
              className="text-xs text-white/70 transition hover:text-white sm:text-sm"
            >
              Expériences
            </a>
            <a
              href="#devis"
              className="text-xs text-white/70 transition hover:text-white sm:text-sm"
            >
              Devis
            </a>
            <a
              href="#"
              className="text-xs text-white/70 transition hover:text-white sm:text-sm"
            >
              À propos
            </a>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={scrollToDevis}
              className={`hidden rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black sm:inline-flex ${goldGradient}`}
            >
              Demander un devis
            </motion.button>
          </motion.nav>

          {/* MOBILE MENU BUTTON */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md md:hidden"
          >
            <Menu size={18} className="text-[#f2dc88]" />
          </motion.button>
        </header>

        {/* HERO DESKTOP / TABLET ONLY */}
        <section className="mt-4 hidden min-h-[72vh] items-center gap-10 md:mt-6 md:grid md:grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 xl:min-h-[78vh]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-3xl xl:max-w-4xl"
          >
            <h2 className="mt-3 max-w-4xl text-[34px] font-light leading-[0.98] tracking-tight sm:text-5xl md:text-[52px] lg:text-[64px] xl:text-[78px]">
              Le ciel aura une
              <br />
              <span className="mt-1 block text-[34px] font-normal tracking-tight text-white/90 sm:text-[44px] md:text-[54px] lg:text-[68px] xl:text-[82px]">
                nouvelle signature.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl border-l border-white/10 pl-4 text-[14px] leading-relaxed text-white/65 sm:text-[15px] md:text-base lg:max-w-xl xl:max-w-2xl">
              Une expérience aérienne exclusive pensée pour ceux qui exigent
              l’exceptionnel, la discrétion et une exécution sans compromis.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.015 }}
                onClick={scrollToDevis}
                className={`rounded-full px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black ${goldGradient}`}
              >
                Demander un devis
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.015 }}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition hover:bg-white/10"
              >
                Découvrir
              </motion.button>
            </div>
          </motion.div>

          {/* FORM DESKTOP */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className={`hidden w-full max-w-[520px] justify-self-end rounded-[32px] p-6 md:block lg:p-7 ${glass}`}
          >
            <div className="mb-5">
              <h3 className="text-lg font-light">Demande de devis</h3>
              <p className="mt-2 text-xs text-white/45 sm:text-sm">
                Départ, destination, date souhaitée et nombre de passagers.
              </p>
            </div>

            <div className="space-y-3">
              <input type="text" placeholder="Départ" className={inputClass} />
              <input
                type="text"
                placeholder="Destination"
                className={inputClass}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Date souhaitée"
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Passagers"
                  className={inputClass}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.985 }}
                whileHover={{ scale: 1.01 }}
                className={`mt-1 w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-[0.18em] text-black ${goldGradient}`}
              >
                Envoyer la demande
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* SEARCH BAR */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.08 }}
          className="mt-3 md:mt-2 lg:-mt-6 xl:-mt-10"
        >
          <div
            className={`flex flex-col items-start gap-4 rounded-[26px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:max-w-2xl lg:max-w-[640px] ${glass} border-[#ebd57e]/20`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebd57e]/12">
                <Search size={18} className="text-[#f4e08f]" />
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.24em] text-white/35">
                  Destination
                </span>
                <span className="text-sm font-light text-white/90">
                  N&apos;importe où · Quand vous voulez
                </span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label="Ouvrir les filtres"
              className="flex h-9 w-9 items-center justify-center self-end rounded-full bg-white/5 transition hover:bg-white/10 sm:self-auto"
            >
              <Settings2 size={16} className="text-[#f4e08f]" />
            </motion.button>
          </div>
        </motion.section>

        {/* EXPERIENCES */}
        <motion.section
          id="experiences"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mt-12 md:mt-16"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-light tracking-wide sm:text-xl lg:text-2xl">
                Sélection de vols
              </h3>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/35">
                Vols et transferts premium
              </p>
            </div>

            <button
              className={`self-start text-[11px] font-bold tracking-[0.18em] sm:self-auto ${goldText}`}
            >
              VOIR TOUT
            </button>
          </div>

          <div className="mt-6 flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 xl:grid-cols-3 xl:gap-7">
            {experiences.map((exp, index) => {
              const isFav = favorites.includes(exp.id);

              return (
                <motion.article
                  key={exp.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                  className="min-w-[240px] max-w-[280px] overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.10] backdrop-blur-2xl shadow-[0_20px_55px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:bg-white/[0.12] md:min-w-0 md:max-w-none"
                >
                  <div className="relative h-44 sm:h-48 lg:h-56">
                    <Image
                      src="/jet.jpg"
                      alt={`${exp.type} vers ${exp.to}`}
                      fill
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/25 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => toggleFavorite(exp.id)}
                      aria-label="Ajouter aux favoris"
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/35 backdrop-blur-xl transition ${
                        isFav
                          ? "border-[#d9b84f]/60 bg-black/60 text-[#f7e49d]"
                          : "hover:border-[#d9b84f]/40 hover:text-[#d9b84f]"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={isFav ? "fill-current" : "fill-none"}
                      />
                    </motion.button>

                    {exp.highlight && (
                      <span className="absolute left-3 top-3 rounded-full border border-[#d9b84f]/40 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.20em] text-[#f2db89] backdrop-blur-md">
                        Vol mis en avant
                      </span>
                    )}

                    <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.20em] text-[#e5c96d] backdrop-blur-md">
                      {exp.type}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                      {exp.from} → {exp.to}
                    </p>

                    <h4 className="mt-2 text-[15px] font-light leading-snug text-white/92 sm:text-base">
                      {exp.details}
                    </h4>

                    <div className="mt-5 flex items-center justify-between">
                      <span className={`text-lg font-medium ${goldText}`}>
                        {exp.price}
                      </span>

                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.05 }}
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10"
                      >
                        <ArrowRight size={16} className="text-white/45" />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        {/* MOBILE FORM */}
        <motion.section
          id="devis"
          ref={devisSectionRef}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-12 md:hidden"
        >
          <div className={`rounded-[28px] p-5 ${glass}`}>
            <div className="mb-5">
              <h3 className="text-lg font-light">Demande de devis</h3>
              <p className="mt-1 text-sm text-white/45">
                Décrivez votre besoin, nous revenons vers vous rapidement.
              </p>
            </div>

            <div className="space-y-3">
              <input type="text" placeholder="Départ" className={inputClass} />
              <input
                type="text"
                placeholder="Destination"
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Date souhaitée"
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Nombre de passagers"
                className={inputClass}
              />
              <textarea
                placeholder="Précisions (horaires, préférences, etc.)"
                className="mt-1 h-24 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-xl transition focus:border-[#d9b84f]/60 focus:bg-white/[0.10]"
              />
              <motion.button
                whileTap={{ scale: 0.985 }}
                whileHover={{ scale: 1.01 }}
                className={`mt-2 w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-[0.18em] text-black ${goldGradient}`}
              >
                Envoyer la demande
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-white/5 pt-8 lg:mt-20">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-light uppercase tracking-[0.35em] text-white/35">
            <span>Excellence</span>
            <span>Discrétion</span>
            <span>Élévation</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-white/25">
            <a href="#" className="transition hover:text-white/60">
              Conditions générales
            </a>
            <a href="#" className="transition hover:text-white/60">
              Mentions légales
            </a>
            <a href="#" className="transition hover:text-white/60">
              Confidentialité
            </a>
          </div>

          <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/25">
            © 2026 ESIJET
          </p>
        </footer>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-x-0 bottom-0 top-0 z-[60] flex flex-col rounded-t-[28px] border-t border-white/10 bg-[#090909]/95 px-5 pb-8 pt-3 backdrop-blur-3xl md:hidden"
            >
              <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/15" />

              <div className="flex items-center justify-between">
                <h2
                  className={`text-lg font-bold tracking-[0.24em] ${goldText}`}
                >
                  ESIJET
                </h2>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5"
                >
                  <X size={18} className="text-white/75" />
                </motion.button>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {["Accueil", "Expériences", "Devis", "À propos"].map((tab) => (
                  <button
                    key={tab}
                    className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white/80"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex-1">
                <nav className="space-y-1">
                  {[
                    {
                      label: "Accueil",
                      href: "#",
                      action: () => setDrawerOpen(false),
                    },
                    {
                      label: "Expériences",
                      href: "#experiences",
                      action: () => setDrawerOpen(false),
                    },
                    {
                      label: "Demande de devis",
                      href: "#devis",
                      action: scrollToDevis,
                    },
                    {
                      label: "À propos",
                      href: "#",
                      action: () => setDrawerOpen(false),
                    },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={item.action}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-left text-base text-white/90 transition active:scale-[0.99]"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={18} className="text-white/35" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                  Excellence · Discrétion · Élévation
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV MOBILE */}
      <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-white/10 bg-black/60 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
          {[
            { id: "explorer", icon: Search, label: "Explorer" },
            { id: "voyages", icon: Ticket, label: "Voyages" },
            { id: "client", icon: User, label: "Client" },
            { id: "menu", icon: Menu, label: "Menu" },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                if (item.id === "menu") {
                  setDrawerOpen(true);
                } else {
                  setActive(item.id);
                }
              }}
              className="flex flex-col items-center gap-1.5 transition"
            >
              <item.icon
                size={20}
                className={
                  active === item.id ? "text-[#e9d57c]" : "text-white/38"
                }
              />
              <span
                className={`text-[9px] font-medium uppercase tracking-[0.16em] ${
                  active === item.id ? "text-[#e9d57c]" : "text-white/35"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </nav>
    </main>
  );
}