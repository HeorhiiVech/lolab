import React, { useState, useEffect } from 'react';
import './App.css';

// Компоненты
import Home from './components/Home';
import Calculator from './components/Calculator';
import GoldEfficiencyCalculator from './components/GoldEfficiencyCalculator';
import AbilityHasteCalculator from './components/AbilityHasteCalculator';
import TurretCalculator from './components/TurretCalculator';
import SmiteTrainer from './components/SmiteTrainer';
import FAQ from './components/FAQ';
import ProSceneAnalyzer from './components/ProSceneAnalyzer';
import PlayerProfile from './components/PlayerProfile';
import UserCabinet from './components/UserCabinet';
import LoginModal from './components/LoginModal';
import TeamAnalyzer from './components/TeamAnalyzer';
import TeamProfile from './components/TeamProfile';
import GlobalSearch from './components/GlobalSearch';
import TierListMaker from './components/TierListMaker';
import ItemTrainerDashboard from './components/ItemTrainerDashboard';
import Ladder from './components/Ladder';
import DailyQuizzes from './components/DailyQuizzes';
import DailyActivityBar from './components/DailyActivityBar';

// Firebase
import { auth, db } from './firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

// Утилита времени
import { getTimeBlockSeed } from './utils/time';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDailyQuizOpen, setIsDailyQuizOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [viewingPlayers, setViewingPlayers] = useState([]);
  const [viewingTeams, setViewingTeams] = useState([]);

  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  const checkDailyProgress = () => {
    const currentSeed = getTimeBlockSeed();
    const completed = [];

    const itemdleProgress = JSON.parse(localStorage.getItem('itemdleProgress'));
    if (itemdleProgress && itemdleProgress.seed === currentSeed) {
        completed.push('itemdle');
    }

    const recipeProgress = JSON.parse(localStorage.getItem('recipeQuizProgressV3'));
    if (recipeProgress && recipeProgress.seed === currentSeed) {
        completed.push('item');
    }
    
    const smiteProgress = JSON.parse(localStorage.getItem('smiteTrainerDailyProgress'));
    if (smiteProgress && smiteProgress.seed === currentSeed && smiteProgress.won) {
        completed.push('smite');
    }

    setCompletedQuizzes(completed);
  };

  useEffect(() => {
    checkDailyProgress();
  }, []);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => { setCurrentUser(user); });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeDb = null;
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      unsubscribeDb = onSnapshot(userRef, (doc) => {
        setUserData(doc.exists() ? doc.data() : null);
      });
    } else {
      setUserData(null);
    }
    return () => { if (unsubscribeDb) unsubscribeDb(); };
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('home');
  };
  
  const handlePlayerSelect = (player) => { setViewingPlayers([player]); setViewingTeams([]); setActiveTab(''); };
  const addComparisonPlayer = (player) => { if (viewingPlayers.length === 1 && viewingPlayers[0].Player !== player.Player) setViewingPlayers(prev => [...prev, player]); };
  const removeComparisonPlayer = () => { setViewingPlayers(prev => [prev[0]]); };

  const handleTeamSelect = (team) => { setViewingTeams([team]); setViewingPlayers([]); setActiveTab(''); };
  const addComparisonTeam = (team) => { if (viewingTeams.length === 1 && viewingTeams[0].Team !== team.Team) setViewingTeams(prev => [...prev, team]); };
  const removeComparisonTeam = () => { setViewingTeams(prev => [prev[0]]); };

  const handleBackToMain = () => {
    setViewingPlayers([]);
    setViewingTeams([]);
    setActiveTab('pro');
  };

  const renderContent = () => {
    if (viewingPlayers.length > 0) {
      return <PlayerProfile
                players={viewingPlayers}
                onBack={handleBackToMain}
                onPlayerSelect={handlePlayerSelect}
                onTeamSelect={handleTeamSelect}
                onAddCompare={addComparisonPlayer}
                onRemoveCompare={removeComparisonPlayer}
                currentUser={currentUser}
                userData={userData}
             />;
    }
    if (viewingTeams.length > 0) {
      return <TeamProfile
                teams={viewingTeams}
                onBack={handleBackToMain}
                onPlayerSelect={handlePlayerSelect}
                onTeamSelect={handleTeamSelect}
                onAddCompare={addComparisonTeam}
                onRemoveCompare={removeComparisonTeam}
             />;
    }
    
    switch (activeTab) {
      case 'home': return <Home />;
      case 'farm': return <Calculator />;
      case 'items': return <div className="calculators-container"><GoldEfficiencyCalculator /><AbilityHasteCalculator /></div>;
      case 'turret': return <TurretCalculator />;
      case 'smite': return <SmiteTrainer currentUser={currentUser} />;
      case 'itemTrainer': return <ItemTrainerDashboard currentUser={currentUser} />;
      case 'pro': return <ProSceneAnalyzer onPlayerSelect={handlePlayerSelect} />;
      case 'teams': return <TeamAnalyzer onTeamSelect={handleTeamSelect} />;
      case 'tierlist': return <TierListMaker />;
      case 'ladder': return <Ladder />;
      case 'cabinet': return <UserCabinet userData={userData} onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />;
      default: return <Home />;
    }
  };

  return (
    <div className={`App ${isHeaderCollapsed ? 'header-collapsed' : ''}`}>
      <button className="collapse-toggle-btn" onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title="Свернуть/Развернуть">{isHeaderCollapsed ? '↓' : '↑'}</button>
      <LoginModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <div className="header-section">
        <div className="header-wrapper">
          <header className="App-header">
            <h1>LOLAB</h1>
            <GlobalSearch currentUser={currentUser} userData={userData} onPlayerSelect={handlePlayerSelect} onTeamSelect={handleTeamSelect} />
            
            <div className="login-controls">
                <div className="user-actions">
                    {currentUser ? (
                        <>
                            <span>{userData?.nickname || currentUser.email}</span>
                            <button onClick={() => setActiveTab('cabinet')} className={`profile-button ${activeTab === 'cabinet' ? 'active' : ''}`}>Профиль</button>
                            <button onClick={handleLogout} className="login-button">Выйти</button>
                        </>
                    ) : (
                        <button onClick={() => setModalOpen(true)} className="login-button">Войти</button>
                    )}
                </div>
                <DailyActivityBar 
                  completedQuizzes={completedQuizzes} 
                  onShowQuizzes={() => setIsDailyQuizOpen(true)} 
                />
            </div>
          </header>
          <div className="header-buttons">
            <button onClick={() => setIsFaqOpen(true)} className="faq-button" title="FAQ">?</button>
            <a href="https://t.me/heovechlolstats" target="_blank" rel="noopener noreferrer" className="telegram-link" title="Наш Telegram канал">
              <svg viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.02.17-1.25l16.05-6.1c.78-.29 1.45.14 1.25 1.05l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.43.42-.83.42z" /></svg>
            </a>
            <a href="https://new.donatepay.ru/@1347624" target="_blank" rel="noopener noreferrer" className="donate-button" title="Поддержать проект">
              <svg viewBox="0 0 24 24"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>
            </a>
          </div>
        </div>
        <nav className="tabs">
          <div className="tab-buttons-wrapper">
            <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Главная</button>
            
            <div className="dropdown">
              <button className="dropbtn">Калькуляторы</button>
              <div className="dropdown-content">
                <button onClick={() => setActiveTab('farm')}>Калькулятор Фарма</button>
                <button onClick={() => setActiveTab('items')}>Калькуляторы Предметов</button>
                <button onClick={() => setActiveTab('turret')}>Калькулятор Башен</button>
              </div>
            </div>

            <div className="dropdown">
              <button className="dropbtn">Киберспорт</button>
              <div className="dropdown-content">
                <button onClick={() => setActiveTab('pro')}>Игроки</button>
              </div>
            </div>
            
            <div className="dropdown">
              <button className="dropbtn">Тренажеры</button>
              <div className="dropdown-content">
                <button onClick={() => setActiveTab('smite')}>Тренажер Смайта</button>
                <button onClick={() => setActiveTab('itemTrainer')}>Тренажер Предметов</button>
              </div>
            </div>

            <button className={activeTab === 'tierlist' ? 'active' : ''} onClick={() => setActiveTab('tierlist')}>Тирлист Мейкер</button>
            <button className={activeTab === 'ladder' ? 'active' : ''} onClick={() => setActiveTab('ladder')}>Ладдер</button>
          </div>
        </nav>
      </div>

      <main>
        <div className={`content-wrapper ${activeTab === 'pro' || activeTab === 'teams' || viewingPlayers.length > 0 || viewingTeams.length > 0 ? 'content-wrapper-pro' : ''}`}>
          {renderContent()}
        </div>
      </main>

      {isDailyQuizOpen && (
        <div className="modal-overlay" onClick={() => setIsDailyQuizOpen(false)}>
            <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
                 <DailyQuizzes 
                    currentUser={currentUser} 
                    onQuizComplete={checkDailyProgress} 
                 />
                 <button className="modal-close-button" onClick={() => {
                   setIsDailyQuizOpen(false);
                   checkDailyProgress();
                 }}>Закрыть</button>
            </div>
        </div>
      )}

      {isFaqOpen && <FAQ onClose={() => setIsFaqOpen(false)} />}
    </div>
  );
}

export default App;
