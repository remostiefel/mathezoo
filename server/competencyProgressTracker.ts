import type { LearningProgression, Task } from "@shared/schema";
import type { CompetencyType } from "./competencyBasedGenerator";

/**
 * COMPETENCY PROGRESS TRACKER
 * 
 * Aktualisiert Aufgaben-Mastery und Kompetenz-Fortschritt nach jeder Aufgabe
 */

export interface TaskMasteryUpdate {
  attempts: number;
  correct: number;
  lastAttempt: Date;
  mastered: boolean;
}

export interface CompetencyProgressUpdate {
  level: number;
  attempted: number;
  correct: number;
  successRate: number;
  lastPracticed: Date;
  tasksMastered: string[];
  recentErrors: string[];
}

export class CompetencyProgressTracker {

  /**
   * Aktualisiere Progress nach einer gelösten Aufgabe
   */
  updateProgressAfterTask(
    progression: LearningProgression,
    task: Task,
    competencies: CompetencyType[]
  ): Partial<LearningProgression> {
    const taskMastery = { ...((progression.taskMastery as any) || {}) };
    const competencyProgress = { ...((progression.competencyProgress as any) || {}) };

    // 1. Update Task Mastery
    const taskStr = this.getTaskString(task);
    const updatedTaskMastery = this.updateTaskMastery(
      taskMastery[taskStr],
      task.isCorrect || false
    );
    taskMastery[taskStr] = updatedTaskMastery;

    // 2. Update Competency Progress für alle betroffenen Kompetenzen
    for (const competency of competencies) {
      const updatedCompetency = this.updateCompetencyProgress(
        competencyProgress[competency],
        task,
        taskStr,
        updatedTaskMastery.mastered
      );
      competencyProgress[competency] = updatedCompetency;
    }

    return {
      taskMastery: taskMastery as any,
      competencyProgress: competencyProgress as any,
    };
  }

  /**
   * Update Task Mastery für einzelne Aufgabe
   * 
   * FEHLER-KOMPENSATIONS-REGEL:
   * - Richtige Antwort: +1 Punkt
   * - Falsche Antwort: -2 Punkte (doppelte Kompensation erforderlich)
   * - Minimum: 0 Punkte (nicht negativ)
   * - Mastery: 3 Punkte erforderlich
   * 
   * Beispiel-Verlauf:
   * 1. Richtig → 1/3
   * 2. Falsch  → 0/3 (1-2=-1, aber max(0,-1)=0)
   * 3. Richtig → 1/3 (erste Kompensation)
   * 4. Richtig → 2/3 (zweite Kompensation, Fehler überwunden)
   * 5. Richtig → 3/3 ✓ Mastery!
   */
  private updateTaskMastery(
    current: TaskMasteryUpdate | undefined,
    isCorrect: boolean
  ): TaskMasteryUpdate {
    const currentCorrect = current?.correct || 0;
    
    // Berechne neuen Score mit Fehler-Kompensation
    let newCorrect: number;
    if (isCorrect) {
      newCorrect = currentCorrect + 1;
    } else {
      // Fehler: -2 Punkte, aber nie unter 0
      newCorrect = Math.max(0, currentCorrect - 2);
    }

    const updated = {
      attempts: (current?.attempts || 0) + 1,
      correct: newCorrect,
      lastAttempt: new Date(),
      mastered: false,
    };

    // Mastered = 3+ korrekte Punkte
    updated.mastered = updated.correct >= 3;

    return updated;
  }

  /**
   * Update Competency Progress
   */
  private updateCompetencyProgress(
    current: CompetencyProgressUpdate | undefined,
    task: Task,
    taskStr: string,
    taskMastered: boolean
  ): CompetencyProgressUpdate {
    const attempted = (current?.attempted || 0) + 1;
    const correct = (current?.correct || 0) + (task.isCorrect ? 1 : 0);
    const successRate = attempted > 0 ? correct / attempted : 0;

    // Aktualisiere gemasterte Aufgaben - WICHTIG: Duplikate vermeiden!
    const tasksMastered = [...(current?.tasksMastered || [])];
    if (taskMastered && !tasksMastered.includes(taskStr)) {
      tasksMastered.push(taskStr);
    }
    // Entferne Task aus mastered list wenn nicht mehr mastered
    else if (!taskMastered && tasksMastered.includes(taskStr)) {
      const index = tasksMastered.indexOf(taskStr);
      if (index > -1) {
        tasksMastered.splice(index, 1);
      }
    }

    // Aktualisiere Recent Errors (nur letzte 10)
    let recentErrors = [...(current?.recentErrors || [])];
    if (!task.isCorrect) {
      // Füge Fehler nur hinzu wenn noch nicht vorhanden
      if (!recentErrors.includes(taskStr)) {
        recentErrors.unshift(taskStr);
      }
      // Limitiere auf 10 Einträge
      recentErrors = recentErrors.slice(0, 10);
    } else {
      // Entferne erfolgreich gelöste Aufgabe aus Errors
      recentErrors = recentErrors.filter(e => e !== taskStr);
    }

    // Berechne Level basierend auf Success Rate und gemasterten Aufgaben
    const level = this.calculateCompetencyLevel(successRate, tasksMastered.length);

    return {
      level,
      attempted,
      correct,
      successRate,
      lastPracticed: new Date(),
      tasksMastered,
      recentErrors,
    };
  }

  /**
   * Berechne Kompetenz-Level (0-7)
   * AGGRESSIVE Kriterien für schnellen Fortschritt analog zum Generator
   */
  private calculateCompetencyLevel(successRate: number, masteredCount: number): number {
    // WICHTIG: Diese Kriterien müssen mit denen im learningPathSimulator.ts übereinstimmen!
    
    // Level 7.0: Vollständige Meisterschaft
    if (masteredCount >= 5 || (masteredCount >= 3 && successRate >= 0.80)) {
      return 7.0;
    }
    // Level 6.0: Sehr gut
    else if (masteredCount >= 4 || (masteredCount >= 2 && successRate >= 0.75)) {
      return 6.0;
    }
    // Level 5.0: Gut
    else if (masteredCount >= 3 || (masteredCount >= 2 && successRate >= 0.70)) {
      return 5.0;
    }
    // Level 4.0: Solide
    else if (masteredCount >= 2 || (masteredCount >= 1 && successRate >= 0.65)) {
      return 4.0;
    }
    // Level 3.0: Fortgeschritten
    else if (masteredCount >= 1 || successRate >= 0.60) {
      return 3.0;
    }
    // Level 2.0: Grundlagen
    else if (successRate >= 0.50) {
      return 2.0;
    }
    // Level 1.0: Anfänger
    else if (successRate >= 0.30) {
      return 1.0;
    }
    // Level 0.0: Noch keine Kompetenz
    else {
      return 0.0;
    }
  }

  /**
   * Identifiziere Kompetenzen einer Aufgabe
   */
  identifyCompetencies(task: Task): CompetencyType[] {
    const competencies: CompetencyType[] = [];
    const { operation, numberRange, number1, number2, placeholderPosition } = task;

    // Platzhalter-Kompetenzen
    if (placeholderPosition === 'start') {
      competencies.push('placeholder_start');
    } else if (placeholderPosition === 'middle') {
      competencies.push('placeholder_middle');
    } else {
      competencies.push('placeholder_end');
    }

    // Operationen-Kompetenzen
    const result = operation === '+' ? number1 + number2 : number1 - number2;
    const hasTransition = this.hasDecadeTransition(number1, number2, operation);

    if (numberRange <= 10) {
      if (operation === '+') {
        if (result === 10) {
          competencies.push('addition_to_10', 'number_bonds_10');
        } else {
          competencies.push('addition_ZR10_no_transition');
        }
      } else {
        if (number1 === 10) {
          competencies.push('subtraction_from_10', 'number_bonds_10');
        } else {
          competencies.push('subtraction_ZR10_no_transition');
        }
      }
    } else if (numberRange <= 20) {
      if (operation === '+') {
        if (result === 20) {
          competencies.push('complement_to_20');
        } else if (hasTransition) {
          competencies.push('addition_with_transition');
        } else {
          competencies.push('addition_ZR20_no_transition');
        }
      } else {
        if (hasTransition) {
          competencies.push('subtraction_with_transition');
        } else {
          competencies.push('subtraction_ZR20_no_transition');
        }
      }
    } else if (numberRange <= 30) {
      if (operation === '+') {
        if (result === 30) {
          competencies.push('complement_to_30');
        } else {
          competencies.push('addition_ZR30_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR30_no_transition');
      }
    } else if (numberRange <= 40) {
      if (operation === '+') {
        if (result === 40) {
          competencies.push('complement_to_40');
        } else {
          competencies.push('addition_ZR40_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR40_no_transition');
      }
    } else if (numberRange <= 50) {
      if (operation === '+') {
        if (result === 50) {
          competencies.push('complement_to_50');
        } else {
          competencies.push('addition_ZR50_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR50_no_transition');
      }
    } else if (numberRange <= 80) {
      if (operation === '+') {
        if (result === 80) {
          competencies.push('complement_to_80');
        } else {
          competencies.push('addition_ZR80_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR80_no_transition');
      }
    } else if (numberRange <= 100) {
      if (operation === '+') {
        if (result === 100) {
          competencies.push('complement_to_100');
        } else if (hasTransition) {
          competencies.push('addition_ZR100_with_transition');
        } else {
          competencies.push('addition_ZR100_no_transition');
        }
      } else {
        if (hasTransition) {
          competencies.push('subtraction_ZR100_with_transition');
        } else {
          competencies.push('subtraction_ZR100_no_transition');
        }
      }
    } else if (numberRange <= 200) {
      if (operation === '+') {
        if (result === 200) {
          competencies.push('complement_to_200');
        } else {
          competencies.push('addition_ZR200_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR200_no_transition');
      }
    } else if (numberRange <= 500) {
      if (operation === '+') {
        if (result === 500) {
          competencies.push('complement_to_500');
        } else {
          competencies.push('addition_ZR500_no_transition');
        }
      } else {
        competencies.push('subtraction_ZR500_no_transition');
      }
    } else if (numberRange <= 1000) {
      if (operation === '+') {
        if (result === 1000) {
          competencies.push('complement_to_1000');
        } else if (hasTransition) {
          competencies.push('addition_ZR1000_with_transition');
        } else {
          competencies.push('addition_ZR1000_no_transition');
        }
      } else {
        if (hasTransition) {
          competencies.push('subtraction_ZR1000_with_transition');
        } else {
          competencies.push('subtraction_ZR1000_no_transition');
        }
      }
    }

    // Strategische Kompetenzen
    if (operation === '+') {
      if (number1 === number2) {
        competencies.push('doubles');
      } else if (Math.abs(number1 - number2) === 1) {
        competencies.push('near_doubles');
      }
    }

    // Inverse Operations (wenn es eine Umkehraufgabe ist)
    if (task.taskType === 'inverse_relationship') {
      competencies.push('inverse_operations');
    }

    return competencies;
  }

  /**
   * Prüfe ob Zehnerübergang vorliegt
   */
  private hasDecadeTransition(num1: number, num2: number, operation: '+' | '-'): boolean {
    if (operation === '+') {
      const ones1 = num1 % 10;
      const ones2 = num2 % 10;
      return (ones1 + ones2) >= 10;
    } else {
      const ones1 = num1 % 10;
      const ones2 = num2 % 10;
      return ones1 < ones2; // Muss von Zehner "leihen"
    }
  }

  /**
   * Erstelle Task-String für Tracking
   */
  private getTaskString(task: Task): string {
    const { number1, operation, number2, placeholderPosition, correctAnswer } = task;

    switch (placeholderPosition) {
      case "start":
        return `_${operation}${number2}=${correctAnswer}`;
      case "middle":
        return `${number1}${operation}_=${correctAnswer}`;
      case "end":
      default:
        return `${number1}${operation}${number2}`;
    }
  }

  /**
   * Hole Kompetenz-Zusammenfassung
   */
  getCompetencySummary(progression: LearningProgression): {
    totalCompetencies: number;
    masteredCompetencies: number;
    averageLevel: number;
    weakCompetencies: Array<{ id: string; level: number; successRate: number }>;
  } {
    const competencyProgress = (progression.competencyProgress as any) || {};
    const competencies = Object.entries(competencyProgress);

    if (competencies.length === 0) {
      return {
        totalCompetencies: 0,
        masteredCompetencies: 0,
        averageLevel: 0,
        weakCompetencies: [],
      };
    }

    const masteredCompetencies = competencies.filter(
      ([, data]: any) => data.level >= 4.0
    ).length;

    const totalLevel = competencies.reduce(
      (sum, [, data]: any) => sum + (data.level || 0),
      0
    );
    const averageLevel = totalLevel / competencies.length;

    const weakCompetencies = competencies
      .filter(([, data]: any) => data.level < 2.0)
      .map(([id, data]: any) => ({
        id,
        level: data.level,
        successRate: data.successRate,
      }))
      .sort((a, b) => a.level - b.level)
      .slice(0, 5);

    return {
      totalCompetencies: competencies.length,
      masteredCompetencies,
      averageLevel,
      weakCompetencies,
    };
  }

  /**
   * Berechne Aufgabenschwierigkeit (0-1)
   * Faktoren: Zahlenbereich, Operation, Platzhalter, Zehnerübergang, Werteziffern
   */
  private calculateDifficulty(task: Task): number {
    let difficulty = 0.0;

    // Analysiere Werteziffern (nicht nur Ziffern!)
    const valueDigits = this.countValueDigits(task.number1, task.number2);

    // Werteziffern-basierte Schwierigkeit
    // 70+30 (2 Werteziffern) ist deutlich leichter als 77+35 (4 Werteziffern)
    if (valueDigits === 2) {
      difficulty += 0.15; // Nur runde Zehner/Hunderter
    } else if (valueDigits === 3) {
      difficulty += 0.30; // z.B. 70+35 oder 27+30
    } else if (valueDigits >= 4) {
      difficulty += 0.45; // z.B. 77+35 (volle Komplexität)
    }

    // Zahlenbereich
    const maxNumber = Math.max(task.number1, task.number2);
    if (maxNumber <= 10) {
      difficulty += 0.1;
    } else if (maxNumber <= 20) {
      difficulty += 0.15;
    } else if (maxNumber <= 100) {
      difficulty += 0.25;
    } else {
      difficulty += 0.35;
    }

    // Operation
    if (task.operation === '+') {
      difficulty += 0.1;
    } else {
      difficulty += 0.15; // Subtraktion ist oft etwas schwieriger
    }

    // Platzhalter
    if (task.placeholderPosition !== 'end') {
      difficulty += 0.1;
    }

    // Zehnerübergang
    if (this.hasDecadeTransition(task.number1, task.number2, task.operation)) {
      difficulty += 0.15;
    }

    // Begrenze Schwierigkeit auf maximal 1.0
    return Math.min(difficulty, 1.0);
  }

  /**
   * Zähle die Anzahl der Werteziffern (Ziffern ungleich Null) in zwei Zahlen
   */
  private countValueDigits(num1: number, num2: number): number {
    const num1Str = String(num1);
    const num2Str = String(num2);
    let valueDigits = 0;

    for (const digit of num1Str) {
      if (digit !== '0') {
        valueDigits++;
      }
    }
    for (const digit of num2Str) {
      if (digit !== '0') {
        valueDigits++;
      }
    }
    return valueDigits;
  }
}

export const competencyProgressTracker = new CompetencyProgressTracker();