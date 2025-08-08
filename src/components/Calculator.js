// src/components/Calculator.js
import React, { useState, useCallback, useEffect } from 'react';
import { calculateGold } from '../logic/goldCalculator';
import './Calculator.css';

function Calculator() {
    const [lane, setLane] = useState('Mid');
    const [time, setTime] = useState(10);
    const [missRate, setMissRate] = useState(15);
    const [procRate, setProcRate] = useState(80);
    const [result, setResult] = useState(null);

    const handleCalculate = useCallback(() => {
        const calculationResult = calculateGold(lane, time, missRate, procRate);
        setResult(calculationResult);
    }, [lane, time, missRate, procRate]);

    useEffect(() => {
        handleCalculate();
    }, [handleCalculate]);

    return (
        <div className="card">
            <div className="input-form">
                <div className="input-group">
                    <label>Роль:</label>
                    <div className="lane-selector">
                        <button onClick={() => setLane('Top')} className={lane === 'Top' ? 'active' : ''}>Топ</button>
                        <button onClick={() => setLane('Mid')} className={lane === 'Mid' ? 'active' : ''}>Мид</button>
                        <button onClick={() => setLane('Bot')} className={lane === 'Bot' ? 'active' : ''}>Бот</button>
                        <button onClick={() => setLane('Support')} className={lane === 'Support' ? 'active' : ''}>Саппорт</button>
                    </div>
                </div>

                <div className="input-group">
                    <label>Минута игры: {time}</label>
                    <input
                        type="range"
                        id="time-slider"
                        min="0"
                        max="40"
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                        className="slider"
                    />
                </div>

                {lane !== 'Support' ? (
                    <div className="input-group">
                        <label>% пропущенных крипов: {missRate}%</label>
                        <input type="range" min="0" max="100" value={missRate} onChange={(e) => setMissRate(Number(e.target.value))} className="slider"/>
                    </div>
                ) : (
                    <div className="input-group">
                        <label>% использования зарядов предмета: {procRate}%</label>
                        <input type="range" min="0" max="100" value={procRate} onChange={(e) => setProcRate(Number(e.target.value))} className="slider" />
                    </div>
                )}
            </div>

            {result && (
                <div className="results-display">
                    {result.lane === 'Support' ? (
                        <>
                            <div className="results-summary extended">
                                <div><span>С предмета (проки)</span><p className="gold-text">{result.procGold}g</p></div>
                                <div><span>С предмета (пассив)</span><p className="gold-text">{result.itemBonusPassiveGold}g</p></div>
                                <div><span>Пассивно (общий)</span><p className="gold-text">{result.passiveGold}g</p></div>
                            </div>
                            <div className="total-gold-banner">
                                <span>Всего золота</span>
                                <p className="gold-text total">{result.grandTotalGold}g</p>
                            </div>
                            <div className="kill-equivalent">
                                <span>Это эквивалентно <strong>~{(result.grandTotalGold / 300).toFixed(1)}</strong> убийствам 💀</span>
                            </div>
                            {/* === НОВЫЙ БЛОК ДЛЯ ВАРДОВ === */}
                            <div className="ward-equivalent">
                                <span>(или <strong>~{(result.grandTotalGold / 75).toFixed(0)}</strong> Пинков 😭)</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="results-summary extended">
                                <div><span>С фарма</span><p className="gold-text">{result.totalGold}g</p></div>
                                <div><span>Пассивно</span><p className="gold-text">{result.passiveGold}g</p></div>
                                <div><span>Всего золота</span><p className="gold-text total">{result.grandTotalGold}g</p></div>
                            </div>
                            <div className="kill-equivalent">
                                <span>Это эквивалентно <strong>~{(result.grandTotalGold / 300).toFixed(1)}</strong> убийствам 💀</span>
                            </div>
                            <div className="results-details">
                                <p>Детализация фарма:</p>
                                <p>Всего убито миньонов: <strong>{result.totalFarmed}</strong> из {result.maxTotal}</p>
                                <div className="detail-row">
                                    <span>Милики:</span>
                                    <span>{result.details.melee.farmed} / {result.details.melee.max} (+{result.details.melee.gold}g)</span>
                                </div>
                                <div className="detail-row">
                                    <span>Ренджи:</span>
                                    <span>{result.details.caster.farmed} / {result.details.caster.max} (+{result.details.caster.gold}g)</span>
                                </div>
                                <div className="detail-row">
                                    <span>Телеги:</span>
                                    <span>{result.details.siege.farmed} / {result.details.siege.max} (+{result.details.siege.gold}g)</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Calculator;