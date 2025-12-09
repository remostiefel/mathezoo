/**
 * Ensemble Predictor System
 * 
 * Multiple AI models compete to predict learner performance:
 * 1. Bayesian Predictor (probabilistic reasoning)
 * 2. Neural Network Predictor (pattern recognition)
 * 3. Symbolic Reasoning Predictor (rule-based)
 * 4. Case-Based Predictor (analogy-based)
 * 5. Hybrid Predictor (combination)
 * 
 * Weighted voting determines final prediction.
 * Weights adapt based on historical accuracy.
 * 
 * Research Foundation:
 * - Ensemble Methods (Dietterich, 2000)
 * - Wisdom of Crowds (Surowiecki, 2004)
 * - Adaptive Voting (Freund & Schapire, 1997)
 */

import type { InputVector, OutputVector } from "./neuralLearnerModel";
import type { Task, TaskResult } from "./mathematicsDidacticModules";

// ===== PREDICTION TYPES =====

export interface Prediction {
  successProbability: number; // 0-1
  expectedTime: number; // seconds
  recommendedDifficulty: number; // 0-1
  recommendedScaffolding: number; // 0-1
  confidence: number; // 0-1 (how sure is this model?)
  reasoning: string; // Human-readable explanation
}

export interface EnsemblePrediction extends Prediction {
  individualPredictions: Map<string, Prediction>;
  modelWeights: Map<string, number>;
  consensus: number; // 0-1 (agreement between models)
}

// ===== BASE PREDICTOR INTERFACE =====

export abstract class BasePredictor {
  protected name: string;
  protected weight: number = 1.0; // Initial equal weight
  protected historicalAccuracy: number = 0.5;
  protected predictionHistory: PredictionRecord[] = [];
  
  constructor(name: string) {
    this.name = name;
  }
  
  abstract predict(
    learner: InputVector,
    task: Task,
    history: TaskResult[]
  ): Prediction;
  
  /**
   * Update model based on actual outcome
   */
  update(prediction: Prediction, actual: TaskResult): void {
    const error = this.calculateError(prediction, actual);
    
    // Track prediction
    this.predictionHistory.push({
      prediction,
      actual,
      error,
      timestamp: Date.now()
    });
    
    // Keep last 100 predictions
    if (this.predictionHistory.length > 100) {
      this.predictionHistory.shift();
    }
    
    // Update historical accuracy
    const recentAccuracy = this.calculateRecentAccuracy();
    this.historicalAccuracy = 0.9 * this.historicalAccuracy + 0.1 * recentAccuracy;
    
    // Adjust weight based on accuracy
    this.weight = Math.max(0.1, Math.min(2.0, this.historicalAccuracy * 2));
  }
  
  protected calculateError(prediction: Prediction, actual: TaskResult): number {
    const successError = Math.abs(
      prediction.successProbability - (actual.isCorrect ? 1 : 0)
    );
    const timeError = Math.abs(prediction.expectedTime - actual.timeTaken) / 60;
    
    return (successError + Math.min(1, timeError)) / 2;
  }
  
  protected calculateRecentAccuracy(): number {
    if (this.predictionHistory.length === 0) return 0.5;
    
    const recentErrors = this.predictionHistory
      .slice(-20)
      .map(r => r.error);
    
    const avgError = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length;
    
    return 1 - avgError; // Low error = high accuracy
  }
  
  getName(): string {
    return this.name;
  }
  
  getWeight(): number {
    return this.weight;
  }
  
  getAccuracy(): number {
    return this.historicalAccuracy;
  }
}

interface PredictionRecord {
  prediction: Prediction;
  actual: TaskResult;
  error: number;
  timestamp: number;
}

// ===== MODEL 1: BAYESIAN PREDICTOR =====

/**
 * Uses Bayesian inference to update beliefs about learner ability
 * 
 * P(Success|Evidence) = P(Evidence|Success) * P(Success) / P(Evidence)
 */
export class BayesianPredictor extends BasePredictor {
  private priorSuccess: number = 0.7; // Prior belief
  
  constructor() {
    super("Bayesian");
  }
  
  predict(learner: InputVector, task: Task, history: TaskResult[]): Prediction {
    // Update prior based on recent history
    if (history.length > 0) {
      const recentSuccess = history.slice(-10).filter(t => t.isCorrect).length / Math.min(10, history.length);
      this.priorSuccess = 0.8 * this.priorSuccess + 0.2 * recentSuccess;
    }
    
    // Likelihood based on learner state
    const likelihood = this.calculateLikelihood(learner, task);
    
    // Posterior = Prior * Likelihood (simplified Bayes)
    const posterior = this.priorSuccess * likelihood;
    
    // Expected time based on learner speed + task complexity
    const taskComplexity = this.estimateTaskComplexity(task);
    const expectedTime = (1 - learner.N_speed) * 60 + taskComplexity * 30;
    
    // Recommended difficulty tracks current ability
    const recommendedDifficulty = this.priorSuccess > 0.8 ? 0.7 : 0.5;
    
    // Scaffolding inversely related to success rate
    const recommendedScaffolding = 1 - this.priorSuccess;
    
    // Confidence based on amount of evidence
    const confidence = Math.min(1, history.length / 20);
    
    return {
      successProbability: posterior,
      expectedTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence,
      reasoning: `Bayesian inference: Prior=${this.priorSuccess.toFixed(2)}, Likelihood=${likelihood.toFixed(2)}, Posterior=${posterior.toFixed(2)}`
    };
  }
  
  private calculateLikelihood(learner: InputVector, task: Task): number {
    let likelihood = 1.0;
    
    // Factors that affect likelihood
    if (learner.N_correct > 0.8) likelihood *= 1.2;
    if (learner.N_correct < 0.5) likelihood *= 0.8;
    
    if (learner.N_frustration > 0.5) likelihood *= 0.9;
    if (learner.N_flow > 0.6) likelihood *= 1.1;
    
    if (task.placeholderPosition !== 'none' && learner.N_self_correction < 0.5) {
      likelihood *= 0.7; // Placeholder tasks harder
    }
    
    return Math.max(0.1, Math.min(1.5, likelihood));
  }
  
  private estimateTaskComplexity(task: Task): number {
    let complexity = 0.5;
    
    if (task.operation === '-') complexity += 0.1;
    if (task.placeholderPosition === 'start') complexity += 0.2;
    if (task.placeholderPosition === 'middle') complexity += 0.15;
    
    const maxNum = Math.max(task.number1, task.number2);
    complexity += (maxNum / task.numberRange) * 0.2;
    
    return Math.min(1, complexity);
  }
}

// ===== MODEL 2: NEURAL NETWORK PREDICTOR =====

/**
 * Uses learned patterns from neural network
 * (Simplified - uses activation patterns)
 */
export class NeuralNetPredictor extends BasePredictor {
  constructor() {
    super("NeuralNet");
  }
  
  predict(learner: InputVector, task: Task, history: TaskResult[]): Prediction {
    // Neural prediction based on input patterns
    const performanceSignal = (
      learner.N_correct * 0.4 +
      learner.N_consistency * 0.3 +
      learner.N_first_attempt * 0.3
    );
    
    const strategicSignal = (
      learner.N_decomposition * 0.3 +
      learner.N_retrieval * 0.4 +
      learner.N_strategy_flexibility * 0.3
    );
    
    const emotionalSignal = (
      learner.N_engagement * 0.4 +
      (1 - learner.N_frustration) * 0.3 +
      learner.N_flow * 0.3
    );
    
    // Weighted combination (learned from data)
    const successProb = (
      performanceSignal * 0.5 +
      strategicSignal * 0.3 +
      emotionalSignal * 0.2
    );
    
    // Expected time from speed neuron
    const expectedTime = (1 - learner.N_speed) * 50 + 10;
    
    // Difficulty recommendation
    const recommendedDifficulty = successProb > 0.75 ? 0.8 : successProb > 0.6 ? 0.6 : 0.4;
    
    // Scaffolding based on cognitive load
    const recommendedScaffolding = 1 - strategicSignal;
    
    // Confidence from network stability
    const confidence = learner.N_consistency;
    
    return {
      successProbability: successProb,
      expectedTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence,
      reasoning: `Neural pattern recognition: Performance=${performanceSignal.toFixed(2)}, Strategic=${strategicSignal.toFixed(2)}, Emotional=${emotionalSignal.toFixed(2)}`
    };
  }
}

// ===== MODEL 3: SYMBOLIC REASONING PREDICTOR =====

/**
 * Rule-based reasoning (expert system)
 */
export class SymbolicReasoningPredictor extends BasePredictor {
  constructor() {
    super("Symbolic");
  }
  
  predict(learner: InputVector, task: Task, history: TaskResult[]): Prediction {
    let successProb = 0.7; // Default
    let reasoning = "Rules applied: ";
    
    // Rule 1: High accuracy → high success
    if (learner.N_correct > 0.8) {
      successProb = 0.9;
      reasoning += "High-accuracy-learner; ";
    } else if (learner.N_correct < 0.5) {
      successProb = 0.4;
      reasoning += "Struggling-learner; ";
    }
    
    // Rule 2: Frustration lowers success
    if (learner.N_frustration > 0.6) {
      successProb *= 0.8;
      reasoning += "High-frustration-penalty; ";
    }
    
    // Rule 3: Flow state increases success
    if (learner.N_flow > 0.7) {
      successProb *= 1.15;
      reasoning += "Flow-state-bonus; ";
    }
    
    // Rule 4: Placeholder tasks require metacognition
    if (task.placeholderPosition !== 'none') {
      if (learner.N_self_correction > 0.6) {
        successProb *= 1.0; // OK
        reasoning += "Ready-for-placeholder; ";
      } else {
        successProb *= 0.6; // Not ready
        reasoning += "Not-ready-for-placeholder; ";
      }
    }
    
    // Rule 5: Strategy maturity affects complex tasks
    if (task.numberRange === 100) {
      if (learner.N_place_value > 0.5) {
        successProb *= 1.1;
        reasoning += "Place-value-mastery; ";
      } else {
        successProb *= 0.9;
        reasoning += "Place-value-developing; ";
      }
    }
    
    // Expected time from rules
    let expectedTime = 30;
    if (learner.N_speed > 0.7) expectedTime = 15;
    if (learner.N_speed < 0.3) expectedTime = 60;
    
    // Difficulty recommendation
    const recommendedDifficulty = successProb > 0.8 ? 0.75 : 0.5;
    
    // Scaffolding
    const recommendedScaffolding = successProb < 0.6 ? 0.8 : 0.4;
    
    // Confidence based on rule clarity
    const confidence = 0.8;
    
    return {
      successProbability: Math.min(1, successProb),
      expectedTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence,
      reasoning: reasoning.trim()
    };
  }
}

// ===== MODEL 4: CASE-BASED PREDICTOR =====

/**
 * Finds similar past cases and predicts based on analogy
 */
export class CaseBasedPredictor extends BasePredictor {
  constructor() {
    super("CaseBased");
  }
  
  predict(learner: InputVector, task: Task, history: TaskResult[]): Prediction {
    if (history.length === 0) {
      return {
        successProbability: 0.6,
        expectedTime: 30,
        recommendedDifficulty: 0.5,
        recommendedScaffolding: 0.6,
        confidence: 0.2,
        reasoning: "No historical cases available"
      };
    }
    
    // Find similar past tasks
    const similarCases = this.findSimilarCases(task, history);
    
    if (similarCases.length === 0) {
      return {
        successProbability: 0.6,
        expectedTime: 30,
        recommendedDifficulty: 0.5,
        recommendedScaffolding: 0.6,
        confidence: 0.3,
        reasoning: "No similar cases found"
      };
    }
    
    // Predict based on similar cases
    const successRate = similarCases.filter(c => c.isCorrect).length / similarCases.length;
    const avgTime = similarCases.reduce((sum, c) => sum + c.timeTaken, 0) / similarCases.length;
    
    const recommendedDifficulty = successRate > 0.8 ? 0.7 : 0.5;
    const recommendedScaffolding = 1 - successRate;
    const confidence = Math.min(1, similarCases.length / 10);
    
    return {
      successProbability: successRate,
      expectedTime: avgTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence,
      reasoning: `Found ${similarCases.length} similar cases with ${(successRate * 100).toFixed(0)}% success rate`
    };
  }
  
  private findSimilarCases(task: Task, history: TaskResult[]): TaskResult[] {
    return history.filter(result => {
      const pastTask = result.task;
      
      // Same operation
      if (pastTask.operation !== task.operation) return false;
      
      // Similar number range
      if (pastTask.numberRange !== task.numberRange) return false;
      
      // Similar placeholder position
      if (pastTask.placeholderPosition !== task.placeholderPosition) return false;
      
      // Similar magnitude
      const pastMax = Math.max(pastTask.number1, pastTask.number2);
      const currentMax = Math.max(task.number1, task.number2);
      if (Math.abs(pastMax - currentMax) > 10) return false;
      
      return true;
    });
  }
}

// ===== MODEL 5: HYBRID PREDICTOR =====

/**
 * Combines multiple approaches
 */
export class HybridPredictor extends BasePredictor {
  constructor() {
    super("Hybrid");
  }
  
  predict(learner: InputVector, task: Task, history: TaskResult[]): Prediction {
    // Combine probabilistic + pattern-based
    
    // Probabilistic component (Bayesian-like)
    const recentSuccess = history.length > 0 
      ? history.slice(-5).filter(t => t.isCorrect).length / Math.min(5, history.length)
      : 0.6;
    
    // Pattern component (Neural-like)
    const performancePattern = (
      learner.N_correct * 0.3 +
      learner.N_consistency * 0.2 +
      learner.N_retrieval * 0.2 +
      learner.N_engagement * 0.15 +
      (1 - learner.N_frustration) * 0.15
    );
    
    // Hybrid prediction
    const successProb = 0.5 * recentSuccess + 0.5 * performancePattern;
    
    // Expected time
    const expectedTime = (1 - learner.N_speed) * 45 + 15;
    
    // Recommendations
    const recommendedDifficulty = successProb > 0.75 ? 0.7 : 0.55;
    const recommendedScaffolding = 1 - performancePattern;
    
    // Confidence
    const confidence = Math.min(1, (history.length / 15) * learner.N_consistency);
    
    return {
      successProbability: successProb,
      expectedTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence,
      reasoning: `Hybrid: Recent=${recentSuccess.toFixed(2)}, Pattern=${performancePattern.toFixed(2)}, Combined=${successProb.toFixed(2)}`
    };
  }
}

// ===== ENSEMBLE COORDINATOR =====

/**
 * Coordinates all models and produces weighted consensus
 */
export class EnsembleCoordinator {
  private models: BasePredictor[];
  
  constructor() {
    this.models = [
      new BayesianPredictor(),
      new NeuralNetPredictor(),
      new SymbolicReasoningPredictor(),
      new CaseBasedPredictor(),
      new HybridPredictor()
    ];
  }
  
  /**
   * Get ensemble prediction from all models
   */
  predict(learner: InputVector, task: Task, history: TaskResult[]): EnsemblePrediction {
    // Get prediction from each model
    const individualPredictions = new Map<string, Prediction>();
    
    for (const model of this.models) {
      const prediction = model.predict(learner, task, history);
      individualPredictions.set(model.getName(), prediction);
    }
    
    // Calculate weighted consensus
    const weights = new Map<string, number>();
    let totalWeight = 0;
    
    for (const model of this.models) {
      const weight = model.getWeight();
      weights.set(model.getName(), weight);
      totalWeight += weight;
    }
    
    // Normalize weights
    for (const [name, weight] of Array.from(weights.entries())) {
      weights.set(name, weight / totalWeight);
    }
    
    // Weighted average
    let successProb = 0;
    let expectedTime = 0;
    let recommendedDifficulty = 0;
    let recommendedScaffolding = 0;
    let avgConfidence = 0;
    
    for (const [name, prediction] of Array.from(individualPredictions.entries())) {
      const weight = weights.get(name) || 0;
      
      successProb += prediction.successProbability * weight;
      expectedTime += prediction.expectedTime * weight;
      recommendedDifficulty += prediction.recommendedDifficulty * weight;
      recommendedScaffolding += prediction.recommendedScaffolding * weight;
      avgConfidence += prediction.confidence * weight;
    }
    
    // Calculate consensus (agreement between models)
    const consensus = this.calculateConsensus(individualPredictions);
    
    return {
      successProbability: successProb,
      expectedTime,
      recommendedDifficulty,
      recommendedScaffolding,
      confidence: avgConfidence * consensus, // Lower confidence if models disagree
      reasoning: `Ensemble of ${this.models.length} models (consensus: ${(consensus * 100).toFixed(0)}%)`,
      individualPredictions,
      modelWeights: weights,
      consensus
    };
  }
  
  /**
   * Update all models with actual outcome
   */
  update(prediction: EnsemblePrediction, actual: TaskResult): void {
    for (const model of this.models) {
      const modelPrediction = prediction.individualPredictions.get(model.getName());
      if (modelPrediction) {
        model.update(modelPrediction, actual);
      }
    }
  }
  
  /**
   * Calculate consensus (how much models agree)
   */
  private calculateConsensus(predictions: Map<string, Prediction>): number {
    const successProbs = Array.from(predictions.values()).map(p => p.successProbability);
    
    if (successProbs.length < 2) return 1.0;
    
    // Standard deviation of predictions
    const mean = successProbs.reduce((a, b) => a + b, 0) / successProbs.length;
    const variance = successProbs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / successProbs.length;
    const stdDev = Math.sqrt(variance);
    
    // Low std dev = high consensus
    return Math.max(0, 1 - stdDev * 2);
  }
  
  /**
   * Get model statistics
   */
  getModelStats(): ModelStats[] {
    return this.models.map(model => ({
      name: model.getName(),
      weight: model.getWeight(),
      accuracy: model.getAccuracy()
    }));
  }
}

export interface ModelStats {
  name: string;
  weight: number;
  accuracy: number;
}

// ===== EXPORT SINGLETON =====

export const ensemblePredictor = new EnsembleCoordinator();
