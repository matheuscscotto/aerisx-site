import Reveal from "./Reveal";
import {
  IconCamera,
  IconVideo,
  IconCrane,
  IconSun,
  IconMap,
  IconMegaphone,
  IconDoc,
  IconStar,
} from "./icons";

const servicos = [
  { icon: IconCamera, t: "Fotografia aérea profissional", d: "Imagens em alta resolução de qualquer ângulo." },
  { icon: IconVideo, t: "Filmagens aéreas em 4K", d: "Vídeos cinematográficos de alto impacto." },
  { icon: IconCrane, t: "Monitoramento de obras", d: "Acompanhamento periódico da evolução do canteiro." },
  { icon: IconSun, t: "Registro de usinas solares", d: "Documentação visual de parques fotovoltaicos." },
  { icon: IconMap, t: "Mapeamento visual de áreas", d: "Visão completa de terrenos e propriedades." },
  { icon: IconMegaphone, t: "Conteúdo para marketing e vendas", d: "Material que valoriza a marca e converte." },
  { icon: IconDoc, t: "Documentação de empreendimentos", d: "Registros precisos para investidores." },
  { icon: IconStar, t: "Produção de vídeos institucionais", d: "Produção audiovisual corporativa completa." },
];

export default function Servicos() {
  return (
    <section id="servicos" className="relative bg-bg-soft py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <span className="kicker">Nossos serviços</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            O que <span className="text-gradient">entregamos</span>.
          </h2>
          <p className="mt-5 text-lg text-muted">
            Soluções completas de captação aérea, do registro técnico ao conteúdo
            de marketing.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicos.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.t} delay={(i % 4) * 0.08}>
                <div className="group h-full rounded-2xl border border-white/10 bg-panel/50 p-6 transition-colors hover:border-accent/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
