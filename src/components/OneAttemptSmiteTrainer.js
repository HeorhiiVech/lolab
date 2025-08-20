import React, { useState, useEffect } from 'react';
import SmiteTrainer from './SmiteTrainer';
import './SmiteTrainer.css';
import { getTimeBlockSeed } from '../utils/time';

function OneAttemptSmiteTrainer({ currentUser, onExit, onQuizComplete }) {
  // Отвечает за блокировку квиза, если он УЖЕ УСПЕШНО пройден сегодня
  const [hasWonToday, setHasWonToday] = useState(false);
  // Показывает экран результата после одной попытки
  const [sessionFinished, setSessionFinished] = useState(false);
  // Хранит результат последней попытки
  const [sessionResult, setSessionResult] = useState({ message: '', success: false });
  // Для экрана загрузки
  const [isLoading, setIsLoading] = useState(true);
  // Ключ для принудительной перезагрузки компонента SmiteTrainer при повторной попытке
  const [gameKey, setGameKey] = useState(Date.now());

  useEffect(() => {
    // Проверяем статус при загрузке компонента
    const checkWinStatus = () => {
      setIsLoading(true);
      const currentSeed = getTimeBlockSeed();
      const savedProgress = localStorage.getItem('smiteTrainerDailyProgress');

      if (savedProgress) {
        const { seed, won } = JSON.parse(savedProgress);
        // Блокируем игру, только если в записи есть seed этого дня И флаг won === true
        if (seed === currentSeed && won === true) {
          setHasWonToday(true);
        }
      }
      setIsLoading(false);
    };

    checkWinStatus();
  }, []);

  const handleGameFinish = (success, message) => {
    // Эта функция вызывается после каждой попытки смайта
    if (success) {
      // Если попытка УСПЕШНАЯ
      const currentSeed = getTimeBlockSeed();
      const dataToSave = {
          seed: currentSeed,
          finished: true,
          won: true // Сохраняем с флагом победы
      };
      localStorage.setItem('smiteTrainerDailyProgress', JSON.stringify(dataToSave));
      
      // Вызываем функцию из App.js напрямую для обновления
      onQuizComplete(); 
    }
    // Если попытка была НЕУСПЕШНОЙ, мы ничего не сохраняем в localStorage

    // В любом случае показываем результат этой попытки
    setSessionResult({ message, success });
    setSessionFinished(true);
  };

  const handleRetry = () => {
    // Эта функция запускает новую попытку после неудачи
    setSessionFinished(false); // Скрываем экран результата
    setGameKey(Date.now()); // Меняем ключ, чтобы SmiteTrainer полностью перезагрузился
  };
  
  if (isLoading) {
      return (
          <div className="daily-quiz-container">
              <h3>Проверка вашего статуса...</h3>
          </div>
      );
  }

  if (hasWonToday) {
    // Если пользователь уже победил сегодня
    return (
      <div className="daily-quiz-container">
        <h3>Испытание пройдено!</h3>
        <p>Вы уже успешно прошли испытание смайта сегодня. Возвращайтесь завтра!</p>
        <button className="start-button" onClick={onExit}>Отлично</button>
      </div>
    );
  }

  if (sessionFinished) {
    // Если только что завершилась одна попытка
    return (
      <div className="daily-quiz-container">
          <h3>{sessionResult.success ? 'Победа!' : 'Неудача!'}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{sessionResult.message}</p>
          {sessionResult.success ? (
            // Если попытка была успешной, кнопка закрывает квиз
            <button className="start-button" onClick={onExit}>Отлично</button>
          ) : (
            // Если попытка была неудачной, кнопка предлагает сыграть еще раз
            <button className="start-button" onClick={handleRetry}>Попробовать снова</button>
          )}
      </div>
    );
  }

  // Если игра еще не началась или была перезапущена после неудачи
  return (
    <SmiteTrainer 
        key={gameKey} // Ключ важен для сброса состояния
        currentUser={currentUser} 
        isDailyChallenge={true} 
        onChallengeFinish={handleGameFinish} 
    />
  );
}

export default OneAttemptSmiteTrainer;
