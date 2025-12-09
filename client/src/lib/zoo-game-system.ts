// 🎪 Zoo-Spielsystem - Zentrales Belohnungs- und Fortschrittssystem
// Verbindet alle 4 Zoo-Spiele mit einheitlicher Währung und Sammel-Mechanik

export type ZooAnimal =
  // Savanne (Afrika)
  | 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'rhino' | 'hippo' | 'cheetah' | 'hyena' | 'ostrich'
  | 'meerkat' | 'buffalo' | 'antelope' | 'wildebeest' | 'gazelle'
  // Dschungel (Asien/Südamerika)
  | 'monkey' | 'gorilla' | 'orangutan' | 'tiger' | 'leopard' | 'toucan' | 'parrot' | 'sloth'
  | 'jaguar' | 'tapir' | 'macaw' | 'tree_frog' | 'chameleon' | 'gibbon'
  // Arktis/Antarktis
  | 'penguin' | 'polar_bear' | 'seal' | 'walrus' | 'arctic_fox'
  | 'reindeer' | 'narwhal' | 'beluga' | 'snow_owl' | 'arctic_hare'
  // Bambuswald (Asien)
  | 'panda' | 'red_panda' | 'koala' | 'peacock'
  | 'snow_leopard' | 'clouded_leopard' | 'golden_monkey'
  // Wiese/Bauernhof (Europa)
  | 'rabbit' | 'fox' | 'deer' | 'hedgehog' | 'owl'
  | 'squirrel' | 'badger' | 'wild_boar' | 'lynx' | 'beaver'
  // Wüste
  | 'camel' | 'snake' | 'scorpion' | 'fennec_fox'
  | 'roadrunner' | 'desert_tortoise' | 'iguana' | 'vulture'
  // Ozean/Aquarium
  | 'dolphin' | 'shark' | 'octopus' | 'seahorse' | 'turtle' | 'jellyfish'
  | 'orca' | 'manta_ray' | 'clownfish' | 'sea_otter' | 'manatee' | 'starfish'
  | 'blue_whale' | 'hammerhead_shark' | 'pufferfish'
  // Nachthaus
  | 'bat' | 'raccoon' | 'firefly'
  | 'sugar_glider' | 'kiwi' | 'tarsier' | 'aye_aye'
  // Australien
  | 'kangaroo' | 'wombat' | 'platypus'
  | 'tasmanian_devil' | 'echidna' | 'wallaby' | 'kookaburra'
  // Vögel
  | 'eagle' | 'flamingo' | 'swan'
  | 'pelican' | 'stork' | 'crane' | 'hummingbird' | 'kingfisher' | 'hornbill'
  // Reptilien & Amphibien
  | 'crocodile' | 'alligator' | 'komodo_dragon' | 'gecko' | 'poison_dart_frog'
  // Insekten
  | 'butterfly' | 'ladybug' | 'dragonfly' | 'praying_mantis';

export type ZooGame = 'zahlenwaage' | 'ten-wins' | 'decomposition' | 'doubling' | 'pathfinder' | 'number-stairs' | 'number-builder' | 'neighbors';

// 🌍 Kontinente (wie in Arche Nova!)
export type Continent = 'Afrika' | 'Amerika' | 'Asien' | 'Australien' | 'Europa' | 'Ozean';

// 🦁 Tier-Gruppen (einfache Namen für Kinder!)
export type AnimalGroup = 'Affen' | 'Raubkatzen' | 'Vögel' | 'Reptilien' | 'Grosstiere' | 'Wassertiere';

// 🎯 Erweiterte Tier-Informationen
export interface AnimalInfo {
  type: ZooAnimal;
  name: string;
  emoji: string;
  continent: Continent;
  group: AnimalGroup;
  habitat?: string;
}

export interface ZooGameReward {
  coins: number;
  animals: ZooAnimal[];
  badges: string[];
  experience: number;
}

export interface ZooShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  type: 'decoration' | 'food' | 'toy' | 'habitat' | 'utility' | 'special' | 'expert' | 'special_house';
  description: string;
  habitatType?: string;
  animalGroup?: AnimalGroup;
  continent?: Continent;
  effect?: {
    type: 'coin_bonus' | 'xp_bonus' | 'animal_chance' | 'happiness' | 'visitor_boost' | 'group_bonus';
    value: number;
    description: string;
    targetGroup?: AnimalGroup;
    targetContinent?: Continent;
  };
  unlockLevel?: number;
  requiresHabitat?: string;
  maxActive?: number;
  isExpert?: boolean;
}

export interface ZooProfile {
  totalCoins: number;
  totalAnimals: ZooAnimal[];
  ownedShopItems: string[];
  badges: string[];
  level: number;
  experience: number;
  ticketPrice: number; // 🎟️ Eintrittspreis (0.5 - 5 ZooMünzen, default 1.0)
  gameStats: Record<ZooGame, {
    played: number;
    totalScore: number;
    highScore: number;
    lastPlayed: Date | null;
  }>;
}

// 🎯 OPTIMIERTES Belohnungssystem: Training vs Spiele
// Training = Hauptlernmodus (XP-fokussiert, garantierte Tiere bei Level-Up)
// Spiele = Bonus-Spaß (Münzen ODER Tiere fokussiert, mit Mini-XP)

export const TRAINING_REWARDS = {
  // XP System (HAUPTBELOHNUNG)
  xpPerCorrect: 15,          // ↑ Erhöht von 10 auf 15 XP (schnellere Progression)
  xpPerLevel: 100,           // Fixer XP-Wert pro Level
  xpBonusStreak: 5,          // +5 XP Bonus bei 5er-Streak

  // Münzen (Sekundär)
  coinsPerCorrect: 1,        // ↓ Reduziert (Training = Progression, nicht Münzen)
  coinsPerLevel: 50,         // ↓ Reduziert von 100 auf 50 (weniger Inflation)

  // Tiere (Schnelle Belohnung!)
  animalChance: 0.80,        // ✨ 80% Chance pro Task = sehr schnell erstes Tier!
  animalPerLevel: 1,         // ✨ NEU: Garantiertes Tier bei jedem Level-Up!
  animalChoiceAtMilestone: true, // Bei Meilenstein-Levels (5, 10, 15...) = Tier aussuchen
  firstAnimalGuaranteed: true, // 🎯 GARANTIERT erstes Tier beim 1. erfolgreichen Task!

  // Bonus
  bonusMultiplier: 1.3       // ↑ Erhöht von 1.2 auf 1.3 (30% bei 90%+ Erfolg)
};

// 🎮 NEUE BALANCE: Alle Spiele belohnen Tiere + Münzen + XP!
// Pro 10 gelöste Aufgaben - unterschiedliche Mengen je nach Spiel
export const GAME_REWARDS: Record<ZooGame, {
  type: 'coins' | 'animals' | 'balanced';
  coinsPerCorrect: number;
  coinsPerGame: number;
  animalChance: number;
  xp: number;
  bonusMultiplier: number;
}> = {
  // Training (Referenz - nicht hier, aber zum Vergleich)
  // Münzen: 20, XP: 100, Tier-Chance: 30%

  zahlenwaage: {
    type: 'coins',
    coinsPerCorrect: 5,
    coinsPerGame: 50,        // 50 Münzen pro 10 Aufgaben
    animalChance: 0.70,      // ↑ 70% Tier-Chance (von 10%)
    xp: 50,                  // 50 XP pro 10 Aufgaben
    bonusMultiplier: 1.5
  },

  'ten-wins': {
    type: 'animals',
    coinsPerCorrect: 2,
    coinsPerGame: 20,        // 20 Münzen pro 10 Aufgaben
    animalChance: 0.95,      // ↑ 95% Tier-Chance (fast garantiert!)
    xp: 30,                  // 30 XP pro 10 Aufgaben
    bonusMultiplier: 2.0
  },

  decomposition: {
    type: 'animals',
    coinsPerCorrect: 5,
    coinsPerGame: 50,        // 50 Münzen pro 10 Aufgaben
    animalChance: 0.90,      // ↑ 90% Tier-Chance (sehr hoch!)
    xp: 40,                  // 40 XP pro 10 Aufgaben
    bonusMultiplier: 1.8
  },

  doubling: {
    type: 'balanced',
    coinsPerCorrect: 7,
    coinsPerGame: 70,        // 70 Münzen pro 10 Aufgaben
    animalChance: 0.75,      // ↑ 75% Tier-Chance (von 25%)
    xp: 50,                  // 50 XP pro 10 Aufgaben
    bonusMultiplier: 1.7
  },

  pathfinder: {
    type: 'coins',
    coinsPerCorrect: 8,
    coinsPerGame: 80,        // 80 Münzen pro 10 Aufgaben
    animalChance: 0.65,      // ↑ 65% Tier-Chance (von 8%)
    xp: 80,                  // 80 XP pro 10 Aufgaben
    bonusMultiplier: 2.5
  },

  neighbors: {
    type: 'balanced',
    coinsPerCorrect: 7,
    coinsPerGame: 70,        // 70 Münzen pro 10 Aufgaben
    animalChance: 0.72,      // ↑ 72% Tier-Chance (von 22%)
    xp: 50,                  // 50 XP pro 10 Aufgaben
    bonusMultiplier: 2.2
  },

  'number-stairs': {
    type: 'balanced',
    coinsPerCorrect: 6,
    coinsPerGame: 60,        // 60 Münzen pro 10 Aufgaben
    animalChance: 0.70,      // ↑ 70% Tier-Chance (von 20%)
    xp: 40,                  // 40 XP pro 10 Aufgaben
    bonusMultiplier: 1.6
  },

  'number-builder': {
    type: 'balanced',
    coinsPerCorrect: 8,
    coinsPerGame: 80,        // 80 Münzen pro 10 Aufgaben
    animalChance: 0.75,      // ↑ 75% Tier-Chance (von 25%)
    xp: 60,                  // 60 XP pro 10 Aufgaben
    bonusMultiplier: 1.8
  }
};

// 🏪 Zoo-Shop Items - Massiv erweitert!
export const ZOO_SHOP_ITEMS: ZooShopItem[] = [
  // === GEHEGE (10 HABITATE - Langfristige Ziele!) ===
  {
    id: 'savanna', name: 'Savanne', emoji: '🦁', price: 500, type: 'habitat',
    description: 'Heimat für afrikanische Tiere', habitatType: 'savanna',
    effect: { type: 'animal_chance', value: 15, description: '+15% Chance auf Savannentiere!' }
  },
  {
    id: 'jungle', name: 'Dschungel', emoji: '🌴', price: 600, type: 'habitat',
    description: 'Tropischer Regenwald', habitatType: 'jungle',
    effect: { type: 'xp_bonus', value: 10, description: '+10% XP bei Dschungelaufgaben!' }
  },
  {
    id: 'arctic', name: 'Arktis', emoji: '❄️', price: 800, type: 'habitat',
    description: 'Eisige Polarlandschaft', habitatType: 'arctic',
    effect: { type: 'coin_bonus', value: 20, description: '+20% Münzen in der Arktis!' },
    unlockLevel: 3
  },
  {
    id: 'bamboo', name: 'Bambuswald', emoji: '🎋', price: 700, type: 'habitat',
    description: 'Asiatischer Bambushain', habitatType: 'bamboo',
    effect: { type: 'happiness', value: 25, description: 'Pandas sind glücklicher (+25% Besucher)!' }
  },
  {
    id: 'meadow', name: 'Wiese', emoji: '🌸', price: 400, type: 'habitat',
    description: 'Grüne Wiesen und Felder', habitatType: 'meadow',
    effect: { type: 'visitor_boost', value: 30, description: '+30 Besucher pro Tag!' }
  },
  {
    id: 'desert', name: 'Wüste', emoji: '🏜️', price: 550, type: 'habitat',
    description: 'Sandige Wüstenlandschaft', habitatType: 'desert',
    effect: { type: 'coin_bonus', value: 15, description: '+15% Münzen durch Wüstentiere!' }
  },
  {
    id: 'ocean', name: 'Ozean-Aquarium', emoji: '🌊', price: 1000, type: 'habitat',
    description: 'Riesiges Unterwasser-Reich', habitatType: 'ocean',
    effect: { type: 'animal_chance', value: 25, description: '+25% auf seltene Meerestiere!' },
    unlockLevel: 5
  },
  {
    id: 'night_house', name: 'Nachthaus', emoji: '🌙', price: 850, type: 'habitat',
    description: 'Für nachtaktive Tiere', habitatType: 'night',
    effect: { type: 'xp_bonus', value: 20, description: '+20% XP nachts (ab 18 Uhr)!' },
    unlockLevel: 4
  },
  {
    id: 'outback', name: 'Australien-Outback', emoji: '🦘', price: 750, type: 'habitat',
    description: 'Australische Wildnis', habitatType: 'outback',
    effect: { type: 'happiness', value: 30, description: 'Kängurus hüpfen freudig (+30% Bonus)!' }
  },
  {
    id: 'aviary', name: 'Vogelhaus', emoji: '🦅', price: 450, type: 'habitat',
    description: 'Großes Vogelgehege', habitatType: 'aviary',
    effect: { type: 'visitor_boost', value: 50, description: '+50 Besucher pro Tag!' }
  },

  // 🆕 10 NEUE GEHEGE
  {
    id: 'butterfly_garden', name: 'Schmetterlings-Garten', emoji: '🦋', price: 650, type: 'habitat',
    description: 'Tropischer Garten voller flatternder Schönheiten', habitatType: 'butterfly',
    effect: { type: 'happiness', value: 35, description: '+35% Besucher-Freude!' },
    unlockLevel: 4
  },
  {
    id: 'monkey_temple', name: 'Affen-Tempel', emoji: '🏯', price: 850, type: 'habitat',
    description: 'Asiatischer Tempel für geschickte Kletterer', habitatType: 'temple',
    effect: { type: 'xp_bonus', value: 25, description: '+25% XP für Affen!' },
    unlockLevel: 5
  },
  {
    id: 'crocodile_lagoon', name: 'Krokodil-Lagune', emoji: '🐊', price: 900, type: 'habitat',
    description: 'Sumpfiges Wasserreich für Reptilien', habitatType: 'lagoon',
    effect: { type: 'coin_bonus', value: 30, description: '+30% Münzen durch Nervenkitzel!' },
    unlockLevel: 6
  },
  {
    id: 'penguin_beach', name: 'Pinguin-Strand', emoji: '🏖️', price: 750, type: 'habitat',
    description: 'Künstlicher Strand mit Eisbergen', habitatType: 'beach',
    effect: { type: 'visitor_boost', value: 80, description: '+80 Besucher (Fotomotiv!)' },
    unlockLevel: 4
  },
  {
    id: 'bat_cave', name: 'Fledermaus-Höhle', emoji: '🦇', price: 700, type: 'habitat',
    description: 'Dunkle Höhle für Nachtschwärmer', habitatType: 'cave',
    effect: { type: 'happiness', value: 40, description: 'Perfekt für nachtaktive Tiere!' },
    unlockLevel: 5
  },
  {
    id: 'safari_park', name: 'Safari-Park', emoji: '🚙', price: 1200, type: 'habitat',
    description: 'Riesiges offenes Gelände wie in Afrika', habitatType: 'safari',
    effect: { type: 'animal_chance', value: 35, description: '+35% auf Savannentiere!' },
    unlockLevel: 7
  },
  {
    id: 'tropical_dome', name: 'Tropen-Kuppel', emoji: '🌡️', price: 950, type: 'habitat',
    description: 'Klimatisiertes Tropenhaus', habitatType: 'dome',
    effect: { type: 'xp_bonus', value: 30, description: '+30% XP für Dschungeltiere!' },
    unlockLevel: 6
  },
  {
    id: 'mountain_range', name: 'Berglandschaft', emoji: '⛰️', price: 800, type: 'habitat',
    description: 'Felsige Berge für Kletterkünstler', habitatType: 'mountain',
    effect: { type: 'coin_bonus', value: 25, description: '+25% Münzen durch Panorama!' },
    unlockLevel: 5
  },
  {
    id: 'coral_reef', name: 'Korallenriff', emoji: '🪸', price: 1100, type: 'habitat',
    description: 'Buntes Unterwasser-Paradies', habitatType: 'reef',
    effect: { type: 'visitor_boost', value: 100, description: '+100 Besucher durch Farben!' },
    unlockLevel: 7
  },
  {
    id: 'petting_farm', name: 'Streichelzoo', emoji: '🐑', price: 550, type: 'habitat',
    description: 'Interaktiver Bereich für Kinder', habitatType: 'farm',
    effect: { type: 'happiness', value: 50, description: '+50% Familien-Freude!' },
    unlockLevel: 3
  },

  // === DEKORATIONEN (Günstig - Schnelle Erfolge!) ===
  { id: 'tree', name: 'Baum', emoji: '🌳', price: 20, type: 'decoration', description: 'Ein schöner Baum',
    effect: { type: 'happiness', value: 5, description: '+5% Tier-Zufriedenheit!' } },
  { id: 'flower', name: 'Blume', emoji: '🌺', price: 15, type: 'decoration', description: 'Bunte Blumen',
    effect: { type: 'visitor_boost', value: 5, description: '+5 Besucher!' } },
  { id: 'fountain', name: 'Brunnen', emoji: '⛲', price: 80, type: 'decoration', description: 'Springbrunnen',
    effect: { type: 'coin_bonus', value: 10, description: 'Besucher werfen Münzen (+10%)!' } },
  { id: 'palm', name: 'Palme', emoji: '🌴', price: 15, type: 'decoration', description: 'Tropische Palme',
    effect: { type: 'happiness', value: 8, description: '+8% Exotik-Bonus!' },
    requiresHabitat: 'jungle' },
  { id: 'cactus', name: 'Kaktus', emoji: '🌵', price: 12, type: 'decoration', description: 'Wüstenkaktus',
    effect: { type: 'happiness', value: 10, description: '+10% für Wüstentiere!' },
    requiresHabitat: 'desert' },
  { id: 'rock', name: 'Felsen', emoji: '🪨', price: 8, type: 'decoration', description: 'Naturstein',
    effect: { type: 'happiness', value: 3, description: 'Natürliches Ambiente!' } },
  { id: 'twig', name: 'Zweig', emoji: '🌿', price: 6, type: 'decoration', description: 'Grüner Zweig',
    effect: { type: 'visitor_boost', value: 3, description: '+3 Besucher!' } },
  { id: 'waterfall', name: 'Wasserfall', emoji: '💧', price: 50, type: 'decoration', description: 'Spektakulärer Wasserfall',
    effect: { type: 'coin_bonus', value: 25, description: '+25% Münzen (Attraktion!)' },
    unlockLevel: 3 },
  { id: 'pond', name: 'Teich', emoji: '🏞️', price: 35, type: 'decoration', description: 'Kleiner Teich',
    effect: { type: 'happiness', value: 15, description: 'Wassertiere lieben es (+15%)!' } },
  { id: 'bridge', name: 'Brücke', emoji: '🌉', price: 40, type: 'decoration', description: 'Holzbrücke',
    effect: { type: 'visitor_boost', value: 20, description: '+20 Besucher (Fotomotiv!)' } },
  { id: 'chair', name: 'Stuhl', emoji: '🪑', price: 15, type: 'decoration', description: 'Stuhl für Besucher',
    effect: { type: 'coin_bonus', value: 5, description: 'Besucher bleiben länger (+5%)!' } },
  { id: 'lamp', name: 'Laterne', emoji: '🏮', price: 20, type: 'decoration', description: 'Dekorative Beleuchtung',
    effect: { type: 'visitor_boost', value: 10, description: '+10 Abend-Besucher!' } },

  // === FUTTER (Mittel - Tier-Boost!) ===
  { id: 'banana', name: 'Banane', emoji: '🍌', price: 25, type: 'food', description: 'Für Affen!',
    effect: { type: 'happiness', value: 20, description: 'Affen werden super glücklich!' } },
  { id: 'fish', name: 'Fisch', emoji: '🐟', price: 30, type: 'food', description: 'Für Pinguine & Robben',
    effect: { type: 'xp_bonus', value: 15, description: '+15% XP für Wassertiere!' } },
  { id: 'bamboo_food', name: 'Bambus', emoji: '🎋', price: 35, type: 'food', description: 'Pandas lieben Bambus!',
    effect: { type: 'animal_chance', value: 30, description: '+30% Panda-Chance!' } },
  { id: 'meat', name: 'Fleisch', emoji: '🥩', price: 40, type: 'food', description: 'Für Raubtiere',
    effect: { type: 'coin_bonus', value: 25, description: 'Raubtiere werden aktiver (+25%)!' },
    unlockLevel: 2 },
  { id: 'carrot', name: 'Karotte', emoji: '🥕', price: 5, type: 'food', description: 'Für Hasen & Pflanzenfresser',
    effect: { type: 'happiness', value: 10, description: 'Gesundes Futter (+10%)!' } },
  { id: 'apple', name: 'Apfel', emoji: '🍎', price: 6, type: 'food', description: 'Gesunder Snack',
    effect: { type: 'xp_bonus', value: 5, description: '+5% XP Bonus!' } },
  { id: 'hay', name: 'Heu', emoji: '🌾', price: 7, type: 'food', description: 'Für Giraffen & Zebras',
    effect: { type: 'happiness', value: 15, description: 'Savannentiere lieben es!' } },
  { id: 'nuts', name: 'Nüsse', emoji: '🥜', price: 9, type: 'food', description: 'Für Eichhörnchen & Vögel',
    effect: { type: 'animal_chance', value: 10, description: '+10% auf Vögel!' } },
  { id: 'seeds', name: 'Samen', emoji: '🌻', price: 4, type: 'food', description: 'Vogelfutter',
    effect: { type: 'visitor_boost', value: 8, description: 'Vögel singen (+8 Besucher)!' } },
  { id: 'insects', name: 'Insekten', emoji: '🦗', price: 8, type: 'food', description: 'Für Reptilien & Vögel',
    effect: { type: 'xp_bonus', value: 12, description: '+12% XP für Reptilien!' } },
  { id: 'honey', name: 'Honig', emoji: '🍯', price: 12, type: 'food', description: 'Süße Leckerei',
    effect: { type: 'coin_bonus', value: 20, description: 'Süße Belohnung (+20%)!' } },
  { id: 'watermelon', name: 'Wassermelone', emoji: '🍉', price: 10, type: 'food', description: 'Erfrischend!',
    effect: { type: 'happiness', value: 25, description: 'Sommerhit (+25% Freude)!' } },
  { id: 'food_krill', name: 'Krill', category: 'food', price: 45, emoji: '🦐', description: 'Für Narwal, Beluga & Orca! +25% Glück', bonusType: 'happiness_boost', bonusValue: 25 },
  { id: 'food_eucalyptus', name: 'Eukalyptus', category: 'food', price: 30, emoji: '🌿', description: 'Für Koala & Wombat! +20% Glück', bonusType: 'happiness_boost', bonusValue: 20 },
  { id: 'food_insects', name: 'Insekten-Mix', category: 'food', price: 20, emoji: '🦗', description: 'Für Reptilien! +15% XP', bonusType: 'xp_multiplier', bonusValue: 15 },
  { id: 'food_premium', name: 'Premium-Futter', category: 'food', price: 50, emoji: '🌟', description: 'Das beste Futter! +30% Glück', bonusType: 'happiness_boost', bonusValue: 30 },


  // === SPIELZEUG (Mittel - Spaß-Faktor!) ===
  { id: 'ball', name: 'Ball', emoji: '⚽', price: 40, type: 'toy', description: 'Zum Spielen',
    effect: { type: 'happiness', value: 30, description: 'Tiere lieben Spielen (+30%)!' } },
  { id: 'tire', name: 'Reifen', emoji: '🛞', price: 50, type: 'toy', description: 'Klettern und Toben',
    effect: { type: 'xp_bonus', value: 20, description: 'Aktive Tiere (+20% XP)!' } },
  { id: 'rope', name: 'Kletterseil', emoji: '🪢', price: 60, type: 'toy', description: 'Für Affen',
    effect: { type: 'happiness', value: 40, description: 'Affen schwingen freudig!' } },
  { id: 'tunnel', name: 'Tunnel', emoji: '🕳️', price: 25, type: 'toy', description: 'Verstecktunnel',
    effect: { type: 'animal_chance', value: 15, description: 'Versteckspiel lockt Tiere!' } },
  { id: 'swing', name: 'Schaukel', emoji: '🎪', price: 22, type: 'toy', description: 'Hängeschaukel',
    effect: { type: 'visitor_boost', value: 25, description: 'Besucher schauen gern zu!' } },
  { id: 'climbing_tree', name: 'Kletterbaum', emoji: '🌲', price: 30, type: 'toy', description: 'Großer Kletterbaum',
    effect: { type: 'coin_bonus', value: 30, description: 'Attraktion (+30% Münzen)!' },
    unlockLevel: 2 },
  { id: 'pool', name: 'Planschbecken', emoji: '🛁', price: 35, type: 'toy', description: 'Zum Abkühlen',
    effect: { type: 'happiness', value: 50, description: 'Wasserspaß im Sommer!' },
    unlockLevel: 3 },
  { id: 'sandbox', name: 'Sandkasten', emoji: '🏖️', price: 28, type: 'toy', description: 'Zum Buddeln',
    effect: { type: 'xp_bonus', value: 25, description: 'Spielerisches Lernen!' } },
  
  // 🆕 12 NEUE SPIELZEUGE FÜR VERSCHIEDENE TIERARTEN
  { id: 'toy_bamboo_sticks', name: 'Bambus-Stäbe', emoji: '🎋', price: 45, type: 'toy', description: 'Perfekt für Pandas zum Spielen und Knabbern!',
    effect: { type: 'happiness', value: 35, description: 'Pandas lieben Bambus-Spiele (+35%)!' } },
  { id: 'toy_mirror', name: 'Spiegel', emoji: '🪞', price: 38, type: 'toy', description: 'Vögel und Affen lieben es, sich zu betrachten',
    effect: { type: 'xp_bonus', value: 20, description: 'Selbsterkennung macht schlau (+20% XP)!' } },
  { id: 'toy_scratching_post', name: 'Kratzbaum', emoji: '🌲', price: 55, type: 'toy', description: 'Für Raubkatzen - perfekt zum Kratzen!',
    effect: { type: 'happiness', value: 45, description: 'Raubkatzen entspannen beim Kratzen!' }, unlockLevel: 2 },
  { id: 'toy_floating_platform', name: 'Schwimmende Plattform', emoji: '🛟', price: 65, type: 'toy', description: 'Robben und Pinguine lieben es zu sonnenbaden',
    effect: { type: 'visitor_boost', value: 35, description: '+35 Besucher durch süße Szenen!' }, unlockLevel: 2 },
  { id: 'toy_hollow_log', name: 'Baumstamm-Höhle', emoji: '🪵', price: 42, type: 'toy', description: 'Versteckmöglichkeit für scheue Tiere',
    effect: { type: 'happiness', value: 30, description: 'Tiere fühlen sich sicher (+30%)!' } },
  { id: 'toy_hamster_wheel', name: 'Laufrad', emoji: '☸️', price: 48, type: 'toy', description: 'Für kleine Nagetiere - endloser Spaß!',
    effect: { type: 'xp_bonus', value: 30, description: 'Bewegung macht fit (+30% XP)!' } },
  { id: 'toy_chew_bone', name: 'Kauspielzeug', emoji: '🦴', price: 35, type: 'toy', description: 'Für Bären, Füchse und andere Säuger',
    effect: { type: 'happiness', value: 25, description: 'Kauen beruhigt (+25%)!' } },
  { id: 'toy_hanging_feeder', name: 'Hängende Futterbox', emoji: '📦', price: 52, type: 'toy', description: 'Intelligenzspiel für clevere Tiere',
    effect: { type: 'xp_bonus', value: 35, description: 'Problemlösen trainiert (+35% XP)!' }, unlockLevel: 3 },
  { id: 'toy_ice_treats', name: 'Eis-Leckereien', emoji: '🧊', price: 58, type: 'toy', description: 'Gefrorene Früchte für heiße Tage',
    effect: { type: 'happiness', value: 40, description: 'Erfrischung im Sommer (+40%)!' }, unlockLevel: 2 },
  { id: 'toy_bubble_machine', name: 'Seifenblasen-Maschine', emoji: '🫧', price: 75, type: 'toy', description: 'Faszinierend für alle Tiere!',
    effect: { type: 'visitor_boost', value: 50, description: 'Magische Atmosphäre (+50 Besucher)!' }, unlockLevel: 4 },
  { id: 'toy_treasure_chest', name: 'Schatztruhe', emoji: '💎', price: 85, type: 'toy', description: 'Verstecke darin Leckereien - Suchspiel!',
    effect: { type: 'xp_bonus', value: 45, description: 'Suchen & Finden macht schlau (+45% XP)!' }, unlockLevel: 4 },
  { id: 'toy_音_enrichment', name: 'Geräusch-Spielzeug', emoji: '🔔', price: 62, type: 'toy', description: 'Macht Töne - faszinierend für neugierige Tiere',
    effect: { type: 'happiness', value: 38, description: 'Akustische Reize regen an (+38%)!' }, unlockLevel: 3 },

  // === 🆕 KIOSK (Super wichtig für Wirtschaft!) ===
  { id: 'kiosk', name: 'Zoo-Kiosk', emoji: '🏪', price: 1000, type: 'special', description: 'Verkauft Snacks & Souvenirs!',
    effect: { type: 'visitor_boost', value: 50, description: '+50 Besucher & +0.3 Münzen pro Besucher!' },
    unlockLevel: 5 },

  // === UTILITY (Zoowärter-Equipment) ===
  { id: 'wheelbarrow', name: 'Schubkarre', emoji: '🛒', price: 20, type: 'utility', description: 'Für Transporte',
    effect: { type: 'coin_bonus', value: 10, description: 'Effizienz (+10% Münzen)!' } },
  { id: 'broom', name: 'Besen', emoji: '🧹', price: 10, type: 'utility', description: 'Zum Saubermachen',
    effect: { type: 'happiness', value: 15, description: 'Sauberer Zoo = glückliche Tiere!' } },
  { id: 'first_aid', name: 'Erste-Hilfe-Set', emoji: '🏥', price: 40, type: 'utility', description: 'Tierarzt-Ausrüstung',
    effect: { type: 'xp_bonus', value: 30, description: 'Gesunde Tiere (+30% XP)!' },
    unlockLevel: 2 },
  { id: 'megaphone', name: 'Megafon', emoji: '📢', price: 25, type: 'utility', description: 'Für Ansagen',
    effect: { type: 'visitor_boost', value: 40, description: '+40 Besucher durch Ankündigungen!' } },
  { id: 'camera', name: 'Kamera', emoji: '📷', price: 50, type: 'utility', description: 'Tierfotos machen',
    effect: { type: 'coin_bonus', value: 25, description: 'Fotos verkaufen (+25%)!' },
    unlockLevel: 3 },
  { id: 'binoculars', name: 'Fernglas', emoji: '🔭', price: 30, type: 'utility', description: 'Tiere beobachten',
    effect: { type: 'animal_chance', value: 20, description: 'Bessere Tiersuche (+20%)!' } },

  // === SPECIAL (Premium Items - Selten & Mächtig!) ===
  { id: 'rainbow', name: 'Regenbogen', emoji: '🌈', price: 500, type: 'special', description: 'Magischer Regenbogen!',
    effect: { type: 'coin_bonus', value: 50, description: 'Magischer Münzregen (+50%)!' },
    unlockLevel: 5 },
  { id: 'star', name: 'Stern', emoji: '⭐', price: 400, type: 'special', description: 'Leuchtender Stern',
    effect: { type: 'xp_bonus', value: 40, description: 'Sternenglanz (+40% XP)!' },
    unlockLevel: 4 },
  { id: 'treasure', name: 'Schatztruhe', emoji: '💎', price: 800, type: 'special', description: 'Voller Überraschungen',
    effect: { type: 'animal_chance', value: 50, description: '+50% auf ALLE Tiere!' },
    unlockLevel: 6 },
  { id: 'crown', name: 'Krone', emoji: '👑', price: 1200, type: 'special', description: 'Für Zoo-Könige',
    effect: { type: 'coin_bonus', value: 100, description: 'Königlicher Bonus (+100%)!' },
    unlockLevel: 8 },
  { id: 'magic_wand', name: 'Zauberstab', emoji: '🪄', price: 600, type: 'special', description: 'Magische Kräfte',
    effect: { type: 'happiness', value: 100, description: 'Alle Tiere sind glücklich!' },
    unlockLevel: 7 },
  { id: 'golden_gate', name: 'Goldenes Tor', emoji: '🚪', price: 700, type: 'special', description: 'Prächtiger Eingang',
    effect: { type: 'visitor_boost', value: 100, description: '+100 Besucher durch Schönheit!' },
    unlockLevel: 6 },
  { id: 'crystal_lake', name: 'Kristallsee', emoji: '💧', price: 900, type: 'special', description: 'Magischer See',
    effect: { type: 'animal_chance', value: 40, description: '+40% Wassertier-Chance!' },
    unlockLevel: 7 },
  { id: 'wisdom_tree', name: 'Weisheitsbaum', emoji: '🌳', price: 650, type: 'special', description: 'Uralter Baum',
    effect: { type: 'xp_bonus', value: 50, description: '+50% XP durch Weisheit!' },
    unlockLevel: 5 },

  // === SPEZIAL-HÄUSER (Mega-Investitionen!) ===
  { id: 'monkey_island', name: 'Affen-Insel', emoji: '🏝️', price: 900, type: 'special_house',
    description: 'Grosses Gehege für alle Affen',
    animalGroup: 'Affen',
    effect: { type: 'group_bonus', value: 35, description: '+35% Münzen für Affen!', targetGroup: 'Affen' },
    unlockLevel: 4 },
  { id: 'reptile_house', name: 'Reptilien-Haus', emoji: '🦎', price: 800, type: 'special_house',
    description: 'Warmes Haus für Schlangen und mehr',
    animalGroup: 'Reptilien',
    effect: { type: 'group_bonus', value: 30, description: '+30% XP für Reptilien!', targetGroup: 'Reptilien' },
    unlockLevel: 3 },
  { id: 'bird_paradise', name: 'Vogel-Paradies', emoji: '🦜', price: 150, type: 'special_house',
    description: 'Riesige Voliere für viele Vögel',
    animalGroup: 'Vögel',
    effect: { type: 'group_bonus', value: 40, description: '+40 Besucher durch Vögel!', targetGroup: 'Vögel' },
    unlockLevel: 3 },
  { id: 'petting_zoo', name: 'Streichel-Zoo', emoji: '🐑', price: 120, type: 'special_house',
    description: 'Kleine Tiere zum Anfassen',
    effect: { type: 'visitor_boost', value: 60, description: '+60 Besucher lieben Streicheln!' },
    unlockLevel: 2 },
  { id: 'big_cats_area', name: 'Raubkatzen-Gehege', emoji: '🐅', price: 200, type: 'special_house',
    description: 'Für Tiger, Löwen und Leoparden',
    animalGroup: 'Raubkatzen',
    effect: { type: 'group_bonus', value: 45, description: '+45% Münzen für Raubkatzen!', targetGroup: 'Raubkatzen' },
    unlockLevel: 5 },
  { id: 'water_world', name: 'Wasser-Welt', emoji: '🐠', price: 220, type: 'special_house',
    description: 'Riesen-Aquarium für Wassertiere',
    animalGroup: 'Wassertiere',
    effect: { type: 'group_bonus', value: 50, description: '+50% auf Wassertiere!', targetGroup: 'Wassertiere' },
    unlockLevel: 6 },

  // === TIER-EXPERTEN (Arche Nova-Stil!) ===
  { id: 'expert_lisa', name: 'Affen-Forscherin Lisa', emoji: '👩‍🔬', price: 250, type: 'expert',
    description: 'Hilft dir, mehr Affen zu retten',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Affen',
    effect: { type: 'animal_chance', value: 40, description: '+40% Affen-Chance!', targetGroup: 'Affen' },
    unlockLevel: 5 },
  { id: 'expert_max', name: 'Vogel-Experte Max', emoji: '👨‍🎓', price: 230, type: 'expert',
    description: 'Kennt alle Vögel der Welt',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Vögel',
    effect: { type: 'animal_chance', value: 35, description: '+35% Vogel-Chance!', targetGroup: 'Vögel' },
    unlockLevel: 4 },
  { id: 'expert_sara', name: 'Meeres-Biologin Sara', emoji: '👩‍⚕️', price: 270, type: 'expert',
    description: 'Taucherin und Wassertier-Expertin',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Wassertiere',
    effect: { type: 'animal_chance', value: 45, description: '+45% Wassertier-Chance!', targetGroup: 'Wassertiere' },
    unlockLevel: 6 },
  { id: 'expert_tom', name: 'Safari-Guide Tom', emoji: '👨‍🌾', price: 280, type: 'expert',
    description: 'Afrika-Experte für Grosstiere',
    isExpert: true,
    maxActive: 3,
    continent: 'Afrika',
    effect: { type: 'animal_chance', value: 50, description: '+50% Afrika-Tiere!', targetContinent: 'Afrika' },
    unlockLevel: 7 },
  { id: 'expert_emma', name: 'Reptilien-Forscherin Emma', emoji: '👩‍🏫', price: 240, type: 'expert',
    description: 'Liebt Schlangen und Echsen',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Reptilien',
    effect: { type: 'animal_chance', value: 38, description: '+38% Reptilien-Chance!', targetGroup: 'Reptilien' },
    unlockLevel: 5 },
  { id: 'expert_leo', name: 'Raubkatzen-Experte Leo', emoji: '👨‍⚖️', price: 260, type: 'expert',
    description: 'Trainiert Tiger und Löwen',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Raubkatzen',
    effect: { type: 'animal_chance', value: 42, description: '+42% Raubkatzen-Chance!', targetGroup: 'Raubkatzen' },
    unlockLevel: 6 },

  // 🆕 10 NEUE TIEREXPERTEN
  { id: 'expert_olivia', name: 'Panda-Spezialistin Olivia', emoji: '👩‍🔬', price: 290, type: 'expert',
    description: 'Bambuswald-Expertin aus China',
    isExpert: true,
    maxActive: 3,
    continent: 'Asien',
    effect: { type: 'animal_chance', value: 48, description: '+48% Asien-Tiere!', targetContinent: 'Asien' },
    unlockLevel: 7 },
  { id: 'expert_noah', name: 'Insekten-Forscher Noah', emoji: '👨‍🔬', price: 220, type: 'expert',
    description: 'Kennt jedes Insekt persönlich',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Grosstiere',
    effect: { type: 'animal_chance', value: 36, description: '+36% auf kleine Tiere!', targetGroup: 'Grosstiere' },
    unlockLevel: 4 },
  { id: 'expert_mia', name: 'Arktis-Forscherin Mia', emoji: '👩‍🚀', price: 300, type: 'expert',
    description: 'Überlebenskünstlerin im ewigen Eis',
    isExpert: true,
    maxActive: 3,
    continent: 'Europa',
    effect: { type: 'animal_chance', value: 52, description: '+52% Arktis-Tiere!', targetContinent: 'Europa' },
    unlockLevel: 8 },
  { id: 'expert_carlos', name: 'Dschungel-Ranger Carlos', emoji: '👨‍🌾', price: 265, type: 'expert',
    description: 'Kennt jeden Winkel des Regenwalds',
    isExpert: true,
    maxActive: 3,
    continent: 'Amerika',
    effect: { type: 'animal_chance', value: 46, description: '+46% Amerika-Tiere!', targetContinent: 'Amerika' },
    unlockLevel: 6 },
  { id: 'expert_sophie', name: 'Nacht-Biologin Sophie', emoji: '👩‍💼', price: 275, type: 'expert',
    description: 'Expertin für nachtaktive Tiere',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Vögel',
    effect: { type: 'animal_chance', value: 44, description: '+44% Nacht-Tiere!', targetGroup: 'Vögel' },
    unlockLevel: 7 },
  { id: 'expert_jack', name: 'Outback-Guide Jack', emoji: '👨‍✈️', price: 285, type: 'expert',
    description: 'Australien-Kenner durch und durch',
    isExpert: true,
    maxActive: 3,
    continent: 'Australien',
    effect: { type: 'animal_chance', value: 50, description: '+50% Australien-Tiere!', targetContinent: 'Australien' },
    unlockLevel: 7 },
  { id: 'expert_anna', name: 'Wüsten-Expertin Anna', emoji: '👩‍🎓', price: 255, type: 'expert',
    description: 'Überlebt in der heissesten Hitze',
    isExpert: true,
    maxActive: 3,
    continent: 'Afrika',
    effect: { type: 'animal_chance', value: 43, description: '+43% Wüsten-Tiere!', targetContinent: 'Afrika' },
    unlockLevel: 6 },
  { id: 'expert_david', name: 'Zucht-Meister David', emoji: '👨‍🏫', price: 310, type: 'expert',
    description: 'Züchtet erfolgreich seltene Arten',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Grosstiere',
    effect: { type: 'xp_bonus', value: 50, description: '+50% Baby-Wachstum!', targetGroup: 'Grosstiere' },
    unlockLevel: 8 },
  { id: 'expert_lucia', name: 'Ozean-Forscherin Lucia', emoji: '👩‍🔬', price: 295, type: 'expert',
    description: 'Taucht zu den tiefsten Meeresbewohnern',
    isExpert: true,
    maxActive: 3,
    continent: 'Ozean',
    effect: { type: 'animal_chance', value: 55, description: '+55% Ozean-Tiere!', targetContinent: 'Ozean' },
    unlockLevel: 8 },
  { id: 'expert_marco', name: 'Grosstier-Pfleger Marco', emoji: '👨‍⚕️', price: 270, type: 'expert',
    description: 'Spezialist für Elefanten, Giraffen & Co.',
    isExpert: true,
    maxActive: 3,
    animalGroup: 'Grosstiere',
    effect: { type: 'animal_chance', value: 47, description: '+47% Grosstier-Chance!', targetGroup: 'Grosstiere' },
    unlockLevel: 7 },
];

// 🏆 Badges System - Massiv erweitert!
export const ZOO_BADGES = {
  // === TIER-SAMMLUNG ===
  'first-animal': { name: 'Erstes Tier', emoji: '🦁', description: 'Dein erstes Tier gerettet!', reward: { coins: 50, xp: 25 } },
  'animal-collector-5': { name: 'Tierfreund', emoji: '🐘🦒', description: '5 verschiedene Tiere gesammelt', reward: { coins: 100, xp: 50 } },
  'animal-collector-10': { name: 'Zoo-Enthusiast', emoji: '🏆', description: '10 Tiere gesammelt!', reward: { coins: 200, xp: 100 } },
  'animal-collector-20': { name: 'Tier-Experte', emoji: '🌟', description: '20 Tiere gesammelt!', reward: { coins: 400, xp: 200 } },
  'animal-collector-30': { name: 'Zoo-Meister', emoji: '👑', description: '30 Tiere gesammelt!', reward: { coins: 600, xp: 300 } },
  'all-animals': { name: 'Vollständige Sammlung', emoji: '🎊', description: 'Alle Tiere gesammelt!', reward: { coins: 2000, xp: 1000 } },

  // === HABITAT-SPEZIALIST ===
  'savanna-king': { name: 'Savannenkönig', emoji: '🦁👑', description: 'Alle Savannentiere gesammelt' },
  'jungle-explorer': { name: 'Dschungelforscher', emoji: '🌴🔍', description: 'Alle Dschungeltiere gesammelt' },
  'arctic-master': { name: 'Arktis-Meister', emoji: '❄️⭐', description: 'Alle Polartiere gesammelt' },
  'ocean-admiral': { name: 'Ozean-Admiral', emoji: '🌊⚓', description: 'Alle Meerestiere gesammelt' },
  'desert-nomad': { name: 'Wüsten-Nomade', emoji: '🏜️🐪', description: 'Alle Wüstentiere gesammelt' },
  'aviary-expert': { name: 'Vogel-Experte', emoji: '🦅🌟', description: 'Alle Vögel gesammelt' },

  // === MÜNZEN ===
  'coin-saver-50': { name: 'Sparer', emoji: '💰', description: '50 Münzen gespart' },
  'coin-saver-100': { name: 'Reich', emoji: '💎', description: '100 Münzen gespart' },
  'coin-saver-500': { name: 'Vermögend', emoji: '👑💰', description: '500 Münzen gespart' },
  'coin-saver-1000': { name: 'Milliardär', emoji: '🏦💎', description: '1000 Münzen gespart!' },

  // === SPIEL-SPEZIFISCH ===
  'balance-master': { name: 'Waage-Meister', emoji: '⚖️', description: 'Zahlenwaage gemeistert' },
  'ten-champion': { name: '10-Champion', emoji: '🎯', description: '10 gewinnt perfekt!' },
  'decomposition-expert': { name: 'Zerlegungs-Experte', emoji: '🔢', description: 'Alle Zerlegungen gefunden' },
  'doubling-pro': { name: 'Verdopplungs-Profi', emoji: '👯', description: 'Verdopplung automatisiert' },
  'pathfinder-genius': { name: 'Wege-Genie', emoji: '🗺️', description: 'Eleganteste Wege gefunden' },

  // === SHOPPING ===
  'first-purchase': { name: 'Erstkäufer', emoji: '🛒', description: 'Erstes Item gekauft' },
  'shopping-spree': { name: 'Einkaufsrausch', emoji: '🛍️', description: '10 Items gekauft' },
  'collector': { name: 'Sammler', emoji: '📦', description: '25 Items gesammelt' },
  'hoarder': { name: 'Hamsterer', emoji: '🏪', description: '50 Items im Inventar!' },

  // === GEHEGE ===
  'habitat-builder': { name: 'Gehege-Bauer', emoji: '🏗️', description: 'Erstes Gehege gebaut' },
  'habitat-master': { name: 'Gehege-Meister', emoji: '🏛️', description: 'Alle Gehege gebaut!' },

  // === TIERGRUPPEN ===
  'mammal-lover': { name: 'Säugetier-Freund', emoji: '🐘', description: '10 Säugetiere gesammelt' },
  'bird-watcher': { name: 'Vogelbeobachter', emoji: '🦅', description: '5 Vögel gesammelt' },
  'marine-biologist': { name: 'Meeresbiologe', emoji: '🐬', description: '5 Meerestiere gesammelt' },
  'reptile-expert': { name: 'Reptilien-Experte', emoji: '🐍', description: '3 Reptilien gesammelt' },

  // === BESONDERE LEISTUNGEN ===
  'night-owl': { name: 'Nachteule', emoji: '🦉', description: 'Alle nachtaktiven Tiere gesammelt' },
  'endangered-hero': { name: 'Artenschutz-Held', emoji: '🛡️', description: 'Seltene Tiere gerettet' },
  'zookeeper': { name: 'Zoowärter', emoji: '👨‍🌾', description: 'Alle Utility-Items gekauft' },
  'decorator': { name: 'Dekorateur', emoji: '🎨', description: '15 Dekorationen platziert' },
  'feeder': { name: 'Futtermischer', emoji: '🍽️', description: 'Alle Futtersorten gekauft' },

  // === KOMBINATION ===
  'all-games-played': { name: 'Zoo-Forscher', emoji: '🔬', description: 'Alle 5 Spiele gespielt!' },
  'perfectionist': { name: 'Perfektionist', emoji: '💯', description: '10 Aufgaben in Folge korrekt' },
  'speed-demon': { name: 'Tempo-Teufel', emoji: '⚡', description: '20 Aufgaben unter 3 Sekunden' },
  'persistent': { name: 'Ausdauernd', emoji: '🏃', description: '100 Aufgaben gelöst' },
  'legendary': { name: 'Legendär', emoji: '🌟👑', description: 'Alle Badges erreicht!' },
};

// 🎁 Berechne aktive Boni aus gekauften Items
export function calculateActiveBonuses(ownedItems: string[]): {
  coinBonus: number;
  xpBonus: number;
  animalChanceBonus: number;
  happinessBonus: number;
  visitorBoost: number;
} {
  const bonuses = {
    coinBonus: 0,
    xpBonus: 0,
    animalChanceBonus: 0,
    happinessBonus: 0,
    visitorBoost: 0
  };

  ownedItems.forEach(itemId => {
    const item = ZOO_SHOP_ITEMS.find(i => i.id === itemId);
    if (item?.effect) {
      switch (item.effect.type) {
        case 'coin_bonus':
          bonuses.coinBonus += item.effect.value;
          break;
        case 'xp_bonus':
          bonuses.xpBonus += item.effect.value;
          break;
        case 'animal_chance':
          bonuses.animalChanceBonus += item.effect.value;
          break;
        case 'happiness':
          bonuses.happinessBonus += item.effect.value;
          break;
        case 'visitor_boost':
          bonuses.visitorBoost += item.effect.value;
          break;
      }
    }
  });

  return bonuses;
}

// 🎁 Berechne Belohnung nach Spiel-Ende (mit Item-Boni!)
export function calculateGameReward(
  game: ZooGame,
  correctAnswers: number,
  totalAnswers: number,
  specialAchievements: string[] = [],
  ownedItems: string[] = []
): ZooGameReward {
  const config = GAME_REWARDS[game];
  const successRate = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

  // Basis-Münzen
  let coins = config.coinsPerGame;
  coins += correctAnswers * config.coinsPerCorrect;

  if (successRate >= 0.9) {
    coins = Math.floor(coins * config.bonusMultiplier);
  }

  // ITEM-BONI ANWENDEN! 🎉
  const bonuses = calculateActiveBonuses(ownedItems);

  // Münz-Bonus
  if (bonuses.coinBonus > 0) {
    coins = Math.floor(coins * (1 + bonuses.coinBonus / 100));
  }

  const animals: ZooAnimal[] = [];
  const allAnimals: ZooAnimal[] = [
    'lion', 'elephant', 'giraffe', 'zebra', 'rhino', 'hippo', 'cheetah', 'hyena', 'ostrich',
    'monkey', 'gorilla', 'orangutan', 'tiger', 'leopard', 'toucan', 'parrot', 'sloth',
    'penguin', 'polar_bear', 'seal', 'walrus', 'arctic_fox',
    'panda', 'red_panda', 'koala', 'peacock',
    'rabbit', 'fox', 'deer', 'hedgehog', 'owl',
    'camel', 'snake', 'scorpion', 'fennec_fox',
    'dolphin', 'shark', 'octopus', 'seahorse', 'turtle', 'jellyfish',
    'bat', 'raccoon', 'firefly',
    'kangaroo', 'wombat', 'platypus',
    'eagle', 'flamingo', 'swan'
  ];

  // Tier-Chance mit Item-Bonus! 🦁
  let animalChance = config.animalChance;
  if (bonuses.animalChanceBonus > 0) {
    animalChance = animalChance * (1 + bonuses.animalChanceBonus / 100);
  }

  if (correctAnswers > 0 && Math.random() < animalChance) {
    const userLevel = 1;
    const progressionAnimal = getAnimalByProgression(userLevel, animals);
    animals.push(progressionAnimal);
  }

  if (successRate === 1.0 && totalAnswers >= 5) {
    const userLevel = 1;
    const progressionAnimal = getAnimalByProgression(userLevel, animals);
    if (!animals.includes(progressionAnimal)) {
      animals.push(progressionAnimal);
    }
  }

  // Bonus-Tier bei hohem Glücks-Level! 😊
  if (bonuses.happinessBonus >= 100 && Math.random() < 0.3) {
    const userLevel = 1;
    const bonusAnimal = getAnimalByProgression(userLevel, animals);
    if (!animals.includes(bonusAnimal)) {
      animals.push(bonusAnimal);
    }
  }

  const badges: string[] = [...specialAchievements];

  // XP SYSTEM: Basis-XP aus config + Bonus bei hoher Erfolgsrate
  let experience = config.xp;
  if (successRate >= 0.9) {
    experience = Math.floor(experience * config.bonusMultiplier);
  }

  // Item-Bonus anwenden! ⭐
  if (bonuses.xpBonus > 0) {
    experience = Math.floor(experience * (1 + bonuses.xpBonus / 100));
  }

  return { coins, animals, badges, experience };
}

// 📊 Level-System
export function calculateLevel(experience: number): number {
  return Math.floor(experience / 100) + 1;
}

export function experienceToNextLevel(experience: number): number {
  const currentLevel = calculateLevel(experience);
  const nextLevelXP = currentLevel * 100;
  return nextLevelXP - experience;
}

// 🎯 TIER-PROGRESSION: Tiere nach Level freischalten (nur Empfehlung, nicht Restriktion!)
export const ANIMAL_PROGRESSION = {
  // Early Game (Level 1-30): Einfache, häufige Tiere (Präferenz)
  early: ['rabbit', 'fox', 'deer', 'hedgehog', 'owl', 'squirrel', 'badger', 'penguin', 'kangaroo', 'snake', 'camel', 'meerkat', 'firefly', 'raccoon', 'eagle'] as ZooAnimal[],
  
  // Mid Game (Level 31-70): Mittlere Rarity-Tiere (Präferenz)
  mid: ['tiger', 'panda', 'gorilla', 'monkey', 'toucan', 'parrot', 'sloth', 'jaguar', 'leopard', 'cheetah', 'lion', 'bear', 'dolphin', 'polar_bear', 'seal', 'orangutan', 'gibbon', 'lynx', 'eagle', 'macaw', 'walrus', 'bat', 'crocodile', 'alligator', 'poison_dart_frog', 'pelican', 'kingfisher', 'peacock', 'crane', 'hummingbird', 'swan', 'stork', 'tasmanian_devil', 'wombat', 'kiwi', 'beluga', 'sea_otter', 'manta_ray'] as ZooAnimal[],
  
  // Late Game (Level 71-100): Seltene & Legendäre Tiere (Präferenz)
  late: ['snow_leopard', 'clouded_leopard', 'golden_monkey', 'narwhal', 'orca', 'blue_whale', 'hammerhead_shark', 'platypus', 'komodo_dragon', 'red_panda', 'koala', 'giraffe', 'zebra', 'rhino', 'hippo', 'elephant', 'aye_aye', 'tarsier', 'giant_panda', 'snow_owl', 'arctic_hare', 'jellyfish', 'octopus', 'seahorse', 'turtle', 'clownfish', 'starfish', 'pufferfish', 'tapir', 'tree_frog', 'chameleon', 'gecko', 'praying_mantis', 'butterfly', 'ladybug', 'dragonfly', 'wildebeest', 'gazelle', 'antelope', 'buffalo', 'ostrich', 'hyena'] as ZooAnimal[]
};

// 🐾 Bestimme Tier basierend auf Level-Progression (BACKWARD COMPATIBLE!)
// ⚠️ WICHTIG: Dies ist eine SOFT-Progression (nur Empfehlung, nicht erzwungen)
// Alte Spieler mit Pandas auf Level 10 werden nicht blockiert!
// Neue Tiere bekommen intelligente Progressions-Verteilung
export function getAnimalByProgression(userLevel: number, collectedAnimals: ZooAnimal[] = []): ZooAnimal {
  let preferredPool: ZooAnimal[] = [];
  let backupPool: ZooAnimal[] = [];
  
  // Definiere Präferenz-Pool basierend auf Level
  if (userLevel <= 30) {
    preferredPool = ANIMAL_PROGRESSION.early;
    backupPool = [...ANIMAL_PROGRESSION.early, ...ANIMAL_PROGRESSION.mid]; // Early + Mid als Backup
  } else if (userLevel <= 70) {
    preferredPool = ANIMAL_PROGRESSION.mid;
    backupPool = [...ANIMAL_PROGRESSION.early, ...ANIMAL_PROGRESSION.mid, ...ANIMAL_PROGRESSION.late]; // Alle als Backup
  } else {
    preferredPool = ANIMAL_PROGRESSION.late;
    backupPool = [...ANIMAL_PROGRESSION.mid, ...ANIMAL_PROGRESSION.late]; // Mid + Late als Backup
  }
  
  // BACKWARD COMPATIBILITY: Versuche zuerst die bevorzugte Phase
  const availablePreferred = preferredPool.filter(a => !collectedAnimals.includes(a));
  if (availablePreferred.length > 0) {
    return availablePreferred[Math.floor(Math.random() * availablePreferred.length)];
  }
  
  // Fallback: Wenn alle bevorzugten Tiere schon gesammelt, nimm aus Backup
  // (IMPORTANT: Dieser Fall erlaubt alte Spieler mit "illegalen" Tieren zu behalten!)
  const availableBackup = backupPool.filter(a => !collectedAnimals.includes(a));
  if (availableBackup.length > 0) {
    return availableBackup[Math.floor(Math.random() * availableBackup.length)];
  }
  
  // Final Fallback: Irgendein Tier - respektiert aber Duplikate
  const allAnimals = [...preferredPool, ...backupPool];
  const remaining = allAnimals.filter(a => !collectedAnimals.includes(a));
  if (remaining.length > 0) {
    return remaining[Math.floor(Math.random() * remaining.length)];
  }
  
  // Letzter Resort: Random aus Backup
  return backupPool[Math.floor(Math.random() * backupPool.length)];
}

// 🎨 Tier-Emoji & Namen Helper
export const ANIMAL_EMOJIS: Record<ZooAnimal, string> = {
  // Savanne
  lion: '🦁', elephant: '🐘', giraffe: '🦒', zebra: '🦓', rhino: '🦏', hippo: '🦛',
  cheetah: '🐆', hyena: '🐕', ostrich: '🦤',
  // Dschungel
  monkey: '🐵', gorilla: '🦍', orangutan: '🦧', tiger: '🐅', leopard: '🐆',
  toucan: '🦜', parrot: '🦜', sloth: '🦥',
  // Arktis
  penguin: '🐧', polar_bear: '🐻‍❄️', seal: '🦭', walrus: '🦭', arctic_fox: '🦊',
  // Bambuswald
  panda: '🐼', red_panda: '🐾', koala: '🐨', peacock: '🦚',
  // Wiese
  rabbit: '🐰', fox: '🦊', deer: '🦌', hedgehog: '🦔', owl: '🦉',
  // Wüste
  camel: '🐪', snake: '🐍', scorpion: '🦂', fennec_fox: '🦊',
  // Ozean
  dolphin: '🐬', shark: '🦈', octopus: '🐙', seahorse: '🐴', turtle: '🐢', jellyfish: '🪼',
  // Nachthaus
  bat: '🦇', raccoon: '🦝', firefly: '🔥',
  // Australien
  kangaroo: '🦘', wombat: '🦫', platypus: '🦆',
  // Vögel
  eagle: '🦅', flamingo: '🦩', swan: '🦢',
  pelican: '🦜', stork: '🦢', crane: '🦩', hummingbird: '🐦', kingfisher: '🐦', hornbill: '🦜',
  // Neue Savannentiere
  meerkat: '🦦', buffalo: '🐃', antelope: '🦌', wildebeest: '🦌', gazelle: '🦌',
  // Neue Dschungeltiere
  jaguar: '🐆', tapir: '🦏', macaw: '🦜', tree_frog: '🐸', chameleon: '🦎', gibbon: '🦧',
  // Neue Arktistiere
  reindeer: '🦌', narwhal: '🐋', beluga: '🐋', snow_owl: '🦉', arctic_hare: '🐇',
  // Neue Bambuswald-Tiere
  snow_leopard: '🐆', clouded_leopard: '🐆', golden_monkey: '🐵',
  // Neue Wiesen-Tiere
  squirrel: '🐿️', badger: '🦡', wild_boar: '🐗', lynx: '🐈', beaver: '🦫',
  // Neue Wüstentiere
  roadrunner: '🐦', desert_tortoise: '🐢', iguana: '🦎', vulture: '🦅',
  // Neue Ozean-Tiere
  orca: '🐋', manta_ray: '🐟', clownfish: '🐠', sea_otter: '🦦', manatee: '🦭', starfish: '⭐',
  blue_whale: '🐋', hammerhead_shark: '🦈', pufferfish: '🐡',
  // Neue Nachthaus-Tiere
  sugar_glider: '🦦', kiwi: '🐦', tarsier: '🐒', aye_aye: '🐒',
  // Neue Australien-Tiere
  tasmanian_devil: '🦘', echidna: '🦔', wallaby: '🦘', kookaburra: '🐦',
  // Reptilien & Amphibien
  crocodile: '🐊', alligator: '🐊', komodo_dragon: '🦎', gecko: '🦎', poison_dart_frog: '🐸',
  // Insekten
  butterfly: '🦋', ladybug: '🐞', dragonfly: '🦗', praying_mantis: '🦗'
};

export const ANIMAL_NAMES: Record<ZooAnimal, string> = {
  // Savanne
  lion: 'Löwe', elephant: 'Elefant', giraffe: 'Giraffe', zebra: 'Zebra',
  rhino: 'Nashorn', hippo: 'Nilpferd', cheetah: 'Gepard', hyena: 'Hyäne', ostrich: 'Strauß',
  // Dschungel
  monkey: 'Affe', gorilla: 'Gorilla', orangutan: 'Orang-Utan', tiger: 'Tiger', leopard: 'Leopard',
  toucan: 'Tukan', parrot: 'Papagei', sloth: 'Faultier',
  // Arktis
  penguin: 'Pinguin', polar_bear: 'Eisbär', seal: 'Robbe', walrus: 'Walross', arctic_fox: 'Polarfuchs',
  // Bambuswald
  panda: 'Panda', red_panda: 'Roter Panda', koala: 'Koala', peacock: 'Pfau',
  // Wiese
  rabbit: 'Hase', fox: 'Fuchs', deer: 'Reh', hedgehog: 'Igel', owl: 'Eule',
  // Wüste
  camel: 'Kamel', snake: 'Schlange', scorpion: 'Skorpion', fennec_fox: 'Wüstenfuchs',
  // Ozean
  dolphin: 'Delfin', shark: 'Hai', octopus: 'Oktopus', seahorse: 'Seepferdchen',
  turtle: 'Schildkröte', jellyfish: 'Qualle',
  // Nachthaus
  bat: 'Fledermaus', raccoon: 'Waschbär', firefly: 'Glühwürmchen',
  // Australien
  kangaroo: 'Känguru', wombat: 'Wombat', platypus: 'Schnabeltier',
  // Vögel
  eagle: 'Adler', flamingo: 'Flamingo', swan: 'Schwan',
  pelican: 'Pelikan', stork: 'Storch', crane: 'Kranich', hummingbird: 'Kolibri',
  kingfisher: 'Eisvogel', hornbill: 'Nashornvogel',
  // Neue Savannentiere
  meerkat: 'Erdmännchen', buffalo: 'Büffel', antelope: 'Antilope',
  wildebeest: 'Gnu', gazelle: 'Gazelle',
  // Neue Dschungeltiere
  jaguar: 'Jaguar', tapir: 'Tapir', macaw: 'Ara', tree_frog: 'Baumfrosch',
  chameleon: 'Chamäleon', gibbon: 'Gibbon',
  // Neue Arktistiere
  reindeer: 'Rentier', narwhal: 'Narwal', beluga: 'Beluga',
  snow_owl: 'Schneeeule', arctic_hare: 'Schneehase',
  // Neue Bambuswald-Tiere
  snow_leopard: 'Schneeleopard', clouded_leopard: 'Nebelparder', golden_monkey: 'Goldaffe',
  // Neue Wiesen-Tiere
  squirrel: 'Eichhörnchen', badger: 'Dachs', wild_boar: 'Wildschwein',
  lynx: 'Luchs', beaver: 'Biber',
  // Neue Wüstentiere
  roadrunner: 'Rennkuckuck', desert_tortoise: 'Wüstenschildkröte',
  iguana: 'Leguan', vulture: 'Geier',
  // Neue Ozean-Tiere
  orca: 'Orca', manta_ray: 'Mantarochen', clownfish: 'Clownfisch',
  sea_otter: 'Seeotter', manatee: 'Seekuh', starfish: 'Seestern',
  blue_whale: 'Blauwal', hammerhead_shark: 'Hammerhai', pufferfish: 'Kugelfisch',
  // Neue Nachthaus-Tiere
  sugar_glider: 'Gleithörnchen', kiwi: 'Kiwi', tarsier: 'Koboldmaki', aye_aye: 'Fingertier',
  // Neue Australien-Tiere
  tasmanian_devil: 'Beutelteufel', echidna: 'Ameisenigel',
  wallaby: 'Wallaby', kookaburra: 'Kookaburra',
  // Reptilien & Amphibien
  crocodile: 'Krokodil', alligator: 'Alligator', komodo_dragon: 'Komodowaran',
  gecko: 'Gecko', poison_dart_frog: 'Pfeilgiftfrosch',
  // Insekten
  butterfly: 'Schmetterling', ladybug: 'Marienkäfer',
  dragonfly: 'Libelle', praying_mantis: 'Gottesanbeterin'
};

// 🌍 Umfassende Tier-Informationen mit Kontinent und Gruppe
export const ANIMAL_INFO: AnimalInfo[] = [
  // Afrika
  { type: 'lion', name: 'Löwe', emoji: '🦁', continent: 'Afrika', group: 'Raubkatzen' },
  { type: 'elephant', name: 'Elefant', emoji: '🐘', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'giraffe', name: 'Giraffe', emoji: '🦒', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'zebra', name: 'Zebra', emoji: '🦓', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'rhino', name: 'Nashorn', emoji: '🦏', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'hippo', name: 'Nilpferd', emoji: '🦛', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'cheetah', name: 'Gepard', emoji: '🐆', continent: 'Afrika', group: 'Raubkatzen' },
  { type: 'hyena', name: 'Hyäne', emoji: '🐕', continent: 'Afrika', group: 'Raubkatzen' },
  { type: 'ostrich', name: 'Strauß', emoji: '🦤', continent: 'Afrika', group: 'Vögel' },
  { type: 'leopard', name: 'Leopard', emoji: '🐆', continent: 'Afrika', group: 'Raubkatzen' },
  { type: 'flamingo', name: 'Flamingo', emoji: '🦩', continent: 'Afrika', group: 'Vögel' },
  { type: 'camel', name: 'Kamel', emoji: '🐪', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'scorpion', name: 'Skorpion', emoji: '🦂', continent: 'Afrika', group: 'Reptilien' },
  { type: 'fennec_fox', name: 'Wüstenfuchs', emoji: '🦊', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'meerkat', name: 'Erdmännchen', emoji: '🦦', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'buffalo', name: 'Büffel', emoji: '🐃', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'antelope', name: 'Antilope', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'wildebeest', name: 'Gnu', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'gazelle', name: 'Gazelle', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'chameleon', name: 'Chamäleon', emoji: '🦎', continent: 'Afrika', group: 'Reptilien' },
  { type: 'vulture', name: 'Geier', emoji: '🦅', continent: 'Afrika', group: 'Vögel' },
  { type: 'crocodile', name: 'Krokodil', emoji: '🐊', continent: 'Afrika', group: 'Reptilien' },
  { type: 'gorilla', name: 'Gorilla', emoji: '🦍', continent: 'Afrika', group: 'Affen' },
  { type: 'aye_aye', name: 'Fingertier', emoji: '🐒', continent: 'Afrika', group: 'Affen' },

  // Asien
  { type: 'tiger', name: 'Tiger', emoji: '🐅', continent: 'Asien', group: 'Raubkatzen' },
  { type: 'panda', name: 'Panda', emoji: '🐼', continent: 'Asien', group: 'Grosstiere' },
  { type: 'red_panda', name: 'Roter Panda', emoji: '🐾', continent: 'Asien', group: 'Grosstiere' },
  { type: 'peacock', name: 'Pfau', emoji: '🦚', continent: 'Asien', group: 'Vögel' },
  { type: 'snake', name: 'Schlange', emoji: '🐍', continent: 'Asien', group: 'Reptilien' },
  { type: 'orangutan', name: 'Orang-Utan', emoji: '🦧', continent: 'Asien', group: 'Affen' },
  { type: 'gibbon', name: 'Gibbon', emoji: '🦧', continent: 'Asien', group: 'Affen' },
  { type: 'snow_leopard', name: 'Schneeleopard', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen' },
  { type: 'clouded_leopard', name: 'Nebelparder', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen' },
  { type: 'golden_monkey', name: 'Goldaffe', emoji: '🐵', continent: 'Asien', group: 'Affen' },
  { type: 'komodo_dragon', name: 'Komodowaran', emoji: '🦎', continent: 'Asien', group: 'Reptilien' },
  { type: 'gecko', name: 'Gecko', emoji: '🦎', continent: 'Asien', group: 'Reptilien' },
  { type: 'praying_mantis', name: 'Gottesanbeterin', emoji: '🦗', continent: 'Asien', group: 'Grosstiere' },
  { type: 'tarsier', name: 'Koboldmaki', emoji: '🐒', continent: 'Asien', group: 'Affen' },
  { type: 'crane', name: 'Kranich', emoji: '🦩', continent: 'Asien', group: 'Vögel' },

  // Amerika
  { type: 'monkey', name: 'Affe', emoji: '🐵', continent: 'Amerika', group: 'Affen' },
  { type: 'toucan', name: 'Tukan', emoji: '🦜', continent: 'Amerika', group: 'Vögel' },
  { type: 'parrot', name: 'Papagei', emoji: '🦜', continent: 'Amerika', group: 'Vögel' },
  { type: 'sloth', name: 'Faultier', emoji: '🦥', continent: 'Amerika', group: 'Grosstiere' },
  { type: 'bat', name: 'Fledermaus', emoji: '🦇', continent: 'Amerika', group: 'Vögel' },
  { type: 'raccoon', name: 'Waschbär', emoji: '🦝', continent: 'Amerika', group: 'Grosstiere' },
  { type: 'jaguar', name: 'Jaguar', emoji: '🐆', continent: 'Amerika', group: 'Raubkatzen' },
  { type: 'tapir', name: 'Tapir', emoji: '🦏', continent: 'Amerika', group: 'Grosstiere' },
  { type: 'macaw', name: 'Ara', emoji: '🦜', continent: 'Amerika', group: 'Vögel' },
  { type: 'tree_frog', name: 'Baumfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien' },
  { type: 'roadrunner', name: 'Rennkuckuck', emoji: '🐦', continent: 'Amerika', group: 'Vögel' },
  { type: 'desert_tortoise', name: 'Wüstenschildkröte', emoji: '🐢', continent: 'Amerika', group: 'Reptilien' },
  { type: 'iguana', name: 'Leguan', emoji: '🦎', continent: 'Amerika', group: 'Reptilien' },
  { type: 'alligator', name: 'Alligator', emoji: '🐊', continent: 'Amerika', group: 'Reptilien' },
  { type: 'poison_dart_frog', name: 'Pfeilgiftfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien' },
  { type: 'pelican', name: 'Pelikan', emoji: '🦜', continent: 'Amerika', group: 'Vögel' },
  { type: 'hummingbird', name: 'Kolibri', emoji: '🐦', continent: 'Amerika', group: 'Vögel' },

  // Europa
  { type: 'rabbit', name: 'Hase', emoji: '🐰', continent: 'Europa', group: 'Grosstiere' },
  { type: 'fox', name: 'Fuchs', emoji: '🦊', continent: 'Europa', group: 'Grosstiere' },
  { type: 'deer', name: 'Reh', emoji: '🦌', continent: 'Europa', group: 'Grosstiere' },
  { type: 'hedgehog', name: 'Igel', emoji: '🦔', continent: 'Europa', group: 'Grosstiere' },
  { type: 'owl', name: 'Eule', emoji: '🦉', continent: 'Europa', group: 'Vögel' },
  { type: 'swan', name: 'Schwan', emoji: '🦢', continent: 'Europa', group: 'Vögel' },
  { type: 'eagle', name: 'Adler', emoji: '🦅', continent: 'Europa', group: 'Vögel' },
  { type: 'firefly', name: 'Glühwürmchen', emoji: '🔥', continent: 'Europa', group: 'Grosstiere' },
  { type: 'squirrel', name: 'Eichhörnchen', emoji: '🐿️', continent: 'Europa', group: 'Grosstiere' },
  { type: 'badger', name: 'Dachs', emoji: '🦡', continent: 'Europa', group: 'Grosstiere' },
  { type: 'wild_boar', name: 'Wildschwein', emoji: '🐗', continent: 'Europa', group: 'Grosstiere' },
  { type: 'lynx', name: 'Luchs', emoji: '🐈', continent: 'Europa', group: 'Raubkatzen' },
  { type: 'beaver', name: 'Biber', emoji: '🦫', continent: 'Europa', group: 'Grosstiere' },
  { type: 'reindeer', name: 'Rentier', emoji: '🦌', continent: 'Europa', group: 'Grosstiere' },
  { type: 'snow_owl', name: 'Schneeeule', emoji: '🦉', continent: 'Europa', group: 'Vögel' },
  { type: 'arctic_hare', name: 'Schneehase', emoji: '🐇', continent: 'Europa', group: 'Grosstiere' },
  { type: 'butterfly', name: 'Schmetterling', emoji: '🦋', continent: 'Europa', group: 'Grosstiere' },
  { type: 'ladybug', name: 'Marienkäfer', emoji: '🐞', continent: 'Europa', group: 'Grosstiere' },
  { type: 'dragonfly', name: 'Libelle', emoji: '🦗', continent: 'Europa', group: 'Grosstiere' },
  { type: 'stork', name: 'Storch', emoji: '🦢', continent: 'Europa', group: 'Vögel' },
  { type: 'kingfisher', name: 'Eisvogel', emoji: '🐦', continent: 'Europa', group: 'Vögel' },
  { type: 'hornbill', name: 'Nashornvogel', emoji: '🦜', continent: 'Europa', group: 'Vögel' },

  // Australien
  { type: 'kangaroo', name: 'Känguru', emoji: '🦘', continent: 'Australien', group: 'Grosstiere' },
  { type: 'koala', name: 'Koala', emoji: '🐨', continent: 'Australien', group: 'Grosstiere' },
  { type: 'wombat', name: 'Wombat', emoji: '🦫', continent: 'Australien', group: 'Grosstiere' },
  { type: 'platypus', name: 'Schnabeltier', emoji: '🦆', continent: 'Australien', group: 'Grosstiere' },
  { type: 'sugar_glider', name: 'Gleithörnchen', emoji: '🦦', continent: 'Australien', group: 'Grosstiere' },
  { type: 'kiwi', name: 'Kiwi', emoji: '🐦', continent: 'Australien', group: 'Vögel' },
  { type: 'tasmanian_devil', name: 'Beutelteufel', emoji: '🦘', continent: 'Australien', group: 'Grosstiere' },
  { type: 'echidna', name: 'Ameisenigel', emoji: '🦔', continent: 'Australien', group: 'Grosstiere' },
  { type: 'wallaby', name: 'Wallaby', emoji: '🦘', continent: 'Australien', group: 'Grosstiere' },
  { type: 'kookaburra', name: 'Kookaburra', emoji: '🐦', continent: 'Australien', group: 'Vögel' },

  // Ozean / Wassertiere
  { type: 'dolphin', name: 'Delfin', emoji: '🐬', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'shark', name: 'Hai', emoji: '🦈', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'octopus', name: 'Oktopus', emoji: '🐙', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'seahorse', name: 'Seepferdchen', emoji: '🐴', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'turtle', name: 'Schildkröte', emoji: '🐢', continent: 'Ozean', group: 'Reptilien' },
  { type: 'jellyfish', name: 'Qualle', emoji: '🪼', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'penguin', name: 'Pinguin', emoji: '🐧', continent: 'Ozean', group: 'Vögel' },
  { type: 'polar_bear', name: 'Eisbär', emoji: '🐻‍❄️', continent: 'Ozean', group: 'Grosstiere' },
  { type: 'seal', name: 'Robbe', emoji: '🦭', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'walrus', name: 'Walross', emoji: '🦭', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'arctic_fox', name: 'Polarfuchs', emoji: '🦊', continent: 'Ozean', group: 'Grosstiere' },
  { type: 'narwhal', name: 'Narwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'beluga', name: 'Beluga', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'orca', name: 'Orca', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'manta_ray', name: 'Mantarochen', emoji: '🐟', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'clownfish', name: 'Clownfisch', emoji: '🐠', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'sea_otter', name: 'Seeotter', emoji: '🦦', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'manatee', name: 'Seekuh', emoji: '🦭', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'starfish', name: 'Seestern', emoji: '⭐', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'blue_whale', name: 'Blauwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'hammerhead_shark', name: 'Hammerhai', emoji: '🦈', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'pufferfish', name: 'Kugelfisch', emoji: '🐡', continent: 'Ozean', group: 'Wassertiere' },

  // NEW ANIMALS
  { type: 'meerkat', name: 'Erdmännchen', emoji: '🦦', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'buffalo', name: 'Büffel', emoji: '🐃', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'antelope', name: 'Antilope', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'wildebeest', name: 'Gnu', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'gazelle', name: 'Gazelle', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere' },
  { type: 'jaguar', name: 'Jaguar', emoji: '🐆', continent: 'Amerika', group: 'Raubkatzen' },
  { type: 'tapir', name: 'Tapir', emoji: '🦏', continent: 'Amerika', group: 'Grosstiere' },
  { type: 'macaw', name: 'Ara', emoji: '🦜', continent: 'Amerika', group: 'Vögel' },
  { type: 'tree_frog', name: 'Baumfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien' },
  { type: 'chameleon', name: 'Chamäleon', emoji: '🦎', continent: 'Afrika', group: 'Reptilien' },
  { type: 'gibbon', name: 'Gibbon', emoji: '🦧', continent: 'Asien', group: 'Affen' },
  { type: 'reindeer', name: 'Rentier', emoji: '🦌', continent: 'Europa', group: 'Grosstiere' },
  { type: 'narwhal', name: 'Narwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'beluga', name: 'Beluga', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'snow_owl', name: 'Schneeeule', emoji: '🦉', continent: 'Europa', group: 'Vögel' },
  { type: 'arctic_hare', name: 'Schneehase', emoji: '🐇', continent: 'Europa', group: 'Grosstiere' },
  { type: 'snow_leopard', name: 'Schneeleopard', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen' },
  { type: 'clouded_leopard', name: 'Nebelparder', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen' },
  { type: 'golden_monkey', name: 'Goldaffe', emoji: '🐵', continent: 'Asien', group: 'Affen' },
  { type: 'squirrel', name: 'Eichhörnchen', emoji: '🐿️', continent: 'Europa', group: 'Grosstiere' },
  { type: 'badger', name: 'Dachs', emoji: '🦡', continent: 'Europa', group: 'Grosstiere' },
  { type: 'wild_boar', name: 'Wildschwein', emoji: '🐗', continent: 'Europa', group: 'Grosstiere' },
  { type: 'lynx', name: 'Luchs', emoji: '🐈', continent: 'Europa', group: 'Raubkatzen' },
  { type: 'beaver', name: 'Biber', emoji: '🦫', continent: 'Europa', group: 'Grosstiere' },
  { type: 'roadrunner', name: 'Rennkuckuck', emoji: '🐦', continent: 'Amerika', group: 'Vögel' },
  { type: 'desert_tortoise', name: 'Wüstenschildkröte', emoji: '🐢', continent: 'Amerika', group: 'Reptilien' },
  { type: 'iguana', name: 'Leguan', emoji: '🦎', continent: 'Amerika', group: 'Reptilien' },
  { type: 'vulture', name: 'Geier', emoji: '🦅', continent: 'Afrika', group: 'Vögel' },
  { type: 'orca', name: 'Orca', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'manta_ray', name: 'Mantarochen', emoji: '🐟', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'clownfish', name: 'Clownfisch', emoji: '🐠', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'sea_otter', name: 'Seeotter', emoji: '🦦', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'manatee', name: 'Seekuh', emoji: '🦭', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'starfish', name: 'Seestern', emoji: '⭐', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'blue_whale', name: 'Blauwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'hammerhead_shark', name: 'Hammerhai', emoji: '🦈', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'pufferfish', name: 'Kugelfisch', emoji: '🐡', continent: 'Ozean', group: 'Wassertiere' },
  { type: 'sugar_glider', name: 'Gleithörnchen', emoji: '🦦', continent: 'Australien', group: 'Grosstiere' },
  { type: 'kiwi', name: 'Kiwi', emoji: '🐦', continent: 'Australien', group: 'Vögel' },
  { type: 'tarsier', name: 'Koboldmaki', emoji: '🐒', continent: 'Asien', group: 'Affen' },
  { type: 'aye_aye', name: 'Fingertier', emoji: '🐒', continent: 'Afrika', group: 'Affen' },
  { type: 'tasmanian_devil', name: 'Beutelteufel', emoji: '🦘', continent: 'Australien', group: 'Grosstiere' },
  { type: 'echidna', name: 'Ameisenigel', emoji: '🦔', continent: 'Australien', group: 'Grosstiere' },
  { type: 'wallaby', name: 'Wallaby', emoji: '🦘', continent: 'Australien', group: 'Grosstiere' },
  { type: 'kookaburra', name: 'Kookaburra', emoji: '🐦', continent: 'Australien', group: 'Vögel' },
  { type: 'crocodile', name: 'Krokodil', emoji: '🐊', continent: 'Afrika', group: 'Reptilien' },
  { type: 'alligator', name: 'Alligator', emoji: '🐊', continent: 'Amerika', group: 'Reptilien' },
  { type: 'komodo_dragon', name: 'Komodowaran', emoji: '🦎', continent: 'Asien', group: 'Reptilien' },
  { type: 'gecko', name: 'Gecko', emoji: '🦎', continent: 'Asien', group: 'Reptilien' },
  { type: 'poison_dart_frog', name: 'Pfeilgiftfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien' },
  { type: 'butterfly', name: 'Schmetterling', emoji: '🦋', continent: 'Europa', group: 'Grosstiere' },
  { type: 'ladybug', name: 'Marienkäfer', emoji: '🐞', continent: 'Europa', group: 'Grosstiere' },
  { type: 'dragonfly', name: 'Libelle', emoji: '🦗', continent: 'Europa', group: 'Grosstiere' },
  { type: 'praying_mantis', name: 'Gottesanbeterin', emoji: '🦗', continent: 'Asien', group: 'Grosstiere' },
];

// 🦁 Tier-Fakten (Gewicht, Größe, Eigenschaften)
export const ANIMAL_FACTS: Record<ZooAnimal, {
  weight: string;
  size: string;
  diet: string;
  habitat: string;
  specialTrait: string;
  funFact: string;
}> = {
  lion: {
    weight: '190 kg', size: '1,2 m hoch', diet: 'Fleischfresser',
    habitat: 'Savanne', specialTrait: 'König der Tiere',
    funFact: 'Löwen schlafen bis zu 20 Stunden am Tag!'
  },
  elephant: {
    weight: '6000 kg', size: '3 m hoch', diet: 'Pflanzenfresser',
    habitat: 'Savanne', specialTrait: 'Grösstes Landtier',
    funFact: 'Elefanten haben ein fantastisches Gedächtnis!'
  },
  giraffe: {
    weight: '1200 kg', size: '5,5 m hoch', diet: 'Pflanzenfresser',
    habitat: 'Savanne', specialTrait: 'Längster Hals',
    funFact: 'Giraffen brauchen nur 30 Minuten Schlaf pro Tag!'
  },
  panda: {
    weight: '100 kg', size: '90 cm', diet: 'Bambus',
    habitat: 'Bambuswald', specialTrait: 'Niedlichstes Tier',
    funFact: 'Pandas essen 12 Stunden am Tag Bambus!'
  },
  penguin: {
    weight: '25 kg', size: '70 cm', diet: 'Fisch',
    habitat: 'Antarktis', specialTrait: 'Kann nicht fliegen',
    funFact: 'Pinguine können unter Wasser "fliegen"!'
  },
  dolphin: {
    weight: '200 kg', size: '2,5 m', diet: 'Fisch',
    habitat: 'Ozean', specialTrait: 'Super intelligent',
    funFact: 'Delfine haben Namen füreinander!'
  },
  // Weitere Tiere - gekürzt für Übersicht
  zebra: { weight: '350 kg', size: '1,5 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Streifen wie Fingerabdruck', funFact: 'Jedes Zebra hat einzigartige Streifen!' },
  monkey: { weight: '10 kg', size: '50 cm', diet: 'Früchte', habitat: 'Dschungel', specialTrait: 'Sehr verspielt', funFact: 'Affen nutzen Werkzeuge!' },
  tiger: { weight: '250 kg', size: '1,1 m', diet: 'Fleisch', habitat: 'Dschungel', specialTrait: 'Stärkste Katze', funFact: 'Tiger sind Einzelgänger!' },
  polar_bear: { weight: '500 kg', size: '2,5 m', diet: 'Robben', habitat: 'Arktis', specialTrait: 'Grösster Bär', funFact: 'Eisbären sind ausgezeichnete Schwimmer!' },
  koala: { weight: '12 kg', size: '60 cm', diet: 'Eukalyptus', habitat: 'Australien', specialTrait: 'Schläft 20h/Tag', funFact: 'Koalas schlafen fast den ganzen Tag!' },
  kangaroo: { weight: '85 kg', size: '1,8 m', diet: 'Gras', habitat: 'Australien', specialTrait: 'Hüpft schnell', funFact: 'Kängurus können 9 Meter weit springen!' },
  shark: { weight: '1000 kg', size: '4 m', diet: 'Fisch', habitat: 'Ozean', specialTrait: 'Perfekter Jäger', funFact: 'Haie haben mehrere Zahnreihen!' },
  eagle: { weight: '6 kg', size: '90 cm', diet: 'Fleisch', habitat: 'Berge', specialTrait: 'Scharfe Augen', funFact: 'Adler sehen 4x schärfer als Menschen!' },
  // Weitere werden ähnlich ergänzt...
  rhino: { weight: '2300 kg', size: '1,8 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Dickes Horn', funFact: 'Nashörner sind fast blind!' },
  hippo: { weight: '1500 kg', size: '1,5 m', diet: 'Gras', habitat: 'Fluss', specialTrait: 'Gefährlich', funFact: 'Flusspferde sind sehr aggressiv!' },
  cheetah: { weight: '60 kg', size: '80 cm', diet: 'Fleisch', habitat: 'Savanne', specialTrait: 'Schnellstes Tier', funFact: 'Geparden laufen 120 km/h!' },
  hyena: { weight: '70 kg', size: '85 cm', diet: 'Fleisch', habitat: 'Savanne', specialTrait: 'Lacht', funFact: 'Hyänen jagen in Gruppen!' },
  ostrich: { weight: '130 kg', size: '2,7 m', diet: 'Pflanzen', habitat: 'Savanne', specialTrait: 'Grösster Vogel', funFact: 'Strausse können 70 km/h laufen!' },
  gorilla: { weight: '200 kg', size: '1,7 m', diet: 'Pflanzen', habitat: 'Dschungel', specialTrait: 'Sehr stark', funFact: 'Gorillas sind sanfte Riesen!' },
  orangutan: { weight: '75 kg', size: '1,4 m', diet: 'Früchte', habitat: 'Dschungel', specialTrait: 'Intelligentes Tier', funFact: 'Orang-Utans bauen Nester!' },
  leopard: { weight: '70 kg', size: '70 cm', diet: 'Fleisch', habitat: 'Dschungel', specialTrait: 'Guter Kletterer', funFact: 'Leoparden schleppen Beute auf Bäume!' },
  toucan: { weight: '0,5 kg', size: '55 cm', diet: 'Früchte', habitat: 'Regenwald', specialTrait: 'Bunter Schnabel', funFact: 'Tukane haben hohle Schnäbel!' },
  parrot: { weight: '1 kg', size: '40 cm', diet: 'Nüsse', habitat: 'Regenwald', specialTrait: 'Kann sprechen', funFact: 'Papageien können 100 Wörter lernen!' },
  sloth: { weight: '5 kg', size: '60 cm', diet: 'Blätter', habitat: 'Regenwald', specialTrait: 'Super langsam', funFact: 'Faultiere bewegen sich nur 40m pro Tag!' },
  seal: { weight: '100 kg', size: '1,5 m', diet: 'Fisch', habitat: 'Antarktis', specialTrait: 'Guter Schwimmer', funFact: 'Robben können 30 Minuten tauchen!' },
  walrus: { weight: '1200 kg', size: '3 m', diet: 'Muscheln', habitat: 'Arktis', specialTrait: 'Lange Stoßzähne', funFact: 'Walrosse nutzen ihre Zähne zum Klettern!' },
  arctic_fox: { weight: '6 kg', size: '50 cm', diet: 'Fleisch', habitat: 'Arktis', specialTrait: 'Warmes Fell', funFact: 'Polarfüchse überleben -70°C!' },
  red_panda: { weight: '6 kg', size: '60 cm', diet: 'Bambus', habitat: 'Berge', specialTrait: 'Roter Schwanz', funFact: 'Rote Pandas sind Kletterkünstler!' },
  peacock: { weight: '5 kg', size: '1 m', diet: 'Samen', habitat: 'Indien', specialTrait: 'Prachtvolles Gefieder', funFact: 'Nur männliche Pfauen haben bunte Federn!' },
  rabbit: { weight: '2 kg', size: '40 cm', diet: 'Karotten', habitat: 'Wiese', specialTrait: 'Lange Ohren', funFact: 'Hasen können 360° sehen!' },
  fox: { weight: '8 kg', size: '40 cm', diet: 'Allesfresser', habitat: 'Wald', specialTrait: 'Schlau', funFact: 'Füchse hören Mäuse unter Schnee!' },
  deer: { weight: '100 kg', size: '1,2 m', diet: 'Gras', habitat: 'Wald', specialTrait: 'Geweih', funFact: 'Rehe können 3 Meter hoch springen!' },
  hedgehog: { weight: '1 kg', size: '25 cm', diet: 'Insekten', habitat: 'Garten', specialTrait: 'Stacheln', funFact: 'Igel haben 5000 Stacheln!' },
  owl: { weight: '2 kg', size: '50 cm', diet: 'Mäuse', habitat: 'Wald', specialTrait: 'Nachtaktiv', funFact: 'Eulen können ihren Kopf 270° drehen!' },
  camel: { weight: '600 kg', size: '2 m', diet: 'Pflanzen', habitat: 'Wüste', specialTrait: 'Wasserspeicher', funFact: 'Kamele können 2 Wochen ohne Wasser!' },
  snake: { weight: '10 kg', size: '3 m', diet: 'Fleisch', habitat: 'Wüste', specialTrait: 'Keine Beine', funFact: 'Schlangen riechen mit der Zunge!' },
  scorpion: { weight: '0,05 kg', size: '10 cm', diet: 'Insekten', habitat: 'Wüste', specialTrait: 'Giftiger Stachel', funFact: 'Skorpione leuchten unter UV-Licht!' },
  fennec_fox: { weight: '1,5 kg', size: '30 cm', diet: 'Insekten', habitat: 'Wüste', specialTrait: 'Riesenohren', funFact: 'Wüstenfüchse hören Insekten unter Sand!' },
  octopus: { weight: '15 kg', size: '1 m', diet: 'Krabben', habitat: 'Ozean', specialTrait: '8 Arme', funFact: 'Oktopusse haben 3 Herzen!' },
  seahorse: { weight: '0,01 kg', size: '15 cm', diet: 'Plankton', habitat: 'Ozean', specialTrait: 'Männchen gebären', funFact: 'Seepferdchen-Männchen tragen die Babys!' },
  turtle: { weight: '200 kg', size: '1 m', diet: 'Quallen', habitat: 'Ozean', specialTrait: 'Alter Panzer', funFact: 'Schildkröten können 100 Jahre alt werden!' },
  jellyfish: { weight: '0,2 kg', size: '40 cm', diet: 'Plankton', habitat: 'Ozean', specialTrait: 'Durchsichtig', funFact: 'Quallen haben kein Gehirn!' },
  bat: { weight: '0,02 kg', size: '15 cm', diet: 'Insekten', habitat: 'Höhlen', specialTrait: 'Echolot', funFact: 'Fledermäuse "sehen" mit Schall!' },
  raccoon: { weight: '10 kg', size: '60 cm', diet: 'Allesfresser', habitat: 'Wald', specialTrait: 'Geschickte Pfoten', funFact: 'Waschbären waschen ihr Essen!' },
  firefly: { weight: '0,001 kg', size: '2 cm', diet: 'Nektar', habitat: 'Wiese', specialTrait: 'Leuchtet', funFact: 'Glühwürmchen produzieren kaltes Licht!' },
  wombat: { weight: '35 kg', size: '1 m', diet: 'Gras', habitat: 'Australien', specialTrait: 'Gräbt Höhlen', funFact: 'Wombats machen würfelförmigen Kot!' },
  platypus: { weight: '2 kg', size: '50 cm', diet: 'Würmer', habitat: 'Fluss', specialTrait: 'Ente+Biber', funFact: 'Schnabeltiere sind Säugetiere die Eier legen!' },
  flamingo: { weight: '3 kg', size: '1,5 m', diet: 'Algen', habitat: 'See', specialTrait: 'Rosa Gefieder', funFact: 'Flamingos sind rosa durch ihre Nahrung!' },
  swan: { weight: '12 kg', size: '1,5 m', diet: 'Pflanzen', habitat: 'See', specialTrait: 'Eleganter Hals', funFact: 'Schwäne bleiben ein Leben lang zusammen!' },
  
  // Alle fehlenden Tiere - KOMPLETT
  meerkat: { weight: '0,8 kg', size: '30 cm', diet: 'Insekten', habitat: 'Savanne', specialTrait: 'Steht Wache', funFact: 'Erdmännchen stehen auf Wachtposten!' },
  buffalo: { weight: '900 kg', size: '1,7 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Massive Hörner', funFact: 'Büffel sind schneller als sie aussehen!' },
  antelope: { weight: '80 kg', size: '1,5 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Schnelle Läufer', funFact: 'Antilopen können 100 km/h sprinten!' },
  wildebeest: { weight: '250 kg', size: '1,4 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Wandernde Herden', funFact: 'Gnus machen Jahresmigrationen!' },
  gazelle: { weight: '30 kg', size: '1 m', diet: 'Gras', habitat: 'Savanne', specialTrait: 'Springt hoch', funFact: 'Gazellen springen 2 Meter hoch!' },
  
  jaguar: { weight: '100 kg', size: '1,7 m', diet: 'Fleisch', habitat: 'Dschungel', specialTrait: 'Mächtige Klauen', funFact: 'Jaguare sind die stärksten Raubkatzen!' },
  tapir: { weight: '300 kg', size: '1 m', diet: 'Pflanzen', habitat: 'Dschungel', specialTrait: 'Rüssel', funFact: 'Tapire nutzen ihren Rüssel zum Greifen!' },
  macaw: { weight: '1,2 kg', size: '90 cm', diet: 'Nüsse', habitat: 'Dschungel', specialTrait: 'Bunter Ara', funFact: 'Aras leben bis zu 50 Jahre!' },
  tree_frog: { weight: '0,05 kg', size: '5 cm', diet: 'Insekten', habitat: 'Dschungel', specialTrait: 'Haftscheiben', funFact: 'Baumfrösche haben Saugnapf-Fäden!' },
  chameleon: { weight: '0,2 kg', size: '20 cm', diet: 'Insekten', habitat: 'Dschungel', specialTrait: 'Farbwechsel', funFact: 'Chamäleons können ihre Farbe ändern!' },
  gibbon: { weight: '7 kg', size: '50 cm', diet: 'Früchte', habitat: 'Dschungel', specialTrait: 'Lange Arme', funFact: 'Gibbons können von Baum zu Baum schwingen!' },
  
  reindeer: { weight: '150 kg', size: '1,4 m', diet: 'Flechten', habitat: 'Arktis', specialTrait: 'Große Hufe', funFact: 'Rentiere können extrem kalte Temperaturen ertragen!' },
  narwhal: { weight: '1600 kg', size: '4 m', diet: 'Fisch', habitat: 'Ozean', specialTrait: 'Spiralhorn', funFact: 'Narwal-Hörner sind bis zu 3 Meter lang!' },
  beluga: { weight: '1500 kg', size: '4 m', diet: 'Fisch', habitat: 'Ozean', specialTrait: 'Weiße Farbe', funFact: 'Belugas singen wie Kanarienvögel!' },
  snow_owl: { weight: '2 kg', size: '60 cm', diet: 'Lemminge', habitat: 'Arktis', specialTrait: 'Weiße Federn', funFact: 'Schneeeulen können in völliger Dunkelheit jagen!' },
  arctic_hare: { weight: '5 kg', size: '60 cm', diet: 'Pflanzen', habitat: 'Arktis', specialTrait: 'Große Ohren', funFact: 'Polarschneehasen können 60 km/h laufen!' },
  
  snow_leopard: { weight: '45 kg', size: '1,3 m', diet: 'Fleisch', habitat: 'Berge', specialTrait: 'Dickes Fell', funFact: 'Schneeleoparden sind sehr seltene Raubkatzen!' },
  clouded_leopard: { weight: '23 kg', size: '60 cm', diet: 'Fleisch', habitat: 'Dschungel', specialTrait: 'Lange Zähne', funFact: 'Nebelfleck-Leoparden haben die längsten Reißzähne!' },
  golden_monkey: { weight: '8 kg', size: '60 cm', diet: 'Früchte', habitat: 'Berge', specialTrait: 'Goldenes Fell', funFact: 'Goldene Affen sind mit Menschen verwandt!' },
  
  squirrel: { weight: '0,5 kg', size: '25 cm', diet: 'Nüsse', habitat: 'Wald', specialTrait: 'Buschiger Schwanz', funFact: 'Eichhörnchen können ihre Schwänze als Fallschirm nutzen!' },
  badger: { weight: '12 kg', size: '70 cm', diet: 'Allesfresser', habitat: 'Wald', specialTrait: 'Starke Graber', funFact: 'Dachse graben massive Höhlensysteme!' },
  wild_boar: { weight: '150 kg', size: '1 m', diet: 'Allesfresser', habitat: 'Wald', specialTrait: 'Tusks', funFact: 'Wildschweine sind extrem intelligent!' },
  lynx: { weight: '30 kg', size: '1 m', diet: 'Fleisch', habitat: 'Wald', specialTrait: 'Gespitzte Ohren', funFact: 'Luchse haben Quasten an den Ohren!' },
  beaver: { weight: '20 kg', size: '1 m', diet: 'Holz', habitat: 'Fluss', specialTrait: 'Dammbauer', funFact: 'Biber bauen Dämme mit bemerkenswerter Ingenieurkunst!' },
  
  roadrunner: { weight: '0,3 kg', size: '30 cm', diet: 'Insekten', habitat: 'Wüste', specialTrait: 'Läufer', funFact: 'Wegekuckucke können 40 km/h laufen!' },
  desert_tortoise: { weight: '0,5 kg', size: '15 cm', diet: 'Pflanzen', habitat: 'Wüste', specialTrait: 'Panzer', funFact: 'Wüstenschildkröten speichern Wasser!' },
  iguana: { weight: '5 kg', size: '60 cm', diet: 'Blätter', habitat: 'Wüste', specialTrait: 'Dorsal Crest', funFact: 'Leguane können vom Baum herunter zu Wasser fallen!' },
  vulture: { weight: '8 kg', size: '1 m', diet: 'Aas', habitat: 'Savanne', specialTrait: 'Aasfresser', funFact: 'Geier haben eine Säuremagen um Knochen zu verdauen!' },
  
  orca: { weight: '6000 kg', size: '7 m', diet: 'Fisch', habitat: 'Ozean', specialTrait: 'Killerwale', funFact: 'Orcas sind die intelligentesten Meeressäuger!' },
  manta_ray: { weight: '1500 kg', size: '7 m', diet: 'Plankton', habitat: 'Ozean', specialTrait: 'Flügel', funFact: 'Mantarochen können aus dem Wasser springen!' },
  clownfish: { weight: '0,05 kg', size: '10 cm', diet: 'Algen', habitat: 'Ozean', specialTrait: 'Orange Streifen', funFact: 'Clownfische sind Einzelner Protogynie!' },
  sea_otter: { weight: '40 kg', size: '1,2 m', diet: 'Muscheln', habitat: 'Ozean', specialTrait: 'Benutzt Werkzeuge', funFact: 'Seeotter nutzen Steine zum Knacken von Muscheln!' },
  manatee: { weight: '500 kg', size: '3 m', diet: 'Pflanzen', habitat: 'Meer', specialTrait: 'Sanft', funFact: 'Seekühe sind verwandt mit Elefanten!' },
  starfish: { weight: '0,5 kg', size: '20 cm', diet: 'Algen', habitat: 'Ozean', specialTrait: '5 Arme', funFact: 'Seesterne können ihre Arme regenerieren!' },
  blue_whale: { weight: '150000 kg', size: '30 m', diet: 'Krill', habitat: 'Ozean', specialTrait: 'Größtes Tier', funFact: 'Blauwale sind die größten Tiere die je lebten!' },
  hammerhead_shark: { weight: '400 kg', size: '4 m', diet: 'Fisch', habitat: 'Ozean', specialTrait: 'Hammerkopf', funFact: 'Hammerhaie haben Sensoren in ihrem Kopf!' },
  pufferfish: { weight: '0,5 kg', size: '30 cm', diet: 'Insekten', habitat: 'Ozean', specialTrait: 'Gift', funFact: 'Kugelfische sind 1200x giftig als Cyanid!' },
  
  sugar_glider: { weight: '0,15 kg', size: '15 cm', diet: 'Insekten', habitat: 'Nacht', specialTrait: 'Gleitet', funFact: 'Zucker-Segelflugbeutler können 50 Meter weit gleiten!' },
  kiwi: { weight: '1,5 kg', size: '40 cm', diet: 'Insekten', habitat: 'Wald', specialTrait: 'Kann nicht fliegen', funFact: 'Kiwis legen die größten Eier relativ zu ihrer Größe!' },
  tarsier: { weight: '0,12 kg', size: '15 cm', diet: 'Insekten', habitat: 'Nacht', specialTrait: 'Große Augen', funFact: 'Koboldmakis haben die größten Augen relativ zur Körpergröße!' },
  aye_aye: { weight: '2 kg', size: '40 cm', diet: 'Insekten', habitat: 'Nacht', specialTrait: 'Langer Finger', funFact: 'Fingertiere nutzen ihren langen Finger zum Herausgraben von Insekten!' },
  
  tasmanian_devil: { weight: '12 kg', size: '60 cm', diet: 'Fleisch', habitat: 'Australien', specialTrait: 'Laut', funFact: 'Tasmanische Teufel sind die lautesten Beutel!' },
  echidna: { weight: '5 kg', size: '45 cm', diet: 'Ameisen', habitat: 'Australien', specialTrait: 'Stacheln', funFact: 'Ameisenigel sind eine der beiden eierlegen Säugetiere!' },
  wallaby: { weight: '25 kg', size: '1,5 m', diet: 'Gras', habitat: 'Australien', specialTrait: 'Springt', funFact: 'Wallabys sind kleinere Kängurus!' },
  kookaburra: { weight: '0,5 kg', size: '45 cm', diet: 'Fleisch', habitat: 'Australien', specialTrait: 'Lacht', funFact: 'Kookaburras haben einen Lach-ähnlichen Ruf!' },
  
  crocodile: { weight: '400 kg', size: '4 m', diet: 'Fleisch', habitat: 'Fluss', specialTrait: 'Uralter Jäger', funFact: 'Krokodile sind seit Millionen von Jahren unverändert!' },
  alligator: { weight: '360 kg', size: '3,5 m', diet: 'Fleisch', habitat: 'Sumpf', specialTrait: 'Breiter Kopf', funFact: 'Alligatoren können schneller auf Land laufen!' },
  komodo_dragon: { weight: '150 kg', size: '3 m', diet: 'Fleisch', habitat: 'Inseln', specialTrait: 'Riesig', funFact: 'Komodowaran sind die größten lebenden Eidechsen!' },
  gecko: { weight: '0,1 kg', size: '20 cm', diet: 'Insekten', habitat: 'Berge', specialTrait: 'Haftet überall', funFact: 'Geckos können sogar an glatten Wänden laufen!' },
  poison_dart_frog: { weight: '0,01 kg', size: '3 cm', diet: 'Insekten', habitat: 'Dschungel', specialTrait: 'Giftig', funFact: 'Pfeilgiftfrösche sind eine der giftigsten Tiere!' },
  
  butterfly: { weight: '0,001 kg', size: '10 cm', diet: 'Nektar', habitat: 'Wiese', specialTrait: 'Flügel', funFact: 'Schmetterlinge probieren mit ihren Füßen!' },
  ladybug: { weight: '0,01 kg', size: '8 mm', diet: 'Blattläuse', habitat: 'Garten', specialTrait: 'Punkte', funFact: 'Marienkäfer essen Hunderte von Blattläusen!' },
  dragonfly: { weight: '0,001 kg', size: '7 cm', diet: 'Insekten', habitat: 'Wasser', specialTrait: 'Schneller Flieger', funFact: 'Libellen können 100 km/h fliegen!' },
  praying_mantis: { weight: '0,05 kg', size: '15 cm', diet: 'Insekten', habitat: 'Garten', specialTrait: 'Räuber', funFact: 'Gottesanbeterinnen sind perfekte Jäger unter Insekten!' },
  
  // Fehlende Tiere - Final Batch
  moose: { weight: '700 kg', size: '2,4 m', diet: 'Pflanzen', habitat: 'Wald', specialTrait: 'Großes Geweih', funFact: 'Elche sind die größten Hirsche!' },
  stork: { weight: '4 kg', size: '1,1 m', diet: 'Fisch', habitat: 'Feuchtgebiet', specialTrait: 'Baue Nester', funFact: 'Störche kehren zu den gleichen Nestern zurück!' },
  pelican: { weight: '10 kg', size: '1,5 m', diet: 'Fisch', habitat: 'Küste', specialTrait: 'Großer Schnabel', funFact: 'Pelikane haben den größten Schnabel aller Vögel!' },
  hummingbird: { weight: '0,005 kg', size: '5 cm', diet: 'Nektar', habitat: 'Blüten', specialTrait: 'Flattert schnell', funFact: 'Kolibris schlagen ihre Flügel 80x pro Sekunde!' },
  kingfisher: { weight: '0,04 kg', size: '15 cm', diet: 'Fisch', habitat: 'Fluss', specialTrait: 'Schneller Taucher', funFact: 'Eisvögel können Fische unter Wasser sehen!' },
  hornbill: { weight: '1 kg', size: '80 cm', diet: 'Früchte', habitat: 'Wald', specialTrait: 'Hornartiger Aufsatz', funFact: 'Nashornvögel haben bizarre Schnabelaufsätze!' },
};

// 🌍 Tier-Datenbank mit Kontinenten und Gruppen (Arche Nova-Stil!)
export const ANIMALS_DATABASE: Record<ZooAnimal, AnimalInfo> = {
  // Afrika - Savanne
  lion: { type: 'lion', name: 'Löwe', emoji: '🦁', continent: 'Afrika', group: 'Raubkatzen', habitat: 'savanna' },
  elephant: { type: 'elephant', name: 'Elefant', emoji: '🐘', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  giraffe: { type: 'giraffe', name: 'Giraffe', emoji: '🦒', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  zebra: { type: 'zebra', name: 'Zebra', emoji: '🦓', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  rhino: { type: 'rhino', name: 'Nashorn', emoji: '🦏', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  hippo: { type: 'hippo', name: 'Nilpferd', emoji: '🦛', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  cheetah: { type: 'cheetah', name: 'Gepard', emoji: '🐆', continent: 'Afrika', group: 'Raubkatzen', habitat: 'savanna' },
  hyena: { type: 'hyena', name: 'Hyäne', emoji: '🐕', continent: 'Afrika', group: 'Raubkatzen', habitat: 'savanna' },
  ostrich: { type: 'ostrich', name: 'Strauß', emoji: '🦤', continent: 'Afrika', group: 'Vögel', habitat: 'savanna' },

  // Asien - Dschungel
  monkey: { type: 'monkey', name: 'Affe', emoji: '🐵', continent: 'Asien', group: 'Affen', habitat: 'jungle' },
  gorilla: { type: 'gorilla', name: 'Gorilla', emoji: '🦍', continent: 'Afrika', group: 'Affen', habitat: 'jungle' },
  orangutan: { type: 'orangutan', name: 'Orang-Utan', emoji: '🦧', continent: 'Asien', group: 'Affen', habitat: 'jungle' },
  tiger: { type: 'tiger', name: 'Tiger', emoji: '🐅', continent: 'Asien', group: 'Raubkatzen', habitat: 'jungle' },
  leopard: { type: 'leopard', name: 'Leopard', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen', habitat: 'jungle' },
  toucan: { type: 'toucan', name: 'Tukan', emoji: '🦜', continent: 'Amerika', group: 'Vögel', habitat: 'jungle' },
  parrot: { type: 'parrot', name: 'Papagei', emoji: '🦜', continent: 'Amerika', group: 'Vögel', habitat: 'jungle' },
  sloth: { type: 'sloth', name: 'Faultier', emoji: '🦥', continent: 'Amerika', group: 'Grosstiere', habitat: 'jungle' },

  // Antarktis/Arktis
  penguin: { type: 'penguin', name: 'Pinguin', emoji: '🐧', continent: 'Europa', group: 'Vögel', habitat: 'arctic' },
  polar_bear: { type: 'polar_bear', name: 'Eisbär', emoji: '🐻‍❄️', continent: 'Europa', group: 'Raubkatzen', habitat: 'arctic' },
  seal: { type: 'seal', name: 'Robbe', emoji: '🦭', continent: 'Europa', group: 'Wassertiere', habitat: 'arctic' },
  walrus: { type: 'walrus', name: 'Walross', emoji: '🦭', continent: 'Europa', group: 'Wassertiere', habitat: 'arctic' },
  arctic_fox: { type: 'arctic_fox', name: 'Polarfuchs', emoji: '🦊', continent: 'Europa', group: 'Raubkatzen', habitat: 'arctic' },

  // Asien - Bambuswald
  panda: { type: 'panda', name: 'Panda', emoji: '🐼', continent: 'Asien', group: 'Grosstiere', habitat: 'bamboo' },
  red_panda: { type: 'red_panda', name: 'Roter Panda', emoji: '🐾', continent: 'Asien', group: 'Grosstiere', habitat: 'bamboo' },
  koala: { type: 'koala', name: 'Koala', emoji: '🐨', continent: 'Australien', group: 'Grosstiere', habitat: 'bamboo' },
  peacock: { type: 'peacock', name: 'Pfau', emoji: '🦚', continent: 'Asien', group: 'Vögel', habitat: 'bamboo' },

  // Europa - Wiese
  rabbit: { type: 'rabbit', name: 'Hase', emoji: '🐰', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  fox: { type: 'fox', name: 'Fuchs', emoji: '🦊', continent: 'Europa', group: 'Raubkatzen', habitat: 'meadow' },
  deer: { type: 'deer', name: 'Reh', emoji: '🦌', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  hedgehog: { type: 'hedgehog', name: 'Igel', emoji: '🦔', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  owl: { type: 'owl', name: 'Eule', emoji: '🦉', continent: 'Europa', group: 'Vögel', habitat: 'meadow' },

  // Afrika/Asien - Wüste
  camel: { type: 'camel', name: 'Kamel', emoji: '🐪', continent: 'Asien', group: 'Grosstiere', habitat: 'desert' },
  snake: { type: 'snake', name: 'Schlange', emoji: '🐍', continent: 'Afrika', group: 'Reptilien', habitat: 'desert' },
  scorpion: { type: 'scorpion', name: 'Skorpion', emoji: '🦂', continent: 'Afrika', group: 'Reptilien', habitat: 'desert' },
  fennec_fox: { type: 'fennec_fox', name: 'Wüstenfuchs', emoji: '🦊', continent: 'Afrika', group: 'Raubkatzen', habitat: 'desert' },

  // Ozean
  dolphin: { type: 'dolphin', name: 'Delfin', emoji: '🐬', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  shark: { type: 'shark', name: 'Hai', emoji: '🦈', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  octopus: { type: 'octopus', name: 'Oktopus', emoji: '🐙', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  seahorse: { type: 'seahorse', name: 'Seepferdchen', emoji: '🐴', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  turtle: { type: 'turtle', name: 'Schildkröte', emoji: '🐢', continent: 'Ozean', group: 'Reptilien', habitat: 'ocean' },
  jellyfish: { type: 'jellyfish', name: 'Qualle', emoji: '🪼', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },

  // Nachthaus
  bat: { type: 'bat', name: 'Fledermaus', emoji: '🦇', continent: 'Europa', group: 'Vögel', habitat: 'night' },
  raccoon: { type: 'raccoon', name: 'Waschbär', emoji: '🦝', continent: 'Amerika', group: 'Grosstiere', habitat: 'night' },
  firefly: { type: 'firefly', name: 'Glühwürmchen', emoji: '🔥', continent: 'Europa', group: 'Reptilien', habitat: 'night' },

  // Australien
  kangaroo: { type: 'kangaroo', name: 'Känguru', emoji: '🦘', continent: 'Australien', group: 'Grosstiere', habitat: 'outback' },
  wombat: { type: 'wombat', name: 'Wombat', emoji: '🦫', continent: 'Australien', group: 'Grosstiere', habitat: 'outback' },
  platypus: { type: 'platypus', name: 'Schnabeltier', emoji: '🦆', continent: 'Australien', group: 'Wassertiere', habitat: 'outback' },

  // Vögel (verschiedene Kontinente)
  eagle: { type: 'eagle', name: 'Adler', emoji: '🦅', continent: 'Europa', group: 'Vögel', habitat: 'aviary' },
  flamingo: { type: 'flamingo', name: 'Flamingo', emoji: '🦩', continent: 'Afrika', group: 'Vögel', habitat: 'aviary' },
  swan: { type: 'swan', name: 'Schwan', emoji: '🦢', continent: 'Europa', group: 'Vögel', habitat: 'aviary' },
  pelican: { type: 'pelican', name: 'Pelikan', emoji: '🦜', continent: 'Amerika', group: 'Vögel', habitat: 'aviary' },
  stork: { type: 'stork', name: 'Storch', emoji: '🦢', continent: 'Europa', group: 'Vögel', habitat: 'aviary' },
  crane: { type: 'crane', name: 'Kranich', emoji: '🦩', continent: 'Asien', group: 'Vögel', habitat: 'aviary' },
  hummingbird: { type: 'hummingbird', name: 'Kolibri', emoji: '🐦', continent: 'Amerika', group: 'Vögel', habitat: 'aviary' },
  kingfisher: { type: 'kingfisher', name: 'Eisvogel', emoji: '🐦', continent: 'Europa', group: 'Vögel', habitat: 'aviary' },
  hornbill: { type: 'hornbill', name: 'Nashornvogel', emoji: '🦜', continent: 'Afrika', group: 'Vögel', habitat: 'aviary' },

  // Neue Savannentiere
  meerkat: { type: 'meerkat', name: 'Erdmännchen', emoji: '🦦', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  buffalo: { type: 'buffalo', name: 'Büffel', emoji: '🐃', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  antelope: { type: 'antelope', name: 'Antilope', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  wildebeest: { type: 'wildebeest', name: 'Gnu', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },
  gazelle: { type: 'gazelle', name: 'Gazelle', emoji: '🦌', continent: 'Afrika', group: 'Grosstiere', habitat: 'savanna' },

  // Neue Dschungeltiere
  jaguar: { type: 'jaguar', name: 'Jaguar', emoji: '🐆', continent: 'Amerika', group: 'Raubkatzen', habitat: 'jungle' },
  tapir: { type: 'tapir', name: 'Tapir', emoji: '🦏', continent: 'Amerika', group: 'Grosstiere', habitat: 'jungle' },
  macaw: { type: 'macaw', name: 'Ara', emoji: '🦜', continent: 'Amerika', group: 'Vögel', habitat: 'jungle' },
  tree_frog: { type: 'tree_frog', name: 'Baumfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien', habitat: 'jungle' },
  chameleon: { type: 'chameleon', name: 'Chamäleon', emoji: '🦎', continent: 'Afrika', group: 'Reptilien', habitat: 'jungle' },
  gibbon: { type: 'gibbon', name: 'Gibbon', emoji: '🦧', continent: 'Asien', group: 'Affen', habitat: 'jungle' },

  // Neue Arktistiere
  reindeer: { type: 'reindeer', name: 'Rentier', emoji: '🦌', continent: 'Europa', group: 'Grosstiere', habitat: 'arctic' },
  narwhal: { type: 'narwhal', name: 'Narwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere', habitat: 'arctic' },
  beluga: { type: 'beluga', name: 'Beluga', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere', habitat: 'arctic' },
  snow_owl: { type: 'snow_owl', name: 'Schneeeule', emoji: '🦉', continent: 'Europa', group: 'Vögel', habitat: 'arctic' },
  arctic_hare: { type: 'arctic_hare', name: 'Schneehase', emoji: '🐇', continent: 'Europa', group: 'Grosstiere', habitat: 'arctic' },

  // Neue Bambuswald-Tiere
  snow_leopard: { type: 'snow_leopard', name: 'Schneeleopard', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen', habitat: 'bamboo' },
  clouded_leopard: { type: 'clouded_leopard', name: 'Nebelparder', emoji: '🐆', continent: 'Asien', group: 'Raubkatzen', habitat: 'bamboo' },
  golden_monkey: { type: 'golden_monkey', name: 'Goldaffe', emoji: '🐵', continent: 'Asien', group: 'Affen', habitat: 'bamboo' },

  // Neue Wiesen-Tiere
  squirrel: { type: 'squirrel', name: 'Eichhörnchen', emoji: '🐿️', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  badger: { type: 'badger', name: 'Dachs', emoji: '🦡', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  wild_boar: { type: 'wild_boar', name: 'Wildschwein', emoji: '🐗', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  lynx: { type: 'lynx', name: 'Luchs', emoji: '🐈', continent: 'Europa', group: 'Raubkatzen', habitat: 'meadow' },
  beaver: { type: 'beaver', name: 'Biber', emoji: '🦫', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },

  // Neue Wüstentiere
  roadrunner: { type: 'roadrunner', name: 'Rennkuckuck', emoji: '🐦', continent: 'Amerika', group: 'Vögel', habitat: 'desert' },
  desert_tortoise: { type: 'desert_tortoise', name: 'Wüstenschildkröte', emoji: '🐢', continent: 'Amerika', group: 'Reptilien', habitat: 'desert' },
  iguana: { type: 'iguana', name: 'Leguan', emoji: '🦎', continent: 'Amerika', group: 'Reptilien', habitat: 'desert' },
  vulture: { type: 'vulture', name: 'Geier', emoji: '🦅', continent: 'Afrika', group: 'Vögel', habitat: 'desert' },

  // Neue Ozean-Tiere
  orca: { type: 'orca', name: 'Orca', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  manta_ray: { type: 'manta_ray', name: 'Mantarochen', emoji: '🐟', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  clownfish: { type: 'clownfish', name: 'Clownfisch', emoji: '🐠', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  sea_otter: { type: 'sea_otter', name: 'Seeotter', emoji: '🦦', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  manatee: { type: 'manatee', name: 'Seekuh', emoji: '🦭', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  starfish: { type: 'starfish', name: 'Seestern', emoji: '⭐', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  blue_whale: { type: 'blue_whale', name: 'Blauwal', emoji: '🐋', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  hammerhead_shark: { type: 'hammerhead_shark', name: 'Hammerhai', emoji: '🦈', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },
  pufferfish: { type: 'pufferfish', name: 'Kugelfisch', emoji: '🐡', continent: 'Ozean', group: 'Wassertiere', habitat: 'ocean' },

  // Neue Nachthaus-Tiere
  sugar_glider: { type: 'sugar_glider', name: 'Gleithörnchen', emoji: '🦦', continent: 'Australien', group: 'Grosstiere', habitat: 'night' },
  kiwi: { type: 'kiwi', name: 'Kiwi', emoji: '🐦', continent: 'Australien', group: 'Vögel', habitat: 'night' },
  tarsier: { type: 'tarsier', name: 'Koboldmaki', emoji: '🐒', continent: 'Asien', group: 'Affen', habitat: 'night' },
  aye_aye: { type: 'aye_aye', name: 'Fingertier', emoji: '🐒', continent: 'Afrika', group: 'Affen', habitat: 'night' },

  // Neue Australien-Tiere
  tasmanian_devil: { type: 'tasmanian_devil', name: 'Beutelteufel', emoji: '🦘', continent: 'Australien', group: 'Grosstiere', habitat: 'outback' },
  echidna: { type: 'echidna', name: 'Ameisenigel', emoji: '🦔', continent: 'Australien', group: 'Grosstiere', habitat: 'outback' },
  wallaby: { type: 'wallaby', name: 'Wallaby', emoji: '🦘', continent: 'Australien', group: 'Grosstiere', habitat: 'outback' },
  kookaburra: { type: 'kookaburra', name: 'Kookaburra', emoji: '🐦', continent: 'Australien', group: 'Vögel', habitat: 'outback' },

  // Reptilien & Amphibien
  crocodile: { type: 'crocodile', name: 'Krokodil', emoji: '🐊', continent: 'Afrika', group: 'Reptilien', habitat: 'jungle' },
  alligator: { type: 'alligator', name: 'Alligator', emoji: '🐊', continent: 'Amerika', group: 'Reptilien', habitat: 'jungle' },
  komodo_dragon: { type: 'komodo_dragon', name: 'Komodowaran', emoji: '🦎', continent: 'Asien', group: 'Reptilien', habitat: 'jungle' },
  gecko: { type: 'gecko', name: 'Gecko', emoji: '🦎', continent: 'Asien', group: 'Reptilien', habitat: 'jungle' },
  poison_dart_frog: { type: 'poison_dart_frog', name: 'Pfeilgiftfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien', habitat: 'jungle' },

  // Insekten
  butterfly: { type: 'butterfly', name: 'Schmetterling', emoji: '🦋', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  ladybug: { type: 'ladybug', name: 'Marienkäfer', emoji: '🐞', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  dragonfly: { type: 'dragonfly', name: 'Libelle', emoji: '🦗', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  praying_mantis: { type: 'praying_mantis', name: 'Gottesanbeterin', emoji: '🦗', continent: 'Asien', group: 'Grosstiere', habitat: 'meadow' },
};

// 🎯 Helper-Funktionen für Kontinente und Gruppen
export function getAnimalsByContinent(continent: Continent): ZooAnimal[] {
  return Object.values(ANIMALS_DATABASE)
    .filter(animal => animal.continent === continent)
    .map(animal => animal.type);
}

export function getAnimalsByGroup(group: AnimalGroup): ZooAnimal[] {
  return Object.values(ANIMALS_DATABASE)
    .filter(animal => animal.group === group)
    .map(animal => animal.type);
}

export function getContinentCompletion(collectedAnimals: ZooAnimal[], continent: Continent): {
  collected: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  const continentAnimals = getAnimalsByContinent(continent);
  const collected = continentAnimals.filter(animal => collectedAnimals.includes(animal)).length;
  const total = continentAnimals.length;
  return {
    collected,
    total,
    percentage: Math.round((collected / total) * 100),
    isComplete: collected === total
  };
}

export function getGroupCompletion(collectedAnimals: ZooAnimal[], group: AnimalGroup): {
  collected: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  const groupAnimals = getAnimalsByGroup(group);
  const collected = groupAnimals.filter(animal => collectedAnimals.includes(animal)).length;
  const total = groupAnimals.length;
  return {
    collected,
    total,
    percentage: Math.round((collected / total) * 100),
    isComplete: collected === total
  };
}

// 💰 ZOO-WIRTSCHAFTSSYSTEM - Kosten und Besucherwert für jedes Tier
export interface AnimalEconomyData {
  maintenanceCost: {
    baby: number;    // Münzen pro Stunde
    adult: number;   // Münzen pro Stunde
  };
  visitorValue: {
    baby: number;    // Besucher pro Stunde
    adult: number;   // Besucher pro Stunde
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// 🎯 MATHEMATISCH BALANCIERTE Wirtschaftsdaten (15 XP/h, Rarity-basierte Risk-Reward)
// Formel: Net = (Visitors * 1€) - Cost
// Evolution ROI (Rarity-basiert): Common/Uncommon 2-3x | Rare 3-4x | Epic 15-20x | Legendary 30-50x
// Hohes Baby-Risiko (+1 bis +2) = Hohe Adult-Belohnung (+30 bis +50) - Idle-Game Prinzip!
// Early-Game Fairness: Common Tiere (+4-7) sind sicher profitabel für Anfänger
export const ANIMAL_ECONOMY_DATA: Record<ZooAnimal, AnimalEconomyData> = {
  // 🟢 COMMON Tiere (Starter - sicher profitabel)
  rabbit: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 8, adult: 40 }, rarity: 'common' },
  fox: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 10, adult: 50 }, rarity: 'common' },
  hedgehog: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 10, adult: 50 }, rarity: 'common' },
  firefly: { maintenanceCost: { baby: 2.5, adult: 17.5 }, visitorValue: { baby: 33, adult: 165 }, rarity: 'legendary' },
  parrot: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  seal: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },
  scorpion: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  ostrich: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  monkey: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },
  swan: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  bat: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  deer: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },


  // 🔵 UNCOMMON Tiere (solide Basis)
  zebra: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  hyena: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  penguin: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  toucan: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  peacock: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  owl: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  camel: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  snake: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  fennec_fox: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  seahorse: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 21, adult: 105 }, rarity: 'rare' },
  walrus: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'rare' },
  arctic_fox: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  raccoon: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  flamingo: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  wombat: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  jellyfish: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },

  // 🟣 RARE Tiere (Baby profitabel +8-10, Adult 3-4x ROI!)
  giraffe: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  hippo: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  cheetah: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  leopard: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  red_panda: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'rare' },
  octopus: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },
  turtle: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  rhino: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },
  sloth: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },


  // 🟡 EPIC Tiere (Baby RISKANT +1-2, Adult 15-20x ROI!)
  lion: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  elephant: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 12, adult: 60 }, rarity: 'common' },
  tiger: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 27, adult: 135 }, rarity: 'epic' },
  polar_bear: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 27, adult: 135 }, rarity: 'epic' },
  gorilla: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  dolphin: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 27, adult: 135 }, rarity: 'epic' },
  shark: { maintenanceCost: { baby: 2.5, adult: 17.5 }, visitorValue: { baby: 30, adult: 150 }, rarity: 'epic' },
  kangaroo: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  eagle: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },


  // 🔴 LEGENDARY Tier (Baby minimal profitabel +1, Adult 30-50x ROI - Mega Belohnung!)
  panda: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  koala: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  platypus: { maintenanceCost: { baby: 1, adult: 8 }, visitorValue: { baby: 38, adult: 190 }, rarity: 'legendary' },

  // Neue Savannentiere
  meerkat: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },
  buffalo: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  antelope: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  wildebeest: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },
  gazelle: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },

  // Neue Dschungeltiere
  jaguar: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 27, adult: 135 }, rarity: 'epic' },
  tapir: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  macaw: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 20, adult: 100 }, rarity: 'rare' },
  tree_frog: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  chameleon: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  gibbon: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },

  // Neue Arktistiere
  reindeer: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  narwhal: { maintenanceCost: { baby: 2.5, adult: 17.5 }, visitorValue: { baby: 32, adult: 160 }, rarity: 'legendary' },
  beluga: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 28, adult: 140 }, rarity: 'epic' },
  snow_owl: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },
  arctic_hare: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 10, adult: 50 }, rarity: 'common' },

  // Neue Bambuswald-Tiere
  snow_leopard: { maintenanceCost: { baby: 2.5, adult: 17.5 }, visitorValue: { baby: 34, adult: 170 }, rarity: 'legendary' },
  clouded_leopard: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 28, adult: 140 }, rarity: 'epic' },
  golden_monkey: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },

  // Neue Wiesen-Tiere
  squirrel: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 8, adult: 40 }, rarity: 'common' },
  badger: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },
  wild_boar: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  lynx: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  beaver: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },

  // Neue Wüstentiere
  roadrunner: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },
  desert_tortoise: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  iguana: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  vulture: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 16, adult: 80 }, rarity: 'uncommon' },

  // Neue Ozean-Tiere
  orca: { maintenanceCost: { baby: 1, adult: 8 }, visitorValue: { baby: 40, adult: 200 }, rarity: 'legendary' },
  manta_ray: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },
  clownfish: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 10, adult: 50 }, rarity: 'common' },
  sea_otter: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 20, adult: 100 }, rarity: 'rare' },
  manatee: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  starfish: { maintenanceCost: { baby: 2.5, adult: 5 }, visitorValue: { baby: 8, adult: 40 }, rarity: 'common' },
  blue_whale: { maintenanceCost: { baby: 1, adult: 9 }, visitorValue: { baby: 45, adult: 225 }, rarity: 'legendary' },
  hammerhead_shark: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 28, adult: 140 }, rarity: 'epic' },
  pufferfish: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },

  // Neue Nachthaus-Tiere
  sugar_glider: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  kiwi: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 22, adult: 110 }, rarity: 'rare' },
  tarsier: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 20, adult: 100 }, rarity: 'rare' },
  aye_aye: { maintenanceCost: { baby: 1, adult: 6 }, visitorValue: { baby: 28, adult: 140 }, rarity: 'epic' },

  // Neue Australien-Tiere
  tasmanian_devil: { maintenanceCost: { baby: 1, adult: 5 }, visitorValue: { baby: 24, adult: 120 }, rarity: 'rare' },
  echidna: { maintenanceCost: { baby: 2.5, adult: 10 }, visitorValue: { baby: 18, adult: 90 }, rarity: 'uncommon' },
  wallaby: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 15, adult: 75 }, rarity: 'uncommon' },
  kookaburra: { maintenanceCost: { baby: 2.5, adult: 7.5 }, visitorValue: { baby: 14, adult: 70 }, rarity: 'uncommon' },

  // Reptilien & Amphibien
  crocodile: { type: 'crocodile', name: 'Krokodil', emoji: '🐊', continent: 'Afrika', group: 'Reptilien', habitat: 'jungle' },
  alligator: { type: 'alligator', name: 'Alligator', emoji: '🐊', continent: 'Amerika', group: 'Reptilien', habitat: 'jungle' },
  komodo_dragon: { type: 'komodo_dragon', name: 'Komodowaran', emoji: '🦎', continent: 'Asien', group: 'Reptilien', habitat: 'jungle' },
  gecko: { type: 'gecko', name: 'Gecko', emoji: '🦎', continent: 'Asien', group: 'Reptilien', habitat: 'jungle' },
  poison_dart_frog: { type: 'poison_dart_frog', name: 'Pfeilgiftfrosch', emoji: '🐸', continent: 'Amerika', group: 'Reptilien', habitat: 'jungle' },

  // Insekten
  butterfly: { type: 'butterfly', name: 'Schmetterling', emoji: '🦋', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  ladybug: { type: 'ladybug', name: 'Marienkäfer', emoji: '🐞', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  dragonfly: { type: 'dragonfly', name: 'Libelle', emoji: '🦗', continent: 'Europa', group: 'Grosstiere', habitat: 'meadow' },
  praying_mantis: { type: 'praying_mantis', name: 'Gottesanbeterin', emoji: '🦗', continent: 'Asien', group: 'Grosstiere', habitat: 'meadow' },
};

// Helper: Berechne Netto-Einkommen für ein Tier (Besucher-Einnahmen - Kosten)
export function calculateAnimalNetIncome(
  animalType: ZooAnimal,
  age: 'baby' | 'adult',
  entranceFeePerVisitor: number = 1
): {
  income: number;
  cost: number;
  net: number;
  visitors: number;
} {
  const data = ANIMAL_ECONOMY_DATA[animalType];
  const visitors = data.visitorValue[age];
  const income = visitors * entranceFeePerVisitor;
  const cost = data.maintenanceCost[age];

  return {
    income,
    cost,
    net: income - cost,
    visitors
  };
}

// 🎯 MISSIONS-SYSTEM (Arche Nova Artenschutzprojekte!)
export interface MissionDefinition {
  id: string;
  type: 'continent' | 'group' | 'special';
  title: string;
  description: string;
  emoji: string;
  targetContinent?: Continent;
  targetGroup?: AnimalGroup;
  targetCount: number;
  coinReward: number;
  xpReward: number;
  badgeReward?: string;
  difficulty: number; // 1-5
  unlockLevel: number;
}

export const MISSION_TEMPLATES: MissionDefinition[] = [
  // Kontinent-Missionen
  { id: 'africa_mission', type: 'continent', title: 'Rettet Afrika!', description: 'Sammle 5 Tiere aus Afrika', emoji: '🦁', targetContinent: 'Afrika', targetCount: 5, coinReward: 150, xpReward: 75, badgeReward: 'africa_hero', difficulty: 2, unlockLevel: 1 },
  { id: 'asia_mission', type: 'continent', title: 'Asien-Expedition', description: 'Sammle 5 Tiere aus Asien', emoji: '🐅', targetContinent: 'Asien', targetCount: 5, coinReward: 150, xpReward: 75, badgeReward: 'asia_explorer', difficulty: 2, unlockLevel: 2 },
  { id: 'australia_mission', type: 'continent', title: 'Australien-Abenteuer', description: 'Sammle alle 3 Tiere aus Australien', emoji: '🦘', targetContinent: 'Australien', targetCount: 3, coinReward: 120, xpReward: 60, badgeReward: 'australia_master', difficulty: 1, unlockLevel: 1 },
  { id: 'america_mission', type: 'continent', title: 'Amerika-Safari', description: 'Sammle 4 Tiere aus Amerika', emoji: '🦜', targetContinent: 'Amerika', targetCount: 4, coinReward: 130, xpReward: 65, badgeReward: 'america_scout', difficulty: 2, unlockLevel: 2 },
  { id: 'europe_mission', type: 'continent', title: 'Europa entdecken', description: 'Sammle 8 Tiere aus Europa', emoji: '🦊', targetContinent: 'Europa', targetCount: 8, coinReward: 180, xpReward: 90, badgeReward: 'europe_champion', difficulty: 3, unlockLevel: 3 },
  { id: 'ocean_mission', type: 'continent', title: 'Ozean-Rettung', description: 'Sammle alle 6 Wassertiere', emoji: '🐬', targetContinent: 'Ozean', targetCount: 6, coinReward: 170, xpReward: 85, badgeReward: 'ocean_protector', difficulty: 3, unlockLevel: 3 },

  // Gruppen-Missionen
  { id: 'monkeys_mission', type: 'group', title: 'Affen-Rettung', description: 'Sammle alle 3 Affen', emoji: '🐵', targetGroup: 'Affen', targetCount: 3, coinReward: 120, xpReward: 60, difficulty: 1, unlockLevel: 1 },
  { id: 'bigcats_mission', type: 'group', title: 'Raubkatzen-Schutz', description: 'Sammle 6 Raubkatzen', emoji: '🐅', targetGroup: 'Raubkatzen', targetCount: 6, coinReward: 160, xpReward: 80, difficulty: 3, unlockLevel: 2 },
  { id: 'birds_mission', type: 'group', title: 'Vogel-Paradies', description: 'Sammle 7 Vögel', emoji: '🦅', targetGroup: 'Vögel', targetCount: 7, coinReward: 170, xpReward: 85, difficulty: 3, unlockLevel: 2 },
  { id: 'reptiles_mission', type: 'group', title: 'Reptilien-Schutz', description: 'Sammle alle 5 Reptilien', emoji: '🐍', targetGroup: 'Reptilien', targetCount: 5, coinReward: 140, xpReward: 70, difficulty: 2, unlockLevel: 2 },
  { id: 'large_animals_mission', type: 'group', title: 'Grosstier-Mission', description: 'Sammle 10 Grosstiere', emoji: '🐘', targetGroup: 'Grosstiere', targetCount: 10, coinReward: 200, xpReward: 100, difficulty: 4, unlockLevel: 3 },
  { id: 'water_animals_mission', type: 'group', title: 'Wassertier-Schutz', description: 'Sammle alle 9 Wassertiere', emoji: '🐠', targetGroup: 'Wassertiere', targetCount: 9, coinReward: 190, xpReward: 95, difficulty: 4, unlockLevel: 3 },

  // Spezial-Missionen
  { id: 'collector_mission', type: 'special', title: 'Super-Sammler', description: 'Sammle insgesamt 20 verschiedene Tiere', emoji: '🏆', targetCount: 20, coinReward: 300, xpReward: 150, badgeReward: 'super_collector', difficulty: 4, unlockLevel: 4 },
  { id: 'world_saver', type: 'special', title: 'Welt-Retter', description: 'Sammle Tiere von allen 6 Kontinenten', emoji: '🌍', targetCount: 6, coinReward: 350, xpReward: 175, badgeReward: 'world_savior', difficulty: 5, unlockLevel: 5 },
  { id: 'complete_zoo', type: 'special', title: 'Perfekter Zoo', description: 'Sammle alle 56 Tiere!', emoji: '🎊', targetCount: 56, coinReward: 500, xpReward: 250, badgeReward: 'perfect_zoo', difficulty: 5, unlockLevel: 6 },

  // 🆕 10 NEUE TIERRETTUNGS-MISSIONEN
  { id: 'endangered_species', type: 'special', title: 'Bedrohte Arten', description: 'Sammle 8 seltene, vom Aussterben bedrohte Tiere', emoji: '🛡️', targetCount: 8, coinReward: 250, xpReward: 125, badgeReward: 'conservation_hero', difficulty: 4, unlockLevel: 5 },
  { id: 'night_patrol', type: 'group', title: 'Nacht-Patrouille', description: 'Rette alle 6 nachtaktiven Tiere', emoji: '🌙', targetCount: 6, coinReward: 180, xpReward: 90, badgeReward: 'night_guardian', difficulty: 3, unlockLevel: 4 },
  { id: 'desert_rescue', type: 'continent', title: 'Wüsten-Rettung', description: 'Sammle alle 6 Wüstentiere', emoji: '🐪', targetCount: 6, coinReward: 160, xpReward: 80, difficulty: 3, unlockLevel: 3 },
  { id: 'arctic_heroes', type: 'continent', title: 'Arktis-Helden', description: 'Rette 8 Tiere aus der Arktis', emoji: '❄️', targetCount: 8, coinReward: 200, xpReward: 100, badgeReward: 'ice_rescuer', difficulty: 4, unlockLevel: 4 },
  { id: 'rainforest_saviors', type: 'special', title: 'Regenwald-Retter', description: 'Sammle 12 Dschungel- und Regenwaldtiere', emoji: '🌳', targetCount: 12, coinReward: 220, xpReward: 110, badgeReward: 'jungle_hero', difficulty: 4, unlockLevel: 5 },
  { id: 'insect_collection', type: 'group', title: 'Insekten-Sammlung', description: 'Rette alle 4 Insektenarten', emoji: '🦋', targetCount: 4, coinReward: 130, xpReward: 65, difficulty: 2, unlockLevel: 2 },
  { id: 'flying_friends', type: 'special', title: 'Fliegende Freunde', description: 'Sammle 10 flugfähige Tiere (Vögel + Fledermäuse)', emoji: '🦅', targetCount: 10, coinReward: 190, xpReward: 95, badgeReward: 'sky_master', difficulty: 3, unlockLevel: 3 },
  { id: 'baby_boom', type: 'special', title: 'Baby-Boom', description: 'Züchte 15 Baby-Tiere erfolgreich zu Erwachsenen', emoji: '🐣', targetCount: 15, coinReward: 280, xpReward: 140, badgeReward: 'super_breeder', difficulty: 5, unlockLevel: 6 },
  { id: 'coastal_protectors', type: 'special', title: 'Küsten-Beschützer', description: 'Sammle 10 Tiere aus Küsten und Ozeanen', emoji: '🌊', targetCount: 10, coinReward: 210, xpReward: 105, badgeReward: 'coastal_guardian', difficulty: 4, unlockLevel: 4 },
  { id: 'mountain_mission', type: 'special', title: 'Berg-Mission', description: 'Rette 7 Bergtiere (Schneeleopard, Steinbock, etc.)', emoji: '⛰️', targetCount: 7, coinReward: 170, xpReward: 85, badgeReward: 'mountain_climber', difficulty: 3, unlockLevel: 3 },
];

// 🏛️ PARTNER-ZOOS (Arche Nova University/Zoo-Partner!)
export interface PartnerZooDefinition {
  id: string;
  name: string;
  continent: Continent;
  emoji: string;
  requiredAnimals: number;
  bonusType: 'coin_bonus' | 'xp_bonus' | 'animal_chance';
  bonusValue: number;
  description: string;
}

export const PARTNER_ZOOS: PartnerZooDefinition[] = [
  { id: 'zoo_berlin', name: 'Zoo Berlin', continent: 'Europa', emoji: '🏛️', requiredAnimals: 10, bonusType: 'coin_bonus', bonusValue: 15, description: 'Der berühmte Zoo in Deutschland!' },
  { id: 'san_diego_zoo', name: 'Zoo San Diego', continent: 'Amerika', emoji: '🌴', requiredAnimals: 15, bonusType: 'animal_chance', bonusValue: 20, description: 'Einer der besten Zoos der Welt!' },
  { id: 'taronga_zoo', name: 'Taronga Zoo Sydney', continent: 'Australien', emoji: '🦘', requiredAnimals: 12, bonusType: 'xp_bonus', bonusValue: 18, description: 'Der grosse Zoo in Australien!' },
  { id: 'singapore_zoo', name: 'Zoo Singapur', continent: 'Asien', emoji: '🏯', requiredAnimals: 18, bonusType: 'coin_bonus', bonusValue: 20, description: 'Super moderner Zoo in Asien!' },
  { id: 'bronx_zoo', name: 'Bronx Zoo', continent: 'Amerika', emoji: '🗽', requiredAnimals: 20, bonusType: 'animal_chance', bonusValue: 25, description: 'Der riesige Zoo in New York!' },
  { id: 'london_zoo', name: 'London Zoo', continent: 'Europa', emoji: '🏰', requiredAnimals: 14, bonusType: 'xp_bonus', bonusValue: 22, description: 'Der älteste Zoo der Welt!' },

  // 🆕 10 NEUE PARTNER-ZOOS
  { id: 'beijing_zoo', name: 'Beijing Zoo', continent: 'Asien', emoji: '🐉', requiredAnimals: 25, bonusType: 'animal_chance', bonusValue: 30, description: 'Heimat der berühmten Pandas aus China!' },
  { id: 'schoenbrunn_zoo', name: 'Tiergarten Schönbrunn', continent: 'Europa', emoji: '👑', requiredAnimals: 16, bonusType: 'xp_bonus', bonusValue: 25, description: 'Der älteste Zoo der Welt aus Wien!' },
  { id: 'tokyo_ueno_zoo', name: 'Ueno Zoo Tokyo', continent: 'Asien', emoji: '🗾', requiredAnimals: 22, bonusType: 'coin_bonus', bonusValue: 28, description: 'Japans erster zoologischer Garten!' },
  { id: 'nairobi_safari', name: 'Nairobi Safari Park', continent: 'Afrika', emoji: '🌍', requiredAnimals: 30, bonusType: 'animal_chance', bonusValue: 35, description: 'Wildtiere in ihrer natürlichen Umgebung!' },
  { id: 'chester_zoo', name: 'Chester Zoo', continent: 'Europa', emoji: '🦁', requiredAnimals: 28, bonusType: 'xp_bonus', bonusValue: 30, description: 'Englands grösster Zoo mit über 21.000 Tieren!' },
  { id: 'monterey_aquarium', name: 'Monterey Bay Aquarium', continent: 'Ozean', emoji: '🐙', requiredAnimals: 20, bonusType: 'coin_bonus', bonusValue: 25, description: 'Weltberühmtes Ozean-Aquarium in Kalifornien!' },
  { id: 'moscow_zoo', name: 'Moskauer Zoo', continent: 'Europa', emoji: '🏔️', requiredAnimals: 24, bonusType: 'animal_chance', bonusValue: 28, description: 'Ältester Zoo Russlands seit 1864!' },
  { id: 'adelaide_zoo', name: 'Adelaide Zoo', continent: 'Australien', emoji: '🐨', requiredAnimals: 18, bonusType: 'xp_bonus', bonusValue: 24, description: 'Australiens zweitältester Zoo!' },
  { id: 'barcelona_zoo', name: 'Zoo Barcelona', continent: 'Europa', emoji: '⚽', requiredAnimals: 26, bonusType: 'coin_bonus', bonusValue: 32, description: 'Mediterraner Zoo mit exotischen Tieren!' },
  { id: 'smithsonian_zoo', name: 'Smithsonian National Zoo', continent: 'Amerika', emoji: '🏛️', requiredAnimals: 32, bonusType: 'animal_chance', bonusValue: 40, description: 'Prestigeträchtigster Zoo der USA in Washington!' },
];

// 🏆 GROSSE ZIELE (Endgame-Auszeichnungen wie Arche Nova!)
export interface BigGoalDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetProgress: number;
  measureType: 'animals' | 'coins' | 'xp' | 'games_played' | 'continents' | 'groups' | 'partners'; // Added 'partners'
  hugereward: { coins: number; xp: number; badge: string };
}

export const BIG_GOALS: BigGoalDefinition[] = [
  { id: 'continent_master', title: 'Kontinent-Meister', description: 'Sammle Tiere von allen 6 Kontinenten', emoji: '🌍', targetProgress: 6, measureType: 'continents', hugereward: { coins: 500, xp: 250, badge: 'Welt-Entdecker' } },
  { id: 'group_expert', title: 'Gruppen-Experte', description: 'Sammle Tiere aus allen 10 Gruppen', emoji: '🦁', targetProgress: 10, measureType: 'groups', hugereward: { coins: 600, xp: 300, badge: 'Tier-Experte' } },
  { id: 'coin_millionaire', title: 'Münz-Millionär', description: 'Sammle 5000 Münzen', emoji: '💰', targetProgress: 5000, measureType: 'coins', hugereward: { coins: 1000, xp: 500, badge: 'Reich!' } },
  { id: 'xp_legend', title: 'XP-Legende', description: 'Erreiche 10.000 XP', emoji: '⭐', targetProgress: 10000, measureType: 'xp', hugereward: { coins: 800, xp: 400, badge: 'Lern-Champion' } },
  { id: 'zoo_partner_pro', title: 'Partner-Profi', description: 'Schalte alle 6 Partner-Zoos frei', emoji: '🏛️', targetProgress: 6, measureType: 'partners', hugereward: { coins: 700, xp: 350, badge: 'Weltweites Netzwerk' } },
  { id: 'ocean_dominator', title: '🌊 Ozean-Dominator', description: 'Sammle 20 verschiedene Meerestiere', emoji: '🐋', targetProgress: 20, measureType: 'animals', hugereward: { coins: 10000, xp: 2000, badge: 'Unterwasser-König' } },
  { id: 'reptile_master', title: '🦎 Reptilien-Meister', description: 'Sammle 20 verschiedene Reptilien & Amphibien', emoji: '🐍', targetProgress: 20, measureType: 'animals', hugereward: { coins: 9000, xp: 1800, badge: 'Reptilien-Experte' } },
  { id: 'complete_collection', title: 'Vollständige Sammlung', description: 'Sammle alle 56 Tiere!', emoji: '🎊', targetProgress: 56, measureType: 'animals', hugereward: { coins: 2000, xp: 1000, badge: 'Perfekter Zoo' } },

  // 🆕 10 NEUE GROSSE ZIELE
  { id: 'bird_paradise', title: 'Vogel-Paradies', description: 'Sammle alle 15 Vogelarten', emoji: '🦅', targetProgress: 15, measureType: 'animals', hugereward: { coins: 900, xp: 450, badge: 'Vogel-König' } },
  { id: 'predator_collection', title: 'Raubtier-Sammler', description: 'Sammle alle 12 Raubkatzen', emoji: '🐯', targetProgress: 12, measureType: 'animals', hugereward: { coins: 850, xp: 425, badge: 'Raubtier-Dompteur' } },
  { id: 'mega_partner', title: 'Mega-Partner', description: 'Schalte alle 16 Partner-Zoos frei', emoji: '🌐', targetProgress: 16, measureType: 'partners', hugereward: { coins: 1500, xp: 750, badge: 'Globales Netzwerk' } },
  { id: 'coin_tycoon', title: 'Münz-Tycoon', description: 'Sammle 10.000 Münzen', emoji: '💎', targetProgress: 10000, measureType: 'coins', hugereward: { coins: 2000, xp: 1000, badge: 'Milliardär' } },
  { id: 'breeding_master', title: 'Zucht-Meister', description: 'Züchte 50 Baby-Tiere', emoji: '🐣', targetProgress: 50, measureType: 'animals', hugereward: { coins: 1200, xp: 600, badge: 'Züchter-Profi' } },
  { id: 'habitat_architect', title: 'Gehege-Architekt', description: 'Kaufe alle 15 Gehege', emoji: '🏗️', targetProgress: 15, measureType: 'coins', hugereward: { coins: 1000, xp: 500, badge: 'Bau-Meister' } },
  { id: 'night_owl_master', title: 'Nacht-Meister', description: 'Sammle alle 8 nachtaktiven Tiere', emoji: '🌙', targetProgress: 8, measureType: 'animals', hugereward: { coins: 750, xp: 375, badge: 'Nacht-Wächter' } },
  { id: 'desert_champion', title: 'Wüsten-Champion', description: 'Sammle alle 8 Wüstentiere', emoji: '🏜️', targetProgress: 8, measureType: 'animals', hugereward: { coins: 700, xp: 350, badge: 'Wüsten-König' } },
  { id: 'arctic_explorer', title: 'Arktis-Forscher', description: 'Sammle alle 10 Arktis-Tiere', emoji: '❄️', targetProgress: 10, measureType: 'animals', hugereward: { coins: 800, xp: 400, badge: 'Eis-Experte' } },
  { id: 'ultimate_zookeeper', title: 'Ultimativer Zoowärter', description: 'Erreiche Level 50', emoji: '👑', targetProgress: 50000, measureType: 'xp', hugereward: { coins: 5000, xp: 2500, badge: 'Zoo-Legende' } },
  // NEW BIG GOALS FOR REPTILES, INSECTS, AND SMALL CREATURES
  {
    id: 'insect_collector',
    title: '🪲 Insekten-Sammler',
    description: 'Sammle 15 verschiedene Insekten & Spinnentiere',
    emoji: '🦋',
    targetProgress: 15,
    measureType: 'animals' as const,
    hugereward: {
      coins: 6000,
      xp: 1200,
      badge: 'Insekten-Forscher'
    }
  },
  {
    id: 'amphibian_hero',
    title: '🐸 Amphibien-Held',
    description: 'Sammle alle Frösche, Molche & Axolotl',
    emoji: '🐸',
    targetProgress: 7,
    measureType: 'animals' as const,
    hugereward: {
      coins: 5000,
      xp: 1000,
      badge: 'Amphibien-Retter'
    }
  },
  {
    id: 'aquarium_master',
    title: '🐠 Aquarien-Meister',
    description: 'Baue ein perfektes Aquarium mit 25 Arten',
    emoji: '🏛️',
    targetProgress: 25,
    measureType: 'animals' as const,
    hugereward: {
      coins: 12000,
      xp: 2500,
      badge: 'Aquarien-Virtuose'
    }
  },
  {
    id: 'tiny_creatures',
    title: '🐭 Kleine Wunder',
    description: 'Sammle alle kleinen Säuger (Hamster, Mäuse, etc.)',
    emoji: '🐹',
    targetProgress: 6,
    measureType: 'animals' as const,
    hugereward: {
      coins: 4000,
      xp: 800,
      badge: 'Kleintier-Freund'
    }
  },
];

// 🏆 BADGE CHECKING SYSTEM
export function checkCollectionBadges(
  collectedAnimalsCount: number,
  currentBadges: string[]
): { newBadges: string[]; rewards: { coins: number; xp: number } } {
  const newBadges: string[] = [];
  let totalCoins = 0;
  let totalXP = 0;

  // Check first animal
  if (collectedAnimalsCount >= 1 && !currentBadges.includes('first-animal')) {
    newBadges.push('first-animal');
    totalCoins += 50;
    totalXP += 25;
  }

  // Check 5 animals (Tierfreund)
  if (collectedAnimalsCount >= 5 && !currentBadges.includes('animal-collector-5')) {
    newBadges.push('animal-collector-5');
    totalCoins += 100;
    totalXP += 50;
  }

  // Check 10 animals
  if (collectedAnimalsCount >= 10 && !currentBadges.includes('animal-collector-10')) {
    newBadges.push('animal-collector-10');
    totalCoins += 200;
    totalXP += 100;
  }

  // Check 20 animals
  if (collectedAnimalsCount >= 20 && !currentBadges.includes('animal-collector-20')) {
    newBadges.push('animal-collector-20');
    totalCoins += 400;
    totalXP += 200;
  }

  // Check 30 animals
  if (collectedAnimalsCount >= 30 && !currentBadges.includes('animal-collector-30')) {
    newBadges.push('animal-collector-30');
    totalCoins += 600;
    totalXP += 300;
  }

  // Check all animals (currently 49 unique animals)
  if (collectedAnimalsCount >= 49 && !currentBadges.includes('all-animals')) {
    newBadges.push('all-animals');
    totalCoins += 2000;
    totalXP += 1000;
  }

  return {
    newBadges,
    rewards: { coins: totalCoins, xp: totalXP }
  };
}

// 🌱 XP-TRACKING HELPER (für Spiele-Integration)

/**
 * Gibt XP an ein zufälliges Baby-Tier oder an alle Baby-Tiere
 * @param userId - User-ID
 * @param xpAmount - Menge an XP die vergeben werden soll
 * @param distributeToAll - Wenn true, wird XP an alle Baby-Tiere verteilt
 * @returns Promise mit Evolution-Informationen
 */
export async function awardAnimalXP(
  userId: string,
  xpAmount: number,
  distributeToAll: boolean = false
): Promise<{
  success: boolean;
  evolved: boolean;
  evolvedAnimal?: string;
  totalXPAwarded: number;
}> {
  try {
    // Fetch current animals
    const response = await fetch(`/api/zoo/animals/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch animals');

    const data = await response.json();
    const animals = data.animals || [];

    // Filter baby animals
    const babyAnimals = animals.filter((a: any) => a.age === 'baby');

    if (babyAnimals.length === 0) {
      return {
        success: true,
        evolved: false,
        totalXPAwarded: 0,
      };
    }

    let evolvedAnimal: string | undefined;
    let totalEvolutions = 0;
    let totalXPAwarded = 0;

    if (distributeToAll) {
      // Distribute XP to all baby animals
      const xpPerAnimal = Math.floor(xpAmount / babyAnimals.length);
      const remainder = xpAmount % babyAnimals.length;

      for (let i = 0; i < babyAnimals.length; i++) {
        const animal = babyAnimals[i];
        // Distribute remainder to first animals to ensure all XP is used
        const xpToGive = xpPerAnimal + (i < remainder ? 1 : 0);

        if (xpToGive === 0) continue; // Skip if no XP to give

        const addXPResponse = await fetch('/api/zoo/animals/add-xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            animalType: animal.animalType,
            xp: xpToGive,
          }),
        });

        if (addXPResponse.ok) {
          const result = await addXPResponse.json();
          totalXPAwarded += xpToGive;

          if (result.evolved) {
            totalEvolutions++;
            if (!evolvedAnimal) evolvedAnimal = animal.animalType;
          }
        }
      }
    } else {
      // Award to single random baby
      const randomBaby = babyAnimals[Math.floor(Math.random() * babyAnimals.length)];

      const addXPResponse = await fetch('/api/zoo/animals/add-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          animalType: randomBaby.animalType,
          xp: xpAmount,
        }),
      });

      if (addXPResponse.ok) {
        const result = await addXPResponse.json();
        totalXPAwarded = xpAmount;

        if (result.evolved) {
          totalEvolutions = 1;
          evolvedAnimal = randomBaby.animalType;
        }
      }
    }

    return {
      success: true,
      evolved: totalEvolutions > 0,
      evolvedAnimal,
      totalXPAwarded,
    };
  } catch (error) {
    console.error('Error awarding animal XP:', error);
    return {
      success: false,
      evolved: false,
      totalXPAwarded: 0,
    };
  }
}