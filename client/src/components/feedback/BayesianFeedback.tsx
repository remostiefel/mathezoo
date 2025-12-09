import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Brain, Clock, Target, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BayesianFeedbackProps {
  studentId: number;
  className?: string;
  result: {
    isCorrect: boolean;
    correctAnswer: string | number;
  };
  onContinue: () => void;
  onRetry: () => void;
  errorAnalysis?: {
    description: string;
    pedagogicalHint: string;
    errorType: string;
    errorSeverity: string;
    examples?: string[];
  };
}

interface ZPDLevel {
  level: string;
  probability: number;
  change?: number;
}

// Hilfsfunktionen für heilpädagogische Fehleranalyse
const getErrorTypeLabel = (errorType: string): string => {
  const labels: Record<string, string> = {
    'counting_error_minus_1': 'Zählfehler: 1 zu wenig',
    'counting_error_plus_1': 'Zählfehler: 1 zu viel',
    'counting_error_minus_2': 'Zählfehler: 2 zu wenig',
    'counting_error_plus_2': 'Zählfehler: 2 zu viel',
    'operation_confusion': 'Zeichen verwechselt (±)',
    'input_error': 'Tippfehler/Vertippt',
    'place_value': 'Zehner-Einer-Problem',
    'off_by_ten_minus': '10 zu wenig',
    'off_by_ten_plus': '10 zu viel',
    'doubling_error': 'Kernaufgaben-Fehler',
    'digit_reversal': 'Zahlendreher',
    'other': 'Weitere Fehler'
  };
  return labels[errorType] || errorType;
};

const getSeverityBadge = (severity: string): string => {
  const badges: Record<string, string> = {
    'minor': '🟢 Gering',
    'moderate': '🟡 Mittel',
    'severe': '🔴 Hoch'
  };
  return badges[severity] || severity;
};

const getInterventions = (errorType: string): string[] => {
  const interventions: Record<string, string[]> = {
    'counting_error_minus_1': [
      'Kernaufgaben automatisieren (Blitzrechnen)',
      'Zwanzigerfeld zur Visualisierung nutzen',
      'Strategien statt Zählen fördern (Kraft der 5)'
    ],
    'counting_error_plus_1': [
      'Genaueres Zählen mit Stoppkontrolle üben',
      'Kernaufgaben automatisieren',
      'Rechenstrategien statt zählendes Rechnen'
    ],
    'counting_error_minus_2': [
      'DRINGEND: Intensivtraining im ZR 10',
      'Material: Zwanzigerfeld, Rechenkette',
      'Strategien statt Zählen fördern'
    ],
    'counting_error_plus_2': [
      'DRINGEND: Intensivtraining im ZR 10',
      'Material: Zwanzigerfeld, Rechenkette',
      'Kleinere Schritte: erst ZR 10 festigen'
    ],
    'operation_confusion': [
      'Operation vor Rechnen benennen lassen',
      'Visuelle Unterscheidung: + grün, − rot',
      'Aufmerksames Lesen üben'
    ],
    'input_error': [
      'Selbstkontrolle fördern ("Ergebnis nochmal prüfen")',
      'Kein konzeptioneller Förderbedarf',
      'Nur Sorgfalt trainieren'
    ],
    'place_value': [
      'Dienes-Blöcke oder Hunderterfeld nutzen',
      'Zehner und Einer getrennt rechnen',
      'Stellenwerttafel einsetzen'
    ],
    'off_by_ten_minus': [
      'Zahlen in Zehner + Einer zerlegen (23 = 20+3)',
      'Rechenketten mit farbigen Zehnern',
      'Hunderterfeld zur Visualisierung'
    ],
    'off_by_ten_plus': [
      'Systematisches Zerlegen üben',
      'Kontrollfragen: "Macht das Sinn?"',
      'Hunderterfeld nutzen'
    ],
    'doubling_error': [
      'Kernaufgaben rhythmisch üben (6+6, 7+7)',
      'Memory-Spiel mit Verdopplungen',
      'Zusammenhang Verdoppeln ↔ Halbieren'
    ],
    'digit_reversal': [
      'Zahlen laut vorlesen lassen',
      'Leserichtung betonen (links → rechts)',
      'Bei häufigem Auftreten: visuelle Wahrnehmung prüfen'
    ],
    'other': [
      'Kind beim Rechnen beobachten',
      'Lösungsweg erklären lassen',
      'Diagnostisches Gespräch führen'
    ]
  };
  return interventions[errorType] || ['Individuelle Beobachtung empfohlen'];
};

const getDidacticContext = (errorType: string): string => {
  const contexts: Record<string, string> = {
    'counting_error_minus_1': 'Zählendes Rechnen sollte überwunden werden. Kind nutzt noch ineffiziente Zählstrategie.',
    'counting_error_plus_1': 'Zeigt Abhängigkeit vom zählenden Rechnen. Übergang zu Rechenstrategien nötig.',
    'counting_error_minus_2': 'Größerer Zählfehler deutet auf fundamentale Unsicherheit. Dringende Förderung nötig.',
    'counting_error_plus_2': 'Größerer Zählfehler deutet auf fundamentale Unsicherheit. Dringende Förderung nötig.',
    'operation_confusion': 'Aufmerksamkeits- oder Zeichenverständnisproblem. Möglicherweise zu schnelles Arbeiten.',
    'input_error': 'Kein konzeptioneller Fehler. Motorik oder Aufmerksamkeit, keine mathematische Förderung nötig.',
    'place_value': 'Stellenwertverständnis noch nicht gefestigt. Fundamentales Konzept für weiteres Rechnen.',
    'off_by_ten_minus': 'Problem beim Umgang mit Zehnern. Bündelungsverständnis fehlt oder ist unsicher.',
    'off_by_ten_plus': 'Zehner werden doppelt gezählt oder falsch verarbeitet. Systematisches Vorgehen fehlt.',
    'doubling_error': 'Kernaufgaben (Automatisierung) fehlt. Diese sind Basis für viele Rechenstrategien.',
    'digit_reversal': 'Zahlen werden spiegelverkehrt gelesen/geschrieben. Ggf. visuelle Wahrnehmung überprüfen.',
    'other': 'Fehlermuster nicht eindeutig. Individuelle Diagnose durch Beobachtung und Gespräch nötig.'
  };
  return contexts[errorType] || 'Fehlertyp erfordert individuelle Analyse.';
};

export function BayesianFeedback({
  studentId,
  className,
  result,
  onContinue,
  onRetry,
  errorAnalysis
}: BayesianFeedbackProps) {
  const [zpdData, setZpdData] = useState<ZPDLevel[]>([
    { level: "Frustration", probability: 0.15, change: -0.05 },
    { level: "Zone of Proximal Development", probability: 0.65, change: 0.10 },
    { level: "Independent", probability: 0.20, change: -0.05 },
  ]);

  const [metrics, setMetrics] = useState({
    accuracy: 75,
    strategyDiversity: 3,
    averageTime: 45,
  });

  useEffect(() => {
    // In production, fetch live ZPD updates from backend
    const interval = setInterval(() => {
      // Simulate Bayesian update
      setZpdData(prev => prev.map(level => ({
        ...level,
        change: (Math.random() - 0.5) * 0.1,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [studentId]);

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-achievement" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3" />;
  };

  const getZoneColor = (level: string) => {
    if (level.includes("Frustration")) return "bg-destructive/20 border-destructive";
    if (level.includes("Zone")) return "bg-learning-teal/20 border-learning-teal";
    if (level.includes("Independent")) return "bg-achievement/20 border-achievement";
    return "bg-muted";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* ZPD Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Zone of Proximal Development</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="text-xs">
            Bayesian-basierte Echtzeitanalyse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {zpdData.map((level, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{level.level}</span>
                  {getTrendIcon(level.change)}
                </div>
                <span className="text-muted-foreground">
                  {(level.probability * 100).toFixed(0)}%
                </span>
              </div>
              <Progress
                value={level.probability * 100}
                className={cn("h-2", getZoneColor(level.level))}
                data-testid={`progress-zpd-${level.level.toLowerCase().replace(/\s/g, '-')}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-3">
            <div className="text-center space-y-1">
              <Target className="h-5 w-5 mx-auto text-primary" />
              <div className="text-xl font-bold">{metrics.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Genauigkeit</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-4 pb-3">
            <div className="text-center space-y-1">
              <Brain className="h-5 w-5 mx-auto text-learning-teal" />
              <div className="text-xl font-bold">{metrics.strategyDiversity}</div>
              <div className="text-xs text-muted-foreground">Strategien</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-4 pb-3">
            <div className="text-center space-y-1">
              <Clock className="h-5 w-5 mx-auto text-discovery" />
              <div className="text-xl font-bold">{metrics.averageTime}s</div>
              <div className="text-xs text-muted-foreground">Ø Zeit</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adaptive Recommendation */}
      <Card className="bg-gradient-to-br from-learning-teal/10 to-primary/10 border-learning-teal/30">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-learning-teal/20 flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-learning-teal" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Empfehlung</p>
              <p className="text-xs text-muted-foreground">
                Bleib in der ZPD! Versuche Nachbaraufgaben für tieferes Verständnis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Feedback */}
      {!result.isCorrect && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            <span className="text-lg font-semibold">Nicht ganz richtig</span>
          </div>

          <p className="text-base">
            Die richtige Antwort ist <strong className="text-2xl">{result.correctAnswer}</strong>
          </p>

          {errorAnalysis && (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900 text-lg mb-2">
                      {errorAnalysis.description}
                    </p>
                    <p className="text-orange-800 text-base">
                      {errorAnalysis.pedagogicalHint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heilpädagogische Fehleranalyse für Lehrpersonen */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-semibold text-blue-900 text-base">
                    Für Mathedidaktiker & Heilpädagogen
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">
                      📊 Fehlertyp: {getErrorTypeLabel(errorAnalysis.errorType)}
                    </p>
                    <p className="text-blue-800 text-xs">
                      Schweregrad: {getSeverityBadge(errorAnalysis.errorSeverity)}
                    </p>
                  </div>

                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">🎯 Konkrete Fördermaßnahmen:</p>
                    <ul className="text-blue-800 text-xs space-y-1 ml-4 list-disc">
                      {getInterventions(errorAnalysis.errorType).map((intervention, idx) => (
                        <li key={idx}>{intervention}</li>
                      ))}
                    </ul>
                  </div>

                  {errorAnalysis.examples && errorAnalysis.examples.length > 0 && (
                    <div className="bg-white rounded p-3 border border-blue-200">
                      <p className="font-medium text-blue-900 mb-1">💡 Typische Beispiele:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {errorAnalysis.examples.slice(0, 3).map((example, idx) => (
                          <code key={idx} className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded font-mono">
                            {example}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">📖 Didaktische Einordnung:</p>
                    <p className="text-blue-800 text-xs">
                      {getDidacticContext(errorAnalysis.errorType)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={onContinue}
            className="w-full text-lg py-6"
            variant="default"
          >
            Weiter üben
          </Button>
        </div>
      )}
    </div>
  );
}