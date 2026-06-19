import Reveal from "./Reveal";
import { IconStar, IconSearch, IconTarget, IconBolt, IconSliders } from "./icons";

const diffs = [
  { icon: IconStar, t: "Tecnologia de ponta", d: "Equipamentos de última geração para resultados superiores." },
  { icon: IconSearch, t: "Alta resolução", d: "Imagens nítidas que revelam cada detalhe do projeto." },
  { icon: IconTarget, t: "Visão estratégica", d: "Conteúdo que apoia decisões de negócio e investimento." },
  { icon: IconBolt, t: "Agilidade na entrega", d: "Captação e processamento rápidos, sem perder qualidade." },
  { icon: IconSliders, t: "Conteúdo sob medida", d: "Soluções personalizadas para cada segmento e objetivo." },
];

export default function Diferenciais() {
  return (
    <section id="diferenciais" className="relative py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portfolio/infraestrutura.jpg"
              alt="Captação aérea de infraestrutura pela AERISX"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[3/4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="kicker">Por que a AERISX</span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Diferenciais que <span className="text-gradient">elevam</span>.
            </h2>
          </Reveal>

          <div className="mt-10 space-y-2">
            {diffs.map((d, i) => {
              const Icon = d.icon;
              return (
                <Reveal key={d.t} delay={i * 0.06}>
                  <div className="flex items-start gap-4 border-b border-white/10 py-5">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{d.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{d.d}</p>
                    </div>
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
