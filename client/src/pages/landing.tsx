import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, Brain, Zap, ArrowRight, Activity, BookOpen, Download, Lightbulb, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    console.log("Logging out...");
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-amber-500 p-2 rounded-lg">
              <span className="text-2xl font-bold text-white">MZ</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">MatheZoo</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              data-testid="button-home"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/info'}
              data-testid="button-info"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/documentation/download'}
              data-testid="button-download-docs"
            >
              <Download className="w-4 h-4 mr-2" />
              Doku
            </Button>
            {isAuthenticated && user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge className="inline-block mb-2 text-sm px-4 py-1 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-3 h-3 mr-2 inline" />
            Willkommen im Mathe-Zoo
          </Badge>

          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              MatheZoo
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-4">
              Wo Zahlen lebendig werden
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tauche ein in eine magische Zoo-Welt mit 6 Gehegen voller Lern-Abenteuer. Adaptive Aufgaben, intelligente Helfer und spannende Spiele - alles entwickelt nach heilpädagogischen Prinzipien.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-primary-foreground font-semibold"
              onClick={() => window.location.href = '/login'}
              data-testid="button-login"
            >
              Zum Login
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Zoo Enclosures & Training Areas Overview */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Alle Trainingsbereiche</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">1</div>
                <div className="text-sm font-bold text-orange-900">Zahlenwaage</div>
                <div className="text-xs text-orange-800 mt-1">Zahlenvergleich</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">2</div>
                <div className="text-sm font-bold text-indigo-900">Zahlen-Treppe</div>
                <div className="text-xs text-indigo-800 mt-1">Sortieren</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-100 to-lime-100 border-green-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">3</div>
                <div className="text-sm font-bold text-green-900">Zahlen-Baumeister</div>
                <div className="text-xs text-green-800 mt-1">Stellenwerte</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">4</div>
                <div className="text-sm font-bold text-teal-900">Zoo-Nachbarn</div>
                <div className="text-xs text-teal-800 mt-1">Nachbarzahlen</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">5</div>
                <div className="text-sm font-bold text-emerald-900">10 gewinnt!</div>
                <div className="text-xs text-emerald-800 mt-1">Zehnerergänzung</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-100 to-teal-100 border-cyan-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">6</div>
                <div className="text-sm font-bold text-cyan-900">Zerlegungs-Safari</div>
                <div className="text-xs text-cyan-800 mt-1">Zahlzerlegung</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-fuchsia-100 to-pink-100 border-fuchsia-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">7</div>
                <div className="text-sm font-bold text-fuchsia-900">Verdoppel-Expedition</div>
                <div className="text-xs text-fuchsia-800 mt-1">Verdoppeln</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">8</div>
                <div className="text-sm font-bold text-amber-900">Zoo-Abenteuer</div>
                <div className="text-xs text-amber-800 mt-1">Addition ZR20</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-100 to-red-100 border-rose-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">9</div>
                <div className="text-sm font-bold text-rose-900">Zoo-Pfadfinder</div>
                <div className="text-xs text-rose-800 mt-1">Rechenstrategien</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">10</div>
                <div className="text-sm font-bold text-blue-900">Blitzblick-Meister</div>
                <div className="text-xs text-blue-800 mt-1">Strukturelles Sehen</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">11</div>
                <div className="text-sm font-bold text-yellow-900">Zahlenhaus-Baumeister</div>
                <div className="text-xs text-yellow-800 mt-1">Teil-Ganzes</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-100 to-slate-200 border-gray-400 border-2 hover-elevate">
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-4xl mb-2 font-bold">12</div>
                <div className="text-sm font-bold text-gray-900">Plus Minus Training</div>
                <div className="text-xs text-gray-800 mt-1">Addition & Subtraktion</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <Badge className="inline-block mb-3 bg-primary/10 text-primary border-primary/20">
              <Award className="w-3 h-3 mr-2 inline" />
              Kernfeatures
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Was dich im Zoo erwartet</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Alles wurde speziell für Kinder mit Rechenschwierigkeiten entwickelt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover-elevate border-2 border-blue-300/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Adaptive Aufgaben</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Aufgaben passen sich an deine Fähigkeiten an. Zu einfach wird schwerer, zu schwer wird leichter.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-green-300/50 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Brain className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Intelligente Analyse</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Das System erkennt, warum du einen Fehler machst und hilft dir, ihn zu verstehen.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-purple-300/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Klare Fortschritte</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Verfolge deinen Lernfortschritt mit detaillierten Statistiken und Erfolgen.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-orange-300/50 bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-700" />
                  </div>
                  <h3 className="font-semibold text-lg">5 Darstellungsformen</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Zahlenstrahl, Zwanzigerfeld, Plättchen, Finger und Notation - finde deine beste Art!
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-pink-300/50 bg-gradient-to-br from-pink-50 to-pink-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-200 rounded-lg">
                    <Award className="w-5 h-5 text-pink-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Spiele & Belohnungen</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Sammle Münzen, dekoriere deinen Zoo und entsperre neue Spiele als Belohnung.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-teal-300/50 bg-gradient-to-br from-teal-50 to-teal-100/50">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-200 rounded-lg">
                    <Users className="w-5 h-5 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-lg">Lehrerbegleitung</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Lehrer sehen deine Fortschritte und können dir gezielt helfen, wo du stockst.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scientific Basis */}
        <div className="mt-20 bg-white/60 rounded-2xl border-2 border-primary/20 p-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <Badge className="inline-block mb-3 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="w-3 h-3 mr-2 inline" />
              Wissenschaftliche Grundlage
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Entwickelt mit Experten</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              <strong>MatheZoo</strong> basiert auf anerkannten heilpädagogischen und lernwissenschaftlichen Prinzipien. Das System wurde speziell für Kinder mit Rechenschwierigkeiten (Dyskalkulie) entwickelt.
            </p>
            <p className="leading-relaxed">
              Jede Aufgabe und jedes Spiel folgt dem Konzept der <strong>strukturierten, mehrcodigen Darstellung</strong> von Zahlenbereichen - ein bewährter Ansatz in der Mathematikdidaktik.
            </p>
            <p className="leading-relaxed">
              Die adaptive Anpassung nutzt <strong>Bayesianische Modelle</strong> um dein Verständnis und deine Strategien kontinuierlich zu erkennen und die nächsten Aufgaben optimal anzupassen.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center pb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Bereit für dein Lern-Abenteuer?</h2>
          <Button 
            size="lg" 
            className="text-lg px-10 h-14 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-primary-foreground font-semibold"
            onClick={() => window.location.href = '/login'}
            data-testid="button-login-cta"
          >
            Jetzt anmelden
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/40 backdrop-blur-sm py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>MatheZoo - Mathematik lernen mit Spaß und System</p>
        </div>
      </footer>
    </div>
  );
}
