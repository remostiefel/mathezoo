// 🏦 Zoo-Wirtschafts-Engine: Berechnet Offline-Belohnungen und passive Einkünfte
// Realistische Simulation: Besucher zahlen Eintritt, Tiere kosten Unterhalt

import { ZooAnimal, ANIMAL_ECONOMY_DATA, ANIMALS_DATABASE } from '../../client/src/lib/zoo-game-system.js';

// Konstanten für Balance (NEUE BALANCE: Münzen sind wertvoll!)
const XP_PER_HOUR = 10; // Baby-Tiere wachsen mit 10 XP/h (100h = 4.2 Tage bis Adult)
const MAX_OFFLINE_HOURS = 4; // Max 4h Offline-Rewards
const DEFAULT_TICKET_PRICE = 1.0; // Default Eintrittspreis (1 ZooMünze)
const MIN_TICKET_PRICE = 0.5; // Minimum 0.5 ZooMünzen
const MAX_TICKET_PRICE = 5.0; // Maximum 5 ZooMünzen
const XP_TO_EVOLVE = 1000; // 1000 XP = Baby → Adult
const BASE_DAILY_VISITORS = 50; // Basis-Besucher ohne Attraktivität
const PRICE_ELASTICITY = 0.4; // 40% weniger Besucher pro verdoppeltem Preis

// NEUE UNTERHALTSKOSTEN: Baby < Weibchen < Männchen (REDUZIERT für bessere Balance)
const BASE_MAINTENANCE_BABY = 0.1; // Baby-Tiere: 0.1 Münzen/Stunde Basis (2.4/Tag)
const BASE_MAINTENANCE_FEMALE = 0.15; // Weibchen: 0.15 Münzen/Stunde Basis (3.6/Tag)
const BASE_MAINTENANCE_MALE = 0.2; // Männchen: 0.2 Münzen/Stunde (4.8/Tag)
const COST_MULTIPLIER_PER_ANIMAL = 0.01; // +1% pro zusätzlichem Tier (reduziert von 5%)
const BREEDING_INTERVAL_HOURS = 24; // Alle 24h kann ein Paar 1 Baby bekommen

// 🆕 ZOO-ATTRAKTIVITÄT SYSTEM
const ATTRACTIVENESS_PER_ANIMAL = 2; // Jedes Tier = +2 Attraktivität
const ATTRACTIVENESS_PER_HABITAT = 10; // Jedes Gehege = +10 Attraktivität
const ATTRACTIVENESS_PER_DECORATION = 3; // Deko = +3 Attraktivität
const ATTRACTIVENESS_PER_TOY = 5; // Spielzeug = +5 Attraktivität
const VISITORS_PER_ATTRACTIVENESS = 0.5; // Pro Attraktivitätspunkt = +0.5 Besucher/h

// 🆕 KIOSK-SYSTEM
const KIOSK_BASE_COST = 1000; // Kiosk kostet 1000 Münzen
const KIOSK_REVENUE_PER_VISITOR = 0.3; // Jeder Besucher gibt 0.3 Münzen im Kiosk aus
const KIOSK_SATISFACTION_BOOST = 20; // +20% Zufriedenheit wenn Kiosk vorhanden
const SATISFACTION_TO_VISITOR_MULTIPLIER = 0.01; // 1% Zufriedenheit = +1% Besucher

export interface ZooAnimalInstance {
  animalType: string;
  age: 'baby' | 'adult';
  gender?: 'male' | 'female'; // Nur bei adult
  xp: number;
  unlockedAt: string;
  lastXpUpdateAt?: string;
  lastBreedingCheck?: string; // Für passive Zucht
}

// Neue Typen für Tier-Statistik
export interface AnimalStats {
  animalType: string;
  babies: number;
  females: number;
  males: number;
  canBreed: boolean; // Hat mind. 1♀ + 1♂
  nextBabyIn?: number; // Stunden bis nächstes Baby
}

export interface ShopItemEffect {
  type: 'coin_bonus' | 'xp_bonus' | 'visitor_boost' | 'cost_reduction' | 'income_multiplier';
  value: number;
}

export interface OfflineRewardsSummary {
  // Zeit
  offlineHours: number;
  offlineMinutes: number;

  // Wirtschaft
  totalVisitors: number;
  grossIncome: number;
  totalCosts: number;
  netIncome: number;

  // Tier-Entwicklung
  evolvedAnimals: Array<{
    animalType: string;
    name: string;
    emoji: string;
  }>;
  totalXpGained: number;

  // Boni
  appliedBonuses: {
    visitorBoost: number;
    costReduction: number;
    incomeMultiplier: number;
  };

  // Aktualisierte Daten
  updatedAnimals: ZooAnimalInstance[];
  finalCoins: number;
}

export interface EconomyStatus {
  // Stündliche Raten
  passiveIncomePerHour: number;
  maintenanceCostPerHour: number;
  totalVisitorsPerHour: number;
  netIncomePerHour: number;
  kioskRevenuePerHour: number; // 🆕 Kiosk-Einnahmen

  // 🆕 Zoo-Attraktivität & Zufriedenheit
  zooAttractiveness: number; // Gesamt-Attraktivität
  visitorSatisfaction: number; // 0-100% Zufriedenheit
  hasKiosk: boolean; // Ob Kiosk gekauft wurde

  // Zoo-Info
  totalAnimals: number;
  babyAnimals: number;
  adultAnimals: number;

  // 🆕 Warn-Zustand (wenn Minus!)
  isInDeficit: boolean; // True wenn Zoo Geld verliert
  hourlyDeficit: number; // Wie viel Minus pro Stunde

  // Nächste Tier-Evolution
  nextEvolution: {
    animalType: string;
    name: string;
    currentXp: number;
    remainingXp: number;
    hoursUntilEvolution: number;
  } | null;
}

/**
 * 🎟️ Berechnet elastische Nachfrage: Höhere Preise = weniger Besucher
 * Nutzt Preiselastizität der Nachfrage: Bei doppeltem Preis ~40% weniger Besucher
 * 
 * @param baseVisitors - Basis-Besucherzahl (von Tieren abhängig)
 * @param ticketPrice - Aktueller Eintrittspreis (0.5 - 5 ZooMünzen)
 * @returns Angepasste Besucherzahl nach Preiselastizität
 */
export function calculateElasticDemand(baseVisitors: number, ticketPrice: number): number {
  // Preis-Multiplikator im Verhältnis zum Default-Preis
  const priceRatio = ticketPrice / DEFAULT_TICKET_PRICE;
  
  // Elastizitätsformel: visitors = base / (priceRatio ^ elasticity)
  // Beispiel: Bei Preis 2x (priceRatio=2): visitors = base / (2^0.4) = base / 1.32 ≈ 76% Besucher
  // Beispiel: Bei Preis 0.5x (priceRatio=0.5): visitors = base / (0.5^0.4) = base / 0.76 ≈ 132% Besucher
  const demandMultiplier = 1 / Math.pow(priceRatio, PRICE_ELASTICITY);
  
  return Math.floor(baseVisitors * demandMultiplier);
}

/**
 * Berechnet Offline-Belohnungen basierend auf vergangener Zeit
 * Simuliert realistische Zoo-Wirtschaft mit Besuchern und Tierkosten
 */
export function calculateOfflineRewards(
  lastLoginAt: Date | string,
  currentAnimals: ZooAnimalInstance[],
  currentCoins: number,
  ownedShopItems: string[] = [],
  ticketPrice: number = DEFAULT_TICKET_PRICE
): OfflineRewardsSummary {
  const now = new Date();
  const lastLogin = new Date(lastLoginAt);

  // Zeitdifferenz berechnen (mit 24h Cap)
  const millisDiff = now.getTime() - lastLogin.getTime();
  const actualHours = millisDiff / (1000 * 60 * 60);
  const cappedHours = Math.min(actualHours, MAX_OFFLINE_HOURS);
  const offlineMinutes = Math.floor((cappedHours % 1) * 60);

  // Shop-Item Boni berechnen
  const bonuses = calculateShopItemBonuses(ownedShopItems);

  // Arrays für Tracking
  const evolvedAnimals: Array<{ animalType: string; name: string; emoji: string }> = [];
  const updatedAnimals: ZooAnimalInstance[] = [];

  let totalVisitors = 0;
  let grossIncome = 0;
  let totalCosts = 0;
  let totalXpGained = 0;

  // Für jedes Tier: Berechne Wirtschaftsimpact und XP-Wachstum
  for (const animal of currentAnimals) {
    const animalType = animal.animalType as ZooAnimal;
    const economyData = ANIMAL_ECONOMY_DATA[animalType as ZooAnimal];

    if (!economyData) {
      console.warn(`No economy data for animal: ${animalType}`);
      updatedAnimals.push(animal);
      continue;
    }

    let currentAge = animal.age;
    let currentXp = animal.xp || 0;

    // Passive XP für Baby-Tiere
    if (currentAge === 'baby') {
      const xpGained = Math.floor(cappedHours * XP_PER_HOUR * (1 + bonuses.xpBonus));
      currentXp = Math.min(currentXp + xpGained, XP_TO_EVOLVE);
      totalXpGained += xpGained;

      // Evolution prüfen
      if (currentXp >= XP_TO_EVOLVE) {
        currentAge = 'adult';
        // 🎲 Bei Evolution: Zufälliges Geschlecht vergeben (50/50 Chance)
        if (!animal.gender) {
          animal.gender = Math.random() < 0.5 ? 'female' : 'male';
        }

        const animalInfo = getAnimalInfo(animalType);
        evolvedAnimals.push({
          animalType,
          name: animalInfo.name,
          emoji: animalInfo.emoji
        });
      }
    }

    // Wirtschafts-Berechnung für die GESAMTE Offline-Zeit
    // WICHTIG: Visitor-Boost muss AUCH die Einnahmen erhöhen!
    const baseVisitors = economyData.visitorValue[currentAge] * cappedHours;
    const boostedVisitors = baseVisitors * (1 + bonuses.visitorBoost);
    const adjustedVisitors = calculateElasticDemand(boostedVisitors, ticketPrice);
    const income = adjustedVisitors * ticketPrice * bonuses.incomeMultiplier;

    // NEUE KOSTENBERECHNUNG: Baby < Weibchen < Männchen
    let baseCost = BASE_MAINTENANCE_BABY;
    if (currentAge === 'adult') {
      baseCost = animal.gender === 'male' ? BASE_MAINTENANCE_MALE : BASE_MAINTENANCE_FEMALE;
    }
    const tierMultiplier = 1 + (currentAnimals.length * COST_MULTIPLIER_PER_ANIMAL);
    const costs = baseCost * tierMultiplier * cappedHours * (1 - bonuses.costReduction);

    totalVisitors += Math.floor(boostedVisitors);
    grossIncome += income;
    totalCosts += costs;

    // Tier aktualisieren
    updatedAnimals.push({
      ...animal,
      age: currentAge,
      xp: currentXp,
      lastXpUpdateAt: now.toISOString()
    });
  }

  // Finale Berechnung
  const netIncome = Math.floor(grossIncome - totalCosts);
  // 🛡️ COIN CAP: Maximale 5000 Münzen um Inflation zu verhindern
  const MAX_COINS = 5000;
  const finalCoins = Math.min(Math.max(0, currentCoins + netIncome), MAX_COINS);

  return {
    offlineHours: Math.floor(cappedHours),
    offlineMinutes,
    totalVisitors: Math.floor(totalVisitors),
    grossIncome: Math.floor(grossIncome),
    totalCosts: Math.floor(totalCosts),
    netIncome,
    evolvedAnimals,
    totalXpGained,
    appliedBonuses: {
      visitorBoost: bonuses.visitorBoost,
      costReduction: bonuses.costReduction,
      incomeMultiplier: bonuses.incomeMultiplier
    },
    updatedAnimals,
    finalCoins
  };
}

/**
 * 🐣 BREEDING-SYSTEM: Paare erzeugen neue Babys
 * Pro Paar (1♀ + 1♂) kann alle 24h ein Baby entstehen
 */
export function calculateBreeding(
  animals: ZooAnimalInstance[],
  lastBreedingCheck: Date | string
): {
  newBabies: ZooAnimalInstance[];
  breedingPairs: Array<{
    animalType: string;
    females: number;
    males: number;
    babies: number;
  }>;
} {
  const now = new Date();
  const lastCheck = new Date(lastBreedingCheck);
  const hoursSinceBreeding = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);

  // Nur alle 24h Breeding
  if (hoursSinceBreeding < BREEDING_INTERVAL_HOURS) {
    return { newBabies: [], breedingPairs: [] };
  }

  const newBabies: ZooAnimalInstance[] = [];
  const breedingPairs: Array<{ animalType: string; females: number; males: number; babies: number }> = [];

  // Gruppiere Tiere nach Art
  const animalGroups = new Map<string, ZooAnimalInstance[]>();
  for (const animal of animals) {
    if (!animalGroups.has(animal.animalType)) {
      animalGroups.set(animal.animalType, []);
    }
    animalGroups.get(animal.animalType)!.push(animal);
  }

  // Für jede Tierart: Zähle ♀ und ♂, berechne Babys
  for (const [animalType, group] of animalGroups) {
    const females = group.filter(a => a.age === 'adult' && a.gender === 'female').length;
    const males = group.filter(a => a.age === 'adult' && a.gender === 'male').length;

    // Breeding nur wenn mindestens 1♀ + 1♂
    if (females > 0 && males > 0) {
      // Anzahl Paare = Min(♀, ♂)
      const pairs = Math.min(females, males);

      // Jedes Paar erzeugt 1 Baby alle 24h
      for (let i = 0; i < pairs; i++) {
        newBabies.push({
          animalType,
          age: 'baby',
          xp: 0,
          unlockedAt: now.toISOString(),
          lastXpUpdateAt: now.toISOString()
        });
      }

      breedingPairs.push({
        animalType,
        females,
        males,
        babies: pairs
      });
    }
  }

  return { newBabies, breedingPairs };
}

/**
 * 📊 Berechne Tier-Statistiken pro Art
 */
export function calculateAnimalStats(animals: ZooAnimalInstance[]): AnimalStats[] {
  const statsMap = new Map<string, AnimalStats>();

  // Log für Debugging
  console.log(`📊 calculateAnimalStats called with ${animals.length} animals`);
  
  // Debug: Log first 3 animals to see their structure
  if (animals.length > 0) {
    console.log(`🔍 Sample animals:`, animals.slice(0, 3).map(a => ({
      type: a.animalType,
      age: a.age,
      gender: a.gender,
      xp: a.xp
    })));
  }

  for (const animal of animals) {
    if (!statsMap.has(animal.animalType)) {
      statsMap.set(animal.animalType, {
        animalType: animal.animalType,
        babies: 0,
        females: 0,
        males: 0,
        canBreed: false
      });
    }

    const stats = statsMap.get(animal.animalType)!;

    // WICHTIG: Zähle AUSSCHLIESSLICH basierend auf age-Feld!
    // Babys können ein gender-Feld haben (aus Migration), aber wir ignorieren es
    if (animal.age === 'baby') {
      stats.babies++;
      console.log(`  🐣 Baby ${animal.animalType}: babies=${stats.babies} (gender wird ignoriert)`);
    } else if (animal.age === 'adult') {
      // Nur Adults zählen nach Gender
      if (animal.gender === 'female') {
        stats.females++;
        console.log(`  ♀ Adult Female ${animal.animalType}: females=${stats.females}`);
      } else if (animal.gender === 'male') {
        stats.males++;
        console.log(`  ♂ Adult Male ${animal.animalType}: males=${stats.males}`);
      } else {
        // Adult ohne Gender? Dann zufällig zuweisen für die Statistik
        console.log(`  ⚠️ Adult ${animal.animalType} WITHOUT GENDER! Counting as neutral.`);
      }
    } else {
      console.log(`  ⚠️ Unknown age for ${animal.animalType}: age=${animal.age}`);
    }
  }

  // canBreed berechnen
  for (const stats of statsMap.values()) {
    stats.canBreed = stats.females > 0 && stats.males > 0;
    console.log(`✅ ${stats.animalType}: babies=${stats.babies}, females=${stats.females}, males=${stats.males}, canBreed=${stats.canBreed}`);
  }

  return Array.from(statsMap.values());
}

/**
 * 💰 Berechne Verkaufspreis für ein einzelnes Tier
 * Babys: 50% des Wertes, Weibchen: 80%, Männchen: 100%
 */
export function calculateSellPrice(animal: ZooAnimalInstance, animalType: ZooAnimal): number {
  const economyData = ANIMAL_ECONOMY_DATA[animalType];

  if (!economyData) {
    return 0;
  }

  // Basis-Wert basierend auf Seltenheit/Wert des Tieres
  const baseValue = economyData.visitorValue.adult * 10; // Etwa 10 Stunden Besucherwert

  if (animal.age === 'baby') {
    return Math.floor(baseValue * 0.5); // Babys: 50% Wert
  } else if (animal.gender === 'female') {
    return Math.floor(baseValue * 0.8); // Weibchen: 80% Wert
  } else {
    return Math.floor(baseValue * 1.0); // Männchen: 100% Wert
  }
}

/**
 * Berechnet den aktuellen Wirtschaftsstatus des Zoos
 * Zeigt stündliche Einnahmen/Kosten und nächste Evolution
 */
export function calculateEconomyStatus(
  animals: ZooAnimalInstance[],
  ownedShopItems: string[] = [],
  ticketPrice: number = DEFAULT_TICKET_PRICE
): EconomyStatus {
  const bonuses = calculateShopItemBonuses(ownedShopItems);

  // 🆕 Attraktivität & Zufriedenheit berechnen
  const hasKiosk = ownedShopItems.includes('kiosk');
  const zooAttractiveness = calculateZooAttractiveness(animals, ownedShopItems);
  const visitorSatisfaction = calculateVisitorSatisfaction(animals, ownedShopItems, hasKiosk);

  let maintenanceCostPerHour = 0;
  let babyCount = 0;
  let adultCount = 0;

  // Nächste Evolution finden (Baby mit höchstem XP)
  let nextEvolutionAnimal: { animal: ZooAnimalInstance; info: any } | null = null;
  let highestXp = -1;

  for (const animal of animals) {
    const animalType = animal.animalType as ZooAnimal;
    const economyData = ANIMAL_ECONOMY_DATA[animalType as ZooAnimal];

    if (!economyData) continue;

    if (animal.age === 'baby') {
      babyCount++;

      // Track höchstes XP Baby für "Nächste Evolution"
      if (animal.xp > highestXp) {
        highestXp = animal.xp;
        nextEvolutionAnimal = {
          animal,
          info: getAnimalInfo(animalType)
        };
      }
    } else {
      adultCount++;
    }

    // NEUE KOSTENBERECHNUNG: Baby < Weibchen < Männchen
    let baseCost = BASE_MAINTENANCE_BABY;
    if (animal.age === 'adult') {
      baseCost = animal.gender === 'male' ? BASE_MAINTENANCE_MALE : BASE_MAINTENANCE_FEMALE;
    }
    const tierMultiplier = 1 + (animals.length * COST_MULTIPLIER_PER_ANIMAL);
    const cost = baseCost * tierMultiplier;

    maintenanceCostPerHour += cost;
  }

  // 🆕 BESUCHER-BERECHNUNG MIT ATTRAKTIVITÄT!
  let baseVisitors = BASE_DAILY_VISITORS / 24; // Basis-Besucher pro Stunde
  const attractivenessVisitors = zooAttractiveness * VISITORS_PER_ATTRACTIVENESS;
  const satisfactionMultiplier = 1 + (visitorSatisfaction * SATISFACTION_TO_VISITOR_MULTIPLIER);

  let totalVisitorsPreBoost = (baseVisitors + attractivenessVisitors) * satisfactionMultiplier;
  const boostedVisitors = totalVisitorsPreBoost * (1 + bonuses.visitorBoost);
  let totalVisitorsPerHour = calculateElasticDemand(boostedVisitors, ticketPrice);

  // Einnahmen berechnen
  maintenanceCostPerHour = Math.floor(maintenanceCostPerHour * (1 - bonuses.costReduction));
  const entranceFeeIncome = totalVisitorsPerHour * ticketPrice * bonuses.incomeMultiplier;

  // 🆕 KIOSK-EINNAHMEN!
  const kioskRevenuePerHour = hasKiosk ? totalVisitorsPerHour * KIOSK_REVENUE_PER_VISITOR : 0;

  const passiveIncomePerHour = entranceFeeIncome + kioskRevenuePerHour;
  const netIncomePerHour = Math.floor(passiveIncomePerHour - maintenanceCostPerHour);

  // 🆕 Warn-Zustand prüfen
  const isInDeficit = netIncomePerHour < 0;
  const hourlyDeficit = isInDeficit ? Math.abs(netIncomePerHour) : 0;

  // Nächste Evolution berechnen
  let nextEvolution = null;
  if (nextEvolutionAnimal) {
    const remaining = XP_TO_EVOLVE - nextEvolutionAnimal.animal.xp;
    const hoursUntil = remaining / XP_PER_HOUR;

    nextEvolution = {
      animalType: nextEvolutionAnimal.animal.animalType,
      name: nextEvolutionAnimal.info.name,
      currentXp: nextEvolutionAnimal.animal.xp,
      remainingXp: remaining,
      hoursUntilEvolution: Math.ceil(hoursUntil * 10) / 10
    };
  }

  return {
    passiveIncomePerHour: Math.floor(passiveIncomePerHour),
    maintenanceCostPerHour,
    totalVisitorsPerHour,
    netIncomePerHour,
    kioskRevenuePerHour: Math.floor(kioskRevenuePerHour),
    zooAttractiveness,
    visitorSatisfaction,
    hasKiosk,
    isInDeficit,
    hourlyDeficit,
    totalAnimals: animals.length,
    babyAnimals: babyCount,
    adultAnimals: adultCount,
    nextEvolution
  };
}

/**
 * 🆕 Berechnet Zoo-Attraktivität basierend auf Tieren und Shop-Items
 */
function calculateZooAttractiveness(
  animals: ZooAnimalInstance[],
  ownedItems: string[]
): number {
  let attractiveness = 0;

  // Tiere erhöhen Attraktivität
  attractiveness += animals.length * ATTRACTIVENESS_PER_ANIMAL;

  // Shop-Items analysieren
  const habitats = ownedItems.filter(item =>
    ['savanna', 'jungle', 'arctic', 'bamboo', 'meadow', 'desert', 'ocean', 'night_house', 'outback', 'aviary'].includes(item)
  );
  const decorations = ownedItems.filter(item =>
    ['tree', 'flower', 'fountain', 'palm', 'cactus', 'rock', 'bush', 'waterfall', 'pond', 'bridge', 'bench', 'lamp'].includes(item)
  );
  const toys = ownedItems.filter(item =>
    ['ball', 'tire', 'rope', 'tunnel', 'swing', 'climbing_tree', 'pool', 'sandbox'].includes(item)
  );

  attractiveness += habitats.length * ATTRACTIVENESS_PER_HABITAT;
  attractiveness += decorations.length * ATTRACTIVENESS_PER_DECORATION;
  attractiveness += toys.length * ATTRACTIVENESS_PER_TOY;

  return attractiveness;
}

/**
 * 🆕 Berechnet Besucher-Zufriedenheit (0-100%)
 */
function calculateVisitorSatisfaction(
  animals: ZooAnimalInstance[],
  ownedItems: string[],
  hasKiosk: boolean
): number {
  let satisfaction = 50; // Basis-Zufriedenheit

  // Mehr Tiere = höhere Zufriedenheit
  satisfaction += Math.min(animals.length * 2, 30); // Max +30% durch Tiere

  // Shop-Items erhöhen Zufriedenheit
  const foodItems = ownedItems.filter(item =>
    ['banana', 'fish', 'bamboo_food', 'meat', 'carrot', 'apple', 'hay', 'nuts', 'seeds', 'insects', 'honey', 'watermelon'].includes(item)
  );
  satisfaction += foodItems.length * 2; // +2% pro Futter-Item

  // Kiosk-Bonus!
  if (hasKiosk) {
    satisfaction += KIOSK_SATISFACTION_BOOST;
  }

  return Math.min(satisfaction, 100); // Max 100%
}

/**
 * Berechnet kumulative Boni aus Shop-Items
 */
function calculateShopItemBonuses(ownedItems: string[]): {
  visitorBoost: number;
  costReduction: number;
  incomeMultiplier: number;
  xpBonus: number;
} {
  let visitorBoost = 0;
  let costReduction = 0;
  let incomeMultiplier = 1.0;
  let xpBonus = 0;

  // Hier könnten später spezifische Item-Boni implementiert werden
  // Beispiel: if (ownedItems.includes('discount_coupon')) { costReduction += 0.1; }

  return {
    visitorBoost,
    costReduction,
    incomeMultiplier,
    xpBonus
  };
}

/**
 * Helper: Hole Tier-Info aus Datenbank
 */
function getAnimalInfo(animalType: ZooAnimal): { name: string; emoji: string } {
  const info = ANIMALS_DATABASE[animalType];
  return {
    name: info?.name || String(animalType),
    emoji: info?.emoji || '🐾'
  };
}