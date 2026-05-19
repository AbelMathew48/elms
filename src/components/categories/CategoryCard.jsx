/**
 * components/categories/CategoryCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Individual category card. Stats (courses/jobs/events) come in via `stats`
 * prop — loaded dynamically by useCategoryStats, not hardcoded.
 *
 * PROPS:
 *   category       (Object)   — metadata from categoriesData.js
 *   stats          (Object)   — { coursesCount, jobsCount, eventsCount }
 *   loadingStats   (boolean)  — true while API stats are loading
 *   onCategoryClick (function) — called with slug on click
 */

import React from 'react';
import { FaBook, FaBriefcase, FaCalendarAlt, FaFire } from 'react-icons/fa';
import CategoryIcon from './CategoryIcon';
import './CategoryCard.css';

/* ── Color Scheme Registry ─────────────────────────────── */
const colorSchemes = {
  purple:  { primary: '#6c3de8', light: '#ede9fe', glow: 'rgba(108,61,232,0.15)' },
  blue:    { primary: '#2563eb', light: '#dbeafe', glow: 'rgba(37,99,235,0.15)'  },
  orange:  { primary: '#ea580c', light: '#ffedd5', glow: 'rgba(234,88,12,0.15)'  },
  cyan:    { primary: '#0891b2', light: '#cffafe', glow: 'rgba(8,145,178,0.15)'  },
  pink:    { primary: '#db2777', light: '#fce7f3', glow: 'rgba(219,39,119,0.15)' },
  green:   { primary: '#16a34a', light: '#dcfce7', glow: 'rgba(22,163,74,0.15)'  },
  violet:  { primary: '#7c3aed', light: '#ede9fe', glow: 'rgba(124,58,237,0.15)' },
  teal:    { primary: '#0f766e', light: '#ccfbf1', glow: 'rgba(15,118,110,0.15)' },
  red:     { primary: '#dc2626', light: '#fee2e2', glow: 'rgba(220,38,38,0.15)'  },
  amber:   { primary: '#d97706', light: '#fef3c7', glow: 'rgba(217,119,6,0.15)'  },
  indigo:  { primary: '#4338ca', light: '#e0e7ff', glow: 'rgba(67,56,202,0.15)'  },
  rose:    { primary: '#e11d48', light: '#ffe4e6', glow: 'rgba(225,29,72,0.15)'  },
};

/* ── Stat Item Sub-component ───────────────────────────── */
const StatItem = ({ icon, count, label, color, isLoading }) => (
  <div className="category-card__stat" role="listitem" aria-label={`${count} ${label}`}>
    <span className="category-card__stat-icon" style={{ color }} aria-hidden="true">{icon}</span>
    {/* Show skeleton shimmer while stats load from API */}
    {isLoading
      ? <span className="category-card__stat-skeleton" aria-label="Loading" />
      : <span className="category-card__stat-count">{count ?? '—'}</span>
    }
    <span className="category-card__stat-label">{label}</span>
  </div>
);

/* ── Main Component ─────────────────────────────────────── */
const CategoryCard = ({ category, stats = {}, loadingStats = false, onCategoryClick }) => {
  const { id, title, iconName, colorScheme, slug, isPopular, enrollmentCount } = category;
  const { coursesCount, jobsCount, eventsCount } = stats;

  const scheme = colorSchemes[colorScheme] || colorSchemes.purple;

  const handleClick = () => {
    if (typeof onCategoryClick === 'function') onCategoryClick(slug);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
  };

  return (
    <article
      className="category-card"
      id={`category-card-${id}`}
      role="button"
      tabIndex={0}
      aria-label={`Explore ${title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        '--card-color':       scheme.primary,
        '--card-color-light': scheme.light,
        '--card-color-glow':  scheme.glow,
      }}
    >
      {/* Popular badge — set dynamically from enrollmentCount threshold */}
      {isPopular && (
        <div className="category-card__badge" aria-label="Trending">
          <FaFire aria-hidden="true" size="0.6rem" />
          <span>Trending</span>
        </div>
      )}

      {/* Enrolled count (top-left) — dynamic from backend */}
      <div className="category-card__enrolled" title="Total enrolled students">
        <span>{enrollmentCount?.toLocaleString()}</span>
        <span className="category-card__enrolled-label">enrolled</span>
      </div>

      {/* Icon */}
      <div className="category-card__icon-wrap" aria-hidden="true">
        <div className="category-card__icon-bg">
          <CategoryIcon iconName={iconName} size="1.6rem" color={scheme.primary} />
        </div>
      </div>

      {/* Title */}
      <h3 className="category-card__title">{title}</h3>

      {/* Divider */}
      <div className="category-card__divider" aria-hidden="true" />

      {/* Dynamic stats row */}
      <div className="category-card__stats" role="list">
        <StatItem icon={<FaBook size="0.65rem" />}        count={coursesCount} label="Courses" color={scheme.primary} isLoading={loadingStats} />
        <StatItem icon={<FaBriefcase size="0.65rem" />}   count={jobsCount}    label="Jobs"    color={scheme.primary} isLoading={loadingStats} />
        <StatItem icon={<FaCalendarAlt size="0.65rem" />} count={eventsCount}  label="Events"  color={scheme.primary} isLoading={loadingStats} />
      </div>

      {/* Hover glow overlay */}
      <div className="category-card__glow" aria-hidden="true" />
    </article>
  );
};

export default CategoryCard;
