import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, TrendingUp, TrendingDown, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProblemStats {
  problem: string;
  averageTime: number;
  successRate: number;
  totalAttempts: number;
  placeholderPosition?: string;
  operation?: string;
  number1?: number;
  number2?: number;
  correctAnswer?: number;
}

interface Summary {
  totalProblems: number;
  totalAttempts: number;
  averageSuccessRate: number;
  averageTime: number;
  slowestProblems: ProblemStats[];
  mostDifficultProblems: ProblemStats[];
}

interface ProblemStatisticsViewProps {
  summary: Summary;
}

export function ProblemStatisticsView({ summary }: ProblemStatisticsViewProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const formatProblem = (prob: ProblemStats): string => {
    // If problem string already contains placeholder or equals sign, use it directly
    if (prob.problem.includes('_') || prob.problem.includes('=')) {
      return prob.problem;
    }

    // Otherwise construct from components if available
    if (prob.placeholderPosition && prob.operation && prob.number1 !== undefined && prob.number2 !== undefined && prob.correctAnswer !== undefined) {
      const op = prob.operation === '+' ? '+' : '−';

      if (prob.placeholderPosition === 'start') {
        return `_ ${op} ${prob.number2} = ${prob.correctAnswer}`;
      } else if (prob.placeholderPosition === 'middle') {
        return `${prob.number1} ${op} _ = ${prob.correctAnswer}`;
      } else if (prob.placeholderPosition === 'end') {
        return `${prob.number1} ${op} ${prob.number2} = _`;
      }
    }

    // Fallback to original format
    return prob.problem;
  };

  // Helper function to format problem text for display, assuming it might be used elsewhere
  // This function is not directly used in the provided snippet but is inferred from the changes.
  // If it exists, it should be defined or modified. If not, the changes might be malformed.
  const formatProblemText = (prob: ProblemStats): string => {
    return formatProblem(prob);
  };


  return (
    <div className="space-y-6" data-testid="problem-statistics-view">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-problems">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gesamt Aufgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-problems">
              {summary.totalProblems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalAttempts} Versuche insgesamt
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Durchschn. Erfolgsrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-success">
              {(summary.averageSuccessRate * 100).toFixed(1)}%
            </div>
            <Progress
              value={summary.averageSuccessRate * 100}
              className="mt-2"
              data-testid="progress-avg-success"
            />
          </CardContent>
        </Card>

        <Card data-testid="card-avg-time">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Durchschn. Zeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold" data-testid="text-avg-time">
                {formatTime(summary.averageTime)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              pro Aufgabe
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completion">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Abschlussrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold" data-testid="text-completion">
                {summary.totalProblems > 0
                  ? ((summary.totalAttempts / summary.totalProblems) * 100).toFixed(0)
                  : 0}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              im Durchschnitt
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-slowest-problems">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Langsamste Aufgaben
            </CardTitle>
            <CardDescription>
              Top 10 Aufgaben mit der längsten durchschnittlichen Lösungszeit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.slowestProblems.length > 0 ? (
                summary.slowestProblems.map((prob, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`slowest-problem-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xl">
                        {formatProblem(prob)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {prob.totalAttempts} Versuche
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold" data-testid={`slowest-time-${idx}`}>
                        {formatTime(prob.averageTime)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Noch keine Daten verfügbar
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-difficult-problems">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Schwierigste Aufgaben
            </CardTitle>
            <CardDescription>
              Top 10 Aufgaben mit der niedrigsten Erfolgsrate (min. 5 Versuche)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.mostDifficultProblems.length > 0 ? (
                summary.mostDifficultProblems.map((prob, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`difficult-problem-${idx}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xl">
                        {formatProblem(prob)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {prob.totalAttempts} Versuche
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={prob.successRate * 100}
                        className="w-20"
                        data-testid={`difficult-progress-${idx}`}
                      />
                      <span
                        className={`font-semibold ${
                          prob.successRate < 0.5 ? 'text-destructive' :
                          prob.successRate < 0.7 ? 'text-orange-500' :
                          'text-green-500'
                        }`}
                        data-testid={`difficult-rate-${idx}`}
                      >
                        {(prob.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Noch keine Daten verfügbar (benötigt min. 5 Versuche pro Aufgabe)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}