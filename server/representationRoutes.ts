import type { Express, Request, Response } from "express";
import { isAuthenticated } from "./authService";
import { storage } from "./storage";
import { representationEngine } from "./representationSystem";
import { representationBasedGenerator, type GenerationContext } from "./representationBasedGenerator";
import { representationProgressionEngine } from "./representationProgressionEngine";

/**
 * Register routes for the representation-based learning system
 */
export function registerRepresentationRoutes(app: Express) {
  
  /**
   * GET /api/representation/config
   * Get current representation configuration for the user
   */
  app.get("/api/representation/config", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const config = representationEngine.getActiveRepresentations(progression);
      const repProgression = representationEngine.getRepresentationProgression(progression);
      const mastery = representationEngine.getRepresentationMastery(progression);
      const activeCount = representationEngine.getActiveCount(config);

      res.json({
        config,
        progression: repProgression,
        mastery,
        activeCount,
        stageDescription: representationProgressionEngine.getStageDescription(repProgression.stage),
        difficultyLevel: representationProgressionEngine.getDifficultyLevel(config, progression.currentStage)
      });
    } catch (error) {
      console.error("Error fetching representation config:", error);
      res.status(500).json({ message: "Failed to fetch representation configuration" });
    }
  });

  /**
   * POST /api/representation/generate-task
   * Generate a single task with current representation configuration
   */
  app.post("/api/representation/generate-task", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const config = representationEngine.getActiveRepresentations(progression);
      const repProgression = representationEngine.getRepresentationProgression(progression);
      const activeCount = representationEngine.getActiveCount(config);

      const context: GenerationContext = {
        progression,
        numberRange: req.body.numberRange || 20,
        currentStage: progression.currentStage,
        representationConfig: config,
        activeRepCount: activeCount
      };

      const task = representationBasedGenerator.generateTask(context);

      res.json({
        task,
        config,
        activeCount,
        stage: repProgression.stage,
        stageDescription: representationProgressionEngine.getStageDescription(repProgression.stage)
      });
    } catch (error) {
      console.error("Error generating task:", error);
      res.status(500).json({ message: "Failed to generate task" });
    }
  });

  /**
   * POST /api/representation/generate-batch
   * Generate multiple tasks with current configuration
   */
  app.post("/api/representation/generate-batch", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const { count = 5, numberRange = 20 } = req.body;
      
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const config = representationEngine.getActiveRepresentations(progression);
      const activeCount = representationEngine.getActiveCount(config);

      const context: GenerationContext = {
        progression,
        numberRange,
        currentStage: progression.currentStage,
        representationConfig: config,
        activeRepCount: activeCount
      };

      const tasks = representationBasedGenerator.generateBatch(context, count);

      res.json({
        tasks,
        config,
        activeCount
      });
    } catch (error) {
      console.error("Error generating task batch:", error);
      res.status(500).json({ message: "Failed to generate task batch" });
    }
  });

  /**
   * POST /api/representation/submit-task
   * Submit a task result and update representation progression
   */
  app.post("/api/representation/submit-task", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const {
        taskId,
        isCorrect,
        timeTaken,
        userAnswer,
        activeRepresentations
      } = req.body;

      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const evaluation = representationProgressionEngine.evaluateProgression(
        progression,
        {
          isCorrect,
          timeTaken,
          activeRepresentations
        }
      );

      const updates = representationProgressionEngine.updateProgressionData(
        progression,
        evaluation,
        {
          isCorrect,
          timeTaken,
          activeRepresentations
        }
      );

      await storage.updateLearningProgression(userId, updates);

      const updatedProgression = await storage.getLearningProgression(userId);
      const newConfig = updatedProgression 
        ? representationEngine.getActiveRepresentations(updatedProgression)
        : activeRepresentations;
      const newActiveCount = representationEngine.getActiveCount(newConfig);

      res.json({
        success: true,
        evaluation,
        newConfig,
        newActiveCount,
        message: evaluation.message
      });
    } catch (error) {
      console.error("Error submitting task:", error);
      res.status(500).json({ message: "Failed to submit task" });
    }
  });

  /**
   * POST /api/representation/advance
   * Manually advance to next representation stage
   */
  app.post("/api/representation/advance", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const currentProgression = representationEngine.getRepresentationProgression(progression);
      
      if (currentProgression.stage >= 10) {
        return res.status(400).json({ message: "Already at maximum stage" });
      }

      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        currentProgression.stage + 1,
        'Manual advancement'
      );

      await storage.updateLearningProgression(userId, {
        representationConfig: result.config as any,
        representationProgression: result.progression as any
      });

      res.json({
        success: true,
        newConfig: result.config,
        newStage: result.progression.stage,
        message: result.message
      });
    } catch (error) {
      console.error("Error advancing representation stage:", error);
      res.status(500).json({ message: "Failed to advance stage" });
    }
  });

  /**
   * POST /api/representation/retreat
   * Manually retreat to previous representation stage (add more support)
   */
  app.post("/api/representation/retreat", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const currentProgression = representationEngine.getRepresentationProgression(progression);
      
      if (currentProgression.stage <= 1) {
        return res.status(400).json({ message: "Already at minimum stage" });
      }

      const result = representationEngine.applyRepresentationStage(
        currentProgression.stage,
        currentProgression.stage - 1,
        'Manual retreat for more support'
      );

      await storage.updateLearningProgression(userId, {
        representationConfig: result.config as any,
        representationProgression: result.progression as any
      });

      res.json({
        success: true,
        newConfig: result.config,
        newStage: result.progression.stage,
        message: result.message
      });
    } catch (error) {
      console.error("Error retreating representation stage:", error);
      res.status(500).json({ message: "Failed to retreat stage" });
    }
  });

  /**
   * GET /api/representation/stats
   * Get representation usage statistics
   */
  app.get("/api/representation/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.status(404).json({ message: "Progression not found" });
      }

      const config = representationEngine.getActiveRepresentations(progression);
      const mastery = representationEngine.getRepresentationMastery(progression);
      const repProgression = representationEngine.getRepresentationProgression(progression);

      const stats = {
        currentStage: repProgression.stage,
        activeCount: repProgression.activeCount,
        activeRepresentations: representationEngine.getActiveList(config),
        mastery,
        reductionHistory: repProgression.reductionHistory,
        overallSuccessRate: Object.values(mastery)
          .filter(m => m.totalUsed > 0)
          .reduce((sum, m) => sum + m.successRate, 0) / 5
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching representation stats:", error);
      res.status(500).json({ message: "Failed to fetch representation stats" });
    }
  });
}
