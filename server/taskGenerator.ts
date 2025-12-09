// Task type for internal use (not exported from schema)
interface Task {
  taskType: string;
  operation: '+' | '-' | '*' | '/';
  number1: number;
  number2: number;
  correctAnswer: number;
  numberRange: number;
  studentAnswer: number | null;
  isCorrect: boolean | null;
  timeTaken: number | null;
  solutionSteps: string[];
  strategyUsed: string | null;
  representationsUsed: string[];
  errorType: string | null;
  errorSeverity: string | null;
}

export type PatternType =
  | "sum_constancy"      // Konstanz der Summe: 3+7=10, 4+6=10, 5+5=10
  | "neighbor_tasks"     // Nachbaraufgaben: 5+3=8, 6+3=9, 7+3=10
  | "inverse_operations" // Umkehraufgaben: 8+5=13, 13-5=8
  | "analogy_package"    // Analogie: 3+4=7, 13+4=17
  | "error_pattern"      // Fehlermuster: Typische Fehler gezielt adressieren
  | "turning_points"     // Wendepunkte: Schlüsselzahlen 5, 10, 15, 20
  | "mixed_practice";    // Gemischte Übung: Zufällige Reihenfolge verschiedener Aufgaben

export type StrategyLevel =
  | "counting_all"        // Alles abzählen
  | "counting_on"         // Weiterzählen
  | "decomposition"       // Zerlegung (z.B. 8+7 = 8+2+5)
  | "doubles"             // Verdoppeln (5+5, 6+6)
  | "near_doubles"        // Fast-Verdoppeln (5+6 = 5+5+1)
  | "make_ten"            // Zehnerübergang (8+5 = 8+2+3)
  | "automatized";        // Automatisiert

interface TaskPackage {
  tasks: Task[];
  patternType: PatternType;
  targetStrategy: StrategyLevel;
  difficulty: number; // 1-5
}

export class TaskGenerator {

  /**
   * Generate a task package based on student's cognitive profile
   */
  generatePackage(
    strategyLevel: StrategyLevel,
    patternType: PatternType,
    difficulty: number = 3,
    numberRange: number = 20
  ): TaskPackage {
    switch (patternType) {
      case "sum_constancy":
        return this.generateSumConstancyPackage(difficulty, numberRange);
      case "neighbor_tasks":
        return this.generateNeighborTasksPackage(difficulty, numberRange);
      case "inverse_operations":
        return this.generateInverseOperationsPackage(difficulty, numberRange);
      case "analogy_package":
        return this.generateAnalogyPackage(difficulty, numberRange);
      case "error_pattern":
        return this.generateErrorPatternPackage(strategyLevel, difficulty, numberRange);
      case "turning_points":
        return this.generateTurningPointsPackage(difficulty, numberRange);
      case "mixed_practice":
        return this.generateMixedPracticePackage(strategyLevel, difficulty, numberRange);
      default:
        return this.generateSumConstancyPackage(difficulty, numberRange);
    }
  }

  /**
   * Konstanz der Summe: Verschiedene Zerlegungen derselben Summe
   * Beispiel: 3+7=10, 4+6=10, 5+5=10, 6+4=10
   * ZR100: 23+37=60, 24+36=60, 25+35=60
   */
  private generateSumConstancyPackage(difficulty: number, numberRange: number = 20): TaskPackage {
    let targetSum: number;

    if (numberRange === 20) {
      targetSum = difficulty <= 2 ? 10 : difficulty <= 4 ? 15 : 20;
    } else {
      // Zahlenraum 100
      targetSum = difficulty <= 2 ? 50 : difficulty <= 4 ? 75 : 100;
    }

    const tasks: Task[] = [];
    const step = numberRange === 100 ? Math.max(1, Math.floor(targetSum / 10)) : 1;

    for (let i = step; i < targetSum; i += step) {
      const num1 = i;
      const num2 = targetSum - i;

      tasks.push({
        taskType: "pattern_recognition",
        operation: "+",
        number1: num1,
        number2: num2,
        correctAnswer: targetSum,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      });

      if (tasks.length >= 6) break;
    }

    return {
      tasks,
      patternType: "sum_constancy",
      targetStrategy: "decomposition",
      difficulty,
    };
  }

  /**
   * Nachbaraufgaben: Aufgaben mit konstantem Summanden
   * Beispiel ZR20: 5+3=8, 6+3=9, 7+3=10, 8+3=11
   * Beispiel ZR100: 45+7, 46+7, 47+7, 48+7
   */
  private generateNeighborTasksPackage(difficulty: number, numberRange: number = 20): TaskPackage {
    let constantAddend: number, startNumber: number;

    if (numberRange === 20) {
      constantAddend = difficulty <= 2 ? 3 : difficulty <= 4 ? 5 : 7;
      startNumber = difficulty <= 2 ? 2 : difficulty <= 4 ? 3 : 5;
    } else {
      // ZR100: größere Sprünge
      constantAddend = difficulty <= 2 ? 5 : difficulty <= 4 ? 12 : 18;
      startNumber = difficulty <= 2 ? 20 : difficulty <= 4 ? 35 : 50;
    }

    const tasks: Task[] = [];

    for (let i = 0; i < 6; i++) {
      const num1 = startNumber + i;
      const num2 = constantAddend;
      const sum = num1 + num2;

      if (sum <= numberRange) {
        tasks.push({
          taskType: "pattern_recognition",
          operation: "+",
          number1: num1,
          number2: num2,
          correctAnswer: sum,
          numberRange,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
        });
      }
    }

    return {
      tasks,
      patternType: "neighbor_tasks",
      targetStrategy: "counting_on",
      difficulty,
    };
  }

  /**
   * Umkehraufgaben: Addition und zugehörige Subtraktion
   * Beispiel ZR20: 8+5=13, 13-5=8, 13-8=5
   * Beispiel ZR100: 47+28=75, 75-28=47, 75-47=28
   */
  private generateInverseOperationsPackage(difficulty: number, numberRange: number = 20): TaskPackage {
    let pairs: number[][];

    if (numberRange === 20) {
      pairs = difficulty <= 2
        ? [[5, 3], [7, 2], [6, 4]]
        : difficulty <= 4
        ? [[8, 5], [9, 4], [7, 6]]
        : [[12, 8], [15, 7], [13, 9]];
    } else {
      // ZR100
      pairs = difficulty <= 2
        ? [[25, 15], [32, 18], [28, 22]]
        : difficulty <= 4
        ? [[47, 28], [54, 29], [61, 34]]
        : [[68, 27], [75, 18], [82, 13]];
    }

    const tasks: Task[] = [];

    pairs.forEach(([num1, num2]) => {
      const sum = num1 + num2;

      // Addition
      tasks.push({
        taskType: "inverse_relationship",
        operation: "+",
        number1: num1,
        number2: num2,
        correctAnswer: sum,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      });

      // Subtraktion (beide Umkehrungen)
      tasks.push({
        taskType: "inverse_relationship",
        operation: "-",
        number1: sum,
        number2: num2,
        correctAnswer: num1,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      });

      tasks.push({
        taskType: "inverse_relationship",
        operation: "-",
        number1: sum,
        number2: num1,
        correctAnswer: num2,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      });
    });

    return {
      tasks,
      patternType: "inverse_operations",
      targetStrategy: "decomposition",
      difficulty,
    };
  }

  /**
   * Analogie-Päckchen: Strukturgleiche Aufgaben in verschiedenen Zahlräumen
   * Beispiel ZR20: 3+4=7, 13+4=17 (Analogie im Zehnerübergang)
   * Beispiel ZR100: 24+8=32, 54+8=62, 74+8=82
   */
  private generateAnalogyPackage(difficulty: number, numberRange: number = 20): TaskPackage {
    let baseOperations: number[][];

    if (numberRange === 20) {
      baseOperations = difficulty <= 2
        ? [[2, 3], [3, 4], [4, 5]]
        : difficulty <= 4
        ? [[5, 4], [6, 3], [7, 2]]
        : [[8, 5], [9, 4], [7, 6]];
    } else {
      // ZR100: Analogie über Zehner hinweg
      baseOperations = difficulty <= 2
        ? [[4, 8], [7, 6], [9, 5]]
        : difficulty <= 4
        ? [[18, 14], [23, 17], [16, 19]]
        : [[37, 28], [45, 34], [52, 29]];
    }

    const tasks: Task[] = [];

    baseOperations.forEach(([num1, num2]) => {
      const step = numberRange === 20 ? 10 : 30;

      // Base task
      tasks.push({
        taskType: "pattern_recognition",
        operation: "+",
        number1: num1,
        number2: num2,
        correctAnswer: num1 + num2,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      });

      // Analogy task (plus step)
      if (num1 + step + num2 <= numberRange) {
        tasks.push({
          taskType: "pattern_recognition",
          operation: "+",
          number1: num1 + step,
          number2: num2,
          correctAnswer: num1 + step + num2,
          numberRange,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
        });
      }
    });

    return {
      tasks,
      patternType: "analogy_package",
      targetStrategy: "decomposition",
      difficulty,
    };
  }

  /**
   * Fehlermuster-Päckchen: Aufgaben die typische Fehler adressieren
   */
  private generateErrorPatternPackage(
    strategyLevel: StrategyLevel,
    difficulty: number,
    numberRange: number = 20
  ): TaskPackage {
    const tasks: Task[] = [];

    // Typische Fehlermuster basierend auf Strategie-Level
    if (strategyLevel === "counting_all" || strategyLevel === "counting_on") {
      let problematicPairs: number[][];

      if (numberRange === 20) {
        problematicPairs = [[8, 3], [7, 4], [9, 2], [6, 5]];
      } else {
        // ZR100: Stellenwert-Fehler häufig
        problematicPairs = [[38, 15], [47, 24], [56, 19], [62, 28]];
      }

      problematicPairs.forEach(([num1, num2]) => {
        tasks.push({
          taskType: "error_diagnosis",
          operation: "+",
          number1: num1,
          number2: num2,
          correctAnswer: num1 + num2,
          numberRange,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
        });
      });
    } else if (strategyLevel === "make_ten") {
      let tenTransitions: number[][];

      if (numberRange === 20) {
        tenTransitions = [[8, 5], [9, 4], [7, 6], [8, 7]];
      } else {
        // ZR100: Komplexere Zehnerübergänge
        tenTransitions = [[48, 7], [59, 8], [67, 16], [78, 14]];
      }

      tenTransitions.forEach(([num1, num2]) => {
        tasks.push({
          taskType: "error_diagnosis",
          operation: "+",
          number1: num1,
          number2: num2,
          correctAnswer: num1 + num2,
          numberRange,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
        });
      });
    }

    return {
      tasks,
      patternType: "error_pattern",
      targetStrategy: strategyLevel,
      difficulty,
    };
  }

  /**
   * Wendepunkte: Spezielle Aufgaben für Schlüsselzahlen 5, 10, 15, 20
   * Diese Zahlen sind wichtige Orientierungspunkte im Zahlenraum
   */
  private generateTurningPointsPackage(difficulty: number, numberRange: number = 20): TaskPackage {
    const tasks: Task[] = [];
    const turningPoints = numberRange === 20 ? [5, 10, 15, 20] : [25, 50, 75, 100];
    
    turningPoints.forEach(turningPoint => {
      // Verschiedene Zerlegungen des Wendepunkts
      const decompositions: number[][] = [];
      
      for (let i = 1; i < turningPoint; i++) {
        decompositions.push([i, turningPoint - i]);
      }
      
      // Nach Schwierigkeit filtern und begrenzen
      let selectedDecomps: number[][] = [];
      
      if (difficulty <= 2) {
        // Einfach: Nur einfache Zerlegungen wie 1+9, 2+8, etc.
        selectedDecomps = decompositions.slice(0, 3);
      } else if (difficulty <= 4) {
        // Mittel: Mehr Zerlegungen, inklusive Mitte (5+5)
        selectedDecomps = decompositions.filter((_, i) => i % 2 === 0).slice(0, 4);
      } else {
        // Schwer: Alle Zerlegungen durchmischen
        selectedDecomps = [...decompositions].sort(() => Math.random() - 0.5).slice(0, 5);
      }
      
      selectedDecomps.forEach(([num1, num2]) => {
        tasks.push({
          taskType: "pattern_recognition",
          operation: "+",
          number1: num1,
          number2: num2,
          correctAnswer: turningPoint,
          numberRange,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
        });
      });
    });
    
    // Für höhere Schwierigkeit: Aufgaben mischen
    if (difficulty >= 3) {
      tasks.sort(() => Math.random() - 0.5);
    }
    
    return {
      tasks: tasks.slice(0, 8), // Maximal 8 Aufgaben
      patternType: "turning_points",
      targetStrategy: "decomposition",
      difficulty,
    };
  }

  /**
   * Gemischte Übung: Kombiniert verschiedene Aufgabentypen in zufälliger Reihenfolge
   * Gut für Festigung und Transfer
   */
  private generateMixedPracticePackage(
    strategyLevel: StrategyLevel,
    difficulty: number,
    numberRange: number = 20
  ): TaskPackage {
    const allTasks: Task[] = [];
    
    // Sammle Aufgaben aus verschiedenen Paketen
    const sumConstancy = this.generateSumConstancyPackage(difficulty, numberRange);
    const errorPattern = this.generateErrorPatternPackage(strategyLevel, difficulty, numberRange);
    const turningPoints = this.generateTurningPointsPackage(difficulty, numberRange);
    
    // 2-3 Aufgaben von jedem Typ nehmen
    allTasks.push(...sumConstancy.tasks.slice(0, 3));
    allTasks.push(...errorPattern.tasks.slice(0, 2));
    allTasks.push(...turningPoints.tasks.slice(0, 3));
    
    // Zufällig mischen
    const shuffledTasks = allTasks.sort(() => Math.random() - 0.5);
    
    return {
      tasks: shuffledTasks.slice(0, 8),
      patternType: "mixed_practice",
      targetStrategy: strategyLevel,
      difficulty,
    };
  }

  /**
   * Generate adaptive task sequence based on success rate
   */
  generateAdaptiveSequence(
    currentSuccessRate: number,
    currentDifficulty: number,
    preferredStrategies: StrategyLevel[],
    numberRange: number = 20
  ): TaskPackage {
    let newDifficulty = currentDifficulty;

    // Adaptive Schwierigkeitssteuerung (ZPD-basiert)
    if (currentSuccessRate >= 0.8) {
      newDifficulty = Math.min(5, currentDifficulty + 1);
    } else if (currentSuccessRate <= 0.4) {
      newDifficulty = Math.max(1, currentDifficulty - 1);
    }

    // Pattern-Auswahl basierend auf Strategien
    const strategy = preferredStrategies[0] || "counting_on";
    const patternType: PatternType =
      strategy === "decomposition" ? "sum_constancy" :
      strategy === "counting_on" ? "neighbor_tasks" :
      strategy === "make_ten" ? "analogy_package" :
      "neighbor_tasks";

    return this.generatePackage(strategy, patternType, newDifficulty, numberRange);
  }
}

export const taskGenerator = new TaskGenerator();