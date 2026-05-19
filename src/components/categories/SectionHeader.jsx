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
import './SectionHeader.css';

/* ── Component ───────────────────────────────────────────── */
const SectionHeader = ({
  eyebrow,
  headline,
  subText,
  align = 'center',
}) => (
  <header
    className={`section-header section-header--${align}`}
    aria-labelledby="section-header-headline"
  >
    {/* ── Eyebrow Label (e.g. "CATEGORIES") ─────────────── */}
    {eyebrow && (
      <div className="section-header__eyebrow" aria-label={eyebrow}>
        <span className="section-header__eyebrow-dot" aria-hidden="true" />
        <span className="section-header__eyebrow-text">{eyebrow}</span>
        <span className="section-header__eyebrow-dot" aria-hidden="true" />
      </div>
    )}

    {/* ── Main Headline ─────────────────────────────────── */}
    <h2
      id="section-header-headline"
      className="section-header__headline"
    >
      {headline}
    </h2>

    {/* ── Supporting Sub-text ───────────────────────────── */}
    {subText && (
      <p className="section-header__subtext">{subText}</p>
    )}

    {/* ── Decorative Underline Accent ───────────────────── */}
    <div className="section-header__accent" aria-hidden="true">
      <div className="section-header__accent-line" />
      <div className="section-header__accent-dot" />
      <div className="section-header__accent-line" />
    </div>
  </header>
);

export default SectionHeader;
