import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getPost, getRelated, readingTime } from "@/lib/blog";
import { site, whatsappUrl } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}/`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url: `${site.url}${url}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [{ url: post.cover, width: 1280, height: 720, alt: post.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.cover],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${site.url}/blog/${post.slug}/`;
  const minutes = readingTime(post.html);
  const related = getRelated(post.slug);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: `${site.url}${post.cover}`,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      inLanguage: "pt-BR",
      mainEntityOfPage: url,
      keywords: post.keywords.join(", "),
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: {
        "@type": "Organization",
        name: site.name,
        logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <article className="relative overflow-hidden pb-24 pt-28 sm:pb-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden
      />

      <div className="container-x relative">
        <header className="mx-auto max-w-3xl">
          <nav aria-label="Trilha" className="text-sm text-muted">
            <Link href="/" className="hover:text-fg">Início</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/blog/" className="hover:text-fg">Blog</Link>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-semibold uppercase tracking-wider text-accent">
              {post.category}
            </span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{minutes} min de leitura</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
        </header>

        <figure className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt={post.coverAlt}
            width={1280}
            height={720}
            fetchPriority="high"
            className="aspect-[16/9] w-full object-cover"
          />
        </figure>

        <div
          className="prose-ax mx-auto mt-12 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.faq && post.faq.length > 0 && (
          <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="faq">
            <h2 id="faq" className="text-2xl font-bold tracking-tight">
              Perguntas frequentes
            </h2>
            <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-panel/50">
              {post.faq.map((f) => (
                <details key={f.q} className="group p-5 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
                    {f.q}
                    <span className="mt-0.5 text-accent transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <aside className="mx-auto mt-14 max-w-3xl rounded-2xl border border-accent/30 bg-accent/[0.07] p-6 sm:p-8">
          <p className="text-xl font-bold tracking-tight">
            Precisa de imagens aéreas para o seu projeto?
          </p>
          <p className="mt-2 text-muted">
            A AERISX atende Sorocaba e região com captação aérea profissional
            para obras, imóveis, energia solar e agronegócio.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Solicitar orçamento no WhatsApp
          </a>
        </aside>

        {related.length > 0 && (
          <section className="mx-auto mt-20 max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Continue lendo
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="group flex gap-4 rounded-2xl border border-white/10 bg-panel/50 p-4 transition-colors hover:border-accent/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover}
                    alt=""
                    loading="lazy"
                    className="h-20 w-28 flex-none rounded-lg object-cover"
                  />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {p.category}
                    </span>
                    <p className="mt-1 font-semibold leading-snug group-hover:text-accent">
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
