/**
 * Sleep-Dependent Consolidation Module
 * 
 * Simulates memory consolidation during rest periods based on neuroscience research.
 * 
 * Key Mechanisms:
 * 1. Synaptic Homeostasis (Tononi & Cirelli, 2014)
 * 2. Memory Replay (Wilson & McNaughton, 1994)
 * 3. Systems Consolidation (McClelland et al., 1995)
 * 4. Forgetting Curve (Ebbinghaus, 1885)
 * 
 * Research Foundation:
 * - During sleep/rest, memories are consolidated from hippocampus to cortex
 * - Weak synapses are pruned, strong ones are strengthened
 * - Critical for long-term learning and retention
 * 
 * Implementation:
 * - Detects rest periods (no activity for >30 minutes)
 * - Applies synaptic scaling and memory replay
 * - Strengthens important connections, weakens unimportant ones
 * - Simulates forgetting of non-consolidated memories
 */

import type { LearningProgression } from "./neuralProgressionController";

// ===== TYPES =====

export interface ConsolidationResult {
  consolidationApplied: boolean;
  restDuration: number; // minutes
  synapsesPruned: number;
  synapsesStrengthened: number;
  memoryReplayCount: number;
  forgettingRate: number;
  consolidationQuality: number; // 0-1 (how effective was consolidation)
  updatedWeights: Record<string, number>;
  updatedMemoryTraces: any[];
}

export interface ConsolidationConfig {
  minRestDuration: number; // minutes (default: 30)
  maxRestDuration: number; // minutes (default: 1440 = 24h)
  synapticScalingFactor: number; // 0-1 (default: 0.1)
  memoryReplayProbability: number; // 0-1 (default: 0.7)
  pruningThreshold: number; // 0-1 (default: 0.2)
  consolidationStrength: number; // 0-1 (default: 0.5)
}

// ===== DEFAULT CONFIGURATION =====

const DEFAULT_CONFIG: ConsolidationConfig = {
  minRestDuration: 30, // 30 minutes minimum rest
  maxRestDuration: 1440, // 24 hours max (after that, start forgetting)
  synapticScalingFactor: 0.1,
  memoryReplayProbability: 0.7,
  pruningThreshold: 0.2,
  consolidationStrength: 0.5
};

// ===== SLEEP CONSOLIDATION ENGINE =====

export class SleepConsolidationEngine {
  private config: ConsolidationConfig;
  
  constructor(config: Partial<ConsolidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Check if consolidation should be applied based on rest duration
   */
  shouldApplyConsolidation(lastActivityTime: Date): boolean {
    const now = new Date();
    const restMinutes = (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
    
    return restMinutes >= this.config.minRestDuration;
  }
  
  /**
   * Calculate rest duration in minutes
   */
  calculateRestDuration(lastActivityTime: Date): number {
    const now = new Date();
    return (now.getTime() - lastActivityTime.getTime()) / (1000 * 60);
  }
  
  /**
   * Apply consolidation to learning progression
   * 
   * This is called when a student returns after a rest period
   */
  applyConsolidation(
    progression: LearningProgression,
    lastActivityTime: Date
  ): ConsolidationResult {
    const restDuration = this.calculateRestDuration(lastActivityTime);
    
    if (!this.shouldApplyConsolidation(lastActivityTime)) {
      return {
        consolidationApplied: false,
        restDuration,
        synapsesPruned: 0,
        synapsesStrengthened: 0,
        memoryReplayCount: 0,
        forgettingRate: 0,
        consolidationQuality: 0,
        updatedWeights: progression.neuronWeights as Record<string, number>,
        updatedMemoryTraces: (progression.memoryTraces as any[]) || []
      };
    }
    
    // Calculate consolidation quality (optimal around 8-12 hours, degrades after 24h)
    const consolidationQuality = this.calculateConsolidationQuality(restDuration);
    
    // 1. SYNAPTIC HOMEOSTASIS - Scale down all weights proportionally
    const scaledWeights = this.applySynapticScaling(
      progression.neuronWeights as Record<string, number>,
      consolidationQuality
    );
    
    // 2. MEMORY REPLAY - Strengthen important connections
    const replayedWeights = this.applyMemoryReplay(
      scaledWeights,
      (progression.memoryTraces as any[]) || [],
      consolidationQuality
    );
    
    // 3. SYNAPTIC PRUNING - Remove weak connections
    const { prunedWeights, pruneCount } = this.applySynapticPruning(
      replayedWeights,
      this.config.pruningThreshold
    );
    
    // 4. CONSOLIDATION - Strengthen frequently used connections
    const { consolidatedWeights, strengthenCount } = this.applyConsolidation_(
      prunedWeights,
      (progression.memoryTraces as any[]) || []
    );
    
    // 5. MEMORY TRACE DECAY - Apply forgetting curve
    const { updatedTraces, forgettingRate } = this.applyMemoryDecay(
      (progression.memoryTraces as any[]) || [],
      restDuration,
      consolidationQuality
    );
    
    // 6. Count memory replays
    const memoryReplayCount = this.countMemoryReplays(
      (progression.memoryTraces as any[]) || [],
      this.config.memoryReplayProbability,
      consolidationQuality
    );
    
    return {
      consolidationApplied: true,
      restDuration,
      synapsesPruned: pruneCount,
      synapsesStrengthened: strengthenCount,
      memoryReplayCount,
      forgettingRate,
      consolidationQuality,
      updatedWeights: consolidatedWeights,
      updatedMemoryTraces: updatedTraces
    };
  }
  
  /**
   * Calculate consolidation quality based on rest duration
   * 
   * Optimal: 8-12 hours (sleep duration)
   * Decreases: <4 hours or >24 hours
   */
  private calculateConsolidationQuality(restMinutes: number): number {
    const hours = restMinutes / 60;
    
    // Optimal range: 8-12 hours
    if (hours >= 8 && hours <= 12) {
      return 1.0;
    }
    
    // Good range: 4-8 hours or 12-16 hours
    if ((hours >= 4 && hours < 8) || (hours > 12 && hours <= 16)) {
      return 0.8;
    }
    
    // Acceptable range: 2-4 hours or 16-24 hours
    if ((hours >= 2 && hours < 4) || (hours > 16 && hours <= 24)) {
      return 0.6;
    }
    
    // Poor: <2 hours
    if (hours < 2) {
      return 0.3;
    }
    
    // Degraded: >24 hours (start forgetting)
    if (hours > 24) {
      return Math.max(0.1, 0.6 - (hours - 24) / 100);
    }
    
    return 0.5;
  }
  
  /**
   * Synaptic Homeostasis (Tononi & Cirelli, 2014)
   * 
   * Scale down all synaptic weights proportionally
   * This prevents runaway potentiation and maintains network stability
   */
  private applySynapticScaling(
    weights: Record<string, number>,
    quality: number
  ): Record<string, number> {
    const scalingFactor = 1 - (this.config.synapticScalingFactor * quality);
    const scaled: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(weights)) {
      scaled[key] = value * scalingFactor;
    }
    
    return scaled;
  }
  
  /**
   * Memory Replay (Wilson & McNaughton, 1994)
   * 
   * Strengthen connections involved in recent successful experiences
   * Simulates hippocampal replay during sleep
   */
  private applyMemoryReplay(
    weights: Record<string, number>,
    memoryTraces: any[],
    quality: number
  ): Record<string, number> {
    const replayed = { ...weights };
    
    // Get recent successful memories (last 20)
    const recentSuccesses = memoryTraces
      .filter(trace => trace.isCorrect)
      .slice(-20);
    
    if (recentSuccesses.length === 0) return replayed;
    
    // Strengthen connections used in successful tasks
    const replayStrength = 0.05 * quality * this.config.memoryReplayProbability;
    
    for (const trace of recentSuccesses) {
      // Strengthen relevant connections (simplified - in reality would track specific pathways)
      if (Math.random() < this.config.memoryReplayProbability) {
        // Strengthen weights related to successful strategies
        for (const key of Object.keys(replayed)) {
          if (key.includes('hidden') || key.includes('output')) {
            replayed[key] = Math.min(1.0, replayed[key] + replayStrength);
          }
        }
      }
    }
    
    return replayed;
  }
  
  /**
   * Synaptic Pruning
   * 
   * Remove weak, unused connections
   * "Use it or lose it" principle
   */
  private applySynapticPruning(
    weights: Record<string, number>,
    threshold: number
  ): { prunedWeights: Record<string, number>; pruneCount: number } {
    const pruned: Record<string, number> = {};
    let pruneCount = 0;
    
    for (const [key, value] of Object.entries(weights)) {
      if (Math.abs(value) < threshold) {
        pruned[key] = 0; // Prune weak connection
        pruneCount++;
      } else {
        pruned[key] = value;
      }
    }
    
    return { prunedWeights: pruned, pruneCount };
  }
  
  /**
   * Systems Consolidation (McClelland et al., 1995)
   * 
   * Transfer memories from hippocampus (temporary) to cortex (long-term)
   * Strengthen frequently accessed connections
   */
  private applyConsolidation_(
    weights: Record<string, number>,
    memoryTraces: any[]
  ): { consolidatedWeights: Record<string, number>; strengthenCount: number } {
    const consolidated = { ...weights };
    let strengthenCount = 0;
    
    // Count frequency of similar task patterns
    const patternFrequency = this.analyzePatternFrequency(memoryTraces);
    
    // Strengthen connections for frequent patterns
    const consolidationBonus = 0.1 * this.config.consolidationStrength;
    
    for (const [pattern, frequency] of Object.entries(patternFrequency)) {
      if (frequency > 3) { // Pattern occurred 3+ times
        // Strengthen related connections
        for (const key of Object.keys(consolidated)) {
          if (Math.random() < frequency / 10) {
            consolidated[key] = Math.min(1.0, consolidated[key] + consolidationBonus);
            strengthenCount++;
          }
        }
      }
    }
    
    return { consolidatedWeights: consolidated, strengthenCount };
  }
  
  /**
   * Memory Decay (Ebbinghaus Forgetting Curve, 1885)
   * 
   * Apply forgetting to non-consolidated memories
   * R = e^(-t/S) where t = time, S = strength
   */
  private applyMemoryDecay(
    memoryTraces: any[],
    restMinutes: number,
    quality: number
  ): { updatedTraces: any[]; forgettingRate: number } {
    const decayRate = (1 - quality) * (restMinutes / 1440); // Scale by 24h
    const forgettingRate = Math.min(0.5, decayRate);
    
    // Keep only memories that survived decay
    const updatedTraces = memoryTraces.map(trace => ({
      ...trace,
      strength: Math.max(0, (trace.strength || 1.0) - forgettingRate)
    })).filter(trace => trace.strength > 0.1);
    
    // Keep max 100 traces
    return {
      updatedTraces: updatedTraces.slice(-100),
      forgettingRate
    };
  }
  
  /**
   * Count memory replays during consolidation
   */
  private countMemoryReplays(
    memoryTraces: any[],
    replayProbability: number,
    quality: number
  ): number {
    let count = 0;
    
    for (const trace of memoryTraces.slice(-20)) {
      if (Math.random() < replayProbability * quality) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Analyze pattern frequency in memory traces
   */
  private analyzePatternFrequency(memoryTraces: any[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    for (const trace of memoryTraces) {
      const pattern = `${trace.task?.operation || '+'}_${trace.task?.numberRange || 20}`;
      frequency[pattern] = (frequency[pattern] || 0) + 1;
    }
    
    return frequency;
  }
  
  /**
   * Generate consolidation summary for display
   */
  generateConsolidationSummary(result: ConsolidationResult): string {
    if (!result.consolidationApplied) {
      return "Keine Konsolidierung angewendet (zu kurze Pause).";
    }
    
    const hours = Math.floor(result.restDuration / 60);
    const minutes = Math.floor(result.restDuration % 60);
    
    let summary = `Gedächtniskonsolidierung nach ${hours}h ${minutes}min Pause:\n`;
    summary += `✨ Qualität: ${(result.consolidationQuality * 100).toFixed(0)}%\n`;
    summary += `🧹 ${result.synapsesPruned} Synapsen entfernt (schwach)\n`;
    summary += `💪 ${result.synapsesStrengthened} Synapsen verstärkt\n`;
    summary += `🔄 ${result.memoryReplayCount} Gedächtnis-Replays\n`;
    summary += `📉 Vergessensrate: ${(result.forgettingRate * 100).toFixed(1)}%\n`;
    
    if (result.consolidationQuality >= 0.8) {
      summary += `\n🌟 Hervorragende Konsolidierung! Langzeitgedächtnis gestärkt.`;
    } else if (result.consolidationQuality >= 0.6) {
      summary += `\n✅ Gute Konsolidierung. Weiter so!`;
    } else {
      summary += `\n⚠️ Konsolidierung schwach. Längere Pausen empfohlen.`;
    }
    
    return summary;
  }
}

// ===== EXPORT SINGLETON =====

export const sleepConsolidation = new SleepConsolidationEngine();
