/**
 * @file PopularCategories.jsx
 * @description Displays the popular category carousel on the homepage.
 */
import React, { useRef, useState, useEffect } from 'react';
import { categorieData } from '../../../data/data.js';
import styles from './PopularCategories.module.css';

// Highly reusable Category Card Component
const CategoryCard = ({ category }) => (
  <div className={styles['carousel-card']}>
    <div className={styles['flip-card-inner']}>
      <div className={styles['flip-card-front']}>
        <div 
          className={styles['carousel-icon-box']} 
          style={{ backgroundColor: category.bgColor, color: category.color }}
        >
          <i className={category.icon}></i>
        </div>
        <span className={styles['carousel-card-title']}>{category.title}</span>
      </div>
      <div className={styles['flip-card-back']}>
        <div 
          className={styles['carousel-icon-box']} 
          style={{ backgroundColor: category.bgColor, color: category.color }}
        >
          <i className={category.icon}></i>
        </div>
        <span className={styles['carousel-card-title']}>{category.title}</span>
        <p className={styles['flip-card-desc']}>Learn {category.title.toLowerCase()} principles and core strategies.</p>
        <a href="#" className={styles['explore-btn']}>View Courses</a>
      </div>
    </div>
  </div>
);

const PopularCategories = () => {
  const scrollRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const filteredCategories = categorieData.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-sliding logic
  useEffect(() => {
    if (isPaused || filteredCategories.length === 0) return;

    const autoScroll = setInterval(() => {
      if (scrollRef.current && scrollRef.current.children.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (scrollWidth <= clientWidth) return; // Don't slide if no overflow
        
        const scrollAmount = scrollRef.current.children[0].offsetWidth + 30; // card + gap
        
        // Loop back to start if at the end
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } 
    }, 2000); // Auto-slide every 2s

    return () => clearInterval(autoScroll);
  }, [isPaused, filteredCategories.length]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.children[0].offsetWidth + 30;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.children[0].offsetWidth + 30;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles['carousel-section']}>
      <div className={styles.container}>
        <div className={styles['carousel-header']}>
          <h2>Find out by popular<br/>Categories</h2>
          <p>We offer a brand new approach to the most basic learning paradigms. Choose from a wide range of learning options and gain new skills! Our school is know.</p>
          
          <div className={styles['category-search-wrapper']}>
            <div className={styles['search-input-container']}>
              <i className={`fas fa-search ${styles['search-icon']}`}></i>
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['category-search-input']}
              />
            </div>
          </div>
        </div>

        <div className={styles['carousel-container-wrapper']}>
          {filteredCategories.length > 0 && (
            <button 
              className={`${styles['carousel-nav-btn']} ${styles.left}`} 
              onClick={handleScrollLeft} 
              aria-label="Scroll left"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          {filteredCategories.length > 0 ? (
            <div className={styles['carousel-track']} ref={scrollRef}>
              {filteredCategories.map((category, index) => (
                <CategoryCard key={category.title + index} category={category} />
              ))}
            </div>
          ) : (
            <div className={styles['no-results-message']}>
              <i className="fas fa-search-minus"></i>
              <p>No categories found matching "{searchTerm}"</p>
            </div>
          )}

          {filteredCategories.length > 0 && (
            <button 
              className={`${styles['carousel-nav-btn']} ${styles.right}`} 
              onClick={handleScrollRight} 
              aria-label="Scroll right"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
