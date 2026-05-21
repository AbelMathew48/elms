/**
 * components/categories/SectionHeader.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Renders the styled section header (eyebrow label, headline, sub-text)
 *   at the top of the Categories section.
 *
 *   Extracted as a separate component so it can be reused in other
 *   sections across the LMS (e.g., Courses, Events, Jobs) with
 *   different content passed via props.
 *
 * PROPS:
 *   eyebrow    (string)        — Small label above the headline (e.g. "CATEGORIES")
 *   headline   (string|node)   — Main H2 heading text
 *   subText    (string)        — Supporting paragraph below the headline
 *   align      ('left'|'center'|'right') — Text alignment (default: 'center')
 *
 * USAGE:
 *   <SectionHeader
 *     eyebrow="CATEGORIES"
 *     headline="Explore Top Categories"
 *     subText="Find the perfect course..."
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import styles from './SectionHeader.module.css';

/* ── Component ───────────────────────────────────────────── */
const SectionHeader = ({
  eyebrow,
  headline,
  subText,
  align = 'center',
}) => (
  <header
    className={`${styles['section-header']} ${styles[`section-header--${align}`]}`}
    aria-labelledby="section-header-headline"
  >
    {/* ── Eyebrow Label (e.g. "CATEGORIES") ─────────────── */}
    {eyebrow && (
      <div className={styles['section-header__eyebrow']} aria-label={eyebrow}>
        <span className={styles['section-header__eyebrow-dot']} aria-hidden="true" />
        <span className={styles['section-header__eyebrow-text']}>{eyebrow}</span>
        <span className={styles['section-header__eyebrow-dot']} aria-hidden="true" />
      </div>
    )}

    {/* ── Main Headline ─────────────────────────────────── */}
    <h2
      id="section-header-headline"
      className={styles['section-header__headline']}
    >
      {headline}
    </h2>

    {/* ── Supporting Sub-text ───────────────────────────── */}
    {subText && (
      <p className={styles['section-header__subtext']}>{subText}</p>
    )}

    {/* ── Decorative Underline Accent ───────────────────── */}
    <div className={styles['section-header__accent']} aria-hidden="true">
      <div className={styles['section-header__accent-line']} />
      <div className={styles['section-header__accent-dot']} />
      <div className={styles['section-header__accent-line']} />
    </div>
  </header>
);

export default SectionHeader;
