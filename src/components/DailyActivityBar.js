import React from 'react';
import './DailyActivityBar.css';

// 1. КОМПОНЕНТ ТЕПЕРЬ ПРИНИМАЕТ ПРОГРЕСС КАК СВОЙСТВО (PROP)
const DailyActivityBar = ({ completedQuizzes, onShowQuizzes }) => {

    // 2. УБРАНА ВСЯ ВНУТРЕННЯЯ ЛОГИКА (useEffect, useState)

    const quizzes = [
        { id: 'itemdle', name: 'Предметли' },
        { id: 'item', name: 'Угадай предмет' },
        { id: 'smite', name: 'Испытание смайта' }
    ];

    const completedCount = completedQuizzes.length;
    const totalCount = quizzes.length;

    return (
        <div className="daily-activity-bar" onClick={onShowQuizzes}>
            <div className="activity-header">
                <strong>Ежедневные задания</strong>
                <span>{completedCount} / {totalCount}</span>
            </div>
            <div className="activity-checklist">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className={`activity-item ${completedQuizzes.includes(quiz.id) ? 'completed' : ''}`}>
                        <span className="item-status">{completedQuizzes.includes(quiz.id) ? '✓' : '☐'}</span>
                        <span className="item-name">{quiz.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyActivityBar;
