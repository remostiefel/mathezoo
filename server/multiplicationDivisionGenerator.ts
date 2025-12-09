
/**
 * MULTIPLICATION & DIVISION TASK GENERATOR
 * 
 * Wissenschaftlich fundiert nach:
 * - Wittmann (1985): Operative Prinzipien
 * - Gaidoschik (2014): Kernaufgaben & Ableitungsstrategien
 * - Krauthausen (2018): Darstellungen im Mathematikunterricht
 */

import type { 
  MultiplicationTask, 
  DivisionTask, 
  MultiplicationStrategy,
  DivisionStrategy,
  MultiplicationPattern,
  MultiplicationPackage,
  MULTIPLICATION_CORE_TASKS
} from '../shared/multiplication-division-types';

export class MultiplicationDivisionGenerator {
  
  /**
   * STUFE 1: Vorläuferfertigkeiten (ZR20)
   * - Gleichmächtigkeit erkennen
   * - Verdopplung als Einstieg (2×n)
   */
  generatePrerequisiteTasks(level: number): MultiplicationTask[] {
    const tasks: MultiplicationTask[] = [];
    
    if (level === 1) {
      // 2×n (Verdopplung aus Addition bekannt!)
      for (let n = 1; n <= 5; n++) {
        tasks.push({
          operation: '×',
          factor1: 2,
          factor2: n,
          product: 2 * n,
          placeholderPosition: 'product',
          strategy: 'doubling',
          representation: 'groups'
        });
      }
    }
    
    if (level === 2) {
      // 5×n (Kraft der 5, bereits bekannt!)
      for (let n = 1; n <= 4; n++) {
        tasks.push({
          operation: '×',
          factor1: 5,
          factor2: n,
          product: 5 * n,
          placeholderPosition: 'product',
          strategy: 'skip_counting',
          representation: 'array'
        });
      }
    }
    
    return tasks;
  }
  
  /**
   * STUFE 2: Kernaufgaben (1er, 2er, 5er, 10er, Quadrate)
   */
  generateCoreTasksTasks(row: 1 | 2 | 5 | 10 | 'squares'): MultiplicationTask[] {
    const tasks: MultiplicationTask[] = [];
    
    if (row === 'squares') {
      // Quadratzahlen: 1×1 bis 10×10
      for (let n = 1; n <= 10; n++) {
        tasks.push({
          operation: '×',
          factor1: n,
          factor2: n,
          product: n * n,
          placeholderPosition: 'product',
          strategy: 'square_numbers',
          representation: 'area_model'
        });
      }
    } else {
      // Reihen: 1er, 2er, 5er, 10er
      for (let n = 1; n <= 10; n++) {
        tasks.push({
          operation: '×',
          factor1: row,
          factor2: n,
          product: row * n,
          placeholderPosition: 'product',
          strategy: row === 2 ? 'doubling' : 'skip_counting',
          representation: 'array'
        });
      }
    }
    
    return tasks;
  }
  
  /**
   * STUFE 3: Ableiten mit Distributivgesetz (KERNSTRATEGIE!)
   * Beispiel: 7×8 = 7×5 + 7×3 ODER 7×10 - 7×2
   */
  generateDistributiveTasks(factor1: number, factor2: number): MultiplicationPackage {
    const product = factor1 * factor2;
    const tasks: MultiplicationTask[] = [];
    
    // Hauptaufgabe
    tasks.push({
      operation: '×',
      factor1,
      factor2,
      product,
      placeholderPosition: 'product',
      strategy: 'distributive'
    });
    
    // Weg 1: Zerlegung nach unten (z.B. 7×8 = 7×5 + 7×3)
    const split1 = 5;
    const split2 = factor2 - split1;
    tasks.push({
      operation: '×',
      factor1,
      factor2: split1,
      product: factor1 * split1,
      placeholderPosition: 'product',
      strategy: 'distributive'
    });
    tasks.push({
      operation: '×',
      factor1,
      factor2: split2,
      product: factor1 * split2,
      placeholderPosition: 'product',
      strategy: 'distributive'
    });
    
    // Weg 2: Zerlegung nach oben (z.B. 7×8 = 7×10 - 7×2)
    const upper = 10;
    const diff = upper - factor2;
    tasks.push({
      operation: '×',
      factor1,
      factor2: upper,
      product: factor1 * upper,
      placeholderPosition: 'product',
      strategy: 'distributive'
    });
    
    return {
      pattern: 'distributive_split',
      tasks,
      didacticFocus: 'Distributivgesetz: Zerlegung über bekannte Kernaufgaben',
      reflectionQuestion: `Wie kannst du ${factor1}×${factor2} in kleinere Teile zerlegen? Hilft dir die 5 oder die 10?`,
      expectedInsight: `Ich kann ${factor1}×${factor2} berechnen, indem ich ${factor1}×5 + ${factor1}×${split2} ODER ${factor1}×10 - ${factor1}×${diff} rechne!`
    };
  }
  
  /**
   * STUFE 4: Kommutativgesetz (Tauschaufgaben)
   */
  generateCommutativePairs(factor1: number, factor2: number): MultiplicationPackage {
    return {
      pattern: 'commutative_pairs',
      tasks: [
        {
          operation: '×',
          factor1,
          factor2,
          product: factor1 * factor2,
          placeholderPosition: 'product',
          strategy: 'commutative'
        },
        {
          operation: '×',
          factor1: factor2,
          factor2: factor1,
          product: factor1 * factor2,
          placeholderPosition: 'product',
          strategy: 'commutative'
        }
      ],
      didacticFocus: 'Kommutativgesetz: Tauschaufgaben nutzen für leichteren Rechenweg',
      reflectionQuestion: `Was stellst du bei ${factor1}×${factor2} und ${factor2}×${factor1} fest?`,
      expectedInsight: `Die Reihenfolge ist egal! Ich wähle den leichteren Weg: Lieber 2×8 als 8×2!`
    };
  }
  
  /**
   * DIVISION: Umkehraufgaben
   */
  generateDivisionFromMultiplication(factor1: number, factor2: number): DivisionTask[] {
    const product = factor1 * factor2;
    
    return [
      // Aufteilen: "Wie viele Gruppen?"
      {
        operation: '÷',
        dividend: product,
        divisor: factor2,
        quotient: factor1,
        remainder: 0,
        placeholderPosition: 'quotient',
        strategy: 'inverse_multiplication',
        divisionType: 'grouping',
        representation: 'groups'
      },
      // Verteilen: "Wie viele pro Gruppe?"
      {
        operation: '÷',
        dividend: product,
        divisor: factor1,
        quotient: factor2,
        remainder: 0,
        placeholderPosition: 'quotient',
        strategy: 'inverse_multiplication',
        divisionType: 'sharing',
        representation: 'sharing'
      }
    ];
  }
  
  /**
   * Operative Päckchen: Nachbaraufgaben
   * Beispiel: 5×5, 5×6, 5×7 (Ableiten von Quadratzahl)
   */
  generateNeighborTaskPackage(baseNumber: number, length: number = 5): MultiplicationPackage {
    const tasks: MultiplicationTask[] = [];
    
    // Startpunkt: Quadratzahl (falls möglich)
    tasks.push({
      operation: '×',
      factor1: baseNumber,
      factor2: baseNumber,
      product: baseNumber * baseNumber,
      placeholderPosition: 'product',
      strategy: 'square_numbers'
    });
    
    // Nachbaraufgaben
    for (let i = 1; i < length; i++) {
      tasks.push({
        operation: '×',
        factor1: baseNumber,
        factor2: baseNumber + i,
        product: baseNumber * (baseNumber + i),
        placeholderPosition: 'product',
        strategy: 'neighbor_task'
      });
    }
    
    return {
      pattern: 'neighbor_tasks',
      tasks,
      didacticFocus: 'Nachbaraufgaben: Von Kernaufgaben (Quadratzahlen) ableiten',
      reflectionQuestion: `Wie hilft dir ${baseNumber}×${baseNumber} bei ${baseNumber}×${baseNumber+1}?`,
      expectedInsight: `${baseNumber}×${baseNumber+1} ist ${baseNumber}×${baseNumber} plus ${baseNumber}!`
    };
  }
}

export const multiplicationDivisionGenerator = new MultiplicationDivisionGenerator();
