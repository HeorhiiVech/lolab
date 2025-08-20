import React, { useState, useEffect } from 'react';
import allItems from '../data/items_database.json';
import GuessInput from './GuessInput';
import GuessRow from './GuessRow';
import CountdownTimer from './CountdownTimer';
import { getTimeBlockSeed } from '../utils/time';
import './Itemdle.css';

const getDailyItem = () => {
    const seed = getTimeBlockSeed();
    const dayIndex = seed % allItems.length;
    return allItems[dayIndex];
};

function ItemdleGame({ onExit }) {
    const [secretItem, setSecretItem] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [isWon, setIsWon] = useState(false);
    const [isFinished, setIsFinished] = useState(false); // Новое состояние для отслеживания конца игры

    useEffect(() => {
        const dailyItem = getDailyItem();
        setSecretItem(dailyItem);

        const currentSeed = getTimeBlockSeed();
        const savedProgress = localStorage.getItem('itemdleProgress');

        if (savedProgress) {
            const { seed, savedGuesses, won, finished } = JSON.parse(savedProgress);
            if (seed === currentSeed) {
                const restoredGuesses = savedGuesses.map(gId => allItems.find(item => item.id === gId)).filter(Boolean);
                setGuesses(restoredGuesses);
                if (won) setIsWon(true);
                if (finished) setIsFinished(true);
            } else {
                localStorage.removeItem('itemdleProgress');
            }
        }
    }, []);

    useEffect(() => {
        if (!secretItem) return;

        // Определяем, закончилась ли игра (победа или 6 попыток)
        const gameFinished = isWon || guesses.length >= 20;
        if (gameFinished && !isFinished) {
            setIsFinished(true); // Устанавливаем, что игра завершена
            const currentSeed = getTimeBlockSeed();
            const dataToSave = {
                seed: currentSeed,
                savedGuesses: guesses.map(g => g.id),
                won: isWon,
                finished: true // Добавляем флаг завершения
            };
            localStorage.setItem('itemdleProgress', JSON.stringify(dataToSave));
            // Отправляем событие, чтобы прогресс-бар обновился
            window.dispatchEvent(new CustomEvent('dailyQuizCompleted'));
        }
    }, [guesses, isWon, secretItem, isFinished]);

    const handleGuess = (itemName) => {
        if (isFinished) return;

        const guessedItem = allItems.find(item => item.name_ru.toLowerCase() === itemName.toLowerCase());
        
        if (!guessedItem || guesses.some(g => g.id === guessedItem.id)) {
            return;
        }

        const newGuesses = [...guesses, guessedItem];
        setGuesses(newGuesses);

        if (guessedItem.id === secretItem.id) {
            setIsWon(true);
        }
    };

    if (!secretItem) {
        return <div>Загрузка игры...</div>;
    }

    return (
        <div className="itemdle-container">
            <div className="quiz-header">
                <h2>Угадай предмет дня</h2>
                <CountdownTimer />
            </div>
            <div className="guess-grid">
                <div className="grid-header">
                    <div>Предмет</div>
                    <div>Тип</div>
                    <div>Статы</div>
                    <div>Роль</div>
                    <div>Стоимость</div>
                    <div>Эффект</div>
                </div>
                {guesses.map(guess => (
                    <GuessRow key={guess.id} guessedItem={guess} secretItem={secretItem} />
                ))}
            </div>
            {isWon && (
                <div className="win-message">
                    <h3>Поздравляю! Вы угадали: {secretItem.name_ru}</h3>
                    <button className="next-btn" onClick={onExit}>Отлично</button>
                </div>
            )}
            {!isWon && guesses.length >= 20 && (
                 <div className="win-message">
                    <h3>Попытки закончились! Загаданный предмет: {secretItem.name_ru}</h3>
                    <button className="next-btn" onClick={onExit}>Понятно</button>
                </div>
            )}
            {!isFinished && <GuessInput allItems={allItems} onGuess={handleGuess} />}
        </div>
    );
}

export default ItemdleGame;
