/**
 * Neural Progression Controller
 * 
 * Integrates:
 * - Neural Learner Model (44 neurons)
 * - Mathematics Didactic Modules (ZPD, Cognitive Load, etc.)
 * - Genetic Task Evolution (with placeholder support)
 * - Temporal Dynamics (memory, forgetting)
 * 
 * This is the main orchestrator that:
 * 1. Observes learner behavior → Input neurons
 * 2. Processes through neural network
 * 3. Generates adaptive outputs → Task generation
 * 4. Updates synaptic weights (learning)
 * 5. Consolidates memory over time
 */

import { neuralModel, type InputVector, type OutputVector } from "./neuralLearnerModel";
import { 
  zpdCalculator, 
  cognitiveLoadAnalyzer,
  desirableDifficultyInjector,
  embodiedRepresentationSelector,
  selfExplanationPromptGenerator,
  type Task as DidacticTask,
  type TaskResult 
} from "./mathematicsDidacticModules";
import { 
  geneticTaskEvolver,
  placeholderAnalyzer,
  type TaskDNA 
} from "./geneticTaskEvolution";
import type { LearningProgression, Task } from "../shared/schema";

// ===== LEARNER OBSERVATION =====

/**
 * Observe learner and extract neural input signals
 */
export class LearnerObserver {
  /**
   * Convert learner progression and recent tasks into neural inputs
   */
  observe(
    progression: LearningProgression & { neuronActivations?: any },
    recentTasks: TaskResult[]
  ): InputVector {
    // Performance Cluster
    const N_correct = this.calculateCorrectness(recentTasks);
    const N_speed = this.calculateSpeed(recentTasks);
    const N_accuracy_trend = this.calculateAccuracyTrend(recentTasks);
    const N_consistency = this.calculateConsistency(recentTasks);
    const N_near_miss = this.calculateNearMiss(recentTasks);
    const N_first_attempt = this.calculateFirstAttempt(recentTasks);
    
    // Strategy Cluster
    const strategySignals = this.analyzeStrategies(recentTasks);
    
    // Metacognitive Cluster
    const metacogSignals = this.analyzeMetacognition(recentTasks);
    
    // Emotional Cluster
    const emotionalSignals = this.estimateEmotionalState(recentTasks, progression);
    
    // Context Cluster
    const contextSignals = this.analyzeContext(progression);
    
    return {
      // Performance
      N_correct,
      N_speed,
      N_accuracy_trend,
      N_consistency,
      N_near_miss,
      N_first_attempt,
      
      // Strategy
      ...strategySignals,
      
      // Metacognitive
      ...metacogSignals,
      
      // Emotional
      ...emotionalSignals,
      
      // Context
      ...contextSignals
    };
  }
  
  private calculateCorrectness(tasks: TaskResult[]): number {
    if (tasks.length === 0) return 0.5;
    const correct = tasks.filter(t => t.isCorrect).length;
    return correct / tasks.length;
  }
  
  private calculateSpeed(tasks: TaskResult[]): number {
    if (tasks.length === 0) return 0.5;
    
    const avgTime = tasks.reduce((sum, t) => sum + t.timeTaken, 0) / tasks.length;
    
    // Normalize: <10s = fast (1.0), >60s = slow (0.0)
    return Math.max(0, Math.min(1, 1 - (avgTime - 10) / 50));
  }
  
  private calculateAccuracyTrend(tasks: TaskResult[]): number {
    if (tasks.length < 5) return 0;
    
    const mid = Math.floor(tasks.length / 2);
    const firstHalf = tasks.slice(0, mid);
    const secondHalf = tasks.slice(mid);
    
    const firstAccuracy = firstHalf.filter(t => t.isCorrect).length / firstHalf.length;
    const secondAccuracy = secondHalf.filter(t => t.isCorrect).length / secondHalf.length;
    
    const trend = secondAccuracy - firstAccuracy;
    
    // Map to [-1, 1]: improving = positive, declining = negative
    return Math.max(-1, Math.min(1, trend));
  }
  
  private calculateConsistency(tasks: TaskResult[]): number {
    if (tasks.length < 3) return 0.5;
    
    // Variance in performance
    const results = tasks.slice(-10).map(t => t.isCorrect ? 1 : 0);
    const mean = results.reduce((a: number, b: number) => a + b, 0) / results.length;
    const variance = results.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / results.length;
    
    // Low variance = high consistency
    return 1 - Math.min(1, variance * 2);
  }
  
  private calculateNearMiss(tasks: TaskResult[]): number {
    // How many times was answer close but wrong?
    // (Simplified: assume we track this in task data)
    return 0.1; // Placeholder
  }
  
  private calculateFirstAttempt(tasks: TaskResult[]): number {
    if (tasks.length === 0) return 0.5;
    
    // Filter tasks where self-correction happened
    const firstAttemptSuccess = tasks.filter(t => 
      t.isCorrect && !t.selfCorrected
    ).length;
    
    return firstAttemptSuccess / tasks.length;
  }
  
  private analyzeStrategies(tasks: TaskResult[]): {
    N_counting: number;
    N_decomposition: number;
    N_place_value: number;
    N_retrieval: number;
    N_strategy_flexibility: number;
  } {
    if (tasks.length === 0) {
      return {
        N_counting: 0.5,
        N_decomposition: 0.2,
        N_place_value: 0.1,
        N_retrieval: 0.1,
        N_strategy_flexibility: 0.2
      };
    }
    
    const strategies = tasks.map(t => t.strategyUsed);
    
    const counting = strategies.filter(s => s === 'counting_all' || s === 'counting_on').length / tasks.length;
    const decomposition = strategies.filter(s => s === 'decomposition' || s === 'decade_bridge').length / tasks.length;
    const placeValue = strategies.filter(s => s === 'place_value').length / tasks.length;
    const retrieval = strategies.filter(s => s === 'retrieval' || s === 'known_fact').length / tasks.length;
    
    // Flexibility = number of different strategies used
    const uniqueStrategies = new Set(strategies).size;
    const flexibility = Math.min(1, uniqueStrategies / 4); // Max 4 strategies
    
    return {
      N_counting: counting,
      N_decomposition: decomposition,
      N_place_value: placeValue,
      N_retrieval: retrieval,
      N_strategy_flexibility: flexibility
    };
  }
  
  private analyzeMetacognition(tasks: TaskResult[]): {
    N_self_correction: number;
    N_help_seeking: number;
    N_confidence: number;
    N_reflection: number;
  } {
    if (tasks.length === 0) {
      return {
        N_self_correction: 0.2,
        N_help_seeking: 0.3,
        N_confidence: 0.5,
        N_reflection: 0.3
      };
    }
    
    const selfCorrected = tasks.filter(t => t.selfCorrected).length / tasks.length;
    const helpRequested = tasks.filter(t => t.helpRequested).length / tasks.length;
    
    // Confidence approximated by speed + correctness
    const quickAndCorrect = tasks.filter(t => t.isCorrect && t.timeTaken < 20).length / tasks.length;
    
    // Reflection approximated by longer pauses before answering
    const reflected = tasks.filter(t => t.timeTaken > 15 && t.timeTaken < 60).length / tasks.length;
    
    return {
      N_self_correction: selfCorrected,
      N_help_seeking: helpRequested,
      N_confidence: quickAndCorrect,
      N_reflection: reflected
    };
  }
  
  private estimateEmotionalState(tasks: TaskResult[], progression: LearningProgression & { neuronActivations?: any }): {
    N_frustration: number;
    N_engagement: number;
    N_motivation: number;
    N_anxiety: number;
    N_flow: number;
  } {
    // Frustration markers:
    // - Repeated errors
    // - Increasing time per task
    // - Help requests after errors
    
    const recentErrors = tasks.slice(-5).filter(t => !t.isCorrect).length;
    const frustration = Math.min(1, recentErrors / 3);
    
    // Engagement (session consistency)
    const engagement = tasks.length > 5 ? 0.8 : 0.5;
    
    // Motivation (willingness to continue after errors)
    const motivation = 1 - frustration * 0.5;
    
    // Anxiety (fast errors, help seeking)
    const fastErrors = tasks.filter(t => !t.isCorrect && t.timeTaken < 10).length / Math.max(1, tasks.length);
    const anxiety = fastErrors;
    
    // Flow state (optimal challenge + engagement)
    const successRate = tasks.filter(t => t.isCorrect).length / Math.max(1, tasks.length);
    const isChallengingButDoable = successRate >= 0.6 && successRate <= 0.85;
    const flow = isChallengingButDoable && engagement > 0.7 ? 0.8 : 0.3;
    
    return {
      N_frustration: frustration,
      N_engagement: engagement,
      N_motivation: motivation,
      N_anxiety: anxiety,
      N_flow: flow
    };
  }
  
  private analyzeContext(progression: LearningProgression & { neuronActivations?: any }): {
    N_time_of_day: number;
    N_session_length: number;
    N_days_since_last: number;
    N_cumulative_fatigue: number;
  } {
    const now = new Date();
    const hour = now.getHours();
    
    // Time of day effect (morning = fresh, evening = tired)
    const timeOfDay = hour < 12 ? 0.9 : hour < 16 ? 0.7 : 0.5;
    
    // Session length (normalize to 30 minutes)
    const sessionLength = 0.5; // Simplified
    
    // Days since last session
    const daysSince = 0.3; // Simplified
    
    // Cumulative fatigue
    const fatigue = 0.2; // Simplified
    
    return {
      N_time_of_day: timeOfDay,
      N_session_length: sessionLength,
      N_days_since_last: daysSince,
      N_cumulative_fatigue: fatigue
    };
  }
}

// ===== NEURAL TASK GENERATOR =====

/**
 * Generate tasks using neural network outputs
 */
export class NeuralTaskGenerator {
  private taskPopulation: TaskDNA[] = [];
  private generation: number = 0;
  
  /**
   * Generate next optimal task
   */
  async generate(
    progression: LearningProgression & { neuronActivations?: any; neuronWeights?: any },
    recentTasks: TaskResult[],
    neuralOutputs: OutputVector
  ): Promise<GeneratedTask> {
    // 1. Initialize or evolve task population
    if (this.taskPopulation.length === 0) {
      const numberRange = (progression as any).numberRange || 20;
      this.taskPopulation = geneticTaskEvolver.generateInitialPopulation(
        numberRange as 20 | 100,
        neuralOutputs.A_task_difficulty
      );
    } else {
      // Evolve existing population
      const observer = new LearnerObserver();
      const inputs = observer.observe(progression, recentTasks);
      
      this.taskPopulation = geneticTaskEvolver.evolve(
        this.taskPopulation,
        inputs,
        neuralOutputs,
        this.generation++
      );
    }
    
    // 2. Get best task from evolved population
    const bestTask = geneticTaskEvolver.getBestTask(this.taskPopulation);
    
    // 3. Analyze cognitive load
    const observer = new LearnerObserver();
    const inputs = observer.observe(progression, recentTasks);
    const cogLoad = cognitiveLoadAnalyzer.analyze(bestTask, inputs);
    
    // 4. Select representations (embodied cognition)
    const representations = embodiedRepresentationSelector.select(bestTask, inputs);
    
    // 5. Check for desirable difficulties
    const difficulties = desirableDifficultyInjector.identify(inputs, recentTasks);
    
    // 6. Placeholder complexity
    const placeholderComplexity = placeholderAnalyzer.analyze(bestTask);
    
    // 7. Metacognitive prompt
    const prompt = selfExplanationPromptGenerator.generate('before', bestTask);
    
    return {
      task: bestTask,
      cognitiveLoad: cogLoad,
      representations: representations.all.slice(0, 3), // Top 3
      scaffolding: {
        visual: neuralOutputs.A_scaffold_visual,
        strategic: neuralOutputs.A_scaffold_strategic
      },
      desirableDifficulties: difficulties,
      placeholderComplexity,
      metacognitivePrompt: prompt,
      neuralOutputs
    };
  }
}

// ===== MAIN CONTROLLER =====

/**
 * Main Neural Progression Controller
 */
export class NeuralProgressionController {
  private observer: LearnerObserver;
  private generator: NeuralTaskGenerator;
  
  constructor() {
    this.observer = new LearnerObserver();
    this.generator = new NeuralTaskGenerator();
  }
  
  /**
   * Process a completed task and update neural state
   */
  async processTaskCompletion(
    progression: LearningProgression & { 
      neuronActivations?: any; 
      neuronWeights?: any;
      memoryTraces?: any[];
    },
    completedTask: TaskResult,
    allRecentTasks: TaskResult[]
  ): Promise<UpdatedProgression> {
    // 1. Observe current state
    const inputs = this.observer.observe(progression, allRecentTasks);
    
    // 2. Forward pass (get predictions)
    const outputs = neuralModel.forward(inputs);
    
    // 3. Update synaptic weights (learning)
    this.updateNeuralWeights(completedTask, progression);
    
    // 4. Homeostatic regulation
    neuralModel.homeostaticRegulation();
    
    // 5. Calculate ZPD
    const zpd = zpdCalculator.calculate(inputs, allRecentTasks);
    
    // 6. Memory consolidation (if enough time passed)
    const timeSinceLastSession = this.getTimeSinceLastSession(progression);
    if (timeSinceLastSession > 1000 * 60 * 60 * 12) { // 12 hours
      neuralModel.consolidate(timeSinceLastSession);
    }
    
    // 7. Save neural state
    const neuralState = neuralModel.saveState();
    
    return {
      updatedProgression: {
        ...progression,
        neuronActivations: this.serializeActivations(neuralState),
        neuronWeights: this.serializeWeights(neuralState),
        memoryTraces: this.updateMemoryTraces(progression.memoryTraces || [], completedTask)
      },
      zpd,
      outputs,
      inputs
    };
  }
  
  /**
   * Generate next task based on neural state
   */
  async generateNextTask(
    progression: LearningProgression & { 
      neuronActivations?: any; 
      neuronWeights?: any 
    },
    recentTasks: TaskResult[]
  ): Promise<GeneratedTask> {
    // 1. Observe state
    const inputs = this.observer.observe(progression, recentTasks);
    
    // 2. Forward pass
    const outputs = neuralModel.forward(inputs);
    
    // 3. Generate task
    return await this.generator.generate(progression, recentTasks, outputs);
  }
  
  private updateNeuralWeights(task: TaskResult, progression: any): void {
    // Hebbian learning: strengthen successful connections
    // (Simplified - full implementation would track which neurons fired)
    
    if (task.isCorrect) {
      // Positive reinforcement
      // (Neural model handles this internally)
    } else {
      // Learn from errors
      // (Neural model adjusts)
    }
  }
  
  private getTimeSinceLastSession(progression: any): number {
    // Simplified
    return 1000 * 60 * 60 * 24; // 24 hours
  }
  
  private serializeActivations(state: any): any {
    const neurons = Array.from(state.neurons.values());
    const activations: any = {};
    
    for (const neuron of neurons) {
      const n = neuron as any;
      activations[n.id] = {
        activation: n.activation,
        rawInput: n.rawInput
      };
    }
    
    return activations;
  }
  
  private serializeWeights(state: any): any {
    return {
      connections: state.connections.map((c: any) => ({
        from: c.fromNeuronId,
        to: c.toNeuronId,
        weight: c.weight,
        consolidation: c.consolidationStrength
      })),
      globalLearningRate: state.globalLearningRate,
      totalUpdates: state.totalUpdates
    };
  }
  
  private updateMemoryTraces(existing: any[], newTask: TaskResult): any[] {
    const traces = [...existing];
    
    traces.push({
      timestamp: Date.now(),
      taskType: newTask.task.taskType,
      correct: newTask.isCorrect,
      strategy: newTask.strategyUsed,
      consolidationStrength: 1.0 // Will decay over time
    });
    
    // Keep last 100 traces
    return traces.slice(-100);
  }
}

// ===== TYPES =====

export interface GeneratedTask {
  task: DidacticTask;
  cognitiveLoad: any;
  representations: any[];
  scaffolding: {
    visual: number;
    strategic: number;
  };
  desirableDifficulties: any[];
  placeholderComplexity: any;
  metacognitivePrompt: any;
  neuralOutputs: OutputVector;
}

export interface UpdatedProgression {
  updatedProgression: any;
  zpd: any;
  outputs: OutputVector;
  inputs: InputVector;
}

// ===== EXPORT SINGLETON =====

export const neuralController = new NeuralProgressionController();
