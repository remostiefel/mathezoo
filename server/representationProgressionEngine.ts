import type { LearningProgression } from "@shared/schema";
import {
  representationEngine,
  type RepresentationConfig,
  type RepresentationMastery,
  type RepresentationProgression,
  type RepresentationType,
  type SingleRepresentationMastery,
  REPRESENTATION_STAGES,
  EARLY_CHALLENGE_STAGES
} from "./representationSystem";
import { representationBasedGenerator } from "./representationBasedGenerator";

/**
 * REPRESENTATION PROGRESSION ENGINE
 * 
 * Manages the learning path based on representation mastery.
 * Adaptively adjusts which representations are shown based on performance.
 */

export interface ProgressionEvaluation {
  shouldAdjust: boolean;
  direction: 'reduce' | 'increase' | 'maintain';
  newStage?: number;
  newConfig?: RepresentationConfig;
  reason: string;
  message: string;
  earlyChallenge?: boolean;
}

export interface PerformanceMetrics {
  consecutiveCorrect: number;
  consecutiveErrors: number;
  successRateLast10: number;
  avgTimePerTask: number;
  totalTasksSolved: number;
}

export class RepresentationProgressionEngine {

  /**
   * Evaluate progression after task completion
   */
  evaluateProgression(
    progression: LearningProgression,
    taskResult: {
      isCorrect: boolean;
      timeTaken: number;
      activeRepresentations: RepresentationConfig;
    }
  ): ProgressionEvaluation {
    const currentConfig = representationEngine.getActiveRepresentations(progression);
    const currentMastery = representationEngine.getRepresentationMastery(progression);
    const currentProgression = representationEngine.getRepresentationProgression(progression);

    const updatedMastery = representationEngine.updateRepresentationMastery(
      currentMastery,
      taskResult.activeRepresentations,
      taskResult.isCorrect
    );

    const performanceMetrics = this.extractPerformanceMetrics(progression);

    const earlyChallenge = representationEngine.canUnlockEarlyChallenge({
      consecutiveCorrect: performanceMetrics.consecutiveCorrect,
      successRateLast10: performanceMetrics.successRateLast10
    });

    if (earlyChallenge.canUnlock && earlyChallenge.challengePath) {
      const config = this.createConfigFromReps(earlyChallenge.challengePath.active);
      return {
        shouldAdjust: true,
        direction: 'reduce',
        newConfig: config,
        reason: 'Frühe Herausforderung freigeschaltet!',
        message: `🏆 ${earlyChallenge.challengePath.description}`,
        earlyChallenge: true
      };
    }

    const reduceEval = representationEngine.shouldReduceRepresentations(
      updatedMastery,
      currentProgression,
      {
        consecutiveCorrect: performanceMetrics.consecutiveCorrect,
        successRateLast10: performanceMetrics.successRateLast10
      }
    );

    if (reduceEval.shouldReduce && reduceEval.suggestedStage) {
      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        reduceEval.suggestedStage,
        reduceEval.reason
      );

      return {
        shouldAdjust: true,
        direction: 'reduce',
        newStage: reduceEval.suggestedStage,
        newConfig: result.config,
        reason: reduceEval.reason,
        message: result.message,
        earlyChallenge: false
      };
    }

    const increaseEval = representationEngine.shouldIncreaseRepresentations(
      updatedMastery,
      currentProgression,
      {
        consecutiveErrors: performanceMetrics.consecutiveErrors,
        successRateLast10: performanceMetrics.successRateLast10
      }
    );

    if (increaseEval.shouldIncrease && increaseEval.suggestedStage) {
      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        increaseEval.suggestedStage,
        increaseEval.reason
      );

      return {
        shouldAdjust: true,
        direction: 'increase',
        newStage: increaseEval.suggestedStage,
        newConfig: result.config,
        reason: increaseEval.reason,
        message: result.message,
        earlyChallenge: false
      };
    }

    return {
      shouldAdjust: false,
      direction: 'maintain',
      reason: 'Aktuelles Niveau passt',
      message: this.getEncouragementMessage(performanceMetrics)
    };
  }

  /**
   * Update progression data with new task result
   */
  updateProgressionData(
    progression: LearningProgression,
    evaluation: ProgressionEvaluation,
    taskResult: {
      isCorrect: boolean;
      timeTaken: number;
      activeRepresentations: RepresentationConfig;
    }
  ): Partial<LearningProgression> {
    const currentMastery = representationEngine.getRepresentationMastery(progression);
    const currentProgression = representationEngine.getRepresentationProgression(progression);

    const updatedMastery = representationEngine.updateRepresentationMastery(
      currentMastery,
      taskResult.activeRepresentations,
      taskResult.isCorrect
    );

    if (evaluation.shouldAdjust && evaluation.newConfig) {
      const updatedProgression: RepresentationProgression = {
        stage: evaluation.newStage || currentProgression.stage,
        activeCount: representationEngine.getActiveCount(evaluation.newConfig),
        lastReduction: new Date().toISOString(),
        reductionHistory: [
          ...currentProgression.reductionHistory,
          {
            timestamp: new Date().toISOString(),
            removedRep: this.getChangedRepresentation(
              representationEngine.getActiveRepresentations(progression),
              evaluation.newConfig
            ) || 'none' as RepresentationType,
            remainingReps: representationEngine.getActiveList(evaluation.newConfig),
            reason: evaluation.reason
          }
        ]
      };

      return {
        representationConfig: evaluation.newConfig as any,
        representationMastery: updatedMastery as any,
        representationProgression: updatedProgression as any,
        currentStreak: taskResult.isCorrect ? progression.currentStreak + 1 : 0,
        totalTasksSolved: progression.totalTasksSolved + 1,
        totalCorrect: taskResult.isCorrect ? progression.totalCorrect + 1 : progression.totalCorrect
      };
    }

    return {
      representationMastery: updatedMastery as any,
      currentStreak: taskResult.isCorrect ? progression.currentStreak + 1 : 0,
      totalTasksSolved: progression.totalTasksSolved + 1,
      totalCorrect: taskResult.isCorrect ? progression.totalCorrect + 1 : progression.totalCorrect
    };
  }

  /**
   * Get initial representation configuration for new learners
   */
  getInitialConfiguration(): {
    config: RepresentationConfig;
    progression: RepresentationProgression;
    mastery: Record<RepresentationType, RepresentationMastery>;
  } {
    const config: RepresentationConfig = {
      twentyFrame: true,
      numberLine: true,
      counters: true,
      fingers: true,
      symbolic: true
    };

    const progression: RepresentationProgression = {
      stage: 1,
      activeCount: 5,
      lastReduction: null,
      reductionHistory: []
    };

    const defaultMastery: RepresentationMastery = {
      consecutiveCorrect: 0,
      consecutiveErrors: 0,
      totalUsed: 0,
      successRate: 1.0
    };

    const mastery: Record<RepresentationType, RepresentationMastery> = {
      twentyFrame: { ...defaultMastery },
      numberLine: { ...defaultMastery },
      counters: { ...defaultMastery },
      fingers: { ...defaultMastery },
      symbolic: { ...defaultMastery }
    };

    return { config, progression, mastery };
  }

  /**
   * Get alternative configuration path
   * Allows exploring different representation combinations at same difficulty
   */
  getAlternativeConfiguration(
    currentStage: number,
    currentConfig: RepresentationConfig
  ): RepresentationConfig | null {
    const stageConfigs = REPRESENTATION_STAGES.filter(s => s.activeCount === representationEngine.getActiveCount(currentConfig));

    const alternatives = stageConfigs.filter(sc => {
      const scActive = sc.active.sort().join(',');
      const currentActive = representationEngine.getActiveList(currentConfig).sort().join(',');
      return scActive !== currentActive;
    });

    if (alternatives.length > 0) {
      const alt = alternatives[0];
      return this.createConfigFromReps(alt.active);
    }

    return null;
  }

  /**
   * Recommend next configuration based on performance patterns
   */
  recommendNextConfiguration(
    progression: LearningProgression,
    performanceHistory: Array<{ isCorrect: boolean; timeTaken: number }>
  ): {
    config: RepresentationConfig;
    reason: string;
    difficulty: 'easier' | 'same' | 'harder';
  } {
    const recentPerformance = performanceHistory.slice(-10);
    const successRate = recentPerformance.filter(p => p.isCorrect).length / recentPerformance.length;
    const avgTime = recentPerformance.reduce((sum, p) => sum + p.timeTaken, 0) / recentPerformance.length;

    const currentConfig = representationEngine.getActiveRepresentations(progression);
    const currentCount = representationEngine.getActiveCount(currentConfig);
    const currentProgression = representationEngine.getRepresentationProgression(progression);

    if (successRate >= 0.9 && avgTime < 8 && currentCount > 1) {
      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        currentProgression.stage + 1,
        'Exzellente Leistung'
      );
      return {
        config: result.config,
        reason: 'Du schaffst das mit weniger Hilfen!',
        difficulty: 'harder'
      };
    }

    if (successRate < 0.6 && currentCount < 5) {
      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        Math.max(1, currentProgression.stage - 1),
        'Mehr Unterstützung'
      );
      return {
        config: result.config,
        reason: 'Lass uns mit mehr Hilfen üben',
        difficulty: 'easier'
      };
    }

    return {
      config: currentConfig,
      reason: 'Aktuelles Niveau beibehalten',
      difficulty: 'same'
    };
  }

  /**
   * Create configuration from list of representation types
   */
  private createConfigFromReps(reps: RepresentationType[]): RepresentationConfig {
    return {
      twentyFrame: reps.includes('twentyFrame'),
      numberLine: reps.includes('numberLine'),
      counters: reps.includes('counters'),
      fingers: reps.includes('fingers'),
      symbolic: reps.includes('symbolic')
    };
  }

  /**
   * Find which representation changed between two configs
   */
  private getChangedRepresentation(
    oldConfig: RepresentationConfig,
    newConfig: RepresentationConfig
  ): RepresentationType | null {
    const allReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers', 'symbolic'];

    for (const rep of allReps) {
      if (oldConfig[rep] !== newConfig[rep]) {
        return rep;
      }
    }

    return null;
  }

  /**
   * Extract performance metrics from progression
   */
  private extractPerformanceMetrics(progression: LearningProgression): PerformanceMetrics {
    const recentPerf = (progression as any).recentPerformance || [];
    const last10 = recentPerf.slice(-10);
    const correctCount = last10.filter((p: any) => p.correct).length;

    return {
      consecutiveCorrect: progression.currentStreak,
      consecutiveErrors: 0,
      successRateLast10: last10.length > 0 ? correctCount / last10.length : 1.0,
      avgTimePerTask: last10.length > 0 
        ? last10.reduce((sum: number, p: any) => sum + (p.timeSpent || 0), 0) / last10.length 
        : 10,
      totalTasksSolved: progression.totalTasksSolved
    };
  }

  /**
   * Get encouragement message based on performance
   */
  private getEncouragementMessage(metrics: PerformanceMetrics): string {
    if (metrics.successRateLast10 >= 0.9) {
      return '🌟 Großartig! Weiter so!';
    } else if (metrics.successRateLast10 >= 0.7) {
      return '👍 Gut gemacht!';
    } else if (metrics.successRateLast10 >= 0.5) {
      return '💪 Bleib dran!';
    } else {
      return '📚 Üben wir weiter!';
    }
  }

  /**
   * Get representation stage description
   */
  getStageDescription(stage: number): string {
    const stageConfig = REPRESENTATION_STAGES[stage - 1];
    return stageConfig ? stageConfig.description : 'Unbekannt';
  }

  /**
   * Get current difficulty level (1-10)
   */
  getDifficultyLevel(config: RepresentationConfig, currentStage: number): number {
    const activeCount = representationEngine.getActiveCount(config);
    const repDifficulty = 6 - activeCount;
    const stageDifficulty = Math.min(Math.floor(currentStage / 2), 4);

    return Math.max(1, Math.min(10, repDifficulty + stageDifficulty));
  }

  // ===== SINGLE REPRESENTATION MASTERY METHODS =====

  /**
   * Update progression with single-rep test result
   * ONLY updates single-rep mastery (not multi-rep mastery)
   */
  updateWithSingleRepTest(
    progression: LearningProgression,
    taskResult: {
      isCorrect: boolean;
      timeTaken: number;
      testedRepresentation: RepresentationType;
    }
  ): Partial<LearningProgression> {
    const currentSingleMastery = representationEngine.getSingleRepresentationMastery(progression);

    // Update single-rep mastery
    const updatedSingleMastery = representationEngine.updateSingleRepresentationMastery(
      currentSingleMastery,
      taskResult.testedRepresentation,
      taskResult.isCorrect
    );

    return {
      singleRepresentationMastery: updatedSingleMastery as any,
      currentStreak: taskResult.isCorrect ? progression.currentStreak + 1 : 0,
      totalTasksSolved: progression.totalTasksSolved + 1,
      totalCorrect: taskResult.isCorrect ? progression.totalCorrect + 1 : progression.totalCorrect
    };
  }

  /**
   * Get initial single representation mastery for new learners
   */
  getInitialSingleRepMastery(): Record<RepresentationType, SingleRepresentationMastery> {
    return representationEngine.getSingleRepresentationMastery({
      totalTasksSolved: 0
    } as LearningProgression);
  }

  /**
   * Decide whether next task should be a single-rep test or multi-rep task
   */
  shouldUseSingleRepTest(
    progression: LearningProgression,
    recentTaskHistory: Array<{ isSingleRepTest: boolean }>
  ): {
    shouldTest: boolean;
    representation?: RepresentationType;
    reason?: string;
  } {
    const singleMastery = representationEngine.getSingleRepresentationMastery(progression);

    // Count recent multi-rep tasks
    const recentMultiRep = recentTaskHistory.slice(-5).filter(t => !t.isSingleRepTest).length;
    const recentTasksWereMultiRep = recentMultiRep >= 3;

    // Use the engine's decision logic
    const decision = representationEngine.shouldInjectSingleRepTest(
      singleMastery,
      progression.totalTasksSolved,
      recentTasksWereMultiRep
    );

    return {
      shouldTest: decision.shouldInject,
      representation: decision.representation,
      reason: decision.reason
    };
  }

  /**
   * Get comprehensive mastery report including both multi-rep and single-rep data
   */
  getComprehensiveMasteryReport(progression: LearningProgression): {
    multiRepMastery: Record<RepresentationType, RepresentationMastery>;
    singleRepMastery: Record<RepresentationType, SingleRepresentationMastery>;
    summary: {
      representation: RepresentationType;
      multiRepSuccessRate: number;
      soloTestMastery: number;
      status: 'untested' | 'learning' | 'proficient' | 'mastered';
      needsSoloTesting: boolean;
    }[];
  } {
    const multiRepMastery = representationEngine.getRepresentationMastery(progression);
    const singleRepMastery = representationEngine.getSingleRepresentationMastery(progression);

    const summary = representationEngine.getSingleMasterySummary(singleRepMastery).map(s => ({
      representation: s.representation,
      multiRepSuccessRate: multiRepMastery[s.representation].successRate,
      soloTestMastery: s.mastery,
      status: s.status,
      needsSoloTesting: singleRepMastery[s.representation].needsMoreTesting
    }));

    return {
      multiRepMastery,
      singleRepMastery,
      summary
    };
  }

  /**
   * Determine if representations can be reduced based on BOTH multi-rep and single-rep mastery
   * Stricter criteria: require good solo test performance too
   */
  canReduceRepresentationsStrictly(
    progression: LearningProgression,
    overallPerformance: { consecutiveCorrect: number; successRateLast10: number }
  ): {
    canReduce: boolean;
    reason: string;
    suggestedStage?: number;
  } {
    const multiRepMastery = representationEngine.getRepresentationMastery(progression);
    const singleRepMastery = representationEngine.getSingleRepresentationMastery(progression);
    const currentProgression = representationEngine.getRepresentationProgression(progression);

    // First check multi-rep mastery
    const multiRepCheck = representationEngine.shouldReduceRepresentations(
      multiRepMastery,
      currentProgression,
      overallPerformance
    );

    if (!multiRepCheck.shouldReduce) {
      return {
        canReduce: false,
        reason: multiRepCheck.reason
      };
    }

    // Additional check: have all representations been tested alone?
    const allTested = representationEngine.allRepresentationsBaselineTested(singleRepMastery);

    if (!allTested) {
      return {
        canReduce: false,
        reason: 'Noch nicht alle Darstellungen einzeln getestet'
      };
    }

    // Check single-rep mastery for currently active representations
    const currentConfig = representationEngine.getActiveRepresentations(progression);
    const activeReps = representationEngine.getActiveList(currentConfig);

    const allActiveMastered = activeReps
      .filter(rep => rep !== 'symbolic')
      .every(rep => singleRepMastery[rep].mastery >= 70);

    if (!allActiveMastered) {
      return {
        canReduce: false,
        reason: 'Einzelne Darstellungen noch nicht gemeistert (< 70%)'
      };
    }

    return {
      canReduce: true,
      reason: 'Bereit für Reduktion - Multi-Rep UND Solo-Tests gemeistert',
      suggestedStage: multiRepCheck.suggestedStage
    };
  }

  /**
   * Get representation configuration for a given Representation Level
   * RL 5 = All 5 representations (full support)
   * RL 4 = 4 representations
   * RL 3 = 3 representations
   * RL 2 = 2 representations (varying outer reps, NO symbolic sometimes)
   * RL 1 = 1 representation (only one outer rep, NO symbolic)
   * RL 0 = 0 visual representations (MINIMUM: only symbolic for input)
   */
  getRepresentationConfig(representationLevel: number): RepresentationConfig {
    // WICHTIG: RL wurde umgekehrt - höher = mehr Hilfen
    const rl = Math.max(0, Math.min(5, representationLevel));

    switch (rl) {
      case 5: // Volle Unterstützung - alle 5
        return {
          twentyFrame: true,
          numberLine: true,
          counters: true,
          fingers: true,
          symbolic: true
        };

      case 4: // 4 von 5 - entferne fingers
        return {
          twentyFrame: true,
          numberLine: true,
          counters: true,
          fingers: false,
          symbolic: true
        };

      case 3: // 3 von 5 - behalte Kern-Darstellungen
        return {
          twentyFrame: true,
          numberLine: true,
          counters: false,
          fingers: false,
          symbolic: true
        };

      case 2: // 2 von 5 - OHNE symbolic! Zufällig 2 äußere Reps
        const outerPairs: Array<[string, string]> = [
          ['twentyFrame', 'numberLine'],
          ['twentyFrame', 'counters'],
          ['twentyFrame', 'fingers'],
          ['numberLine', 'counters'],
          ['numberLine', 'fingers'],
          ['counters', 'fingers']
        ];
        const chosenPair = outerPairs[Math.floor(Math.random() * outerPairs.length)];

        return {
          twentyFrame: chosenPair.includes('twentyFrame'),
          numberLine: chosenPair.includes('numberLine'),
          counters: chosenPair.includes('counters'),
          fingers: chosenPair.includes('fingers'),
          symbolic: false // NEU: Symbolic kann früh entfernt werden
        };

      case 1: // 1 von 5 - nur eine äußere Rep (zufällig gewählt)
        const outerReps: Array<'twentyFrame' | 'numberLine' | 'counters' | 'fingers'> = 
          ['twentyFrame', 'numberLine', 'counters', 'fingers'];
        const chosenRep = outerReps[Math.floor(Math.random() * outerReps.length)];

        return {
          twentyFrame: chosenRep === 'twentyFrame',
          numberLine: chosenRep === 'numberLine',
          counters: chosenRep === 'counters',
          fingers: chosenRep === 'fingers',
          symbolic: false // NEU: Kein symbolic!
        };

      case 0: // 0 visuell - nur Symbolic für Eingabe (MINIMUM)
      default:
        return {
          twentyFrame: false,
          numberLine: false,
          counters: false,
          fingers: false,
          symbolic: true // MINIMUM: Mindestens symbolic für Eingabe
        };
    }
  }
}

export const representationProgressionEngine = new RepresentationProgressionEngine();