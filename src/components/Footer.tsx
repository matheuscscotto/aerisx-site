import Image from "next/image";
import { navLinks, site, whatsappUrl } from "@/lib/site";
import { IconInstagram, IconMail, IconPhone, IconWhatsapp } from "./icons";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-bg-soft">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/logo.png" alt="AERISX" width={170} height={29} className="h-7 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            Captação aérea profissional com drones de última geração. Uma nova
            perspectiva para o seu negócio.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Navegação
          </h4>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-fg/80 hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Contato
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-fg/80 hover:text-accent">
                <IconWhatsapp className="h-4 w-4 text-accent" /> {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-fg/80 hover:text-accent">
                <IconMail className="h-4 w-4 text-accent" /> {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-fg/80 hover:text-accent">
                <IconInstagram className="h-4 w-4 text-accent" /> {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} AERISX. Todos os direitos reservados.</span>
          <span>Captação aérea profissional · {site.domain}</span>
        </div>
      </div>
    </footer>
  );
}
