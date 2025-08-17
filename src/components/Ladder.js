import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase-config';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import './Ladder.css';

// Функция для форматирования времени
const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0 с.';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (minutes > 0) {
        return `${minutes} м. ${seconds} с.`;
    }
    return `${seconds} с.`;
};

// Функция для определения ранга
const getRankInfo = (points) => {
    const pts = points || 1000;
    const ranks = [
        { threshold: 0, name: 'Железо', color: '#817364' },
        { threshold: 3000, name: 'Бронза', color: '#CD7F32' },
        { threshold: 6000, name: 'Серебро', color: '#C0C0C0' },
        { threshold: 9000, name: 'Платина', color: '#E5E4E2' },
        { threshold: 12000, name: 'Изумруд', color: '#50C878' },
        { threshold: 15000, name: 'Даймонд', color: '#B9F2FF' },
        { threshold: 20000, name: 'Мастер', color: '#9d00ff' },
        { threshold: 25000, name: 'Грандмастер', color: '#ff0000' },
        { threshold: 30000, name: 'Челленджер', color: '#F4C430' }
    ];

    let currentRank = ranks[0];
    for (let i = 0; i < ranks.length; i++) {
        if (pts >= ranks[i].threshold) {
            currentRank = ranks[i];
        }
    }
    return currentRank;
};

function Ladder() {
    const [smiteLeaderboard, setSmiteLeaderboard] = useState([]);
    const [itemTrainerLeaderboard, setItemTrainerLeaderboard] = useState([]);

    const fetchSmiteLadder = useCallback(async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('rating', 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            const leaders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSmiteLeaderboard(leaders);
        } catch (error) {
            console.error("Ошибка при загрузке ладдера Смайта:", error);
        }
    }, []);

    const fetchItemTrainerLadder = useCallback(async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('itemTrainerRecords.all', 'asc'), limit(50));
            const querySnapshot = await getDocs(q);
            const leaders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItemTrainerLeaderboard(leaders);
        } catch (error) {
            console.error("Ошибка при загрузке ладдера Предметов:", error);
        }
    }, []);

    useEffect(() => {
        fetchSmiteLadder();
        fetchItemTrainerLadder();
    }, [fetchSmiteLadder, fetchItemTrainerLadder]);

    return (
        <div className="ladder-page-container">
            <div className="leaderboard-container">
                <h3>Тренажер Смайта (Рейтинг)</h3>
                <ol className="leaderboard-list">
                    {smiteLeaderboard.map((user, index) => {
                        const rank = getRankInfo(user.rating);
                        return (
                            <li key={user.id}>
                                <span className="leaderboard-rank">{index + 1}.</span>
                                <span className="leaderboard-nickname">{user.nickname || '...'}</span>
                                <span className="rank-display small" style={{ color: rank.color, borderColor: rank.color }}>{rank.name}</span>
                                <span className="leaderboard-score">{user.rating || 0} pt.</span>
                            </li>
                        )
                    })}
                </ol>
            </div>

            <div className="leaderboard-container">
                <h3>Тренажер Предметов (Время)</h3>
                <ol className="leaderboard-list">
                     {itemTrainerLeaderboard.map((user, index) => (
                        <li key={user.id}>
                            <span className="leaderboard-rank">{index + 1}.</span>
                            <span className="leaderboard-nickname">{user.nickname || '...'}</span>
                            <span className="leaderboard-score time">{formatTime(user.itemTrainerRecords.all)}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

export default Ladder;