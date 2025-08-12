// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

// Импортируем все наши компоненты
import Calculator from './components/Calculator';
import GoldEfficiencyCalculator from './components/GoldEfficiencyCalculator';
import AbilityHasteCalculator from './components/AbilityHasteCalculator';
import TurretCalculator from './components/TurretCalculator';
import SmiteTrainer from './components/SmiteTrainer';
import FAQ from './components/FAQ';
import ProSceneAnalyzer from './components/ProSceneAnalyzer';
import TierListMaker from './components/TierListMaker';

// Импорты для авторизации
// ДОБАВЛЕНЫ db, doc, и getDoc для чтения данных пользователя
import { auth, db } from './firebase-config'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoginModal from './components/LoginModal';


function App() {
  const [activeTab, setActiveTab] = useState('tierlist');
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Следим за состоянием авторизации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Пользователь вошел. Загружаем его данные из Firestore.
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          // Сохраняем все данные пользователя (email, nickname, etc.)
          setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
        } else {
          // На случай, если в auth есть, а в базе нет
          setCurrentUser(user); 
        }
      } else {
        // Пользователь вышел
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className={`App ${isHeaderCollapsed ? 'header-collapsed' : ''}`}>
      <button 
        className="collapse-toggle-btn" 
        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} 
        title="Свернуть/Развернуть"
      >
        {isHeaderCollapsed ? '↓' : '↑'}
      </button>

      <LoginModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />

      <div className="header-section">
        <div className="header-wrapper">
          <header className="App-header">
            <h1>lolab by heovech</h1>
            <div className="login-controls">
              {currentUser ? (
                <>
                  {/* ИЗМЕНЕНО: Отображаем никнейм, а если его нет - то email */}
                  <span>{currentUser.nickname || currentUser.email}</span>
                  <button onClick={handleLogout} className="login-button">Выйти</button>
                </>
              ) : (
                <button onClick={() => setModalOpen(true)} className="login-button">
                  Войти
                </button>
              )}
            </div>
          </header>
          <div className="header-buttons">
            <button onClick={() => setIsFaqOpen(true)} className="faq-button" title="FAQ">?</button>
            <a href="https://t.me/heovechlolstats" target="_blank" rel="noopener noreferrer" className="telegram-link" title="Наш Telegram канал">
              <svg viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.02.17-1.25l16.05-6.1c.78-.29 1.45.14 1.25 1.05l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.43.42-.83.42z" /></svg>
            </a>
          </div>
        </div>

        <nav className="tabs">
          <div className="tab-buttons-wrapper">
             <button className={activeTab === 'farm' ? 'active' : ''} onClick={() => setActiveTab('farm')}>Калькулятор Фарма</button>
            <button className={activeTab === 'items' ? 'active' : ''} onClick={() => setActiveTab('items')}>Калькуляторы Предметов</button>
            <button className={activeTab === 'turret' ? 'active' : ''} onClick={() => setActiveTab('turret')}>Калькулятор Башен</button>
            <button className={activeTab === 'smite' ? 'active' : ''} onClick={() => setActiveTab('smite')}>Тренажер Смайта</button>
            <button className={activeTab === 'pro' ? 'active' : ''} onClick={() => setActiveTab('pro')}>Про-сцена</button>
            <button className={activeTab === 'tierlist' ? 'active' : ''} onClick={() => setActiveTab('tierlist')}>Тирлист Мейкер</button>
          </div>
        </nav>
      </div>

      <main>
        <div className={`content-wrapper ${activeTab === 'pro' ? 'content-wrapper-pro' : ''}`}>
          {activeTab === 'farm' && <Calculator />}
          {activeTab === 'items' && (
            <div className="calculators-container">
              <GoldEfficiencyCalculator />
              <AbilityHasteCalculator />
            </div>
          )}
          {activeTab === 'turret' && <TurretCalculator />}
          {activeTab === 'smite' && <SmiteTrainer currentUser={currentUser} />} 
          {activeTab === 'pro' && <ProSceneAnalyzer />}
          {activeTab === 'tierlist' && <TierListMaker />}
        </div>
      </main>

      {isFaqOpen && <FAQ onClose={() => setIsFaqOpen(false)} />}
    </div>
  );
}

export default App;