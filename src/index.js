// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from "react-ga4"; // Импортируем библиотеку
import './index.css';
import App from './App';

// Инициализируем Google Analytics с твоим ID
ReactGA.initialize("G-XST184R82M");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);