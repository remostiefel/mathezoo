
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Home, LogOut, Lightbulb, Target, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type CoreTaskType = 'doubling' | 'to_ten' | 'analogy' | 'multi_path';

interface CoreTask {
  type: CoreTaskType;
  coreTask: { n1: number; n2: number; result: number };
  derivedTask: { n1: number; n2: number; result: number };
  hint: string;
  paths: Array<{ description: string; steps: string[] }>;
}

export default function CoreTasksLab() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'intro' | 'learning' | 'practice' | 'mastery'>('intro');
  const [currentTask, setCurrentTask] = useState<CoreTask | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [masteredCores, setMasteredCores] = useState<Set<string>>(new Set());

  const CORE_TASKS_LIBRARY: CoreTask[] = [
    // VERDOPPLUNGEN
    {
      type: 'doubling',
      coreTask: { n1: 5, n2: 5, result: 10 },
      derivedTask: { n1: 5, n2: 6, result: 11 },
      hint: '5+5 kennst du! Was ist 5+6?',
      paths: [
        { description: 'Verdopplungs-Trick', steps: ['5+5 = 10 (KERNAUFGABE!)', '10 + 1 = 11'] },
        { description: 'Zur 10', steps: ['5+5 = 10', 'Noch 1 dazu = 11'] }
      ]
    },
    {
      type: 'doubling',
      coreTask: { n1: 6, n2: 6, result: 12 },
      derivedTask: { n1: 6, n2: 7, result: 13 },
      hint: '6+6=12. Wie viel ist 6+7?',
      paths: [
        { description: 'Von 6+6 ableiten', steps: ['6+6 = 12 (KERNAUFGABE!)', '12 + 1 = 13'] },
        { description: 'Von 7+7 ableiten', steps: ['7+7 = 14 (KERNAUFGABE!)', '14 - 1 = 13'] }
      ]
    },
    // PARTNERZAHLEN ZUR 10
    {
      type: 'to_ten',
      coreTask: { n1: 5, n2: 5, result: 10 },
      derivedTask: { n1: 6, n2: 5, result: 11 },
      hint: '5+5=10. Was ist 6+5?',
      paths: [
        { description: 'Von 5+5 ableiten', steps: ['5+5 = 10 (KERNAUFGABE!)', '10 + 1 = 11'] },
        { description: 'Zerlegen', steps: ['6 = 5+1', '5+5 = 10', '10 + 1 = 11'] }
      ]
    },
    // ANALOGIE (Stellenwert)
    {
      type: 'analogy',
      coreTask: { n1: 3, n2: 4, result: 7 },
      derivedTask: { n1: 13, n2: 4, result: 17 },
      hint: '3+4=7. Was ist dann 13+4?',
      paths: [
        { description: 'Analogie-Trick (Wittmann)', steps: ['3+4 = 7 (KERNAUFGABE!)', '13 = 10+3', '10+3+4 = 10+7 = 17'] },
        { description: 'Einer bleiben gleich', steps: ['Einer: 3+4 = 7', 'Zehner: 1', 'Zusammen: 17'] }
      ]
    }
  ];

  useEffect(() => {
    if (gameState === 'practice' || gameState === 'learning') {
      generateNewTask();
    }
  }, [gameState]);

  const generateNewTask = () => {
    const task = CORE_TASKS_LIBRARY[Math.floor(Math.random() * CORE_TASKS_LIBRARY.length)];
    setCurrentTask(task);
    setUserAnswer('');
    setSelectedPath(null);
  };

  const handleAnswer = () => {
    if (!currentTask || !userAnswer) return;

    const isCorrect = parseInt(userAnswer) === currentTask.derivedTask.result;
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      
      // Merke gemeisterte Kernaufgaben
      const coreKey = `${currentTask.coreTask.n1}+${currentTask.coreTask.n2}`;
      setMasteredCores(prev => new Set([...prev, coreKey]));
      
      // Nach 5 korrekten: Mastery-Modus
      if (score.correct + 1 >= 5) {
        setGameState('mastery');
      } else {
        setTimeout(() => generateNewTask(), 1500);
      }
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      setTimeout(() => setUserAnswer(''), 1000);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-4 border-purple-400">
            <CardHeader>
              <CardTitle className="text-4xl text-center">
                <Lightbulb className="inline-block w-12 h-12 text-yellow-500 mr-3" />
                Kernaufgaben-Labor
              </CardTitle>
              <CardDescription className="text-lg text-center mt-4">
                Lerne die WICHTIGSTEN Aufgaben - und leite ALLE anderen davon ab!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-900 mb-3">
                  🌟 Was sind Kernaufgaben? (nach Wittmann)
                </h3>
                <p className="text-yellow-800 mb-3">
                  Kernaufgaben sind die <strong>20 wichtigsten Rechenaufgaben</strong>, die du auswendig kennen solltest:
                </p>
                <ul className="list-disc list-inside space-y-2 text-yellow-800">
                  <li><strong>Verdopplungen:</strong> 1+1, 2+2, 3+3, ..., 10+10</li>
                  <li><strong>Partnerzahlen zur 10:</strong> 1+9, 2+8, 3+7, 4+6, 5+5</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  🔄 Was ist Herleiten? (nach Gaidoschik)
                </h3>
                <p className="text-blue-800 mb-3">
                  Du musst NICHT alle 100 Aufgaben auswendig lernen! 
                  <strong> Von den 20 Kernaufgaben kannst du ALLE anderen ableiten!</strong>
                </p>
                <div className="bg-white rounded p-4 mt-3">
                  <p className="font-mono text-lg">
                    Beispiel: <strong>6+7 = ?</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Weg 1: 6+6=12 (KERNAUFGABE!), dann +1 = <strong>13</strong> ✓<br/>
                    Weg 2: 7+7=14 (KERNAUFGABE!), dann -1 = <strong>13</strong> ✓
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-900 mb-3">
                  🎯 Deine Mission
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-green-800">
                  <li>Lerne die Kernaufgaben auswendig</li>
                  <li>Leite andere Aufgaben davon ab</li>
                  <li>Finde DEINEN Lieblings-Weg!</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setGameState('learning')}
                  size="lg"
                  className="flex-1 text-xl py-6 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  Los geht's! 🚀
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/games')}
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'learning' && currentTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Lern-Modus: Herleiten üben</h2>
              <p className="text-gray-600">Score: {score.correct}/{score.total}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/games')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Beenden
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Linke Spalte: Kernaufgabe */}
            <Card className="border-4 border-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-yellow-600" />
                  Kernaufgabe (auswendig!)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-yellow-700 mb-4">
                    {currentTask.coreTask.n1} + {currentTask.coreTask.n2}
                  </div>
                  <div className="text-8xl font-bold text-yellow-600">
                    = {currentTask.coreTask.result}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Diese Aufgabe MUSST du auswendig kennen!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rechte Spalte: Abgeleitete Aufgabe */}
            <Card className="border-4 border-blue-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Jetzt herleiten!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-blue-700">
                    {currentTask.derivedTask.n1} + {currentTask.derivedTask.n2} = ?
                  </div>
                  <p className="text-sm text-blue-600 mt-3">
                    💡 {currentTask.hint}
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
                    className="w-full text-center text-4xl font-bold border-4 rounded-lg p-4"
                    placeholder="?"
                    autoFocus
                  />
                  <Button
                    onClick={handleAnswer}
                    disabled={!userAnswer}
                    className="w-full"
                    size="lg"
                  >
                    Prüfen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Herleite-Wege */}
          <Card className="border-4 border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-green-600" />
                Herleite-Wege (wähle deinen Favoriten!)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {currentTask.paths.map((path, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPath(idx)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      selectedPath === idx 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-300 hover:border-green-300"
                    )}
                  >
                    <h4 className="font-bold text-green-700 mb-2">
                      Weg {idx + 1}: {path.description}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {path.steps.map((step, sIdx) => (
                        <li key={sIdx} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Es gibt VIELE Wege! Welcher ist für DICH am leichtesten?
              </p>
            </CardContent>
          </Card>

          {/* Gemeisterte Kernaufgaben */}
          {masteredCores.size > 0 && (
            <Card className="border-2 border-purple-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Gemeisterte Kernaufgaben: {masteredCores.size}/20
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(masteredCores).map(core => (
                    <span key={core} className="px-3 py-1 bg-purple-100 rounded-full text-sm font-semibold">
                      {core} ✓
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
