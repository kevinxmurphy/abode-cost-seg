"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  User,
  ChevronRight,
  Link2,
  ArrowRight,
} from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
  articles,
} from "@/lib/blogData";
import { BookOpen, ChevronRight as ChevronRightSm } from "lucide-react";

export default function BlogArticleContent({ slug }) {
  const article = getArticleBySlug(slug);
  const related = getRelatedArticles(slug, 4);

  // Find the pillar this article belongs to (if it's not a pillar itself)
  const parentPillar = !article?.isPillar
    ? articles.find(
        (a) => a.isPillar && a.clusterSlugs && a.clusterSlugs.includes(slug)
      )
    : null;

  // Theme label for related section
  const themeLabel =
    article?.pillarTheme ||
    parentPillar?.pillarTheme ||
    null;

  // Extract h2 headings for TOC
  const contentBlocks = article?.content || [];
  const tocItems = contentBlocks
    .filter((b) => b.type === "heading" && b.level === 2)
    .map((b) => ({ id: b.id, text: b.text }));

  // Scroll spy
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    tocItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Copy link handler
  const [copied, setCopied] = useState(false);
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!article) return null;

  return (
    <div className="container">
      {/* Breadcrumbs */}
      <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="separator"><ChevronRight size={12} /></span>
        <Link href="/learn">Learn</Link>
        {themeLabel && parentPillar && (
          <>
            <span className="separator"><ChevronRight size={12} /></span>
            <Link href={`/learn/${parentPillar.slug}`}>{themeLabel}</Link>
          </>
        )}
        <span className="separator"><ChevronRight size={12} /></span>
        <span className="current">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="blog-article-header">
        <span className="blog-card-badge">{article.category}</span>
        <h1>{article.title}</h1>
        <div className="blog-article-meta">
          <span><User size={14} /> {article.author.name}</span>
          <span className="dot" />
          <span><Calendar size={14} /> {formatDate(article.publishedAt)}</span>
          {article.updatedAt && (
            <>
              <span className="dot" />
              <span>Updated {formatDate(article.updatedAt)}</span>
            </>
          )}
          <span className="dot" />
          <span><Clock size={14} /> {article.readTime}</span>
        </div>
      </header>

      {/* Non-pillar articles: show "Part of this guide" banner */}
      {parentPillar && (
        <div className="blog-theme-nav">
          <BookOpen size={13} />
          <span>Part of:</span>
          <Link href={`/learn/${parentPillar.slug}`} className="blog-theme-nav-link">
            {parentPillar.title}
          </Link>
          <span className="blog-theme-nav-count">
            {(parentPillar.clusterSlugs?.length || 0) + 1} articles in this guide
          </span>
        </div>
      )}

      {/* Article Layout */}
      <div className="blog-article-layout">
        {/* Main Content */}
        <div className="blog-content">
          {/* Pillar Hub — shown only on tentpole/pillar articles */}
          {article.isPillar && article.clusterSlugs && article.clusterSlugs.length > 0 && (
            <PillarHub article={article} />
          )}

          {contentBlocks.map((block, i) => (
            <ContentBlock key={i} block={block} />
          ))}

          {/* Author Card */}
          <div className="blog-author-card">
            <div className="blog-author-avatar">
              {article.author.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="blog-author-info">
              <h4>{article.author.name}</h4>
              <p>{article.author.role}</p>
            </div>
          </div>

          {/* Share */}
          <div className="blog-share">
            <span className="blog-share-label">Share</span>
            <button
              className="blog-share-btn"
              onClick={handleCopyLink}
              title={copied ? "Copied!" : "Copy link"}
              aria-label="Copy link"
            >
              <Link2 size={16} />
            </button>
            <a
              className="blog-share-btn"
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(article.seo.canonical)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X (Twitter)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a
              className="blog-share-btn"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.seo.canonical)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>

        {/* Sidebar — TOC + CTA */}
        <aside className="blog-sidebar">
          {tocItems.length > 0 && (
            <div className="blog-toc">
              <div className="blog-toc-title">On This Page</div>
              <ul className="blog-toc-list">
                {tocItems.map(({ id, text }) => (
                  <li key={id} className="blog-toc-item">
                    <a
                      href={`#${id}`}
                      className={activeId === id ? "active" : ""}
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="blog-sidebar-cta">
                <h4>Get Your Free Estimate</h4>
                <p>See how much you could save with cost segregation.</p>
                <Link href="/quiz" className="btn btn-primary btn-sm">
                  Start Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Related Articles — Full width, 2×2, below layout */}
      {related.length > 0 && (
        <section className="blog-related">
          <div className="blog-related-header">
            <h2>
              {themeLabel ? `Continue Learning: ${themeLabel}` : "Related Articles"}
            </h2>
            {themeLabel && parentPillar && (
              <Link href={`/learn/${parentPillar.slug}`} className="blog-related-guide-link">
                View complete guide <ChevronRight size={14} />
              </Link>
            )}
          </div>
          <div className="blog-related-grid">
            {related.map((r) => (
              <Link key={r.slug} href={`/learn/${r.slug}`} className="blog-card">
                <span className="blog-card-badge">{r.category}</span>
                {r.isPillar && (
                  <span className="blog-card-pillar-label">
                    <BookOpen size={10} /> Complete Guide
                  </span>
                )}
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <div className="blog-card-meta">
                  <span><Clock size={12} /> {r.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Pillar Hub ─── */
function PillarHub({ article }) {
  const clusterArticles = article.clusterSlugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean);

  if (clusterArticles.length === 0) return null;

  return (
    <div className="blog-pillar-hub">
      <div className="blog-pillar-badge">
        <BookOpen size={11} /> Complete Topic Guide
      </div>
      <div className="blog-pillar-hub-title">Articles in This Guide</div>
      {article.clusterDescription && (
        <p className="blog-pillar-hub-desc">{article.clusterDescription}</p>
      )}
      <div className="blog-pillar-hub-links">
        {clusterArticles.map((a) => (
          <Link key={a.slug} href={`/learn/${a.slug}`} className="blog-pillar-hub-link">
            <ChevronRightSm size={13} />
            {a.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Content Block Renderer ─── */
function ContentBlock({ block }) {
  switch (block.type) {
    case "paragraph":
      return <p dangerouslySetInnerHTML={{ __html: block.text }} />;

    case "heading":
      if (block.level === 2) {
        return <h2 id={block.id}>{block.text}</h2>;
      }
      return <h3 id={block.id}>{block.text}</h3>;

    case "callout":
      return (
        <div className={`blog-callout ${block.variant}`}>
          {block.title && <div className="blog-callout-title">{block.title}</div>}
          <p>{block.text}</p>
        </div>
      );

    case "list":
      if (block.style === "numbered") {
        return (
          <ol>
            {block.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ol>
        );
      }
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="blog-quote">
          {block.text}
        </blockquote>
      );

    case "faq":
      return (
        <div className="blog-faq" itemScope itemType="https://schema.org/Question">
          <div className="blog-faq-question" itemProp="name">
            {block.question}
          </div>
          <div
            className="blog-faq-answer"
            itemScope
            itemType="https://schema.org/Answer"
            itemProp="acceptedAnswer"
          >
            <span itemProp="text">{block.answer}</span>
          </div>
        </div>
      );

    case "table":
      return (
        <div className="blog-table-wrap">
          <table className="blog-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "cta":
      return (
        <div className="blog-cta-block">
          <h3>{block.title}</h3>
          <p>{block.text}</p>
          <Link href={block.buttonHref} className="btn btn-primary">
            {block.buttonText} <ArrowRight size={16} />
          </Link>
        </div>
      );

    default:
      return null;
  }
}
