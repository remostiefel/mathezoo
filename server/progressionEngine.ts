import type { LearningProgression, Task, InsertTask } from "@shared/schema";
import { DatabaseStorage } from "./storage";
import { ensureValidTask, validateResult } from "./taskValidation";
import { ensureCorrectArithmetic, validateArithmetic } from "./arithmeticValidator";
import { levelGenerator } from "./levelGenerator";

// ===== ADAPTIVE MULTI-REPRESENTATION SYSTEM (AMRS) =====

// Representation positions in UI grid
export enum RepresentationType {
  TWENTY_FRAME = 'center',      // Mitte - Primäre Visualisierung
  NUMBER_LINE = 'top',           // Oben - Zahlenstrahl
  DECOMPOSITION = 'bottom',      // Unten - Zerlegungsbaum
  SYMBOLIC = 'left',             // Links - Symbolische Operation
  STRATEGY_HINT = 'right'        // Rechts - Strategiehinweis
}

// All representation types for Full Support
export const ALL_REPRESENTATIONS = Object.values(RepresentationType);

// Representation Level Descriptions
export const RL_DESCRIPTIONS = {
  5: { name: 'Volle Unterstützung', emoji: '🌟🌟🌟🌟🌟', description: 'Alle Hilfen sichtbar' },
  4: { name: 'Hohe Unterstützung', emoji: '🌟🌟🌟🌟⭐', description: 'Viele Hilfen' },
  3: { name: 'Mittlere Unterstützung', emoji: '🌟🌟🌟⭐⭐', description: 'Basis-Hilfen' },
  2: { name: 'Geringe Unterstützung', emoji: '🌟🌟⭐⭐⭐', description: 'Wenige Hilfen' },
  1: { name: 'Minimale Unterstützung', emoji: '🌟⭐⭐⭐⭐', description: 'Nur Rechnung' },
};

// Interface for task representation configuration
export interface RepresentationConfig {
  level: number; // 0-5
  active: RepresentationType[];
  message: string; // User feedback about representation level
}

// Performance tracking for RL adjustment
export interface RecentPerformance {
  consecutiveCorrect: number;
  consecutiveErrors: number;
  avgTimePerTask: number;
  successRateLast10: number;
  last10Results: boolean[];
}

// Task result for progression evaluation
export interface TaskResult {
  taskId: string;
  level: number; // Changed from stage to level
  isCorrect: boolean;
  timeTaken: number; // seconds
  operation: '+' | '-';
  number1: number;
  number2: number;
  correctAnswer: number;
  studentAnswer: number | null;
}

// Progression update result
export interface ProgressionUpdate {
  newLevel: number | null;
  milestoneAchieved: {
    milestoneTitle: string;
    milestoneIcon: string;
    levelTrigger: number;
  } | null;
  knowledgeGapDetected: any | null;
  message: string;
  currentStreak: number;
  levelProgress: {
    current: number;
    total: number;
    percentage: number;
  };
}

export class ProgressionEngine {

  /**
   * Generate a task for a specific level and difficulty
   */
  generateTaskForLevel(
    level: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    previousTask?: { number1: number; number2: number; operation: '+' | '-' } | null
  ): {
    operation: '+' | '-';
    number1: number;
    number2: number;
    correctAnswer: number;
    level: number;
    taskType: string;
  } | null {
    const config = levelGenerator.getSubLevelConfig(level);
    if (!config) return null;

    // Determine number range based on level
    const numberRange = level <= 20 ? 10 : level <= 40 ? 20 : 100;

    // Simple task generation based on level difficulty
    const operation = Math.random() > 0.5 ? '+' : '-';
    let number1 = 0;
    let number2 = 0;
    let result = 0;
    let attempts = 0;
    const maxAttempts = 50;

    const maxNumber = numberRange === 10 ? 10 : numberRange === 20 ? 20 : 100;

    do {
      if (attempts++ > maxAttempts) {
        console.warn(`Could not generate valid task for level ${level} after ${maxAttempts} attempts`);
        return null;
      }

      if (operation === '+') {
        number1 = Math.floor(Math.random() * maxNumber) + 1;
        number2 = Math.floor(Math.random() * (maxNumber - number1)) + 1;
        result = number1 + number2;
      } else {
        number1 = Math.floor(Math.random() * maxNumber) + 1;
        number2 = Math.floor(Math.random() * number1) + 1;
        result = number1 - number2;
      }
    } while (
      result < 0 ||
      result > maxNumber ||
      (previousTask &&
       previousTask.number1 === number1 &&
       previousTask.number2 === number2 &&
       previousTask.operation === operation)
    );

    const validatedTask = ensureValidTask({ operation, number1, number2 });

    // KRITISCH: Berechne korrekte Antwort mit Validator
    const finalResult = ensureCorrectArithmetic(
      validatedTask.operation,
      validatedTask.number1,
      validatedTask.number2
    );

    // KRITISCH: Doppelte Validierung
    const validation = validateArithmetic(
      validatedTask.operation,
      validatedTask.number1,
      validatedTask.number2,
      finalResult
    );

    if (!validation.isValid) {
      console.error(`🚨 CRITICAL: Arithmetic validation failed!`);
      console.error(validation.error);
      throw new Error('CRITICAL ARITHMETIC ERROR IN TASK GENERATION');
    }

    if (!validateResult(finalResult, maxNumber)) {
      console.error(`❌ Task result ${finalResult} exceeds max ${maxNumber}, using fallback`);
      return {
        operation: '+',
        number1: 3,
        number2: 2,
        correctAnswer: 5,
        level,
        taskType: `Level ${level}`
      };
    }

    return {
      operation: validatedTask.operation,
      number1: validatedTask.number1,
      number2: validatedTask.number2,
      correctAnswer: finalResult,
      level,
      taskType: `Level ${level}`
    };
  }

  /**
   * Evaluate progression after task completion
   */
  evaluateProgression(
    currentProgression: LearningProgression,
    taskResult: TaskResult
  ): ProgressionUpdate {
    const currentLevel = (currentProgression as any).currentLevel || 1;
    const validLevel = Math.max(1, Math.min(100, taskResult.level || currentLevel));

    if (validLevel !== taskResult.level) {
      console.warn(`⚠️ Invalid level ${taskResult.level} adjusted to ${validLevel}`);
      taskResult.level = validLevel;
    }

    const config = levelGenerator.getSubLevelConfig(validLevel);
    if (!config) {
      console.error(`❌ No config found for level ${validLevel}, using fallback`);
      return {
        newLevel: null,
        milestoneAchieved: null,
        knowledgeGapDetected: null,
        message: '',
        currentStreak: currentProgression.currentStreak,
        levelProgress: {
          current: 0,
          total: 10,
          percentage: 0,
        },
      };
    }

    const newStreak = taskResult.isCorrect ? currentProgression.currentStreak + 1 : 0;

    // Get level history for current level
    const levelHistory = (currentProgression as any).levelHistory || [];
    const currentLevelData = levelHistory.find((l: any) => l.level === validLevel);

    const currentAttempts = currentLevelData?.attemptsCount || 0;
    const currentCorrect = currentLevelData?.correctCount || 0;
    const newAttempts = currentAttempts + 1;
    const newCorrect = currentCorrect + (taskResult.isCorrect ? 1 : 0);
    const successRate = newAttempts > 0 ? newCorrect / newAttempts : 0;

    let milestoneAchieved = null;
    const MILESTONE_TARGET = 10;
    const requirementsMet = newAttempts >= MILESTONE_TARGET;
    const successRateMet = successRate >= 0.8;
    const notYetMastered = !currentLevelData?.masteredAt;
    const isCurrentLevel = validLevel === currentLevel;

    const shouldTriggerMilestone = isCurrentLevel && notYetMastered && (
      (requirementsMet && successRateMet) ||
      (newAttempts > MILESTONE_TARGET && successRate >= 0.7)
    );

    if (shouldTriggerMilestone) {
      const icon = validLevel % 10 === 0 ? "🏆" : validLevel % 5 === 0 ? "⭐" : "✓";
      milestoneAchieved = {
        milestoneTitle: `Level ${validLevel} gemeistert!`,
        milestoneIcon: icon,
        levelTrigger: validLevel,
      };
      console.log(`🎯 MILESTONE ACHIEVED for level ${validLevel}!`);
    }

    let newLevel = null;
    if (milestoneAchieved && currentLevel < 100) {
      newLevel = currentLevel + 1;
      console.log(`🚀 LEVEL UP! ${currentLevel} → ${newLevel}`);
    }

    const cappedAttempts = Math.min(newAttempts, MILESTONE_TARGET);
    const cappedCorrect = Math.min(newCorrect, MILESTONE_TARGET);

    const updatedLevelHistory = levelHistory.filter((l: any) => l.level !== validLevel);
    updatedLevelHistory.push({
      level: validLevel,
      attemptsCount: newLevel ? 0 : cappedAttempts,
      correctCount: newLevel ? 0 : cappedCorrect,
      masteredAt: milestoneAchieved ? new Date() : currentLevelData?.masteredAt,
    });

    if (newLevel && !updatedLevelHistory.some((l: any) => l.level === newLevel)) {
      updatedLevelHistory.push({
        level: newLevel,
        attemptsCount: 0,
        correctCount: 0,
        masteredAt: null,
      });
    }

    const shortFeedbacks = ['✓', '✓ Gut!', '✓ Prima!', '✓ Super!', '✓ Klasse!'];
    const encouragementMessages = [
      'Schau dir die Darstellungen an!',
      'Nutze die Hilfen!',
      'Versuch es nochmal!',
      'Schau genau hin!',
      'Fast!',
    ];

    let message = '';
    if (taskResult.isCorrect) {
      if (milestoneAchieved) {
        message = `🎉 LEVEL UP! ${milestoneAchieved.milestoneIcon}`;
      } else if (newStreak === 5) {
        message = '🔥 5er-Serie!';
      } else if (newStreak === 10) {
        message = '⚡ 10 in Folge!';
      } else if (newStreak % 10 === 0 && newStreak > 10) {
        message = `🏆 ${newStreak}-Serie!`;
      } else if (Math.random() < 0.15) {
        message = shortFeedbacks[Math.floor(Math.random() * shortFeedbacks.length)];
      }
    } else {
      message = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    }

    return {
      newLevel,
      milestoneAchieved,
      knowledgeGapDetected: null,
      message,
      currentStreak: newStreak,
      levelProgress: {
        current: newLevel ? 0 : cappedAttempts,
        total: MILESTONE_TARGET,
        percentage: newLevel ? 0 : Math.round((cappedAttempts / MILESTONE_TARGET) * 100),
      },
    };
  }

  // ===== AMRS METHODS =====

  selectRepresentations(
    representationLevel: number,
    level: number,
    taskType: string,
    preferredRepresentations: RepresentationType[] = []
  ): RepresentationType[] {
    if (representationLevel === 1) {
      return [RepresentationType.SYMBOLIC];
    }

    if (representationLevel === 2) {
      return [
        RepresentationType.SYMBOLIC,
        RepresentationType.TWENTY_FRAME
      ];
    }

    if (representationLevel === 3) {
      return [
        RepresentationType.TWENTY_FRAME,
        RepresentationType.SYMBOLIC,
        RepresentationType.NUMBER_LINE
      ];
    }

    if (representationLevel === 4) {
      return [
        RepresentationType.TWENTY_FRAME,
        RepresentationType.NUMBER_LINE,
        RepresentationType.DECOMPOSITION,
        RepresentationType.SYMBOLIC
      ];
    }

    return ALL_REPRESENTATIONS;
  }

  updateRepresentationLevel(
    currentRL: number,
    performance: RecentPerformance,
    currentLevel: number
  ): {
    newRL: number;
    reason: 'advancement' | 'regression' | 'stable' | 'level_change';
    message: string;
  } {
    let newRL = currentRL;
    let reason: 'advancement' | 'regression' | 'stable' | 'level_change' = 'stable';
    let message = '';

    if (performance.consecutiveCorrect >= 5 && currentRL > 1) {
      newRL = Math.max(1, currentRL - 1);
      reason = 'advancement';
      message = `🎯 Weniger Hilfen! Du schaffst das auch mit weniger Unterstützung!`;
    } else if (
      performance.successRateLast10 >= 0.9 &&
      performance.avgTimePerTask < 8 &&
      performance.last10Results.length >= 10 &&
      currentRL > 1
    ) {
      newRL = Math.max(1, currentRL - 1);
      reason = 'advancement';
      message = `⚡ Schnell UND genau! Neue Herausforderung!`;
    } else if (performance.consecutiveErrors >= 3 && currentRL < 5) {
      newRL = Math.min(5, currentRL + 1);
      reason = 'regression';
      message = `💡 Mehr Hilfen! Wir machen das zusammen!`;
    } else if (
      performance.successRateLast10 < 0.6 &&
      performance.last10Results.length >= 5 &&
      currentRL < 5
    ) {
      newRL = Math.min(5, currentRL + 1);
      reason = 'regression';
      message = `📚 Lass uns mit mehr Unterstützung weiterlernen!`;
    }

    return { newRL, reason, message };
  }

  updatePerformanceMetrics(
    currentPerformance: RecentPerformance,
    taskResult: { isCorrect: boolean; timeTaken: number }
  ): RecentPerformance {
    const newPerformance = { ...currentPerformance };

    if (!newPerformance.last10Results) {
      newPerformance.last10Results = [];
    }

    if (taskResult.isCorrect) {
      newPerformance.consecutiveCorrect++;
      newPerformance.consecutiveErrors = 0;
    } else {
      newPerformance.consecutiveErrors++;
      newPerformance.consecutiveCorrect = 0;
    }

    newPerformance.last10Results.push(taskResult.isCorrect);
    if (newPerformance.last10Results.length > 10) {
      newPerformance.last10Results.shift();
    }

    const correctCount = newPerformance.last10Results.filter(r => r).length;
    newPerformance.successRateLast10 = correctCount / newPerformance.last10Results.length;

    const alpha = 0.3;
    if (newPerformance.avgTimePerTask === 0) {
      newPerformance.avgTimePerTask = taskResult.timeTaken;
    } else {
      newPerformance.avgTimePerTask =
        alpha * taskResult.timeTaken + (1 - alpha) * newPerformance.avgTimePerTask;
    }

    return newPerformance;
  }

  getRepresentationConfig(
    progression: LearningProgression,
    taskType: string
  ): RepresentationConfig {
    const rl = (progression as any).representationLevel || 5;
    const level = (progression as any).currentLevel || 1;
    const preferredReps = (progression as any).preferredRepresentations || [];

    const activeRepresentations = this.selectRepresentations(
      rl,
      level,
      taskType,
      preferredReps
    );

    const rlDesc = RL_DESCRIPTIONS[rl as keyof typeof RL_DESCRIPTIONS];

    return {
      level: rl,
      active: activeRepresentations,
      message: `${rlDesc.emoji} ${rlDesc.description}`,
    };
  }

  getRecommendedRLForLevel(level: number): number {
    if (level <= 10) return 5;
    if (level <= 30) return 4;
    if (level <= 60) return 3;
    if (level <= 85) return 2;
    return 1;
  }

  checkRepresentationMilestone(
    currentRL: number,
    currentLevel: number
  ): { achieved: boolean; milestone?: { title: string; icon: string; description: string } } {
    const milestones = [
      { rl: 4, level: 15, title: 'Visuelle Unabhängigkeit I', icon: '👁️', description: 'Weniger Hilfen benötigt' },
      { rl: 3, level: 40, title: 'Visuelle Unabhängigkeit II', icon: '🔍', description: 'Immer selbstständiger' },
      { rl: 2, level: 70, title: 'Visuelle Unabhängigkeit III', icon: '🎯', description: 'Fast ohne Hilfen' },
      { rl: 1, level: 90, title: 'Mathe-Meister', icon: '🥷', description: 'Nur noch Rechnung benötigt' },
    ];

    for (const m of milestones) {
      if (currentRL === m.rl && currentLevel >= m.level) {
        return {
          achieved: true,
          milestone: m,
        };
      }
    }

    return { achieved: false };
  }

  /**
   * Derive stage from level (for backwards compatibility)
   */
  getStageFromLevel(level: number): number {
    if (level <= 20) {
      if (level <= 7) return 1;
      if (level <= 13) return 2;
      return 3;
    } else if (level <= 40) {
      if (level <= 25) return 4;
      if (level <= 30) return 5;
      if (level <= 35) return 6;
      return 7;
    } else if (level <= 68) {
      if (level <= 48) return 8;
      if (level <= 55) return 9;
      if (level <= 62) return 10;
      return 11;
    } else if (level <= 92) {
      if (level <= 75) return 12;
      if (level <= 81) return 13;
      if (level <= 87) return 14;
      return 15;
    } else {
      if (level <= 93) return 16;
      if (level <= 95) return 17;
      if (level <= 97) return 18;
      if (level <= 99) return 19;
      return 20;
    }
  }

  /**
   * Derive level from stage (approximate mapping)
   */
  getLevelFromStage(stage: number): number {
    if (stage <= 3) {
      return stage * 7;
    } else if (stage <= 7) {
      return 20 + (stage - 3) * 5;
    } else if (stage <= 11) {
      return 40 + (stage - 7) * 7;
    } else if (stage <= 15) {
      return 68 + (stage - 11) * 6;
    } else {
      return 92 + (stage - 15) * 2;
    }
  }
}