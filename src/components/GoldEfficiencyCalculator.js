// src/components/GoldEfficiencyCalculator.js
import React, { useState, useEffect, useMemo } from 'react';
import { items, statGoldValues } from '../data/items.js';
import ItemTooltip from './ItemTooltip';
import './GoldEfficiencyCalculator.css';

// Вынесем названия статов для фильтров в константу для удобства
const FILTERABLE_STATS = {
  attackDamage: 'Сила атаки',
  abilityPower: 'Сила умений',
  armor: 'Броня',
  magicResist: 'Сопр. магии',
  health: 'Здоровье',
  attackSpeed: 'Скор. атаки',
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeStatFilter, setActiveStatFilter] = useState(null);

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
          // Сначала добавляем все статы в общую сводку
          const statValue = item.stats[stat];
          newTotalStats[stat] = (newTotalStats[stat] || 0) + statValue;

          // Затем считаем стоимость только тех статов, у которых она есть
          if (statGoldValues[stat]) {
            currentItemStatValue += statValue * statGoldValues[stat];
          }
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
    setSearchTerm('');
    setActiveStatFilter(null);
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

  const handleStatFilterClick = (statKey) => {
    setActiveStatFilter(prevFilter => (prevFilter === statKey ? null : statKey));
  };
  
  const filteredItems = useMemo(() => {
    let tempItems = Object.values(items);

    if (activeStatFilter) {
      tempItems = tempItems.filter(item => item.stats[activeStatFilter] > 0);
    }

    if (searchTerm.length > 0) {
      tempItems = tempItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return tempItems;
  }, [activeStatFilter, searchTerm]);

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
            
            <div className="stat-filters">
              {Object.entries(FILTERABLE_STATS).map(([key, name]) => (
                <button
                  key={key}
                  className={`filter-btn ${activeStatFilter === key ? 'active' : ''}`}
                  onClick={() => handleStatFilterClick(key)}
                >
                  {name}
                </button>
              ))}
            </div>

            <input 
              type="text"
              placeholder="Поиск по названию..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="item-grid">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="item-choice" 
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={(e) => {
                    setHoveredItem(item);
                    setTooltipPosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                  onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                >
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {hoveredItem && <ItemTooltip item={hoveredItem} position={tooltipPosition} />}
    </div>
  );
}

export default GoldEfficiencyCalculator;