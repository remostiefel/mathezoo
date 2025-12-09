
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface GameRecommendationCardProps {
  errorType: string;
  errorLabel: string;
  recommendation: {
    gameId: string;
    gameName: string;
    emoji: string;
    recommendedLevel: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    zooStory?: string;
    exampleTask?: string;
    childExplanation?: string;
  };
  errorCount: number;
  onDismiss?: () => void;
}

export function GameRecommendationCard({
  errorType,
  errorLabel,
  recommendation,
  errorCount,
  onDismiss
}: GameRecommendationCardProps) {
  const [, setLocation] = useLocation();

  const priorityColors = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-yellow-500 to-amber-500',
    low: 'from-blue-500 to-cyan-500'
  };

  const gameRoutes: Record<string, string> = {
    'zahlenwaage': '/game',
    'ten-wins': '/ten-wins-game',
    'number-stairs': '/number-stairs',
    'number-builder': '/number-builder',
    'decomposition': '/decomposition-safari',
    'doubling': '/doubling-expedition',
    'zoo-adventure': '/zoo-adventure',
    'pathfinder': '/zoo-pathfinder',
    'neighbors': '/neighbor-game'
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${priorityColors[recommendation.priority]} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-6 w-6" />
            <div>
              <CardTitle className="text-lg">Empfohlenes Spiel</CardTitle>
              <CardDescription className="text-white/90 text-sm">
                {errorCount} ähnliche Fehler erkannt
              </CardDescription>
            </div>
          </div>
          {recommendation.priority === 'high' && (
            <Badge className="bg-white text-red-600 font-bold">
              PRIORITÄT
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{recommendation.emoji}</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{recommendation.gameName}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Fehlertyp:</strong> {errorLabel}
            </p>
            <p className="text-sm text-foreground">
              {recommendation.reason}
            </p>
          </div>
        </div>

        {/* Zoo-Geschichte */}
        {recommendation.zooStory && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
            <p className="text-sm text-blue-900 leading-relaxed">
              {recommendation.zooStory}
            </p>
          </div>
        )}

        {/* Kindgerechte Erklärung */}
        {recommendation.childExplanation && (
          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
            <p className="text-sm font-medium text-purple-900 mb-1">
              💡 So funktioniert es:
            </p>
            <p className="text-sm text-purple-800 leading-relaxed">
              {recommendation.childExplanation}
            </p>
          </div>
        )}

        {/* Beispielaufgabe */}
        {recommendation.exampleTask && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
            <p className="text-sm font-medium text-green-900 mb-1">
              📝 {recommendation.exampleTask}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Level {recommendation.recommendedLevel} empfohlen</span>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => {
              setLocation(`${gameRoutes[recommendation.gameId]}?level=${recommendation.recommendedLevel}`);
            }}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Jetzt spielen
          </Button>
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Später
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
