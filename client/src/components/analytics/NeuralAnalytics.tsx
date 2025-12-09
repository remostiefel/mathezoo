/**
 * NeuralAnalytics - Visualization of Brain-Inspired Progression System
 * 
 * Shows:
 * - 44-neuron network activation
 * - Ensemble predictor statistics
 * - Placeholder performance
 * - Memory traces
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Activity, Zap, Target, TrendingUp } from "lucide-react";

interface NeuralAnalyticsProps {
  userId: string;
}

export function NeuralAnalytics({ userId }: NeuralAnalyticsProps) {
  
  // Fetch neural analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/neural/analytics', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/neural/analytics/${userId}`);
      return await response.json();
    }
  });
  
  // Fetch ensemble stats
  const { data: ensembleStats } = useQuery({
    queryKey: ['/api/neural/ensemble-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/neural/ensemble-stats');
      return await response.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  
  if (!analytics) {
    return <div data-testid="text-no-data">Keine Daten verfügbar</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Neuronale Analyse (BPS 3.0)</h2>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-performance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Gesamtleistung</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-accuracy">
              {(analytics.accuracy * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalTasks} Aufgaben gelöst
            </p>
            <Progress value={analytics.accuracy * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card data-testid="card-streak">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Aktueller Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-streak">
              {analytics.currentStreak}
            </div>
            <p className="text-xs text-muted-foreground">
              Korrekt in Folge
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-zpd">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">ZPD-Dimensionen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>RML:</span>
                <Badge variant="outline" data-testid="badge-rml">{(analytics.rml * 100).toFixed(0)}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>CLA:</span>
                <Badge variant="outline" data-testid="badge-cla">{(analytics.cla * 100).toFixed(0)}%</Badge>
              </div>
              <div className="flex justify-between">
                <span>SMI:</span>
                <Badge variant="outline" data-testid="badge-smi">{(analytics.smi * 100).toFixed(0)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder Performance */}
      {analytics.placeholderPerformance && Object.keys(analytics.placeholderPerformance).length > 0 && (
        <Card data-testid="card-placeholder-performance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Platzhalter-Leistung (Algebraisches Denken)
            </CardTitle>
            <CardDescription>
              Performance bei unterschiedlichen Platzhalter-Positionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {['start', 'middle', 'end'].map((position) => {
                const perf = analytics.placeholderPerformance[position];
                if (!perf || perf.attempted === 0) return null;
                
                const successRate = (perf.correct / perf.attempted) * 100;
                const difficulty = position === 'start' ? 'Sehr schwer' : position === 'middle' ? 'Mittel' : 'Einfach';
                
                return (
                  <div key={position} className="space-y-2" data-testid={`placeholder-${position}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{position}</span>
                      <Badge variant="outline">{difficulty}</Badge>
                    </div>
                    <Progress value={successRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{successRate.toFixed(0)}% Erfolg</span>
                      <span>{perf.attempted} Versuche</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ⌀ {perf.avgTime.toFixed(0)}s pro Aufgabe
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ensemble Predictor Stats */}
      {ensembleStats && (
        <Card data-testid="card-ensemble-stats">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              KI-Ensemble-Modelle
            </CardTitle>
            <CardDescription>
              5 konkurrierende Vorhersage-Modelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ensembleStats.map((model: any) => (
                <div key={model.name} className="space-y-1" data-testid={`model-${model.name.toLowerCase()}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{model.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" data-testid={`badge-weight-${model.name.toLowerCase()}`}>
                        Gewicht: {model.weight.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-accuracy-${model.name.toLowerCase()}`}>
                        {(model.accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={model.accuracy * 100} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Performance */}
      <Card data-testid="card-recent-performance">
        <CardHeader>
          <CardTitle>Letzte Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {analytics.recentPerformance?.slice(0, 10).map((task: any, idx: number) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  task.correct 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
                title={`${task.taskType} - ${task.time}s${task.placeholder !== 'none' ? ' (Platzhalter)' : ''}`}
                data-testid={`task-result-${idx}`}
              >
                {task.correct ? '✓' : '✗'}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Grün = Korrekt, Rot = Falsch
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
