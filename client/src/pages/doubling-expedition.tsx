import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Home, LogOut, Sparkles, Zap, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZooFeedback } from "@/components/zoo/ZooFeedback";
import { useAuth } from "@/hooks/useAuth";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { DOUBLING_LEVELS, type DoublingLevel } from "@shared/game-levels";
import { AppHeader } from "@/components/ui/app-header";

type AnimalType = 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'monkey' | 'panda' | 'koala' | 'penguin' | 'fox' | 'rabbit';

interface GameTask {
  number1: number;
  number2: number;
  correctAnswer: number;
  animal: AnimalType;
  taskType: 'pure-doubling' | 'near-doubling' | 'halving';
  hint?: string;
}

interface GameStats {
  tasksCompleted: number;
  correctAnswers: number;
  doublingsMastered: number;
  fastestTime: number;
  streak: number;
}

const ANIMALS: { type: AnimalType; emoji: string; name: string; color: string }[] = [
  { type: 'lion', emoji: '🦁', name: 'Löwe', color: 'from-yellow-400 to-orange-500' },
  { type: 'elephant', emoji: '🐘', name: 'Elefant', color: 'from-gray-400 to-gray-600' },
  { type: 'giraffe', emoji: '🦒', name: 'Giraffe', color: 'from-amber-300 to-yellow-500' },
  { type: 'zebra', emoji: '🦓', name: 'Zebra', color: 'from-slate-300 to-slate-700' },
  { type: 'monkey', emoji: '🐵', name: 'Affe', color: 'from-orange-400 to-red-500' },
  { type: 'panda', emoji: '🐼', name: 'Panda', color: 'from-green-400 to-emerald-600' },
  { type: 'koala', emoji: '🐨', name: 'Koala', color: 'from-blue-300 to-cyan-500' },
  { type: 'penguin', emoji: '🐧', name: 'Pinguin', color: 'from-indigo-400 to-purple-500' },
  { type: 'fox', emoji: '🦊', name: 'Fuchs', color: 'from-red-400 to-pink-500' },
  { type: 'rabbit', emoji: '🐰', name: 'Hase', color: 'from-pink-300 to-purple-400' }
];

export default function DoublingExpedition() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addXPToTeam } = useAnimalTeam();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<GameStats>({ 
    tasksCompleted: 0, 
    correctAnswers: 0, 
    doublingsMastered: 0,
    fastestTime: Infinity,
    streak: 0
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [discoveredStrategy, setDiscoveredStrategy] = useState(false);
  const [collectedAnimals, setCollectedAnimals] = useState<AnimalType[]>([]);

  const currentLevelConfig = DOUBLING_LEVELS[selectedLevel - 1];

  const generateTask = () => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const [minNum, maxNum] = currentLevelConfig.numberRange;
    const baseNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    let task: GameTask;

    // Wähle zufällig einen taskType aus den verfügbaren taskTypes des Levels
    const availableTaskTypes = currentLevelConfig.taskTypes;
    const selectedTaskType = availableTaskTypes[Math.floor(Math.random() * availableTaskTypes.length)];

    if (selectedTaskType === 'pure-doubling') {
      // Reine Verdopplung: n + n
      task = {
        number1: baseNumber,
        number2: baseNumber,
        correctAnswer: baseNumber * 2,
        animal: randomAnimal.type,
        taskType: 'pure-doubling',
        hint: `Zwei gleiche Gruppen! ${baseNumber} + ${baseNumber} = ?`
      };
    } else if (selectedTaskType === 'near-doubling') {
      // Fast-Verdopplung: n + (n±1)
      const offset = Math.random() > 0.5 ? 1 : -1;
      const secondNumber = baseNumber + offset;
      task = {
        number1: baseNumber,
        number2: secondNumber,
        correctAnswer: baseNumber + secondNumber,
        animal: randomAnimal.type,
        taskType: 'near-doubling',
        hint: offset > 0 
          ? `Fast gleich! ${baseNumber} + ${baseNumber} + 1 = ?`
          : `Fast gleich! ${baseNumber} + ${baseNumber} - 1 = ?`
      };
    } else {
      // Halbieren: n = ? * 2
      const halfNumber = Math.floor(baseNumber / 2);
      const wholeNumber = halfNumber * 2; // Stelle sicher, dass es eine gerade Zahl ist
      task = {
        number1: wholeNumber,
        number2: 0, // Dummy-Wert
        correctAnswer: halfNumber,
        animal: randomAnimal.type,
        taskType: 'halving',
        hint: `Halbieren! ${wholeNumber} : 2 = ?`
      };
    }

    setCurrentTask(task);
    setUserInput('');
    setFeedback(null);
    setTaskStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!currentTask || !userInput) return;

    const answer = parseInt(userInput, 10);
    const isCorrect = answer === currentTask.correctAnswer;
    const timeTaken = (Date.now() - taskStartTime) / 1000;

    if (isCorrect) {
      setFeedback('correct');
      setStreak(prev => prev + 1); // Increment streak

      // Stats updaten
      const newStats = {
        tasksCompleted: stats.tasksCompleted + 1,
        correctAnswers: stats.correctAnswers + 1,
        doublingsMastered: currentTask.taskType === 'pure-doubling' 
          ? stats.doublingsMastered + 1 
          : stats.doublingsMastered,
        fastestTime: Math.min(stats.fastestTime, timeTaken),
        streak: streak + 1 // Update streak in stats as well
      };
      setStats(newStats);

      // Strategie-Entdeckung bei Fast-Verdopplungen
      if (currentTask.taskType === 'near-doubling' && !discoveredStrategy && timeTaken < 5) {
        setDiscoveredStrategy(true);
        setTimeout(() => setDiscoveredStrategy(false), 3000);
      }

      // Celebration bei 5, 10, 15 Aufgaben
      if (newStats.correctAnswers % 5 === 0) {
        // Belohne mit Tier
        const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)].type;
        setCollectedAnimals(prev => [...prev, randomAnimal]);

        // Speichere Tier
        if (user?.id) {
          fetch('/api/zoo/animals/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: user.id,
              animalType: randomAnimal
            })
          }).catch(err => console.error('Fehler beim Speichern:', err));
        }

        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      setTimeout(() => generateTask(), 800);
    } else {
      setFeedback('wrong');
      setStreak(0); // Reset streak on wrong answer
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
    setStats({ tasksCompleted: 0, correctAnswers: 0, doublingsMastered: 0, fastestTime: Infinity, streak: 0 });
    setStreak(0);
    setCollectedAnimals([]);
  };

  const restartGame = () => {
    // XP an Team vergeben vor Neustart
    if (user?.id && stats.correctAnswers > 0) {
      const successRate = stats.correctAnswers / Math.max(stats.tasksCompleted, 1);
      addXPToTeam(successRate, selectedLevel);
    }
    
    setGameState('start');
    setStats({ tasksCompleted: 0, correctAnswers: 0, doublingsMastered: 0, fastestTime: Infinity, streak: 0 });
    setCollectedAnimals([]);
  };


  // Generate task when playing starts
  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      generateTask();
    }
  }, [gameState, currentTask]);

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setLocation('/games')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/games/doubling-expedition')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
          }}>
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
        <div className="flex items-center justify-center">
        <Card className="max-w-2xl w-full border">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4 animate-bounce">🐘🐘✨</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verdopplungs-Expedition
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Entdecke die Macht der Verdopplung!
            </p>

            <div className="space-y-3 text-left bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-4 border-purple-300">
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">👯</span> Tier-Familien haben immer Zwillinge!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⚡</span> Nutze Verdopplungen zum schnellen Rechnen
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🎯</span> Fast-Verdopplungen: 5+6 = 5+5+1
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🏆</span> 8 Level mit steigender Schwierigkeit
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⏱️</span> Wie schnell erkennst du das Muster?
              </p>
            </div>

            <Button
              onClick={() => setGameState('level-select')}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              Level wählen!
            </Button>

            </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Level Selection
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/games/doubling-expedition')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="border mb-4">
            <CardContent className="p-6">
              <div className="text-6xl text-center mb-4">⚡</div>
              <h2 className="text-3xl font-bold text-center mb-6">Wähle dein Level</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOUBLING_LEVELS.map((lvl) => (
                  <Button
                    key={lvl.level}
                    onClick={() => startGameWithLevel(lvl.level)}
                    variant={selectedLevel === lvl.level ? 'default' : 'outline'}
                    className="h-24 flex flex-col gap-1"
                    data-testid={`button-level-${lvl.level}`}
                  >
                    <span className="text-3xl">{lvl.icon}</span>
                    <span className="text-lg font-bold">Level {lvl.level}</span>
                    <span className="text-xs">{lvl.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={() => setGameState('start')}
            className="w-full"
            data-testid="button-back"
          >
            Zurück
          </Button>
        </div>
      </div>
    );
  }


  // Playing Screen
  const currentAnimal = ANIMALS.find(a => a.type === currentTask?.animal);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Spiele
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLocation('/games/doubling-expedition')}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button variant="outline" size="sm" onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          window.location.href = '/login';
        }}>
          <LogOut className="w-4 h-4 mr-2" />
          Abmelden
        </Button>
      </div>
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-9xl animate-bounce">🎉⚡🎉</div>
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              Super Fortschritt!
            </div>
          </div>
        </div>
      )}

      {/* Strategy Discovery */}
      {discoveredStrategy && (
        <div className="fixed top-4 right-4 z-40 animate-in slide-in-from-right duration-500">
          <Card className="border-4 border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100">
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-bold text-yellow-700">Blitz-Strategie entdeckt!</p>
                <p className="text-sm text-yellow-600">Du nutzt die Verdopplung! ⚡</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-primary flex items-center gap-2">
                  <span className="text-3xl">{currentLevelConfig.icon}</span>
                  Level {selectedLevel}: {currentLevelConfig.name}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Korrekt: {stats.correctAnswers}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(stats.correctAnswers / 5) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <div className="font-semibold mt-1 flex items-center gap-1">
                    Streak: {stats.streak}
                    {stats.streak > 0 && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse"/>}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation('/games/doubling-expedition')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Beenden
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Task Display */}
          <Card className="shadow-2xl border-4 border-white">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="text-sm text-muted-foreground mb-4">
                  {currentTask?.hint}
                </div>

                {/* Twin Groups / Halving Visualization */}
                {currentTask?.taskType === 'halving' ? (
                  // Halving: Single group to split
                  <div className="flex justify-center mb-6">
                    <div className={cn(
                      "p-6 rounded-2xl bg-gradient-to-br border-4 border-dashed border-white",
                      currentAnimal?.color
                    )}>
                      <div className="flex flex-wrap gap-2 max-w-xs justify-center">
                        {[...Array(currentTask?.number1 || 0)].map((_, i) => (
                          <div key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                            {currentAnimal?.emoji}
                          </div>
                        ))}
                      </div>
                      <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                        {currentTask?.number1} {(() => {
                          const count = currentTask?.number1 || 0;
                          const name = currentAnimal?.name || '';
                          if (count === 1) return name;

                          const plurals: Record<string, string> = {
                            'Zebra': 'Zebras',
                            'Panda': 'Pandas',
                            'Koala': 'Koalas',
                            'Giraffe': 'Giraffen',
                            'Affe': 'Affen',
                            'Löwe': 'Löwen',
                            'Elefant': 'Elefanten',
                            'Pinguin': 'Pinguine',
                            'Fuchs': 'Füchse',
                            'Hase': 'Hasen'
                          };

                          return plurals[name] || name + 's';
                        })()}
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        ➗ Teile in 2 Gruppen!
                      </div>
                    </div>
                  </div>
                ) : (
                  // Doubling: Two groups
                  <div className="flex justify-center gap-8 mb-6">
                    {/* Group 1 */}
                    <div className={cn(
                      "p-6 rounded-2xl bg-gradient-to-br border-4 border-dashed border-white",
                      currentAnimal?.color
                    )}>
                      <div className="flex flex-wrap gap-2 max-w-xs justify-center">
                        {[...Array(currentTask?.number1 || 0)].map((_, i) => (
                          <div key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                            {currentAnimal?.emoji}
                          </div>
                        ))}
                      </div>
                      <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                        {currentTask?.number1} {(() => {
                          const count = currentTask?.number1 || 0;
                          const name = currentAnimal?.name || '';
                          if (count === 1) return name;

                          const plurals: Record<string, string> = {
                            'Zebra': 'Zebras',
                            'Panda': 'Pandas',
                            'Koala': 'Koalas',
                            'Giraffe': 'Giraffen',
                            'Affe': 'Affen',
                            'Löwe': 'Löwen',
                            'Elefant': 'Elefanten',
                            'Pinguin': 'Pinguine',
                            'Fuchs': 'Füchse',
                            'Hase': 'Hasen'
                          };

                          return plurals[name] || name + 's';
                        })()}
                      </div>
                    </div>

                    {/* Plus Symbol */}
                    <div className="flex items-center">
                      <div className="text-6xl font-bold text-purple-600">+</div>
                    </div>

                    {/* Group 2 */}
                    <div className={cn(
                      "p-6 rounded-2xl bg-gradient-to-br border-4 border-dashed",
                      currentTask?.number1 === currentTask?.number2 
                        ? "border-white" 
                        : "border-yellow-400",
                      currentAnimal?.color
                    )}>
                      <div className="flex flex-wrap gap-2 max-w-xs justify-center">
                        {[...Array(currentTask?.number2 || 0)].map((_, i) => (
                          <div key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                            {currentAnimal?.emoji}
                          </div>
                        ))}
                      </div>
                      <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">
                        {currentTask?.number2} {(() => {
                          const count = currentTask?.number2 || 0;
                          const name = currentAnimal?.name || '';
                          if (count === 1) return name;

                          const plurals: Record<string, string> = {
                            'Zebra': 'Zebras',
                            'Panda': 'Pandas',
                            'Koala': 'Koalas',
                            'Giraffe': 'Giraffen',
                            'Affe': 'Affen',
                            'Löwe': 'Löwen',
                            'Elefant': 'Elefanten',
                            'Pinguin': 'Pinguine',
                            'Fuchs': 'Füchse',
                            'Hase': 'Hasen'
                          };

                          return plurals[name] || name + 's';
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="space-y-4">
                  <div className="text-2xl font-semibold">
                    {currentTask?.taskType === 'halving' 
                      ? `${currentTask?.number1} : 2 = ?`
                      : `${currentTask?.number1} + ${currentTask?.number2} = ?`
                    }
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={userInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 2) setUserInput(val);
                      }}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "w-24 h-24 text-center text-5xl font-bold border-4 rounded-xl",
                        "focus:outline-none focus:ring-4 transition-all",
                        feedback === 'correct' && "bg-green-100 border-green-500 ring-green-300",
                        feedback === 'wrong' && "bg-red-100 border-red-500 ring-red-300 animate-shake",
                        !feedback && "border-primary focus:ring-primary/50"
                      )}
                      placeholder="?"
                      autoFocus
                    />

                    <Button
                      onClick={handleSubmit}
                      disabled={!userInput}
                      size="lg"
                      className="h-24 px-8 text-2xl bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      ✓
                    </Button>
                  </div>

                  {/* Feedback - removed per user request */}
                  {/* <ZooFeedback 
                    show={feedback === 'correct'} 
                    duration={800}
                  /> */}
                  {feedback === 'wrong' && (
                    <div className="text-xl text-red-600 font-semibold">
                      Nicht ganz! Die Antwort war {currentTask?.correctAnswer}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Strategy Helper & Stats */}
          <Card className="shadow-2xl border-4 border-white">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    Verdopplungs-Tricks
                  </div>
                </div>

                {/* Strategy Cards */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">👯</span>
                      <span className="font-bold text-purple-700">Reine Verdopplung</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Zwei gleiche Zahlen: <strong>5 + 5 = 10</strong>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Einfach die Zahl verdoppeln!
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">⚡</span>
                      <span className="font-bold text-orange-700">Fast-Verdopplung (+1)</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Fast gleich: <strong>5 + 6 = ?</strong>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Denke: 5 + 5 = 10, dann +1 = <strong>11</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💡</span>
                      <span className="font-bold text-blue-700">Profi-Trick</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Bei 3 + 4 denke an 3 + 3 = 6, dann +1 = <strong>7</strong>
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                  <div className="text-lg font-bold mb-3 text-green-700">Deine Erfolge</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Korrekte Antworten:</span>
                      <span className="font-bold text-green-600">{stats.correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verdopplungen gemeistert:</span>
                      <span className="font-bold text-purple-600">{stats.doublingsMastered}</span>
                    </div>
                    {stats.fastestTime < Infinity && (
                      <div className="flex items-center justify-between">
                        <span>Schnellste Zeit:</span>
                        <span className="font-bold text-orange-600">{stats.fastestTime.toFixed(1)}s ⚡</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Aktueller Streak:</span>
                      <span className="font-bold flex items-center gap-1">
                        {stats.streak}
                        {stats.streak > 0 && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse"/>}
                      </span>
                    </div>
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}