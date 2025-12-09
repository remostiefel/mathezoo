import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Home, Trophy, Star, Sparkles, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateGameReward, type ZooGameReward } from "@/lib/zoo-game-system";
import { Input } from "@/components/ui/input";
import { NUMBER_STAIRS_LEVELS, type NumberStairsLevel } from "@shared/game-levels";
import { AppHeader } from "@/components/ui/app-header";

interface NumberTile {
  value: number;
  id: number;
  clicked: boolean;
  correct: boolean;
}

export default function NumberStairs() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [shake, setShake] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameReward, setGameReward] = useState<ZooGameReward | null>(null);

  const currentLevelConfig = NUMBER_STAIRS_LEVELS[selectedLevel - 1];

  const saveGameMutation = useMutation({
    mutationFn: async (reward: ZooGameReward) => {
      if (!user?.id) return;

      return apiRequest('POST', '/api/zoo/game-result', {
        userId: user.id,
        gameType: 'number-stairs',
        correctAnswers,
        totalAnswers: totalAttempts,
        coinsEarned: reward.coins,
        animalsEarned: reward.animals,
        experienceEarned: reward.experience,
      });
    }
  });

  const generateNumbers = (levelConfig?: NumberStairsLevel) => {
    const config = levelConfig || currentLevelConfig;
    const numbers: number[] = [];
    const [minNum, maxNum] = config.range;

    // Level 9-10: Zahlen mit wenigen unterschiedlichen Ziffern
    if (config.level >= 9) {
      const allowedDigits = [Math.floor(Math.random() * 9) + 1]; // Erste Ziffer 1-9
      const numExtraDigits = selectedLevel === 9 ? 1 : 2;
      for (let i = 0; i < numExtraDigits; i++) {
        const extraDigit = Math.floor(Math.random() * 10);
        if (!allowedDigits.includes(extraDigit)) {
          allowedDigits.push(extraDigit);
        }
      }

      while (numbers.length < config.count) {
        let numStr = '';
        const targetLength = config.level === 9 ? 5 : 6;
        for (let i = 0; i < targetLength; i++) {
          const digit = allowedDigits[Math.floor(Math.random() * allowedDigits.length)];
          numStr += digit;
        }
        const num = parseInt(numStr, 10);
        if (num >= minNum && num <= maxNum && !numbers.includes(num)) {
          numbers.push(num);
        }
      }
    } else if (config.level >= 7) {
      // Level 7-8: Größere Zahlen mit mehr Varianz
      const baseNumber = Math.floor(Math.random() * (maxNum - minNum)) + minNum;
      const variants = [0, 5, 10, 20, 50, 100, 200, 500, 1000];

      for (let i = 0; i < config.count; i++) {
        const variant = variants[i % variants.length];
        numbers.push(baseNumber + variant + Math.floor(Math.random() * 100));
      }
    } else {
      // Level 1-6: Zufällige Zahlen im Bereich
      while (numbers.length < config.count) {
        const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        if (!numbers.includes(num)) {
          numbers.push(num);
        }
      }
    }

    // Mische die Zahlen
    const shuffled = numbers.sort(() => Math.random() - 0.5);

    return shuffled.map((value, index) => ({
      value,
      id: index,
      clicked: false,
      correct: false,
    }));
  };

  const getSortedValues = () => {
    return [...tiles].sort((a, b) => a.value - b.value).map(t => t.value);
  };

  const handleTileClick = (tile: NumberTile) => {
    if (tile.clicked || tile.correct) return;

    const sortedValues = getSortedValues();
    const expectedValue = sortedValues[currentStep];

    // Zaehle jeden Klick als Versuch
    setTotalAttempts(prev => prev + 1);

    if (tile.value === expectedValue) {
      // Richtig!
      setTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, correct: true, clicked: true } : t
      ));
      setCurrentStep(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);

      // Runde abgeschlossen?
      if (currentStep + 1 === tiles.length) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setRoundsCompleted(prev => prev + 1);
          startNewRound();
        }, 2000);
      }
    } else {
      // Falsch!
      setTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, clicked: true } : t
      ));
      setShake(true);

      setTimeout(() => {
        setShake(false);
        setTiles(prev => prev.map(t => ({ ...t, clicked: false })));
      }, 600);
    }
  };

  const startNewRound = () => {
    setTiles(generateNumbers());
    setCurrentStep(0);
  };

  const startGameWithLevel = (level: number) => {
    const levelConfig = NUMBER_STAIRS_LEVELS[level - 1];
    setSelectedLevel(level);
    setGameState('playing');
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setRoundsCompleted(0);
    setCurrentStep(0);
    setTiles(generateNumbers(levelConfig));
  };

  const endGame = () => {
    const reward = calculateGameReward(
      'number-stairs',
      correctAnswers,
      totalAttempts,
      roundsCompleted >= 5 ? ['speed-master'] : []
    );
    setGameReward(reward);

    if (user?.id) {
      saveGameMutation.mutate(reward);
    }

    setGameState('end');
  };


  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-green-200 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/games/number-stairs')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4">🪜</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zahlen-Treppe
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Klicke die Zahlen von klein nach groß!
            </p>

            <div className="space-y-3 text-left bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-4 border-purple-300">
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🔢</span> Du siehst 8 verschiedene Zahlen
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">👆</span> Klicke erst die kleinste Zahl
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🪜</span> Dann die zweitkleinste, usw.
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⚡</span> Bis zur größten Zahl!
              </p>
            </div>

            <Button
              onClick={() => setGameState('level-select')}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-600"
              data-testid="button-start"
            >
              Level wählen!
            </Button>

            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              data-testid="button-home"
            >
              <Home className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Selection
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/games/number-stairs')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-4 border-white mb-4">
            <CardContent className="p-6">
              <div className="text-6xl text-center mb-4">🪜</div>
              <h2 className="text-3xl font-bold text-center mb-6">Wähle dein Level</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {NUMBER_STAIRS_LEVELS.map((lvl) => (
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


  // Playing
  if (gameState === 'playing') {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4 transition-transform",
        shake && "animate-shake"
      )}>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/games/number-stairs')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="mb-4 border-4 border-white shadow-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currentLevelConfig.icon}</div>
                <div>
                  <div className="text-sm text-muted-foreground">Level {selectedLevel}: {currentLevelConfig.name}</div>
                  <div className="text-xl font-bold">Runde {roundsCompleted + 1}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Schritt</div>
                  <div className="text-2xl font-bold">{Math.min(currentStep + 1, tiles.length)} / {tiles.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Richtig</div>
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                </div>
                <Button
                  variant="destructive"
                  onClick={endGame}
                  data-testid="button-end-game"
                >
                  Beenden
                </Button>
              </div>
            </CardContent>
          </Card>

          

          {/* Number Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Progress Indicator Bar */}
            <div className="absolute top-0 left-0 right-0 -mt-8 z-50">
              <div className="h-1 bg-blue-600 transition-all duration-500" style={{ width: `${((currentStep) / tiles.length) * 100}%` }} />
            </div>
            {tiles.map((tile) => (
              <Button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={tile.correct}
                className={cn(
                  "h-32 text-6xl font-black transition-all shadow-xl border-4",
                  tile.correct && "bg-green-600 text-white hover:bg-green-600 border-green-800 shadow-green-400/50",
                  tile.clicked && !tile.correct && "bg-red-600 text-white border-red-800 shadow-red-400/50",
                  !tile.correct && !tile.clicked && "bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900 border-gray-400 shadow-gray-300/50"
                )}
                data-testid={`tile-${tile.value}`}
              >
                {tile.value}
              </Button>
            ))}
          </div>

          {/* Hinweis */}
          <Card className="mt-4 bg-purple-50 border-2 border-purple-300">
            <CardContent className="p-4 text-center">
              <p className="text-lg">
                {currentStep === 0 
                  ? "Klicke auf die kleinste Zahl!" 
                  : currentStep === tiles.length - 1
                  ? "Bravo! Jetzt die grösste Zahl!"
                  : currentStep === tiles.length - 2
                  ? "Super! Jetzt die zweitgrösste Zahl!"
                  : currentStep === tiles.length - 3
                  ? "Toll! Jetzt die drittgrösste Zahl!"
                  : `Klicke auf die ${currentStep + 1}. kleinste Zahl!`}
              </p>
            </CardContent>
          </Card>
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

  // End Screen
  if (gameState === 'end') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/games/number-stairs')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold">Geschafft!</h1>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                <div className="text-3xl font-bold text-green-600">{roundsCompleted}</div>
                <div className="text-sm text-gray-600">Runden</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <div className="text-3xl font-bold text-blue-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Richtig</div>
              </div>
            </div>

            {gameReward && (
              <div className="bg-yellow-50 p-6 rounded-lg border-4 border-yellow-300">
                <h3 className="text-xl font-bold mb-4">🎁 Belohnungen</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-2xl">🪙</span>
                    <span className="font-bold">{gameReward.coins} Münzen</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold">{gameReward.experience} XP</span>
                  </div>
                  {gameReward.animals.length > 0 && (
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <span className="text-2xl">🦁</span>
                      <span className="font-bold">{gameReward.animals.length === 1 ? '1 neues Tier!' : `${gameReward.animals.length} neue Tiere!`}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setGameState('level-select')}
                className="flex-1"
                data-testid="button-play-again"
              >
                Nochmal spielen
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/games/number-stairs')}
                className="flex-1"
                data-testid="button-games"
              >
                Andere Spiele
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}