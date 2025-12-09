/**
 * Transfer Learning Module
 * 
 * Enables knowledge transfer between number ranges (ZR20 → ZR100)
 * and across mathematical operations (+/-)
 * 
 * Research Foundation:
 * - Transfer of Learning (Thorndike, 1901)
 * - Analogical Transfer (Gick & Holyoak, 1983)
 * - Near vs. Far Transfer (Perkins & Salomon, 1992)
 * - Abstraction and Transfer (Gentner et al., 2003)
 * 
 * Transfer Mechanisms:
 * 1. Weight Transfer - Transfer neural weights from source to target domain
 * 2. Strategy Transfer - Apply successful strategies from ZR20 to ZR100
 * 3. Structural Transfer - Transfer understanding of place value
 * 4. Procedural Transfer - Transfer computation procedures
 */

import type { InputVector, OutputVector } from "./neuralLearnerModel";

// ===== TYPES =====

export interface TransferDomain {
  numberRange: 20 | 100;
  operation: '+' | '-';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface TransferResult {
  transferApplied: boolean;
  sourceDomain: TransferDomain;
  targetDomain: TransferDomain;
  transferredWeights: Record<string, number>;
  transferQuality: number; // 0-1 (how applicable is the transfer)
  expectedBenefit: number; // 0-1 (expected performance boost)
  transferType: 'near' | 'far'; // Near = similar, Far = different
  reasoning: string;
}

export interface TransferMapping {
  sourceNeurons: string[];
  targetNeurons: string[];
  scalingFactor: number; // How much to scale weights during transfer
  confidence: number; // 0-1 (how confident are we in this mapping)
}

// ===== TRANSFER LEARNING ENGINE =====

export class TransferLearningEngine {
  
  /**
   * Check if transfer learning should be applied
   * 
   * Conditions:
   * - Moving from ZR20 to ZR100
   * - Starting new operation type
   * - Sufficient mastery in source domain
   */
  shouldApplyTransfer(
    currentDomain: TransferDomain,
    neuronWeights: Record<string, number>,
    performanceHistory: any[]
  ): boolean {
    // Check for domain transition
    const isNewDomain = this.detectDomainTransition(performanceHistory);
    if (!isNewDomain) return false;
    
    // Check mastery in previous domain
    const sourceMastery = this.calculateDomainMastery(performanceHistory);
    
    // Need at least 60% mastery to transfer
    return sourceMastery >= 0.6;
  }
  
  /**
   * Apply transfer learning from source to target domain
   */
  applyTransfer(
    sourceDomain: TransferDomain,
    targetDomain: TransferDomain,
    sourceWeights: Record<string, number>,
    performanceHistory: any[]
  ): TransferResult {
    
    // Determine transfer type
    const transferType = this.determineTransferType(sourceDomain, targetDomain);
    
    // Get transfer mapping (which neurons to transfer)
    const mapping = this.getTransferMapping(sourceDomain, targetDomain);
    
    // Calculate transfer quality
    const transferQuality = this.calculateTransferQuality(
      sourceDomain,
      targetDomain,
      performanceHistory
    );
    
    // Transfer weights with scaling
    const transferredWeights = this.transferWeights(
      sourceWeights,
      mapping,
      transferQuality
    );
    
    // Expected benefit
    const expectedBenefit = this.estimateTransferBenefit(
      transferType,
      transferQuality,
      performanceHistory
    );
    
    // Reasoning
    const reasoning = this.generateTransferReasoning(
      sourceDomain,
      targetDomain,
      transferType,
      transferQuality
    );
    
    return {
      transferApplied: true,
      sourceDomain,
      targetDomain,
      transferredWeights,
      transferQuality,
      expectedBenefit,
      transferType,
      reasoning
    };
  }
  
  /**
   * Detect if learner is transitioning to new domain
   */
  private detectDomainTransition(history: any[]): boolean {
    if (history.length < 5) return false;
    
    const recent = history.slice(-5);
    const older = history.slice(-15, -5);
    
    if (older.length === 0) return false;
    
    // Check for number range change
    const recentRange = recent[0]?.task?.numberRange;
    const olderRange = older[0]?.task?.numberRange;
    
    return recentRange !== olderRange && recentRange === 100 && olderRange === 20;
  }
  
  /**
   * Calculate mastery in source domain
   */
  private calculateDomainMastery(history: any[]): number {
    if (history.length === 0) return 0;
    
    // Get tasks from source domain (ZR20)
    const sourceTasks = history.filter(h => h.task?.numberRange === 20);
    
    if (sourceTasks.length === 0) return 0;
    
    // Calculate success rate
    const successes = sourceTasks.filter(t => t.isCorrect).length;
    const successRate = successes / sourceTasks.length;
    
    // Calculate speed (inverse of time)
    const avgTime = sourceTasks.reduce((sum, t) => sum + (t.timeTaken || 30), 0) / sourceTasks.length;
    const speedScore = Math.max(0, 1 - avgTime / 60); // Normalize to 0-1
    
    // Calculate consistency
    const recentSuccesses = sourceTasks.slice(-10).filter(t => t.isCorrect).length;
    const consistency = Math.min(1, recentSuccesses / 10);
    
    // Combined mastery score
    return successRate * 0.5 + speedScore * 0.2 + consistency * 0.3;
  }
  
  /**
   * Determine if transfer is "near" or "far"
   * 
   * Near: ZR20 addition → ZR100 addition
   * Far: ZR20 addition → ZR100 subtraction
   */
  private determineTransferType(
    source: TransferDomain,
    target: TransferDomain
  ): 'near' | 'far' {
    // Same operation = near transfer
    if (source.operation === target.operation) {
      return 'near';
    }
    
    // Different operation = far transfer
    return 'far';
  }
  
  /**
   * Get mapping of neurons from source to target
   */
  private getTransferMapping(
    source: TransferDomain,
    target: TransferDomain
  ): TransferMapping {
    const transferType = this.determineTransferType(source, target);
    
    if (transferType === 'near') {
      // Near transfer: Most neurons can be transferred
      return {
        sourceNeurons: [
          'input_strategy', 'input_metacognitive', 'input_emotional',
          'hidden_cognitive', 'hidden_metacognitive',
          'output_difficulty', 'output_scaffolding'
        ],
        targetNeurons: [
          'input_strategy', 'input_metacognitive', 'input_emotional',
          'hidden_cognitive', 'hidden_metacognitive',
          'output_difficulty', 'output_scaffolding'
        ],
        scalingFactor: 0.7, // Scale down for safety
        confidence: 0.8
      };
    } else {
      // Far transfer: Only general cognitive skills transfer
      return {
        sourceNeurons: [
          'input_metacognitive', 'input_emotional',
          'hidden_metacognitive',
          'output_scaffolding'
        ],
        targetNeurons: [
          'input_metacognitive', 'input_emotional',
          'hidden_metacognitive',
          'output_scaffolding'
        ],
        scalingFactor: 0.4, // Much smaller scaling
        confidence: 0.5
      };
    }
  }
  
  /**
   * Calculate quality of transfer
   */
  private calculateTransferQuality(
    source: TransferDomain,
    target: TransferDomain,
    history: any[]
  ): number {
    let quality = 0.5; // Base quality
    
    // Factor 1: Domain similarity
    if (source.numberRange === 20 && target.numberRange === 100) {
      quality += 0.2; // Natural progression
    }
    
    if (source.operation === target.operation) {
      quality += 0.2; // Same operation
    }
    
    // Factor 2: Source mastery
    const mastery = this.calculateDomainMastery(history);
    quality += mastery * 0.3;
    
    // Factor 3: Complexity match
    if (source.complexity === target.complexity) {
      quality += 0.1;
    }
    
    return Math.min(1, quality);
  }
  
  /**
   * Transfer weights from source to target
   */
  private transferWeights(
    sourceWeights: Record<string, number>,
    mapping: TransferMapping,
    quality: number
  ): Record<string, number> {
    const transferred: Record<string, number> = { ...sourceWeights };
    
    // Transfer each mapped neuron
    for (let i = 0; i < mapping.sourceNeurons.length; i++) {
      const sourcePattern = mapping.sourceNeurons[i];
      const targetPattern = mapping.targetNeurons[i];
      
      // Find matching weights
      for (const [key, value] of Object.entries(sourceWeights)) {
        if (key.includes(sourcePattern)) {
          // Create target key
          const targetKey = key.replace(sourcePattern, targetPattern);
          
          // Transfer with scaling
          const transferredValue = value * mapping.scalingFactor * quality;
          transferred[targetKey] = transferredValue;
        }
      }
    }
    
    return transferred;
  }
  
  /**
   * Estimate benefit from transfer
   */
  private estimateTransferBenefit(
    transferType: 'near' | 'far',
    quality: number,
    history: any[]
  ): number {
    let benefit = 0;
    
    // Near transfer has higher benefit
    if (transferType === 'near') {
      benefit = quality * 0.6; // Up to 60% boost
    } else {
      benefit = quality * 0.3; // Up to 30% boost
    }
    
    // Reduce benefit if learner already has experience in target domain
    const targetExperience = history.filter(h => h.task?.numberRange === 100).length;
    if (targetExperience > 10) {
      benefit *= 0.7; // Less benefit if already experienced
    }
    
    return Math.min(1, benefit);
  }
  
  /**
   * Generate reasoning for transfer
   */
  private generateTransferReasoning(
    source: TransferDomain,
    target: TransferDomain,
    type: 'near' | 'far',
    quality: number
  ): string {
    const parts: string[] = [];
    
    // Domain description
    parts.push(`Transfer von ZR${source.numberRange} → ZR${target.numberRange}`);
    
    // Operation
    if (source.operation === target.operation) {
      parts.push(`Gleiche Operation (${source.operation})`);
    } else {
      parts.push(`Andere Operation (${source.operation} → ${target.operation})`);
    }
    
    // Transfer type
    if (type === 'near') {
      parts.push("Naher Transfer (ähnliche Domänen)");
    } else {
      parts.push("Ferner Transfer (unterschiedliche Domänen)");
    }
    
    // Quality
    if (quality >= 0.7) {
      parts.push("Hohe Transferqualität ✨");
    } else if (quality >= 0.5) {
      parts.push("Mittlere Transferqualität");
    } else {
      parts.push("Niedrige Transferqualität ⚠️");
    }
    
    return parts.join(" | ");
  }
  
  /**
   * Apply strategy transfer
   * 
   * Transfer successful strategies from source to target domain
   */
  applyStrategyTransfer(
    sourceStrategies: string[],
    targetDomain: TransferDomain
  ): string[] {
    const transferable: string[] = [];
    
    // Universal strategies (always transfer)
    const universal = ['decomposition', 'self_correction', 'metacognitive_monitoring'];
    
    for (const strategy of sourceStrategies) {
      if (universal.includes(strategy)) {
        transferable.push(strategy);
      }
    }
    
    // Domain-specific transfers
    if (targetDomain.numberRange === 100) {
      // ZR20 → ZR100
      if (sourceStrategies.includes('decomposition')) {
        transferable.push('place_value'); // Natural extension
      }
      
      if (sourceStrategies.includes('counting_on')) {
        transferable.push('decade_transition'); // Similar skill
      }
    }
    
    return [...new Set(transferable)]; // Remove duplicates
  }
  
  /**
   * Generate transfer report for display
   */
  generateTransferReport(result: TransferResult): string {
    if (!result.transferApplied) {
      return "Kein Transfer angewendet (Voraussetzungen nicht erfüllt).";
    }
    
    let report = `🔄 Transfer Learning aktiviert!\n\n`;
    report += `Von: ZR${result.sourceDomain.numberRange} (${result.sourceDomain.operation})\n`;
    report += `Nach: ZR${result.targetDomain.numberRange} (${result.targetDomain.operation})\n\n`;
    report += `Transfer-Typ: ${result.transferType === 'near' ? 'Nah (ähnlich)' : 'Fern (unterschiedlich)'}\n`;
    report += `Qualität: ${(result.transferQuality * 100).toFixed(0)}%\n`;
    report += `Erwarteter Nutzen: +${(result.expectedBenefit * 100).toFixed(0)}% Leistung\n\n`;
    report += `📝 ${result.reasoning}\n\n`;
    
    if (result.expectedBenefit > 0.5) {
      report += `✨ Sehr guter Transfer! Vorwissen wird optimal genutzt.`;
    } else if (result.expectedBenefit > 0.3) {
      report += `✅ Guter Transfer. Einige Fähigkeiten übertragbar.`;
    } else {
      report += `⚠️ Moderater Transfer. Neue Domäne erfordert zusätzliches Lernen.`;
    }
    
    return report;
  }
}

// ===== EXPORT SINGLETON =====

export const transferLearning = new TransferLearningEngine();
