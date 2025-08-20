import React, { useState, useEffect } from 'react';
import allDDragonItems from '../data/items.json'; 
import CountdownTimer from './CountdownTimer';
import { getTimeBlockSeed } from '../utils/time';
import './GuessTheRecipe.css'; 

const itemsById = allDDragonItems.data;
const buildableItems = Object.values(itemsById).filter(item => 
    item.from && item.from.length > 0 && item.maps['11'] && item.gold.purchasable
);

const getDailyItem = () => {
    const seed = getTimeBlockSeed();
    const dayIndex = seed % buildableItems.length;
    return buildableItems[dayIndex];
};

const getRandomOptions = (correctItem) => {
    const options = new Set([correctItem]);
    while (options.size < 4) {
        const randomItem = buildableItems[Math.floor(Math.random() * buildableItems.length)];
        if (randomItem.image.full !== correctItem.image.full) {
            options.add(randomItem);
        }
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
};

function GuessTheItemDaily({ onExit }) {
    const [secretItem, setSecretItem] = useState(null);
    const [options, setOptions] = useState([]);
    
    const [hasFinishedToday, setHasFinishedToday] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        const dailyItem = getDailyItem();
        setSecretItem(dailyItem);
        setOptions(getRandomOptions(dailyItem));

        const currentSeed = getTimeBlockSeed();
        const savedProgress = localStorage.getItem('recipeQuizProgressV3');
        
        if (savedProgress) {
            const { seed, finished } = JSON.parse(savedProgress);
            if (seed === currentSeed && finished) {
                setHasFinishedToday(true);
            } else if (seed !== currentSeed) {
                 localStorage.removeItem('recipeQuizProgressV3');
            }
        }
    }, []);

    const handleAnswer = (selectedItem) => {
        if (isAnswered) return;
        const wasCorrect = selectedItem.image.full === secretItem.image.full;
        setIsCorrect(wasCorrect);
        setSelectedOption(selectedItem.image.full);
        setIsAnswered(true);
        setHasFinishedToday(true); // В этой игре любая попытка - финальная

        const currentSeed = getTimeBlockSeed();
        const dataToSave = { seed: currentSeed, won: wasCorrect, finished: true };
        localStorage.setItem('recipeQuizProgressV3', JSON.stringify(dataToSave));
        // Отправляем событие, чтобы прогресс-бар обновился
        window.dispatchEvent(new CustomEvent('dailyQuizCompleted'));
    };

    const getImageUrl = (imageFilename) => `https://ddragon.leagueoflegends.com/cdn/${allDDragonItems.version}/img/item/${imageFilename}`;

    if (!secretItem) {
        return <div>Загрузка...</div>;
    }

    if (hasFinishedToday) {
        return (
            <div className="guess-recipe-container">
                <div className="quiz-header">
                    <h3>Угадайте предмет по сборке</h3>
                    <CountdownTimer />
                </div>
                <div className="result-area all-solved">
                    <p className='correct-answer-text'>Попытка засчитана! Возвращайтесь завтра.</p>
                    <div className="correct-answer-reveal">
                        <span>Правильный ответ: {secretItem.name}</span>
                        <img src={getImageUrl(secretItem.image.full)} alt={secretItem.name}/>
                    </div>
                    <button className="next-btn" onClick={onExit}>Вернуться</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="guess-recipe-container">
            <div className="quiz-header">
                <h3>Угадайте предмет по сборке</h3>
                <CountdownTimer />
            </div>
            <p>Какой предмет собирается из этих компонентов?</p>
            <div className="recipe-quiz-card">
                <div className="recipe-display">
                    {secretItem.from.map((id, index) => {
                        const component = itemsById[id];
                        if (!component) return null;
                        return (
                            <img 
                                key={`${id}-${index}`} 
                                src={getImageUrl(component.image.full)} 
                                alt={component.name} 
                                title={component.name}
                            />
                        );
                    })}
                </div>
                <div className="options-display">
                    {options.map(option => {
                        let buttonClass = 'option-btn';
                        if (isAnswered) {
                            if (option.image.full === secretItem.image.full) buttonClass += ' correct';
                            else if (option.image.full === selectedOption) buttonClass += ' incorrect';
                            else buttonClass += ' disabled';
                        }
                        return (
                            <button key={option.image.full} className={buttonClass} onClick={() => handleAnswer(option)} disabled={isAnswered}>
                                <img src={getImageUrl(option.image.full)} alt={option.name} title={option.name} />
                            </button>
                        );
                    })}
                </div>
                <div className="quiz-feedback-area">
                    {isAnswered && (
                        <div className="result-area">
                            <p className={isCorrect ? 'correct-answer-text' : 'incorrect-answer-text'}>
                                {isCorrect ? `Верно! Это ${secretItem.name}.` : `Неверно! Правильный ответ: ${secretItem.name}.`}
                            </p>
                            <button className="next-btn" onClick={onExit}>Отлично!</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GuessTheItemDaily;
