import React, { useState, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import teamData from '../data/team_data.json';
import './TeamAnalyzer.css';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const allMetricsForAxes = ['KD', 'GSPD', 'GD15', 'FB%', 'FT%', 'WPM', 'EGR', 'MLR'];
const allColumnsForTable = ['Team', 'KD', 'GSPD', 'GD15', 'FB%', 'FT%', 'HLD%', 'GRB%', 'FD%', 'WPM'];

// Вспомогательная функция для преобразования значений (включая проценты) в числа
const parseValue = (value) => {
    if (value == null) return null;
    if (typeof value === 'string' && value.endsWith('%')) {
        return parseFloat(value.slice(0, -1));
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};


function TeamAnalyzer({ onTeamSelect }) {
    const [tournament, setTournament] = useState('All');
    const [xAxisStat, setXAxisStat] = useState('KD');
    const [yAxisStat, setYAxisStat] = useState('GSPD');
    const [sortConfig, setSortConfig] = useState({ key: 'Team', direction: 'ascending' });

    const filteredData = useMemo(() => {
        if (tournament === 'All') return teamData;
        return teamData.filter(t => t.Tournament === tournament);
    }, [tournament]);

    const sortedAndFilteredData = useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                
                const numA = parseValue(valA);
                const numB = parseValue(valB);

                if (numA != null && numB != null) {
                    return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
                }
                
                // Для нечисловых значений или если одно из них null
                return sortConfig.direction === 'ascending' 
                    ? String(valA).localeCompare(String(valB)) 
                    : String(valB).localeCompare(String(valA));
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortClassName = (name) => {
        if (!sortConfig || sortConfig.key !== name) return '';
        return sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc';
    };

    const chartData = {
        datasets: [{
            label: 'Команды',
            data: filteredData
                .map(team => {
                    const xVal = parseValue(team[xAxisStat]);
                    const yVal = parseValue(team[yAxisStat]);

                    // Если данных нет, не отображаем точку
                    if (xVal === null || yVal === null) {
                        return null;
                    }

                    // Добавляем "дрожание" (jitter)
                    const xJitter = (Math.random() - 0.5) * 0.5;
                    const yJitter = (Math.random() - 0.5) * 0.5;

                    return {
                        x: xVal + xJitter,
                        y: yVal + yJitter,
                        team: team // Сохраняем оригинальные данные для подсказок
                    };
                })
                .filter(Boolean), // Убираем null значения
            backgroundColor: 'rgba(60, 155, 200, 0.7)',
            pointRadius: 10,
            pointHoverRadius: 15,
        }]
    };

    const chartOptions = {
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const team = elements[0].element.$context.raw.team;
                onTeamSelect(team);
            }
        },
        scales: {
            x: { title: { display: true, text: xAxisStat, color: '#F0E6D2' } },
            y: { title: { display: true, text: yAxisStat, color: '#F0E6D2' } }
        },
        plugins: {
            legend: { display: false },
            tooltip: { 
                callbacks: { 
                    label: (c) => c.raw.team.Team,
                    // Показываем оригинальные (не "дрожащие") значения
                    afterLabel: (c) => {
                        const team = c.raw.team;
                        return `${xAxisStat}: ${team[xAxisStat]} | ${yAxisStat}: ${team[yAxisStat]}`;
                    }
                } 
            },
            datalabels: {
                color: '#F0E6D2', align: 'bottom', offset: 12,
                formatter: (v, c) => c.chart.data.datasets[0].data[c.dataIndex].team.Team
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="card pro-scene-card team-analyzer-card">
            <h2>Анализ Команд</h2>
            <div className="pro-controls">
                <div className="filter-row">
                    <div className="control-group">
                        <label>Турнир:</label>
                        <div className="role-filter">
                            <button className={tournament === 'All' ? 'active' : ''} onClick={() => setTournament('All')}>Все</button>
                            <button className={tournament === 'LCK' ? 'active' : ''} onClick={() => setTournament('LCK')}>LCK</button>
                            <button className={tournament === 'LEC' ? 'active' : ''} onClick={() => setTournament('LEC')}>LEC</button>
                            <button className={tournament === 'LPL' ? 'active' : ''} onClick={() => setTournament('LPL')}>LPL</button>
                        </div>
                    </div>
                </div>
                 <div className="filter-row">
                    <div className="control-group">
                        <label>Ось X:</label>
                        <select value={xAxisStat} onChange={e => setXAxisStat(e.target.value)}>
                            {allMetricsForAxes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Ось Y:</label>
                        <select value={yAxisStat} onChange={e => setYAxisStat(e.target.value)}>
                            {allMetricsForAxes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="chart-container">
                <Scatter options={chartOptions} data={chartData} />
            </div>
            <div className="table-container">
                <table className="pro-table">
                    <thead>
                        <tr>{allColumnsForTable.map(m => <th key={m} onClick={() => requestSort(m)} className={getSortClassName(m)}>{m}</th>)}</tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredData.map((team) => (
                            <tr key={team.Team} onClick={() => onTeamSelect(team)}>
                                {allColumnsForTable.map(m => <td key={`${m}-${team.Team}`}>{team[m] != null ? team[m] : 'N/A'}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TeamAnalyzer;