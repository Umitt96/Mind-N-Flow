
import React, { useState, useEffect } from 'react';
import { SkillCategory, Theme } from '../types';
import { 
  KeyRound, Star, 
  Dumbbell, Brain, Users, Briefcase, Palette, Coins, 
  Heart, Book, Coffee, Sun, Moon, Music, Camera, 
  Code, Cpu, Globe, Anchor, Feather, Map, Rocket, 
  Sword, Shield, Gamepad, Gift, Zap
} from 'lucide-react';

interface SkillTreeManagerProps {
  skills: SkillCategory[];
  perkPoints: number;
  onUpgradeSkill: (skillId: string, e: React.MouseEvent) => void;
  onAddSkill: (skill: SkillCategory) => void;
  onEditSkill: (skill: SkillCategory) => void;
  onDeleteSkill: (skillId: string) => void;
  theme: Theme;
  onShowToast: (msg: string, type: 'info' | 'success' | 'warning') => void;
  texts: any;
}

const ICON_MAP: Record<string, React.ElementType> = {
  dumbbell: Dumbbell, brain: Brain, users: Users, briefcase: Briefcase, palette: Palette, coins: Coins,
  heart: Heart, book: Book, coffee: Coffee, sun: Sun, moon: Moon, star: Star, music: Music, camera: Camera,
  code: Code, cpu: Cpu, globe: Globe, anchor: Anchor, feather: Feather, key: KeyRound, map: Map, rocket: Rocket,
  sword: Sword, shield: Shield, gamepad: Gamepad, gift: Gift, zap: Zap
};

const SkillTreeManager: React.FC<SkillTreeManagerProps> = ({
  skills, perkPoints, onUpgradeSkill, theme, onShowToast, texts
}) => {
  const [upgradedId, setUpgradedId] = useState<string | null>(null);
  
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';

  useEffect(() => {
    if (upgradedId) {
      const timer = setTimeout(() => setUpgradedId(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [upgradedId]);

  const handleUpgradeClick = (skillId: string, e: React.MouseEvent) => {
      setUpgradedId(skillId);
      onUpgradeSkill(skillId, e);
  };

  const getBonusText = (id: string, level: number) => {
      if (level === 0) return null; // Hide if not unlocked

      let text = "Stat Boost";
      
      if (id === 's1') text = `+${level * 25} ${texts.bonus_hp}`;
      else if (id === 's3') text = `%${level * 5} ${texts.bonus_discount}`; 
      else if (id === 's4') text = `+${level === 1 ? 10 : level === 2 ? 25 : 50}% ${texts.bonus_xp}`; 
      else if (id === 's6') text = `+${level * 15}% ${texts.bonus_gold}`; 

      return (
          <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold border mb-1 ${isMinimal ? 'border-black' : isDark ? 'bg-slate-700 border-slate-600 text-sky-300' : 'bg-cozy-100 border-cozy-300 text-cozy-800'}`}>
              {text}
          </div>
      );
  };

  const textMain = isMinimal ? "text-black" : isDark ? "text-slate-100" : "text-cozy-900";
  const textSub = isMinimal ? "text-gray-600" : isDark ? "text-slate-400" : "text-cozy-600";

  return (
    <div className="p-4 max-w-5xl mx-auto flex flex-col pb-24">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h2 className={`text-2xl font-serif font-bold ${textMain}`}>{texts.skills_title}</h2>
           <p className={`text-sm ${textSub}`}>{texts.skills_desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(skill => {
           const IconComp = ICON_MAP[skill.icon] || Star;
           const isMaxed = skill.currentLevel >= 3;
           const cost = isMaxed ? 0 : 1;
           const canAfford = perkPoints >= cost;
           const currentLevelName = skill.currentLevel === 0 ? '' : skill.levelNames[skill.currentLevel - 1];
           const isJustUpgraded = upgradedId === skill.id;

           let cardBg = isMaxed 
                ? (isMinimal ? 'bg-green-50 border border-black' : isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50/50 border border-emerald-200 shadow-sm')
                : (isMinimal ? 'bg-white border border-black' : isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-cozy-200 shadow-sm');
           
           if (isJustUpgraded) {
               cardBg += isDark ? ' ring-4 ring-emerald-500/50 bg-emerald-900/40' : ' ring-4 ring-yellow-400 bg-yellow-50';
           }

           const iconBg = isMinimal 
                ? 'bg-black text-white' 
                : isDark 
                    ? 'bg-slate-700 text-emerald-400' 
                    : 'bg-cozy-100 text-cozy-700';

           const activeBar = isMinimal 
                ? 'bg-black' 
                : isDark 
                    ? 'bg-emerald-500' 
                    : 'bg-cozy-500';

           return (
             <div key={skill.id} className={`p-3 rounded-xl flex flex-col ${cardBg} relative group transition-all duration-300 ${isJustUpgraded ? 'scale-[1.02]' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                   <div className={`p-2 rounded-full ${iconBg} flex-shrink-0 transition-transform ${isJustUpgraded ? 'scale-110 rotate-12' : ''}`}>
                      <IconComp size={20} />
                   </div>
                   
                   <div className="flex-1">
                       <div className="flex items-baseline gap-2 flex-wrap">
                           <h3 className={`font-bold text-base ${textMain}`}>{skill.name}</h3>
                           <span className={`text-xs ${textSub} opacity-80`}>{currentLevelName ? `- ${currentLevelName}` : ''}</span>
                       </div>
                   </div>
                </div>

                <div className="flex flex-col gap-1 w-full mb-3">
                    <div className="flex justify-between items-end min-h-[24px]">
                        <div></div> {/* Spacer */}
                        {getBonusText(skill.id, skill.currentLevel)}
                    </div>
                    
                    {/* Progress Bars - Increased Height */}
                    <div className="flex gap-1 h-2.5 w-full opacity-80">
                        {[1,2,3].map(lvl => (
                            <div key={lvl} className={`flex-1 h-full rounded-full transition-all duration-500 ${skill.currentLevel >= lvl ? activeBar : (isDark ? 'bg-slate-700' : 'bg-gray-200')}`}></div>
                        ))}
                    </div>
                </div>

                <div>
                   {!isMaxed ? (
                      <button 
                        onClick={(e) => canAfford && handleUpgradeClick(skill.id, e)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95
                           ${canAfford 
                              ? (isMinimal ? 'bg-black text-white' : (isDark ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm')) 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                      >
                         <span>{texts.upgrade}</span>
                         <span className="flex items-center gap-0.5"><KeyRound size={10}/> {cost}</span>
                      </button>
                   ) : (
                      <div className={`w-full py-1.5 text-center text-xs font-bold rounded-lg ${isMinimal ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                         {texts.maxed}
                      </div>
                   )}
                </div>
             </div>
           )
        })}
      </div>
    </div>
  );
};

export default SkillTreeManager;
