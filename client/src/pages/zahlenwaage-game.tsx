import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Star, Home, LogOut, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiceDisplay } from "@/components/math/DiceDisplay";
import { ZooAnimal, ANIMAL_EMOJIS, ANIMAL_NAMES, calculateActiveBonuses } from "@/lib/zoo-game-system";
import { ZooFeedback } from "@/components/zoo/ZooFeedback";
import { useAuth } from "@/hooks/useAuth";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { ZAHLENWAAGE_LEVELS, type ZahlenwaageLevel } from "@shared/game-levels";
import { MilestoneCelebration } from "@/components/progression/MilestoneCelebration";
import { AnimalUnlockNotification } from "@/components/zoo/AnimalUnlockNotification";
import { AppHeader } from "@/components/ui/app-header";

type RepresentationType = 'digit' | 'dice' | 'animalPattern';

type ThemeType = 'underwater' | 'sky' | 'zoo';

type AnimalType = 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'monkey' | 'panda' | 'koala' | 'penguin' | 'fox' | 'rabbit';

interface GameTask {
  numbers: number[];
  types: RepresentationType[];
  animalTypes?: AnimalType[];
  expressions?: (string | undefined)[];
  correctAnswer: number;
  correctIndex: number;
  multipliers?: number[];
  baseValues?: number[];
}

interface GameStats {
  animalsCollected: AnimalType[];
  totalAttempts: number;
  confettiStreaks: number;
}

interface ConfettiParticle {
  id: number;
  left: number;
  delay: number;
  color: string;
  rotation: number;
  type: AnimalType;
}

interface BackgroundAnimal {
  id: number;
  type: 'butterfly' | 'bird' | 'fish' | 'turtle' | 'dragonfly' | 'bee';
  startX: number;
  startY: number;
  duration: number;
  delay: number;
}

const ALL_ANIMALS: AnimalType[] = ['lion', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'penguin', 'fox', 'rabbit'];

const MILESTONES = [
  { id: 1, name: 'Erste Schritte', threshold: 5, reward: 'bronze' },
  { id: 2, name: 'Gut dabei', threshold: 10, reward: 'silver' },
  { id: 3, name: 'Profi', threshold: 20, reward: 'gold' }
] as const;

interface ZahlenwaageGameProps {
  onGameComplete?: (stats: { animalsCollected: AnimalType[], parties: number }) => void;
  embedded?: boolean;
}

export default function ZahlenwaageGame({ onGameComplete, embedded = false }: ZahlenwaageGameProps = {}) {
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth(); // Renamed to avoid conflict
  const { addXPToTeam, getTalentEffects } = useAnimalTeam();
  const [gameState, setGameState] = useState<'start' | 'level-select' | 'playing' | 'end' | 'ended'>(embedded ? 'playing' : 'start');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<GameStats>({ animalsCollected: [], totalAttempts: 0, confettiStreaks: 0 });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [backgroundAnimals, setBackgroundAnimals] = useState<BackgroundAnimal[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [theme, setTheme] = useState<ThemeType>('zoo');
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [showAnimalUnlock, setShowAnimalUnlock] = useState(false);
  const [unlockedAnimals, setUnlockedAnimals] = useState<ZooAnimal[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [awaitingEnter, setAwaitingEnter] = useState(false);

  // Placeholder for user ID, using the one from auth context if available, otherwise a default
  const userId = authUser?.id || 'testuser123';

  const currentLevelConfig = ZAHLENWAAGE_LEVELS[selectedLevel - 1];

  const getCurrentPhase = (): 1 | 2 | 3 => {
    if (timeLeft > 40) return 1;
    if (timeLeft > 20) return 2;
    return 3;
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'underwater':
        return ['from-blue-400 to-cyan-500', 'from-teal-400 to-emerald-500', 'from-purple-400 to-pink-500'];
      case 'sky':
        return ['from-sky-300 to-blue-400', 'from-orange-300 to-yellow-400', 'from-pink-300 to-purple-400'];
      case 'zoo':
        return ['from-green-400 to-lime-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-red-500'];
    }
  };

  const getThemeBackground = () => {
    switch (theme) {
      case 'underwater':
        return 'bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-600';
      case 'sky':
        return 'bg-gradient-to-b from-sky-400 via-blue-300 to-cyan-200';
      case 'zoo':
        return 'bg-gradient-to-b from-green-300 via-lime-200 to-yellow-200';
    }
  };

  const getRandomAnimal = (): AnimalType => {
    return ALL_ANIMALS[Math.floor(Math.random() * ALL_ANIMALS.length)];
  };

  const generateTask = (): GameTask => {
    let newTask: GameTask;
    let attempts = 0;
    const [minNum, maxNum] = currentLevelConfig.numberRange;
    const numCount = currentLevelConfig.numberCount;
    const isMultiplicationMode = currentLevelConfig.allowMultiplication;

    do {
      const numbers: number[] = [];
      const types: RepresentationType[] = [];
      const animalTypes: AnimalType[] = [];
      const expressions: (string | undefined)[] = [];
      const multipliers: number[] = [];
      const baseValues: number[] = [];

      if (isMultiplicationMode) {
        // Multiplikations-Modus für Level 9, 10 & 11
        for (let i = 0; i < numCount; i++) {
          let multiplier: number;
          let baseValue: number;

          if (selectedLevel === 9) {
            // Level 9: Gemäßigte Aufgaben (2·2 bis 4·5)
            multiplier = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
            baseValue = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
          } else if (selectedLevel === 10) {
            // Level 10: Schwierige Aufgaben (3·3 bis 5·6, max 10 Würfel pro Feld)
            multiplier = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
            baseValue = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6
          } else {
            // Level 11: Nur 5·5 Quadratzahlen
            const square = 5;
            multiplier = square;
            baseValue = square;
          }

          const num = multiplier * baseValue;

          // Avoid duplicates
          let duplicateAttempts = 0;
          while (numbers.includes(num) && duplicateAttempts < 20) {
            if (selectedLevel === 9) {
              multiplier = Math.floor(Math.random() * 3) + 2;
              baseValue = Math.floor(Math.random() * 4) + 2;
            } else if (selectedLevel === 10) {
              multiplier = Math.floor(Math.random() * 3) + 3;
              baseValue = Math.floor(Math.random() * 4) + 3;
            } else {
              // Level 11: Nur 5·5
              multiplier = 5;
              baseValue = 5;
            }
            duplicateAttempts++;
          }

          numbers.push(num);
          multipliers.push(multiplier);
          baseValues.push(baseValue);
          types.push('dice');
          animalTypes.push(getRandomAnimal());
          expressions.push(`${multiplier}·${baseValue}`);
        }
      } else {
        // Standard-Modus (Addition/Vergleich)
        for (let i = 0; i < numCount; i++) {
          let num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

          let duplicateAttempts = 0;
          while (duplicateAttempts < 30) {
            const isTooSimilar = numbers.some(existingNum => Math.abs(existingNum - num) < 2);
            if (!isTooSimilar) {
              break;
            }
            num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            duplicateAttempts++;
          }

          numbers.push(num);

          let repType: RepresentationType;
          const canUseDice = currentLevelConfig.allowDice && num >= 1 && num <= 6;
          const canUseAnimals = currentLevelConfig.allowAnimals && num >= 1 && num <= 10;

          if (!canUseDice && !canUseAnimals) {
            repType = 'digit';
          } else if (!canUseDice && canUseAnimals) {
            repType = Math.random() > 0.5 ? 'digit' : 'animalPattern';
          } else if (canUseDice && !canUseAnimals) {
            repType = Math.random() > 0.5 ? 'digit' : 'dice';
          } else {
            const rand = Math.random();
            if (rand < 0.4) repType = 'digit';
            else if (rand < 0.7 && canUseDice) repType = 'dice';
            else if (canUseAnimals) repType = 'animalPattern';
            else repType = 'digit';
          }

          types.push(repType);
          animalTypes.push(getRandomAnimal());
          expressions.push(undefined);
        }
      }

      const maxValue = Math.max(...numbers);
      const maxIndex = numbers.indexOf(maxValue);

      newTask = {
        numbers,
        types,
        animalTypes,
        expressions,
        correctAnswer: maxValue,
        correctIndex: maxIndex,
        multipliers: isMultiplicationMode ? multipliers : undefined,
        baseValues: isMultiplicationMode ? baseValues : undefined,
      };

      attempts++;

      if (currentTask &&
          newTask.numbers.length === currentTask.numbers.length &&
          newTask.numbers.every((n, i) => n === currentTask.numbers[i]) &&
          newTask.correctAnswer === currentTask.correctAnswer) {
        continue;
      }

      const uniqueNumbers = new Set(numbers);
      if (uniqueNumbers.size === numbers.length) {
        break;
      }

    } while (attempts < 30);

    return newTask;
  };

  const startGame = () => {
    setGameState('level-select');
  };

  const startGameWithLevel = (level: number) => {
    setSelectedLevel(level);
    setGameState('playing');
    setTaskCount(0);
    const themes: ThemeType[] = ['underwater', 'sky', 'zoo'];
    setTheme(themes[Math.floor(Math.random() * themes.length)]);
    setTimeLeft(60);
    setCurrentTask(null);
  };

  useEffect(() => {
    if (gameState === 'playing' && !currentTask) {
      setCurrentTask(generateTask());
    }
  }, [gameState, currentTask]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleGameEnd();
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentTask]);

  const createConfettiExplosion = (rewardAnimal: AnimalType) => {
    const particles: ConfettiParticle[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FF9FF3', '#54A0FF', '#48DBFB'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720,
        type: rewardAnimal
      });
    }

    setConfettiParticles(particles);
    setTimeout(() => setConfettiParticles([]), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow up to 3 digits for levels 7+ (which can have 3-digit numbers)
    const maxDigits = selectedLevel >= 7 ? 3 : 2;
    const pattern = new RegExp(`^[0-9]{1,${maxDigits}}$`);
    if (value === '' || pattern.test(value)) {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (awaitingEnter) {
        // Continue after feedback by pressing ENTER
        setAwaitingEnter(false);
        setFeedback(null);
        setCorrectIndex(null);
        setUserInput('');
        setCurrentTask(generateTask());
      } else if (userInput.length > 0) {
        checkAnswer(parseInt(userInput));
      }
    }
  };

  const checkAnswer = async (answer: number) => {
    if (!currentTask || feedback !== null) return; // Prevent double submission

    const correctAnswer = currentTask.correctAnswer;
    const isCorrect = answer === correctAnswer;

    // Debug logging für Level 4
    if (selectedLevel === 4) {
      console.log('Level 4 Answer Check:', {
        userAnswer: answer,
        correctAnswer: correctAnswer,
        numbers: currentTask.numbers,
        maxNumber: Math.max(...currentTask.numbers),
        isCorrect: isCorrect
      });
    }

    if (isCorrect) {
      const newAnimal = getRandomAnimal();
      const newStreak = streak + 1;
      const newTaskCount = taskCount + 1;

      // Setze Feedback sofort, um weitere Eingaben zu blockieren
      setFeedback('correct');
      setCorrectIndex(currentTask.correctIndex);
      setCorrectCount(prev => prev + 1);
      setCompletedTasks(prev => prev + 1);

      // 💰 MÜNZ-BELOHNUNG MIT ITEM-BONI!
      try {
        // Fetch user profile to get item bonuses
        const profileResponse = await fetch(`/api/zoo/profile/${userId}`, {
          credentials: 'include'
        });
        const profile = await profileResponse.json();
        const bonuses = calculateActiveBonuses(profile.ownedShopItems || []);

        // Basis-Münzen pro richtiger Antwort
        let earnedCoins = 5;

        // Streak-Bonus: +2 Münzen ab Streak 5
        if (newStreak >= 5) {
          earnedCoins += 2;
        }

        // Party-Bonus: +10 Münzen bei jeder 5er-Party
        if (newStreak % 5 === 0 && newStreak > 0) {
          earnedCoins += 10;
        }

        // Item-Bonus anwenden! 🎉
        if (bonuses.coinBonus > 0) {
          const bonusCoins = Math.floor(earnedCoins * (bonuses.coinBonus / 100));
          earnedCoins += bonusCoins;
          console.log(`💎 Item-Bonus: +${bonusCoins} Münzen (${bonuses.coinBonus}% Bonus)`);
        }

        // Münzen zum Account hinzufügen
        await fetch(`/api/zoo/add-coins/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ coins: earnedCoins })
        });

        console.log(`💰 Earned ${earnedCoins} coins! (Streak: ${newStreak})`);
      } catch (error) {
        console.error('Error calculating/adding coins:', error);
      }

      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        animalsCollected: [...prev.animalsCollected, newAnimal]
      }));

      setStreak(newStreak); // Streak wird jetzt korrekt nach der Prüfung gesetzt
      setTaskCount(newTaskCount);

      if (newStreak % 5 === 0 && newStreak > 0) {
        createConfettiExplosion(newAnimal);
        setStats(prev => ({ ...prev, confettiStreaks: prev.confettiStreaks + 1 }));
      }

      // Wait for ENTER instead of auto-continuing
      setAwaitingEnter(true);
    } else {
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1
      }));
      setStreak(0); // Streak zurücksetzen bei falscher Antwort
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
      }, 400);
    }
  };

  const AnimalIcon = ({ animal, size = 32 }: { animal: AnimalType; size?: number }) => {
    const icons: Record<AnimalType, string> = {
      lion: '🦁',
      elephant: '🐘',
      giraffe: '🦒',
      zebra: '🦓',
      monkey: '🐵',
      panda: '🐼',
      koala: '🐨',
      penguin: '🐧',
      fox: '🦊',
      rabbit: '🐰'
    };

    return <span style={{ fontSize: `${size}px` }}>{icons[animal]}</span>;
  };

  const AnimalPatternVisualization = ({ number, animal }: { number: number; animal: AnimalType }) => {
    const patterns: Record<number, [number, number][]> = {
      1: [[50, 50]],
      2: [[35, 50], [65, 50]],
      3: [[30, 35], [50, 60], [70, 35]],
      4: [[30, 30], [70, 30], [30, 70], [70, 70]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 30], [50, 30], [75, 30], [25, 70], [50, 70], [75, 70]],
      7: [[25, 25], [50, 25], [75, 25], [50, 50], [25, 75], [50, 75], [75, 75]],
      8: [[20, 25], [40, 25], [60, 25], [80, 25], [20, 60], [40, 60], [60, 60], [80, 60]],
      9: [[25, 25], [50, 25], [75, 25], [25, 50], [50, 50], [75, 50], [25, 75], [50, 75], [75, 75]],
      10: [[15, 20], [30, 20], [45, 20], [60, 20], [75, 20], [15, 55], [30, 55], [45, 55], [60, 55], [75, 55]]
    };

    const positions = patterns[number] || patterns[1];

    // Use square container for 9 (3x3 grid)
    const containerClass = number === 9 ? "relative w-48 h-48" : "relative w-48 h-40";

    return (
      <div className={containerClass}>
        {positions.map((pos, idx) => (
          <div
            key={idx}
            className="absolute transition-all duration-300"
            style={{
              left: `${pos[0]}%`,
              top: `${pos[1]}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <AnimalIcon animal={animal} size={36} />
          </div>
        ))}
      </div>
    );
  };

  const DigitVisualization = ({ number, expression }: { number: number; expression?: string }) => {
    return (
      <div className="text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
        {expression || number}
      </div>
    );
  };

  const MultiplicationDiceVisualization = ({ multiplier, baseValue }: { multiplier: number; baseValue: number }) => {
    const isSquare = multiplier === baseValue;
    
    if (isSquare) {
      // For squares (e.g., 5·5), arrange in a grid - max 10 dice
      const totalDice = multiplier * baseValue;
      const dicesToShow = Math.min(totalDice, 10);
      const gridSize = Math.ceil(Math.sqrt(dicesToShow));
      
      return (
        <div className="flex flex-col items-center justify-center gap-1 py-2">
          <div 
            className="grid gap-1 justify-center"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: dicesToShow }).map((_, idx) => (
              <div key={idx} className="scale-75">
                <DiceDisplay number={baseValue} size="md" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // For non-squares, use staggered irregular grid arrangement (max 10 dice)
    const rotations = [0, 15, -12, 8, -15, 20, -8, 12, -20, 10, -10, 18, -18, 5, -5, 22, -22];
    
    // Limit to 10 dice maximum per box
    const dicesToShow = Math.min(multiplier, 10);
    
    // Staggered grid positions for irregular arrangement
    const positions: { row: number; col: number; offset: number }[] = [];
    let diceCount = 0;
    let row = 0;
    let col = 0;
    
    // Generate irregular staggered positions
    while (diceCount < dicesToShow) {
      const isEvenRow = row % 2 === 0;
      const rowOffset = isEvenRow ? 0 : 30; // Offset even rows
      positions.push({ row, col, offset: rowOffset });
      col++;
      
      // New row after 2-3 columns (irregular)
      if ((isEvenRow && col >= 3) || (!isEvenRow && col >= 2)) {
        col = 0;
        row++;
      }
      diceCount++;
    }
    
    // Calculate container size based on content
    const maxRow = Math.max(...positions.map(p => p.row), 0);
    const containerHeight = (maxRow + 1) * 70 + 20;
    const containerWidth = 280;
    
    return (
      <div className="flex justify-center py-2">
        <div className="relative flex items-center justify-center" style={{ width: containerWidth, height: Math.max(containerHeight, 160) }}>
          <div className="absolute" style={{ width: '280px', height: `${containerHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {positions.map((pos, idx) => {
              const rotation = rotations[idx % rotations.length];
              const x = pos.col * 70 + pos.offset;
              const y = pos.row * 70;
              return (
                <div 
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <DiceDisplay number={baseValue} size="md" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderVisualization = (number: number, type: RepresentationType, animal?: AnimalType, expression?: string, multiplier?: number, baseValue?: number) => {
    if (multiplier && baseValue) {
      return <MultiplicationDiceVisualization multiplier={multiplier} baseValue={baseValue} />;
    }

    if (expression) {
      return <DigitVisualization number={number} expression={expression} />;
    }

    switch (type) {
      case 'digit':
        return <DigitVisualization number={number} />;
      case 'dice':
        return <div className="scale-125"><DiceDisplay number={number} size="lg" /></div>;
      case 'animalPattern':
        return <AnimalPatternVisualization number={number} animal={animal || 'lion'} />;
      default:
        return <DigitVisualization number={number} />;
    }
  };

  const handleBackToTeacher = async () => {
    try {
      await fetch('/api/zahlenwaage/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          animalsCollected: stats.animalsCollected || [],
          partiesCount: stats.confettiStreaks || 0,
          totalAttempts: stats.totalAttempts || 0,
          correctAnswers: stats.animalsCollected.length || 0,
        }),
      });
    } catch (error) {
      console.warn('Could not save stats:', error);
    }
    setLocation('/teacher');
  };

  const handleGameEnd = async () => {
    try {
      console.log('🎮 Game ending, sending stats:', {
        animalsCollected: stats.animalsCollected,
        partiesCount: stats.confettiStreaks,
        totalAttempts: stats.totalAttempts
      });

      // Speichere gesammelte Tiere in Zoo
      if (userId && stats.animalsCollected.length > 0) {
        for (const animalType of stats.animalsCollected) {
          await fetch('/api/zoo/animals/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: userId,
              animalType: animalType
            })
          });
        }
      }

      // Send stats to backend
      const response = await fetch('/api/zahlenwaage/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          animalsCollected: stats.animalsCollected,
          partiesCount: stats.confettiStreaks,
          totalAttempts: stats.totalAttempts,
          correctAnswers: stats.animalsCollected.length,
          highScore: stats.animalsCollected.length,
          mode: 'student'
        })
      });

      const result = await response.json();
      console.log('✅ Stats saved successfully:', result);

      if (embedded && onGameComplete) {
        onGameComplete({
          animalsCollected: stats.animalsCollected,
          parties: stats.confettiStreaks
        });
      } else {
        setGameState('ended');
      }
    } catch (error) {
      console.error('❌ Failed to save game stats:', error);
      if (embedded && onGameComplete) {
        onGameComplete({
          animalsCollected: stats.animalsCollected,
          parties: stats.confettiStreaks
        });
      }
    }
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500">
        <AppHeader showBack={true} title="Zahlenwaage" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <Card className="max-w-lg w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-7xl mb-4 animate-bounce">🦁🐘🦒</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Zahlenwaage
            </h1>
            <p className="text-lg text-gray-700 font-semibold">
              Finde die größte Zahl! Sammle Zoo-Tiere! 🦁
            </p>
            <div className="space-y-3 text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-4 border-blue-300">
              <p className="text-sm flex items-center gap-2">
                <span className="text-xl">🐘</span> Sammle verschiedene Tiere!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-xl">🦒</span> Tiere zeigen dir die Anzahlen!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-xl">🎊</span> 5 richtige = Tier-Party!
              </p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-xl">⏱️</span> 60 Sekunden Zeit!
              </p>
            </div>
            <Button
              size="lg"
              onClick={startGame}
              className="w-full text-lg bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 hover:from-blue-600 hover:via-teal-600 hover:to-green-600"
              data-testid="button-start-game"
            >
              Level wählen! 🚀
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/student')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'level-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500">
        <AppHeader showBack={true} title="Zahlenwaage - Level wählen" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <Card className="max-w-4xl w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                Wähle dein Level
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {ZAHLENWAAGE_LEVELS.map((lvl) => (
                <Button
                  key={lvl.level}
                  onClick={() => {
                    setSelectedLevel(lvl.level);
                    startGameWithLevel(lvl.level);
                  }}
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
      </div>
    );
  }


  if (gameState === 'ended') {
    // In embedded mode, don't show end screen - parent handles it
    if (embedded) {
      return null;
    }

    return (
      <div className={cn("min-h-screen", getThemeBackground())}>
        <AppHeader showBack={true} title="Zahlenwaage - Beendet" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <Card className="max-w-lg w-full shadow-2xl border-4 border-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="py-8">
              <div className="text-7xl mb-4 animate-bounce">🦁🐘🦒</div>
              <p className="text-2xl font-bold text-gray-700">Spiel beendet!</p>
              <p className="text-lg text-gray-600 mt-2">Tiere gesammelt: {stats.animalsCollected.length}</p>
            </div>
            <Button
              size="lg"
              onClick={() => setGameState('level-select')}
              className="w-full"
            >
              Noch einmal spielen
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  const themeColors = getThemeColors();

  return (
    <div className={cn("min-h-screen overflow-hidden relative", getThemeBackground())}>
      <AppHeader showBack={true} title="Zahlenwaage" />
      <div className="p-4">
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1); }
          25% { transform: translateX(-8px) scale(0.98); }
          75% { transform: translateX(8px) scale(0.98); }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {confettiParticles.length > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.left}%`,
                animation: `confetti-fall ${2.5 + Math.random()}s ease-out ${particle.delay}s forwards`,
                top: '-30px',
                fontSize: '32px'
              }}
            >
              <AnimalIcon animal={particle.type} size={32} />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6 pt-8 relative z-10">
        <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border-4 border-white">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-gray-800" data-testid="text-timer">
              ⏱️ {timeLeft}s
            </div>
            <div className="flex gap-1" data-testid="text-streak">
              {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
                <span key={i} className="text-2xl animate-pulse">🦁</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent" data-testid="text-score">
              {stats.animalsCollected.length}
            </div>
            <div className="flex gap-1">
              {stats.animalsCollected.slice(-5).map((animal, idx) => (
                <AnimalIcon key={idx} animal={animal} size={24} />
              ))}
            </div>
          </div>
        </div>

        {currentTask && currentTask.numbers && currentTask.types && (
          <div className="flex flex-wrap items-center justify-center gap-6 py-8">
            {currentTask.numbers.map((num, idx) => {
              const animalType = currentTask.animalTypes?.[idx] || 'lion';
              const animalName = ANIMAL_NAMES[animalType] || 'Tier'; // Fallback to generic name
              const animalCount = num; // Assuming num directly corresponds to count for display

              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-3xl border-[5px] p-8 flex items-center justify-center min-w-[225px] min-h-[195px] transition-all duration-500 shadow-2xl",
                    `bg-gradient-to-br ${themeColors[idx % themeColors.length]}`,
                    "border-gray-800",
                    feedback === 'correct' && correctIndex === idx && "scale-110 ring-8 ring-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.8)]",
                    feedback === 'wrong' && "animate-shake"
                  )}
                  data-testid={`box-${idx}`}
                >
                  <div>
                    {renderVisualization(num, currentTask.types[idx], animalType, currentTask.expressions?.[idx], currentTask.multipliers?.[idx], currentTask.baseValues?.[idx])}
                  </div>
                  {/* Animal name display */}
                  <div className="absolute bottom-4 text-2xl font-bold text-center text-white drop-shadow-lg">
                    {(() => {
                      const count = animalCount;
                      const name = animalName;
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
              );
            })}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center shadow-xl border-4 border-white">
          <label className="text-2xl font-bold text-gray-800 block mb-4">
            Welche Zahl ist die grösste? (ENTER drücken)
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={feedback !== null && !awaitingEnter}
            className={cn(
              "w-40 h-24 text-6xl text-center border-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-lg font-bold",
              "transition-all duration-200 bg-white",
              feedback === 'wrong' && "animate-shake border-red-400 bg-red-50",
              feedback === 'correct' && "opacity-50 cursor-not-allowed",
              feedback === 'wrong' && "opacity-100"
            )}
            maxLength={selectedLevel >= 7 ? 3 : 2}
            autoFocus
            data-testid="input-answer"
          />
          {/* Feedback */}
          {feedback === 'correct' && currentTask && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-green-100 border-8 border-green-500 rounded-3xl p-12 max-w-2xl shadow-2xl">
                <div className="text-5xl font-black text-green-700 text-center mb-8">
                  RICHTIG! ✓
                </div>
                <div className="bg-white/80 rounded-2xl p-8 mb-8 flex flex-wrap items-center justify-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {currentTask.expressions?.[currentTask.correctIndex]
                      ? `${currentTask.expressions[currentTask.correctIndex]} = ${currentTask.correctAnswer}`
                      : currentTask.correctAnswer}
                  </div>
                </div>
                <div className="text-center text-xl font-bold text-gray-700 mb-6">
                  ENTER drücken zum Fortfahren
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestone Celebration */}
      {currentMilestone && (
        <MilestoneCelebration
          open={showMilestone}
          onOpenChange={setShowMilestone}
          milestone={{
            title: currentMilestone.name,
            icon: '🏆',
            stageTrigger: currentMilestone.threshold,
            motivationMessage: `Glückwunsch zum Level ${currentMilestone.id}!`
          }}
          stats={{
            successRate: Math.max(0, correctCount / Math.max(completedTasks, 1)),
            averageTime: 0,
            tasksCompleted: completedTasks
          }}
          onContinue={() => {
            setShowMilestone(false);
            // If game is still playing, generate next task after closing milestone
            if (gameState === 'playing') {
              // Ensure currentTask is not null before generating new task
              if (currentTask) {
                setCurrentTask(generateTask());
              }
            } else if (gameState === 'end') {
              // If game has ended, navigate to the end screen after closing milestone
              setGameState('ended');
            }
          }}
        />
      )}

      {/* Animal Unlock Notification */}
      <AnimalUnlockNotification
        open={showAnimalUnlock}
        onOpenChange={setShowAnimalUnlock}
        unlockedAnimals={unlockedAnimals}
        onContinue={() => {
          setShowAnimalUnlock(false);
          setGameState('end');
        }}
      />
      </div>
    </div>
  );
}