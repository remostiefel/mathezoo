
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAnimalTeam } from "@/hooks/useAnimalTeam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, CheckCircle, XCircle, Home, Heart, Square, Star, Circle, Triangle, Diamond, Hexagon, Plus, Moon, Cloud } from "lucide-react";
import { useLocation } from "wouter";

/**
 * SCHERER: Quasi-simultanes Mengenerfassen
 * Blitzblick-Spiel mit strukturierten Mengen
 */

interface FlashCard {
  quantity: number;
  structure: '5er' | '10er' | 'Würfel';
  displayTime: number; // ms
  colors?: string[];
  shapes?: string[]; // Ein Shape pro Objekt (unterschiedliche Formen!)
  layout?: 'structured' | 'scattered' | 'scattered-corners' | 'scattered-diagonal' | 'scattered-full';
  backgroundColor?: string;
  baseSize?: number;
  sizes?: number[];
}

type ShapeType = 'circle' | 'square' | 'heart' | 'star' | 'circle-outline' | 'triangle' | 'diamond' | 'hexagon' | 'plus' | 'moon' | 'cloud';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#F43F5E'];
const SHAPES: ShapeType[] = ['circle', 'square', 'heart', 'star', 'circle-outline', 'triangle', 'diamond', 'hexagon', 'plus', 'moon', 'cloud'];
const LAYOUTS: Array<'structured' | 'scattered' | 'scattered-corners' | 'scattered-diagonal' | 'scattered-full'> = ['structured', 'scattered', 'scattered-corners', 'scattered-diagonal', 'scattered-full'];
const BACKGROUNDS = [
  'from-yellow-50 to-orange-50',
  'from-blue-50 to-cyan-50',
  'from-green-50 to-emerald-50',
  'from-pink-50 to-rose-50',
  'from-indigo-50 to-blue-50',
  'from-purple-50 to-pink-50',
  'from-lime-50 to-green-50',
  'from-sky-50 to-blue-50',
];

export default function StructuredPerceptionGame() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { addXPToTeam } = useAnimalTeam();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastQuantity, setLastQuantity] = useState<number | null>(null);

  const levels = [
    { name: 'Anfänger', displayTime: 800, maxQuantity: 5 },
    { name: 'Fortgeschritten', displayTime: 500, maxQuantity: 10 },
    { name: 'Experte', displayTime: 350, maxQuantity: 20 },
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(1.0); // 1.0 = normal, >1.0 = einfacher, <1.0 = schwieriger
  const [displayTimeDifficulty, setDisplayTimeDifficulty] = useState(1.0); // Separate adaptive Anzeigzeit: >1.0 = länger, <1.0 = kürzer

  const generateCard = (): FlashCard => {
    const level = levels[currentLevel];
    const structures: FlashCard['structure'][] = ['5er', '10er', 'Würfel'];
    const structure = structures[Math.floor(Math.random() * structures.length)];
    
    // Adaptive Schwierigkeit: displayTime erhöhen (einfacher), maxQuantity reduzieren (einfacher)
    // Zusätzliche Variation der Anzeigezeit (min 100ms bei Experte, min 240ms bei Anfänger)
    const adaptiveDisplayTime = Math.round(level.displayTime * adaptiveDifficulty * displayTimeDifficulty);
    const adaptiveMaxQuantity = Math.max(1, Math.floor(level.maxQuantity / adaptiveDifficulty));
    
    let quantity = Math.floor(Math.random() * adaptiveMaxQuantity) + 1;
    // Ensure the quantity is different from the last one
    while (quantity === lastQuantity && adaptiveMaxQuantity > 1) {
      quantity = Math.floor(Math.random() * adaptiveMaxQuantity) + 1;
    }

    // Generate random colors for this card (different for each object)
    const colors = Array.from({ length: quantity }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    // Ein Shape pro Objekt - unterschiedliche Formen für noch größere Schwierigkeit!
    const shapes = Array.from({ length: quantity }, () => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    const layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    const backgroundColor = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    
    // Variable Größen für jede Aufgabe: Basegröße (28-42px) + individuelle Variation pro Objekt
    const baseSize = 28 + Math.floor(Math.random() * 15); // 28-42px
    const sizes = Array.from({ length: quantity }, () => {
      const variation = 0.8 + Math.random() * 2.2; // 0.8x bis 3.0x der Basegröße (max 300%)
      return Math.round(baseSize * variation);
    });

    return {
      quantity,
      structure,
      displayTime: adaptiveDisplayTime,
      colors,
      shapes,
      layout,
      backgroundColor,
      baseSize,
      sizes
    };
  };

  const startNewRound = () => {
    setFeedback(null);
    setUserAnswer(null);
    const card = generateCard();
    setCurrentCard(card);
    setLastQuantity(card.quantity);
    setShowCard(true);

    setTimeout(() => {
      setShowCard(false);
    }, card.displayTime);
  };

  const handleAnswer = (answer: number) => {
    if (!currentCard) return;
    
    setUserAnswer(answer);
    const isCorrect = answer === currentCard.quantity;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(score + 1);
      // Bei richtig: Schwierigkeit reduzieren (schwieriger machen) - max. 0.6x
      setAdaptiveDifficulty(prev => Math.max(0.6, prev * 0.85));
      // Bei richtig: Anzeigezeit verkürzen (noch schwieriger - min. 0.35 = ca. 100-240ms) 
      setDisplayTimeDifficulty(prev => Math.max(0.35, prev * 0.8));
    } else {
      // Bei Fehler: Schwierigkeit erhöhen (einfacher machen) - max. 2.5x
      setAdaptiveDifficulty(prev => Math.min(2.5, prev * 1.3));
      // Bei Fehler: Anzeigezeit verlängern (einfacher - max. 1.8x = länger)
      setDisplayTimeDifficulty(prev => Math.min(1.8, prev * 1.25));
    }

    setTimeout(() => {
      setRound(round + 1);
      if (round >= 9) {
        // Level up after 10 rounds
        if (currentLevel < levels.length - 1 && score >= 7) {
          setCurrentLevel(currentLevel + 1);
          setAdaptiveDifficulty(1.0); // Zurücksetzen beim Level-Up
          setDisplayTimeDifficulty(1.0); // Auch Anzeigezeit zurücksetzen
        }
        setRound(0);
        setScore(0);
      }
      startNewRound();
    }, 1500);
  };

  const renderShape = (shape: ShapeType | undefined, color: string, idx: number, size: number = 28) => {
    const baseProps = { width: size, height: size, color };
    
    switch (shape) {
      case 'heart':
        return <Heart key={idx} {...baseProps} fill={color} />;
      case 'square':
        return <Square key={idx} {...baseProps} fill={color} />;
      case 'star':
        return <Star key={idx} {...baseProps} fill={color} />;
      case 'triangle':
        return <Triangle key={idx} {...baseProps} fill={color} />;
      case 'diamond':
        return <Diamond key={idx} {...baseProps} fill={color} />;
      case 'hexagon':
        return <Hexagon key={idx} {...baseProps} fill={color} />;
      case 'plus':
        return <Plus key={idx} {...baseProps} />;
      case 'moon':
        return <Moon key={idx} {...baseProps} fill={color} />;
      case 'cloud':
        return <Cloud key={idx} {...baseProps} fill={color} />;
      case 'circle-outline':
        return <Circle key={idx} {...baseProps} />;
      default: // circle
        return <Circle key={idx} {...baseProps} fill={color} />;
    }
  };

  const renderStructuredDots = () => {
    if (!currentCard || !showCard) return null;

    const { quantity, colors = [], shapes = [], layout = 'structured', sizes = [] } = currentCard;

    if (layout === 'scattered' || layout === 'scattered-corners' || layout === 'scattered-diagonal' || layout === 'scattered-full') {
      // Verschiedene verstreute Anordnungen mit 5er-Bündelung
      const groups = [];
      for (let g = 0; g < Math.ceil(quantity / 5); g++) {
        const start = g * 5;
        const end = Math.min(start + 5, quantity);
        const groupSize = end - start;
        
        let groupLeft, groupTop;
        
        if (layout === 'scattered-corners') {
          // An den Ecken und Kanten: oben-links, oben-rechts, unten-links, unten-rechts
          const corners = [[5, 5], [75, 5], [5, 75], [75, 75], [50, 50], [10, 50], [80, 20], [30, 85]];
          const corner = corners[g % corners.length];
          groupLeft = corner[0] + (Math.random() * 15 - 7);
          groupTop = corner[1] + (Math.random() * 15 - 7);
        } else if (layout === 'scattered-diagonal') {
          // Diagonal von oben-links nach unten-rechts verteilt
          const diagonalPos = g / Math.ceil(quantity / 5);
          groupLeft = 10 + diagonalPos * 70 + (Math.random() * 20 - 10);
          groupTop = 10 + diagonalPos * 70 + (Math.random() * 20 - 10);
        } else if (layout === 'scattered-full') {
          // Vollständig zufällig über den gesamten Bereich
          groupLeft = Math.random() * 80 + 5;
          groupTop = Math.random() * 80 + 5;
        } else {
          // Standard 'scattered'
          groupLeft = Math.random() * 60 + 10; // 10% - 70%
          groupTop = Math.random() * 60 + 10; // 10% - 70%
        }
        
        groups.push(
          <div
            key={`group-${g}`}
            className="absolute"
            style={{
              left: `${groupLeft}%`,
              top: `${groupTop}%`,
              display: 'flex',
              flexWrap: 'wrap',
              width: '180px',
              gap: '12px',
              justifyContent: 'center'
            }}
          >
            {Array.from({ length: groupSize }).map((_, i) => (
              <div key={`${g}-${i}`} className="flex items-center justify-center">
                {renderShape(shapes[start + i] as ShapeType, colors[start + i] || COLORS[0], start + i, sizes[start + i] || 28)}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="relative w-full h-80">
          {groups}
        </div>
      );
    }

    // Structured: 5er-Bündelung mit variablen Positionen
    const cols = 5;
    const rows = Math.ceil(quantity / 5);
    
    // Variiere die horizontale und vertikale Ausrichtung
    const justifications = ['start', 'center', 'end'];
    const justify = justifications[Math.floor(Math.random() * justifications.length)];
    const alignments = ['start', 'center', 'end'];
    const align = alignments[Math.floor(Math.random() * alignments.length)];

    return (
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 4.5rem)`,
          gridTemplateRows: `repeat(${rows}, 4.5rem)`,
          gap: '8px',
          justifyItems: justify,
          alignItems: align
        }}
      >
        {Array.from({ length: quantity }).map((_, i) => (
          <div 
            key={i} 
            className="flex items-center justify-center"
            style={{
              gridColumn: (i % cols) + 1,
              gridRow: Math.floor(i / cols) + 1
            }}
          >
            {renderShape(shapes[i] as ShapeType, colors[i] || COLORS[0], i, sizes[i] || 28)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-6 font-sans">
      <Card className="max-w-3xl mx-auto shadow-2xl border-4 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-3xl font-bold">
              <Eye className="w-10 h-10" />
              Blitzblick-Meister
              <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/student')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/50"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-white/90 mt-2">
            Nach Scherer: Quasi-simultanes Mengenerfassen
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {!gameStarted ? (
            <div className="text-center space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <h2 className="text-2xl font-bold text-purple-700">So funktioniert's:</h2>
              <p className="text-lg text-gray-700">Du siehst für kurze Zeit eine Menge. Zähle NICHT einzeln, sondern erkenne die Struktur!</p>
              <ul className="text-left space-y-3 max-w-md mx-auto">
                <li className="flex items-center gap-3 text-lg">
                  <span className="text-3xl">✨</span>
                  <span><strong>5er-Struktur:</strong> Wie im Zwanzigerfeld</span>
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <span className="text-3xl">🎲</span>
                  <span><strong>Würfel-Muster:</strong> Wie auf einem Spielwürfel</span>
                </li>
              </ul>
              <Button 
                onClick={() => { setGameStarted(true); startNewRound(); }} 
                size="lg"
                className="text-xl px-8 py-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
              >
                Los geht's! 🚀
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl">
                <div className="text-base font-bold text-purple-700">
                  <span className="text-gray-600">Level:</span> {levels[currentLevel].name}
                </div>
                <div className="text-base font-bold text-blue-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-gray-600">Runde:</span> {round + 1}/10
                </div>
                <div className="text-base font-bold" style={{ 
                  color: adaptiveDifficulty > 1.2 ? '#22C55E' : adaptiveDifficulty < 0.8 ? '#EF4444' : '#8B5CF6',
                  fontFamily: 'JetBrains Mono, monospace' 
                }}>
                  <span className="text-gray-600">Punkte:</span> {score}
                </div>
                <div className="text-sm font-semibold" style={{ 
                  color: adaptiveDifficulty > 1.2 ? '#22C55E' : adaptiveDifficulty < 0.8 ? '#EF4444' : '#8B5CF6'
                }}>
                  {adaptiveDifficulty > 1.2 ? '📉 Einfacher' : adaptiveDifficulty < 0.8 ? '📈 Schwerer' : '⚖️ Normal'}
                </div>
              </div>

              <div className={`min-h-[350px] flex items-center justify-center bg-gradient-to-br ${currentCard?.backgroundColor || 'from-yellow-50 to-orange-50'} rounded-2xl border-4 border-dashed border-orange-300 shadow-inner`}>
                {showCard ? (
                  <div className="animate-pulse">
                    {renderStructuredDots()}
                  </div>
                ) : userAnswer === null ? (
                  <p className="text-gray-500 text-2xl font-bold">Wie viele waren es?</p>
                ) : (
                  <div className="text-center">
                    {feedback === 'correct' ? (
                      <div className="text-green-600 space-y-4">
                        <CheckCircle className="w-20 h-20 mx-auto animate-bounce" />
                        <p className="text-3xl font-bold">Super! Das war richtig! 🎉</p>
                      </div>
                    ) : (
                      <div className="text-red-600 space-y-4">
                        <XCircle className="w-20 h-20 mx-auto" />
                        <p className="text-3xl font-bold">Es waren {currentCard?.quantity}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!showCard && userAnswer === null && (
                <div className="space-y-6">
                  <input
                    type="number"
                    value={userAnswer ?? ""}
                    onChange={(e) => {
                      setUserAnswer(e.target.value ? parseInt(e.target.value) : null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userAnswer !== null && !isNaN(userAnswer)) {
                        handleAnswer(userAnswer);
                      }
                    }}
                    className="w-56 h-28 mx-auto block text-center text-7xl font-bold border-4 border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 bg-white shadow-xl"
                    placeholder=""
                    autoFocus
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    min={1}
                    max={levels[currentLevel].maxQuantity}
                  />
                  <p className="text-center text-gray-500 text-lg">Gib deine Antwort ein und drücke ENTER! 🔑</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
