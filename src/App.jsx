/**
 * @file App.jsx
 * @description Root React component that composes the main homepage sections.
 */
import React from 'react';
import Categories from './components/Categories';
import EventSpeakers from './components/EventSpeakers';
import PopularCategories from './components/PopularCategories';
import CategoriesSection from './components/categories/CategoriesSection';
import CategoriesPage from './components/pages/CategoriesPage';
import CategoryStrip from './components/CategoryStrip';
import { CATEGORIES } from './data/data';
import Certificate from './components/certificate/Certificate';

function App() {
  return (
    <div className="App">
      <main>
        <Categories />
        <EventSpeakers />
        <PopularCategories />
        <CategoriesSection />
        <CategoriesPage />
        <CategoryStrip categories={CATEGORIES} />
        <Certificate />
      </main>
    </div>
  );
}

export default App;
