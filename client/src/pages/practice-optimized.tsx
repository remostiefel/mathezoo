/**
 * Optimized Practice Page
 * 
 * Layout for 1440x900 (no scrolling):
 * - Top Quarter (25%): Progress, Stars, Logout
 * - Middle Half (50%): 3 columns: Turning Points | Input Field | TwentyFrame
 * - Bottom Quarter (25%): Number Line (full width)
 */

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LiveNumberLine } from "@/components/math/LiveNumberLine";
import { ExtendedNumberLine } from "@/components/math/ExtendedNumberLine";
import { LiveTwentyFrame } from "@/components/math/LiveTwentyFrame";
import { LiveHundredField } from "@/components/math/LiveHundredField";
import { DiceDisplay, DiceGroup } from "@/components/math/DiceDisplay";
import { FingerHands } from "@/components/math/FingerHands";
import { LogOut, Star, Trophy, Target, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  numberRange: 20 | 100;
  placeholderPosition?: 'start' | 'middle' | 'end' | 'none';
  attemptNumber?: number; // Added to track attempts
}

interface TurningPoint {
  number: number;
  label: string;
  color: string;
}

export default function PracticeOptimized() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Progress tracking
  const [totalTasks, setTotalTasks] = useState(0);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [stars, setStars] = useState(0);

  // Display mode: 'circle', 'dice', 'mixed', 'random'
  const [displayMode, setDisplayMode] = useState<'circle' | 'dice' | 'mixed' | 'random'>('mixed');

  // Create session on mount
  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const response = await apiRequest('POST', '/api/sessions', {
        sessionType: 'practice',
        numberRange: 20
      });
      const data = await response.json();
      setSessionId(data.id);
      loadTask();
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const loadTask = async () => {
    try {
      // Pass previous task to prevent duplicates
      const previousTaskData = currentTask ? {
        number1: currentTask.number1,
        number2: currentTask.number2,
        operation: currentTask.operation
      } : null;
      
      const response = await apiRequest('POST', '/api/neural/task', {
        previousTask: previousTaskData
      });
      const taskData = await response.json();

      setCurrentTask({ ...taskData.task, attemptNumber: 1 }); // Reset attempt number for new task
      setAnswer("");
      setStartTime(Date.now());

      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Failed to load task:", error);
    }
  };

  const handleSubmit = async () => {
    if (!currentTask || !sessionId || !answer) return;

    setIsSubmitting(true);
    const timeTaken = (Date.now() - startTime) / 1000;

    const correctAnswer = currentTask.operation === '+' 
      ? currentTask.number1 + currentTask.number2
      : currentTask.number1 - currentTask.number2;

    const isCorrect = parseInt(answer) === correctAnswer;

    try {
      await apiRequest('POST', '/api/neural/complete', {
        sessionId,
        task: currentTask,
        studentAnswer: parseInt(answer),
        isCorrect,
        timeTaken,
        strategyUsed: 'unknown',
        representationsUsed: ['twentyFrame', 'numberLine'],
        solutionSteps: []
      });

      // Update stats
      setTotalTasks(prev => prev + 1); // Increment total tasks for every attempt logged
      if (isCorrect) {
        setCorrectTasks(prev => prev + 1);
        setCurrentStreak(prev => prev + 1);
        setStars(prev => prev + 1);

        toast({
          title: "Richtig! ✨",
          description: `${currentStreak + 1} in Folge!`,
        });

        // Load next task only if correct
        setTimeout(() => {
          loadTask();
          setIsSubmitting(false);
        }, 1500);
      } else {
        setCurrentStreak(0);
        toast({
          title: "Noch nicht ganz",
          description: `Richtig wäre: ${correctAnswer}`,
          variant: "destructive"
        });

        // If incorrect, increment attempt number and allow resubmission of the same task
        setCurrentTask(prev => prev ? {
          ...prev,
          attemptNumber: (prev.attemptNumber || 1) + 1
        } : prev);
        setIsSubmitting(false); // Allow resubmission
      }

    } catch (error) {
      console.error("Failed to submit:", error);
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer && !isSubmitting) {
      handleSubmit();
    }
  };

  // Calculate turning points for current task
  const getTurningPoints = (): TurningPoint[] => {
    if (!currentTask) return [];

    const points: TurningPoint[] = [];
    const { number1, number2, operation } = currentTask;
    const result = operation === '+' ? number1 + number2 : number1 - number2;

    // Add current task numbers first
    points.push({ 
      number: number1, 
      label: `Start: ${number1}`, 
      color: "bg-red-500" 
    });

    if (number2 > 0) {
      points.push({ 
        number: number2, 
        label: operation === '+' ? `Addiere: ${number2}` : `Subtrahiere: ${number2}`, 
        color: "bg-blue-500" 
      });
    }

    if (result <= 20) {
      points.push({ 
        number: result, 
        label: `Ergebnis: ${result}`, 
        color: "bg-green-500" 
      });
    }

    // Add multiples of 5 if not already present
    for (let i = 5; i <= 20; i += 5) {
      if (!points.find(p => p.number === i)) {
        if (i === 10) {
          points.push({ number: i, label: "Zehner 🎯", color: "bg-orange-500" });
        } else {
          points.push({ number: i, label: `Fünfer (${i})`, color: "bg-gray-400" });
        }
      }
    }

    return points.sort((a, b) => a.number - b.number);
  };

  if (!currentTask) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Aufgabe wird geladen...</p>
        </div>
      </div>
    );
  }

  const correctAnswer = currentTask.operation === '+' 
    ? currentTask.number1 + currentTask.number2
    : currentTask.number1 - currentTask.number2;

  const turningPoints = getTurningPoints();
  const accuracy = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" data-testid="practice-optimized">

      {/* ===== TOP QUARTER (25%): Progress, Stars, Logout ===== */}
      <div className="h-[25vh] border-b-2 border-border bg-muted/20 flex items-center px-8">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-8">

          {/* Left: User info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.firstName?.[0] || user?.username?.[0] || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
              </h2>
              <p className="text-sm text-muted-foreground">Zahlenraum bis 20</p>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="flex-1 max-w-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Fortschritt</span>
                <span className="text-muted-foreground">{totalTasks} Aufgaben</span>
              </div>
              <Progress value={accuracy} className="h-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{accuracy.toFixed(0)}% richtig</span>
                <span>{currentStreak} in Folge 🔥</span>
              </div>
            </div>
          </div>

          {/* Center: Username */}
          <div className="absolute left-1/2 -translate-x-1/2 text-lg font-medium text-muted-foreground">
            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
          </div>

          {/* Right: Stars & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/10 px-6 py-3 rounded-lg border-2 border-yellow-500/30">
              <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
              <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stars}</span>
            </div>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="lg"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {currentTask.numberRange === 20 ? (
        // ===== ZR20 LAYOUT (3 sections) =====
        <>
          {/* TOP SECTION (25%): 20er Field */}
          <div className="h-[25vh] border-b-2 border-border bg-muted/10 p-4 flex items-center justify-center">
            <LiveTwentyFrame
              number1={currentTask.number1}
              number2={currentTask.number2}
              operation={currentTask.operation}
            />
          </div>

          {/* MIDDLE SECTION (50%): Left (Dice) | Center (Input) | Right (Fingers) */}
          <div className="h-[50vh] border-b-2 border-border flex">
            {/* LEFT: Dice Display */}
            <div className="w-1/4 border-r-2 border-border bg-muted/10 p-4 flex flex-col items-center justify-center">
              <DiceGroup
                total={correctAnswer}
                firstPart={currentTask.number1}
                secondPart={currentTask.number2}
                operation={currentTask.operation}
                firstColor="red"
                secondColor="blue"
                size="md"
              />
            </div>

            {/* CENTER: Calculation & Input */}
            <div className="w-1/2 border-r-2 border-border bg-background p-6 flex flex-col items-center justify-center">
              <div className="mb-6 text-center">
                <div className="text-6xl font-bold flex items-center justify-center gap-3 mb-4" style={{ fontFamily: 'Courier New, monospace', letterSpacing: '0.05em' }}>
                  <span className="text-red-500">{currentTask.number1}</span>
                  <span className="text-muted-foreground">{currentTask.operation}</span>
                  <span className="text-blue-500">{currentTask.number2}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-green-500">?</span>
                </div>
              </div>

              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                  className={cn(
                    "w-40 h-20 text-center text-5xl font-bold",
                    "border-4 border-primary rounded-lg",
                    "focus:outline-none focus:ring-4 focus:ring-primary/50",
                    "bg-card",
                    "transition-all",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder=""
                  data-testid="input-answer"
                  autoFocus
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!answer || isSubmitting}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
                data-testid="button-submit"
              >
                {isSubmitting ? "Prüfe..." : "Antwort prüfen"}
              </Button>
            </div>

            {/* RIGHT: Fingers */}
            <div className="w-1/4 bg-muted/10 p-4 flex flex-col items-center justify-center">
              <FingerHands
                number1={currentTask.number1}
                number2={currentTask.number2}
                operation={currentTask.operation}
                className="scale-75"
              />
            </div>
          </div>

          {/* BOTTOM SECTION (25%): Number Line */}
          <div className="h-[25vh] bg-muted/10 p-4 flex flex-col items-center justify-center">
            <LiveNumberLine points={turningPoints} />
          </div>
        </>
      ) : (
        // ===== ZR100+ LAYOUT (2 sections only) =====
        <>
          {/* TOP SECTION (50%): 100er Field with Input */}
          <div className="h-[50vh] border-b-2 border-border flex">
            {/* LEFT: 100er Field */}
            <div className="w-1/2 border-r-2 border-border bg-muted/10 p-4 flex flex-col items-center justify-center">
              <LiveHundredField
                number1={currentTask.number1}
                number2={currentTask.number2}
                operation={currentTask.operation}
              />
            </div>

            {/* RIGHT: Calculation & Input */}
            <div className="w-1/2 bg-background p-6 flex flex-col items-center justify-center">
              <div className="mb-6 text-center">
                <div className="text-7xl font-bold flex items-center justify-center gap-4 mb-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-red-500">{currentTask.number1}</span>
                  <span className="text-muted-foreground">{currentTask.operation}</span>
                  <span className="text-blue-500">{currentTask.number2}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-green-500">?</span>
                </div>
              </div>

              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                  className={cn(
                    "w-48 h-24 text-center text-6xl font-bold",
                    "border-4 border-primary rounded-lg",
                    "focus:outline-none focus:ring-4 focus:ring-primary/50",
                    "bg-card",
                    "transition-all",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder=""
                  data-testid="input-answer"
                  autoFocus
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!answer || isSubmitting}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
                data-testid="button-submit"
              >
                {isSubmitting ? "Prüfe..." : "Antwort prüfen"}
              </Button>
            </div>
          </div>

          {/* BOTTOM SECTION (50%): Number Line */}
          <div className="h-[50vh] bg-muted/10 p-4 flex flex-col items-center justify-center">
            <ExtendedNumberLine 
              number1={currentTask.number1}
              number2={currentTask.number2}
              operation={currentTask.operation}
              max={100}
            />
          </div>
        </>
      )}
    </div>
  );
}
