import type { Post } from "@/lib/blog";

const post: Post = {
  slug: "inspecao-de-usina-solar-com-drone",
  title: "Inspeção de usina solar com drone: o que a imagem aérea encontra",
  description:
    "Sujeira, sombreamento, módulos danificados e pontos quentes: veja o que a inspeção aérea com drone revela em usinas solares e quando a termografia é necessária.",
  excerpt:
    "Sujeira, sombra, módulo trincado, ponto quente: veja quais problemas o drone enxerga de cima e quando vale partir para a termografia.",
  date: "2026-10-07",
  category: "Energia Solar",
  cover: "/portfolio/industria.jpg",
  coverAlt: "Vista aérea de galpões industriais com grandes coberturas, onde costumam ser instaladas usinas solares",
  keywords: [
    "inspeção de usina solar com drone",
    "drone usina fotovoltaica",
    "termografia painel solar",
    "hotspot placa solar",
  ],
  html: `
<p>Uma usina solar pode perder geração por meses sem que ninguém perceba. O inversor continua ligado, o monitoramento mostra números “razoáveis” e o problema fica escondido no meio de centenas ou milhares de módulos. É aí que o drone entra: em poucos minutos de voo, ele mostra a usina inteira de cima, módulo por módulo.</p>

<h2>Por que inspecionar com drone</h2>
<p>Percorrer uma usina de solo a pé, olhando placa por placa, é lento e pouco preciso. Em telhados, além de demorado, é arriscado. O drone resolve três coisas de uma vez:</p>
<ul>
  <li><strong>Velocidade:</strong> uma usina de solo de médio porte é coberta em uma manhã;</li>
  <li><strong>Segurança:</strong> ninguém precisa subir em telhado para olhar módulo;</li>
  <li><strong>Registro:</strong> cada imagem fica arquivada e pode ser comparada na próxima inspeção.</li>
</ul>

<h2>O que a inspeção visual aérea encontra</h2>
<p>Com câmera convencional em alta resolução, já é possível identificar boa parte dos problemas que derrubam a geração:</p>
<ul>
  <li><strong>Sujeira acumulada:</strong> poeira, fezes de pássaros e resíduos de obras próximas criam manchas que reduzem a geração e podem causar aquecimento localizado;</li>
  <li><strong>Sombreamento:</strong> vegetação que cresceu, construções novas no entorno ou estruturas mal posicionadas que fazem sombra em parte do dia;</li>
  <li><strong>Módulos danificados:</strong> vidros trincados, quebrados ou com marcas de impacto, comuns depois de granizo;</li>
  <li><strong>Estrutura e fixação:</strong> perfis desalinhados, fixações soltas e sinais de corrosão;</li>
  <li><strong>Entorno da usina:</strong> erosão, drenagem, cercas, acessos e vegetação alta em usinas de solo.</li>
</ul>

<h2>Quando é preciso termografia</h2>
<p>Alguns defeitos não aparecem em uma foto comum. É o caso dos chamados <strong>pontos quentes (hotspots)</strong>: áreas do módulo que esquentam mais que o resto porque não estão gerando como deveriam. Eles só aparecem com <strong>câmera térmica</strong>.</p>
<p>A termografia aérea costuma revelar:</p>
<ul>
  <li>células trincadas ou com defeito de fabricação;</li>
  <li>falhas em diodos de bypass, que deixam uma parte inteira do módulo aquecida;</li>
  <li>strings ou módulos desconectados, que aparecem com temperatura diferente do restante;</li>
  <li>degradação por PID, que aparece como um padrão de aquecimento em vários módulos da mesma string.</li>
</ul>
<p>Para a inspeção térmica ter valor técnico, ela precisa ser feita nas condições certas: céu limpo e irradiância alta, normalmente acima de 600 W/m², como recomenda a norma IEC TS 62446-3. Inspeção térmica em dia nublado gera imagem bonita, mas pouco confiável.</p>

<h2>Com que frequência inspecionar</h2>
<p>Uma referência prática:</p>
<ul>
  <li><strong>No comissionamento:</strong> registra o estado da usina na entrega e serve de base para cobrar o instalador ou o fabricante se algo aparecer depois;</li>
  <li><strong>Uma vez por ano:</strong> inspeção de rotina, de preferência no período mais seco, quando a sujeira acumula;</li>
  <li><strong>Depois de eventos climáticos:</strong> granizo, vendaval ou queda brusca de geração no monitoramento.</li>
</ul>

<h2>A imagem aérea também vende</h2>
<p>Para integradores e empresas de energia solar, a imagem aérea de uma usina entregue é um dos melhores argumentos comerciais. Um vídeo mostrando o sistema instalado em um galpão ou fazenda vale mais do que qualquer catálogo, e o mesmo voo que documenta a usina pode render material para site, redes sociais e propostas.</p>

<h2>Registro de usinas solares em Sorocaba e região</h2>
<p>A AERISX faz registro aéreo de usinas solares em telhados e em solo em Sorocaba e região, para integradores, investidores e donos de usinas. Entregamos imagens organizadas para documentação técnica e material pronto para uso comercial.</p>
<p>Tem uma usina para registrar ou inspecionar? <a href="https://wa.me/5511914361289?text=Ol%C3%A1!%20Quero%20saber%20sobre%20registro%20e%20inspe%C3%A7%C3%A3o%20de%20usina%20solar%20com%20drone." target="_blank" rel="noopener noreferrer">Fale com a gente no WhatsApp</a> e diga a potência e a localização da usina.</p>
`,
  faq: [
    {
      q: "O drone consegue ver pontos quentes em placas solares?",
      a: "Só com câmera térmica. A câmera comum mostra sujeira, sombreamento e danos físicos; os pontos quentes (hotspots) aparecem apenas na termografia, feita com céu limpo e irradiância alta.",
    },
    {
      q: "Com que frequência devo inspecionar minha usina solar?",
      a: "Uma vez no comissionamento, uma inspeção de rotina por ano e sempre depois de granizo, vendaval ou queda de geração sem explicação no monitoramento.",
    },
    {
      q: "Inspeção com drone substitui a manutenção da usina?",
      a: "Não. A inspeção aérea aponta onde estão os problemas; a correção continua sendo feita pela equipe de manutenção ou pelo integrador.",
    },
    {
      q: "Dá para inspecionar usinas em telhado com drone?",
      a: "Sim, e é justamente onde o drone mais ajuda, porque evita que alguém precise subir no telhado para verificar módulo por módulo.",
    },
  ],
};

export default post;
