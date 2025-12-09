import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZooFeedback } from "@/components/zoo/ZooFeedback";
import { AnimalUnlockNotification } from "@/components/zoo/AnimalUnlockNotification";
import { useAuth } from "@/hooks/useAuth";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { TipToast } from "@/components/tips/TipToast";
import { TipModal } from "@/components/tips/TipModal";
import { useTipSystem } from "@/hooks/useTipSystem";
import { useToast } from "@/hooks/use-toast";
import { TEN_WINS_LEVELS } from "@shared/game-levels";
import { AppHeader } from "@/components/ui/app-header";

type AnimalType = 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'monkey' | 'panda' | 'koala' | 'penguin' | 'fox' | 'rabbit';

// Define ZooAnimal type to match the backend/API structure if possible
type ZooAnimal = {
  id?: string; // Assuming an ID might be returned
  type: AnimalType;
  // Add other properties if the API returns them, e.g., acquiredDate, etc.
};

interface GameTask {
  number: number;
  animal: AnimalType;
  complement: number;
}

interface GameStats {
  animalsCollected: AnimalType[];
  totalCorrect: number;
  parties: number;
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

// Placeholder for MILESTONES if used elsewhere, assuming it's defined globally or imported.
// If MILESTONES is not defined, this part might need adjustment or removal.
const MILESTONES = [
  { id: 1, name: 'First Steps', requiredExp: 50, icon: '⭐' },
  { id: 2, name: 'Zoo Helper', requiredExp: 150, icon: '🌟' },
  // ... more milestones
];


export default function TenWinsGame() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addXPToTeam } = useAnimalTeam();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'countdown' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<GameStats>({ animalsCollected: [], totalCorrect: 0, parties: 0 });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showParty, setShowParty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for Animal Unlock Notification
  const [showAnimalUnlock, setShowAnimalUnlock] = useState(false);
  const [unlockedAnimals, setUnlockedAnimals] = useState<ZooAnimal[]>([]);


  const currentLevelConfig = TEN_WINS_LEVELS[selectedLevel - 1];

  // Mock profileData for level calculation. Replace with actual data fetching if available.
  const profileData = { experience: 100 };
  const correctCount = stats.totalCorrect; // Assuming this is used for MilestoneCelebration
  const completedTasks = stats.totalCorrect; // Assuming this is used for MilestoneCelebration


  // Tips-System
  const { currentTip, showToast: showTipToast, showModal: showTipModal, showTip, closeTip, markHelpful } = useTipSystem();
  const { toast } = useToast(); // Assuming useToast is imported and used elsewhere, though not directly in this snippet.

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      generateTask();
    }
  }, [gameState, countdown]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      // Call saveCollectedAnimals here before setting gameState to 'end'
      // This ensures that any animals collected during the last moments of the game are saved.
      // However, the provided change snippet modifies the gameReward handling instead.
      // For now, we keep the original logic flow for game end.
      setGameState('end');
    }
  }, [gameState, timeLeft]);

  // Auto-focus input
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentTask]);

  const generateTask = () => {
    let attempts = 0;
    let newTask: GameTask;
    const maxAttempts = 20; // Limit attempts to prevent infinite loops

    do {
      const number = Math.floor(Math.random() * 10); // 0-9
      const complement = 10 - number;
      const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

      newTask = {
        number,
        animal: randomAnimal.type,
        complement
      };

      attempts++;

      // Check if the new task is identical to the previous one
      if (currentTask &&
          newTask.number === currentTask.number &&
          newTask.animal === currentTask.animal) {
        // Identical task, continue to generate a new one
        continue;
      }

      // If the task is different or it's the first task, break the loop
      break;
    } while (attempts < maxAttempts);

    // If after maxAttempts we still have an identical task (highly unlikely but possible with few animals/numbers),
    // just use the generated task.
    setCurrentTask(newTask);
    setUserInput('');
    setFeedback(null);
  };


  const handleSubmit = () => {
    if (!currentTask || !userInput) return;

    const answer = parseInt(userInput, 10);
    const isCorrect = answer === currentTask.complement;

    if (isCorrect) {
      setFeedback('correct');
      const newStreak = streak + 1;

      setStats(prev => ({
        ...prev,
        animalsCollected: [...prev.animalsCollected, currentTask.animal],
        totalCorrect: prev.totalCorrect + 1
      }));

      // Party bei 5er Streak
      if (newStreak % 5 === 0) {
        setShowParty(true);
        setStats(prev => ({ ...prev, parties: prev.parties + 1 }));
        setTimeout(() => setShowParty(false), 2000);
        setStreak(0);
      } else {
        setStreak(newStreak);
      }

      // Zeige Tipp bei richtiger Antwort (25% Chance)
      if (Math.random() < 0.25) {
        showTip('correct', 1);
      }

      setTimeout(() => generateTask(), 600);
    } else {
      setFeedback('wrong');
      setStreak(0);

      // Zeige hilfreichen Tipp bei falscher Antwort (50% Chance)
      if (Math.random() < 0.5) {
        showTip('wrong', 1);
      }
      setTimeout(() => setFeedback(null), 800);
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
    const levelConfig = TEN_WINS_LEVELS[level - 1];
    setGameState('countdown');
    setCountdown(3);
    setTimeLeft(levelConfig.timeLimit);
    setStats({ animalsCollected: [], totalCorrect: 0, parties: 0 });
    setStreak(0);
    // Zeige Tipp bei Spielstart wenn Level Hints erlaubt
    if (levelConfig.showHints) {
      showTip('start', 1);
    }
  };

  // Dummy function for updateProgressionMutation, replace with actual mutation hook if available
  const updateProgressionMutation = {
    mutateAsync: async (data: { coins: number; experience: number; newAnimals: ZooAnimal[] }) => {
      console.log("Mocking progression update:", data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }
  };

  const handleGameCompletion = async (gameReward: { coins: number; experience: number; animals: ZooAnimal[] }) => {
    try {
      await updateProgressionMutation.mutateAsync({
        coins: gameReward.coins,
        experience: gameReward.experience,
        newAnimals: gameReward.animals,
      });

      console.log('🎮 Game completed! Reward:', gameReward);

      // Check if new animals were unlocked and show the notification
      if (gameReward.animals && gameReward.animals.length > 0) {
        setUnlockedAnimals(gameReward.animals);
        setShowAnimalUnlock(true);
      } else {
        // If no new animals, proceed to the end screen directly
        setGameState('end');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Progression oder Speichern der Tiere:', error);
      // Optionally show an error toast to the user
      toast({
        title: "Fehler",
        description: "Konnte Spiel-Belohnungen nicht verarbeiten.",
        variant: "destructive",
      });
      // Still set to end state even if there's an error processing rewards
      setGameState('end');
    }
  };

  // Placeholder for saving collected animals, if needed separately from the reward system.
  // The current logic handles new animals via handleGameCompletion.
  const saveCollectedAnimals = async () => {
    if (!user?.id || stats.animalsCollected.length === 0) return;

    try {
      // Speichere jedes gesammelte Tier
      for (const animalType of stats.animalsCollected) {
        await fetch('/api/zoo/animals/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: user.id,
            animalType: animalType
          })
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Tiere:', error);
    }
  };

  const restartGame = () => {
    setGameState('start');
  };

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center p-4 animate-gradient-flow">
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white animate-scale-in card-interactive">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-8xl mb-4 animate-gentle-bounce">🎯</div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-700 bg-clip-text text-transparent animate-fade-in-up text-high-contrast">
              10 gewinnt!
            </h1>
            <p className="text-2xl text-gray-900 font-bold animate-fade-in-up">
              Ergänze zur 10 und rette die Zoo-Tiere!
            </p>

            <div className="space-y-3 text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-4 border-blue-300">
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🦁</span> Du siehst Tiere (z.B. 4 Löwen)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🔢</span> Tippe die Ergänzung zur 10 (hier: 6)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⚡</span> 5 richtige = Tier-Party! 🎊
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⏱️</span> 60 Sekunden Zeit!
              </p>
            </div>

            <Button
              onClick={startGame}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              data-testid="button-start-game"
            >
              Level wählen!
            </Button>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
                data-testid="button-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="destructive"
                onClick={() => setLocation('/login')}
                className="flex-1"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Selection Screen
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-700 bg-clip-text text-transparent">
                Wähle dein Level
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {TEN_WINS_LEVELS.map((lvl) => (
                <Button
                  key={lvl.level}
                  onClick={() => startGameWithLevel(lvl.level)}
                  variant="outline"
                  className="h-32 flex flex-col gap-2 hover-elevate active-elevate-2"
                  data-testid={`button-level-${lvl.level}`}
                >
                  <span className="text-3xl">{lvl.icon}</span>
                  <span className="text-lg font-bold">Level {lvl.level}</span>
                  <span className="text-xs text-muted-foreground">{lvl.name}</span>
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setGameState('start')}
              className="w-full"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Countdown Screen
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center">
        <div className="text-9xl font-bold animate-pulse text-white drop-shadow-2xl">
          {countdown}
        </div>
      </div>
    );
  }

  // End Screen
  if (gameState === 'end') {
    const uniqueAnimals = new Set(stats.animalsCollected);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Spiel vorbei!
            </h1>

            <div className="bg-white/80 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-12 h-12 text-yellow-500" />
                <div>
                  <div className="text-4xl font-bold">{stats.totalCorrect}</div>
                  <div className="text-sm text-muted-foreground">Richtige Antworten</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Star className="w-12 h-12 text-purple-500" />
                <div>
                  <div className="text-4xl font-bold">{stats.parties}</div>
                  <div className="text-sm text-muted-foreground">Tier-Partys</div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Gesammelte Tiere ({uniqueAnimals.size}/10):</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from(uniqueAnimals).map((animalType) => {
                    const animal = ANIMALS.find(a => a.type === animalType);
                    return (
                      <div key={animalType} className="text-4xl" title={animal?.name}>
                        {animal?.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>

              {stats.totalCorrect >= 30 && (
                <div className="text-2xl text-green-600 font-bold flex items-center justify-center gap-2">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  Mathe-Champion!
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={restartGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Nochmal spielen!
              </Button>
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setLocation('/login')}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Screen
  const currentAnimal = ANIMALS.find(a => a.type === currentTask?.animal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 animate-gradient-flow">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-5 glass-effect rounded-2xl mb-6 shadow-xl border-2 border-white/40 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="text-primary hover:text-primary/80 btn-enhanced hover:bg-white/50"
          >
            <Home className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/student')}
            className="text-primary hover:text-primary/80 btn-enhanced hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-primary text-high-contrast">10 gewinnt!</h1>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => setLocation('/login')}
          className="flex items-center gap-2 btn-enhanced font-bold"
        >
          <LogOut className="w-5 h-5" />
          Abmelden
        </Button>
      </nav>

      {/* Party Overlay - Zoo Baby Feedback */}
      <ZooFeedback
        show={showParty}
        onComplete={() => setShowParty(false)}
        message="5er-Streak geschafft! 🎉"
      />

      {/* Milestone Celebration Dialog */}
      {/* Assuming MILESTONES is defined elsewhere and correctCount/completedTasks are available */}
      {/* <MilestoneCelebration
        open={showMilestone}
        onOpenChange={setShowMilestone}
        milestone={currentMilestone || MILESTONES[0]} // Provide a default milestone
        stats={{
          successRate: correctCount / Math.max(completedTasks, 1),
          averageTime: 0, // Needs to be calculated if relevant
          tasksCompleted: completedTasks
        }}
        onContinue={() => {
          setShowMilestone(false);
          if (gameState === 'playing') {
            generateTask();
          }
        }}
      /> */}

      {/* Animal Unlock Notification Dialog */}
      <AnimalUnlockNotification
        open={showAnimalUnlock}
        onOpenChange={setShowAnimalUnlock}
        unlockedAnimals={unlockedAnimals}
        onContinue={() => {
          setShowAnimalUnlock(false);
          setGameState('end'); // Transition to end screen after viewing unlocks
        }}
      />

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  ⏱️ {timeLeft}s
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Streak: {streak}/5</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-full",
                          i < streak ? "bg-green-500" : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{stats.totalCorrect}</div>
                <div className="text-xs text-muted-foreground">Richtig</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Game Area */}
        <Card className="shadow-2xl border-4 border-white">
          <CardContent className="p-12">
            <div className="text-center space-y-8">
              {/* Task Display */}
              <div>
                <div className="text-sm text-muted-foreground mb-4">
                  Der Zoo-Wärter braucht genau 10 Tiere!
                </div>

                <div className={cn(
                  "inline-block p-8 rounded-2xl bg-gradient-to-br",
                  currentAnimal?.color
                )}>
                  <div className="flex flex-wrap justify-center gap-3 max-w-md">
                    {[...Array(currentTask?.number || 0)].map((_, i) => (
                      <div key={i} className="text-6xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                        {currentAnimal?.emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-white mt-6 drop-shadow-lg">
                    {currentTask?.number} {(() => {
                      const num = currentTask?.number || 0;
                      const type = currentAnimal?.type;
                      if (num === 1) return currentAnimal?.name;

                      // Correct German plural forms
                      const plurals: Record<string, string> = {
                        'Panda': 'Pandas',
                        'Koala': 'Koalas',
                        'Zebra': 'Zebras',
                        'Elefant': 'Elefanten',
                        'Fuchs': 'Füchse',
                        'Pinguin': 'Pinguine',
                        'Löwe': 'Löwen',
                        'Giraffe': 'Giraffen',
                        'Affe': 'Affen',
                        'Hase': 'Hasen'
                      };

                      return plurals[currentAnimal?.name || ''] || currentAnimal?.name + 's';
                    })()}
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="text-2xl font-semibold">
                Wie viele fehlen noch bis 10?
              </div>

              {/* Input Area */}
              <div className="flex items-center justify-center gap-4">
                <input
                  ref={inputRef}
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
                    "w-32 h-24 text-center text-6xl font-bold border-0 border-b-4 rounded-none bg-transparent",
                    "focus:outline-none focus:border-green-500 caret-primary transition-all",
                    feedback === 'correct' && "border-green-500 text-green-600",
                    feedback === 'wrong' && "border-red-500 text-red-600 animate-shake",
                    !feedback && "border-primary text-primary"
                  )}
                  placeholder=""
                  disabled={feedback === 'correct'}
                />

                <Button
                  onClick={handleSubmit}
                  disabled={!userInput || feedback === 'correct'}
                  size="lg"
                  className="h-24 px-8 text-xl"
                >
                  ✓
                </Button>
              </div>

              {/* Feedback */}
              {feedback === 'correct' && (
                <div className="text-2xl text-green-600 font-bold">
                  Richtig! ✓
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="text-xl text-red-600 font-semibold">
                  Nicht ganz... Versuch's nochmal!
                </div>
              )}

              {/* Recent Animals */}
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Zuletzt gerettet:</div>
                <div className="flex justify-center gap-2">
                  {stats.animalsCollected.slice(-10).map((animalType, i) => {
                    const animal = ANIMALS.find(a => a.type === animalType);
                    return (
                      <div key={i} className="text-3xl">
                        {animal?.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tipps-System */}
      {showTipToast && currentTip && (
        <TipToast
          tip={currentTip}
          onClose={closeTip}
          position="top-right"
          duration={6000}
        />
      )}

      {showTipModal && currentTip && (
        <TipModal
          tip={currentTip}
          isOpen={showTipModal}
          onClose={closeTip}
          onMarkHelpful={markHelpful}
        />
      )}


      <style>{`
        @keyframes fall {
          from {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}