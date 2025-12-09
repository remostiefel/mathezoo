/**
 * Mathematics Didactic Modules
 * 
 * Scientifically-grounded modules based on educational research:
 * - Zone of Proximal Development (ZPD) - Vygotsky (1978)
 * - Cognitive Load Theory - Sweller (1988)
 * - Desirable Difficulties - Bjork (1994)
 * - Self-Explanation Effect - Chi et al. (1994)
 * - Embodied Cognition - Lakoff & Núñez (2000)
 * 
 * These modules translate learning theory into computational models
 * that guide the neural network's adaptive decisions.
 */

import type { InputVector, OutputVector } from "./neuralLearnerModel";

// ===== TYPES =====

export interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  numberRange: 20 | 100;
  placeholderPosition: 'none' | 'start' | 'middle' | 'end';
  taskType: string;
  context?: string;
}

export interface TaskResult {
  task: Task;
  isCorrect: boolean;
  timeTaken: number; // seconds
  strategyUsed: string;
  helpRequested: boolean;
  selfCorrected: boolean;
  representationsUsed: string[];
}

export interface ZPDRange {
  lower: number; // Independent level (can do alone)
  optimal: number; // Sweet spot for learning
  upper: number; // Potential level (with help)
  confidence: number; // How certain we are
}

export interface CognitiveLoad {
  intrinsic: number; // Task complexity (0-1)
  extraneous: number; // Unnecessary load (0-1)
  germane: number; // Learning-relevant load (0-1)
  total: number; // Sum
  isOptimal: boolean; // Total in optimal range (0.5-0.8)
}

export interface DesirableDifficulty {
  type: 'spacing' | 'interleaving' | 'variability' | 'generation';
  strength: number; // 0-1
  description: string;
}

// ===== ZPD CALCULATOR (Vygotsky, 1978) =====

/**
 * Zone of Proximal Development Calculator
 * 
 * Research Foundation:
 * Vygotsky (1978): Mind in Society
 * - ZPD = Gap between actual and potential development
 * - Learning occurs in the ZPD with appropriate scaffolding
 * - Tasks too easy = boredom, too hard = frustration
 * 
 * Implementation:
 * - Independent level: Performance without help
 * - Potential level: Performance with optimal scaffolding
 * - Optimal target: Midpoint of ZPD
 */
export class ZPDCalculator {
  /**
   * Calculate current ZPD based on recent performance
   */
  calculate(neuronState: InputVector, recentTasks: TaskResult[]): ZPDRange {
    // 1. Assess independent level (what learner can do alone)
    const independentLevel = this.assessIndependentLevel(neuronState, recentTasks);
    
    // 2. Assess potential level (with help)
    const potentialLevel = this.assessPotentialLevel(neuronState, recentTasks);
    
    // 3. Calculate optimal target (sweet spot)
    const optimal = (independentLevel + potentialLevel) / 2;
    
    // 4. Confidence based on data quality
    const confidence = Math.min(1.0, recentTasks.length / 10);
    
    return {
      lower: independentLevel,
      optimal,
      upper: potentialLevel,
      confidence
    };
  }
  
  private assessIndependentLevel(state: InputVector, tasks: TaskResult[]): number {
    // Filter tasks done independently (no help)
    const independentTasks = tasks.filter(t => !t.helpRequested);
    
    if (independentTasks.length === 0) return 0.3; // Conservative estimate
    
    // Weighted factors
    const correctness = state.N_correct * 0.4;
    const consistency = state.N_consistency * 0.3;
    const retrieval = state.N_retrieval * 0.2;
    const speed = (1 - state.N_speed) * 0.1; // Fast = higher level
    
    return Math.min(1.0, correctness + consistency + retrieval + speed);
  }
  
  private assessPotentialLevel(state: InputVector, tasks: TaskResult[]): number {
    // Consider all tasks (including with help)
    const allTasks = tasks;
    
    if (allTasks.length === 0) return 0.5;
    
    // Success rate with scaffolding
    const successRate = allTasks.filter(t => t.isCorrect).length / allTasks.length;
    
    // Learning velocity (improvement over time)
    const learningVelocity = this.calculateLearningVelocity(tasks);
    
    // Strategy flexibility
    const flexibility = state.N_strategy_flexibility;
    
    return Math.min(1.0, 
      successRate * 0.5 + 
      learningVelocity * 0.3 + 
      flexibility * 0.2
    );
  }
  
  private calculateLearningVelocity(tasks: TaskResult[]): number {
    if (tasks.length < 5) return 0.5;
    
    // Compare first half vs second half accuracy
    const mid = Math.floor(tasks.length / 2);
    const firstHalf = tasks.slice(0, mid);
    const secondHalf = tasks.slice(mid);
    
    const firstAccuracy = firstHalf.filter(t => t.isCorrect).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter(t => t.isCorrect).length / secondHalf.length;
    
    const improvement = secondAccuracy - firstAccuracy;
    
    // Map improvement to 0-1 scale
    return Math.max(0, Math.min(1, 0.5 + improvement));
  }
}

// ===== COGNITIVE LOAD ANALYZER (Sweller, 1988) =====

/**
 * Cognitive Load Theory Analyzer
 * 
 * Research Foundation:
 * Sweller (1988, 1994): Cognitive Load Theory
 * - Intrinsic Load: Inherent task complexity
 * - Extraneous Load: Poorly designed instruction
 * - Germane Load: Learning-relevant processing
 * 
 * Optimal Learning:
 * - Minimize extraneous load
 * - Manage intrinsic load (within WM capacity)
 * - Maximize germane load
 * 
 * Working Memory Limit: ~7±2 chunks (Miller, 1956)
 * Optimal Total Load: 0.5-0.8 (50-80% of capacity)
 */
export class CognitiveLoadAnalyzer {
  /**
   * Analyze cognitive load for a task
   */
  analyze(task: Task, learner: InputVector): CognitiveLoad {
    const intrinsic = this.calculateIntrinsic(task);
    const extraneous = this.calculateExtraneous(task, learner);
    const germane = this.calculateGermane(task, learner);
    
    const total = intrinsic + extraneous + germane;
    const isOptimal = total >= 0.5 && total <= 0.8 && extraneous < 0.2;
    
    return {
      intrinsic,
      extraneous,
      germane,
      total,
      isOptimal
    };
  }
  
  /**
   * Intrinsic Load: Element interactivity
   * 
   * Factors:
   * - Number magnitude (larger numbers = more elements)
   * - Operation type (subtraction > addition)
   * - Decade transitions (crossing 10/100)
   * - Placeholder position (inverse thinking)
   */
  private calculateIntrinsic(task: Task): number {
    let load = 0.0;
    
    // 1. Number complexity (log scale)
    const maxNumber = Math.max(task.number1, task.number2);
    const numberComplexity = Math.log10(maxNumber + 1) / Math.log10(task.numberRange);
    load += numberComplexity * 0.3;
    
    // 2. Operation complexity
    if (task.operation === '-') {
      load += 0.15; // Subtraction harder than addition
    }
    
    // 3. Decade transition (carry/borrow)
    const result = task.operation === '+' 
      ? task.number1 + task.number2 
      : task.number1 - task.number2;
    
    if (task.numberRange === 20) {
      if (task.number1 <= 10 && result > 10) load += 0.25; // Cross 10
    } else {
      const tens1 = Math.floor(task.number1 / 10);
      const tensResult = Math.floor(result / 10);
      if (tens1 !== tensResult) load += 0.20; // Cross decade
    }
    
    // 4. Placeholder complexity (algebraic thinking)
    if (task.placeholderPosition === 'start') {
      load += 0.25; // _+2=6 requires inverse operation
    } else if (task.placeholderPosition === 'middle') {
      load += 0.20; // 3+_=7 requires subtraction thinking
    }
    
    return Math.min(1.0, load);
  }
  
  /**
   * Extraneous Load: Cognitive load from poor design
   * 
   * This should be MINIMIZED. Sources:
   * - Split attention (multiple locations)
   * - Redundancy (same info presented multiple ways unnecessarily)
   * - Too many visual supports when learner is competent
   */
  private calculateExtraneous(task: Task, learner: InputVector): number {
    let load = 0.0;
    
    // Base extraneous load is low (good design)
    load = 0.05;
    
    // BUT: If learner is advanced and we still show many supports = distraction
    if (learner.N_retrieval > 0.7) {
      // Expert learner doesn't need visual scaffolding
      // This will be determined by output neurons later
      // For now, assume minimal extraneous
      load = 0.05;
    }
    
    // Context switching adds extraneous load
    if (learner.N_cumulative_fatigue > 0.7) {
      load += 0.1; // Fatigue increases extraneous processing
    }
    
    return Math.min(0.3, load); // Cap at 0.3
  }
  
  /**
   * Germane Load: Learning-relevant processing
   * 
   * This should be MAXIMIZED. Sources:
   * - Schema construction (pattern recognition)
   * - Strategic thinking
   * - Metacognitive reflection
   * - Transfer to new contexts
   */
  private calculateGermane(task: Task, learner: InputVector): number {
    let load = 0.0;
    
    // 1. Strategic processing
    if (learner.N_decomposition > 0.5 || learner.N_place_value > 0.5) {
      load += 0.2; // Using sophisticated strategies
    }
    
    // 2. Pattern recognition (operative packets)
    if (task.taskType.includes('constancy') || task.taskType.includes('pattern')) {
      load += 0.15; // Pattern tasks promote schema building
    }
    
    // 3. Metacognitive engagement
    if (learner.N_self_correction > 0.5 || learner.N_reflection > 0.5) {
      load += 0.15; // Reflection promotes deep learning
    }
    
    // 4. Placeholder tasks promote algebraic thinking
    if (task.placeholderPosition !== 'none') {
      load += 0.1; // Inverse problems promote relational understanding
    }
    
    return Math.min(0.5, load); // Cap at 0.5
  }
  
  /**
   * Recommend adjustments to optimize cognitive load
   */
  recommend(currentLoad: CognitiveLoad): string[] {
    const recommendations: string[] = [];
    
    if (currentLoad.total > 0.8) {
      recommendations.push("Reduce task difficulty or increase scaffolding");
    }
    
    if (currentLoad.extraneous > 0.2) {
      recommendations.push("Simplify visual presentation");
    }
    
    if (currentLoad.germane < 0.2) {
      recommendations.push("Add metacognitive prompts or pattern recognition");
    }
    
    if (currentLoad.total < 0.5) {
      recommendations.push("Increase challenge or introduce desirable difficulties");
    }
    
    return recommendations;
  }
}

// ===== DESIRABLE DIFFICULTIES INJECTOR (Bjork, 1994) =====

/**
 * Desirable Difficulties Theory
 * 
 * Research Foundation:
 * Bjork (1994): "Memory and Metamemory Considerations"
 * - Learning that feels easy may be shallow
 * - Productive struggles deepen understanding
 * - Difficulties should challenge without overwhelming
 * 
 * Types of Desirable Difficulties:
 * 1. Spacing: Distributed practice over time
 * 2. Interleaving: Mix different problem types
 * 3. Variability: Vary surface features
 * 4. Generation: Produce answer rather than recognize
 */
export class DesirableDifficultyInjector {
  /**
   * Identify opportunities for productive difficulty
   */
  identify(learner: InputVector, recentTasks: TaskResult[]): DesirableDifficulty[] {
    const difficulties: DesirableDifficulty[] = [];
    
    // Only inject if learner is in stable state
    if (!this.isStableState(learner)) return difficulties;
    
    // 1. Spacing Effect
    if (this.shouldSpace(recentTasks)) {
      difficulties.push({
        type: 'spacing',
        strength: 0.7,
        description: 'Retrieve from long-term memory (last practiced >3 days ago)'
      });
    }
    
    // 2. Interleaving
    if (this.shouldInterleave(recentTasks)) {
      difficulties.push({
        type: 'interleaving',
        strength: 0.6,
        description: 'Mix operation types or number ranges'
      });
    }
    
    // 3. Variability
    if (this.shouldVary(recentTasks)) {
      difficulties.push({
        type: 'variability',
        strength: 0.5,
        description: 'Vary number magnitudes or contexts'
      });
    }
    
    // 4. Generation
    if (learner.N_self_correction > 0.6 || learner.N_reflection > 0.5) {
      difficulties.push({
        type: 'generation',
        strength: 0.8,
        description: 'Explain strategy before solving (self-explanation)'
      });
    }
    
    return difficulties;
  }
  
  private isStableState(learner: InputVector): boolean {
    // Stable = not frustrated, engaged, reasonable accuracy
    return (
      learner.N_frustration < 0.5 &&
      learner.N_engagement > 0.5 &&
      learner.N_correct > 0.6
    );
  }
  
  private shouldSpace(tasks: TaskResult[]): boolean {
    // Check if similar tasks were last seen >3 days ago
    // (Simplified: assume we want spacing if many recent tasks)
    return tasks.length > 10;
  }
  
  private shouldInterleave(tasks: TaskResult[]): boolean {
    // Check if last 3 tasks were same type
    if (tasks.length < 3) return false;
    
    const last3 = tasks.slice(-3);
    const types = last3.map(t => t.task.taskType);
    const allSame = types.every(type => type === types[0]);
    
    return allSame;
  }
  
  private shouldVary(tasks: TaskResult[]): boolean {
    // Check if numbers are too stable (e.g., always in same range)
    if (tasks.length < 5) return false;
    
    const last5 = tasks.slice(-5);
    const numbers = last5.flatMap(t => [t.task.number1, t.task.number2]);
    const range = Math.max(...numbers) - Math.min(...numbers);
    
    // If range is small (< 10), numbers are too stable
    return range < 10;
  }
}

// ===== EMBODIED COGNITION MODULE (Lakoff & Núñez, 2000) =====

/**
 * Embodied Cognition for Mathematics
 * 
 * Research Foundation:
 * Lakoff & Núñez (2000): "Where Mathematics Comes From"
 * - Mathematics grounded in physical experience
 * - Conceptual metaphors: Numbers as points in space, arithmetic as motion
 * - Multiple embodied representations deepen understanding
 * 
 * Representation Types:
 * - Kinesthetic: Finger counting, physical manipulation
 * - Spatial: Number line, area models
 * - Object-based: Counters, collections
 * - Structural: Place value charts, hundred field
 */
export class EmbodiedRepresentationSelector {
  /**
   * Select optimal representations based on concept and learner
   */
  select(task: Task, learner: InputVector): RepresentationSet {
    const reps: Representation[] = [];
    
    // Age/level approximation from neuron signals
    const sophisticationLevel = this.estimateSophistication(learner);
    
    // 1. For ZR20 (number range 20)
    if (task.numberRange === 20) {
      // Kinesthetic (fingers) - young learners
      if (sophisticationLevel < 0.3 && task.number1 + task.number2 <= 10) {
        reps.push({
          type: 'finger-hands',
          embodiment: 'kinesthetic',
          strength: 0.9,
          reason: 'Young learners benefit from finger representation'
        });
      }
      
      // Twenty Frame (structured)
      reps.push({
        type: 'twenty-frame',
        embodiment: 'structural',
        strength: 0.8,
        reason: 'Shows tens/ones structure clearly'
      });
      
      // Number Line (spatial)
      reps.push({
        type: 'number-line',
        embodiment: 'spatial',
        strength: 0.7,
        reason: 'Spatial metaphor for magnitude'
      });
      
      // Counters (object-based)
      reps.push({
        type: 'counters',
        embodiment: 'object-based',
        strength: 0.6,
        reason: 'Physical manipulation of quantities'
      });
    }
    
    // 2. For ZR100 (number range 100)
    if (task.numberRange === 100) {
      // Hundred Field (structural)
      reps.push({
        type: 'hundred-field',
        embodiment: 'structural',
        strength: 0.9,
        reason: 'Shows place value structure'
      });
      
      // Place Value Bars
      reps.push({
        type: 'place-value-bars',
        embodiment: 'structural',
        strength: 0.85,
        reason: 'Explicit tens/ones representation'
      });
      
      // Extended Number Line
      reps.push({
        type: 'number-line-extended',
        embodiment: 'spatial',
        strength: 0.7,
        reason: 'Spatial understanding of larger numbers'
      });
      
      // Grouped Counters
      reps.push({
        type: 'counters-grouped',
        embodiment: 'object-based',
        strength: 0.6,
        reason: 'Shows grouping by tens'
      });
    }
    
    // 3. Symbolic (always available, but varies in prominence)
    reps.push({
      type: 'symbolic',
      embodiment: 'abstract',
      strength: Math.min(0.9, sophisticationLevel + 0.3),
      reason: 'Formal mathematical notation'
    });
    
    // Sort by strength
    reps.sort((a, b) => b.strength - a.strength);
    
    return {
      primary: reps[0],
      secondary: reps[1],
      all: reps
    };
  }
  
  private estimateSophistication(learner: InputVector): number {
    // Higher retrieval + lower counting = more sophisticated
    return (
      learner.N_retrieval * 0.4 +
      learner.N_decomposition * 0.3 +
      learner.N_place_value * 0.2 +
      (1 - learner.N_counting) * 0.1
    );
  }
}

export interface Representation {
  type: string;
  embodiment: 'kinesthetic' | 'spatial' | 'object-based' | 'structural' | 'abstract';
  strength: number; // 0-1
  reason: string;
}

export interface RepresentationSet {
  primary: Representation;
  secondary: Representation;
  all: Representation[];
}

// ===== SELF-EXPLANATION PROMPT GENERATOR (Chi et al., 1994) =====

/**
 * Self-Explanation Effect
 * 
 * Research Foundation:
 * Chi et al. (1994): "Eliciting Self-Explanations Improves Understanding"
 * - Prompting learners to explain deepens comprehension
 * - Identifies knowledge gaps
 * - Promotes active processing
 * 
 * Implementation:
 * - After correct: "How did you solve this?"
 * - After error: "What was difficult about this?"
 * - Before task: "What strategy will you use?"
 */
export class SelfExplanationPromptGenerator {
  /**
   * Generate metacognitive prompt based on context
   */
  generate(context: 'before' | 'after_success' | 'after_error', task: Task): MetacognitivePrompt {
    if (context === 'before') {
      return {
        type: 'strategy_planning',
        question: 'Welche Strategie wirst du nutzen?',
        options: [
          'Ich zähle',
          'Ich zerlege die Zahl',
          'Ich nutze Zehner und Einer',
          'Ich weiß es einfach'
        ],
        purpose: 'Activate prior knowledge and plan approach'
      };
    }
    
    if (context === 'after_success') {
      return {
        type: 'strategy_reflection',
        question: 'Wie hast du diese Aufgabe gelöst?',
        options: [
          'Ich habe gezählt',
          'Ich habe die Zahl zerlegt',
          'Ich habe Stellenwerte genutzt',
          'Ich habe eine ähnliche Aufgabe benutzt',
          'Ich wusste es auswendig'
        ],
        purpose: 'Consolidate successful strategy'
      };
    }
    
    // after_error
    return {
      type: 'error_explanation',
      question: 'Was war bei dieser Aufgabe schwierig?',
      options: [
        'Die Zahlen waren zu groß',
        'Ich habe mich verzählt',
        'Der Zehnerübergang war schwer',
        'Ich war zu schnell',
        'Ich habe die falsche Strategie gewählt'
      ],
      purpose: 'Identify and learn from errors'
    };
  }
}

export interface MetacognitivePrompt {
  type: 'strategy_planning' | 'strategy_reflection' | 'error_explanation';
  question: string;
  options: string[];
  purpose: string;
}

// ===== EXPORT INSTANCES =====

export const zpdCalculator = new ZPDCalculator();
export const cognitiveLoadAnalyzer = new CognitiveLoadAnalyzer();
export const desirableDifficultyInjector = new DesirableDifficultyInjector();
export const embodiedRepresentationSelector = new EmbodiedRepresentationSelector();
export const selfExplanationPromptGenerator = new SelfExplanationPromptGenerator();
