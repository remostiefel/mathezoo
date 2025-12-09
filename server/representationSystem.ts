import type { LearningProgression } from "@shared/schema";

/**
 * INDIVIDUAL REPRESENTATION CONTROL SYSTEM
 * 
 * Manages 5 independent mathematical representations:
 * 1. TwentyFrame (20erfeld) - Top position
 * 2. NumberLine (Zahlenstrahl) - Bottom position  
 * 3. Counters (Wendepunkte) - Left position
 * 4. Fingers (Fingerdarstellung) - Right position
 * 5. Symbolic (Rechnung) - Center position
 * 
 * Each representation can be independently shown/hidden based on learner progression.
 * Fewer representations = higher difficulty
 */

export type RepresentationType = 
  | 'twentyFrame'   // 20erfeld (oben)
  | 'numberLine'    // Zahlenstrahl (unten)
  | 'counters'      // Wendepunkte (links)
  | 'fingers'       // Fingerdarstellung (rechts)
  | 'symbolic';     // Rechnung (Mitte)

export const ALL_REPRESENTATIONS: RepresentationType[] = [
  'twentyFrame',
  'numberLine', 
  'counters',
  'fingers',
  'symbolic'
];

export interface RepresentationConfig {
  twentyFrame: boolean;
  numberLine: boolean;
  counters: boolean;
  fingers: boolean;
  symbolic: boolean;
}

export interface RepresentationMastery {
  consecutiveCorrect: number;
  consecutiveErrors: number;
  totalUsed: number;
  successRate: number;
}

/**
 * INDIVIDUAL REPRESENTATION MASTERY
 * 
 * Tracks mastery of each representation when shown ALONE (with symbolic).
 * This is the ONLY way to determine if a student truly understands a specific representation.
 * 
 * When multiple representations are shown together, we CANNOT attribute success
 * to any specific one, so these stats are NOT updated.
 */
export interface SingleRepresentationMastery {
  mastery: number;              // 0-100% - only from solo tests
  soloTestsAttempted: number;   // How many times tested alone
  soloTestsCorrect: number;     // How many solo tests were correct
  consecutiveCorrectSolo: number; // Current streak in solo tests
  lastTestedAlone: string | null; // Timestamp of last solo test
  firstTestedAlone: string | null; // When first tested alone
  needsMoreTesting: boolean;    // True if not enough solo data
}

/**
 * Testing schedule for single representations
 */
export interface SingleRepTestingSchedule {
  representation: RepresentationType;
  priority: number;             // 1-10 (10 = highest priority to test)
  recommendedTaskNumber: number; // When to test (task count)
  reason: string;               // Why this rep should be tested
}

export interface RepresentationProgression {
  stage: number;               // 1-10 (10 = only symbolic, 1 = all 5)
  activeCount: number;         // 1-5
  lastReduction: string | null; // timestamp
  reductionHistory: Array<{
    timestamp: string;
    removedRep: RepresentationType;
    remainingReps: RepresentationType[];
    reason: string;
  }>;
}

/**
 * Representation Stage Definitions
 * 
 * Stage 1: All 5 representations (easiest)
 * Stage 2-9: Progressive reduction
 * Stage 10: Only symbolic (hardest)
 */
export const REPRESENTATION_STAGES = [
  {
    stage: 1,
    name: 'Volle Unterstützung',
    activeCount: 5,
    active: ALL_REPRESENTATIONS,
    description: 'Alle 5 Darstellungen sichtbar'
  },
  {
    stage: 2,
    name: 'Leichte Reduktion',
    activeCount: 4,
    active: ['twentyFrame', 'numberLine', 'counters', 'symbolic'] as RepresentationType[],
    description: 'Finger-Darstellung ausgeblendet'
  },
  {
    stage: 3,
    name: 'Mittlere Unterstützung',
    activeCount: 4,
    active: ['twentyFrame', 'numberLine', 'fingers', 'symbolic'] as RepresentationType[],
    description: 'Wendepunkte ausgeblendet'
  },
  {
    stage: 4,
    name: 'Basis-Darstellungen',
    activeCount: 3,
    active: ['twentyFrame', 'numberLine', 'symbolic'] as RepresentationType[],
    description: 'Nur Kerndarstellungen'
  },
  {
    stage: 5,
    name: 'Reduzierte Hilfen',
    activeCount: 3,
    active: ['numberLine', 'counters', 'symbolic'] as RepresentationType[],
    description: '20erfeld ausgeblendet'
  },
  {
    stage: 6,
    name: 'Geringe Unterstützung',
    activeCount: 2,
    active: ['numberLine', 'symbolic'] as RepresentationType[],
    description: 'Zahlenstrahl + Rechnung'
  },
  {
    stage: 7,
    name: 'Minimale Hilfen',
    activeCount: 2,
    active: ['twentyFrame', 'symbolic'] as RepresentationType[],
    description: '20erfeld + Rechnung'
  },
  {
    stage: 8,
    name: 'Fast selbstständig',
    activeCount: 2,
    active: ['counters', 'symbolic'] as RepresentationType[],
    description: 'Wendepunkte + Rechnung'
  },
  {
    stage: 9,
    name: 'Nahezu abstrakt',
    activeCount: 1,
    active: ['symbolic'] as RepresentationType[],
    description: 'Nur noch Rechnung'
  },
  {
    stage: 10,
    name: 'Vollständig abstrakt',
    activeCount: 1,
    active: ['symbolic'] as RepresentationType[],
    description: 'Rein symbolisch'
  }
];

/**
 * Early challenge paths - allow fewer representations earlier if student shows mastery
 */
export const EARLY_CHALLENGE_STAGES = [
  {
    stage: 'early_2rep',
    name: 'Frühe Herausforderung (2)',
    activeCount: 2,
    active: ['twentyFrame', 'symbolic'] as RepresentationType[],
    minCorrectStreak: 8,
    minSuccessRate: 0.9,
    description: 'Nur 2 Darstellungen - für schnelle Lerner'
  },
  {
    stage: 'early_1rep',
    name: 'Frühe Herausforderung (1)',
    activeCount: 1,
    active: ['symbolic'] as RepresentationType[],
    minCorrectStreak: 12,
    minSuccessRate: 0.95,
    description: 'Nur Rechnung - für Experten'
  }
];

export class RepresentationEngine {
  /**
   * Get current active representations from progression
   * CRITICAL: This now actually implements representation reduction!
   */
  getActiveRepresentations(progression: LearningProgression): RepresentationConfig {
    // Get current stage (1-10)
    const repProgression = this.getRepresentationProgression(progression);
    const currentStage = repProgression.stage;

    // Get stage configuration
    const stageConfig = REPRESENTATION_STAGES[currentStage - 1];
    
    if (!stageConfig) {
      // Fallback: all representations
      return {
        twentyFrame: true,
        numberLine: true,
        counters: true,
        fingers: true,
        symbolic: true
      };
    }

    // Build config based on active representations in this stage
    const config: RepresentationConfig = {
      twentyFrame: stageConfig.active.includes('twentyFrame'),
      numberLine: stageConfig.active.includes('numberLine'),
      counters: stageConfig.active.includes('counters'),
      fingers: stageConfig.active.includes('fingers'),
      symbolic: stageConfig.active.includes('symbolic')
    };

    return config;
  }

  /**
   * Get representation mastery data
   */
  getRepresentationMastery(progression: LearningProgression): Record<RepresentationType, RepresentationMastery> {
    const mastery = (progression as any).representationMastery;
    if (!mastery) {
      const defaultMastery: RepresentationMastery = {
        consecutiveCorrect: 0,
        consecutiveErrors: 0,
        totalUsed: 0,
        successRate: 1.0
      };
      return {
        twentyFrame: { ...defaultMastery },
        numberLine: { ...defaultMastery },
        counters: { ...defaultMastery },
        fingers: { ...defaultMastery },
        symbolic: { ...defaultMastery }
      };
    }
    return mastery as Record<RepresentationType, RepresentationMastery>;
  }

  /**
   * Get representation progression data
   */
  getRepresentationProgression(progression: LearningProgression): RepresentationProgression {
    const repProg = (progression as any).representationProgression;
    if (!repProg) {
      return {
        stage: 1,
        activeCount: 5,
        lastReduction: null,
        reductionHistory: []
      };
    }
    return repProg as RepresentationProgression;
  }

  /**
   * Update representation mastery after task completion
   */
  updateRepresentationMastery(
    currentMastery: Record<RepresentationType, RepresentationMastery>,
    activeReps: RepresentationConfig,
    isCorrect: boolean
  ): Record<RepresentationType, RepresentationMastery> {
    const updated = { ...currentMastery };

    ALL_REPRESENTATIONS.forEach(rep => {
      if (activeReps[rep]) {
        const repMastery = { ...updated[rep] };
        
        repMastery.totalUsed++;
        
        if (isCorrect) {
          repMastery.consecutiveCorrect++;
          repMastery.consecutiveErrors = 0;
        } else {
          repMastery.consecutiveErrors++;
          repMastery.consecutiveCorrect = 0;
        }

        const totalCorrect = Math.floor(repMastery.totalUsed * repMastery.successRate);
        const newTotalCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;
        repMastery.successRate = newTotalCorrect / repMastery.totalUsed;

        updated[rep] = repMastery;
      }
    });

    return updated;
  }

  /**
   * Evaluate if representations should be reduced (increase difficulty)
   * UPDATED: Realistischere Schwellwerte für Darstellungsreduktion
   */
  shouldReduceRepresentations(
    mastery: Record<RepresentationType, RepresentationMastery>,
    progression: RepresentationProgression,
    overallPerformance: { consecutiveCorrect: number; successRateLast10: number }
  ): {
    shouldReduce: boolean;
    reason: string;
    suggestedStage?: number;
  } {
    if (progression.activeCount <= 1) {
      return { shouldReduce: false, reason: 'Already at minimum' };
    }

    // Hauptkriterium: 5 konsekutiv korrekte Aufgaben
    if (overallPerformance.consecutiveCorrect >= 5) {
      return {
        shouldReduce: true,
        reason: `🎯 ${overallPerformance.consecutiveCorrect} korrekt hintereinander - Darstellung wird reduziert!`,
        suggestedStage: Math.min(progression.stage + 1, 10)
      };
    }

    // Alternatives Kriterium: Sehr hohe Erfolgsrate (8/10 korrekt)
    if (overallPerformance.successRateLast10 >= 0.8 && overallPerformance.consecutiveCorrect >= 3) {
      return {
        shouldReduce: true,
        reason: `✨ Sehr gute Leistung (${Math.round(overallPerformance.successRateLast10 * 100)}%) - weniger Hilfen`,
        suggestedStage: Math.min(progression.stage + 1, 10)
      };
    }

    return { shouldReduce: false, reason: 'Noch nicht bereit' };
  }

  /**
   * Evaluate if representations should be increased (decrease difficulty)
   * UPDATED: Schnellere Regression bei Schwierigkeiten
   */
  shouldIncreaseRepresentations(
    mastery: Record<RepresentationType, RepresentationMastery>,
    progression: RepresentationProgression,
    overallPerformance: { consecutiveErrors: number; successRateLast10: number }
  ): {
    shouldIncrease: boolean;
    reason: string;
    suggestedStage?: number;
  } {
    if (progression.activeCount >= 5) {
      return { shouldIncrease: false, reason: 'Already at maximum' };
    }

    // Hauptkriterium: 3 konsekutive Fehler
    if (overallPerformance.consecutiveErrors >= 3) {
      return {
        shouldIncrease: true,
        reason: `⚠️ ${overallPerformance.consecutiveErrors} Fehler hintereinander - mehr Hilfen aktiviert`,
        suggestedStage: Math.max(progression.stage - 1, 1)
      };
    }

    // Alternatives Kriterium: Niedrige Erfolgsrate (< 50%)
    if (overallPerformance.successRateLast10 < 0.5) {
      return {
        shouldIncrease: true,
        reason: `💡 Niedrige Erfolgsrate (${Math.round(overallPerformance.successRateLast10 * 100)}%) - mehr Unterstützung`,
        suggestedStage: Math.max(progression.stage - 1, 1)
      };
    }

    return { shouldIncrease: false, reason: 'Aktuelles Niveau passt' };
  }

  /**
   * Apply a new representation stage configuration
   */
  applyRepresentationStage(
    currentStage: number,
    newStage: number,
    reason: string
  ): {
    config: RepresentationConfig;
    progression: RepresentationProgression;
    message: string;
  } {
    const stageConfig = REPRESENTATION_STAGES[newStage - 1];
    
    const config: RepresentationConfig = {
      twentyFrame: stageConfig.active.includes('twentyFrame'),
      numberLine: stageConfig.active.includes('numberLine'),
      counters: stageConfig.active.includes('counters'),
      fingers: stageConfig.active.includes('fingers'),
      symbolic: stageConfig.active.includes('symbolic')
    };

    const removedReps = ALL_REPRESENTATIONS.filter(rep => {
      const wasActive = newStage > currentStage ? true : config[rep];
      const isActive = config[rep];
      return wasActive && !isActive;
    });

    const progression: RepresentationProgression = {
      stage: newStage,
      activeCount: stageConfig.activeCount,
      lastReduction: new Date().toISOString(),
      reductionHistory: removedReps.map(rep => ({
        timestamp: new Date().toISOString(),
        removedRep: rep,
        remainingReps: stageConfig.active,
        reason
      }))
    };

    const message = newStage > currentStage
      ? `🎯 Weniger Hilfen! ${stageConfig.description}`
      : `💡 Mehr Hilfen! ${stageConfig.description}`;

    return { config, progression, message };
  }

  /**
   * Check if early challenge path is unlocked
   */
  canUnlockEarlyChallenge(
    overallPerformance: { consecutiveCorrect: number; successRateLast10: number }
  ): {
    canUnlock: boolean;
    challengePath?: typeof EARLY_CHALLENGE_STAGES[0];
  } {
    for (const challenge of EARLY_CHALLENGE_STAGES) {
      if (
        overallPerformance.consecutiveCorrect >= challenge.minCorrectStreak &&
        overallPerformance.successRateLast10 >= challenge.minSuccessRate
      ) {
        return { canUnlock: true, challengePath: challenge };
      }
    }
    return { canUnlock: false };
  }

  /**
   * Get count of active representations
   */
  getActiveCount(config: RepresentationConfig): number {
    return Object.values(config).filter(Boolean).length;
  }

  /**
   * Get list of active representation names
   */
  getActiveList(config: RepresentationConfig): RepresentationType[] {
    return ALL_REPRESENTATIONS.filter(rep => config[rep]);
  }

  // ===== SINGLE REPRESENTATION MASTERY METHODS =====

  /**
   * Get single representation mastery data
   * This tracks mastery ONLY when a representation is shown alone (with symbolic)
   */
  getSingleRepresentationMastery(progression: LearningProgression): Record<RepresentationType, SingleRepresentationMastery> {
    const singleMastery = (progression as any).singleRepresentationMastery;
    if (!singleMastery) {
      const defaultSingleMastery: SingleRepresentationMastery = {
        mastery: 0,
        soloTestsAttempted: 0,
        soloTestsCorrect: 0,
        consecutiveCorrectSolo: 0,
        lastTestedAlone: null,
        firstTestedAlone: null,
        needsMoreTesting: true
      };
      
      // Symbolic doesn't need solo testing (always shown)
      const symbolicMastery: SingleRepresentationMastery = {
        ...defaultSingleMastery,
        needsMoreTesting: false,
        mastery: 100 // Symbolic is always available
      };

      return {
        twentyFrame: { ...defaultSingleMastery },
        numberLine: { ...defaultSingleMastery },
        counters: { ...defaultSingleMastery },
        fingers: { ...defaultSingleMastery },
        symbolic: symbolicMastery
      };
    }
    return singleMastery as Record<RepresentationType, SingleRepresentationMastery>;
  }

  /**
   * Update single representation mastery after a SOLO test
   * ONLY call this when exactly ONE non-symbolic representation is shown
   */
  updateSingleRepresentationMastery(
    currentSingleMastery: Record<RepresentationType, SingleRepresentationMastery>,
    testedRepresentation: RepresentationType,
    isCorrect: boolean
  ): Record<RepresentationType, SingleRepresentationMastery> {
    if (testedRepresentation === 'symbolic') {
      return currentSingleMastery; // Symbolic is always shown, no solo test
    }

    const updated = { ...currentSingleMastery };
    const repMastery = { ...updated[testedRepresentation] };

    repMastery.soloTestsAttempted++;
    if (isCorrect) {
      repMastery.soloTestsCorrect++;
      repMastery.consecutiveCorrectSolo++;
    } else {
      repMastery.consecutiveCorrectSolo = 0;
    }

    // Update timestamps
    const now = new Date().toISOString();
    if (!repMastery.firstTestedAlone) {
      repMastery.firstTestedAlone = now;
    }
    repMastery.lastTestedAlone = now;

    // Calculate mastery percentage (0-100)
    if (repMastery.soloTestsAttempted > 0) {
      repMastery.mastery = Math.round(
        (repMastery.soloTestsCorrect / repMastery.soloTestsAttempted) * 100
      );
    }

    // Needs more testing if:
    // - Less than 5 solo tests attempted, OR
    // - Success rate < 80% and less than 10 tests
    repMastery.needsMoreTesting = 
      repMastery.soloTestsAttempted < 5 ||
      (repMastery.mastery < 80 && repMastery.soloTestsAttempted < 10);

    updated[testedRepresentation] = repMastery;
    return updated;
  }

  /**
   * Determine which representation should be tested next
   * Returns null if no solo testing needed right now
   */
  getNextRepresentationToTest(
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>,
    totalTasksSolved: number
  ): SingleRepTestingSchedule | null {
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];
    const candidates: SingleRepTestingSchedule[] = [];

    for (const rep of testableReps) {
      const mastery = singleMastery[rep];
      
      // Priority calculation
      let priority = 0;
      let reason = '';

      // HIGHEST PRIORITY: Never tested alone
      if (mastery.soloTestsAttempted === 0) {
        priority = 10;
        reason = `Noch nie allein getestet - Initiale Baseline nötig`;
      }
      // HIGH PRIORITY: Tested but needs more data
      else if (mastery.needsMoreTesting && mastery.soloTestsAttempted < 5) {
        priority = 8;
        reason = `Nur ${mastery.soloTestsAttempted} Solo-Tests - mehr Daten nötig`;
      }
      // MEDIUM PRIORITY: Low mastery needs improvement
      else if (mastery.mastery < 70 && mastery.soloTestsAttempted < 10) {
        priority = 6;
        reason = `Niedrige Meisterung (${mastery.mastery}%) - Übung nötig`;
      }
      // LOW PRIORITY: Re-test after long time
      else if (mastery.lastTestedAlone) {
        const daysSinceTest = (Date.now() - new Date(mastery.lastTestedAlone).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceTest > 7 && mastery.mastery < 90) {
          priority = 4;
          reason = `Letzter Test vor ${Math.round(daysSinceTest)} Tagen - Auffrischung`;
        }
      }
      // PERIODIC: Good mastery but occasional re-test
      else if (mastery.mastery >= 80 && mastery.soloTestsAttempted >= 5) {
        if (totalTasksSolved % 20 === 0) { // Every 20 tasks
          priority = 2;
          reason = `Periodischer Re-Test (Mastery: ${mastery.mastery}%)`;
        }
      }

      if (priority > 0) {
        candidates.push({
          representation: rep,
          priority,
          recommendedTaskNumber: totalTasksSolved + 1,
          reason
        });
      }
    }

    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);
    
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Create a progressive testing schedule for early introduction
   * This ensures all representations are tested individually EARLY
   */
  createEarlyTestingSchedule(): SingleRepTestingSchedule[] {
    const schedule: SingleRepTestingSchedule[] = [];
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];

    // Test each representation early but spread out
    // Task 3, 6, 9, 12 for initial baseline
    testableReps.forEach((rep, index) => {
      schedule.push({
        representation: rep,
        priority: 10 - index,
        recommendedTaskNumber: 3 + (index * 3), // 3, 6, 9, 12
        reason: `Früher Baseline-Test für ${rep}`
      });
    });

    // Second round of tests (for confirmation)
    // Task 20, 24, 28, 32
    testableReps.forEach((rep, index) => {
      schedule.push({
        representation: rep,
        priority: 6,
        recommendedTaskNumber: 20 + (index * 4), // 20, 24, 28, 32
        reason: `Zweiter Test zur Bestätigung`
      });
    });

    return schedule;
  }

  /**
   * Decide if we should inject a single-rep test NOW
   * Based on current task number and testing needs
   */
  shouldInjectSingleRepTest(
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>,
    totalTasksSolved: number,
    recentTasksWereMultiRep: boolean
  ): {
    shouldInject: boolean;
    representation?: RepresentationType;
    reason?: string;
  } {
    // Get next representation to test
    const nextTest = this.getNextRepresentationToTest(singleMastery, totalTasksSolved);
    
    if (!nextTest) {
      return { shouldInject: false };
    }

    // ALWAYS inject if priority is very high (never tested)
    if (nextTest.priority >= 10) {
      return {
        shouldInject: true,
        representation: nextTest.representation,
        reason: nextTest.reason
      };
    }

    // Inject early tests at specific intervals (tasks 3, 6, 9, 12...)
    const earlyTestTasks = [3, 6, 9, 12, 15, 18];
    if (earlyTestTasks.includes(totalTasksSolved + 1) && nextTest.priority >= 8) {
      return {
        shouldInject: true,
        representation: nextTest.representation,
        reason: `Früher Test bei Aufgabe ${totalTasksSolved + 1}`
      };
    }

    // Inject after several multi-rep tasks (balance)
    if (recentTasksWereMultiRep && nextTest.priority >= 6) {
      return {
        shouldInject: true,
        representation: nextTest.representation,
        reason: 'Balance nach mehreren Multi-Rep Aufgaben'
      };
    }

    // Don't inject
    return { shouldInject: false };
  }

  /**
   * Check if all representations have been tested alone at least once
   */
  allRepresentationsBaselineTested(
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>
  ): boolean {
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];
    return testableReps.every(rep => singleMastery[rep].soloTestsAttempted > 0);
  }

  /**
   * Get mastery summary for all representations
   */
  getSingleMasterySummary(
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>
  ): {
    representation: RepresentationType;
    mastery: number;
    status: 'untested' | 'learning' | 'proficient' | 'mastered';
  }[] {
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];
    
    return testableReps.map(rep => {
      const m = singleMastery[rep];
      let status: 'untested' | 'learning' | 'proficient' | 'mastered';
      
      if (m.soloTestsAttempted === 0) {
        status = 'untested';
      } else if (m.mastery < 70) {
        status = 'learning';
      } else if (m.mastery < 90) {
        status = 'proficient';
      } else {
        status = 'mastered';
      }

      return {
        representation: rep,
        mastery: m.mastery,
        status
      };
    });
  }
}

export const representationEngine = new RepresentationEngine();
