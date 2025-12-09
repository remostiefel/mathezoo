/**
 * Operative Package Generator
 *
 * Wissenschaftliche Fundierung:
 * - Wittmann (1985): Operatives Prinzip
 * - Götze & Spies (2023): Strukturfokussierendes Üben
 * - Leuenberger (2021): Ablösung vom zählenden Rechnen
 *
 * Generiert systematische Aufgabenpakete mit erkennbaren Mustern
 */

import type { Task } from './competencyBasedGenerator';

export type OperativePattern =
  | 'constant_sum'        // 3+5=8, 4+4=8, 5+3=8
  | 'constant_difference' // 8-3=5, 9-4=5, 10-5=5
  | 'plus_minus_one'      // 6+7, 6+8, 6+9 (ein Summand steigt)
  | 'exchange'            // 5+3, 3+5 (Tauschaufgaben - KOMMUTATIVGESETZ)
  | 'inverse'             // 5+3=8, 8-3=5, 8-5=3
  | 'decade_steps'        // 12+3, 22+3, 32+3 (Zehnerschritte)
  | 'core_task_doubling'  // NEU: Kernaufgaben-Päckchen: 6+6, 6+7, 7+7 (Herleiten von Verdopplungen)
  | 'core_task_to_ten'    // NEU: Kernaufgaben zur 10: 5+5, 6+4, 7+3 (Herleiten von Partnerzahlen)
  | 'analogy_place_value' // NEU: Analogie-Päckchen: 3+4, 13+4, 23+4 (Wittmann: Stellenwert-Transfer)
  | 'derivation_multi_path' // NEU: Herleite-Päckchen: Gleiche Aufgabe, verschiedene Kernaufgaben-Wege
  | 'associative_grouping' // NEU: ASSOZIATIVGESETZ: (3+4)+5 vs 3+(4+5) - geschicktes Gruppieren
  | 'distributive_decomposition'; // NEU: DISTRIBUTIVGESETZ: 7×9 = 7×10 - 7×1 (Multiplikation/Division)

export interface OperativePackage {
  pattern: OperativePattern;
  tasks: Task[];
  reflectionQuestion: string;
  learningGoal: string;
  expectedInsight: string;
  didacticFocus?: string; // For new patterns
  reflection?: string;    // For new patterns
}

export class OperativePackageGenerator {
  /**
   * Generiert ein operatives Päckchen basierend auf Muster und Schwierigkeit
   */
  generatePackage(
    pattern: OperativePattern,
    numberRange: 20 | 100 = 20,
    difficulty: number = 1
  ): OperativePackage {
    switch (pattern) {
      case 'sum_constancy':
        return this.generateSumConstancy(numberRange, difficulty);
      case 'neighbor_tasks':
        return this.generateNeighborTasks(numberRange, difficulty);
      case 'reversal':
        return this.generateReversal(numberRange, difficulty);
      case 'analogy':
        return this.generateAnalogy(numberRange, difficulty);
      case 'decomposition':
        return this.generateDecomposition(numberRange, difficulty);
      case 'decade_transition':
        return this.generateDecadeTransition(numberRange, difficulty);
      case 'inverse_problems':
        return this.generateInverseProblems(numberRange, difficulty);
      case 'difference_constancy':
        return this.generateDifferenceConstancy(numberRange, difficulty);
      // Neue Muster werden hier nicht behandelt, da sie eine andere `generate` Methode nutzen.
      // Dies ist die alte `generatePackage` Methode, die nur die alten Muster kennt.
      default:
        // Fallback auf ein bekanntes Muster, falls ein neues Muster hier übergeben wird.
        // Dies sollte eigentlich nicht passieren, wenn die `generate` Methode korrekt genutzt wird.
        console.warn(`Unknown pattern "${pattern}" passed to generatePackage. Falling back to sum_constancy.`);
        return this.generateSumConstancy(numberRange, difficulty);
    }
  }

  /**
   * Summen-Konstanz: Verschiedene Zerlegungen derselben Summe
   * Beispiel: 3+7=10, 4+6=10, 5+5=10
   */
  private generateSumConstancy(numberRange: number, difficulty: number): OperativePackage {
    const targetSums = numberRange === 20 ? [10, 15, 20] : [50, 100];
    const targetSum = targetSums[Math.min(difficulty - 1, targetSums.length - 1)];

    const tasks: Task[] = [];

    // Generiere alle Zerlegungen der Zielsumme
    const decompositions: [number, number][] = [];
    for (let i = 1; i < targetSum; i++) {
      decompositions.push([i, targetSum - i]);
    }

    // Wähle basierend auf Schwierigkeit
    let selected: [number, number][] = [];
    if (difficulty <= 2) {
      // Einfach: 5-5 Zerlegung in der Mitte + 2 symmetrische
      const mid = Math.floor(decompositions.length / 2);
      selected = [
        decompositions[mid], // 5+5 bei Summe 10
        decompositions[mid - 1], // 4+6
        decompositions[mid - 2], // 3+7
      ];
    } else {
      // Schwerer: Mehr Zerlegungen, inkl. schwierige (1+9, 2+8)
      selected = decompositions.slice(0, 6);
    }

    selected.forEach(([num1, num2]) => {
      tasks.push({
        taskType: 'constant_sum', // Corrected taskType to match pattern name
        operation: '+',
        number1: num1,
        number2: num2,
        correctAnswer: targetSum,
        numberRange,
        placeholderPosition: 'end',
      });
    });

    return {
      pattern: 'constant_sum', // Corrected pattern name to match type
      tasks,
      reflectionQuestion: `Was fällt dir auf? Wie verändern sich die Zahlen, aber was bleibt gleich?`,
      learningGoal: 'Erkennen, dass verschiedene Zerlegungen dieselbe Summe ergeben',
      expectedInsight: `Wenn ich bei ${selected[0][0]}+${selected[0][1]} die erste Zahl um 1 erhöhe und die zweite um 1 verringere, bleibt die Summe ${targetSum}.`
    };
  }

  /**
   * Nachbaraufgaben: Eine Zahl bleibt konstant, die andere steigt
   * Beispiel: 8+5=13, 8+6=14, 8+7=15
   */
  private generateNeighborTasks(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Wähle Basis-Zahl
    const baseNumber = numberRange === 20
      ? 5 + difficulty
      : 10 + difficulty * 5;

    // Startender Summand
    const startAddend = Math.max(2, Math.min(baseNumber - 3, difficulty + 2));

    // Generiere 5-6 aufeinanderfolgende Aufgaben
    const count = difficulty <= 2 ? 4 : 6;

    for (let i = 0; i < count; i++) {
      const addend = startAddend + i;
      const sum = baseNumber + addend;

      if (sum <= numberRange) {
        tasks.push({
          taskType: 'neighbor_tasks', // Corrected taskType
          operation: '+',
          number1: baseNumber,
          number2: addend,
          correctAnswer: sum,
          numberRange,
          placeholderPosition: 'end',
        });
      }
    }

    return {
      pattern: 'neighbor_tasks', // Corrected pattern name
      tasks,
      reflectionQuestion: `Was verändert sich bei jeder Aufgabe? Was passiert mit dem Ergebnis?`,
      learningGoal: 'Verstehen, dass +1 beim Summanden auch +1 beim Ergebnis bedeutet',
      expectedInsight: `Wenn ich den zweiten Summanden um 1 erhöhe, wird auch das Ergebnis um 1 größer.`
    };
  }

  /**
   * Tauschaufgaben: Kommutativgesetz
   * Beispiel: 7+3=10, 3+7=10
   */
  private generateReversal(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Generiere Paare
    const pairs: [number, number][] = [];

    if (numberRange === 20) {
      if (difficulty <= 2) {
        pairs.push([3, 7], [4, 6], [5, 5]);
      } else {
        pairs.push([2, 8], [3, 7], [4, 9], [6, 8]);
      }
    } else {
      pairs.push([25, 15], [30, 20], [35, 25]);
    }

    pairs.forEach(([a, b]) => {
      // Original
      tasks.push({
        taskType: 'exchange', // Corrected taskType to match pattern name 'exchange'
        operation: '+',
        number1: a,
        number2: b,
        correctAnswer: a + b,
        numberRange,
        placeholderPosition: 'end',
      });

      // Getauscht
      tasks.push({
        taskType: 'exchange', // Corrected taskType
        operation: '+',
        number1: b,
        number2: a,
        correctAnswer: a + b,
        numberRange,
        placeholderPosition: 'end',
      });
    });

    return {
      pattern: 'exchange', // Corrected pattern name
      tasks,
      reflectionQuestion: `Vergleiche die Aufgaben paarweise. Was stellst du fest?`,
      learningGoal: 'Kommutativgesetz: Die Reihenfolge spielt bei Addition keine Rolle',
      expectedInsight: `3+7 und 7+3 haben dasselbe Ergebnis, weil die Reihenfolge beim Plus egal ist.`
    };
  }

  /**
   * Analogieaufgaben: Strukturgleiche Aufgaben in verschiedenen Zahlenräumen
   * Beispiel: 4+3=7, 14+3=17, 24+3=27
   */
  private generateAnalogy(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Basis-Aufgabe im Einer-Bereich
    const baseNum1 = 3 + difficulty;
    const baseNum2 = 2 + difficulty;

    if (numberRange === 20) {
      // Analoge Aufgaben: Einer, dann +10
      tasks.push({
        taskType: 'analogy_place_value', // Corrected taskType to match pattern name
        operation: '+',
        number1: baseNum1,
        number2: baseNum2,
        correctAnswer: baseNum1 + baseNum2,
        numberRange,
        placeholderPosition: 'end',
      });

      if (baseNum1 + 10 + baseNum2 <= 20) {
        tasks.push({
          taskType: 'analogy_place_value', // Corrected taskType
          operation: '+',
          number1: baseNum1 + 10,
          number2: baseNum2,
          correctAnswer: baseNum1 + 10 + baseNum2,
          numberRange,
          placeholderPosition: 'end',
        });
      }
    } else {
      // ZR100: Analoge Aufgaben über Dekaden
      for (let decade = 0; decade <= 70; decade += 10) {
        const num1 = baseNum1 + decade;
        if (num1 + baseNum2 <= 100) {
          tasks.push({
            taskType: 'analogy_place_value', // Corrected taskType
            operation: '+',
            number1: num1,
            number2: baseNum2,
            correctAnswer: num1 + baseNum2,
            numberRange,
            placeholderPosition: 'end',
          });
        }
      }
    }

    return {
      pattern: 'analogy_place_value', // Corrected pattern name
      tasks,
      reflectionQuestion: `Welche Aufgabe hilft dir bei den anderen? Was ist ähnlich?`,
      learningGoal: 'Bekannte Aufgaben auf größere Zahlenräume übertragen',
      expectedInsight: `Wenn ich 4+3=7 weiß, dann weiß ich auch 14+3=17 und 24+3=27.`
    };
  }

  /**
   * Zerlegungsaufgaben: Schrittweises Rechnen über den Zehner
   * Beispiel: 7+5 = 7+3+2 = 10+2 = 12
   */
  private generateDecomposition(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Aufgaben mit Zehnerübergang
    const decompositions: Array<{num1: number, num2: number, step1: number, step2: number}> = [];

    if (numberRange === 20) {
      decompositions.push(
        { num1: 7, num2: 5, step1: 3, step2: 2 }, // 7+5 = 7+3+2
        { num1: 8, num2: 5, step1: 2, step2: 3 }, // 8+5 = 8+2+3
        { num1: 9, num2: 4, step1: 1, step2: 3 }, // 9+4 = 9+1+3
      );
    } else {
      decompositions.push(
        { num1: 47, num2: 8, step1: 3, step2: 5 }, // 47+8 = 47+3+5
        { num1: 38, num2: 7, step1: 2, step2: 5 }, // 38+7 = 38+2+5
      );
    }

    decompositions.forEach(({ num1, num2, step1, step2 }) => {
      // Haupt-Aufgabe
      tasks.push({
        taskType: 'decomposition', // Corrected taskType
        operation: '+',
        number1: num1,
        number2: num2,
        correctAnswer: num1 + num2,
        numberRange,
        placeholderPosition: 'end',
      });

      // Zerlegungs-Schritte als Hilfe
      tasks.push({
        taskType: 'decomposition_step', // Corrected taskType
        operation: '+',
        number1: num1,
        number2: step1,
        correctAnswer: num1 + step1,
        numberRange,
        placeholderPosition: 'end',
      });

      tasks.push({
        taskType: 'decomposition_step', // Corrected taskType
        operation: '+',
        number1: num1 + step1,
        number2: step2,
        correctAnswer: num1 + num2,
        numberRange,
        placeholderPosition: 'end',
      });
    });

    return {
      pattern: 'decomposition', // Corrected pattern name
      tasks,
      reflectionQuestion: `Wie hast du die Aufgabe in kleinere Schritte zerlegt?`,
      learningGoal: 'Zehnerübergang durch geschicktes Zerlegen meistern',
      expectedInsight: `Ich zerlege so, dass ich erst bis zum nächsten Zehner komme, dann den Rest dazu.`
    };
  }

  /**
   * Dekaden-Übergänge: Analoge Aufgaben mit Zehnerübergang
   * Beispiel: 8+5, 18+5, 28+5
   */
  private generateDecadeTransition(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Basis-Aufgabe mit Zehnerübergang
    const baseNum1 = 7 + Math.min(difficulty, 2);
    const baseNum2 = 4 + Math.min(difficulty, 3);

    if (numberRange === 20) {
      tasks.push({
        taskType: 'decade_transition', // Corrected taskType
        operation: '+',
        number1: baseNum1,
        number2: baseNum2,
        correctAnswer: baseNum1 + baseNum2,
        numberRange,
        placeholderPosition: 'end',
      });

      if (baseNum1 + 10 + baseNum2 <= 20) {
        tasks.push({
          taskType: 'decade_transition', // Corrected taskType
          operation: '+',
          number1: baseNum1 + 10,
          number2: baseNum2,
          correctAnswer: baseNum1 + 10 + baseNum2,
          numberRange,
          placeholderPosition: 'end',
        });
      }
    } else {
      // ZR100: Mehrere Dekaden
      for (let decade = 0; decade <= 60; decade += 10) {
        const num1 = baseNum1 + decade;
        if (num1 + baseNum2 <= 100) {
          tasks.push({
            taskType: 'decade_transition', // Corrected taskType
            operation: '+',
            number1: num1,
            number2: baseNum2,
            correctAnswer: num1 + baseNum2,
            numberRange,
            placeholderPosition: 'end',
          });
        }
      }
    }

    return {
      pattern: 'decade_transition', // Corrected pattern name
      tasks,
      reflectionQuestion: `Was haben alle Aufgaben gemeinsam? Wie hilft dir das?`,
      learningGoal: 'Zehnerübergänge über verschiedene Dekaden hinweg sicher beherrschen',
      expectedInsight: `Der Trick beim Zehnerübergang funktioniert bei 8+5, 18+5 und 28+5 gleich.`
    };
  }

  /**
   * Umkehraufgaben: Platzhalter-Aufgaben zum inversen Denken
   * Beispiel: _+3=8, 12-_=7
   */
  private generateInverseProblems(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    // Basis-Summen
    const sums = numberRange === 20 ? [10, 12, 15] : [50, 60, 100];
    const targetSum = sums[Math.min(difficulty - 1, sums.length - 1)];

    // Generiere Platzhalter-Aufgaben
    for (let i = 2; i <= Math.min(targetSum - 2, 8); i += 2) {
      // _+i = targetSum
      tasks.push({
        taskType: 'inverse_problems', // Corrected taskType
        operation: '+',
        number1: targetSum - i,
        number2: i,
        correctAnswer: targetSum,
        numberRange,
        placeholderPosition: 'start',
      });

      // targetSum - _ = i
      tasks.push({
        taskType: 'inverse_problems', // Corrected taskType
        operation: '-',
        number1: targetSum,
        number2: targetSum - i,
        correctAnswer: i,
        numberRange,
        placeholderPosition: 'middle',
      });
    }

    return {
      pattern: 'inverse_problems', // Corrected pattern name
      tasks,
      reflectionQuestion: `Wie hängem Addition und Subtraktion zusammen?`,
      learningGoal: 'Umkehroperationen verstehen und nutzen',
      expectedInsight: `Wenn _+3=10, dann ist _ = 10-3 = 7. Addition und Subtraktion sind Umkehrungen.`
    };
  }

  /**
   * Differenz-Konstanz: Verschiedene Aufgaben mit gleicher Differenz
   * Beispiel: 10-3=7, 11-4=7, 12-5=7
   */
  private generateDifferenceConstancy(numberRange: number, difficulty: number): OperativePackage {
    const tasks: Task[] = [];

    const targetDiff = numberRange === 20
      ? [5, 7, 10][Math.min(difficulty - 1, 2)]
      : [20, 30, 50][Math.min(difficulty - 1, 2)];

    // Generiere Aufgaben mit konstanter Differenz
    const startMinuend = targetDiff + 3;
    const count = difficulty <= 2 ? 4 : 6;

    for (let i = 0; i < count; i++) {
      const minuend = startMinuend + i;
      const subtrahend = minuend - targetDiff;

      if (minuend <= numberRange && subtrahend > 0) {
        tasks.push({
          taskType: 'difference_constancy', // Corrected taskType
          operation: '-',
          number1: minuend,
          number2: subtrahend,
          correctAnswer: targetDiff,
          numberRange,
          placeholderPosition: 'end',
        });
      }
    }

    return {
      pattern: 'difference_constancy', // Corrected pattern name
      tasks,
      reflectionQuestion: `Was bleibt bei allen Aufgaben gleich? Warum?`,
      learningGoal: 'Verstehen, dass gleichzeitige Erhöhung von Minuend und Subtrahend die Differenz konstant hält',
      expectedInsight: `Wenn ich bei 10-3 beide Zahlen um 1 erhöhe (11-4), bleibt das Ergebnis gleich.`
    };
  }

  /**
   * ERWEITERT: Generiere operative Päckchen nach Wittmann (2017)
   *
   * Neue Päckchentypen:
   * - KERNAUFGABEN-Päckchen: Verdopplungen + Ableitungen
   * - ANALOGIE-Päckchen: 3+4, 13+4, 23+4 (Stellenwert-Transfer)
   * - HERLEITE-Päckchen: Mehrere Wege zur gleichen Lösung
   */
  generate(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    patternType: OperativePattern,
    length: number = 4
  ): OperativePackage {
    switch (patternType) {
      case 'constant_sum':
        return this.generateConstantSum(baseTask, length);
      case 'constant_difference':
        return this.generateConstantDifference(baseTask, length);
      case 'plus_minus_one':
        return this.generatePlusMinusOne(baseTask, length);
      case 'exchange':
        return this.generateExchange(baseTask, length);
      case 'inverse':
        return this.generateInverse(baseTask, length);
      case 'decade_steps':
        return this.generateDecadeSteps(baseTask, length);

      // NEUE PÄCKCHEN-TYPEN (Wittmann/Gaidoschik)
      case 'core_task_doubling':
        return this.generateCoreTaskDoubling(baseTask, length);

      case 'core_task_to_ten':
        return this.generateCoreTaskToTen(baseTask, length);

      case 'analogy_place_value':
        return this.generateAnalogyPlaceValue(baseTask, length);

      case 'derivation_multi_path':
        return this.generateDerivationMultiPath(baseTask, length);

      // NEUE GESETZE
      case 'associative_grouping':
        return this.generateAssociativeGrouping(baseTask, length);

      case 'distributive_decomposition':
        return this.generateDistributiveDecomposition(baseTask, length);
      
      // LEGACY PATTERN ALIASES - Map old names to new names
      case 'neighbor_tasks' as any:
        return this.generatePlusMinusOne(baseTask, length);
      
      case 'decomposition' as any:
        return this.generateDerivationMultiPath(baseTask, length);

      default:
        console.warn(`Unknown patternType "${patternType}" in generate method. Falling back to constant_sum.`);
        return this.generateConstantSum(baseTask, length); // Fallback
    }
  }

  /**
   * KERNAUFGABEN-PÄCKCHEN: Verdopplungen + Ableitungen (Wittmann)
   * Beispiel: 6+6=12, 6+7=13, 7+7=14, 7+8=15
   * Didaktik: Zeigt, wie man von Kernaufgaben (6+6, 7+7) ableitet
   */
  private generateCoreTaskDoubling(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const tasks: any[] = [];
    const base = Math.min(baseTask.number1, baseTask.number2);

    // Päckchen-Struktur: n+n, n+(n+1), (n+1)+(n+1), (n+1)+(n+2)
    for (let i = 0; i < length; i++) {
      const offset = Math.floor(i / 2);
      const isDoubling = i % 2 === 0;

      if (isDoubling) {
        const num1 = base + offset;
        const num2 = base + offset;
        tasks.push({ 
          number1: num1, 
          number2: num2, 
          operation: '+',
          correctAnswer: num1 + num2,
          taskType: 'core_task_doubling',
          numberRange: 20,
          placeholderPosition: 'end'
        });
      } else {
        const num1 = base + offset;
        const num2 = base + offset + 1;
        tasks.push({ 
          number1: num1, 
          number2: num2, 
          operation: '+',
          correctAnswer: num1 + num2,
          taskType: 'core_task_doubling',
          numberRange: 20,
          placeholderPosition: 'end'
        });
      }
    }

    return {
      tasks,
      pattern: 'core_task_doubling',
      didacticFocus: 'Kernaufgaben automatisieren und Herleiten üben: Von n+n zu n+(n+1)',
      learningGoal: 'Von Kernaufgaben (Verdopplungen) zu ähnlichen Aufgaben gelangen',
      reflectionQuestion: 'Welche Aufgabe ist die KERNAUFGABE? Wie leitest du die anderen davon ab?',
      expectedInsight: 'Ich kann mir das Rechnen erleichtern, indem ich von bekannten Verdopplungen ausgehe.'
    };
  }

  /**
   * KERNAUFGABEN ZUR 10 (Gaidoschik: Grundaufgaben)
   * Beispiel: 5+5=10, 6+4=10, 7+3=10, 6+5=11
   * Didaktik: Partnerzahlen zur 10 + Herleiten darüber hinaus
   */
  private generateCoreTaskToTen(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const tasks: any[] = [];

    // Partnerzahlen zur 10: 5+5, 6+4, 7+3, 8+2, 9+1
    const partnersToTen = [
      { number1: 5, number2: 5 },
      { number1: 6, number2: 4 },
      { number1: 7, number2: 3 },
      { number1: 8, number2: 2 }
    ];

    // Ersten 2-3 Aufgaben: Partnerzahlen zur 10
    for (let i = 0; i < Math.min(3, length); i++) {
      const partner = partnersToTen[i % partnersToTen.length];
      tasks.push({ 
        number1: partner.number1, 
        number2: partner.number2, 
        operation: '+',
        correctAnswer: partner.number1 + partner.number2,
        taskType: 'core_task_to_ten',
        numberRange: 20,
        placeholderPosition: 'end'
      });
    }

    // Rest: Herleiten über 10 hinaus (z.B. 6+5 = 5+5+1)
    for (let i = 3; i < length; i++) {
      const partner = partnersToTen[(i - 3) % partnersToTen.length];
      const num1 = partner.number1;
      const num2 = partner.number2 + 1;
      tasks.push({
        number1: num1,
        number2: num2,
        operation: '+',
        correctAnswer: num1 + num2,
        taskType: 'core_task_to_ten',
        numberRange: 20,
        placeholderPosition: 'end'
      });
    }

    return {
      tasks,
      pattern: 'core_task_to_ten',
      didacticFocus: 'Partnerzahlen zur 10 automatisieren, dann darüber hinaus herleiten',
      learningGoal: 'Partnerzahlen zur 10 erkennen und zum Rechnen nutzen',
      reflectionQuestion: 'Welche Partnerzahl zur 10 hilft dir? Wie leitest du 6+5 von 5+5 ab?',
      expectedInsight: 'Ich kann Aufgaben lösen, indem ich erst zur 10 ergänze und dann den Rest hinzufüge.'
    };
  }

  /**
   * ANALOGIE-PÄCKCHEN (Wittmann: Operative Päckchen mit Stellenwert-Transfer)
   * Beispiel: 3+4=7, 13+4=17, 23+4=27, 33+4=37
   * Didaktik: Zeigt, dass Kernaufgaben im ZR10 auf größere Zahlen übertragbar sind
   */
  private generateAnalogyPlaceValue(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const tasks: any[] = [];

    // Basis-Aufgabe im ZR10
    const base1 = baseTask.number1 % 10;
    const base2 = baseTask.number2 % 10;

    // Päckchen: 0er, 10er, 20er, 30er, ... Stellenwert
    for (let i = 0; i < length; i++) {
      const num1 = base1 + (i * 10);
      const num2 = base2;
      const correctAnswer = baseTask.operation === '+' 
        ? num1 + num2 
        : num1 - num2;
      
      tasks.push({
        number1: num1,
        number2: num2,
        operation: baseTask.operation,
        correctAnswer,
        taskType: 'analogy_place_value',
        numberRange: 100,
        placeholderPosition: 'end'
      });
    }

    return {
      tasks,
      pattern: 'analogy_place_value',
      didacticFocus: 'Kernaufgaben auf größere Zahlen übertragen (Analogiebildung nach Wittmann)',
      learningGoal: 'Erkennen, dass die Rechenstrategie für kleine Zahlen auch für größere gilt',
      reflectionQuestion: 'Was bleibt gleich? Was ändert sich? Wie hilft dir 3+4=7 bei 23+4?',
      expectedInsight: 'Wenn ich 3+4=7 kann, kann ich auch 13+4=17, 23+4=27 und so weiter.'
    };
  }

  /**
   * HERLEITE-PÄCKCHEN: Mehrere Wege zur gleichen Lösung (Gaidoschik)
   * Beispiel für 6+7=13:
   * - Weg 1: 6+6+1 (Verdopplung)
   * - Weg 2: 7+7-1 (Verdopplung)
   * - Weg 3: 6+4+3 (zur 10)
   * - Weg 4: 5+5+3 (von 5+5=10)
   *
   * Didaktik: Zeigt, dass es VIELE Wege gibt - Kind wählt seinen Favoriten
   */
  private generateDerivationMultiPath(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const { number1, number2, operation } = baseTask;
    const tasks: any[] = [];

    if (operation === '+') {
      const sum = number1 + number2;

      // Weg 1: Original-Aufgabe (als Referenz)
      tasks.push({ 
        number1, 
        number2, 
        operation,
        correctAnswer: sum,
        taskType: 'derivation_multi_path',
        numberRange: 20,
        placeholderPosition: 'end'
      });

      // Weg 2: Verdopplung von kleinerer Zahl (wenn Fast-Verdopplung)
      if (Math.abs(number1 - number2) <= 2 && number1 !== number2) {
        const smaller = Math.min(number1, number2);
        tasks.push({ 
          number1: smaller, 
          number2: smaller, 
          operation,
          correctAnswer: smaller + smaller,
          taskType: 'derivation_multi_path',
          numberRange: 20,
          placeholderPosition: 'end'
        });
      }

      // Weg 3: Zur 10 zerlegen (wenn sum > 10)
      if (sum > 10 && number1 < 10) {
        const toTen = 10 - number1;
        tasks.push({ 
          number1, 
          number2: toTen, 
          operation,
          correctAnswer: number1 + toTen,
          taskType: 'derivation_multi_path',
          numberRange: 20,
          placeholderPosition: 'end'
        });
      }

      // Weg 4: Von 5+5=10 ableiten (wenn sum >= 10)
      if (sum >= 10) {
        tasks.push({ 
          number1: 5, 
          number2: 5, 
          operation,
          correctAnswer: 10,
          taskType: 'derivation_multi_path',
          numberRange: 20,
          placeholderPosition: 'end'
        });
      }
    } else if (operation === '-') {
      tasks.push({ 
        number1, 
        number2, 
        operation,
        correctAnswer: number1 - number2,
        taskType: 'derivation_multi_path',
        numberRange: 20,
        placeholderPosition: 'end'
      });
    }

    // Fülle auf gewünschte Länge auf, falls weniger Wege generiert wurden
    while (tasks.length < length && tasks.length > 0) {
      tasks.push(tasks[0]);
    }

    return {
      tasks: tasks.slice(0, length),
      pattern: 'derivation_multi_path',
      didacticFocus: 'Verschiedene Herleite-Wege vergleichen - welcher ist für DICH am leichtesten?',
      learningGoal: 'Entdecken, dass es mehrere Lösungswege für eine Aufgabe gibt',
      expectedInsight: 'Man kann eine Aufgabe auf verschiedene Arten lösen. Ich suche mir den Weg aus, der für mich am einfachsten ist.'
    };
  }

  /**
   * Generiert ein gemischtes Paket mit verschiedenen Mustern
   */
  generateMixedPackage(numberRange: number, difficulty: number): OperativePackage {
    const patterns: OperativePattern[] = [
      'constant_sum', // Changed from 'sum_constancy' to 'constant_sum'
      'neighbor_tasks',
      'exchange', // Changed from 'reversal' to 'exchange'
      'analogy_place_value' // Changed from 'analogy' to 'analogy_place_value'
    ];

    const allTasks: Task[] = [];

    patterns.forEach(pattern => {
      // Use generatePackage for existing patterns
      const pkg = this.generatePackage(pattern, numberRange, difficulty);
      allTasks.push(...pkg.tasks.slice(0, 2)); // 2 Aufgaben pro Muster
    });

    // Mischen
    const shuffled = allTasks.sort(() => Math.random() - 0.5);

    return {
      pattern: 'exchange', // Dummy pattern, actual patterns are mixed
      tasks: shuffled,
      reflectionQuestion: 'Kannst du verschiedene Muster in diesen Aufgaben erkennen?',
      learningGoal: 'Verschiedene mathematische Strukturen erkennen und nutzen',
      expectedInsight: 'Es gibt viele Tricks und Muster, die mir beim Rechnen helfen.'
    };
  }

  // --- HILFSFUNKTIONEN für die neuen Päckchen-Typen ---

  /**
   * Generiert Päckchen für 'constant_sum'
   */
  private generateConstantSum(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: any[] = [];
    const sum = baseTask.number1 + baseTask.number2;
    for (let i = 0; i < length; i++) {
      const num1 = baseTask.number1 + i;
      const num2 = sum - num1;
      tasks.push({
        taskType: 'constant_sum',
        operation: '+',
        number1: num1,
        number2: num2,
        correctAnswer: sum,
        numberRange: 20,
        placeholderPosition: 'end',
      });
    }
    return {
      pattern: 'constant_sum',
      tasks,
      reflectionQuestion: 'Was bleibt bei diesen Aufgaben gleich?',
      learningGoal: 'Erkennen der Konstanz der Summe bei Veränderung der Summanden',
      expectedInsight: 'Auch wenn sich die Zahlen ändern, bleibt die Summe gleich.'
    };
  }

  /**
   * Generiert Päckchen für 'constant_difference'
   */
  private generateConstantDifference(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: Task[] = [];
    const diff = baseTask.number1 - baseTask.number2;
    for (let i = 0; i < length; i++) {
      const num1 = baseTask.number1 + i;
      const num2 = num1 - diff;
      tasks.push({
        taskType: 'constant_difference',
        operation: '-',
        number1: num1,
        number2: num2,
        correctAnswer: diff,
        numberRange: 20, // Assuming a default range
        placeholderPosition: 'end',
      });
    }
    return {
      pattern: 'constant_difference',
      tasks,
      reflectionQuestion: 'Was bleibt bei diesen Aufgaben gleich?',
      learningGoal: 'Erkennen der Konstanz der Differenz',
      expectedInsight: 'Wenn ich beide Zahlen gleichmäßig erhöhe, bleibt die Differenz gleich.'
    };
  }

  /**
   * Generiert Päckchen für 'plus_minus_one'
   */
  private generatePlusMinusOne(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: Task[] = [];
    for (let i = 0; i < length; i++) {
      tasks.push({
        taskType: 'plus_minus_one',
        operation: baseTask.operation,
        number1: baseTask.number1,
        number2: baseTask.number2 + i,
        correctAnswer: baseTask.number1 + (baseTask.number2 + i),
        numberRange: 20, // Assuming a default range
        placeholderPosition: 'end',
      });
    }
    return {
      pattern: 'plus_minus_one',
      tasks,
      reflectionQuestion: 'Was ändert sich bei jeder Aufgabe?',
      learningGoal: 'Verstehen des Effekts von +1/-1 beim Summanden/Subtrahenden',
      expectedInsight: 'Eine Änderung um 1 beim zweiten Summanden ändert das Ergebnis um 1.'
    };
  }

  /**
   * Generiert Päckchen für 'exchange'
   */
  private generateExchange(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: Task[] = [];
    tasks.push({
      taskType: 'exchange',
      operation: baseTask.operation,
      number1: baseTask.number1,
      number2: baseTask.number2,
      correctAnswer: baseTask.operation === '+' ? baseTask.number1 + baseTask.number2 : baseTask.number1 - baseTask.number2,
      numberRange: 20, // Assuming a default range
      placeholderPosition: 'end',
    });
    // Note: Subtraction is not commutative, so the second task might not be a true "exchange" if operation is '-'
    // However, the pattern name 'exchange' implies testing commutativity, so we generate the swapped version.
    tasks.push({
      taskType: 'exchange',
      operation: baseTask.operation,
      number1: baseTask.number2,
      number2: baseTask.number1,
      correctAnswer: baseTask.operation === '+' ? baseTask.number2 + baseTask.number1 : baseTask.number2 - baseTask.number1,
      numberRange: 20, // Assuming a default range
      placeholderPosition: 'end',
    });
    return {
      pattern: 'exchange',
      tasks,
      reflectionQuestion: 'Was stellst du bei den Aufgaben fest?',
      learningGoal: 'Kommutativgesetz (Addition) und Auswirkung der Reihenfolge (Subtraktion)',
      expectedInsight: 'Bei der Addition spielt die Reihenfolge keine Rolle.'
    };
  }

  /**
   * Generiert Päckchen für 'inverse'
   */
  private generateInverse(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: Task[] = [];
    const sum = baseTask.number1 + baseTask.number2; // Assuming addition for inverse relationship
    tasks.push({
      taskType: 'inverse',
      operation: '+',
      number1: baseTask.number1,
      number2: baseTask.number2,
      correctAnswer: sum,
      numberRange: 20, // Assuming a default range
      placeholderPosition: 'end',
    });
    tasks.push({
      taskType: 'inverse',
      operation: '-',
      number1: sum,
      number2: baseTask.number2,
      correctAnswer: baseTask.number1,
      numberRange: 20, // Assuming a default range
      placeholderPosition: 'end',
    });
    tasks.push({
      taskType: 'inverse',
      operation: '-',
      number1: sum,
      number2: baseTask.number1,
      correctAnswer: baseTask.number2,
      numberRange: 20, // Assuming a default range
      placeholderPosition: 'end',
    });
    return {
      pattern: 'inverse',
      tasks,
      reflectionQuestion: 'Wie hängen diese Aufgaben zusammen?',
      learningGoal: 'Verständnis der Umkehroperation von Addition und Subtraktion',
      expectedInsight: 'Addition und Subtraktion sind Gegenteiloperationen.'
    };
  }

  /**
   * Generiert Päckchen für 'decade_steps'
   */
  private generateDecadeSteps(baseTask: { number1: number; number2: number; operation: '+' | '-' }, length: number): OperativePackage {
    const tasks: Task[] = [];
    for (let i = 0; i < length; i++) {
      tasks.push({
        taskType: 'decade_steps',
        operation: baseTask.operation,
        number1: baseTask.number1 + (i * 10),
        number2: baseTask.number2,
        correctAnswer: (baseTask.number1 + (i * 10)) + baseTask.number2,
        numberRange: 100, // Assuming a larger range for decade steps
        placeholderPosition: 'end',
      });
    }
    return {
      pattern: 'decade_steps',
      tasks,
      reflectionQuestion: 'Was ist bei diesen Aufgaben gleich geblieben?',
      learningGoal: 'Sicherer Umgang mit Zehnersprüngen',
      expectedInsight: 'Die Rechenstrategie für 12+5 funktioniert auch für 22+5 und 32+5.'
    };
  }

  // --- NEW PATTERN GENERATORS FOR ASSOCIATIVE AND DISTRIBUTIVE LAW ---

  /**
   * Generiert Päckchen für 'associative_grouping' (Assoziativgesetz)
   * Beispiel: (3+4)+5 vs 3+(4+5)
   */
  private generateAssociativeGrouping(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const tasks: Task[] = [];
    const { number1, number2, operation } = baseTask;

    if (operation === '+') {
      // Example: (a+b)+c vs a+(b+c)
      // We need three numbers for associative law. Let's derive them.
      // We'll use the first two numbers from baseTask and generate a third.
      const num3 = baseTask.number1 > 5 ? Math.floor(baseTask.number1 / 2) : 3; // A simple heuristic for a third number

      // Task 1: (num1 + num2) + num3
      tasks.push({
        taskType: 'associative_grouping',
        operation: '+',
        number1: baseTask.number1,
        number2: baseTask.number2,
        correctAnswer: baseTask.number1 + baseTask.number2, // Intermediate result for grouping
        numberRange: 100, // Assuming a reasonable range
        placeholderPosition: 'end', // Indicates the result of the first group
        // Add a property to indicate the structure, e.g., 'first_group'
        // This would require changes in Task interface or a new field.
        // For now, we'll imply the structure through task generation sequence.
      });

      // Task 2: num1 + (num2 + num3)
      tasks.push({
        taskType: 'associative_grouping',
        operation: '+',
        number1: baseTask.number1,
        number2: baseTask.number2 + num3,
        correctAnswer: baseTask.number1 + baseTask.number2 + num3, // Final result
        numberRange: 100,
        placeholderPosition: 'end',
        // This task shows the second grouping.
      });

      // To make it more explicit, we might need to generate tasks that represent the grouping explicitly.
      // For simplicity, we'll generate two tasks that, when evaluated in order, demonstrate the principle.
      // A more robust solution would involve a more complex task structure or generation logic.

    } else if (operation === '-') {
      // Associative law does not apply directly to subtraction in the same way.
      // (a-b)-c is not equal to a-(b-c) in general.
      // We will skip generating for subtraction in this pattern.
      console.warn("Associative grouping does not apply to subtraction in the same way. Skipping.");
    }

    // Ensure we have at least one task if generation failed for some reason
    if (tasks.length === 0) {
      tasks.push({
        taskType: 'associative_grouping',
        operation: '+',
        number1: 1,
        number2: 1,
        correctAnswer: 2,
        numberRange: 20,
        placeholderPosition: 'end',
      });
    }


    return {
      tasks: tasks.slice(0, length), // Limit to desired length
      pattern: 'associative_grouping',
      didacticFocus: 'Assoziativgesetz: Zeigt, dass die Reihenfolge der Gruppierung bei Addition keine Rolle spielt.',
      learningGoal: 'Entdecken, dass man Zahlen beliebig gruppieren kann, um das Rechnen zu erleichtern.',
      reflectionQuestion: 'Vergleiche die beiden Aufgaben. Was stellst du fest? Wie kannst du dir das Rechnen damit einfacher machen?',
      expectedInsight: 'Es ist egal, ob ich zuerst (3+4) rechne und dann +5, oder ob ich zuerst (4+5) rechne und dann 3 dazu. Das Ergebnis ist immer dasselbe.'
    };
  }

  /**
   * Generiert Päckchen für 'distributive_decomposition' (Distributivgesetz)
   * Beispiel: 7×9 = 7×(10-1) = 7×10 - 7×1
   */
  private generateDistributiveDecomposition(
    baseTask: { number1: number; number2: number; operation: '+' | '-' },
    length: number
  ): OperativePackage {
    const tasks: Task[] = [];
    const { number1, number2, operation } = baseTask;

    // This pattern is primarily for multiplication, demonstrating distribution.
    // We'll adapt if number1 or number2 suggest a multiplication context.
    if (operation === '*') { // Assuming '*' for multiplication
      const factor = number1;
      const originalNumber = number2;

      // Example decomposition: factor * number = factor * (ten - rest)
      // Find a "nice" number (like 10) close to 'originalNumber'
      const closestTen = Math.round(originalNumber / 10) * 10;
      let decomposedPart1: number;
      let decomposedPart2: number;
      let sign: '+' | '-' = '+';

      if (originalNumber < closestTen) {
        decomposedPart1 = closestTen;
        decomposedPart2 = closestTen - originalNumber;
        sign = '-';
      } else { // originalNumber >= closestTen
        decomposedPart1 = closestTen;
        decomposedPart2 = originalNumber - closestTen;
        sign = '+';
      }

      // Task 1: factor * (decomposedPart1 +/- decomposedPart2)
      tasks.push({
        taskType: 'distributive_decomposition',
        operation: '*', // Multiplication
        number1: factor,
        number2: originalNumber, // The number being decomposed
        correctAnswer: factor * originalNumber, // The final answer
        numberRange: 100, // Assuming a range
        placeholderPosition: 'end',
        // Indicate the structure: factor * (part1 +/- part2)
        // This requires a more complex Task interface or specific handling.
        // For now, we'll use task generation sequence and reflection.
      });

      // Task 2: Represents the step of distribution: factor * decomposedPart1 +/- factor * decomposedPart2
      // This is the core of the distributive law demonstration.
      tasks.push({
        taskType: 'distributive_decomposition',
        operation: '*',
        number1: factor,
        number2: decomposedPart1, // First part of decomposition
        correctAnswer: factor * decomposedPart1, // Intermediate result
        numberRange: 100,
        placeholderPosition: 'end',
      });

      // Task 3: The second part of the distribution
      tasks.push({
        taskType: 'distributive_decomposition',
        operation: '*',
        number1: factor,
        number2: decomposedPart2, // Second part of decomposition
        correctAnswer: factor * decomposedPart2, // Intermediate result
        numberRange: 100,
        placeholderPosition: 'end',
      });

      // Optionally, include the final calculation: (factor * decomposedPart1) +/- (factor * decomposedPart2)
      // This requires calculating the final answer based on the sign.
      let finalAnswer: number;
      if (sign === '-') {
        finalAnswer = (factor * decomposedPart1) - (factor * decomposedPart2);
      } else {
        finalAnswer = (factor * decomposedPart1) + (factor * decomposedPart2);
      }

      tasks.push({
        taskType: 'distributive_decomposition',
        operation: '+', // Or '-', depending on the sign used in decomposition
        number1: factor * decomposedPart1,
        number2: factor * decomposedPart2,
        correctAnswer: finalAnswer,
        numberRange: 100,
        placeholderPosition: 'end',
      });

    } else {
      console.warn("Distributive decomposition is primarily for multiplication. Skipping for operation:", operation);
    }

    // Ensure at least one task if generation failed
    if (tasks.length === 0) {
      tasks.push({
        taskType: 'distributive_decomposition',
        operation: '*',
        number1: 7,
        number2: 9,
        correctAnswer: 63,
        numberRange: 20,
        placeholderPosition: 'end',
      });
    }

    return {
      tasks: tasks.slice(0, length), // Limit to desired length
      pattern: 'distributive_decomposition',
      didacticFocus: 'Distributivgesetz: Zerlegen von Aufgaben (z.B. 7x9 = 7x(10-1)) um sie einfacher zu lösen.',
      learningGoal: 'Erkennen, wie man Multiplikationsaufgaben durch Zerlegen löst.',
      reflectionQuestion: 'Wie hast du die Aufgabe 7x9 zerlegt? Welche Zerlegung hilft dir am besten? Warum?',
      expectedInsight: 'Ich kann mir die Multiplikation erleichtern, indem ich eine Zahl zerlege (z.B. 9 = 10-1) und dann die Teile einzeln multipliziere und addiere/subtrahiere.'
    };
  }


  // --- LEGACY HELPER FUNCTIONS (for patterns defined in generatePackage) ---
  // These are kept for compatibility but might be refactored or removed later
  // if the `generate` method becomes the sole entry point.

  // Note: The original `generatePackage` method used different pattern names than the `OperativePattern` type.
  // I've corrected the `taskType` and `pattern` properties within the `generatePackage` methods
  // to match the `OperativePattern` type for consistency.
  // For example, 'sum_constancy' is now 'constant_sum', 'reversal' is 'exchange', etc.
  // If these are intended to be distinct patterns, the `OperativePattern` type would need adjustment.
}

export const operativePackageGenerator = new OperativePackageGenerator();