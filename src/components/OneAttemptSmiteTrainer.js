import React, { useState, useEffect } from 'react';
import SmiteTrainer from './SmiteTrainer'; // Мы "оборачиваем" существующий тренажер
import './SmiteTrainer.css'; // Используем те же стили

function OneAttemptSmiteTrainer({ currentUser, onExit }) {
  const [hasWonToday, setHasWonToday] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionResult, setSessionResult] = useState({ message: '', success: false });

  // При загрузке проверяем, была ли сегодня ПОБЕДА
  useEffect(() => {
    if (!currentUser) {
      const lastWinDate = localStorage.getItem('smiteChallengeWinDate');
      const today = new Date().toDateString();
      if (lastWinDate === today) {
        setHasWonToday(true);
      }
    }
  }, [currentUser]);

  // SmiteTrainer вызовет эту функцию, когда игра закончится
  const handleGameFinish = (success, message) => {
    // ----- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ -----
    // Сохраняем дату только в случае ПОБЕДЫ
    if (success && !currentUser) {
      localStorage.setItem('smiteChallengeWinDate', new Date().toDateString());
      setHasWonToday(true);
    }
    setSessionResult({ message, success });
    setSessionFinished(true); // Показываем экран с результатом
  };
  
  // Если игрок уже побеждал сегодня, показываем экран успеха
  if (hasWonToday) {
    return (
      <div className="daily-quiz-container">
        <h3>Испытание пройдено!</h3>
        <p>Вы уже успешно прошли испытание смайта сегодня. Возвращайтесь завтра!</p>
        <button className="start-button" onClick={onExit}>Отлично</button>
      </div>
    );
  }

  // Если текущая игровая сессия завершена, показываем ее результат
  if (sessionFinished) {
      return (
        <div className="daily-quiz-container">
            <h3>{sessionResult.success ? 'Победа!' : 'Неудача!'}</h3>
            <p>{sessionResult.message}</p>
            <button className="start-button" onClick={onExit}>
                {sessionResult.success ? 'Отлично' : 'Назад (чтобы попробовать снова)'}
            </button>
      </div>
      )
  }

  // Если попытки не было, запускаем тренажер в специальном режиме
  return (
    <SmiteTrainer 
        currentUser={currentUser} 
        isDailyChallenge={true} 
        onChallengeFinish={handleGameFinish} 
    />
  );
}

export default OneAttemptSmiteTrainer;