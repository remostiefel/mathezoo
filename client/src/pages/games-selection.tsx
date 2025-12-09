import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNavigation } from "@/components/ui/app-navigation";
import { Gamepad2, Star, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skills: string[];
  path: string;
  color: string;
  category: 'numbers' | 'strategies' | 'mastery';
  levelCount: number;
}

const GAMES: Game[] = [
  // Kategorie 1: Zahlen verstehen
  {
    id: 'zahlenwaage',
    name: 'Zahlenwaage',
    emoji: '⚖️',
    description: 'Finde die größte Zahl! Mit Würfeln, Tieren und Zahlen.',
    skills: ['Zahlenvergleich', 'Zahlendarstellungen'],
    path: '/game',
    color: 'from-blue-400 to-cyan-500',
    category: 'numbers',
    levelCount: 8
  },
  {
    id: 'number-stairs',
    name: 'Zahlen-Treppe',
    emoji: '🪜',
    description: 'Ordne Zahlen von klein nach groß - wie Treppenstufen!',
    skills: ['Zahlenvergleich', 'Größenverständnis'],
    path: '/number-stairs',
    color: 'from-indigo-400 to-purple-500',
    category: 'numbers',
    levelCount: 8
  },
  {
    id: 'number-builder',
    name: 'Zahlen-Baumeister',
    emoji: '🏗️',
    description: 'Baue Zahlen mit Hundertern, Zehnern und Einern!',
    skills: ['Stellenwerte', 'Zahlaufbau'],
    path: '/number-builder',
    color: 'from-lime-400 to-green-500',
    category: 'numbers',
    levelCount: 8
  },
  {
    id: 'neighbors',
    name: 'Zoo-Nachbarn',
    emoji: '🐘',
    description: 'Finde Vorgänger und Nachfolger - Tiere leben nebeneinander!',
    skills: ['Nachbarzahlen', 'Stellenwerte', 'Zahlenstrahl'],
    path: '/neighbor-game',
    color: 'from-green-400 to-teal-500',
    category: 'numbers',
    levelCount: 8
  },

  // Kategorie 2: Clever rechnen
  {
    id: 'ten-wins',
    name: '10 gewinnt!',
    emoji: '🎯',
    description: 'Ergänze zur 10 und rette Zoo-Tiere!',
    skills: ['Zehnerergänzung', 'Partnerzahlen'],
    path: '/ten-wins-game',
    color: 'from-green-400 to-emerald-500',
    category: 'strategies',
    levelCount: 8
  },
  {
    id: 'decomposition',
    name: 'Zerlegungs-Safari',
    emoji: '🧩',
    description: 'Teile Zahlen clever auf - finde alle Möglichkeiten!',
    skills: ['Zahlzerlegung', 'Zahlbeziehungen'],
    path: '/decomposition-safari',
    color: 'from-teal-400 to-cyan-500',
    category: 'strategies',
    levelCount: 8
  },
  {
    id: 'doubling',
    name: 'Verdoppel-Expedition',
    emoji: '👯',
    description: 'Entdecke Doppel-Tricks und Fast-Verdopplungen!',
    skills: ['Verdoppeln', 'Halbieren'],
    path: '/doubling-expedition',
    color: 'from-fuchsia-400 to-pink-500',
    category: 'strategies',
    levelCount: 8
  },

  // Kategorie 3: Rechenmeister
  {
    id: 'zoo-adventure',
    name: 'Zoo-Abenteuer',
    emoji: '🦁',
    description: 'Besuche verschiedene Gehege und meistere Rechenaufgaben!',
    skills: ['Addition ZR20', 'Subtraktion ZR20'],
    path: '/zoo-adventure',
    color: 'from-amber-400 to-orange-500',
    category: 'mastery',
    levelCount: 8
  },
  {
    id: 'pathfinder',
    name: 'Zoo-Pfadfinder',
    emoji: '🗺️',
    description: 'Finde den elegantesten Rechenweg durch den Zoo!',
    skills: ['Rechenstrategien', 'Flexibles Rechnen'],
    path: '/zoo-pathfinder',
    color: 'from-rose-400 to-red-500',
    category: 'mastery',
    levelCount: 8
  },
  {
    id: "structured-perception",
    name: "Blitzblick-Meister",
    emoji: "👁️",
    description: "Lerne strukturiertes Sehen: Erkenne Mengen ohne zu zählen!",
    skills: ['Strukturiertes Sehen', 'Quasi-simultanes Erfassen'],
    path: "/structured-perception",
    color: "from-blue-500 to-purple-500",
    category: 'numbers',
    levelCount: 8
  },
  {
    id: "part-whole-house",
    name: "Zahlenhaus-Baumeister",
    emoji: "🏠",
    description: "Entdecke alle Zerlegungen einer Zahl - flexible Teil-Ganzes-Beziehungen!",
    skills: ['Teil-Ganzes-Beziehungen', 'Zahlzerlegung'],
    path: "/part-whole-house",
    color: "from-yellow-500 to-orange-500",
    category: 'strategies',
    levelCount: 8
  },
];

const CATEGORIES = [
  {
    id: 'training' as const,
    name: 'Training',
    emoji: '📚',
    description: 'Trainiere systematisch neue Fähigkeiten',
    color: 'from-indigo-400 to-purple-500',
    isSpecial: true
  },
  {
    id: 'numbers' as const,
    name: 'Zahlen verstehen',
    emoji: '🔢',
    description: 'Lerne Zahlen kennen und vergleichen',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'strategies' as const,
    name: 'Clever rechnen',
    emoji: '➕',
    description: 'Entdecke smarte Rechentricks',
    color: 'from-green-400 to-teal-500'
  },
  {
    id: 'mastery' as const,
    name: 'Rechenmeister',
    emoji: '🎯',
    description: 'Wende dein Wissen spielerisch an',
    color: 'from-amber-400 to-orange-500'
  }
];

export default function GamesSelection() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredGames = selectedCategory && selectedCategory !== 'training'
    ? GAMES.filter(game => game.category === selectedCategory)
    : GAMES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <AppNavigation />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Gamepad2 className="w-10 h-10 text-primary" />
            Spiele-Auswahl
          </h1>
          <p className="text-muted-foreground text-lg">
            Wähle eine Kategorie oder ein Spiel - jedes hat 8 Level!
          </p>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CATEGORIES.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105 border-2 hover-elevate active-elevate-2",
                selectedCategory === category.id
                  ? "border-primary shadow-xl"
                  : "border-transparent hover:border-primary/50"
              )}
              onClick={() => {
                if ((category as any).isSpecial) {
                  setLocation('/training');
                } else {
                  setSelectedCategory(selectedCategory === category.id ? null : category.id);
                }
              }}
            >
              <CardHeader className={cn("bg-gradient-to-br", category.color)}>
                <div className="text-center">
                  <span className="text-6xl mb-2 block">{category.emoji}</span>
                  <CardTitle className="text-white drop-shadow-lg text-2xl">
                    {category.name}
                  </CardTitle>
                  <p className="text-white/90 text-sm mt-2">{category.description}</p>
                  <Badge className="mt-3 bg-white/90 text-gray-800">
                    {(category as any).isSpecial ? '2 Module' : GAMES.filter(g => g.category === category.id).length + ' Spiele'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Games Grid */}
        <div>
          {selectedCategory && (
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">
                {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}
              </span>
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 hover:border-primary"
                onClick={() => setLocation(game.path)}
              >
                <CardHeader className={cn("bg-gradient-to-br", game.color)}>
                  <div className="text-center">
                    <span className="text-7xl mb-2 block">{game.emoji}</span>
                    <CardTitle className="text-white drop-shadow-lg text-xl">
                      {game.name}
                    </CardTitle>
                    <Badge className="mt-2 bg-white/90 text-gray-800">
                      8 Levels
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 min-h-[3rem]">{game.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {game.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Brain className="w-12 h-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-2">Didaktische Kategorien</h3>
                <p className="text-gray-700 mb-3">
                  Die Spiele sind nach mathematischen Kompetenzbereichen geordnet:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">🔢</span>
                    <strong>Zahlen verstehen (4 Spiele):</strong> Grundlagen des Zahlbegriffs, Größenvergleich, Stellenwert, Nachbarzahlen
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">➕</span>
                    <strong>Clever rechnen (3 Spiele):</strong> Strategien entwickeln, Partnerzahlen, Zerlegungen, Kernaufgaben
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <strong>Rechenmeister (2 Spiele):</strong> Wissen flexibel anwenden, gemischte Aufgaben, Strategiewahl
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-white/80 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-700">
                    <strong>📊 Jedes Spiel hat 8 Level</strong> – insgesamt 72 verschiedene Schwierigkeitsstufen für optimale Förderung!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}