import Reveal from "./Reveal";

const stats = [
  { v: "4K", l: "Resolução de captação" },
  { v: "6", l: "Segmentos atendidos" },
  { v: "360°", l: "Cobertura da área" },
];

export default function QuemSomos() {
  return (
    <section id="quem-somos" className="relative py-24 sm:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <span className="kicker">Quem somos</span>
          <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Especialistas em captação aérea{" "}
            <span className="text-gradient">profissional</span>.
          </h2>
          <p className="mt-7 text-lg leading-relaxed text-muted">
            A AERISX fornece imagens, vídeos e documentação visual para empresas,
            investidores e empreendimentos. Utilizando tecnologia de drones de
            última geração, transformamos perspectivas aéreas em informações
            estratégicas, conteúdo de alto impacto e registros precisos para a
            tomada de decisão.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Nascemos com um propósito: entregar mais do que imagens — uma nova
            perspectiva para negócios, projetos e investimentos.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-panel/60 p-6 text-center"
              >
                <div className="text-4xl font-extrabold tracking-tight text-gradient">
                  {s.v}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wide text-muted">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portfolio/imobiliario.jpg"
              alt="Vista aérea de empreendimento captada pela AERISX"
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
