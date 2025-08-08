// src/components/TurretCalculator.js
import React, { useState, useEffect } from 'react';
import './TurretCalculator.css';

function TurretCalculator() {
  const [gameTime, setGameTime] = useState(10);
  const [championHp, setChampionHp] = useState(1000);
  const [championArmor, setChampionArmor] = useState(50);
  const [results, setResults] = useState({ shots: [], survived: 0 });

  useEffect(() => {
    const baseTurretAd = 152;
    const maxTurretAd = 278;
    const adPerSecond = (maxTurretAd - baseTurretAd) / 810; 
    const rampUpBonus = 0.40;
    const maxRampUpBonus = 1.20;

    const currentTimeInSeconds = gameTime * 60;
    let turretAd = baseTurretAd + (adPerSecond * currentTimeInSeconds);
    if (turretAd > maxTurretAd) turretAd = maxTurretAd;

    const damageReduction = 100 / (100 + (championArmor > 0 ? championArmor : 0));

    let remainingHp = championHp;
    let survivedShots = 0;
    const shotDetails = []; // Раньше был shotDamages
    let currentBonus = 0;
    let cumulativeDamage = 0; // <<< 1. ДОБАВЛЕНО: Переменная для подсчета общего урона

    while (remainingHp > 0 && survivedShots < 10) {
      const damageDealt = turretAd * (1 + currentBonus) * damageReduction;
      cumulativeDamage += damageDealt; // <<< 2. ДОБАВЛЕНО: Прибавляем урон к общему
      remainingHp -= damageDealt;
      
      if (remainingHp > 0) {
        survivedShots++;
      }
      
      // <<< 3. ИЗМЕНЕНО: Сохраняем объект с двумя значениями
      shotDetails.push({ 
        individual: damageDealt, 
        cumulative: cumulativeDamage 
      });

      if (currentBonus < maxRampUpBonus) {
        currentBonus += rampUpBonus;
      }
    }

    setResults({ shots: shotDetails, survived: survivedShots });

  }, [gameTime, championHp, championArmor]);

  return (
    <div className="card">
      <h2>Калькулятор урона башен</h2>
      <div className="turret-inputs">
        <div className="input-group">
          <label>Минута игры: {gameTime}:00</label>
          <input
            type="range"
            min="0"
            max="20"
            value={gameTime}
            onChange={(e) => setGameTime(Number(e.target.value))}
            className="slider"
          />
        </div>
        <div className="input-group">
          <label>Здоровье чемпиона:</label>
          <input
            type="number"
            value={championHp}
            onChange={(e) => setChampionHp(Number(e.target.value))}
            className="manual-input"
          />
        </div>
        <div className="input-group">
          <label>Броня чемпиона:</label>
          <input
            type="number"
            value={championArmor}
            onChange={(e) => setChampionArmor(Number(e.target.value))}
            className="manual-input"
          />
        </div>
      </div>

      <div className="turret-results">
        <h3>Результат:</h3>
        <p className="survived-shots">
          Вы переживёте <span className="gold-text">{results.survived}</span> выстрелов башни
        </p>
        <div className="shot-breakdown">
          <h4>Урон по выстрелам:</h4>
          <ul>
            {/* ▼▼▼ 4. ИЗМЕНЕНО: Обновляем отображение ▼▼▼ */}
            {results.shots.map((shot, index) => (
              <li key={index} className={index >= results.survived ? 'lethal' : ''}>
                Выстрел {index + 1}: 
                <span>
                  {Math.round(shot.individual)} урона 
                  <small className="cumulative-dmg"> (Всего: {Math.round(shot.cumulative)})</small>
                </span>
              </li>
            ))}
            {/* ▲▲▲ Конец изменений в отображении ▲▲▲ */}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TurretCalculator;