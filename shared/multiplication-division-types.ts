
/**
 * MULTIPLIKATION & DIVISION - TYPE DEFINITIONS
 * 
 * Wissenschaftliche Fundierung:
 * - Wittmann (1985): Operative Prinzipien im Einmaleins
 * - Gaidoschik (2014): Kernaufgaben & Ableiten
 * - Krauthausen (2018): Darstellungen & Modelle
 */

export type MultiplicationOperation = '×' | '*';
export type DivisionOperation = '÷' | ':';
export type ExtendedOperation = '+' | '-' | '×' | '÷';

export type MultiplicationStrategy =
  | 'repeated_addition'      // 3×4 = 4+4+4
  | 'skip_counting'          // 3×4: 4, 8, 12
  | 'doubling'               // 4×6 = 2×12 = 24
  | 'halving'                // 8×5 = 4×10 = 40
  | 'distributive'           // 7×8 = 7×5 + 7×3 ODER 7×10 - 7×2
  | 'commutative'            // 3×7 = 7×3 (leichterer Weg)
  | 'square_numbers'         // 5×5, 6×6, 7×7
  | 'neighbor_task'          // 5×6 = 5×5 + 5
  | 'factor_decomposition'   // 12×5 = 6×10
  | 'retrieval';             // Automatisiert

export type DivisionStrategy =
  | 'grouping'               // 12÷3: "Wie viele 3er-Gruppen?"
  | 'sharing'                // 12÷3: "12 auf 3 verteilen"
  | 'inverse_multiplication' // 12÷3 via 3×? = 12
  | 'repeated_subtraction'   // 12÷3: 12-3-3-3 = 0
  | 'halving'                // 24÷2 = 12
  | 'factor_knowledge'       // 24÷6 via 24=6×4
  | 'retrieval';             // Automatisiert

export interface MultiplicationTask {
  operation: '×';
  factor1: number;
  factor2: number;
  product: number;
  placeholderPosition: 'none' | 'factor1' | 'factor2' | 'product';
  strategy?: MultiplicationStrategy;
  representation?: 'array' | 'groups' | 'number_line' | 'area_model' | 'symbolic';
}

export interface DivisionTask {
  operation: '÷';
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  placeholderPosition: 'none' | 'dividend' | 'divisor' | 'quotient';
  strategy?: DivisionStrategy;
  divisionType: 'grouping' | 'sharing'; // Aufteilen vs. Verteilen
  representation?: 'groups' | 'sharing' | 'number_line' | 'area_model' | 'symbolic';
}

// Kernaufgaben nach Wittmann
export const MULTIPLICATION_CORE_TASKS = {
  // 1er-Reihe (Identität)
  ones: [1,2,3,4,5,6,7,8,9,10].map(n => ({ factor1: 1, factor2: n, product: n })),
  
  // 2er-Reihe (Verdopplung)
  twos: [1,2,3,4,5,6,7,8,9,10].map(n => ({ factor1: 2, factor2: n, product: 2*n })),
  
  // 5er-Reihe (Kraft der 5)
  fives: [1,2,3,4,5,6,7,8,9,10].map(n => ({ factor1: 5, factor2: n, product: 5*n })),
  
  // 10er-Reihe (Stellenwert)
  tens: [1,2,3,4,5,6,7,8,9,10].map(n => ({ factor1: 10, factor2: n, product: 10*n })),
  
  // Quadratzahlen (besonders wichtig!)
  squares: [1,2,3,4,5,6,7,8,9,10].map(n => ({ factor1: n, factor2: n, product: n*n })),
};

// Operative Päckchen für Multiplikation
export type MultiplicationPattern =
  | 'constant_factor'        // 3×2, 3×3, 3×4, 3×5 (ein Faktor konstant)
  | 'commutative_pairs'      // 3×4, 4×3 (Tauschaufgaben)
  | 'distributive_split'     // 7×8, 7×5+7×3, 7×10-7×2
  | 'neighbor_tasks'         // 5×5, 5×6, 5×7 (Nachbaraufgaben)
  | 'doubling_sequence'      // 3×4, 6×2, 12×1 (Verdopplung/Halbierung)
  | 'square_sequence'        // 4×4, 5×5, 6×6 (Quadratzahlen)
  | 'decade_transfer';       // 3×4, 3×40, 3×400 (Stellenwert-Analogie)

export interface MultiplicationPackage {
  pattern: MultiplicationPattern;
  tasks: MultiplicationTask[];
  didacticFocus: string;
  reflectionQuestion: string;
  expectedInsight: string;
}
