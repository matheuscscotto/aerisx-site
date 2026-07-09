import type { Metadata, Viewport } from "next";
import "./financas.css";

export const metadata: Metadata = {
  title: "Nossas Finanças",
  description: "Controle financeiro do casal — foco no gasto do dia a dia.",
  manifest: "/financas/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finanças",
  },
  icons: {
    apple: "/financas/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function FinancasLayout({ children }: { children: React.ReactNode }) {
  return <div className="fin-root">{children}</div>;
}
