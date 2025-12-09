import type { LearningProgression, InsertTask } from "@shared/schema";
import { 
  representationEngine, 
  type RepresentationConfig, 
  type RepresentationType,
  type SingleRepresentationMastery 
} from "./representationSystem";

/**
 * REPRESENTATION-BASED TASK GENERATOR
 * 
 * Generates tasks with specific representation configurations.
 * Difficulty is determined by:
 * 1. Number of active representations (fewer = harder)
 * 2. Which specific representations are active
 * 3. Mathematical complexity (number range, operations)
 */

export interface TaskWithRepresentation extends Omit<InsertTask, "sessionId"> {
  representationConfig: RepresentationConfig;
  missingSymbolic: boolean;  // True if calculation should be input by user
  requiresOperatorInput: boolean; // True if operator (+/-) needs to be selected
  placeholderInSymbolic: 'none' | 'number1' | 'operator' | 'number2' | 'result';
}

export interface GenerationContext {
  progression: LearningProgression;
  numberRange: number;
  currentStage: number;
  representationConfig: RepresentationConfig;
  activeRepCount: number;
}

export class RepresentationBasedGenerator {

  /**
   * Generate a task based on current representation configuration
   */
  generateTask(context: GenerationContext): TaskWithRepresentation {
    const config = context.representationConfig;
    const activeCount = context.activeRepCount;

    const difficulty = this.calculateDifficulty(activeCount, context.currentStage);

    const shouldUsePlaceholder = difficulty >= 5 && Math.random() > 0.5;

    const { number1, number2, operation } = this.generateNumbers(
      context.numberRange,
      difficulty,
      context.currentStage
    );

    const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

    if (shouldUsePlaceholder) {
      const placeholderChoice = this.chooseSymbolicPlaceholder(difficulty);

      const ensureSymbolicConfig = { ...config, symbolic: true };

      return {
        taskType: 'representation_placeholder',
        operation,
        number1,
        number2,
        correctAnswer,
        numberRange: context.numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: this.getActiveRepresentationNames(ensureSymbolicConfig),
        errorType: null,
        errorSeverity: null,
        placeholderPosition: placeholderChoice === 'result' ? 'end' : placeholderChoice === 'number1' ? 'start' : 'middle',
        representationConfig: ensureSymbolicConfig,
        missingSymbolic: false,
        requiresOperatorInput: placeholderChoice === 'operator',
        placeholderInSymbolic: placeholderChoice
      };
    }

    return {
      taskType: `representation_${activeCount}`,
      operation,
      number1,
      number2,
      correctAnswer,
      numberRange: context.numberRange,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: this.getActiveRepresentationNames(config),
      errorType: null,
      errorSeverity: null,
      placeholderPosition: 'end',
      representationConfig: config,
      missingSymbolic: false,
      requiresOperatorInput: false,
      placeholderInSymbolic: 'none'
    };
  }

  /**
   * Generate task where the calculation itself must be constructed
   * User must input both numbers AND the operator
   */
  generateTaskWithMissingCalculation(context: GenerationContext): TaskWithRepresentation {
    const config = context.representationConfig;
    const difficulty = this.calculateDifficulty(context.activeRepCount, context.currentStage);

    const { number1, number2, operation } = this.generateNumbers(
      context.numberRange,
      difficulty,
      context.currentStage
    );

    const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

    const placeholderChoice = this.chooseSymbolicPlaceholder(difficulty);

    return {
      taskType: 'missing_calculation',
      operation,
      number1,
      number2,
      correctAnswer,
      numberRange: context.numberRange,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: this.getActiveRepresentationNames(config),
      errorType: null,
      errorSeverity: null,
      placeholderPosition: 'middle',
      representationConfig: config,
      missingSymbolic: true,
      requiresOperatorInput: placeholderChoice === 'operator',
      placeholderInSymbolic: placeholderChoice
    };
  }

  /**
   * Choose which part of the symbolic representation is missing
   */
  private chooseSymbolicPlaceholder(difficulty: number): 'number1' | 'operator' | 'number2' | 'result' {
    if (difficulty < 3) {
      return 'result';
    } else if (difficulty < 5) {
      const choices: Array<'number2' | 'result'> = ['number2', 'result'];
      return choices[Math.floor(Math.random() * choices.length)];
    } else if (difficulty < 7) {
      const choices: Array<'number1' | 'number2' | 'result'> = ['number1', 'number2', 'result'];
      return choices[Math.floor(Math.random() * choices.length)];
    } else {
      const choices: Array<'number1' | 'operator' | 'number2' | 'result'> = 
        ['number1', 'operator', 'number2', 'result'];
      return choices[Math.floor(Math.random() * choices.length)];
    }
  }

  /**
   * Calculate difficulty level (1-10) based on representation count and stage
   */
  private calculateDifficulty(activeRepCount: number, currentStage: number): number {
    const repDifficulty = 6 - activeRepCount;
    const stageDifficulty = Math.min(Math.floor(currentStage / 2), 3);

    return Math.max(1, Math.min(10, repDifficulty + stageDifficulty));
  }

  /**
   * Generate appropriate numbers based on difficulty and number range
   * With recursion limit to prevent infinite loops
   */
  private generateNumbers(
    numberRange: number,
    difficulty: number,
    currentStage: number,
    attempt: number = 0
  ): { number1: number; number2: number; operation: '+' | '-' } {
    // Prevent infinite recursion
    if (attempt > 50) {
      // Fallback: simple task that definitely works
      const operation = '+';
      const number1 = Math.min(5, numberRange - 1);
      const number2 = Math.min(3, numberRange - number1);
      return { number1, number2, operation };
    }

    const operation = Math.random() > 0.5 ? '+' : '-';

    let maxNum = Math.min(numberRange, 10 + (currentStage * 5));
    let minNum = Math.max(1, difficulty - 3);

    if (numberRange === 10) {
      maxNum = difficulty <= 3 ? 7 : 9;
      minNum = difficulty <= 3 ? 1 : 2;
    } else if (numberRange === 20) {
      maxNum = difficulty <= 3 ? 10 : difficulty <= 6 ? 15 : 19;
      minNum = difficulty <= 3 ? 1 : difficulty <= 6 ? 3 : 5;
    } else if (numberRange === 100) {
      maxNum = difficulty <= 3 ? 50 : difficulty <= 6 ? 75 : 99;
      minNum = difficulty <= 3 ? 10 : difficulty <= 6 ? 20 : 30;
    }

    if (operation === '+') {
      // For addition, ensure sum won't exceed numberRange
      const maxFirstNumber = Math.min(maxNum, Math.floor(numberRange / 2));
      const number1 = this.randomInt(minNum, maxFirstNumber);
      const maxSecondNumber = Math.min(maxNum, numberRange - number1);
      const number2 = this.randomInt(minNum, maxSecondNumber);

      const sum = number1 + number2;
      if (sum > numberRange) {
        return this.generateNumbers(numberRange, difficulty, currentStage, attempt + 1);
      }
      return { number1, number2, operation };
    } else {
      // For subtraction, ensure number1 >= number2
      const number1 = this.randomInt(minNum, maxNum);
      const number2 = this.randomInt(minNum, Math.min(maxNum, number1));

      return { number1, number2, operation };
    }
  }

  /**
   * Generate a batch of tasks with progressive difficulty
   */
  generateBatch(
    context: GenerationContext,
    count: number = 5
  ): TaskWithRepresentation[] {
    const tasks: TaskWithRepresentation[] = [];

    for (let i = 0; i < count; i++) {
      const task = this.generateTask(context);
      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Generate tasks with specific representation removed (for testing mastery)
   */
  generateTaskWithoutRepresentation(
    context: GenerationContext,
    excludedRep: RepresentationType
  ): TaskWithRepresentation {
    const modifiedConfig = { ...context.representationConfig };
    modifiedConfig[excludedRep] = false;

    const modifiedContext: GenerationContext = {
      ...context,
      representationConfig: modifiedConfig,
      activeRepCount: context.activeRepCount - 1
    };

    return this.generateTask(modifiedContext);
  }

  /**
   * Progressive challenge: Generate task with only N representations
   */
  generateMinimalTask(
    context: GenerationContext,
    targetRepCount: number,
    preferredReps?: RepresentationType[]
  ): TaskWithRepresentation {
    const repsToUse = preferredReps && preferredReps.length === targetRepCount
      ? preferredReps
      : this.selectBestRepresentations(targetRepCount, context);

    const minimalConfig: RepresentationConfig = {
      twentyFrame: repsToUse.includes('twentyFrame'),
      numberLine: repsToUse.includes('numberLine'),
      counters: repsToUse.includes('counters'),
      fingers: repsToUse.includes('fingers'),
      symbolic: repsToUse.includes('symbolic')
    };

    const modifiedContext: GenerationContext = {
      ...context,
      representationConfig: minimalConfig,
      activeRepCount: targetRepCount
    };

    return this.generateTask(modifiedContext);
  }

  /**
   * Select best N representations for current context
   */
  private selectBestRepresentations(
    count: number,
    context: GenerationContext
  ): RepresentationType[] {
    if (context.numberRange <= 20) {
      const priority: RepresentationType[] = [
        'symbolic',
        'twentyFrame',
        'numberLine',
        'counters',
        'fingers'
      ];
      return priority.slice(0, count);
    } else {
      const priority: RepresentationType[] = [
        'symbolic',
        'numberLine',
        'counters',
        'twentyFrame',
        'fingers'
      ];
      return priority.slice(0, count);
    }
  }

  /**
   * Get names of active representations
   */
  private getActiveRepresentationNames(config: RepresentationConfig): string[] {
    const active: string[] = [];
    if (config.twentyFrame) active.push('twentyFrame');
    if (config.numberLine) active.push('numberLine');
    if (config.counters) active.push('counters');
    if (config.fingers) active.push('fingers');
    if (config.symbolic) active.push('symbolic');
    return active;
  }

  /**
   * Random integer helper
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate task sequence with progressive representation reduction
   */
  generateProgressiveSequence(
    context: GenerationContext,
    startCount: number = 5,
    endCount: number = 1
  ): TaskWithRepresentation[] {
    const tasks: TaskWithRepresentation[] = [];

    for (let repCount = startCount; repCount >= endCount; repCount--) {
      const task = this.generateMinimalTask(context, repCount);
      tasks.push(task);
    }

    return tasks;
  }

  // ===== SINGLE REPRESENTATION TASK GENERATION =====

  /**
   * Generate a task that shows ONLY one specific representation (plus symbolic)
   * This is used to test individual representation mastery
   */
  generateSingleRepresentationTask(
    context: GenerationContext,
    targetRepresentation: RepresentationType
  ): TaskWithRepresentation {
    if (targetRepresentation === 'symbolic') {
      // Can't test symbolic alone - it's always shown
      // Return a task with just symbolic
      return this.generateTask({
        ...context,
        representationConfig: {
          twentyFrame: false,
          numberLine: false,
          counters: false,
          fingers: false,
          symbolic: true
        },
        activeRepCount: 1
      });
    }

    // Create config with ONLY the target representation + symbolic
    const singleRepConfig: RepresentationConfig = {
      twentyFrame: targetRepresentation === 'twentyFrame',
      numberLine: targetRepresentation === 'numberLine',
      counters: targetRepresentation === 'counters',
      fingers: targetRepresentation === 'fingers',
      symbolic: true // Always include symbolic for input
    };

    const modifiedContext: GenerationContext = {
      ...context,
      representationConfig: singleRepConfig,
      activeRepCount: 2 // Only the target rep + symbolic
    };

    const task = this.generateTask(modifiedContext);

    // Mark this as a single-rep test task
    return {
      ...task,
      taskType: `single_rep_test_${targetRepresentation}`,
      representationsUsed: [targetRepresentation, 'symbolic']
    };
  }

  /**
   * Generate task based on single representation testing schedule
   * Decides: should we test a single rep, or do a multi-rep task?
   */
  generateAdaptiveTask(
    context: GenerationContext,
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>,
    recentTasksWereMultiRep: boolean = false
  ): {
    task: TaskWithRepresentation;
    isSingleRepTest: boolean;
    testedRepresentation?: RepresentationType;
  } {
    // Check if we should inject a single-rep test
    const injectionDecision = representationEngine.shouldInjectSingleRepTest(
      singleMastery,
      context.progression.totalTasksSolved,
      recentTasksWereMultiRep
    );

    if (injectionDecision.shouldInject && injectionDecision.representation) {
      // Generate single-rep test task
      const task = this.generateSingleRepresentationTask(
        context,
        injectionDecision.representation
      );

      return {
        task,
        isSingleRepTest: true,
        testedRepresentation: injectionDecision.representation
      };
    }

    // Generate normal multi-rep task
    const task = this.generateTask(context);

    return {
      task,
      isSingleRepTest: false
    };
  }

  /**
   * Generate a batch of tasks with intelligent single-rep injection
   * Ensures early baseline tests for all representations
   */
  generateAdaptiveBatch(
    context: GenerationContext,
    singleMastery: Record<RepresentationType, SingleRepresentationMastery>,
    count: number = 10
  ): Array<{
    task: TaskWithRepresentation;
    isSingleRepTest: boolean;
    testedRepresentation?: RepresentationType;
  }> {
    const tasks: Array<{
      task: TaskWithRepresentation;
      isSingleRepTest: boolean;
      testedRepresentation?: RepresentationType;
    }> = [];

    let consecutiveMultiRep = 0;

    for (let i = 0; i < count; i++) {
      const currentTaskNumber = context.progression.totalTasksSolved + i;

      // Update context for current task
      const taskContext = {
        ...context,
        progression: {
          ...context.progression,
          totalTasksSolved: currentTaskNumber
        }
      };

      const recentTasksWereMultiRep = consecutiveMultiRep >= 3;

      const result = this.generateAdaptiveTask(
        taskContext,
        singleMastery,
        recentTasksWereMultiRep
      );

      tasks.push(result);

      // Track consecutive multi-rep tasks
      if (result.isSingleRepTest) {
        consecutiveMultiRep = 0;

        // Update single mastery for next iteration (simulate)
        if (result.testedRepresentation && result.testedRepresentation !== 'symbolic') {
          // For simulation purposes, assume correct
          // In real usage, this would be updated after student answers
        }
      } else {
        consecutiveMultiRep++;
      }
    }

    return tasks;
  }

  /**
   * Generate early baseline test sequence
   * Tests each representation individually in first ~20 tasks
   */
  generateEarlyBaselineSequence(
    context: GenerationContext
  ): TaskWithRepresentation[] {
    const tasks: TaskWithRepresentation[] = [];
    const testableReps: RepresentationType[] = ['twentyFrame', 'numberLine', 'counters', 'fingers'];

    // Start with 2-3 multi-rep tasks (warm-up)
    for (let i = 0; i < 2; i++) {
      tasks.push(this.generateTask(context));
    }

    // Test each representation individually
    for (const rep of testableReps) {
      tasks.push(this.generateSingleRepresentationTask(context, rep));

      // Add 1-2 multi-rep tasks between single-rep tests
      for (let i = 0; i < 2; i++) {
        tasks.push(this.generateTask(context));
      }
    }

    return tasks;
  }

  /**
   * Determine if a config represents a single-rep test
   * (only 1 non-symbolic representation)
   */
  isSingleRepresentationTest(config: RepresentationConfig): {
    isSingle: boolean;
    representation?: RepresentationType;
  } {
    const activeNonSymbolic: RepresentationType[] = [];

    if (config.twentyFrame) activeNonSymbolic.push('twentyFrame');
    if (config.numberLine) activeNonSymbolic.push('numberLine');
    if (config.counters) activeNonSymbolic.push('counters');
    if (config.fingers) activeNonSymbolic.push('fingers');

    if (activeNonSymbolic.length === 1) {
      return {
        isSingle: true,
        representation: activeNonSymbolic[0]
      };
    }

    return { isSingle: false };
  }
}

export const representationBasedGenerator = new RepresentationBasedGenerator();