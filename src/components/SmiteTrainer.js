import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SmiteTrainer.css';

// Импорты из Firebase
import { db } from '../firebase-config';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc
} from "firebase/firestore";

// --- Константы игры ---
const SMITE_DMG = 1200;
const DRAGON_MAX_HP = 6400;
const PLAYER_AA_DMG = 135;
const ENEMY_AA_DMG = 150;
const PLAYER_Q_DMG = 300;
const PLAYER_E_DMG = 150;
const ENEMY_Q_PRIMARY_DMG = 300;
const ENEMY_Q_SECONDARY_DMG = 250;
const ENEMY_Q_DMG_TOTAL = ENEMY_Q_PRIMARY_DMG + ENEMY_Q_SECONDARY_DMG;

const PLAYER_Q_COOLDOWN = 6000;
const PLAYER_E_COOLDOWN = 5000;
const ENEMY_W_COOLDOWN = 12000;
const ENEMY_Q_COOLDOWN = 7000;

const NORMAL_ATTACK_INTERVAL = 850;
const FAST_ATTACK_INTERVAL = 600;

function SmiteTrainer({ currentUser }) {
    // ... состояния ...
    const [dragonHp, setDragonHp] = useState(DRAGON_MAX_HP);
    const [gameState, setGameState] = useState('ready');
    const [resultMessage, setResultMessage] = useState('');
    const [smiteableTimestamp, setSmiteableTimestamp] = useState(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [allyAttack, setAllyAttack] = useState(false);
    const [enemyAttack, setEnemyAttack] = useState(false);
    const [playerQState, setPlayerQState] = useState('ready');
    const [playerEonCD, setPlayerEonCD] = useState(false);
    const [attackSpeedBuffCount, setAttackSpeedBuffCount] = useState(0);
    const qRecastTimer = useRef(null);
    const [enemyQonCD, setEnemyQonCD] = useState(false);
    const [enemyWonCD, setEnemyWonCD] = useState(false);
    const [isBlinded, setIsBlinded] = useState(false);
    const [blindCircles, setBlindCircles] = useState([]);
    const blindTimeout = useRef(null);
    const [damageNumbers, setDamageNumbers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRecord, setMyRecord] = useState(null);
    const [showEShockwave, setShowEShockwave] = useState(false);
    const [showQProjectile, setShowQProjectile] = useState(false);
    const [enemyQAnimation, setEnemyQAnimation] = useState('idle');
    
    const aiPlan = useRef(null);

    // ... (fetchLeaderboard, fetchMyRecord, updateRating - без изменений) ...
    const fetchLeaderboard = useCallback(async () => {
        try {
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, orderBy('rating', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const leaders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeaderboard(leaders);
        } catch (error) { console.error("Ошибка при загрузке ладдера:", error); }
    }, []);

    const fetchMyRecord = useCallback(async () => {
        if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                setMyRecord(userDoc.data());
            }
        } else {
            setMyRecord(null);
        }
    }, [currentUser]);
    
    const updateRating = useCallback(async (points) => {
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);
        try {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const currentRating = userDoc.data().rating || 1000;
                const newRating = currentRating + points;
                await updateDoc(userRef, { rating: newRating });
                fetchMyRecord();
                fetchLeaderboard();
            }
        } catch (error) { console.error("Ошибка обновления рейтинга:", error); }
    }, [currentUser, fetchMyRecord, fetchLeaderboard]);
    
    useEffect(() => {
        fetchLeaderboard();
        fetchMyRecord();
    }, [fetchLeaderboard, fetchMyRecord, currentUser]);

    const showDamageNumber = useCallback((amount, type) => {
        let leftPosition = '40%';
        if (type === 'player-aa' || type === 'player-skill') {
            leftPosition = `${5 + Math.random() * 20}%`; 
        } else if (type === 'enemy-aa' || type === 'enemy-skill') {
            leftPosition = `${75 - Math.random() * 20}%`; 
        } else if (type === 'smite') {
            leftPosition = `${40 + Math.random() * 10}%`; 
        }

        const newDamageNumber = {
            id: Date.now() + Math.random(),
            amount: amount,
            type: type,
            left: leftPosition,
            top: `${40 + Math.random() * 20}%`
        };
        setDamageNumbers(current => [...current, newDamageNumber]);
        setTimeout(() => {
            setDamageNumbers(current => current.filter(dn => dn.id !== newDamageNumber.id));
        }, 1200);
    }, []);

    const dealDamage = useCallback((amount, type, actor, isSmite = false) => {
        showDamageNumber(amount, type);
        let hpBeforeAction;
        setDragonHp(currentHp => {
            hpBeforeAction = currentHp;
            const newHp = Math.max(0, currentHp - amount);
            
            if (gameState !== 'active') return newHp;

            if (isSmite) {
                setGameState('finished');
                if (actor === 'player') {
                    if (hpBeforeAction <= SMITE_DMG) {
                        let points = 60;
                        const reaction = smiteableTimestamp ? Date.now() - smiteableTimestamp : null;
                        if (reaction) {
                            if (reaction <= 49) points = 60;
                            else if (reaction <= 99) points = 25;
                            else if (reaction <= 249) points = 15;
                        }
                        const resultText = reaction ? `Реакция: ${reaction}мс.` : 'Комбо-убийство!';
                        setResultMessage(`Отличный смайт! ${resultText} (+${points} pt.)`);
                        updateRating(points);
                    } else {
                        setResultMessage(`Слишком рано! Оставалось ${Math.round(hpBeforeAction)} HP. (-60 pt.)`);
                        updateRating(-60);
                    }
                } else { // actor === 'enemy'
                    setResultMessage(`Слишком медленно! Враг вас пересмайтил. (-60 pt.)`);
                    updateRating(-60);
                }
            } else if (newHp === 0) {
                setGameState('finished');
                if (actor === 'player') {
                    setResultMessage(`Победа! Дракон добит умением. (+25 pt.)`);
                    updateRating(25);
                } else {
                    setResultMessage(`Дракон убит, но не вами! (-60 pt.)`);
                    updateRating(-60);
                }
            }
            return newHp;
        });
    }, [smiteableTimestamp, updateRating, gameState, showDamageNumber]);

    const handleKeyPress = useCallback((event) => {
        if (gameState !== 'active') return;

        if (event.code === 'KeyD' || event.code === 'KeyF') {
            dealDamage(SMITE_DMG, 'smite', 'player', true);
        }

        if (event.code === 'KeyE' && !playerEonCD) {
            dealDamage(PLAYER_E_DMG, 'player-skill', 'player');
            setPlayerEonCD(true);
            setAttackSpeedBuffCount(2);
            setShowEShockwave(true);
            setTimeout(() => setShowEShockwave(false), 500);
            setTimeout(() => setPlayerEonCD(false), PLAYER_E_COOLDOWN);
        }
        
        if (event.code === 'KeyQ') {
            if (playerQState === 'ready') {
                dealDamage(PLAYER_Q_DMG, 'player-skill', 'player');
                setPlayerQState('firstCastWindow');
                setAttackSpeedBuffCount(2);
                setShowQProjectile(true);
                setTimeout(() => setShowQProjectile(false), 600);
                qRecastTimer.current = setTimeout(() => {
                    if (playerQState === 'firstCastWindow') {
                        setPlayerQState('cooldown');
                        setTimeout(() => setPlayerQState('ready'), PLAYER_Q_COOLDOWN);
                    }
                }, 2000);

            } else if (playerQState === 'firstCastWindow') {
                dealDamage(PLAYER_Q_DMG, 'player-skill', 'player');
                clearTimeout(qRecastTimer.current);
                setPlayerQState('cooldown');
                setTimeout(() => setPlayerQState('ready'), PLAYER_Q_COOLDOWN);
            }
        }
    }, [gameState, playerEonCD, playerQState, dealDamage]);
    
    const handleCircleClick = (circleId) => {
        setBlindCircles(prev => prev.filter(c => c.id !== circleId));
    };

    useEffect(() => {
        if (isBlinded && blindCircles.length === 0) {
            setIsBlinded(false);
            clearTimeout(blindTimeout.current);
        }
    }, [blindCircles, isBlinded]);

    useEffect(() => {
        if (gameState !== 'active') return;

        const currentAttackInterval = (isPlayerTurn && attackSpeedBuffCount > 0) ? FAST_ATTACK_INTERVAL : NORMAL_ATTACK_INTERVAL;
        
        const gameTick = setInterval(() => {
            if (gameState !== 'active') {
                clearInterval(gameTick);
                return;
            }

            if (isPlayerTurn) {
                dealDamage(PLAYER_AA_DMG, 'player-aa', 'player');
                setAllyAttack(true);
                setTimeout(() => setAllyAttack(false), 150);
                if (attackSpeedBuffCount > 0) {
                    setAttackSpeedBuffCount(prev => prev - 1);
                }
            } else {
                setDragonHp(currentHp => {
                    const plan = aiPlan.current;
                    const hpPercent = currentHp / DRAGON_MAX_HP;

                    // ИСПРАВЛЕНО: Железная логика смайта
                    if (plan.willAttemptBurst && currentHp <= plan.burstThreshold && !enemyQonCD) {
                        dealDamage(ENEMY_Q_DMG_TOTAL + SMITE_DMG, 'smite', 'enemy', true);
                        setEnemyQAnimation('forward');
                        setTimeout(() => setEnemyQAnimation('idle'), 500);
                        return Math.max(0, currentHp - (ENEMY_Q_DMG_TOTAL + SMITE_DMG));
                    }
                    if (!plan.willAttemptBurst && currentHp <= plan.smiteThreshold) {
                        dealDamage(SMITE_DMG, 'smite', 'enemy', true);
                        return Math.max(0, currentHp - SMITE_DMG);
                    }
                    
                    if (!enemyWonCD && !plan.wUsed && hpPercent <= plan.wThreshold) {
                        plan.wUsed = true;
                        setEnemyWonCD(true);
                        setIsBlinded(true);
                        const newCircles = Array.from({ length: 5 }, (_, i) => ({ id: i, top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` }));
                        setBlindCircles(newCircles);
                        blindTimeout.current = setTimeout(() => { setIsBlinded(false); setBlindCircles([]); }, 4000);
                        setTimeout(() => setEnemyWonCD(false), ENEMY_W_COOLDOWN);
                    }
                    else if (!enemyQonCD && hpPercent < 0.6 && Math.random() < 0.6) {
                        setEnemyQonCD(true);
                        setEnemyQAnimation('forward');
                        dealDamage(ENEMY_Q_PRIMARY_DMG, 'enemy-skill', 'enemy');
                        
                        setTimeout(() => { 
                            dealDamage(ENEMY_Q_SECONDARY_DMG, 'enemy-skill', 'enemy');
                            setEnemyQAnimation('backward');
                        }, 500);

                        setTimeout(() => setEnemyQAnimation('idle'), 1000);
                        setTimeout(() => setEnemyQonCD(false), ENEMY_Q_COOLDOWN);
                    }

                    dealDamage(ENEMY_AA_DMG, 'enemy-aa', 'enemy');
                    setEnemyAttack(true);
                    setTimeout(() => setEnemyAttack(false), 150);
                    
                    return currentHp;
                });
            }
            setIsPlayerTurn(prev => !prev);
        }, currentAttackInterval);

        return () => clearInterval(gameTick);
    }, [gameState, isPlayerTurn, attackSpeedBuffCount, dealDamage, enemyQonCD, enemyWonCD]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            clearTimeout(qRecastTimer.current);
            clearTimeout(blindTimeout.current);
        }
    }, [handleKeyPress]);

    useEffect(() => {
        if (dragonHp > SMITE_DMG) {
            setSmiteableTimestamp(null);
        } else if (dragonHp <= SMITE_DMG && !smiteableTimestamp) {
            setSmiteableTimestamp(Date.now());
        }
    }, [dragonHp, smiteableTimestamp]);

    const startGame = () => {
        const roll = Math.random();
        let plan;
        if (roll < 0.4) {
            plan = {
                willAttemptBurst: true,
                burstThreshold: 1700
            };
        } else {
            plan = {
                willAttemptBurst: false,
                smiteThreshold: 1200 // ИСПРАВЛЕНО: Жесткий порог
            };
        }

        const wRoll = Math.random();
        if (wRoll < 0.33) {
            plan.wThreshold = 0.95;
        } else if (wRoll < 0.66) {
            plan.wThreshold = 0.50;
        } else {
            plan.wThreshold = 0.30;
        }
        plan.wUsed = false;

        aiPlan.current = plan;

        setDragonHp(DRAGON_MAX_HP);
        setGameState('active');
        setResultMessage('');
        setSmiteableTimestamp(null);
        setIsPlayerTurn(true);
        setPlayerQState('ready');
        setPlayerEonCD(false);
        setAttackSpeedBuffCount(0);
        setEnemyQonCD(false);
        setEnemyWonCD(false);
        setIsBlinded(false);
        setBlindCircles([]);
        setDamageNumbers([]);
        clearTimeout(qRecastTimer.current);
        clearTimeout(blindTimeout.current);
    };

    const healthPercentage = (dragonHp / DRAGON_MAX_HP) * 100;

    return (
        <div className="smite-trainer-wrapper">
            <div className="card">
                <div className="trainer-container">
                    <div className="character-area">
                        <div className={`character ally ${allyAttack ? 'attacking' : ''}`}>
                             {showEShockwave && <div className="shockwave"></div>}
                             {showQProjectile && <div className="q-projectile"></div>}
                        </div>
                        <div className="skills-wrapper">
                            <div className={`skill-icon q-skill ${playerQState !== 'ready' ? 'cooldown' : ''}`}>Q{playerQState === 'firstCastWindow' && <div className="recast-window"></div>}</div>
                            <div className={`skill-icon e-skill ${playerEonCD ? 'cooldown' : ''}`}>E</div>
                        </div>
                    </div>
                    <div className="dragon-area">
                        <div className="dragon-wrapper">
                            <div className={`dragon ${gameState === 'active' ? 'ready' : ''}`}></div>
                            {damageNumbers.map(dn => (
                                <span key={dn.id} className={`damage-number ${dn.type}-damage`} style={{ left: dn.left, top: dn.top }}>
                                    -{dn.amount}
                                </span>
                            ))}
                        </div>
                        <div className="hp-bar-container">
                            <div className={`hp-bar ${isBlinded ? 'blinded' : ''}`} style={{ width: `${healthPercentage}%` }}></div>
                            {!isBlinded && <span className="hp-text">{Math.round(dragonHp)} / {DRAGON_MAX_HP}</span>}
                            {isBlinded && <div className="hp-blind-overlay"></div>}
                        </div>
                    </div>
                    <div className="character-area">
                        <div className={`character enemy ${enemyAttack ? 'attacking' : ''}`}>
                            {enemyQAnimation !== 'idle' && <div className={`enemy-q-wave ${enemyQAnimation}`}></div>}
                        </div>
                        <div className="skills-wrapper">
                            <div className={`skill-icon enemy-q ${enemyQonCD ? 'cooldown' : 'ready'}`}>Q</div>
                            <div className={`skill-icon enemy-w ${enemyWonCD ? 'cooldown' : 'ready'}`}>W</div>
                        </div>
                    </div>
                </div>
                
                 {gameState !== 'active' && (
                    <div className="game-controls">
                        {resultMessage && <p className="result-message">{resultMessage}</p>}
                        <button onClick={startGame} className="start-button">Начать</button>
                        <div className="game-mechanics">
                            <h4>Механика игры:</h4>
                            <ul>
                                <li><b>Q</b> - Нанести {PLAYER_Q_DMG} урона. Можно повторно нажать в теч. 2с для еще {PLAYER_Q_DMG} урона.</li>
                                <li><b>E</b> - Нанести {PLAYER_E_DMG} урона (Перезарядка: 5 сек).</li>
                                <li><b>D/F</b> - Смайт: {SMITE_DMG} урона.</li>
                                <li>Использование Q или E ускоряет 2 ваши следующие авто-атаки.</li>
                            </ul>
                        </div>
                    </div>
                )}
                {gameState === 'active' && (<div className="smite-controls"><p className="smite-instruction"><b>Q, E</b> - Способности, <b>D/F</b> - Смайт</p></div>)}

                {blindCircles.map(circle => (<div key={circle.id} className="blind-circle" style={{ top: circle.top, left: circle.left }} onClick={() => handleCircleClick(circle.id)}></div>))}
            </div>
            
            <div className="leaderboard-container">
                <h3>Таблица лидеров</h3>
                 {myRecord && (<div className="my-record-container"><div className="my-record-row"><span className="my-record-label">{myRecord.nickname || 'Мой Профиль'}</span><span className="my-record-stat">Рейтинг: <strong>{myRecord.rating || 500} pt.</strong></span></div></div>)}
                <ol className="leaderboard-list">
                    {leaderboard.length > 0 ? (leaderboard.map((user, index) => (<li key={user.id} className={currentUser && user.id === currentUser.uid ? 'current-user-highlight' : ''}><span className="leaderboard-rank">{index + 1}.</span><span className="leaderboard-nickname">{user.nickname || user.email.split('@')[0]}</span><span className="leaderboard-score">{user.rating || 0} pt.</span></li>))) : (<p>Загрузка ладдера...</p>)}
                </ol>
            </div>
        </div>
    );
}

export default SmiteTrainer;
