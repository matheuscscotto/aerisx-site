"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import {
  IconVideo,
  IconDrone,
  IconBuilding,
  IconSliders,
} from "./icons";

type Metric = {
  icon: React.ComponentType<{ className?: string }>;
  to: number;
  suffix: string;
  label: string;
};

const metrics: Metric[] = [
  { icon: IconVideo, to: 4, suffix: "K", label: "Resolução Ultra HD" },
  { icon: IconDrone, to: 360, suffix: "°", label: "Cobertura aérea da área" },
  { icon: IconBuilding, to: 6, suffix: "", label: "Segmentos atendidos" },
  { icon: IconSliders, to: 100, suffix: "%", label: "Conteúdo sob medida" },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export default function Numeros() {
  return (
    <section id="numeros" className="relative overflow-hidden py-24 sm:py-32">
      {/* ambient background */}
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,198,230,0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="kicker justify-center">AERISX em números</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Resultados que falam por{" "}
            <span className="text-gradient">si</span>.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Tecnologia, precisão e padrão profissional em cada captação — do
            briefing à entrega.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.label} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-panel/60 p-7 text-center backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-panel/80">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent/15">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-6 text-5xl font-extrabold tracking-tight text-gradient sm:text-6xl">
                    <CountUp to={m.to} suffix={m.suffix} />
                  </div>
                  <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
                    {m.label}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
