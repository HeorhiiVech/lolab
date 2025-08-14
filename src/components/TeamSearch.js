import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import teamData from '../data/team_data.json';

const TeamSearch = ({ onTeamSelect, isForHeader = false, isForModal = false }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);

    useMemo(() => {
        if (query.length > 1) {
            setResults(teamData.filter(t => t.Team.toLowerCase().includes(query.toLowerCase())).slice(0, 10));
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSelect = (team) => {
        setQuery('');
        setResults([]);
        setIsFocused(false);
        onTeamSelect(team);
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

    // Применяем разные классы в зависимости от того, где используется поиск
    const containerClass = `player-search-container ${isForHeader ? 'in-header' : ''} ${isForModal ? 'in-modal' : ''}`;

    return (
        <div className={containerClass} ref={searchRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Найти команду..."
                className="player-search-input"
            />
            {isFocused && results.length > 0 && (
                <ul className="search-results-list">
                    {results.map(team => (
                        <li key={team.Team} onClick={() => handleSelect(team)}>
                            <div className="result-player-info">
                                <span className="result-player-name">{team.Team}</span>
                                <span className="result-player-team">{team.Tournament}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TeamSearch;