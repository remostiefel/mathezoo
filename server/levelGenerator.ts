import type { StageConfig, SubLevelConfig } from "./progressionEngine";

// 100 Level-Namen mit Zoo-Thematik - kindgerechte Progression
const LEVEL_NAMES: Record<number, string> = {
  // 1-10: Unterwasserwelt
  1: "🐠 Erste Blubberblasen",
  2: "🐟 Kleine Fischlein",
  3: "🦀 Krebse entdecken",
  4: "🐙 Oktopus-Freunde",
  5: "🦑 Tintenfisch-Abenteuer",
  6: "🐚 Muschel-Schätze",
  7: "🦐 Garnelen-Parade",
  8: "🐡 Kugelfisch-Spaß",
  9: "🦈 Hai-Begegnung",
  10: "🐋 Wal-Meister",

  // 11-20: Seeufer & Strand
  11: "🦭 Seehund-Spiele",
  12: "🦦 Otter-Rutsche",
  13: "🐧 Pinguin-Watscheln",
  14: "🦩 Flamingo-Tanz",
  15: "🦆 Enten-Familie",
  16: "🦢 Schwan-Eleganz",
  17: "🦅 Adler-Blick",
  18: "🦉 Eulen-Weisheit",
  19: "🦜 Papageien-Plausch",
  20: "🦚 Pfau-Stolz",

  // 21-30: Luftakrobaten
  21: "🐦 Vogel-Flug",
  22: "🕊️ Tauben-Post",
  23: "🦃 Truthahn-Trab",
  24: "🐓 Hahn-Krähen",
  25: "🐥 Küken-Schlupf",
  26: "🦇 Fledermaus-Nacht",
  27: "🦅 Greifvogel-Jagd",
  28: "🦢 Zugvogel-Reise",
  29: "🦜 Tropenvögel",
  30: "🦩 Flugmeister",

  // 31-40: Safari-Abenteuer
  31: "🦁 Löwen-Brüllen",
  32: "🐘 Elefanten-Herde",
  33: "🦒 Giraffen-Hälse",
  34: "🦓 Zebra-Streifen",
  35: "🦏 Nashorn-Kraft",
  36: "🦛 Nilpferd-Bad",
  37: "🐆 Geparden-Sprint",
  38: "🐅 Tiger-Schleichen",
  39: "🦍 Gorilla-Stärke",
  40: "🐃 Büffel-Wanderung",

  // 41-50: Dschungel-Expedition
  41: "🐵 Affen-Klettern",
  42: "🦧 Orang-Utan-Schwung",
  43: "🐒 Schimpansen-Spiel",
  44: "🦥 Faultier-Ruhe",
  45: "🦎 Chamäleon-Tarnung",
  46: "🐍 Schlangen-Pfad",
  47: "🐊 Krokodil-Lauer",
  48: "🦜 Dschungel-Chor",
  49: "🦋 Schmetterlings-Tanz",
  50: "🌴 Dschungel-König",

  // 51-60: Insektenwelt
  51: "🐛 Raupen-Krabbeln",
  52: "🦋 Puppen-Verwandlung",
  53: "🐝 Bienen-Summen",
  54: "🐞 Käfer-Krabbeln",
  55: "🦗 Grillen-Zirpen",
  56: "🕷️ Spinnen-Netz",
  57: "🦟 Libellen-Flug",
  58: "🐜 Ameisen-Straße",
  59: "🦂 Skorpion-Zange",
  60: "🕸️ Insekten-Experte",

  // 61-70: Polarregion
  61: "🐻‍❄️ Eisbär-Tatzen",
  62: "🦭 Robben-Gleiten",
  63: "🐧 Pinguin-Kolonie",
  64: "🦌 Rentier-Rennen",
  65: "🦊 Polarfuchs-List",
  66: "🐺 Wolf-Rudel",
  67: "🦉 Schnee-Eule",
  68: "🐋 Wal-Gesang",
  69: "🦈 Eis-Haie",
  70: "❄️ Polar-Champion",

  // 71-80: Australien & Exotik
  71: "🦘 Känguru-Sprung",
  72: "🐨 Koala-Umarmung",
  73: "🦡 Wombat-Höhle",
  74: "🦘 Wallaby-Hüpfen",
  75: "🦎 Gecko-Kletterei",
  76: "🐊 Salzwasser-Krokodil",
  77: "🦘 Outback-Held",
  78: "🕷️ Vogelspinne-Mut",
  79: "🦎 Dornteufel-Tricks",
  80: "🌏 Down-Under-Star",

  // 81-90: Berge & Hochland
  81: "🦅 Steinadler-Flug",
  82: "🐐 Steinbock-Klettern",
  83: "🦌 Hirsch-Geweih",
  84: "🐻 Braunbär-Kraft",
  85: "🦝 Waschbär-Neugier",
  86: "🦫 Biber-Damm",
  87: "🦡 Dachs-Bau",
  88: "🦅 Gipfel-Stürmer",
  89: "🏔️ Berg-Meister",
  90: "⛰️ Hochland-König",

  // 91-100: Legendäre Tiere & Meisterschaft
  91: "🦄 Einhorn-Magie",
  92: "🐉 Drachen-Flug",
  93: "🦅 Phoenix-Aufstieg",
  94: "🦁 Sphinx-Rätsel",
  95: "🐲 Lindwurm-Weisheit",
  96: "🦖 Dino-Entdeckung",
  97: "🦕 Urzeitriese",
  98: "👑 Zoo-Direktor",
  99: "🏆 Großmeister",
  100: "🌟 Mathe-Legende"
};

export class LevelGenerator {
  private levels: Map<number, SubLevelConfig> = new Map();

  constructor() {
    this.levels = this.generateAllLevels();
  }

  /**
   * Gibt den Namen eines Levels zurück
   */
  getLevelName(level: number): string {
    return LEVEL_NAMES[level] || `Level ${level}`;
  }

  /**
   * Generiere Sub-Levels für alle 15 Stages
   */
  generateAllLevels(): Map<number, SubLevelConfig> {
    const levels = new Map<number, SubLevelConfig>();
    let currentLevel = 1;

    // Stage 1-3: Zehnerraum (Levels 1-20)
    currentLevel = this.generateSubLevelsForStageGroup(
      levels,
      currentLevel,
      [1, 2, 3],
      20,
      { baseComplexity: 0.1, growthRate: 0.05 }
    );

    // Stage 4-7: Zwanzigerraum ohne Übergang (Levels 21-40)
    currentLevel = this.generateSubLevelsForStageGroup(
      levels,
      currentLevel,
      [4, 5, 6, 7],
      20,
      { baseComplexity: 0.2, growthRate: 0.04 }
    );

    // Stage 8-11: Zehnerübergang (Levels 41-68)
    currentLevel = this.generateSubLevelsForStageGroup(
      levels,
      currentLevel,
      [8, 9, 10, 11],
      28,
      { baseComplexity: 0.4, growthRate: 0.03 }
    );

    // Stage 12-15: Hunderterraum (Levels 69-92)
    currentLevel = this.generateSubLevelsForStageGroup(
      levels,
      currentLevel,
      [12, 13, 14, 15],
      24,
      { baseComplexity: 0.6, growthRate: 0.02 }
    );

    // ERWEITERTE LEVELS 93-100: Meisterschaft & Automatisierung
    // Nach Stage 15 folgen 8 Meisterschafts-Levels für vollständige Automatisierung
    currentLevel = this.generateMasteryLevels(
      levels,
      currentLevel,
      8,
      { baseComplexity: 0.8, growthRate: 0.01 }
    );

    return levels;
  }

  /**
   * Generiere Meisterschafts-Levels (93-100)
   * Diese Levels fokussieren auf Automatisierung und Geschwindigkeit
   */
  private generateMasteryLevels(
    levels: Map<number, SubLevelConfig>,
    startLevel: number,
    totalLevels: number,
    params: { baseComplexity: number; growthRate: number }
  ): number {
    let currentLevel = startLevel;

    for (let i = 0; i < totalLevels; i++) {
      const subLevel = i + 1;
      const progress = i / (totalLevels - 1); // 0.0 → 1.0

      const config: SubLevelConfig = {
        level: currentLevel,
        subLevelInStage: subLevel,
        difficulty: params.baseComplexity + (progress * params.growthRate * totalLevels),
        tasksRequired: 10, // Einheitlich 10 Aufgaben für alle Levels
        numberRangeMultiplier: 1.3 + (progress * 0.2), // Bis zu 50% größere Zahlen
        complexityBoost: 0.9 + (progress * 0.1) // Maximale Komplexität
      };

      levels.set(currentLevel, config);
      currentLevel++;
    }

    return currentLevel;
  }

  /**
   * Generiere Sub-Levels für eine Gruppe von Stages
   */
  private generateSubLevelsForStageGroup(
    levels: Map<number, SubLevelConfig>,
    startLevel: number,
    stages: number[],
    totalLevels: number,
    params: { baseComplexity: number; growthRate: number }
  ): number {
    const levelsPerStage = Math.floor(totalLevels / stages.length);
    let currentLevel = startLevel;

    for (let i = 0; i < stages.length; i++) {
      const stageNumber = stages[i];
      const isLastStage = i === stages.length - 1;
      const numLevels = isLastStage 
        ? totalLevels - (levelsPerStage * (stages.length - 1))
        : levelsPerStage;

      for (let j = 0; j < numLevels; j++) {
        const subLevel = j + 1;
        const progress = j / (numLevels - 1); // 0.0 → 1.0

        const config: SubLevelConfig = {
          level: currentLevel,
          subLevelInStage: subLevel,
          difficulty: params.baseComplexity + (progress * params.growthRate * numLevels),
          tasksRequired: this.calculateTasksRequired(currentLevel, progress),
          numberRangeMultiplier: 1.0 + (progress * 0.3), // Bis zu 30% größere Zahlen
          complexityBoost: this.calculateComplexityBoost(currentLevel, progress)
        };

        levels.set(currentLevel, config);
        currentLevel++;
      }
    }

    return currentLevel;
  }

  /**
   * Berechne benötigte Aufgaben pro Level
   * EINHEITLICH: Alle Levels benötigen exakt 10 Aufgaben
   */
  private calculateTasksRequired(level: number, progress: number): number {
    // ✅ IMMER 10 Aufgaben für alle Levels
    return 10;
  }

  /**
   * Berechne Komplexitäts-Boost
   * Erhöht graduell: Platzhalter, Strategien, Tempo
   */
  private calculateComplexityBoost(level: number, progress: number): number {
    let boost = 0.0;

    // Platzhalter-Komplexität (ab Level 10)
    if (level >= 10) {
      const placeholderIntensity = Math.min(1.0, (level - 10) / 90);
      boost += placeholderIntensity * 0.3;
    }

    // Strategie-Anforderung (ab Level 30)
    if (level >= 30) {
      const strategyIntensity = Math.min(1.0, (level - 30) / 70);
      boost += strategyIntensity * 0.2;
    }

    // Tempo-Anforderung (ab Level 50)
    if (level >= 50) {
      const tempoIntensity = Math.min(1.0, (level - 50) / 50);
      boost += tempoIntensity * 0.15;
    }

    // Mikro-Progression innerhalb Level
    boost += progress * 0.1;

    return Math.min(1.0, boost);
  }

  /**
   * Hole Sub-Level-Config für ein bestimmtes Level
   */
  getSubLevelConfig(level: number): SubLevelConfig | null {
    const allLevels = this.generateAllLevels();
    return allLevels.get(level) || null;
  }

  /**
   * Bestimme Stage aus Level
   */
  getStageFromLevel(level: number): number {
    if (level <= 20) {
      // Levels 1-20: Stages 1-3
      if (level <= 7) return 1;
      if (level <= 13) return 2;
      return 3;
    } else if (level <= 40) {
      // Levels 21-40: Stages 4-7
      if (level <= 25) return 4;
      if (level <= 30) return 5;
      if (level <= 35) return 6;
      return 7;
    } else if (level <= 68) {
      // Levels 41-68: Stages 8-11
      if (level <= 48) return 8;
      if (level <= 55) return 9;
      if (level <= 62) return 10;
      return 11;
    } else if (level <= 92) {
      // Levels 69-92: Stages 12-15
      if (level <= 75) return 12;
      if (level <= 81) return 13;
      if (level <= 87) return 14;
      return 15;
    } else {
      // Levels 93-100: Meisterschafts-Stages 16-20
      if (level <= 93) return 16;
      if (level <= 95) return 17;
      if (level <= 97) return 18;
      if (level <= 99) return 19;
      return 20; // Level 100
    }
  }

  /**
   * Berechne Fortschritt zu nächstem Level
   */
  getProgressToNextLevel(
    currentLevel: number,
    tasksCompleted: number
  ): { current: number; total: number; percentage: number } {
    const config = this.getSubLevelConfig(currentLevel);
    if (!config) {
      return { current: 0, total: 10, percentage: 0 };
    }

    const current = Math.min(tasksCompleted, config.tasksRequired);
    const percentage = Math.round((current / config.tasksRequired) * 100);

    return {
      current,
      total: config.tasksRequired,
      percentage
    };
  }
}

export const levelGenerator = new LevelGenerator();