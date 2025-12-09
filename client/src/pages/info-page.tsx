import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Zap, BookOpen, Gamepad2, Info, Cpu, Code, Play, Brain, Lightbulb } from "lucide-react";

export default function InfoPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-amber-500 p-2 rounded-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Informationen</h1>
              <p className="text-sm text-muted-foreground">Alles über MatheZoo</p>
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
          <h1 className="text-4xl font-bold">MatheZoo Info-Center</h1>
          <p className="text-xl text-muted-foreground">
            Hier findest du alle wichtigen Informationen über die App
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schnellstart */}
          <Card
            className="border-2 border-blue-300/50 bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer hover-elevate"
            onClick={() => setLocation('/quickstart')}
          >
            <CardHeader className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Play className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Schnellstart</CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  Die ersten 3 Schritte zum Erfolg
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Perfekt für den Einstieg! Lerne in nur 3 einfachen Schritten, wie du mit MatheZoo startest.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Training starten und Modus wählen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Spiele entdecken und ausprobieren</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Tiere sammeln und Zoo aufbauen</span>
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={(e) => { e.stopPropagation(); setLocation('/quickstart'); }}>
                <Zap className="w-4 h-4 mr-2" />
                Zum Schnellstart
              </Button>
            </CardContent>
          </Card>

          {/* Spiel-Anleitung */}
          <Card
            className="border-2 border-green-300/50 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover-elevate"
            onClick={() => setLocation('/game-guide')}
          >
            <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Spiel-Anleitung</CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  So funktionieren alle 9 Spiele
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Detaillierte Anleitungen für alle Spiele mit Schritt-für-Schritt Erklärungen.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-semibold">▪</span>
                  <span>Zahlenwaage, 10 gewinnt (leicht)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-semibold">▪</span>
                  <span>Zahlen-Treppe, Baumeister (mittel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-semibold">▪</span>
                  <span>Zoo-Nachbarn, Zerlegungs-Safari (schwer)</span>
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={(e) => { e.stopPropagation(); setLocation('/game-guide'); }}>
                <Gamepad2 className="w-4 h-4 mr-2" />
                Zur Spiel-Anleitung
              </Button>
            </CardContent>
          </Card>

          {/* Über MatheZoo */}
          <Card className="border-2 border-purple-300/50 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Über MatheZoo</CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  Was ist MatheZoo?
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-purple-700">
                  MatheZoo ist eine adaptive Lern-App für Mathematik
                </p>
                <p className="text-muted-foreground">
                  Die App passt sich automatisch deinem Lernstand an und hilft dir, Rechnen spielerisch zu lernen.
                </p>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-purple-700">Besondere Features:</p>
                  <ul className="space-y-1 text-purple-700 text-xs">
                    <li>• 54 Kompetenzfelder parallel entwickelt</li>
                    <li>• 44-Neuronen-KI für individuelle Anpassung</li>
                    <li>• 9 verschiedene Mathe-Spiele</li>
                    <li>• 50+ sammelbare Tiere (6 Kontinente)</li>
                    <li>• Missionen, Partner-Zoos & Große Ziele</li>
                    <li>• 5 adaptive Darstellungsformen</li>
                    <li>• Progressive Level 1-100</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projekt-Details */}
          <Card className="border-2 border-teal-300/50 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Code className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Projekt-Details</CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  Entwicklungsstand & Architektur
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-white/80 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-teal-700">Status: Beta-Version 3.0</h3>
                <div className="text-sm space-y-1 text-gray-600">
                  <p><strong>Version:</strong> 3.0 - Brain-Inspired Progression System</p>
                  <p><strong>Stand:</strong> Januar 2025 - Vollständig funktional</p>
                  <p className="text-xs text-gray-500 mt-2">~18.000 Zeilen Code | 7.200+ Zeilen KI-Algorithmen</p>
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-teal-700">Technologie-Stack</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-gray-700">Frontend:</p>
                    <p className="text-gray-600">React + TypeScript</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Backend:</p>
                    <p className="text-gray-600">Node.js + PostgreSQL</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System-Info */}
          <Card
            className="border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer hover-elevate"
            onClick={() => setLocation('/system-info')}
          >
            <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Cpu className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">System-Info</CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  Technische Details & KI-Systeme
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Für Lehrpersonen und technisch Interessierte.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Adaptive Algorithmen & KI-Steuerung</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Lernverlaufs-Tracking & Analysen</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Darstellungswechsel-System (AMRS)</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-4" onClick={(e) => { e.stopPropagation(); setLocation('/system-info'); }}>
                <Info className="w-4 h-4 mr-2" />
                Zur System-Info
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6">
          <h2 className="text-2xl font-bold">Bereit loszulegen?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => setLocation('/quickstart')}>
              <Play className="w-5 h-5 mr-2" />
              Schnellstart
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation('/game-guide')}>
              <Gamepad2 className="w-5 h-5 mr-2" />
              Spiele lernen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
