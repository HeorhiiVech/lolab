// src/components/GoldEfficiencyCalculator.js
import React, { useState, useEffect } from 'react';
import { items, statGoldValues } from '../data/items.js';
import './GoldEfficiencyCalculator.css';

function GoldEfficiencyCalculator() {
  const [build, setBuild] = useState(Array(6).fill(null));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [results, setResults] = useState({
    totalStats: {},
    efficiencies: Array(6).fill(0),
    totalCost: 0,
    totalEfficiency: 0,
  });
  // === НОВОЕ СОСТОЯНИЕ ДЛЯ ПОИСКА ===
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const newTotalStats = {};
    const newEfficiencies = Array(6).fill(0);
    let newTotalCost = 0;
    let totalStatValue = 0;

    build.forEach((item, index) => {
      if (item) {
        newTotalCost += item.cost;
        let currentItemStatValue = 0;

        for (const stat in item.stats) {
          if (statGoldValues[stat]) {
            const statValue = item.stats[stat];
            newTotalStats[stat] = (newTotalStats[stat] || 0) + statValue;
            currentItemStatValue += statValue * statGoldValues[stat];
          }
        }
        
        // Добавляем стоимость Ability Haste, если он есть
        if (item.abilityHaste > 0) {
            currentItemStatValue += item.abilityHaste * statGoldValues.abilityHaste;
            newTotalStats['abilityHaste'] = (newTotalStats['abilityHaste'] || 0) + item.abilityHaste;
        }

        newEfficiencies[index] = item.cost > 0 ? Math.round((currentItemStatValue / item.cost) * 100) : 0;
        totalStatValue += currentItemStatValue;
      }
    });

    setResults({
      totalStats: newTotalStats,
      efficiencies: newEfficiencies,
      totalCost: newTotalCost,
      totalEfficiency: newTotalCost > 0 ? Math.round((totalStatValue / newTotalCost) * 100) : 0,
    });
  }, [build]);

  const handleSlotClick = (index) => {
    setActiveSlot(index);
    setSearchTerm(''); // Сбрасываем поиск при открытии окна
    setIsModalOpen(true);
  };

  const handleItemSelect = (item) => {
    const newBuild = [...build];
    newBuild[activeSlot] = item;
    setBuild(newBuild);
    setIsModalOpen(false);
  };

  const handleClearSlot = (index, event) => {
    event.stopPropagation();
    const newBuild = [...build];
    newBuild[index] = null;
    setBuild(newBuild);
  };

  // === НОВАЯ ЛОГИКА ФИЛЬТРАЦИИ ПРЕДМЕТОВ ===
  const filteredItems = Object.values(items).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <h2>Калькулятор голд эффективности</h2>
      
      <div className="build-section">
        <h3>Ваша сборка:</h3>
        <div className="build-slots">
          {build.map((item, index) => (
            <div key={index} className="item-slot" onClick={() => handleSlotClick(index)}>
              {item ? (
                <>
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="item-efficiency">{results.efficiencies[index]}%</div>
                  <button className="clear-slot-btn" onClick={(e) => handleClearSlot(index, e)}>×</button>
                </>
              ) : (
                <div className="plus-sign">+</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="results-section">
        <h3>Общие результаты:</h3>
        <div className="total-results">
            <p>Общая стоимость: <span className="gold-text">{results.totalCost}g</span></p>
            <p>Общая эффективность: <span className="gold-text">{results.totalEfficiency}%</span></p>
        </div>
        <h4>Суммарные характеристики:</h4>
        <div className="total-stats">
          {Object.entries(results.totalStats).map(([stat, value]) => (
            value > 0 && <p key={stat}>{stat}: <span>{value.toFixed(0)}</span></p>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Выберите предмет для слота #{activeSlot + 1}</h3>
            {/* === НОВОЕ ПОЛЕ ВВОДА ДЛЯ ПОИСКА === */}
            <input 
              type="text"
              placeholder="Поиск по названию..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="item-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-choice" onClick={() => handleItemSelect(item)} title={item.name}>
                  <img src={item.imageUrl} alt={item.name} />
                  {/* Теперь название предмета показывается во всплывающей подсказке */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoldEfficiencyCalculator;