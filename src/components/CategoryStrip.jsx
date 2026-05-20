

import { useState, useEffect, useRef } from 'react';
import CategoryItem from './CategoryItem';
import { Link }     from 'react-router-dom';

export default function CategoryStrip({ categories }) {
  
  if (!categories || categories.length === 0) return null;

  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  
  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      
      if (scrollWidth <= clientWidth) {
        setShowLeftArrow(false);
        setShowRightArrow(false);
        return;
      }
      
      
      setShowLeftArrow(scrollLeft > 15);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      
      checkScrollButtons();
      
      
      const timer = setTimeout(checkScrollButtons, 150);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
        clearTimeout(timer);
      };
    }
  }, [categories]);


  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        
        const firstCard = scrollRef.current.querySelector('.category-card-wrapper');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 200;
        const step = cardWidth + 20; // card width + 20px gap
        
        
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        width: '100%',
        paddingTop: '48px',
        paddingBottom: '48px',
        background: '#f4f8ff',
      }}
    >
      <div style={{
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
        paddingBottom: '16px',
      }}>

        {/* ── Section header ──────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <h6 style={{
                display: 'inline-block',
                position: 'relative',
                color: '#F14D5D',
                textTransform: 'uppercase',
                paddingBottom: '8px',
                margin: 0,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}>
                Browse Categories
              </h6>
            </div>
            <h2 style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 700,
              color: '#120F2D',
              margin: 0,
              fontSize: '1.6rem',
            }}>
              Find The Right Course For You
            </h2>
          </div>

          {/* "View all" link — visible on md and above */}
          <Link
            to="/courses"
            style={{
              fontFamily:   "'Jost', sans-serif",
              fontWeight:   600,
              fontSize:     '13px',
              color:        '#2878EB',
              textDecoration: 'none',
              flexShrink:   0,
              display: 'none',
            }}
            className="category-view-all-link"
          >
            View all &nbsp;
            <i className="fa fa-arrow-right" style={{ fontSize: '11px' }} />
          </Link>
        </div>

        {/* ── Slider wrapper with relative positioning for arrows ───── */}
        <div style={{ position: 'relative' }} className="category-slider-wrapper">
          
          {/* Left Arrow Button with Premium Fade and Custom Slide Animation */}
          <button
            onClick={handleScrollLeft}
            className="category-slider-arrow-btn left-arrow-btn"
            style={{
              opacity: showLeftArrow ? 1 : 0,
              visibility: showLeftArrow ? 'visible' : 'hidden',
              pointerEvents: showLeftArrow ? 'auto' : 'none',
            }}
            aria-label="Scroll left"
          >
            <div className="arrow-btn-box">
              <span className="arrow-btn-elem">
                <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
                </svg>
              </span>
              <span className="arrow-btn-elem">
                <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
                </svg>
              </span>
            </div>
          </button>

          {/* Right Arrow Button with Premium Fade and Custom Slide Animation */}
          <button
            onClick={handleScrollRight}
            className="category-slider-arrow-btn right-arrow-btn"
            style={{
              opacity: showRightArrow ? 1 : 0,
              visibility: showRightArrow ? 'visible' : 'hidden',
              pointerEvents: showRightArrow ? 'auto' : 'none',
            }}
            aria-label="Scroll right"
          >
            <div className="arrow-btn-box">
              <span className="arrow-btn-elem">
                <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
                </svg>
              </span>
              <span className="arrow-btn-elem">
                <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
                </svg>
              </span>
            </div>
          </button>

          {/* Horizontal Slider container */}
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '12px 0 24px', // bottom padding ensures the card lifts/hover animations aren't cut off, 0 horizontal padding
              margin: 0, // no horizontal margins so card widths fit 100% of container perfectly
              scrollSnapType: 'x mandatory', // Enable horizontal scroll snapping
            }}
            className="category-slider"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="category-card-wrapper"
              >
                <CategoryItem cat={cat} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Embedded CSS for scrollbar hiding, snaps, larger card sizes, and responsiveness */}
      <style>{`
        .category-slider::-webkit-scrollbar {
          display: none;
        }

        .category-view-all-link {
          display: none;
          align-items: center;
        }

        @media (min-width: 768px) {
          .category-view-all-link {
            display: inline-flex !important;
          }
        }

        .category-card-wrapper {
          flex: 0 0 calc((100% - 20px) / 2); /* mobile: exactly 2 cards fit */
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        .category-card-wrapper:last-child {
          scroll-snap-align: start end; /* ensures final card snaps beautifully to the right edge at scroll ending */
        }

        @media (min-width: 576px) {
          .category-card-wrapper {
            flex: 0 0 calc((100% - 40px) / 3); /* small tablet: exactly 3 cards fit */
          }
        }

        @media (min-width: 768px) {
          .category-card-wrapper {
            flex: 0 0 calc((100% - 60px) / 4); /* medium tablet: exactly 4 cards fit */
          }
        }

        @media (min-width: 992px) {
          .category-card-wrapper {
            flex: 0 0 calc((100% - 80px) / 5); /* desktop: exactly 5 cards fit (minimum 5!) */
          }
        }

        @media (max-width: 575.98px) {
          .category-slider-arrow-btn {
            display: none !important;
          }
        }

        /* ----- Custom Premium Arrow Buttons Styling ----- */
        .category-slider-arrow-btn {
          display: block;
          position: absolute;
          width: 56px;
          height: 56px;
          margin: 0;
          overflow: hidden;
          outline: none;
          background-color: transparent;
          cursor: pointer;
          border: 0;
          z-index: 10;
          top: 50%;
          transform: translateY(-50%);
          transition: all 0.3s ease, opacity 0.4s ease, visibility 0.4s ease;
        }

        .left-arrow-btn {
          left: -28px;
        }

        .right-arrow-btn {
          right: -28px;
        }

        .category-slider-arrow-btn:before,
        .category-slider-arrow-btn:after {
          content: "";
          position: absolute;
          border-radius: 50%;
          inset: 7px;
        }

        .category-slider-arrow-btn:before {
          border: 4px solid #120F2D1a; /* elegant dark transparent border */
          transition: opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
            transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
        }

        .category-slider-arrow-btn:after {
          border: 4px solid #2878EB; /* primary brand blue */
          transform: scale(1.3);
          transition: opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
            transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
        }

        .category-slider-arrow-btn:hover:before,
        .category-slider-arrow-btn:focus:before {
          opacity: 0;
          transform: scale(0.7);
          transition: opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
            transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .category-slider-arrow-btn:hover:after,
        .category-slider-arrow-btn:focus:after {
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
            transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
        }

        .arrow-btn-box {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
        }

        .arrow-btn-elem {
          display: block;
          width: 20px;
          height: 20px;
          margin: 17px 18px 0 18px;
          fill: #120F2D; /* elegant dark fill color */
          transition: fill 0.3s ease;
        }

        .left-arrow-btn .arrow-btn-elem {
          transform: rotate(180deg); /* points left */
        }

        .right-arrow-btn .arrow-btn-elem {
          transform: rotate(0deg); /* points right */
        }

        /* Sliding continuous animation on hover */
        .category-slider-arrow-btn:hover .arrow-btn-box,
        .category-slider-arrow-btn:focus .arrow-btn-box {
          transition: 0.4s;
          transform: translateX(-56px);
        }

        .category-slider-arrow-btn:hover .arrow-btn-elem {
          fill: #2878EB; /* changes to primary blue on hover */
        }

        @keyframes cat-pulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
    
  );
}
