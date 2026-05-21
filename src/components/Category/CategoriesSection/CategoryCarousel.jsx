/**
 * components/categories/CategoryCarousel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Carousel container. Shows one row of cards; remaining pages auto-rotate.
 * Arrows are always visible so users know navigation is available.
 * Pauses on hover; resumes on mouse-leave.
 *
 * PROPS:
 *   categories     (Array)   — full category list
 *   statsMap       (Object)  — { [id]: { coursesCount, jobsCount, eventsCount } }
 *   loadingStats   (boolean) — whether stats are still loading
 *   onCategoryClick (fn)     — called with slug on card click
 *   carousel       (Object)  — all carousel state from useCarousel hook
 */

import React, { useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CategoryCard from './CategoryCard';
import styles from './CategoryCarousel.module.css';

const CategoryCarousel = ({
  categories,
  statsMap,
  loadingStats,
  onCategoryClick,
  carousel,
}) => {
  const {
    currentPage,
    numPages,
    visibleCount,
    isPaused,
    handleNext,
    handlePrev,
    handleDotClick,
    handleMouseEnter,
    handleMouseLeave,
  } = carousel;

  /* Generate visible cards for current page, wrapping around if needed */
  const startIdx = currentPage * visibleCount;
  const actualVisibleCount = Math.min(visibleCount, categories.length);
  const visibleCards = [];
  
  if (categories.length > 0) {
    for (let i = 0; i < actualVisibleCount; i++) {
      const idx = (startIdx + i) % categories.length;
      visibleCards.push(categories[idx]);
    }
  }

  /* Ref for keyboard focus trap on arrows */
  const trackRef = useRef(null);

  return (
    <div
      className={styles['category-carousel']}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Categories carousel"
      aria-roledescription="carousel"
    >
      {/* ── Prev Arrow ─────────────────────────────────── */}
      <button
        id="carousel-prev-btn"
        className={`${styles['category-carousel__arrow']} ${styles['category-carousel__arrow--prev']}`}
        onClick={handlePrev}
        aria-label="Previous categories"
        type="button"
        disabled={numPages <= 1}
      >
        <FaChevronLeft size="1rem" aria-hidden="true" />
      </button>

      {/* ── Card Track ─────────────────────────────────── */}
      <div
        className={styles['category-carousel__track']}
        ref={trackRef}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Page ${currentPage + 1} of ${numPages}`}
      >
        {visibleCards.map((category, idx) => (
          <div
            key={`${category.id}-${currentPage}`}
            className={styles['category-carousel__slide']}
            style={{ animationDelay: `${idx * 0.06}s` }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${category.title}`}
          >
            <CategoryCard
              category={category}
              stats={statsMap[category.id] || {}}
              loadingStats={loadingStats}
              onCategoryClick={onCategoryClick}
            />
          </div>
        ))}
        {/* Render empty placeholders to prevent stretching if total categories < visibleCount */}
        {Array.from({ length: visibleCount - visibleCards.length }).map((_, idx) => (
          <div key={`empty-${idx}`} className={styles['category-carousel__slide']} aria-hidden="true" />
        ))}
      </div>

      {/* ── Next Arrow ─────────────────────────────────── */}
      <button
        id="carousel-next-btn"
        className={`${styles['category-carousel__arrow']} ${styles['category-carousel__arrow--next']}`}
        onClick={handleNext}
        aria-label="Next categories"
        type="button"
        disabled={numPages <= 1}
      >
        <FaChevronRight size="1rem" aria-hidden="true" />
      </button>
    </div>
  );
};

export default CategoryCarousel;
