import React from 'react';
import './App.css';
import backgroundImage from './assets/background.png';

function App() {
  return (
    <div className="app">
      <img src={backgroundImage} alt="Badass Poet at Court of Two Sisters" className="main-image" />
    </div>
  );
}

export default App;
