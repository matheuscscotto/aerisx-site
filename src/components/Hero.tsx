"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { whatsappUrl } from "@/lib/site";
import { IconArrow } from "./icons";

const trust = ["Imagens & vídeos 4K", "Voo profissional", "Entrega ágil"];

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1.25]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      {/* background video (parallax) */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y, scale }}
      >
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/hero_poster.jpg"
          preload="metadata"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* overlays */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/45 to-bg"
        style={reduce ? undefined : { opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />

      <div className="container-x relative z-10 flex h-full flex-col justify-center">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="kicker">Captação aérea profissional</span>
        </motion.div>

        <motion.h1
          className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Uma nova perspectiva
          <br />
          para o seu <span className="text-gradient">negócio</span>.
        </motion.h1>

        <motion.p
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          Imagens, vídeos e documentação visual de alto impacto com drones de
          última geração — para empresas, investidores e empreendimentos.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-bg transition-transform hover:scale-[1.03] glow-accent"
          >
            Solicitar orçamento <IconArrow className="h-4 w-4" />
          </a>
          <a
            href="#portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-semibold text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Ver portfólio
          </a>
        </motion.div>

        {/* trust strip */}
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {trust.map((item, i) => (
            <span key={item} className="flex items-center gap-5">
              {i > 0 && <span className="h-4 w-px bg-white/15" aria-hidden />}
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                {item}
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <motion.span
            className="block h-1.5 w-1 rounded-full bg-accent"
            animate={reduce ? {} : { y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
