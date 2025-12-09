/**
 * Adaptive Representation Selector
 * 
 * Neural network chooses optimal visual representations based on:
 * 1. Learner's cognitive profile
 * 2. Task characteristics
 * 3. Historical performance with each representation
 * 4. Embodied cognition principles
 * 
 * Research Foundation:
 * - Dual Coding Theory (Paivio, 1971, 1986)
 * - Cognitive Load Theory (Sweller, 1988)
 * - Embodied Cognition (Lakoff & Núñez, 2000)
 * - Multimedia Learning Principles (Mayer, 2001)
 * 
 * Representations:
 * - Fingers: Kinesthetic, grounded, concrete (ZR20)
 * - TwentyFrame: Structured, visual grouping (ZR20)
 * - NumberLine: Spatial, directional, measurement (ZR20/100)
 * - Counters: Manipulable, discrete, counting (ZR20/100)
 * - PlaceValue: Abstract, positional, structural (ZR100)
 * - HundredField: Grid-based, pattern recognition (ZR100)
 */

import type { InputVector } from "./neuralLearnerModel";
import type { Task } from "./mathematicsDidacticModules";

// ===== REPRESENTATION TYPES =====

export type Representation =
  | 'fingers'
  | 'twentyFrame'
  | 'numberLine'
  | 'counters'
  | 'placeValue'
  | 'hundredField'
  | 'symbolic';

export interface RepresentationProfile {
  representation: Representation;
  usageCount: number;
  successRate: number;
  avgTimeReduction: number; // Compared to baseline
  cognitiveLoadScore: number; // 0-1 (lower is better)
  preferenceScore: number; // 0-1 (learned from usage patterns)
}

export interface RepresentationSelection {
  primary: Representation;
  secondary: Representation | null;
  tertiary: Representation | null;
  reasoning: string;
  expectedBenefit: number; // 0-1
  cognitiveLoad: number; // 0-1
  embodiedScore: number; // 0-1 (how grounded/concrete)
}

// ===== REPRESENTATION CHARACTERISTICS =====

interface RepresentationCharacteristics {
  name: Representation;
  numberRange: (20 | 100)[];
  abstractionLevel: number; // 0 (concrete) to 1 (abstract)
  visualComplexity: number; // 0-1
  kinestheticScore: number; // 0-1 (how much it engages motor skills)
  spatialScore: number; // 0-1 (spatial reasoning)
  structuralScore: number; // 0-1 (place value understanding)
  cognitiveLoadBase: number; // 0-1
}

const REPRESENTATIONS: RepresentationCharacteristics[] = [
  {
    name: 'fingers',
    numberRange: [20],
    abstractionLevel: 0.1, // Very concrete
    visualComplexity: 0.3,
    kinestheticScore: 1.0, // Highest embodiment
    spatialScore: 0.4,
    structuralScore: 0.2,
    cognitiveLoadBase: 0.3
  },
  {
    name: 'twentyFrame',
    numberRange: [20],
    abstractionLevel: 0.3,
    visualComplexity: 0.4,
    kinestheticScore: 0.5,
    spatialScore: 0.7,
    structuralScore: 0.6,
    cognitiveLoadBase: 0.4
  },
  {
    name: 'numberLine',
    numberRange: [20, 100],
    abstractionLevel: 0.5,
    visualComplexity: 0.5,
    kinestheticScore: 0.3,
    spatialScore: 1.0, // Highest spatial
    structuralScore: 0.5,
    cognitiveLoadBase: 0.5
  },
  {
    name: 'counters',
    numberRange: [20, 100],
    abstractionLevel: 0.2,
    visualComplexity: 0.4,
    kinestheticScore: 0.8,
    spatialScore: 0.4,
    structuralScore: 0.3,
    cognitiveLoadBase: 0.4
  },
  {
    name: 'placeValue',
    numberRange: [100],
    abstractionLevel: 0.7,
    visualComplexity: 0.6,
    kinestheticScore: 0.4,
    spatialScore: 0.6,
    structuralScore: 1.0, // Highest structural
    cognitiveLoadBase: 0.6
  },
  {
    name: 'hundredField',
    numberRange: [100],
    abstractionLevel: 0.6,
    visualComplexity: 0.7,
    kinestheticScore: 0.3,
    spatialScore: 0.8,
    structuralScore: 0.8,
    cognitiveLoadBase: 0.6
  },
  {
    name: 'symbolic',
    numberRange: [20, 100],
    abstractionLevel: 1.0, // Most abstract
    visualComplexity: 0.2,
    kinestheticScore: 0.1,
    spatialScore: 0.2,
    structuralScore: 0.7,
    cognitiveLoadBase: 0.7
  }
];

// ===== ADAPTIVE SELECTOR =====

export class AdaptiveRepresentationSelector {
  
  /**
   * Select optimal representations for a given learner and task
   */
  selectRepresentations(
    learner: InputVector,
    task: Task,
    representationHistory: RepresentationProfile[]
  ): RepresentationSelection {
    
    // Filter by number range
    const availableReps = REPRESENTATIONS.filter(rep =>
      rep.numberRange.includes(task.numberRange)
    );
    
    // Score each representation
    const scored = availableReps.map(rep => ({
      rep,
      score: this.scoreRepresentation(rep, learner, task, representationHistory)
    }));
    
    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);
    
    // Select top 3
    const primary = scored[0]?.rep.name || 'symbolic';
    const secondary = scored[1]?.rep.name || null;
    const tertiary = scored[2]?.rep.name || null;
    
    // Calculate metrics
    const primaryRep = scored[0]?.rep;
    const expectedBenefit = scored[0]?.score || 0;
    const cognitiveLoad = this.calculateCognitiveLoad(primaryRep, learner, task);
    const embodiedScore = primaryRep?.kinestheticScore || 0;
    
    // Generate reasoning
    const reasoning = this.generateReasoning(primary, learner, task, expectedBenefit);
    
    return {
      primary,
      secondary,
      tertiary,
      reasoning,
      expectedBenefit,
      cognitiveLoad,
      embodiedScore
    };
  }
  
  /**
   * Score a representation for a specific learner and task
   */
  private scoreRepresentation(
    rep: RepresentationCharacteristics,
    learner: InputVector,
    task: Task,
    history: RepresentationProfile[]
  ): number {
    let score = 0;
    
    // 1. EMBODIED COGNITION - Match abstraction level to learner maturity
    const learnerMaturity = (
      learner.N_retrieval * 0.4 +
      learner.N_place_value * 0.3 +
      learner.N_decomposition * 0.3
    );
    
    const abstractionMatch = 1 - Math.abs(rep.abstractionLevel - learnerMaturity);
    score += abstractionMatch * 0.3;
    
    // 2. COGNITIVE LOAD - Prefer lower load for struggling learners
    const cognitiveCapacity = (
      learner.N_cognitive_load_current +
      learner.N_working_memory_capacity
    ) / 2;
    
    const loadScore = cognitiveCapacity > 0.5 
      ? 1 - rep.cognitiveLoadBase
      : 1 - (rep.cognitiveLoadBase * 1.5); // Penalize high load for low capacity
    score += Math.max(0, loadScore) * 0.25;
    
    // 3. KINESTHETIC/EMBODIED - Prefer for low fluency learners
    if (learner.N_fluency < 0.5) {
      score += rep.kinestheticScore * 0.2;
    }
    
    // 4. SPATIAL REASONING - Match to spatial ability
    const spatialAbility = learner.N_place_value; // Proxy for spatial reasoning
    const spatialMatch = 1 - Math.abs(rep.spatialScore - spatialAbility);
    score += spatialMatch * 0.15;
    
    // 5. HISTORICAL SUCCESS - Learn from past performance
    const histProfile = history.find(h => h.representation === rep.name);
    if (histProfile) {
      score += histProfile.successRate * 0.2;
      score += (1 - histProfile.cognitiveLoadScore) * 0.1;
    } else {
      score += 0.15; // Neutral score for untried representations
    }
    
    // 6. TASK COMPLEXITY - Match representation to task needs
    if (task.placeholderPosition && task.placeholderPosition !== 'none') {
      // Placeholder tasks need more structured representations
      score += rep.structuralScore * 0.15;
    }
    
    // 7. OPERATION TYPE - Subtraction benefits from number line
    if (task.operation === '-' && rep.name === 'numberLine') {
      score += 0.1; // Bonus for number line with subtraction
    }
    
    // 8. LARGE NUMBERS - Prefer structured reps for larger numbers
    const maxNum = Math.max(task.number1, task.number2);
    if (maxNum > 50 && rep.structuralScore > 0.6) {
      score += 0.1;
    }
    
    // Normalize to 0-1
    return Math.min(1, Math.max(0, score));
  }
  
  /**
   * Calculate cognitive load for a representation
   */
  private calculateCognitiveLoad(
    rep: RepresentationCharacteristics | undefined,
    learner: InputVector,
    task: Task
  ): number {
    if (!rep) return 0.5;
    
    let load = rep.cognitiveLoadBase;
    
    // Adjust for learner capacity
    const capacity = learner.N_working_memory_capacity;
    if (capacity < 0.5) {
      load *= 1.3; // Higher load for low capacity learners
    }
    
    // Adjust for task complexity
    const maxNum = Math.max(task.number1, task.number2);
    if (maxNum > task.numberRange * 0.7) {
      load *= 1.2; // Higher load for large numbers
    }
    
    if (task.placeholderPosition && task.placeholderPosition !== 'none') {
      load *= 1.15; // Higher load for placeholder tasks
    }
    
    return Math.min(1, load);
  }
  
  /**
   * Generate human-readable reasoning for selection
   */
  private generateReasoning(
    primary: Representation,
    learner: InputVector,
    task: Task,
    benefit: number
  ): string {
    const reasons: string[] = [];
    
    // Learner characteristics
    if (learner.N_fluency < 0.5) {
      reasons.push("Niedrige Rechenfertigkeit → konkrete Darstellung");
    }
    
    if (learner.N_retrieval > 0.7) {
      reasons.push("Hohe Abruffähigkeit → abstraktere Darstellung möglich");
    }
    
    if (learner.N_working_memory_capacity < 0.5) {
      reasons.push("Begrenztes Arbeitsgedächtnis → niedrige kognitive Last");
    }
    
    // Task characteristics
    if (task.operation === '-') {
      reasons.push("Subtraktion → räumliche Darstellung hilfreich");
    }
    
    if (task.placeholderPosition && task.placeholderPosition !== 'none') {
      reasons.push("Platzhalter-Aufgabe → strukturierte Darstellung");
    }
    
    const maxNum = Math.max(task.number1, task.number2);
    if (maxNum > 50) {
      reasons.push("Große Zahlen → Zehnersystem-Darstellung");
    }
    
    // Representation-specific
    const repReasons: Record<string, string> = {
      fingers: "Finger: Körperbasiert, sehr konkret",
      twentyFrame: "Zwanzigerfeld: Strukturierte Fünfergruppen",
      numberLine: "Zahlengerade: Räumliches Denken",
      counters: "Plättchen: Manipulierbar, zählbar",
      placeValue: "Stellenwert: Zehnersystem verstehen",
      hundredField: "Hunderterfeld: Musterkennung",
      symbolic: "Symbolisch: Abstrakte Notation"
    };
    
    reasons.unshift(repReasons[primary] || "");
    
    return reasons.filter(r => r).join(" | ");
  }
  
  /**
   * Update representation history after task completion
   */
  updateRepresentationHistory(
    history: RepresentationProfile[],
    representation: Representation,
    isCorrect: boolean,
    timeTaken: number,
    baselineTime: number,
    cognitiveLoad: number
  ): RepresentationProfile[] {
    const updated = [...history];
    const existing = updated.find(h => h.representation === representation);
    
    if (existing) {
      // Update existing profile
      existing.usageCount += 1;
      existing.successRate = (
        existing.successRate * (existing.usageCount - 1) +
        (isCorrect ? 1 : 0)
      ) / existing.usageCount;
      
      const timeReduction = (baselineTime - timeTaken) / baselineTime;
      existing.avgTimeReduction = (
        existing.avgTimeReduction * (existing.usageCount - 1) +
        timeReduction
      ) / existing.usageCount;
      
      existing.cognitiveLoadScore = (
        existing.cognitiveLoadScore * (existing.usageCount - 1) +
        cognitiveLoad
      ) / existing.usageCount;
      
      existing.preferenceScore = Math.min(1,
        existing.successRate * 0.5 +
        (1 - existing.cognitiveLoadScore) * 0.3 +
        (existing.avgTimeReduction + 1) * 0.2
      );
    } else {
      // Create new profile
      updated.push({
        representation,
        usageCount: 1,
        successRate: isCorrect ? 1 : 0,
        avgTimeReduction: (baselineTime - timeTaken) / baselineTime,
        cognitiveLoadScore: cognitiveLoad,
        preferenceScore: isCorrect ? 0.7 : 0.3
      });
    }
    
    return updated;
  }
  
  /**
   * Get representation recommendations for teacher
   */
  getRecommendations(
    learner: InputVector,
    representationHistory: RepresentationProfile[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze current preferences
    const mostUsed = [...representationHistory]
      .sort((a, b) => b.usageCount - a.usageCount)[0];
    
    const mostSuccessful = [...representationHistory]
      .sort((a, b) => b.successRate - a.successRate)[0];
    
    if (mostUsed && mostSuccessful && mostUsed.representation !== mostSuccessful.representation) {
      recommendations.push(
        `💡 Schüler nutzt oft "${mostUsed.representation}", aber "${mostSuccessful.representation}" bringt bessere Ergebnisse (${(mostSuccessful.successRate * 100).toFixed(0)}% Erfolg)`
      );
    }
    
    // Check for underutilized representations
    const underutilized = representationHistory.filter(
      h => h.successRate > 0.7 && h.usageCount < 5
    );
    
    if (underutilized.length > 0) {
      recommendations.push(
        `✨ Diese Darstellungen zeigen Potenzial: ${underutilized.map(h => h.representation).join(', ')}`
      );
    }
    
    // Maturity check
    const learnerMaturity = (
      learner.N_retrieval * 0.4 +
      learner.N_place_value * 0.3 +
      learner.N_decomposition * 0.3
    );
    
    if (learnerMaturity > 0.7 && mostUsed?.representation === 'fingers') {
      recommendations.push(
        `📈 Schüler ist bereit für abstraktere Darstellungen (aktuell: Reife ${(learnerMaturity * 100).toFixed(0)}%)`
      );
    }
    
    return recommendations;
  }
}

// ===== EXPORT SINGLETON =====

export const adaptiveRepSelector = new AdaptiveRepresentationSelector();
