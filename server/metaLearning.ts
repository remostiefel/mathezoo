/**
 * Meta-Learning System
 * 
 * "Learning how to learn" - The system learns optimal learning strategies
 * 
 * Research Foundation:
 * - Metacognition (Flavell, 1979)
 * - Self-Regulated Learning (Zimmerman, 2002)
 * - Learning to Learn (Hattie et al., 1996)
 * - Meta-Learning in Neural Networks (Thrun & Pratt, 1998)
 * - Model-Agnostic Meta-Learning (Finn et al., 2017)
 * 
 * What the System Learns:
 * 1. Optimal learning rate for each student
 * 2. Best difficulty progression curve
 * 3. Effective spacing intervals
 * 4. Productive error patterns (desirable difficulties)
 * 5. Personalized scaffolding reduction schedule
 */

import type { InputVector, OutputVector } from "./neuralLearnerModel";

// ===== TYPES =====

export interface LearningStrategy {
  name: string;
  learningRate: number; // How fast to adapt (0-1)
  difficultyProgression: 'gradual' | 'steep' | 'adaptive';
  spacingInterval: number; // Minutes between practice sessions
  errorTolerance: number; // 0-1 (how many errors before intervention)
  scaffoldingReduction: number; // 0-1 (how fast to remove support)
  explorationRate: number; // 0-1 (try new strategies vs. exploit known good ones)
}

export interface MetaLearningProfile {
  optimalLearningRate: number;
  optimalDifficultyCurve: number[]; // Progression over time
  optimalSpacing: number;
  errorRecoveryRate: number; // How fast learner recovers from errors
  strategyAdaptability: number; // How quickly learner adopts new strategies
  plateauSensitivity: number; // Detect when learning plateaus
  breakthroughIndicators: string[]; // What leads to breakthroughs
  learningStylePreferences: Record<string, number>;
}

export interface MetaLearningUpdate {
  profileUpdated: boolean;
  newInsights: string[];
  strategyRecommendations: string[];
  performanceTrend: 'improving' | 'stable' | 'declining' | 'plateau';
  breakthroughProbability: number; // 0-1
  optimalNextSteps: string[];
}

// ===== META-LEARNING ENGINE =====

export class MetaLearningEngine {
  
  /**
   * Analyze learning patterns and update meta-profile
   */
  updateMetaProfile(
    history: any[],
    currentProfile: MetaLearningProfile | null
  ): { profile: MetaLearningProfile; update: MetaLearningUpdate } {
    
    // Initialize profile if needed
    const profile = currentProfile || this.initializeProfile();
    
    // Analyze recent performance
    const trend = this.analyzePerformanceTrend(history);
    
    // Calculate optimal learning rate
    const optimalLR = this.calculateOptimalLearningRate(history);
    profile.optimalLearningRate = optimalLR;
    
    // Analyze difficulty curve
    const difficultyCurve = this.analyzeDifficultyCurve(history);
    profile.optimalDifficultyCurve = difficultyCurve;
    
    // Calculate spacing
    const spacing = this.calculateOptimalSpacing(history);
    profile.optimalSpacing = spacing;
    
    // Error recovery
    const errorRecovery = this.analyzeErrorRecovery(history);
    profile.errorRecoveryRate = errorRecovery;
    
    // Strategy adaptability
    const adaptability = this.analyzeStrategyAdaptability(history);
    profile.strategyAdaptability = adaptability;
    
    // Plateau detection
    const plateauSens = this.detectPlateauSensitivity(history);
    profile.plateauSensitivity = plateauSens;
    
    // Breakthrough indicators
    const breakthroughs = this.identifyBreakthroughIndicators(history);
    profile.breakthroughIndicators = breakthroughs;
    
    // Learning style preferences
    const stylePrefs = this.analyzelearningStylePreferences(history);
    profile.learningStylePreferences = stylePrefs;
    
    // Generate insights
    const insights = this.generateInsights(profile, history);
    
    // Generate strategy recommendations
    const strategies = this.generateStrategyRecommendations(profile, trend);
    
    // Calculate breakthrough probability
    const breakthroughProb = this.calculateBreakthroughProbability(profile, history);
    
    // Generate optimal next steps
    const nextSteps = this.generateOptimalNextSteps(profile, trend);
    
    const update: MetaLearningUpdate = {
      profileUpdated: true,
      newInsights: insights,
      strategyRecommendations: strategies,
      performanceTrend: trend,
      breakthroughProbability: breakthroughProb,
      optimalNextSteps: nextSteps
    };
    
    return { profile, update };
  }
  
  /**
   * Initialize meta-learning profile
   */
  private initializeProfile(): MetaLearningProfile {
    return {
      optimalLearningRate: 0.5,
      optimalDifficultyCurve: [0.4, 0.5, 0.6, 0.7],
      optimalSpacing: 30,
      errorRecoveryRate: 0.5,
      strategyAdaptability: 0.5,
      plateauSensitivity: 0.5,
      breakthroughIndicators: [],
      learningStylePreferences: {
        visual: 0.5,
        kinesthetic: 0.5,
        symbolic: 0.5,
        verbal: 0.5
      }
    };
  }
  
  /**
   * Analyze performance trend
   */
  private analyzePerformanceTrend(history: any[]): 'improving' | 'stable' | 'declining' | 'plateau' {
    if (history.length < 10) return 'stable';
    
    const recent = history.slice(-10);
    const older = history.slice(-20, -10);
    
    const recentSuccess = recent.filter(h => h.isCorrect).length / recent.length;
    const olderSuccess = older.filter(h => h.isCorrect).length / Math.max(1, older.length);
    
    const diff = recentSuccess - olderSuccess;
    
    if (Math.abs(diff) < 0.05) {
      // Check for plateau (no improvement over longer period)
      const longTerm = history.slice(-30);
      const variance = this.calculateVariance(longTerm.map(h => h.isCorrect ? 1 : 0));
      
      if (variance < 0.1 && recentSuccess > 0.7) {
        return 'plateau'; // High performance, low variance = plateau
      }
      return 'stable';
    }
    
    if (diff > 0.05) return 'improving';
    return 'declining';
  }
  
  /**
   * Calculate optimal learning rate
   * 
   * Fast learners can handle higher rates
   * Struggling learners need slower, more stable learning
   */
  private calculateOptimalLearningRate(history: any[]): number {
    if (history.length < 5) return 0.5;
    
    const recent = history.slice(-20);
    
    // Factor 1: Success rate (high success = can handle faster learning)
    const successRate = recent.filter(h => h.isCorrect).length / recent.length;
    
    // Factor 2: Consistency (high variance = need slower learning)
    const variance = this.calculateVariance(recent.map(h => h.isCorrect ? 1 : 0));
    const consistency = 1 - Math.min(1, variance * 2);
    
    // Factor 3: Speed (fast solvers can handle faster learning)
    const avgTime = recent.reduce((sum, h) => sum + (h.timeTaken || 30), 0) / recent.length;
    const speedScore = Math.max(0, 1 - avgTime / 60);
    
    // Combine
    let optimalRate = (
      successRate * 0.4 +
      consistency * 0.3 +
      speedScore * 0.3
    );
    
    // Clamp to safe range
    return Math.max(0.2, Math.min(0.8, optimalRate));
  }
  
  /**
   * Analyze difficulty curve
   */
  private analyzeDifficultyCurve(history: any[]): number[] {
    const curve: number[] = [];
    const windowSize = 5;
    
    for (let i = 0; i < history.length; i += windowSize) {
      const window = history.slice(i, i + windowSize);
      if (window.length === 0) continue;
      
      const avgSuccess = window.filter(h => h.isCorrect).length / window.length;
      
      // Optimal difficulty: maintain 60-80% success
      let targetDifficulty = 0.5;
      if (avgSuccess > 0.8) {
        targetDifficulty = 0.7; // Increase difficulty
      } else if (avgSuccess < 0.6) {
        targetDifficulty = 0.4; // Decrease difficulty
      }
      
      curve.push(targetDifficulty);
    }
    
    return curve.slice(-10); // Keep last 10 windows
  }
  
  /**
   * Calculate optimal spacing (minutes between sessions)
   */
  private calculateOptimalSpacing(history: any[]): number {
    if (history.length < 5) return 30;
    
    // Analyze retention over time
    const sessions = this.groupIntoSessions(history);
    
    if (sessions.length < 2) return 30;
    
    // Find optimal spacing based on retention
    let optimalSpacing = 30;
    let bestRetention = 0;
    
    for (const spacing of [15, 30, 60, 120, 240]) {
      const retention = this.calculateRetentionForSpacing(sessions, spacing);
      if (retention > bestRetention) {
        bestRetention = retention;
        optimalSpacing = spacing;
      }
    }
    
    return optimalSpacing;
  }
  
  /**
   * Analyze error recovery rate
   */
  private analyzeErrorRecovery(history: any[]): number {
    if (history.length < 10) return 0.5;
    
    let totalRecoveries = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < history.length - 1; i++) {
      if (!history[i].isCorrect) {
        totalErrors++;
        // Check if next task is correct
        if (history[i + 1]?.isCorrect) {
          totalRecoveries++;
        }
      }
    }
    
    return totalErrors > 0 ? totalRecoveries / totalErrors : 0.5;
  }
  
  /**
   * Analyze strategy adaptability
   */
  private analyzeStrategyAdaptability(history: any[]): number {
    if (history.length < 10) return 0.5;
    
    const strategies = history.map(h => h.strategyUsed || 'unknown');
    const uniqueStrategies = new Set(strategies);
    
    // More strategy variety = higher adaptability
    const variety = uniqueStrategies.size / Math.max(1, strategies.length / 5);
    
    // Successful strategy switches
    let successfulSwitches = 0;
    let totalSwitches = 0;
    
    for (let i = 1; i < history.length; i++) {
      if (strategies[i] !== strategies[i - 1]) {
        totalSwitches++;
        if (history[i].isCorrect) {
          successfulSwitches++;
        }
      }
    }
    
    const switchSuccess = totalSwitches > 0 ? successfulSwitches / totalSwitches : 0.5;
    
    return Math.min(1, variety * 0.4 + switchSuccess * 0.6);
  }
  
  /**
   * Detect plateau sensitivity
   */
  private detectPlateauSensitivity(history: any[]): number {
    if (history.length < 20) return 0.5;
    
    const windows = [];
    for (let i = 0; i < history.length; i += 5) {
      const window = history.slice(i, i + 5);
      const success = window.filter(h => h.isCorrect).length / window.length;
      windows.push(success);
    }
    
    // Calculate variance over windows
    const variance = this.calculateVariance(windows);
    
    // Low variance = plateau (sensitive to plateau = low score)
    return Math.min(1, variance * 2);
  }
  
  /**
   * Identify breakthrough indicators
   */
  private identifyBreakthroughIndicators(history: any[]): string[] {
    const indicators: string[] = [];
    
    if (history.length < 10) return indicators;
    
    // Look for sudden improvements
    for (let i = 5; i < history.length; i++) {
      const before = history.slice(i - 5, i);
      const after = history.slice(i, i + 5);
      
      const beforeSuccess = before.filter(h => h.isCorrect).length / before.length;
      const afterSuccess = after.filter(h => h.isCorrect).length / after.length;
      
      if (afterSuccess - beforeSuccess > 0.3) {
        // Breakthrough detected! What changed?
        const breakTask = history[i];
        
        if (breakTask.task?.placeholderPosition !== 'none') {
          indicators.push('placeholder_mastery');
        }
        
        if (breakTask.strategyUsed && breakTask.strategyUsed !== 'counting') {
          indicators.push(`strategy_${breakTask.strategyUsed}`);
        }
        
        if (breakTask.task?.numberRange === 100) {
          indicators.push('hundred_range_breakthrough');
        }
      }
    }
    
    return [...new Set(indicators)]; // Remove duplicates
  }
  
  /**
   * Analyze learning style preferences
   */
  private analyzelearningStylePreferences(history: any[]): Record<string, number> {
    const preferences: Record<string, number> = {
      visual: 0.5,
      kinesthetic: 0.5,
      symbolic: 0.5,
      verbal: 0.5
    };
    
    if (history.length < 10) return preferences;
    
    // Analyze representation usage and success
    const repUsage: Record<string, { total: number; success: number }> = {};
    
    for (const h of history) {
      const reps = h.representationsUsed || [];
      for (const rep of reps) {
        if (!repUsage[rep]) {
          repUsage[rep] = { total: 0, success: 0 };
        }
        repUsage[rep].total++;
        if (h.isCorrect) {
          repUsage[rep].success++;
        }
      }
    }
    
    // Map representations to learning styles
    const styleMapping: Record<string, string> = {
      fingers: 'kinesthetic',
      counters: 'kinesthetic',
      twentyFrame: 'visual',
      hundredField: 'visual',
      numberLine: 'visual',
      placeValue: 'visual',
      symbolic: 'symbolic'
    };
    
    const styleCounts: Record<string, { total: number; success: number }> = {
      visual: { total: 0, success: 0 },
      kinesthetic: { total: 0, success: 0 },
      symbolic: { total: 0, success: 0 },
      verbal: { total: 0, success: 0 }
    };
    
    for (const [rep, data] of Object.entries(repUsage)) {
      const style = styleMapping[rep] || 'visual';
      styleCounts[style].total += data.total;
      styleCounts[style].success += data.success;
    }
    
    // Calculate preferences
    for (const [style, data] of Object.entries(styleCounts)) {
      if (data.total > 0) {
        preferences[style] = data.success / data.total;
      }
    }
    
    return preferences;
  }
  
  /**
   * Generate insights from meta-profile
   */
  private generateInsights(profile: MetaLearningProfile, history: any[]): string[] {
    const insights: string[] = [];
    
    // Learning rate insights
    if (profile.optimalLearningRate > 0.7) {
      insights.push("🚀 Schneller Lerner - kann anspruchsvolle Herausforderungen bewältigen");
    } else if (profile.optimalLearningRate < 0.3) {
      insights.push("🐢 Benötigt mehr Zeit - geduldiger Ansatz empfohlen");
    }
    
    // Error recovery
    if (profile.errorRecoveryRate > 0.7) {
      insights.push("💪 Starke Fehlertoleranz - lernt gut aus Fehlern");
    } else if (profile.errorRecoveryRate < 0.3) {
      insights.push("⚠️ Fehler demotivieren - mehr Erfolgserlebnisse benötigt");
    }
    
    // Strategy adaptability
    if (profile.strategyAdaptability > 0.7) {
      insights.push("🔄 Flexibler Denker - probiert neue Strategien aus");
    }
    
    // Learning styles
    const maxStyle = Object.entries(profile.learningStylePreferences)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (maxStyle && maxStyle[1] > 0.7) {
      insights.push(`🎨 Bevorzugter Lernstil: ${maxStyle[0]}`);
    }
    
    // Breakthrough indicators
    if (profile.breakthroughIndicators.length > 0) {
      insights.push(`✨ Durchbruch-Faktoren: ${profile.breakthroughIndicators.join(', ')}`);
    }
    
    return insights;
  }
  
  /**
   * Generate strategy recommendations
   */
  private generateStrategyRecommendations(
    profile: MetaLearningProfile,
    trend: 'improving' | 'stable' | 'declining' | 'plateau'
  ): string[] {
    const recommendations: string[] = [];
    
    if (trend === 'improving') {
      recommendations.push("📈 Fortschritt erkannt - Schwierigkeit leicht erhöhen");
    }
    
    if (trend === 'declining') {
      recommendations.push("📉 Leistung sinkt - Schwierigkeit reduzieren, mehr Unterstützung");
    }
    
    if (trend === 'plateau') {
      recommendations.push("🏔️ Plateau erreicht - Neue Herausforderungen einführen (z.B. Platzhalter)");
      recommendations.push("💡 Strategiewechsel empfohlen - Neue Darstellungen ausprobieren");
    }
    
    // Spacing recommendation
    if (profile.optimalSpacing > 60) {
      recommendations.push(`⏰ Optimales Spacing: ${profile.optimalSpacing}min - Pausen helfen beim Lernen`);
    }
    
    // Error recovery
    if (profile.errorRecoveryRate < 0.4) {
      recommendations.push("🛡️ Mehr Scaffolding nach Fehlern - Selbstvertrauen aufbauen");
    }
    
    return recommendations;
  }
  
  /**
   * Calculate breakthrough probability
   */
  private calculateBreakthroughProbability(profile: MetaLearningProfile, history: any[]): number {
    let prob = 0;
    
    // High adaptability increases probability
    prob += profile.strategyAdaptability * 0.3;
    
    // Near plateau = high breakthrough potential
    if (profile.plateauSensitivity < 0.3) {
      prob += 0.3;
    }
    
    // Recent indicators present
    if (profile.breakthroughIndicators.length > 0) {
      prob += 0.2;
    }
    
    // Good error recovery
    prob += profile.errorRecoveryRate * 0.2;
    
    return Math.min(1, prob);
  }
  
  /**
   * Generate optimal next steps
   */
  private generateOptimalNextSteps(
    profile: MetaLearningProfile,
    trend: 'improving' | 'stable' | 'declining' | 'plateau'
  ): string[] {
    const steps: string[] = [];
    
    if (trend === 'plateau') {
      steps.push("Platzhalter-Aufgaben einführen (algebraisches Denken)");
      steps.push("Zahlbereich wechseln (ZR20 → ZR100)");
      steps.push("Neue Darstellungsformen ausprobieren");
    }
    
    if (profile.optimalLearningRate > 0.7) {
      steps.push("Schwierigkeitsgrad erhöhen");
      steps.push("Komplexere Aufgabenmuster verwenden");
    }
    
    if (profile.errorRecoveryRate < 0.4) {
      steps.push("Mehr Erfolgserlebnisse schaffen");
      steps.push("Scaffolding temporär erhöhen");
    }
    
    return steps;
  }
  
  // === UTILITY FUNCTIONS ===
  
  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    
    return variance;
  }
  
  private groupIntoSessions(history: any[]): any[][] {
    const sessions: any[][] = [];
    let currentSession: any[] = [];
    
    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const prev = history[i - 1];
      
      if (prev) {
        const timeDiff = new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        if (minutesDiff > 30) {
          // New session
          if (currentSession.length > 0) {
            sessions.push(currentSession);
          }
          currentSession = [current];
        } else {
          currentSession.push(current);
        }
      } else {
        currentSession.push(current);
      }
    }
    
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }
  
  private calculateRetentionForSpacing(sessions: any[][], targetSpacing: number): number {
    // Simplified retention calculation
    let totalRetention = 0;
    let count = 0;
    
    for (let i = 1; i < sessions.length; i++) {
      const prevSession = sessions[i - 1];
      const currentSession = sessions[i];
      
      const firstCurrent = currentSession[0];
      const lastPrev = prevSession[prevSession.length - 1];
      
      const spacing = (new Date(firstCurrent.timestamp).getTime() - 
                      new Date(lastPrev.timestamp).getTime()) / (1000 * 60);
      
      if (Math.abs(spacing - targetSpacing) < 30) {
        // Similar spacing
        const retention = currentSession.filter(t => t.isCorrect).length / currentSession.length;
        totalRetention += retention;
        count++;
      }
    }
    
    return count > 0 ? totalRetention / count : 0;
  }
}

// ===== EXPORT SINGLETON =====

export const metaLearning = new MetaLearningEngine();
