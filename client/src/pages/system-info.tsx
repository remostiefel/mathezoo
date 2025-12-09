import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Award,
  Zap,
  Activity,
  Layers,
  BookOpen,
  ArrowLeft,
  Users,
  GraduationCap,
  Clock,
  Network,
  Eye,
  Waves,
  Shield,
  CheckCircle,
  Coins,
  ShoppingCart,
  Gift,
  Code,
  Package,
  Database,
  Cpu
} from "lucide-react";

export default function SystemInfo() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary via-learning-teal to-discovery p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-sans">MatheZoo</h1>
              <p className="text-sm text-muted-foreground">Neuroadaptives Lernsystem</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-learning-teal to-discovery bg-clip-text text-transparent">
            Das intelligente System hinter MatheZoo
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Ein wissenschaftlich fundiertes, neuroadaptives Mathematik-Lernsystem mit 54 Kompetenzfeldern,
            adaptiver Darstellungsreduktion und individueller Fehlerdiagnose - basierend auf über 50 Jahren Forschung.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">54</div>
              <div className="text-xs text-muted-foreground mt-1">Kompetenzfelder</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-learning-teal/10 to-learning-teal/5 rounded-lg border border-learning-teal/20">
              <div className="text-3xl font-bold text-learning-teal">44</div>
              <div className="text-xs text-muted-foreground mt-1">Neuronen</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-discovery/10 to-discovery/5 rounded-lg border border-discovery/20">
              <div className="text-3xl font-bold text-discovery">5</div>
              <div className="text-xs text-muted-foreground mt-1">Darstellungen</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-achievement/10 to-achievement/5 rounded-lg border border-achievement/20">
              <div className="text-3xl font-bold text-achievement">100</div>
              <div className="text-xs text-muted-foreground mt-1">Levels</div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 max-w-6xl mx-auto h-auto gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
              <Sparkles className="w-4 h-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="competency" className="flex items-center gap-2 py-3">
              <Target className="w-4 h-4" />
              Kompetenzen
            </TabsTrigger>
            <TabsTrigger value="neural" className="flex items-center gap-2 py-3">
              <Brain className="w-4 h-4" />
              KI-System
            </TabsTrigger>
            <TabsTrigger value="representations" className="flex items-center gap-2 py-3">
              <Layers className="w-4 h-4" />
              Darstellungen
            </TabsTrigger>
            <TabsTrigger value="zoo" className="flex items-center gap-2 py-3">
              <ShoppingCart className="w-4 h-4" />
              Zoo-Shop
            </TabsTrigger>
            <TabsTrigger value="science" className="flex items-center gap-2 py-3">
              <GraduationCap className="w-4 h-4" />
              Wissenschaft
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Die 7 Säulen der Genialität
                </CardTitle>
                <CardDescription>
                  Was macht MatheZoo einzigartig?
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">1. Kompetenz statt Level</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nicht linear von 1-100, sondern <strong>54 parallel entwickelte Kompetenzfelder</strong>.
                    Addition ZR10, Subtraktion ZR20, Platzhalter - alles gleichzeitig trainiert.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Fritz & Ricken Kompetenzstufenmodell
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-learning-teal" />
                    <h3 className="font-semibold">2. 44-Neuronen-Netzwerk</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ein <strong>biologisch inspiriertes neuronales Netz</strong> mit 3 Schichten (Input, Hidden, Output)
                    lernt durch Hebbian Plasticity: "Neurons that fire together, wire together".
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Hebb (1949), Bi & Poo (1998)
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-discovery" />
                    <h3 className="font-semibold">3. Adaptive Darstellungsreduktion</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Start mit <strong>5 Darstellungen</strong> (TwentyFrame, NumberLine, Counters, Fingers, Symbolic),
                    progressive Reduktion zu 1 Darstellung bei Mastery.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Bruner (1966) - Darstellungsvernetzung
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-achievement" />
                    <h3 className="font-semibold">4. 12 Fehlertypen-Analyse</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Bayesianische 5-Ebenen-Diagnose</strong> erkennt nicht nur DASS etwas falsch ist,
                    sondern WARUM (Zählfehler, Operationsverwechslung, Stellenwertproblem, etc.).
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Padberg & Benz (2021), Gaidoschik (2010)
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">5. Ensemble von 5 KI-Modellen</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bayesian, Neural Net, Symbolic, Case-Based & Hybrid Predictor konkurrieren um beste Vorhersagen.
                    <strong>Weighted Voting</strong> kombiniert ihre Stärken.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Dietterich (2000) - Ensemble Methods
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-learning-teal" />
                    <h3 className="font-semibold">6. Sleep Consolidation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Nach Ruhephasen (8-12h) werden Erinnerungen <strong>konsolidiert</strong>:
                    Synaptic Homeostasis, Memory Replay, Pruning. Wie echtes Gehirn!
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Tononi & Cirelli (2014)
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-discovery" />
                    <h3 className="font-semibold">7. Meta-Learning</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    System lernt <strong>wie du am besten lernst</strong>: Optimale Learning Rate,
                    ideale Spacing-Intervalle, Error Recovery Rate, Breakthrough Detection.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Wissenschaftlich: Finn et al. (2017) - MAML
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-achievement" />
                    <h3 className="font-semibold">8. Mathematische Korrektheit</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Doppelte Validierung</strong> bei jeder Aufgabe.
                    Arithmetik-Validator garantiert: Keine falschen Aufgaben, keine Rechenfehler im System.
                  </p>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    ✓ 100% Fehlerfreiheit
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competency Tab */}
          <TabsContent value="competency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  54 Kompetenzfelder - Das Herzstück
                </CardTitle>
                <CardDescription>
                  Parallel Development statt linearer Progression
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Das Problem traditioneller Systeme:</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Herkömmliche Mathe-Apps: <em>Erst ZR10 komplett meistern, dann ZR20, dann ZR100...</em>
                    <br />
                    <strong>Problem:</strong> Kinder langweilen sich oder frustrieren, weil nur ein Bereich trainiert wird.
                  </p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Die MatheZoo-Lösung:</h3>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-primary">🎯 Parallel Development:</p>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Level 1-5:</strong> addition_ZR10 + subtraction_ZR10 + placeholder_end</li>
                      <li><strong>Level 6-10:</strong> + addition_ZR20 + near_doubles + number_bonds_10</li>
                      <li><strong>Level 11-15:</strong> + addition_with_transition + inverse_operations</li>
                      <li><strong>Level 16-20:</strong> + subtraction_with_transition + decomposition</li>
                    </ul>
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-3">Mastery-Tracking:</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-mono">
                      ✓ Richtig → +1 Punkt<br />
                      ✗ Falsch → -2 Punkte (doppelte Kompensation)<br />
                      3/3 Punkte → ✅ Kompetenz gemeistert!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Software-Spezifikationen */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-6 h-6 text-purple-600" />
                    Software-Spezifikationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Tech-Stack
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700">Frontend:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• React 18 + TypeScript</li>
                          <li>• Vite (Build-Tool)</li>
                          <li>• TailwindCSS + shadcn/ui</li>
                          <li>• TanStack Query</li>
                          <li>• Wouter (Routing)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Backend:</p>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Node.js + Express</li>
                          <li>• PostgreSQL (Datenbank)</li>
                          <li>• Drizzle ORM</li>
                          <li>• TypeScript</li>
                          <li>• RESTful API</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Datenarchitektur
                    </h3>
                    <div className="text-sm space-y-2">
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="font-semibold mb-2">Haupttabellen:</p>
                        <ul className="space-y-1 text-xs font-mono">
                          <li>• users (Nutzer-Authentifizierung)</li>
                          <li>• classes (Klassenorganisation)</li>
                          <li>• learning_progression (44-Neuron-State)</li>
                          <li>• tasks (Aufgaben-Historie)</li>
                          <li>• zoo_progress (Tier-Sammlung)</li>
                          <li>• zoo_purchases (Shop-Käufe)</li>
                          <li>• zoo_missions (Missionen-Status)</li>
                        </ul>
                      </div>
                      <p className="text-xs text-gray-600">
                        Gesamt: ~15.000 Zeilen Code | 2,600+ Zeilen KI-Algorithmen
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      KI-Systeme
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-700 mb-1">Brain-Inspired System 3.0</p>
                        <ul className="text-xs space-y-1">
                          <li>• 44 Neuronen (24 Input, 12 Hidden, 8 Output)</li>
                          <li>• Hebbian Learning + STDP</li>
                          <li>• Synaptic Consolidation</li>
                          <li>• Memory Replay während Pausen</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded p-3">
                        <p className="font-semibold text-green-700 mb-1">Ensemble AI (5 Modelle)</p>
                        <ul className="text-xs space-y-1">
                          <li>• Bayesian Predictor</li>
                          <li>• Neural Network Predictor</li>
                          <li>• Symbolic Reasoner</li>
                          <li>• Case-Based Reasoner</li>
                          <li>• Hybrid Predictor</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded p-3">
                        <p className="font-semibold text-amber-700 mb-1">Adaptive Systeme</p>
                        <ul className="text-xs space-y-1">
                          <li>• Genetic Task Evolution</li>
                          <li>• Transfer Learning (ZR20 → ZR100)</li>
                          <li>• Meta-Learning (Lernrate-Optimierung)</li>
                          <li>• Representation Selection</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Performance & Skalierung
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Optimierungen:</p>
                        <ul className="text-xs text-gray-600">
                          <li>• O(n) Komplexität bei Neuron-Updates</li>
                          <li>• Caching von Darstellungs-Profilen</li>
                          <li>• Lazy Evaluation bei Scoring</li>
                          <li>• Rolling Windows für Trend-Analyse</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">Kapazität:</p>
                        <ul className="text-xs text-gray-600">
                          <li>• 100 Memory Traces/Nutzer</li>
                          <li>• ~15% Netzwerk-Reduktion (Pruning)</li>
                          <li>• Inkrementelle Updates</li>
                          <li>• Session-State-Management</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Sicherheit & Datenschutz
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Session-basierte Authentifizierung</li>
                      <li>✓ Passwort-Hashing (bcrypt)</li>
                      <li>✓ CSRF-Protection</li>
                      <li>✓ Rollenbasierte Zugriffskontrolle</li>
                      <li>✓ Daten-Isolation nach userId</li>
                      <li>✓ Keine PII in Analytics-Daten</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Wissenschaftliche Fundierung
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      MatheZoo basiert auf 50+ wissenschaftlichen Quellen:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-indigo-600">Neurowissenschaft:</p>
                        <ul className="text-gray-600">
                          <li>• Hebb (1949) - Hebbian Learning</li>
                          <li>• Bi & Poo (1998) - STDP</li>
                          <li>• Tononi & Cirelli (2014)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-600">Mathematikdidaktik:</p>
                        <ul className="text-gray-600">
                          <li>• Bruner (1966) - Scaffolding</li>
                          <li>• Vygotsky (1978) - ZPD</li>
                          <li>• Sweller (1988) - Cog. Load</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Vorteile
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Keine Langeweile durch Abwechslung</li>
                        <li>• Natürliche Querverbindungen</li>
                        <li>• Individuelles Tempo pro Kompetenz</li>
                        <li>• Schwächen gezielt trainieren</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Wissenschaftlich fundiert
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Fritz & Ricken Kompetenzmodell</li>
                        <li>• Wittmann: Operatives Prinzip</li>
                        <li>• Spiralcurriculum (Bruner)</li>
                        <li>• ZPD-Theorie (Vygotsky)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Neural Tab */}
          <TabsContent value="neural" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-learning-teal" />
                  44-Neuronen-Netzwerk - Wie ein echtes Gehirn
                </CardTitle>
                <CardDescription>
                  Biologisch inspiriertes Lernen mit Hebbian Plasticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">INPUT (24 Neuronen)</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><strong>Performance:</strong> Korrektheit, Geschwindigkeit, Trend</p>
                      <p><strong>Strategie:</strong> Zählen, Zerlegen, Abrufen</p>
                      <p><strong>Emotion:</strong> Frustration, Engagement, Flow</p>
                      <p><strong>Kontext:</strong> Tageszeit, Session-Länge</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">HIDDEN (12 Neuronen)</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><strong>Cognitive Processor (4):</strong> Verarbeitung</p>
                      <p><strong>Metacognitive Monitor (4):</strong> Überwachung</p>
                      <p><strong>Emotional Regulator (4):</strong> Emotionen</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">OUTPUT (8 Neuronen)</h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><strong>A_task_difficulty:</strong> Schwierigkeit</p>
                      <p><strong>A_scaffold_visual:</strong> Hilfen</p>
                      <p><strong>A_pacing:</strong> Tempo</p>
                      <p><strong>A_feedback_type:</strong> Feedback</p>
                    </div>
                  </div>
                </div>

                <div className="bg-learning-teal/5 border border-learning-teal/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Hebbian Learning:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <em>"Neurons that fire together, wire together"</em>
                  </p>
                  <div className="font-mono text-xs bg-muted rounded p-3">
                    Δw_ij = η · a_i · a_j<br /><br />
                    Bei korrekter Aufgabe:<br />
                    weight(N_decomposition → A_scaffold_visual) -= 0.01<br />
                    → Weniger Hilfe nötig!
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Phase 3 Erweiterungen:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>✓ Sleep Consolidation (Gedächtnisbildung)</li>
                      <li>✓ Adaptive Representation Selection</li>
                      <li>✓ Transfer Learning (ZR20 → ZR100)</li>
                      <li>✓ Meta-Learning (optimale Lernrate)</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Wissenschaftliche Basis:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Hebb (1949): Hebbian Plasticity</li>
                      <li>• Bi & Poo (1998): STDP</li>
                      <li>• Tononi & Cirelli (2014): Homeostasis</li>
                      <li>• Finn et al. (2017): Meta-Learning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Representations Tab */}
          <TabsContent value="representations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-6 w-6 text-discovery" />
                  5 Mathematische Darstellungen
                </CardTitle>
                <CardDescription>
                  Von konkret (Fingers) zu abstrakt (Symbolic)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👐</span>
                      <h3 className="font-semibold">1. Fingers (Enaktiv)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Zwei Hände mit 10 Fingern. <strong>Konkret anfassbar</strong>,
                      perfekt für Kinder die noch mit Fingern zählen.
                    </p>
                    <Badge variant="outline" className="text-xs">Bruner: Enaktive Ebene</Badge>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔴</span>
                      <h3 className="font-semibold">2. TwentyFrame (Ikonisch)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      2·10 Gitter mit roten/blauen Kreisen. <strong>5er-Struktur</strong> wird sichtbar:
                      8 = 5+3. Nutzt Kraft der 5 (Wittmann).
                    </p>
                    <Badge variant="outline" className="text-xs">Bruner: Ikonische Ebene</Badge>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📏</span>
                      <h3 className="font-semibold">3. NumberLine (Ikonisch)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Linie von 0-20. <strong>Bewegung visualisieren</strong>,
                      Zehnerübergang sichtbar machen. Mentales Modell für Sprünge.
                    </p>
                    <Badge variant="outline" className="text-xs">Krajewski: Ordinales Verständnis</Badge>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚫</span>
                      <h3 className="font-semibold">4. Counters (Ikonisch)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verschiebbare Plättchen. <strong>Manipulativ</strong>,
                      Kinder können bündeln, sortieren, umgruppieren. Embodied Cognition.
                    </p>
                    <Badge variant="outline" className="text-xs">Lakoff & Núñez: Embodied Math</Badge>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">➕</span>
                      <h3 className="font-semibold">5. Symbolic (Symbolisch)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mathematische Notation: 8 + 5 = 13. <strong>Abstrakt</strong>,
                      verbindet alle Darstellungen. Ziel der Entwicklung.
                    </p>
                    <Badge variant="outline" className="text-xs">Bruner: Symbolische Ebene</Badge>
                  </div>
                </div>

                <div className="bg-discovery/5 border border-discovery/20 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Adaptive Reduktion:</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Start:</strong> Alle 5 Darstellungen sichtbar (RL5)<br />
                      <strong>Progression:</strong> 5 korrekte → RL-1 (weniger Hilfen)<br />
                      <strong>Regression:</strong> 3 Fehler → RL+1 (mehr Hilfen)<br />
                      <strong>Ziel:</strong> Nur Symbolic (RL1) - Automatisierung erreicht
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zoo & Gamification Tab */}
          <TabsContent value="zoo" className="space-y-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <span className="text-3xl">🎪</span>
                  Der MatheZoo - Gamification-System (2025)
                </CardTitle>
                <CardDescription className="text-base">
                  Vollständig integriertes Belohnungs- und Motivationssystem mit über 120 Items und 56 Tieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Zoo-Münzen System */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">💰</div>
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-700">Zoo-Münzen - Die magische Währung!</h3>
                      <p className="text-yellow-600">Verdiene Münzen durch cleveres Rechnen!</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">💎 So verdienst du Münzen:</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-white/70 rounded-lg p-3 border border-yellow-300">
                        <p className="font-semibold text-primary">🎮 Spiele Zoo-Spiele:</p>
                        <ul className="text-sm space-y-1 mt-2">
                          <li>• Zahlenwaage: <strong>5 Münzen</strong> pro richtiger Antwort + 20 Bonus</li>
                          <li>• 10 gewinnt: <strong>3 Münzen</strong> pro Runde + 15 Bonus</li>
                          <li>• Zerlegungs-Safari: <strong>4 Münzen</strong> + 18 Bonus</li>
                          <li>• Verdopplungs-Expedition: <strong>4 Münzen</strong> + 18 Bonus</li>
                          <li>• Zoo-Pfadfinder: <strong>6 Münzen</strong> + 25 Bonus (schwierig!)</li>
                        </ul>
                      </div>

                      <div className="bg-white/70 rounded-lg p-3 border border-yellow-300">
                        <p className="font-semibold text-primary">📈 Weitere Münz-Quellen:</p>
                        <ul className="text-sm space-y-1 mt-2">
                          <li>• <strong>Neues Level:</strong> +50 Münzen Belohnung! 🎉</li>
                          <li>• <strong>Neues Tier:</strong> +10 Münzen pro Tier! 💰</li>
                          <li>• <strong>Badge erreicht:</strong> Bis zu +100 Münzen! 🏆</li>
                          <li>• <strong>Perfektes Spiel:</strong> Münzen · 1.5 - 2.5! ⭐</li>
                          <li>• <strong>Täglich Einloggen:</strong> Tägliche Bonus-Münzen! 📅</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zoo-Shop */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">🏪</div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">Der Zoo-Shop - Kaufe tolle Items!</h3>
                      <p className="text-green-600">Über 60 verschiedene Items zum Sammeln!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/70 rounded-lg p-4 border border-green-300">
                      <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                        <span className="text-2xl">🏠</span> 10 Verschiedene Gehege
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li>🏜️ <strong>Savanne (100 Münzen):</strong> +15% Chance auf afrikanische Tiere!</li>
                        <li>🌴 <strong>Dschungel (120 Münzen):</strong> +10% XP bei Dschungelaufgaben!</li>
                        <li>❄️ <strong>Arktis (150 Münzen):</strong> +20% Münzen in der Eiswelt!</li>
                        <li>🌊 <strong>Ozean (200 Münzen):</strong> +25% auf seltene Meerestiere!</li>
                        <li>🦘 <strong>Australien (140 Münzen):</strong> Kängurus werden super glücklich!</li>
                        <li>...und 5 weitere magische Lebensräume!</li>
                      </ul>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-green-300">
                      <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                        <span className="text-2xl">🍎</span> 12 Futtersorten
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li>🍌 <strong>Banane (8 Münzen):</strong> Affen werden super glücklich! +20% Freude</li>
                        <li>🐟 <strong>Fisch (10 Münzen):</strong> +15% XP für Wassertiere!</li>
                        <li>🎋 <strong>Bambus (12 Münzen):</strong> +30% Panda-Chance!</li>
                        <li>🥩 <strong>Fleisch (15 Münzen):</strong> Raubtiere werden aktiver! +25% Münzen</li>
                        <li>🍉 <strong>Wassermelone (10 Münzen):</strong> Sommerhit! +25% Freude</li>
                        <li>🍯 <strong>Honig (12 Münzen):</strong> Süße Belohnung! +20% Münzen</li>
                      </ul>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-green-300">
                      <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                        <span className="text-2xl">⚽</span> 8 Coole Spielzeuge
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li>⚽ <strong>Ball (15 Münzen):</strong> Tiere lieben Spielen! +30% Zufriedenheit</li>
                        <li>🪢 <strong>Kletterseil (20 Münzen):</strong> Affen schwingen freudig! +40%</li>
                        <li>🛁 <strong>Planschbecken (35 Münzen):</strong> Wasserspaß! +50% Freude</li>
                        <li>🌲 <strong>Kletterbaum (30 Münzen):</strong> Attraktion! +30% Münzen</li>
                        <li>🏖️ <strong>Sandkasten (28 Münzen):</strong> Spielerisches Lernen! +25% XP</li>
                        <li>🎯 <strong>10 Spielzeuge:</strong> Ball, Kletterseil, Schaukel, Rutsche, Reifenschaukel, Sandkasten, Hängematte, Klettergerüst, Trampolin, Wippe</li>
                      </ul>

                      <Button
                        onClick={() => setLocation('/image-showcase')}
                        className="mt-4 w-full"
                        variant="outline"
                      >
                        🖼️ Alle Bilder in Galerie anzeigen
                      </Button>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-green-300">
                      <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                        <span className="text-2xl">🌳</span> 12+ Dekorationen
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li>⛲ <strong>Brunnen (30 Münzen):</strong> Besucher werfen Münzen! +10%</li>
                        <li>💧 <strong>Wasserfall (50 Münzen):</strong> Spektakulär! +25% Münzen</li>
                        <li>🌉 <strong>Brücke (40 Münzen):</strong> Fotomotiv! +20 Besucher</li>
                        <li>🏮 <strong>Laterne (20 Münzen):</strong> +10 Abend-Besucher!</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Item-Effekte System */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">✨</div>
                    <div>
                      <h3 className="text-2xl font-bold text-purple-700">Magische Item-Effekte!</h3>
                      <p className="text-purple-600">Items haben echte Auswirkungen auf deinen Zoo!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">💰 Münz-Bonus</h4>
                      <p className="text-sm">Items wie Brunnen, Wasserfall, Gehege erhöhen deine Münzeinnahmen um <strong>10-100%</strong>!</p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">⭐ XP-Bonus</h4>
                      <p className="text-sm">Dschungel, Fische, Spielzeuge geben dir <strong>bis zu +40% XP</strong> beim Lernen!</p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">🦁 Tier-Chance</h4>
                      <p className="text-sm">Gehege und Futter erhöhen die Chance auf <strong>neue Tiere um +50%</strong>!</p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">😊 Zufriedenheit</h4>
                      <p className="text-sm">Glückliche Tiere = mehr Besucher! <strong>Bis zu +100% Bonus</strong>!</p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">👥 Besucher-Boost</h4>
                      <p className="text-sm">Dekorationen locken <strong>+5 bis +50 Besucher</strong> täglich an!</p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4 border border-purple-300">
                      <h4 className="font-semibold text-primary mb-2">🎁 Kombinations-Effekte</h4>
                      <p className="text-sm">Kombiniere Items für <strong>noch stärkere Boni</strong>! Gehege + Futter + Spielzeug = Maximum!</p>
                    </div>
                  </div>
                </div>

                {/* Tiere sammeln */}
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">🦁</div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700">56 Verschiedene Tiere zum Sammeln!</h3>
                      <p className="text-blue-600">Jedes Tier ist einzigartig mit eigenen Fakten!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🏜️ Savanne (9)</p>
                      <p className="text-xs">Löwe, Elefant, Giraffe, Zebra, Nashorn, Nilpferd, Gepard, Hyäne, Strauß</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🌴 Dschungel (8)</p>
                      <p className="text-xs">Affe, Gorilla, Orang-Utan, Tiger, Leopard, Tukan, Papagei, Faultier</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">❄️ Arktis (5)</p>
                      <p className="text-xs">Pinguin, Eisbär, Robbe, Walross, Polarfuchs</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🌊 Ozean (6)</p>
                      <p className="text-xs">Delfin, Hai, Oktopus, Seepferdchen, Schildkröte, Qualle</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🎋 Bambuswald (4)</p>
                      <p className="text-xs">Panda, Roter Panda, Koala, Pfau</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🌸 Wiese (5)</p>
                      <p className="text-xs">Hase, Fuchs, Reh, Igel, Eule</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🏜️ Wüste (4)</p>
                      <p className="text-xs">Kamel, Schlange, Skorpion, Wüstenfuchs</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-blue-300">
                      <p className="font-semibold mb-2">🦅 Vögel (3)</p>
                      <p className="text-xs">Adler, Flamingo, Schwan</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/70 rounded-lg p-4 border border-blue-300">
                    <h4 className="font-semibold mb-2">🎓 Jedes Tier kommt mit Fakten:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>Gewicht & Größe:</strong> Lerne echte Zahlen! (Elefant: 6000 kg, 3 m hoch)</li>
                      <li>• <strong>Ernährung:</strong> Was frisst das Tier? (Panda: 12h täglich Bambus!)</li>
                      <li>• <strong>Besondere Eigenschaft:</strong> Was macht es einzigartig?</li>
                      <li>• <strong>Fun Fact:</strong> Spannende Überraschungen! (Giraffen schlafen nur 30 Min!)</li>
                    </ul>
                  </div>
                </div>

                {/* Badges & Erfolge */}
                <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-5xl">🏆</div>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700">50+ Badges zum Freischalten!</h3>
                      <p className="text-orange-600">Zeige deine Errungenschaften!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/70 rounded p-3 border border-orange-300">
                      <p className="font-semibold">🦁 Tier-Sammlung:</p>
                      <p className="text-xs">Tierfreund (5), Zoo-Enthusiast (10), Tier-Experte (20), Zoo-Meister (30), Vollständige Sammlung (alle 56!)</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-orange-300">
                      <p className="font-semibold">🏛️ Habitat-Spezialist:</p>
                      <p className="text-xs">Savannenkönig, Dschungelforscher, Arktis-Meister, Ozean-Admiral, Wüsten-Nomade, Vogel-Experte</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-orange-300">
                      <p className="font-semibold">💰 Münz-Meister:</p>
                      <p className="text-xs">Sparer (50), Reich (100), Vermögend (500), Milliardär (1000 Münzen!)</p>
                    </div>
                    <div className="bg-white/70 rounded p-3 border border-orange-300">
                      <p className="font-semibold">🎮 Spiel-Champion:</p>
                      <p className="text-xs">Waage-Meister, 10-Champion, Zerlegungs-Experte, Verdopplungs-Profi, Wege-Genie</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Science Tab */}
          <TabsContent value="science" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-achievement" />
                  Wissenschaftliche Fundierung
                </CardTitle>
                <CardDescription>
                  50+ Jahre Forschung in einem System
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Kerntheorien:</h3>

                  <div className="grid gap-4">
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="font-semibold">Bruner (1966): Darstellungsvernetzung</p>
                      <p className="text-sm text-muted-foreground">
                        Enaktiv → Ikonisch → Symbolisch. Mathematik auf 3 Ebenen lernen.
                      </p>
                    </div>

                    <div className="border-l-4 border-learning-teal pl-4 py-2">
                      <p className="font-semibold">Vygotsky (1978): Zone of Proximal Development</p>
                      <p className="text-sm text-muted-foreground">
                        Optimales Lernen zwischen "kann ich allein" und "zu schwer". ZPD-Calculator findet sweet spot.
                      </p>
                    </div>

                    <div className="border-l-4 border-discovery pl-4 py-2">
                      <p className="font-semibold">Sweller (1988): Cognitive Load Theory</p>
                      <p className="text-sm text-muted-foreground">
                        Optimale kognitive Belastung (0.5-0.8). Nicht zu leicht, nicht zu schwer.
                      </p>
                    </div>

                    <div className="border-l-4 border-achievement pl-4 py-2">
                      <p className="font-semibold">Wittmann (1985): Operatives Prinzip</p>
                      <p className="text-sm text-muted-foreground">
                        Mathematik durch systematische Operationen erforschen. Päckchen-Didaktik.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="font-semibold">Fritz & Ricken (2008): Kompetenzstufenmodell</p>
                      <p className="text-sm text-muted-foreground">
                        Empirisch validiertes Entwicklungsmodell. Basis für 54 Kompetenzfelder.
                      </p>
                    </div>

                    <div className="border-l-4 border-learning-teal pl-4 py-2">
                      <p className="font-semibold">Hebb (1949): Hebbian Plasticity</p>
                      <p className="text-sm text-muted-foreground">
                        "Neurons that fire together, wire together". Biologisches Lernen simuliert.
                      </p>
                    </div>

                    <div className="border-l-4 border-discovery pl-4 py-2">
                      <p className="font-semibold">Padberg & Benz (2021): Fehleranalyse</p>
                      <p className="text-sm text-muted-foreground">
                        12 Fehlertypen wissenschaftlich klassifiziert. Basis für Diagnostik.
                      </p>
                    </div>

                    <div className="border-l-4 border-achievement pl-4 py-2">
                      <p className="font-semibold">Finn et al. (2017): Meta-Learning (MAML)</p>
                      <p className="text-sm text-muted-foreground">
                        System lernt, wie du am besten lernst. Learning to learn.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-primary/10 via-learning-teal/10 to-discovery/10 border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Vollständige Referenzliste (Auswahl):</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        <p>• Bruner, J. (1966) - Theory of Instruction</p>
                        <p>• Vygotsky, L. (1978) - Mind in Society</p>
                        <p>• Sweller, J. (1988) - Cognitive Load</p>
                        <p>• Wittmann, E. (1985) - Operatives Prinzip</p>
                        <p>• Fritz, A. & Ricken, G. (2008) - Kompetenzmodell</p>
                        <p>• Hebb, D. (1949) - Organization of Behavior</p>
                        <p>• Bi, G. & Poo, M. (1998) - Synaptic Plasticity</p>
                      </div>
                      <div>
                        <p>• Padberg & Benz (2021) - Didaktik Arithmetik</p>
                        <p>• Gaidoschik, M. (2010) - Rechenschwäche</p>
                        <p>• Krajewski, K. (2003) - Vorläuferfertigkeiten</p>
                        <p>• Lakoff & Núñez (2000) - Embodied Math</p>
                        <p>• Tononi & Cirelli (2014) - Sleep Homeostasis</p>
                        <p>• Finn et al. (2017) - MAML</p>
                        <p>• Dietterich, T. (2000) - Ensemble Methods</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="border-t mt-12 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-2 text-lg">Impressum</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-primary">MatheZoo</p>
                  <p>Remo Stiefel</p>
                  <p>
                    <a href="mailto:lerncare@gmail.com" className="hover:text-primary">
                      lerncare@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-lg">Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  Die Nutzung von MatheZoo erfolgt auf eigene Verantwortung. Wir übernehmen keine Haftung für
                  Lernergebnisse oder technische Ausfälle. Alle Inhalte sind urheberrechtlich geschützt.
                </p>
              </div>
            </div>
            <div className="border-t border-muted pt-4">
              <p className="text-center text-sm text-muted-foreground">
                © 2025 MatheZoo · Remo Stiefel · Alle Rechte vorbehalten
              </p>
            </div>
          </div>
        </footer>

        {/* Footer Stats - 2025 Update */}
        <Card className="bg-gradient-to-br from-primary/5 via-learning-teal/5 to-discovery/5 border-2 mt-12">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">~18.000</div>
                <div className="text-xs text-muted-foreground mt-1">Zeilen Code</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-learning-teal">56</div>
                <div className="text-xs text-muted-foreground mt-1">Sammelbare Tiere</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-discovery">120+</div>
                <div className="text-xs text-muted-foreground mt-1">Zoo-Shop Items</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-achievement">6</div>
                <div className="text-xs text-muted-foreground mt-1">Spiele verfügbar</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">100%</div>
                <div className="text-xs text-muted-foreground mt-1">Fehlerfreie Arithmetik</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fantastische Schlussbemerkung */}
        <Card className="bg-gradient-to-r from-yellow-100 via-green-100 via-blue-100 to-purple-100 border-4 border-rainbow animate-pulse mt-12">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🌟✨🎉🦁🎪🧮</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-learning-teal via-discovery to-achievement bg-clip-text text-transparent">
                Ein System, das Mathematik zum Leben erweckt!
              </h2>
              <div className="max-w-4xl mx-auto space-y-3 text-lg">
                <p className="font-semibold text-primary">
                  🎯 MatheZoo verbindet <strong>wissenschaftliche Exzellenz</strong> mit <strong>spielerischer Motivation</strong>!
                </p>
                <p className="text-muted-foreground">
                  Kinder lernen nicht nur <strong>rechnen</strong> - sie erforschen die Welt der <strong>Zahlen</strong>,
                  sammeln <strong>56 exotische Tiere</strong>, bauen ihren <strong>eigenen Zoo</strong>,
                  und erleben <strong>Mathematik als Abenteuer</strong>! 🚀
                </p>
                <p className="text-muted-foreground">
                  Mit jedem gelösten Problem wächst nicht nur ihr <strong>mathematisches Verständnis</strong>,
                  sondern auch ihr <strong>virtueller Zoo</strong> - ein lebendiger Beweis ihres <strong>Erfolgs</strong>!
                </p>
                <p className="font-semibold text-discovery">
                  🌈 Von der <strong>Zahlenwaage</strong> über <strong>intelligente KI</strong> bis zum <strong>Zoo-Shop</strong>:
                  Jedes Detail ist designed, um <strong>Freude am Lernen</strong> zu wecken!
                </p>
                <div className="flex items-center justify-center gap-6 pt-4 text-4xl">
                  <span title="Wissenschaftlich fundiert">🎓</span>
                  <span title="KI-gestützt">🧠</span>
                  <span title="Individuell adaptiv">🎯</span>
                  <span title="Spielerisch motivierend">🎮</span>
                  <span title="Zoo-Belohnungen">🦁</span>
                  <span title="Münzen sammeln">💰</span>
                  <span title="Tiere retten">🐘</span>
                  <span title="Erfolge feiern">🏆</span>
                </div>
                <p className="text-2xl font-bold text-achievement pt-4">
                  Willkommen im Mathe-Zoo - Wo Zahlen lebendig werden! 🎪✨
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}