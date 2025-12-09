/**
 * Neural Routes - Advanced endpoints for Brain-Inspired Progression System
 *
 * Endpoints:
 * - POST /api/neural/task - Generate next task using neural network
 * - POST /api/neural/complete - Complete task and update neural state
 * - GET /api/neural/prediction - Get ensemble prediction for task
 * - GET /api/neural/analytics - Get neural analytics for learner
 * - GET /api/neural/ensemble-stats - Get ensemble model statistics
 */

import type { Express, Request, Response } from "express";
import { isAuthenticated } from "./authService";
import { storage } from "./storage";
import { neuralController } from "./neuralProgressionController";
import { ensemblePredictor } from "./ensemblePredictorSystem";
import type { TaskResult } from "./mathematicsDidacticModules";

export function registerNeuralRoutes(app: Express) {

  /**
   * POST /api/neural/task
   * Generate next task using neural network + genetic evolution
   */
  app.post("/api/neural/task", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const previousTask = req.body.previousTask || null;

      // 1. Get learner progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // 2. Get recent tasks (last 20)
      const allSessions = await storage.getSessionsByUserId(userId);
      const recentTasks = await storage.getRecentTaskResults(userId, 20);

      // Convert to TaskResult format
      const taskResults: TaskResult[] = recentTasks.map(task => ({
        task: {
          number1: task.number1,
          number2: task.number2,
          operation: task.operation as '+' | '-',
          numberRange: task.numberRange as 20 | 100,
          placeholderPosition: (task.placeholderPosition || 'none') as any,
          taskType: task.taskType,
          context: undefined
        },
        isCorrect: task.isCorrect || false,
        timeTaken: task.timeTaken || 30,
        strategyUsed: task.strategyUsed || 'unknown',
        helpRequested: false, // Would need to track this
        selfCorrected: false, // Would need to track this
        representationsUsed: Array.isArray(task.representationsUsed)
          ? task.representationsUsed as string[]
          : []
      }));

      // 3. Generate next task using neural controller
      const generatedTask = await neuralController.generateNextTask(
        progression as any,
        taskResults,
        previousTask // Pass previous task for deduplication
      );

      // 4. Return task with full context
      res.json({
        task: generatedTask.task,
        cognitiveLoad: generatedTask.cognitiveLoad,
        representations: generatedTask.representations,
        scaffolding: generatedTask.scaffolding,
        desirableDifficulties: generatedTask.desirableDifficulties,
        placeholderComplexity: generatedTask.placeholderComplexity,
        metacognitivePrompt: generatedTask.metacognitivePrompt,
        neuralOutputs: generatedTask.neuralOutputs
      });

    } catch (error) {
      console.error("Error generating neural task:", error);
      res.status(500).json({ message: "Failed to generate task", error: String(error) });
    }
  });

  /**
   * POST /api/neural/complete
   * Complete a task and update neural state
   */
  app.post("/api/neural/complete", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const {
        sessionId,
        task,
        studentAnswer,
        isCorrect,
        timeTaken,
        strategyUsed,
        representationsUsed,
        solutionSteps
      } = req.body;

      // 1. Save task to database
      const savedTask = await storage.createTask({
        sessionId,
        taskType: task.taskType || 'practice',
        operation: task.operation,
        number1: task.number1,
        number2: task.number2,
        correctAnswer: task.operation === '+'
          ? task.number1 + task.number2
          : task.number1 - task.number2,
        numberRange: task.numberRange,
        placeholderPosition: task.placeholderPosition || 'none',
        requiresInverseThinking: task.placeholderPosition !== 'none' && task.placeholderPosition !== 'end',
        algebraicComplexity: task.placeholderPosition === 'start' ? 0.7 : task.placeholderPosition === 'middle' ? 0.6 : 0.0,
        studentAnswer,
        isCorrect,
        timeTaken,
        strategyUsed: strategyUsed || 'unknown',
        representationsUsed: representationsUsed || [],
        solutionSteps: solutionSteps || [],
        errorType: isCorrect ? null : 'unknown',
        errorSeverity: isCorrect ? null : 'minor'
      });

      // 2. Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // 3. Get recent tasks for context
      const recentTasks = await storage.getRecentTaskResults(userId, 20);
      const taskResults: TaskResult[] = recentTasks.map(t => ({
        task: {
          number1: t.number1,
          number2: t.number2,
          operation: t.operation as '+' | '-',
          numberRange: t.numberRange as 20 | 100,
          placeholderPosition: (t.placeholderPosition || 'none') as any,
          taskType: t.taskType,
          context: undefined
        },
        isCorrect: t.isCorrect || false,
        timeTaken: t.timeTaken || 30,
        strategyUsed: t.strategyUsed || 'unknown',
        helpRequested: false,
        selfCorrected: false,
        representationsUsed: Array.isArray(t.representationsUsed) ? t.representationsUsed as string[] : []
      }));

      // 4. Create completed task result
      const completedTask: TaskResult = {
        task: {
          number1: task.number1,
          number2: task.number2,
          operation: task.operation,
          numberRange: task.numberRange,
          placeholderPosition: task.placeholderPosition || 'none',
          taskType: task.taskType,
          context: undefined
        },
        isCorrect,
        timeTaken,
        strategyUsed: strategyUsed || 'unknown',
        helpRequested: false,
        selfCorrected: false,
        representationsUsed: representationsUsed || []
      };

      // 5. Process task completion through neural controller
      const updated = await neuralController.processTaskCompletion(
        progression as any,
        completedTask,
        taskResults
      );

      // 6. Update progression in database
      await storage.updateLearningProgression(userId, {
        neuronActivations: updated.updatedProgression.neuronActivations,
        neuronWeights: updated.updatedProgression.neuronWeights,
        memoryTraces: updated.updatedProgression.memoryTraces,
        totalTasksSolved: (progression.totalTasksSolved || 0) + 1,
        totalCorrect: (progression.totalCorrect || 0) + (isCorrect ? 1 : 0),
        currentStreak: isCorrect ? (progression.currentStreak || 0) + 1 : 0
      });

      // 7. Update placeholder performance if applicable
      if (task.placeholderPosition && task.placeholderPosition !== 'none') {
        const placeholderPerf = (progression.placeholderPerformance as any) || {
          start: { attempted: 0, correct: 0, avgTime: 0 },
          middle: { attempted: 0, correct: 0, avgTime: 0 },
          end: { attempted: 0, correct: 0, avgTime: 0 }
        };

        const pos = task.placeholderPosition as 'start' | 'middle' | 'end';
        placeholderPerf[pos].attempted += 1;
        placeholderPerf[pos].correct += isCorrect ? 1 : 0;
        placeholderPerf[pos].avgTime =
          (placeholderPerf[pos].avgTime * (placeholderPerf[pos].attempted - 1) + timeTaken) /
          placeholderPerf[pos].attempted;

        await storage.updateLearningProgression(userId, {
          placeholderPerformance: placeholderPerf
        });
      }

      res.json({
        savedTask,
        neuralUpdate: {
          zpd: updated.zpd,
          outputs: updated.outputs,
          inputs: updated.inputs
        }
      });

    } catch (error) {
      console.error("Error completing neural task:", error);
      res.status(500).json({ message: "Failed to complete task", error: String(error) });
    }
  });

  /**
   * GET /api/neural/prediction
   * Get ensemble prediction for a given task
   */
  app.get("/api/neural/prediction", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { task } = req.query;

      if (!task) {
        return res.status(400).json({ message: "Task parameter required" });
      }

      const taskObj = JSON.parse(task as string);

      // Get progression and recent tasks
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const recentTasks = await storage.getRecentTaskResults(userId, 20);
      const taskResults: TaskResult[] = recentTasks.map(t => ({
        task: {
          number1: t.number1,
          number2: t.number2,
          operation: t.operation as '+' | '-',
          numberRange: t.numberRange as 20 | 100,
          placeholderPosition: (t.placeholderPosition || 'none') as any,
          taskType: t.taskType,
          context: undefined
        },
        isCorrect: t.isCorrect || false,
        timeTaken: t.timeTaken || 30,
        strategyUsed: t.strategyUsed || 'unknown',
        helpRequested: false,
        selfCorrected: false,
        representationsUsed: Array.isArray(t.representationsUsed) ? t.representationsUsed as string[] : []
      }));

      // Get neural inputs
      const { LearnerObserver } = await import("./neuralProgressionController");
      const observer = new LearnerObserver();
      const inputs = observer.observe(progression as any, taskResults);

      // Get ensemble prediction
      const prediction = ensemblePredictor.predict(inputs, taskObj, taskResults);

      res.json(prediction);

    } catch (error) {
      console.error("Error getting prediction:", error);
      res.status(500).json({ message: "Failed to get prediction", error: String(error) });
    }
  });

  /**
   * GET /api/neural/analytics/:userId
   * Get neural analytics for a learner
   */
  app.get("/api/neural/analytics/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Get recent tasks
      const recentTasks = await storage.getRecentTaskResults(userId, 50);

      // Neural analytics
      const analytics = {
        neuronActivations: progression.neuronActivations || {},
        neuronWeights: progression.neuronWeights || {},
        memoryTraces: (progression.memoryTraces as any[]) || [],
        placeholderPerformance: progression.placeholderPerformance || {},

        // Performance metrics
        totalTasks: progression.totalTasksSolved || 0,
        accuracy: (progression.totalCorrect || 0) / Math.max(1, progression.totalTasksSolved || 1),
        currentStreak: progression.currentStreak || 0,

        // NLS 2.0 dimensions
        rml: progression.rml || 0.0,
        cla: progression.cla || 0.5,
        smi: progression.smi || 0.0,
        tal: progression.tal || 0.5,
        mca: progression.mca || 0.0,

        // Recent performance
        recentPerformance: recentTasks.slice(0, 10).map(t => ({
          taskType: t.taskType,
          correct: t.isCorrect,
          time: t.timeTaken,
          placeholder: t.placeholderPosition
        }))
      };

      res.json(analytics);

    } catch (error) {
      console.error("Error getting neural analytics:", error);
      res.status(500).json({ message: "Failed to get analytics", error: String(error) });
    }
  });

  /**
   * GET /api/neural/ensemble-stats
   * Get ensemble model statistics
   */
  app.get("/api/neural/ensemble-stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const stats = ensemblePredictor.getModelStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting ensemble stats:", error);
      res.status(500).json({ message: "Failed to get stats", error: String(error) });
    }
  });

  // ===== PHASE 3 ENDPOINTS =====

  /**
   * POST /api/neural/session-start
   * Start session with consolidation check (Phase 3)
   */
  app.post("/api/neural/session-start", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Last activity time
      const lastActivity = new Date(progression.updatedAt || Date.now());

      // Apply consolidation (imported dynamically to avoid circular deps)
      const { advancedController } = await import("./advancedNeuralController");
      const result = await advancedController.processSessionStart(
        progression as any,
        lastActivity
      );

      // Update progression if consolidated
      if (result.consolidation) {
        await storage.updateLearningProgression(userId, {
          neuronWeights: result.progression.neuronWeights,
          memoryTraces: result.progression.memoryTraces
        });
      }

      res.json({
        consolidationApplied: result.consolidation?.consolidationApplied || false,
        message: result.message,
        consolidation: result.consolidation
      });

    } catch (error) {
      console.error("Error starting session:", error);
      res.status(500).json({ message: "Failed to start session", error: String(error) });
    }
  });

  /**
   * POST /api/neural/advanced-task
   * Generate task with all Phase 3 features
   */
  app.post("/api/neural/advanced-task", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Get task history
      const recentTasks = await storage.getRecentTaskResults(userId, 30);

      // Generate advanced task
      const { advancedController } = await import("./advancedNeuralController");
      const result = await advancedController.generateAdvancedTask(
        progression as any,
        progression as any,
        recentTasks
      );

      res.json(result);

    } catch (error) {
      console.error("Error generating advanced task:", error);
      res.status(500).json({ message: "Failed to generate task", error: String(error) });
    }
  });

  /**
   * POST /api/neural/advanced-completion
   * Process task completion with Phase 3 features
   */
  app.post("/api/neural/advanced-completion", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { task, isCorrect, timeTaken, representationsUsed } = req.body;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Get task history
      const taskHistory = await storage.getRecentTaskResults(userId, 50);

      // Process completion
      const { advancedController } = await import("./advancedNeuralController");
      const result = await advancedController.processAdvancedCompletion(
        progression,
        task,
        isCorrect,
        timeTaken,
        representationsUsed || [],
        taskHistory
      );

      // Update progression
      await storage.updateLearningProgression(userId, result.updatedProgression);

      res.json(result);

    } catch (error) {
      console.error("Error processing advanced completion:", error);
      res.status(500).json({ message: "Failed to process completion", error: String(error) });
    }
  });

  /**
   * GET /api/neural/advanced-analytics/:userId
   * Get advanced analytics with Phase 3 features
   */
  app.get("/api/neural/advanced-analytics/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Get task history
      const taskHistory = await storage.getRecentTaskResults(userId, 100);

      // Get advanced analytics
      const { advancedController } = await import("./advancedNeuralController");
      const analytics = await advancedController.getAdvancedAnalytics(
        progression as any,
        taskHistory
      );

      res.json(analytics);

    } catch (error) {
      console.error("Error getting advanced analytics:", error);
      res.status(500).json({ message: "Failed to get analytics", error: String(error) });
    }
  });

  /**
   * POST /api/neural/transfer-check
   * Check if transfer learning is ready
   */
  app.post("/api/neural/transfer-check", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;

      // Get progression
      const progression = await storage.getLearningProgression(userId);
      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      // Check transfer readiness
      const { transferLearning } = await import("./transferLearning");
      const currentDomain = {
        numberRange: (progression as any).numberRange || 20,
        operation: '+' as const
      };

      const isReady = transferLearning.checkTransferReadiness(
        progression as any,
        currentDomain
      );

      res.json({
        ready: isReady.ready,
        reason: isReady.reason,
        masteryLevel: isReady.masteryLevel
      });

    } catch (error) {
      console.error("Error checking transfer:", error);
      res.status(500).json({ message: "Failed to check transfer", error: String(error) });
    }
  });
}