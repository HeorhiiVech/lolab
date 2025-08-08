// src/components/AbilityHasteCalculator.js
import React, { useState, useEffect, useMemo } from 'react';
import { items } from '../data/items.js';
import './AbilityHasteCalculator.css';

function AbilityHasteCalculator() {
  const [selectedItems, setSelectedItems] = useState({});
  const [manualHaste, setManualHaste] = useState(0);
  const [totalHaste, setTotalHaste] = useState(0);
  const [cdr, setCdr] = useState(0);

  // Примеры КД для отображения
  const exampleCooldowns = [8, 15, 60, 120];

  const itemsWithHaste = useMemo(() => 
    Object.values(items).filter(item => item.abilityHaste > 0)
  , []);

  useEffect(() => {
    let hasteFromItems = 0;
    for (const itemId in selectedItems) {
      if(items[itemId]) { // Добавим проверку на случай, если предмет не найден
        hasteFromItems += items[itemId].abilityHaste;
      }
    }

    const currentTotalHaste = hasteFromItems + Number(manualHaste);
    setTotalHaste(currentTotalHaste);

    const calculatedCdr = (100 * currentTotalHaste) / (100 + currentTotalHaste);
    setCdr(calculatedCdr);

  }, [selectedItems, manualHaste]);

  const toggleItem = (itemId) => {
    const newSelection = { ...selectedItems };
    if (newSelection[itemId]) {
      delete newSelection[itemId];
    } else {
      newSelection[itemId] = true;
    }
    setSelectedItems(newSelection);
  };

  return (
    <div className="card">
      <h2>Калькулятор Ability Haste</h2>

      <div className="calculator-section">
        <h4>Выберите предметы:</h4>
        <div className="ah-item-grid">
          {itemsWithHaste.map(item => (
            <div
              key={item.id}
              className={`ah-item-choice ${selectedItems[item.id] ? 'selected' : ''}`}
              onClick={() => toggleItem(item.id)}
              title={`${item.name} (+${item.abilityHaste} AH)`}
            >
              <img src={item.imageUrl} alt={item.name} />
            </div>
          ))}
        </div>
      </div>

      <div className="calculator-section">
        <h4>Или введите значение вручную:</h4>
        <input
          type="number"
          className="manual-haste-input"
          value={manualHaste}
          onChange={(e) => setManualHaste(e.target.value)}
          placeholder="Например, 50"
        />
      </div>

      <div className="ah-results">
        <div className="result-box">
          <span>Общее ускорение</span>
          <p>{totalHaste}</p>
        </div>
        <div className="result-box">
          <span>= % перезарядки</span>
          <p className="gold-text">{cdr.toFixed(1)}%</p>
        </div>
      </div>

      {/* === НОВЫЙ БЛОК С ПРИМЕРАМИ === */}
      <div className="ah-examples">
        <h4>Примеры:</h4>
        <div className="example-grid">
          {exampleCooldowns.map(cd => {
            const newCd = cd * (1 - (cdr / 100));
            return (
              <div key={cd} className="example-item">
                <span className="original-cd">{cd} сек.</span>
                <span>→</span>
                <span className="new-cd">{newCd.toFixed(1)} сек.</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* === КОНЕЦ НОВОГО БЛОКА === */}

    </div>
  );
}

export default AbilityHasteCalculator;