import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "AERISX — Captação Aérea Profissional com Drones",
    template: "%s | AERISX",
  },
  description: site.description,
  keywords: [
    "captação aérea",
    "filmagem com drone",
    "fotografia aérea",
    "drone profissional",
    "imagens aéreas 4K",
    "monitoramento de obras",
    "mapeamento aéreo",
    "AERISX",
  ],
  authors: [{ name: "AERISX" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: "AERISX — Captação Aérea Profissional com Drones",
    description: site.description,
    images: [{ url: "/og.jpg", width: 1280, height: 720, alt: "AERISX — Captação aérea profissional" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AERISX — Captação Aérea Profissional",
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "AERISX",
  description: site.description,
  url: site.url,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/logo.png`,
  telephone: `+${site.phoneIntl}`,
  email: site.email,
  areaServed: "BR",
  sameAs: [site.instagram],
  knowsAbout: [
    "Construção Civil",
    "Energia Solar",
    "Agronegócio",
    "Mercado Imobiliário",
    "Áreas Industriais",
    "Produção Audiovisual",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} antialiased`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="metricool-tracker" strategy="afterInteractive">
          {`function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"ccfdd4473b2c0b4083ad5326b7114400"})});`}
        </Script>
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
