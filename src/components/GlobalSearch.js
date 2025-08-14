import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import proData from '../data/pro_data.json';
import teamData from '../data/team_data.json';
import { db } from '../firebase-config';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const GlobalSearch = ({ currentUser, userData, onPlayerSelect, onTeamSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [searchType, setSearchType] = useState('players');
    const searchRef = useRef(null);

    const favoritePlayers = useMemo(() => new Set(userData?.favoritePlayers || []), [userData]);
    const favoriteTeams = useMemo(() => new Set(userData?.favoriteTeams || []), [userData]);

    useMemo(() => {
        if (query.length > 1) {
            if (searchType === 'players') {
                const filtered = proData.filter(p => p.Player.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
                setResults(filtered.map(item => ({ ...item, type: 'player' })));
            } else {
                const filtered = teamData.filter(t => t.Team.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
                setResults(filtered.map(item => ({ ...item, type: 'team' })));
            }
        } else {
            setResults([]);
        }
    }, [query, searchType]);

    const handleSelect = (item) => {
        setQuery('');
        setResults([]);
        setIsFocused(false);
        if (item.type === 'player') {
            onPlayerSelect(item);
        } else {
            onTeamSelect(item);
        }
    };

    const handleToggleFavorite = async (e, item) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("Войдите в аккаунт, чтобы добавлять в избранное.");
            return;
        }

        const isPlayer = item.type === 'player';
        const userRef = doc(db, "users", currentUser.uid);
        const field = isPlayer ? 'favoritePlayers' : 'favoriteTeams';
        const id = isPlayer ? item.Player : item.Team;
        const isFavorited = isPlayer ? favoritePlayers.has(id) : favoriteTeams.has(id);

        try {
            await updateDoc(userRef, {
                [field]: isFavorited ? arrayRemove(id) : arrayUnion(id)
            });
        } catch (error) {
            console.error("Ошибка обновления избранного:", error);
            alert("Не удалось обновить избранное. Попробуйте позже.");
        }
    };

    const handleClickOutside = useCallback((e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            setIsFocused(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <div className="global-search-wrapper" ref={searchRef}>
            <div className="search-toggle">
                <button onClick={() => setSearchType('players')} className={searchType === 'players' ? 'active' : ''}>Игроки</button>
                <button onClick={() => setSearchType('teams')} className={searchType === 'teams' ? 'active' : ''}>Команды</button>
            </div>
            <div className="player-search-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={`Найти ${searchType === 'players' ? 'игрока' : 'команду'}...`}
                    className="player-search-input"
                />
                {isFocused && results.length > 0 && (
                    <ul className="search-results-list">
                        {results.map(item => {
                            const isPlayer = item.type === 'player';
                            const id = isPlayer ? item.Player : item.Team;
                            const isFavorited = isPlayer ? favoritePlayers.has(id) : favoriteTeams.has(id);
                            return (
                                <li key={id} onClick={() => handleSelect(item)}>
                                    <div className="result-player-info">
                                        <span className="result-player-name">{id}</span>
                                        <span className="result-player-team">{isPlayer ? item.Team : item.Tournament}</span>
                                    </div>
                                    {currentUser && (
                                        <button 
                                            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                                            onClick={(e) => handleToggleFavorite(e, item)}
                                            title={isFavorited ? "Удалить из избранного" : "Добавить в избранное"}
                                        >★</button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default GlobalSearch;