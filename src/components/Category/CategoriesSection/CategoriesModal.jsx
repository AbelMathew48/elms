/**
 * components/categories/CategoriesModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen overlay that shows ALL categories in a grid.
 * Opens when "Browse All Categories" is clicked — no page navigation,
 * no reload. Uses React Portal to mount outside the section DOM tree.
 *
 * PROPS:
 *   isOpen         (boolean)  — controls visibility
 *   onClose        (function) — called to close the modal
 *   categories     (Array)    — full category list
 *   statsMap       (Object)   — { [id]: { coursesCount, jobsCount, eventsCount } }
 *   loadingStats   (boolean)  — whether stats are still being fetched
 *   onCategoryClick (function) — called with slug when a card is clicked
 *
 * ACCESSIBILITY:
 *   - focus-trap: first focusable element receives focus on open
 *   - Escape key closes the modal
 *   - aria-modal, role="dialog" for screen readers
 *   - body scroll is locked while open
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaLayerGroup } from 'react-icons/fa';
import CategoryCard from './CategoryCard';
import styles from './CategoriesModal.module.css';

/* ── Component ──────────────────────────────────────────── */
const CategoriesModal = ({
  isOpen,
  onClose,
  categories,
  statsMap,
  loadingStats,
  onCategoryClick,
}) => {
  const closeBtnRef = useRef(null);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      /* Focus the close button on open for accessibility */
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Close on Escape key */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  /* Handle card click — close modal then fire parent handler */
  const handleCardClick = useCallback((slug) => {
    onClose();
    onCategoryClick(slug);
  }, [onClose, onCategoryClick]);

  /* Don't render portal content when closed */
  if (!isOpen) return null;

  return createPortal(
    /* ── Backdrop ───────────────────────────────────────── */
    <div
      className={styles['cat-modal__backdrop']}
      role="dialog"
      aria-modal="true"
      aria-label="All Categories"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal Panel ──────────────────────────────────── */}
      <div className={styles['cat-modal__panel']}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles['cat-modal__header']}>
          <div className={styles['cat-modal__header-left']}>
            <span className={styles['cat-modal__header-icon']} aria-hidden="true">
              <FaLayerGroup size="1.1rem" />
            </span>
            <div>
              <h2 id="cat-modal-title" className={styles['cat-modal__title']}>
                All Categories
              </h2>
              <p className={styles['cat-modal__subtitle']}>
                {categories.length} categories available
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            id="cat-modal-close-btn"
            ref={closeBtnRef}
            type="button"
            className={styles['cat-modal__close-btn']}
            onClick={onClose}
            aria-label="Close categories panel"
          >
            <FaTimes size="1rem" aria-hidden="true" />
          </button>
        </div>

        {/* ── Divider ────────────────────────────────────── */}
        <div className={styles['cat-modal__divider']} aria-hidden="true" />

        {/* ── Category Grid ──────────────────────────────── */}
        <div
          className={styles['cat-modal__grid']}
          role="list"
          aria-label="All learning categories"
        >
          {categories.map((category, idx) => (
            <div
              key={category.id}
              className={styles['cat-modal__grid-item']}
              role="listitem"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <CategoryCard
                category={category}
                stats={statsMap[category.id] || {}}
                loadingStats={loadingStats}
                onCategoryClick={handleCardClick}
              />
            </div>
          ))}
        </div>

      </div>
    </div>,
    document.body /* Portal target */
  );
};

export default CategoriesModal;
