/**
 * @file CategoriesPage.jsx
 * @description The main layout page that renders the course categories grid, background elements, and page headings.
 */
import React from 'react';
import styles from './CategoriesPage.module.css';
import FloatingDoodles from '../../FloatingDoodles/FloatingDoodles';
import CategoryGrid from '../CategoryGrid/CategoryGrid';

const CategoriesPage = () => {
  return (
    <div className={styles.pageContainer}>
      {/* ── Background decoration doodles ── */}
      <FloatingDoodles />

      {/* ── Glowing decorative blurs ── */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgGrid} />

      {/* ── Eye-catching Main Heading ── */}
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          Learning Paths
        </div>
        <h1 className={styles.heading}>
          Explore Course <span className={styles.highlight}>Categories</span>
        </h1>
        <div className={styles.waveWrap}>
          <svg viewBox="0 0 300 18" preserveAspectRatio="none" className={styles.waveSvg}>
            <path d="M0 9 Q37.5 0 75 9 T150 9 T225 9 T300 9" stroke="url(#headerWaveGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <defs>
              <linearGradient id="headerWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="50%" stopColor="#4f46e5"/>
                <stop offset="100%" stopColor="#0891b2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className={styles.subtitle}>
          Discover industry-focused academic courses designed to help you master creative, technical, and professional skills for the future.
        </p>
      </header>

      {/* ── Interactive Course Categories Grid & Search Display ── */}
      <main className={styles.mainContent}>
        <CategoryGrid />
      </main>
    </div>
  );
};

export default CategoriesPage;
