/**
 * components/categories/CategoryGrid.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Renders the responsive CSS grid of CategoryCard components.
 *   Handles both the populated state and the empty state gracefully.
 *
 *   Receives filtered categories from CategoriesSection.jsx and maps
 *   each item to a CategoryCard.
 *
 * PROPS:
 *   categories     (Array)    — Array of category objects to display
 *   onCategoryClick (function) — Passed down to each CategoryCard
 *
 * USAGE:
 *   <CategoryGrid
 *     categories={filteredCategories}
 *     onCategoryClick={handleCategoryClick}
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { FaSearch } from 'react-icons/fa';
import CategoryCard from './CategoryCard';
import styles from './CategoryGrid.module.css';

/* ── Empty State Sub-Component ───────────────────────────── */
/**
 * EmptyState
 * Shown when the filtered results return no categories.
 * Reusable pattern for graceful empty handling.
 */
const EmptyState = () => (
  <div className={styles['category-grid__empty']} role="status" aria-live="polite">
    <div className={styles['category-grid__empty-icon']} aria-hidden="true">
      <FaSearch size="2.5rem" />
    </div>
    <h3 className={styles['category-grid__empty-title']}>No Categories Found</h3>
    <p className={styles['category-grid__empty-text']}>
      Try selecting a different filter to explore more categories.
    </p>
  </div>
);

/* ── Main Component ──────────────────────────────────────── */
/**
 * CategoryGrid
 * Renders a CSS Grid layout of category cards, with an entry animation
 * applied to each card via CSS animation-delay based on its index.
 */
const CategoryGrid = ({ categories, onCategoryClick }) => {
  /* Render empty state when no categories match the filter */
  if (!categories || categories.length === 0) {
    return <EmptyState />;
  }

  return (
    <section
      className={styles['category-grid']}
      aria-label="Categories grid"
    >
      {categories.map((category, index) => (
        <div
          key={category.id}
          className={styles['category-grid__item']}
          /* Stagger entry animation per card using inline delay */
          style={{ animationDelay: `${index * 0.07}s` }}
        >
          <CategoryCard
            category={category}
            onCategoryClick={onCategoryClick}
          />
        </div>
      ))}
    </section>
  );
};

export default CategoryGrid;
