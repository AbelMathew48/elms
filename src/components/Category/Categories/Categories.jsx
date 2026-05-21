/**
 * @file Categories.jsx
 * @description Main categories section component that coordinates tabs, carousel, and featured content.
 */
import React, { useState, useEffect, useRef } from 'react';
import { categories } from '../../../data/data';
import styles from './Categories.module.css';

const Categories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);
  const scrollWrapperRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) setItemsPerPage(1);
      else if (window.innerWidth <= 768) setItemsPerPage(2);
      else if (window.innerWidth <= 992) setItemsPerPage(3);
      else if (window.innerWidth <= 1200) setItemsPerPage(4);
      else setItemsPerPage(5);
      
      if (window.innerWidth > 768 && scrollWrapperRef.current) {
        scrollWrapperRef.current.scrollLeft = 0;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure currentIndex is valid when screen resizes and itemsPerPage changes
  useEffect(() => {
    const maxIndex = Math.max(0, Math.ceil(categories.length / itemsPerPage) - 1);
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerPage, currentIndex]);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery]);

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleClick = (category) => {
    // On click/tap, toggle the active card for the flip animation
    setActiveCardId(prev => prev === category.id ? null : category.id);
  };

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleScroll = (e) => {
    setActiveCardId(null); // Reset flipped card on scroll
    
    const element = e.target;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 0) return;
    
    const progress = element.scrollLeft / maxScroll;
    const maxIndex = Math.max(0, Math.ceil(filteredCategories.length / itemsPerPage) - 1);
    const newIndex = Math.round(progress * maxIndex);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const currentShown = Math.min((currentIndex + 1) * itemsPerPage, totalItems);

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.categoriesContainer}>
        <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Top Categories</h2>
          <p className={styles.subtitle}>Explore our popular learning paths</p>
        </div>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search categories..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className={styles.carouselSection}>
        <button 
          className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`} 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous categories"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className={styles.scrollWrapper} onScroll={handleScroll} ref={scrollWrapperRef}>
          <div 
            className={styles.categoriesGrid}
            style={{ transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 1.5}rem))` }}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button 
                  key={category.id} 
                  className={`${styles.categoryCard} ${activeCardId === category.id ? styles.flipped : ''}`}
                  onClick={() => handleClick(category)}
                  onMouseLeave={() => setActiveCardId(null)}
                  style={{ '--hover-bg': category.bgColor }}
                >
                  <div className={styles.cardFront}>
                    <div 
                      className={styles.iconContainer}
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <span className={styles.icon}>{category.icon}</span>
                    </div>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                    <p className={styles.coursesCount}>{category.courses} Courses</p>
                    <div className={styles.exploreLink}>
                      <span>Explore</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={styles.cardBack}>
                    <h3 className={styles.backTitle}>{category.name}</h3>
                    <p className={styles.description}>{category.description}</p>
                    <div className={styles.exploreLinkBack}>
                      <span>Explore</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>No categories found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        <button 
          className={`${styles.navButton} ${currentIndex >= totalPages - 1 ? styles.disabled : ''}`} 
          onClick={handleNext}
          disabled={currentIndex >= totalPages - 1}
          aria-label="Next categories"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className={styles.paginationInfo}>
        <div className={styles.paginationText}>
          {totalItems > 0 ? `Showing ${currentShown} of ${totalItems}` : 'No results'}
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${totalItems === 0 ? 0 : (currentShown / totalItems) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  </section>
);
};

export default Categories;
