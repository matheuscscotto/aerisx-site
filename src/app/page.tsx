import Hero from "@/components/Hero";
import QuemSomos from "@/components/QuemSomos";
import Numeros from "@/components/Numeros";
import Servicos from "@/components/Servicos";
import Segmentos from "@/components/Segmentos";
import Processo from "@/components/Processo";
import Portfolio from "@/components/Portfolio";
import Diferenciais from "@/components/Diferenciais";
import Contato from "@/components/Contato";

export default function Home() {
  return (
    <>
      <Hero />
      <QuemSomos />
      <Numeros />
      <Servicos />
      <Segmentos />
      <Processo />
      <Portfolio />
      <Diferenciais />
      <Contato />
    </>
  );
}
