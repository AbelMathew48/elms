

import { useState } from 'react';
import { Link }     from 'react-router-dom';

export default function CategoryItem({ cat }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to="/courses"
      aria-label={`Browse ${cat.label} courses — ${cat.courses} available`}
      style={{
        textDecoration: 'none',
        display: 'block',
        
        background: hovered
          ? `linear-gradient(145deg, ${cat.color}10 0%, #ffffff 100%)`
          : 'linear-gradient(145deg, #f9faff 0%, #ffffff 100%)',

        border: `2px solid ${hovered ? cat.color + 'aa' : '#e8eaf0'}`,
        borderRadius: '16px',
        padding: '20px 16px 16px',

        boxShadow: hovered
          ? `0 14px 36px ${cat.color}28, 0 2px 10px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.04)',

        transform:  hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.3s ease',

        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* ── Icon area (mirrors the VS Code box in Switch) ────────── */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>

        {/* Icon box */}
        <div style={{
          width: '52px',
          height: '52px',
          background: hovered ? `${cat.color}22` : `${cat.color}14`,
          border:     `2px solid ${hovered ? cat.color + '70' : cat.color + '30'}`,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}>
          <i
            className={`fa ${cat.icon}`}
            style={{
              fontSize: '22px',
              color:   cat.color,
              opacity: hovered ? 1 : 0.65,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>

        {/* Status dot — top-right of icon box (like Switch's indicator dot) */}
        <div style={{
          position: 'absolute',
          top:  '-3px',
          left: '44px',
          width:  '10px',
          height: '10px',
          borderRadius: '50%',
          background:  hovered ? cat.color : '#d0d0da',
          border: `2px solid ${hovered ? cat.color + '50' : '#e8eaf0'}`,
          transition:  'background 0.3s ease, border-color 0.3s ease',
          /* pulse defined in index.css as @keyframes cat-pulse */
          animation: hovered ? 'cat-pulse 1.2s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* ── Text block ───────────────────────────────────────────── */}
      {/* Category label */}
      <div style={{
        fontFamily:  "'Jost', sans-serif",
        fontWeight:  600,
        fontSize:    '13px',
        color:       hovered ? cat.color : '#120F2D',
        transition:  'color 0.3s ease',
        marginBottom: '3px',
        lineHeight:  '1.3',
      }}>
        {cat.label}
      </div>

      {/* Course count subtitle */}
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize:   '11px',
        color:      '#9a99a2',
        opacity:    hovered ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}>
        {cat.courses} courses
      </div>

      {/* ── Bottom sliding bar (0 → 100% on hover) ───────────────── */}
      <div style={{
        position:         'absolute',
        bottom:           0,
        left:             0,
        height:           '3px',
        width:            hovered ? '100%' : '0%',
        background:       `linear-gradient(90deg, ${cat.color}60, ${cat.color})`,
        borderRadius:     '0 0 16px 16px',
        transition:       'width 0.3s ease',
      }} />
    </Link>
  );
}
