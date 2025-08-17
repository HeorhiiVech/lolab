import React, { useState, useEffect } from 'react';
import { decks } from '../data/itemDecks';
import TrainingSession from './TrainingSession';
import { fetchUserMastery } from '../api/userProgress';
import './ItemTrainer.css';

// Русские названия для кнопок
const deckTranslations = {
  tank: 'Танк',
  mage: 'Маг',
  fighter: 'Брузер',
  assassin: 'Убийца',
  marksman: 'Стрелок',
  support: 'Саппорт',
  all: 'Все',
};

const deckNames = Object.keys(decks);

function ItemTrainerDashboard({ currentUser }) {
  const [activeGame, setActiveGame] = useState(null);
  const [masteryData, setMasteryData] = useState(new Map());

  useEffect(() => {
    if (currentUser) {
      fetchUserMastery(currentUser.uid).then(data => {
        setMasteryData(data);
      });
    } else {
      setMasteryData(new Map());
    }
  }, [currentUser]);


  const startGame = (deckName, mode, lives = 1) => { // Устанавливаем 1 жизнь по умолчанию
    if (!currentUser && mode === 'learn') {
      alert('Пожалуйста, войдите в аккаунт, чтобы начать режим обучения и сохранять прогресс.');
      return;
    }
    setActiveGame({ deckName, mode, lives });
  };

  const isDeckCompleted = (deckName) => {
    if (!masteryData || masteryData.size === 0) return false;
    
    const deckItemIds = decks[deckName].map(item => item.id);
    return deckItemIds.every(id => masteryData.has(id) && masteryData.get(id).level > 0);
  };

  if (!activeGame) {
    return (
      <div className="trainer-dashboard">
        <h2>Тренажер Предметов</h2>
        <p className="trainer-intro">Выберите категорию и режим, чтобы начать тренировку.</p>
        
        <div className="deck-selection">
          <h3>Режим Обучения</h3>
          <p>Изучайте предметы в своем темпе. Неправильные ответы будут повторяться.</p>
          <div className="deck-buttons">
            {deckNames.map(name => {
              const completed = isDeckCompleted(name);
              return (
                <button key={name} className="deck-btn" onClick={() => startGame(name, 'learn')}>
                  {completed && <span className="deck-completed-badge" title="Колода пройдена!">✓</span>}
                  {deckTranslations[name] || name}
                  {name === 'all' && ` (${decks[name].length} карт)`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mode-selection">
          <h3>Режим Испытания</h3>
          <p>Проверьте свои знания. Одна ошибка — и игра окончена.</p>
          <button className="challenge-btn" onClick={() => startGame('all', 'challenge', 1)}> {/* ИЗМЕНЕНИЕ ЗДЕСЬ */}
            Начать Испытание
          </button>
        </div>
      </div>
    );
  }

  return (
    <TrainingSession
      deckName={activeGame.deckName}
      mode={activeGame.mode}
      initialLives={activeGame.lives}
      currentUser={currentUser}
      onExit={() => setActiveGame(null)}
    />
  );
}

export default ItemTrainerDashboard;