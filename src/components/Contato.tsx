import Reveal from "./Reveal";
import { site, whatsappUrl } from "@/lib/site";
import { IconWhatsapp, IconMail, IconInstagram, IconArrow } from "./icons";

const channels = [
  { icon: IconWhatsapp, label: "WhatsApp", value: site.phoneDisplay, href: whatsappUrl },
  { icon: IconMail, label: "E-mail", value: site.email, href: `mailto:${site.email}` },
  { icon: IconInstagram, label: "Instagram", value: site.instagramHandle, href: site.instagram },
];

export default function Contato() {
  return (
    <section id="contato" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="kicker justify-center">Contato</span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Vamos elevar o seu <span className="text-gradient">projeto</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Fale com a AERISX e leve a sua marca, obra ou empreendimento a uma
            nova perspectiva. Atendemos todos os segmentos com agilidade.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-semibold text-bg transition-transform hover:scale-[1.03] glow-accent"
          >
            Solicitar orçamento no WhatsApp <IconArrow className="h-4 w-4" />
          </a>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {channels.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.label} delay={i * 0.08}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-panel/50 p-7 text-center transition-colors hover:border-accent/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">
                    {c.label}
                  </div>
                  <div className="font-semibold text-fg group-hover:text-accent">
                    {c.value}
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
