
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, Gamepad2, Trophy, BookOpen, BarChart3 } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";

export default function SiteOverview() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      title: "🏠 Startbereich",
      icon: Home,
      items: [
        { name: "Home", path: "/" },
        { name: "Login", path: "/login" },
      ]
    },
    {
      title: "📚 Training & Lernen",
      icon: BookOpen,
      items: [
        { name: "Schüler-Arbeitsbereich", path: "/student" },
        { name: "Training (Progressive)", path: "/student-progressive" },
        { name: "Übungsmodus (Optimiert)", path: "/practice-optimized" },
        { name: "Repräsentations-Übung", path: "/practice-representation" },
      ]
    },
    {
      title: "🎮 Spiele",
      icon: Gamepad2,
      items: [
        { name: "Spiele-Übersicht", path: "/games" },
        { name: "Zahlenwaage", path: "/game" },
        { name: "10 gewinnt", path: "/ten-wins-game" },
        { name: "Zoo-Abenteuer", path: "/zoo-adventure" },
        { name: "Zerlegungs-Safari", path: "/decomposition-safari" },
        { name: "Verdoppel-Expedition", path: "/doubling-expedition" },
        { name: "Zoo-Pfadfinder", path: "/zoo-pathfinder" },
      ]
    },
    {
      title: "🦁 Mein Zoo",
      icon: Trophy,
      items: [
        { name: "Zoo-Übersicht", path: "/zoo-overview" },
        { name: "Zoo-Shop", path: "/zoo-shop" },
        { name: "Zoo-Statistiken", path: "/zoo-statistics" },
        { name: "Tier-Enzyklopädie", path: "/animal-encyclopedia" },
      ]
    },
    {
      title: "👨‍🏫 Lehrer-Bereich",
      icon: BarChart3,
      items: [
        { name: "Lehrer-Dashboard", path: "/teacher" },
        { name: "Lernpfad-Simulation", path: "/simulation-viewer" },
      ]
    },
    {
      title: "ℹ️ Info & System",
      icon: BookOpen,
      items: [
        { name: "Über MatheZoo", path: "/info" },
        { name: "System-Info", path: "/system-info" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <AppNavigation />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Site-Übersicht
          </h1>
          <p className="text-lg text-muted-foreground">
            Alle Bereiche von MatheZoo im Überblick
          </p>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <section.icon className="w-6 h-6" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setLocation(item.path)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          MatheZoo - Adaptive Lernplattform für Mathematik
          <br />
          Impressum: Remo Stiefel, lerncare@gmail.com (2025)
        </p>
      </footer>
    </div>
  );
}
