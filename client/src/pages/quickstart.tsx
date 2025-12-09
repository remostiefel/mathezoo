
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Target, Trophy, BookOpen, Gamepad2, ShoppingCart } from "lucide-react";

export default function QuickstartPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary via-learning-teal to-discovery p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-sans">Schnellstart</h1>
              <p className="text-sm text-muted-foreground">Los geht's in 3 Schritten!</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 space-y-8 max-w-4xl">
        {/* Intro */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🚀✨🦁</div>
          <h1 className="text-4xl font-bold">Willkommen im MatheZoo!</h1>
          <p className="text-xl text-muted-foreground">
            Starte in nur 3 einfachen Schritten deine Mathe-Reise!
          </p>
        </div>

        {/* Schritt 1 */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <CardTitle className="text-2xl">Training starten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Wähle deinen Trainingsmodus</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Normaler Modus:</strong> Das System passt sich automatisch deinem Level an<br />
                  <strong>Benutzerdefinierter Modus:</strong> Wähle selbst, welche Darstellungen du sehen möchtest<br />
                  <strong>Blinder Modus:</strong> Löse Aufgaben nur mit deinem Kopf - die symbolische Darstellung wird versteckt!
                </p>
              </div>
            </div>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-700">💡 Tipp für Anfänger:</p>
              <p className="text-sm text-blue-700">
                Starte mit dem <strong>Normalen Modus</strong> - das System zeigt dir die passenden Hilfen!
              </p>
            </div>
            <Button className="w-full" onClick={() => setLocation('/student')}>
              <Target className="w-4 h-4 mr-2" />
              Zum Training
            </Button>
          </CardContent>
        </Card>

        {/* Schritt 2 */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <CardTitle className="text-2xl">Spiele entdecken</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <Gamepad2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">8 verschiedene Mathe-Spiele</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>⚖️ <strong>Zahlenwaage:</strong> Welche Zahl ist grösser?</li>
                  <li>🎯 <strong>10 gewinnt:</strong> Ergänze zur 10!</li>
                  <li>🪜 <strong>Zahlen-Treppe:</strong> Sortiere die Zahlen</li>
                  <li>🏗️ <strong>Zahlen-Baumeister:</strong> Baue Zahlen aus Einern und Zehnern</li>
                  <li>🧩 <strong>Zerlegungs-Safari:</strong> Zerlege Zahlen kreativ</li>
                  <li>👯 <strong>Verdoppel-Expedition:</strong> Verdopple Zahlen!</li>
                  <li>🦁 <strong>Zoo-Abenteuer:</strong> Mathe-Rätsel mit Tieren</li>
                  <li>🗺️ <strong>Zoo-Pfadfinder:</strong> Finde den Weg durchs Zahlenland</li>
                </ul>
              </div>
            </div>
            <Button className="w-full" onClick={() => setLocation('/games')}>
              <Gamepad2 className="w-4 h-4 mr-2" />
              Alle Spiele anzeigen
            </Button>
          </CardContent>
        </Card>

        {/* Schritt 3 */}
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-amber-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <CardTitle className="text-2xl">Sammle Tiere & kaufe Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <Trophy className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">So funktioniert dein Zoo</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>
                    <strong>Tiere sammeln:</strong> Für jede richtige Aufgabe bekommst du ein Tier! 
                    56 verschiedene Tiere warten auf dich.
                  </li>
                  <li>
                    <strong>Münzen verdienen:</strong> Pro Aufgabe gibt's Münzen. Sammle sie fleissig!
                  </li>
                  <li>
                    <strong>Zoo-Shop:</strong> Kaufe Gehege, Futter, Spielzeug und Deko für deine Tiere.
                  </li>
                  <li>
                    <strong>Level aufsteigen:</strong> Je mehr du übst, desto höher steigst du auf!
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-700">🎉 Tier-Party!</p>
              <p className="text-sm text-amber-700">
                Sammle <strong>10 gleiche Tiere</strong> und feiere eine grosse Party! 🎊
              </p>
            </div>
            <Button className="w-full" onClick={() => setLocation('/zoo-overview')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Zu Mein Zoo
            </Button>
          </CardContent>
        </Card>

        {/* Bonus-Tipps */}
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Bonus-Tipps für Profis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p>
                🎯 <strong>Level-System:</strong> Beginne bei Level 1 und arbeite dich hoch bis Level 54!
              </p>
              <p>
                🏆 <strong>Badges:</strong> Schalte über 50 Erfolgs-Badges frei für besondere Leistungen
              </p>
              <p>
                📊 <strong>Statistiken:</strong> Sieh dir an, wie viele Aufgaben du schon gelöst hast
              </p>
              <p>
                🦁 <strong>Tier-Lexikon:</strong> Lerne spannende Fakten über alle 56 Tiere
              </p>
              <p>
                🌍 <strong>Partner-Zoos:</strong> Hilf Zoos weltweit und sammle Kontinente!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <h2 className="text-2xl font-bold">Bereit loszulegen?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => setLocation('/student')}>
              <BookOpen className="w-5 h-5 mr-2" />
              Training starten
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation('/games')}>
              <Gamepad2 className="w-5 h-5 mr-2" />
              Spiele entdecken
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
