import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Sparkles, Home, LogOut, Target, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { DECOMPOSITION_LEVELS, type DecompositionLevel } from "@shared/game-levels";

type AnimalType = 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'monkey' | 'panda' | 'koala' | 'penguin' | 'fox' | 'rabbit';

interface Decomposition {
  part1: number;
  part2: number;
  found: boolean;
}

interface GameTask {
  totalNumber: number;
  animal: AnimalType;
  decompositions: Decomposition[];
  requiredCount: number;
}

interface GameStats {
  numbersCompleted: number;
  totalDecompositionsFound: number;
  perfectRounds: number;
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

export default function DecompositionSafari() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addXPToTeam } = useAnimalTeam();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'playing' | 'end'>('start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'duplicate' | null>(null);
  const [stats, setStats] = useState<GameStats>({ numbersCompleted: 0, totalDecompositionsFound: 0, perfectRounds: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [discoveredCommutative, setDiscoveredCommutative] = useState(false);
  const [collectedAnimals, setCollectedAnimals] = useState<AnimalType[]>([]);
  
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);

  const currentLevelConfig = DECOMPOSITION_LEVELS[selectedLevel - 1];

  const generateTask = () => {
    const [minNum, maxNum] = currentLevelConfig.numberRange;
    const totalNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

    // Generiere alle möglichen Zerlegungen (0 + n bis n + 0)
    const decompositions: Decomposition[] = [];
    for (let i = 0; i <= totalNumber; i++) {
      decompositions.push({
        part1: i,
        part2: totalNumber - i,
        found: false
      });
    }

    // Anzahl der geforderten Zerlegungen für dieses Level
    // Formel: Für Zahl x gibt es Math.floor(x/2) + 1 Zerlegungen (ohne Kommutativität)
    const totalUniqueDecompositions = Math.floor(totalNumber / 2) + 1;
    const requiredCount = Math.min(
      Math.floor(Math.random() * (currentLevelConfig.maxDecompositions - currentLevelConfig.minDecompositions + 1)) + currentLevelConfig.minDecompositions,
      totalUniqueDecompositions
    );

    setCurrentTask({
      totalNumber,
      animal: randomAnimal.type,
      decompositions,
      requiredCount
    });
    setInput1('');
    setInput2('');
    setFeedback(null);
    setDiscoveredCommutative(false);
  };

  const handleClearFeedback = () => {
    if (feedback === 'correct') {
      // Bei korrekter Antwort: Nächste Aufgabe/Zahl
      setFeedback(null);
      setShowCelebration(false);
      generateTask();
    } else {
      // Bei falscher/Duplikat-Antwort: Felder leeren und erneut versuchen
      setFeedback(null);
      setInput1('');
      setInput2('');
      document.getElementById('input-part1')?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && feedback) {
      e.preventDefault();
      e.stopPropagation();
      // Kleine Verzögerung damit Modal sichtbar bleibt
      setTimeout(() => {
        handleClearFeedback();
      }, 100);
    }
  };

  const handleSubmit = () => {
    if (!currentTask || !input1 || !input2) return;

    const num1 = parseInt(input1, 10);
    const num2 = parseInt(input2, 10);

    // Validierung: Summe muss stimmen
    if (num1 + num2 !== currentTask.totalNumber) {
      setFeedback('wrong');
      return;
    }

    // Prüfe ob bereits gefunden (beide Richtungen)
    const alreadyFound = currentTask.decompositions.some(d => 
      d.found && ((d.part1 === num1 && d.part2 === num2) || (d.part1 === num2 && d.part2 === num1))
    );

    if (alreadyFound) {
      setFeedback('duplicate');
      return;
    }

    // Markiere als gefunden (beide Richtungen!)
    const updatedDecompositions = currentTask.decompositions.map(d => {
      if ((d.part1 === num1 && d.part2 === num2) || (d.part1 === num2 && d.part2 === num1)) {
        return { ...d, found: true };
      }
      return d;
    });

    // Kommutativität entdeckt?
    if (num1 !== num2 && updatedDecompositions.filter(d => d.found).length >= 2) {
      const hasCommutativePair = updatedDecompositions.some(d1 => 
        d1.found && updatedDecompositions.some(d2 => 
          d2.found && d1.part1 === d2.part2 && d1.part2 === d2.part1 && d1 !== d2
        )
      );
      if (hasCommutativePair && !discoveredCommutative) {
        setDiscoveredCommutative(true);
      }
    }

    setCurrentTask({ ...currentTask, decompositions: updatedDecompositions });
    setStats(prev => ({ ...prev, totalDecompositionsFound: prev.totalDecompositionsFound + 1 }));
    setFeedback('correct');

    // Prüfe ob die geforderte Anzahl gefunden wurde
    const foundCount = updatedDecompositions.filter(d => d.found).length;
    const requiredReached = foundCount >= (currentTask.requiredCount || currentTask.decompositions.length);
    
    if (requiredReached) {
      // Belohne mit Tier
      const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)].type;
      setCollectedAnimals(prev => [...prev, randomAnimal]);
      
      // Speichere Tier sofort
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
      setStats(prev => ({ 
        ...prev, 
        numbersCompleted: prev.numbersCompleted + 1,
        perfectRounds: prev.perfectRounds + 1
      }));
    }
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
    setStats({ numbersCompleted: 0, totalDecompositionsFound: 0, perfectRounds: 0 });
    setCollectedAnimals([]);
    generateTask();
  };

  const restartGame = () => {
    // XP an Team vergeben vor Neustart
    if (user?.id && stats.totalDecompositionsFound > 0) {
      const successRate = stats.perfectRounds / Math.max(stats.numbersCompleted, 1);
      addXPToTeam(successRate, selectedLevel);
    }
    
    setGameState('start');
    setStats({ numbersCompleted: 0, totalDecompositionsFound: 0, perfectRounds: 0 });
  };


  // Start Screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/games/decomposition-safari')}>
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
        <div className="flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4 animate-bounce">🦁🔢🐘</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Zerlegungs-Safari
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Hilf dem Zoo-Wärter, Tiere auf zwei Gehege aufzuteilen!
            </p>

            <div className="space-y-3 text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-4 border-blue-300">
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🦁</span> Du siehst eine Anzahl Tiere (z.B. 8 Affen)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🏠</span> Teile sie auf 2 Gehege auf (z.B. 5 + 3)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🔍</span> Finde ALLE möglichen Zerlegungen!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">⭐</span> Entdecke das Tausch-Geheimnis (5+3 = 3+5)
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-2xl">🏆</span> Vollständige Zerlegung = Meister-Gehege!
              </p>
            </div>

            <Button
              onClick={() => setGameState('level-select')}
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
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
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-200 p-4">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
            <Gamepad2 className="w-4 h-4 mr-2" />
            Spiele
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/games/decomposition-safari')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-4 border-white mb-4">
            <CardContent className="p-6">
              <div className="text-6xl text-center mb-4">🧩</div>
              <h2 className="text-3xl font-bold text-center mb-6">Wähle dein Level</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DECOMPOSITION_LEVELS.map((lvl) => (
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
  const foundCount = currentTask?.decompositions.filter(d => d.found).length || 0;
  const totalCount = currentTask?.decompositions.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Spiele
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLocation('/games/decomposition-safari')}>
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
            <div className="text-9xl animate-bounce">🏆🎉🏆</div>
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              Alle Zerlegungen gefunden!
            </div>
            <div className="text-2xl text-white drop-shadow-lg">
              Meister-Gehege freigeschaltet! ⭐
            </div>
          </div>
        </div>
      )}

      {/* Commutative Discovery */}
      {discoveredCommutative && (
        <div className="fixed top-4 right-4 z-40 animate-in slide-in-from-right duration-500">
          <Card className="border-4 border-purple-400 bg-gradient-to-r from-purple-100 to-pink-100">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-bold text-purple-700">Tausch-Trick entdeckt!</p>
                <p className="text-sm text-purple-600">Die Reihenfolge ist egal! 🔄</p>
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
                  <span className="text-3xl">🦁</span>
                  {stats.numbersCompleted} Zahlen gemeistert
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Zerlegungen: {stats.totalDecompositionsFound}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < stats.perfectRounds ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation('/games/decomposition-safari')}
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
                <div className="text-sm text-muted-foreground">
                  Teile die Tiere auf zwei Gehege auf!
                </div>

                <div className={cn(
                  "inline-block p-8 rounded-2xl bg-gradient-to-br",
                  currentAnimal?.color
                )}>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {[...Array(currentTask?.totalNumber || 0)].map((_, i) => (
                      <div key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                        {currentAnimal?.emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-white mt-6 drop-shadow-lg">
                    {currentTask?.totalNumber} {(() => {
                      const count = currentTask?.totalNumber || 0;
                      const name = currentAnimal?.name || '';
                      if (count === 1) return name;
                      
                      // Spezielle Pluralformen
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

                {/* Input Area */}
                <div className="space-y-4">
                  <div className="text-xl font-semibold">Wie kannst du aufteilen?</div>

                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Gehege A</div>
                      <input
                        ref={input1Ref}
                        id="input-part1"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={input1}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 2) setInput1(val);
                        }}
                        onKeyDown={(e) => {
                          handleKeyDown(e);
                          if (e.key === 'Enter' && input1 && !feedback) {
                            input2Ref.current?.focus();
                          }
                        }}
                        className={cn(
                          "w-20 h-20 text-center text-4xl font-bold border-4 rounded-xl",
                          "focus:outline-none focus:ring-4 transition-all",
                          feedback === 'correct' && "bg-green-100 border-green-500 ring-green-300",
                          feedback === 'wrong' && "bg-red-100 border-red-500 ring-red-300 animate-shake",
                          feedback === 'duplicate' && "bg-yellow-100 border-yellow-500 ring-yellow-300",
                          !feedback && "border-primary focus:ring-primary/30"
                        )}
                        placeholder="?"
                        autoFocus
                      />
                    </div>

                    <div className="text-4xl font-bold text-gray-600">+</div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Gehege B</div>
                      <input
                        ref={input2Ref}
                        id="input-part2"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={input2}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 2) setInput2(val);
                        }}
                        onKeyDown={(e) => {
                          handleKeyDown(e);
                          if (e.key === 'Enter' && input1 && input2 && !feedback) {
                            handleSubmit();
                          }
                        }}
                        className={cn(
                          "w-20 h-20 text-center text-4xl font-bold border-4 rounded-xl",
                          "focus:outline-none focus:ring-4 transition-all",
                          feedback === 'correct' && "bg-green-100 border-green-500 ring-green-300",
                          feedback === 'wrong' && "bg-red-100 border-red-500 ring-red-300 animate-shake",
                          feedback === 'duplicate' && "bg-yellow-100 border-yellow-500 ring-yellow-300",
                          !feedback && "border-primary focus:ring-primary/30"
                        )}
                        placeholder="?"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!input1 || !input2}
                      size="lg"
                      className="h-20 px-6 text-xl"
                    >
                      ✓
                    </Button>
                  </div>

                  {/* Feedback Modal - FIXED above page */}
                  {feedback && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-none">
                      <div className="pointer-events-auto">
                        <Card className="max-w-md shadow-2xl border-4 bg-white">
                          <CardContent className="p-8 text-center space-y-6">
                            {feedback === 'wrong' && (
                              <>
                                <div className="text-6xl">❌</div>
                                <div className="text-2xl font-bold text-red-600">
                                  Falsch!
                                </div>
                                <div className="text-lg text-gray-700">
                                  Das ergibt nicht {currentTask?.totalNumber}!
                                </div>
                                <div className="text-sm text-gray-500 mt-4 font-semibold">
                                  Drücke ENTER zum Erneut Versuchen
                                </div>
                              </>
                            )}
                            {feedback === 'duplicate' && (
                              <>
                                <div className="text-6xl">🔍</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                  Schon gefunden!
                                </div>
                                <div className="text-lg text-gray-700">
                                  Diese Zerlegung kennst du schon!
                                </div>
                                <div className="text-sm text-gray-500 mt-4 font-semibold">
                                  Drücke ENTER zum Erneut Versuchen
                                </div>
                              </>
                            )}
                            {feedback === 'correct' && (
                              <>
                                <div className="text-6xl">✅</div>
                                <div className="text-2xl font-bold text-green-600">
                                  Richtig!
                                </div>
                                <div className="text-lg text-gray-700">
                                  {currentTask?.totalNumber} = ... gefunden!
                                </div>
                                <div className="text-sm text-gray-500 mt-4 font-semibold">
                                  Drücke ENTER für die nächste Aufgabe
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Decomposition Tracker */}
          <Card className="shadow-2xl border-4 border-white">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Level {selectedLevel}: {currentLevelConfig.name}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    Zerlegungs-Familie von {currentTask?.totalNumber}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {foundCount} / {currentTask?.requiredCount || totalCount} Zerlegungen nötig
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(foundCount / (currentTask?.requiredCount || totalCount)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentTask?.decompositions.filter(d => d.found).map((d, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border-2 bg-green-100 border-green-500 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-green-600" />
                        <span className="text-2xl font-bold">
                          {d.part1} + {d.part2}
                        </span>
                      </div>
                      <span className="text-2xl animate-bounce">✅</span>
                    </div>
                  ))}
                </div>

                {foundCount >= (currentTask?.requiredCount || 0) && (
                  <div className="text-center mt-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-4 border-yellow-400">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-lg font-bold text-orange-700">
                      Geschafft! {foundCount === totalCount ? 'Alle' : 'Genug'} Zerlegungen gefunden!
                    </div>
                  </div>
                )}
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