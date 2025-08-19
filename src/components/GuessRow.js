import React from 'react';

// Хелпер для сравнения массивов (для статов, ролей, эффектов)
const compareArrays = (guessArr, secretArr) => {
    if (JSON.stringify(guessArr.sort()) === JSON.stringify(secretArr.sort())) {
        return 'green'; // Полное совпадение
    }
    if (guessArr.some(val => secretArr.includes(val))) {
        return 'orange'; // Частичное совпадение
    }
    return 'red'; // Нет совпадений
};

// Хелпер для отображения ячейки
const PropertyTile = ({ value, color, arrow = null }) => (
    <div className={`tile ${color}`}>
        {value} {arrow && <span className="arrow">{arrow}</span>}
    </div>
);


function GuessRow({ guessedItem, secretItem }) {
    const typeColor = guessedItem.type === secretItem.type ? 'green' : 'red';
    const costComparison = () => {
        if (guessedItem.cost === secretItem.cost) return { color: 'green', arrow: null };
        return guessedItem.cost < secretItem.cost 
            ? { color: 'red', arrow: '⬆️' } 
            : { color: 'red', arrow: '⬇️' };
    };

    const statsColor = compareArrays(guessedItem.stats, secretItem.stats);
    const classColor = compareArrays(guessedItem.class, secretItem.class);
    const effectColor = compareArrays(guessedItem.effect, secretItem.effect);

    const costResult = costComparison();
    
    // Получаем URL иконки из DDragon
    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/item/${guessedItem.id}.png`;

    return (
        <div className="guess-row">
            <div className="tile icon-tile">
                <img src={iconUrl} alt={guessedItem.name_ru} />
                {guessedItem.name_ru}
            </div>
            <PropertyTile value={guessedItem.type} color={typeColor} />
            <PropertyTile value={guessedItem.stats.join(', ')} color={statsColor} />
            <PropertyTile value={guessedItem.class.join(', ')} color={classColor} />
            <PropertyTile value={guessedItem.cost} color={costResult.color} arrow={costResult.arrow} />
            <PropertyTile value={guessedItem.effect.join(', ')} color={effectColor} />
        </div>
    );
}

export default GuessRow;