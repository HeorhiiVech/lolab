import React, { useState } from 'react';
import OneAttemptSmiteTrainer from './OneAttemptSmiteTrainer';
import GuessTheItemDaily from './GuessTheItemDaily';
import ItemdleGame from './ItemdleGame';
import './DailyQuizzes.css';

// 1. ПРИНИМАЕМ НОВУЮ ФУНКЦИЮ onQuizComplete
function DailyQuizzes({ currentUser, onQuizComplete }) {
  const [activeQuiz, setActiveQuiz] = useState(null);

  const handleQuizExit = () => {
    setActiveQuiz(null);
  };

  const renderQuiz = () => {
    switch (activeQuiz) {
      case 'smite':
        // 2. ПЕРЕДАЕМ ФУНКЦИЮ ДАЛЬШЕ
        return <OneAttemptSmiteTrainer currentUser={currentUser} onExit={handleQuizExit} onQuizComplete={onQuizComplete} />;
      case 'item':
        return <GuessTheItemDaily onExit={handleQuizExit} onQuizComplete={onQuizComplete} />;
      case 'itemdle':
        return <ItemdleGame onExit={handleQuizExit} onQuizComplete={onQuizComplete} />;
      default:
        return null;
    }
  };

  if (activeQuiz) {
    return (
      <div>
        {renderQuiz()}
      </div>
    );
  }

  return (
    <div className="daily-quizzes-dashboard">
      <h2>Ежедневные квизы</h2>
      <p>Проверьте свои знания и навыки! Новые испытания каждый день.</p>
      <div className="quiz-list">
        <div className="quiz-card" onClick={() => setActiveQuiz('itemdle')}>
          <h3>Предметли</h3>
          <p>Угадайте секретный предмет, получая подсказки после каждой попытки.</p>
        </div>
        <div className="quiz-card" onClick={() => setActiveQuiz('item')}>
          <h3>Угадай предмет</h3>
          <p>Угадайте предмет по его компонентам.</p>
        </div>
        <div className="quiz-card" onClick={() => setActiveQuiz('smite')}>
          <h3>Испытание смайта</h3>
          <p>У вас есть только одна попытка, чтобы показать лучшую реакцию.</p>
        </div>
      </div>
    </div>
  );
}

export default DailyQuizzes;
