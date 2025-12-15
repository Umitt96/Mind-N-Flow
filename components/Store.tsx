
import React from 'react';
import { GameState, Theme, DecorationItem, DecorationCategory, SkillCategory, DECORATION_ITEMS, DECORATION_NAMES, CATEGORY_NAMES, STORE_GROUP_NAMES, Language, StoreGroup } from '../types';
import { ShoppingBag, Zap, Shield, Check, Package, Briefcase, FlaskConical, Sparkles, Skull, Home, Lock, Palette, Percent, Armchair, Monitor, Book } from 'lucide-react';

interface StoreProps {
  gold: number;
  inventory: GameState['inventory'];
  onBuyItem: (type: 'template' | 'booster' | 'freeze' | 'theme' | 'potion' | 'decoration', id: string, cost: number, payload: any, e?: React.MouseEvent) => void;
  onEquipTheme: (themeId: Theme) => void;
  theme: Theme;
  habitCount: number;
  level: number;
  skills?: SkillCategory[];
  activeTab: 'bonuses' | 'bundles' | 'decor';
  setActiveTab: (tab: 'bonuses' | 'bundles' | 'decor') => void;
  texts: any;
  lang: Language;
}

// Items that require the table to be owned first
const TABLE_ITEMS = ['pc', 'lamp', 'books', 'coffee', 'agenda'];

const Store: React.FC<StoreProps> = ({ gold, inventory, onBuyItem, theme, habitCount, level, skills = [], activeTab, setActiveTab, texts, lang }) => {
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  const today = new Date().toISOString().split('T')[0];
  const hasBoughtFreezeToday = inventory.lastFreezeDate === today;

  // Social Skill Discount Logic
  const socialSkill = skills.find(s => s.id === 's3');
  const socialLevel = socialSkill ? socialSkill.currentLevel : 0;
  const discountRate = socialLevel === 1 ? 0.05 : socialLevel === 2 ? 0.10 : socialLevel === 3 ? 0.15 : 0;

  const applyDiscount = (price: number) => {
      if (discountRate === 0) return price;
      return Math.floor(price * (1 - discountRate));
  };

  const getDynamicPrice = (base: number, count: number) => {
     return applyDiscount(Math.floor(base * Math.pow(1.1, count)));
  };

  const boosterPrice = getDynamicPrice(300, inventory.xpBoosterBoughtCount || 0);
  const freezePrice = getDynamicPrice(500, inventory.streakFreezeBoughtCount || 0);
  const potionPrice = applyDiscount(200 + (level * 50));

  const getCardClass = (isPurchasedOrOwned: boolean) => {
      if (isMinimal) return "border border-gray-300 p-4 h-full flex flex-col justify-between";
      if (isDark) {
          return isPurchasedOrOwned 
            ? "bg-emerald-900/30 border border-emerald-800 p-4 rounded-xl shadow-sm h-full flex flex-col justify-between"
            : "bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-sm h-full flex flex-col justify-between";
      }
      return isPurchasedOrOwned 
         ? "bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm h-full flex flex-col justify-between"
         : "bg-white border border-cozy-200 p-4 rounded-xl shadow-sm h-full flex flex-col justify-between";
  };

  const textHeadClass = isMinimal ? "font-bold text-black" : isDark ? "font-bold text-slate-100" : "font-bold text-cozy-900";
  const textSubClass = isMinimal ? "text-xs text-gray-500" : isDark ? "text-xs text-slate-400" : "text-xs text-cozy-600";
  
  // Dynamic Template Generation based on current language
  const TEMPLATES = [
    {
      id: 'dopamine_detox',
      name: texts.pack_dopamine,
      cost: applyDiscount(300),
      description: texts.pack_dopamine_desc,
      habits: [
        { id: crypto.randomUUID(), name: texts.bundle_habits['no_screen'], type: 'good', difficulty: 'medium' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['doomscroll'], type: 'bad', difficulty: 'medium' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['gaming'], type: 'bad', difficulty: 'hard' }, 
      ]
    },
    {
      id: 'fit_life',
      name: texts.pack_fit,
      cost: applyDiscount(250),
      description: texts.pack_fit_desc,
      habits: [
        { id: crypto.randomUUID(), name: texts.bundle_habits['walk'], type: 'good', difficulty: 'medium' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['sleep'], type: 'good', difficulty: 'medium' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['soda'], type: 'bad', difficulty: 'medium' },
      ]
    },
    {
      id: 'deep_focus',
      name: texts.pack_focus,
      cost: applyDiscount(500),
      description: texts.pack_focus_desc,
      habits: [
        { id: crypto.randomUUID(), name: texts.bundle_habits['work'], type: 'good', difficulty: 'hard' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['break_focus'], type: 'bad', difficulty: 'hard' },
      ]
    },
    {
      id: 'explorer_bag',
      name: texts.pack_explorer,
      cost: applyDiscount(350),
      description: texts.pack_explorer_desc,
      habits: [
        { id: crypto.randomUUID(), name: texts.bundle_habits['content'], type: 'good', difficulty: 'easy' },
        { id: crypto.randomUUID(), name: texts.bundle_habits['english'], type: 'good', difficulty: 'medium' },
      ]
    },
  ].sort((a, b) => a.cost - b.cost); // Sorted by Cost

  const CONSUMABLES = [
    {
      id: 'xp_booster',
      type: 'booster',
      name: texts.item_booster,
      cost: boosterPrice,
      icon: <Zap className={isMinimal ? "text-black" : "text-amber-500"} />,
      description: texts.item_booster_desc,
    },
    {
      id: 'streak_freeze',
      type: 'freeze',
      name: texts.item_freeze,
      cost: freezePrice,
      icon: <Shield className={isMinimal ? "text-black" : "text-sky-500"} />,
      description: texts.item_freeze_desc,
    },
    {
      id: 'xp_potion',
      type: 'potion',
      name: texts.item_potion,
      cost: potionPrice,
      icon: <FlaskConical className={isMinimal ? "text-black" : "text-purple-500"} />,
      description: texts.item_potion_desc,
    }
  ];

  // Show all decorations if tab is 'decor'
  const DECOR_ITEMS_DISPLAY = activeTab === 'decor' 
      ? DECORATION_ITEMS.sort((a, b) => a.price - b.price)
      : [];

  const hasTable = inventory.ownedDecorations.includes('DEK_TABLE');

  const getTabClass = (tabId: string) => `flex-1 px-3 py-2 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-b-2 transition whitespace-nowrap ${activeTab === tabId ? 'border-emerald-500 text-emerald-600' : 'border-transparent opacity-50'}`;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <ShoppingBag className={isMinimal ? "text-black" : "text-cozy-600"} size={28} />
            <div>
            <h2 className={`text-2xl font-serif ${textHeadClass}`}>{texts.store_title}</h2>
            <div className="flex items-center gap-2">
                <p className={textSubClass}>{texts.store_desc}</p>
                {discountRate > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                        <Percent size={10}/> {Math.round(discountRate * 100)} {texts.discount_active}
                    </span>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto w-full no-scrollbar">
         <button onClick={() => setActiveTab('bundles')} className={getTabClass('bundles')}>
            <Package size={16}/> {texts.tab_bundles}
         </button>
         <button onClick={() => setActiveTab('bonuses')} className={getTabClass('bonuses')}>
            <Briefcase size={16}/> {texts.tab_bonuses}
         </button>
         <button onClick={() => setActiveTab('decor')} className={getTabClass('decor')}>
            <Palette size={16}/> {texts.tab_decor}
         </button>
      </div>

      {activeTab === 'bonuses' && (
      <section className="animate-in fade-in slide-in-from-bottom-2">
        <div className="mb-3">
          <p className={`${textSubClass} opacity-80 max-w-lg`}>
             {texts.bonuses_desc}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CONSUMABLES.map(item => {
            const isFreeze = item.type === 'freeze';
            const disableBuy = gold < item.cost || (isFreeze && hasBoughtFreezeToday);
            
            return (
              <div key={item.id} className={getCardClass(false)}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${isMinimal ? 'bg-gray-100' : isDark ? 'bg-slate-700' : 'bg-cozy-100'}`}>{item.icon}</div>
                    <span className={`font-bold text-sm ${isMinimal ? 'text-black' : 'text-amber-700'}`}>{item.cost} G</span>
                  </div>
                  <h4 className={textHeadClass}>{item.name}</h4>
                  <p className={textSubClass}>{item.description}</p>
                </div>
                <button
                  onClick={(e) => onBuyItem(item.type as any, item.id, item.cost, {}, e)}
                  disabled={disableBuy}
                  className={`mt-4 w-full py-2 text-sm font-bold transition active:scale-95 rounded-lg
                    ${isMinimal 
                      ? (disableBuy ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800')
                      : (disableBuy ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 shadow')
                    }
                  `}
                >
                  {isFreeze && hasBoughtFreezeToday ? 'Yarın Gel' : texts.buy}
                </button>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {activeTab === 'bundles' && (
      <section className="animate-in fade-in slide-in-from-bottom-2">
        <div className="mb-3">
          <p className={`${textSubClass} opacity-80 max-w-lg`}>
             {texts.bundles_desc}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map(tmpl => {
            const isPurchased = inventory.purchasedTemplates.includes(tmpl.id);
            const willExceedLimit = habitCount + tmpl.habits.length > 8;
            const disabled = gold < tmpl.cost || isPurchased || willExceedLimit;

            return (
              <div key={tmpl.id} className={`${getCardClass(isPurchased)} ${isPurchased ? 'opacity-80' : ''}`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className={textHeadClass}>{tmpl.name}</h4>
                    {!isPurchased && <span className={`font-bold text-sm ${isMinimal ? 'text-black' : 'text-amber-700'}`}>{tmpl.cost} G</span>}
                  </div>
                  <p className={`${textSubClass} mb-4`}>{tmpl.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tmpl.habits.map((h, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border 
                        ${h.type === 'good' 
                           ? (isDark ? 'bg-emerald-900/40 border-emerald-800 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-800')
                           : (isDark ? 'bg-rose-900/40 border-rose-800 text-rose-400' : 'bg-rose-100 border-rose-200 text-rose-800')
                        } ${isMinimal ? 'bg-white border-black text-black' : ''}`}>
                          {h.type === 'good' ? <Sparkles size={10} /> : <Skull size={10} />}
                          {h.name}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => onBuyItem('template', tmpl.id, tmpl.cost, { habits: tmpl.habits }, e)}
                  disabled={disabled}
                  className={`w-full py-2 text-sm font-bold transition flex items-center justify-center gap-2 mt-auto active:scale-95 rounded-lg
                    ${isPurchased
                       ? (isMinimal ? 'bg-transparent text-gray-400 border border-gray-200' : 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200')
                       : isMinimal 
                         ? (!disabled ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400')
                         : (!disabled ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow' : 'bg-stone-200 text-stone-400 cursor-not-allowed')
                    }
                  `}
                >
                  {isPurchased ? <><Check size={14}/> {texts.bought}</> : willExceedLimit ? texts.limit_reached : texts.buy}
                </button>
              </div>
            );
          })}
        </div>
      </section>
      )}

      {activeTab === 'decor' && (
          <section className="animate-in fade-in slide-in-from-bottom-2">
            <div className="mb-3">
              <p className={`${textSubClass} opacity-80 max-w-lg`}>
                {texts.decor_desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {DECOR_ITEMS_DISPLAY.map(item => {
                  const isOwned = inventory.ownedDecorations.includes(item.id);
                  const isActive = inventory.activeDecorations[item.category] === item.id;
                  
                  // Skill Check
                  let isLocked = false;
                  let lockReason = "";
                  
                  if (item.requiredSkillId && item.requiredSkillLevel) {
                      const skill = skills.find(s => s.id === item.requiredSkillId);
                      if (!skill || skill.currentLevel < item.requiredSkillLevel) {
                          isLocked = true;
                          if (skill && skill.levelNames && skill.levelNames.length >= item.requiredSkillLevel) {
                              const levelName = skill.levelNames[item.requiredSkillLevel - 1];
                              // Localized lock reason with suffix
                              lockReason = `${levelName} ${texts.skill_req_suffix}`;
                          } else {
                              lockReason = "Skill locked";
                          }
                      }
                  }

                  // Table Check
                  if (!isLocked && TABLE_ITEMS.includes(item.category) && !hasTable) {
                      isLocked = true;
                      lockReason = texts.lock_reason_masa;
                  }

                  const finalPrice = applyDiscount(item.price);
                  const canBuy = gold >= finalPrice && !isLocked;
                  const localizedName = DECORATION_NAMES[item.id]?.[lang] || item.name;
                  const localizedGroupName = STORE_GROUP_NAMES[item.storeGroup]?.[lang] || item.storeGroup;

                  return (
                      <div key={item.id} className={`${getCardClass(isOwned)} ${isLocked ? 'opacity-70 grayscale-[0.8]' : ''}`}>
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className={textHeadClass}>{localizedName}</h4>
                                <span className="text-[10px] uppercase font-bold text-gray-400">{localizedGroupName}</span>
                             </div>
                             
                             {/* Show price even if locked or owned */}
                             {!isOwned && (
                                <span className={`font-bold text-sm ${isMinimal ? 'text-black' : 'text-amber-700'} ${isLocked ? 'opacity-60' : ''}`}>{finalPrice} G</span>
                             )}
                          </div>

                          <div className="mt-4">
                             {isLocked ? (
                                 <div className="flex items-center gap-2 text-rose-500 text-xs font-bold border border-rose-200 bg-rose-50 p-2 rounded">
                                     <Lock size={12} className="flex-shrink-0"/> {lockReason}
                                 </div>
                             ) : isOwned ? (
                                 <button 
                                   onClick={(e) => onBuyItem('decoration', item.id, 0, { category: item.category }, e)}
                                   className={`w-full py-2 text-sm font-bold rounded-lg transition flex items-center justify-center gap-2 ${isActive 
                                      ? (isDark ? 'bg-slate-700 border border-slate-600 text-slate-400' : 'bg-white border border-gray-300 text-gray-400 hover:bg-gray-50')
                                      : (isDark ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm')}`}
                                 >
                                    {isActive ? <Check size={14}/> : <Home size={14}/>}
                                    {isActive ? texts.using : texts.use}
                                 </button>
                             ) : (
                                 <button 
                                   onClick={(e) => onBuyItem('decoration', item.id, finalPrice, { category: item.category }, e)}
                                   disabled={!canBuy}
                                   className={`w-full py-2 text-sm font-bold rounded-lg transition ${canBuy 
                                      ? (isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm') 
                                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                                 >
                                    {texts.buy}
                                 </button>
                             )}
                          </div>
                      </div>
                  )
               })}
            </div>
          </section>
      )}

    </div>
  );
};

export default Store;
