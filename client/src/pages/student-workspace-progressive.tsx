import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MathLab } from "@/components/math/MathLab";
import { Progress } from "@/components/ui/progress";
import { LogOut, ArrowRight, Award, Waves, Trophy, Brain, Layers, Target, Sparkles, Zap, Play, Timer, TestTube, Gamepad2, Lightbulb, BookOpen, Home, Settings, ShoppingCart, BarChart3, Globe, Crown } from "lucide-react";
import { ProgressionVisualizer } from "@/components/progression/ProgressionVisualizer";
import { MilestoneCelebration } from "@/components/progression/MilestoneCelebration";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TrainingModeSelector, { TrainingMode, RepresentationConfig } from "@/components/TrainingModeSelector";
import { AdaptiveMathLab } from "@/components/math/AdaptiveMathLab";
import ZahlenwaageGame from "./zahlenwaage-game";
import babyParrot from '@assets/generated_images/Baby_parrot_portrait_b87fb07d.png';
import babyMonkey from '@assets/generated_images/Baby_monkey_portrait_b80acbd1.png';
import { AppNavigation } from "@/components/ui/app-navigation";
import { Switch } from "@/components/ui/switch";
import { calculateActiveBonuses, ANIMAL_NAMES, ANIMAL_EMOJIS } from "@/lib/zoo-game-system";
import { BABY_ANIMAL_IMAGES, ADULT_ANIMAL_IMAGES, getAnimalImage, UI_ICONS } from '@/lib/animal-images';
import { WelcomeBackModal } from "@/components/WelcomeBackModal";
import type { OfflineRewardsSummary } from "@/lib/zoo-economy-engine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ZooProfile } from "@/lib/zoo-game-system";


interface AMRSRepresentationConfig {
  positions: {
    center?: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  level: number;
  message: string;
}

interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  correctAnswer: number;
  stage: number; // This will be replaced by level
  taskType: string;
  representationConfig?: AMRSRepresentationConfig; // AMRS data
  numberRange?: number;
  placeholderInSymbolic?: 'number1' | 'operator' | 'number2' | 'result' | 'none';
}

interface ProgressionData {
  id: string;
  userId: string;
  currentStage: number; // This will be replaced by currentLevel
  stageHistory: any[]; // This will be replaced by levelHistory
  milestones: any[];
  currentStreak: number;
  totalTasksSolved: number;
  totalCorrect: number;
  knowledgeGaps: any[];
  // AMRS fields
  representationLevel?: number;
  representationHistory?: any[];
  recentPerformance?: number[];
  preferredRepresentations?: Record<string, number>;
  supportRequestsCount?: number;
  consecutiveCorrectWithRL?: number;
  // Level progress fields - REQUIRED
  currentLevel: number; // Changed from optional to required
  levelHistory: any[]; // Changed from optional to required
  // Zahlenwaage game statistics
  gameAnimalsCollected?: string[];
  zoo_animals?: any[]; // Support legacy animal system
  gamePartiesCount?: number;
  gameCorrectAnswers?: number;
  gameHighScore?: number;
  experience?: number; // Added experience field
}

// Placeholder for currentSession, assuming it's there elsewhere or will be fetched.
// For this example, we'll use a dummy structure to satisfy the template.
const currentSession = {
  correctAnswers: 3 // Example value
};

// Define STAGE_NAMES if it's used in the template and not defined elsewhere
const STAGE_NAMES: { [key: number]: string } = {
  1: "Erste Schritte",
  2: "Zahlenraum bis 10",
  3: "Zahlenraum bis 20",
  4: "Addieren und Subtrahieren",
  5: "Einmaleins",
  // ... add other stage names as needed
};

export default function StudentWorkspaceProgressive() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { elapsedTime, startTimer, stopTimer, resetTimer } = useTaskTimer();

  // Read URL parameters for training mode
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');

  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL LOGIC
  // Track shown milestones in ref
  const shownMilestones = useRef<Set<string>>(new Set());

  // State management - ALL useState hooks before useQuery/useMutation
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [trainingMode, setTrainingMode] = useState<TrainingMode | null>(null);
  const [representationConfig, setRepresentationConfig] = useState<RepresentationConfig | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskState, setTaskState] = useState<'solving' | 'waiting'>('solving');
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneData, setMilestoneData] = useState<any>(null);
  const [tasksCompletedInSession, setTasksCompletedInSession] = useState(0);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [tasksRequired, setTasksRequired] = useState(10);
  const [showGameTrigger, setShowGameTrigger] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStats, setGameStats] = useState<{ animalsCollected: string[], parties: number } | null>(null);
  const [showSurpriseAnimal, setShowSurpriseAnimal] = useState(false);
  const [surpriseAnimal, setSurpriseAnimal] = useState('');
  const [showSettings, setShowSettings] = useState(false); // State for settings toggle
  const [offlineRewards, setOfflineRewards] = useState<OfflineRewardsSummary | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [activeTab, setActiveTab] = useState("training");
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [errorData, setErrorData] = useState<any>(null);


  // AUTO ENTER KEY HANDLER - Dismiss error screen when ENTER is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showErrorScreen && e.key === 'Enter') {
        e.preventDefault();
        console.log('⌨️ ENTER pressed - dismissing error screen and loading next task');
        setShowErrorScreen(false);
        setErrorData(null);
        loadNextTask();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showErrorScreen]);

  // Auto-select training mode from URL parameter
  useEffect(() => {
    if (modeParam && !sessionStarted) {
      if (modeParam === 'adaptive') {
        // Training starts directly in adaptive mode with all representations
        setTrainingMode('adaptive');
        setRepresentationConfig({
          twentyFrame: true,
          numberLine: true,
          counters: true,
          fingers: true,
          symbolic: true
        });
        startSession();
      }
    }
  }, [modeParam, sessionStarted]);

  // Mocking progressState for the welcome screen, as it's not available until a session starts
  const progressState = {
    currentStage: 1, // This will be replaced by currentLevel
    currentStageName: "Erste Schritte", // This will be replaced by currentLevelName
    stageProgress: { tasksCompleted: 0, tasksRequired: 10 }, // This will be replaced by levelProgress
  };

  const startSession = () => {
    setSessionStarted(true);
    createSessionMutation.mutate({
      sessionType: 'practice',
      numberRange: 20,
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      queryClient.clear();
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  // Load tasks required for current level - MUST be before useQuery
  useEffect(() => {
    const getTasksRequiredForLevel = async (level: number): Promise<number> => {
      try {
        const response = await fetch(`/api/progression/level-config/${level}`);
        const config = await response.json();
        return config.tasksRequired || 10;
      } catch {
        return 10; // fallback
      }
    };

    if (progression) {
      const currentLevel = progression?.currentLevel || 1; // Changed from currentStage to currentLevel
      getTasksRequiredForLevel(currentLevel).then(setTasksRequired);
    }
  }, [progression]);

  // Fetch progression data
  const { data: progressionData, refetch: refetchProgression } = useQuery({
    queryKey: ['/api/progression', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest('GET', `/api/progression/${user.id}`);
      const data = await response.json() as ProgressionData;
      setProgression(data); // Update local progression state
      return data;
    },
    enabled: !!user?.id, // Always enabled when user exists - fixes hook order issues
    refetchInterval: false,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  // Load real zoo profile data from API
  const { data: zooProfile, isLoading: isLoadingZoo } = useQuery<ZooProfile>({
    queryKey: ['/api/zoo/profile', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/zoo/profile/${user?.id}`);
      return await response.json();
    },
    enabled: !!user?.id,
  });

  // Load user teams
  interface UserTeam {
    id: string;
    userId: string;
    teamName: string;
    animalIds: string[];
    description: string;
    synergy?: string;
    isActive: boolean;
    wins: number;
    usedInGames: number;
    createdAt: string;
  }

  const { data: userTeams = [] } = useQuery<UserTeam[]>({
    queryKey: ['/api/teams', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teams');
      const data = await response.json();
      console.log('Teams API Response:', data);
      return data.teams || [];
    },
    enabled: !!user?.id,
  });

  // Mutation to claim offline rewards
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/zoo/claim-offline-rewards', {
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: (data: OfflineRewardsSummary) => {
      // Zeige Welcome Back Modal nur wenn genug Zeit vergangen ist (mindestens 5 Minuten)
      if (data.offlineHours > 0 || data.offlineMinutes >= 5) {
        setOfflineRewards(data);
        setShowWelcomeBack(true);
      }
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
    }
  });

  // Claim offline rewards beim ersten Laden
  useEffect(() => {
    if (user?.id && !claimRewardsMutation.data && !claimRewardsMutation.isPending) {
      claimRewardsMutation.mutate();
    }
  }, [user?.id]);

  const handleCloseWelcomeBack = () => {
    setShowWelcomeBack(false);
    // Refresh zoo profile data
    queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
  };

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/sessions', data);
      return await response.json();
    },
    onSuccess: async (data: any) => {
      setSessionId(data.id);
      // Load first task
      loadNextTask();
    },
    onError: (error) => {
      console.error('Session creation failed:', error);
      toast({
        title: "Fehler",
        description: "Session konnte nicht erstellt werden",
        variant: "destructive",
      });
    },
  });

  // Load next task with retry logic - ALWAYS uses competency-based generation
  const loadNextTask = async (retryCount = 0) => {
    if (!user) return;

    try {
      setTaskState('waiting');

      // Store previous task BEFORE clearing currentTask
      const previousTaskData = currentTask ? {
        number1: currentTask.number1,
        number2: currentTask.number2,
        operation: currentTask.operation,
        placeholderPosition: currentTask.placeholderInSymbolic || 'end'
      } : null;

      setCurrentTask(null);

      // Build query params with previous task info to prevent duplicates
      const queryParams = new URLSearchParams();
      if (previousTaskData) {
        queryParams.set('previousTask', JSON.stringify(previousTaskData));
      }

      // Include training mode and representation config in the request
      if (trainingMode) {
        queryParams.set('trainingMode', trainingMode);
      }
      if (representationConfig) {
        queryParams.set('representationConfig', JSON.stringify(representationConfig));
      }

      // ✅ CRITICAL: Generate next task using competency-based generation for ALL tasks
      // This endpoint ALWAYS calls competencyBasedGenerator.generateMixedTasks()
      const response = await apiRequest('GET', `/api/progression/next-task?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to load task: ${response.status}`);
      }

      const task = await response.json();

      // Validate task data
      if (!task || !task.number1 || !task.number2 || !task.operation) {
        throw new Error('Invalid task data received');
      }

      // Additional validation: ensure numbers are positive and result is valid
      if (task.number1 < 0 || task.number2 < 0 || task.correctAnswer < 0) {
        throw new Error('Task contains invalid negative numbers');
      }

      // Apply thicker border to twenty-frame squares in the number range up to 20
      if (task.numberRange && task.numberRange <= 20) {
        if (task.representationConfig && task.representationConfig.positions) {
          task.representationConfig.positions.center = "border-2"; // Make the border thicker
        } else {
          // If representationConfig or positions are missing, initialize them
          task.representationConfig = {
            positions: { center: "border-2" }, // Apply thicker border
            level: 1, // Default level
            message: "" // Default message
          };
        }
      }

      setCurrentTask(task);
      setTaskState('solving');
      // Moved timer start/reset to the query fetcher to ensure it starts with the task
      // resetTimer();
      // startTimer();
    } catch (error) {
      console.error('Failed to load next task:', error);

      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying task load (attempt ${retryCount + 1}/3) in ${delay}ms...`);
        setTimeout(() => loadNextTask(retryCount + 1), delay);
      } else {
        toast({
          title: "Fehler",
          description: "Aufgabe konnte nicht geladen werden. Bitte Session neu starten.",
          variant: "destructive",
        });
        setSessionStarted(false);
        setTrainingMode(null);
      }
    }
  };

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return await response.json();
    },
  });

  // Evaluate progression mutation
  const evaluateProgressionMutation = useMutation({
    mutationFn: async (taskResult: any) => {
      const response = await apiRequest('POST', '/api/progression/evaluate', { taskResult });
      return await response.json();
    },
    onSuccess: async (data) => {
      // Update progression state immediately with response data - NO REFETCH NEEDED
      if (data.progression) {
        queryClient.setQueryData(['/api/progression', user?.id], data.progression);
        // CRITICAL: Also update local state immediately for UI
        setProgression(data.progression);
      }

      const { update } = data;
      console.log('Progression evaluation result:', update);

      // Check for milestone
      if (update.milestoneAchieved) {
        console.log('🎯 MILESTONE ACHIEVED!', update.milestoneAchieved);

        // Use stats from server if available, otherwise calculate from progression
        const stats = update.milestoneAchieved.stats || {
          successRate: (progression?.currentStreak ?? 0) > 0 ? 1.0 : 0.8,
          averageTime: elapsedTime || 10.0, // Use current task time as estimate
          tasksCompleted: update.levelProgress?.current || 10, // Changed from stageProgress to levelProgress
        };

        const milestoneInfo = {
          milestone: update.milestoneAchieved,
          stats: stats,
        };

        console.log('🏆 MILESTONE DATA:', milestoneInfo);
        setMilestoneData(milestoneInfo);
        setShowMilestone(true);
      }
    },
    onError: (error) => {
      console.error('Failed to evaluate progression:', error);
    },
  });

  const handleSolutionComplete = async (
      answer: { number1?: number; operator?: '+' | '-'; number2?: number; result?: number },
      solutionSteps: any[]
    ) => {
      // Extract the actual numeric answer from the answer object
      let studentAnswer: number | undefined;
      if (answer.result !== undefined) {
        studentAnswer = answer.result;
      } else if (answer.number1 !== undefined) {
        studentAnswer = answer.number1;
      } else if (answer.number2 !== undefined) {
        studentAnswer = answer.number2;
      }

      // CRITICAL FIX: Determine the EXPECTED answer based on placeholder position
      let expectedAnswer: number | undefined;
      const placeholderPos = currentTask?.placeholderInSymbolic || 'result';

      if (placeholderPos === 'number1') {
        expectedAnswer = currentTask?.number1;
      } else if (placeholderPos === 'number2') {
        expectedAnswer = currentTask?.number2;
      } else if (placeholderPos === 'result') {
        expectedAnswer = currentTask?.correctAnswer;
      } else {
        expectedAnswer = currentTask?.correctAnswer; // fallback
      }

    const isCorrect = studentAnswer === expectedAnswer;
    const timeTaken = stopTimer();
    console.log('Answer check:', { studentAnswer, expectedAnswer, isCorrect, placeholderPos, timeTaken });

    if (isCorrect) {
      // 🚀 OPTIMIERUNG: Sofort UI-Fortschritt aktualisieren (optimistisch)
      setTasksCompletedInSession(prev => prev + 1);

      // 🎉 TIER-ÜBERRASCHUNG: Alle 5 korrekten Aufgaben ein zufälliges Tier zeigen
      if (progression && (progression.totalCorrect + 1) % 5 === 0) {
        const surpriseAnimals = ['🦁', '🐘', '🦒', '🦓', '🐵', '🐼', '🐨', '🐧', '🦊', '🐰'];
        const randomAnimal = surpriseAnimals[Math.floor(Math.random() * surpriseAnimals.length)];
        setSurpriseAnimal(randomAnimal);
        setShowSurpriseAnimal(true);
        setTimeout(() => setShowSurpriseAnimal(false), 2000); // 2 Sekunden zeigen
      }

      // Lokale Progression optimistisch updaten für sofortiges Feedback
      if (progression) {
        const currentLevel = progression?.currentLevel || 1; // Changed from currentStage to currentLevel
        const currentLevelData = progression.levelHistory?.find( // Changed from stageHistory to levelHistory
          (l: any) => l.level === currentLevel
        );
        const newAttempts = (currentLevelData?.correctCount || 0) + 1;

        // Optimistische UI-Update (wird durch Server-Response überschrieben)
        setProgression({
          ...progression,
          levelHistory: progression.levelHistory?.map((l: any) => // Changed from stageHistory to levelHistory
            l.level === currentLevel
              ? { ...l, correctCount: newAttempts }
              : l
          ) || [],
          currentStreak: progression.currentStreak + 1,
          totalTasksSolved: progression.totalTasksSolved + 1,
          totalCorrect: progression.totalCorrect + 1,
        });
      }

      // Save task data before clearing (needed for async requests)
      const taskToSubmit = currentTask;

      // Nächste Aufgabe sofort laden (parallel zu Server-Requests)
      setTaskState('waiting');
      setCurrentTask(null);
      loadNextTask();

      // Server-Requests parallel im Hintergrund (nicht blockierend)
      Promise.all([
        submitTaskMutation.mutateAsync({
          sessionId,
          taskType: taskToSubmit!.taskType || 'basic_operation',
          operation: taskToSubmit!.operation,
          number1: taskToSubmit!.number1,
          number2: taskToSubmit!.number2,
          correctAnswer: taskToSubmit!.correctAnswer,
          numberRange: taskToSubmit!.numberRange || (taskToSubmit!.stage <= 11 ? 20 : 100), // 'stage' here refers to task stage, not progression stage
          studentAnswer: studentAnswer,
          isCorrect,
          solutionSteps,
          timeTaken: timeTaken, // Ensure timeTaken is used
        }),
        evaluateProgressionMutation.mutateAsync({
          taskId: 'temp-id',
          stage: taskToSubmit!.stage, // This 'stage' is from the task, not progression. Keep as is.
          isCorrect,
          timeTaken: timeTaken, // Ensure timeTaken is used
          operation: taskToSubmit!.operation,
          number1: taskToSubmit!.number1,
          number2: taskToSubmit!.number2,
          correctAnswer: taskToSubmit!.correctAnswer,
          studentAnswer: studentAnswer,
          representationConfig: taskToSubmit!.representationConfig,
        })
        ]).then(() => {
          // Nur EINMAL refetchen nach beiden Requests
          // refetchProgression(); // NO LONGER NEEDED, handled in onSuccess of evaluateProgressionMutation
        }).catch(err => {
          console.error('Error submitting task:', err);
        });
    } else {
      // ❌ FALSE ANSWER - SHOW ERROR SCREEN, WAIT FOR ENTER
      console.log('🔴 WRONG ANSWER - showing error screen. Do NOT load next task yet!', { studentAnswer, expectedAnswer });
      
      if (currentTask) {
        setErrorData({
          studentAnswer,
          expectedAnswer,
          number1: currentTask.number1,
          number2: currentTask.number2,
          operation: currentTask.operation,
          placeholderInSymbolic: currentTask.placeholderInSymbolic || 'result',
        });
        setShowErrorScreen(true);
        // DO NOT call loadNextTask() here - wait for ENTER press!

        // Server-Requests im Hintergrund (nicht blockierend) - aber NICHT UI-Update
        Promise.all([
          submitTaskMutation.mutateAsync({
            sessionId,
            taskType: currentTask.taskType,
            operation: currentTask.operation,
            number1: currentTask.number1,
            number2: currentTask.number2,
            correctAnswer: currentTask.correctAnswer,
            numberRange: currentTask.numberRange || (currentTask.stage <= 11 ? 20 : 100),
            studentAnswer: studentAnswer,
            isCorrect,
            solutionSteps,
            timeTaken: timeTaken,
          }),
          evaluateProgressionMutation.mutateAsync({
            taskId: 'temp-id',
            stage: currentTask.stage,
            isCorrect,
            timeTaken: timeTaken,
            operation: currentTask.operation,
            number1: currentTask.number1,
            number2: currentTask.number2,
            correctAnswer: currentTask.correctAnswer,
            studentAnswer: studentAnswer,
            representationConfig: currentTask.representationConfig,
          })
        ]).catch(err => {
          console.error('Error submitting task:', err);
        });
      }
    }
  };

  const handleContinue = () => {
    // Not used anymore - feedback screen removed
  };

  const [showLevelUpChoice, setShowLevelUpChoice] = useState(false);

  const handleMilestoneContinue = async () => {
    setShowMilestone(false);
    // Refetch progression before showing choice
    const latestProgression = await refetchProgression();
    if (latestProgression.data) {
      setProgression(latestProgression.data);
    }
    // Show choice dialog instead of auto-triggering game
    setShowLevelUpChoice(true);
  };

  const handleContinueTraining = () => {
    setShowLevelUpChoice(false);
    // Just continue with next task
    loadNextTask();
  };

  const handlePlayGame = () => {
    setShowLevelUpChoice(false);
    setShowGameTrigger(true);
  };

  const handleGameComplete = (stats: { animalsCollected: string[], parties: number }) => {
    setShowGameTrigger(false);
    setGameCompleted(true);
    setGameStats(stats);
  };

  const handleGameFeedbackContinue = async () => {
    setGameCompleted(false);
    setGameStats(null);
    // Force refresh progression data to ensure UI is in sync
    const latestProgression = await refetchProgression();
    if (latestProgression.data) {
      setProgression(latestProgression.data);
      console.log('✅ Progression refreshed after game:', {
        animalsCollected: latestProgression.data.gameAnimalsCollected,
        partiesCount: latestProgression.data.gamePartiesCount
      });
    }
    loadNextTask();
  };

  // Handle Enter key for game feedback and other dialogs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameCompleted) {
        e.preventDefault();
        handleGameFeedbackContinue();
      }
      if (e.key === 'Enter' && showLevelUpChoice) {
        e.preventDefault();
        handleContinueTraining(); // Default: Continue training on Enter
      }
      if (e.key === 'Enter' && showSettings) {
        e.preventDefault();
        setShowSettings(false); // Close settings on Enter
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameCompleted, showLevelUpChoice, showSettings]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Nicht angemeldet",
        description: "Du wirst zur Anmeldung weitergeleitet...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Calculate current progress for visualization - MUST BE BEFORE ANY CONDITIONAL RETURNS
  const currentProgress = useMemo(() => {
    // Safely extract currentLevel, fallback to 1 if not found
    const currentLevel = progression?.currentLevel || 1; // Changed from currentStage to currentLevel
    const levelHistory = (progression?.levelHistory ?? []) as any[]; // Changed from stageHistory to levelHistory

    if (!levelHistory || levelHistory.length === 0) {
      return { current: 0, total: 10, percentage: 0 };
    }

    const currentLevelData = levelHistory.find((l: any) => l.level === currentLevel);
    // Try multiple field names for compatibility: correctCount, attemptsCount, or calculate from totalAttempts/correctCount
    let current = 0;
    if (currentLevelData?.correctCount !== undefined) {
      current = currentLevelData.correctCount;
    } else if (currentLevelData?.attemptsCount !== undefined) {
      current = currentLevelData.attemptsCount;
    } else if (currentLevelData?.totalAttempts !== undefined && currentLevelData?.successRate !== undefined) {
      current = Math.round(currentLevelData.totalAttempts * currentLevelData.successRate);
    } else {
      current = 0;
    }
    
    const total = 10; // This should ideally come from config based on level

    return {
      current: Math.min(current, total), // Cap at 10 to avoid overflow
      total,
      percentage: (Math.min(current, total) * 10) // Faster than Math.round((current / total) * 100)
    };
  }, [progression]);

  // Helper function to start training, ensuring correct mode and representation setup
  const handleStartTraining = (mode: TrainingMode) => {
    setTrainingMode(mode);
    // Set default representation config for adaptive mode
    if (mode === 'adaptive') {
      setRepresentationConfig({
        twentyFrame: true,
        numberLine: true,
        counters: true,
        fingers: true,
        symbolic: true,
      });
    }
    startSession();
  };

  // Helper to get placeholder position for AdaptiveMathLab
  const getPlaceholderPosition = (): 'number1' | 'operator' | 'number2' | 'result' | 'none' => {
    // In blind or custom mode, always solve for the result
    if (trainingMode === 'blind' || trainingMode === 'custom') {
      return 'result';
    }

    // In adaptive mode, use the AMRS configuration
    if (!currentTask || !currentTask.representationConfig || !currentTask.representationConfig.positions) {
      return 'result'; // Default position
    }
    const { center, top, bottom, left, right } = currentTask.representationConfig.positions;
    // Map positions to placeholder types (this is a simplified mapping)
    if (center) return 'result';
    if (top) return 'result';
    if (bottom) return 'result';
    if (left) return 'result';
    if (right) return 'result';
    return 'result'; // Fallback
  };

  // Helper to determine active representations based on training mode and task config
  const getActiveRepresentations = () => {
    console.log('getActiveRepresentations called:', {
      trainingMode,
      representationConfig,
      currentTask: currentTask?.representationConfig
    });

    if (trainingMode === 'adaptive') {
      // Adaptive mode: IMMER alle Darstellungen anzeigen
      return {
        twentyFrame: true,
        numberLine: true,
        counters: true,
        fingers: true,
        symbolic: true
      };
    }

    // Default fallback - alle Darstellungen an
    return { twentyFrame: true, numberLine: true, counters: true, fingers: true, symbolic: true };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <Brain className="h-16 w-16 animate-pulse mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Lade deine Lernreise...</p>
        </div>
      </div>
    );
  }

  // HOME-Screen: Zeigt die Hauptkacheln und sekundäre Navigation
  if (!trainingMode || !sessionStarted) {
    // Calculate values needed for the training card
    const currentLevel = progression?.currentLevel || 1;
    const xpToNext = progression?.experience !== undefined ? Math.max(0, 100 - (progression?.experience % 100)) : 100; // Example calculation

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
        {/* Welcome Back Modal */}
        <WelcomeBackModal
          open={showWelcomeBack}
          rewards={offlineRewards}
          onClose={handleCloseWelcomeBack}
        />

        {/* Header */}
        <AppNavigation className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 border-b-2 border-white/30 shadow-lg" />

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">🦁🐘🦒</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Willkommen im Mathe-Zoo, {user?.firstName}!
            </h1>
            <p className="text-xl text-gray-700">
              Was möchtest du heute machen?
            </p>
          </div>

          {/* Haupt-Navigation (3 große Kacheln) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Training - Löwe (Trainer) - GOLDEN */}
            <Card
              className="relative overflow-hidden hover-elevate cursor-pointer border-2 border-dashed border-yellow-400 bg-gradient-to-br from-yellow-100 to-amber-100"
              onClick={() => setLocation('/training')}
              data-testid="card-training-home"
            >
              <CardContent className="p-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-7xl">🦁</div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-yellow-900 mb-1">Training</h2>
                      <p className="text-yellow-800 font-medium">Übe Mathematik mit adaptiven Aufgaben</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold py-3 text-lg"
                    size="lg"
                    data-testid="button-start-training-home"
                  >
                    Jetzt trainieren 🚀
                  </Button>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-yellow-300">
                      <p className="text-xs text-yellow-700 font-semibold">Level</p>
                      <p className="text-2xl font-bold text-yellow-900">{currentLevel}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-yellow-300">
                      <p className="text-xs text-yellow-700 font-semibold">XP</p>
                      <p className="text-2xl font-bold text-yellow-900">{progression?.experience || 0}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg text-center border border-yellow-300">
                      <p className="text-xs text-yellow-700 font-semibold">Bis Level</p>
                      <p className="text-2xl font-bold text-yellow-900">{xpToNext}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spiele - Affe (Spieler) - VIOLETT */}
            <Card
              className="relative overflow-hidden hover-elevate cursor-pointer border-2 border-dashed border-purple-400 bg-gradient-to-br from-purple-100 to-violet-100"
              onClick={() => setLocation('/games')}
              data-testid="card-games-home"
            >
              <CardContent className="p-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-7xl">🐵</div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-purple-900 mb-1">Spiele</h2>
                      <p className="text-purple-800 font-medium">11 lustige Mathespiele</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold py-3 text-lg"
                    size="lg"
                    data-testid="button-play-games-home"
                  >
                    Spiele starten 🎮
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Zoo - Elefant (Sammler) - BLAU */}
            <Card
              className="relative overflow-hidden hover-elevate cursor-pointer border-2 border-dashed border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100"
              onClick={() => setLocation('/zoo-overview')}
              data-testid="card-zoo-home"
            >
              <CardContent className="p-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-7xl">🐘</div>
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-blue-900 mb-1">Mein Zoo</h2>
                      <p className="text-blue-800 font-medium">Deine Erfolge & Sammlungen</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 text-lg"
                    size="lg"
                    data-testid="button-visit-zoo-home"
                  >
                    Zoo besuchen 🦁
                  </Button>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white/60 p-3 rounded-lg border border-blue-300 text-center">
                      <p className="text-xs text-blue-700 font-semibold">Münzen</p>
                      <p className="text-2xl font-bold text-blue-900">{zooProfile?.totalCoins || 0}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-blue-300 text-center">
                      <p className="text-xs text-blue-700 font-semibold">Tiere</p>
                      <p className="text-2xl font-bold text-blue-900">{zooProfile?.totalAnimals?.length || 0}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-amber-300 text-center">
                      <p className="text-xs text-amber-700 font-semibold">Teams</p>
                      <p className="text-2xl font-bold text-amber-900">{userTeams?.length || 0}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-blue-300 text-center">
                      <p className="text-xs text-blue-700 font-semibold">Medaillen</p>
                      <p className="text-2xl font-bold text-blue-900">{zooProfile?.badges?.length || 0}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-blue-300 text-center">
                      <p className="text-xs text-blue-700 font-semibold">Items</p>
                      <p className="text-2xl font-bold text-blue-900">{zooProfile?.ownedShopItems?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* INSIGHT SECTION - Neue nützliche Widgets */}
          <div className="mt-12 mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Income Widget */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  💰 Tägliche Einnahmen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-700">
                      {(() => {
                        const baseVisitors = 100;
                        const bonuses = calculateActiveBonuses(zooProfile?.ownedShopItems || []);
                        const totalVisitors = baseVisitors + bonuses.visitorBoost;
                        const visitorCoins = Math.floor(totalVisitors * 0.5);
                        const dailyCoins = Math.floor(visitorCoins * (1 + bonuses.coinBonus / 100));
                        return dailyCoins;
                      })()}
                    </p>
                    <p className="text-sm text-green-600">Münzen pro Tag (passiv)</p>
                  </div>
                  <div className="bg-white/60 p-2 rounded text-xs text-green-700 border border-green-200">
                    💡 Je mehr Tiere und bessere Items = mehr Einnahmen!
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Team Widget */}
            {userTeams && userTeams.length > 0 && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 hover-elevate cursor-pointer"
                onClick={() => setLocation('/team-manager')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    🏆 Top-Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const topTeam = userTeams.reduce((best, current) => 
                      current.wins > best.wins ? current : best
                    );
                    return (
                      <div className="space-y-2">
                        <p className="font-bold text-yellow-900 truncate">{topTeam.teamName}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-white/60 p-2 rounded text-center">
                            <p className="text-yellow-700 font-bold">{topTeam.wins}</p>
                            <p className="text-xs text-yellow-600">Siege</p>
                          </div>
                          <div className="bg-white/60 p-2 rounded text-center">
                            <p className="text-yellow-700 font-bold">{topTeam.usedInGames}</p>
                            <p className="text-xs text-yellow-600">Spiele</p>
                          </div>
                        </div>
                        {topTeam.isActive && (
                          <Badge className="w-full text-center justify-center bg-green-500">⭐ AKTIV</Badge>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Active Bonuses Widget */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  🎁 Aktive Boni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const bonuses = calculateActiveBonuses(zooProfile?.ownedShopItems || []);
                  const itemsActive = (zooProfile?.ownedShopItems || []).length;
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>👥 Besucher:</span>
                        <span className="font-bold text-purple-700">+{bonuses.visitorBoost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>💰 Münz-Bonus:</span>
                        <span className="font-bold text-purple-700">+{bonuses.coinBonus}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>😊 Zufriedenheit:</span>
                        <span className="font-bold text-purple-700">+{bonuses.happinessBonus}</span>
                      </div>
                      <div className="bg-white/60 p-2 rounded text-xs text-purple-700 border border-purple-200 mt-2">
                        {itemsActive} Items aktiv
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Next Goal Widget */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  🎯 Nächstes Ziel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentLevel = progression?.currentLevel || 1;
                  const nextLevel = currentLevel + 1;
                  const animalCount = zooProfile?.totalAnimals?.length || 0;
                  
                  if (animalCount < 10) {
                    return (
                      <div className="space-y-2 text-sm">
                        <p className="font-bold text-blue-900">Sammle 10 Tiere!</p>
                        <div className="flex items-center gap-2">
                          <Progress value={(animalCount / 10) * 100} className="flex-1" />
                          <span className="text-xs text-blue-700 font-bold">{animalCount}/10</span>
                        </div>
                        <p className="text-xs text-blue-600">Spiele mehr um Tiere zu sammeln!</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-blue-900">Erreiche Level {nextLevel}</p>
                      <p className="text-xs text-blue-600">Trainiere PLUSMINUS oder MALDURCH</p>
                      <Badge className="w-full text-center justify-center bg-blue-500 text-white">
                        Level {currentLevel}
                      </Badge>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* INTERACTIVE WIDGETS - BUILD & GALLERY */}
          <div className="mt-12 mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setLocation('/zoo-builder')}
              className="h-20 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              data-testid="button-open-zoo-builder"
            >
              🏗️ Zoo-Builder
            </Button>
            <Button 
              onClick={() => setLocation('/zoo-gallery')}
              className="h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              data-testid="button-open-zoo-gallery"
            >
              🎨 Zoo-Galerie & Glücksrad
            </Button>
          </div>

          {/* TEAMS WIDGET - Nach Insight Widgets */}
          <div className="mt-12 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                🏆 Meine Teams ({userTeams?.length || 0})
              </h2>
              <div className="flex gap-2">
                {userTeams && userTeams.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="border-2 border-amber-400 hover:bg-amber-50"
                    onClick={() => setLocation('/team-manager')}
                    data-testid="button-manage-teams"
                  >
                    Verwalten
                  </Button>
                )}
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  onClick={() => setLocation('/animal-cards')}
                  data-testid="button-create-team"
                >
                  + Neues Team
                </Button>
              </div>
            </div>
            
            {userTeams && userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTeams.map((team) => (
                  <Card 
                    key={team.id} 
                    className="hover-elevate cursor-pointer border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                    onClick={() => setLocation('/team-manager')}
                    data-testid={`card-team-${team.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-amber-900">{team.teamName}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">
                            {team.description}
                          </CardDescription>
                        </div>
                        {team.isActive && (
                          <Badge className="bg-green-500 text-white whitespace-nowrap">
                            ⭐ AKTIV
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Synergy Info */}
                      {team.synergy && (
                        <div className="bg-white/60 p-2 rounded border border-amber-200">
                          <p className="text-xs text-amber-900 font-semibold leading-tight">
                            {team.synergy.substring(0, 80)}...
                          </p>
                        </div>
                      )}
                      {/* Tier List */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {team.animalIds && team.animalIds.slice(0, 3).map((animalId: string, idx: number) => {
                          const animalCards = userTeams.length > 0 ? userTeams[0] : null;
                          return (
                            <span key={idx} className="text-lg">
                              🐾
                            </span>
                          );
                        })}
                        {team.animalIds && team.animalIds.length > 3 && (
                          <span className="text-sm text-amber-700 font-semibold">
                            +{team.animalIds.length - 3} mehr
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-dashed border-amber-300">
                <span className="text-5xl block mb-3">🐾</span>
                <p className="text-gray-600 font-medium mb-4">Noch kein Team erstellt!</p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  onClick={() => setLocation('/animal-cards')}
                >
                  Erstes Team erstellen
                </Button>
              </div>
            )}
          </div>

          {/* Sekundäre Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Zoo-Seiten (Blau-Töne) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300"
                    onClick={() => setLocation('/zoo-overview')}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Mein Zoo
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verwalte deinen Zoo!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
                    onClick={() => setLocation(`/animal-encyclopedia?userId=${user?.id}`)}
                  >
                    <span className="text-xl mr-2">📚</span>
                    Tier-Lexikon
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lerne über alle Tiere!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-cyan-50 to-teal-50 border-blue-300"
                    onClick={() => setLocation('/zoo-shop')}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Zoo-Shop
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kaufe Items mit Münzen!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-300"
                    onClick={() => setLocation('/zoo-statistics')}
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Statistiken
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Deine Fortschritte!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Alle Spiele Übersicht (Violett) */}
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300"
              onClick={() => setLocation('/games')}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Alle Spiele
            </Button>

            {/* Teams Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300"
                    onClick={() => setLocation('/team-manager')}
                  >
                    <span className="text-xl mr-2">🏆</span>
                    Meine Teams
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verwalte deine Tier-Teams!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Einzelne Spiele (Violett-Nuancen) */}
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300"
              onClick={() => setLocation('/game')}
            >
              <span className="text-xl mr-2">⚖️</span>
              Zahlenwaage
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-pink-100 to-pink-50 border-purple-300"
              onClick={() => setLocation('/ten-wins-game')}
            >
              <span className="text-xl mr-2">🎯</span>
              10 gewinnt!
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 border-purple-300"
              onClick={() => setLocation('/number-stairs')}
            >
              <span className="text-xl mr-2">🪜</span>
              Zahlen-Treppe
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-violet-100 to-violet-50 border-purple-300"
              onClick={() => setLocation('/number-builder')}
            >
              <span className="text-xl mr-2">🏗️</span>
              Baumeister
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-purple-100 to-lavender-50 border-purple-300"
              onClick={() => setLocation('/decomposition-safari')}
            >
              <span className="text-xl mr-2">🧩</span>
              Zerlegung
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-pink-100 to-rose-50 border-purple-300"
              onClick={() => setLocation('/doubling-expedition')}
            >
              <span className="text-xl mr-2">👯</span>
              Verdoppeln
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-fuchsia-100 to-purple-50 border-purple-300"
              onClick={() => setLocation('/zoo-adventure')}
            >
              <span className="text-xl mr-2">🦁</span>
              Zoo-Abenteuer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-violet-100 to-indigo-50 border-purple-300"
              onClick={() => setLocation('/zoo-pathfinder')}
            >
              <span className="text-xl mr-2">🗺️</span>
              Pfadfinder
            </Button>

            {/* Zoo-Herausforderungen (Grün-Gelb-Orange für Progression) */}
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
              onClick={() => setLocation('/zoo-missions')}
            >
              <Target className="w-5 h-5 mr-2" />
              Missionen
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300"
              onClick={() => setLocation('/zoo-partner-zoos')}
            >
              <Globe className="w-5 h-5 mr-2" />
              Partner-Zoos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-20 text-base font-semibold border-2 hover:scale-105 transition-transform bg-gradient-to-br from-orange-50 to-red-50 border-orange-300"
              onClick={() => setLocation('/zoo-big-goals')}
            >
              <Crown className="w-5 h-5 mr-2" />
              Grosse Ziele
            </Button>
          </div>

          {/* TEAMS WIDGET */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                🏆 Meine Teams ({userTeams?.length || 0})
              </h2>
              <div className="flex gap-2">
                {userTeams && userTeams.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="border-2 border-amber-400 hover:bg-amber-50"
                    onClick={() => setLocation('/team-manager')}
                    data-testid="button-manage-teams"
                  >
                    Verwalten
                  </Button>
                )}
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  onClick={() => setLocation('/animal-cards')}
                  data-testid="button-create-team"
                >
                  + Neues Team
                </Button>
              </div>
            </div>
            
            {userTeams && userTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTeams.map((team) => (
                  <Card 
                    key={team.id} 
                    className="hover-elevate cursor-pointer border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
                    onClick={() => setLocation('/team-manager')}
                    data-testid={`card-team-${team.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-amber-900">{team.teamName}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">
                            {team.description}
                          </CardDescription>
                        </div>
                        {team.isActive && (
                          <Badge className="bg-green-500 text-white whitespace-nowrap">
                            ⭐ AKTIV
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Synergy Info */}
                      {team.synergy && (
                        <div className="bg-white/60 p-2 rounded border border-amber-200">
                          <p className="text-xs text-amber-900 font-semibold leading-tight">
                            {team.synergy.substring(0, 80)}...
                          </p>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded">
                          <span className="text-base">🏅</span>
                          <span className="font-semibold text-amber-900">{team.wins}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded">
                          <span className="text-base">🎮</span>
                          <span className="font-semibold text-amber-900">{team.usedInGames}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-dashed border-amber-300">
                <p className="text-2xl mb-2">🦁 Noch keine Teams!</p>
                <p className="text-amber-700 mb-4">Erstelle dein erstes Team aus deinen Lieblings-Tieren</p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  size="lg"
                  onClick={() => setLocation('/animal-cards')}
                  data-testid="button-create-first-team"
                >
                  Jetzt Team erstellen
                </Button>
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="text-center text-gray-600 mt-8">
            <p className="text-sm">
              💡 Tipp: Klicke auf "Mein Zoo" um alle deine Erfolge zu sehen!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeReps = getActiveRepresentations();
  // Support both old (zoo_animals) and new (gameAnimalsCollected) systems
  const totalCoins = Math.max(
    Array.isArray(progressionData?.gameAnimalsCollected) ? progressionData.gameAnimalsCollected.length : 0,
    Array.isArray(progressionData?.zoo_animals) ? progressionData.zoo_animals.length : 0
  ) || 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-learning-teal/10 overflow-hidden">
      {/* Vereinter Header mit durchgehendem Farbverlauf */}
      <header className="border-b bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex-shrink-0 shadow-lg">
        <div className="container mx-auto px-4 py-2">
          {/* Erste Zeile: Logo + Tier-Fortschritt + Navigation */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex flex-col flex-shrink-0">
              <h1 className="text-lg font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                MatheZoo
              </h1>
              <p className="text-lg font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {user?.firstName || user?.username}
              </p>
            </div>

            {/* Tier-Fortschritt (10 Tiere) */}
            {progression && currentProgress && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: Math.min(10, currentProgress.total) }).map((_, i) => {
                  const animals = ['🦁', '🐘', '🦒', '🦓', '🐵', '🐼', '🐨', '🐧', '🦊', '🐰'];
                  const animal = animals[i % animals.length];
                  return (
                    <span
                      key={i}
                      className={cn(
                        "text-xl transition-all duration-500",
                        i < currentProgress.current
                          ? "opacity-100 scale-110 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]"
                          : "opacity-20 grayscale scale-90"
                      )}
                    >
                      {animal}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Navigation Buttons - gleichmäßig verteilt */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/student')}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Training</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/games')}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <Gamepad2 className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Spiele</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/zoo-overview')}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <Trophy className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Mein Zoo</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Einstellungen</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <Home className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Home</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="text-xs font-semibold">Abmelden</span>
              </Button>
            </div>
          </div>

          {/* Zweite Zeile: Kompakte Fortschritts-Info */}
          {progression && currentProgress && (
            <div className="pt-1.5 border-t border-white/30 mt-1.5">
              <div className="flex items-center justify-between text-xs text-white/90">
                <span className="font-medium">
                  {currentProgress.current} / {currentProgress.total} Aufgaben in diesem Level
                </span>
                <span className="font-medium">
                  {tasksCompletedInSession} Aufgaben heute
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="max-w-2xl w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle>Einstellungen</CardTitle>
              <CardDescription>Passe deine Lernerfahrung an.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add settings options here, e.g., */}
              <div className="flex items-center justify-between">
                <span>Ton aktivieren</span>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <span>Animationen</span>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
              {/* ... more settings */}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSettings(false)}>Schließen</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Main Content - fills remaining space */}
      <div className="flex-1 overflow-y-auto pb-8">
        {currentTask ? (
          <AdaptiveMathLab
            taskNumber1={currentTask.number1}
            taskNumber2={currentTask.number2}
            taskOperation={currentTask.operation as '+' | '-'}
            taskResult={currentTask.correctAnswer}
            numberRange={currentTask.numberRange}
            representationConfig={activeReps}
            placeholderInSymbolic={currentTask.placeholderInSymbolic || 'result'}
            onSolutionComplete={handleSolutionComplete}
            className="flex-1"
            trainingMode={trainingMode}
          />
        ) : (
          <div className="text-center py-8">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Lade nächste Aufgabe...</p>
          </div>
        )}
      </div>

      {/* ERROR SCREEN - FIRST in render, shows on wrong answer until ENTER pressed */}
      {showErrorScreen && errorData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] pointer-events-auto">
          <Card className="max-w-md w-full mx-4 shadow-2xl border-4 border-red-500 bg-white">
            <CardContent className="p-4 text-center space-y-4">
              {/* Funny Animal with Speech Bubble */}
              <div className="relative inline-block">
                <img 
                  src={babyParrot} 
                  alt="Feedback-Tier" 
                  className="h-24 w-24 mx-auto rounded-full border-4 border-yellow-400 shadow-lg"
                />
                {/* Speech Bubble */}
                <div className="absolute -top-10 -right-8 bg-red-500 text-white rounded-full px-3 py-1.5 font-bold text-xs shadow-lg border-4 border-red-600 whitespace-nowrap animate-pulse">
                  Das ist<br/>FALSCH! 😅
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-red-600">Kein Problem!</h2>
                <p className="text-base text-gray-600">Jeder macht Fehler - Lernen macht Spass! 🎉</p>
                
                <div className="bg-red-50 rounded-lg p-3 space-y-2">
                  <p className="text-base font-semibold text-gray-700">
                    Du hast getippt:
                  </p>
                  <p className="text-2xl font-bold text-red-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {errorData.number1}{errorData.operation}{errorData.number2}={errorData.studentAnswer}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <p className="text-base font-semibold text-gray-700">
                    Richtig ist:
                  </p>
                  <p className="text-4xl font-black text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {errorData.number1}{errorData.operation}{errorData.number2}={errorData.expectedAnswer}
                  </p>
                </div>
              </div>

              <div className="text-base text-gray-600 font-semibold pt-2 border-t-2">
                Drücke ENTER zum Weitermachen →
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tier-Überraschung Overlay - kurze Motivation */}
      {showSurpriseAnimal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center space-y-2 animate-in zoom-in-95 duration-300">
            <div className="text-9xl animate-bounce drop-shadow-2xl">
              {surpriseAnimal}
            </div>
            <p className="text-2xl font-bold text-white drop-shadow-lg">
              Super gemacht! 🎉
            </p>
          </div>
        </div>
      )}


      {/* Milestone Celebration Dialog - Show when milestone data exists */}
      {milestoneData && showMilestone && (
        <MilestoneCelebration
          open={true}
          onOpenChange={async (open) => {
            if (!open) {
              console.log('🚫 Closing milestone dialog');
              setMilestoneData(null);
              setShowMilestone(false);
              // Show choice dialog instead of auto-triggering game
              setShowLevelUpChoice(true);
            }
          }}
          milestone={{
            title: milestoneData.milestone.milestoneTitle || milestoneData.milestone.displayName || 'Meilenstein erreicht!',
            icon: milestoneData.milestone.milestoneIcon || milestoneData.milestone.icon || '🎉',
            stageTrigger: milestoneData.milestone.stageTrigger || 0,
            motivationMessage: milestoneData.milestone.motivationMessage,
          }}
          stats={{
            successRate: milestoneData.stats.successRate || 0,
            averageTime: milestoneData.stats.averageTime || 0,
            tasksCompleted: milestoneData.stats.tasksCompleted || 0,
          }}
          onContinue={() => {
            console.log('✅ Milestone continue clicked');
            handleMilestoneContinue();
          }}
        />
      )}

      {/* Level Up Choice Dialog - nur Training fortsetzen */}
      {showLevelUpChoice && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-8xl mb-4 animate-bounce">🎉🦁🎊</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                Level geschafft!
              </h2>
              <p className="text-2xl text-gray-700 font-semibold">
                Bereit für das nächste Level?
              </p>

              <Button
                size="lg"
                onClick={handleContinueTraining}
                className="w-full h-32 text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex flex-col gap-3"
                data-testid="button-continue-training"
              >
                <span className="text-5xl">📚</span>
                <span className="font-bold">Weiter im Training!</span>
              </Button>

              <p className="text-sm text-gray-600 mt-4">
                Drücke ENTER oder klicke den Button um fortzufahren
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Trigger - Show Zahlenwaage game after milestone */}
      {showGameTrigger && (
        <div className="fixed inset-0 z-50">
          <ZahlenwaageGame
            embedded={true}
            onGameComplete={handleGameComplete}
          />
        </div>
      )}

      {/* Game Feedback - Show animals collected after game */}
      {gameCompleted && gameStats && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-300 via-lime-400 to-yellow-500 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-7xl mb-4 animate-bounce">🎉🦁🐘🦒🎊</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                Super gespielt!
              </h2>
              <p className="text-2xl text-gray-700">
                Du hast <span className="font-bold text-amber-600">{gameStats.animalsCollected.length}</span> Tiere gesammelt!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {gameStats.animalsCollected.map((animal, idx) => (
                  <span key={idx} className="text-5xl animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {animal === 'lion' ? '🦁' : animal === 'elephant' ? '🐘' : animal === 'giraffe' ? '🦒' :
                     animal === 'zebra' ? '🦓' : animal === 'monkey' ? '🐵' : animal === 'panda' ? '🐼' :
                     animal === 'koala' ? '🐨' : animal === 'penguin' ? '🐧' : animal === 'fox' ? '🦊' : '🐰'}
                  </span>
                ))}
              </div>
              {gameStats.parties > 0 && (
                <p className="text-xl text-purple-600 font-bold">
                  🎊 {gameStats.parties} Tier-Party{gameStats.parties > 1 ? 's' : ''} gefeiert! 🎊
                </p>
              )}
              <p className="text-sm text-gray-600 mt-4">
                Drücke ENTER um zurück zum Training zu gehen
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Card for current task details, username, and buttons - mit deutlichem Abstand nach oben */}
      {currentTask && (
        <Card className="border-t-2 rounded-none absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-red-200 border-t-4 border-t-blue-500 shadow-2xl mt-8">
            <CardHeader className="py-3 px-6">
              <div className="flex items-center justify-between">
                {/* Left: User info with modern avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-100">
                      {user?.firstName?.[0] || user?.username?.[0] || 'S'}
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                      {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
                    </span>
                  </div>
                </div>

                {/* Center: Modern Stats with larger blue level badge */}
                <div className="flex items-center gap-4">
                  {/* Level - Compact Blue Badge */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-xl">🎯</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-blue-100 font-medium">Level</span>
                      <span className="text-sm font-bold text-white">{progression?.currentLevel || 1}</span>
                    </div>
                  </div>

                  {/* Total Tasks Solved - Modern Green */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-xl">🐾</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-medium">Schritte</span>
                      <span className="text-sm font-bold text-emerald-700">{progression?.totalTasksSolved || 0}</span>
                    </div>
                  </div>

                  {/* Animals Collected - Modern Amber */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-xl">🦁</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-amber-600 font-medium">Tiere</span>
                      <span className="text-sm font-bold text-amber-700">
                        {(() => {
                          // Support both old (zoo_animals) and new (gameAnimalsCollected) systems
                          const gameAnimals = Array.isArray(progressionData?.gameAnimalsCollected) ? progressionData.gameAnimalsCollected.length : 0;
                          const zooAnimals = Array.isArray(progressionData?.zoo_animals) ? progressionData.zoo_animals.length : 0;
                          return Math.max(gameAnimals, zooAnimals) || 0;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Parties - Modern Pink */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-300 shadow-md hover:shadow-lg transition-shadow">
                    <span className="text-xl">🎉</span>
                    <div className="flex flex-col">
                      <span className="text-xs text-pink-600 font-medium">Partys</span>
                      <span className="text-sm font-bold text-pink-700">{progressionData?.gamePartiesCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Modern Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="button-logout-footer"
                    className="border-2 border-red-400 text-red-700 hover:bg-red-50 hover:border-red-500 font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
      )}
    </div>
  );
}