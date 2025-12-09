import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Zap, Brain, Sparkles, ChevronRight, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PATHFINDER_LEVELS, type PathfinderLevel } from "@shared/game-levels";

interface Strategy {
  id: string;
  name: string;
  icon: string;
  description: string;
  transformTask: (n1: number, n2: number, op: '+' | '-') => {
    display: string;
    explanation: string;
    steps: number;
  };
  eleganceScore: number; // 1-5
}

const ALL_STRATEGIES: Strategy[] = [
  {
    id: 'direct',
    name: 'Direkt rechnen',
    icon: '⚡',
    description: 'Einfach ausrechnen',
    transformTask: (n1, n2, op) => ({
      display: `${n1} ${op} ${n2} = ${op === '+' ? n1 + n2 : n1 - n2}`,
      explanation: 'Ich rechne es einfach direkt aus!',
      steps: 1
    }),
    eleganceScore: 2
  },
  {
    id: 'swap',
    name: 'Tauschen',
    icon: '🔄',
    description: 'Vertausche die Zahlen (3+8 → 8+3)',
    transformTask: (n1, n2, op) => ({
      display: op === '+' ? `${n2} + ${n1}` : `${n2} - ${n1}`,
      explanation: `Von der größeren Zahl aus rechnen ist oft leichter!`,
      steps: 2
    }),
    eleganceScore: 3
  },
  {
    id: 'helper_addition',
    name: 'Hilfs-Addition',
    icon: '➕',
    description: 'Nutze verwandte Plusaufgabe',
    transformTask: (n1, n2, op) => {
      if (op === '-') {
        return {
          display: `${n1 - n2} + ${n2} = ${n1}`,
          explanation: `Umkehraufgabe: Wenn ich ${n2} dazuzähle, komme ich wieder zu ${n1}!`,
          steps: 3
        };
      }
      return {
        display: `${n1} + ${n2}`,
        explanation: 'Direkt addieren',
        steps: 2
      };
    },
    eleganceScore: 4
  },
  {
    id: 'helper_subtraction',
    name: 'Hilfs-Subtraktion',
    icon: '➖',
    description: 'Nutze verwandte Minusaufgabe',
    transformTask: (n1, n2, op) => {
      if (op === '+') {
        const sum = n1 + n2;
        return {
          display: `${sum} - ${n1} = ${n2}`,
          explanation: `Wenn ich von ${sum} die ${n1} wegnehme, bleiben ${n2}!`,
          steps: 3
        };
      }
      return {
        display: `${n1} - ${n2}`,
        explanation: 'Direkt subtrahieren',
        steps: 2
      };
    },
    eleganceScore: 3
  },
  {
    id: 'decade_bridge',
    name: 'Über den Zehner',
    icon: '🌉',
    description: 'Zerlege zur nächsten 10',
    transformTask: (n1, n2, op) => {
      if (op === '+' && n1 + n2 > 10 && n1 < 10) {
        const toTen = 10 - n1;
        const remaining = n2 - toTen;
        return {
          display: `${n1} + ${toTen} = 10, dann 10 + ${remaining} = ${n1 + n2}`,
          explanation: `Erst zur 10, dann weiter!`,
          steps: 4
        };
      }
      return {
        display: `${n1} ${op} ${n2}`,
        explanation: 'Kein Zehnerübergang nötig',
        steps: 2
      };
    },
    eleganceScore: 5
  },
  {
    id: 'doubles',
    name: 'Verdoppeln',
    icon: '👯',
    description: 'Nutze Doppel-Tricks (5+6 = 5+5+1)',
    transformTask: (n1, n2, op) => {
      if (op === '+' && Math.abs(n1 - n2) <= 1) {
        const smaller = Math.min(n1, n2);
        return {
          display: `${smaller} + ${smaller} = ${smaller * 2}, dann +1 = ${n1 + n2}`,
          explanation: `Fast-Verdopplung: ${smaller}+${smaller} kenne ich auswendig!`,
          steps: 3
        };
      }
      return {
        display: `${n1} ${op} ${n2}`,
        explanation: 'Keine Verdopplung möglich',
        steps: 2
      };
    },
    eleganceScore: 5
  }
];

interface PathOption {
  strategy: Strategy;
  timeEstimate: number;
  stars: number;
  result: number;
}

export default function ZooPathfinder() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'countdown' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [currentTask, setCurrentTask] = useState<{
    num1: number;
    num2: number;
    operation: '+' | '-';
  } | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [pathOptions, setPathOptions] = useState<PathOption[]>([]);

  const currentLevelConfig = PATHFINDER_LEVELS[selectedLevel - 1];

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setCurrentTask(null); // Trigger task generation
    }
  }, [gameState, countdown]);

  // Task generation logic
  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      generateTask();
    }
  }, [gameState, currentTask]);

  // Generate path options when task changes
  useEffect(() => {
    if (currentTask && gameState === 'playing') {
      generatePathOptions();
    }
  }, [currentTask, gameState]);

  const generateTask = () => {
    const [minNum, maxNum] = currentLevelConfig.numberRange;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let num1: number, num2: number;

    if (operation === '+') {
      num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      num2 = Math.floor(Math.random() * (maxNum - num1)) + 1;
    } else {
      num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
    }

    setCurrentTask({ num1, num2, operation });
    setSelectedStrategy(null);
    setShowResult(false);
  };

  const generatePathOptions = () => {
    if (!currentTask) return;

    // Filter strategies based on elegance level
    const eligibleStrategies = ALL_STRATEGIES.filter(
      s => s.eleganceScore >= currentLevelConfig.minElegance
    );

    // Limit to strategyCount
    const selectedStrategies = eligibleStrategies.slice(0, currentLevelConfig.strategyCount);

    const options: PathOption[] = selectedStrategies.map(strategy => {
      const transformed = strategy.transformTask(
        currentTask.num1,
        currentTask.num2,
        currentTask.operation
      );
      
      // Calculate stars based on elegance and steps
      const stars = Math.max(1, Math.min(5, 
        Math.ceil((strategy.eleganceScore + (5 - transformed.steps)) / 2)
      ));
      
      // Time estimate based on steps
      const timeEstimate = transformed.steps * 2 + Math.random() * 2;
      
      return {
        strategy,
        timeEstimate,
        stars,
        result: currentTask.operation === '+' 
          ? currentTask.num1 + currentTask.num2 
          : currentTask.num1 - currentTask.num2
      };
    });

    // Sort by stars (best first)
    const sorted = options.sort((a, b) => b.stars - a.stars);
    setPathOptions(sorted);
  };

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setShowResult(true);
    
    const option = pathOptions.find(p => p.strategy.id === strategy.id);
    if (option) {
      setScore(prev => prev + option.stars * 10);
      setTotalStars(prev => prev + option.stars);
    }
  };

  const handleContinue = () => {
    if (currentTaskIndex + 1 >= currentLevelConfig.tasksPerRound) {
      setGameState('end');
    } else {
      setCurrentTaskIndex(prev => prev + 1);
      setCurrentTask(null); // Trigger new task generation
    }
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('countdown');
    setCountdown(3);
    setCurrentTaskIndex(0);
    setScore(0);
    setTotalStars(0);
    setCurrentTask(null);
  };

  const restartGame = () => {
    setGameState('level-select');
    setCurrentTaskIndex(0);
    setScore(0);
    setTotalStars(0);
    setCurrentTask(null);
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setLocation('/games')} data-testid="button-back-games">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')} data-testid="button-home">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
          }} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
        <div className="flex items-center justify-center">
          <Card className="max-w-3xl w-full shadow-2xl border-4 border-white">
            <CardHeader>
              <div className="text-center space-y-4">
                <div className="text-8xl mb-4">🦁🗺️🎯</div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Wege durch den Zoo
                </CardTitle>
                <p className="text-xl text-gray-700">
                  Finde den elegantesten Rechenweg!
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/80 rounded-xl p-6 space-y-4">
                <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <Brain className="w-8 h-8" />
                  So funktioniert's:
                </h3>
                
                <div className="space-y-3 text-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">1️⃣</span>
                    <div>
                      <p className="font-semibold">Aufgabe erscheint</p>
                      <p className="text-gray-600">z.B. 3 + 8 = ?</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-3xl">2️⃣</span>
                    <div>
                      <p className="font-semibold">Wähle deinen Weg!</p>
                      <p className="text-gray-600">Tauschen? Hilfsaufgabe? Über den Zehner?</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-3xl">3️⃣</span>
                    <div>
                      <p className="font-semibold">Sammle Sterne!</p>
                      <p className="text-gray-600">Elegante Wege = mehr Sterne ⭐⭐⭐⭐⭐</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300 rounded-xl p-4">
                <p className="text-center text-lg font-semibold text-orange-800">
                  💡 Es gibt oft mehrere richtige Wege – finde den besten!
                </p>
              </div>

              <Button
                onClick={() => setGameState('level-select')}
                size="lg"
                className="w-full text-2xl py-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                data-testid="button-start-game"
              >
                <Sparkles className="w-8 h-8 mr-3" />
                Safari starten!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Level Select Screen
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setGameState('start')} data-testid="button-back-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Wähle ein Level</h1>
          <div className="w-24"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PATHFINDER_LEVELS.map((level) => (
            <Card 
              key={level.level}
              className="cursor-pointer hover:scale-105 transition-transform hover:shadow-xl border-4 border-white"
              onClick={() => startGameWithLevel(level.level)}
              data-testid={`button-level-${level.level}`}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-6xl mb-2">{level.icon}</div>
                <h3 className="text-2xl font-bold">Level {level.level}</h3>
                <p className="font-semibold text-lg text-purple-700">{level.name}</p>
                <p className="text-sm text-gray-600">{level.description}</p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                  <span>🧠 {level.strategyCount} Strategien</span>
                  <span>📊 {level.numberRange[0]}-{level.numberRange[1]}</span>
                  <span>🎯 {level.tasksPerRound} Aufgaben</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Countdown Screen
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl font-bold text-white mb-4 animate-bounce">
            {countdown}
          </div>
          <p className="text-2xl text-white font-semibold">
            {currentLevelConfig.name}
          </p>
        </div>
      </div>
    );
  }

  // End Screen
  if (gameState === 'end') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center">
          <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-9xl mb-4 animate-bounce">🏆🎉🌟</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Safari abgeschlossen!
              </h1>

              <div className="bg-white/80 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                  <div className="text-6xl font-bold">{score}</div>
                  <span className="text-2xl text-gray-600">Punkte</span>
                </div>

                <div className="flex justify-center gap-1">
                  {Array.from({ length: Math.min(25, totalStars) }).map((_, idx) => (
                    <Star key={idx} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-xl text-gray-700">
                  Du hast {totalStars} Sterne gesammelt!
                </p>

                {totalStars >= currentLevelConfig.tasksPerRound * 3 && (
                  <div className="text-3xl text-green-600 font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-10 h-10" />
                    Strategie-Meister!
                    <Sparkles className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  data-testid="button-play-again"
                >
                  Anderes Level wählen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/games')}
                  className="w-full"
                  data-testid="button-back-games-end"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zu Spielen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing' && currentTask) {
    return (
      <div className="min-h-screen bg-background p-6 font-sans">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🗺️</span>
                  <div>
                    <h2 className="text-xl font-bold">Level {selectedLevel}: {currentLevelConfig.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentLevelConfig.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restartGame}
                  data-testid="button-quit"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Beenden
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Aufgabe {currentTaskIndex + 1} / {currentLevelConfig.tasksPerRound}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      {score} Punkte
                    </span>
                    <span className="font-bold flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                      {totalStars} Sterne
                    </span>
                  </div>
                </div>
                <Progress value={(currentTaskIndex / currentLevelConfig.tasksPerRound) * 100} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Current Task Display */}
          <Card className="border-4 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-center">
                <div className="space-y-4">
                  <p className="text-2xl text-purple-700">Deine Aufgabe:</p>
                  <div className="text-7xl font-bold font-mono bg-white rounded-xl p-6 border-4 border-purple-400 shadow-lg">
                    <span className="text-red-600">{currentTask.num1}</span>
                    <span className="text-gray-700 mx-4">{currentTask.operation}</span>
                    <span className="text-blue-600">{currentTask.num2}</span>
                    <span className="text-gray-700 mx-4">=</span>
                    <span className="text-green-600">?</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-center text-xl font-semibold text-purple-700 mb-6">
                Welchen Weg möchtest du nehmen? 🤔
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pathOptions.map((option, idx) => (
                    <motion.div
                      key={option.strategy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card
                        className={cn(
                          "cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2",
                          selectedStrategy?.id === option.strategy.id && showResult
                            ? "border-green-500 bg-green-50"
                            : "hover:border-purple-400"
                        )}
                        onClick={() => !showResult && handleStrategySelect(option.strategy)}
                        data-testid={`button-strategy-${option.strategy.id}`}
                      >
                        <CardContent className="p-4 text-center space-y-3">
                          <div className="text-5xl">{option.strategy.icon}</div>
                          <h3 className="font-bold text-lg">{option.strategy.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {option.strategy.description}
                          </p>

                          <div className="flex justify-center gap-1">
                            {Array.from({ length: option.stars }).map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>

                          {showResult && selectedStrategy?.id === option.strategy.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-lg p-3 border-2 border-purple-300 text-sm"
                            >
                              <p className="font-mono font-bold text-purple-700 mb-2">
                                {option.strategy.transformTask(
                                  currentTask.num1,
                                  currentTask.num2,
                                  currentTask.operation
                                ).display}
                              </p>
                              <p className="text-xs text-gray-600">
                                {option.strategy.transformTask(
                                  currentTask.num1,
                                  currentTask.num2,
                                  currentTask.operation
                                ).explanation}
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    className="text-xl px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    data-testid="button-continue"
                  >
                    Weiter
                    <ChevronRight className="w-6 h-6 ml-2" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
