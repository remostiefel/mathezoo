import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useGameRecommendations } from "@/hooks/useGameRecommendations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { GameRecommendationCard } from "@/components/tips/GameRecommendationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MathLab } from "@/components/math/MathLab";
import { SentenceBuilder } from "@/components/math/SentenceBuilder";
import { Progress } from "@/components/ui/progress";
import { Award, Target, TrendingUp, LogOut, Waves, Timer } from "lucide-react";
import TrainingModeSelector, { type TrainingMode, type RepresentationConfig } from "@/components/TrainingModeSelector";
import { MilestoneCelebration } from "@/components/progression/MilestoneCelebration";


interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  correctAnswer: number;
  taskType: string;
  numberRange: number;
  id?: string; // Added for updateTaskMutation
}

export default function StudentWorkspace() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isStudent, user } = useAuth();

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
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedNumberRange, setSelectedNumberRange] = useState<number>(20);
  const [selectedTrainingMode, setSelectedTrainingMode] = useState<TrainingMode | null>(null);
  const [selectedRepConfig, setSelectedRepConfig] = useState<RepresentationConfig | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);


  const { elapsedTime, formattedTime, startTimer, stopTimer, resetTimer, isRunning } = useTaskTimer();

  // Game recommendations based on error patterns
  const {
    showRecommendation,
    currentRecommendation,
    dismissRecommendation
  } = useGameRecommendations(user?.id);

  // Fetch progression data
  const { data: progressionData, refetch: refetchProgression } = useQuery({
    queryKey: ['/api/progression'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/progression');
      return await response.json();
    },
    enabled: isAuthenticated && isStudent, // Only fetch if authenticated and is a student
  });


  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/sessions', data);
      return await response.json();
    },
    onSuccess: async (data: any) => {
      console.log('Session created with ID:', data.id);
      setSessionId(data.id);

      // Load tasks after session creation
      try {
        setTasksLoading(true);
        const response = await apiRequest('POST', '/api/generate-adaptive-tasks');

        const taskPackage = await response.json();
        console.log('Tasks loaded:', taskPackage);

        if (taskPackage?.tasks) {
          setTasks(taskPackage.tasks.map((t: any) => ({
            id: t.id, // Ensure task ID is captured
            number1: t.number1,
            number2: t.number2,
            operation: t.operation,
            correctAnswer: t.correctAnswer,
            taskType: t.taskType,
            numberRange: t.numberRange || 20,
          })));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast({
          title: "Fehler",
          description: "Aufgaben konnten nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setTasksLoading(false);
      }
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

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return await response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      refetchProgression(); // Refetch progression data after a task is submitted

      if (result.milestoneAchieved) {
        console.log('🎉 Milestone achieved:', result.milestoneAchieved);

        // Save milestone to database
        fetch('/api/progression/milestone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(result.milestoneAchieved)
        });

        // Show celebration
        setCurrentMilestone(result.milestoneAchieved);
        setShowMilestoneCelebration(true);
      }
    },
    onError: (error) => {
      console.error('Failed to submit task:', error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht übermittelt werden",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/tasks/${taskId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      // Optionally invalidate queries or refetch tasks if needed
      console.log("Task updated successfully");
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Nicht angemeldet",
        description: "Du wirst zur Anmeldung weitergeleitet...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>
              Diese Seite ist nur für Schüler:innen zugänglich.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  useEffect(() => {
    if (currentTask && !isRunning) {
      resetTimer();
      startTimer();
    }
  }, [currentTask, currentTaskIndex]);

  const handleSolutionComplete = (answer: number, solutionSteps: any[]) => {
    if (!currentTask || !sessionId) return;

    const isCorrect = answer === currentTask.correctAnswer;
    const timeSpent = stopTimer();

    // Create task in database with answer
    submitTaskMutation.mutate({
      sessionId,
      taskType: currentTask.taskType,
      operation: currentTask.operation,
      number1: currentTask.number1,
      number2: currentTask.number2,
      correctAnswer: currentTask.correctAnswer,
      numberRange: currentTask.numberRange,
      studentAnswer: answer,
      isCorrect,
      solutionSteps,
      timeTaken: timeSpent,
    });

    if (isCorrect) {
      toast({
        title: "Richtig! 🎉",
        description: "Großartig gelöst!",
        className: "bg-achievement/10 border-achievement",
      });
      setCompletedTasks(prev => prev + 1);

      // Move to next task after a delay
      setTimeout(() => {
        if (currentTaskIndex < tasks.length - 1) {
          setCurrentTaskIndex(prev => prev + 1);
        } else {
          toast({
            title: "Session abgeschlossen!",
            description: "Du hast alle Aufgaben geschafft!",
            className: "bg-learning-teal/10 border-learning-teal",
          });
        }
      }, 1500);
    } else {
      // On error: show explanation (MathLab already does this)
      // The explanation will be visible in MathLab component
      // After user sees explanation, they can try the same task again
      toast({
        title: "Nicht ganz richtig",
        description: "Schau dir die Erklärung an und versuche es nochmal!",
        variant: "destructive",
      });
      // Note: The same task stays active (no index change)
      // MathLab will show explanations and user can retry
    }
  };

  const handleSentenceComplete = (sentence: string, usedBlocks: any[]) => {
    toast({
      title: "Erklärung gespeichert",
      description: "Super, dass du deinen Denkweg beschrieben hast!",
      className: "bg-primary/10 border-primary",
    });
  };

  const loadNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      toast({
        title: "Session abgeschlossen!",
        description: "Du hast alle Aufgaben geschafft!",
        className: "bg-learning-teal/10 border-learning-teal",
      });
    }
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          {/* Logout and HOME Buttons in top right corner */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/login'}
            >
              HOME
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout-initial"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">
                Willkommen, {user?.firstName}!
              </CardTitle>
              <CardDescription className="text-lg">
                Bereit für deine Mathe-Session?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30 shadow-lg">
                  <div className="text-5xl font-black text-primary mb-2">{tasks.length}</div>
                  <p className="text-base font-semibold text-muted-foreground">Aufgaben</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-learning-teal">5</div>
                  <p className="text-sm text-muted-foreground mt-1">Darstellungen</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-discovery">∞</div>
                  <p className="text-sm text-muted-foreground mt-1">Lösungswege</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Zahlenraum wählen:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedNumberRange === 20 ? "default" : "outline"}
                    onClick={() => setSelectedNumberRange(20)}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    data-testid="button-select-zr20"
                  >
                    <span className="text-2xl font-bold">20</span>
                    <span className="text-xs">Zahlenraum bis 20</span>
                  </Button>
                  <Button
                    variant={selectedNumberRange === 100 ? "default" : "outline"}
                    onClick={() => setSelectedNumberRange(100)}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    data-testid="button-select-zr100"
                  >
                    <span className="text-2xl font-bold">100</span>
                    <span className="text-xs">Zahlenraum bis 100</span>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <TrainingModeSelector
                  onModeSelect={(mode, config) => {
                    setSelectedTrainingMode(mode);
                    setSelectedRepConfig(config || null);
                    setSessionStarted(true);
                    createSessionMutation.mutate({
                      sessionType: 'practice',
                      numberRange: selectedNumberRange,
                      trainingMode: mode,
                      representationConfig: config,
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Mathemat</h1>
              <p className="text-sm text-muted-foreground">
                Aufgabe {currentTaskIndex + 1} von {tasks.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" data-testid="icon-timer" />
                <span className="text-sm font-medium" data-testid="text-timer">{formattedTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-achievement" />
                <span className="text-sm font-medium">{completedTasks} gelöst</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Abmelden
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8 pb-20">
        {/* Game Recommendation - Show when error pattern detected */}
        {showRecommendation && currentRecommendation && (
          <div className="animate-in slide-in-from-top duration-500">
            <GameRecommendationCard
              errorType={currentRecommendation.errorType}
              errorLabel={currentRecommendation.errorLabel}
              recommendation={currentRecommendation.recommendation}
              errorCount={currentRecommendation.errorCount}
              onDismiss={dismissRecommendation}
            />
          </div>
        )}

        {tasksLoading || !currentTask ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Lade adaptive Aufgaben...</p>
          </div>
        ) : (
          <>
            {/* Milestone Celebration Dialog */}
            {showMilestoneCelebration && currentMilestone && (
              <MilestoneCelebration
                open={showMilestoneCelebration}
                onOpenChange={setShowMilestoneCelebration}
                milestone={currentMilestone}
                stats={{
                  successRate: progressionData?.levelHistory
                    ? progressionData.levelHistory[progressionData.currentLevel - 1]?.successRate || 0
                    : 0,
                  averageTime: 30, // This should be dynamically calculated or fetched
                  tasksCompleted: progressionData?.levelHistory
                    ?.reduce((sum: number, level: any) => sum + level.correctCount, 0) || 0
                }}
                onContinue={() => {
                  setShowMilestoneCelebration(false);
                  loadNextTask();
                }}
              />
            )}

            {/* Bayesian Feedback Dialog */}
            {showFeedback && feedbackData && (
              <div /* Placeholder for BayesianFeedback component */ />
            )}

            {/* Math Lab */}
            <MathLab
              taskNumber1={currentTask.number1}
              taskNumber2={currentTask.number2}
              taskOperation={currentTask.operation}
              numberRange={currentTask.numberRange}
              onSolutionComplete={handleSolutionComplete}
              representationConfig={selectedRepConfig || undefined}
            />

            {/* Sentence Builder */}
            <SentenceBuilder onSentenceComplete={handleSentenceComplete} />

            {/* Encouragement */}
            <Card className="bg-gradient-to-br from-learning-teal/10 to-achievement/10 border-learning-teal/20">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-learning-teal" />
                <p className="text-sm text-muted-foreground">
                  Probiere verschiedene Darstellungen aus. Jeder Lösungsweg ist wertvoll!
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Footer with username */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t py-2">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
          </p>
        </div>
      </div>
    </div>
  );
}