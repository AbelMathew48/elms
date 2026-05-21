/**
 * @file App.jsx
 * @description Root React component that composes the main homepage sections.
 */
import React from 'react';
import './App.css';
import Categories from './components/Category/Categories/Categories';
import EventSpeakers from './components/EventSpeakers/EventSpeakers';
import PopularCategories from './components/Category/PopularCategories/PopularCategories';
import CategoriesSection from './components/Category/CategoriesSection/CategoriesSection';
import CategoriesPage from './components/Category/CategoriesPage/CategoriesPage';
import CategoryStrip from './components/Category/CategoryStrip/CategoryStrip';
import { CATEGORIES } from './data/data';
import Certificate from './components/Certificate/Certificate';

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
