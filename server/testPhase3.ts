
import { advancedController } from "./advancedNeuralController";
import type { LearningProgression } from "../shared/schema";

/**
 * Test Phase 3 Features
 * Demonstrates all advanced neural features
 */
export async function testPhase3Features() {
  console.log("\n🧠 PHASE 3 FEATURE TEST\n");
  console.log("=" .repeat(60));
  
  // Mock progression
  const mockProgression: any = {
    userId: "test-user",
    currentLevel: 25,
    numberRange: 20,
    currentStreak: 5,
    representationLevel: 3,
    neuronActivations: {},
    neuronWeights: {},
    memoryTraces: [],
    lastSessionAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  };
  
  // Mock task history
  const mockTaskHistory = [
    {
      taskId: "1",
      isCorrect: true,
      timeTaken: 12,
      strategyUsed: "decomposition",
      representationUsed: "twentyFrame",
      task: { number1: 12, number2: 5, operation: '+' as const, numberRange: 20 }
    },
    {
      taskId: "2",
      isCorrect: true,
      timeTaken: 10,
      strategyUsed: "decomposition",
      representationUsed: "numberLine",
      task: { number1: 15, number2: 3, operation: '+' as const, numberRange: 20 }
    },
    {
      taskId: "3",
      isCorrect: false,
      timeTaken: 25,
      strategyUsed: "counting_all",
      representationUsed: "counters",
      task: { number1: 18, number2: 7, operation: '+' as const, numberRange: 20 }
    }
  ];
  
  // Test 1: Session Start (Consolidation)
  console.log("\n📊 TEST 1: Sleep-Dependent Consolidation");
  console.log("-".repeat(60));
  const sessionStart = await advancedController.processSessionStart(
    mockProgression,
    mockTaskHistory
  );
  console.log("✓ Consolidation Applied:", sessionStart.consolidationApplied);
  if (sessionStart.consolidation) {
    console.log("  - Rest Duration:", sessionStart.consolidation.restDuration, "minutes");
    console.log("  - Quality:", Math.round(sessionStart.consolidation.consolidationQuality * 100) + "%");
    console.log("  - Synapses Pruned:", sessionStart.consolidation.synapsesPruned);
    console.log("  - Synapses Strengthened:", sessionStart.consolidation.synapsesStrengthened);
  }
  
  // Test 2: Advanced Task Generation
  console.log("\n📊 TEST 2: Adaptive Representation Selection");
  console.log("-".repeat(60));
  const advancedTask = await advancedController.generateAdvancedTask(
    sessionStart.updatedProgression || mockProgression,
    mockProgression,
    mockTaskHistory
  );
  console.log("✓ Task Generated:", advancedTask.task);
  console.log("✓ Representations:", advancedTask.representations);
  if (advancedTask.advancedFeatures?.representationSelection) {
    const rep = advancedTask.advancedFeatures.representationSelection;
    console.log("  - Primary:", rep.primary);
    console.log("  - Reasoning:", rep.reasoning);
    console.log("  - Expected Benefit:", Math.round(rep.expectedBenefit * 100) + "%");
  }
  
  // Test 3: Meta-Learning Profile
  console.log("\n📊 TEST 3: Meta-Learning Profile");
  console.log("-".repeat(60));
  if (advancedTask.advancedFeatures?.metaLearning) {
    const meta = advancedTask.advancedFeatures.metaLearning;
    console.log("✓ Optimal Learning Rate:", meta.profile?.optimalLearningRate?.toFixed(2));
    console.log("✓ Optimal Spacing:", meta.profile?.optimalSpacing, "minutes");
    console.log("✓ Error Recovery Rate:", Math.round((meta.profile?.errorRecoveryRate || 0) * 100) + "%");
    console.log("✓ Strategy Adaptability:", Math.round((meta.profile?.strategyAdaptability || 0) * 100) + "%");
    console.log("✓ Performance Trend:", meta.update?.performanceTrend);
    console.log("✓ Breakthrough Probability:", Math.round((meta.update?.breakthroughProbability || 0) * 100) + "%");
  }
  
  // Test 4: Transfer Learning Check
  console.log("\n📊 TEST 4: Transfer Learning Readiness");
  console.log("-".repeat(60));
  const { transferLearning } = await import("./transferLearning");
  const transferCheck = transferLearning.checkTransferReadiness(
    mockProgression,
    { numberRange: 20, operation: '+' }
  );
  console.log("✓ Transfer Ready:", transferCheck.ready);
  console.log("✓ Mastery Level:", Math.round(transferCheck.masteryLevel * 100) + "%");
  console.log("✓ Reason:", transferCheck.reason);
  
  // Test 5: Advanced Analytics
  console.log("\n📊 TEST 5: Advanced Analytics");
  console.log("-".repeat(60));
  const analytics = await advancedController.getAdvancedAnalytics(
    mockProgression,
    mockTaskHistory
  );
  console.log("✓ Meta Profile Available:", !!analytics.metaProfile);
  console.log("✓ Representation Analysis:", analytics.representationAnalysis?.length || 0, "representations tracked");
  console.log("✓ Transfer Readiness:", analytics.transferReadiness);
  console.log("✓ Consolidation Status:", analytics.consolidationStatus);
  console.log("✓ Recommendations:", analytics.recommendations?.length || 0);
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ PHASE 3 TEST COMPLETE\n");
  
  return {
    sessionStart,
    advancedTask,
    transferCheck,
    analytics
  };
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  testPhase3Features()
    .then(() => {
      console.log("✨ Phase 3 test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Phase 3 test failed:", error);
      process.exit(1);
    });
}

export { testPhase3Features };
