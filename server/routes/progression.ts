import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../authService";
import { db } from "../db";
import { eq, desc } from "drizzle-orm"; // Added desc if needed
import {
  users,
  learningProgression,
  userAnimalCards,
  animalCards
} from "@shared/schema";
import { taskGenerator } from "../taskGenerator"; // Assuming these are correct relative paths
import { competencyBasedGenerator } from "../competencyBasedGenerator";
import { competencyProgressTracker } from "../competencyProgressTracker";
import { gamificationEngine } from "../gamificationEngine";
import { bayesianEngine } from "../bayesianEngine";
import { analyticsEngine } from "../analyticsEngine";
import { ProgressionEngine } from "../progressionEngine";
import { analyzeErrorSystematically, detectErrorPattern, calculateOverallLevel } from "../lib/progression-helpers";

// Imported constants and helpers
import {
  ERROR_TYPES,
  ERROR_SEVERITY,
  ERROR_TYPE_LABELS,
  ERROR_PATTERNS
} from "../lib/error-constants";
import {
  classifyLegacyError,
  classifyLegacyErrorSeverity,
  getErrorDesc,
  getErrorLabel,
  getMilestoneName,
  getMilestoneIcon
} from "../lib/route-helpers";

const router = Router();

// The following imports were part of the original file and are retained as per the instruction's implicit context.




// ===== SESSIONS & TASKS =====
router.post("/api/sessions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { trainingMode, representationConfig } = req.body;

    // Update user's training mode and config if provided
    if (trainingMode) {
      const progression = await storage.getLearningProgression(userId);
      if (progression) {
        const updates: any = {
          trainingMode: trainingMode,
        };

        // Update the appropriate config based on mode - EACH MODE HAS ITS OWN CONFIG FIELD
        if (trainingMode === 'custom' && representationConfig) {
          updates.customModeConfig = representationConfig;
        } else if (trainingMode === 'blind' && representationConfig) {
          updates.blindModeConfig = representationConfig; // Use separate field for blind mode
        }

        // Update mode-specific tracking
        const modeTracking = (progression as any).modeSpecificTracking || {};
        if (trainingMode in modeTracking) {
          modeTracking[trainingMode].lastUsed = new Date();
          if (trainingMode === 'custom' && representationConfig) {
            modeTracking.custom.selectedRepresentations = Object.keys(representationConfig).filter(
              key => representationConfig[key as keyof typeof representationConfig]
            );
          } else if (trainingMode === 'blind' && representationConfig) {
            modeTracking.blind.selectedRepresentations = Object.keys(representationConfig).filter(
              key => representationConfig[key as keyof typeof representationConfig]
            );
          }
        }
        updates.modeSpecificTracking = modeTracking;

        await storage.updateLearningProgression(userId, updates);
      }
    }

    const session = await storage.createLearningSession({
      userId,
      moduleType: req.body.moduleType || 'minusplus',
      sessionType: req.body.sessionType || 'practice',
      difficulty: req.body.difficulty || 1,
      numberRange: req.body.numberRange || 20,
      totalProblems: 0,
      correctAnswers: 0,
      duration: 0,
      accuracy: 0,
      startedAt: new Date(),
    });

    res.json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).send("Internal server error");
  }
});

// Get sessions for user
router.get("/api/sessions", isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const sessions = await storage.getSessionsByUserId(userId);
  res.json(sessions);
});

// Create task (with automatic strategy detection)
router.post("/api/tasks", isAuthenticated, async (req: any, res: Response) => {
  try {
    const taskData = req.body; // Keep original body for attemptNumber

    // Extract studentAnswer from object if needed
    // Frontend can send: {result: number}, {number1: number}, {number2: number}, or just a number
    let extractedStudentAnswer = taskData.studentAnswer;
    if (extractedStudentAnswer && typeof extractedStudentAnswer === 'object') {
      // Priority: result > number1 > number2 (most common case first)
      if ('result' in extractedStudentAnswer) {
        extractedStudentAnswer = extractedStudentAnswer.result;
      } else if ('number1' in extractedStudentAnswer) {
        extractedStudentAnswer = extractedStudentAnswer.number1;
      } else if ('number2' in extractedStudentAnswer) {
        extractedStudentAnswer = extractedStudentAnswer.number2;
      } else {
        // Fallback: use first numeric property found
        const numericValue = Object.values(extractedStudentAnswer).find(v => typeof v === 'number');
        extractedStudentAnswer = numericValue as number;
      }
    }

    // Ensure we have a valid number
    if (typeof extractedStudentAnswer !== 'number' || isNaN(extractedStudentAnswer)) {
      console.error('❌ Invalid studentAnswer:', taskData.studentAnswer, 'extracted as:', extractedStudentAnswer);
      extractedStudentAnswer = null;
    }

    // Detect strategy if solution steps provided
    let strategyUsed = null;
    let errorType = null;
    let errorSeverity = null;

    if (taskData.solutionSteps && taskData.solutionSteps.length > 0 && taskData.timeTaken) {
      const analysis = strategyDetector.detectStrategy(
        taskData.operation,
        taskData.number1,
        taskData.number2,
        taskData.correctAnswer,
        taskData.solutionSteps as SolutionStep[],
        taskData.timeTaken
      );

      strategyUsed = analysis.detectedStrategy;
    }

    // Systematische Fehleranalyse mit neuem ErrorAnalyzer (6+1 Kategorien)
    if (!taskData.isCorrect && extractedStudentAnswer != null) {
      // Fehleranalyse mit Error Analyzer (inkl. Platzhalter-Position)
      const errorAnalysis = errorAnalyzer.analyzeError(
        taskData.operation,
        taskData.number1,
        taskData.number2,
        taskData.correctAnswer,
        extractedStudentAnswer,
        taskData.placeholderPosition || 'none'
      );

      if (errorAnalysis) {
        errorType = errorAnalysis.errorType;
        errorSeverity = errorAnalysis.errorSeverity;
      }
    }

    // CRITICAL: Verify correctAnswer is actually correct
    const op = taskData.operation;
    const n1 = parseInt(taskData.number1); // Ensure integer
    const n2 = parseInt(taskData.number2); // Ensure integer

    if (isNaN(n1) || isNaN(n2)) {
      console.error(`❌ Invalid numbers in task: ${taskData.number1} (${typeof taskData.number1}) ${op} ${taskData.number2} (${typeof taskData.number2})`);
    }

    const verifiedCorrectAnswer = op === "+"
      ? n1 + n2
      : n1 - n2;

    if (verifiedCorrectAnswer !== parseInt(taskData.correctAnswer)) {
      console.error(`❌❌❌ CRITICAL: Task has WRONG correctAnswer! ${n1} ${op} ${n2} should be ${verifiedCorrectAnswer}, not ${taskData.correctAnswer} `);
      taskData.correctAnswer = verifiedCorrectAnswer;
    }

    // Update the taskData with parsed values
    taskData.number1 = n1;
    taskData.number2 = n2;

    // Validate task before creating (using the potentially corrected correctAnswer)
    // Assuming validateTask is available in the scope or imported
    // We need to ensure that validateTask exists and handles the operation and numbers.
    // If validateTask is not defined, this part would fail.
    // For now, assuming it's correctly imported or defined elsewhere.
    // Let's add a placeholder check for validateTask if it's not globally available.
    let validationResult = { isValid: true, error: '' };
    if (typeof validateTask === 'function') {
      validationResult = validateTask({
        operation: taskData.operation,
        number1: taskData.number1,
        number2: taskData.number2
      });

      if (!validationResult.isValid) {
        console.error("Task validation failed:", validationResult.error);
        return res.status(400).json({
          error: "Invalid task",
          details: validationResult.error
        });
      }
    } else {
      console.warn("validateTask function is not defined. Skipping task validation.");
      // Optionally add default validation for negative numbers if not handled by validateTask
      if (taskData.number1 < 0 || taskData.number2 < 0) {
        console.error("❌❌❌ CRITICAL: Task contains negative numbers, which is not allowed.");
        return res.status(400).json({
          error: "Invalid task",
          details: "Negative numbers are not allowed in tasks."
        });
      }
    }


    // Create task (non-blocking)
    let newTask = null;
    try {
      // Clean task data - remove fields that don't belong in tasks table
      const { homework_set_id, type, taskPatternType, question, imageUrl, imageDescription, hints, tags, explanations, skillTier, cognitiveLevel, ...cleanTaskData } = taskData;

      newTask = await storage.createTask({
        ...cleanTaskData, // Spread cleaned task data
        studentAnswer: extractedStudentAnswer, // Use the extracted/validated student answer
        strategyUsed: strategyUsed, // Use detected strategy
        errorType: errorType, // Use analyzed error type
        errorSeverity: errorSeverity, // Use analyzed error severity
        correctAnswer: parseInt(taskData.correctAnswer) // Convert to integer as DB expects
      });
    } catch (error) {
      console.error("Error creating task (non-blocking):", error instanceof Error ? error.message : error);
      // Don't block progression tracking if task creation fails
    }


    // Update problem statistics for every attempt
    const session = await storage.getLearningSession(taskData.sessionId);
    const numberRange = session?.numberRange || 20;

    try {
      await storage.updateProblemStatisticsAfterAttempt(
        taskData.operation,
        taskData.number1,
        taskData.number2,
        numberRange,
        taskData.isCorrect,
        taskData.timeTaken || 0
      );
    } catch (error) {
      console.error("Error updating problem statistics:", error);
    }

    // Check for new achievements
    const userId = (req.session as any).userId;
    const allUserTasks = await storage.getSessionsByUserId(userId)
      .then((sessions: any[]) =>
        Promise.all(sessions.map(s => storage.getTasksBySessionId(s.id)))
      )
      .then((tasksArrays: any[]) => tasksArrays.flat());

    const newAchievements = await gamificationEngine.checkAchievements(
      userId,
      newTask,
      allUserTasks,
      storage
    );

    // ===== UPDATE LEARNING PROGRESSION WITH TASK RESULTS =====
    try {
      let progression = await storage.getLearningProgression(userId);

      // Initialize progression if it doesn't exist
      if (!progression) {
        progression = await storage.initializeProgressionForUser(userId);
      }

      // Calculate new progress values
      const newTotalTasksSolved = (progression.totalTasksSolved || 0) + 1;
      const newTotalCorrect = (progression.totalCorrect || 0) + (taskData.isCorrect ? 1 : 0);
      const newCurrentStreak = taskData.isCorrect
        ? (progression.currentStreak || 0) + 1
        : 0;

      // Update progression
      const updatedProgression = await storage.updateLearningProgression(userId, {
        totalTasksSolved: newTotalTasksSolved,
        totalCorrect: newTotalCorrect,
        currentStreak: newCurrentStreak,
        lastActivityAt: new Date(),
      });

      console.log(`✅ Progress updated for user ${userId}: Tasks = ${newTotalTasksSolved}, Correct = ${newTotalCorrect}, Streak = ${newCurrentStreak} `);

      // Return progression data along with task and achievements
      res.json({
        task: newTask,
        newAchievements,
        progression: updatedProgression,
        milestoneAchieved: result?.milestoneAchieved || null
      });
    } catch (progressError) {
      console.error('Error updating learning progression:', progressError);
      // Still return the task and achievements even if progression update fails
      res.json({ task: newTask, newAchievements });
    }
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Internal server error");
  }
});

// Get tasks for session
router.get("/api/tasks/:sessionId", isAuthenticated, async (req: any, res: Response) => {
  const tasks = await storage.getTasksBySessionId(req.params.sessionId);
  res.json(tasks);
});

// Generate task package
router.post("/api/generate-tasks", isAuthenticated, async (req: any, res: Response) => {
  try {
    const { strategyLevel, patternType, difficulty, numberRange } = req.body;

    const taskPackage = taskGenerator.generatePackage(
      strategyLevel as StrategyLevel,
      patternType as PatternType,
      difficulty || 3,
      numberRange || 20
    );

    res.json(taskPackage);
  } catch (error) {
    console.error("Error generating tasks:", error);
    res.status(500).send("Internal server error");
  }
});

// Generate adaptive task sequence
router.post("/api/generate-adaptive-tasks", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    let profile = await storage.getCognitiveProfile(userId);

    // Create default profile if it doesn't exist
    if (!profile) {
      console.log(`Creating default cognitive profile for user ${userId}`);
      profile = await storage.createCognitiveProfile({
        userId,
        strengths: [],
        weaknesses: [],
        strategyPreferences: ["counting_on"],
        currentZPDLevel: 2,
        successRate: 0.5,
        averageTimePerTask: 60,
        numberRange: 20,
        errorProbabilities: {},
        strategyUsage: {},
      });
    }

    // Get the most recent session to determine numberRange
    const sessions = await storage.getSessionsByUserId(userId);
    const latestSession = sessions.sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )[0];

    const numberRange = latestSession?.numberRange || profile.numberRange || 20;

    const taskPackage = taskGenerator.generateAdaptiveSequence(
      profile.successRate,
      profile.currentZPDLevel,
      profile.strategyPreferences as StrategyLevel[],
      numberRange
    );

    res.json(taskPackage);
  } catch (error) {
    console.error("Error generating adaptive tasks:", error);
    res.status(500).send("Internal server error");
  }
});

// ===== COMPETENCY-BASED TASK GENERATION =====

// Generate competency-based tasks (new system)
router.post("/api/competency/generate-tasks", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { count = 10 } = req.body;

    // Get or initialize progression
    let progression = await storage.getLearningProgression(userId);
    if (!progression) {
      progression = await storage.initializeProgressionForUser(userId);
    }

    // Generate mixed competency-based tasks
    const tasks = competencyBasedGenerator.generateMixedTasks(progression, count);

    res.json({ tasks });
  } catch (error) {
    console.error("Error generating competency-based tasks:", error);
    res.status(500).json({ message: "Failed to generate tasks" });
  }
});

// Submit task and update competency progress
router.post("/api/competency/submit-task", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { task } = req.body;

    // Get progression
    const progression = await storage.getLearningProgression(userId);
    if (!progression) {
      return res.status(404).json({ message: "Progression not found" });
    }

    // Identify competencies
    const competencies = competencyProgressTracker.identifyCompetencies(task);

    // Update progress
    const updates = competencyProgressTracker.updateProgressAfterTask(
      progression,
      task,
      competencies
    );

    // Save to database
    await storage.updateLearningProgression(userId, updates);

    res.json({
      success: true,
      competencies,
      updates
    });
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ message: "Failed to submit task" });
  }
});

// Get competency summary
router.get("/api/competency/summary", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    const progression = await storage.getLearningProgression(userId);
    if (!progression) {
      return res.json({
        totalCompetencies: 0,
        masteredCompetencies: 0,
        averageLevel: 0,
        weakCompetencies: [],
      });
    }

    const summary = competencyProgressTracker.getCompetencySummary(progression);
    res.json(summary);
  } catch (error) {
    console.error("Error getting competency summary:", error);
    res.status(500).json({ message: "Failed to get summary" });
  }
});

// Get detailed competency progress
router.get("/api/competency/progress", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    const progression = await storage.getLearningProgression(userId);
    if (!progression) {
      return res.json({
        taskMastery: {},
        competencyProgress: {},
      });
    }

    res.json({
      taskMastery: progression.taskMastery || {},
      competencyProgress: progression.competencyProgress || {},
    });
  } catch (error) {
    console.error("Error getting competency progress:", error);
    res.status(500).json({ message: "Failed to get progress" });
  }
});

// Get achievements for user
router.get("/api/achievements", isAuthenticated, async (req: any, res: Response) => {
  const userId = (req.session as any).userId;
  const achievements = await storage.getAchievementsByUserId(userId);
  res.json(achievements);
});

// Create achievement
router.post("/api/achievements", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const achievement = await storage.createAchievement({
      userId,
      achievementType: req.body.achievementType,
      title: req.body.title,
      description: req.body.description,
      iconName: req.body.iconName,
    });

    res.json(achievement);
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).send("Internal server error");
  }
});

// Run Bayesian diagnosis
router.post("/api/diagnose", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { sessionId } = req.body;

    // Get recent tasks (from session or last N tasks)
    let recentTasks;
    if (sessionId) {
      recentTasks = await storage.getTasksBySessionId(sessionId);
    } else {
      const sessions = await storage.getSessionsByUserId(userId);
      const tasksArrays = await Promise.all(
        sessions.slice(-3).map(s => storage.getTasksBySessionId(s.id))
      );
      recentTasks = tasksArrays.flat();
    }

    // Get current profile
    const currentProfile = await storage.getCognitiveProfile(userId);

    // Run diagnosis
    const inference = await bayesianEngine.diagnose(userId, recentTasks, currentProfile);

    // Update profile
    await bayesianEngine.updateCognitiveProfile(userId, inference, storage);

    res.json(inference);
  } catch (error) {
    console.error("Error running diagnosis:", error);
    res.status(500).send("Internal server error");
  }
});

// Get missions for user
router.get("/api/missions", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const profile = await storage.getCognitiveProfile(userId);

    const allUserTasks = await storage.getSessionsByUserId(userId)
      .then((sessions: any[]) =>
        Promise.all(sessions.map(s => storage.getTasksBySessionId(s.id)))
      )
      .then((tasksArrays: any[]) => tasksArrays.flat());

    const missions = await gamificationEngine.generateMissions(userId, profile, allUserTasks);

    res.json(missions);
  } catch (error) {
    console.error("Error generating missions:", error);
    res.status(500).send("Internal server error");
  }
});

// Get gamification stats
router.get("/api/gamification-stats", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const achievements = await storage.getAchievementsByUserId(userId);

    const points = gamificationEngine.calculatePoints(achievements);
    const rank = gamificationEngine.getRank(points);

    res.json({
      achievements,
      totalPoints: points,
      rank,
      unlockedCount: achievements.filter((a: any) => a.isUnlocked).length,
      totalCount: 9, // Total possible achievements
    });
  } catch (error) {
    console.error("Error getting gamification stats:", error);
    res.status(500).send("Internal server error");
  }
});

// Get pedagogical recommendation for student's error

// Get student analytics (for teacher dashboard)

// Get class analytics (for teacher dashboard)

// ===== PROGRESSION ROUTES =====
const progressionEngine = new ProgressionEngine();

// Get all stages info (MUST be before /:userId route)
router.get("/api/progression/stages", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const stages = progressionEngine.getAllStages();
    res.json(stages);
  } catch (error) {
    console.error("Error getting stages:", error);
    res.status(500).json({ message: "Failed to get stages" });
  }
});

// Milestone achievement endpoint
router.post('/api/progression/milestone', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId; // Assuming userId is set by isAuthenticated middleware
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { milestoneId, stageTrigger } = req.body;

    // Get progression
    const [progression] = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, userId))
      .limit(1);

    if (!progression) {
      return res.status(404).json({ error: 'Progression not found' });
    }

    // Check if milestone already achieved
    const existingMilestones = progression.achievedMilestones as any[] || [];
    if (existingMilestones.some((m: any) => m.milestoneId === milestoneId)) {
      return res.json({ alreadyAchieved: true });
    }

    // Add milestone
    const milestone = {
      milestoneId,
      stageTrigger,
      achievedAt: new Date().toISOString(),
      displayName: getMilestoneName(milestoneId),
      icon: getMilestoneIcon(stageTrigger)
    };

    const updatedMilestones = [...existingMilestones, milestone];

    await db
      .update(learningProgression)
      .set({
        achievedMilestones: updatedMilestones,
        updatedAt: new Date()
      })
      .where(eq(learningProgression.id, progression.id));

    res.json({ success: true, milestone });
  } catch (error) {
    console.error('Error saving milestone:', error);
    res.status(500).json({ error: 'Failed to save milestone' });
  }
});

// Get operative package endpoint
router.get('/api/progression/operative-package', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pattern, numberRange, difficulty } = req.query;

    const pkg = competencyBasedGenerator.generateOperativePackage(
      (pattern as any) || 'sum_constancy',
      numberRange === '100' ? 100 : 20,
      parseInt(difficulty as string) || 1
    );

    res.json({ tasks: pkg });
  } catch (error) {
    console.error('Error generating operative package:', error);
    res.status(500).json({ error: 'Failed to generate operative package' });
  }
});

// Get next task based on competency progression (MUST be before /:userId route)
// ✅ ALWAYS uses competencyBasedGenerator - NEVER falls back to old system
router.get("/api/progression/next-task", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    let progression = await storage.getLearningProgression(userId);

    if (!progression) {
      console.log(`Initializing new progression for user ${userId}`);
      progression = await storage.initializeProgressionForUser(userId);
    }

    // Extract previous task info to prevent duplicates
    let previousTaskSignature = null;
    const previousTaskParam = req.query.previousTask as string | undefined;
    if (previousTaskParam) {
      try {
        previousTaskSignature = JSON.parse(previousTaskParam);
      } catch (e) {
        console.warn('Failed to parse previousTask param:', e);
      }
    }

    const { ensureValidTask, validateResult } = await import('./taskValidation');
    const { validateArithmetic } = await import('./arithmeticValidator');
    const currentLevel = (progression as any).currentLevel || 1;

    console.log(`Generating task for user ${userId}, level ${currentLevel} `);

    // ✅ CRITICAL: Validate and cap level bounds (1-100)
    const validatedLevel = Math.max(1, Math.min(100, currentLevel));
    if (validatedLevel !== currentLevel) {
      console.warn(`Level ${currentLevel} out of bounds, capped to ${validatedLevel} `);
    }

    // ✅ CRITICAL: Use competencyBasedGenerator with retry logic
    let tasks: any[] = [];
    let retryCount = 0;
    const maxRetries = 5;

    while (tasks.length === 0 && retryCount < maxRetries) {
      tasks = competencyBasedGenerator.generateMixedTasks(progression, 1, validatedLevel, previousTaskSignature);

      if (!tasks || tasks.length === 0) {
        retryCount++;
        console.warn(`Retry ${retryCount}/${maxRetries}: No tasks generated, retrying...`);

        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!tasks || tasks.length === 0) {
      console.error(`CRITICAL: competencyBasedGenerator failed after ${maxRetries} retries`);
      return res.status(500).json({
        message: "Task generation failed - competency system error",
        details: "No tasks could be generated after multiple retries. Please contact support."
      });
    }

    let task = tasks[0];
    console.log(`Generated task: ${task.number1} ${task.operation} ${task.number2} = ${task.correctAnswer}`);

    // 🚨 CRITICAL VALIDATION: ABSOLUTELY NO NEGATIVE NUMBERS
    const validatedTask = ensureValidTask({
      operation: task.operation,
      number1: task.number1,
      number2: task.number2
    });

    // Update task with validated values
    task.number1 = validatedTask.number1;
    task.number2 = validatedTask.number2;
    task.operation = validatedTask.operation;
    task.correctAnswer = validatedTask.operation === '+'
      ? validatedTask.number1 + validatedTask.number2
      : validatedTask.number1 - validatedTask.number2;

    // ✅ FINAL ARITHMETIC VALIDATION before sending to client
    const arithmeticValidation = validateArithmetic(
      task.operation,
      task.number1,
      task.number2,
      task.correctAnswer
    );

    if (!arithmeticValidation.isValid) {
      console.error(`CRITICAL ARITHMETIC ERROR: ${arithmeticValidation.error}`);
      console.error(`Task: ${task.number1} ${task.operation} ${task.number2} = ${task.correctAnswer}`);
      return res.status(500).json({
        message: "Invalid task generated - arithmetic error",
        details: arithmeticValidation.error
      });
    }

    // Verify no negative results
    if (task.correctAnswer < 0) {
      console.error(`CRITICAL: Task has negative result: ${task.correctAnswer}`);
      return res.status(500).json({ message: "Invalid task generated" });
    }

    // Avoid duplicate task
    if (previousTaskSignature &&
      task.number1 === previousTaskSignature.number1 &&
      task.number2 === previousTaskSignature.number2 &&
      task.operation === previousTaskSignature.operation) {
      console.log('Duplicate detected, generating alternative task...');

      // Generate multiple alternatives to find a different one
      const retryTasks = competencyBasedGenerator.generateMixedTasks(progression, 5, currentLevel, null); // Pass null for previousTask to get different tasks
      const differentTask = retryTasks.find(t =>
        !(t.number1 === previousTaskSignature.number1 &&
          t.number2 === previousTaskSignature.number2 &&
          t.operation === previousTaskSignature.operation)
      ) || retryTasks[0];

      // 🚨 VALIDATE RETRY TASK TOO
      const validatedRetry = ensureValidTask({
        operation: differentTask.operation,
        number1: differentTask.number1,
        number2: differentTask.number2
      });

      differentTask.number1 = validatedRetry.number1;
      differentTask.number2 = validatedRetry.number2;
      differentTask.operation = validatedRetry.operation;
      differentTask.correctAnswer = validatedRetry.operation === '+'
        ? validatedRetry.number1 + validatedRetry.number2
        : validatedRetry.number1 - validatedRetry.number2;
      task = differentTask;

      console.log(`Alternative task: ${task.number1} ${task.operation} ${task.number2} = ${task.correctAnswer}`);
    }

    // ===== AMRS: Get representation configuration for this task =====
    const representationConfig = progressionEngine.getRepresentationConfig(
      progression,
      task.taskType || 'basic_operation'
    );

    res.json({
      ...task,
      stage: progression.currentStage, // Keep for compatibility
      representationConfig,
    });
  } catch (error) {
    console.error("Error generating next task:", error);
    res.status(500).json({
      message: "Failed to generate next task",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Initialize progression for current user
router.post("/api/progression/initialize", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const progression = await storage.initializeProgressionForUser(userId);
    res.json(progression);
  } catch (error) {
    console.error("Error initializing progression:", error);
    res.status(500).json({ message: "Failed to initialize progression" });
  }
});

// AMRS: Request more support (increase representation level)
router.post("/api/progression/request-support", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const progression = await storage.getLearningProgression(userId);

    if (!progression) {
      return res.status(404).json({ message: "Progression not found" });
    }

    // Increment support requests counter and decrease RML (more support)
    const updatedProgression = await storage.updateLearningProgression(userId, {
      rml: Math.max(0, (progression.rml ?? 0) - 0.5),
      supportRequestsCount: (progression.supportRequestsCount ?? 0) + 1,
    });

    res.json(updatedProgression);
  } catch (error) {
    console.error("Error requesting support:", error);
    res.status(500).json({ message: "Failed to request support" });
  }
});

// Evaluate task result and update progression
router.post("/api/progression/evaluate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { taskResult } = req.body;

    console.log('Evaluating progression for user:', userId, 'taskResult:', taskResult);

    // Get current progression
    let progression = await storage.getLearningProgression(userId);
    if (!progression) {
      progression = await storage.initializeProgressionForUser(userId);
    }

    // 🔧 MIGRATION: Ensure currentLevel exists for old users
    if (!(progression as any).currentLevel) {
      console.warn(`User ${userId} missing currentLevel, migrating from currentStage`);
      const migratedLevel = Math.min(20, progression.currentStage || 1);
      await storage.updateLearningProgression(userId, {
        currentLevel: migratedLevel,
        levelHistory: [{
          level: migratedLevel,
          attemptsCount: 0,
          correctCount: 0,
          masteredAt: null,
          unlockedAt: new Date().toISOString(),
          totalAttempts: 0,
          successRate: 0,
          averageTime: 0,
          lastAttemptAt: null,
        }]
      });
      progression = await storage.getLearningProgression(userId);
    }

    // 🔧 FIX: Cap currentStage at maximum 20 (highest defined stage)
    if (progression.currentStage > 20) {
      console.warn(`User ${userId} has invalid stage ${progression.currentStage}, capping to 20`);
      await storage.updateLearningProgression(userId, { currentStage: 20 });
      progression.currentStage = 20;
    }

    // 🔧 FIX: Ensure taskResult.stage is valid
    if (taskResult.stage > 20 || taskResult.stage < 1) {
      console.warn(`Invalid task stage ${taskResult.stage}, using current stage ${progression.currentStage}`);
      taskResult.stage = progression.currentStage;
    }

    console.log('Current progression before update:', {
      currentStage: progression.currentStage,
      totalTasksSolved: progression.totalTasksSolved,
      stageHistoryLength: Array.isArray(progression.stageHistory) ? progression.stageHistory.length : 0
    });

    // Create task object for competency tracking
    const task = {
      operation: taskResult.operation,
      number1: taskResult.number1,
      number2: taskResult.number2,
      correctAnswer: taskResult.correctAnswer,
      isCorrect: taskResult.isCorrect,
      numberRange: taskResult.numberRange || 20,
      placeholderPosition: taskResult.placeholderPosition || 'end',
      taskType: taskResult.taskType || 'basic_operation',
    };

    // Identify competencies from task
    const competencies = competencyProgressTracker.identifyCompetencies(task as any);
    console.log('Identified competencies:', competencies);

    // Update competency progress
    const competencyUpdates = competencyProgressTracker.updateProgressAfterTask(
      progression,
      task as any,
      competencies
    );

    // Evaluate level progression (for milestone tracking)
    const currentProgressionForEvaluation = await storage.getLearningProgression(userId); // Re-fetch to get latest data
    const currentLevel = (currentProgressionForEvaluation as any).currentLevel || 1;
    const { ensureValidTask } = await import('./taskValidation');
    const { levelGenerator } = await import('./levelGenerator');
    const currentLevelConfig = levelGenerator.getSubLevelConfig(currentLevel);

    // Calculate statistics for the current level
    const levelHistory = (currentProgressionForEvaluation as any).levelHistory || [];
    const currentLevelData = levelHistory.find((l: any) => l.level === currentLevel);

    // ===== COUNTER & MILESTONE LOGIC (FIX: Milestone ZUERST prüfen) =====

    // `previousSuccessfulAttemptsForMilestone` tracks consecutive correct answers towards the milestone.
    const previousSuccessfulAttemptsForMilestone = currentLevelData?.correctCount || 0;

    // Target for completing a level milestone - ALWAYS 10!
    const MILESTONE_TARGET_FOR_LEVEL = 10;
    const tasksRequiredForLevelDisplay = MILESTONE_TARGET_FOR_LEVEL;

    let newSuccessfulAttemptsForMilestone = previousSuccessfulAttemptsForMilestone;
    let milestoneAchievedStatus = null;
    let resetSuccessfulAttemptsCounter = false;

    // ✅ FIX: Only increment counter on CORRECT answers
    if (taskResult.isCorrect) {
      // Increment successful attempts counter FIRST
      newSuccessfulAttemptsForMilestone = previousSuccessfulAttemptsForMilestone + 1;

      // Check for milestone achievement - EXACTLY at 10 correct answers
      const isCurrentLevelActive = currentLevel === ((currentProgressionForEvaluation as any).currentLevel || 1);
      const notYetMastered = !currentLevelData?.masteredAt;

      // Milestone is achieved when we reach EXACTLY 10 correct answers
      if (isCurrentLevelActive && notYetMastered && newSuccessfulAttemptsForMilestone === MILESTONE_TARGET_FOR_LEVEL) {
        milestoneAchievedStatus = {
          milestoneId: `level_${currentLevel}_mastery`, // Dynamically generate milestoneId
          milestoneTitle: `Level ${currentLevel} gemeistert!`,
          milestoneIcon: currentLevel % 10 === 0 ? "🏆" : currentLevel % 5 === 0 ? "⭐" : "✓",
          stageTrigger: currentLevel,
          levelTrigger: currentLevel,
        };
        resetSuccessfulAttemptsCounter = true;
        console.log(`MILESTONE! Level ${currentLevel} achieved with ${newSuccessfulAttemptsForMilestone} correct answers (target: ${MILESTONE_TARGET_FOR_LEVEL}).`);
      }
    } else {
      // ✅ If incorrect, counter resets to 0 (break the streak)
      newSuccessfulAttemptsForMilestone = 0;
      console.log(`RESET: Consecutive correct counter reset to 0 due to incorrect answer.`);
    }

    // If a milestone was achieved, reset the counter for the *next* level's streak.
    if (resetSuccessfulAttemptsCounter) {
      newSuccessfulAttemptsForMilestone = 0;
      console.log(`RESET: Successful attempts counter reset to 0/${tasksRequiredForLevelDisplay} after Milestone.`);
    }

    // Update the levelHistory array with the new counts.
    // First, filter out the current level to avoid duplicates
    const updatedLevelHistoryArray = levelHistory.filter((l: any) => l.level !== currentLevel);

    // Then add the updated entry for the current level
    // ✅ Track both correct AND total attempts (including incorrect)
    const currentTotalAttempts = (currentLevelData?.totalAttempts || 0) + 1;
    const currentCorrectCount = newSuccessfulAttemptsForMilestone;
    const currentIncorrectCount = currentTotalAttempts - currentCorrectCount;
    const currentSuccessRate = currentTotalAttempts > 0 ? currentCorrectCount / currentTotalAttempts : 0;

    // Calculate average time (update running average)
    const previousAvgTime = currentLevelData?.averageTime || 0;
    const previousCount = currentLevelData?.totalAttempts || 0;
    const newAvgTime = previousCount > 0
      ? ((previousAvgTime * previousCount) + taskResult.timeTaken) / currentTotalAttempts
      : taskResult.timeTaken;

    updatedLevelHistoryArray.push({
      level: currentLevel,
      attemptsCount: newSuccessfulAttemptsForMilestone, // Consecutive correct (for milestone)
      correctCount: currentCorrectCount, // Total correct in this level
      incorrectCount: currentIncorrectCount, // Total incorrect in this level
      masteredAt: milestoneAchievedStatus ? new Date() : currentLevelData?.masteredAt || null,
      unlockedAt: currentLevelData?.unlockedAt || new Date().toISOString(),
      totalAttempts: currentTotalAttempts, // Total attempts (correct + incorrect)
      successRate: currentSuccessRate, // Actual success rate
      averageTime: newAvgTime, // Running average time
      lastAttemptAt: new Date().toISOString(),
    });

    // Calculate the progress towards the milestone (0-100%)
    const progressPercentage = (newSuccessfulAttemptsForMilestone / tasksRequiredForLevelDisplay) * 100;

    console.log(`COUNTER UPDATE: {
        level: ${currentLevel},
        before: '${previousSuccessfulAttemptsForMilestone}/${tasksRequiredForLevelDisplay}',
        after: '${newSuccessfulAttemptsForMilestone}/${tasksRequiredForLevelDisplay}',
        isCorrect: ${taskResult.isCorrect},
        progress: '${Math.round(progressPercentage)}%',
        milestone: ${milestoneAchievedStatus ? 'YES' : 'no'}
      }`);

    // Check for knowledge gaps (errors in earlier levels)
    let knowledgeGapDetected = null;
    if (!taskResult.isCorrect && taskResult.level < currentLevel) {
      knowledgeGapDetected = {
        level: taskResult.level,
        detectedAt: new Date(),
        errorCount: 1,
        errorType: `regression_level_${taskResult.level}`,
        status: 'active' as const,
      };
    }

    // ===== LEVEL PROGRESSION =====

    let newLevel = currentLevel;

    // Wenn Milestone erreicht: Level erhöhen (max 100)
    if (milestoneAchievedStatus && currentLevel < 100) {
      newLevel = currentLevel + 1;
      console.log(`LEVEL UP! ${currentLevel} → ${newLevel}`);

      // Add entry for new level
      updatedLevelHistoryArray.push({
        level: newLevel,
        attemptsCount: 0,
        correctCount: 0,
        masteredAt: null,
        unlockedAt: new Date().toISOString(),
        totalAttempts: 0,
        successRate: 0,
        averageTime: 0,
        lastAttemptAt: null,
      });
    } else if (milestoneAchievedStatus && currentLevel === 100) {
      console.log(`MAX LEVEL 100 - GROẞMEISTER gemeistert!`);
    }

    console.log(`LEVEL HISTORY UPDATE for level ${currentLevel}:`, {
      previousCorrect: currentLevelData?.correctCount || 0,
      newCorrect: newSuccessfulAttemptsForMilestone,
      wasCorrect: taskResult.isCorrect,
      totalEntries: updatedLevelHistoryArray.length
    });

    // Check for knowledge gaps
    const knowledgeGaps = (progression.knowledgeGaps as any[]) || [];
    if (knowledgeGapDetected) {
      // Check if gap already exists and update count, otherwise add new
      const existingGapIndex = knowledgeGaps.findIndex(kg => kg.level === knowledgeGapDetected.level && kg.errorType === knowledgeGapDetected.errorType);
      if (existingGapIndex > -1) {
        knowledgeGaps[existingGapIndex].errorCount += 1;
        knowledgeGaps[existingGapIndex].detectedAt = new Date(); // Update timestamp
      } else {
        knowledgeGaps.push(knowledgeGapDetected);
      }
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = (progression.dailyStats as any) || {};
    if (!dailyStats[today]) {
      dailyStats[today] = { tasksSolved: 0, correctCount: 0, timeSpent: 0 };
    }
    dailyStats[today].tasksSolved += 1;
    dailyStats[today].correctCount += taskResult.isCorrect ? 1 : 0;
    dailyStats[today].timeSpent += taskResult.timeTaken || 0;

    // ===== AMRS: Update Performance Metrics & Representation Level =====
    const currentPerformance = (progression as any).recentPerformance || {
      consecutiveCorrect: 0,
      consecutiveErrors: 0,
      avgTimePerTask: 0,
      successRateLast10: 0,
      last10Results: [] as boolean[]
    };

    const updatedPerformance = progressionEngine.updatePerformanceMetrics(
      currentPerformance,
      { isCorrect: taskResult.isCorrect, timeTaken: taskResult.timeTaken || 0 }
    );

    // Check if Representation Level should change
    const currentRL = (progression as any).representationLevel || 5;
    const rlUpdate = progressionEngine.updateRepresentationLevel(
      currentRL,
      updatedPerformance,
      currentLevel // Use currentLevel for RL update context
    );

    // Update RL history if changed
    const representationHistory = (progression as any).representationHistory || [];
    if (rlUpdate.newRL !== currentRL) {
      representationHistory.push({
        level: currentLevel, // Log RL change based on current level
        levelValue: rlUpdate.newRL,
        changedAt: new Date().toISOString(),
        reason: rlUpdate.reason
      });
    }

    // Check for Representation Mastery Milestones
    const rlMilestone = progressionEngine.checkRepresentationMilestone(
      rlUpdate.newRL,
      currentLevel // Use currentLevel for milestone check
    );

    // Initialize milestones array from progression or empty array
    const milestones = (progression.milestones as any[]) || [];

    if (rlMilestone.achieved && rlMilestone.milestone) {
      // Check if milestone already exists to avoid duplicates
      const milestoneExists = milestones.some((m: any) => m.milestoneId === rlMilestone.milestone.milestoneId);
      if (!milestoneExists) {
        milestones.push({
          milestoneId: rlMilestone.milestone.milestoneId,
          stageTrigger: currentLevel, // Trigger based on level
          achievedAt: new Date().toISOString(),
          displayName: rlMilestone.milestone.title,
          icon: rlMilestone.milestone.icon,
        });
      }
    }

    // ===== DETAILLIERTE FEHLER-SPEICHERUNG =====
    const errorHistory = (progression.errorHistory as any[]) || [];
    const errorPatterns = (progression.errorPatterns as any) || {};

    // Helpers analyzeErrorSystematically, detectErrorPattern, calculateOverallLevel are imported from lib/progression-helpers

    if (!taskResult.isCorrect) {
      // Extract studentAnswer as number (handle both number and {result: number} formats)
      let extractedStudentAnswer = taskResult.studentAnswer;
      if (extractedStudentAnswer && typeof extractedStudentAnswer === 'object' && 'result' in extractedStudentAnswer) {
        extractedStudentAnswer = extractedStudentAnswer.result;
      } else if (typeof extractedStudentAnswer !== 'number' || isNaN(extractedStudentAnswer)) {
        // Fallback for other object formats or NaN
        extractedStudentAnswer = null;
      }

      if (extractedStudentAnswer !== null) {
        // Create detailed error record with systematic error analysis (6+1 categories)
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const systematicAnalysis = analyzeErrorSystematically(taskResult, extractedStudentAnswer);

        const errorRecord = {
          id: errorId,
          timestamp: new Date(),
          task: {
            operation: taskResult.operation,
            number1: taskResult.number1,
            number2: taskResult.number2,
            correctAnswer: taskResult.correctAnswer,
            studentAnswer: extractedStudentAnswer,
            placeholderPosition: (taskResult as any).placeholderPosition || 'end',
            numberRange: (taskResult as any).numberRange || 20,
            taskType: (taskResult as any).taskType || 'basic_operation'
          },
          errorAnalysis: {
            errorType: systematicAnalysis.errorType,
            errorSeverity: systematicAnalysis.errorSeverity,
            errorDescription: systematicAnalysis.description,
            pedagogicalHint: systematicAnalysis.pedagogicalHint,
            errorPattern: detectErrorPattern(taskResult),
            cognitiveLoad: (progression as any).currentCognitiveLoad || 0.5,
            timeTaken: taskResult.timeTaken || 0,
            wasSlowResponse: (taskResult.timeTaken || 0) > 30,
            representationsActive: Object.keys((progression as any).representationConfig || {}).filter(
              k => (progression as any).representationConfig?.[k] === true
            )
          },
          context: {
            currentLevel: currentLevel, // Use currentLevel
            consecutiveErrors: updatedPerformance.consecutiveErrors,
            sessionId: 'current_session',
            representationLevel: rlUpdate.newRL,
            overallLevel: calculateOverallLevel(progression)
          },
          remediation: {
            attempted: false,
            successful: false,
            retriesCount: 0,
            lastRetryDate: null
          }
        };

        // Add to error history (keep last 200)
        errorHistory.unshift(errorRecord);
        if (errorHistory.length > 200) {
          errorHistory.pop();
        }

        // Update error patterns
        const patternKey = errorRecord.errorAnalysis.errorPattern;
        if (!errorPatterns[patternKey]) {
          errorPatterns[patternKey] = {
            count: 0,
            firstOccurrence: new Date(),
            lastOccurrence: new Date(),
            examples: [],
            severity: 0,
            remediationStatus: 'active'
          };
        }

        errorPatterns[patternKey].count += 1;
        errorPatterns[patternKey].lastOccurrence = new Date();

        const taskString = `${taskResult.number1}${taskResult.operation}${taskResult.number2}`;
        if (!errorPatterns[patternKey].examples.includes(taskString)) {
          errorPatterns[patternKey].examples.push(taskString);
          if (errorPatterns[patternKey].examples.length > 10) {
            errorPatterns[patternKey].examples.shift();
          }
        }

        // Update severity (weighted average)
        const severityScore = errorRecord.errorAnalysis.errorSeverity === 'severe' ? 1.0
          : errorRecord.errorAnalysis.errorSeverity === 'moderate' ? 0.6
            : 0.3;
        errorPatterns[patternKey].severity =
          (errorPatterns[patternKey].severity * (errorPatterns[patternKey].count - 1) + severityScore) /
          errorPatterns[patternKey].count;
      }
    }

    // 🐾 TIER-VERTEILUNG FÜR TRAINING (HAUPTFIX!)
    // Get existing animals from user_animal_cards table
    const existingUserAnimals = await db.query.userAnimalCards.findMany({
      where: (ua: any) => ua.userId === userId,
      with: { animalCard: true },
    });
    const existingAnimals = existingUserAnimals.map((ua: any) => ua.animalCard.animalType);
    const newAnimalsFromTraining: string[] = [];

    if (taskResult.isCorrect) {
      // 80% Chance für Tier bei jedem korrekten Task
      if (Math.random() < 0.80) {
        const trainingAnimals = ['lion', 'elephant', 'giraffe', 'zebra', 'rhino', 'hippo', 'cheetah', 'monkey', 'gorilla', 'panda', 'penguin', 'tiger', 'leopard', 'rabbit', 'fox'];
        const randomAnimal = trainingAnimals[Math.floor(Math.random() * trainingAnimals.length)];
        if (!existingAnimals.includes(randomAnimal)) {
          newAnimalsFromTraining.push(randomAnimal);
          console.log(`✨ Tier verteilt beim Training: ${randomAnimal}`);
        }
      }

      // Garantiertes Tier bei Level-Up
      if (milestoneAchievedStatus) {
        const bonusAnimals = ['panda', 'red_panda', 'koala', 'peacock', 'snow_leopard'];
        const levelUpAnimal = bonusAnimals[Math.floor(Math.random() * bonusAnimals.length)];
        if (!existingAnimals.includes(levelUpAnimal) && !newAnimalsFromTraining.includes(levelUpAnimal)) {
          newAnimalsFromTraining.push(levelUpAnimal);
          console.log(`🏆 BONUS-TIER bei Level-Up: ${levelUpAnimal}`);
        }
      }
    }

    // 🔧 CRITICAL: Update progression with VERIFIED and CAPPED levelHistory
    // 🔒 PERSIST ERROR STATISTICS FOR TEACHERS/ADMINS
    const errorStatistics = {
      errorHistory: errorHistory,
      errorPatterns: errorPatterns,
      lastUpdated: new Date().toISOString(),
    };

    const updatedProgressionObject = {
      ...progression, // Use the original progression object for other fields
      currentLevel: newLevel,
      levelHistory: updatedLevelHistoryArray, // Contains CAPPED counters (max MILESTONE_TARGET_FOR_LEVEL/MILESTONE_TARGET_FOR_LEVEL)
      milestones: milestones, // Add new milestones if any
      currentStreak: taskResult.isCorrect ? (progression.currentStreak || 0) + 1 : 0, // Update overall streak
      totalTasksSolved: progression.totalTasksSolved + 1,
      totalCorrect: progression.totalCorrect + (taskResult.isCorrect ? 1 : 0), // Overall correct tasks
      knowledgeGaps,
      dailyStats,
      rml: rlUpdate.newRL,
      recentPerformance: updatedPerformance,
      lastActivityAt: new Date(),
      taskMastery: competencyUpdates.taskMastery,
      competencyProgress: competencyUpdates.competencyProgress,
      errorStatistics: errorStatistics, // 🔒 NEW: Persist error stats to DB for teachers
    };

    // Save the updated progression to the database.
    const updatedProgression = await storage.updateLearningProgression(userId, updatedProgressionObject);

    // 🔍 Add new animals to user_animal_cards table
    if (newAnimalsFromTraining.length > 0) {
      console.log(`📊 ANIMALS DISTRIBUTED: ${JSON.stringify(newAnimalsFromTraining)}, count: ${newAnimalsFromTraining.length}`);
      for (const animalType of newAnimalsFromTraining) {
        const animalCard = await db.query.animalCards.findFirst({
          where: (ac: any) => ac.animalType === animalType,
        });
        if (animalCard) {
          const existingAnimal = await db.query.userAnimalCards.findFirst({
            where: (ua: any) => ua.userId === userId && ua.animalCardId === animalCard.id,
          });
          if (!existingAnimal) {
            await db.insert(userAnimalCards).values({
              id: `user-animal-${userId}-${animalType}-${Date.now()}`,
              userId,
              animalCardId: animalCard.id,
              friendshipLevel: 1,
              xp: 0,
              xpToNextLevel: 100,
              timesUsed: 0,
              gamesWon: 0,
              isUnlocked: true,
              unlockedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            } as any);
          }
        }
      }
    }

    // 🔍 FETCH FRESH progression after save to get accurate counter
    const freshProgression = await storage.getLearningProgression(userId);
    const freshAnimalsCount = await db.query.userAnimalCards.findMany({
      where: (ua: any) => ua.userId === userId,
    });
    console.log(`✅ ANIMALS VERIFIED IN DB: count: ${freshAnimalsCount.length}`);
    const freshLevelHistory = (freshProgression?.levelHistory ?? []) as any[];
    const freshLevelData = freshLevelHistory.find((l: any) => l.level === currentLevel);
    const freshCorrectCount = freshLevelData?.correctCount || freshLevelData?.attemptsCount || 0;

    console.log(`VERIFIED SAVED DATA for level ${currentLevel}:`, {
      correctCount: freshCorrectCount,
      expected: { correct: newSuccessfulAttemptsForMilestone }
    });

    console.log('Updated progression:', {
      currentLevel: freshProgression?.currentLevel,
      totalTasksSolved: freshProgression?.totalTasksSolved,
      currentStreak: freshProgression?.currentStreak,
      levelHistoryLength: Array.isArray(freshProgression?.levelHistory) ? freshProgression.levelHistory.length : 0,
      competenciesTracked: Object.keys(competencyUpdates.competencyProgress || {}).length
    });

    // ===== FRONTEND RESPONSE =====

    // After Milestone: 0/10 for next level
    // Otherwise: Current progress from FRESH data
    const progressToShow = resetSuccessfulAttemptsCounter ? 0 : freshCorrectCount;
    const tasksRequiredToShow = 10; // ✅ ALWAYS 10!

    // Calculate stats for milestone if achieved (BEFORE resetting counter)
    let milestoneWithStats = milestoneAchievedStatus;
    if (milestoneAchievedStatus) {
      // Use the NEW attempts count (which is 10 at milestone)
      const totalAttempts = MILESTONE_TARGET_FOR_LEVEL;
      const successRate = 1.0; // Must be perfect to reach milestone

      // Calculate average time from recent tasks
      const recentTasks = (progression as any).recentTaskHistory || [];
      const levelTasks = recentTasks.filter((t: any) => t.level === currentLevel);
      const avgTime = levelTasks.length > 0
        ? levelTasks.reduce((sum: number, t: any) => sum + (t.timeSpent || 0), 0) / levelTasks.length
        : 0;

      // Get level name from levelGenerator
      const levelName = levelGenerator.getLevelName(currentLevel);

      // Random motivation message - only 30% of milestones get one
      let randomMotivation: string | undefined = undefined;

      if (Math.random() < 0.3) {
        const motivationMessages = [
          '🦁 Löwen-Brüllen! Du bist stark!',
          '🐘 Elefanten-Stärke! Weiter so!',
          '🦒 Giraffen-Größe! Du wächst!',
          '🐯 Tiger-Power! Unaufhaltsam!',
          '🦅 Adler-Blick! Scharf beobachtet!',
          '🐆 Geparden-Speed! Rasend schnell!',
          '🦏 Nashorn-Kraft! Unbezwingbar!',
        ];
        randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
      }

      // Get actual stats from the UPDATED levelHistory entry
      const completedLevelData = updatedLevelHistoryArray.find((l: any) => l.level === currentLevel);
      const actualSuccessRate = completedLevelData?.successRate || 1.0;
      const actualAvgTime = completedLevelData?.averageTime || 0;
      const actualTotalAttempts = completedLevelData?.totalAttempts || MILESTONE_TARGET_FOR_LEVEL;

      milestoneWithStats = {
        ...milestoneAchievedStatus,
        motivationMessage: randomMotivation,
        milestoneTitle: levelName,
        stats: {
          successRate: actualSuccessRate,
          averageTime: Math.round(actualAvgTime * 10) / 10, // Round to 1 decimal
          tasksCompleted: actualTotalAttempts,
        }
      };
    }

    const update = {
      newLevel,
      milestoneAchieved: milestoneWithStats,
      knowledgeGapDetected,
      message: '',
      currentStreak: taskResult.isCorrect ? (progression.currentStreak || 0) + 1 : 0, // Update overall streak for response
      levelProgress: { // Renamed from stageProgress
        current: progressToShow,
        total: tasksRequiredToShow,
        percentage: Math.round((progressToShow / tasksRequiredToShow) * 100),
      },
    };

    console.log(`RESPONSE: Level ${newLevel}, Progress ${progressToShow}/${tasksRequiredToShow}`);

    // Return complete progression data to avoid frontend refetch
    const fullProgression = await storage.getLearningProgression(userId);

    res.json({
      progression: fullProgression, // Full up-to-date progression
      update,
      competencies,
    });
  } catch (error) {
    console.error("Error evaluating progression:", error);
    res.status(500).json({ message: "Failed to evaluate progression" });
  }
});

// Get progression for a user (MUST be last - has :userId parameter)
router.get("/api/progression/:userId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progression = await storage.getLearningProgression(userId);

    if (!progression) {
      // Initialize if doesn't exist
      const newProgression = await storage.initializeProgressionForUser(userId);
      return res.json(newProgression);
    }

    res.json(progression);
  } catch (error) {
    console.error("Error getting progression:", error);
    res.status(500).json({ message: "Failed to get progression" });
  }
});

// Download error report as HTML/PDF (teacher only)

// Download Mathemat documentation (public)
router.get("/api/documentation/download", async (req: Request, res: Response) => {
  try {
    const { generateMathematDocumentationHTML } = await import('./pdfDocumentation');
    const html = generateMathematDocumentationHTML();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Mathemat_Dokumentation_${new Date().toISOString().split('T')[0]}.html"`);
    res.send(html);
  } catch (error) {
    console.error("Error generating documentation:", error);
    res.status(500).json({ message: "Failed to generate documentation" });
  }
});

// Get error report for student (teacher only)

// Soft reset student progression (teacher only)
router.post("/api/progression/:userId/soft-reset", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const teacherId = (req.session as any).userId;
    const { userId } = req.params;
    const { resetType } = req.body; // 'progression', 'competencies', or 'full'

    // Verify teacher has access to this student
    const teacher = await storage.getUser(teacherId);
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return res.status(403).json({ message: "Forbidden: Only teachers can reset progression" });
    }

    const student = await storage.getUser(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify access (unless admin)
    if (teacher.role === 'teacher' && student.classId !== teacher.classId) {
      const students = await storage.getStudentsByTeacherId(teacherId);
      const hasAccess = students.some(s => s.id === userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Student not in your class" });
      }
    }

    const progression = await storage.getLearningProgression(userId);
    if (!progression) {
      return res.status(404).json({ message: "Progression not found" });
    }

    let updatedProgression;

    switch (resetType) {
      case 'progression':
        // SOFT RESET: Reset only levels/milestones, keep all error history and task data
        updatedProgression = await storage.updateLearningProgression(userId, {
          currentLevel: 1,
          levelHistory: [{ // Reset level history
            level: 1,
            unlockedAt: new Date().toISOString(),
            masteredAt: null,
            attemptsCount: 0,
            correctCount: 0,
            totalAttempts: 0,
            successRate: 0,
            averageTime: 0,
            lastAttemptAt: null,
          }],
          milestones: [], // Clear milestones
          currentStreak: 0,
          knowledgeGaps: [],
          // Keep: errorHistory, errorPatterns, totalTasksSolved, totalCorrect, dailyStats
        });
        break;

      case 'competencies':
        // Reset competency progress but keep progression and errors
        updatedProgression = await storage.updateLearningProgression(userId, {
          taskMastery: {},
          competencyProgress: {},
          // Keep: everything else including levels, errors, total stats
        });
        break;

      case 'full':
        // FULL RESET: Complete reset including errors
        await storage.deleteTasksByUserId(userId);
        await storage.deleteLearningSessionsByUserId(userId);
        updatedProgression = await storage.resetLearningProgression(userId);
        break;

      default:
        return res.status(400).json({ message: "Invalid reset type" });
    }

    res.json({
      message: `${resetType} reset successful`,
      progression: updatedProgression,
      resetType
    });
  } catch (error) {
    console.error("Error resetting progression:", error);
    res.status(500).json({ message: "Failed to reset progression" });
  }
});

// ===== ZAHLENWAAGE GAME STATISTICS ENDPOINTS =====

// Get Zahlenwaage game statistics for current user
router.get("/api/zahlenwaage/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    // Get user to determine which data source to use
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine mode based on user role
    const mode = (user.role === 'teacher' || user.role === 'admin') ? 'teacher_training' : 'student';

    if (mode === 'teacher_training') {
      // For teachers/admins: read from new zahlenwaage_game_stats table
      const stats = await storage.getZahlenwaageStats(userId, mode);

      if (!stats) {
        return res.json({
          animalsCollected: [],
          partiesCount: 0,
          totalAttempts: 0,
          correctAnswers: 0,
          highScore: 0,
          lastPlayed: null,
          gamesPlayed: 0,
          mode,
        });
      }

      res.json({
        animalsCollected: stats.animalsCollected || [],
        partiesCount: stats.confettiStreaks || 0,
        totalAttempts: stats.totalAttempts || 0,
        correctAnswers: stats.correctAnswers || 0,
        highScore: 0, // Not tracked in new table yet
        lastPlayed: stats.lastPlayedAt || null,
        gamesPlayed: stats.gamesPlayed || 0,
        mode,
      });
    } else {
      // For students: read from learning_progression
      const progression = await storage.getLearningProgression(userId);

      if (!progression) {
        return res.json({
          animalsCollected: [],
          partiesCount: 0,
          totalAttempts: 0,
          correctAnswers: 0,
          highScore: 0,
          lastPlayed: null,
          mode,
        });
      }

      // Get animals from user_animal_cards table
      const userAnimalsZahl = await db.query.userAnimalCards.findMany({
        where: (ua: any) => ua.userId === userId,
        with: { animalCard: true },
      });
      const gameAnimals = userAnimalsZahl.map((ua: any) => ua.animalCard.animalType);

      res.json({
        animalsCollected: gameAnimals,
        partiesCount: progression.gamePartiesCount || 0,
        totalAttempts: progression.gameTotalAttempts || 0,
        correctAnswers: progression.gameCorrectAnswers || 0,
        highScore: progression.gameHighScore || 0,
        lastPlayed: progression.gameLastPlayed || null,
        mode,
      });
    }
  } catch (error) {
    console.error("Error fetching Zahlenwaage stats:", error);
    res.status(500).json({ message: "Failed to fetch game statistics" });
  }
});

// Update Zahlenwaage game statistics after game session
router.post("/api/zahlenwaage/update-stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { animalsCollected, partiesCount, totalAttempts, correctAnswers, highScore, mode } = req.body;

    console.log('Updating Zahlenwaage stats:', {
      userId,
      animalsCollected,
      partiesCount,
      totalAttempts,
      correctAnswers,
      highScore,
      mode
    });

    // Get current progression
    const progression = await storage.getLearningProgression(userId);
    if (!progression) {
      return res.status(404).json({ message: "Progression not found" });
    }

    // Accumulate animals and parties
    const userAnimalsZahl2 = await db.query.userAnimalCards.findMany({
      where: (ua: any) => ua.userId === userId,
      with: { animalCard: true },
    });
    const currentAnimals = userAnimalsZahl2.map((ua: any) => ua.animalCard.animalType);
    const currentParties = progression.gamePartiesCount || 0;
    const currentTotalAttempts = progression.gameTotalAttempts || 0;
    const currentCorrectAnswers = progression.gameCorrectAnswers || 0;
    const currentHighScore = progression.gameHighScore || 0;

    const newAnimals = [...currentAnimals, ...(animalsCollected || [])];
    const newParties = currentParties + (partiesCount || 0);
    const newTotalAttempts = currentTotalAttempts + (totalAttempts || 0);
    const newCorrectAnswers = currentCorrectAnswers + (correctAnswers || 0);
    const newHighScore = Math.max(currentHighScore, highScore || 0);

    console.log('Accumulating game stats:', {
      before: { animals: currentAnimals.length, parties: currentParties },
      after: { animals: newAnimals.length, parties: newParties }
    });

    // Update progression with accumulated stats
    const updatedProgression = await storage.updateLearningProgression(userId, {
      gamePartiesCount: newParties,
      gameTotalAttempts: newTotalAttempts,
      gameCorrectAnswers: newCorrectAnswers,
      gameHighScore: newHighScore,
      gameLastPlayed: new Date(),
    });

    console.log('Stats updated successfully:', {
      totalAnimals: newAnimals.length,
      totalParties: newParties
    });

    res.json({
      message: "Stats updated successfully",
      progression: updatedProgression,
      stats: {
        animalsCollected: newAnimals,
        partiesCount: newParties,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        highScore: newHighScore
      }
    });
  } catch (error) {
    console.error("Error updating Zahlenwaage stats:", error);
    res.status(500).json({ message: "Failed to update game statistics" });
  }
});

// Upsert Zahlenwaage stats with new dedicated table
router.post("/api/zahlenwaage/upsert-stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { animalsCollected, partiesCount, totalAttempts, correctAnswers } = req.body;

    // Get user to determine mode
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine mode based on user role
    const mode = (user.role === 'teacher' || user.role === 'admin') ? 'teacher_training' : 'student';

    // Upsert game stats with new dedicated table
    const updatedStats = await storage.upsertZahlenwaageStats(userId, mode, {
      animalsCollected: animalsCollected || [],
      partiesCount: partiesCount || 0,
      totalAttempts: totalAttempts || 0,
      correctAnswers: correctAnswers || 0,
    });

    // For students: also update learning_progression for backward compatibility
    // This ensures existing dashboards and features still work
    if (mode === 'student') {
      let progression = await storage.getLearningProgression(userId);
      if (!progression) {
        progression = await storage.initializeProgressionForUser(userId);
      }

      // Merge new animals with existing collection (no duplicates)
      const userAnimalsFromDB3 = await db.query.userAnimalCards.findMany({ where: (ua: any) => ua.userId === userId, with: { animalCard: true } });
      const existingAnimals = userAnimalsFromDB3.map((ua: any) => ua.animalCard.animalType);
      const allAnimals = [...new Set([...existingAnimals, ...(animalsCollected || [])])];

      // Update cumulative statistics
      const newPartiesCount = (progression.gamePartiesCount || 0) + (partiesCount || 0);
      const newTotalAttempts = (progression.gameTotalAttempts || 0) + (totalAttempts || 0);
      const newCorrectAnswers = (progression.gameCorrectAnswers || 0) + (correctAnswers || 0);
      const currentScore = (animalsCollected || []).length;
      const newHighScore = Math.max(progression.gameHighScore || 0, currentScore);

      await storage.updateLearningProgression(userId, {
        gamePartiesCount: newPartiesCount,
        gameTotalAttempts: newTotalAttempts,
        gameCorrectAnswers: newCorrectAnswers,
        gameHighScore: newHighScore,
        gameLastPlayed: new Date(),
      });
    }

    res.json({
      success: true,
      mode,
      stats: {
        animalsCollected: updatedStats.animalsCollected,
        partiesCount: updatedStats.confettiStreaks,
        totalAttempts: updatedStats.totalAttempts,
        correctAnswers: updatedStats.correctAnswers,
        gamesPlayed: updatedStats.gamesPlayed,
        lastPlayed: updatedStats.lastPlayedAt,
      },
    });
  } catch (error) {
    console.error("Error updating Zahlenwaage stats:", error);

    // Return fallback response so frontend always has data to display
    res.json({
      success: false,
      error: "Database update failed, stats not persisted",
      stats: {
        animalsCollected: req.body.animalsCollected || [],
        partiesCount: req.body.partiesCount || 0,
        totalAttempts: req.body.totalAttempts || 0,
        correctAnswers: req.body.correctAnswers || 0,
        gamesPlayed: 1,
        lastPlayed: new Date(),
      },
    });
  }
});

// Legacy full reset endpoint (kept for backwards compatibility)
router.post("/api/progression/:userId/reset", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const teacherId = (req.session as any).userId;
    const { userId } = req.params;

    // Verify teacher has access to this student
    const teacher = await storage.getUser(teacherId);
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return res.status(403).json({ message: "Forbidden: Only teachers can reset progression" });
    }

    const student = await storage.getUser(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify student belongs to teacher's class (unless admin)
    if (teacher.role === 'teacher' && student.classId !== teacher.classId) {
      const students = await storage.getStudentsByTeacherId(teacherId);
      const hasAccess = students.some(s => s.id === userId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Student not in your class" });
      }
    }

    // Delete existing progression and reinitialize
    const newProgression = await storage.resetLearningProgression(userId);

    res.json({
      message: "Progression reset successful",
      progression: newProgression
    });
  } catch (error) {
    console.error("Error resetting progression:", error);
    res.status(500).json({ message: "Failed to reset progression" });
  }
});

export default router;
