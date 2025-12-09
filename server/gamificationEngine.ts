import type { Achievement, InsertAchievement, Task } from "@shared/schema";
import type { StrategyLevel } from "./taskGenerator";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: "explorer" | "strategist" | "speedster" | "persistent";
  targetValue: number;
  currentProgress: number;
  iconName: string;
  reward: string;
}

export class GamificationEngine {
  
  /**
   * Check achievements nach Task-Abschluss
   */
  async checkAchievements(
    userId: string,
    completedTask: Task,
    allUserTasks: Task[],
    storage: any
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingAchievements = await storage.getAchievementsByUserId(userId);
    const existingTypes = new Set(existingAchievements.map((a: Achievement) => a.achievementType));

    // 1. Erste Aufgabe geschafft
    if (allUserTasks.length === 1 && completedTask.isCorrect && !existingTypes.has("first_task")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "first_task",
        title: "Erste Schritte",
        description: "Deine erste Aufgabe gelöst!",
        iconName: "Sparkles",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    // 2. Strategie-Entdecker Achievements
    const usedStrategies = new Set(allUserTasks.map(t => t.strategyUsed).filter(Boolean));
    
    if (usedStrategies.has("doubles") && !existingTypes.has("doubles_master")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "doubles_master",
        title: "Verdopplungs-Meister",
        description: "Du hast die Verdopplungs-Strategie entdeckt!",
        iconName: "Copy",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    if (usedStrategies.has("make_ten") && !existingTypes.has("ten_crossing_expert")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "ten_crossing_expert",
        title: "Zehner-Experte",
        description: "Du beherrschst den Zehnerübergang!",
        iconName: "TrendingUp",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    if (usedStrategies.size >= 4 && !existingTypes.has("strategy_explorer")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "strategy_explorer",
        title: "Strategie-Forscher",
        description: "Du hast 4 verschiedene Strategien verwendet!",
        iconName: "Compass",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    // 3. Geschwindigkeits-Achievements
    if (completedTask.isCorrect && completedTask.timeTaken && completedTask.timeTaken < 3000 && 
        !existingTypes.has("speedster")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "speedster",
        title: "Blitzschnell",
        description: "Eine Aufgabe in unter 3 Sekunden gelöst!",
        iconName: "Zap",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    // 4. Persistence Achievements
    const correctTasks = allUserTasks.filter(t => t.isCorrect).length;
    
    if (correctTasks >= 10 && !existingTypes.has("persistent_learner")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "persistent_learner",
        title: "Durchhaltevermögen",
        description: "10 Aufgaben korrekt gelöst!",
        iconName: "Award",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    if (correctTasks >= 50 && !existingTypes.has("math_champion")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "math_champion",
        title: "Mathe-Champion",
        description: "50 Aufgaben gemeistert!",
        iconName: "Trophy",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    // 5. Perfektionist Achievement
    const last10Tasks = allUserTasks.slice(-10);
    const allCorrect = last10Tasks.every(t => t.isCorrect) && last10Tasks.length === 10;
    
    if (allCorrect && !existingTypes.has("perfectionist")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "perfectionist",
        title: "Perfektionist",
        description: "10 Aufgaben in Folge korrekt!",
        iconName: "Star",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    // 6. Multimodal Achievementrepresentation
    const usedRepresentations = new Set(
      allUserTasks.flatMap(t => t.representationsUsed || [])
    );
    
    if (usedRepresentations.size >= 3 && !existingTypes.has("multimodal_explorer")) {
      const achievement = await storage.createAchievement({
        userId,
        achievementType: "multimodal_explorer",
        title: "Darstellungs-Entdecker",
        description: "Du hast 3 verschiedene Darstellungen genutzt!",
        iconName: "Layout",
        progress: 100,
        isUnlocked: true,
        unlockedAt: new Date(),
      });
      newAchievements.push(achievement);
    }

    return newAchievements;
  }

  /**
   * Generate Forscher-Missionen based on cognitive profile
   */
  async generateMissions(
    userId: string,
    cognitiveProfile: any,
    allUserTasks: Task[]
  ): Promise<Mission[]> {
    const missions: Mission[] = [];

    // Mission 1: Strategiewechsel
    const usedStrategies = new Set(allUserTasks.map(t => t.strategyUsed).filter(Boolean));
    missions.push({
      id: "strategy_diversity",
      title: "Strategien-Entdecker",
      description: "Verwende 5 verschiedene Lösungsstrategien",
      category: "explorer",
      targetValue: 5,
      currentProgress: usedStrategies.size,
      iconName: "Compass",
      reward: "Strategie-Forscher Badge",
    });

    // Mission 2: Geschwindigkeit
    const fastTasks = allUserTasks.filter(t => t.timeTaken && t.timeTaken < 5000).length;
    missions.push({
      id: "speed_master",
      title: "Tempo-Training",
      description: "Löse 20 Aufgaben in unter 5 Sekunden",
      category: "speedster",
      targetValue: 20,
      currentProgress: fastTasks,
      iconName: "Zap",
      reward: "Blitz-Rechner Badge",
    });

    // Mission 3: Fehlerfreie Serie
    let currentStreak = 0;
    let maxStreak = 0;
    for (const task of allUserTasks) {
      if (task.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    missions.push({
      id: "perfect_streak",
      title: "Fehlerfreie Serie",
      description: "Löse 15 Aufgaben in Folge korrekt",
      category: "persistent",
      targetValue: 15,
      currentProgress: maxStreak,
      iconName: "Award",
      reward: "Perfektionist Badge",
    });

    // Mission 4: Darstellungs-Flexibilität
    const usedRepresentations = new Set(
      allUserTasks.flatMap(t => t.representationsUsed || [])
    );
    missions.push({
      id: "representation_master",
      title: "Darstellungs-Meister",
      description: "Nutze alle 4 Darstellungen mindestens einmal",
      category: "explorer",
      targetValue: 4,
      currentProgress: usedRepresentations.size,
      iconName: "Layout",
      reward: "Multimodal-Experte Badge",
    });

    // Mission 5: Zehnerübergang-Spezialist
    const tenCrossingTasks = allUserTasks.filter(t => 
      t.operation === "addition" &&
      t.number1 + t.number2 > 10 &&
      t.isCorrect
    ).length;
    
    missions.push({
      id: "ten_crossing_specialist",
      title: "Zehner-Spezialist",
      description: "Meistere 25 Zehnerübergänge",
      category: "strategist",
      targetValue: 25,
      currentProgress: tenCrossingTasks,
      iconName: "TrendingUp",
      reward: "Zehner-Profi Badge",
    });

    // Mission 6: Tägliche Praxis
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = allUserTasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;

    missions.push({
      id: "daily_practice",
      title: "Tägliche Übung",
      description: "Löse heute 10 Aufgaben",
      category: "persistent",
      targetValue: 10,
      currentProgress: todayTasks,
      iconName: "Calendar",
      reward: "Fleißig Badge",
    });

    return missions;
  }

  /**
   * Calculate total achievement points
   */
  calculatePoints(achievements: Achievement[]): number {
    const pointsMap: Record<string, number> = {
      first_task: 10,
      doubles_master: 25,
      ten_crossing_expert: 50,
      strategy_explorer: 75,
      speedster: 30,
      persistent_learner: 50,
      math_champion: 100,
      perfectionist: 75,
      multimodal_explorer: 40,
    };

    return achievements.reduce((total, achievement) => {
      return total + (pointsMap[achievement.achievementType] || 10);
    }, 0);
  }

  /**
   * Get achievement rank based on points
   */
  getRank(points: number): { rank: string; title: string; icon: string } {
    if (points >= 500) {
      return { rank: "Experte", title: "Mathematik-Experte", icon: "Crown" };
    } else if (points >= 300) {
      return { rank: "Fortgeschritten", title: "Mathe-Profi", icon: "Award" };
    } else if (points >= 150) {
      return { rank: "Geübt", title: "Fleißiger Rechner", icon: "Star" };
    } else if (points >= 50) {
      return { rank: "Anfänger", title: "Mathe-Entdecker", icon: "Compass" };
    } else {
      return { rank: "Neuling", title: "Mathe-Neuling", icon: "Sparkles" };
    }
  }
}

export const gamificationEngine = new GamificationEngine();
