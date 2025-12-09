import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle, Users, FileText, Settings, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ADULT_ANIMAL_IMAGES, type ZooAnimal } from "@/lib/animal-images";

interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
}

interface DiagnosticReport {
  studentId: string;
  studentName: string;
  totalTasks: number;
  correctTasks: number;
  overallSuccessRate: number;
  errorPatterns: Array<{
    errorType: string;
    count: number;
    percentage: number;
    severity: string;
  }>;
  priorityAreas: Array<{
    errorType: string;
    priority: string;
    reason: string;
  }>;
}

interface HomeworkTheme {
  id: string;
  name: string;
  description: string;
  focusArea: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  applicableStudents: string[];
  operativePatterns: string[];
  recommendedTaskCount: number;
  numberRange: number;
}

export default function HomeworkGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [themes, setThemes] = useState<HomeworkTheme[]>([]);
  const [worksheetCount, setWorksheetCount] = useState(1);
  const tasksPerWorksheet = 45; // Fixiert: 45 Aufgaben pro Seite
  const [homeworkTitle, setHomeworkTitle] = useState('Operative Päckchen');

  // Zufälliges Tier und Arbeitsanweisung
  const randomAnimalData = useMemo(() => {
    const animals: ZooAnimal[] = ['lion', 'elephant', 'giraffe', 'tiger', 'panda', 'penguin', 
      'dolphin', 'koala', 'fox', 'owl', 'parrot', 'eagle'];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

    const instructions = [
      "Wähle die Schüler aus, für die du Hausaufgaben erstellen möchtest!",
      "Klicke auf die Namen der Kinder, die Übungsblätter bekommen sollen!",
      "Markiere alle Schüler, die heute Hausaufgaben brauchen!",
      "Such dir die Kinder aus, für die du Aufgaben zusammenstellen willst!",
      "Tippe auf die Schüler-Karten, die mitmachen sollen!",
      "Wer soll heute üben? Wähle die Schüler aus!",
      "Erstelle Hausaufgaben: Wähle zuerst deine Schüler!",
      "Für welche Kinder möchtest du Übungen generieren?",
      "Klicke auf alle Namen, die Aufgaben bekommen!",
      "Stell dein Team zusammen: Welche Schüler üben heute?"
    ];
    const randomInstruction = instructions[Math.floor(Math.random() * instructions.length)];

    return {
      animal: randomAnimal,
      image: ADULT_ANIMAL_IMAGES[randomAnimal],
      instruction: randomInstruction
    };
  }, []); // Nur einmal beim Mount generieren

  

  // Vordefinierte Titel-Optionen
  const titleOptions = [
    'Operative Päckchen',
    'Zehnerübergang üben',
    'Rechnen im Zahlenraum 20',
    'Rechnen im Zahlenraum 100',
    'Kernaufgaben und Nachbaraufgaben',
    'Strategisches Rechnen',
    'Zerlegungsaufgaben',
    'Addition und Subtraktion',
    'Mathematik Hausaufgaben',
    'Übungsblätter Mathematik'
  ];

  // Load students in teacher's class
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Step 1: Analyze students mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log('📤 Sending analyze request with:', {
        studentIds: selectedStudents,
        sessionCount: 10,
        minTaskCount: 5,
      });

      const res = await apiRequest('POST', '/api/homework/analyze', {
        studentIds: selectedStudents,
        sessionCount: 10,
        minTaskCount: 5,
      });

      console.log('📥 Analyze response:', res);
      return res.json();
    },
    onSuccess: (data) => {
      console.log('✅ Analysis successful:', data);

      if (!data.reports || data.reports.length === 0) {
        toast({
          title: "Keine Daten",
          description: "Die ausgewählten Schüler haben noch nicht genug Aufgaben gelöst (mindestens 20 erforderlich).",
          variant: "destructive",
        });
        return;
      }

      setDiagnosticReports(data.reports || []);
      toast({
        title: "Analyse abgeschlossen",
        description: `${data.reports.length} Schüler analysiert`,
      });
      setCurrentStep(2);
    },
    onError: (error: any) => {
      console.error('❌ Analysis error:', error);

      const errorMessage = error?.message || error?.body?.message || "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.";

      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Step 2: Generate themes mutation
  const themesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/homework/themes', {
        diagnosticReports,
        maxThemes: 8,
        minRelevanceScore: 10, // GESENKT von 30 auf 10 für mehr Themen
      });
      return res.json();
    },
    onSuccess: (data) => {
      setThemes(data.themes || []);
      toast({
        title: "Themen generiert",
        description: `${data.themes.length} passende Themen gefunden`,
      });
      setCurrentStep(3);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Themen-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  // Step 3: Generate homework mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const selectedThemeObjects = themes.filter(t => selectedThemes.includes(t.id));

      const res = await apiRequest('POST', '/api/homework/generate', {
        studentIds: selectedStudents,
        themes: selectedThemeObjects,
        worksheetCount,
        tasksPerWorksheet,
        includeSolutions: true,
        title: homeworkTitle || 'Mathematik Hausaufgaben',
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Hausaufgaben erstellt!",
        description: `${data.tasksCount} Aufgaben in ${worksheetCount} Arbeitsblatt/Arbeitsblättern generiert`,
      });
      setCurrentStep(4);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const steps = [
    { num: 1, title: 'Schüler', icon: Users },
    { num: 2, title: 'Analyse', icon: FileText },
    { num: 3, title: 'Themen', icon: Settings },
    { num: 4, title: 'Fertig', icon: CheckCircle },
  ];

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with Animal Portrait */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/teacher")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Hausaufgaben-Generator</h1>
            <p className="text-muted-foreground">
              Operative Päckchen nach Wittmann – individuelle Förderung
            </p>
          </div>
        </div>

        {/* Animal Portrait Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={randomAnimalData.image} 
                  alt="Tier-Assistent" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">Arbeitsauftrag</h3>
                </div>
                <p className="text-base font-medium">
                  {randomAnimalData.instruction}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-indicator-${step.num}`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-sm mt-2 font-medium">{step.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${
                  currentStep > step.num ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Schüler auswählen</CardTitle>
            <CardDescription>
              Wählen Sie die Schüler aus, für die Sie Hausaufgaben generieren möchten
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <p>Lade Schüler...</p>
            ) : students.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keine Schüler in Ihrer Klasse gefunden.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedStudents.length} von {students.length} ausgewählt
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    data-testid="button-select-all"
                  >
                    {selectedStudents.length === students.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students
                    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'de'))
                    .map(student => (
                    <div
                      key={student.id}
                      className={`flex items-center space-x-3 p-4 rounded-md border cursor-pointer hover-elevate transition-all ${
                        selectedStudents.includes(student.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStudent(student.id);
                      }}
                      data-testid={`student-card-${student.id}`}
                    >
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => {
                          toggleStudent(student.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`checkbox-student-${student.id}`}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 pointer-events-none">
                        <p className="font-medium">
                          {student.firstName} {student.lastName || ''}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.username}</p>
                      </div>
                    </div>
                  ))}</div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={selectedStudents.length === 0 || analyzeMutation.isPending}
                    data-testid="button-analyze"
                  >
                    {analyzeMutation.isPending ? 'Analysiere...' : 'Weiter zur Analyse'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Fehleranalyse</CardTitle>
            <CardDescription>
              Basierend auf den letzten 10 Sessions wurden folgende Fehlermuster identifiziert
            </CardDescription>
          </CardHeader>
          <CardContent>
            {diagnosticReports.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Keine ausreichenden Daten für Analyse vorhanden.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {diagnosticReports.map(report => (
                  <div key={report.studentId} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{report.studentName}</h3>
                      <Badge variant={report.overallSuccessRate >= 0.7 ? 'default' : 'destructive'}>
                        {(report.overallSuccessRate * 100).toFixed(0)}% Erfolgsquote
                      </Badge>
                    </div>

                    {report.priorityAreas.slice(0, 3).map((area, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <Badge
                          variant={
                            area.priority === 'high' ? 'destructive' :
                            area.priority === 'medium' ? 'default' : 'secondary'
                          }
                          className="mt-0.5"
                        >
                          {area.priority === 'high' ? 'Hoch' : area.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{area.reason}</p>
                      </div>
                    ))}

                    <Separator className="my-4" />
                  </div>
                ))}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    data-testid="button-back-to-students"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                  <Button
                    onClick={() => themesMutation.mutate()}
                    disabled={themesMutation.isPending}
                    data-testid="button-generate-themes"
                  >
                    {themesMutation.isPending ? 'Generiere Themen...' : 'Themen-Empfehlungen'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Themen und Konfiguration</CardTitle>
            <CardDescription>
              Wählen Sie die Themen für die Hausaufgaben und konfigurieren Sie die Arbeitsblätter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Operative Päckchen (Themen)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      className={`p-4 rounded-md border cursor-pointer hover-elevate transition-all ${
                        selectedThemes.includes(theme.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme(theme.id);
                      }}
                      data-testid={`theme-card-${theme.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedThemes.includes(theme.id)}
                          onCheckedChange={(checked) => {
                            toggleTheme(theme.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`checkbox-theme-${theme.id}`}
                          className="pointer-events-none mt-1"
                        />
                        <div className="flex-1 pointer-events-none">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{theme.name}</p>
                            <Badge
                              variant={
                                theme.priority === 'high' ? 'destructive' :
                                theme.priority === 'medium' ? 'default' : 'secondary'
                              }
                            >
                              {theme.priority === 'high' ? 'Hoch' : theme.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{theme.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Fokus: {theme.focusArea} · ZR{theme.numberRange}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}</div>
              </div>

              <Separator />

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homework-title">Titel des Arbeitsblattes</Label>
                  <select
                    id="homework-title"
                    value={homeworkTitle}
                    onChange={(e) => setHomeworkTitle(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    data-testid="select-title"
                  >
                    {titleOptions.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="worksheet-count">Anzahl Seiten</Label>
                  <Input
                    id="worksheet-count"
                    type="number"
                    min={1}
                    max={5}
                    value={worksheetCount}
                    onChange={(e) => setWorksheetCount(parseInt(e.target.value) || 1)}
                    data-testid="input-worksheet-count"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Jede Seite enthält 45 Aufgaben in 3 Abschnitten
                  </p>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>✨ Intelligente Fehler-Integration:</strong> Das System baut automatisch verwandte Aufgaben um frühere Fehler herum (Umkehraufgaben, Tauschaufgaben, verschiedene Platzhalter-Positionen). Jede Seite enthält 45 Aufgaben in 3 motivierenden Abschnitten.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  data-testid="button-back-to-analysis"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={selectedThemes.length === 0 || generateMutation.isPending}
                  data-testid="button-generate-homework"
                >
                  {generateMutation.isPending ? 'Generiere...' : 'Hausaufgaben generieren'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Hausaufgaben erfolgreich erstellt!
            </CardTitle>
            <CardDescription>
              Die operativen Päckchen wurden generiert und sind bereit zum Download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Die Hausaufgaben wurden erstellt für {selectedStudents.length} Schüler.
                Insgesamt {worksheetCount} Arbeitsblatt(blätter) mit je {tasksPerWorksheet} Aufgaben.
              </AlertDescription>
            </Alert>

            {generateMutation.data?.homeworkSet?.id && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={() => {
                      const homeworkSetId = generateMutation.data.homeworkSet.id;
                      window.open(`/api/homework/${homeworkSetId}/preview?type=tasks`, '_blank');
                    }}
                    className="w-full"
                    data-testid="button-preview-tasks"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Vorschau & Drucken (Aufgaben)
                  </Button>
                  <Button
                    onClick={() => {
                      const homeworkSetId = generateMutation.data.homeworkSet.id;
                      window.open(`/api/homework/${homeworkSetId}/preview?type=solutions`, '_blank');
                    }}
                    variant="outline"
                    className="w-full"
                    data-testid="button-preview-solutions"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Vorschau & Drucken (Lösungen)
                  </Button>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setLocation("/teacher")}
                data-testid="button-back-to-dashboard"
              >
                Zurück zum Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedStudents([]);
                  setDiagnosticReports([]);
                  setSelectedThemes([]);
                  setThemes([]);
                }}
                data-testid="button-create-new"
              >
                Neue Hausaufgaben erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}