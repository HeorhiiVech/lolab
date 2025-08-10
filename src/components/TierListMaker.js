// src/components/TierListMaker.js
import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { SketchPicker } from 'react-color';
import championData from '../data/all_champions.json'; 
import './TierListMaker.css';

const STABLE_PATCH_VERSION = "15.15.1";

// Компонент иконки чемпиона
function Champion({ champ, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: champ.instanceId });
    const style = { transform: CSS.Transform.toString(transform), transition };
    
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="champion-icon">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${STABLE_PATCH_VERSION}/img/champion/${champ.image.full}`} 
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
                  // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Предотвращаем "перехват" события библиотекой dnd-kit ---
                  onPointerDown={(e) => e.stopPropagation()}
                >
                    ×
                </button>
            )}
        </div>
    );
}

// Компонент-контейнер для чемпионов в ряду
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

function TierListMaker() {
  const [tiers, setTiers] = useState({
      'tier-s': { name: 'S', color: '#ff7f7f', champions: [] },
      'tier-a': { name: 'A', color: '#ffbf7f', champions: [] },
      'tier-b': { name: 'B', color: '#ffff7f', champions: [] },
      'tier-c': { name: 'C', color: '#7fff7f', champions: [] },
  });
  const [championPool, setChampionPool] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeColorPicker, setActiveColorPicker] = useState(null);

  useEffect(() => {
    const allChampions = Object.values(championData.data).map(champ => ({
        ...champ,
        instanceId: champ.id 
    }));
    setChampionPool(allChampions.sort((a, b) => a.id.localeCompare(b.id)));
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const findContainer = (id) => {
    if (id === 'pool' || championPool.find(c => c.instanceId === id)) {
        return 'pool';
    }
    for (const tierId in tiers) {
        if (tierId === id || tiers[tierId].champions.find(c => c.instanceId === id)) {
            return tierId;
        }
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
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
        if (activeContainer && overContainer && activeContainer === overContainer) {
             if (activeContainer === 'pool') {
                setChampionPool((pool) => {
                    const oldIndex = pool.findIndex(c => c.instanceId === activeId);
                    const newIndex = pool.findIndex(c => c.instanceId === overId);
                    if (oldIndex === -1 || newIndex === -1) return pool;
                    return arrayMove(pool, oldIndex, newIndex);
                });
            } else {
                 setTiers(prevTiers => {
                    const newTiers = {...prevTiers};
                    const tierChampions = newTiers[activeContainer].champions;
                    const oldIndex = tierChampions.findIndex(c => c.instanceId === activeId);
                    const newIndex = tierChampions.findIndex(c => c.instanceId === overId);
                    if (oldIndex === -1 || newIndex === -1) return prevTiers;
                    newTiers[activeContainer].champions = arrayMove(tierChampions, oldIndex, newIndex);
                    return newTiers;
                 });
            }
        }
        return;
    }
    if (activeContainer === 'pool' && overContainer !== 'pool') {
        const originalChamp = championPool.find(c => c.instanceId === activeId);
        if (originalChamp) {
            const newInstance = { ...originalChamp, instanceId: `${originalChamp.id}-${Date.now()}` };
            setTiers(prev => {
                const newTiers = JSON.parse(JSON.stringify(prev));
                const destChampions = newTiers[overContainer].champions;
                const overIndex = destChampions.findIndex(c => c.instanceId === overId);
                if (overIndex !== -1) {
                    destChampions.splice(overIndex, 0, newInstance);
                } else {
                    destChampions.push(newInstance);
                }
                return newTiers;
            });
        }
        return;
    }
    if (activeContainer !== 'pool' && overContainer !== 'pool') {
       setTiers(prevTiers => {
            const newTiers = JSON.parse(JSON.stringify(prevTiers));
            const sourceChampions = newTiers[activeContainer].champions;
            const activeIndex = sourceChampions.findIndex(c => c.instanceId === activeId);
            if (activeIndex === -1) return prevTiers;
            const [movedItem] = sourceChampions.splice(activeIndex, 1);
            const destChampions = newTiers[overContainer].champions;
            const overIndex = destChampions.findIndex(c => c.instanceId === overId);
            if (overIndex !== -1) {
                destChampions.splice(overIndex, 0, movedItem);
            } else {
                destChampions.push(movedItem);
            }
            return newTiers;
       });
    }
    if (activeContainer !== 'pool' && overContainer === 'pool') {
        handleDeleteChampion(activeContainer, activeId);
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
  };
  
  const downloadImage = () => {
    const originalElement = document.getElementById('tierlist-main-capture');
    if (!originalElement) return;

    const clone = originalElement.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '0px';
    clone.style.width = `${originalElement.offsetWidth}px`; 
    document.body.appendChild(clone);

    const tierLabels = clone.querySelectorAll('.tier-label');
    const otherButtons = clone.querySelectorAll('.delete-champ-btn');

    tierLabels.forEach(label => {
        const textarea = label.querySelector('textarea');
        const buttons = label.querySelectorAll('button');
        if (textarea) {
            const textSpan = document.createElement('span');
            textSpan.textContent = textarea.value;
            textSpan.className = 'screenshot-text';
            label.appendChild(textSpan);
            textarea.style.display = 'none';
        }
        buttons.forEach(btn => btn.style.display = 'none');
    });
    otherButtons.forEach(btn => btn.style.display = 'none');

    setTimeout(() => {
        html2canvas(clone, {
            backgroundColor: '#0F1A20',
            useCORS: true,
            scale: 2,
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'lolab-tierlist.png';
            link.click();
        }).finally(() => {
            document.body.removeChild(clone);
        });
    }, 100);
  };

  const filteredChampions = championPool.filter(champ =>
    champ.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="tierlist-header">
            <h2>Тирлист Мейкер</h2>
            <div className="tierlist-controls">
                <button onClick={addTier}>Добавить полосу</button>
                <button onClick={downloadImage}>Скачать картинку</button>
            </div>
        </div>
        
        <div className="tierlist-layout">
            <div className="tierlist-main" id="tierlist-main-capture">
                {Object.entries(tiers).map(([tierId, tier]) => (
                    <div key={tierId} className="tier-row">
                        <div className="tier-label" style={{ backgroundColor: tier.color }}>
                            <textarea
                                value={tier.name}
                                onChange={(e) => handleTierNameChange(tierId, e.target.value)}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                rows="1"
                                spellCheck="false"
                            />
                            <button className="color-picker-btn" onClick={() => setActiveColorPicker(activeColorPicker === tierId ? null : tierId)}>
                                <div className="color-swatch" style={{backgroundColor: tier.color}}></div>
                            </button>
                            <button className="delete-tier-btn" onClick={() => handleDeleteTier(tierId)}>×</button>
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
                ))}
            </div>

            <div className="champion-pool-section card">
                <h3>Чемпионы</h3>
                <input
                    type="text"
                    placeholder="Поиск по имени (кириллица)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <DroppableTierRow tierId="pool" tier={{ champions: filteredChampions }}>
                    {filteredChampions.map(champ => <Champion key={champ.instanceId} champ={champ} />)}
                </DroppableTierRow>
            </div>
        </div>
    </DndContext>
  );
}

export default TierListMaker;