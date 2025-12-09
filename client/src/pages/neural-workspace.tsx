/**
 * Neural Workspace - Brain-Inspired Progression System 3.0
 * 
 * Features:
 * - Neural task generation (44-neuron network)
 * - Placeholder support (algebraic thinking)
 * - Ensemble predictions (5 AI models)
 * - Real-time neural analytics
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MathLab } from "@/components/math/MathLab";
import { PlaceholderInput } from "@/components/math/PlaceholderInput";
import { NeuralAnalytics } from "@/components/analytics/NeuralAnalytics";
import { LogOut, Brain, Sparkles, TrendingUp, Target, TestTube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  numberRange: 20 | 100;
  placeholderPosition?: 'start' | 'middle' | 'end' | 'none';
  taskType: string;
  context?: any;
}

interface GeneratedTask {
  task: Task;
  cognitiveLoad: number;
  representations: string[];
  scaffolding: number;
  desirableDifficulties: any;
  placeholderComplexity: number;
  metacognitivePrompt: string;
  neuralOutputs: any;
}

export default function NeuralWorkspace() {
  const { toast } = useToast();
  const { user, isStudent } = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<GeneratedTask | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Create session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sessions', {
        sessionType: 'practice',
        numberRange: 20
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      loadNeuralTask();
    }
  });

  // Load neural task
  const loadNeuralTask = async () => {
    try {
      const response = await apiRequest('POST', '/api/neural/task', {});
      const taskData = await response.json();

      setCurrentTask(taskData);
      setAnswer("");
      setStartTime(Date.now());

      toast({
        title: "Neue Aufgabe generiert! 🧠",
        description: `Kognitive Last: ${(taskData.cognitiveLoad * 100).toFixed(0)}%`,
      });
    } catch (error) {
      console.error("Failed to load neural task:", error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht geladen werden",
        variant: "destructive"
      });
    }
  };

  // Submit task
  const handleSubmit = async () => {
    if (!currentTask || !sessionId || !answer) return;

    setIsSubmitting(true);
    const timeTaken = (Date.now() - startTime) / 1000;

    const correctAnswer = currentTask.task.operation === '+' 
      ? currentTask.task.number1 + currentTask.task.number2
      : currentTask.task.number1 - currentTask.task.number2;

    // Determine correct answer based on placeholder position
      let isCorrect = false;
      const studentAnswerNum = parseInt(answer);

      if (currentTask.task.placeholderPosition === 'start') {
        // Missing number1: answer should equal number1
        isCorrect = studentAnswerNum === currentTask.task.number1;
      } else if (currentTask.task.placeholderPosition === 'middle') {
        // Missing number2: answer should equal number2
        isCorrect = studentAnswerNum === currentTask.task.number2;
      } else {
        // Missing result (placeholderPosition === 'end' or 'none'): answer should equal correctAnswer
        isCorrect = studentAnswerNum === correctAnswer;
      }

    try {
      const response = await apiRequest('POST', '/api/neural/complete', {
        sessionId,
        task: currentTask.task,
        studentAnswer: parseInt(answer),
        isCorrect,
        timeTaken,
        strategyUsed: 'unknown', // Could be detected from solution steps
        representationsUsed: currentTask.representations,
        solutionSteps: []
      });

      const result = await response.json();

      // Add to history
      setTaskHistory(prev => [...prev, {
        task: currentTask.task,
        correct: isCorrect,
        time: timeTaken
      }]);

      // Show feedback
      toast({
        title: isCorrect ? "Richtig! ✓" : "Nicht ganz...",
        description: isCorrect 
          ? `Super! In ${timeTaken.toFixed(1)}s gelöst` 
          : `Die richtige Antwort ist ${correctAnswer}`,
        variant: isCorrect ? "default" : "destructive"
      });

      // Load next task
      setTimeout(() => loadNeuralTask(), isCorrect ? 1500 : 3000);

    } catch (error) {
      console.error("Failed to submit task:", error);
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht gesendet werden",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const startSession = () => {
    createSessionMutation.mutate();
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Neural Workspace</h1>
                <p className="text-sm text-muted-foreground">Brain-Inspired Progression System 3.0</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/math-test">
                <Button variant="outline" size="sm" data-testid="button-math-test">
                  <TestTube className="w-4 h-4 mr-2" />
                  Mathe-Test
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="max-w-2xl w-full" data-testid="card-welcome">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Willkommen beim neuralen Lernsystem!
              </CardTitle>
              <CardDescription>
                Dieses System nutzt ein 44-Neuronen-Netzwerk, um perfekt auf dich abgestimmte Aufgaben zu generieren.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Adaptive Schwierigkeit</p>
                    <p className="text-sm text-muted-foreground">
                      Aufgaben passen sich deinem Lernstand an
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Algebraisches Denken</p>
                    <p className="text-sm text-muted-foreground">
                      Platzhalter-Aufgaben fördern inverses Denken
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">5 KI-Modelle</p>
                    <p className="text-sm text-muted-foreground">
                      Ensemble von Prädiktoren für optimales Lernen
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={startSession} 
                className="w-full" 
                size="lg"
                data-testid="button-start-session"
              >
                <Brain className="w-5 h-5 mr-2" />
                Session starten
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Neural Workspace</h1>
              <div className="flex gap-2 items-center">
                <Badge variant="outline" data-testid="badge-tasks-completed">
                  {taskHistory.length} Aufgaben
                </Badge>
                <Badge variant="outline" data-testid="badge-accuracy">
                  {taskHistory.length > 0 
                    ? ((taskHistory.filter(t => t.correct).length / taskHistory.length) * 100).toFixed(0) 
                    : 0}% Genauigkeit
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              data-testid="button-toggle-analytics"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {showAnalytics ? 'Aufgaben' : 'Analytik'}
            </Button>
            <Link href="/math-test">
              <Button variant="outline" size="sm" data-testid="button-math-test">
                <TestTube className="w-4 h-4 mr-2" />
                Mathe-Test
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {showAnalytics ? (
          <NeuralAnalytics userId={user?.id || ''} />
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Current Task */}
            {currentTask && (
              <Card data-testid="card-current-task">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Aktuelle Aufgabe
                      </CardTitle>
                      <CardDescription>
                        {currentTask.metacognitivePrompt}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" data-testid="badge-cognitive-load">
                        Last: {(currentTask.cognitiveLoad * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline" data-testid="badge-placeholder">
                        {currentTask.task.placeholderPosition !== 'none' && currentTask.task.placeholderPosition 
                          ? '🧠 Platzhalter'
                          : '📝 Standard'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Placeholder Input or MathLab */}
                  {currentTask.task.placeholderPosition && currentTask.task.placeholderPosition !== 'none' ? (
                    <div className="space-y-4">
                      <PlaceholderInput
                        number1={currentTask.task.number1}
                        number2={currentTask.task.number2}
                        operation={currentTask.task.operation}
                        placeholderPosition={currentTask.task.placeholderPosition}
                        value={answer}
                        onChange={setAnswer}
                        onSubmit={handleSubmit}
                        disabled={isSubmitting}
                      />

                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !answer}
                        className="w-full"
                        size="lg"
                        data-testid="button-submit"
                      >
                        {isSubmitting ? 'Wird überprüft...' : 'Antwort abgeben'}
                      </Button>
                    </div>
                  ) : (
                    <MathLab
                      taskNumber1={currentTask.task.number1}
                      taskNumber2={currentTask.task.number2}
                      taskOperation={currentTask.task.operation}
                      numberRange={currentTask.task.numberRange}
                      onSolutionComplete={(ans, steps) => {
                        setAnswer(ans.toString());
                        handleSubmit();
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Task History */}
            {taskHistory.length > 0 && (
              <Card data-testid="card-history">
                <CardHeader>
                  <CardTitle>Verlauf</CardTitle>
                  <CardDescription>Deine letzten Aufgaben</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {taskHistory.slice().reverse().map((t, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded border ${
                          t.correct 
                            ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
                            : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
                        }`}
                        data-testid={`history-item-${idx}`}
                      >
                        <div className="text-sm font-mono font-bold">
                          {t.task.number1} {t.task.operation} {t.task.number2}
                        </div>
                        <div className="text-xs opacity-70">
                          {t.time.toFixed(1)}s
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}