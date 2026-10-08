import { posts as allPosts } from "@/content/blog";

export type Faq = { q: string; a: string };

export type Post = {
  slug: string;
  title: string;
  /** Meta description (até ~155 caracteres) — aparece no Google. */
  description: string;
  /** Resumo curto mostrado nos cards da listagem. */
  excerpt: string;
  /** Data de publicação no formato AAAA-MM-DD. */
  date: string;
  updated?: string;
  category: "Imobiliário" | "Construção" | "Energia Solar" | "Agronegócio" | "Mercado";
  cover: string;
  coverAlt: string;
  keywords: string[];
  /** Corpo do artigo em HTML simples (h2, h3, p, ul, ol, blockquote, a). */
  html: string;
  faq?: Faq[];
};

/** Todos os artigos, do mais novo para o mais antigo. */
export function getAllPosts(): Post[] {
  return [...allPosts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): Post | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Artigos relacionados: mesma categoria primeiro, depois os mais recentes. */
export function getRelated(slug: string, n = 2): Post[] {
  const current = getPost(slug);
  const others = getAllPosts().filter((p) => p.slug !== slug);
  const same = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => p.category !== current?.category);
  return [...same, ...rest].slice(0, n);
}
