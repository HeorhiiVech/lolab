// src/App.js
import React, { useState } from 'react';
import './App.css';

// Импортируем все наши компоненты-калькуляторы
import Calculator from './components/Calculator';
import GoldEfficiencyCalculator from './components/GoldEfficiencyCalculator';
import AbilityHasteCalculator from './components/AbilityHasteCalculator';
import TurretCalculator from './components/TurretCalculator';
import SmiteTrainer from './components/SmiteTrainer';
import FAQ from './components/FAQ';

function App() {
  const [activeTab, setActiveTab] = useState('smite');
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
    <div className="App">
      <div className="header-wrapper">
        <header className="App-header">
          <h1>lolab by heovech</h1>
        </header>

        <div className="header-buttons">
          <button onClick={() => setIsFaqOpen(true)} className="faq-button" title="FAQ">
            ?
          </button>
          <a 
            href="https://t.me/heovechlolstats" // <-- ЗАМЕНИ НА ССЫЛКУ СВОЕГО КАНАЛА!
            target="_blank" 
            rel="noopener noreferrer" 
            className="telegram-link"
            title="Наш Telegram канал"
          >
            <svg viewBox="0 0 24 24">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.02.17-1.25l16.05-6.1c.78-.29 1.45.14 1.25 1.05l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.43.42-.83.42z" />
            </svg>
          </a>
        </div>
      </div>
      
      <nav className="tabs">
        <button className={activeTab === 'farm' ? 'active' : ''} onClick={() => setActiveTab('farm')}>
          Калькулятор Фарма
        </button>
        <button className={activeTab === 'items' ? 'active' : ''} onClick={() => setActiveTab('items')}>
          Калькуляторы Предметов
        </button>
        <button className={activeTab === 'turret' ? 'active' : ''} onClick={() => setActiveTab('turret')}>
          Калькулятор Башен
        </button>
        <button className={activeTab === 'smite' ? 'active' : ''} onClick={() => setActiveTab('smite')}>
          Тренажер Смайта
        </button>
      </nav>

      <main>
        {activeTab === 'farm' && <Calculator />}

        {activeTab === 'items' && (
          <div className="calculators-container">
            <GoldEfficiencyCalculator />
            <AbilityHasteCalculator />
          </div>
        )}

        {activeTab === 'turret' && <TurretCalculator />}
        
        {activeTab === 'smite' && <SmiteTrainer />}
      </main>

      {/* Отображаем FAQ поверх всего, если isFaqOpen === true */}
      {isFaqOpen && <FAQ onClose={() => setIsFaqOpen(false)} />}
    </div>
  );
}

export default App;