import Reveal from "./Reveal";

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
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portfolio/imobiliario.jpg"
              alt="Vista aérea de empreendimento captada pela AERISX"
              className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-bg/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Captação real AERISX
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
