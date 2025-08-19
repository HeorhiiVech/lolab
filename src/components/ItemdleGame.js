import React, { useState, useEffect } from 'react';
import allItems from '../data/items_database.json';
import GuessInput from './GuessInput';
import GuessRow from './GuessRow';
import CountdownTimer from './CountdownTimer'; // Импортируем таймер
import { getTimeBlockSeed } from '../utils/time'; // Импортируем утилиту
import './Itemdle.css';

const getDailyItem = () => {
    const seed = getTimeBlockSeed(); // Используем наш 12-часовой ключ
    const dayIndex = seed % allItems.length;
    return allItems[dayIndex];
};

function ItemdleGame({ onExit }) {
    const [secretItem, setSecretItem] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [isWon, setIsWon] = useState(false);

    useEffect(() => {
        const dailyItem = getDailyItem();
        setSecretItem(dailyItem);

        const currentSeed = getTimeBlockSeed();
        const savedProgress = localStorage.getItem('itemdleProgress');

        if (savedProgress) {
            const { seed, savedGuesses, won } = JSON.parse(savedProgress);
            if (seed === currentSeed) {
                // Восстанавливаем угаданные предметы, если они есть
                const restoredGuesses = savedGuesses.map(gId => allItems.find(item => item.id === gId)).filter(Boolean);
                setGuesses(restoredGuesses);
                if (won) {
                    setIsWon(true);
                }
            } else {
                localStorage.removeItem('itemdleProgress');
            }
        }
    }, []);

    useEffect(() => {
        // Сохраняем прогресс после каждой попытки
        if (!secretItem) return;
        const currentSeed = getTimeBlockSeed();
        const dataToSave = {
            seed: currentSeed,
            savedGuesses: guesses.map(g => g.id),
            won: isWon
        };
        localStorage.setItem('itemdleProgress', JSON.stringify(dataToSave));
    }, [guesses, isWon, secretItem]);

    const handleGuess = (itemName) => {
        if (isWon) return;

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
            {isWon ? (
                <div className="win-message">
                    <h3>Поздравляю! Вы угадали: {secretItem.name_ru}</h3>
                    <button className="next-btn" onClick={onExit}>Отлично</button>
                </div>
            ) : (
                guesses.length < 6 && <GuessInput allItems={allItems} onGuess={handleGuess} /> // Добавим лимит попыток для интереса
            )}
            {!isWon && guesses.length >= 6 && (
                 <div className="win-message">
                    <h3>Попытки закончились! Загаданный предмет: {secretItem.name_ru}</h3>
                    <button className="next-btn" onClick={onExit}>Понятно</button>
                </div>
            )}
        </div>
    );
}

export default ItemdleGame;