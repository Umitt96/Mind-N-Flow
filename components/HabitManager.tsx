
import React, { useState } from 'react';
import { Habit, HabitType, Difficulty, Theme, Inventory } from '../types';
import { Plus, Trash2, Edit2, Sparkles, Skull, CheckCircle2, XCircle, Clock, Lock, ChevronDown, ChevronRight, Package } from 'lucide-react';

interface HabitManagerProps {
  habits: Habit[];
  history: Record<string, string[]>;
  onAddHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onTriggerHabit: (habit: Habit, e: React.MouseEvent) => void;
  theme: Theme;
  today: string; 
  inventory: Inventory;
  texts: any;
}

const TEMPLATE_NAMES: Record<string, string> = {
  'dopamine_detox': 'Dopamin Detoksu',
  'fit_life': 'Fit Yaşam',
  'deep_focus': 'Derin Odaklanma',
  'explorer_bag': 'Kaşifin Çantası'
};

const HabitManager: React.FC<HabitManagerProps> = ({ 
  habits, history, onAddHabit, onDeleteHabit, onEditHabit, onTriggerHabit, theme, today, inventory, texts
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('good');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const todaysActions = history[today] || [];
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  const limitReached = habits.length >= 8;

  const toggleGroup = (groupId: string) => {
      setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setName('');
    setType('good');
    setDifficulty('easy');
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    if (habit.templateId) return; 
    setEditingHabit(habit);
    setName(habit.name);
    setType(habit.type);
    setDifficulty(habit.difficulty || 'easy');
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (habits.length <= 2) {
       alert("Min 2 habits!");
       return;
    }
    onDeleteHabit(id);
  }

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingHabit) {
      onEditHabit({ ...editingHabit, name, type, difficulty });
    } else {
      onAddHabit({
        id: crypto.randomUUID(),
        name,
        type,
        difficulty
      });
    }
    setIsModalOpen(false);
  };

  const getImpactDisplay = (type: HabitType, diff: Difficulty) => {
    let hp = 5, xp = 5;
    if (diff === 'medium') { hp = 10; xp = 10; }
    if (diff === 'hard') { hp = 20; xp = 20; }
    return `${type === 'good' ? '+' : '-'}${hp} HP / ${type === 'good' ? '+' : '-'}${xp} XP`;
  };

  const getDaysLeft = (habit: Habit) => {
     if (!habit.templateId || !inventory.templateExpiryDates[habit.templateId]) return null;
     const expiry = new Date(inventory.templateExpiryDates[habit.templateId]);
     const now = new Date(today);
     const diffTime = expiry.getTime() - now.getTime();
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     return diffDays;
  };

  const groupedHabits: Record<string, Habit[]> = { 'other': [] };
  habits.forEach(h => {
     if (h.templateId && TEMPLATE_NAMES[h.templateId]) {
         if (!groupedHabits[h.templateId]) groupedHabits[h.templateId] = [];
         groupedHabits[h.templateId].push(h);
     } else {
         groupedHabits['other'].push(h);
     }
  });

  const textMain = isMinimal ? "text-black" : isDark ? "text-slate-100" : "text-cozy-900";
  const textSub = isMinimal ? "text-gray-600" : isDark ? "text-slate-400" : "text-cozy-500";
  const modalBg = isMinimal ? "bg-white border border-black" : isDark ? "bg-slate-800 border border-slate-600" : "bg-cozy-50 border border-cozy-200";

  const renderHabitRow = (habit: Habit) => {
      const isDoneToday = todaysActions.includes(habit.id);
      const diff = habit.difficulty || 'easy';
      const daysLeft = getDaysLeft(habit);
      const isLocked = !!habit.templateId;
      
      let wrapperClass = `${isMinimal ? 'border-b hover:bg-gray-50' : 'rounded-xl border shadow-sm hover:shadow-md'} p-4 flex items-center justify-between transition-all duration-300 cursor-pointer select-none active:scale-[0.99]`;
      
      if (isMinimal) {
         wrapperClass += isDoneToday ? " opacity-40" : " bg-white";
      } else if (isDark) {
         wrapperClass += isDoneToday 
           ? (habit.type === 'good' ? " bg-emerald-950/60 border-emerald-900" : " bg-rose-950/60 border-rose-900")
           : " bg-slate-800 border-slate-700";
      } else {
         if (habit.type === 'good') {
           wrapperClass += isDoneToday ? " bg-emerald-50 border-emerald-300" : " bg-white border-stone-200";
         } else {
           wrapperClass += isDoneToday ? " bg-stone-100 border-stone-200 opacity-60" : " bg-white border-rose-200";
         }
      }

      let btnClass = "h-10 w-10 flex items-center justify-center transition-all ";
      if (!isMinimal) btnClass += "rounded-full shadow-sm ";
      
      if (isMinimal) {
        btnClass += isDoneToday ? "text-black" : "text-black border border-black";
      } else if (isDark) {
        btnClass += habit.type === 'good' 
           ? (isDoneToday ? "bg-emerald-900 text-emerald-400" : "bg-slate-700 text-emerald-500")
           : (isDoneToday ? "bg-slate-700 text-slate-500" : "bg-rose-900 text-white");
      } else {
        if (habit.type === 'good') {
          btnClass += isDoneToday ? "bg-emerald-500 text-white" : "bg-stone-300 text-white group-hover:bg-emerald-400";
        } else {
          btnClass += isDoneToday ? "bg-stone-400 text-white" : "bg-rose-500 text-white group-hover:bg-rose-600";
        }
      }

      return (
        <div 
          key={habit.id} 
          className={`${wrapperClass} group`}
          onClick={(e) => !isDoneToday && onTriggerHabit(habit, e)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-lg ${textMain} ${isDoneToday && isMinimal ? 'line-through text-gray-500' : ''}`}>
                {habit.name}
              </h3>
              {daysLeft !== null && (
                 <span className={`text-xs flex items-center gap-1 ${isMinimal ? 'text-gray-500' : daysLeft === 0 ? 'text-rose-500 font-bold' : 'text-amber-600 font-medium'}`}>
                    <Clock size={12} /> {daysLeft <= 0 ? texts.today_ends : `(${daysLeft} ${texts.days_left})`}
                 </span>
              )}
              {!isMinimal && (
                 <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-cozy-200 text-cozy-400'}`}>
                    {diff === 'easy' ? texts.easy : diff === 'medium' ? texts.medium : texts.hard}
                 </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={btnClass}>
              {habit.type === 'good' ? (
                 isDoneToday ? <CheckCircle2 size={20} /> : <Sparkles size={20} />
              ) : (
                 isDoneToday ? <XCircle size={20} /> : <Skull size={20} />
              )}
            </div>
            
            <div className={`h-8 w-px mx-1 ${isMinimal ? 'bg-gray-200' : isDark ? 'bg-slate-700' : 'bg-cozy-200'}`}></div>

            <div className="flex flex-col gap-1 items-center justify-center w-8" title={isLocked ? "Bundle Task" : undefined}>
              {isLocked ? (
                 <Lock size={16} className="text-gray-400 opacity-50"/>
              ) : (
                <>
                  <button onClick={(e) => openEditModal(e, habit)} className={`${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-cozy-400 hover:text-cozy-600'}`}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, habit.id)} className="text-rose-300 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-serif font-bold ${textMain}`}>{texts.habit_list} ({habits.length}/8)</h2>
        <button 
          onClick={openAddModal}
          disabled={limitReached}
          className={`px-4 py-2 flex items-center gap-2 text-sm font-bold transition active:scale-95
             ${limitReached ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white' : 
                (isMinimal 
               ? 'bg-black text-white hover:bg-gray-800' 
               : isDark ? 'bg-slate-700 text-white hover:bg-slate-600 rounded-xl' : 'bg-cozy-600 text-white hover:bg-cozy-700 rounded-xl shadow')}
          `}
        >
          <Plus size={18} /> {texts.new_habit}
        </button>
      </div>

      <div className="space-y-6">
        {habits.length === 0 && (
          <div className={`text-center p-8 italic border-2 border-dashed rounded-xl ${isMinimal ? 'border-gray-300 text-gray-400' : isDark ? 'border-slate-700 text-slate-500' : 'border-cozy-300 text-cozy-500'}`}>
            {texts.no_active_habits}
          </div>
        )}

        {Object.keys(groupedHabits).filter(k => k !== 'other').map(templateId => {
           const groupHabits = groupedHabits[templateId];
           if (groupHabits.length === 0) return null;
           const isExpanded = expandedGroups[templateId] !== false; 

           return (
             <div key={templateId} className="animate-in fade-in">
                <button 
                  onClick={() => toggleGroup(templateId)}
                  className={`w-full flex items-center gap-2 mb-2 px-2 py-1 text-sm font-bold uppercase tracking-wider opacity-80 hover:opacity-100 ${textSub}`}
                >
                   {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                   <Package size={16} />
                   {TEMPLATE_NAMES[templateId] || templateId}
                </button>
                
                {isExpanded && (
                   <div className="grid gap-3 pl-2 border-l-2 border-gray-200/50">
                      {groupHabits.map(renderHabitRow)}
                   </div>
                )}
             </div>
           );
        })}

        {groupedHabits['other'].length > 0 && (
           <div className="animate-in fade-in">
              <h3 className={`mb-3 px-2 text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-cozy-800 opacity-90'}`}>{texts.basic_habits}</h3>
              <div className="grid gap-3">
                 {groupedHabits['other'].map(renderHabitRow)}
              </div>
           </div>
        )}

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className={`${modalBg} ${!isMinimal && 'rounded-2xl shadow-xl'} w-full max-w-md overflow-hidden`}>
            <div className={`p-4 border-b ${isMinimal ? 'bg-gray-100 border-black' : isDark ? 'bg-slate-900 border-slate-700' : 'bg-cozy-100 border-cozy-200'}`}>
              <h3 className={`font-serif font-bold text-lg ${textMain}`}>
                {editingHabit ? texts.edit_habit : texts.create_habit}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSub}`}>{texts.habit_name}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border focus:outline-none ${isMinimal ? 'rounded-none border-gray-400' : isDark ? 'bg-slate-700 border-slate-600 text-white rounded-lg' : 'bg-white border-cozy-300 rounded-lg'}`}
                  placeholder="..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${textSub}`}>{texts.habit_type}</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setType('good')}
                    className={`flex-1 py-2 border text-sm font-medium transition flex items-center justify-center gap-2 
                      ${isMinimal 
                        ? (type === 'good' ? 'bg-black text-white' : 'bg-white text-gray-500') 
                        : (type === 'good' ? 'bg-emerald-100 border-emerald-300 text-emerald-800 rounded-lg' : 'bg-white border-cozy-200 text-cozy-500 rounded-lg')}`}
                  >
                    <Sparkles size={16}/> {texts.good}
                  </button>
                  <button 
                     onClick={() => setType('bad')}
                     className={`flex-1 py-2 border text-sm font-medium transition flex items-center justify-center gap-2 
                      ${isMinimal 
                        ? (type === 'bad' ? 'bg-black text-white' : 'bg-white text-gray-500') 
                        : (type === 'bad' ? 'bg-rose-100 border-rose-300 text-rose-800 rounded-lg' : 'bg-white border-cozy-200 text-cozy-500 rounded-lg')}`}
                  >
                    <Skull size={16}/> {texts.bad}
                  </button>
                </div>
              </div>

               <div>
                <label className={`block text-sm font-medium mb-1 ${textSub}`}>{texts.habit_diff}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => {
                    const label = level === 'easy' ? texts.easy : level === 'medium' ? texts.medium : texts.hard;
                    const active = difficulty === level;
                    const btnStyle = isMinimal 
                       ? (active ? 'bg-black text-white border-black' : 'bg-white border-gray-300 text-gray-500')
                       : (active ? 'bg-cozy-600 text-white border-cozy-600' : 'bg-white border-cozy-200 text-cozy-500 hover:bg-cozy-50');

                    return (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-2 border text-xs font-bold uppercase transition ${!isMinimal && 'rounded-lg'} ${btnStyle}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <div className={`mt-2 text-center text-xs ${textSub}`}>
                  {texts.effect}: <span className="font-bold">{getImpactDisplay(type, difficulty)}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t flex justify-end gap-2 ${isMinimal ? 'bg-white border-gray-200' : isDark ? 'bg-slate-900 border-slate-700' : 'bg-cozy-100 border-cozy-200'}`}>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 ${isMinimal ? 'text-black' : isDark ? 'text-slate-400 hover:text-white' : 'text-cozy-600 hover:bg-cozy-200 rounded-lg'}`}
              >
                {texts.cancel}
              </button>
              <button 
                onClick={handleSave}
                className={`px-6 py-2 shadow transition ${isMinimal ? 'bg-black text-white' : isDark ? 'bg-slate-600 text-white hover:bg-slate-500 rounded-lg' : 'bg-cozy-600 text-white hover:bg-cozy-700 rounded-lg'}`}
              >
                {texts.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitManager;
