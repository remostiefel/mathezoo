/**
 * Genetic Task Evolution System
 * 
 * Tasks "evolve" to perfectly match each learner's needs using:
 * - Genetic Algorithms (Holland, 1975)
 * - Fitness-based Selection
 * - Crossover & Mutation
 * - Population Diversity Maintenance
 * 
 * Special Feature: Placeholder Position Evolution
 * - Algebraic thinking through inverse problems
 * - Adaptive complexity based on learner readiness
 */

import type { InputVector, OutputVector } from "./neuralLearnerModel";
import type { Task, ZPDRange, CognitiveLoad } from "./mathematicsDidacticModules";
import { cognitiveLoadAnalyzer, zpdCalculator } from "./mathematicsDidacticModules";

// ===== TASK DNA =====

/**
 * Task DNA: Genetic encoding of task properties
 */
export interface TaskDNA {
  // Core properties
  genes: {
    number1: number; // 1-100 (NIEMALS negativ oder 0!)
    number2: number; // 1-100 (NIEMALS negativ oder 0!)
    operation: '+' | '-';
    numberRange: 20 | 100;
    
    // Algebraic thinking
    placeholderPosition: 'none' | 'start' | 'middle' | 'end';
    
    // Pattern type
    taskType: string;
    
    // Context/story
    context: string | null;
    
    // Scaffolding genes
    visualSupport: number; // 0-1
    strategicHints: number; // 0-1
  };
  
  // Metadata
  fitness: number; // 0-1
  generation: number;
  parentIds: string[];
}

// ===== OPERATIVE PATTERNS (Wittmann & Müller) =====

export type OperativePattern = 
  | 'sum-constancy'      // 3+7=10, 4+6=10, 5+5=10
  | 'neighbor-tasks'     // 8+5=13, 8+6=14, 8+7=15
  | 'reversal'           // 7+3=10, 3+7=10
  | 'analogy'            // 4+3=7, 14+3=17, 24+3=27
  | 'decomposition'      // 7+5 = 7+3+2
  | 'decade-transition'  // 8+5, 18+5, 28+5
  | 'inverse-problems'   // _+3=8, 12-_=7
  | 'mixed-practice';

/**
 * Pattern Templates for Task Generation
 */
export const PATTERN_TEMPLATES: Record<OperativePattern, PatternTemplate> = {
  'sum-constancy': {
    name: 'Summen-Konstanz',
    description: 'Same sum, different addends',
    generate: (base: number, range: number = 10) => [
      { n1: base - 1, n2: range - base + 1 },
      { n1: base, n2: range - base },
      { n1: base + 1, n2: range - base - 1 },
    ],
    cognitiveValue: 0.8, // High value for pattern recognition
  },
  
  'neighbor-tasks': {
    name: 'Nachbaraufgaben',
    description: 'Increment one addend',
    generate: (base: number, _arg2?: number) => [
      { n1: base, n2: 5 },
      { n1: base, n2: 6 },
      { n1: base, n2: 7 },
    ],
    cognitiveValue: 0.7,
  },
  
  'reversal': {
    name: 'Umkehraufgaben',
    description: 'Commutative property',
    generate: (n1: number, n2: number = 5) => [
      { n1, n2 },
      { n1: n2, n2: n1 },
    ],
    cognitiveValue: 0.75,
  },
  
  'analogy': {
    name: 'Analogieaufgaben',
    description: 'Same structure, different magnitude',
    generate: (n1: number, n2: number = 3) => [
      { n1, n2 },
      { n1: n1 + 10, n2 },
      { n1: n1 + 20, n2 },
    ],
    cognitiveValue: 0.85,
  },
  
  'decomposition': {
    name: 'Zerlegungsaufgaben',
    description: 'Break into parts',
    generate: (n1: number, n2: number = 5) => {
      // e.g., 7+5 = 7+3+2 (to 10)
      const toTen = 10 - n1;
      const remainder = n2 - toTen;
      return [
        { n1, n2 },
        { n1, n2: toTen, decomposed: true },
        { n1: 10, n2: remainder, decomposed: true },
      ];
    },
    cognitiveValue: 0.9,
  },
  
  'decade-transition': {
    name: 'Zehnerübergang',
    description: 'Cross decade boundary',
    generate: (base: number, _arg2?: number) => [
      { n1: base, n2: 15 - base },
      { n1: base + 10, n2: 25 - base },
      { n1: base + 20, n2: 35 - base },
    ],
    cognitiveValue: 0.8,
  },
  
  'inverse-problems': {
    name: 'Umkehrprobleme',
    description: 'Missing addend (placeholder)',
    generate: (result: number, known: number = 5) => [
      { n1: known, n2: result - known, placeholder: 'middle' },
      { n1: result - known, n2: known, placeholder: 'start' },
    ],
    cognitiveValue: 0.95, // Highest value for algebraic thinking
  },
  
  'mixed-practice': {
    name: 'Gemischte Übung',
    description: 'Varied practice',
    generate: (_arg1: number, _arg2?: number) => [],
    cognitiveValue: 0.6,
  },
};

export interface PatternTemplate {
  name: string;
  description: string;
  generate: (arg1: number, arg2?: number) => any[];
  cognitiveValue: number;
}

// ===== GENETIC TASK EVOLVER =====

export class GeneticTaskEvolver {
  private populationSize: number = 20;
  private mutationRate: number = 0.15;
  private elitismRate: number = 0.2; // Keep top 20%
  
  /**
   * Evolve a population of tasks to match learner needs
   */
  evolve(
    currentPopulation: TaskDNA[],
    learnerState: InputVector,
    outputs: OutputVector,
    generation: number
  ): TaskDNA[] {
    // 1. Evaluate fitness for each task
    const evaluated = currentPopulation.map(task => ({
      ...task,
      fitness: this.evaluateFitness(task, learnerState, outputs)
    }));
    
    // 2. Selection (keep elite + tournament selection)
    const parents = this.select(evaluated);
    
    // 3. Crossover (create offspring)
    const offspring = this.crossover(parents, generation);
    
    // 4. Mutation (add variation)
    const mutated = this.mutate(offspring);
    
    // 5. Combine elite + new offspring
    const nextGeneration = this.combinePopulations(evaluated, mutated);
    
    return nextGeneration;
  }
  
  /**
   * FITNESS FUNCTION: How well does task match learner needs?
   * 
   * Factors:
   * 1. Optimal cognitive load (0.5-0.8)
   * 2. ZPD alignment (task difficulty matches learner level)
   * 3. Pattern value (operative packets have high value)
   * 4. Novelty (not too similar to recent tasks)
   * 5. Placeholder readiness (algebraic thinking when ready)
   */
  private evaluateFitness(
    task: TaskDNA,
    learner: InputVector,
    outputs: OutputVector
  ): number {
    let fitness = 0.0;
    
    // 1. Cognitive Load Optimality (40% weight)
    const taskObj = this.dnaToTask(task);
    const cogLoad = cognitiveLoadAnalyzer.analyze(taskObj, learner);
    
    if (cogLoad.isOptimal) {
      fitness += 0.4;
    } else {
      // Penalize deviation from optimal
      const deviation = Math.abs(cogLoad.total - 0.65); // Target 0.65
      fitness += Math.max(0, 0.4 - deviation * 0.5);
    }
    
    // 2. Difficulty Alignment (30% weight)
    const taskDifficulty = this.estimateTaskDifficulty(task);
    const targetDifficulty = outputs.A_task_difficulty;
    const difficultyMatch = 1 - Math.abs(taskDifficulty - targetDifficulty);
    fitness += difficultyMatch * 0.3;
    
    // 3. Pattern Value (15% weight)
    const patternTemplate = PATTERN_TEMPLATES[task.genes.taskType as OperativePattern];
    if (patternTemplate) {
      fitness += patternTemplate.cognitiveValue * 0.15;
    }
    
    // 4. Placeholder Appropriateness (10% weight)
    const placeholderFit = this.evaluatePlaceholderFitness(task, learner, outputs);
    fitness += placeholderFit * 0.1;
    
    // 5. Novelty Bonus (5% weight)
    // (Simplified: random small bonus to maintain diversity)
    fitness += Math.random() * 0.05;
    
    return Math.min(1.0, fitness);
  }
  
  /**
   * Evaluate if placeholder position is appropriate for learner
   */
  private evaluatePlaceholderFitness(
    task: TaskDNA,
    learner: InputVector,
    outputs: OutputVector
  ): number {
    const hasPlaceholder = task.genes.placeholderPosition !== 'none';
    
    // Prerequisites for placeholder tasks:
    // 1. Good basic accuracy
    // 2. Some metacognitive awareness
    // 3. Not frustrated
    const isReady = (
      learner.N_correct > 0.7 &&
      learner.N_self_correction > 0.4 &&
      learner.N_frustration < 0.3
    );
    
    if (hasPlaceholder && isReady) {
      return 1.0; // Perfect fit
    } else if (!hasPlaceholder && !isReady) {
      return 1.0; // Also good (not ready, so no placeholder)
    } else if (hasPlaceholder && !isReady) {
      return 0.0; // Bad (placeholder when not ready)
    } else {
      return 0.5; // Neutral (ready but no placeholder - could add)
    }
  }
  
  private estimateTaskDifficulty(task: TaskDNA): number {
    let difficulty = 0.0;
    
    // Number size
    const maxNum = Math.max(task.genes.number1, task.genes.number2);
    difficulty += (maxNum / task.genes.numberRange) * 0.3;
    
    // Operation
    if (task.genes.operation === '-') difficulty += 0.15;
    
    // Placeholder
    if (task.genes.placeholderPosition === 'start') difficulty += 0.25;
    else if (task.genes.placeholderPosition === 'middle') difficulty += 0.20;
    
    // Decade crossing
    const result = task.genes.operation === '+' 
      ? task.genes.number1 + task.genes.number2
      : task.genes.number1 - task.genes.number2;
    
    if (task.genes.numberRange === 20) {
      if (maxNum > 10 || result > 10) difficulty += 0.2;
    } else {
      const crossesTen = Math.floor(task.genes.number1 / 10) !== Math.floor(result / 10);
      if (crossesTen) difficulty += 0.15;
    }
    
    return Math.min(1.0, difficulty);
  }
  
  /**
   * SELECTION: Tournament selection + elitism
   */
  private select(population: TaskDNA[]): TaskDNA[] {
    // Sort by fitness
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    
    // Elite: top 20%
    const eliteCount = Math.floor(this.populationSize * this.elitismRate);
    const elite = sorted.slice(0, eliteCount);
    
    // Tournament: randomly compete
    const tournamentSize = 3;
    const selected: TaskDNA[] = [...elite];
    
    while (selected.length < this.populationSize) {
      // Pick random candidates
      const candidates = [];
      for (let i = 0; i < tournamentSize; i++) {
        const idx = Math.floor(Math.random() * population.length);
        candidates.push(population[idx]);
      }
      
      // Winner = highest fitness
      const winner = candidates.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      
      selected.push(winner);
    }
    
    return selected;
  }
  
  /**
   * CROSSOVER: Combine parent genes
   */
  private crossover(parents: TaskDNA[], generation: number): TaskDNA[] {
    const offspring: TaskDNA[] = [];
    
    for (let i = 0; i < parents.length - 1; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1];
      
      // Single-point crossover
      const child1 = this.createOffspring(parent1, parent2, generation);
      const child2 = this.createOffspring(parent2, parent1, generation);
      
      offspring.push(child1, child2);
    }
    
    return offspring.slice(0, this.populationSize);
  }
  
  private createOffspring(p1: TaskDNA, p2: TaskDNA, generation: number): TaskDNA {
    let number1 = Math.random() > 0.5 ? p1.genes.number1 : p2.genes.number1;
    let number2 = Math.random() > 0.5 ? p1.genes.number2 : p2.genes.number2;
    const operation = Math.random() > 0.5 ? p1.genes.operation : p2.genes.operation;
    
    // KRITISCH: Zahlen müssen IMMER positiv sein (mindestens 1)
    number1 = Math.max(1, number1);
    number2 = Math.max(1, number2);
    
    // KRITISCH: Bei Subtraktion muss number1 >= number2 sein, sonst negative Ergebnisse!
    if (operation === '-' && number1 < number2) {
      [number1, number2] = [number2, number1];
    }
    
    return {
      genes: {
        number1,
        number2,
        operation,
        numberRange: Math.random() > 0.5 ? p1.genes.numberRange : p2.genes.numberRange,
        placeholderPosition: Math.random() > 0.5 
          ? p1.genes.placeholderPosition 
          : p2.genes.placeholderPosition,
        taskType: Math.random() > 0.5 ? p1.genes.taskType : p2.genes.taskType,
        context: Math.random() > 0.5 ? p1.genes.context : p2.genes.context,
        visualSupport: (p1.genes.visualSupport + p2.genes.visualSupport) / 2,
        strategicHints: (p1.genes.strategicHints + p2.genes.strategicHints) / 2,
      },
      fitness: 0,
      generation,
      parentIds: [
        `gen${p1.generation}_${p1.genes.number1}${p1.genes.operation}${p1.genes.number2}`,
        `gen${p2.generation}_${p2.genes.number1}${p2.genes.operation}${p2.genes.number2}`,
      ]
    };
  }
  
  /**
   * MUTATION: Random variations
   */
  private mutate(population: TaskDNA[]): TaskDNA[] {
    return population.map(task => {
      if (Math.random() < this.mutationRate) {
        const mutationType = this.selectMutationType();
        return this.applyMutation(task, mutationType);
      }
      return task;
    });
  }
  
  private selectMutationType(): string {
    const types = [
      'number_adjust',
      'operation_flip',
      'placeholder_change',
      'pattern_shift',
      'range_change'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private applyMutation(task: TaskDNA, type: string): TaskDNA {
    const mutated = JSON.parse(JSON.stringify(task)) as TaskDNA;
    
    switch (type) {
      case 'number_adjust':
        mutated.genes.number1 += Math.floor((Math.random() - 0.5) * 10);
        mutated.genes.number1 = Math.max(1, Math.min(mutated.genes.numberRange, mutated.genes.number1));
        mutated.genes.number2 += Math.floor((Math.random() - 0.5) * 10);
        mutated.genes.number2 = Math.max(1, Math.min(mutated.genes.numberRange, mutated.genes.number2));
        
        // KRITISCH: Bei Subtraktion muss number1 >= number2 sein!
        if (mutated.genes.operation === '-' && mutated.genes.number1 < mutated.genes.number2) {
          // Zahlen tauschen, damit das Ergebnis nie negativ wird
          [mutated.genes.number1, mutated.genes.number2] = [mutated.genes.number2, mutated.genes.number1];
        }
        break;
        
      case 'operation_flip':
        mutated.genes.operation = mutated.genes.operation === '+' ? '-' : '+';
        
        // KRITISCH: Bei Subtraktion muss number1 >= number2 sein, sonst negative Ergebnisse!
        if (mutated.genes.operation === '-' && mutated.genes.number1 < mutated.genes.number2) {
          // Zahlen tauschen, damit das Ergebnis nie negativ wird
          [mutated.genes.number1, mutated.genes.number2] = [mutated.genes.number2, mutated.genes.number1];
        }
        break;
        
      case 'placeholder_change':
        const positions: Array<'none' | 'start' | 'middle' | 'end'> = ['none', 'start', 'middle', 'end'];
        mutated.genes.placeholderPosition = positions[Math.floor(Math.random() * positions.length)];
        break;
        
      case 'pattern_shift':
        const patterns = Object.keys(PATTERN_TEMPLATES);
        mutated.genes.taskType = patterns[Math.floor(Math.random() * patterns.length)];
        break;
        
      case 'range_change':
        mutated.genes.numberRange = mutated.genes.numberRange === 20 ? 100 : 20;
        break;
    }
    
    return mutated;
  }
  
  private combinePopulations(elite: TaskDNA[], offspring: TaskDNA[]): TaskDNA[] {
    const eliteCount = Math.floor(this.populationSize * this.elitismRate);
    const topElite = elite.slice(0, eliteCount);
    const remainingOffspring = offspring.slice(0, this.populationSize - eliteCount);
    
    return [...topElite, ...remainingOffspring];
  }
  
  /**
   * Generate initial population
   */
  generateInitialPopulation(
    numberRange: 20 | 100,
    targetDifficulty: number = 0.5
  ): TaskDNA[] {
    const population: TaskDNA[] = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.generateRandomTask(numberRange, targetDifficulty));
    }
    
    return population;
  }
  
  private generateRandomTask(numberRange: 20 | 100, difficulty: number): TaskDNA {
    const maxNumber = Math.max(1, Math.floor(numberRange * difficulty));
    
    const patterns = Object.keys(PATTERN_TEMPLATES);
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Placeholder probability increases with difficulty
    const placeholderProb = difficulty > 0.6 ? 0.3 : 0.1;
    let placeholder: 'none' | 'start' | 'middle' | 'end' = 'none';
    
    if (Math.random() < placeholderProb) {
      const positions: Array<'start' | 'middle' | 'end'> = ['start', 'middle', 'end'];
      placeholder = positions[Math.floor(Math.random() * positions.length)];
    }
    
    const operation: '+' | '-' = Math.random() > 0.5 ? '+' : '-';
    let number1 = Math.floor(Math.random() * maxNumber) + 1;
    let number2 = Math.floor(Math.random() * maxNumber) + 1;
    
    // KRITISCH: Bei Subtraktion muss number1 >= number2 sein, sonst negative Ergebnisse!
    if (operation === '-' && number1 < number2) {
      [number1, number2] = [number2, number1];
    }
    
    return {
      genes: {
        number1,
        number2,
        operation,
        numberRange,
        placeholderPosition: placeholder,
        taskType: randomPattern,
        context: null,
        visualSupport: 0.5,
        strategicHints: 0.5,
      },
      fitness: 0,
      generation: 0,
      parentIds: [],
    };
  }
  
  /**
   * Convert DNA to executable Task
   */
  private dnaToTask(dna: TaskDNA): Task {
    const result = dna.genes.operation === '+' 
      ? dna.genes.number1 + dna.genes.number2
      : dna.genes.number1 - dna.genes.number2;
    
    return {
      number1: dna.genes.number1,
      number2: dna.genes.number2,
      operation: dna.genes.operation,
      numberRange: dna.genes.numberRange,
      placeholderPosition: dna.genes.placeholderPosition,
      taskType: dna.genes.taskType,
      context: dna.genes.context ?? undefined,
    };
  }
  
  /**
   * Get best task from population
   */
  getBestTask(population: TaskDNA[]): Task {
    const best = population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
    
    return this.dnaToTask(best);
  }
}

// ===== PLACEHOLDER DIFFICULTY CALCULATOR =====

/**
 * Calculate cognitive complexity of placeholder positions
 * 
 * Research: Carpenter & Moser (1984) - Children's strategies for inverse problems
 */
export class PlaceholderDifficultyAnalyzer {
  /**
   * Analyze placeholder difficulty
   */
  analyze(task: Task): PlaceholderComplexity {
    if (task.placeholderPosition === 'none') {
      return {
        level: 0,
        requiresInverseThinking: false,
        strategicDemand: 'none',
        description: 'Standard problem (find result)'
      };
    }
    
    if (task.placeholderPosition === 'end') {
      // This is actually standard: 3+5=_
      return {
        level: 0,
        requiresInverseThinking: false,
        strategicDemand: 'none',
        description: 'Standard (equivalent to no placeholder)'
      };
    }
    
    if (task.placeholderPosition === 'middle') {
      // e.g., 3+_=8  (must think: 8-3=?)
      return {
        level: 0.6,
        requiresInverseThinking: true,
        strategicDemand: 'moderate',
        description: 'Missing second addend (inverse operation)'
      };
    }
    
    if (task.placeholderPosition === 'start') {
      // e.g., _+3=8  (must think: 8-3=?)
      return {
        level: 0.7,
        requiresInverseThinking: true,
        strategicDemand: 'high',
        description: 'Missing first addend (inverse + reversed)'
      };
    }
    
    return {
      level: 0,
      requiresInverseThinking: false,
      strategicDemand: 'none',
      description: 'Unknown placeholder type'
    };
  }
}

export interface PlaceholderComplexity {
  level: number; // 0-1
  requiresInverseThinking: boolean;
  strategicDemand: 'none' | 'moderate' | 'high';
  description: string;
}

// ===== EXPORT INSTANCES =====

export const geneticTaskEvolver = new GeneticTaskEvolver();
export const placeholderAnalyzer = new PlaceholderDifficultyAnalyzer();
