// src/components/TrainingSession.js

import React, { useState, useEffect, useCallback } from 'react';
import { decks } from '../data/itemDecks';
import ItemCard from './ItemCard'; // Предполагается, что этот компонент у вас есть
import { updateItemMastery, updateChallengeBestTime } from '../api/userProgress';
import './ItemTrainer.css';

const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

function TrainingSession({ deckName, mode, initialLives, currentUser, onExit }) {
  const [sessionDeck, setSessionDeck] = useState([]);
  const [mistakesQueue, setMistakesQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [lives, setLives] = useState(initialLives);
  const [gameState, setGameState] = useState('playing');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [answeredOnce, setAnsweredOnce] = useState(new Set());
  const [startTime, setStartTime] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);

  useEffect(() => {
    const initialDeck = decks[deckName];
    setSessionDeck(shuffleArray([...initialDeck]));
    setCurrentIndex(0);
    setLives(initialLives);
    setMistakesQueue([]);
    setGameState('playing');
    setFirstTryCorrect(0);
    setIncorrectCount(0);
    setAnsweredOnce(new Set());
    if (mode === 'challenge') {
      setStartTime(Date.now());
    }
  }, [deckName, mode, initialLives]);

  useEffect(() => {
    if (sessionDeck.length > 0 && currentIndex < sessionDeck.length) {
      const correctItem = sessionDeck[currentIndex];
      const spellShields = ['3102', '3814'];
      let distractorsPool = decks[deckName].filter(item => item.id !== correctItem.id);
      if (spellShields.includes(correctItem.id)) {
        distractorsPool = distractorsPool.filter(item => !spellShields.includes(item.id));
      }
      const wrongOptions = shuffleArray(distractorsPool).slice(0, 2);
      const finalOptions = shuffleArray([correctItem, ...wrongOptions]);
      setOptions(finalOptions);
    }
  }, [sessionDeck, currentIndex, deckName]);

  const handleAnswer = useCallback((selectedItemId) => {
    if (gameState !== 'playing') return;
    const correctItem = sessionDeck[currentIndex];
    const isCorrect = selectedItemId === correctItem.id;
    const isFirstAttempt = !answeredOnce.has(correctItem.id);
    setLastAnswerCorrect(isCorrect);
    setGameState('answered');
    setAnsweredOnce(prev => new Set(prev).add(correctItem.id));
    if (isCorrect) {
        if (isFirstAttempt) {
            setFirstTryCorrect(prev => prev + 1);
        }
    } else {
        setIncorrectCount(prev => prev + 1);
        if (mode === 'learn') {
            setMistakesQueue(prev => [...prev, correctItem]);
        } else {
            setLives(prev => prev - 1);
        }
    }
    if (mode === 'learn') {
        updateItemMastery(currentUser?.uid, correctItem.id, isCorrect);
    }
  }, [gameState, sessionDeck, currentIndex, mode, currentUser, answeredOnce]);
  
  const handleNext = () => {
    const isLastQuestion = currentIndex >= sessionDeck.length - 1 && mistakesQueue.length === 0;
    
    // *** ИСПРАВЛЕНИЕ ЗДЕСЬ ***
    // Проверяем, закончились ли жизни. lives < 1 корректно сработает, когда lives станет 0.
    const hasLost = mode === 'challenge' && lives < 1;
    
    if (isLastQuestion || hasLost) {
      if (mode === 'challenge' && !hasLost) {
        const time = (Date.now() - startTime) / 1000;
        setCompletionTime(time);
        if (incorrectCount === 0) {
            updateChallengeBestTime(currentUser?.uid, deckName, time);
        }
      }
      setGameState('finished');
      return;
    }
    
    const nextIndex = currentIndex + 1;
    if (mode === 'learn' && mistakesQueue.length > 0) {
      const shouldReask = Math.random() < 0.4 || sessionDeck.length - nextIndex < mistakesQueue.length;
      if (shouldReask) {
          const reaskItem = mistakesQueue.shift();
          const insertPosition = nextIndex + Math.floor(Math.random() * 2) + 1;
          sessionDeck.splice(insertPosition, 0, reaskItem);
      }
    }

    setGameState('playing');
    setLastAnswerCorrect(null);
    setCurrentIndex(nextIndex);
  };
  
  if (sessionDeck.length === 0) return <div>Загрузка...</div>;
  
  if (gameState === 'finished') {
    const perfectRun = incorrectCount === 0;
    return (
      <div className="trainer-summary">
        <h2>{mode === 'challenge' ? 'Испытание завершено!' : 'Тренировка окончена!'}</h2>
        {mode === 'learn' ? (
          <>
            <p className="summary-score">Правильно с первого раза: {firstTryCorrect} / {decks[deckName].length}</p>
            <p className="summary-score">Всего ошибок: {incorrectCount}</p>
          </>
        ) : (
          <>
            <p className="summary-score">Результат: {firstTryCorrect} / {sessionDeck.length}</p>
            {perfectRun && <p className="summary-score">Время: {completionTime.toFixed(2)} с.</p>}
            {!perfectRun && lives < 1 && <p style={{color: '#e74c3c'}}>Вы проиграли, допустив ошибку.</p>}
            {!perfectRun && lives >= 1 && <p style={{color: '#a09480'}}>Рекорд не засчитан, так как были допущены ошибки.</p>}
          </>
        )}
        <button className="deck-btn" onClick={onExit}>Вернуться в меню</button>
      </div>
    );
  }

  const currentItem = sessionDeck[currentIndex];
  return (
    <div className="training-session">
      <div className="session-header">
        <span className="session-progress">{currentIndex + 1} / {sessionDeck.length}</span>
        {/* Добавляем Math.max(0, lives) для дополнительной защиты от отрицательных значений */}
        {mode === 'challenge' && <span className="session-lives">Жизни: {'❤'.repeat(Math.max(0, lives))}</span>}
      </div>
      {currentItem && (
        <ItemCard
            key={`${currentItem.id}-${currentIndex}`}
            item={currentItem}
            options={options}
            onAnswer={handleAnswer}
            isFlipped={gameState === 'answered'}
            isCorrect={lastAnswerCorrect}
        />
      )}
      {gameState === 'answered' && (
        <button className="next-btn" onClick={handleNext}>Дальше</button>
      )}
    </div>
  );
}

export default TrainingSession;