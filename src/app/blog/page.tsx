import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getAllPosts, readingTime } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — Imagens aéreas, obras, imóveis e energia solar",
  description:
    "Artigos da AERISX sobre filmagem com drone, acompanhamento de obras, mercado imobiliário, energia solar e agronegócio em Sorocaba e região.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    type: "website",
    url: `${site.url}/blog/`,
    title: "Blog AERISX — Imagens aéreas para negócios",
    description:
      "Artigos sobre filmagem com drone, acompanhamento de obras, imóveis, energia solar e agronegócio.",
    images: [{ url: "/og.jpg", width: 1280, height: 720 }],
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40">
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden
      />
      <div className="container-x relative">
        <div className="max-w-2xl">
          <span className="kicker">Blog</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Visto <span className="text-gradient">de cima</span>.
          </h1>
          <p className="mt-5 text-lg text-muted">
            O que aprendemos voando sobre obras, imóveis, usinas solares e
            propriedades rurais em Sorocaba e região.
          </p>
        </div>

        {featured && (
          <Link
            href={`/blog/${featured.slug}/`}
            className="group mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-panel/50 transition-colors hover:border-accent/50 md:grid-cols-[1.25fr_1fr]"
          >
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.cover}
                alt={featured.coverAlt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <PostMeta category={featured.category} date={featured.date} minutes={readingTime(featured.html)} />
              <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-muted">{featured.excerpt}</p>
              <span className="mt-6 text-sm font-semibold text-accent">
                Ler artigo →
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/50 transition-colors hover:border-accent/50"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover}
                    alt={p.coverAlt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <PostMeta category={p.category} date={p.date} minutes={readingTime(p.html)} />
                  <h2 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                    {p.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PostMeta({ category, date, minutes }: { category: string; date: string; minutes: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent">
        {category}
      </span>
      <time dateTime={date}>{formatDate(date)}</time>
      <span aria-hidden>·</span>
      <span>{minutes} min de leitura</span>
    </div>
  );
}
