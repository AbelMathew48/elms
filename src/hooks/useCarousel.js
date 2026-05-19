/**
 * hooks/useCarousel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages all carousel state: auto-play, manual navigation, visible count
 * (responsive), and progress animation key.
 *
 * RETURNS:
 *   currentPage    : number  — active page index (0-based)
 *   numPages       : number  — total page count
 *   visibleCount   : number  — cards shown per page (responsive)
 *   isPaused       : boolean — true when auto-play is paused (hover)
 *   progressKey    : number  — increments on each slide change to reset CSS animation
 *   handleNext     : fn      — advance one page
 *   handlePrev     : fn      — go back one page
 *   handleDotClick : fn(i)   — jump to page i
 *   handleMouseEnter : fn    — pause auto-play
 *   handleMouseLeave : fn    — resume auto-play
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/* Breakpoint → visible card count mapping */
const getVisibleCount = () => {
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 900)  return 3;
  if (w >= 580)  return 2;
  return 1;
};

const useCarousel = ({ totalItems, autoPlayInterval = 4500 }) => {
  const [currentPage, setCurrentPage]   = useState(0);
  const [isPaused, setIsPaused]         = useState(false);
  const [progressKey, setProgressKey]   = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  const numPages = Math.max(1, Math.ceil(totalItems / visibleCount));

  /* ── Clamp currentPage when numPages shrinks (e.g., on resize) ── */
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, numPages - 1));
  }, [numPages]);

  /* ── Responsive: update visibleCount on window resize ─────────── */
  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Auto-play timer ───────────────────────────────────────────── */
  const timerRef = useRef(null);

  /*
   * On mobile (visibleCount === 1) the user sees only one card at a time,
   * so the default 4500 ms feels very slow. Cap it at 2200 ms on single-card view.
   */
  const effectiveInterval = visibleCount === 1
    ? Math.min(autoPlayInterval, 2200)
    : autoPlayInterval;

  const advanceSlide = useCallback(() => {
    setCurrentPage((p) => (p + 1) % numPages);
    setProgressKey((k) => k + 1);
  }, [numPages]);

  useEffect(() => {
    if (isPaused || numPages <= 1) return;
    timerRef.current = setInterval(advanceSlide, effectiveInterval);
    return () => clearInterval(timerRef.current);
  }, [isPaused, numPages, effectiveInterval, advanceSlide]);

  /* ── Navigation handlers ───────────────────────────────────────── */
  const handleNext = useCallback(() => {
    clearInterval(timerRef.current);
    setCurrentPage((p) => (p + 1) % numPages);
    setProgressKey((k) => k + 1);
  }, [numPages]);

  const handlePrev = useCallback(() => {
    clearInterval(timerRef.current);
    setCurrentPage((p) => (p - 1 + numPages) % numPages);
    setProgressKey((k) => k + 1);
  }, [numPages]);

  const handleDotClick = useCallback((pageIndex) => {
    clearInterval(timerRef.current);
    setCurrentPage(pageIndex);
    setProgressKey((k) => k + 1);
  }, []);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  return {
    currentPage,
    numPages,
    visibleCount,
    isPaused,
    progressKey,
    effectiveInterval,
    handleNext,
    handlePrev,
    handleDotClick,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useCarousel;
