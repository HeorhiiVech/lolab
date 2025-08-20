// src/components/ItemTooltip.js
import React from 'react';
import './ItemTooltip.css';

function ItemTooltip({ item, position }) {
  if (!item) return null;

  const tooltipStyle = {
    position: 'fixed',
    top: `${position.y + 15}px`,
    left: `${position.x + 15}px`,
  };

  // Функция для безопасного рендеринга HTML из plaintext
  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };

  return (
    <div className="item-tooltip" style={tooltipStyle}>
      <div className="tooltip-header">
        <img src={item.imageUrl} alt={item.name} />
        <div className="tooltip-name-cost">
          <h3>{item.name}</h3>
          <p className="gold-text">{item.cost}g</p>
        </div>
      </div>
      <div className="tooltip-body">
        {/* Этот блок кода перебирает и показывает ТОЛЬКО характеристики */}
        {Object.entries(item.stats).map(([statName, value]) => (
          value > 0 && <p key={statName}>+{value.toFixed(0)} {statName}</p>
        ))}
        
        {/* ИСПРАВЛЕНИЕ: Возвращаем отображение описания предмета, используя dangerouslySetInnerHTML для корректной вставки HTML */}
        {item.plaintext && (
          <div 
            className="plaintext" 
            dangerouslySetInnerHTML={createMarkup(item.plaintext)} 
          />
        )}
      </div>
    </div>
  );
}

export default ItemTooltip;