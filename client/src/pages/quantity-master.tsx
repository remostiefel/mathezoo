
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, ChevronLeft, Trophy, Target, Home } from "lucide-react";

type TaskType = 'subitizing' | 'comparison' | 'seriation';

interface QuantityTask {
  type: TaskType;
  quantities: number[];
  correctAnswer: number | number[];
  displayTime?: number; // Für Subitizing (ms)
}

export default function QuantityMaster() {
  const { user } = useAuth();
  const [currentTask, setCurrentTask] = useState<QuantityTask | null>(null);
  const [taskType, setTaskType] = useState<TaskType>('subitizing');
  const [score, setScore] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [showDots, setShowDots] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Generiere Aufgabe basierend auf Typ
  const generateTask = (type: TaskType): QuantityTask => {
    switch (type) {
      case 'subitizing': {
        // Simultane Anzahlerfassung (1-8 Punkte)
        const quantity = Math.floor(Math.random() * 8) + 1;
        return {
          type: 'subitizing',
          quantities: [quantity],
          correctAnswer: quantity,
          displayTime: 300 // 3 Zehntelsekunden für alle Mengen
        };
      }
      case 'comparison': {
        // Mengenvergleich ohne Rechnen
        const qty1 = Math.floor(Math.random() * 15) + 1;
        let qty2 = Math.floor(Math.random() * 15) + 1;
        while (qty2 === qty1) qty2 = Math.floor(Math.random() * 15) + 1;
        return {
          type: 'comparison',
          quantities: [qty1, qty2],
          correctAnswer: Math.max(qty1, qty2)
        };
      }
      case 'seriation': {
        // Zahlen ordnen
        const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 20) + 1);
        const unique = Array.from(new Set(numbers));
        while (unique.length < 4) {
          unique.push(Math.floor(Math.random() * 20) + 1);
        }
        return {
          type: 'seriation',
          quantities: unique,
          correctAnswer: unique.sort((a, b) => a - b)
        };
      }
    }
  };

  useEffect(() => {
    startNewTask();
  }, [taskType]);

  const startNewTask = () => {
    const task = generateTask(taskType);
    setCurrentTask(task);
    setSelectedAnswer(null);
    setFeedback(null);
    setShowDots(true);

    // Bei Subitizing: Punkte nach kurzer Zeit ausblenden
    if (task.type === 'subitizing' && task.displayTime) {
      setTimeout(() => setShowDots(false), task.displayTime);
    }
  };

  const handleAnswer = (answer: number) => {
    if (!currentTask) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentTask.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(score + 1);
    }
    setTotalTasks(totalTasks + 1);

    setTimeout(() => startNewTask(), 1500);
  };

  // Keyboard handler für Zahleneingabe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentTask || showDots || feedback || taskType !== 'subitizing') return;
      
      const key = e.key;
      if (/^[1-8]$/.test(key)) {
        e.preventDefault();
        handleAnswer(parseInt(key));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTask, showDots, feedback, taskType]);

  const renderTask = () => {
    if (!currentTask) return null;

    switch (currentTask.type) {
      case 'subitizing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🎯 Blitzblick</h3>
              <p className="text-sm text-muted-foreground">Wie viele Punkte siehst du?</p>
            </div>
            
            {/* Punktedarstellung */}
            <div className="flex justify-center items-center min-h-[200px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
              {showDots ? (
                <div className="grid gap-4" style={{
                  gridTemplateColumns: `repeat(${Math.min(currentTask.quantities[0], 4)}, 1fr)`
                }}>
                  {Array.from({ length: currentTask.quantities[0] }).map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-6xl">❓</div>
              )}
            </div>

            {/* Tastatur-Eingabe Hinweis */}
            {!showDots && (
              <div className="text-center mt-8">
                <p className="text-base text-muted-foreground font-semibold">Drücke die Zahl auf der Tastatur...</p>
              </div>
            )}
          </div>
        );

      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">⚖️ Mengenvergleich</h3>
              <p className="text-sm text-muted-foreground">Wo sind mehr Tiere?</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {currentTask.quantities.map((qty, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedAnswer === qty ? 'ring-4 ring-primary' : ''
                  }`}
                  onClick={() => handleAnswer(qty)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Array.from({ length: qty }).map((_, i) => (
                        <span key={i} className="text-3xl">🦁</span>
                      ))}
                    </div>
                    <div className="text-center mt-4 text-2xl font-bold">{qty}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'seriation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🔢 Zahlen-Ordnung</h3>
              <p className="text-sm text-muted-foreground">Ordne von klein nach groß!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentTask.quantities.map((num) => (
                <Button
                  key={num}
                  size="lg"
                  variant="outline"
                  className="h-20 text-3xl font-bold"
                >
                  {num}
                </Button>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              (Drag & Drop folgt in Phase 2)
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/student'}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {score} / {totalTasks}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {totalTasks > 0 ? Math.round((score / totalTasks) * 100) : 0}%
            </Badge>
          </div>
        </div>

        {/* Task Type Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Mengen-Meister: Vorläuferfertigkeiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={taskType === 'subitizing' ? 'default' : 'outline'}
                onClick={() => setTaskType('subitizing')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Blitzblick
              </Button>
              <Button
                variant={taskType === 'comparison' ? 'default' : 'outline'}
                onClick={() => setTaskType('comparison')}
              >
                ⚖️ Vergleichen
              </Button>
              <Button
                variant={taskType === 'seriation' ? 'default' : 'outline'}
                onClick={() => setTaskType('seriation')}
              >
                🔢 Ordnen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Task Area */}
        <Card className="relative">
          <CardContent className="p-8">
            {renderTask()}

            {/* Feedback */}
            {feedback && (
              <div className={`absolute inset-0 flex items-center justify-center bg-white/95 rounded-lg ${
                feedback === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {feedback === 'correct' ? '✓' : '✗'}
                  </div>
                  <p className="text-2xl font-bold">
                    {feedback === 'correct' ? 'Richtig!' : 'Nicht ganz!'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Warum ist das wichtig?</strong> Diese Übungen trainieren grundlegende Fähigkeiten,
              die nach Dornheim (2008) starke Prädiktoren für spätere Rechenleistung sind:
              Mengenerfassung, Zahlenreihe und relationales Zahlverständnis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
