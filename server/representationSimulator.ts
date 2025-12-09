import type { LearningProgression } from "@shared/schema";
import { 
  representationEngine, 
  type RepresentationType, 
  type SingleRepresentationMastery,
  type RepresentationConfig
} from "./representationSystem";
import { representationBasedGenerator, type TaskWithRepresentation } from "./representationBasedGenerator";
import { representationProgressionEngine } from "./representationProgressionEngine";

/**
 * REPRESENTATION LEARNING PATH SIMULATOR
 * 
 * Simuliert einen perfekten Lernweg durch das Repräsentations-System
 * mit Fokus auf:
 * - Frühe Single-Rep Tests (ab Aufgabe 3)
 * - Systematische Mastery-Entwicklung
 * - Progressive Reduktion von Darstellungen
 */

export interface RepresentationSimulatedTask {
  taskNumber: number;
  task: TaskWithRepresentation;
  taskString: string;
  isSingleRepTest: boolean;
  testedRepresentation?: RepresentationType;
  activeRepresentations: RepresentationType[];
  masterySnapshot: {
    [key in RepresentationType]?: {
      soloMastery: number;
      soloTests: number;
    };
  };
}

export interface RepresentationMilestone {
  taskNumber: number;
  type: 'baseline_complete' | 'rep_mastered' | 'stage_reduced';
  representation?: RepresentationType;
  description: string;
}

export interface RepresentationSimulationResult {
  tasks: RepresentationSimulatedTask[];
  milestones: RepresentationMilestone[];
  finalMastery: Record<RepresentationType, SingleRepresentationMastery>;
  summary: {
    totalTasks: number;
    singleRepTests: number;
    multiRepTasks: number;
    representationsMastered: number;
    finalStage: number;
    baselineTestingCompleted: boolean;
  };
}

export class RepresentationSimulator {

  /**
   * Simuliert einen perfekten Lernweg (alle Aufgaben korrekt)
   * durch das Repräsentationssystem
   */
  simulatePerfectPath(numTasks: number = 100): RepresentationSimulationResult {
    const tasks: RepresentationSimulatedTask[] = [];
    const milestones: RepresentationMilestone[] = [];

    // Initialize progression
    const progression = this.createInitialProgression();

    // Initialize single rep mastery
    let singleMastery = representationEngine.getSingleRepresentationMastery(progression as LearningProgression);
    let recentTaskHistory: Array<{ isSingleRepTest: boolean }> = [];

    // Simulate each task
    for (let i = 1; i <= numTasks; i++) {
      // Generate context
      const context = {
        progression: progression as LearningProgression,
        numberRange: 20,
        currentStage: (progression as any).representationProgression?.stage || 1,
        representationConfig: representationEngine.getActiveRepresentations(progression as LearningProgression),
        activeRepCount: representationEngine.getActiveCount(
          representationEngine.getActiveRepresentations(progression as LearningProgression)
        )
      };

      // Decide: single-rep test or multi-rep task?
      const recentMultiRep = recentTaskHistory.slice(-5).filter(t => !t.isSingleRepTest).length;
      const taskGeneration = representationBasedGenerator.generateAdaptiveTask(
        context,
        singleMastery,
        recentMultiRep >= 3
      );

      const { task, isSingleRepTest, testedRepresentation } = taskGeneration;

      // Create task string
      const taskString = this.getTaskString(task);

      // Get active representations
      const activeReps = representationEngine.getActiveList(task.representationConfig);

      // Create mastery snapshot
      const masterySnapshot = this.createMasterySnapshot(singleMastery);

      // Store simulated task
      tasks.push({
        taskNumber: i,
        task,
        taskString,
        isSingleRepTest,
        testedRepresentation,
        activeRepresentations: activeReps,
        masterySnapshot
      });

      // Update mastery (simulate correct answer)
      if (isSingleRepTest && testedRepresentation) {
        singleMastery = representationEngine.updateSingleRepresentationMastery(
          singleMastery,
          testedRepresentation,
          true // Always correct in perfect path
        );

        // Check for mastery milestone
        const repMastery = singleMastery[testedRepresentation];
        if (repMastery.mastery >= 80 && repMastery.soloTestsAttempted === 5) {
          // First time reaching 80%+
          milestones.push({
            taskNumber: i,
            type: 'rep_mastered',
            representation: testedRepresentation,
            description: `${testedRepresentation} gemeistert! (${repMastery.mastery}% nach ${repMastery.soloTestsAttempted} Solo-Tests)`
          });
        }
      }

      // Check if baseline testing is complete
      if (i === 12) {
        const allTested = representationEngine.allRepresentationsBaselineTested(singleMastery);
        if (allTested) {
          milestones.push({
            taskNumber: i,
            type: 'baseline_complete',
            description: 'Alle Darstellungen wurden einzeln getestet (Baseline komplett)'
          });
        }
      }

      // Update recent task history
      recentTaskHistory.push({ isSingleRepTest });
      if (recentTaskHistory.length > 10) {
        recentTaskHistory.shift();
      }

      // Update progression counters
      progression.totalTasksSolved = i;
      progression.currentStreak = (progression.currentStreak || 0) + 1;
      progression.totalCorrect = (progression.totalCorrect || 0) + 1;

      // Store single mastery in progression
      (progression as any).singleRepresentationMastery = singleMastery;
    }

    // Calculate summary
    const singleRepTests = tasks.filter(t => t.isSingleRepTest).length;
    const multiRepTasks = tasks.filter(t => !t.isSingleRepTest).length;
    
    const representationsMastered = Object.values(singleMastery)
      .filter((m, idx) => {
        const rep = ['twentyFrame', 'numberLine', 'counters', 'fingers', 'symbolic'][idx];
        return rep !== 'symbolic' && m.mastery >= 80;
      }).length;

    const finalStage = (progression as any).representationProgression?.stage || 1;
    const baselineTestingCompleted = representationEngine.allRepresentationsBaselineTested(singleMastery);

    return {
      tasks,
      milestones,
      finalMastery: singleMastery,
      summary: {
        totalTasks: numTasks,
        singleRepTests,
        multiRepTasks,
        representationsMastered,
        finalStage,
        baselineTestingCompleted
      }
    };
  }

  /**
   * Generiere einen Report der Simulation
   */
  generateReport(result: RepresentationSimulationResult): string {
    let report = "=== REPRÄSENTATIONS-LERNPFAD SIMULATION ===\n\n";

    // Summary
    report += "📊 ZUSAMMENFASSUNG\n";
    report += `Gesamtanzahl Aufgaben: ${result.summary.totalTasks}\n`;
    report += `Single-Rep Tests: ${result.summary.singleRepTests} (${Math.round(result.summary.singleRepTests / result.summary.totalTasks * 100)}%)\n`;
    report += `Multi-Rep Aufgaben: ${result.summary.multiRepTasks} (${Math.round(result.summary.multiRepTasks / result.summary.totalTasks * 100)}%)\n`;
    report += `Darstellungen gemeistert: ${result.summary.representationsMastered}/4\n`;
    report += `Baseline-Tests abgeschlossen: ${result.summary.baselineTestingCompleted ? 'Ja ✓' : 'Nein ✗'}\n`;
    report += `Finales Stage: ${result.summary.finalStage}/10\n\n`;

    // Milestones
    report += "🎯 MEILENSTEINE\n";
    for (const milestone of result.milestones) {
      report += `Aufgabe ${milestone.taskNumber}: ${milestone.description}\n`;
    }
    report += "\n";

    // Final Mastery
    report += "🌟 FINALE MASTERY (NUR SOLO-TESTS)\n";
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];
    for (const rep of testableReps) {
      const m = result.finalMastery[rep];
      const status = m.mastery >= 90 ? '✓✓✓ Mastered' :
                     m.mastery >= 80 ? '✓✓ Proficient' :
                     m.mastery >= 70 ? '✓ Learning' :
                     m.soloTestsAttempted > 0 ? '○ Beginner' : '✗ Untested';
      
      report += `${rep.padEnd(15)}: ${m.mastery.toString().padStart(3)}% (${m.soloTestsAttempted} Solo-Tests) ${status}\n`;
    }
    report += "\n";

    // Task List (first 50)
    report += "📝 AUFGABENLISTE (Erste 50)\n\n";
    const displayTasks = result.tasks.slice(0, 50);

    for (const simTask of displayTasks) {
      const testMarker = simTask.isSingleRepTest ? `🔍 SOLO [${simTask.testedRepresentation}]` : `🔢 MULTI [${simTask.activeRepresentations.length}]`;
      
      report += `${simTask.taskNumber.toString().padStart(3)}. ${testMarker.padEnd(25)} ${simTask.taskString}\n`;
    }

    report += "\n";

    // Early Testing Pattern Analysis
    report += "🔬 FRÜHE TESTING-PATTERN (Erste 20 Aufgaben)\n";
    const earlyTasks = result.tasks.slice(0, 20);
    for (const task of earlyTasks) {
      if (task.isSingleRepTest) {
        report += `  Aufgabe ${task.taskNumber}: Solo-Test von ${task.testedRepresentation}\n`;
      }
    }

    return report;
  }

  /**
   * Erstelle initiale Progression für Simulation
   */
  private createInitialProgression(): Partial<LearningProgression> {
    const initial = representationProgressionEngine.getInitialConfiguration();
    const singleMastery = representationProgressionEngine.getInitialSingleRepMastery();

    return {
      id: "simulator-student",
      userId: "simulator",
      currentStage: 1,
      currentStreak: 0,
      totalTasksSolved: 0,
      totalCorrect: 0,
      stageHistory: [],
      milestones: [],
      knowledgeGaps: [],
      representationConfig: initial.config as any,
      representationMastery: initial.mastery as any,
      representationProgression: initial.progression as any,
      singleRepresentationMastery: singleMastery as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<LearningProgression>;
  }

  /**
   * Erstelle Task-String für Anzeige
   */
  private getTaskString(task: TaskWithRepresentation): string {
    const { number1, operation, number2, placeholderInSymbolic } = task;

    if (placeholderInSymbolic === 'number1') {
      return `_${operation}${number2}=${task.correctAnswer}`;
    } else if (placeholderInSymbolic === 'operator') {
      return `${number1}?${number2}=${task.correctAnswer}`;
    } else if (placeholderInSymbolic === 'number2') {
      return `${number1}${operation}_=${task.correctAnswer}`;
    } else {
      return `${number1}${operation}${number2}`;
    }
  }

  /**
   * Erstelle Mastery-Snapshot für Task
   */
  private createMasterySnapshot(
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>
  ): RepresentationSimulatedTask['masterySnapshot'] {
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];
    
    const snapshot: RepresentationSimulatedTask['masterySnapshot'] = {};
    
    for (const rep of testableReps) {
      snapshot[rep] = {
        soloMastery: singleMastery[rep].mastery,
        soloTests: singleMastery[rep].soloTestsAttempted
      };
    }

    return snapshot;
  }
}

export const representationSimulator = new RepresentationSimulator();
