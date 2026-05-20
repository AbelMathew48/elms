/**
 * @file FloatingDoodles.jsx
 * @description Renders decorative, animated background SVG illustrations (doodles) behind the main content.
 */
import React from 'react';
import styles from './FloatingDoodles.module.css';

/* ── Inline SVG doodles ── */
const BookSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="8" width="48" height="64" rx="4" stroke="currentColor" strokeWidth="3"/>
    <line x1="28" y1="8" x2="28" y2="72" stroke="currentColor" strokeWidth="2.5"/>
    <line x1="36" y1="22" x2="56" y2="22" stroke="currentColor" strokeWidth="2"/>
    <line x1="36" y1="34" x2="56" y2="34" stroke="currentColor" strokeWidth="2"/>
    <line x1="36" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const PencilSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="8" width="18" height="52" rx="3" stroke="currentColor" strokeWidth="3"/>
    <polygon points="28,60 46,60 37,76" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <line x1="28" y1="20" x2="46" y2="20" stroke="currentColor" strokeWidth="2"/>
    <rect x="28" y="8" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const GradCapSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="40,14 72,30 40,46 8,30" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M18 36v16c0 0 10 10 22 10s22-10 22-10V36" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <line x1="72" y1="30" x2="72" y2="50" stroke="currentColor" strokeWidth="2.5"/>
    <circle cx="72" cy="52" r="3" fill="currentColor"/>
  </svg>
);

const RulerSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="28" width="64" height="24" rx="4" stroke="currentColor" strokeWidth="3"/>
    <line x1="20" y1="28" x2="20" y2="38" stroke="currentColor" strokeWidth="2"/>
    <line x1="32" y1="28" x2="32" y2="34" stroke="currentColor" strokeWidth="2"/>
    <line x1="44" y1="28" x2="44" y2="38" stroke="currentColor" strokeWidth="2"/>
    <line x1="56" y1="28" x2="56" y2="34" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const AtomSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="40" rx="35" ry="14" stroke="currentColor" strokeWidth="2.5"/>
    <ellipse cx="40" cy="40" rx="35" ry="14" stroke="currentColor" strokeWidth="2.5" transform="rotate(60 40 40)"/>
    <ellipse cx="40" cy="40" rx="35" ry="14" stroke="currentColor" strokeWidth="2.5" transform="rotate(120 40 40)"/>
    <circle cx="40" cy="40" r="5" fill="currentColor"/>
  </svg>
);

const FormulaText = () => (
  <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="2" y="38" fontFamily="serif" fontSize="36" fill="currentColor" opacity="0.9">E=mc²</text>
  </svg>
);

const NotebookSVG = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="8" width="48" height="64" rx="4" stroke="currentColor" strokeWidth="3"/>
    <line x1="16" y1="24" x2="64" y2="24" stroke="currentColor" strokeWidth="2"/>
    <line x1="26" y1="36" x2="54" y2="36" stroke="currentColor" strokeWidth="2"/>
    <line x1="26" y1="46" x2="54" y2="46" stroke="currentColor" strokeWidth="2"/>
    <line x1="26" y1="56" x2="46" y2="56" stroke="currentColor" strokeWidth="2"/>
    <rect x="10" y="20" width="8" height="32" rx="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

const StarSVG = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2L24 16H38L27 24L31 38L20 30L9 38L13 24L2 16H16L20 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

/* ── Doodle positions & styles ── */
const doodles = [
  { id: 1, Component: BookSVG,     top: '6%',  left: '2%',   size: '6%',  color: '#7c3aed', animClass: 'floatA', delay: '0s',    opacity: 0.18 },
  { id: 2, Component: PencilSVG,  top: '14%', right: '3%',  size: '4%',  color: '#db2777', animClass: 'floatB', delay: '0.8s',  opacity: 0.16 },
  { id: 3, Component: GradCapSVG, top: '2%',  right: '12%', size: '7%',  color: '#0891b2', animClass: 'floatC', delay: '1.2s',  opacity: 0.15 },
  { id: 4, Component: AtomSVG,    top: '35%', left: '1%',   size: '5%',  color: '#059669', animClass: 'floatA', delay: '2s',    opacity: 0.14 },
  { id: 5, Component: RulerSVG,   top: '55%', right: '2%',  size: '5%',  color: '#d97706', animClass: 'floatB', delay: '0.5s',  opacity: 0.14 },
  { id: 6, Component: FormulaText,top: '70%', left: '3%',   size: '9%',  color: '#7c3aed', animClass: 'floatC', delay: '1.6s',  opacity: 0.12 },
  { id: 7, Component: NotebookSVG,top: '80%', right: '4%',  size: '5%',  color: '#ea580c', animClass: 'floatA', delay: '0.3s',  opacity: 0.15 },
  { id: 8, Component: StarSVG,    top: '22%', left: '6%',   size: '3%',  color: '#f59e0b', animClass: 'floatB', delay: '1.9s',  opacity: 0.22 },
  { id: 9, Component: GradCapSVG, top: '60%', left: '8%',   size: '4%',  color: '#2563eb', animClass: 'floatC', delay: '1s',    opacity: 0.13 },
  { id:10, Component: PencilSVG,  top: '88%', left: '18%',  size: '3%',  color: '#db2777', animClass: 'floatA', delay: '2.4s',  opacity: 0.12 },
  { id:11, Component: AtomSVG,    top: '10%', left: '40%',  size: '4%',  color: '#059669', animClass: 'floatB', delay: '1.5s',  opacity: 0.10 },
  { id:12, Component: StarSVG,    top: '45%', right: '10%', size: '3%',  color: '#7c3aed', animClass: 'floatC', delay: '0.7s',  opacity: 0.18 },
];

const FloatingDoodles = () => (
  <div className={styles.doodleContainer} aria-hidden="true">
    {doodles.map(({ id, Component, top, left, right, size, color, animClass, delay, opacity }) => (
      <div
        key={id}
        className={`${styles.doodle} ${styles[animClass]}`}
        style={{
          top, left, right,
          width: size, minWidth: '28px',
          color, opacity,
          animationDelay: delay,
        }}
      >
        <Component />
      </div>
    ))}
  </div>
);

export default FloatingDoodles;
