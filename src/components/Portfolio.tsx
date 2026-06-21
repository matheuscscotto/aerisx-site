"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import { IconArrow } from "./icons";

const shots = [
  { src: "/portfolio/imobiliario.jpg", t: "Mercado Imobiliário", span: "lg:col-span-2" },
  { src: "/portfolio/construcao.jpg", t: "Construção Civil", span: "" },
  { src: "/portfolio/agronegocio.jpg", t: "Agronegócio", span: "" },
  { src: "/portfolio/infraestrutura.jpg", t: "Infraestrutura", span: "lg:col-span-2" },
  { src: "/portfolio/industria.jpg", t: "Áreas Industriais", span: "" },
  { src: "/portfolio/urbano.jpg", t: "Áreas Urbanas", span: "" },
  { src: "/portfolio/construcao-2.jpg", t: "Monitoramento de Obras", span: "" },
  { src: "/portfolio/imobiliario-2.jpg", t: "Empreendimentos", span: "" },
];

function IconClose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconExpand({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export default function Portfolio() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (dir: number) =>
      setIndex((i) => (i === null ? i : (i + dir + shots.length) % shots.length)),
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  const current = index === null ? null : shots[index];

  return (
    <section id="portfolio" className="relative bg-bg-soft py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <span className="kicker">Portfólio</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Resultados <span className="text-gradient">reais</span>.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Capturas aéreas reais de projetos em diferentes segmentos. Clique para
            ampliar.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {shots.map((s, i) => (
            <Reveal
              key={s.src}
              delay={(i % 4) * 0.06}
              className={s.span}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ampliar imagem: ${s.t}`}
                className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={`${s.t} — captação aérea AERISX`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-bg/40 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <IconExpand className="h-4 w-4" />
                </span>
                <span className="pointer-events-none absolute bottom-3 left-4 text-xs font-medium uppercase tracking-[0.15em] text-white drop-shadow">
                  {s.t}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {open && current && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-md sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`Imagem ampliada: ${current.t}`}
          >
            {/* close */}
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              autoFocus
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-bg/50 text-fg transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <IconClose className="h-5 w-5" />
            </button>

            {/* prev */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-bg/50 text-fg transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-6"
            >
              <IconArrow className="h-5 w-5 rotate-180" />
            </button>

            {/* next */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-bg/50 text-fg transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-6"
            >
              <IconArrow className="h-5 w-5" />
            </button>

            {/* image frame */}
            <motion.figure
              key={current.src}
              className="relative max-h-full w-full max-w-5xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={`${current.t} — captação aérea AERISX`}
                className="mx-auto max-h-[78vh] w-auto rounded-xl border border-white/10 object-contain shadow-2xl"
              />
              <figcaption className="mt-4 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted">
                {current.t}
                <span className="ml-3 text-white/30">
                  {(index ?? 0) + 1} / {shots.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
