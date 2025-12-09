import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Trophy, Gamepad2, BookOpen, BarChart3, Lightbulb, ShoppingCart, Users, Brain, Info, Settings, Target, Globe, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppNavigation({ className }: { className?: string }) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  if (!isAuthenticated) return null;

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <nav className={cn("border-b-2 border-white/30 shadow-lg bg-gradient-to-r from-green-600 via-blue-600 to-purple-600", className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand - nur Text, kein Logo */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              MatheZoo
            </h1>
            <p className="text-lg font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {user?.firstName || user?.username}
            </p>
          </div>

          {/* Haupt-Navigation */}
          <div className="flex items-center gap-2">
            {/* HOME Button - grün leuchtend */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(isStudent ? '/student' : '/teacher')}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                "bg-gradient-to-r from-green-400 via-green-500 to-green-600",
                "hover:from-green-500 hover:via-green-600 hover:to-green-700",
                "text-white border-green-700 shadow-lg",
                "hover:shadow-xl hover:scale-105 transition-all"
              )}
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold">Home</span>
            </Button>

            {/* SCHÜLER-NAVIGATION */}
            {isStudent && (
              <>
                {/* Training Button - Gelb (Löwe - stark werden) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/training')}
                  className={cn(
                    "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                    "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500",
                    "hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600",
                    "text-yellow-900 border-yellow-600 shadow-lg",
                    "hover:shadow-xl hover:scale-105 transition-all"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold">Training</span>
                </Button>

                {/* Spiele Dropdown - Violett (Affe - verspielt) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                        "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600",
                        "hover:from-purple-500 hover:via-purple-600 hover:to-purple-700",
                        "text-white border-purple-700 shadow-lg",
                        "hover:shadow-xl hover:scale-105 transition-all"
                      )}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Spiele</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Alle Spiele</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/games')}>
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Spiele-Übersicht
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Leicht</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/game')}>
                      <span className="text-base mr-2">⚖️</span>
                      Zahlenwaage
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/ten-wins-game')}>
                      <span className="text-base mr-2">🎯</span>
                      10 gewinnt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Mittel</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/neighbor-game')}>
                      <span className="text-base mr-2">🐘</span>
                      Zoo-Nachbarn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/number-stairs')}>
                      <span className="text-base mr-2">🪜</span>
                      Zahlen-Treppe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/number-builder')}>
                      <span className="text-base mr-2">🏗️</span>
                      Zahlen-Baumeister
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/decomposition-safari')}>
                      <span className="text-base mr-2">🧩</span>
                      Zerlegungs-Safari
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/doubling-expedition')}>
                      <span className="text-base mr-2">👯</span>
                      Verdoppel-Expedition
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Schwer</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-adventure')}>
                      <span className="text-base mr-2">🦁</span>
                      Zoo-Abenteuer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-pathfinder')}>
                      <span className="text-base mr-2">🗺️</span>
                      Zoo-Pfadfinder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/structured-perception')}>
                      <span className="text-base mr-2">👁️</span>
                      Blitzblick-Meister
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/part-whole-house')}>
                      <span className="text-base mr-2">🏠</span>
                      Zahlenhaus-Baumeister
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Shop Button - Cyan (Teil von Zoo-Features) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/zoo-shop')}
                  className={cn(
                    "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                    "bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600",
                    "hover:from-cyan-500 hover:via-teal-600 hover:to-cyan-700",
                    "text-white border-cyan-700 shadow-lg",
                    "hover:shadow-xl hover:scale-105 transition-all"
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-bold">Shop</span>
                </Button>

                {/* Mein Zoo Dropdown - Blau (Elefant - Sammler) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                        "bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-600",
                        "hover:from-blue-500 hover:via-blue-600 hover:to-cyan-700",
                        "text-white border-blue-700 shadow-lg",
                        "hover:shadow-xl hover:scale-105 transition-all"
                      )}
                    >
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold">Mein Zoo</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Zoo & Erfolge</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/zoo-overview')}>
                      <Trophy className="w-4 h-4 mr-2" />
                      Zoo-Übersicht
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-shop')}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Zoo-Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-statistics')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Statistiken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation(`/animal-encyclopedia?userId=${user?.id}`)}>
                      <span className="text-base mr-2">📚</span>
                      Tier-Lexikon
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/animal-cards')}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Tier-Freunde
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/team-builder')}>
                      <Users className="w-4 h-4 mr-2" />
                      Mein Team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Abenteuer & Story</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/campaigns')}>
                      <Globe className="w-4 h-4 mr-2" />
                      Kampagnen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Zoo-Herausforderungen</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-missions')}>
                      <Target className="w-4 h-4 mr-2" />
                      Tier-Rettungs-Missionen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-partner-zoos')}>
                      <Globe className="w-4 h-4 mr-2" />
                      Partner-Zoos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-big-goals')}>
                      <Crown className="w-4 h-4 mr-2" />
                      Grosse Ziele
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>🎨 Kreative Aktivitäten</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-builder')}>
                      <span className="text-base mr-2">🏗️</span>
                      Zoo-Builder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-gallery')}>
                      <span className="text-base mr-2">🎨</span>
                      Zoo-Galerie & Glücksrad
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* LEHRER-NAVIGATION */}
            {isTeacher && (
              <>
                {/* Dashboard */}
                <Button
                  variant={location === '/teacher' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLocation('/teacher')}
                  className={cn(
                    "flex items-center gap-1.5 h-9 px-3 text-white hover:bg-white/20 border border-white/30",
                    location === '/teacher' && "bg-white/30"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs font-semibold">Dashboard</span>
                </Button>

                {/* Werkzeuge Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 h-9 px-3 text-white hover:bg-white/20 border border-white/30"
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-xs font-semibold">Werkzeuge</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Analyse-Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/simulation-viewer')}>
                      <Brain className="w-4 h-4 mr-2" />
                      Lernpfad-Simulation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Test-Spiele</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLocation('/game')}>
                      <span className="text-base mr-2">⚖️</span>
                      Zahlenwaage
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/ten-wins-game')}>
                      <span className="text-base mr-2">🎯</span>
                      10 gewinnt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/number-stairs')}>
                      <span className="text-base mr-2">🪜</span>
                      Zahlen-Treppe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/number-builder')}>
                      <span className="text-base mr-2">🏗️</span>
                      Zahlen-Baumeister
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/decomposition-safari')}>
                      <span className="text-base mr-2">🧩</span>
                      Zerlegungs-Safari
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/doubling-expedition')}>
                      <span className="text-base mr-2">👯</span>
                      Verdoppel-Expedition
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-adventure')}>
                      <span className="text-base mr-2">🦁</span>
                      Zoo-Abenteuer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/zoo-pathfinder')}>
                      <span className="text-base mr-2">🗺️</span>
                      Zoo-Pfadfinder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Verwaltung Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 h-9 px-3 text-white hover:bg-white/20 border border-white/30"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Verwaltung</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Benutzerverwaltung</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/teacher')}>
                      <Users className="w-4 h-4 mr-2" />
                      Schüler:innen
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => setLocation('/teacher')}>
                        <Settings className="w-4 h-4 mr-2" />
                        System-Verwaltung
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Info/System Dropdown - silbern leuchtend */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                    "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
                    "hover:from-gray-400 hover:via-gray-500 hover:to-gray-600",
                    "text-gray-900 border-gray-600 shadow-lg",
                    "hover:shadow-xl hover:scale-105 transition-all"
                  )}
                >
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold">Info</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Informationen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/info')}>
                  <Info className="w-4 h-4 mr-2" />
                  Info-Übersicht
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/quickstart')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Schnellstart
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/game-guide')}>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Spiel-Anleitung
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/system-info')}>
                  <Settings className="w-4 h-4 mr-2" />
                  System-Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ABMELDEN Button - rot leuchtend */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 font-bold border-2",
                "bg-gradient-to-r from-red-400 via-red-500 to-red-600",
                "hover:from-red-500 hover:via-red-600 hover:to-red-700",
                "text-white border-red-700 shadow-lg",
                "hover:shadow-xl hover:scale-105 transition-all"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Abmelden</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}