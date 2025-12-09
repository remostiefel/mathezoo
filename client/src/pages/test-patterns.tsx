import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MathLab } from "@/components/math/MathLab";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

type PatternType = 
  | "sum_constancy"
  | "neighbor_tasks"
  | "inverse_operations"
  | "analogy_package"
  | "error_pattern"
  | "turning_points"
  | "mixed_practice";

interface Task {
  number1: number;
  number2: number;
  operation: '+' | '-';
  correctAnswer: number;
  taskType: string;
  numberRange: number;
}

export default function TestPatterns() {
  const { toast } = useToast();
  const [patternType, setPatternType] = useState<PatternType>("turning_points");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [numberRange, setNumberRange] = useState(20);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          strategyLevel: 'decomposition',
          patternType,
          difficulty,
          numberRange
        })
      });

      if (!response.ok) throw new Error('Failed to load tasks');

      const taskPackage = await response.json();
      
      if (taskPackage?.tasks) {
        setTasks(taskPackage.tasks.map((t: any) => ({
          number1: t.number1,
          number2: t.number2,
          operation: t.operation,
          correctAnswer: t.correctAnswer,
          taskType: t.taskType,
          numberRange: t.numberRange || 20,
        })));
        setCurrentTaskIndex(0);
        
        toast({
          title: "Aufgaben geladen",
          description: `${taskPackage.tasks.length} Aufgaben vom Typ "${patternType}" wurden geladen.`,
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Aufgaben konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Test-Modus: Neue Aufgabentypen</h1>
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
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Aufgabenkonfiguration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aufgabentyp</label>
                <Select value={patternType} onValueChange={(value) => setPatternType(value as PatternType)}>
                  <SelectTrigger data-testid="select-pattern-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum_constancy">Summen-Konstanz</SelectItem>
                    <SelectItem value="neighbor_tasks">Nachbaraufgaben</SelectItem>
                    <SelectItem value="inverse_operations">Umkehraufgaben</SelectItem>
                    <SelectItem value="analogy_package">Analogie-Päckchen</SelectItem>
                    <SelectItem value="error_pattern">Fehlermuster</SelectItem>
                    <SelectItem value="turning_points">Wendepunkte (NEU)</SelectItem>
                    <SelectItem value="mixed_practice">Gemischte Übung (NEU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Schwierigkeit (1-5)</label>
                <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(parseInt(value))}>
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Sehr leicht</SelectItem>
                    <SelectItem value="2">2 - Leicht</SelectItem>
                    <SelectItem value="3">3 - Mittel</SelectItem>
                    <SelectItem value="4">4 - Schwer</SelectItem>
                    <SelectItem value="5">5 - Sehr schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zahlenraum</label>
                <Select value={numberRange.toString()} onValueChange={(value) => setNumberRange(parseInt(value))}>
                  <SelectTrigger data-testid="select-number-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">Zahlenraum 20</SelectItem>
                    <SelectItem value="100">Zahlenraum 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadTasks} className="w-full" data-testid="button-load-tasks">
                  Aufgaben laden
                </Button>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  Aufgabe {currentTaskIndex + 1} von {tasks.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentTaskIndex === 0}
                    variant="outline"
                    size="sm"
                    data-testid="button-previous-task"
                  >
                    Zurück
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentTaskIndex === tasks.length - 1}
                    variant="outline"
                    size="sm"
                    data-testid="button-next-task"
                  >
                    Weiter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {currentTask && (
          <MathLab
            taskNumber1={currentTask.number1}
            taskNumber2={currentTask.number2}
            taskOperation={currentTask.operation}
            onSolutionComplete={(answer, steps) => {
              toast({
                title: "Richtig!",
                description: `Die Antwort ${answer} ist korrekt.`,
              });
              handleNext();
            }}
          />
        )}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Wähle einen Aufgabentyp und klicke auf "Aufgaben laden", um zu beginnen.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
