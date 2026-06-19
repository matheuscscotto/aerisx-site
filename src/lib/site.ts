export const site = {
  name: "AERISX",
  legalName: "AERISX — Captação Aérea Profissional",
  domain: "aerisx.com.br",
  url: "https://aerisx.com.br",
  tagline: "Uma nova perspectiva para o seu negócio.",
  description:
    "Captação aérea profissional com drones de última geração. Fotografia e filmagem aérea em 4K, monitoramento de obras, mapeamento e conteúdo institucional para empresas, investidores e empreendimentos.",
  phoneDisplay: "(11) 91436-1289",
  phoneIntl: "5511914361289",
  email: "contato@aerisx.com.br",
  instagram: "https://www.instagram.com/aerisx.br/",
  instagramHandle: "@aerisx.br",
  whatsappMessage:
    "Olá! Vim pelo site da AERISX e gostaria de um orçamento de captação aérea.",
};

export const whatsappUrl = `https://wa.me/${site.phoneIntl}?text=${encodeURIComponent(
  site.whatsappMessage
)}`;

export const navLinks = [
  { href: "#quem-somos", label: "Quem Somos" },
  { href: "#servicos", label: "Serviços" },
  { href: "#segmentos", label: "Segmentos" },
  { href: "#portfolio", label: "Portfólio" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#contato", label: "Contato" },
];
