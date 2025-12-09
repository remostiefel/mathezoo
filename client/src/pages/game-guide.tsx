
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export default function GameGuidePage() {
  const [, setLocation] = useLocation();

  const games = [
    {
      icon: "⚖️",
      title: "Zahlenwaage",
      level: "Leicht",
      description: "Vergleiche zwei Zahlen und finde heraus, welche grösser ist.",
      howTo: [
        "Du siehst zwei Zahlen auf einer Waage",
        "Klicke auf die Zahl, die grösser ist",
        "Die Waage kippt zur richtigen Seite!",
        "Sammle Tiere für richtige Antworten"
      ],
      link: "/game"
    },
    {
      icon: "🎯",
      title: "10 gewinnt!",
      level: "Leicht",
      description: "Ergänze Zahlen zur 10 - trainiere Zehnerfreunde!",
      howTo: [
        "Du bekommst eine Zahl (z.B. 7)",
        "Finde die Ergänzung zur 10 (hier: 3)",
        "Klicke auf die richtige Zahl",
        "Nutze das Zwanzigerfeld als Hilfe!"
      ],
      link: "/ten-wins-game"
    },
    {
      icon: "🪜",
      title: "Zahlen-Treppe",
      level: "Mittel",
      description: "Sortiere Zahlen von klein nach gross.",
      howTo: [
        "8 Zahlen erscheinen durcheinander",
        "Klicke sie der Reihe nach: kleinste zuerst",
        "Baue eine aufsteigende Treppe",
        "Am Ende: Klicke auf die grösste Zahl!"
      ],
      link: "/number-stairs"
    },
    {
      icon: "🏗️",
      title: "Zahlen-Baumeister",
      level: "Mittel",
      description: "Baue zweistellige Zahlen aus Einern und Zehnern.",
      howTo: [
        "Sieh dir Einer und Zehner an (z.B. 3 Zehner, 5 Einer)",
        "Tippe die richtige Zahl ein (hier: 35)",
        "Nutze das Eingabefeld unten",
        "Verstehe das Stellenwertsystem!"
      ],
      link: "/number-builder"
    },
    {
      icon: "🧩",
      title: "Zerlegungs-Safari",
      level: "Mittel",
      description: "Zerlege Zahlen kreativ in Teilmengen.",
      howTo: [
        "Du bekommst eine Zahl (z.B. 12)",
        "Zerlege sie in zwei Teile (z.B. 7 + 5)",
        "Nutze die 5er-Kraft: 5 + 5 + 2",
        "Entdecke verschiedene Zerlegungen!"
      ],
      link: "/decomposition-safari"
    },
    {
      icon: "👯",
      title: "Verdoppel-Expedition",
      level: "Mittel",
      description: "Verdopple Zahlen blitzschnell!",
      howTo: [
        "Eine Zahl erscheint (z.B. 6)",
        "Verdopple sie im Kopf (6 + 6 = 12)",
        "Klicke auf die richtige Antwort",
        "Nutze Tricks: 6 + 6 = 5 + 5 + 2"
      ],
      link: "/doubling-expedition"
    },
    {
      icon: "🦁",
      title: "Zoo-Abenteuer",
      level: "Schwer",
      description: "Löse knifflige Mathe-Rätsel mit Zoo-Tieren!",
      howTo: [
        "Tiere stellen dir Rechenaufgaben",
        "Nutze alle Darstellungen als Hilfe",
        "Sammle besondere Tier-Belohnungen",
        "Meistere herausfordernde Aufgaben!"
      ],
      link: "/zoo-math-adventure"
    },
    {
      icon: "🗺️",
      title: "Zoo-Pfadfinder",
      level: "Schwer",
      description: "Finde den Weg durchs Zahlenland!",
      howTo: [
        "Navigiere durch ein Zahlen-Labyrinth",
        "Löse Aufgaben an jedem Wegpunkt",
        "Finde den kürzesten Weg zum Ziel",
        "Sammle unterwegs Bonus-Tiere!"
      ],
      link: "/zoo-pathfinder"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary via-learning-teal to-discovery p-2 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-sans">Spiel-Anleitung</h1>
              <p className="text-sm text-muted-foreground">So funktionieren alle 8 Spiele</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 space-y-8 max-w-5xl">
        {/* Intro */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎮🦁🧮</div>
          <h1 className="text-4xl font-bold">Alle MatheZoo-Spiele erklärt</h1>
          <p className="text-xl text-muted-foreground">
            Lerne, wie jedes Spiel funktioniert und werde zum Mathe-Champion!
          </p>
        </div>

        {/* Spiele */}
        <div className="space-y-6">
          {games.map((game, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className={`bg-gradient-to-r ${
                game.level === 'Leicht' ? 'from-green-100 to-emerald-100 border-b-2 border-green-300' :
                game.level === 'Mittel' ? 'from-blue-100 to-cyan-100 border-b-2 border-blue-300' :
                'from-purple-100 to-pink-100 border-b-2 border-purple-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{game.icon}</span>
                    <div>
                      <CardTitle className="text-2xl">{game.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    game.level === 'Leicht' ? 'bg-green-200 text-green-800' :
                    game.level === 'Mittel' ? 'bg-blue-200 text-blue-800' :
                    'bg-purple-200 text-purple-800'
                  }`}>
                    {game.level}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-lg">So spielst du:</h3>
                  <ol className="space-y-2">
                    {game.howTo.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <Button className="w-full" onClick={() => setLocation(game.link)}>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  {game.title} spielen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Allgemeine Tipps */}
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl">Allgemeine Spiel-Tipps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p>
                🎯 <strong>Keine Eile:</strong> Nimm dir Zeit zum Nachdenken - Geschwindigkeit kommt später!
              </p>
              <p>
                🧮 <strong>Nutze Hilfen:</strong> Das Zwanzigerfeld, der Zahlenstrahl und die Plättchen helfen dir!
              </p>
              <p>
                🦁 <strong>Tiere sammeln:</strong> Für jede richtige Antwort bekommst du ein zufälliges Tier
              </p>
              <p>
                🎊 <strong>Partys feiern:</strong> Sammle 10 gleiche Tiere für eine grosse Party!
              </p>
              <p>
                ⭐ <strong>Wiederhole Spiele:</strong> Je öfter du spielst, desto besser wirst du!
              </p>
              <p>
                💪 <strong>Steigere dich:</strong> Beginne mit leichten Spielen und wage dich dann an schwere!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <h2 className="text-2xl font-bold">Bereit zum Spielen?</h2>
          <Button size="lg" onClick={() => setLocation('/games')}>
            <Gamepad2 className="w-5 h-5 mr-2" />
            Zur Spiele-Übersicht
          </Button>
        </div>
      </div>
    </div>
  );
}
