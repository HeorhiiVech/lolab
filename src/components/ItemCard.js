import React from 'react';
import './ItemTrainer.css'; // Используем тот же CSS файл

function ItemCard({ item, options, onAnswer, isFlipped, isCorrect }) {
  // Определяем класс для рамки в зависимости от правильности ответа
  const resultClass = isCorrect === null ? '' : (isCorrect ? 'correct-answer' : 'incorrect-answer');

  return (
    <div className={`card-container ${isFlipped ? 'is-flipped' : ''}`}>
      {/* ЛИЦЕВАЯ СТОРОНА (ВОПРОС) */}
      <div className="card-face card-front">
        <div className="item-description">
          <p>{item.description}</p>
        </div>
        <div className="item-options">
          {options.map(option => (
            <button key={option.id} className="option-btn" onClick={() => onAnswer(option.id)}>
              <img src={option.imageUrl} alt={option.name} />
            </button>
          ))}
        </div>
      </div>

      {/* ОБРАТНАЯ СТОРОНА (ОТВЕТ) */}
      <div className={`card-face card-back ${resultClass}`}>
        <img src={item.imageUrl} alt={item.name} className="item-image-back" />
        <h3 className="item-name-back">{item.name}</h3>
        <p className="item-description-back">{item.description}</p>
      </div>
    </div>
  );
}

export default ItemCard;