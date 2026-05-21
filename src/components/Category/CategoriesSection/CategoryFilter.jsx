/**
 * components/categories/CategoryFilter.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Filter/tab bar rendered above the category grid.
 *   Allows users to filter the displayed categories by type
 *   (All / Popular). Easily extendable to add more filter types.
 *
 * PROPS:
 *   activeFilter  (string)   — Currently active filter key
 *   filters       (Array)    — Array of { key, label } filter objects
 *   onFilterChange (function) — Callback receives selected filter key
 *   totalCount    (number)   — Total categories count (displayed as badge)
 *
 * USAGE:
 *   <CategoryFilter
 *     activeFilter={activeFilter}
 *     filters={filterOptions}
 *     onFilterChange={handleFilterChange}
 *     totalCount={12}
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import styles from './CategoryFilter.module.css';

/* ── Component ───────────────────────────────────────────── */
const CategoryFilter = ({
  activeFilter,
  filters,
  onFilterChange,
  totalCount,
}) => {
  /**
   * handleFilterClick
   * Updates the active filter state in the parent component.
   * @param {string} filterKey — Key of the clicked filter
   */
  const handleFilterClick = (filterKey) => {
    onFilterChange(filterKey);
  };

  /**
   * handleFilterKeyDown
   * Keyboard navigation support for filter buttons.
   */
  const handleFilterKeyDown = (event, filterKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFilterClick(filterKey);
    }
  };

  return (
    <div className={styles['category-filter']} role="tablist" aria-label="Category filters">
      {/* ── Filter Buttons ─────────────────────────────── */}
      <div className={styles['category-filter__tabs']}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              id={`filter-tab-${filter.key}`}
              className={`${styles['category-filter__tab']} ${isActive ? styles['category-filter__tab--active'] : ''}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleFilterClick(filter.key)}
              onKeyDown={(e) => handleFilterKeyDown(e, filter.key)}
              type="button"
            >
              {/* Optional icon */}
              {filter.icon && (
                <span className={styles['category-filter__tab-icon']} aria-hidden="true">
                  {filter.icon}
                </span>
              )}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Total Count Badge ──────────────────────────── */}
      <div className={styles['category-filter__count']} aria-live="polite">
        <span className={styles['category-filter__count-number']}>{totalCount}</span>
        <span className={styles['category-filter__count-label']}>Categories</span>
      </div>
    </div>
  );
};

export default CategoryFilter;
