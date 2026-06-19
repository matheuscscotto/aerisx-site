import Reveal from "./Reveal";
import {
  IconBuilding,
  IconSun,
  IconLeaf,
  IconHouse,
  IconFactory,
  IconVideo,
} from "./icons";

const segmentos = [
  { icon: IconBuilding, t: "Construção Civil", d: "Acompanhamento de obras e registro da evolução do canteiro." },
  { icon: IconSun, t: "Energia Solar", d: "Registro e inspeção visual de usinas fotovoltaicas." },
  { icon: IconLeaf, t: "Agronegócio", d: "Mapeamento visual de áreas, lavouras e propriedades rurais." },
  { icon: IconHouse, t: "Mercado Imobiliário", d: "Conteúdo aéreo que valoriza imóveis e lançamentos." },
  { icon: IconFactory, t: "Áreas Industriais", d: "Visão completa de plantas, pátios e complexos industriais." },
  { icon: IconVideo, t: "Audiovisual Corporativo", d: "Produção de vídeos institucionais e conteúdo de marca." },
];

export default function Segmentos() {
  return (
    <section id="segmentos" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="container-x relative">
        <Reveal className="max-w-2xl">
          <span className="kicker">Segmentos atendidos</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Onde a AERISX <span className="text-gradient">atua</span>.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segmentos.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.t} delay={(i % 3) * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-panel to-bg-soft p-7 transition-colors hover:border-accent/50">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
