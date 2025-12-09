import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Home, LogOut, Sparkles, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZooFeedback } from "@/components/zoo/ZooFeedback";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateGameReward } from "@/lib/zoo-game-system";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { NeighborNumberLine } from "@/components/neighbor-number-line";
import { NEIGHBORS_LEVELS } from "@shared/game-levels";

type NeighborType = 'ones' | 'tens' | 'hundreds' | 'thousands';

interface GameTask {
  number: number;
  neighborType: NeighborType;
  predecessor: number;
  successor: number;
}

interface GameStats {
  tasksCompleted: number;
  correctAnswers: number;
  streak: number;
  animalsCollected: string[];
}

// Berechne Nachbarn basierend auf Typ
function calculateNeighbors(number: number, type: NeighborType): { predecessor: number; successor: number } {
  switch (type) {
    case 'ones':
      return {
        predecessor: number - 1,
        successor: number + 1
      };
    case 'tens':
      // Vorgänger: Runde (number-1) zur nächsten 10 ab
      // Nachfolger: Runde number zur nächsten 10 ab, dann +10
      return {
        predecessor: Math.max(0, Math.floor((number - 1) / 10) * 10),
        successor: Math.floor(number / 10) * 10 + 10
      };
    case 'hundreds':
      return {
        predecessor: Math.max(0, Math.floor((number - 1) / 100) * 100),
        successor: Math.floor(number / 100) * 100 + 100
      };
    case 'thousands':
      return {
        predecessor: Math.max(0, Math.floor((number - 1) / 1000) * 1000),
        successor: Math.floor(number / 1000) * 1000 + 1000
      };
  }
}

function getNeighborTypeName(type: NeighborType): string {
  switch (type) {
    case 'ones': return 'Einer';
    case 'tens': return 'Zehner';
    case 'hundreds': return 'Hunderter';
    case 'thousands': return 'Tausender';
  }
}

export default function NeighborGame() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addXPToTeam, getTalentEffects } = useAnimalTeam();
  const queryClient = useQueryClient();

  const [gameState, setGameState] = useState<'start' | 'level-select' | 'countdown' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [inputPhase, setInputPhase] = useState<'predecessor' | 'successor'>('predecessor');
  const [userInput, setUserInput] = useState('');
  const [predecessorInput, setPredecessorInput] = useState('');
  const [successorConfirmed, setSuccessorConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<GameStats>({ 
    tasksCompleted: 0, 
    correctAnswers: 0, 
    streak: 0,
    animalsCollected: []
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const predecessorInputRef = useRef<HTMLInputElement>(null);
  const successorInputRef = useRef<HTMLInputElement>(null);

  const currentLevelConfig = NEIGHBORS_LEVELS[selectedLevel - 1];

  const saveGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      return apiRequest('POST', '/api/zoo/games/save', gameData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile'] });
    }
  });

  const generateTask = () => {
    const levelConfig = currentLevelConfig;
    const neighborType = levelConfig.neighborTypes[0] === 'mixed'
      ? (['ones', 'tens', 'hundreds', 'thousands'][Math.floor(Math.random() * 4)] as NeighborType)
      : (levelConfig.neighborTypes[0] as NeighborType);

    const [minNum, maxNum] = levelConfig.numberRange;
    let number = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    // Speziell für Tausender: Manchmal niedrige Zahlen (< 1000) wählen für 0 als Vorgänger
    if (neighborType === 'thousands' && Math.random() < 0.3 && minNum === 0) {
      number = Math.floor(Math.random() * 1000);
    }

    // Speziell für Zehner in Level 4: Manchmal Zahlen nahe Tausender-Grenzen
    if (neighborType === 'tens' && selectedLevel === 4 && Math.random() < 0.3) {
      const bases = [990, 991, 992, 993, 994, 995, 996, 997, 998, 999];
      number = bases[Math.floor(Math.random() * bases.length)];
    }

    const neighbors = calculateNeighbors(number, neighborType);

    setCurrentTask({
      number,
      neighborType,
      predecessor: neighbors.predecessor,
      successor: neighbors.successor
    });
    setInputPhase('predecessor');
    setUserInput('');
    setPredecessorInput('');
    setSuccessorConfirmed(false);
    setFeedback(null);
    setFeedbackMessage('');
    setTaskStartTime(Date.now());

    // Focus predecessor input field
    setTimeout(() => predecessorInputRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    if (!currentTask || !userInput.trim()) return;

    // Get talent effects to apply coin protection
    const getTalentEffects = () => {
      // This would be called from useAnimalTeam in real implementation
      return { coinProtection: 0, difficultyReduction: 0, hintBonus: false, speedBonus: 0 };
    };
    const talentEffects = getTalentEffects();

    const answer = parseInt(userInput, 10);
    const expectedAnswer = inputPhase === 'predecessor' 
      ? currentTask.predecessor 
      : currentTask.successor;

    const isCorrect = answer === expectedAnswer;

    if (isCorrect) {
      if (inputPhase === 'predecessor') {
        // Richtig! Jetzt Nachfolger eingeben
        setPredecessorInput(userInput);
        setFeedback('correct');
        setFeedbackMessage('Richtig! Jetzt der Nachfolger:');
        setTimeout(() => {
          setInputPhase('successor');
          setUserInput('');
          setFeedback(null);
          setFeedbackMessage('');
          // Focus directly on successor input
          setTimeout(() => successorInputRef.current?.focus(), 50);
        }, 800);
      } else {
        // Beide richtig! Aufgabe komplett
        setSuccessorConfirmed(true);
        setFeedback('correct');
        const newStreak = streak + 1;
        setStreak(newStreak);

        const newStats = {
          tasksCompleted: stats.tasksCompleted + 1,
          correctAnswers: stats.correctAnswers + 1,
          streak: newStreak,
          animalsCollected: [...stats.animalsCollected]
        };

        // Tier-Belohnung alle 3 Aufgaben - ECHTE Tiere, nicht nur Emojis!
        if (newStats.correctAnswers % 3 === 0) {
          // Calculate reward using the game reward system
          const reward = calculateGameReward('neighbors', newStats.correctAnswers, newStats.tasksCompleted, []);
          if (reward.animals && reward.animals.length > 0) {
            // Add only NEW animals that haven't been collected yet
            reward.animals.forEach(animal => {
              if (!newStats.animalsCollected.includes(animal)) {
                newStats.animalsCollected.push(animal);
              }
            });
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
          }
        }
        
        setStats(newStats);

        // Nächste Aufgabe nach kurzer Pause
        setTimeout(() => generateTask(), 1000);
      }
    } else {
      // Falsch
      setFeedback('wrong');
      setStreak(0);

      const typeName = getNeighborTypeName(currentTask.neighborType);
      const phaseText = inputPhase === 'predecessor' ? 'Vorgänger' : 'Nachfolger';

      let explanation = '';
      if (currentTask.neighborType === 'ones') {
        explanation = inputPhase === 'predecessor'
          ? `Der Einer-Vorgänger von ${currentTask.number} ist ${currentTask.predecessor}, weil wir einen Schritt zurückgehen.`
          : `Der Einer-Nachfolger von ${currentTask.number} ist ${currentTask.successor}, weil wir einen Schritt vorwärts gehen.`;
      } else if (currentTask.neighborType === 'tens') {
        explanation = inputPhase === 'predecessor'
          ? `Der Zehner-Vorgänger von ${currentTask.number} ist ${currentTask.predecessor}, weil wir einen Zehner zurückgehen.`
          : `Der Zehner-Nachfolger von ${currentTask.number} ist ${currentTask.successor}, weil wir einen Zehner vorwärts gehen.`;
      } else if (currentTask.neighborType === 'hundreds') {
        explanation = inputPhase === 'predecessor'
          ? `Der Hunderter-Vorgänger von ${currentTask.number} ist ${currentTask.predecessor}, weil wir einen Hunderter zurückgehen.`
          : `Der Hunderter-Nachfolger von ${currentTask.number} ist ${currentTask.successor}, weil wir einen Hunderter vorwärts gehen.`;
      } else {
        explanation = inputPhase === 'predecessor'
          ? `Der Tausender-Vorgänger von ${currentTask.number} ist ${currentTask.predecessor}, weil wir einen Tausender zurückgehen.`
          : `Der Tausender-Nachfolger von ${currentTask.number} ist ${currentTask.successor}, weil wir einen Tausender vorwärts gehen.`;
      }

      setFeedbackMessage(`${explanation} Du hattest ${answer}.`);

      setTimeout(() => {
        setFeedback(null);
        setFeedbackMessage('');
        // Reset zur neuen Aufgabe
        generateTask();
      }, 3500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const startGame = () => {
    setGameState('level-select');
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('countdown');
    setCountdown(3);
    setStats({ tasksCompleted: 0, correctAnswers: 0, streak: 0, animalsCollected: [] });
    setStreak(0);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        setCurrentTask(null);
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      generateTask();
    }
  }, [gameState, currentTask]);

  const endGame = async () => {
    // XP an Team Tiere vergeben
    if (user?.id && stats.correctAnswers > 0) {
      const successRate = stats.correctAnswers / Math.max(stats.tasksCompleted, 1);
      addXPToTeam(successRate, selectedLevel);
    }

    // Speichere Spiel-Ergebnisse
    if (user?.id && stats.correctAnswers > 0) {
      const reward = calculateGameReward(
        'neighbors',
        stats.correctAnswers,
        stats.tasksCompleted,
        [] // specialAchievements
      );

      try {
        await saveGameMutation.mutateAsync({
          userId: user.id,
          game: 'neighbors',
          score: stats.correctAnswers,
          reward: {
            coins: reward.coins,
            animals: stats.animalsCollected,
            experience: reward.experience
          }
        });
      } catch (err) {
        console.error('Fehler beim Speichern:', err);
      }
    }

    setGameState('end');
  };

  const backToLevelSelect = () => {
    setGameState('level-select');
    setCurrentTask(null);
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setLocation('/games')} data-testid="button-back-games">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')} data-testid="button-back-home">
            <Home className="w-4 h-4 mr-2" />
            Startseite
          </Button>
        </div>

        <div className="max-w-2xl mx-auto mt-12">
          <Card className="border-4 border-green-500">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="text-8xl">🦁🐜🐰🦊🐘</div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Zoo-Nachbarn
                </h1>
                <p className="text-xl text-muted-foreground">
                  Finde die Nachbarn der Zahlen - sie leben nebeneinander im Zoo!
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">
                    Konzept: Vorgänger und Nachfolger
                  </p>
                  <div className="text-left space-y-2 text-sm text-muted-foreground">
                    <p>🐜 <strong>Einer-Nachbarn:</strong> ±1 (z.B. 15 → 14 und 16)</p>
                    <p>🐰 <strong>Zehner-Nachbarn:</strong> ±10 (z.B. 56 → 50 und 60)</p>
                    <p>🦊 <strong>Hunderter-Nachbarn:</strong> ±100 (z.B. 599 → 500 und 600)</p>
                    <p>🐘 <strong>Tausender-Nachbarn:</strong> ±1000 (z.B. 6737 → 6000 und 7000)</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={startGame}
                  className="text-2xl px-12 py-8 mt-6"
                  data-testid="button-start-game"
                >
                  <Sparkles className="w-8 h-8 mr-3" />
                  Level wählen
                  <ChevronRight className="w-8 h-8 ml-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Countdown Screen
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl font-bold mb-8 animate-bounce">
            {countdown}
          </div>
          <p className="text-3xl font-semibold text-muted-foreground">
            {currentLevelConfig.name}
          </p>
          <p className="text-xl text-muted-foreground mt-2">
            {currentLevelConfig.description}
          </p>
        </div>
      </div>
    );
  }

  // Level Selection Screen
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setLocation('/games')} data-testid="button-back-games">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')} data-testid="button-back-home">
            <Home className="w-4 h-4 mr-2" />
            Startseite
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 border-4 border-green-500">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">🦁🐜🐰🦊🐘</div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Zoo-Nachbarn
                </h1>
                <p className="text-xl text-muted-foreground">
                  Finde die Nachbarn der Zahlen - sie leben nebeneinander im Zoo!
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    Konzept: Vorgänger und Nachfolger
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    🐜 Einer-Nachbarn: ±1 (z.B. 15 → 14 und 16)<br/>
                    🐰 Zehner-Nachbarn: ±10 (z.B. 56 → 50 und 60)<br/>
                    🦊 Hunderter-Nachbarn: ±100 (z.B. 599 → 500 und 600)<br/>
                    🐘 Tausender-Nachbarn: ±1000 (z.B. 6737 → 6000 und 7000)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NEIGHBORS_LEVELS.map((level) => (
              <Card 
                key={level.level}
                className={cn(
                  "cursor-pointer border-2 hover-elevate active-elevate-2 transition-all",
                  "border-green-400 hover:border-green-500"
                )}
                onClick={() => startGameWithLevel(level.level)}
                data-testid={`card-level-${level.level}`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-5xl",
                        "transform hover:scale-110 transition-transform"
                      )}>
                        {level.icon}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">
                        Level {level.level}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{level.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {level.description}
                    </p>
                    <div className="flex items-center justify-end mt-4">
                      <Button size="sm" variant="default">
                        Spielen <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    if (!currentTask) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold">Aufgabe wird generiert...</p>
          </div>
        </div>
      );
    }

    const typeName = getNeighborTypeName(currentTask.neighborType);
    const phaseText = inputPhase === 'predecessor' ? 'Vorgänger' : 'Nachfolger';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={backToLevelSelect} data-testid="button-back-levels">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Levels
          </Button>
          <div className="flex gap-2">
            <div className="bg-white/80 dark:bg-black/50 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">Aufgaben: {stats.tasksCompleted}</span>
            </div>
            <div className="bg-white/80 dark:bg-black/50 px-4 py-2 rounded-lg">
              <span className="text-sm font-semibold">Streak: {streak} 🔥</span>
            </div>
          </div>
          <Button variant="outline" onClick={endGame} data-testid="button-end-game">
            Beenden
          </Button>
        </div>

        {/* Main Game Area */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="border-4 border-white/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                {/* Animal */}
                <div className="text-8xl animate-bounce">
                  {currentLevelConfig.icon}
                </div>

                {/* Level & Type Info */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{currentLevelConfig.name}</h2>
                  <p className="text-lg text-muted-foreground">
                    Finde die {typeName}-Nachbarn:
                  </p>
                </div>

                {/* Drei-Spalten-Layout: Vorgänger | Zahl | Nachfolger */}
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Eingabe-Grid */}
                  <div className="grid grid-cols-3 gap-4 items-end">
                    {/* Vorgänger Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" style={{ color: 'hsl(210, 90%, 45%)' }}>
                        Vorgänger
                      </label>
                      <div className={cn(
                        "relative",
                        inputPhase === 'predecessor' && "ring-4 ring-[hsl(210,90%,45%)]/30 rounded-lg"
                      )}>
                        <Input
                          ref={predecessorInputRef}
                          type="number"
                          value={inputPhase === 'predecessor' ? userInput : predecessorInput}
                          onChange={(e) => {
                            if (inputPhase === 'predecessor') {
                              setUserInput(e.target.value);
                            }
                          }}
                          onKeyDown={inputPhase === 'predecessor' ? handleKeyDown : undefined}
                          disabled={inputPhase === 'successor'}
                          placeholder=""
                          className={cn(
                            "text-center !h-36 !p-0 font-bold",
                            "border-2",
                            inputPhase === 'predecessor' && "border-blue-500"
                          )}
                          style={inputPhase === 'predecessor' ? { 
                            borderColor: 'hsl(210, 90%, 45%)',
                            color: 'hsl(210, 90%, 45%)',
                            fontSize: '64px',
                            lineHeight: '1'
                          } : {
                            fontSize: '64px',
                            lineHeight: '1'
                          }}
                          data-testid="input-predecessor"
                          autoFocus={inputPhase === 'predecessor'}
                        />
                      </div>
                    </div>

                    {/* Aktuelle Zahl (Mitte) */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" style={{ color: 'hsl(260, 70%, 45%)' }}>
                        Gegebene Zahl
                      </label>
                      <div className="flex items-center justify-center h-28 font-bold rounded-lg border-4 border-[hsl(260,70%,45%)]/30 bg-[hsl(260,70%,45%)]/5"
                        style={{ color: 'hsl(260, 70%, 45%)', fontSize: '76px' }}
                        data-testid="text-current-number"
                      >
                        {currentTask.number}
                      </div>
                    </div>

                    {/* Nachfolger Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" style={{ color: 'hsl(28, 90%, 52%)' }}>
                        Nachfolger
                      </label>
                      <div className={cn(
                        "relative",
                        inputPhase === 'successor' && "ring-4 ring-[hsl(28,90%,52%)]/30 rounded-lg"
                      )}>
                        <Input
                          ref={successorInputRef}
                          type="number"
                          value={inputPhase === 'successor' ? userInput : ''}
                          onChange={(e) => {
                            if (inputPhase === 'successor') {
                              setUserInput(e.target.value);
                            }
                          }}
                          onKeyDown={inputPhase === 'successor' ? handleKeyDown : undefined}
                          disabled={inputPhase === 'predecessor'}
                          placeholder="?"
                          className={cn(
                            "text-center !h-36 !p-0 font-bold",
                            "border-2",
                            inputPhase === 'successor' && "border-[hsl(28,90%,52%)]"
                          )}
                          style={inputPhase === 'successor' ? { 
                            borderColor: 'hsl(28, 90%, 52%)',
                            color: 'hsl(28, 90%, 52%)',
                            fontSize: '64px',
                            lineHeight: '1'
                          } : {
                            fontSize: '64px',
                            lineHeight: '1'
                          }}
                          data-testid="input-successor"
                          autoFocus={inputPhase === 'successor'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zahlenstrahl */}
                  <NeighborNumberLine
                    currentNumber={currentTask.number}
                    predecessor={currentTask.predecessor}
                    successor={currentTask.successor}
                    neighborType={currentTask.neighborType}
                    predecessorConfirmed={inputPhase === 'successor' || predecessorInput !== ''}
                    successorConfirmed={successorConfirmed}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      size="lg"
                      onClick={handleSubmit}
                      disabled={!userInput.trim()}
                      className="text-xl px-8 py-6"
                      data-testid="button-submit"
                    >
                      Prüfen <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Feedback */}
                {feedbackMessage && (
                  <div className={cn(
                    "mt-6 p-4 rounded-lg text-lg font-semibold",
                    feedback === 'correct' 
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  )}>
                    {feedbackMessage}
                  </div>
                )}

                {/* Animals Collected */}
                {stats.animalsCollected.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Gesammelte Tiere:</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {stats.animalsCollected.map((animal, idx) => (
                        <span key={idx} className="text-4xl">{animal}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Celebration */}
        <ZooFeedback 
          show={showCelebration} 
          onComplete={() => setShowCelebration(false)}
          message="Fantastisch! Du hast ein Tier gefunden!"
        />
      </div>
    );
  }

  // End Screen
  if (gameState === 'end') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 p-4">
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="border-4 border-amber-400">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="text-8xl mb-4">🏆</div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Super gespielt!
                </h1>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Richtige Antworten</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.animalsCollected.length}</div>
                    <div className="text-sm text-muted-foreground">Tiere gesammelt</div>
                  </div>
                </div>

                {stats.animalsCollected.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold mb-3">Deine gesammelten Tiere:</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      {stats.animalsCollected.map((animal, idx) => (
                        <span key={idx} className="text-6xl animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }}>
                          {animal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-center mt-8">
                  <Button
                    size="lg"
                    onClick={backToLevelSelect}
                    className="text-lg"
                    data-testid="button-new-level"
                  >
                    Neues Level wählen
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation('/games')}
                    data-testid="button-back-games-end"
                  >
                    Zurück zu Spielen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}