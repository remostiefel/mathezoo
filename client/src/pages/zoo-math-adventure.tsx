import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Sparkles, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZOO_ADVENTURE_LEVELS, type ZooAdventureLevel } from "@shared/game-levels";

export default function ZooMathAdventure() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'countdown' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentTask, setCurrentTask] = useState<{ number1: number; number2: number; operation: '+' | '-' } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [lastUserAnswer, setLastUserAnswer] = useState<number | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<number | null>(null);

  const currentLevelConfig = ZOO_ADVENTURE_LEVELS?.[selectedLevel - 1];
  const TASKS_PER_SESSION = 6;

  // Countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setCurrentTask(null);
    }
  }, [gameState, countdown]);

  // Task generation
  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      generateTask();
    }
  }, [gameState, currentTask]);

  // Global ENTER key handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showErrorScreen && e.key === 'Enter') {
        e.preventDefault();
        setShowErrorScreen(false);
        if (currentTaskIndex + 1 >= TASKS_PER_SESSION) {
          setGameState('end');
        } else {
          setCurrentTaskIndex(prev => prev + 1);
          setUserInput('');
          setCurrentTask(null);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showErrorScreen, currentTaskIndex, TASKS_PER_SESSION]);

  const generateTask = async () => {
    try {
      const response = await fetch('/api/zoo/task-by-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedLevel }),
        credentials: 'include'
      });
      if (!response.ok) return;
      const taskData = await response.json();
      setCurrentTask({ number1: taskData.number1, number2: taskData.number2, operation: taskData.operation });
    } catch (error) {
      console.error('Error generating task:', error);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentTask || !userInput.trim()) return;
    const correctAnswer = currentTask.operation === '+' ? currentTask.number1 + currentTask.number2 : currentTask.number1 - currentTask.number2;
    const userAnswer = parseInt(userInput);
    if (userAnswer === correctAnswer) {
      setScore(prev => prev + 1);
      setTimeout(() => {
        if (currentTaskIndex + 1 >= TASKS_PER_SESSION) {
          setGameState('end');
        } else {
          setCurrentTaskIndex(prev => prev + 1);
          setUserInput('');
          setCurrentTask(null);
        }
      }, 500);
    } else {
      setLastUserAnswer(userAnswer);
      setLastCorrectAnswer(correctAnswer);
      setShowErrorScreen(true);
    }
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('countdown');
    setCountdown(3);
    setCurrentTaskIndex(0);
    setScore(0);
    setCurrentTask(null);
    setUserInput('');
    setShowErrorScreen(false);
  };

  const restartGame = () => {
    setGameState('level-select');
    setCurrentTaskIndex(0);
    setScore(0);
    setCurrentTask(null);
    setUserInput('');
    setShowErrorScreen(false);
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-6">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setLocation('/games')} data-testid="button-back-games"><ArrowLeft className="w-4 h-4 mr-2" />Spiele</Button>
          <Button variant="outline" onClick={() => setLocation('/student')} data-testid="button-home"><Home className="w-4 h-4 mr-2" />Home</Button>
        </div>
        <div className="flex items-center justify-center">
          <Card className="max-w-3xl w-full shadow-2xl border-4 border-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-8xl mb-4">🦁🦒🐘</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Zoo Mathe-Abenteuer</h1>
              <p className="text-xl text-gray-700">Erkunde die Gehege und löse Rechenaufgaben!</p>
              <Button size="lg" onClick={() => setGameState('level-select')} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">Spielen starten!</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Level Select
  if (gameState === 'level-select') {
    if (!ZOO_ADVENTURE_LEVELS || ZOO_ADVENTURE_LEVELS.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full shadow-2xl border-4 border-white">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-2xl font-bold text-red-600">Fehler beim Laden der Level</p>
              <Button onClick={() => setGameState('start')}>Zurück</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setGameState('start')} data-testid="button-back-start"><ArrowLeft className="w-4 h-4 mr-2" />Zurück</Button>
          <h1 className="text-3xl font-bold text-gray-800">Wähle ein Level</h1>
          <div className="w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {ZOO_ADVENTURE_LEVELS?.map((level) => (
            <Card key={level.level} className="cursor-pointer hover:scale-105 transition-transform hover:shadow-xl border-4 border-white" onClick={() => startGameWithLevel(level.level)} data-testid={`button-level-${level.level}`}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-6xl mb-2">{level.icon}</div>
                <h3 className="text-2xl font-bold">Level {level.level}</h3>
                <p className="font-semibold text-lg text-blue-700">{level.name}</p>
                <p className="text-sm text-gray-600">{level.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Countdown
  if (gameState === 'countdown') {
    if (!currentLevelConfig) return null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl font-bold text-white mb-4 animate-bounce">{countdown}</div>
          <p className="text-2xl text-white font-semibold">{currentLevelConfig.name}</p>
        </div>
      </div>
    );
  }

  // End Screen
  if (gameState === 'end') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-green-200 to-blue-200 p-6">
        <div className="flex items-center justify-center">
          <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-9xl mb-4 animate-bounce">🏆</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Level {selectedLevel} geschafft!</h1>
              <div className="bg-white/80 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                  <div className="text-6xl font-bold">{score}</div>
                  <span className="text-2xl text-gray-600">/ {TASKS_PER_SESSION}</span>
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: Math.min(5, score) }).map((_, idx) => (<Star key={idx} className="w-8 h-8 fill-yellow-400 text-yellow-400" />))}
                </div>
                {score >= TASKS_PER_SESSION * 0.8 && <div className="text-3xl text-green-600 font-bold flex items-center justify-center gap-2"><Sparkles className="w-10 h-10" />Ausgezeichnet!<Sparkles className="w-10 h-10" /></div>}
              </div>
              <div className="space-y-3">
                <Button size="lg" onClick={restartGame} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" data-testid="button-play-again">Anderes Level wählen</Button>
                <Button variant="outline" onClick={() => setLocation('/games')} className="w-full" data-testid="button-back-games-end"><ArrowLeft className="w-4 h-4 mr-2" />Zurück zu Spielen</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing' && currentTask) {
    if (!currentLevelConfig) return null;
    const correctAnswer = currentTask.operation === '+' ? currentTask.number1 + currentTask.number2 : currentTask.number1 - currentTask.number2;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <nav className="flex justify-between items-center p-5 rounded-2xl mb-6 shadow-xl border-2 border-white/40 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/student')} className="text-primary" data-testid="button-home-nav"><Home className="w-6 h-6" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setLocation('/games')} className="text-primary" data-testid="button-games-nav"><ArrowLeft className="w-6 h-6" /></Button>
          </div>
          <h1 className="text-3xl font-bold text-primary">{currentLevelConfig.icon} {currentLevelConfig.name}</h1>
          <Button variant="outline" onClick={restartGame} data-testid="button-quit"><ArrowLeft className="w-4 h-4 mr-2" />Beenden</Button>
        </nav>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border-4 border-white">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">Aufgabe {currentTaskIndex + 1} / {TASKS_PER_SESSION}</div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-xs text-muted-foreground">Richtig</div>
                </div>
                <div className="flex gap-1">
                  {[...Array(TASKS_PER_SESSION)].map((_, i) => (<div key={i} className={cn("w-3 h-3 rounded-full", i < currentTaskIndex ? "bg-green-500" : "bg-gray-300")} />))}
                </div>
              </div>
            </div>
            <Progress value={(currentTaskIndex / TASKS_PER_SESSION) * 100} className="h-2 mt-3" />
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border-4 border-white">
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="text-8xl font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentTask.number1}</div>
                  <div className="text-8xl font-bold text-gray-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentTask.operation}</div>
                  <div className="text-8xl font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentTask.number2}</div>
                  <div className="text-8xl font-bold text-gray-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>=</div>
                </div>
                <div className="flex justify-center gap-4">
                  <input type="text" inputMode="numeric" value={userInput} onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))} onKeyPress={(e) => { if (e.key === 'Enter' && userInput.trim()) handleSubmitAnswer(); }} placeholder="" className="w-40 h-24 text-center text-6xl font-bold border-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/30 shadow-lg bg-white border-primary" autoFocus data-testid="input-answer" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  <Button size="lg" onClick={handleSubmitAnswer} disabled={!userInput.trim()} className="text-xl px-12 py-6 h-auto" data-testid="button-submit-answer">Prüfen ✓</Button>
                </div>
                <p className="text-lg text-muted-foreground font-semibold">Drücke ENTER zum Einreichen</p>
              </div>
              {showErrorScreen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
                  <div className="max-w-3xl w-full mx-4 bg-white rounded-3xl p-12 shadow-2xl space-y-8">
                    <div className="text-center">
                      <div className="text-7xl mb-4">❌</div>
                      <h2 className="text-4xl font-bold text-red-600">Leider falsch!</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-red-50 border-4 border-red-400 rounded-2xl p-8">
                        <p className="text-2xl text-red-700 font-bold mb-4">Deine Antwort:</p>
                        <div className="text-6xl font-bold text-red-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {currentTask.number1}{currentTask.operation}{currentTask.number2}={lastUserAnswer}
                        </div>
                      </div>

                      <div className="bg-green-50 border-4 border-green-400 rounded-2xl p-8">
                        <p className="text-2xl text-green-700 font-bold mb-4">Richtige Antwort:</p>
                        <div className="text-6xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {currentTask.number1}{currentTask.operation}{currentTask.number2}={lastCorrectAnswer}
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-4 border-t-2 border-gray-300">
                      <p className="text-xl text-gray-600 font-semibold">Drücke ENTER zum Fortfahren →</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
