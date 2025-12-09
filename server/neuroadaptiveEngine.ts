/**
 * Neuroadaptive Learning Engine (NLS 2.0)
 * 
 * A brain-like, multi-dimensional adaptive mathematics learning system
 * with 5 iterative analyzers that mutually influence each other.
 * 
 * Core Dimensions:
 * - RML: Representation Mastery Level (0.0-5.0)
 * - CLA: Cognitive Load Adaptation (0.0-5.0)
 * - SMI: Strategy Maturity Index (0.0-5.0)
 * - TAL: Tempo Adaptation Level (0.0-5.0)
 * - MCA: Metacognitive Awareness (0.0-5.0)
 */

import type { LearningProgression } from "../shared/schema";

// ===== Type Definitions =====

export interface LearnerProfile {
  rml: number; // 0.0-5.0
  cla: number; // 0.0-5.0
  smi: number; // 0.0-5.0
  tal: number; // 0.0-5.0
  mca: number; // 0.0-5.0
  
  recentPerformance: PerformancePoint[];
  dimensionHistory: DimensionSnapshot[];
  
  strengths: string[];
  gaps: string[];
  strategicGoals: string[];
  
  currentCognitiveLoad: number; // 0.0-1.0
  frustrationLevel: number; // 0.0-1.0
  confidence: number; // 0.0-1.0
  engagement: number; // 0.0-1.0
  
  dominantStrategy: string;
  emergingStrategies: string[];
  strategyFlexibility: number; // 0.0-1.0
}

export interface PerformancePoint {
  timestamp: Date;
  taskId: string;
  correct: boolean;
  timeSpent: number;
  expectedTime: number;
  
  cognitiveLoadAtTime: number;
  strategyUsed: string;
  errorType?: string;
  selfCorrected: boolean;
  helpRequested: boolean;
  
  rmlAtTime: number;
  claAtTime: number;
  smiAtTime: number;
  talAtTime: number;
  mcaAtTime: number;
}

export interface DimensionSnapshot {
  date: Date;
  rml: number;
  cla: number;
  smi: number;
  tal: number;
  mca: number;
  tasksCompleted: number;
  avgPerformance: number;
}

export interface TaskResult {
  taskId: string;
  correct: boolean;
  timeSpent: number;
  expectedTime: number;
  strategyUsed: string;
  errorType?: string;
  errorSeverity?: 'minor' | 'moderate' | 'severe';
  selfCorrected: boolean;
  helpRequested: boolean;
  helpWasAppropriate: boolean;
  rushedError: boolean;
  number1: number;
  number2: number;
  operation: '+' | '-';
}

export interface LearningPattern {
  strengths: string[];
  gaps: string[];
  plateau: boolean;
  regressionRisk: number; // 0.0-1.0
  dominantErrorTypes: string[];
  preferredStrategies: string[];
}

export interface CognitiveLoad {
  currentLoad: number; // 0.0-1.0
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: 'increase' | 'maintain' | 'decrease';
  needsBreak: boolean;
  overloadRisk: number; // 0.0-1.0
}

export interface StrategyProfile {
  dominantStrategy: string;
  emergingStrategies: string[];
  flexibility: number; // 0.0-1.0
  recommendedScaffolding: string;
  strategyTransitionScore: number; // 0.0-1.0
}

export interface EmotionalState {
  frustrationLevel: number; // 0.0-1.0
  confidence: number; // 0.0-1.0
  engagement: number; // 0.0-1.0
  needsEncouragement: boolean;
  motivationLevel: number; // 0.0-1.0
}

export interface AdaptationDecisions {
  rml: { delta: number; reason: string };
  cla: { delta: number; reason: string };
  smi: { delta: number; reason: string };
  tal: { delta: number; reason: string };
  mca: { delta: number; reason: string };
  
  taskRecommendation: {
    type: string;
    numberRange: [number, number];
    operationType: '+' | '-';
    complexity: number;
  };
}

export interface RepresentationConfig {
  positions: {
    center?: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  level: number; // RML value
  activeCount: number; // How many positions are active
  fadingIntensity: number; // 0.0-1.0 (opacity for gradual fading)
  message: string;
}

// ===== Analyzer 1: Pattern Recognition Engine =====

export class PatternRecognitionEngine {
  analyze(recentPerformance: PerformancePoint[]): LearningPattern {
    if (recentPerformance.length === 0) {
      return {
        strengths: [],
        gaps: [],
        plateau: false,
        regressionRisk: 0.0,
        dominantErrorTypes: [],
        preferredStrategies: []
      };
    }
    
    const errorTasks = recentPerformance.filter(p => !p.correct);
    const errorTypes = errorTasks.map(p => p.errorType).filter(Boolean);
    const strategies = recentPerformance.map(p => p.strategyUsed);
    
    // Detect dominant error types
    const errorCounts: Record<string, number> = {};
    errorTypes.forEach(type => {
      if (type) errorCounts[type] = (errorCounts[type] || 0) + 1;
    });
    
    const dominantErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
    
    // Detect preferred strategies
    const strategyCounts: Record<string, number> = {};
    strategies.forEach(strat => {
      strategyCounts[strat] = (strategyCounts[strat] || 0) + 1;
    });
    
    const preferredStrategies = Object.entries(strategyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([strat]) => strat);
    
    // Detect plateau (no improvement in last 10 tasks)
    const last10 = recentPerformance.slice(-10);
    const first5SuccessRate = last10.slice(0, 5).filter(p => p.correct).length / 5;
    const last5SuccessRate = last10.slice(5).filter(p => p.correct).length / 5;
    const plateau = Math.abs(last5SuccessRate - first5SuccessRate) < 0.1;
    
    // Calculate regression risk
    const recentSuccessRate = recentPerformance.slice(-5).filter(p => p.correct).length / 5;
    const regressionRisk = recentSuccessRate < 0.5 ? 0.7 : 0.2;
    
    // Identify strengths (task types with >80% success)
    const taskTypeSuccess: Record<string, { correct: number; total: number }> = {};
    // Simplified - would analyze specific number patterns
    
    return {
      strengths: recentSuccessRate > 0.8 ? ["general-competence"] : [],
      gaps: dominantErrors,
      plateau,
      regressionRisk,
      dominantErrorTypes: dominantErrors,
      preferredStrategies
    };
  }
}

// ===== Analyzer 2: Cognitive Load Monitor =====

export class CognitiveLoadMonitor {
  assessLoad(recentPerformance: PerformancePoint[], currentProfile: LearnerProfile): CognitiveLoad {
    if (recentPerformance.length < 3) {
      return {
        currentLoad: 0.5,
        trend: 'stable',
        recommendation: 'maintain',
        needsBreak: false,
        overloadRisk: 0.0
      };
    }
    
    const last5 = recentPerformance.slice(-5);
    const avgResponseTime = last5.reduce((sum, p) => sum + p.timeSpent, 0) / last5.length;
    const avgExpectedTime = last5.reduce((sum, p) => sum + p.expectedTime, 0) / last5.length;
    
    // Response time ratio (>1.5 = slow, <0.8 = fast)
    const timeRatio = avgResponseTime / avgExpectedTime;
    
    // Error rate
    const errorRate = last5.filter(p => !p.correct).length / last5.length;
    
    // Help requests
    const helpRate = last5.filter(p => p.helpRequested).length / last5.length;
    
    // Calculate cognitive load
    let load = 0.5; // Baseline
    
    if (timeRatio > 1.5) load += 0.2; // Slow responses indicate struggle
    if (errorRate > 0.4) load += 0.2; // Many errors
    if (helpRate > 0.4) load += 0.15; // Frequent help requests
    
    if (timeRatio < 0.8) load -= 0.2; // Fast responses
    if (errorRate < 0.2) load -= 0.1; // Few errors
    
    load = Math.max(0.0, Math.min(1.0, load));
    
    // Detect trend
    const first3 = recentPerformance.slice(-6, -3);
    const last3 = recentPerformance.slice(-3);
    
    const first3AvgTime = first3.reduce((sum, p) => sum + p.timeSpent / p.expectedTime, 0) / 3;
    const last3AvgTime = last3.reduce((sum, p) => sum + p.timeSpent / p.expectedTime, 0) / 3;
    
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (last3AvgTime > first3AvgTime * 1.2) trend = 'increasing';
    if (last3AvgTime < first3AvgTime * 0.8) trend = 'decreasing';
    
    // Recommendations
    let recommendation: 'increase' | 'maintain' | 'decrease' = 'maintain';
    if (load < 0.4) recommendation = 'increase'; // Underchall enged
    if (load > 0.75) recommendation = 'decrease'; // Overwhelmed
    
    const needsBreak = load > 0.85 || recentPerformance.length > 15;
    const overloadRisk = load > 0.7 ? load : 0.0;
    
    return {
      currentLoad: load,
      trend,
      recommendation,
      needsBreak,
      overloadRisk
    };
  }
}

// ===== Analyzer 3: Strategy Evolution Tracker =====

export class StrategyEvolutionTracker {
  trackEvolution(recentPerformance: PerformancePoint[]): StrategyProfile {
    if (recentPerformance.length < 5) {
      return {
        dominantStrategy: "counting",
        emergingStrategies: [],
        flexibility: 0.0,
        recommendedScaffolding: "pattern-practice",
        strategyTransitionScore: 0.0
      };
    }
    
    const strategies = recentPerformance.map(p => p.strategyUsed);
    const strategyCounts: Record<string, number> = {};
    
    strategies.forEach(strat => {
      strategyCounts[strat] = (strategyCounts[strat] || 0) + 1;
    });
    
    const sortedStrategies = Object.entries(strategyCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const dominantStrategy = sortedStrategies[0]?.[0] || "counting";
    const dominantCount = sortedStrategies[0]?.[1] || 0;
    
    // Detect emerging strategies (used 2-4 times recently)
    const emergingStrategies = sortedStrategies
      .filter(([strat, count]) => count >= 2 && count <= 4 && strat !== dominantStrategy)
      .map(([strat]) => strat);
    
    // Calculate flexibility (variety of strategies)
    const uniqueStrategies = Object.keys(strategyCounts).length;
    const flexibility = Math.min(1.0, uniqueStrategies / 5);
    
    // Detect strategy transitions (change in last 5 vs previous 5)
    const last5 = recentPerformance.slice(-5);
    const prev5 = recentPerformance.slice(-10, -5);
    
    const last5Dominant = this.getDominant(last5.map(p => p.strategyUsed));
    const prev5Dominant = this.getDominant(prev5.map(p => p.strategyUsed));
    
    const strategyTransitionScore = last5Dominant !== prev5Dominant ? 1.0 : 0.0;
    
    // Recommend scaffolding based on current strategy
    let recommendedScaffolding = "pattern-practice";
    if (dominantStrategy === "counting") {
      recommendedScaffolding = "decomposition-scaffolding";
    } else if (dominantStrategy === "decomposition") {
      recommendedScaffolding = "analog-tasks";
    } else if (dominantStrategy.includes("place-value")) {
      recommendedScaffolding = "operative-packet-practice";
    }
    
    return {
      dominantStrategy,
      emergingStrategies,
      flexibility,
      recommendedScaffolding,
      strategyTransitionScore
    };
  }
  
  private getDominant(strategies: string[]): string {
    const counts: Record<string, number> = {};
    strategies.forEach(s => counts[s] = (counts[s] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "counting";
  }
}

// ===== Analyzer 4: Emotional State Estimator =====

export class EmotionalStateEstimator {
  estimate(recentPerformance: PerformancePoint[], profileData: Partial<LearnerProfile>): EmotionalState {
    if (recentPerformance.length === 0) {
      return {
        frustrationLevel: 0.0,
        confidence: 0.5,
        engagement: 0.8,
        needsEncouragement: false,
        motivationLevel: 0.7
      };
    }
    
    const last5 = recentPerformance.slice(-5);
    
    // Calculate frustration (increasing errors + long times)
    const errorRate = last5.filter(p => !p.correct).length / last5.length;
    const avgTimeRatio = last5.reduce((sum, p) => sum + p.timeSpent / p.expectedTime, 0) / last5.length;
    
    let frustration = 0.0;
    if (errorRate > 0.6) frustration += 0.4;
    if (avgTimeRatio > 1.5) frustration += 0.2;
    if (last5.filter(p => p.helpRequested).length > 2) frustration += 0.2;
    
    frustration = Math.min(1.0, frustration);
    
    // Calculate confidence (success rate + speed)
    const successRate = last5.filter(p => p.correct).length / last5.length;
    let confidence = successRate * 0.7;
    if (avgTimeRatio < 0.9) confidence += 0.2;
    if (last5.some(p => p.selfCorrected)) confidence += 0.1;
    
    confidence = Math.max(0.0, Math.min(1.0, confidence));
    
    // Calculate engagement (consistent participation, no long gaps)
    const engagement = profileData.engagement ?? 0.8;
    
    // Needs encouragement
    const needsEncouragement = frustration > 0.5 || confidence < 0.4;
    
    // Motivation (combination of confidence and low frustration)
    const motivationLevel = (confidence * 0.6) + ((1 - frustration) * 0.4);
    
    return {
      frustrationLevel: frustration,
      confidence,
      engagement,
      needsEncouragement,
      motivationLevel
    };
  }
}

// ===== Analyzer 5: Progression Orchestrator =====

export class ProgressionOrchestrator {
  orchestrate(
    patterns: LearningPattern,
    cogLoad: CognitiveLoad,
    strategies: StrategyProfile,
    emotions: EmotionalState,
    currentProfile: LearnerProfile,
    taskResult: TaskResult
  ): AdaptationDecisions {
    // Initialize deltas
    let rmlDelta = 0.0;
    let claDelta = 0.0;
    let smiDelta = 0.0;
    let talDelta = 0.0;
    let mcaDelta = 0.0;
    
    // === RML Adaptation (Representation Mastery) ===
    let rmlReason = "";
    
    if (taskResult.correct) {
      if (taskResult.timeSpent < taskResult.expectedTime * 0.8) {
        rmlDelta += 0.1; // Fast & correct = reduce support
        rmlReason = "Fast correct response, reducing visual support";
      } else if (taskResult.timeSpent < taskResult.expectedTime * 1.2) {
        rmlDelta += 0.05; // Moderate speed
        rmlReason = "Consistent success, gradual support reduction";
      }
    } else {
      if (taskResult.errorType === "conceptual" || taskResult.errorSeverity === "severe") {
        rmlDelta -= 0.2; // Serious error = more support
        rmlReason = "Conceptual error detected, increasing support";
      } else if (taskResult.errorType === "careless") {
        rmlDelta -= 0.05; // Minor error
        rmlReason = "Minor error, slight support increase";
      }
    }
    
    // Emotional correction
    if (emotions.frustrationLevel > 0.6) {
      rmlDelta -= 0.15;
      rmlReason += " (Frustration detected, adding support)";
    }
    
    // === CLA Adaptation (Cognitive Load) ===
    let claReason = "";
    
    if (taskResult.correct && cogLoad.currentLoad < 0.5) {
      claDelta += 0.15; // Underchallenged = increase complexity
      claReason = "Low cognitive load, increasing number complexity";
    } else if (cogLoad.currentLoad > 0.85) {
      claDelta -= 0.2; // Overloaded = simplify
      claReason = "High cognitive load, simplifying numbers";
    } else if (cogLoad.recommendation === 'maintain') {
      claDelta = 0.0;
      claReason = "Optimal challenge level maintained";
    }
    
    // === SMI Adaptation (Strategy Maturity) ===
    let smiReason = "";
    
    if (strategies.emergingStrategies.length > 0) {
      smiDelta += 0.1; // New strategies emerging
      smiReason = `New strategies emerging: ${strategies.emergingStrategies.join(', ')}`;
    }
    
    if (strategies.flexibility > 0.7) {
      smiDelta += 0.15; // High flexibility
      smiReason += " (High strategy flexibility)";
    }
    
    if (strategies.strategyTransitionScore > 0.5) {
      smiDelta += 0.1; // Strategy transition
      smiReason += " (Strategy transition detected)";
    }
    
    if (taskResult.strategyUsed === "counting" && currentProfile.smi > 1.5) {
      smiDelta -= 0.05; // Regression to counting
      smiReason = "Regression to counting strategy";
    }
    
    // === TAL Adaptation (Tempo) ===
    let talReason = "";
    
    if (taskResult.correct && taskResult.timeSpent < taskResult.expectedTime * 0.7) {
      talDelta += 0.05; // Fast without errors
      talReason = "Speed increasing without quality loss";
    }
    
    if (taskResult.rushedError) {
      talDelta -= 0.1; // Too fast = quality loss
      talReason = "Rushed error detected, reducing tempo pressure";
    }
    
    if (emotions.frustrationLevel > 0.5) {
      talDelta -= 0.05; // Reduce tempo if frustrated
      talReason += " (Reducing tempo due to frustration)";
    }
    
    // === MCA Adaptation (Metacognitive Awareness) ===
    let mcaReason = "";
    
    if (taskResult.selfCorrected) {
      mcaDelta += 0.2; // Self-correction is highly metacognitive
      mcaReason = "Self-correction observed";
    }
    
    if (taskResult.helpRequested && taskResult.helpWasAppropriate) {
      mcaDelta += 0.1; // Appropriate help-seeking
      mcaReason = "Appropriate help request (good self-assessment)";
    }
    
    if (strategies.strategyTransitionScore > 0.5) {
      mcaDelta += 0.05; // Strategy switches show awareness
      mcaReason += " (Strategic decision-making)";
    }
    
    // === Cross-Dimensional Constraints ===
    
    // Constraint 1: RML can't exceed SMI + 1.0
    // (Need strategies before removing support)
    const maxRML = Math.min(5.0, currentProfile.smi + 1.0);
    const proposedRML = Math.max(0.0, Math.min(maxRML, currentProfile.rml + rmlDelta));
    rmlDelta = proposedRML - currentProfile.rml;
    
    // Constraint 2: CLA shouldn't be too far from RML
    // (Complex numbers need support)
    const maxCLA = Math.min(5.0, proposedRML + 1.5);
    const proposedCLA = Math.max(0.0, Math.min(maxCLA, currentProfile.cla + claDelta));
    claDelta = proposedCLA - currentProfile.cla;
    
    // === Task Recommendation ===
    const taskRecommendation = this.generateTaskRecommendation(
      proposedRML,
      proposedCLA,
      currentProfile.smi + smiDelta,
      strategies,
      patterns
    );
    
    return {
      rml: { delta: rmlDelta, reason: rmlReason },
      cla: { delta: claDelta, reason: claReason },
      smi: { delta: smiDelta, reason: smiReason },
      tal: { delta: talDelta, reason: talReason },
      mca: { delta: mcaDelta, reason: mcaReason },
      taskRecommendation
    };
  }
  
  private generateTaskRecommendation(
    rml: number,
    cla: number,
    smi: number,
    strategies: StrategyProfile,
    patterns: LearningPattern
  ): AdaptationDecisions['taskRecommendation'] {
    // Select task type based on strategy scaffolding
    let type = strategies.recommendedScaffolding;
    
    // Number range based on CLA
    let numberRange: [number, number] = [5, 10];
    
    if (cla < 1.0) numberRange = [3, 8];
    else if (cla < 2.0) numberRange = [5, 12];
    else if (cla < 3.0) numberRange = [8, 20];
    else if (cla < 4.0) numberRange = [15, 40];
    else numberRange = [20, 100];
    
    // Operation type (start with addition)
    const operationType: '+' | '-' = cla > 1.5 ? '+' : '+'; // Later: mix with '-'
    
    // Complexity score
    const complexity = (cla * 0.4) + (smi * 0.3) + (rml * 0.3);
    
    return {
      type,
      numberRange,
      operationType,
      complexity
    };
  }
}

// ===== Main Neuroadaptive Engine =====

export class NeuroadaptiveEngine {
  private patternEngine: PatternRecognitionEngine;
  private cogLoadMonitor: CognitiveLoadMonitor;
  private strategyTracker: StrategyEvolutionTracker;
  private emotionEstimator: EmotionalStateEstimator;
  private orchestrator: ProgressionOrchestrator;
  
  constructor() {
    this.patternEngine = new PatternRecognitionEngine();
    this.cogLoadMonitor = new CognitiveLoadMonitor();
    this.strategyTracker = new StrategyEvolutionTracker();
    this.emotionEstimator = new EmotionalStateEstimator();
    this.orchestrator = new ProgressionOrchestrator();
  }
  
  /**
   * Main entry point: Update learner profile based on task result
   */
  updateLearnerProfile(
    progression: LearningProgression,
    taskResult: TaskResult
  ): Partial<LearningProgression> {
    // Convert progression to LearnerProfile
    const profile = this.progressionToProfile(progression);
    
    // Run all 5 analyzers
    const patterns = this.patternEngine.analyze(profile.recentPerformance);
    const cogLoad = this.cogLoadMonitor.assessLoad(profile.recentPerformance, profile);
    const strategies = this.strategyTracker.trackEvolution(profile.recentPerformance);
    const emotions = this.emotionEstimator.estimate(profile.recentPerformance, profile);
    
    // Orchestrate adaptations
    const decisions = this.orchestrator.orchestrate(
      patterns,
      cogLoad,
      strategies,
      emotions,
      profile,
      taskResult
    );
    
    // Apply decisions
    const newRML = Math.max(0.0, Math.min(5.0, profile.rml + decisions.rml.delta));
    const newCLA = Math.max(0.0, Math.min(5.0, profile.cla + decisions.cla.delta));
    const newSMI = Math.max(0.0, Math.min(5.0, profile.smi + decisions.smi.delta));
    const newTAL = Math.max(0.0, Math.min(5.0, profile.tal + decisions.tal.delta));
    const newMCA = Math.max(0.0, Math.min(5.0, profile.mca + decisions.mca.delta));
    
    // Update performance history
    const newPerformancePoint: PerformancePoint = {
      timestamp: new Date(),
      taskId: taskResult.taskId,
      correct: taskResult.correct,
      timeSpent: taskResult.timeSpent,
      expectedTime: taskResult.expectedTime,
      cognitiveLoadAtTime: cogLoad.currentLoad,
      strategyUsed: taskResult.strategyUsed,
      errorType: taskResult.errorType,
      selfCorrected: taskResult.selfCorrected,
      helpRequested: taskResult.helpRequested,
      rmlAtTime: newRML,
      claAtTime: newCLA,
      smiAtTime: newSMI,
      talAtTime: newTAL,
      mcaAtTime: newMCA
    };
    
    const updatedPerformance = [
      ...profile.recentPerformance.slice(-19),
      newPerformancePoint
    ];
    
    // Return updates
    return {
      rml: newRML,
      cla: newCLA,
      smi: newSMI,
      tal: newTAL,
      mca: newMCA,
      
      recentPerformance: updatedPerformance as any,
      
      strengths: patterns.strengths as any,
      gaps: patterns.gaps as any,
      
      currentCognitiveLoad: cogLoad.currentLoad,
      frustrationLevel: emotions.frustrationLevel,
      confidence: emotions.confidence,
      engagement: emotions.engagement,
      
      dominantStrategy: strategies.dominantStrategy,
      emergingStrategies: strategies.emergingStrategies as any,
      strategyFlexibility: strategies.flexibility,
      
      lastAnalyzed: new Date() as any,
      totalAnalyses: (progression.totalAnalyses ?? 0) + 1
    };
  }
  
  /**
   * Generate representation config based on RML
   */
  generateRepresentationConfig(rml: number, smi: number, taskType: string): RepresentationConfig {
    const positions: RepresentationConfig['positions'] = {};
    let activeCount = 0;
    let message = "";
    
    // RML-based representation selection (0=full support, 5=no support)
    if (rml < 1.0) {
      // RML 0.0-0.9: Full support (5 positions)
      positions.center = "symbolic";
      positions.top = "number-line";
      positions.bottom = "twenty-frame";
      positions.left = smi < 2.0 ? "finger-counting" : "place-value-chart";
      positions.right = "counters";
      activeCount = 5;
      message = "Volle visuelle Unterstützung - Du lernst gerade die Grundlagen!";
    } else if (rml < 2.0) {
      // RML 1.0-1.9: High support (4 positions)
      positions.center = "symbolic";
      positions.top = "number-line";
      positions.bottom = "twenty-frame";
      positions.left = smi < 2.0 ? "finger-counting" : "place-value-chart";
      activeCount = 4;
      message = "Hohe Unterstützung - Du machst Fortschritte!";
    } else if (rml < 3.0) {
      // RML 2.0-2.9: Medium support (3 positions)
      positions.center = "symbolic";
      positions.top = "number-line";
      positions.bottom = smi >= 2.5 ? "place-value-chart" : "twenty-frame";
      activeCount = 3;
      message = "Mittlere Unterstützung - Du wirst immer selbstständiger!";
    } else if (rml < 4.0) {
      // RML 3.0-3.9: Low support (2 positions)
      positions.center = "symbolic";
      positions.top = smi >= 3.5 ? "number-line-minimal" : "twenty-frame-faded";
      activeCount = 2;
      message = "Geringe Unterstützung - Fast geschafft!";
    } else if (rml < 5.0) {
      // RML 4.0-4.9: Minimal support (1 position)
      positions.center = "symbolic-with-hints";
      activeCount = 1;
      message = "Minimale Unterstützung - Du bist schon sehr gut!";
    } else {
      // RML 5.0: No support (mastery)
      positions.center = "symbolic-only";
      activeCount = 0;
      message = "Meister-Level erreicht! Du rechnest jetzt wie ein Profi! 🌟";
    }
    
    // Calculate fading intensity (within sub-level)
    const subLevel = rml % 1.0;
    const fadingIntensity = 1.0 - (subLevel * 0.3); // 100% → 70% opacity
    
    return {
      positions,
      level: rml,
      activeCount,
      fadingIntensity,
      message
    };
  }
  
  /**
   * Convert LearningProgression to LearnerProfile
   */
  private progressionToProfile(progression: LearningProgression): LearnerProfile {
    return {
      rml: progression.rml ?? 0.0,
      cla: progression.cla ?? 0.5,
      smi: progression.smi ?? 0.0,
      tal: progression.tal ?? 0.5,
      mca: progression.mca ?? 0.0,
      
      recentPerformance: (progression.recentPerformance as any) ?? [],
      dimensionHistory: (progression.dimensionHistory as any) ?? [],
      
      strengths: (progression.strengths as any) ?? [],
      gaps: (progression.gaps as any) ?? [],
      strategicGoals: (progression.strategicGoals as any) ?? [],
      
      currentCognitiveLoad: progression.currentCognitiveLoad ?? 0.5,
      frustrationLevel: progression.frustrationLevel ?? 0.0,
      confidence: progression.confidence ?? 0.5,
      engagement: progression.engagement ?? 0.8,
      
      dominantStrategy: progression.dominantStrategy ?? "counting",
      emergingStrategies: (progression.emergingStrategies as any) ?? [],
      strategyFlexibility: progression.strategyFlexibility ?? 0.0
    };
  }
}

// Export singleton instance
export const neuroadaptiveEngine = new NeuroadaptiveEngine();
