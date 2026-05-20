/**
 * @file CategoryGrid.jsx
 * @description A responsive grid container that maps over course data and dynamically renders CategoryCards.
 */
import React from 'react';
import styles from './CategoryGrid.module.css';
import CategoryCard from '../CategoryCard/CategoryCard';
import { catData } from '../../data/data';

const CategoryGrid = () => {
  return (
    <section className={styles.section} id="categories">
      <div className={styles.grid}>
        {catData.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
