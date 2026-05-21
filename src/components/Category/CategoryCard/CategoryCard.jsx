/**
 * @file CategoryCard.jsx
 * @description A highly interactive, expandable UI card displaying course statistics, icons, and dynamic hover effects.
 */
import React, { useState } from 'react';
import styles from './CategoryCard.module.css';

const WebDevIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
);

const AIFuturisticIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const DataScienceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UIUXIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6V12L16 14" />
  </svg>
);

const SecurityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MobileAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const CloudComputingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const RoboticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M21 9H3M21 15H3M12 3v18" />
  </svg>
);

const MarketingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <path d="M23 7a2 2 0 0 0-2.45-1.45L11 8.75V3c0-1.1-.9-2-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7c1.1 0 2-.9 2-2v-2.75l7.55 3.2A2 2 0 0 0 23 12.5V7z" />
  </svg>
);

const GraphicDesignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const FinanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const PhotographyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.categorySvg}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// Map of Custom vector icons
const iconMap = {
  'Web Development': <WebDevIcon />,
  'Artificial Intelligence': <AIFuturisticIcon />,
  'Data Science': <DataScienceIcon />,
  'UI/UX Design': <UIUXIcon />,
  'Cyber Security': <SecurityIcon />,
  'Mobile App Dev': <MobileAppIcon />,
  'Cloud Computing': <CloudComputingIcon />,
  'Robotics': <RoboticsIcon />,
  'Digital Marketing': <MarketingIcon />,
  'Graphic Design': <GraphicDesignIcon />,
  'Finance & Banking': <FinanceIcon />,
  'Photography': <PhotographyIcon />,
};

const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={styles.starIcon}>
    <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.5l-3.7 1.9.7-4.1-3-2.9 4.2-.9z" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className={styles.arrowIcon}>
    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className={styles.metaIcon}>
    <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 17c0-3.3 2.7-6 6-6h0m5-4a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6 10c0-3.3-2.7-6-6-6h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className={styles.metaIcon}>
    <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="7" y1="2" x2="7" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="10" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" />
    <line x1="10" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CategoryCard = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    title, emoji, gradient, bgPastel,
    accentColor, glowColor, borderGlow,
    courses, students, rating,
    difficulty, difficultyColor, difficultyBg,
    trending, isNew, description, tags,
  } = category;

  const renderIcon = () => iconMap[title] || <span className={styles.emojiIcon}>{emoji}</span>;

  return (
    <div className={styles.cardWrapper}>
      <article
        className={styles.card}
        data-expanded={isExpanded}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          '--accent': accentColor,
          '--glow': glowColor,
          '--border-glow': borderGlow,
          '--gradient': gradient,
          '--bg-pastel': bgPastel,
        }}
        tabIndex={0}
        role="button"
        aria-label={`Explore ${title} courses`}
      >
        {/* Glowing border overlay */}
        <div className={styles.glowBorder} />

        {/* Close Button (Mobile Only) */}
        <button
          className={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsExpanded(false);
            document.activeElement?.blur();

            // Force mobile browsers to drop the "sticky hover" state
            const card = e.currentTarget.closest('article');
            if (card) {
              card.style.pointerEvents = 'none';
              setTimeout(() => {
                card.style.pointerEvents = '';
              }, 50);
            }
          }}
          aria-label="Close card"
        >
          &times;
        </button>

        {/* ── ALWAYS VISIBLE TOP PART ── */}
        <div className={styles.headerPart}>
          <div className={styles.iconBg} style={{ background: bgPastel }}>
            {renderIcon()}
            <div className={styles.iconGlow} />
          </div>
          <h3
            className={styles.title}
            onMouseEnter={() => setIsExpanded(true)}
          >
            {title}
          </h3>
        </div>

        {/* ── EXPANDABLE DETAIL PART (Revealed on Hover) ── */}
        <div className={styles.expandablePart}>
          {/* Badges */}
          <div className={styles.badgeRow}>
            {trending && <span className={styles.badgeTrending}>🔥 Trending</span>}
            {isNew && <span className={styles.badgeNew}>✨ New</span>}
            <span
              className={styles.diffBadge}
              style={{ color: difficultyColor, background: difficultyBg }}
            >
              {difficulty}
            </span>
          </div>

          {/* Description */}
          <p className={styles.description}>{description}</p>

          {/* Tags */}
          <div className={styles.tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <BookIcon />
              <span><strong>{courses}</strong> Courses</span>
            </div>
            <div className={styles.statItem}>
              <UsersIcon />
              <span><strong>{students}</strong> Students</span>
            </div>
            <div className={styles.statItem}>
              <StarIcon />
              <span><strong>{rating}</strong></span>
            </div>
          </div>

          {/* Explore Button */}
          <button
            className={styles.exploreBtn}
            onClick={(e) => {
              e.stopPropagation();
              document.activeElement?.blur();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>Explore More</span>
            <ArrowIcon />
          </button>
        </div>

        {/* Bottom gradient accent line */}
        <div className={styles.accentLine} style={{ background: gradient }} />
      </article>
    </div>
  );
};

export default CategoryCard;
