import React, { useState, useEffect, useCallback } from 'react';
import './SmiteTrainer.css';

const BASE_SMITE_DMG = 600;
const PRIMAL_SMITE_DMG = 900;
const MINION_SMITE_DMG = 1200;
const DIFFICULTY_SETTINGS = {
  easy: { name: 'Легко', hp: 2650, dmgBase: 50, dmgRange: 100, aiWindow: 150 },
  medium: { name: 'Средне', hp: 4500, dmgBase: 50, dmgRange: 200, aiWindow: Infinity },
  hard: { name: 'Сложно', hp: 6400, dmgBase: 100, dmgRange: 450, aiWindow: 50 },
};

function SmiteTrainer() {
  const [smiteType, setSmiteType] = useState('primal');
  const [difficulty, setDifficulty] = useState('medium');
  const [dragonHp, setDragonHp] = useState(DIFFICULTY_SETTINGS.medium.hp);
  const [gameState, setGameState] = useState('ready');
  const [resultMessage, setResultMessage] = useState('');
  const [allyAttack, setAllyAttack] = useState(false);
  const [enemyAttack, setEnemyAttack] = useState(false);
  
  const [smiteableTimestamp, setSmiteableTimestamp] = useState(null);
  const [smiteWindowHp, setSmiteWindowHp] = useState(null);
  // FIX: Убираем ненужное состояние reactionTime, так как используем локальную переменную
  // const [reactionTime, setReactionTime] = useState(null); 

  const smiteDmg = smiteType === 'base' ? BASE_SMITE_DMG : smiteType === 'primal' ? PRIMAL_SMITE_DMG : MINION_SMITE_DMG;
  const DRAGON_MAX_HP = DIFFICULTY_SETTINGS[difficulty].hp;
  
  // Оборачиваем handleSmite в useCallback, чтобы он не пересоздавался на каждый рендер
  const handleSmite = useCallback(() => {
    if (gameState !== 'active') return;

    let reaction = null;
    if (smiteableTimestamp) {
      reaction = Date.now() - smiteableTimestamp;
    }
    
    setGameState('finished');
    const hpBeforeSmite = dragonHp;
    setDragonHp(Math.max(0, hpBeforeSmite - smiteDmg));

    if (hpBeforeSmite <= smiteDmg) {
      if (difficulty === 'medium' && Math.random() < 0.3) {
        setResultMessage('Украдено! Вражеский лесник оказался быстрее.');
      } else {
        setResultMessage(`Отличный смайт! Реакция: ${reaction}мс`);
      }
    } else {
      setResultMessage(`Слишком рано! Оставалось ${Math.round(hpBeforeSmite)} HP.`);
    }
  }, [gameState, dragonHp, smiteDmg, difficulty, smiteableTimestamp]);
  
  const handleKeyPress = useCallback((event) => {
    if (gameState === 'active' && (event.key.toLowerCase() === 'd','в' || event.key.toLowerCase() === 'f','а')) {
      handleSmite();
    }
  }, [gameState, handleSmite]); // FIX: Добавляем handleSmite в зависимости

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameState !== 'active') return;

    const gameTick = setInterval(() => {
      setDragonHp(prevHp => {
        if (prevHp <= 0) {
          clearInterval(gameTick);
          return 0;
        }
        
        const settings = DIFFICULTY_SETTINGS[difficulty];
        let damageDealt = 0;
        if (Math.random() > 0.4) {
          damageDealt = Math.floor(Math.random() * settings.dmgRange) + settings.dmgBase;
          
          // FIX: Добавляем вызовы для анимации
          if (Math.random() > 0.5) {
            setAllyAttack(true);
            setTimeout(() => setAllyAttack(false), 150);
          } else {
            setEnemyAttack(true);
            setTimeout(() => setEnemyAttack(false), 150);
          }
        }
        
        const newHp = Math.max(0, prevHp - damageDealt);

        if (prevHp > smiteDmg && newHp <= smiteDmg && !smiteableTimestamp) {
          setSmiteableTimestamp(Date.now());
          setSmiteWindowHp(newHp);
        }

        if (smiteWindowHp !== null && settings.aiWindow !== Infinity) {
          if (newHp <= smiteWindowHp - settings.aiWindow) {
            setGameState('finished');
            setResultMessage(`Слишком медленно! Враг засмайтил в окне ${settings.aiWindow} HP.`);
            clearInterval(gameTick);
          }
        }
        
        return newHp;
      });
    }, 300);

    return () => clearInterval(gameTick);
  }, [gameState, difficulty, smiteDmg, smiteableTimestamp, smiteWindowHp]);

  useEffect(() => {
    if (dragonHp === 0 && gameState === 'active') {
      setGameState('finished');
      setResultMessage('Дракон убит, но не вами!');
    }
  }, [dragonHp, gameState]);

  const startGame = () => {
    setDragonHp(DRAGON_MAX_HP);
    setResultMessage('');
    setGameState('active');
    setSmiteableTimestamp(null);
    setSmiteWindowHp(null);
  };

  const healthPercentage = (dragonHp / DRAGON_MAX_HP) * 100;

  return (
    <div className="card">
      {/* ... остальная JSX структура остается без изменений ... */}
      <h2>Тренажер Смайта</h2>
      <div 
        className="trainer-container"
      >
        <div className={`character ally ${allyAttack ? 'attacking' : ''}`}></div>
        <div className="dragon-area">
          <div className={`dragon ${gameState === 'active' ? 'ready' : ''}`}></div>
          <div className="hp-bar-container">
            <div className="hp-bar" style={{ width: `${healthPercentage}%` }}></div>
            <span className="hp-text">{Math.round(dragonHp)} / {DRAGON_MAX_HP}</span>
          </div>
        </div>
        <div className={`character enemy ${enemyAttack ? 'attacking' : ''}`}></div>
      </div>

      {gameState !== 'active' && (
        <div className="game-controls">
          {resultMessage && <p className="result-message">{resultMessage}</p>}
          <div className="control-group">
            <label>Сложность:</label>
            <div className="difficulty-selector">
              {Object.keys(DIFFICULTY_SETTINGS).map(key => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={difficulty === key ? 'active' : ''}
                >
                  {DIFFICULTY_SETTINGS[key].name}
                </button>
              ))}
            </div>
          </div>
          <div className="control-group">
            <label>Ваша Кара:</label>
            <div className="smite-selector">
              <button onClick={() => setSmiteType('base')} className={smiteType === 'base' ? 'active' : ''}>
                {BASE_SMITE_DMG}
              </button>
              <button onClick={() => setSmiteType('primal')} className={smiteType === 'primal' ? 'active' : ''}>
                {PRIMAL_SMITE_DMG}
              </button>
              <button onClick={() => setSmiteType('minion')} className={smiteType === 'minion' ? 'active' : ''}>
                {MINION_SMITE_DMG}
              </button>
            </div>
          </div>
          <button onClick={startGame} className="start-button">Начать</button>
        </div>
      )}
      
      {gameState === 'active' && (
         <div className="smite-controls">
            <p className="smite-instruction">
              Нажмите <kbd>D</kbd> или <kbd>F</kbd> для смайта
            </p>
         </div>
      )}
    </div>
  );
}

export default SmiteTrainer;