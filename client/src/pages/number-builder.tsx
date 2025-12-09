import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Home, Trophy, Gamepad2, ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { calculateGameReward, type ZooGameReward } from "@/lib/zoo-game-system";
import { NUMBER_BUILDER_LEVELS, type NumberBuilderLevel } from "@shared/game-levels";

interface PlaceValueTask {
  hundreds: number;
  tens: number;
  ones: number;
  correctAnswer: number;
}

// SVG Components
function HundredSquare() {
  return (
    <svg width="60" height="60" className="inline-block m-1">
      <rect width="58" height="58" x="1" y="1" fill="#4ade80" stroke="#16a34a" strokeWidth="2" rx="4" />
      <g stroke="#16a34a" strokeWidth="0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h-${i}`} x1="1" y1={i * 5.8 + 1} x2="59" y2={i * 5.8 + 1} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 5.8 + 1} y1="1" x2={i * 5.8 + 1} y2="59" />
        ))}
      </g>
      <text x="30" y="35" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#ffffff">
        H
      </text>
    </svg>
  );
}

function TenBar() {
  return (
    <svg width="60" height="20" className="inline-block m-1">
      <rect width="58" height="18" x="1" y="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" rx="3" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={i * 5.8 + 6.8} y1="1" x2={i * 5.8 + 6.8} y2="19" stroke="#2563eb" strokeWidth="0.5" />
      ))}
      <text x="30" y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
        Z
      </text>
    </svg>
  );
}

function OneCube() {
  return (
    <svg width="20" height="20" className="inline-block m-1">
      <rect width="18" height="18" x="1" y="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" rx="3" />
      <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
        E
      </text>
    </svg>
  );
}

export default function NumberBuilder() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentTask, setCurrentTask] = useState<PlaceValueTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [shake, setShake] = useState(false);
  const [gameReward, setGameReward] = useState<ZooGameReward | null>(null);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLevelConfig = NUMBER_BUILDER_LEVELS[selectedLevel - 1];

  const saveGameMutation = useMutation({
    mutationFn: async (reward: ZooGameReward) => {
      if (!user?.id) return;

      return apiRequest('POST', '/api/zoo/game-result', {
        userId: user.id,
        gameType: 'number-builder',
        correctAnswers,
        totalAnswers: totalAttempts,
        coinsEarned: reward.coins,
        animalsEarned: reward.animals,
        experienceEarned: reward.experience,
      });
    }
  });

  const generateTask = () => {
    let hundreds = Math.floor(Math.random() * (currentLevelConfig.maxHundreds + 1));
    let tens = Math.floor(Math.random() * (currentLevelConfig.maxTens + 1));
    let ones = Math.floor(Math.random() * (currentLevelConfig.maxOnes + 1));

    // Stelle sicher, dass nicht alle Null sind
    if (hundreds === 0 && tens === 0 && ones === 0) {
      ones = Math.floor(Math.random() * 5) + 1;
    }

    // WICHTIG: Bei Level 8 (mit Bündeln) können mehr als 10 Einer/Zehner vorkommen
    // Das ist gewollt - Kinder sollen lernen zu bündeln!
    // Beispiel: 12 Einer = 1 Zehner + 2 Einer = 12
    // Die richtige Antwort ist trotzdem: hundreds * 100 + tens * 10 + ones
    const correctAnswer = hundreds * 100 + tens * 10 + ones;

    // Generate shuffled order once per task
    const order = [];
    if (hundreds > 0) order.push('hundreds');
    if (tens > 0) order.push('tens');
    if (ones > 0) order.push('ones');
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    setShuffledOrder(shuffled);

    setCurrentTask({ hundreds, tens, ones, correctAnswer });
    setUserInput('');
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!currentTask || !userInput) return;

    const answer = parseInt(userInput, 10);
    setTotalAttempts(prev => prev + 1);

    if (answer === currentTask.correctAnswer) {
      setFeedback('correct');
      setCorrectAnswers(prev => prev + 1);
      setRoundsCompleted(prev => prev + 1);

      setTimeout(() => {
        generateTask();
      }, 1200);
    } else {
      setFeedback('wrong');
      setShake(true);

      setTimeout(() => {
        setFeedback(null);
        setShake(false);
        setUserInput('');
      }, 800);
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
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setRoundsCompleted(0);
  };

  const endGame = () => {
    const reward = calculateGameReward(
      'number-builder',
      correctAnswers,
      totalAttempts,
      roundsCompleted >= 10 ? ['place-value-expert'] : []
    );
    setGameReward(reward);

    if (user?.id) {
      saveGameMutation.mutate(reward);
    }

    setGameState('end');
  };

  // Generate task when playing starts
  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      generateTask();
    }
  }, [gameState, currentTask]);

  // Auto-focus
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentTask, feedback]);

  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-blue-200 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games/number-builder')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/student')}>
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
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4">🏗️</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Zahlen-Baumeister
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Baue Zahlen mit Hundertern, Zehnern und Einern!
            </p>

            <div className="space-y-3 text-left bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-4 border-green-300">
              <p className="text-sm flex items-center gap-2">
                <HundredSquare /> = 100 (Hunderterplatte)
              </p>
              <p className="text-sm flex items-center gap-2">
                <TenBar /> = 10 (Zehnerstange)
              </p>
              <p className="text-sm flex items-center gap-2">
                <OneCube /> = 1 (Einerwürfel)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🔢</span> Tippe die richtige Zahl ein!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">💡</span> Beispiel: 2H + 3Z + 5E = 235
              </p>
            </div>

            <Button
              onClick={() => setGameState('level-select')}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-green-500 to-blue-600"
              data-testid="button-start"
            >
              Level wählen!
            </Button>


          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Selection
  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-blue-200 p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games/number-builder')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-4 border-white mb-4">
            <CardContent className="p-6">
              <div className="text-6xl text-center mb-4">🏗️</div>
              <h2 className="text-3xl font-bold text-center mb-6">Wähle dein Level</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {NUMBER_BUILDER_LEVELS.map((lvl) => (
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
  if (gameState === 'playing' && currentTask) {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-blue-200 p-4 transition-transform",
        shake && "animate-shake"
      )}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-2 border-4 border-white shadow-xl">
            <CardContent className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{currentLevelConfig.icon}</div>
                <div>
                  <div className="text-xs text-muted-foreground">Level {selectedLevel}: {currentLevelConfig.name}</div>
                  <div className="text-sm font-bold">Aufgabe {roundsCompleted + 1}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Richtig</div>
                  <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Versuche</div>
                  <div className="text-lg font-bold">{totalAttempts}</div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endGame}
                  data-testid="button-end-game"
                >
                  Beenden
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visual Representation */}
          <Card className="mb-2 border-4 border-white shadow-xl">
            <CardContent className="p-2">
              <div className="space-y-1">
                {/* Horizontal layout with stored shuffle order */}
                <div className="flex flex-row gap-2 justify-center items-stretch">
                  {(() => {
                    // Create map of place values with their data
                    const placeValuesMap: Record<string, any> = {
                      hundreds: {
                        type: 'hundreds',
                        count: currentTask.hundreds,
                        bgColor: 'bg-green-50',
                        borderColor: 'border-green-300',
                        textColor: 'text-green-800',
                        tipBg: 'bg-green-200',
                        label: 'Hunderter',
                        component: HundredSquare
                      },
                      tens: {
                        type: 'tens',
                        count: currentTask.tens,
                        bgColor: 'bg-blue-50',
                        borderColor: 'border-blue-300',
                        textColor: 'text-blue-800',
                        tipBg: 'bg-blue-200',
                        label: 'Zehner',
                        component: TenBar
                      },
                      ones: {
                        type: 'ones',
                        count: currentTask.ones,
                        bgColor: 'bg-yellow-50',
                        borderColor: 'border-yellow-300',
                        textColor: 'text-yellow-800',
                        tipBg: 'bg-yellow-200',
                        label: 'Einer',
                        component: OneCube
                      }
                    };

                    return shuffledOrder.map((key, idx) => {
                      const pv = placeValuesMap[key];
                      if (!pv) return null;
                      return (
                        <div key={`${pv.type}-${idx}`} className={`${pv.bgColor} p-2 rounded-lg border-2 ${pv.borderColor} flex-1 min-w-0 flex flex-col`}>
                          <div className={`text-sm font-bold mb-1 ${pv.textColor} text-center`}>
                            {pv.count} {pv.label}
                            {pv.count > 10 && (
                              <div className={`mt-0.5 text-xs ${pv.tipBg} px-1 py-0.5 rounded`}>
                                💡 Bündeln!
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap justify-center">
                            {Array.from({ length: pv.count }).map((_, i) => {
                              const Component = pv.component;
                              return <Component key={`${pv.type}-item-${i}`} />;
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Bundling Hint for high levels */}
                {currentLevelConfig.allowBundling && (currentTask.tens > 10 || currentTask.ones > 10) && (
                  <div className="bg-purple-100 p-1 rounded-lg border-2 border-purple-300">
                    <p className="text-xs text-purple-800 font-semibold text-center">
                      🎓 Denk daran: 10 Einer = 1 Zehner, 10 Zehner = 1 Hunderter!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card className="border-4 border-white shadow-xl">
            <CardContent className="p-2">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-600">Welche Zahl ist das?</p>

                <div className="flex gap-2 max-w-4xl mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userInput}
                    onChange={(e) => {
                      const newVal = e.target.value.replace(/[^0-9]/g, '');
                      setUserInput(newVal);
                    }}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Zahl eingeben"
                    className={cn(
                      "w-full text-center text-4xl font-black border-0 border-b-4 rounded-none bg-transparent border-primary placeholder:text-2xl placeholder:text-gray-400",
                      "focus:outline-none focus:border-green-500 caret-primary transition-colors h-16",
                      "flex-1",
                      feedback === 'correct' && "bg-green-100 border-green-500",
                      feedback === 'wrong' && "bg-red-100 border-red-500"
                    )}
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif', textDecoration: 'none', letterSpacing: '0.02em' }}
                    data-testid="input-answer"
                  />
                  <Button
                    onClick={handleSubmit}
                    size="sm"
                    className="px-4 h-16 text-lg font-bold"
                    disabled={!userInput}
                    data-testid="button-submit"
                  >
                    Prüfen
                    <div className="text-xs">(ENTER)</div>
                  </Button>
                </div>

                {feedback === 'correct' && (
                  <div className="text-lg text-green-600 font-bold animate-bounce">
                    ✅ Richtig! Super! 🎉
                  </div>
                )}

                {feedback === 'wrong' && (
                  <div className="text-lg text-red-600 font-bold">
                    ❌ Versuch es nochmal!
                  </div>
                )}
              </div>
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
    const successRate = totalAttempts > 0 ? (correctAnswers / totalAttempts * 100).toFixed(0) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-200 to-blue-200 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold">Geschafft!</h1>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Richtig</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <div className="text-3xl font-bold text-blue-600">{totalAttempts}</div>
                <div className="text-sm text-gray-600">Versuche</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
                <div className="text-3xl font-bold text-purple-600">{successRate}%</div>
                <div className="text-sm text-gray-600">Erfolgsrate</div>
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
                onClick={() => setLocation('/games/number-builder')}
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