import React, { useState, useEffect, useCallback } from 'react';
import './SmiteTrainer.css';

// Импорты из Firebase
import { db } from '../firebase-config';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";

// Ваши константы
const BASE_SMITE_DMG = 600;
const PRIMAL_SMITE_DMG = 900;
const MINION_SMITE_DMG = 1200;
const DIFFICULTY_SETTINGS = {
  easy: { name: 'Легко', hp: 2650, dmgBase: 50, dmgRange: 100, aiWindow: 150 },
  medium: { name: 'Средне', hp: 4500, dmgBase: 50, dmgRange: 200, aiWindow: Infinity },
  hard: { name: 'Сложно', hp: 6400, dmgBase: 100, dmgRange: 450, aiWindow: 50 },
};

// Ваш компонент
function SmiteTrainer({ currentUser }) {
    // Ваши состояния
    const [smiteType, setSmiteType] = useState('primal');
    const [difficulty, setDifficulty] = useState('medium');
    const [dragonHp, setDragonHp] = useState(DIFFICULTY_SETTINGS.medium.hp);
    const [gameState, setGameState] = useState('ready');
    const [resultMessage, setResultMessage] = useState('');
    const [allyAttack, setAllyAttack] = useState(false);
    const [enemyAttack, setEnemyAttack] = useState(false);
    const [smiteableTimestamp, setSmiteableTimestamp] = useState(null);
    const [smiteWindowHp, setSmiteWindowHp] = useState(null);
    
    // Новые состояния для ладдера и стриков
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRecord, setMyRecord] = useState(null);
    const [sortBy, setSortBy] = useState('highScore'); // 'highScore' или 'winStreak'
    const [currentStreak, setCurrentStreak] = useState(0); // Стрик в текущей игре

    // Функция для загрузки таблицы лидеров
    const fetchLeaderboard = useCallback(async () => {
        try {
            const usersCollection = collection(db, 'users');
            // Определяем направление сортировки
            const sortDirection = sortBy === 'highScore' ? 'asc' : 'desc';
            const q = query(usersCollection, orderBy(sortBy, sortDirection), limit(50));
            
            const querySnapshot = await getDocs(q);
            const leaders = [];
            querySnapshot.forEach(doc => {
                // Добавляем только пользователей, у которых есть рекорды по текущему фильтру
                if (doc.data()[sortBy] !== null && doc.data()[sortBy] !== undefined) {
                    leaders.push({ id: doc.id, ...doc.data() });
                }
            });
            setLeaderboard(leaders);
        } catch (error) { console.error("Ошибка при загрузке ладдера:", error); }
    }, [sortBy]); // Перезагружаем при смене фильтра

    // Функция для загрузки личного рекорда
    const fetchMyRecord = useCallback(async () => {
        if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                setMyRecord(userDoc.data());
            } else { setMyRecord(null); }
        } else { setMyRecord(null); }
    }, [currentUser]);

    // Загружаем данные при монтировании и при смене пользователя/фильтра
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard, sortBy]);

    useEffect(() => {
        fetchMyRecord();
    }, [fetchMyRecord, currentUser]);


    // Функция сохранения лучшего стрика
    const saveBestStreak = useCallback(async () => {
        if (currentUser && currentStreak > 0) {
            const userRef = doc(db, "users", currentUser.uid);
            try {
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists() || !userDoc.data().winStreak || currentStreak > userDoc.data().winStreak) {
                    await setDoc(userRef, { winStreak: currentStreak }, { merge: true });
                    fetchMyRecord(); // Обновляем инфо о личном рекорде
                }
            } catch (error) { console.error("Ошибка сохранения стрика:", error); }
        }
        setCurrentStreak(0); // Сбрасываем стрик для новой игры
    }, [currentUser, currentStreak, fetchMyRecord]);

    // Ваша логика
    const smiteDmg = smiteType === 'base' ? BASE_SMITE_DMG : smiteType === 'primal' ? PRIMAL_SMITE_DMG : MINION_SMITE_DMG;
    const DRAGON_MAX_HP = DIFFICULTY_SETTINGS[difficulty].hp;

    const handleSmite = useCallback(async () => {
        if (gameState !== 'active') return;
        let reaction = smiteableTimestamp ? Date.now() - smiteableTimestamp : null;
        setGameState('finished');
        const hpBeforeSmite = dragonHp;
        setDragonHp(Math.max(0, hpBeforeSmite - smiteDmg));

        if (hpBeforeSmite <= smiteDmg) {
            if (difficulty === 'medium' && Math.random() < 0.3) {
                setResultMessage('Украдено! Вражеский лесник оказался быстрее.');
                saveBestStreak(); // Сохраняем стрик даже при проигрыше
            } else {
                setResultMessage(`Отличный смайт! Реакция: ${reaction}мс`);
                setCurrentStreak(prev => prev + 1); // Увеличиваем стрик
                
                if (currentUser && reaction !== null) {
                    const userRef = doc(db, "users", currentUser.uid);
                    try {
                        const userDoc = await getDoc(userRef);
                        if (!userDoc.exists() || !userDoc.data().highScore || reaction < userDoc.data().highScore) {
                            await setDoc(userRef, { highScore: reaction }, { merge: true });
                            fetchLeaderboard();
                            fetchMyRecord();
                        }
                    } catch (error) { console.error("Ошибка при сохранении рекорда:", error); }
                }
            }
        } else {
            setResultMessage(`Слишком рано! Оставалось ${Math.round(hpBeforeSmite)} HP.`);
            saveBestStreak(); // Стрик сброшен, сохраняем лучший результат
        }
    }, [gameState, dragonHp, smiteDmg, difficulty, smiteableTimestamp, currentUser, fetchLeaderboard, fetchMyRecord, saveBestStreak]);
    
    // Ваши хуки и функции
    const handleKeyPress = useCallback((event) => {
    // Check for the physical key press of 'D' or 'F'
    if (gameState === 'active' && (event.code === 'KeyD' || event.code === 'KeyF')) {
        handleSmite();
        }
    }, [gameState, handleSmite]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        if (gameState !== 'active') return;
        const gameTick = setInterval(() => {
            setDragonHp(prevHp => {
                if (prevHp <= 0) { clearInterval(gameTick); return 0; }
                const settings = DIFFICULTY_SETTINGS[difficulty];
                let damageDealt = 0;
                if (Math.random() > 0.4) {
                    damageDealt = Math.floor(Math.random() * settings.dmgRange) + settings.dmgBase;
                    if (Math.random() > 0.5) { setAllyAttack(true); setTimeout(() => setAllyAttack(false), 150); } else { setEnemyAttack(true); setTimeout(() => setEnemyAttack(false), 150); }
                }
                const newHp = Math.max(0, prevHp - damageDealt);
                if (prevHp > smiteDmg && newHp <= smiteDmg && !smiteableTimestamp) { setSmiteableTimestamp(Date.now()); setSmiteWindowHp(newHp); }
                if (smiteWindowHp !== null && settings.aiWindow !== Infinity) {
                    if (newHp <= smiteWindowHp - settings.aiWindow) { setGameState('finished'); setResultMessage(`Слишком медленно! Враг засмайтил в окне ${settings.aiWindow} HP.`); saveBestStreak(); clearInterval(gameTick); }
                }
                return newHp;
            });
        }, 300);
        return () => clearInterval(gameTick);
    }, [gameState, difficulty, smiteDmg, smiteableTimestamp, smiteWindowHp, saveBestStreak]);

    useEffect(() => {
        if (dragonHp === 0 && gameState === 'active') { setGameState('finished'); setResultMessage('Дракон убит, но не вами!'); saveBestStreak(); }
    }, [dragonHp, gameState, saveBestStreak]);

    const startGame = () => {
        saveBestStreak(); // Сохраняем стрик перед началом новой игры
        setDragonHp(DRAGON_MAX_HP);
        setResultMessage('');
        setGameState('active');
        setSmiteableTimestamp(null);
        setSmiteWindowHp(null);
    };

    const healthPercentage = (dragonHp / DRAGON_MAX_HP) * 100;

    return (
        <div className="smite-trainer-wrapper">
            <div className="card">
                <div className="trainer-container">
                    <div className={`character ally ${allyAttack ? 'attacking' : ''}`}></div>
                    <div className="dragon-area">
                        <div className={`dragon ${gameState === 'active' ? 'ready' : ''}`}></div>
                        <div className="hp-bar-container"><div className="hp-bar" style={{ width: `${healthPercentage}%` }}></div><span className="hp-text">{Math.round(dragonHp)} / {DRAGON_MAX_HP}</span></div>
                    </div>
                    <div className={`character enemy ${enemyAttack ? 'attacking' : ''}`}></div>
                </div>
                {gameState !== 'active' && (
                    <div className="game-controls">
                        {resultMessage && <p className="result-message">{resultMessage}</p>}
                        <div className="control-group"><label>Сложность:</label><div className="difficulty-selector">{Object.keys(DIFFICULTY_SETTINGS).map(key => (<button key={key} onClick={() => setDifficulty(key)} className={difficulty === key ? 'active' : ''}>{DIFFICULTY_SETTINGS[key].name}</button>))}</div></div>
                        <div className="control-group"><label>Ваша Кара:</label><div className="smite-selector"><button onClick={() => setSmiteType('base')} className={smiteType === 'base' ? 'active' : ''}>{BASE_SMITE_DMG}</button><button onClick={() => setSmiteType('primal')} className={smiteType === 'primal' ? 'active' : ''}>{PRIMAL_SMITE_DMG}</button><button onClick={() => setSmiteType('minion')} className={smiteType === 'minion' ? 'active' : ''}>{MINION_SMITE_DMG}</button></div></div>
                        <button onClick={startGame} className="start-button">Начать</button>
                    </div>
                )}
                {gameState === 'active' && (<div className="smite-controls"><p className="smite-instruction">Нажмите <kbd>D</kbd> или <kbd>F</kbd> для смайта</p></div>)}
            </div>
            
            <div className="leaderboard-container">
                <h3>Таблица лидеров</h3>
                <div className="leaderboard-filter">
                    <button onClick={() => setSortBy('highScore')} className={sortBy === 'highScore' ? 'active' : ''}>По реакции</button>
                    <button onClick={() => setSortBy('winStreak')} className={sortBy === 'winStreak' ? 'active' : ''}>По стрику</button>
                </div>

                {myRecord && (
                    <div className="my-record-container">
                         <div className="my-record-row">
                             <span className="my-record-label">{myRecord.nickname}</span>
                         </div>
                         <div className="my-record-row">
                            <span className="my-record-stat">Реакция: <strong>{myRecord.highScore || 'N/A'} мс</strong></span>
                            <span className="my-record-stat">Стрик: <strong>{myRecord.winStreak || 0}</strong></span>
                         </div>
                    </div>
                )}
                <ol className="leaderboard-list">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((user, index) => (
                            <li key={user.id} className={currentUser && user.id === currentUser.uid ? 'current-user-highlight' : ''}>
                                <span className="leaderboard-rank">{index + 1}.</span>
                                <span className="leaderboard-nickname" title={user.email}>
                                    {user.nickname || user.email.split('@')[0]}
                                </span>
                                <span className="leaderboard-score">
                                    {sortBy === 'highScore' ? `${user.highScore} мс` : user.winStreak || 0}
                                </span>
                            </li>
                        ))
                    ) : (<p>Загрузка ладдера...</p>)}
                </ol>
            </div>
        </div>
    );
}

export default SmiteTrainer;