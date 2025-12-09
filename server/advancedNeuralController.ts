/**
 * Advanced Neural Controller (Phase 3)
 * 
 * Integrates all Phase 3 features:
 * 1. Sleep-Dependent Consolidation
 * 2. Adaptive Representation Selection
 * 3. Transfer Learning
 * 4. Meta-Learning
 * 
 * This controller orchestrates the most advanced features of BPS 3.0
 */

import { sleepConsolidation, type ConsolidationResult } from "./sleepConsolidation";
import { adaptiveRepSelector, type RepresentationSelection, type RepresentationProfile } from "./adaptiveRepresentationSelector";
import { transferLearning, type TransferResult, type TransferDomain } from "./transferLearning";
import { metaLearning, type MetaLearningProfile, type MetaLearningUpdate } from "./metaLearning";
import type { InputVector } from "./neuralLearnerModel";
import type { Task } from "./mathematicsDidacticModules";
import type { LearningProgression } from "./neuralProgressionController";

// ===== TYPES =====

export interface AdvancedFeatures {
  consolidation?: ConsolidationResult;
  representationSelection?: RepresentationSelection;
  transfer?: TransferResult;
  metaLearning?: {
    profile: MetaLearningProfile;
    update: MetaLearningUpdate;
  };
}

export interface AdvancedTaskGeneration {
  task: Task;
  representations: string[];
  advancedFeatures: AdvancedFeatures;
  recommendations: string[];
}

// ===== ADVANCED NEURAL CONTROLLER =====

export class AdvancedNeuralController {
  
  /**
   * Process session start - Apply consolidation if needed
   */
  async processSessionStart(
    progression: LearningProgression,
    lastActivityTime: Date
  ): Promise<{
    progression: LearningProgression;
    consolidation: ConsolidationResult | null;
    message: string;
  }> {
    
    // Check if consolidation should be applied
    if (!sleepConsolidation.shouldApplyConsolidation(lastActivityTime)) {
      return {
        progression,
        consolidation: null,
        message: "Willkommen zurück! Weiter geht's..."
      };
    }
    
    // Apply consolidation
    const consolidation = sleepConsolidation.applyConsolidation(
      progression,
      lastActivityTime
    );
    
    // Update progression with consolidated weights
    const updatedProgression: LearningProgression = {
      ...progression,
      neuronWeights: consolidation.updatedWeights,
      memoryTraces: consolidation.updatedMemoryTraces
    };
    
    // Generate message
    const message = sleepConsolidation.generateConsolidationSummary(consolidation);
    
    return {
      progression: updatedProgression,
      consolidation,
      message
    };
  }
  
  /**
   * Generate task with all Phase 3 features
   */
  async generateAdvancedTask(
    progression: LearningProgression,
    learnerInput: InputVector,
    taskHistory: any[]
  ): Promise<AdvancedTaskGeneration> {
    
    const advancedFeatures: AdvancedFeatures = {};
    const recommendations: string[] = [];
    
    // 1. CHECK FOR TRANSFER LEARNING
    const currentDomain: TransferDomain = {
      numberRange: progression.currentStage <= 10 ? 20 : 100,
      operation: '+',
      complexity: 'medium'
    };
    
    if (transferLearning.shouldApplyTransfer(
      currentDomain,
      progression.neuronWeights as Record<string, number>,
      taskHistory
    )) {
      const sourceDomain: TransferDomain = {
        numberRange: 20,
        operation: '+',
        complexity: 'medium'
      };
      
      const transfer = transferLearning.applyTransfer(
        sourceDomain,
        currentDomain,
        progression.neuronWeights as Record<string, number>,
        taskHistory
      );
      
      advancedFeatures.transfer = transfer;
      recommendations.push(transferLearning.generateTransferReport(transfer));
    }
    
    // 2. UPDATE META-LEARNING PROFILE
    const metaProfile = progression.metaLearningProfile as MetaLearningProfile | null;
    const { profile, update } = metaLearning.updateMetaProfile(taskHistory, metaProfile);
    
    advancedFeatures.metaLearning = { profile, update };
    recommendations.push(...update.newInsights);
    recommendations.push(...update.strategyRecommendations);
    
    // 3. SELECT OPTIMAL REPRESENTATIONS
    const repHistory = (progression.representationHistory as RepresentationProfile[]) || [];
    
    // Generate base task (simplified - would normally use genetic algorithm)
    const baseTask: Task = {
      number1: Math.floor(Math.random() * (currentDomain.numberRange - 5)) + 5,
      number2: Math.floor(Math.random() * 10) + 1,
      operation: currentDomain.operation,
      numberRange: currentDomain.numberRange,
      placeholderPosition: Math.random() > 0.7 ? 'end' : 'none',
      taskType: 'practice',
      context: undefined
    };
    
    const repSelection = adaptiveRepSelector.selectRepresentations(
      learnerInput,
      baseTask,
      repHistory
    );
    
    advancedFeatures.representationSelection = repSelection;
    recommendations.push(`📊 Empfohlene Darstellung: ${repSelection.primary} (${repSelection.reasoning})`);
    
    // 4. BUILD REPRESENTATIONS ARRAY
    const representations: string[] = [repSelection.primary];
    if (repSelection.secondary) representations.push(repSelection.secondary);
    if (repSelection.tertiary) representations.push(repSelection.tertiary);
    
    return {
      task: baseTask,
      representations,
      advancedFeatures,
      recommendations
    };
  }
  
  /**
   * Process task completion with Phase 3 features
   */
  async processAdvancedCompletion(
    progression: LearningProgression,
    task: Task,
    isCorrect: boolean,
    timeTaken: number,
    representationsUsed: string[],
    taskHistory: any[]
  ): Promise<{
    updatedProgression: LearningProgression;
    advancedUpdates: AdvancedFeatures;
    insights: string[];
  }> {
    
    const advancedUpdates: AdvancedFeatures = {};
    const insights: string[] = [];
    
    // 1. UPDATE REPRESENTATION HISTORY
    const repHistory = (progression.representationHistory as RepresentationProfile[]) || [];
    const baselineTime = 30; // Default baseline
    const cognitiveLoad = 0.5; // Would calculate from task
    
    let updatedRepHistory = repHistory;
    for (const rep of representationsUsed) {
      updatedRepHistory = adaptiveRepSelector.updateRepresentationHistory(
        updatedRepHistory,
        rep as any,
        isCorrect,
        timeTaken,
        baselineTime,
        cognitiveLoad
      );
    }
    
    // Get recommendations
    const repRecommendations = adaptiveRepSelector.getRecommendations(
      { ...progression } as any,
      updatedRepHistory
    );
    insights.push(...repRecommendations);
    
    // 2. UPDATE META-LEARNING
    const metaProfile = progression.metaLearningProfile as MetaLearningProfile | null;
    const { profile, update } = metaLearning.updateMetaProfile(taskHistory, metaProfile);
    
    advancedUpdates.metaLearning = { profile, update };
    insights.push(...update.newInsights);
    
    // Check for breakthrough
    if (update.breakthroughProbability > 0.7) {
      insights.push(`🎉 Hohe Durchbruch-Wahrscheinlichkeit (${(update.breakthroughProbability * 100).toFixed(0)}%)!`);
    }
    
    // 3. PREPARE UPDATED PROGRESSION
    const updatedProgression: LearningProgression = {
      ...progression,
      representationHistory: updatedRepHistory,
      metaLearningProfile: profile
    };
    
    return {
      updatedProgression,
      advancedUpdates,
      insights
    };
  }
  
  /**
   * Get comprehensive analytics including Phase 3 features
   */
  async getAdvancedAnalytics(
    progression: LearningProgression,
    taskHistory: any[]
  ): Promise<{
    metaProfile: MetaLearningProfile;
    representationAnalysis: RepresentationProfile[];
    transferReadiness: boolean;
    consolidationStatus: string;
    recommendations: string[];
  }> {
    
    // Meta-learning profile
    const metaProfile = progression.metaLearningProfile as MetaLearningProfile | null;
    const { profile } = metaLearning.updateMetaProfile(taskHistory, metaProfile);
    
    // Representation analysis
    const repHistory = (progression.representationHistory as RepresentationProfile[]) || [];
    
    // Transfer readiness
    const currentDomain: TransferDomain = {
      numberRange: progression.currentStage <= 10 ? 20 : 100,
      operation: '+',
      complexity: 'medium'
    };
    
    const transferReadiness = transferLearning.shouldApplyTransfer(
      currentDomain,
      progression.neuronWeights as Record<string, number>,
      taskHistory
    );
    
    // Consolidation status
    const lastActivity = new Date(progression.updatedAt || Date.now());
    const restDuration = sleepConsolidation.calculateRestDuration(lastActivity);
    const consolidationStatus = restDuration >= 30 
      ? `Konsolidierung empfohlen (${Math.floor(restDuration / 60)}h Pause)`
      : `Aktives Lernen (letzte Aktivität: ${Math.floor(restDuration)}min)`;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    // Meta-learning recommendations
    if (profile.breakthroughIndicators.length > 0) {
      recommendations.push(`💡 Durchbruch-Faktoren erkannt: ${profile.breakthroughIndicators.join(', ')}`);
    }
    
    // Representation recommendations
    const repRecs = adaptiveRepSelector.getRecommendations(
      { ...progression } as any,
      repHistory
    );
    recommendations.push(...repRecs);
    
    // Transfer recommendations
    if (transferReadiness) {
      recommendations.push("🔄 Bereit für Transfer Learning - Wechsel zu ZR100 empfohlen");
    }
    
    return {
      metaProfile: profile,
      representationAnalysis: repHistory,
      transferReadiness,
      consolidationStatus,
      recommendations
    };
  }
}

// ===== EXPORT SINGLETON =====

export const advancedController = new AdvancedNeuralController();
