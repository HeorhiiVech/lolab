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
        {/* Строка, которая выводила item.plaintext, была здесь. Мы ее удалили. */}
      </div>
    </div>
  );
}

export default ItemTooltip;