// Tier-Karten-System: Definitionen für alle 10 Start-Tiere
// Jedes Tier hat 3 einzigartige Talente und Team-Boni

export interface AnimalTalent {
  id: string;
  name: string;
  description: string;
  effectType: 'coin_protection' | 'difficulty_reduction' | 'xp_boost' | 'hint_available' | 'speed_bonus' | 'pattern_reveal';
  effectValue: number;
}

export interface AnimalDefinition {
  animalType: string;
  name: string;
  emoji: string;
  talents: AnimalTalent[];
  starterAnimal: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockRequirement: {
    type: 'campaign' | 'level' | 'coins' | 'none';
    value?: string | number;
  };
}

export interface TeamBonusDefinition {
  bonusName: string;
  description: string;
  requiredAnimals: string[];
  minFriendshipLevel: number;
  bonusEffects: {
    effectType: string;
    effectValue: number;
    description: string;
  }[];
  emoji: string;
}

// ===== 10 START-TIERE =====

export const ANIMAL_DEFINITIONS: AnimalDefinition[] = [
  // === STARTER-TIERE (4) ===
  {
    animalType: 'lion',
    name: 'Löwe',
    emoji: '🦁',
    starterAnimal: true,
    rarity: 'common',
    unlockRequirement: { type: 'none' },
    talents: [
      {
        id: 'lion_courage',
        name: 'Mut',
        description: 'Verliere 10% weniger Münzen bei Fehlern',
        effectType: 'coin_protection',
        effectValue: 10,
      },
      {
        id: 'lion_leadership',
        name: 'Anführer',
        description: '+15% XP für alle Tiere im Team',
        effectType: 'xp_boost',
        effectValue: 15,
      },
      {
        id: 'lion_roar',
        name: 'Brüller',
        description: 'Zeigt Hinweis bei schwierigen Aufgaben',
        effectType: 'hint_available',
        effectValue: 1,
      },
    ],
  },
  {
    animalType: 'elephant',
    name: 'Elefant',
    emoji: '🐘',
    starterAnimal: true,
    rarity: 'common',
    unlockRequirement: { type: 'none' },
    talents: [
      {
        id: 'elephant_memory',
        name: 'Gedächtnis',
        description: 'Zahlentreppe: 10% leichtere Zahlen',
        effectType: 'difficulty_reduction',
        effectValue: 10,
      },
      {
        id: 'elephant_strength',
        name: 'Stärke',
        description: '+20% Münzen bei perfekten Runden',
        effectType: 'coin_protection',
        effectValue: 20,
      },
      {
        id: 'elephant_kindness',
        name: 'Freundlichkeit',
        description: 'Freundschafts-XP steigt 25% schneller',
        effectType: 'xp_boost',
        effectValue: 25,
      },
    ],
  },
  {
    animalType: 'panda',
    name: 'Panda',
    emoji: '🐼',
    starterAnimal: true,
    rarity: 'common',
    unlockRequirement: { type: 'none' },
    talents: [
      {
        id: 'panda_calm',
        name: 'Ruhe',
        description: '+30% Zeit für schwierige Aufgaben',
        effectType: 'speed_bonus',
        effectValue: 30,
      },
      {
        id: 'panda_balance',
        name: 'Balance',
        description: 'Zahlenwaage: Zeigt Muster-Hinweise',
        effectType: 'pattern_reveal',
        effectValue: 1,
      },
      {
        id: 'panda_bamboo',
        name: 'Bambus-Kraft',
        description: '+10% XP bei langen Spiel-Sessions',
        effectType: 'xp_boost',
        effectValue: 10,
      },
    ],
  },
  {
    animalType: 'monkey',
    name: 'Affe',
    emoji: '🐵',
    starterAnimal: true,
    rarity: 'common',
    unlockRequirement: { type: 'none' },
    talents: [
      {
        id: 'monkey_speed',
        name: 'Geschwindigkeit',
        description: '+15% Bonus bei schnellen Antworten',
        effectType: 'speed_bonus',
        effectValue: 15,
      },
      {
        id: 'monkey_cleverness',
        name: 'Cleverness',
        description: 'Zeigt einen Lösungsweg bei Fehlern',
        effectType: 'hint_available',
        effectValue: 1,
      },
      {
        id: 'monkey_fun',
        name: 'Spaß',
        description: 'Doppelte Münzen bei Streaks ab 5',
        effectType: 'coin_protection',
        effectValue: 100,
      },
    ],
  },

  // === FREISCHALTBARE TIERE (6) ===
  {
    animalType: 'giraffe',
    name: 'Giraffe',
    emoji: '🦒',
    starterAnimal: false,
    rarity: 'rare',
    unlockRequirement: { type: 'campaign', value: 'jungle_rescue' },
    talents: [
      {
        id: 'giraffe_overview',
        name: 'Übersicht',
        description: 'Zeigt alle Zahlen-Muster auf dem Spielfeld',
        effectType: 'pattern_reveal',
        effectValue: 2,
      },
      {
        id: 'giraffe_farsight',
        name: 'Weitblick',
        description: '+25% XP bei Kampagnen',
        effectType: 'xp_boost',
        effectValue: 25,
      },
      {
        id: 'giraffe_height',
        name: 'Höhenvorteil',
        description: 'Schwierigkeit -15% bei großen Zahlen',
        effectType: 'difficulty_reduction',
        effectValue: 15,
      },
    ],
  },
  {
    animalType: 'zebra',
    name: 'Zebra',
    emoji: '🦓',
    starterAnimal: false,
    rarity: 'rare',
    unlockRequirement: { type: 'level', value: 20 },
    talents: [
      {
        id: 'zebra_pattern',
        name: 'Muster-Meister',
        description: 'Erkennt Zahlen-Päckchen automatisch',
        effectType: 'pattern_reveal',
        effectValue: 3,
      },
      {
        id: 'zebra_stripes',
        name: 'Streifen-Kraft',
        description: '+20% Münzen bei Mustererkennung',
        effectType: 'coin_protection',
        effectValue: 20,
      },
      {
        id: 'zebra_endurance',
        name: 'Ausdauer',
        description: 'Keine Münz-Verluste bei ersten 3 Fehlern',
        effectType: 'coin_protection',
        effectValue: 100,
      },
    ],
  },
  {
    animalType: 'fox',
    name: 'Fuchs',
    emoji: '🦊',
    starterAnimal: false,
    rarity: 'epic',
    unlockRequirement: { type: 'campaign', value: 'forest_adventure' },
    talents: [
      {
        id: 'fox_cunning',
        name: 'List',
        description: 'Zeigt 2 Lösungswege zur Auswahl',
        effectType: 'hint_available',
        effectValue: 2,
      },
      {
        id: 'fox_tactics',
        name: 'Taktik',
        description: '+30% XP bei strategischen Spielen',
        effectType: 'xp_boost',
        effectValue: 30,
      },
      {
        id: 'fox_quick_think',
        name: 'Schnelldenker',
        description: '+50% Zeitbonus bei korrekten Antworten',
        effectType: 'speed_bonus',
        effectValue: 50,
      },
    ],
  },
  {
    animalType: 'koala',
    name: 'Koala',
    emoji: '🐨',
    starterAnimal: false,
    rarity: 'rare',
    unlockRequirement: { type: 'coins', value: 5000 },
    talents: [
      {
        id: 'koala_relaxation',
        name: 'Entspannung',
        description: 'Zeitdruck -50% bei allen Spielen',
        effectType: 'speed_bonus',
        effectValue: 50,
      },
      {
        id: 'koala_focus',
        name: 'Fokus',
        description: 'Schwierigkeit -20% bei Platzhalter-Aufgaben',
        effectType: 'difficulty_reduction',
        effectValue: 20,
      },
      {
        id: 'koala_eucalyptus',
        name: 'Eucalyptus-Boost',
        description: 'Regeneriert 10 Münzen pro richtige Antwort',
        effectType: 'coin_protection',
        effectValue: 10,
      },
    ],
  },
  {
    animalType: 'eagle',
    name: 'Adler',
    emoji: '🦅',
    starterAnimal: false,
    rarity: 'epic',
    unlockRequirement: { type: 'level', value: 40 },
    talents: [
      {
        id: 'eagle_precision',
        name: 'Präzision',
        description: '+40% Münzen bei perfekten Antworten',
        effectType: 'coin_protection',
        effectValue: 40,
      },
      {
        id: 'eagle_sharp_eye',
        name: 'Scharfblick',
        description: 'Markiert Fehlerquellen in Aufgaben',
        effectType: 'hint_available',
        effectValue: 3,
      },
      {
        id: 'eagle_speed',
        name: 'Geschwindigkeit',
        description: '+25% Bonus bei schnellen Streaks',
        effectType: 'speed_bonus',
        effectValue: 25,
      },
    ],
  },
  {
    animalType: 'bear',
    name: 'Bär',
    emoji: '🐻',
    starterAnimal: false,
    rarity: 'legendary',
    unlockRequirement: { type: 'campaign', value: 'mountain_expedition' },
    talents: [
      {
        id: 'bear_strength',
        name: 'Kraft',
        description: 'Verdoppelt alle Münz-Gewinne',
        effectType: 'coin_protection',
        effectValue: 100,
      },
      {
        id: 'bear_protection',
        name: 'Schutz',
        description: 'Keine Münz-Verluste bei allen Fehlern',
        effectType: 'coin_protection',
        effectValue: 100,
      },
      {
        id: 'bear_honey',
        name: 'Honig-Bonus',
        description: '+50% XP für alle Tiere im Team',
        effectType: 'xp_boost',
        effectValue: 50,
      },
    ],
  },
];

// ===== TEAM-BONI =====

export const TEAM_BONUSES: TeamBonusDefinition[] = [
  {
    bonusName: 'Weiser Anführer',
    description: 'Löwe + Elefant = Gedächtnis und Mut vereint',
    requiredAnimals: ['lion', 'elephant'],
    minFriendshipLevel: 3,
    emoji: '👑',
    bonusEffects: [
      {
        effectType: 'xp_boost',
        effectValue: 25,
        description: '+25% XP für Team',
      },
      {
        effectType: 'coin_protection',
        effectValue: 15,
        description: '+15% Münzschutz',
      },
    ],
  },
  {
    bonusName: 'Geduldige Lehrer',
    description: 'Panda + Elefant = Ruhe und Weisheit',
    requiredAnimals: ['panda', 'elephant'],
    minFriendshipLevel: 3,
    emoji: '🎓',
    bonusEffects: [
      {
        effectType: 'difficulty_reduction',
        effectValue: 20,
        description: '-20% Schwierigkeit',
      },
      {
        effectType: 'hint_available',
        effectValue: 2,
        description: '2 Zusatz-Hinweise',
      },
    ],
  },
  {
    bonusName: 'Schnelle Denker',
    description: 'Affe + Fuchs = Cleverness und List',
    requiredAnimals: ['monkey', 'fox'],
    minFriendshipLevel: 4,
    emoji: '⚡',
    bonusEffects: [
      {
        effectType: 'speed_bonus',
        effectValue: 40,
        description: '+40% Zeitbonus',
      },
      {
        effectType: 'xp_boost',
        effectValue: 30,
        description: '+30% XP bei schnellen Antworten',
      },
    ],
  },
  {
    bonusName: 'Muster-Detektive',
    description: 'Zebra + Giraffe = Muster erkennen',
    requiredAnimals: ['zebra', 'giraffe'],
    minFriendshipLevel: 3,
    emoji: '🔍',
    bonusEffects: [
      {
        effectType: 'pattern_reveal',
        effectValue: 5,
        description: 'Zeigt alle Muster automatisch',
      },
      {
        effectType: 'coin_protection',
        effectValue: 25,
        description: '+25% Münzen bei Muster-Aufgaben',
      },
    ],
  },
  {
    bonusName: 'Zen-Meister',
    description: 'Panda + Koala = Ultimative Ruhe',
    requiredAnimals: ['panda', 'koala'],
    minFriendshipLevel: 4,
    emoji: '☯️',
    bonusEffects: [
      {
        effectType: 'speed_bonus',
        effectValue: 60,
        description: '+60% mehr Zeit',
      },
      {
        effectType: 'difficulty_reduction',
        effectValue: 25,
        description: '-25% Schwierigkeit',
      },
    ],
  },
  {
    bonusName: 'Könige des Waldes',
    description: 'Löwe + Bär = Unbesiegbare Kraft',
    requiredAnimals: ['lion', 'bear'],
    minFriendshipLevel: 5,
    emoji: '💪',
    bonusEffects: [
      {
        effectType: 'coin_protection',
        effectValue: 150,
        description: '+150% Münzen (keine Verluste)',
      },
      {
        effectType: 'xp_boost',
        effectValue: 75,
        description: '+75% XP für alle',
      },
    ],
  },
  {
    bonusName: 'Himmelsstürmer',
    description: 'Adler + Giraffe = Höchste Perspektive',
    requiredAnimals: ['eagle', 'giraffe'],
    minFriendshipLevel: 4,
    emoji: '🌟',
    bonusEffects: [
      {
        effectType: 'pattern_reveal',
        effectValue: 4,
        description: 'Perfekte Übersicht',
      },
      {
        effectType: 'hint_available',
        effectValue: 4,
        description: '4 Zusatz-Hinweise',
      },
    ],
  },
  {
    bonusName: 'Party-Tiere',
    description: 'Affe + Panda + Löwe = Pure Freude',
    requiredAnimals: ['monkey', 'panda', 'lion'],
    minFriendshipLevel: 3,
    emoji: '🎉',
    bonusEffects: [
      {
        effectType: 'xp_boost',
        effectValue: 50,
        description: '+50% XP für alle',
      },
      {
        effectType: 'coin_protection',
        effectValue: 35,
        description: '+35% Münzen',
      },
    ],
  },
];

// Helper-Funktionen
export function getAnimalByType(animalType: string): AnimalDefinition | undefined {
  return ANIMAL_DEFINITIONS.find((a) => a.animalType === animalType);
}

export function getStarterAnimals(): AnimalDefinition[] {
  return ANIMAL_DEFINITIONS.filter((a) => a.starterAnimal);
}

export function getTeamBonusesForAnimals(animalTypes: string[], friendshipLevels: Record<string, number>): TeamBonusDefinition[] {
  return TEAM_BONUSES.filter((bonus) => {
    // Prüfe ob alle benötigten Tiere im Team sind
    const hasAllAnimals = bonus.requiredAnimals.every((requiredAnimal) =>
      animalTypes.includes(requiredAnimal)
    );

    if (!hasAllAnimals) return false;

    // Prüfe ob alle Tiere das Minimum Freundschafts-Level haben
    const meetsLevelRequirement = bonus.requiredAnimals.every((requiredAnimal) => {
      const level = friendshipLevels[requiredAnimal] || 0;
      return level >= bonus.minFriendshipLevel;
    });

    return meetsLevelRequirement;
  });
}
