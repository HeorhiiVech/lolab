import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { SketchPicker } from 'react-color';
import championData from '../data/all_champions.json';
import './TierListMaker.css';

// ... (Код компонентов Champion и DroppableTierRow остается без изменений) ...
function Champion({ champ, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: champ.instanceId });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="champion-icon">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${championData.version}/img/champion/${champ.image.full}`}
              alt={champ.name}
              title={champ.name}
            />
            {onDelete && (
                <button
                  className="delete-champ-btn"
                  onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                    ×
                </button>
            )}
        </div>
    );
}
function DroppableTierRow({ tierId, tier, children }) {
    const { setNodeRef, isOver } = useDroppable({ id: tierId });
    const containerClass = `champion-container ${isOver ? 'dragging-over' : ''}`;

    return (
        <SortableContext items={tier.champions.map(c => c.instanceId)} id={tierId}>
            <div ref={setNodeRef} className={containerClass}>
                {children}
            </div>
        </SortableContext>
    );
}
// --- ИЗМЕНЕНИЕ: Добавлены иконки для ролей ---
const roleIcons = {
    Fighter: '⚔️',
    Tank: '🛡️',
    Mage: '🔮',
    Assassin: '🔪',
    Marksman: '🏹',
    Support: '❤️',
    All: '👑'
};


function TierListMaker() {
  const [tiers, setTiers] = useState({
      'tier-s': { name: 'S', color: '#ff7f7f', champions: [] },
      'tier-a': { name: 'A', color: '#ffbf7f', champions: [] },
      'tier-b': { name: 'B', color: '#ffff7f', champions: [] },
      'tier-c': { name: 'C', color: '#7fff7f', champions: [] },
  });
  const [tierOrder, setTierOrder] = useState(Object.keys(tiers));
  const [championPool, setChampionPool] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  
  // --- НОВОЕ: Состояние для хранения активного фильтра по тегу ---
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    const allChampions = Object.values(championData.data).map(champ => ({
        ...champ,
        instanceId: champ.id 
    }));
    setChampionPool(allChampions.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  // --- НОВОЕ: Получаем список всех уникальных тегов для кнопок ---
  const allTags = useMemo(() => {
    const tags = new Set(championPool.flatMap(champ => champ.tags));
    return ['All', ...Array.from(tags).sort()];
  }, [championPool]);

  // --- ИЗМЕНЕНИЕ: Логика фильтрации теперь учитывает и поиск, и теги ---
  const filteredChampions = championPool.filter(champ => {
    const nameMatch = champ.name.toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = activeTag === 'All' || champ.tags.includes(activeTag);
    return nameMatch && tagMatch;
  });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  // ... (остальные функции-обработчики без изменений) ...
    const findContainer = (id) => {
    if (id === 'pool' || championPool.find(c => c.instanceId === id)) return 'pool';
    for (const tierId in tiers) {
        if (tierId === id || tiers[tierId].champions.find(c => c.instanceId === id)) return tierId;
    }
    return null;
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
        if (activeContainer === 'pool') {
            setChampionPool((pool) => {
                const oldIndex = pool.findIndex(c => c.instanceId === activeId);
                const newIndex = pool.findIndex(c => c.instanceId === overId);
                return (oldIndex !== -1 && newIndex !== -1) ? arrayMove(pool, oldIndex, newIndex) : pool;
            });
        } else {
            setTiers(prevTiers => {
                const newTiers = {...prevTiers};
                const tierChampions = newTiers[activeContainer].champions;
                const oldIndex = tierChampions.findIndex(c => c.instanceId === activeId);
                const newIndex = tierChampions.findIndex(c => c.instanceId === overId);
                if (oldIndex !== -1 && newIndex !== -1) {
                    newTiers[activeContainer].champions = arrayMove(tierChampions, oldIndex, newIndex);
                }
                return newTiers;
            });
        }
    } else if (activeContainer === 'pool') {
        const originalChamp = championPool.find(c => c.instanceId === activeId);
        if (originalChamp) {
            const newInstance = { ...originalChamp, instanceId: `${originalChamp.id}-${Date.now()}` };
            setTiers(prev => {
                const newTiers = JSON.parse(JSON.stringify(prev));
                const destChampions = newTiers[overContainer].champions;
                const overIndex = destChampions.findIndex(c => c.instanceId === overId);
                if (overIndex !== -1) destChampions.splice(overIndex, 0, newInstance);
                else destChampions.push(newInstance);
                return newTiers;
            });
        }
    } else if (overContainer === 'pool') {
        handleDeleteChampion(activeContainer, activeId);
    } else {
       setTiers(prevTiers => {
            const newTiers = JSON.parse(JSON.stringify(prevTiers));
            const sourceChampions = newTiers[activeContainer].champions;
            const activeIndex = sourceChampions.findIndex(c => c.instanceId === activeId);
            if (activeIndex === -1) return prevTiers;
            const [movedItem] = sourceChampions.splice(activeIndex, 1);
            const destChampions = newTiers[overContainer].champions;
            const overIndex = destChampions.findIndex(c => c.instanceId === overId);
            if (overIndex !== -1) destChampions.splice(overIndex, 0, movedItem);
            else destChampions.push(movedItem);
            return newTiers;
       });
    }
  };

  const handleDeleteChampion = (tierId, instanceId) => {
    setTiers(prev => ({
      ...prev,
      [tierId]: { ...prev[tierId], champions: prev[tierId].champions.filter(c => c.instanceId !== instanceId) }
    }));
  };

  const handleDeleteTier = (tierIdToDelete) => {
    setTiers(prevTiers => {
        const newTiers = { ...prevTiers };
        delete newTiers[tierIdToDelete];
        return newTiers;
    });
    setTierOrder(prevOrder => prevOrder.filter(id => id !== tierIdToDelete));
  };

  const handleTierNameChange = (tierId, newName) => {
    setTiers(prev => ({ ...prev, [tierId]: { ...prev[tierId], name: newName } }));
  };

  const handleColorChange = (tierId, color) => {
    setTiers(prev => ({ ...prev, [tierId]: { ...prev[tierId], color: color.hex } }));
  };

  const addTier = () => {
      const newTierId = `tier-${Date.now()}`;
      setTiers(prev => ({...prev, [newTierId]: { name: 'Новый ряд', color: '#cccccc', champions: [] }}));
      setTierOrder(prevOrder => [...prevOrder, newTierId]);
  };

  const resetTierList = () => {
      if (window.confirm("Вы уверены, что хотите сбросить тирлист? Это действие нельзя отменить.")) {
          setTiers({
            'tier-s': { name: 'S', color: '#ff7f7f', champions: [] },
            'tier-a': { name: 'A', color: '#ffbf7f', champions: [] },
            'tier-b': { name: 'B', color: '#ffff7f', champions: [] },
            'tier-c': { name: 'C', color: '#7fff7f', champions: [] },
          });
          setTierOrder(Object.keys({
            'tier-s': { name: 'S', color: '#ff7f7f', champions: [] },
            'tier-a': { name: 'A', color: '#ffbf7f', champions: [] },
            'tier-b': { name: 'B', color: '#ffff7f', champions: [] },
            'tier-c': { name: 'C', color: '#7fff7f', champions: [] },
          }));
      }
  };

  const moveTier = (tierId, direction) => {
      setTierOrder(currentOrder => {
          const index = currentOrder.indexOf(tierId);
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= currentOrder.length) return currentOrder;
          return arrayMove(currentOrder, index, newIndex);
      });
  };

    const downloadImage = () => {
    const originalElement = document.getElementById('tierlist-layout');
    if (!originalElement) return;
    html2canvas(originalElement, {
        backgroundColor: '#0F1A20',
        useCORS: true,
        scale: 2,
        onclone: (document) => { 
            const cloneButtons = document.querySelectorAll('.delete-champ-btn, .tier-move-controls, .delete-tier-btn, .color-picker-btn');
            cloneButtons.forEach(btn => btn.style.visibility = 'hidden');
        }
    }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'lolab-tierlist.png';
        link.click();
    });
    };

  return (
    <div className="tierlist-container">
      {/* ... (Header and main layout structure) ... */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <div className="tierlist-header">
                <h2>Тирлист Мейкер</h2>
                <div className="tierlist-controls">
                    <button onClick={resetTierList}>Начать заново</button>
                    <button onClick={addTier}>Добавить полосу</button>
                    <button onClick={downloadImage}>Скачать картинку</button>
                </div>
            </div>

            <div className="tierlist-layout" id="tierlist-layout">
                <div className="tierlist-main">
                    {tierOrder.map((tierId, index) => {
                        const tier = tiers[tierId];
                        if (!tier) return null;

                        return (
                            <div key={tierId} className="tier-row">
                                <div className="tier-move-controls">
                                     <button className="tier-move-btn" onClick={() => moveTier(tierId, 'up')} disabled={index === 0} title="Переместить вверх">▲</button>
                                     <button className="tier-move-btn" onClick={() => moveTier(tierId, 'down')} disabled={index === tierOrder.length - 1} title="Переместить вниз">▼</button>
                                </div>
                                <div className="tier-label" style={{ backgroundColor: tier.color }}>
                                    <button className="delete-tier-btn" onClick={() => handleDeleteTier(tierId)}>×</button>
                                    <textarea value={tier.name} onChange={(e) => handleTierNameChange(tierId, e.target.value)} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} rows="1" spellCheck="false" />
                                    <button className="color-picker-btn" onClick={() => setActiveColorPicker(activeColorPicker === tierId ? null : tierId)}>
                                        <div className="color-swatch" style={{backgroundColor: tier.color}}></div>
                                    </button>
                                     {activeColorPicker === tierId && (
                                        <div className="color-picker-popover">
                                             <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setActiveColorPicker(null)} />
                                            <SketchPicker color={tier.color} onChangeComplete={(color) => handleColorChange(tierId, color)} />
                                        </div>
                                    )}
                                </div>
                                <DroppableTierRow tierId={tierId} tier={tier}>
                                    {tier.champions.map(champ =>
                                        <Champion key={champ.instanceId} champ={champ} onDelete={() => handleDeleteChampion(tierId, champ.instanceId)} />
                                    )}
                                </DroppableTierRow>
                            </div>
                        )
                    })}
                </div>
                <div className="champion-pool-section card">
                    <h3>Чемпионы</h3>
                    <input
                        type="text"
                        placeholder="Поиск по имени..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                    
                    {/* --- НОВОЕ: Блок с кнопками-фильтрами --- */}
                    <div className="tag-filters">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                title={tag}
                                className={`tag-filter-btn ${activeTag === tag ? 'active' : ''}`}
                                onClick={() => setActiveTag(tag)}
                            >
                                <span className="tag-icon">{roleIcons[tag] || '❔'}</span>
                                {tag}
                            </button>
                        ))}
                    </div>

                    <DroppableTierRow tierId="pool" tier={{ champions: filteredChampions }}>
                        {filteredChampions.map(champ => <Champion key={champ.instanceId} champ={champ} />)}
                    </DroppableTierRow>
                </div>
            </div>
        </DndContext>
    </div>
  );
}

export default TierListMaker;