import React, { useState } from 'react';

function GuessInput({ allItems, onGuess }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value.length > 1) {
            const filtered = allItems.filter(item =>
                item.name_ru.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5)); // Показываем до 5 подсказок
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue) {
            onGuess(inputValue);
            setInputValue('');
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onGuess(suggestion.name_ru);
        setInputValue('');
        setSuggestions([]);
    };

    return (
        <form className="guess-form" onSubmit={handleSubmit}>
            <div className="input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    placeholder="Введите название предмета..."
                    className="guess-input"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map(item => (
                            <li key={item.id} onClick={() => handleSuggestionClick(item)}>
                                {item.name_ru}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button type="submit" className="guess-button">Угадать</button>
        </form>
    );
}

export default GuessInput;