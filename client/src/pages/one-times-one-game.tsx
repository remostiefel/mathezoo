import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiceDisplay } from "@/components/math/DiceDisplay";
import { useAuth } from "@/hooks/useAuth";
import { ONE_TIMES_ONE_LEVELS, type OneTimesOneLevel } from "@shared/game-levels";

interface GameTask {
  diceCount: number;
  rowNumber: number;
  correctAnswer: number;
}

interface GameStats {
  completedLevels: number;
  errors: { level: number; diceCount: number; rowNumber: number; userAnswer: number; correctAnswer: number }[];
  correctAnswersThisLevel: number;
}

/**
 * DiceArrangement Component
 * Displays dice in a 10er-Feld (Tens-Frame) pattern: max 5 dice in top row, 5 in bottom row
 * E.g., 7 shows 5 in top row + 2 in bottom row (like a real tens-frame)
 */
function DiceArrangement({ multiplier, value }: { multiplier: number; value: number }) {
  // TRIPLE SAFETY: Cap max dice display to 10 (typical tens-frame)
  const maxDisplay = 10;
  const safedMultiplier = Math.max(0, Math.min(Math.floor(multiplier), maxDisplay)); // Absolute floor/ceil + integer conversion
  const displayMultiplier = safedMultiplier;
  
  // SAFETY LOGGING
  if (multiplier > 10) {
    console.error(`❌ CRITICAL: DiceArrangement received multiplier=${multiplier}, capping to 10`);
  }
  if (displayMultiplier > 10) {
    console.error(`❌ CRITICAL: displayMultiplier exceeded 10! Value: ${displayMultiplier}`);
  }
  
  // STANDARDIZED: All dice same size (md size = like current 2er-würfel)
  const diceSize = 'md';
  const gapSize = 'gap-3';

  // Split dice into top row (max 5) and bottom row (max 5)
  const topRowCount = Math.min(displayMultiplier, 5);
  const bottomRowCount = Math.max(0, Math.min(displayMultiplier - 5, 5)); // Also cap bottom to max 5
  
  // Get pastel color based on value (1-10)
  const getPastelColor = (v: number) => {
    const colorMap: { [key: number]: any } = {
      1: 'pastel-1', 2: 'pastel-2', 3: 'pastel-3', 4: 'pastel-4', 5: 'pastel-5',
      6: 'pastel-6', 7: 'pastel-7', 8: 'pastel-8', 9: 'pastel-9', 10: 'pastel-10'
    };
    return colorMap[Math.min(v, 10)] || 'pastel-1';
  };
  
  const diceColor = getPastelColor(value);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Top row - max 5 dice */}
      <div 
        className={`${gapSize} flex justify-center px-4`}
      >
        {Array.from({ length: topRowCount }).map((_, i) => (
          <div key={`top-${i}`} className="flex justify-center">
            <DiceDisplay number={value} size={diceSize} color={diceColor} />
          </div>
        ))}
      </div>
      
      {/* Bottom row - max 5 dice */}
      {bottomRowCount > 0 && (
        <div 
          className={`${gapSize} flex justify-center px-4`}
        >
          {Array.from({ length: bottomRowCount }).map((_, i) => (
            <div key={`bottom-${i}`} className="flex justify-center">
              <DiceDisplay number={value} size={diceSize} color={diceColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OneTimesOneGame() {
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const [gameState, setGameState] = useState<'level-select' | 'playing' | 'level-complete' | 'game-complete'>('level-select');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState<GameStats>({ completedLevels: 0, errors: [], correctAnswersThisLevel: 0 });
  const [tasksCompletedInLevel, setTasksCompletedInLevel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // After 10 correct answers, move to next level
  const TASKS_PER_LEVEL = 10;

  const userId = authUser?.id || 'testuser123';
  const currentLevelConfig = ONE_TIMES_ONE_LEVELS[currentLevel - 1];
  const totalLevels = ONE_TIMES_ONE_LEVELS.length;

  const generateTask = (): GameTask => {
    const rows = currentLevelConfig.rows;
    const rowNumber = rows[Math.floor(Math.random() * rows.length)];
    
    // CRITICAL: diceCount (number of dice) NEVER exceeds 10 (max for 10-frame display: 5 top, 5 bottom)
    // rowNumber (eyes per die) = the training row (3, 4, 8, etc.)
    const rawDiceCount = Math.floor(Math.random() * 10) + 1; // 1-10 dice
    const diceCount = Math.min(rawDiceCount, 10); // ABSOLUTE SAFETY: Never exceed 10
    const correctAnswer = diceCount * rowNumber;
    
    console.log(`🎲 Generated task: ${diceCount} dice · ${rowNumber} = ${correctAnswer}`);
    if (diceCount > 10) console.error(`❌ CRITICAL BUG: diceCount exceeded 10! Value: ${diceCount}`);

    return { diceCount, rowNumber, correctAnswer };
  };

  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      setCurrentTask(generateTask());
    }
  }, [gameState, currentTask]);

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentTask]);

  // Auto-advance to next task when answer is correct (no feedback screen - just next task!)
  useEffect(() => {
    if (feedback === 'correct' && gameState === 'playing') {
      const timer = setTimeout(() => {
        const nextTaskCount = tasksCompletedInLevel + 1;
        
        // After 10 tasks in this level, go to level-complete screen
        if (nextTaskCount >= TASKS_PER_LEVEL) {
          setTasksCompletedInLevel(0);
          setStats(prev => ({ ...prev, completedLevels: currentLevel }));
          setGameState('level-complete');
        } else {
          // Otherwise, just generate next task immediately (no feedback screen)
          setTasksCompletedInLevel(nextTaskCount);
          setFeedback(null);
          setUserInput('');
          setCurrentTask(null); // This triggers useEffect to generate new task
        }
      }, 300); // Minimal delay just to show the green checkmark briefly
      return () => clearTimeout(timer);
    }
  }, [feedback, gameState, tasksCompletedInLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const pattern = /^[0-9]{1,3}$/;
    if (value === '' || pattern.test(value)) {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (feedback === 'correct') {
        setGameState('level-complete');
      } else if (feedback === 'wrong') {
        setFeedback(null);
        setUserInput('');
      } else if (userInput.length > 0 && currentTask) {
        checkAnswer(parseInt(userInput));
      }
    }
  };

  const checkAnswer = async (answer: number) => {
    if (!currentTask || feedback !== null) return;

    const isCorrect = answer === currentTask.correctAnswer;

    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      
      // Save error immediately (like MinusPlus does)
      const errorData = {
        level: currentLevel,
        diceCount: currentTask.diceCount,
        rowNumber: currentTask.rowNumber,
        userAnswer: answer,
        correctAnswer: currentTask.correctAnswer
      };
      
      // Track error in state
      setStats(prev => ({
        ...prev,
        errors: [...prev.errors, errorData]
      }));
      
      // SEND ERROR TO SERVER IMMEDIATELY (not just at end)
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            gameType: 'one-times-one',
            level: currentLevel,
            task: {
              diceCount: currentTask.diceCount,
              rowNumber: currentTask.rowNumber,
              operation: '*'
            },
            studentAnswer: answer,
            correctAnswer: currentTask.correctAnswer,
            isCorrect: false
          })
        }).catch(err => console.error('Error saving error to server:', err));
      } catch (error) {
        console.error('Failed to save error:', error);
      }
    }
  };

  const handleLevelComplete = async () => {
    if (currentLevel < totalLevels) {
      setCurrentLevel(currentLevel + 1);
      setFeedback(null);
      setUserInput('');
      setCurrentTask(null);
      setTasksCompletedInLevel(0); // Reset counter for new level
      setGameState('playing');
    } else {
      // All levels completed
      try {
        await fetch('/api/zahlenwaage/update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            gameType: 'one-times-one',
            totalLevels: stats.completedLevels + 1,
            totalErrors: stats.errors.length,
            errors: stats.errors
          })
        });
      } catch (error) {
        console.error('Error saving stats:', error);
      }
      setGameState('game-complete');
    }
  };

  if (gameState === 'level-select') {
    const progressGroups = [
      { range: '1-20', name: '1er & 10er', color: 'from-blue-400 to-blue-600' },
      { range: '21-40', name: '2er & 5er', color: 'from-green-400 to-green-600' },
      { range: '41-60', name: '3er & 4er', color: 'from-yellow-400 to-yellow-600' },
      { range: '61-80', name: '6er & 9er', color: 'from-orange-400 to-orange-600' },
      { range: '81-100', name: '7er & 8er', color: 'from-red-400 to-red-600' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-red-300 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Wähle dein Trainingsprogramm
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {progressGroups.map((group) => (
                <Button
                  key={group.range}
                  onClick={() => {
                    const startLevel = parseInt(group.range.split('-')[0]);
                    setCurrentLevel(startLevel);
                    setGameState('playing');
                    setFeedback(null);
                    setUserInput('');
                    setCurrentTask(null);
                    setTasksCompletedInLevel(0);
                  }}
                  className={cn(
                    "h-24 flex flex-col gap-2 text-white font-bold hover-elevate active-elevate-2 bg-gradient-to-br",
                    group.color
                  )}
                >
                  <span className="text-2xl">{group.name}</span>
                  <span className="text-sm opacity-90">Level {group.range}</span>
                </Button>
              ))}
            </div>

            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                <strong>Tipp:</strong> Starten Sie bei Level 1 für eine progressives Training oder wählen Sie Ihr aktuelles Level!
              </p>
            </div>

            <Button variant="outline" onClick={() => setLocation('/training')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'level-complete') {
    const progressPercent = (currentLevel / totalLevels) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-red-300 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-600">Level erfolgreich!</h2>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                Level {currentLevel} / {totalLevels}
              </p>
              <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{Math.round(progressPercent)}% abgeschlossen</p>
            </div>
            <div className="space-y-2">
              {stats.errors.filter(e => e.level === currentLevel).length > 0 && (
                <p className="text-sm text-orange-600 font-semibold">
                  {stats.errors.filter(e => e.level === currentLevel).length} Fehler in diesem Level
                </p>
              )}
              {stats.errors.filter(e => e.level === currentLevel).length === 0 && (
                <p className="text-sm text-green-600 font-semibold">✓ Perfekt gelöst!</p>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleLevelComplete}
              className="w-full"
            >
              {currentLevel < totalLevels ? 'Nächstes Level' : 'Training abgeschlossen!'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'game-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-red-300 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-8xl animate-bounce">👑</div>
            <h2 className="text-4xl font-bold text-green-600">Meister!</h2>
            <p className="text-xl font-semibold text-gray-700">
              Du hast alle 100 Levels abgeschlossen!
            </p>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6 border-2 border-yellow-400">
              <p className="text-lg font-bold text-yellow-800">
                Gesamt Fehler: {stats.errors.length}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                setCurrentLevel(1);
                setFeedback(null);
                setUserInput('');
                setCurrentTask(null);
                setStats({ completedLevels: 0, errors: [], correctAnswersThisLevel: 0 });
                setGameState('level-select');
              }}
              className="w-full"
            >
              Nochmal spielen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-red-300 p-4 overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-6 pt-8 relative z-10">
        <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border-4 border-white">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center gap-2"
              data-testid="button-home-1x1"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGameState('level-select')}
              className="flex items-center gap-2"
              data-testid="button-quit-1x1"
            >
              <ArrowLeft className="w-4 h-4" />
              Beenden
            </Button>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              Level {currentLevel}/{totalLevels}
            </div>
            <div className="text-sm font-semibold text-blue-600">
              {tasksCompletedInLevel}/{TASKS_PER_LEVEL} ✓ Aufgaben
            </div>
          </div>
          
          <div className="text-lg font-bold text-purple-600">
            {stats.errors.length} Fehler
          </div>
        </div>

        {currentTask && currentLevelConfig && (
          <div className="flex flex-col items-center justify-center gap-8">
            <Card className="w-full">
              <CardContent className="p-12 flex flex-col items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-gray-600 mb-8 text-lg font-semibold">Wie viele Würfelaugen siehst du?</p>
                  
                  {/* Visual Grid Pattern of Dice arranged by dot pattern */}
                  <DiceArrangement multiplier={currentTask.diceCount} value={currentTask.rowNumber} />
                </div>
              </CardContent>
            </Card>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center shadow-xl border-4 border-white w-full">
              <label className="text-2xl font-bold text-gray-800 block mb-4">
                Ergebnis eingeben:
              </label>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={feedback !== null}
                className={cn(
                  "w-40 h-24 text-6xl text-center border-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 shadow-lg font-bold",
                  "transition-all duration-200 bg-white",
                  feedback === 'wrong' && "animate-shake border-red-400 bg-red-50",
                  feedback === 'correct' && "opacity-50 cursor-not-allowed border-green-400 bg-green-50"
                )}
                maxLength={3}
                autoFocus
              />
            </div>

            {feedback === 'wrong' && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-10 max-w-2xl shadow-2xl space-y-8">
                  {/* Header */}
                  <div className="text-center">
                    <div className="text-6xl mb-4">💭</div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Nicht ganz!</h3>
                    <p className="text-lg text-gray-600">Schau dir an, wie es richtig geht:</p>
                  </div>

                  {/* Aufgabe anzeigen */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-700 font-semibold">AUFGABE:</p>
                      <div className="flex justify-center items-center gap-4">
                        <div className="text-5xl font-bold text-purple-600">{currentTask.diceCount}</div>
                        <div className="text-4xl font-bold text-gray-800">·</div>
                        <div className="text-5xl font-bold text-purple-600">{currentTask.rowNumber}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vergleich: Deine Antwort vs. Richtig */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Falsche Antwort */}
                    <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-red-600 mb-3 uppercase">Deine Antwort</p>
                      <div className="text-5xl font-black text-red-500">{userInput || '—'}</div>
                      <p className="text-xs text-red-600 mt-3 font-semibold">✗ Nicht korrekt</p>
                    </div>

                    {/* Richtige Antwort */}
                    <div className="bg-green-50 border-3 border-green-400 rounded-2xl p-4 text-center">
                      <p className="text-xs font-bold text-green-600 mb-3 uppercase">Richtige Antwort</p>
                      <div className="text-5xl font-black text-green-600">{currentTask.correctAnswer}</div>
                      <p className="text-xs text-green-600 mt-3 font-semibold">✓ Korrekt!</p>
                    </div>
                  </div>

                  {/* Würfel-Visualisierung der richtigen Antwort - mit Zehnerfeld-Layout */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                    <p className="text-sm text-gray-700 font-semibold mb-4">So sieht die Antwort aus:</p>
                    <DiceArrangement multiplier={currentTask.diceCount} value={currentTask.rowNumber} />
                  </div>

                  {/* Motivierender Text und Button */}
                  <div className="text-center space-y-4">
                    <p className="text-gray-700 font-semibold">
                      Merke dir: <span className="text-purple-600 font-bold">{currentTask.diceCount} · {currentTask.rowNumber} = {currentTask.correctAnswer}</span>
                    </p>
                    <Button
                      onClick={() => {
                        setFeedback(null);
                        setUserInput('');
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg py-6 hover-elevate active-elevate-2"
                    >
                      Nochmal versuchen
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
