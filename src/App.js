import React from 'react';
import { ClassicyDesktop, ClassicyWindow } from 'classicy';
import './App.css';
import backgroundImage from './assets/background.png';

const folders = [
  { name: 'Poems', link: '/poems' },
  { name: 'Photos', link: '/photos' },
  { name: 'About', link: '/about' },
  { name: 'Contact', link: '/contact' },
];

function App() {
  return (
    <div className="app">
      <img src={backgroundImage} alt="Badass Poet at Court of Two Sisters" className="main-image" />
      <ClassicyDesktop>
        <ClassicyWindow title="File Browser" closable resizable zoomable collapsable style={{ top: 80, left: 100, width: 340 }}>
          <div className="mac-folder-list">
            {folders.map((folder) => (
              <a href={folder.link} className="mac-folder-link" key={folder.name}>
                <span style={{ fontSize: 24, marginRight: 12 }}>📁</span>
                <span>{folder.name}</span>
              </a>
            ))}
          </div>
        </ClassicyWindow>
      </ClassicyDesktop>
    </div>
  );
}

export default App;
