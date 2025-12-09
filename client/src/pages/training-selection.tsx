import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNavigation } from "@/components/ui/app-navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingModule {
  id: string;
  name: string;
  emoji: string;
  description: string;
  path: string;
  color: string;
  levels: number;
}

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'plus-minus',
    name: 'Plus Minus',
    emoji: '➕➖',
    description: 'Addieren und Subtrahieren meistern',
    path: '/student?mode=adaptive',
    color: 'from-yellow-400 to-amber-500',
    levels: 100
  },
  {
    id: 'mal-durch',
    name: 'Mal Durch',
    emoji: '·:',
    description: 'Multiplikation und Division lernen',
    path: '/one-times-one',
    color: 'from-yellow-400 to-amber-500',
    levels: 100
  }
];

export default function TrainingSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
      <AppNavigation />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">📚</span>
            Training
          </h1>
          <p className="text-muted-foreground text-lg">
            Wähle dein Trainingsmodul und meistere neue Fähigkeiten!
          </p>
        </div>

        {/* Training Modules - Side by Side Large Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 h-96">
          {TRAINING_MODULES.map((module) => (
            <Button
              key={module.id}
              onClick={() => setLocation(module.path)}
              className={cn(
                "w-full h-full flex flex-col items-center justify-center gap-6 rounded-3xl border-4 border-white shadow-2xl text-black font-bold hover-elevate active-elevate-2 bg-gradient-to-br",
                module.color
              )}
            >
              {module.id === 'mal-durch' ? (
                <div className="text-9xl font-bold flex gap-6 text-black">
                  <span>·</span>
                  <span>:</span>
                </div>
              ) : (
                <span className="text-9xl">{module.emoji}</span>
              )}
              <div className="text-center space-y-3">
                <h2 className="text-5xl font-black drop-shadow-lg text-black">{module.name}</h2>
                <p className="text-2xl opacity-95 drop-shadow-lg text-black">{module.description}</p>
                <p className="text-xl opacity-90 drop-shadow-lg text-black">{module.levels} Levels</p>
              </div>
            </Button>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/games')}
            className="gap-2 text-lg px-6 py-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Spielauswahl
          </Button>
        </div>
      </div>
    </div>
  );
}
