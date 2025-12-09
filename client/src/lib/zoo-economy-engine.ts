// 🏦 Zoo-Wirtschafts-Engine: Berechnet Offline-Belohnungen und passive Einkünfte
// Realistische Simulation: Besucher zahlen Eintritt, Tiere kosten Unterhalt

import { ZooAnimal, ANIMAL_ECONOMY_DATA, ANIMALS_DATABASE } from './zoo-game-system';

// Konstanten für Balance (NEUE BALANCE: Münzen sind wertvoll!)
const XP_PER_HOUR = 10; // Baby-Tiere wachsen mit 10 XP/h (100h = 4.2 Tage bis Adult)
const MAX_OFFLINE_HOURS = 4; // Max 4h Offline-Rewards
const DEFAULT_TICKET_PRICE = 1.0; // Default Eintrittspreis (1 ZooMünze)
const MIN_TICKET_PRICE = 0.5; // Minimum 0.5 ZooMünzen
const MAX_TICKET_PRICE = 5.0; // Maximum 5 ZooMünzen
const XP_TO_EVOLVE = 1000; // 1000 XP = Baby → Adult
const MAX_DAILY_VISITORS = 200; // ~200 Besucher pro Tag
const PRICE_ELASTICITY = 0.4; // 40% weniger Besucher pro verdoppeltem Preis

// 🏦 REALISTISCHE UNTERHALTSKOSTEN: Futter, Gehege, Wärter, Pflege, Putzen
// Basis pro Tier (Stundensätze in ZooMünzen):
// - Baby-Tiere: 0.5 Münzen/h = 12 Münzen/Tag (Fressen, Windeln, Pflege)
// - Erwachsene klein (Kaninchen, Igel): 1.0 Münzen/h = 24 Münzen/Tag (Standard-Futter, -Pflege)
// - Erwachsene mittel (Löwe, Affe): 2.0 Münzen/h = 48 Münzen/Tag (Qualitäts-Futter, Wärter)
// - Erwachsene groß (Elefant, Giraffe): 3.0 Münzen/h = 72 Münzen/Tag (Premium-Futter, Gehege, Spezialpflege)
// Mit 10 Tieren: ~400-600 Münzen/Tag Unterhalt = Kind muss aktiv Besucher anziehen!
const BASE_MAINTENANCE_BABY = 0.5; // Baby-Tiere: 0.5 Münzen/Stunde (12/Tag) - Füttern, Pflegen, Windeln
const BASE_MAINTENANCE_ADULT = 1.0; // Erwachsene Basis: 1.0 Münzen/Stunde (24/Tag) - Standard Futter + Gehegepflege
const COST_MULTIPLIER_PER_ANIMAL = 0.10; // +10% pro zusätzlichem Tier (Wärter sparen durch Effizienz: 3 Tiere vs 10 Tiere)

export interface ZooAnimalInstance {
  animalType: string;
  age: 'baby' | 'adult';
  xp: number;
  unlockedAt: string;
  lastXpUpdateAt?: string;
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
  
  // Zoo-Info
  totalAnimals: number;
  babyAnimals: number;
  adultAnimals: number;
  
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
 * 💰 Berechne Verkaufspreis für ein Tier (Client-side)
 */
export function calculateSellPrice(animal: { age: 'baby' | 'adult'; gender?: 'male' | 'female'; animalType: string }): number {
  // Einfache Preise: Baby 50, Weibchen 80, Männchen 100
  if (animal.age === 'baby') {
    return 50;
  } else if (animal.gender === 'female') {
    return 80;
  } else {
    return 100;
  }
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
    // Sicherstellen, dass animalType definiert ist
    if (!animal || !animal.animalType) {
      console.warn(`Invalid animal data:`, animal);
      updatedAnimals.push(animal);
      continue;
    }
    
    const animalType = animal.animalType as ZooAnimal;
    const economyData = ANIMAL_ECONOMY_DATA[animalType];
    
    if (!economyData) {
      console.warn(`No economy data for animal type: "${animalType}" (known types: ${Object.keys(ANIMAL_ECONOMY_DATA).join(', ')})`);
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
        const animalInfo = getAnimalInfo(animalType);
        evolvedAnimals.push({
          animalType,
          name: animalInfo.name,
          emoji: animalInfo.emoji
        });
      }
    }
    
    // Wirtschafts-Berechnung für die GESAMTE Offline-Zeit
    const baseVisitors = economyData.visitorValue[currentAge] * cappedHours;
    const visitors = calculateElasticDemand(baseVisitors, ticketPrice);
    const income = visitors * ticketPrice * bonuses.incomeMultiplier;
    
    // NEUE KOSTENBERECHNUNG: Basis + Tier-Anzahl-Multiplikator
    const baseCost = currentAge === 'baby' ? BASE_MAINTENANCE_BABY : BASE_MAINTENANCE_ADULT;
    const tierMultiplier = 1 + (currentAnimals.length * COST_MULTIPLIER_PER_ANIMAL);
    const costs = baseCost * tierMultiplier * cappedHours * (1 - bonuses.costReduction);
    
    totalVisitors += Math.floor(visitors * (1 + bonuses.visitorBoost));
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
  const finalCoins = Math.max(0, currentCoins + netIncome);
  
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
 * Berechnet den aktuellen Wirtschaftsstatus des Zoos
 * Zeigt stündliche Einnahmen/Kosten und nächste Evolution
 */
export function calculateEconomyStatus(
  animals: ZooAnimalInstance[],
  ownedShopItems: string[] = [],
  ticketPrice: number = DEFAULT_TICKET_PRICE
): EconomyStatus {
  const bonuses = calculateShopItemBonuses(ownedShopItems);
  
  let totalVisitorsPerHour = 0;
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
    
    // Wirtschafts-Werte summieren
    const baseVisitors = economyData.visitorValue[animal.age];
    
    // NEUE KOSTENBERECHNUNG
    const baseCost = animal.age === 'baby' ? BASE_MAINTENANCE_BABY : BASE_MAINTENANCE_ADULT;
    const tierMultiplier = 1 + (animals.length * COST_MULTIPLIER_PER_ANIMAL);
    const cost = baseCost * tierMultiplier;
    
    totalVisitorsPerHour += baseVisitors;
    maintenanceCostPerHour += cost;
  }
  
  // Boni anwenden und elastische Nachfrage berechnen
  const boostedVisitors = totalVisitorsPerHour * (1 + bonuses.visitorBoost);
  totalVisitorsPerHour = calculateElasticDemand(boostedVisitors, ticketPrice);
  maintenanceCostPerHour = Math.floor(maintenanceCostPerHour * (1 - bonuses.costReduction));
  const passiveIncomePerHour = totalVisitorsPerHour * ticketPrice * bonuses.incomeMultiplier;
  const netIncomePerHour = Math.floor(passiveIncomePerHour - maintenanceCostPerHour);
  
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
      hoursUntilEvolution: Math.ceil(hoursUntil * 10) / 10 // Auf 1 Dezimale runden
    };
  }
  
  return {
    passiveIncomePerHour: Math.floor(passiveIncomePerHour),
    maintenanceCostPerHour,
    totalVisitorsPerHour,
    netIncomePerHour,
    totalAnimals: animals.length,
    babyAnimals: babyCount,
    adultAnimals: adultCount,
    nextEvolution
  };
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
  // TODO: Hier Shop-Items Integration wenn Shop-System erweitert wird
  // Für jetzt: Basis-Werte ohne Boni
  
  let visitorBoost = 0;
  let costReduction = 0;
  let incomeMultiplier = 1.0;
  let xpBonus = 0;
  
  // Beispiel-Logik (wird später durch echte Shop-Items ersetzt):
  // if (ownedItems.includes('visitor_billboard')) visitorBoost += 0.25;
  // if (ownedItems.includes('efficient_feeder')) costReduction += 0.30;
  // if (ownedItems.includes('souvenir_shop')) incomeMultiplier += 0.50;
  
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
