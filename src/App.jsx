import React from 'react';
import Categories from './components/Categories';
import EventSpeakers from './components/EventSpeakers';
import PopularCategories from './components/PopularCategories';


function App() {
  return (
    <div className="App">
      <main>
        <Categories />
        <EventSpeakers />
        <PopularCategories />
      </main>
    </div>
  );
}

export default App;
