import React from 'react';
import Categories from './components/Categories';
import EventSpeakers from './components/EventSpeakers';
import PopularCategories from './components/PopularCategories';
import CategoriesSection from './components/categories/CategoriesSection';
import CategoriesPage from './components/pages/CategoriesPage';

function App() {
  return (
    <div className="App">
      <main>
        <Categories />
        <EventSpeakers />
        <PopularCategories />
        <CategoriesSection />
        <CategoriesPage />
      </main>
    </div>
  );
}

export default App;
