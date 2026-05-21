/**
 * components/categories/CategoriesSection.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the entire Categories section within a single 100svh viewport.
 *
 * Two views, toggled in-place with a smooth fade animation (no modal, no routing):
 *
 *   CAROUSEL VIEW (default)
 *     SectionHeader → Search → Filter tabs → Carousel → Progress dots → CTA
 *
 *   BROWSE-ALL VIEW (after clicking "Browse All Categories")
 *     Back button + title bar → Scrollable grid of ALL categories
 *
 * DATA FLOW:
 *   useCategories   → category metadata (sorted by enrollment for Trending)
 *   useCategoryStats → { coursesCount, jobsCount, eventsCount } per category
 *   useCarousel     → page state, auto-play, navigation handlers
 *
 * INTEGRATION:
 *   Drop <CategoriesSection /> into any page/layout in the LMS.
 *   For routing: update handleCategoryClick to use useNavigate().
 *   For API: swap static data in useCategories + useCategoryStats hooks.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  FaLayerGroup, FaFire, FaSearch, FaArrowRight, FaChevronLeft,
} from 'react-icons/fa';

/* Child components */
import SectionHeader    from './SectionHeader';
import CategoryFilter   from './CategoryFilter';
import CategoryCarousel from './CategoryCarousel';
import CarouselProgress from './CarouselProgress';
import CategoryCard     from './CategoryCard';

/* Custom hooks */
import useCategories    from '../../../hooks/useCategories';
import useCategoryStats from '../../../hooks/useCategoryStats';
import useCarousel      from '../../../hooks/useCarousel';

import styles from './CategoriesSection.module.css';

/* ── Constants ──────────────────────────────────────────── */
const AUTO_PLAY_INTERVAL = 4500;

const FILTER_OPTIONS = [
  { key: 'all',      label: 'All',      icon: <FaLayerGroup size="0.75rem" /> },
  { key: 'trending', label: 'Trending', icon: <FaFire       size="0.75rem" /> },
];

/* ─────────────────────────────────────────────────────────
   BrowseAllView
   Renders inside the same section container — no separate window.
   All categories in a scrollable grid, replacing the carousel content.
   ───────────────────────────────────────────────────────── */
const BrowseAllView = ({ categories, statsMap, loadingStats, onCategoryClick, onBack }) => (
  /* key ensures animation re-triggers when this view mounts */
  <div className={styles['categories-section__view']} key="browse-all-view">

    {/* ── Top bar: back button + title ───────────────── */}
    <div className="browse-all__topbar">
      <button
        id="browse-all-back-btn"
        type="button"
        className={styles['browse-all__back-btn']}
        onClick={onBack}
        aria-label="Back to carousel view"
      >
        <FaChevronLeft size="0.75rem" aria-hidden="true" />
        <span>Back</span>
      </button>

      <div>
        <h2 className={styles['browse-all__topbar-title']}>All Categories</h2>
        <p className={styles['browse-all__topbar-count']}>{categories.length} categories available</p>
      </div>
    </div>

    {/* ── Full scrollable grid ────────────────────────── */}
    <div className={styles['browse-all__grid']} role="list" aria-label="All learning categories">
      {categories.map((category, idx) => (
        <div
          key={category.id}
          className={styles['browse-all__grid-item']}
          role="listitem"
          style={{ animationDelay: `${idx * 0.04}s` }}
        >
          <CategoryCard
            category={category}
            stats={statsMap[category.id] || {}}
            loadingStats={loadingStats}
            onCategoryClick={onCategoryClick}
          />
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   CarouselView
   Default view: header + search + filter + carousel + progress + CTA.
   ───────────────────────────────────────────────────────── */
const CarouselView = ({
  filteredCategories,
  statsMap,
  loadingStats,
  carousel,
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onCategoryClick,
  onBrowseAll,
}) => (
  <div className={styles['categories-section__view']} key="carousel-view">

    {/* Section header */}
    <SectionHeader
      eyebrow="CATEGORIES"
      headline="Explore Top Categories"
      subText="Choose from a wide range of skills and gain expertise that employers value most."
      align="center"
    />

    {/* ── Toolbar: search bar (top row, centered) + filter tabs (below) ── */}
    <div className={styles['categories-section__toolbar']}>

      {/* Search bar — rendered first so it appears on top in column layout */}
      <div className={styles['categories-section__search-wrap']}>
        <FaSearch
          className={styles['categories-section__search-icon']}
          aria-hidden="true"
          size="0.85rem"
        />
        <input
          id="category-search"
          type="search"
          placeholder="Search categories…"
          value={searchQuery}
          onChange={onSearchChange}
          className={styles['categories-section__search-input']}
          aria-label="Search categories"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Filter tabs + count */}
      <CategoryFilter
        activeFilter={activeFilter}
        filters={FILTER_OPTIONS}
        onFilterChange={onFilterChange}
        totalCount={filteredCategories.length}
      />

    </div>


    {/* Carousel — one row, auto-rotating */}
    <CategoryCarousel
      categories={filteredCategories}
      statsMap={statsMap}
      loadingStats={loadingStats}
      onCategoryClick={onCategoryClick}
      carousel={carousel}
    />

    {/* ── Bottom group: progress + CTA ──────────────────────────
        margin-top: auto pushes this block down to fill the remaining
        space in the 100svh container, so the bottom is never empty. */}
    <div className={styles['categories-section__bottom']}>
      {/* Progress bar + dots + hint */}
      <CarouselProgress
        currentPage={carousel.currentPage}
        numPages={carousel.numPages}
        isPaused={carousel.isPaused}
        progressKey={carousel.progressKey}
        autoPlayInterval={carousel.effectiveInterval}
        onDotClick={carousel.handleDotClick}
      />

      {/* CTA — switches to Browse-All view in-place */}
      <div className={styles['categories-section__cta']}>
        <button
          id="categories-browse-all-btn"
          type="button"
          className={styles['categories-section__cta-btn']}
          aria-label="Browse all learning categories"
          onClick={onBrowseAll}
        >
          <span>Browse All Categories</span>
          <FaArrowRight aria-hidden="true" size="0.8rem" />
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   CategoriesSection — main orchestrator
   ───────────────────────────────────────────────────────── */
const CategoriesSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  /* isBrowseAll: false = carousel view, true = browse-all grid view */
  const [isBrowseAll, setIsBrowseAll]   = useState(false);

  /* Data hooks */
  const { categories, loading, error } = useCategories(activeFilter);
  const { statsMap, loadingStats }     = useCategoryStats();

  /* Client-side search filter */
  const filteredCategories = useMemo(() => {
    if (!categories.length) return [];
    const q = searchQuery.toLowerCase().trim();
    return q ? categories.filter((c) => c.title.toLowerCase().includes(q)) : categories;
  }, [categories, searchQuery]);

  /* Carousel hook */
  const carousel = useCarousel({
    totalItems: filteredCategories.length,
    autoPlayInterval: AUTO_PLAY_INTERVAL,
  });

  /* ── Handlers ────────────────────────────────────────── */
  const handleFilterChange = useCallback((key) => {
    setActiveFilter(key);
    setSearchQuery('');
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setActiveFilter('all');
  }, []);

  /**
   * handleCategoryClick
   * INTEGRATION POINT — swap with useNavigate() for routing:
   *   import { useNavigate } from 'react-router-dom';
   *   const navigate = useNavigate();
   *   navigate(`/categories/${slug}`);
   */
  const handleCategoryClick = useCallback((slug) => {
    console.info(`Navigate to: /categories/${slug}`);
  }, []);

  /* Toggle to browse-all view (no routing) */
  const handleBrowseAll = useCallback(() => setIsBrowseAll(true),  []);
  /* Return to carousel view */
  const handleBackToCarousel = useCallback(() => setIsBrowseAll(false), []);

  /* ── Loading State ───────────────────────────────────── */
  if (loading) {
    return (
      <section className={styles['categories-section']} aria-busy="true">
        <div className={styles['categories-section__loading']} role="status">
          <div className={styles['categories-section__spinner']} aria-hidden="true" />
          <p>Loading categories…</p>
        </div>
      </section>
    );
  }

  /* ── Error State ─────────────────────────────────────── */
  if (error) {
    return (
      <section className={styles['categories-section']}>
        <div className={styles['categories-section__error']} role="alert">
          <p>⚠️ {error.message}</p>
        </div>
      </section>
    );
  }

  /* ── Main Render ─────────────────────────────────────── */
  return (
    <section
      className={styles['categories-section']}
      id="categories"
      aria-labelledby={isBrowseAll ? 'browse-all-title' : 'section-header-headline'}
    >
      {/* Background blobs (always visible behind both views) */}
      <div className={styles['categories-section__bg-decor']} aria-hidden="true">
        <div className={`${styles['categories-section__blob']} ${styles['categories-section__blob--1']}`} />
        <div className={`${styles['categories-section__blob']} ${styles['categories-section__blob--2']}`} />
        <div className={`${styles['categories-section__blob']} ${styles['categories-section__blob--3']}`} />
      </div>

      <div className={styles['categories-section__container']}>
        {/*
         * Conditional render with key prop forces React to unmount/remount
         * the view component, re-triggering the CSS entry animation each time
         * the user switches between carousel and browse-all views.
         */}
        {isBrowseAll ? (
          <BrowseAllView
            key="browse"
            categories={categories}
            statsMap={statsMap}
            loadingStats={loadingStats}
            onCategoryClick={handleCategoryClick}
            onBack={handleBackToCarousel}
          />
        ) : (
          <CarouselView
            key="carousel"
            filteredCategories={filteredCategories}
            statsMap={statsMap}
            loadingStats={loadingStats}
            carousel={carousel}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onCategoryClick={handleCategoryClick}
            onBrowseAll={handleBrowseAll}
          />
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
