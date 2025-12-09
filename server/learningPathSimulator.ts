import { competencyBasedGenerator, COMPETENCY_DEFINITIONS, type CompetencyType } from "./competencyBasedGenerator";
import type { LearningProgression, InsertTask } from "@shared/schema";

/**
 * Learning Path Simulator
 * 
 * Simuliert einen "Null-Fehler-Weg" durch das kompetenzbasierte System
 * und zeigt welche Aufgaben in welcher Reihenfolge präsentiert werden.
 */

export interface SimulatedTask {
  taskNumber: number;
  task: Omit<InsertTask, "sessionId">;
  taskString: string;
  competencies: CompetencyType[];
  difficulty: string;
  masteryStatus: {
    attempts: number;
    correct: number;
    mastered: boolean;
  };
}

export interface LearningMilestone {
  taskNumber: number;
  competency: CompetencyType;
  competencyName: string;
  description: string;
}

export interface SimulationResult {
  tasks: SimulatedTask[];
  milestones: LearningMilestone[];
  competencyProgress: Record<CompetencyType, {
    firstSeen: number;
    mastered: number | null;
    totalAttempts: number;
    successRate: number;
  }>;
  summary: {
    totalTasks: number;
    competenciesMastered: number;
    averageAttemptsToMastery: number;
  };
}

export class LearningPathSimulator {

  /**
   * Simuliert einen perfekten Lernweg (alle Aufgaben korrekt)
   * 
   * WICHTIG: Verwendet RANDOM Task-Generierung, daher ist jeder Run unterschiedlich!
   * Für konsistente Progression über mehrere Task-Zahlen hinweg, verwende
   * simulatePerfectPathWithCheckpoints() stattdessen.
   */
  simulatePerfectPath(numTasks: number = 100): SimulationResult {
    const tasks: SimulatedTask[] = [];
    const milestones: LearningMilestone[] = [];
    const competencyProgress: Record<CompetencyType, any> = {} as Record<CompetencyType, any>;

    // Initial progression state (partial - only what we need for simulation)
    const progression = {
      id: "simulator-student",
      userId: "simulator",
      currentStage: 1,
      currentStreak: 0,
      totalTasksSolved: 0,
      stageHistory: [],
      milestones: [],
      knowledgeGaps: [],

      // Competency tracking
      taskMastery: {},
      competencyProgress: {},

      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<LearningProgression> & { 
      taskMastery: any; 
      competencyProgress: any; 
      totalTasksSolved: number;
      currentStreak: number;
    };

    // Simulate tasks
    for (let i = 1; i <= numTasks; i++) {
      // Generate mixed tasks based on current progression
      const generatedTasks = competencyBasedGenerator.generateMixedTasks(progression as any, 1);

      if (generatedTasks.length === 0) {
        console.warn(`Warning: No tasks could be generated at task ${i}/${numTasks}. Stopping simulation early.`);
        console.warn(`Completed ${i - 1} tasks successfully.`);
        break; // Exit loop instead of continuing endlessly
      }

      const task = generatedTasks[0];
      const taskString = this.getTaskString(task);
      const competencies = this.identifyCompetencies(task);

      // Update task mastery (simulate correct answer)
      const taskMastery = (progression.taskMastery as any) || {};
      if (!taskMastery[taskString]) {
        taskMastery[taskString] = {
          attempts: 0,
          correct: 0,
          lastAttempt: new Date(),
          mastered: false
        };
      }

      taskMastery[taskString].attempts++;
      taskMastery[taskString].correct++;
      taskMastery[taskString].lastAttempt = new Date();

      // Mark as mastered after 3 correct
      if (taskMastery[taskString].correct >= 3) {
        taskMastery[taskString].mastered = true;
      }

      progression.taskMastery = taskMastery;

      // Update competency progress
      const compProgress = (progression.competencyProgress as any) || {};

      for (const comp of competencies) {
        if (!compProgress[comp]) {
          compProgress[comp] = {
            level: COMPETENCY_DEFINITIONS.find(c => c.id === comp)?.minLevel || 0,
            attempted: 0,
            correct: 0,
            successRate: 0,
            lastPracticed: new Date(),
            tasksMastered: [],
            recentErrors: []
          };

          // Track first appearance
          if (!competencyProgress[comp]) {
            competencyProgress[comp] = {
              firstSeen: i,
              mastered: null,
              totalAttempts: 0,
              successRate: 1.0
            };
          }
        }

        compProgress[comp].attempted++;
        compProgress[comp].correct++;
        compProgress[comp].successRate = compProgress[comp].correct / compProgress[comp].attempted;
        compProgress[comp].lastPracticed = new Date();

        // Add to mastered tasks if task is mastered
        if (taskMastery[taskString].mastered && 
            !compProgress[comp].tasksMastered.includes(taskString)) {
          compProgress[comp].tasksMastered.push(taskString);
        }
        
        // DYNAMISCHES LEVEL-UPDATE basierend auf Fortschritt
        // AGGRESSIV: Schneller Level-Anstieg für schnellere Progression
        const tasksMasteredCount = compProgress[comp].tasksMastered.length;
        const correctCount = compProgress[comp].correct;
        const successRate = compProgress[comp].successRate;
        
        // NEUE AGGRESSIVERE Level-Berechnung (0-7) für schnellere Progression
        // Ziel: Overall-Level steigt schneller → Mehr neue Kompetenzen werden aktiviert
        if (tasksMasteredCount >= 5 || (correctCount >= 10 && successRate >= 0.80)) {
          compProgress[comp].level = 7.0; // MAX! (war 5.0)
        } else if (tasksMasteredCount >= 4 || (correctCount >= 8 && successRate >= 0.75)) {
          compProgress[comp].level = 6.0; // (war 4.0)
        } else if (tasksMasteredCount >= 3 || (correctCount >= 6 && successRate >= 0.70)) {
          compProgress[comp].level = 5.0; // (war 3.0)
        } else if (tasksMasteredCount >= 2 || (correctCount >= 4 && successRate >= 0.65)) {
          compProgress[comp].level = 4.0; // (war 2.0)
        } else if (tasksMasteredCount >= 1 || (correctCount >= 2 && successRate >= 0.60)) {
          compProgress[comp].level = 3.0; // (war 1.0)
        } else if (correctCount >= 1) {
          compProgress[comp].level = 2.0; // Schon nach 1 korrekter Level 2
        } else {
          compProgress[comp].level = 1.0; // Start bei 1 (war 0.5)
        }

        // Update progress tracking
        const progData = competencyProgress[comp];
        progData.totalAttempts++;
        progData.successRate = successRate;

        // Check for mastery milestone - Level >= 7.0 bedeutet gemeistert!
        const currentLevel = compProgress[comp].level;
        const isMastered = currentLevel >= 7.0;

        if (isMastered && progData.mastered === null) {
          progData.mastered = i;

          const compDef = COMPETENCY_DEFINITIONS.find(c => c.id === comp);
          const reason = tasksMasteredCount >= 5
            ? `${tasksMasteredCount} Aufgaben beherrscht`
            : `Level ${currentLevel.toFixed(1)} erreicht bei ${(successRate * 100).toFixed(0)}% Erfolgsrate`;

          milestones.push({
            taskNumber: i,
            competency: comp,
            competencyName: compDef?.name || comp,
            description: `${compDef?.name} gemeistert! (${reason})`
          });
        }
      }

      progression.competencyProgress = compProgress;
      progression.totalTasksSolved++;
      progression.currentStreak++;

      // Store simulated task
      tasks.push({
        taskNumber: i,
        task,
        taskString,
        competencies,
        difficulty: this.estimateDifficulty(task),
        masteryStatus: {
          attempts: taskMastery[taskString].attempts,
          correct: taskMastery[taskString].correct,
          mastered: taskMastery[taskString].mastered
        }
      });
    }

    // Calculate summary
    const competenciesMastered = Object.values(competencyProgress)
      .filter(c => c.mastered !== null).length;

    const masteryTimes = Object.values(competencyProgress)
      .filter(c => c.mastered !== null)
      .map(c => c.mastered! - c.firstSeen);

    const averageAttemptsToMastery = masteryTimes.length > 0
      ? masteryTimes.reduce((a, b) => a + b, 0) / masteryTimes.length
      : 0;

    return {
      tasks,
      milestones,
      competencyProgress,
      summary: {
        totalTasks: numTasks,
        competenciesMastered,
        averageAttemptsToMastery
      }
    };
  }

  /**
   * Erstellt einen lesbaren Report
   */
  generateReport(result: SimulationResult): string {
    let report = "=== LERNPFAD-SIMULATION: NULL-FEHLER-WEG ===\n\n";

    // Summary
    report += "📊 ZUSAMMENFASSUNG\n";
    report += `Gesamtanzahl Aufgaben: ${result.summary.totalTasks}\n`;
    report += `Kompetenzen gemeistert: ${result.summary.competenciesMastered}\n`;
    report += `Durchschnitt bis Mastery: ${result.summary.averageAttemptsToMastery.toFixed(1)} Aufgaben\n\n`;

    // Milestones
    report += "🎯 MEILENSTEINE\n";
    for (const milestone of result.milestones) {
      report += `Aufgabe ${milestone.taskNumber}: ${milestone.competencyName}\n`;
      report += `  → ${milestone.description}\n`;
    }
    report += "\n";

    // Task List (first 100)
    report += "📝 AUFGABENLISTE (Erste 100)\n\n";

    for (const simTask of result.tasks) {
      const masteryIndicator = simTask.masteryStatus.mastered ? "✓" : 
                              simTask.masteryStatus.correct >= 2 ? "◐" : "○";

      report += `${simTask.taskNumber.toString().padStart(3)}. ${masteryIndicator} ${simTask.taskString.padEnd(15)} `;
      report += `[${simTask.difficulty}] `;
      report += `{${simTask.competencies.slice(0, 2).join(", ")}}`;

      // Show mastery status
      if (simTask.masteryStatus.mastered) {
        report += ` [MASTERED]`;
      } else if (simTask.masteryStatus.correct >= 2) {
        report += ` [${simTask.masteryStatus.correct}/3]`;
      }

      report += "\n";
    }

    report += "\n";

    // Competency Timeline
    report += "🌟 KOMPETENZ-ENTWICKLUNG\n\n";

    const sortedCompetencies = Object.entries(result.competencyProgress)
      .sort((a, b) => a[1].firstSeen - b[1].firstSeen);

    for (const [comp, data] of sortedCompetencies) {
      const compDef = COMPETENCY_DEFINITIONS.find(c => c.id === comp);
      const masteryText = data.mastered 
        ? `✓ Gemeistert bei Aufgabe ${data.mastered}` 
        : `○ In Entwicklung (${data.totalAttempts} Versuche)`;

      report += `${compDef?.name || comp}\n`;
      report += `  Erste Aufgabe: ${data.firstSeen}\n`;
      report += `  ${masteryText}\n`;
      report += `  Erfolgsrate: ${(data.successRate * 100).toFixed(0)}%\n\n`;
    }

    return report;
  }

  /**
   * Simuliert einen Lernweg und erfasst dabei Checkpoints
   * 
   * KORRIGIERT: Macht EINEN kontinuierlichen Durchlauf und erfasst Checkpoints LIVE!
   * So wird garantiert dass gemeisterte Kompetenzen NIEMALS abnehmen.
   */
  simulatePerfectPathWithCheckpoints(checkpoints: number[]): Array<{
    numTasks: number;
    competenciesMastered: number;
    milestones: number;
    competencyList: string[];
  }> {
    // Input validation
    if (!checkpoints || checkpoints.length === 0) {
      return [];
    }
    
    // Copy and deduplicate checkpoints to avoid mutating input
    const uniqueCheckpoints = Array.from(new Set(checkpoints.filter(c => c > 0)));
    if (uniqueCheckpoints.length === 0) {
      return [];
    }
    
    const maxTasks = Math.max(...uniqueCheckpoints);
    const sortedCheckpoints = uniqueCheckpoints.sort((a, b) => a - b);
    const results: Array<{
      numTasks: number;
      competenciesMastered: number;
      milestones: number;
      competencyList: string[];
    }> = [];
    
    // Tracking für die gesamte Simulation
    const competencyProgress: Record<CompetencyType, any> = {} as Record<CompetencyType, any>;
    const milestones: LearningMilestone[] = [];
    
    // Initial progression state
    const progression = {
      id: "simulator-student",
      userId: "simulator",
      currentStage: 1,
      currentStreak: 0,
      totalTasksSolved: 0,
      stageHistory: [],
      milestones: [],
      knowledgeGaps: [],
      taskMastery: {},
      competencyProgress: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<LearningProgression> & { 
      taskMastery: any; 
      competencyProgress: any; 
      totalTasksSolved: number;
      currentStreak: number;
    };

    let nextCheckpointIndex = 0;

    // EINE kontinuierliche Simulation von 1 bis maxTasks
    for (let i = 1; i <= maxTasks; i++) {
      // Generate task based on current progression
      const generatedTasks = competencyBasedGenerator.generateMixedTasks(progression as any, 1);
      if (generatedTasks.length === 0) {
        console.warn(`Warning: No tasks could be generated at task ${i}/${maxTasks}. Stopping checkpoint simulation.`);
        console.warn(`Completed ${i - 1} tasks. All competencies may be mastered.`);
        break; // Exit loop instead of continuing endlessly
      }

      const task = generatedTasks[0];
      const taskString = this.getTaskString(task);
      const competencies = this.identifyCompetencies(task);

      // Update task mastery (perfect path - always correct)
      const taskMastery = (progression.taskMastery as any) || {};
      if (!taskMastery[taskString]) {
        taskMastery[taskString] = {
          attempts: 0,
          correct: 0,
          lastAttempt: new Date(),
          mastered: false
        };
      }

      taskMastery[taskString].attempts++;
      taskMastery[taskString].correct++;
      taskMastery[taskString].lastAttempt = new Date();

      // Mark as mastered after 3 correct
      if (taskMastery[taskString].correct >= 3) {
        taskMastery[taskString].mastered = true;
      }

      progression.taskMastery = taskMastery;

      // Update competency progress
      const compProgress = (progression.competencyProgress as any) || {};

      for (const comp of competencies) {
        if (!compProgress[comp]) {
          compProgress[comp] = {
            level: COMPETENCY_DEFINITIONS.find(c => c.id === comp)?.minLevel || 0,
            attempted: 0,
            correct: 0,
            successRate: 0,
            lastPracticed: new Date(),
            tasksMastered: [],
            recentErrors: []
          };

          // Track first appearance
          if (!competencyProgress[comp]) {
            competencyProgress[comp] = {
              firstSeen: i,
              mastered: null,
              totalAttempts: 0,
              successRate: 1.0
            };
          }
        }

        compProgress[comp].attempted++;
        compProgress[comp].correct++;
        compProgress[comp].successRate = compProgress[comp].correct / compProgress[comp].attempted;
        compProgress[comp].lastPracticed = new Date();

        // Add to mastered tasks
        if (taskMastery[taskString].mastered && 
            !compProgress[comp].tasksMastered.includes(taskString)) {
          compProgress[comp].tasksMastered.push(taskString);
        }
        
        // Level update
        const tasksMasteredCount = compProgress[comp].tasksMastered.length;
        const correctCount = compProgress[comp].correct;
        const successRate = compProgress[comp].successRate;
        
        if (tasksMasteredCount >= 5 || (correctCount >= 10 && successRate >= 0.80)) {
          compProgress[comp].level = 7.0;
        } else if (tasksMasteredCount >= 4 || (correctCount >= 8 && successRate >= 0.75)) {
          compProgress[comp].level = 6.0;
        } else if (tasksMasteredCount >= 3 || (correctCount >= 6 && successRate >= 0.70)) {
          compProgress[comp].level = 5.0;
        } else if (tasksMasteredCount >= 2 || (correctCount >= 4 && successRate >= 0.65)) {
          compProgress[comp].level = 4.0;
        } else if (tasksMasteredCount >= 1 || (correctCount >= 2 && successRate >= 0.60)) {
          compProgress[comp].level = 3.0;
        } else if (correctCount >= 1) {
          compProgress[comp].level = 2.0;
        } else {
          compProgress[comp].level = 1.0;
        }

        // Update progress tracking
        const progData = competencyProgress[comp];
        progData.totalAttempts++;
        progData.successRate = successRate;

        // Check for mastery milestone
        const isMastered = (tasksMasteredCount >= 5) || 
                          (correctCount >= 10 && successRate >= 0.80);

        if (isMastered && progData.mastered === null) {
          progData.mastered = i;

          const compDef = COMPETENCY_DEFINITIONS.find(c => c.id === comp);
          const reason = tasksMasteredCount >= 5
            ? `${tasksMasteredCount} Aufgaben beherrscht`
            : `${correctCount} korrekte Versuche bei ${(successRate * 100).toFixed(0)}% Erfolgsrate`;

          milestones.push({
            taskNumber: i,
            competency: comp,
            competencyName: compDef?.name || comp,
            description: `${compDef?.name} gemeistert! (${reason})`
          });
        }
      }

      progression.competencyProgress = compProgress;
      progression.totalTasksSolved++;
      progression.currentStreak++;

      // Erfasse Checkpoint wenn erreicht
      if (nextCheckpointIndex < sortedCheckpoints.length && 
          i === sortedCheckpoints[nextCheckpointIndex]) {
        
        // Zähle AKTUELL gemeisterte Kompetenzen
        const masteredComps = new Set(milestones.map(m => m.competency));
        
        results.push({
          numTasks: i,
          competenciesMastered: masteredComps.size,
          milestones: milestones.length,
          competencyList: Array.from(masteredComps)
        });
        
        nextCheckpointIndex++;
      }
    }
    
    return results;
  }

  private getTaskString(task: Omit<InsertTask, "sessionId">): string {
    const { number1, operation, number2, placeholderPosition } = task;

    switch (placeholderPosition) {
      case "start":
        return `_${operation}${number2}=${task.correctAnswer}`;
      case "middle":
        return `${number1}${operation}_=${task.correctAnswer}`;
      case "end":
      default:
        return `${number1}${operation}${number2}`;
    }
  }

  private identifyCompetencies(task: Omit<InsertTask, "sessionId">): CompetencyType[] {
    const competencies: CompetencyType[] = [];
    const { operation, number1, number2, correctAnswer, placeholderPosition } = task;

    // Determine number range
    const maxNum = Math.max(number1, number2, correctAnswer);
    
    // Prüfe auf reine Zehner/Hunderter ZUERST
    const isPureDecades = (number1 % 10 === 0) && (number2 % 10 === 0) && maxNum <= 100;
    const isPureHundreds = (number1 % 100 === 0) && (number2 % 100 === 0) && maxNum >= 100;
    
    if (isPureDecades) {
      competencies.push(operation === '+' ? "pure_decades_addition" : "pure_decades_subtraction");
    }
    
    if (isPureHundreds) {
      competencies.push(operation === '+' ? "pure_hundreds_addition" : "pure_hundreds_subtraction");
    }

    // Prüfe auf Ergänzungsaufgaben
    const complementTargets = [10, 20, 30, 40, 50, 80, 100, 200, 500, 1000];
    if (operation === '+' && complementTargets.includes(correctAnswer)) {
      if (correctAnswer === 10) competencies.push("addition_to_10");
      else if (correctAnswer === 20) competencies.push("complement_to_20");
      else if (correctAnswer === 30) competencies.push("complement_to_30");
      else if (correctAnswer === 40) competencies.push("complement_to_40");
      else if (correctAnswer === 50) competencies.push("complement_to_50");
      else if (correctAnswer === 80) competencies.push("complement_to_80");
      else if (correctAnswer === 100) competencies.push("complement_to_100");
      else if (correctAnswer === 200) competencies.push("complement_to_200");
      else if (correctAnswer === 500) competencies.push("complement_to_500");
      else if (correctAnswer === 1000) competencies.push("complement_to_1000");
    }
    
    if (operation === '-' && number1 === 10) {
      competencies.push("subtraction_from_10");
    }

    // Check for decade/hundred transition
    const hasDecadeTransition = operation === '+' 
      ? Math.floor(number1 / 10) !== Math.floor(correctAnswer / 10)
      : Math.floor(number1 / 10) !== Math.floor((number1 - number2) / 10);
      
    const hasHundredTransition = operation === '+'
      ? Math.floor(number1 / 100) !== Math.floor(correctAnswer / 100)
      : Math.floor(number1 / 100) !== Math.floor((number1 - number2) / 100);

    // Bestimme Zahlenraum und füge entsprechende Kompetenzen hinzu
    if (maxNum <= 10) {
      if (operation === '+' && !hasDecadeTransition && !competencies.includes("addition_to_10")) {
        competencies.push("addition_ZR10_no_transition");
      }
      if (operation === '-' && !hasDecadeTransition && !competencies.includes("subtraction_from_10")) {
        competencies.push("subtraction_ZR10_no_transition");
      }
    } else if (maxNum <= 20) {
      if (operation === '+') {
        if (hasDecadeTransition) {
          competencies.push("addition_with_transition");
        } else if (!competencies.includes("complement_to_20")) {
          competencies.push("addition_ZR20_no_transition");
        }
      }
      if (operation === '-') {
        if (hasDecadeTransition) {
          competencies.push("subtraction_with_transition");
        } else {
          competencies.push("subtraction_ZR20_no_transition");
        }
      }
    } else if (maxNum <= 30) {
      if (operation === '+' && !hasDecadeTransition && !competencies.includes("complement_to_30")) {
        competencies.push("addition_ZR30_no_transition");
      }
      if (operation === '-' && !hasDecadeTransition) {
        competencies.push("subtraction_ZR30_no_transition");
      }
    } else if (maxNum <= 40) {
      if (operation === '+' && !hasDecadeTransition && !competencies.includes("complement_to_40")) {
        competencies.push("addition_ZR40_no_transition");
      }
      if (operation === '-' && !hasDecadeTransition) {
        competencies.push("subtraction_ZR40_no_transition");
      }
    } else if (maxNum <= 50) {
      if (operation === '+' && !hasDecadeTransition && !competencies.includes("complement_to_50")) {
        competencies.push("addition_ZR50_no_transition");
      }
      if (operation === '-' && !hasDecadeTransition) {
        competencies.push("subtraction_ZR50_no_transition");
      }
    } else if (maxNum <= 80) {
      if (operation === '+' && !hasDecadeTransition && !competencies.includes("complement_to_80")) {
        competencies.push("addition_ZR80_no_transition");
      }
      if (operation === '-' && !hasDecadeTransition) {
        competencies.push("subtraction_ZR80_no_transition");
      }
    } else if (maxNum <= 100) {
      if (operation === '+') {
        if (hasDecadeTransition || hasHundredTransition) {
          competencies.push("addition_ZR100_with_transition");
        } else if (!competencies.includes("complement_to_100") && !isPureDecades) {
          competencies.push("addition_ZR100_no_transition");
        }
      }
      if (operation === '-') {
        if (hasDecadeTransition || hasHundredTransition) {
          competencies.push("subtraction_ZR100_with_transition");
        } else if (!isPureDecades) {
          competencies.push("subtraction_ZR100_no_transition");
        }
      }
    } else if (maxNum <= 200) {
      if (operation === '+') {
        if (hasHundredTransition) {
          competencies.push("addition_ZR200_no_transition");
        } else if (!competencies.includes("complement_to_200") && !isPureHundreds) {
          competencies.push("addition_ZR200_no_transition");
        }
      }
      if (operation === '-' && !isPureHundreds) {
        competencies.push("subtraction_ZR200_no_transition");
      }
    } else if (maxNum <= 500) {
      if (operation === '+' && !competencies.includes("complement_to_500") && !isPureHundreds) {
        competencies.push("addition_ZR500_no_transition");
      }
      if (operation === '-' && !isPureHundreds) {
        competencies.push("subtraction_ZR500_no_transition");
      }
    } else if (maxNum <= 1000) {
      if (operation === '+') {
        if (hasHundredTransition) {
          competencies.push("addition_ZR1000_with_transition");
        } else if (!competencies.includes("complement_to_1000") && !isPureHundreds) {
          competencies.push("addition_ZR1000_no_transition");
        }
      }
      if (operation === '-') {
        if (hasHundredTransition) {
          competencies.push("subtraction_ZR1000_with_transition");
        } else if (!isPureHundreds) {
          competencies.push("subtraction_ZR1000_no_transition");
        }
      }
    }

    // Placeholder competencies
    if (placeholderPosition === "end") {
      competencies.push("placeholder_end");
    } else if (placeholderPosition === "middle") {
      competencies.push("placeholder_middle");
    } else if (placeholderPosition === "start") {
      competencies.push("placeholder_start");
    }

    // Strategy competencies
    if (number1 === number2) {
      competencies.push("doubles");
    }
    if (Math.abs(number1 - number2) === 1 && maxNum <= 20) {
      competencies.push("near_doubles");
    }
    
    // Partnerzahlen der 10
    if (operation === '+' && number1 + number2 === 10 && number1 <= 10 && number2 <= 10) {
      competencies.push("number_bonds_10");
    }

    return competencies.length > 0 ? competencies : ["addition_ZR10_no_transition"];
  }

  private estimateDifficulty(task: Omit<InsertTask, "sessionId">): string {
    const maxNum = Math.max(task.number1, task.number2, task.correctAnswer);

    if (maxNum <= 5) return "Sehr leicht";
    if (maxNum <= 10) return "Leicht";
    if (maxNum <= 15) return "Mittel";
    if (maxNum <= 20) return "Schwer";
    return "Sehr schwer";
  }

  /**
   * Zähle Werteziffern (nicht nur Ziffern!)
   * 70+30 = 2 Werteziffern, 77+35 = 4 Werteziffern
   */
  private countValueDigits(num1: number, num2: number): number {
    let count = 0;

    for (const num of [num1, num2]) {
      const str = num.toString();
      for (const char of str) {
        if (char !== '0') {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Prüfe ob Zehnerübergang vorliegt
   */
  private hasDecadeTransition(num1: number, num2: number, operation: '+' | '-'): boolean {
    const correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;

    if (operation === '+') {
      return Math.floor(num1 / 10) !== Math.floor(correctAnswer / 10);
    } else { // operation === '-'
      return Math.floor(num1 / 10) !== Math.floor(correctAnswer / 10);
    }
  }
}

export const learningPathSimulator = new LearningPathSimulator();