
export type HabitType = 'good' | 'bad';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Theme = 'cozy' | 'dark' | 'minimal';
export type Language = 'tr' | 'en';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  difficulty: Difficulty;
  templateId?: string; // Track which template this belongs to
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string; 
  currentLevel: number; 
  costs: [number, number, number]; 
  levelNames: [string, string, string]; 
}

// Expanded categories so items don't overwrite each other in inventory logic
export type DecorationCategory = 
  | 'wall_base' 
  | 'floor_base' 
  | 'rug' 
  | 'table' 
  | 'chair' 
  | 'shelf' 
  | 'board' 
  | 'pc'
  | 'lamp'
  | 'coffee'
  | 'agenda'
  | 'books'
  | 'mascot'; 

// New grouping for Store UI
export type StoreGroup = 'furniture' | 'electronics' | 'decoration' | 'stationery';

export interface DecorationItem {
  id: string;
  name: string; 
  category: DecorationCategory;
  storeGroup: StoreGroup; // New grouping property
  price: number;
  requiredSkillId?: string; 
  requiredSkillLevel?: number; 
}

// Localization Data for Decorations (Name mapping)
export const DECORATION_NAMES: Record<string, { tr: string, en: string }> = {
    'DEK001': { tr: "Düz Renk Duvar", en: "Solid Color Wall" },
    'DEK002': { tr: "Ahşap Zemin", en: "Wooden Floor" },
    'DEK_COFFEE': { tr: "Sıcak Kahve", en: "Hot Coffee" },
    'DEK_AGENDA': { tr: "Ajanda & Kalem", en: "Agenda & Pen" },
    'DEK_TABLE': { tr: "Çalışma Masası", en: "Work Desk" },
    'DEK_BOOKS': { tr: "Kitap Seti", en: "Book Set" },
    'DEK_LAMP': { tr: "Masa Lambası", en: "Desk Lamp" },
    'DEK_RUG': { tr: "Yumuşak Halı", en: "Soft Rug" },
    'DEK_SHELF': { tr: "Duvar Rafı", en: "Wall Shelf" },
    'DEK_BOARD': { tr: "Hedef Tahtası", en: "Vision Board" },
    'DEK_CHAIR': { tr: "Rahat Sandalye", en: "Comfy Chair" },
    'DEK_PC': { tr: "Laptop", en: "Laptop" },
};

export const CATEGORY_NAMES: Record<DecorationCategory, { tr: string, en: string }> = {
    'wall_base': { tr: "Duvar", en: "Wall" },
    'floor_base': { tr: "Zemin", en: "Floor" },
    'rug': { tr: "Halı", en: "Rug" },
    'table': { tr: "Masa", en: "Table" },
    'chair': { tr: "Sandalye", en: "Chair" },
    'shelf': { tr: "Raf", en: "Shelf" },
    'board': { tr: "Pano", en: "Board" },
    'pc': { tr: "PC", en: "PC" },
    'lamp': { tr: "Lamba", en: "Lamp" },
    'coffee': { tr: "Kahve", en: "Coffee" },
    'agenda': { tr: "Ajanda", en: "Agenda" },
    'books': { tr: "Kitaplar", en: "Books" },
    'mascot': { tr: "Maskot", en: "Mascot" },
};

export const STORE_GROUP_NAMES: Record<StoreGroup, { tr: string, en: string }> = {
    'furniture': { tr: "Mobilya", en: "Furniture" },
    'electronics': { tr: "Elektronik", en: "Electronics" },
    'decoration': { tr: "Dekoratif", en: "Decorative" },
    'stationery': { tr: "Kırtasiye", en: "Stationery" },
};

export const DECORATION_ITEMS: DecorationItem[] = [
    // Base Room
    { id: 'DEK001', name: "Düz Renk Duvar", category: "wall_base", storeGroup: 'decoration', price: 50 },
    { id: 'DEK002', name: "Ahşap Zemin", category: "floor_base", storeGroup: 'decoration', price: 50 },
    
    // LOW TIER 
    { id: 'DEK_COFFEE', name: "Sıcak Kahve", category: "coffee", storeGroup: 'decoration', price: 50 },
    { id: 'DEK_AGENDA', name: "Ajanda & Kalem", category: "agenda", storeGroup: 'stationery', price: 100 },
    { id: 'DEK_TABLE', name: "Çalışma Masası", category: "table", storeGroup: 'furniture', price: 250, requiredSkillId: 's4', requiredSkillLevel: 1 }, 
    
    // MID TIER 
    { id: 'DEK_BOOKS', name: "Kitap Seti", category: "books", storeGroup: 'stationery', price: 300 },
    { id: 'DEK_LAMP', name: "Masa Lambası", category: "lamp", storeGroup: 'electronics', price: 400, requiredSkillId: 's2', requiredSkillLevel: 1 }, 
    { id: 'DEK_RUG', name: "Yumuşak Halı", category: "rug", storeGroup: 'decoration', price: 500, requiredSkillId: 's5', requiredSkillLevel: 1 }, 
    
    // HIGH TIER
    { id: 'DEK_SHELF', name: "Duvar Rafı", category: "shelf", storeGroup: 'decoration', price: 750, requiredSkillId: 's6', requiredSkillLevel: 1 }, 
    { id: 'DEK_BOARD', name: "Hedef Tahtası", category: "board", storeGroup: 'decoration', price: 1000, requiredSkillId: 's4', requiredSkillLevel: 2 },
    { id: 'DEK_CHAIR', name: "Rahat Sandalye", category: "chair", storeGroup: 'furniture', price: 1500, requiredSkillId: 's1', requiredSkillLevel: 2 }, 
    { id: 'DEK_PC', name: "Laptop", category: "pc", storeGroup: 'electronics', price: 3000, requiredSkillId: 's2', requiredSkillLevel: 2 }, 
];

export interface Inventory {
  xpBoosterCharges: number;
  xpBoosterBoughtCount: number; // For inflation
  xpBoosterUsedCount: number; // For achievement
  streakFreeze: number; 
  streakFreezeBoughtCount: number; // For inflation
  ownedThemes: string[];
  purchasedTemplates: string[];
  templateExpiryDates: Record<string, string>; // templateId -> ISO Date String
  activeTheme: Theme;
  activeFont?: string; // Default: font-sans
  lastFreezeDate: string | null;
  
  // Home Decoration
  ownedDecorations: string[]; // List of item IDs
  activeDecorations: Partial<Record<DecorationCategory, string | null>>; // Currently equipped items
}

export interface GameState {
  hp: number;
  maxHp: number;
  xp: number;
  xpToNextLevel: number;
  level: number;
  perkPoints: number; // Now referred to as "Keys" in UI
  gold: number; 
  habits: Habit[];
  skills: SkillCategory[];
  lastResetDate: string | null;
  lastLoginDate: string | null;
  loginStreak: number;
  simulatedDate: string; 
  inventory: Inventory;
  history: Record<string, string[]>;
  unlockedAchievements: string[]; 
  language: Language;
}

// Updated Leveling Curve - Flatter after lvl 15
export const LEVEL_THRESHOLDS = [
  30, 40, 50, 80, 100, 120, 150, 180, 200, 250, 
  300, 400, 500, 750, 1000, 1250, 1500, 2000
];

export const getXpForLevel = (level: number) => {
  if (level <= 0) return 30;
  if (level > LEVEL_THRESHOLDS.length) return 2000 + ((level - LEVEL_THRESHOLDS.length) * 100);
  return LEVEL_THRESHOLDS[level - 1];
};

export const SKILL_DATA: Record<Language, Record<string, {name: string, levels: [string, string, string]}>> = {
  tr: {
    s1: { name: 'Fiziksel', levels: ['Zinde Vücut', 'Güçlü Kaslar', 'Atletik Performans'] },
    s2: { name: 'Zihinsel', levels: ['Odaklanma', 'Hızlı Okuma', 'Derin Analiz'] },
    s3: { name: 'Sosyal', levels: ['İyi Dinleyici', 'Etkili İletişim', 'Liderlik'] },
    s4: { name: 'Kariyer', levels: ['Çırak', 'Kalfa', 'Usta'] },
    s5: { name: 'Yaratıcı', levels: ['İlham Perisi', 'Sanatkar', 'Vizyoner'] },
    s6: { name: 'Finansal', levels: ['Tasarrufçu', 'Yatırımcı', 'Finansal Özgürlük'] },
  },
  en: {
    s1: { name: 'Physical', levels: ['Fit Body', 'Strong Muscles', 'Athletic Performance'] },
    s2: { name: 'Mental', levels: ['Focus', 'Speed Reading', 'Deep Analysis'] },
    s3: { name: 'Social', levels: ['Good Listener', 'Effective Comms', 'Leadership'] },
    s4: { name: 'Career', levels: ['Apprentice', 'Journeyman', 'Master'] },
    s5: { name: 'Creative', levels: ['Muse', 'Artisan', 'Visionary'] },
    s6: { name: 'Financial', levels: ['Saver', 'Investor', 'Financial Freedom'] },
  }
};

export const TRANSLATIONS = {
  tr: {
    nav_habits: "Görevler",
    nav_skills: "Yetenekler",
    nav_store: "Mağaza",
    nav_stats: "Analiz",
    stats_panel: "Analiz Paneli",
    stats_desc: "Gelişimini takip etmek için istatistiksel görünümlere bak.",
    streak_title: "Günlük Seri",
    next_reward: "Sonraki Ödül",
    activity_chart: "Aktivite Yoğunluğu",
    week: "Hafta",
    month: "Ay",
    distribution: "Dağılım",
    good: "İyi",
    bad: "Kötü",
    streak_status: "Seri Durumları",
    no_habits: "Henüz alışkanlık eklenmemiş.",
    day_streak: "Gün Seri",
    home_title: "Yuvam",
    home_desc: "Gelişiminin yansıması.",
    store_title: "Mağaza",
    store_desc: "Gelişimini hızlandır ve yuvanı kur.",
    discount_active: "İndirim Aktif",
    tab_bundles: "Paketler",
    tab_bonuses: "Bonuslar",
    tab_decor: "Eşyalar",
    bundles_desc: "Alışkanlık aklına gelmiyor mu? Öyleyse bu paketleri dene!",
    bonuses_desc: "Sana anlık avantaj sağlayan tüketilebilir eşyalar.",
    decor_desc: "Odanı kişiselleştir. Nadir eşyalar belirli yetenek seviyeleri gerektirir.",
    buy: "Satın Al",
    bought: "Satın Alındı",
    use: "Kullan",
    using: "Kullanılıyor",
    limit_reached: "Limit Dolu",
    lock_reason_pre: "Önce",
    lock_reason_masa: "Masa Al",
    skill_req_suffix: "yeteneği gerekli",
    skills_title: "Yetenek Ağacı",
    skills_desc: "Kazandığın anahtarlarla yeni özelliklerin kilidini aç.",
    upgrade: "Yükselt",
    maxed: "Tamamlandı",
    bonus_hp: "Max HP",
    bonus_discount: "indirim",
    bonus_xp: "XP artışı",
    bonus_gold: "Altın artışı",
    habit_list: "Takip Listesi",
    new_habit: "Yeni Alışkanlık",
    no_active_habits: "Aktif alışkanlık yok.",
    basic_habits: "Temel Alışkanlıklar",
    days_left: "gün kaldı",
    today_ends: "Bugün bitiyor!",
    edit_habit: "Alışkanlığı Düzenle",
    create_habit: "Yeni Alışkanlık",
    habit_name: "Alışkanlık Adı",
    habit_type: "Tür",
    habit_diff: "Zorluk",
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
    cancel: "İptal",
    save: "Kaydet",
    effect: "Etki",
    settings: "Ayarlar",
    about: "Hakkında",
    dev: "Geliştirici",
    themes: "Temalar",
    themes_cozy: "Varsayılan",
    themes_dark: "Koyu",
    themes_minimal: "Sade",
    language: "Dil",
    data: "Veriler",
    download_save: "Yedeği İndir",
    upload_save: "Yedek Yükle",
    reset_data: "Tüm Verileri Sıfırla",
    reset_confirm: "DİKKAT: Tüm ilerlemen silinecek. Emin misin?",
    repair_history: "Geçmişi Onar",
    repair_desc: "Seri Kurtarma İksiri kullanarak geçmişteki hatalı bir günü 'Mükemmel' olarak işaretleyebilirsin.",
    repair_btn: "Onar",
    revive_title: "BAYILDIN!",
    revive_desc: "Enerjin tükendi. Görevlerini yapmaya devam etmek için iyileşmen gerekiyor.",
    revive_btn: "Dirilme İksiri İç",
    free: "Bu seferlik bedava",
    cost: "Maliyet",
    level_up: "Seviye Atladın!",
    level: "Seviye",
    gold: "Altın",
    cheat_res: "+500 Kaynak",
    cheat_day: "Gün Atla",
    day_skipped: "Gün Atlandı!",
    item_booster: "XP Artırıcı (x2)",
    item_booster_desc: "Sonraki 4 görevde 2 kat XP.",
    item_freeze: "Seri Kurtarma",
    item_freeze_desc: "Günde maks 1 adet.",
    item_potion: "Tecrübe İksiri",
    item_potion_desc: "Anında XP kazan.",
    pack_dopamine: "Dopamin Detoksu",
    pack_dopamine_desc: "Zihnini arındır.",
    pack_fit: "Fit Yaşam",
    pack_fit_desc: "Bedenine iyi bak.",
    pack_focus: "Derin Odaklanma",
    pack_focus_desc: "Maksimum verim.",
    pack_explorer: "Kaşifin Çantası",
    pack_explorer_desc: "Yeni ufuklar.",
    bundle_habits: {
      no_screen: "Sabah Ekrana Bakma",
      doomscroll: "Yatakta Kaydırma",
      gaming: "Oyun Oynamak",
      walk: "30 Dk Yürüyüş",
      sleep: "7 Saat Uyku",
      soda: "Asitli İçecek",
      work: "4 Saat Çalışma",
      break_focus: "Odağı Bozmak",
      content: "Yabancı İçerik",
      english: "İngilizce Pratik"
    },
    achievements: {
        first_step: { name: "İlk Adım", desc: "İlk alışkanlığını ekle." },
        quick_learner: { name: "Roket Takıldı", desc: "1 kere XP Artırıcı kullan." },
        survivor: { name: "Hayatta Kalan", desc: "1 kere Seri Kurtarma al." },
        worth_trying: { name: "Deneyelim Bakalım", desc: "Mağazadan bir alışkanlık paketi al." },
        clean_room: { name: "Odam Kireç Tutmuyor", desc: "Düz renk duvar kullan." },
        anti_discipline: { name: "Anti Disiplin", desc: "Kötü bir alışkanlığı 3 gün devam ettir." },
        red_line: { name: "Kırmızı Çizgi", desc: "Kötü bir alışkanlığı 7 gün boyunca yapma." },
        habit_theory: { name: "Alışkanlık Teorisi", desc: "21 gün seriye ulaş." },
        midas: { name: "Zengin Müteahit", desc: "1000 Altına ulaş." },
        this_year: { name: "Bu Sene O Sene", desc: "Hedef Tahtası satın al." },
        hercules: { name: "Arnold", desc: "Fiziksel yetenekleri tamamla." },
        stonks: { name: "Stonks 📈", desc: "Finansal yetenekleri tamamla." },
        bargain_hunter: { name: "Sıkı Pazarlıkçı", desc: "Sosyal yeteneğini tamamla." },
        da_vinci: { name: "Leonardo Da Vinci", desc: "Tüm yetenekleri en az Seviye 1 yap." },
        wise: { name: "Yaşlı Adam", desc: "5 tane XP Artırıcı biriktir." },
        symmetry: { name: "Simetri Hastası", desc: "İyi ve Kötü alışkanlık sayısı eşit olsun." },
        perfect: { name: "Tanrı Modu", desc: "Tüm yetenekleri fulle." },
        meticulous: { name: "Titiz Bir İnsan", desc: "Tüm eşyaları satın al ve kullan." },
        curious_mind: { name: "Ne olmasını bekliyorsun?", desc: "Geliştiricinin adına 5 kez tıkla." },
        game_over: { name: "Bitti Sanırım", desc: "Diğer tüm başarımları tamamla." },
    },
    features_list: [
        "Kişiselleştirilebilir alışkanlık takibi.",
        "Deneyim puanı (XP) ve Seviye sistemi.",
        "Can puanı (HP) ile disiplin yönetimi.",
        "Altın biriktirme ve Mağaza ekonomisi.",
        "Detaylı Yetenek Ağacı ve bonuslar.",
        "Özelleştirilebilir, yaşayan bir oda (Yuva).",
        "Seri (Streak) takibi ve rozetler.",
        "Detaylı istatistik ve analiz grafikleri."
    ],
    regret_messages: [
        "Bir dahakine iradene sahip çık.",
        "Bu sana yakışmadı, toparlan!",
        "Hata yapmak insana mahsus, tekrar yapmamak sana.",
        "Kısa vadeli haz, uzun vadeli pişmanlıktır.",
        "Hedeflerini hatırla, pes etme.",
        "Yarın daha güçlü olacaksın.",
        "Bu sadece küçük bir tökezleme, yola devam.",
        "Kendine karşı dürüst ol, bunu yapmamalıydın."
    ],
    congrat_messages: [
        "Mükemmel bir gün! Harikasın.",
        "Disiplin özgürlüktür, bugün kanıtladın.",
        "İraden çelik gibi!",
        "Bugünü fethettin şampiyon.",
        "Durmak yok, yola devam!",
        "Başarı alışkanlıktır, sen başardın.",
        "Yatağa gururla gitme vakti.",
        "Kendine yaptığın yatırımın karşılığını alıyorsun.",
        "Efsanevi performans!",
        "Bugün tarih yazdın."
    ]
  },
  en: {
    nav_habits: "Habits",
    nav_skills: "Skills",
    nav_store: "Store",
    nav_stats: "Stats",
    stats_panel: "Analytics Panel",
    stats_desc: "Check statistical views to track your progress.",
    streak_title: "Daily Streak",
    next_reward: "Next Reward",
    activity_chart: "Activity Intensity",
    week: "Week",
    month: "Month",
    distribution: "Distribution",
    good: "Good",
    bad: "Bad",
    streak_status: "Streak Status",
    no_habits: "No habits added yet.",
    day_streak: "Day Streak",
    home_title: "My Home",
    home_desc: "Reflection of your progress.",
    store_title: "Store",
    store_desc: "Accelerate progress and build your home.",
    discount_active: "Discount Active",
    tab_bundles: "Bundles",
    tab_bonuses: "Bonuses",
    tab_decor: "Decor",
    bundles_desc: "Can't think of a habit? Try these bundles!",
    bonuses_desc: "Consumable items that give instant advantages.",
    decor_desc: "Customize your room. Rare items require specific skill levels.",
    buy: "Buy",
    bought: "Owned",
    use: "Equip",
    using: "Equipped",
    limit_reached: "Limit Reached",
    lock_reason_pre: "Buy",
    lock_reason_masa: "Table First",
    skill_req_suffix: "skill required",
    skills_title: "Skill Tree",
    skills_desc: "Unlock new features with keys you earn.",
    upgrade: "Upgrade",
    maxed: "Maxed",
    bonus_hp: "Max HP",
    bonus_discount: "discount",
    bonus_xp: "XP boost",
    bonus_gold: "Gold boost",
    habit_list: "Tracker List",
    new_habit: "New Habit",
    no_active_habits: "No active habits.",
    basic_habits: "Basic Habits",
    days_left: "days left",
    today_ends: "Ends today!",
    edit_habit: "Edit Habit",
    create_habit: "New Habit",
    habit_name: "Habit Name",
    habit_type: "Type",
    habit_diff: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    cancel: "Cancel",
    save: "Save",
    effect: "Effect",
    settings: "Settings",
    about: "About",
    dev: "Developer",
    themes: "Themes",
    themes_cozy: "Default",
    themes_dark: "Dark",
    themes_minimal: "Minimalist",
    language: "Language",
    data: "Data",
    download_save: "Download Save",
    upload_save: "Upload Save",
    reset_data: "Reset All Data",
    reset_confirm: "WARNING: All progress will be lost. Are you sure?",
    repair_history: "Repair History",
    repair_desc: "Use a Streak Freeze potion to mark a past missed day as 'Perfect'.",
    repair_btn: "Repair",
    revive_title: "PASSED OUT!",
    revive_desc: "You ran out of energy. You need to recover to continue your tasks.",
    revive_btn: "Drink Revive Potion",
    free: "Free this time",
    cost: "Cost",
    level_up: "Level Up!",
    level: "Level",
    gold: "Gold",
    cheat_res: "+500 Resources",
    cheat_day: "Skip Day",
    day_skipped: "Day Skipped!",
    item_booster: "XP Booster (x2)",
    item_booster_desc: "Double XP for next 4 tasks.",
    item_freeze: "Streak Freeze",
    item_freeze_desc: "Max 1 per day.",
    item_potion: "XP Potion",
    item_potion_desc: "Instant XP gain.",
    pack_dopamine: "Dopamine Detox",
    pack_dopamine_desc: "Cleanse your mind.",
    pack_fit: "Fit Life",
    pack_fit_desc: "Take care of your body.",
    pack_focus: "Deep Focus",
    pack_focus_desc: "Maximum efficiency.",
    pack_explorer: "Explorer's Bag",
    pack_explorer_desc: "New horizons.",
    bundle_habits: {
      no_screen: "No screen in morning",
      doomscroll: "Doomscrolling in bed",
      gaming: "Gaming",
      walk: "30 min walk",
      sleep: "Sleep 7 hours",
      soda: "Drink soda",
      work: "Work 4 hours",
      break_focus: "Break focus",
      content: "Foreign content",
      english: "Practice English"
    },
    achievements: {
        first_step: { name: "First Step", desc: "Add your first habit." },
        quick_learner: { name: "Rocket Fuel", desc: "Use an XP Booster once." },
        survivor: { name: "Survivor", desc: "Acquire a Streak Freeze." },
        worth_trying: { name: "Worth a Shot", desc: "Buy a habit bundle from the store." },
        clean_room: { name: "Clean Room", desc: "Use the solid color wall." },
        anti_discipline: { name: "Anti-Discipline", desc: "Maintain a bad habit for 3 days." },
        red_line: { name: "Red Line", desc: "Avoid a bad habit for 7 days." },
        habit_theory: { name: "Habit Theory", desc: "Reach a 21-day streak." },
        midas: { name: "Midas Touch", desc: "Reach 1000 Gold." },
        this_year: { name: "This Is The Year", desc: "Buy the Vision Board." },
        hercules: { name: "Arnold", desc: "Max out Physical skills." },
        stonks: { name: "Stonks 📈", desc: "Max out Financial skills." },
        bargain_hunter: { name: "Negotiator", desc: "Max out Social skills." },
        da_vinci: { name: "Da Vinci", desc: "Get all skills to at least Level 1." },
        wise: { name: "Wise Old Man", desc: "Hoard 5 XP Boosters." },
        symmetry: { name: "Symmetry", desc: "Have an equal number of Good and Bad habits." },
        perfect: { name: "God Mode", desc: "Max out all skills." },
        meticulous: { name: "Meticulous", desc: "Buy and use all decoration items." },
        curious_mind: { name: "What did you expect?", desc: "Click the Developer name 5 times." },
        game_over: { name: "Game Over?", desc: "Unlock all other achievements." },
    },
    features_list: [
        "Customizable habit tracking.",
        "XP and Leveling system.",
        "Health (HP) and discipline management.",
        "Gold economy and Store.",
        "Detailed Skill Tree with perks.",
        "Customizable living room (Home).",
        "Streak tracking and badges.",
        "Detailed statistics and analytics."
    ],
    regret_messages: [
        "Control your willpower next time.",
        "That wasn't like you, pull yourself together!",
        "To err is human, to persist is not.",
        "Short term pleasure, long term regret.",
        "Remember your goals, don't give up.",
        "You will be stronger tomorrow.",
        "Just a small stumble, keep going.",
        "Be honest with yourself."
    ],
    congrat_messages: [
        "Perfect day! You are amazing.",
        "Discipline is freedom, proved today.",
        "Nerves of steel!",
        "You conquered the day, champion.",
        "Don't stop, keep going!",
        "Success is a habit, you did it.",
        "Time to sleep with pride.",
        "ROI on yourself is paying off.",
        "Legendary performance!",
        "History written today."
    ]
  }
};

// CONSTANT INITIAL STATE
export const INITIAL_STATE: GameState = {
  hp: 100,
  maxHp: 100,
  xp: 0,
  xpToNextLevel: 30,
  level: 1,
  perkPoints: 0,
  gold: 50, 
  habits: [
    { id: 'h1', name: "Mind'N Flow kullan", type: 'good', difficulty: 'easy' },
    { id: 'h2', name: "1 Saat kitap oku", type: 'good', difficulty: 'medium' },
    { id: 'h3', name: "Bir şeyleri ertele", type: 'bad', difficulty: 'medium' }
  ],
  skills: [
    { id: 's1', name: 'Fiziksel', icon: 'dumbbell', currentLevel: 0, costs: [1, 1, 1], levelNames: ['Zinde Vücut', 'Güçlü Kaslar', 'Atletik Performans'] },
    { id: 's2', name: 'Zihinsel', icon: 'brain', currentLevel: 0, costs: [1, 1, 1], levelNames: ['Odaklanma', 'Hızlı Okuma', 'Derin Analiz'] },
    { id: 's3', name: 'Sosyal', icon: 'users', currentLevel: 0, costs: [1, 1, 1], levelNames: ['İyi Dinleyici', 'Etkili İletişim', 'Liderlik'] },
    { id: 's4', name: 'Kariyer', icon: 'briefcase', currentLevel: 0, costs: [1, 1, 1], levelNames: ['Çırak', 'Kalfa', 'Usta'] },
    { id: 's5', name: 'Yaratıcı', icon: 'palette', currentLevel: 0, costs: [1, 1, 1], levelNames: ['İlham Perisi', 'Sanatkar', 'Vizyoner'] },
    { id: 's6', name: 'Finansal', icon: 'coins', currentLevel: 0, costs: [1, 1, 1], levelNames: ['Tasarrufçu', 'Yatırımcı', 'Finansal Özgürlük'] },
  ],
  lastResetDate: new Date().toDateString(),
  lastLoginDate: new Date().toISOString().split('T')[0],
  simulatedDate: new Date().toISOString().split('T')[0],
  loginStreak: 1,
  language: 'tr', // Default
  inventory: {
    xpBoosterCharges: 0,
    xpBoosterBoughtCount: 0,
    xpBoosterUsedCount: 0,
    streakFreeze: 0,
    streakFreezeBoughtCount: 0,
    ownedThemes: ['cozy', 'dark', 'minimal'], // All unlocked by default/free
    purchasedTemplates: [],
    templateExpiryDates: {},
    activeTheme: 'cozy',
    activeFont: 'font-sans', 
    lastFreezeDate: null,
    ownedDecorations: [],
    activeDecorations: {} 
  },
  history: {},
  unlockedAchievements: [],
};
