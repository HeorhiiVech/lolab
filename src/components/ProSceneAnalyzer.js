import React, { useState, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import proData from '../data/pro_data.json';
import './ProSceneAnalyzer.css';

// Регистрируем все необходимые компоненты для Chart.js
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

// Список всех метрик, которые можно выбрать для осей
const allMetricsForAxes = ['KDA', 'KP', 'KS%', 'DTH%', 'DPM', 'DMG%', 'CSPM', 'GOLD%', 'GD10', 'XPD10', 'CSD10', 'WPM', 'CWPM', 'WCPM'];
// Список всех колонок для таблицы
const allColumnsForTable = ['Player', 'Team', 'Pos', 'GP', 'W%', 'CTR%', 'K', 'D', 'A', 'KDA', 'KP', 'KS%', 'DTH%', 'FB%', 'GD10', 'XPD10', 'CSD10', 'CSPM', 'CS%P15', 'DPM', 'DMG%', 'D%P15', 'TDPG', 'EGPM', 'GOLD%', 'STL', 'WPM', 'CWPM', 'WCPM'];


function ProSceneAnalyzer() {
    // --- Состояния для фильтров ---
    const [tournament, setTournament] = useState('All');
    const [role, setRole] = useState('All');
    const [xAxisStat, setXAxisStat] = useState('KDA');
    const [yAxisStat, setYAxisStat] = useState('DPM');
    // --- Состояние для сортировки таблицы ---
    const [sortConfig, setSortConfig] = useState({ key: 'Player', direction: 'ascending' });

    // --- Фильтрация данных ---
    const filteredData = useMemo(() => {
        let data = proData;
        if (tournament !== 'All') {
            data = data.filter(p => p.Tournament === tournament);
        }
        if (role !== 'All') {
            data = data.filter(p => p.Pos === role);
        }
        return data;
    }, [role, tournament]);

    // --- Сортировка отфильтрованных данных для таблицы ---
    const sortedAndFilteredData = useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                // Проверяем, является ли колонка числовой
                const isNumeric = !isNaN(parseFloat(a[sortConfig.key])) && isFinite(a[sortConfig.key]);

                const valA = isNumeric ? parseFloat(a[sortConfig.key]) : a[sortConfig.key];
                const valB = isNumeric ? parseFloat(b[sortConfig.key]) : b[sortConfig.key];

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    // --- Функция для изменения сортировки ---
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // --- Функция для получения CSS-класса для заголовка колонки ---
    const getSortClassName = (name) => {
        if (!sortConfig || sortConfig.key !== name) {
            return '';
        }
        return sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc';
    };

    // --- Настройка данных для графика ---
    const chartData = {
        datasets: [{
            label: 'Игроки',
            data: filteredData.map(player => ({
                x: player[xAxisStat],
                y: player[yAxisStat],
                player: player 
            })),
            backgroundColor: 'rgba(200, 155, 60, 0.7)',
            pointRadius: 10,
            pointHoverRadius: 15,
            pointBorderColor: '#0A1014',
            pointBorderWidth: 1,
        }]
    };

    // --- Настройка отображения графика ---
    const chartOptions = {
        scales: {
            x: { title: { display: true, text: xAxisStat, color: '#F0E6D2', font: { size: 14 } }, ticks: { color: '#a09480' } },
            y: { title: { display: true, text: yAxisStat, color: '#F0E6D2', font: { size: 14 } }, ticks: { color: '#a09480' } }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const playerData = context.raw.player;
                        return `${playerData.Player} (${playerData.Team})`;
                    },
                    afterLabel: function(context) {
                        const playerData = context.raw.player;
                        return `${yAxisStat}: ${playerData[yAxisStat]} | ${xAxisStat}: ${playerData[xAxisStat]}`;
                    }
                }
            },
            datalabels: {
                display: true,
                color: '#F0E6D2',
                align: 'bottom',
                offset: 12,
                font: {
                    size: 13,
                    family: 'Roboto',
                },
                formatter: (value, context) => {
                    return context.chart.data.datasets[0].data[context.dataIndex].player.Player;
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="card pro-scene-card">
            <h2>Анализ Про-сцены</h2>
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
                    <div className="control-group">
                        <label>Роль:</label>
                        <div className="role-filter">
                            {['All', 'Top', 'Jungle', 'Middle', 'ADC', 'Support'].map(r => (
                                <button key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>{r}</button>
                            ))}
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
                        <tr>
                            {allColumnsForTable.map(metric => (
                                <th key={metric} onClick={() => requestSort(metric)} className={getSortClassName(metric)}>
                                    {metric}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredData.map((player, index) => (
                            <tr key={`${player.Player}-${index}`}>
                                {allColumnsForTable.map(metric => (
                                    <td key={`${metric}-${player.Player}`}>{player[metric]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProSceneAnalyzer;
