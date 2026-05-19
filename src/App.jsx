import React from 'react';
import Categories from './components/Categories';
import EventSpeakers from './components/EventSpeakers';
import PopularCategories from './components/PopularCategories';
import CategoriesSection from './components/categories/CategoriesSection';

function App() {
  return (
    <div className="App">
      <main>
        <Categories />
        <EventSpeakers />
        <PopularCategories />
        <CategoriesSection />
      </main>
    </div>
  );
}

export default App;
