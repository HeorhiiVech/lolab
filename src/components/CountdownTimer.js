import React, { useState, useEffect } from 'react';
import { getNextResetTime } from '../utils/time';
import './CountdownTimer.css';

function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const targetDate = getNextResetTime();
            const now = new Date();
            const difference = targetDate - now;

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                );
            } else {
                setTimeLeft("00:00:00");
                // Можно добавить логику для принудительного обновления страницы
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="countdown-container">
            <span className="countdown-label">Новые задания через:</span>
            <span className="countdown-timer">{timeLeft}</span>
        </div>
    );
}

export default CountdownTimer;