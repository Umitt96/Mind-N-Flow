
import React, { useState, useEffect } from 'react';
import { GameState, Theme } from '../types';
import { CircleDollarSign, Zap, Shield, Trophy, Check, KeyRound } from 'lucide-react';

interface StatusBarProps {
  state: GameState;
  theme: Theme;
  onOpenAchievements?: () => void;
  onDevClick?: () => void;
  onOpenRepair?: () => void;
  onOpenSettings: () => void;
  texts: any;
}

const StatusBar: React.FC<StatusBarProps> = ({ state, theme, onOpenAchievements, onDevClick, onOpenRepair, onOpenSettings, texts }) => {
  const hpPercent = (state.hp / state.maxHp) * 100;
  const xpPercent = (state.xp / state.xpToNextLevel) * 100;
  
  const { xpBoosterCharges, streakFreeze } = state.inventory;
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  const lang = state.language;

  const todayKey = state.simulatedDate;
  const allGoodHabits = state.habits.filter(h => h.type === 'good');
  const totalGoodHabits = allGoodHabits.length;
  
  const completedGoodHabitsToday = (state.history[todayKey] || []).filter(habitId => {
      return allGoodHabits.some(h => h.id === habitId);
  }).length;

  const isAllDone = totalGoodHabits > 0 && completedGoodHabitsToday === totalGoodHabits;
  
  // Check if all skills are maxed (level 3)
  const isMaxLevel = state.skills.every(s => s.currentLevel >= 3);

  const barBg = isMinimal ? "bg-gray-200" : isDark ? "bg-slate-700" : "bg-stone-200";
  const bgClass = isMinimal ? "bg-white/95 border-b border-gray-300" : isDark ? "bg-slate-900/90 border-b border-slate-700 text-slate-100" : "bg-white/90 border-b border-cozy-200";
  
  const progressCardBg = isAllDone 
     ? (isDark ? "bg-emerald-800 text-white" : "bg-emerald-500 text-white")
     : (isMinimal 
        ? "bg-white border border-gray-400 text-black" 
        : isDark 
          ? "bg-slate-800 border border-slate-600 text-emerald-400" 
          : "bg-white border border-cozy-200 text-cozy-800");

  const keyBadgeClass = isMinimal 
      ? 'text-black border border-black' 
      : isDark 
          ? 'bg-sky-900 text-sky-200 border border-sky-800' 
          : 'bg-sky-100 text-sky-800 border border-sky-200';

  // Localization for Level and Gold
  const levelDisplay = lang === 'en' ? `Level ${state.level}` : `${state.level}. ${texts.level}`;
  const goldDisplay = lang === 'en' ? `${state.gold} ${texts.gold}` : `${state.gold}`; 

  return (
    <>
      <div className={`sticky top-0 z-50 backdrop-blur-md shadow-sm p-2 sm:p-4 transition-all ${bgClass}`}>
        <style>{`
          @keyframes blink-2s {
            0%, 10%, 100% { opacity: 1; transform: scale(1); }
            5% { opacity: 0.5; transform: scale(1.1); }
          }
          .animate-blink-slow {
            animation: blink-2s 2s infinite;
          }
          @keyframes rainbow-vertical {
            0% { background-position: 0% 0%; }
            100% { background-position: 0% 200%; }
          }
          .animate-rainbow-flash {
             background: linear-gradient(180deg, #0ea5e9, #0ea5e9, #0ea5e9, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #0ea5e9, #0ea5e9, #0ea5e9);
             background-size: 100% 400%;
             animation: rainbow-vertical 4s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-3">
          
          <div className="flex justify-between items-start">
            
            <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
              {/* Logo / Settings */}
              <button 
                onClick={onOpenSettings}
                className={`font-serif font-black text-lg sm:text-2xl tracking-tight hover:opacity-70 transition-opacity ${isMinimal ? 'text-black' : isDark ? 'text-white' : 'text-cozy-900'}`}
                title={texts.settings}
              >
                  Mind'N Flow
              </button>

              {/* DIVIDER between Logo and Achievements */}
              <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

              {/* Achievements Button */}
              <button 
                  onClick={onOpenAchievements}
                  className={`p-1 rounded-full hover:scale-110 transition ${isMinimal ? 'text-black hover:bg-gray-200' : 'text-yellow-600 hover:bg-yellow-100'}`}
                  title="Achievements"
              >
                  <Trophy size={20} className="sm:w-6 sm:h-6" />
              </button>

              {/* Divider */}
              <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

              {/* Perk Points / Keys */}
              {state.perkPoints > 0 && (
                  <div className={`px-2 py-0.5 font-bold text-xs rounded-full flex items-center gap-1 animate-blink-slow border ${keyBadgeClass}`}>
                    <KeyRound size={12} fill="currentColor"/> {state.perkPoints}
                  </div>
              )}

              {/* Inventory Items (Boosters) */}
              {(xpBoosterCharges > 0 || streakFreeze > 0) && (
                <>
                  {xpBoosterCharges > 0 && (
                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${isMinimal ? 'bg-black text-white' : isDark ? 'bg-amber-900 text-amber-200 border border-amber-800' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                      <Zap size={10} fill="currentColor" />
                      <span>{xpBoosterCharges}</span>
                    </div>
                  )}
                  {streakFreeze > 0 && (
                    <button 
                      onClick={() => onOpenRepair && onOpenRepair()}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 hover:brightness-110 transition ${isMinimal ? 'bg-gray-500 text-white' : isDark ? 'bg-sky-900 text-sky-200 border border-sky-800' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}
                      title={texts.repair_history}
                    >
                      <Shield size={10} fill="currentColor" />
                      <span>{streakFreeze}</span>
                    </button>
                  )}
                </>
              )}
            </div>
            
            {/* RIGHT SIDE: Level and Gold */}
            <div className="flex items-center gap-2">
                 {/* Level */}
                <div className={`px-2 py-0.5 font-bold text-xs sm:text-sm rounded ${isMinimal ? 'text-black border border-black' : isDark ? 'bg-slate-700 text-white' : 'bg-cozy-800 text-cozy-50'}`}>
                    {levelDisplay}
                </div>

                {/* Gold */}
                <div className={`px-2 py-0.5 font-bold text-xs flex items-center gap-1 rounded-full ${isMinimal ? 'text-black' : isDark ? 'bg-slate-800 text-amber-400 border border-slate-600' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    <CircleDollarSign size={14} className={isMinimal ? 'text-black' : 'text-amber-500'} fill={isMinimal ? 'none' : 'currentColor'} />
                    {goldDisplay}
                </div>
            </div>

          </div>

          <div className="flex gap-2 items-stretch h-12">
            <div className={`w-12 flex-shrink-0 rounded-lg flex flex-col items-center justify-center shadow-sm transition-colors duration-500 ${progressCardBg}`}>
               <Check size={14} strokeWidth={4} className="mb-0.5 opacity-80" />
               <div className="text-[10px] font-black leading-none">
                 {completedGoodHabitsToday}/{totalGoodHabits}
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5">
              {/* HP Bar */}
              <div className={`relative h-5 w-full overflow-hidden ${barBg} ${!isMinimal && 'rounded-full border border-black/5'}`}>
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isMinimal ? 'bg-black' : 'bg-rose-500'}`}
                  style={{ width: `${hpPercent}%` }}
                ></div>
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${isMinimal ? 'text-transparent' : 'text-white mix-blend-overlay'}`}>
                  {state.hp} / {state.maxHp} HP
                </div>
              </div>

              {/* XP Bar */}
              <div className={`relative h-5 w-full overflow-hidden ${barBg} ${!isMinimal && 'rounded-full border border-black/5'}`}>
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out 
                    ${isMinimal ? 'bg-gray-500' : (isMaxLevel ? 'animate-rainbow-flash' : 'bg-sky-500')}`}
                  style={{ width: isMaxLevel ? '100%' : `${xpPercent}%` }}
                ></div>
                {/* Changed text color to black for Max Level */}
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${isMaxLevel ? 'text-black' : (isMinimal ? 'text-transparent' : 'text-white mix-blend-overlay')}`}>
                  {isMaxLevel ? texts.maxed : `${Math.floor(state.xp)} / ${state.xpToNextLevel} XP`}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default StatusBar;
