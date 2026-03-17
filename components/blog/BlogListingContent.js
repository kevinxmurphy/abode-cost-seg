"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import {
  articles,
  CATEGORIES,
  getAllTags,
  getPillarThemes,
  getArticlesByTheme,
} from "@/lib/blogData";

const ARTICLES_PER_PAGE = 12;
const TAGS_INITIAL = 12;

function BlogListingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategory = searchParams.get("category") || "All";
  const activeTag = searchParams.get("tag") || null;
  const activeTheme = searchParams.get("theme") || null;
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [showAllTags, setShowAllTags] = useState(false);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === "" || v === "All" || v === 1) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleCategoryClick(cat) {
    updateParams({ category: cat === "All" ? null : cat, tag: null, theme: null, page: null });
  }

  function handleTagClick(tag) {
    if (activeTag === tag) {
      updateParams({ tag: null, page: null });
    } else {
      updateParams({ tag, category: null, theme: null, page: null });
    }
  }

  function handleThemeClick(themeSlug) {
    if (activeTheme === themeSlug) {
      updateParams({ theme: null, page: null });
    } else {
      updateParams({ theme: themeSlug, category: null, tag: null, page: null });
    }
  }

  function handlePageClick(page) {
    updateParams({ page: page === 1 ? null : page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Filtering
  const themeArticles = activeTheme ? getArticlesByTheme(activeTheme).map((a) => a.slug) : null;

  const filtered = articles.filter((a) => {
    const catMatch = activeCategory === "All" || a.category === activeCategory;
    const tagMatch = !activeTag || (a.tags && a.tags.includes(activeTag));
    const themeMatch = !themeArticles || themeArticles.includes(a.slug);
    return catMatch && tagMatch && themeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pageSlice = filtered.slice(
    (safePage - 1) * ARTICLES_PER_PAGE,
    safePage * ARTICLES_PER_PAGE
  );
  const featured = safePage === 1 ? pageSlice[0] : null;
  const rest = safePage === 1 ? pageSlice.slice(1) : pageSlice;

  const tags = getAllTags();
  const visibleTags = showAllTags ? tags : tags.slice(0, TAGS_INITIAL);
  const hiddenCount = tags.length - TAGS_INITIAL;

  const pillarThemes = getPillarThemes();

  const hasActiveFilter = activeCategory !== "All" || activeTag || activeTheme;

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Active theme label
  const activeThemeLabel = activeTheme
    ? pillarThemes.find((t) => t.slug === activeTheme)?.theme
    : null;

  return (
    <>
      {/* Hero */}
      <section className="blog-hero">
        <div className="container">
          <h1>Learn</h1>
          <p>
            Expert guides on cost segregation, depreciation strategy, and tax
            savings for short-term rental investors.
          </p>
        </div>
      </section>

      {/* Theme Browse Row */}
      <div className="blog-themes-row">
        <div className="container">
          <div className="blog-themes-label">
            <BookOpen size={13} /> Browse by Topic
          </div>
          <div className="blog-themes-scroll">
            {pillarThemes.map((t) => (
              <button
                key={t.slug}
                className={`blog-theme-chip ${activeTheme === t.slug ? "active" : ""}`}
                onClick={() => handleThemeClick(t.slug)}
                title={`${t.articleCount} articles`}
              >
                {t.theme}
                <span className="blog-theme-chip-count">{t.articleCount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="container">
        <div className="blog-filters">
          <button
            className={`blog-category-filter ${activeCategory === "All" && !activeTag && !activeTheme ? "active" : ""}`}
            onClick={() => handleCategoryClick("All")}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`blog-category-filter ${activeCategory === cat && !activeTag && !activeTheme ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter banner */}
      {hasActiveFilter && (
        <div className="container">
          <div className="blog-active-filters">
            <span className="blog-active-filters-label">Filtering by:</span>
            {activeCategory !== "All" && (
              <span className="blog-active-chip">
                {activeCategory}
                <button onClick={() => handleCategoryClick("All")}>×</button>
              </span>
            )}
            {activeTag && (
              <span className="blog-active-chip">
                #{activeTag}
                <button onClick={() => handleTagClick(activeTag)}>×</button>
              </span>
            )}
            {activeTheme && (
              <span className="blog-active-chip">
                {activeThemeLabel}
                <button onClick={() => handleThemeClick(activeTheme)}>×</button>
              </span>
            )}
            <button
              className="blog-active-filters-clear"
              onClick={() => updateParams({ category: null, tag: null, theme: null, page: null })}
            >
              Clear all
            </button>
            <span className="blog-active-filters-count">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container">
        <div className="blog-layout">
          <div>
            {/* Featured — page 1 only */}
            {featured && (
              <Link
                href={`/learn/${featured.slug}`}
                className="blog-featured"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <div className="blog-featured-content">
                  <span className="blog-featured-badge">{featured.category}</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.description}</p>
                  <div className="blog-featured-meta">
                    <span>
                      <Calendar size={13} />
                      {formatDate(featured.publishedAt)}
                    </span>
                    <span>
                      <Clock size={13} />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="blog-grid">
                {rest.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/learn/${article.slug}`}
                    className={`blog-card${article.isPillar ? " blog-card--pillar" : ""}`}
                  >
                    <span className="blog-card-badge">{article.category}</span>
                    {article.isPillar && (
                      <span className="blog-card-pillar-label">
                        <BookOpen size={10} /> Complete Guide
                      </span>
                    )}
                    <h3>{article.title}</h3>
                    <p>{article.description}</p>
                    <div className="blog-card-meta">
                      <span>
                        <Calendar size={12} />
                        {formatDate(article.publishedAt)}
                      </span>
                      <span>
                        <Clock size={12} />
                        {article.readTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <p style={{ color: "var(--dust)", padding: "var(--space-5) 0" }}>
                No articles in this category yet. Check back soon.
              </p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="blog-pagination">
                <button
                  className="blog-pagination-btn blog-pagination-prev"
                  onClick={() => handlePageClick(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isEllipsis =
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - safePage) > 2;
                  if (isEllipsis) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="blog-pagination-ellipsis">
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <button
                      key={page}
                      className={`blog-pagination-btn${page === safePage ? " active" : ""}`}
                      onClick={() => handlePageClick(page)}
                      aria-label={`Page ${page}`}
                      aria-current={page === safePage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="blog-pagination-btn blog-pagination-next"
                  onClick={() => handlePageClick(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                >
                  →
                </button>
                <span className="blog-pagination-info">
                  Page {safePage} of {totalPages}
                </span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="blog-sidebar-section">
              <div className="blog-sidebar-title">Popular Topics</div>
              <div className="blog-tag-cloud">
                {visibleTags.map(({ tag }) => (
                  <button
                    key={tag}
                    className={`blog-tag ${activeTag === tag ? "active" : ""}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {hiddenCount > 0 && (
                <button
                  className="blog-tag-expand"
                  onClick={() => setShowAllTags((v) => !v)}
                >
                  {showAllTags ? "Show fewer topics" : `+ ${hiddenCount} more topics`}
                </button>
              )}
            </div>

            <div className="blog-sidebar-section">
              <div className="blog-sidebar-cta">
                <h4>Get Your Free Estimate</h4>
                <p>
                  See how much you could save with a cost segregation study on
                  your property.
                </p>
                <Link href="/quiz" className="btn btn-primary btn-sm">
                  Start Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom CTA Banner */}
        <div className="blog-cta-banner">
          <h3>Ready to Maximize Your Deductions?</h3>
          <p>
            Get a free savings estimate for your short-term rental in under 2
            minutes.
          </p>
          <Link href="/quiz" className="btn btn-primary">
            Get Your Free Estimate <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}

export default function BlogListingContent() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <BlogListingInner />
    </Suspense>
  );
}
