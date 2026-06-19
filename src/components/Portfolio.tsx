import Reveal from "./Reveal";

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

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative bg-bg-soft py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <span className="kicker">Portfólio</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Resultados <span className="text-gradient">reais</span>.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Capturas aéreas reais de projetos em diferentes segmentos.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {shots.map((s, i) => (
            <Reveal
              key={s.src}
              delay={(i % 4) * 0.06}
              className={`${s.span} group relative overflow-hidden rounded-xl border border-white/10`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={`${s.t} — captação aérea AERISX`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-xs font-medium uppercase tracking-[0.15em] text-white drop-shadow">
                {s.t}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
