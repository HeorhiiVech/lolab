// src/components/Calculator.js
import React, { useState, useCallback, useEffect } from 'react';
import { calculateGold } from '../logic/goldCalculator';
import './Calculator.css';

function Calculator() {
    const [lane, setLane] = useState('Mid');
    const [time, setTime] = useState(10);
    const [missRate, setMissRate] = useState(15);
    const [result, setResult] = useState(null);

    const handleCalculate = useCallback(() => {
        const calculationResult = calculateGold(lane, time, missRate);
        setResult(calculationResult);
    }, [lane, time, missRate]);

    useEffect(() => {
        handleCalculate();
    }, [handleCalculate]);

    return (
        <div className="card">
            <div className="input-form">
                <div className="input-group">
                    <label>Линия:</label>
                    <div className="lane-selector">
                        <button onClick={() => setLane('Top')} className={lane === 'Top' ? 'active' : ''}>Топ</button>
                        <button onClick={() => setLane('Mid')} className={lane === 'Mid' ? 'active' : ''}>Мид</button>
                        <button onClick={() => setLane('Bot')} className={lane === 'Bot' ? 'active' : ''}>Бот</button>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="time-slider">Минута фарма: {time}</label>
                    <input
                        type="range"
                        id="time-slider"
                        min="2"
                        max="40"
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                        className="slider"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="miss-rate-slider">% пропущенных крипов: {missRate}%</label>
                    <input
                        type="range"
                        id="miss-rate-slider"
                        min="0"
                        max="100"
                        value={missRate}
                        onChange={(e) => setMissRate(Number(e.target.value))}
                        className="slider"
                    />
                </div>
                {/* Кнопка "Рассчитать" была здесь. Мы ее удалили. */}
            </div>

            {result && (
                <div className="results-display">
                    <div className="results-summary">
                        <div>
                            <span>Всего убито</span>
                            <p>{result.totalFarmed} / {result.maxTotal}</p>
                        </div>
                        <div>
                            <span>Заработано золота</span>
                            <p className="gold-text">{result.totalGold}g</p>
                        </div>
                    </div>
                    <div className="kill-equivalent">
                        <span>Это эквивалентно <strong>~{(result.totalGold / 300).toFixed(1)}</strong> убийствам 💀</span>
                    </div>
                    <div className="results-details">
                        <p>Детализация:</p>
                        <div className="detail-row">
                            <span>Милики:</span>
                            <span>{result.details.melee.farmed} / {result.details.melee.max} (+{result.details.melee.gold}g)</span>
                        </div>
                        <div className="detail-row">
                            <span>Ренжи:</span>
                            <span>{result.details.caster.farmed} / {result.details.caster.max} (+{result.details.caster.gold}g)</span>
                        </div>
                        <div className="detail-row">
                            <span>Телеги:</span>
                            <span>{result.details.siege.farmed} / {result.details.siege.max} (+{result.details.siege.gold}g)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Calculator;