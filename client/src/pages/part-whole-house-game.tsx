import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

/**
 * SCHERER: Teil-Ganzes-Verständnis
 * Zahlenhaus-Spiel mit flexiblen Zerlegungen
 */

interface NumberHouse {
  total: number;
  decompositions: [number, number][];
}

export default function PartWholeHouseGame() {
  const [, setLocation] = useLocation();
  const [targetNumber, setTargetNumber] = useState(10);
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [foundDecompositions, setFoundDecompositions] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'duplicate' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const part1Ref = useRef<HTMLInputElement>(null);
  const part2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    part1Ref.current?.focus();
  }, []);

  const allDecompositions = Array.from({ length: targetNumber + 1 }, (_, i) => [i, targetNumber - i])
    .filter(([a, b]) => a <= b); // Nur eine Reihenfolge

  const handleSubmit = () => {
    const p1 = parseInt(part1);
    const p2 = parseInt(part2);

    if (isNaN(p1) || isNaN(p2)) return;

    // Normalisiere: kleinere Zahl zuerst
    const normalized = [Math.min(p1, p2), Math.max(p1, p2)].join(',');

    if (p1 + p2 !== targetNumber) {
      setFeedback('incorrect');
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    if (foundDecompositions.has(normalized)) {
      setFeedback('duplicate');
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    setFoundDecompositions(new Set([...foundDecompositions, normalized]));
    setFeedback('correct');
    setScore(score + 1);
    setPart1("");
    setPart2("");

    // Check if all found
    if (foundDecompositions.size + 1 >= allDecompositions.length) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        // Level up
        if (targetNumber < 20) {
          setTargetNumber(targetNumber + 5);
          setFoundDecompositions(new Set());
          setScore(0);
        }
        part1Ref.current?.focus();
      }, 3000);
    } else {
      setTimeout(() => {
        setFeedback(null);
        part1Ref.current?.focus();
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 p-4">
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-9xl animate-bounce">🎉🏆🎉</div>
            <div className="text-4xl font-bold text-orange-700 drop-shadow-lg">
              Gratulation! Du hast alle {allDecompositions.length} Zerlegungen der {targetNumber} gefunden!
            </div>
            {targetNumber < 20 && (
              <div className="text-2xl text-orange-600 drop-shadow-lg">
                Bereit für Level {targetNumber + 5}? 🚀
              </div>
            )}
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation('/games')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/student')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        <Card className="shadow-2xl border-4 border-white">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-lg">
            <CardTitle className="text-3xl">🏠 Zahlenhaus-Baumeister</CardTitle>
            <p className="text-sm opacity-90 mt-2">Nach Scherer: Entdecke alle Zerlegungen!</p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Dachzahl */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-br from-orange-200 to-red-200 rounded-xl p-8 border-4 border-orange-500 shadow-lg">
                <div className="text-7xl font-bold text-orange-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{targetNumber}</div>
                <p className="text-sm text-orange-700 mt-2 font-semibold">Dachzahl</p>
              </div>
            </div>

            {/* Input Bereich */}
            <div className="bg-white/80 rounded-xl p-8 border-4 border-orange-300">
              <h3 className="font-bold mb-6 text-lg">Finde eine Zerlegung:</h3>
              <div className="flex items-center gap-6 justify-center mb-6">
                <input
                  ref={part1Ref}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part1}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 2) setPart1(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && part1) {
                      e.preventDefault();
                      part2Ref.current?.focus();
                    }
                  }}
                  placeholder="?"
                  className="w-28 h-28 text-center text-7xl font-bold border-4 border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300 bg-white"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  autoFocus
                />
                <span className="text-7xl font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>+</span>
                <input
                  ref={part2Ref}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part2}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 2) setPart2(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && part1 && part2) {
                      handleSubmit();
                    }
                  }}
                  placeholder="?"
                  className="w-28 h-28 text-center text-7xl font-bold border-4 border-orange-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300 bg-white"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                <span className="text-7xl font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>=</span>
                <span className="text-7xl font-bold text-orange-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{targetNumber}</span>
              </div>
              <Button onClick={handleSubmit} className="w-full mt-6 text-lg h-auto py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                ✓ Prüfen
              </Button>

              {feedback === 'correct' && (
                <div className="flex items-center gap-2 text-green-600 mt-6 text-lg font-bold">
                  <CheckCircle className="w-8 h-8" />
                  Richtig! Eine neue Zerlegung gefunden! 🎉
                </div>
              )}
              {feedback === 'duplicate' && (
                <div className="flex items-center gap-2 text-yellow-600 mt-6 text-lg font-bold">
                  Diese Zerlegung hast du schon! 🔄
                </div>
              )}
              {feedback === 'incorrect' && (
                <div className="flex items-center gap-2 text-red-600 mt-6 text-lg font-bold">
                  <XCircle className="w-8 h-8" />
                  Das ergibt nicht {targetNumber}! 🤔
                </div>
              )}
            </div>

          {/* Gefundene Zerlegungen */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
              <h3 className="font-bold mb-4 text-lg">
                ✓ Gefundene Zerlegungen ({foundDecompositions.size}/{allDecompositions.length}):
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {Array.from(foundDecompositions).map((decomp, idx) => {
                  const [a, b] = decomp.split(',');
                  return (
                    <div key={idx} className="bg-green-200 rounded-lg p-3 text-center border-2 border-green-500 font-bold text-lg">
                      {a} + {b}
                    </div>
                  );
                })}
              </div>
              {foundDecompositions.size === 0 && (
                <p className="text-center text-muted-foreground mt-4">Finde die erste Zerlegung! 🎯</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-400">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
                style={{ width: `${(foundDecompositions.size / allDecompositions.length) * 100}%` }}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground bg-blue-50 rounded-lg p-3 border border-blue-200">
              💡 Tipp: Es gibt insgesamt <span className="font-bold text-blue-700">{allDecompositions.length}</span> verschiedene Zerlegungen!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}