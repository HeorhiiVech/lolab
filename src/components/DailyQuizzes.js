import React, { useState } from 'react';
import OneAttemptSmiteTrainer from './OneAttemptSmiteTrainer';
import GuessTheItemDaily from './GuessTheItemDaily';
import ItemdleGame from './ItemdleGame'; // <-- 1. ИМПОРТ
import './DailyQuizzes.css';

function DailyQuizzes({ currentUser }) {
  const [activeQuiz, setActiveQuiz] = useState(null);

  const renderQuiz = () => {
    switch (activeQuiz) {
      case 'smite':
        return <OneAttemptSmiteTrainer currentUser={currentUser} onExit={() => setActiveQuiz(null)} />;
      case 'item':
        return <GuessTheItemDaily onExit={() => setActiveQuiz(null)} />;
      case 'itemdle': // <-- 2. ДОБАВЛЯЕМ НОВЫЙ CASE
        return <ItemdleGame onExit={() => setActiveQuiz(null)} />;
      default:
        return null;
    }
  };

  if (activeQuiz) {
    return (
      <div>
        <button className="back-to-quizzes-btn" onClick={() => setActiveQuiz(null)}>‹ Назад к списку квизов</button>
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
          <p>Угадайте предмет по его пассивному эффекту.</p>
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