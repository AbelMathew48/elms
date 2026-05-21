/**
 * components/categories/CarouselProgress.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Progress bar + dot indicators shown below the card row.
 * Communicates to users they can navigate between pages.
 *
 * PROPS:
 *   currentPage    (number)   — active page index
 *   numPages       (number)   — total pages
 *   isPaused       (boolean)  — auto-play paused state (used only for progress bar pause)
 *   progressKey    (number)   — changes on each slide to reset CSS animation
 *   autoPlayInterval (number) — milliseconds per slide (for animation-duration)
 *   onDotClick     (fn)       — called with page index on dot click
 */

import React from 'react';
import styles from './CarouselProgress.module.css';

const CarouselProgress = ({
  currentPage,
  numPages,
  isPaused,
  progressKey,
  autoPlayInterval = 4500,
  onDotClick,
}) => (
  <div className={styles['carousel-progress']} aria-label="Carousel navigation">


    {/* ── Progress Bar ───────────────────────────────── */}

    <div className={styles['carousel-progress__bar-wrap']} aria-hidden="true">
      {/* key on Fragment forces remount (CSS animation restart) on each slide change */}
      <React.Fragment key={`progress-${progressKey}`}>
        <div
          className={`${styles['carousel-progress__bar-fill']} ${isPaused ? styles['carousel-progress__bar-fill--paused'] : ''}`}
          style={{ animationDuration: `${autoPlayInterval}ms` }}
        />
      </React.Fragment>
    </div>

    {/* ── Dot Indicators ─────────────────────────────── */}
    <div className={styles['carousel-progress__dots']} role="tablist" aria-label="Slide navigation">
      {Array.from({ length: numPages }, (_, i) => (
        <button
          key={i}
          id={`carousel-dot-${i}`}
          type="button"
          role="tab"
          aria-selected={i === currentPage}
          aria-label={`Go to slide ${i + 1} of ${numPages}`}
          className={`${styles['carousel-progress__dot']} ${i === currentPage ? styles['carousel-progress__dot--active'] : ''}`}
          onClick={() => onDotClick(i)}
        />
      ))}
    </div>

    {/* ── Navigation hint text ───────────────────────── */}
    <p className={styles['carousel-progress__hint']} aria-hidden="true">
      Use arrows or dots to navigate
    </p>

  </div>
);

export default CarouselProgress;
