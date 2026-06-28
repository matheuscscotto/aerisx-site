import type { Metadata } from "next";
import CalEmbed from "@/components/CalEmbed";

export const metadata: Metadata = {
  title: "Agendar Captação",
  description:
    "Agende sua captação aérea profissional com a AERISX. Escolha data e horário e informe os dados do local.",
  // Página não-listada: fica fora do Google e do sitemap.
  robots: { index: false, follow: false },
  alternates: { canonical: "/agendar" },
};

export default function AgendarPage() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden
      />
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="kicker justify-center">Agendamento</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Agende sua <span className="text-gradient">captação aérea</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Escolha a data e o horário disponíveis e preencha os dados do local.
            Usamos essas informações para solicitar a autorização de voo. A
            captação está sujeita às condições climáticas no dia.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-white/10 bg-panel/50 p-3 sm:p-5">
          <CalEmbed />
        </div>
      </div>
    </section>
  );
}
