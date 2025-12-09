import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Award,
  CheckCircle,
  Loader2,
  Download,
  Activity // Added Activity icon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationResult {
  tasks: Array<{
    taskNumber: number;
    taskString: string;
    competencies: string[];
    difficulty: string;
    masteryStatus: {
      attempts: number;
      correct: number;
      mastered: boolean;
    };
  }>;
  milestones: Array<{
    taskNumber: number;
    competency: string;
    competencyName: string;
    description: string;
  }>;
  competencyProgress: Map<string, {
    firstSeen: number;
    mastered: number | null;
    totalAttempts: number;
    successRate: number;
  }>;
  summary: {
    totalTasks: number;
    competenciesMastered: number;
    averageAttemptsToMastery: number;
  };
}

// Interface for Progressive Mastery Results
interface ProgressiveMasteryResult {
  progressiveData: Array<{
    competenciesMastered: number;
    tasksRequired: number;
    competencyName: string;
  }>;
  summary: {
    totalCompetencies: number;
    tasksForAllCompetencies: number;
    averageTasksPerCompetency: number;
  };
}

// Interface for Representation Testing Results
interface RepresentationSimResult {
  result: {
    tasks: Array<{
      taskNumber: number;
      isSingleRepTest: boolean;
      testedRepresentation?: string;
      taskString: string;
      activeRepresentations: string[];
      masterySnapshot: Record<string, { soloMastery: number; soloTests: number }>;
    }>;
    milestones: Array<{
      taskNumber: number;
      type: string;
      representation?: string;
      description: string;
    }>;
    finalMastery: Record<string, {
      soloTestsAttempted: number;
      soloTestsCorrect: number;
      mastery: number;
      consecutiveCorrectSolo: number;
      needsMoreTesting: boolean;
      firstTestedAlone: string | null;
      lastTestedAlone: string | null;
    }>;
    summary: {
      totalTasks: number;
      singleRepTests: number;
      multiRepTasks: number;
      representationsMastered: number;
      finalStage: number;
      baselineTestingCompleted: boolean;
    };
  };
  report: string;
}

const COMPETENCY_LABELS: Record<string, string> = {
  addition_ZR10_no_transition: "Addition ZR10 ohne Übergang",
  subtraction_ZR10_no_transition: "Subtraktion ZR10 ohne Übergang",
  addition_to_10: "Ergänzen zur 10",
  subtraction_from_10: "Abziehen von 10",
  addition_ZR20_no_transition: "Addition ZR20 ohne Übergang",
  subtraction_ZR20_no_transition: "Subtraktion ZR20 ohne Übergang",
  addition_with_transition: "Addition mit Übergang",
  subtraction_with_transition: "Subtraktion mit Übergang",
  placeholder_end: "Platzhalter am Ende",
  placeholder_middle: "Platzhalter in der Mitte",
  placeholder_start: "Platzhalter am Anfang",
  doubles: "Verdoppeln",
  near_doubles: "Fast-Verdoppeln"
};

export default function SimulationViewer() {
  const [numTasks, setNumTasks] = useState(100);
  const [customTaskCount, setCustomTaskCount] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'simulation' | 'progressive' | 'representation'>('simulation'); // State to toggle between views
  const [repTasks, setRepTasks] = useState(30);

  // Query for standard simulation results
  const { data, isLoading, refetch } = useQuery<{
    result: SimulationResult;
    report: string;
    timestamp: string;
  }>({
    queryKey: ["/api/simulation/perfect-path", { numTasks }],
    queryFn: async () => {
      const response = await fetch(`/api/simulation/perfect-path?numTasks=${numTasks}`);
      if (!response.ok) {
        throw new Error('Failed to fetch simulation');
      }
      return response.json();
    },
    enabled: false,
  });

  // Query for progressive mastery results
  const { data: progressiveData, isLoading: isProgressiveLoading, refetch: refetchProgressive } = useQuery<ProgressiveMasteryResult>({
    queryKey: ["/api/simulation/progressive-mastery"],
    queryFn: async () => {
      const response = await fetch('/api/simulation/progressive-mastery');
      if (!response.ok) {
        throw new Error('Failed to fetch progressive mastery data');
      }
      return response.json();
    },
    enabled: false, // Initially disabled, will be enabled when viewMode changes
  });

  // Query for representation testing results
  const { data: representationData, isLoading: isRepresentationLoading, refetch: refetchRepresentation } = useQuery<RepresentationSimResult>({
    queryKey: ["/api/simulation/representation-path", { repTasks }],
    queryFn: async () => {
      const response = await fetch(`/api/simulation/representation-path?numTasks=${repTasks}`);
      if (!response.ok) {
        throw new Error('Failed to fetch representation simulation');
      }
      return response.json();
    },
    enabled: false,
  });

  const handleRunSimulation = async () => {
    setIsRunning(true);
    await refetch();
    setIsRunning(false);
  };

  const handleRunProgressiveSimulation = async () => {
    setIsRunning(true); // Use isRunning for both loading states
    await refetchProgressive();
    setIsRunning(false);
  };

  const handleRunRepresentationSimulation = async () => {
    setIsRunning(true);
    await refetchRepresentation();
    setIsRunning(false);
  };

  const handleDownloadReport = () => {
    if (!data?.report) return;

    const blob = new Blob([data.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Convert Map to Array for rendering
  const competencyProgressArray = data?.result ? 
    Array.from(Object.entries(data.result.competencyProgress || {}))
      .map(([key, value]: [string, any]) => [key, value])
      .sort((a: any, b: any) => a[1].firstSeen - b[1].firstSeen) : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/teacher'}
              className="flex items-center gap-2"
            >
              ← Zurück zum Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lernpfad-Simulation</h1>
              <p className="text-muted-foreground mt-1">
                Null-Fehler-Weg durch das kompetenzbasierte System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                window.location.href = '/login';
              }}
              data-testid="button-logout"
            >
              Abmelden
            </Button>
            {/* Toggle between simulation types */}
            <Tabs defaultValue="simulation" className="flex items-center gap-2">
              <TabsList>
                <TabsTrigger 
                  value="simulation" 
                  onClick={() => setViewMode('simulation')}
                  data-testid="tab-standard-simulation"
                >
                  Kompetenzen
                </TabsTrigger>
                <TabsTrigger 
                  value="progressive" 
                  onClick={() => {
                    setViewMode('progressive');
                    if (!progressiveData) {
                      handleRunProgressiveSimulation();
                    }
                  }}
                  data-testid="tab-progressive-mastery"
                >
                  Progressive
                </TabsTrigger>
                <TabsTrigger 
                  value="representation" 
                  onClick={() => {
                    setViewMode('representation');
                    if (!representationData) {
                      handleRunRepresentationSimulation();
                    }
                  }}
                  data-testid="tab-representation-testing"
                >
                  Darstellungen
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Controls for Standard Simulation */}
            {viewMode === 'simulation' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Anzahl Aufgaben:</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={customTaskCount || numTasks}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomTaskCount(value);
                    if (value && !isNaN(Number(value))) {
                      setNumTasks(Number(value));
                    }
                  }}
                  onBlur={() => {
                    if (!customTaskCount || isNaN(Number(customTaskCount))) {
                      setCustomTaskCount("");
                      setNumTasks(100);
                    }
                  }}
                  className="border rounded px-3 py-2 w-32"
                  placeholder="z.B. 500"
                  disabled={isRunning || isLoading}
                />
                <div className="flex gap-1">
                  {[100, 200, 500, 800, 1000, 1500, 2000].map((count) => (
                    <Button
                      key={count}
                      variant={numTasks === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setNumTasks(count);
                        setCustomTaskCount("");
                      }}
                      disabled={isRunning || isLoading}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Controls for Representation Simulation */}
            {viewMode === 'representation' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Anzahl Aufgaben:</label>
                <div className="flex gap-1">
                  {[30, 50, 100, 200].map((count) => (
                    <Button
                      key={count}
                      variant={repTasks === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRepTasks(count)}
                      disabled={isRunning || isRepresentationLoading}
                      data-testid={`button-rep-tasks-${count}`}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Run Simulation Button */}
            <Button 
              onClick={() => {
                if (viewMode === 'simulation') handleRunSimulation();
                else if (viewMode === 'progressive') handleRunProgressiveSimulation();
                else if (viewMode === 'representation') handleRunRepresentationSimulation();
              }}
              disabled={isRunning || isLoading || isProgressiveLoading || isRepresentationLoading}
              size="lg"
              data-testid="button-run-simulation"
            >
              {isRunning || isLoading || isProgressiveLoading || isRepresentationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulation läuft...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  {viewMode === 'simulation' && 'Simulation starten'}
                  {viewMode === 'progressive' && 'Progressive starten'}
                  {viewMode === 'representation' && 'Rep-Testing starten'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progressive Mastery Results */}
        {viewMode === 'progressive' && progressiveData && (
          <div className="space-y-6">
            {/* Summary Cards for Progressive Mastery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Gesamt Kompetenzen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {progressiveData.summary.totalCompetencies}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">im System verfügbar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Aufgaben für alle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {progressiveData.summary.tasksForAllCompetencies}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">bis alle gemeistert sind</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    Ø pro Kompetenz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {progressiveData.summary.averageTasksPerCompetency}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Aufgaben</p>
                </CardContent>
              </Card>
            </div>

            {/* Progressive Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Progressive Kompetenz-Meisterung
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Wie viele Aufgaben werden für N gemeisterte Kompetenzen benötigt?
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[600px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold">Kompetenzen gemeistert</th>
                        <th className="text-left p-3 font-semibold">Aufgaben benötigt</th>
                        <th className="text-left p-3 font-semibold">Letzte gemeisterte Kompetenz</th>
                        <th className="text-right p-3 font-semibold">Δ Aufgaben</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressiveData.progressiveData.map((item, index) => {
                        const previousTasks = index > 0 
                          ? progressiveData.progressiveData[index - 1].tasksRequired 
                          : 0;
                        const delta = item.tasksRequired - previousTasks;

                        return (
                          <tr 
                            key={index} 
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3">
                              <span className="font-bold text-lg">{item.competenciesMastered}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                / {progressiveData.summary.totalCompetencies}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-primary">
                                {item.tasksRequired}
                              </span>
                            </td>
                            <td className="p-3 text-sm">
                              {item.competencyName}
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-sm text-muted-foreground">
                                +{delta}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Representation Testing Results */}
        {viewMode === 'representation' && representationData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Aufgaben gesamt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{representationData.result.summary.totalTasks}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    Solo-Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {representationData.result.summary.singleRepTests}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({Math.round((representationData.result.summary.singleRepTests / representationData.result.summary.totalTasks) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    Multi-Rep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {representationData.result.summary.multiRepTasks}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({Math.round((representationData.result.summary.multiRepTasks / representationData.result.summary.totalTasks) * 100)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    Gemeistert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {representationData.result.summary.representationsMastered}/4
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Darstellungen</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Baseline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {representationData.result.summary.baselineTestingCompleted ? '✓' : '...'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {representationData.result.summary.baselineTestingCompleted ? 'Komplett' : 'In Arbeit'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mastery Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Darstellungs-Mastery (Solo-Tests)
                </CardTitle>
                <CardDescription>
                  Nur Solo-Tests zählen für Mastery-Tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(representationData.result.finalMastery).map(([rep, data]) => {
                    const isMastered = data.mastery >= 80;
                    return (
                      <Card key={rep} className={isMastered ? 'border-green-500' : ''}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm capitalize flex items-center justify-between">
                            {rep}
                            {isMastered && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Mastery</span>
                              <span className="text-lg font-bold text-primary">{data.mastery}%</span>
                            </div>
                            <Progress value={data.mastery} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              {data.soloTestsAttempted} Solo-Tests
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            {representationData.result.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Meilensteine</CardTitle>
                  <CardDescription>Wichtige Ereignisse im Lernpfad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {representationData.result.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <div className="text-lg font-bold text-primary">
                            {milestone.taskNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">Task</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize text-sm mb-1">
                            {milestone.representation || milestone.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {milestone.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle>Aufgaben-Sequenz</CardTitle>
                <CardDescription>
                  Solo-Tests (🔍) vs. Multi-Rep Aufgaben (🔢)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead className="w-24">Typ</TableHead>
                        <TableHead>Darstellungen</TableHead>
                        <TableHead>Aufgabe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {representationData.result.tasks.map((task) => (
                        <TableRow key={task.taskNumber} className={task.isSingleRepTest ? 'bg-blue-50 dark:bg-blue-950/20' : ''}>
                          <TableCell className="font-medium">{task.taskNumber}</TableCell>
                          <TableCell>
                            <Badge variant={task.isSingleRepTest ? 'default' : 'secondary'}>
                              {task.isSingleRepTest ? '🔍 Solo' : '🔢 Multi'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.activeRepresentations.map((r: string) => (
                              <span key={r} className="inline-block mr-2 capitalize text-xs">
                                {r}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell className="font-mono">{task.taskString}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Standard Simulation Results */}
        {viewMode === 'simulation' && data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Aufgaben gesamt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data.result.summary.totalTasks}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    Kompetenzen gemeistert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {data.result.summary.competenciesMastered}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Ø bis Mastery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.result.summary.averageAttemptsToMastery.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Aufgaben</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    Erfolgsrate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">100%</div>
                  <p className="text-xs text-muted-foreground mt-1">Perfekter Weg</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Standard Simulation */}
            <Tabs defaultValue="milestones" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="milestones">
                    Meilensteine ({data.result.milestones.length})
                  </TabsTrigger>
                  <TabsTrigger value="competencies">
                    Kompetenz-Entwicklung
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    Aufgabenliste
                  </TabsTrigger>
                </TabsList>
                <Button variant="outline" onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Report herunterladen
                </Button>
              </div>

              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Erreichte Meilensteine</CardTitle>
                    <CardDescription>
                      Zeitpunkt, an dem Kompetenzen gemeistert wurden
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.result.milestones.length > 0 ? (
                      <div className="space-y-4">
                        {data.result.milestones.map((milestone, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-2xl font-bold text-primary">
                                {milestone.taskNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">Aufgabe</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">
                                {milestone.competencyName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {milestone.description}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              <Award className="w-3 h-3 mr-1" />
                              Gemeistert
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Noch keine Meilensteine erreicht
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Kompetenz-Entwicklung im Zeitverlauf</CardTitle>
                    <CardDescription>
                      Erste Begegnung und Mastery-Zeitpunkt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {competencyProgressArray.map(([comp, data]) => {
                        const label = COMPETENCY_LABELS[comp] || comp;
                        const isMastered = data.mastered !== null;
                        const tasksToMastery = isMastered ? data.mastered - data.firstSeen : null;

                        return (
                          <div key={comp} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isMastered ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                                )}
                                <span className="font-medium">{label}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {isMastered ? (
                                  <span className="text-green-600 font-medium">
                                    Gemeistert bei Aufgabe {data.mastered}
                                  </span>
                                ) : (
                                  <span>In Entwicklung ({data.totalAttempts} Versuche)</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Erste Aufgabe: {data.firstSeen}</span>
                              <span>•</span>
                              {tasksToMastery !== null ? (
                                <>
                                  <span className="font-semibold text-primary">
                                    {tasksToMastery} Aufgaben bis Mastery
                                  </span>
                                  <span>•</span>
                                </>
                              ) : null}
                              <span>Erfolgsrate: {(data.successRate * 100).toFixed(0)}%</span>
                            </div>
                            <Progress 
                              value={isMastered ? 100 : (data.totalAttempts / 10) * 100} 
                              className="h-2"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aufgaben-Sequenz ({data.result.tasks.length} Aufgaben)</CardTitle>
                    <CardDescription>
                      Chronologische Liste aller präsentierten Aufgaben
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Aufgabe</TableHead>
                            <TableHead>Schwierigkeit</TableHead>
                            <TableHead>Kompetenzen</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.result.tasks.map((task) => (
                            <TableRow key={task.taskNumber}>
                              <TableCell className="font-medium">
                                {task.taskNumber}
                              </TableCell>
                              <TableCell>
                                <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                  {task.taskString}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{task.difficulty}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {task.competencies.slice(0, 2).map((comp, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {COMPETENCY_LABELS[comp]?.split(' ')[0] || comp}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {task.masteryStatus.mastered ? (
                                  <Badge className="bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Gemeistert
                                  </Badge>
                                ) : task.masteryStatus.correct >= 2 ? (
                                  <Badge variant="outline">
                                    {task.masteryStatus.correct}/3
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Neu</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Initial State */}
        {!data && !isLoading && viewMode === 'simulation' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Bereit für die Simulation
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Starten Sie die Simulation, um einen perfekten Lernpfad durch das 
                    kompetenzbasierte System zu analysieren. Sie sehen, welche Aufgaben 
                    in welcher Reihenfolge präsentiert werden und wie sich Kompetenzen entwickeln.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial State for Progressive Mastery */}
        {!progressiveData && !isProgressiveLoading && viewMode === 'progressive' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Progressive Mastery Analyse
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Starten Sie die progressive Analyse, um zu sehen, wie viele Aufgaben
                    insgesamt benötigt werden, um 1, 2, 3, ... bis alle Kompetenzen zu meistern.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}