export type GameId = 
  | 'zahlenwaage' 
  | 'one-times-one'
  | 'ten-wins' 
  | 'number-stairs' 
  | 'number-builder' 
  | 'decomposition' 
  | 'doubling' 
  | 'zoo-adventure'
  | 'pathfinder'
  | 'neighbors'
  | 'quantity-master'
  | 'structured-perception'
  | 'part-whole-house';

export interface GameLevel {
  level: number;
  name: string;
  description: string;
  icon?: string;
}

export interface ZahlenwaageLevel extends GameLevel {
  numberCount: 2 | 3 | 4;
  numberRange: [number, number];
  allowDice: boolean;
  allowAnimals: boolean;
  allowMultiplication?: boolean;
  allowSquares?: boolean;
}

export interface TenWinsLevel extends GameLevel {
  timeLimit: number;
  targetScore: number;
  showHints: boolean;
}

export interface NumberStairsLevel extends GameLevel {
  range: [number, number];
  count: number;
}

export interface NumberBuilderLevel extends GameLevel {
  maxHundreds: number;
  maxTens: number;
  maxOnes: number;
  allowBundling: boolean;
}

export interface DecompositionLevel extends GameLevel {
  numberRange: [number, number];
  minDecompositions: number;
  maxDecompositions: number;
}

export interface DoublingLevel extends GameLevel {
  numberRange: [number, number];
  taskTypes: ('pure-doubling' | 'near-doubling' | 'halving')[];
  showHints: boolean;
}

export interface ZooAdventureLevel extends GameLevel {
  numberRange: 10 | 20 | 100;
  operations: ('+' | '-')[];
  requiresTransition: boolean;
  enclosureCount: number;
}

export interface PathfinderLevel extends GameLevel {
  numberRange: [number, number];
  strategyCount: number;
  minElegance: number;
  tasksPerRound: number;
}

export interface NeighborsLevel extends GameLevel {
  numberRange: [number, number];
  neighborTypes: ('ones' | 'tens' | 'hundreds' | 'thousands' | 'mixed')[];
}

export interface OneTimesOneLevel extends GameLevel {
  rows: number[];
  description: string;
}

export const ZAHLENWAAGE_LEVELS: ZahlenwaageLevel[] = [
  { level: 1, name: "Erste Schritte", description: "2 Zahlen bis 5", numberCount: 2, numberRange: [1, 5], allowDice: true, allowAnimals: false, icon: "🎲" },
  { level: 2, name: "Mit Tieren", description: "2 Zahlen bis 10", numberCount: 2, numberRange: [1, 10], allowDice: true, allowAnimals: true, icon: "🦁" },
  { level: 3, name: "Drei Zahlen", description: "3 Zahlen bis 10", numberCount: 3, numberRange: [1, 10], allowDice: true, allowAnimals: true, icon: "🎯" },
  { level: 4, name: "Bis Zwanzig", description: "3 Zahlen bis 20", numberCount: 3, numberRange: [1, 20], allowDice: true, allowAnimals: true, icon: "⭐" },
  { level: 5, name: "Große Zahlen", description: "3 Zahlen bis 50", numberCount: 3, numberRange: [1, 50], allowDice: false, allowAnimals: true, icon: "🌟" },
  { level: 6, name: "Bis Hundert", description: "3 Zahlen bis 100", numberCount: 3, numberRange: [1, 100], allowDice: false, allowAnimals: true, icon: "💎" },
  { level: 7, name: "Große Zahlen", description: "3 Zahlen bis 150", numberCount: 3, numberRange: [1, 150], allowDice: false, allowAnimals: true, icon: "🏆" },
  { level: 8, name: "Meister", description: "3 Zahlen bis 200", numberCount: 3, numberRange: [1, 200], allowDice: false, allowAnimals: true, icon: "👑" },
  { level: 9, name: "Einmaleins Start", description: "Multiplikation mit Würfeln", numberCount: 3, numberRange: [2, 6], allowDice: true, allowAnimals: false, allowMultiplication: true, icon: "✖️" },
  { level: 10, name: "Einmaleins Meister", description: "Schwere Multiplikation!", numberCount: 3, numberRange: [2, 6], allowDice: true, allowAnimals: false, allowMultiplication: true, icon: "🎓" },
  { level: 11, name: "Quadratzahlen", description: "Quadrate mit Würfeln!", numberCount: 3, numberRange: [2, 6], allowDice: true, allowAnimals: false, allowMultiplication: true, allowSquares: true, icon: "⬜" }
];

export const TEN_WINS_LEVELS: TenWinsLevel[] = [
  { level: 1, name: "Langsam üben", description: "90 Sekunden", timeLimit: 90, targetScore: 5, showHints: true, icon: "🐢" },
  { level: 2, name: "Mit Tipps", description: "75 Sekunden", timeLimit: 75, targetScore: 8, showHints: true, icon: "💡" },
  { level: 3, name: "Normal", description: "60 Sekunden", timeLimit: 60, targetScore: 10, showHints: false, icon: "⏱️" },
  { level: 4, name: "Schneller", description: "50 Sekunden", timeLimit: 50, targetScore: 12, showHints: false, icon: "⚡" },
  { level: 5, name: "Rasant", description: "40 Sekunden", timeLimit: 40, targetScore: 15, showHints: false, icon: "🚀" },
  { level: 6, name: "Blitzschnell", description: "35 Sekunden", timeLimit: 35, targetScore: 18, showHints: false, icon: "⚡⚡" },
  { level: 7, name: "Profi", description: "30 Sekunden", timeLimit: 30, targetScore: 20, showHints: false, icon: "🏆" },
  { level: 8, name: "Meister", description: "25 Sekunden", timeLimit: 25, targetScore: 25, showHints: false, icon: "👑" }
];

export const NUMBER_STAIRS_LEVELS: NumberStairsLevel[] = [
  { level: 1, name: "Kleine Zahlen", description: "5 Zahlen bis 10", range: [1, 10], count: 5, icon: "🪜" },
  { level: 2, name: "Bis Zwanzig", description: "6 Zahlen bis 20", range: [1, 20], count: 6, icon: "📈" },
  { level: 3, name: "Bis Hundert", description: "8 Zahlen bis 100", range: [1, 100], count: 8, icon: "💯" },
  { level: 4, name: "Größere Schritte", description: "8 Zahlen bis 200", range: [10, 200], count: 8, icon: "🎯" },
  { level: 5, name: "Mittlere Zahlen", description: "8 Zahlen bis 500", range: [50, 500], count: 8, icon: "⭐" },
  { level: 6, name: "Bis Tausend", description: "8 Zahlen bis 1000", range: [100, 1000], count: 8, icon: "🌟" },
  { level: 7, name: "Große Zahlen", description: "8 Zahlen bis 5000", range: [500, 5000], count: 8, icon: "💎" },
  { level: 8, name: "Meister", description: "8 Zahlen bis 10000", range: [1000, 10000], count: 8, icon: "👑" },
  { level: 9, name: "Ziffernmuster", description: "12 Zahlen bis 100000", range: [1000, 100000], count: 12, icon: "🎨" },
  { level: 10, name: "Mega Meister", description: "12 Zahlen bis 1000000", range: [10000, 1000000], count: 12, icon: "🚀" }
];

export const NUMBER_BUILDER_LEVELS: NumberBuilderLevel[] = [
  { level: 1, name: "Nur Einer", description: "Bis 5", maxHundreds: 0, maxTens: 0, maxOnes: 5, allowBundling: false, icon: "🔢" },
  { level: 2, name: "Mit Zehnern", description: "Bis 15", maxHundreds: 0, maxTens: 1, maxOnes: 5, allowBundling: false, icon: "📦" },
  { level: 3, name: "Bis Zwanzig", description: "Bis 29", maxHundreds: 0, maxTens: 2, maxOnes: 9, allowBundling: false, icon: "🎯" },
  { level: 4, name: "Größere Zehner", description: "Bis 59", maxHundreds: 0, maxTens: 5, maxOnes: 9, allowBundling: false, icon: "⭐" },
  { level: 5, name: "Bis Hundert", description: "Bis 99", maxHundreds: 0, maxTens: 9, maxOnes: 9, allowBundling: false, icon: "💯" },
  { level: 6, name: "Mit Hundertern", description: "Bis 259", maxHundreds: 2, maxTens: 5, maxOnes: 9, allowBundling: false, icon: "🏗️" },
  { level: 7, name: "Bis Tausend", description: "Bis 599", maxHundreds: 5, maxTens: 9, maxOnes: 9, allowBundling: false, icon: "🌟" },
  { level: 8, name: "Mit Bündeln", description: "Bis 999 + Bündeln", maxHundreds: 12, maxTens: 12, maxOnes: 12, allowBundling: true, icon: "👑" }
];

export const DECOMPOSITION_LEVELS: DecompositionLevel[] = [
  // Levels 1-20: Kleine Zahlen (3-10)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 1,
    name: `Level ${i + 1}`,
    description: "Kleine Zahlen bis 10",
    numberRange: [3, 10] as [number, number],
    minDecompositions: 2,
    maxDecompositions: 4,
    icon: "🧩"
  })),
  // Levels 21-40: Mittlere Zahlen (10-20)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 21,
    name: `Level ${i + 21}`,
    description: "Mittlere Zahlen bis 20",
    numberRange: [10, 20] as [number, number],
    minDecompositions: 4,
    maxDecompositions: 8,
    icon: "🎯"
  })),
  // Levels 41-60: Größere Zahlen (15-40)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 41,
    name: `Level ${i + 41}`,
    description: "Größere Zahlen bis 40",
    numberRange: [15, 40] as [number, number],
    minDecompositions: 6,
    maxDecompositions: 12,
    icon: "📈"
  })),
  // Levels 61-80: Große Zahlen (30-80)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 61,
    name: `Level ${i + 61}`,
    description: "Große Zahlen bis 80",
    numberRange: [30, 80] as [number, number],
    minDecompositions: 10,
    maxDecompositions: 15,
    icon: "💎"
  })),
  // Levels 81-100: Sehr große Zahlen (50-200)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 81,
    name: `Level ${i + 81}`,
    description: "Sehr große Zahlen bis 200",
    numberRange: [50, 200] as [number, number],
    minDecompositions: 12,
    maxDecompositions: 20,
    icon: "🏆"
  }))
];

export const DOUBLING_LEVELS: DoublingLevel[] = [
  { level: 1, name: "Kleine Doppel", description: "Verdoppeln bis 5", numberRange: [1, 5], taskTypes: ['pure-doubling'], showHints: true, icon: "👯" },
  { level: 2, name: "Bis Zehn", description: "Verdoppeln bis 10", numberRange: [2, 10], taskTypes: ['pure-doubling'], showHints: true, icon: "🎯" },
  { level: 3, name: "Fast-Doppel", description: "±1 Trick bis 10", numberRange: [2, 10], taskTypes: ['pure-doubling', 'near-doubling'], showHints: true, icon: "⭐" },
  { level: 4, name: "Bis Zwanzig", description: "Verdoppeln bis 20", numberRange: [5, 20], taskTypes: ['pure-doubling', 'near-doubling'], showHints: false, icon: "💫" },
  { level: 5, name: "Mit Halbieren", description: "Doppel + Halb bis 20", numberRange: [5, 20], taskTypes: ['pure-doubling', 'near-doubling', 'halving'], showHints: false, icon: "🌟" },
  { level: 6, name: "Bis Fünfzig", description: "Alle Tricks bis 50", numberRange: [10, 50], taskTypes: ['pure-doubling', 'near-doubling', 'halving'], showHints: false, icon: "💎" },
  { level: 7, name: "Große Zahlen", description: "Bis 100", numberRange: [20, 100], taskTypes: ['pure-doubling', 'near-doubling', 'halving'], showHints: false, icon: "🏆" },
  { level: 8, name: "Meister", description: "Bis 200", numberRange: [50, 200], taskTypes: ['pure-doubling', 'near-doubling', 'halving'], showHints: false, icon: "👑" }
];

export const ZOO_ADVENTURE_LEVELS: ZooAdventureLevel[] = [
  { level: 1, name: "Erste Gehege", description: "Addition bis 10", numberRange: 10, operations: ['+'], requiresTransition: false, enclosureCount: 2, icon: "🦁" },
  { level: 2, name: "Minus lernen", description: "Plus & Minus bis 10", numberRange: 10, operations: ['+', '-'], requiresTransition: false, enclosureCount: 3, icon: "🐘" },
  { level: 3, name: "Bis Zwanzig", description: "Addition bis 20", numberRange: 20, operations: ['+'], requiresTransition: false, enclosureCount: 3, icon: "🦒" },
  { level: 4, name: "Alle Aufgaben", description: "Plus & Minus bis 20", numberRange: 20, operations: ['+', '-'], requiresTransition: false, enclosureCount: 4, icon: "🦓" },
  { level: 5, name: "Zehnerübergang", description: "Mit Übergang +", numberRange: 20, operations: ['+'], requiresTransition: true, enclosureCount: 4, icon: "🐵" },
  { level: 6, name: "Schwieriger Minus", description: "Mit Übergang -", numberRange: 20, operations: ['-'], requiresTransition: true, enclosureCount: 5, icon: "🐼" },
  { level: 7, name: "Alles gemischt", description: "Alle Gehege", numberRange: 20, operations: ['+', '-'], requiresTransition: true, enclosureCount: 6, icon: "🏆" },
  { level: 8, name: "Meister", description: "Bis 100!", numberRange: 100, operations: ['+', '-'], requiresTransition: true, enclosureCount: 6, icon: "👑" }
];

export const PATHFINDER_LEVELS: PathfinderLevel[] = [
  { level: 1, name: "Erste Wege", description: "2 Strategien, bis 10", numberRange: [1, 10], strategyCount: 2, minElegance: 2, tasksPerRound: 3, icon: "🗺️" },
  { level: 2, name: "Mehr Strategien", description: "3 Strategien, bis 10", numberRange: [1, 10], strategyCount: 3, minElegance: 2, tasksPerRound: 4, icon: "🧭" },
  { level: 3, name: "Bis Zwanzig", description: "3 Strategien, bis 20", numberRange: [1, 20], strategyCount: 3, minElegance: 3, tasksPerRound: 5, icon: "🎯" },
  { level: 4, name: "Eleganter", description: "4 Strategien, bis 20", numberRange: [5, 20], strategyCount: 4, minElegance: 3, tasksPerRound: 5, icon: "⭐" },
  { level: 5, name: "Alle Tricks", description: "5 Strategien, bis 30", numberRange: [10, 30], strategyCount: 5, minElegance: 4, tasksPerRound: 6, icon: "🌟" },
  { level: 6, name: "Komplexer", description: "5 Strategien, bis 50", numberRange: [10, 50], strategyCount: 5, minElegance: 4, tasksPerRound: 6, icon: "💎" },
  { level: 7, name: "Meister-Wege", description: "Alle Strategien, bis 100", numberRange: [20, 100], strategyCount: 5, minElegance: 5, tasksPerRound: 7, icon: "🏆" },
  { level: 8, name: "Großmeister", description: "Perfekte Eleganz", numberRange: [50, 200], strategyCount: 5, minElegance: 5, tasksPerRound: 8, icon: "👑" }
];

export const NEIGHBORS_LEVELS: NeighborsLevel[] = [
  { level: 1, name: "Einer-Nachbarn 1", description: "Finde die Einer-Nachbarn kleiner Zahlen", numberRange: [10, 50], neighborTypes: ['ones'], icon: "🐜" },
  { level: 2, name: "Einer-Nachbarn 2", description: "Finde die Einer-Nachbarn größerer Zahlen", numberRange: [50, 100], neighborTypes: ['ones'], icon: "🐞" },
  { level: 3, name: "Zehner-Nachbarn 1", description: "Finde die Zehner-Nachbarn", numberRange: [10, 100], neighborTypes: ['tens'], icon: "🐰" },
  { level: 4, name: "Zehner-Nachbarn 2", description: "Zehner-Nachbarn mit Grenzen (z.B. 996 → 990 und 1000)", numberRange: [100, 1000], neighborTypes: ['tens'], icon: "🐁" },
  { level: 5, name: "Hunderter-Nachbarn 1", description: "Finde die Hunderter-Nachbarn", numberRange: [100, 1000], neighborTypes: ['hundreds'], icon: "🦊" },
  { level: 6, name: "Hunderter-Nachbarn 2", description: "Hunderter-Nachbarn großer Zahlen", numberRange: [1000, 10000], neighborTypes: ['hundreds'], icon: "🐺" },
  { level: 7, name: "Tausender-Nachbarn", description: "Finde die Tausender-Nachbarn (auch bei 583 → 0 und 1000!)", numberRange: [0, 10000], neighborTypes: ['thousands'], icon: "🐘" },
  { level: 8, name: "Gemischt - Meister", description: "Alle Nachbar-Typen gemischt - zeig was du kannst!", numberRange: [0, 10000], neighborTypes: ['mixed'], icon: "🦒" }
];

export const ONE_TIMES_ONE_LEVELS: OneTimesOneLevel[] = [
  // 1er & 10er Reihen (Level 1-20)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 1,
    name: `Level ${i + 1}`,
    description: "1er & 10er Reihen",
    rows: [1, 10],
    icon: "1️⃣"
  })),
  // 2er & 5er Reihen (Level 21-40)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 21,
    name: `Level ${i + 21}`,
    description: "2er & 5er Reihen",
    rows: [2, 5],
    icon: "2️⃣"
  })),
  // 3er & 4er Reihen (Level 41-60)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 41,
    name: `Level ${i + 41}`,
    description: "3er & 4er Reihen",
    rows: [3, 4],
    icon: "3️⃣"
  })),
  // 6er & 9er Reihen (Level 61-80)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 61,
    name: `Level ${i + 61}`,
    description: "6er & 9er Reihen",
    rows: [6, 9],
    icon: "6️⃣"
  })),
  // 7er & 8er Reihen (Level 81-100)
  ...Array.from({ length: 20 }, (_, i) => ({
    level: i + 81,
    name: `Level ${i + 81}`,
    description: "7er & 8er Reihen",
    rows: [7, 8],
    icon: "7️⃣"
  }))
];

export const GAME_LEVELS = {
  'zahlenwaage': ZAHLENWAAGE_LEVELS,
  'one-times-one': ONE_TIMES_ONE_LEVELS,
  'ten-wins': TEN_WINS_LEVELS,
  'number-stairs': NUMBER_STAIRS_LEVELS,
  'number-builder': NUMBER_BUILDER_LEVELS,
  'decomposition': DECOMPOSITION_LEVELS,
  'doubling': DOUBLING_LEVELS,
  'zoo-adventure': ZOO_ADVENTURE_LEVELS,
  'pathfinder': PATHFINDER_LEVELS,
  'neighbors': NEIGHBORS_LEVELS
} as const;

export function getGameLevels<T extends GameId>(gameId: T): typeof GAME_LEVELS[T] {
  return GAME_LEVELS[gameId];
}

export function getGameLevel<T extends GameId>(gameId: T, level: number): typeof GAME_LEVELS[T][number] | undefined {
  const levels = GAME_LEVELS[gameId];
  return levels.find(l => l.level === level);
}