import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Flicker effect logic
function triggerFlicker() {
  document.body.classList.add('flicker-effect');
  setTimeout(() => {
    document.body.classList.remove('flicker-effect');
  }, 350);
}

function scheduleFlicker() {
  const min = 4000; // 4 seconds
  const max = 12000; // 12 seconds
  setTimeout(() => {
    triggerFlicker();
    scheduleFlicker();
  }, Math.random() * (max - min) + min);
}

scheduleFlicker();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
