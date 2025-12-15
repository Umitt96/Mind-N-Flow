
import React, { useState } from 'react';
import { GameState, Theme } from '../types';
import { TrendingUp, Activity, Flame, Calendar, PieChart } from 'lucide-react';

interface StatisticsProps {
  state: GameState;
  theme: Theme;
  texts: any;
}

const Statistics: React.FC<StatisticsProps> = ({ state, theme, texts }) => {
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  const lang = state.language;
  
  const [chartMode, setChartMode] = useState<'week' | 'month'>('week');

  const getDateString = (date: Date) => date.toISOString().split('T')[0];

  const goodHabitsCount = state.habits.filter(h => h.type === 'good').length;
  const badHabitsCount = state.habits.filter(h => h.type === 'bad').length;
  const totalHabits = state.habits.length;
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const goodPercent = totalHabits > 0 ? goodHabitsCount / totalHabits : 0;
  const goodOffset = circumference - (goodPercent * circumference);

  const colorGood = isMinimal ? '#000000' : '#10b981'; 
  const colorBad = isMinimal ? '#9ca3af' : '#ef4444'; 

  const calcNetScore = (dateStr: string) => {
      const actions = state.history[dateStr] || [];
      let score = 0;
      actions.forEach(habitId => {
          const habit = state.habits.find(h => h.id === habitId);
          if (habit?.type === 'good') score++;
          if (habit?.type === 'bad') score--; 
      });
      return score;
  };

  const renderLineChart = () => {
    const today = new Date(state.simulatedDate);
    const dataPoints = [];
    const count = chartMode === 'week' ? 7 : 30;
    
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getDateString(d);
        dataPoints.push({
            val: calcNetScore(dateStr),
            label: chartMode === 'week' 
                ? d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' }) 
                : d.getDate().toString()
        });
    }

    const activityData = dataPoints.map(d => d.val);
    const maxAbs = Math.max(...activityData.map(Math.abs));
    const yDomain = Math.max(maxAbs, 3); 
    
    const svgHeight = 150;
    const svgWidth = 300;
    const paddingX = 30;
    const paddingY = 20;
    const graphHeight = svgHeight - (paddingY * 2);
    const graphWidth = svgWidth - (paddingX * 2);
    const zeroLineY = svgHeight / 2;

    const points = activityData.map((val, index) => {
        const x = paddingX + (index / (activityData.length - 1)) * graphWidth;
        const y = zeroLineY - (val / yDomain) * (graphHeight / 2);
        return `${x},${y}`;
    }).join(' ');

    const totalScore = activityData.reduce((a, b) => a + b, 0);
    const trendColor = totalScore >= 0 ? (isMinimal ? "black" : "#10b981") : (isMinimal ? "gray" : "#ef4444");

    return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <line x1={paddingX} y1={zeroLineY} x2={svgWidth - paddingX} y2={zeroLineY} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 2" />
            <polyline fill="none" stroke={trendColor} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm opacity-50" />
            {dataPoints.map((d, index) => {
                    const x = paddingX + (index / (activityData.length - 1)) * graphWidth;
                    const y = zeroLineY - (d.val / yDomain) * (graphHeight / 2);
                    const dotColor = d.val > 0 ? (isMinimal ? "black" : "#10b981") : d.val < 0 ? (isMinimal ? "gray" : "#ef4444") : (isMinimal ? "lightgray" : "gray");
                    return <circle key={index} cx={x} cy={y} r={chartMode === 'month' ? "2" : "3"} fill={dotColor} stroke={isMinimal ? "black" : "white"} strokeWidth={chartMode === 'month' ? "1" : "2"} />
            })}
            {dataPoints.map((d, i) => {
                let show = false;
                if (chartMode === 'week') show = true;
                if (chartMode === 'month' && i % 5 === 0) show = true;
                if (!show) return null;
                const x = paddingX + (i / (activityData.length - 1)) * graphWidth;
                return <text key={i} x={x} y={svgHeight - 2} textAnchor="middle" fontSize="9" fill={isDark ? "#94a3b8" : "#9ca3af"} fontWeight="500">{d.label}</text>
            })}
        </svg>
    );
  };

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const currentToday = new Date(state.simulatedDate);
    for (let i = 0; i < 365; i++) {
      const d = new Date(currentToday);
      d.setDate(d.getDate() - i);
      const dateStr = getDateString(d);
      const actions = state.history[dateStr] || [];
      if (actions.includes(habitId)) { streak++; } else { if (i === 0) continue; break; }
    }
    return streak;
  };

  const textMain = isMinimal ? "text-black" : isDark ? "text-slate-100" : "text-cozy-900";
  const textSub = isMinimal ? "text-gray-600" : isDark ? "text-slate-400" : "text-cozy-500";
  const cardBg = isMinimal ? "border border-gray-300" : isDark ? "bg-slate-800 border-slate-700 shadow-sm" : "bg-white border-cozy-200 shadow-sm";

  // Streak Banner Theme Logic
  const streakBannerClass = isMinimal 
      ? 'bg-white text-black border border-black' 
      : isDark 
          ? 'bg-slate-800 text-white border border-slate-700' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900';

  const flameBg = isMinimal ? 'bg-gray-100' : isDark ? 'bg-slate-700' : 'bg-white/60';
  const flameColor = isMinimal ? 'text-black' : isDark ? 'text-orange-400' : 'text-orange-500';

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 pb-24">
      
      <div className="mb-2">
        <h2 className={`text-2xl font-serif font-bold ${textMain} flex items-center gap-2`}>
          <Activity className={isMinimal ? "text-black" : "text-cozy-600"} />
          {texts.stats_panel}
        </h2>
        <p className={`text-sm ${textSub} opacity-80 mt-1`}>
           {texts.stats_desc}
        </p>
      </div>

      {/* Login Streak Banner - Themed */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${streakBannerClass}`}>
         <div className="flex items-center gap-3">
            <div className={`${flameBg} p-2 rounded-lg`}>
               <Flame size={24} className={flameColor} fill="currentColor" />
            </div>
            <div>
              <div className="text-xs font-bold opacity-70 uppercase">{texts.streak_title}</div>
              <div className="text-2xl font-serif font-bold">{state.loginStreak}</div>
            </div>
         </div>
         {!isMinimal && (
            <div className="text-right">
                <div className="text-xs font-medium opacity-80">{texts.next_reward}</div>
                <div className="font-bold text-sm">+{Math.min(150, 25 + ((state.loginStreak) * 10))} Coin</div>
            </div>
         )}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Donut Chart (Small) */}
          <div className={`p-4 rounded-xl border flex flex-col relative md:col-span-1 ${cardBg}`}>
              <h3 className={`text-xs font-bold uppercase mb-4 flex items-center gap-2 flex-shrink-0 ${textSub}`}>
                  <PieChart size={14}/> {texts.distribution}
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32">
                     <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                        {/* Base Circle (Red/Bad) - Always visible if there are habits */}
                        <circle cx="50" cy="50" r={radius} fill="transparent" stroke={colorBad} strokeWidth={12} />
                        
                        {/* Overlay Circle (Green/Good) */}
                        {goodPercent > 0 && (
                            <circle 
                                cx="50" cy="50" r={radius} 
                                fill="transparent" 
                                stroke={colorGood} 
                                strokeWidth={12}
                                strokeDasharray={circumference}
                                strokeDashoffset={goodOffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        )}
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${textMain}`}>{totalHabits}</span>
                        <span className="text-[10px] uppercase text-gray-500"></span>
                     </div>
                  </div>
                  <div className="flex gap-4 mt-4 text-xs font-bold">
                      <span style={{ color: colorGood }}>{texts.good}: {goodHabitsCount}</span>
                      <span style={{ color: colorBad }}>{texts.bad}: {badHabitsCount}</span>
                  </div>
              </div>
          </div>

          {/* Main Chart */}
          <div className={`p-4 rounded-xl border flex flex-col md:col-span-2 ${cardBg} min-h-[250px]`}>
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h3 className={`text-xs font-bold uppercase flex items-center gap-2 ${textSub}`}>
                      <Calendar size={14}/> 
                      {texts.activity_chart}
                  </h3>
                  <div className="flex text-[10px] font-bold rounded overflow-hidden border border-gray-200 flex-shrink-0">
                     <button onClick={() => setChartMode('week')} className={`px-2 sm:px-3 py-1.5 ${chartMode === 'week' ? (isMinimal ? 'bg-black text-white' : 'bg-gray-800 text-white') : 'text-gray-500'}`}>{texts.week}</button>
                     <button onClick={() => setChartMode('month')} className={`px-2 sm:px-3 py-1.5 ${chartMode === 'month' ? (isMinimal ? 'bg-black text-white' : 'bg-gray-800 text-white') : 'text-gray-500'}`}>{texts.month}</button>
                  </div>
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
                 {renderLineChart()}
              </div>
          </div>
      </div>

      {/* Streak List - GRID LAYOUT */}
      <div className="flex items-center justify-between mt-6">
         <h3 className={`text-sm font-bold uppercase tracking-wider ${textSub}`}>
            {texts.streak_status}
         </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {state.habits.length === 0 && (
           <div className="text-sm opacity-50 text-center py-4 col-span-2">
              {texts.no_habits}
           </div>
        )}
        
        {state.habits.map(habit => {
          const streak = calculateStreak(habit.id);
          const colorClass = habit.type === 'good' 
              ? (isMinimal ? 'text-black' : (isDark ? 'text-emerald-400' : 'text-emerald-600')) 
              : (isMinimal ? 'text-gray-500' : (isDark ? 'text-rose-400' : 'text-rose-600'));

          return (
            <div key={habit.id} className={`p-4 rounded-xl border w-full ${cardBg} flex items-center justify-between gap-2 sm:gap-4`}>
              
              {/* Name - LEFT */}
              <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm ${textMain} truncate`} title={habit.name}>{habit.name}</h3>
              </div>

               {/* Mini Dots - CENTER */}
               <div className="flex justify-center flex-shrink-0">
                   <div className="flex gap-1">
                       {[...Array(7)].map((_, i) => {
                          const d = new Date(state.simulatedDate);
                          d.setDate(d.getDate() - (6 - i));
                          const dateStr = getDateString(d);
                          const isDone = state.history[dateStr]?.includes(habit.id);
                          
                          let boxClass = "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ";
                          if (isDone) {
                              if (habit.type === 'good') boxClass += isMinimal ? "bg-black" : "bg-emerald-500";
                              else boxClass += isMinimal ? "bg-gray-600" : "bg-rose-500";
                          } else {
                              boxClass += isMinimal ? "bg-gray-200" : isDark ? "bg-slate-700" : "bg-gray-200";
                          }
                          
                          return <div key={i} className={boxClass} title={dateStr}></div>
                       })}
                   </div>
               </div>

               {/* Streak Status - RIGHT */}
               <div className="flex-1 flex justify-end min-w-0">
                  <div className={`flex items-center gap-1 whitespace-nowrap`}>
                        <TrendingUp size={14} className={colorClass} />
                        <span className={`font-bold text-sm ${textMain}`}>{streak} {texts.day_streak}</span>
                  </div>
               </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
