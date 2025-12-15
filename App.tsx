
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Habit, SkillCategory, INITIAL_STATE, Difficulty, getXpForLevel, Theme, DecorationCategory, DECORATION_ITEMS, Language, SKILL_DATA, TRANSLATIONS } from './types';
import StatusBar from './components/StatusBar';
import HabitManager from './components/HabitManager';
import SkillTreeManager from './components/SkillTreeManager';
import Statistics from './components/Statistics';
import Store from './components/Store';
import HomeRoom from './components/HomeRoom';
import { Scroll, Target, BarChart2, ShoppingBag, Bug, Calendar, PlusCircle, Info, HeartPulse, Trophy, X, Zap, Shield, Check, Crown, Footprints, Scale, Package, Ban, Flame, Eye, EyeOff, Rocket, Settings, RotateCcw, Palette, User, Gamepad2, Volume2, Bell, Mail, Database, Home, PaintBucket, Languages, Percent, Armchair, HelpCircle, Save, UploadCloud, Download, Coins } from 'lucide-react';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'gain' | 'spend' | 'perk' | 'damage';
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  check: (state: GameState) => boolean;
}

const TEMPLATE_COSTS: Record<string, number> = {
  'dopamine_detox': 300,
  'fit_life': 250,
  'wealth_builder': 400,
  'deep_focus': 500,
  'explorer_bag': 350
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('mindpath_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.inventory) parsed.inventory.activeFont = 'font-sans';
        if (!parsed.history) parsed.history = {};
        if (parsed.gold === undefined) parsed.gold = 50;
        
        // Robust check for missing inventory fields in saved data
        if (!parsed.inventory) {
          parsed.inventory = JSON.parse(JSON.stringify(INITIAL_STATE.inventory));
        } else {
           // Merge missing inventory keys from initial state
           parsed.inventory = { ...INITIAL_STATE.inventory, ...parsed.inventory };
        }

        // Language backward compatibility
        if (!parsed.language) parsed.language = 'tr';

        // Fix missing skill icons if loading older save
        if (parsed.skills) {
           parsed.skills = parsed.skills.map((s: any, index: number) => {
             const defaultSkill = INITIAL_STATE.skills[index];
             if (!defaultSkill) return s;
             return {
               ...defaultSkill, // Defaults first (icons, names)
               ...s, // Overwrite with saved progress
               costs: defaultSkill.costs || [1, 1, 1], // Ensure costs exist
             };
           });
        }

        const correctTarget = getXpForLevel(parsed.level || 1);
        parsed.xpToNextLevel = correctTarget;

        return parsed;
      } catch (e) {
        return JSON.parse(JSON.stringify(INITIAL_STATE));
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  });

  const [activeTab, setActiveTab] = useState<'habits' | 'skills' | 'stats' | 'store' | 'home'>('habits');
  // Store persistence state
  const [activeStoreTab, setActiveStoreTab] = useState<'bonuses' | 'bundles' | 'decoration'>('bundles');

  const [toast, setToast] = useState<{msg: string, type: 'info' | 'success' | 'warning', duration?: number} | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<{id: string, name: string, icon: React.ReactNode} | null>(null);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false); 
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'settings' | 'about' | 'dev'>('settings');
  
  const [ritalinClickCount, setRitalinClickCount] = useState(0);
  const [isLangSwitching, setIsLangSwitching] = useState(false);

  const [highlightAchievementId, setHighlightAchievementId] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const achievementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = gameState.simulatedDate;
  const lang = gameState.language;
  const T = TRANSLATIONS[lang];

  // Update Skills when language changes (Critical for the store requirement logic)
  useEffect(() => {
     setGameState(prev => {
        const currentLang = prev.language;
        const newSkills = prev.skills.map(s => {
            const skillData = SKILL_DATA[currentLang][s.id];
            if (skillData) {
                return { 
                    ...s, 
                    name: skillData.name,
                    levelNames: skillData.levels
                };
            }
            return s;
        });
        return { ...prev, skills: newSkills };
     });
  }, [gameState.language]);

  const toggleLanguage = (targetLang: Language) => {
      if (gameState.language === targetLang) return;
      
      setIsLangSwitching(true);
      
      // Delay the actual state change to be in the middle of the animation
      setTimeout(() => {
          setGameState(prev => ({ ...prev, language: targetLang }));
      }, 375); // Half of 750ms

      setTimeout(() => {
          setIsLangSwitching(false);
      }, 750);
  };

  // --- AUTOMATIC DAY SKIP LOGIC ---
  useEffect(() => {
     const checkDate = () => {
         const realToday = new Date().toISOString().split('T')[0];
         const simToday = gameState.simulatedDate;
         
         if (new Date(realToday) > new Date(simToday)) {
             processDaySkip(realToday);
         }
     };
     
     checkDate();
     const interval = setInterval(checkDate, 60000);
     return () => clearInterval(interval);
  }, [gameState.simulatedDate]);


  const processDaySkip = (targetDateStr: string) => {
     setGameState(prev => {
        const todayStr = prev.simulatedDate;
        const actionsToday = prev.history[todayStr] || [];

        const missedGoodHabits = prev.habits.filter(h => h.type === 'good' && !actionsToday.includes(h.id));
        const avoidedBadHabits = prev.habits.filter(h => h.type === 'bad' && !actionsToday.includes(h.id));

        let hpPenalty = 0;
        let goldPenalty = 0;

        missedGoodHabits.forEach(habit => {
            const rewards = calculateRewards(habit.difficulty, prev.skills, false);
            hpPenalty += Math.floor(rewards.hp / 2);
            goldPenalty += Math.floor(rewards.gold / 2);
        });
        
        const doneGoodHabit = prev.habits.some(h => h.type === 'good' && actionsToday.includes(h.id));
        const avoidedAnyBadHabit = avoidedBadHabits.length > 0;
        
        let newStreak = prev.loginStreak;
        let reward = 0;
        let consumedFreeze = false;

        if (doneGoodHabit || avoidedAnyBadHabit) { 
            newStreak += 1; 
            reward = Math.min(150, 25 + (newStreak * 10)); 
            if (avoidedAnyBadHabit) reward += (avoidedBadHabits.length * 10);
        } else { 
            if (prev.inventory.streakFreeze > 0) {
                consumedFreeze = true;
            } else {
                newStreak = 0; 
            }
        }

        let newHp = Math.max(0, prev.hp - hpPenalty);
        let newGold = Math.max(0, prev.gold + reward - goldPenalty);
        
        // Simple localization for automated toast
        const msgPrefix = lang === 'tr' ? "Yeni Gün!" : "New Day!";
        
        if (hpPenalty > 0) {
            setTimeout(() => setToast({ msg: `${msgPrefix} -${hpPenalty} HP, -${goldPenalty} ${T.gold}`, type: 'warning' }), 1000);
        } else {
            if (reward > 0) setTimeout(() => setToast({ msg: `${msgPrefix} +${reward} ${T.gold}`, type: 'success' }), 1000);
            else if (consumedFreeze) setTimeout(() => setToast({ msg: lang === 'tr' ? "Seri Kurtarma kullanıldı." : "Streak Freeze used.", type: 'info' }), 1000);
            else setTimeout(() => setToast({ msg: lang === 'tr' ? "Seri sıfırlandı." : "Streak reset.", type: 'info' }), 1000);
        }

        return {
            ...prev,
            simulatedDate: targetDateStr, 
            loginStreak: newStreak,
            gold: newGold,
            hp: newHp,
            lastLoginDate: targetDateStr,
            inventory: {
                ...prev.inventory,
                streakFreeze: consumedFreeze ? prev.inventory.streakFreeze - 1 : prev.inventory.streakFreeze,
                lastFreezeDate: null 
            }
        };
     });
  };

  const debugSkipDay = () => {
    setGameState(prev => {
      const currentSimulated = new Date(prev.simulatedDate);
      const nextDay = new Date(currentSimulated);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      
      const todayStr = prev.simulatedDate;
      const actionsToday = prev.history[todayStr] || [];
      const missedGoodHabits = prev.habits.filter(h => h.type === 'good' && !actionsToday.includes(h.id));
      const avoidedBadHabits = prev.habits.filter(h => h.type === 'bad' && !actionsToday.includes(h.id));
        
        let hpPenalty = 0;
        let goldPenalty = 0;

        missedGoodHabits.forEach(habit => {
            const rewards = calculateRewards(habit.difficulty, prev.skills, false);
            hpPenalty += Math.floor(rewards.hp / 2);
            goldPenalty += Math.floor(rewards.gold / 2);
        });
        
        const doneGoodHabit = prev.habits.some(h => h.type === 'good' && actionsToday.includes(h.id));
        const avoidedAnyBad = avoidedBadHabits.length > 0;

        let newStreak = prev.loginStreak;
        let reward = 0;
        let consumedFreeze = false;

        if (doneGoodHabit || avoidedAnyBad) { 
            newStreak += 1; 
            reward = Math.min(150, 25 + (newStreak * 10)); 
            if (avoidedAnyBad) reward += (avoidedBadHabits.length * 10);
        } else { 
            if (prev.inventory.streakFreeze > 0) {
                consumedFreeze = true;
            } else {
                newStreak = 0; 
            }
        }

        let newHp = Math.max(0, prev.hp - hpPenalty);
        let newGold = Math.max(0, prev.gold + reward - goldPenalty);
        
        if (hpPenalty > 0) {
             showToast(T.day_skipped + ` (-${hpPenalty} HP)`, 'warning');
        } else {
             showToast(T.day_skipped, 'info');
        }

        return {
            ...prev,
            simulatedDate: nextDayStr, 
            loginStreak: newStreak,
            gold: newGold,
            hp: newHp,
            lastLoginDate: nextDayStr,
            inventory: {
                ...prev.inventory,
                streakFreeze: consumedFreeze ? prev.inventory.streakFreeze - 1 : prev.inventory.streakFreeze,
                lastFreezeDate: null 
            }
        };
    });
  }

  const debugAddResources = () => {
    setGameState(prev => {
      let { xp, level, perkPoints, gold, xpToNextLevel } = prev;
      xp += 500;
      gold += 500;

      // Handle Level Up if needed
      if (xp >= xpToNextLevel) {
          const res = handleLevelUp(xp, level, perkPoints);
          xp = res.newXp;
          level = res.newLevel;
          perkPoints = res.newPerkPoints;
          xpToNextLevel = res.newTarget;
      }

      return { ...prev, xp, level, perkPoints, gold, xpToNextLevel };
    });
    showToast(T.cheat_res, 'success');
  };

  const handleDownloadSave = () => {
    const dataStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindflow_save_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'tr' ? "Oyun dosyası indirildi!" : "Save file downloaded!", 'success');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        
        // --- SAFE MIGRATION LOGIC ---
        // Instead of directly using 'parsed', we merge it into INITIAL_STATE.
        // This ensures new fields in the game (like new inventory items) are present.
        
        const sanitizedInventory = {
            ...INITIAL_STATE.inventory,
            ...(parsed.inventory || {})
        };

        // Fix Skills: Merge saved levels with default definitions (icons/names)
        const sanitizedSkills = (parsed.skills || INITIAL_STATE.skills).map((s: any, index: number) => {
            const defaultSkill = INITIAL_STATE.skills[index];
            if (!defaultSkill) return s; // Fallback
            return {
                ...defaultSkill, // Load default structure (icons, names)
                ...s, // Overwrite with saved level
                // Force critical fields to ensure no UI crash
                id: s.id || defaultSkill.id,
                icon: s.icon || defaultSkill.icon,
                levelNames: s.levelNames || defaultSkill.levelNames
            };
        });

        const newState: GameState = {
            ...INITIAL_STATE,
            ...parsed,
            inventory: sanitizedInventory,
            skills: sanitizedSkills,
            // Ensure critical arrays
            habits: parsed.habits || [],
            history: parsed.history || {},
            unlockedAchievements: parsed.unlockedAchievements || []
        };

        // Validate crucial numeric fields
        if (typeof newState.hp !== 'number' || typeof newState.gold !== 'number') {
             throw new Error("Corrupt Data");
        }

        // Save immediately to storage so the reload picks it up
        localStorage.setItem('mindpath_save', JSON.stringify(newState));
        
        showToast(lang === 'tr' ? "Oyun yüklendi!" : "Game loaded!", 'success');
        setTimeout(() => window.location.reload(), 800);

      } catch (err) {
        console.error(err);
        showToast("Error loading file", 'warning');
      }
    };
    reader.readAsText(file);
    // Reset value to allow selecting same file again
    event.target.value = '';
  };

  useEffect(() => {
    if (showAchievements && highlightAchievementId && achievementRefs.current[highlightAchievementId]) {
      setTimeout(() => {
        achievementRefs.current[highlightAchievementId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showAchievements, highlightAchievementId]);

  useEffect(() => {
    setGameState(prev => {
       const newInventory = { ...prev.inventory };
       let habitsChanged = false;
       let newHabits = [...prev.habits];
       let totalPenalty = 0;
       
       const now = new Date(prev.simulatedDate).getTime();
       const yesterdayDate = new Date(prev.simulatedDate);
       yesterdayDate.setDate(yesterdayDate.getDate() - 1);
       const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

       [...newInventory.purchasedTemplates].forEach(tmplId => {
          let shouldRemove = false;
          let isDueToMissed = false;
          const expiryStr = newInventory.templateExpiryDates[tmplId];
          
          if (expiryStr) {
             const expiry = new Date(expiryStr).getTime();
             if (now > expiry) shouldRemove = true;
             
             const purchaseTime = expiry - (7 * 24 * 60 * 60 * 1000);
             const yesterdayTime = yesterdayDate.getTime();
             
             if (!shouldRemove && yesterdayTime >= purchaseTime) {
                const templateHabits = newHabits.filter(h => h.templateId === tmplId);
                const yesterdayActions = prev.history[yesterdayStr] || [];
                const missedGood = templateHabits.some(h => h.type === 'good' && !yesterdayActions.includes(h.id));
                const triggeredBad = templateHabits.some(h => h.type === 'bad' && yesterdayActions.includes(h.id));
                
                if (templateHabits.length > 0 && (missedGood || triggeredBad)) {
                   shouldRemove = true;
                   isDueToMissed = true;
                }
             }
          } else {
             shouldRemove = true; 
          }

          if (shouldRemove) {
             const countBefore = newHabits.length;
             newHabits = newHabits.filter(h => h.templateId !== tmplId);
             if (newHabits.length !== countBefore) habitsChanged = true;
             newInventory.purchasedTemplates = newInventory.purchasedTemplates.filter(id => id !== tmplId);
             delete newInventory.templateExpiryDates[tmplId];

             if (isDueToMissed) {
                const cost = TEMPLATE_COSTS[tmplId] || 0;
                totalPenalty += (cost * 2);
             }
          }
       });

       if (totalPenalty > 0) {
          setTimeout(() => {
             triggerFloatingText(window.innerWidth / 2, window.innerHeight / 2, `-${totalPenalty} ${T.gold}`, 'spend');
             setToast({ msg: `Penalty: -${totalPenalty} ${T.gold}`, type: 'warning' });
          }, 500);
          
          return { 
             ...prev, 
             inventory: newInventory, 
             habits: newHabits,
             gold: Math.max(0, prev.gold - totalPenalty)
          };
       }

       if (habitsChanged) {
          return { ...prev, inventory: newInventory, habits: newHabits };
       }
       return prev;
    });
  }, [gameState.simulatedDate]);

  const calculateStreak = (habitId: string, state: GameState) => {
    let streak = 0;
    const currentToday = new Date(state.simulatedDate);
    for (let i = 0; i < 365; i++) {
      const d = new Date(currentToday);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const actions = state.history[dateStr] || [];
      if (actions.includes(habitId)) { streak++; } else { if (i === 0) continue; break; }
    }
    return streak;
  };

  const calculateAvoidanceStreak = (habitId: string, state: GameState) => {
    let streak = 0;
    const currentToday = new Date(state.simulatedDate);
    for (let i = 0; i < 30; i++) {
       const d = new Date(currentToday);
       d.setDate(d.getDate() - i);
       const actions = state.history[d.toISOString().split('T')[0]] || [];
       if (!actions.includes(habitId)) { streak++; } else { break; }
    }
    return streak;
  };

  const ACHIEVEMENTS_RAW = [
    // 1. Easiest / Tutorial
    { id: 'first_step', icon: <Footprints className="text-teal-500"/>, check: (s: GameState) => s.habits.length > 3 },
    
    // 2. Consumables / Shop
    { id: 'quick_learner', icon: <Zap className="text-yellow-500"/>, check: (s: GameState) => (s.inventory.xpBoosterUsedCount || 0) > 0 }, 
    { id: 'survivor', icon: <Shield className="text-blue-500"/>, check: (s: GameState) => s.inventory.streakFreeze > 0 },
    { id: 'worth_trying', icon: <Package className="text-amber-600"/>, check: (s: GameState) => s.inventory.purchasedTemplates.length > 0 },
    { id: 'clean_room', icon: <PaintBucket className="text-pink-500"/>, check: (s: GameState) => s.inventory.activeDecorations['wall_base'] === 'DEK001' },

    // 3. Early Game Milestones
    { id: 'anti_discipline', icon: <Flame className="text-rose-500"/>, check: (s: GameState) => s.habits.some(h => h.type === 'bad' && calculateStreak(h.id, s) >= 3) },
    { id: 'red_line', icon: <Ban className="text-rose-500"/>, check: (s: GameState) => s.loginStreak >= 7 && s.habits.some(h => h.type === 'bad' && calculateAvoidanceStreak(h.id, s) >= 7) },
    { id: 'habit_theory', icon: <Trophy className="text-yellow-600"/>, check: (s: GameState) => s.loginStreak >= 21 },
    
    // 4. Mid Game / Accumulation
    { id: 'midas', icon: <ShoppingBag className="text-amber-500"/>, check: (s: GameState) => s.gold >= 1000 },
    { id: 'this_year', icon: <Target className="text-blue-500"/>, check: (s: GameState) => s.inventory.ownedDecorations.includes('DEK_BOARD') },
    
    // 5. Skill Specific (Lvl 3)
    { id: 'hercules', icon: <Target className="text-rose-500"/>, check: (s: GameState) => (s.skills.find(x=>x.id==='s1')?.currentLevel || 0) >= 3 },
    { id: 'stonks', icon: <Target className="text-green-600"/>, check: (s: GameState) => (s.skills.find(x=>x.id==='s6')?.currentLevel || 0) >= 3 },
    { id: 'bargain_hunter', icon: <Percent className="text-orange-500"/>, check: (s: GameState) => (s.skills.find(x=>x.id==='s3')?.currentLevel || 0) >= 3 },

    // 6. Hard / Grind
    { id: 'da_vinci', icon: <Scroll className="text-indigo-500"/>, check: (s: GameState) => s.skills.every(sk => sk.currentLevel >= 1) },
    { id: 'wise', icon: <Zap className="text-amber-600"/>, check: (s: GameState) => s.inventory.xpBoosterCharges >= 5 },
    
    // 7. Very Hard / Expert
    { id: 'symmetry', icon: <Scale className="text-indigo-500"/>, check: (s: GameState) => {
       const good = s.habits.filter(h=>h.type==='good').length;
       const bad = s.habits.filter(h=>h.type==='bad').length;
       return good > 0 && good === bad;
    }},
    { id: 'perfect', icon: <HeartPulse className="text-rose-600"/>, check: (s: GameState) => s.skills.every(sk => sk.currentLevel >= 3) },
    { id: 'meticulous', icon: <Home className="text-emerald-500"/>, check: (s: GameState) => {
        const ownedAll = s.inventory.ownedDecorations.length >= DECORATION_ITEMS.length;
        const usedAll = Object.values(s.inventory.activeDecorations).filter(Boolean).length >= DECORATION_ITEMS.length;
        return ownedAll && usedAll;
    }},

    // 8. Secrets & Finale
    { id: 'curious_mind', icon: <HelpCircle className="text-purple-500"/>, check: () => false }, // Checked manually
    { id: 'game_over', icon: <Crown className="text-amber-500"/>, check: (s: GameState) => s.unlockedAchievements.length >= 19 }
  ];

  // Map translations to achievements
  const ACHIEVEMENTS: Achievement[] = ACHIEVEMENTS_RAW.map(ach => ({
      ...ach,
      name: T.achievements?.[ach.id]?.name || ach.id,
      desc: T.achievements?.[ach.id]?.desc || "..."
  }));

  useEffect(() => {
    let newUnlock = false;
    let unlockedName = '';
    let unlockedIcon = null;
    let unlockedId = '';
    const newState = { ...gameState };
    
    ACHIEVEMENTS.forEach(ach => {
      if (!newState.unlockedAchievements.includes(ach.id)) {
        if (ach.check(newState)) {
          newState.unlockedAchievements.push(ach.id);
          unlockedName = ach.name;
          unlockedIcon = ach.icon;
          unlockedId = ach.id;
          newUnlock = true;
        }
      }
    });

    if (newUnlock) {
      setGameState(newState);
      setAchievementNotification({ id: unlockedId, name: unlockedName, icon: unlockedIcon });
    }
  }, [gameState.gold, gameState.xp, gameState.skills, gameState.inventory, gameState.loginStreak, gameState.unlockedAchievements.length, gameState.habits.length, gameState.history]);

  useEffect(() => {
    if (achievementNotification) {
      const timer = setTimeout(() => setAchievementNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [achievementNotification]);

  const handleDevClick = () => { manualUnlock('secret_dev', 'Evet beni buldun!', <Bug className="text-emerald-500"/>); };

  const manualUnlock = (id: string, name: string, icon: React.ReactNode) => {
     if (!gameState.unlockedAchievements.includes(id)) {
       setGameState(prev => ({ ...prev, unlockedAchievements: [...prev.unlockedAchievements, id] }));
       setAchievementNotification({ id, name, icon });
    }
  };

  const handleRitalinClick = () => {
      const newCount = ritalinClickCount + 1;
      setRitalinClickCount(newCount);
      if (newCount === 5) {
          manualUnlock('curious_mind', T.achievements['curious_mind'].name, <HelpCircle className="text-purple-500"/>);
      }
  };

  useEffect(() => {
    setGameState(prev => {
      const physLevel = prev.skills.find(s => s.id === 's1')?.currentLevel || 0;
      let newMaxHp = 100;
      if (physLevel >= 1) newMaxHp += 25; 
      if (physLevel >= 2) newMaxHp += 25; 
      if (physLevel >= 3) newMaxHp += 50; 
      if (prev.maxHp !== newMaxHp) return { ...prev, maxHp: newMaxHp, hp: newMaxHp };
      return prev;
    });
  }, [gameState.skills]);

  useEffect(() => { localStorage.setItem('mindpath_save', JSON.stringify(gameState)); }, [gameState]);

  useEffect(() => {
    if (toast) {
      const duration = toast.duration || 3000;
      const timer = setTimeout(() => setToast(null), duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (floatingTexts.length > 0) {
      const timer = setTimeout(() => setFloatingTexts(prev => prev.slice(1)), 1500);
      return () => clearTimeout(timer);
    }
  }, [floatingTexts]);

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' = 'info', duration: number = 3000) => {
    setToast({ msg, type, duration });
  };

  const triggerFloatingText = (x: number, y: number, text: string, type: 'gain' | 'spend' | 'perk' | 'damage') => {
     setFloatingTexts(prev => [...prev, { id: Date.now(), x, y, text, type }]);
  };

  // --- CORE LOGIC ---
  const handleLevelUp = (currentXp: number, currentLevel: number, currentPerkPoints: number) => {
    let newXp = currentXp;
    let newLevel = currentLevel;
    let newPerkPoints = currentPerkPoints;
    let targetXp = getXpForLevel(newLevel);
    while (newXp >= targetXp) {
      newXp -= targetXp;
      newLevel += 1;
      newPerkPoints += 1;
      targetXp = getXpForLevel(newLevel);
    }
    return { newXp, newLevel, newPerkPoints, newTarget: targetXp };
  };

  const calculateRewards = (difficulty: Difficulty, skills: SkillCategory[], hasBooster: boolean) => {
     let baseHp = 5, baseXp = 5, baseGold = 10;
     if (difficulty === 'medium') { baseHp = 10; baseXp = 10; baseGold = 25; }
     if (difficulty === 'hard') { baseHp = 20; baseXp = 20; baseGold = 50; }
     const physicalLevel = skills.find(s => s.id === 's1')?.currentLevel || 0;
     const careerLevel = skills.find(s => s.id === 's4')?.currentLevel || 0;
     const financialLevel = skills.find(s => s.id === 's6')?.currentLevel || 0;
     const hpBonus = physicalLevel * 2; 
     let careerPercent = 0;
     if (careerLevel === 1) careerPercent = 0.10;
     if (careerLevel === 2) careerPercent = 0.25;
     if (careerLevel === 3) careerPercent = 0.50;
     const bonusXpAmount = Math.floor(baseXp * careerPercent);
     const xpMultiplier = 1 + careerPercent;
     const goldMultiplier = 1 + (financialLevel * 0.15); 
     let finalXp = Math.floor(baseXp * xpMultiplier);
     let finalGold = Math.floor(baseGold * goldMultiplier);
     let finalHp = baseHp + hpBonus;
     if (hasBooster) finalXp *= 2;
     return { hp: finalHp, xp: finalXp, gold: finalGold, bonusXpAmount };
  };

  const handleHabitTrigger = (habit: Habit, e: React.MouseEvent) => {
    if (gameState.hp <= 0) return;

    setGameState(prev => {
      if (prev.history[today]?.includes(habit.id)) return prev;

      let { hp, xp, level, perkPoints, gold, inventory } = prev;
      let leveledUp = false;
      const hasBooster = inventory.xpBoosterCharges > 0;
      const rewards = calculateRewards(habit.difficulty, prev.skills, hasBooster);
      let newBoosterCharges = inventory.xpBoosterCharges;
      let newBoosterUsed = inventory.xpBoosterUsedCount || 0;

      if (hasBooster) { newBoosterCharges--; newBoosterUsed++; }

      const todayHistory = prev.history?.[today] || [];
      const newHistory = { ...prev.history, [today]: [...todayHistory, habit.id] };
      let newTarget = prev.xpToNextLevel;

      if (habit.type === 'good') {
        hp = Math.min(hp + rewards.hp, prev.maxHp);
        xp += rewards.xp;
        gold += rewards.gold;
        triggerFloatingText(e.clientX, e.clientY, `+${rewards.gold} ${T.gold}`, 'gain');
        if (rewards.bonusXpAmount > 0) showToast(`Bonus XP: +${rewards.bonusXpAmount}`, 'info');
        if (xp >= newTarget) {
          const res = handleLevelUp(xp, level, perkPoints);
          xp = res.newXp; level = res.newLevel; perkPoints = res.newPerkPoints; newTarget = res.newTarget; leveledUp = true;
        }
      } else {
        // TRIGGERING A BAD HABIT
        hp = Math.max(hp - rewards.hp, 0);
        // DAMAGE FLOATING TEXT
        triggerFloatingText(e.clientX, e.clientY, `-${rewards.hp} HP`, 'damage');
        const randMsg = T.regret_messages[Math.floor(Math.random() * T.regret_messages.length)];
        showToast(randMsg, 'warning', 5000); // Longer duration for bad habits
      }

      if (leveledUp) showToast(`${T.level_up} ${T.level}: ${level}.`, 'success');
      if (hasBooster) showToast(`XP Booster Active! (${newBoosterCharges})`, 'success');

      const goodHabits = prev.habits.filter(h => h.type === 'good');
      const allDone = goodHabits.every(h => newHistory[today].includes(h.id));
      if (allDone && habit.type === 'good' && goodHabits.length > 0) {
         const congratMsg = T.congrat_messages[Math.floor(Math.random() * T.congrat_messages.length)];
         setTimeout(() => showToast(`🏆 ${congratMsg}`, 'success'), 600);
      }

      return { 
        ...prev, 
        hp, xp, level, perkPoints, gold, 
        xpToNextLevel: newTarget,
        inventory: { ...inventory, xpBoosterCharges: newBoosterCharges, xpBoosterUsedCount: newBoosterUsed },
        history: newHistory 
      };
    });
  };

  const isDead = gameState.hp <= 0;
  // Calculate dynamic revive cost
  const reviveCost = Math.floor(gameState.gold * 0.8);

  const revivePlayer = () => {
    // If they have no gold, it's free. If they have gold, they pay 80%.
    setGameState(prev => ({ ...prev, hp: prev.maxHp, gold: prev.gold - reviveCost }));
    showToast(reviveCost > 0 ? `${T.revive_btn}! (-${reviveCost} ${T.gold})` : `${T.revive_btn}!`, 'success');
  };

  const buyItem = (type: 'template' | 'booster' | 'freeze' | 'theme' | 'potion' | 'decoration', id: string, cost: number, payload: any, e?: React.MouseEvent) => {
    if (gameState.gold < cost) { showToast("Yeterli Altın yok!", 'info'); return; }
    const fx = e ? e.clientX : window.innerWidth / 2;
    const fy = e ? e.clientY : window.innerHeight / 2;

    setGameState(prev => {
      let newInventory = { ...prev.inventory };
      let newHabits = [...prev.habits];
      let { xp, level, perkPoints, xpToNextLevel } = prev;
      let leveledUp = false;
      
      if (type === 'booster') {
        newInventory.xpBoosterCharges += 4; 
        newInventory.xpBoosterBoughtCount = (newInventory.xpBoosterBoughtCount || 0) + 1;
        showToast(T.bought, 'success');
      } else if (type === 'freeze') {
        if (newInventory.lastFreezeDate === today) { showToast("Max 1 per day!", 'info'); return prev; }
        newInventory.streakFreeze += 1;
        newInventory.streakFreezeBoughtCount = (newInventory.streakFreezeBoughtCount || 0) + 1;
        newInventory.lastFreezeDate = today;
        showToast(T.bought, 'success');
      } else if (type === 'potion') {
        const gain = Math.floor(xpToNextLevel * 0.25);
        xp += gain;
        showToast(`XP +${gain}`, 'success');
        if (xp >= xpToNextLevel) {
          const res = handleLevelUp(xp, level, perkPoints);
          xp = res.newXp; level = res.newLevel; perkPoints = res.newPerkPoints; xpToNextLevel = res.newTarget; leveledUp = true;
        }
      } else if (type === 'template') {
        if (newInventory.purchasedTemplates.includes(id)) return prev;
        if (prev.habits.length + (payload?.habits?.length || 0) > 8) { showToast(T.limit_reached, 'info'); return prev; }
        if (payload?.habits) {
          const habitsWithId = payload.habits.map((h: Habit) => ({...h, templateId: id}));
          newHabits = [...newHabits, ...habitsWithId];
          newInventory.purchasedTemplates.push(id);
          const expiryDate = new Date(today);
          expiryDate.setDate(expiryDate.getDate() + 7);
          newInventory.templateExpiryDates[id] = expiryDate.toISOString().split('T')[0];
          showToast(T.bought, 'success');
        }
      } else if (type === 'decoration') {
         if (newInventory.ownedDecorations.includes(id)) {
             // Equip/Unequip logic
             const category = payload.category as DecorationCategory;
             
             if (newInventory.activeDecorations[category] === id) {
                // UNEQUIP
                 newInventory.activeDecorations = {
                     ...newInventory.activeDecorations,
                     [category]: null
                 };
                 showToast(T.using, 'info');
                 return { ...prev, inventory: newInventory };
             } else {
                // EQUIP
                 newInventory.activeDecorations = {
                     ...newInventory.activeDecorations,
                     [category]: id
                 };
                 showToast(T.using, 'success');
                 return { ...prev, inventory: newInventory };
             }

         } else {
             // Buy Logic
             newInventory.ownedDecorations.push(id);
             showToast(T.bought, 'success');
         }
      }
      
      if (leveledUp) setTimeout(() => showToast(`${T.level_up} ${T.level}: ${level}.`, 'success'), 500);
      if (type !== 'decoration' || !prev.inventory.ownedDecorations.includes(id)) {
           triggerFloatingText(fx, fy, `-${cost} ${T.gold}`, 'spend');
      }
      
      return { ...prev, gold: prev.gold - cost, xp, level, perkPoints, xpToNextLevel, inventory: newInventory, habits: newHabits };
    });
  };

  const equipTheme = (themeId: Theme) => {
     setGameState(prev => ({ ...prev, inventory: { ...prev.inventory, activeTheme: themeId } }));
  };

  const addHabit = (habit: Habit) => setGameState(prev => ({ ...prev, habits: [...prev.habits, habit] }));
  const editHabit = (updatedHabit: Habit) => setGameState(prev => ({...prev, habits: prev.habits.map(h => h.id === updatedHabit.id ? updatedHabit : h)}));
  const deleteHabit = (id: string) => setGameState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  
  const addSkill = (skill: SkillCategory) => setGameState(prev => ({ ...prev, skills: [...prev.skills, skill] }));
  const editSkill = (updatedSkill: SkillCategory) => setGameState(prev => ({...prev, skills: prev.skills.map(s => s.id === updatedSkill.id ? updatedSkill : s)}));
  const deleteSkill = (id: string) => setGameState(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));

  const upgradeSkill = (skillId: string, e?: React.MouseEvent) => {
    setGameState(prev => {
      const skillIndex = prev.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) return prev;
      const skill = prev.skills[skillIndex];
      if (skill.currentLevel >= 3) return prev;
      const cost = skill.costs[skill.currentLevel];
      if (prev.perkPoints < cost) { showToast("No Keys!", 'info'); return prev; }
      const fx = e ? e.clientX : window.innerWidth / 2;
      const fy = e ? e.clientY : window.innerHeight / 2;
      triggerFloatingText(fx, fy, `-${cost} Key`, 'perk');
      const newSkills = [...prev.skills];
      newSkills[skillIndex] = { ...skill, currentLevel: skill.currentLevel + 1 };
      showToast(`${skill.name} ${T.upgrade}!`, 'success');
      return { ...prev, perkPoints: prev.perkPoints - cost, skills: newSkills };
    });
  };

  const repairDay = (dateStr: string) => {
    setGameState(prev => {
       if (prev.inventory.streakFreeze <= 0) {
          showToast("No Potion!", 'warning');
          return prev;
       }
       
       const goodHabitIds = prev.habits.filter(h => h.type === 'good').map(h => h.id);
       return {
          ...prev,
          inventory: { ...prev.inventory, streakFreeze: prev.inventory.streakFreeze - 1 },
          history: {
             ...prev.history,
             [dateStr]: goodHabitIds 
          }
       };
    });
    showToast(T.repair_history, 'success');
    setShowRepairModal(false);
  };

  const resetGame = () => {
     localStorage.clear();
     const resetState = INITIAL_STATE;
     setGameState(resetState as GameState);
     setTimeout(() => window.location.reload(), 100);
  };

  const activeTheme = gameState.inventory.activeTheme;
  const activeFont = 'font-sans'; 
  
  const getThemeClass = () => {
     switch(activeTheme) {
        case 'dark': return 'bg-slate-900 text-slate-100';
        case 'minimal': return 'bg-white text-stone-900'; 
        case 'cozy': default: return 'bg-cozy-50 text-cozy-900';
     }
  };

  const fontBaseClass = 'text-sm';

  // Modified: Closer buttons, larger icons, larger text, less padding
  const navBtnClass = (isActive: boolean) => {
    if (activeTheme === 'minimal') return `flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-xs font-bold border-t-2 transition-all ${isActive ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`;
    if (activeTheme === 'dark') return `flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-xs font-serif font-bold transition-all ${isActive ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`;
    return `flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-xs font-serif font-bold transition-all ${isActive ? 'text-cozy-800 bg-cozy-100' : 'text-cozy-500 hover:text-cozy-700'}`;
  };

  const getFloatingTextStyle = (type: string, theme: Theme) => {
     const isDark = theme === 'dark';
     if (type === 'gain') return isDark ? 'text-amber-400' : 'text-amber-600';
     if (type === 'damage') return 'text-rose-500 font-black text-xl'; // Damage style
     const base = "px-2 py-1 rounded shadow-md font-bold text-xs border bg-opacity-95 backdrop-blur-sm ";
     if (type === 'spend') return base + (isDark ? "bg-rose-950 text-rose-300 border-rose-900" : "bg-rose-50 text-rose-700 border-rose-200");
     if (type === 'perk') return base + (isDark ? "bg-purple-950 text-purple-300 border-purple-900" : "bg-purple-50 text-purple-700 border-purple-200");
     return "";
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-1000 ease-in-out ${getThemeClass()} ${activeFont} ${fontBaseClass} ${isLangSwitching ? 'lang-switching' : ''}`}>
      {/* Hidden File Input for Game Loading */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleFileUpload}
      />

      <StatusBar 
        state={gameState} 
        theme={activeTheme} 
        onOpenAchievements={() => setShowAchievements(true)} 
        onDevClick={handleDevClick}
        onOpenRepair={() => setShowRepairModal(true)}
        onOpenSettings={() => setShowSettings(true)}
        texts={T}
      />

      {showSettings && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl overflow-hidden flex flex-col max-h-[80vh] ${activeTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
               {/* No header text/icon, just tab bar with close button integrated */}
               
               <div className="flex border-b border-inherit items-stretch">
                   <button onClick={() => setSettingsTab('settings')} className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-2 ${settingsTab === 'settings' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'opacity-50'}`}>
                      <Settings size={14}/> {T.settings}
                   </button>
                   <button onClick={() => setSettingsTab('about')} className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-2 ${settingsTab === 'about' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'opacity-50'}`}>
                      <Info size={14}/> {T.about}
                   </button>
                   <button onClick={() => setSettingsTab('dev')} className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-2 ${settingsTab === 'dev' ? 'border-b-2 border-emerald-500 text-emerald-500' : 'opacity-50'}`}>
                      <User size={14}/> {T.dev}
                   </button>
                   
                   {/* Integrated Close Button */}
                   <button onClick={() => setShowSettings(false)} className="px-4 border-l border-inherit opacity-50 hover:opacity-100 hover:bg-black/5 transition">
                      <X size={18}/>
                   </button>
               </div>

               <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  
                  {settingsTab === 'about' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-center mb-4">
                           <Gamepad2 size={48} className="text-emerald-500" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-center">Mind'N Flow</h4>
                        
                        <div className="border-t border-inherit pt-4">
                           <p className="text-xs font-bold mb-3">✨ Features:</p>
                           <ul className="text-xs space-y-3 opacity-80">
                              {T.features_list?.map((feature: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0"/> <span>{feature}</span></li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  )}

                  {settingsTab === 'dev' && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-right-4 text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto overflow-hidden flex items-center justify-center border-4 border-emerald-500 shadow-lg mb-2">
                           <img 
                             src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60" 
                             alt="Dev" 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <button 
                           onClick={handleRitalinClick} 
                           className="font-bold text-lg hover:scale-105 active:scale-95 transition select-none cursor-pointer"
                        >
                           Ritalin
                        </button>
                        <p className="text-xs opacity-70 italic px-4 leading-relaxed">
                           "I built this to organize my life, hope it helps you too."
                        </p>
                        <a href="mailto:umitt.kaya0@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-xs font-bold mt-2 hover:bg-gray-800 transition">
                           <Mail size={14}/> umitt.kaya0@gmail.com
                        </a>
                     </div>
                  )}

                  {settingsTab === 'settings' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        
                        <div>
                           <h4 className="text-xs font-bold uppercase opacity-70 mb-3 flex items-center gap-2"><Palette size={14}/> {T.themes}</h4>
                           <div className="grid grid-cols-3 gap-2">
                              {[
                                 {id: 'cozy', name: T.themes_cozy, bg: 'bg-[#FFF8F3]', border: 'border-[#ad8446]', text: 'text-[#5C4033]'},
                                 {id: 'dark', name: T.themes_dark, bg: 'bg-[#0f172a]', border: 'border-[#334155]', text: 'text-white'},
                                 {id: 'minimal', name: T.themes_minimal, bg: 'bg-white', border: 'border-black', text: 'text-black'}
                              ].map(t => (
                                 <button 
                                   key={t.id}
                                   onClick={() => equipTheme(t.id as Theme)}
                                   className={`p-2 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${t.bg} ${t.text} ${activeTheme === t.id ? `ring-2 ring-emerald-500 scale-105` : `${t.border}`}`}
                                 >
                                    <span className="text-[10px] font-bold">{t.name}</span>
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-inherit">
                           <h4 className="text-xs font-bold uppercase opacity-70 mb-3 flex items-center gap-2"><Languages size={14}/> {T.language}</h4>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => toggleLanguage('tr')}
                                className={`flex-1 py-2 text-xs font-bold border rounded flex items-center justify-center gap-2 transition ${lang === 'tr' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-transparent opacity-50 border-gray-300'}`}
                              >
                                 <img src="https://flagcdn.com/w40/tr.png" alt="TR" className="w-5 h-3 shadow-sm"/> Türkçe
                              </button>
                              <button 
                                onClick={() => toggleLanguage('en')}
                                className={`flex-1 py-2 text-xs font-bold border rounded flex items-center justify-center gap-2 transition ${lang === 'en' ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-transparent opacity-50 border-gray-300'}`}
                              >
                                 <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-5 h-3 shadow-sm"/> English
                              </button>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-inherit">
                           <h4 className="text-xs font-bold uppercase opacity-70 mb-3 text-sky-500 flex items-center gap-2"><Database size={14}/> {T.data}</h4>
                           <div className="grid grid-cols-2 gap-2 mb-2">
                               <button onClick={handleDownloadSave} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 hover:bg-sky-200 transition">
                                   <Download size={18}/>
                                   <span className="text-[10px] font-bold">{T.download_save}</span>
                               </button>
                               <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition">
                                   <UploadCloud size={18}/>
                                   <span className="text-[10px] font-bold">{T.upload_save}</span>
                               </button>
                           </div>
                           <button 
                              onClick={() => { if(confirm(T.reset_confirm)) resetGame(); }}
                              className="w-full py-3 rounded-lg bg-rose-100 text-rose-600 font-bold text-sm hover:bg-rose-200 transition border border-rose-200 flex items-center justify-center gap-2"
                           >
                              <RotateCcw size={16}/> {T.reset_data}
                           </button>
                        </div>
                        <div className="text-center text-[10px] opacity-40">v1.5.9 Release</div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Repair Modal */}
      {showRepairModal && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl p-6 ${activeTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="text-sky-500" /> {T.repair_history}</h3>
                  <button onClick={() => setShowRepairModal(false)}><X size={20}/></button>
               </div>
               <p className="text-sm opacity-80 mb-4">
                  {T.repair_desc}
               </p>
               <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(daysAgo => {
                     const d = new Date(gameState.simulatedDate);
                     d.setDate(d.getDate() - daysAgo);
                     const dStr = d.toISOString().split('T')[0];
                     const history = gameState.history[dStr] || [];
                     const goodHabits = gameState.habits.filter(h => h.type === 'good');
                     const badHabits = gameState.habits.filter(h => h.type === 'bad');
                     
                     const allGoodDone = goodHabits.every(h => history.includes(h.id));
                     const noBadDone = !badHabits.some(h => history.includes(h.id));
                     const isPerfect = allGoodDone && noBadDone;

                     if (isPerfect) return null;

                     return (
                        <button 
                           key={daysAgo}
                           onClick={() => repairDay(dStr)}
                           className={`w-full p-3 rounded-lg flex justify-between items-center text-sm font-bold border transition
                              ${activeTheme === 'dark' ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}
                           `}
                        >
                           <span>{dStr} ({daysAgo} {lang === 'tr' ? 'gün önce' : 'days ago'})</span>
                           <span className="text-sky-500">{T.repair_btn}</span>
                        </button>
                     )
                  })}
                  <div className="text-center text-xs opacity-50 italic">
                     ({lang === 'tr' ? 'Sadece son 5 gün' : 'Last 5 days only'})
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Achievement & Death Modals */}
      {achievementNotification && (
         <div 
          onClick={() => {
             setShowAchievements(true);
             setHighlightAchievementId(achievementNotification.id);
             setAchievementNotification(null); 
          }}
          className="fixed top-24 right-4 z-[90] animate-achievement-slide cursor-pointer active:scale-95 transition-transform"
         >
            <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 ${activeTheme === 'minimal' ? 'bg-black text-white border-black' : activeTheme === 'dark' ? 'bg-slate-800 text-white border-emerald-500' : 'bg-white text-cozy-900 border-emerald-500'}`}>
               <div className={`p-2 rounded-full ${activeTheme === 'minimal' ? 'bg-white text-black' : 'bg-emerald-100 text-emerald-600'}`}>
                  {achievementNotification.icon}
               </div>
               <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Achievement!</div>
                  <div className="font-bold text-sm">{achievementNotification.name}</div>
               </div>
            </div>
         </div>
      )}

      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           <div className={`w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${activeTheme === 'minimal' ? 'bg-white border-2 border-black' : activeTheme === 'dark' ? 'bg-slate-800 border border-slate-600' : 'bg-cozy-50 border border-cozy-200'}`}>
              <div className="p-4 border-b border-inherit flex justify-between items-center bg-inherit">
                 <h2 className={`text-xl font-serif font-bold flex items-center gap-2 ${activeTheme === 'dark' ? 'text-white' : 'text-cozy-900'}`}>
                    <Trophy className="text-yellow-500" /> Achievements ({gameState.unlockedAchievements.length}/{ACHIEVEMENTS.length})
                 </h2>
                 <button onClick={() => setShowAchievements(false)} className="p-1 hover:bg-black/10 rounded-full">
                    <X size={20} className={activeTheme === 'dark' ? 'text-white' : 'text-black'} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                 {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = gameState.unlockedAchievements.includes(ach.id);
                    const isHighlighted = ach.id === highlightAchievementId;
                    const isBlurry = false; // Always show details now

                    const containerClass = isUnlocked
                       ? (activeTheme === 'minimal' 
                          ? 'bg-emerald-600 border-black text-white' 
                          : 'bg-emerald-600 border-emerald-500 text-white shadow-md')
                       : (activeTheme === 'minimal'
                          ? 'bg-gray-200 border-gray-300 opacity-100 text-gray-700' 
                          : activeTheme === 'dark' ? 'bg-slate-800 border-slate-700 opacity-100 text-slate-500' : 'bg-stone-200 border-stone-300 opacity-100 text-stone-600');

                    const iconBg = isUnlocked ? 'bg-white/20 text-white' : 'bg-gray-400 grayscale text-gray-600';

                    return (
                       <div 
                        key={ach.id} 
                        ref={(el) => { achievementRefs.current[ach.id] = el; }}
                        onClick={() => isHighlighted && setHighlightAchievementId(null)}
                        className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${containerClass} ${isHighlighted ? 'ring-4 ring-yellow-400 scale-105 animate-pulse' : ''}`}
                       >
                          <div className={`p-3 rounded-full flex-shrink-0 ${iconBg}`}>
                             {ach.icon}
                          </div>
                          <div>
                             <h3 className="font-bold">
                                {ach.name}
                             </h3>
                             <p className={`text-xs ${isUnlocked ? 'text-white/80' : 'text-inherit'} ${isBlurry ? 'blur-sm hover:blur-none transition duration-300 cursor-pointer select-none' : ''}`}>
                                {ach.desc}
                             </p>
                          </div>
                          {isUnlocked && <Check className="ml-auto flex-shrink-0 text-white" size={20} />}
                       </div>
                    )
                 })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {isDead && (
        <div className="fixed inset-0 z-[100] bg-rose-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-red-50 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center border-4 border-red-600 animate-bounce-in">
             <div className="bg-red-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-red-200">
                <HeartPulse size={48} className="text-red-600" />
             </div>
             <h2 className="text-3xl font-serif font-black text-red-900 mb-2">{T.revive_title}</h2>
             <p className="text-red-800 mb-6 font-medium text-sm">
               {T.revive_desc}
             </p>
             <button 
               onClick={revivePlayer}
               className="w-full py-4 bg-red-600 text-white font-bold rounded-xl text-lg hover:bg-red-700 transition shadow-lg flex flex-col items-center gap-1 active:scale-95"
             >
               <span>{T.revive_btn}</span>
               <span className="text-xs opacity-90 font-normal">
                  {reviveCost > 0 ? `${T.cost}: ${reviveCost} ${T.gold}` : T.free}
               </span>
             </button>
          </div>
        </div>
      )}

      <main className={`flex-1 w-full pb-20 relative ${activeTab === 'home' ? 'p-0' : 'pt-4'}`}>
        {activeTab === 'habits' && (
          <HabitManager 
            habits={gameState.habits}
            history={gameState.history}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
            onEditHabit={editHabit}
            onTriggerHabit={handleHabitTrigger}
            theme={activeTheme}
            today={gameState.simulatedDate}
            inventory={gameState.inventory}
            texts={T}
          />
        )}
        {activeTab === 'skills' && (
          <SkillTreeManager 
            skills={gameState.skills}
            perkPoints={gameState.perkPoints}
            onUpgradeSkill={upgradeSkill}
            onAddSkill={addSkill}
            onEditSkill={editSkill}
            onDeleteSkill={deleteSkill}
            theme={activeTheme}
            onShowToast={(msg, type) => showToast(msg, type)}
            texts={T}
          />
        )}
        {activeTab === 'store' && (
          <Store 
            gold={gameState.gold}
            inventory={gameState.inventory}
            onBuyItem={buyItem}
            onEquipTheme={equipTheme}
            theme={activeTheme}
            habitCount={gameState.habits.length} 
            level={gameState.level} 
            skills={gameState.skills}
            activeTab={activeStoreTab}
            setActiveTab={setActiveStoreTab}
            texts={T}
            lang={lang}
          />
        )}
        {activeTab === 'stats' && (
          <Statistics state={gameState} theme={activeTheme} texts={T} />
        )}
        {activeTab === 'home' && (
          <HomeRoom state={gameState} theme={activeTheme} texts={T} lang={lang} />
        )}

        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className={`fixed pointer-events-none animate-float-up z-[60] ${getFloatingTextStyle(ft.type, activeTheme)}`}
            style={{ left: ft.x, top: ft.y }}
          >
            {ft.text}
          </div>
        ))}
      </main>

      {/* Nav ... */}
      <nav className={`fixed bottom-0 left-0 w-full z-40 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-between items-stretch border-t transition-colors px-2 ${activeTheme === 'dark' ? 'bg-slate-900/95 border-slate-700 text-slate-400' : 'bg-white/95 border-cozy-200 text-cozy-500'}`}>
           <button onClick={() => setActiveTab('habits')} className={navBtnClass(activeTab === 'habits')}>
            <Scroll size={24} /> <span>{T.nav_habits}</span>
          </button>
           <button onClick={() => setActiveTab('skills')} className={navBtnClass(activeTab === 'skills')}>
            <Target size={24} /> <span>{T.nav_skills}</span>
          </button>

          <div className="relative -top-10 flex-shrink-0 w-24 flex justify-center">
             <button onClick={() => setActiveTab('home')} className={`w-[86px] h-[86px] rounded-full flex items-center justify-center shadow-lg border-4 transition-transform ${activeTab === 'home' ? 'scale-110 border-emerald-500' : (activeTheme === 'dark' ? 'border-slate-800' : 'border-white')} ${activeTheme === 'dark' ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-500 text-white'}`}>
                <Armchair size={48} fill="currentColor" strokeWidth={1.5} />
             </button>
          </div>

          <button onClick={() => setActiveTab('store')} className={navBtnClass(activeTab === 'store')}>
            <ShoppingBag size={24} /> <span>{T.nav_store}</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className={navBtnClass(activeTab === 'stats')}>
            <BarChart2 size={24} /> <span>{T.nav_stats}</span>
          </button>
      </nav>

      {/* Dev Tools with Import/Export */}
      <div className="fixed bottom-40 right-4 z-20 flex flex-col gap-2 items-end">
        <button 
          onClick={() => setShowDevTools(!showDevTools)} 
          className={`p-2 sm:p-3 rounded-full shadow-lg transition ${activeTheme === 'minimal' ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-cozy-800 text-white hover:bg-cozy-700'}`}
        >
          <Bug size={24} className="sm:w-[30px] sm:h-[30px]"/>
        </button>

        {showDevTools && (
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-cozy-200 flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-5 text-gray-800 w-48">
             <div className="px-3 py-1 text-xs font-bold text-gray-500 text-center border-b border-gray-100 mb-1">
                {T.dev}
             </div>

             <button onClick={debugAddResources} className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-violet-100 text-violet-800 rounded-lg mb-1 w-full justify-center hover:bg-violet-200">
                <Coins size={14} /> {T.cheat_res}
             </button>

             <button onClick={debugSkipDay} className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-sky-100 text-sky-800 rounded-lg mb-1 w-full justify-center hover:bg-sky-200">
                <Calendar size={14} /> {T.cheat_day}
             </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-toast">
          <div className={`
            px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 max-w-[90vw] whitespace-nowrap overflow-hidden text-ellipsis
            ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'warning' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-white'}
          `}>
            <Info size={16} className="flex-shrink-0" />
            {toast.msg}
          </div>
        </div>
      )}

      {/* Styles ... */}
      <style>{`
        @keyframes toast-enter-exit {
          0% { transform: translate(-50%, 100%); opacity: 0; }
          10% { transform: translate(-50%, -10px); opacity: 1; }
          20% { transform: translate(-50%, 0); opacity: 1; }
          80% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -50px); opacity: 0; }
        }
        .animate-toast {
           animation: toast-enter-exit 3s ease-in-out forwards;
        }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        .animate-float-up {
          animation: float-up 1.5s ease-out forwards;
        }
        @keyframes achievement-slide-in-out {
          0% { transform: translateX(120%); opacity: 0; }
          10% { transform: translateX(0); opacity: 1; }
          90% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .animate-achievement-slide {
           animation: achievement-slide-in-out 4s ease-in-out forwards;
        }
        @keyframes pixel-transition {
            0% { filter: blur(0px) contrast(100%); }
            20% { filter: blur(2px) contrast(150%) brightness(120%); transform: scale(1.01); }
            50% { filter: blur(4px) contrast(200%) brightness(150%); transform: scale(1.02); }
            80% { filter: blur(2px) contrast(150%) brightness(120%); transform: scale(1.01); }
            100% { filter: blur(0px) contrast(100%); transform: scale(1); }
        }
        /* Specific pixel blur for text elements */
        .lang-switching p, 
        .lang-switching span, 
        .lang-switching h1, 
        .lang-switching h2, 
        .lang-switching h3, 
        .lang-switching h4, 
        .lang-switching button, 
        .lang-switching label {
            animation: pixel-transition 0.75s steps(10) forwards;
        }
      `}</style>
    </div>
  );
}
