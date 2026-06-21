import Reveal from "./Reveal";
import { IconDoc, IconDrone, IconSliders, IconBolt } from "./icons";

const steps = [
  {
    icon: IconDoc,
    t: "Briefing & planejamento",
    d: "Entendemos o objetivo, a área e as autorizações de voo necessárias.",
  },
  {
    icon: IconDrone,
    t: "Voo & captação",
    d: "Captação em campo com drones de última geração, em 4K.",
  },
  {
    icon: IconSliders,
    t: "Pós-produção",
    d: "Seleção, edição, tratamento de cor e finalização do material.",
  },
  {
    icon: IconBolt,
    t: "Entrega",
    d: "Material final entregue pronto para uso, com agilidade.",
  },
];

export default function Processo() {
  return (
    <section id="processo" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <span className="kicker">Como funciona</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Do briefing à <span className="text-gradient">entrega</span>.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Um processo claro e profissional em quatro etapas — sem surpresas, do
            primeiro contato ao material pronto.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* connecting line (desktop) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block"
            aria-hidden
          />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.t} delay={i * 0.1}>
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="relative z-10 flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-accent/30 bg-bg text-accent glow-accent">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-bold tracking-[0.25em] text-muted">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold">{s.t}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {s.d}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
