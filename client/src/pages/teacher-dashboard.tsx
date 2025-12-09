
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { AlertCircle, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BookOpen, Lightbulb, Target, Award, ArrowLeft, Download, FileText, Users, Clock, Sparkles, Gift } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  totalTasks: number;
  correctTasks: number;
  errorCount: number;
  successRate: number;
  currentStage: number;
  currentStreak: number;
  recentActivity: number;
  lastActive: string | null;
}

interface ErrorDetail {
  operation: string;
  number1: number;
  number2: number;
  correctAnswer: number;
  studentAnswer: number | null;
  errorType: string | null;
  errorSeverity: string | null;
  timeTaken: number | null;
  createdAt: Date;
  placeholderPosition?: string | null;
}

interface StudentStats {
  student: {
    id: string;
    username: string;
    firstName: string;
    lastName: string | null;
  };
  overview: {
    totalTasks: number;
    correctTasks: number;
    incorrectTasks: number;
    successRate: number;
    recentSuccessRate: number;
    avgTimePerTask: number;
    currentStreak: number;
    totalSessions: number;
  };
  progression: {
    currentStage: number;
    totalTasksSolved: number;
    rml: number;
    cla: number;
    smi: number;
    tal: number;
    mca: number;
  };
  errors: {
    byType: Record<string, number>;
    details: ErrorDetail[];
    totalErrors: number;
  };
  strategies: {
    usage: Record<string, number>;
    preferredStrategy: string;
  };
  cognitiveProfile: {
    strengths: string[];
    weaknesses: string[];
    strategyPreferences: string[];
    currentZPDLevel: number;
  } | null;
  recentTasks: Array<{
    operation: string;
    number1: number;
    number2: number;
    correctAnswer: number;
    studentAnswer: number | null;
    isCorrect: boolean;
    timeTaken: number | null;
    strategyUsed: string | null;
    createdAt: Date;
  }>;
}

interface GameRecommendation {
  gameId: string;
  gameName: string;
  recommendedLevel: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  focusArea: string;
  emoji: string;
  zooStory?: string;
  exampleTask?: string;
  childExplanation?: string;
}

interface PedagogicalRecommendation {
  errorLabel: string;
  didacticExplanation: string;
  developmentalGoal: string;
  gameRecommendations: GameRecommendation[];
  materialSupport: string[];
  teacherScript: string;
}

// Wissenschaftlich fundierte Fehlertyp-Beschreibungen
const ERROR_TYPE_INFO: Record<string, {
  label: string;
  icon: string;
  severity: 'high' | 'medium' | 'low';
  didacticBackground: string;
  researchBase: string;
}> = {
  'counting_error_minus_1': {
    label: 'Zählfehler: 1 zu wenig',
    icon: '🔢',
    severity: 'medium',
    didacticBackground: 'Das Kind nutzt noch zählendes Rechnen und stoppt zu früh. Dies deutet auf mangelnde Automatisierung von Rechenstrategien hin.',
    researchBase: 'Gaidoschik (2014): Ablösung vom zählenden Rechnen'
  },
  'counting_error_plus_1': {
    label: 'Zählfehler: 1 zu viel',
    icon: '🔢',
    severity: 'medium',
    didacticBackground: 'Das Kind zählt zu weit und zeigt damit Abhängigkeit vom zählenden Rechnen.',
    researchBase: 'Gaidoschik (2014): Ablösung vom zählenden Rechnen'
  },
  'counting_error_minus_2': {
    label: 'Zählfehler: 2 zu wenig',
    icon: '🔢',
    severity: 'high',
    didacticBackground: 'Größere Zählfehler deuten auf fundamentale Unsicherheit im Zahlenraum hin.',
    researchBase: 'Gaidoschik (2014): ALARMZEICHEN für dringenden Förderbedarf'
  },
  'counting_error_plus_2': {
    label: 'Zählfehler: 2 zu viel',
    icon: '🔢',
    severity: 'high',
    didacticBackground: 'Größere Zählfehler deuten auf fundamentale Unsicherheit im Zahlenraum hin.',
    researchBase: 'Gaidoschik (2014): ALARMZEICHEN für dringenden Förderbedarf'
  },
  'operation_confusion': {
    label: 'Operations-Verwechslung',
    icon: '➕➖',
    severity: 'high',
    didacticBackground: 'Plus und Minus werden verwechselt - möglicherweise unaufmerksames Lesen oder fehlendes Zeichenverständnis.',
    researchBase: 'Radatz (1979): Systematische Fehleranalyse'
  },
  'input_error': {
    label: 'Eingabefehler',
    icon: '⌨️',
    severity: 'low',
    didacticBackground: 'Kein mathematisches Problem! Eingabefehler bei korrektem Rechenverständnis.',
    researchBase: 'Moser Opitz (2010): Fehlerdiagnostik'
  },
  'place_value': {
    label: 'Stellenwert-Fehler',
    icon: '🔟',
    severity: 'high',
    didacticBackground: 'Fundamentales Stellenwertverständnis fehlt. Zehner und Einer werden nicht als getrennte Einheiten verstanden.',
    researchBase: 'Scherer & Moser Opitz (2010): Stellenwertverständnis'
  },
  'off_by_ten_minus': {
    label: 'Um-10-daneben: 10 zu wenig',
    icon: '🔟',
    severity: 'medium',
    didacticBackground: 'Das Kind vergisst systematisch einen Zehner oder subtrahiert ihn fälschlicherweise.',
    researchBase: 'Radatz (1979): Stellenwertfehler'
  },
  'off_by_ten_plus': {
    label: 'Um-10-daneben: 10 zu viel',
    icon: '🔟',
    severity: 'medium',
    didacticBackground: 'Das Kind zählt einen Zehner doppelt oder addiert ihn versehentlich.',
    researchBase: 'Radatz (1979): Stellenwertfehler'
  },
  'doubling_error': {
    label: 'Kernaufgaben-Fehler',
    icon: '✖️2',
    severity: 'medium',
    didacticBackground: 'Kernaufgaben (Verdopplungen) sind nicht automatisiert, obwohl sie Basis für viele Rechenstrategien sind.',
    researchBase: 'Wittmann & Müller (2017): Produktive Übungsformate'
  },
  'digit_reversal': {
    label: 'Zahlendreher',
    icon: '🔄',
    severity: 'medium',
    didacticBackground: 'Zahlen werden spiegelverkehrt gelesen/geschrieben. Ggf. visuelle Wahrnehmung prüfen.',
    researchBase: 'Kaufmann & von Aster (2012): Neuropsychologie'
  },
  'decade_boundary_confusion': {
    label: 'Zehner-Stopp-Fehler',
    icon: '⚠️',
    severity: 'high',
    didacticBackground: 'SCHWERWIEGEND: Kind wechselt die Operation während der Rechnung (subtrahiert bis zum Zehner, addiert dann).',
    researchBase: 'Radatz (1979): Konzeptionelle Fehler'
  },
  'subtraction_reversal_at_ten': {
    label: 'Kleinere-von-Größerer-Fehler',
    icon: '⚠️',
    severity: 'high',
    didacticBackground: 'SCHWERWIEGEND: Kind vertauscht Minuend und Subtrahend beim Zehnerübergang.',
    researchBase: 'Radatz (1979): Kleinere-von-Größerer-Fehler'
  },
  'other': {
    label: 'Weitere Fehler',
    icon: '❓',
    severity: 'medium',
    didacticBackground: 'Kein bekanntes Fehlermuster - diagnostisches Gespräch erforderlich.',
    researchBase: 'Moser Opitz (2012): Prozessorientierte Diagnostik'
  }
};

// Formatiere Platzhalter-Kontext für Anzeige
function formatPlaceholderContext(context?: string | null): JSX.Element | string {
  if (!context) return 'Keine Platzhalter-Info';
  
  // Parse HTML-Unterstreichung in React
  const parts = context.split(/<\/?u>/);
  return (
    <span className="font-mono text-lg">
      {parts.map((part, i) => 
        i % 2 === 1 ? (
          <span key={i} className="underline decoration-2 decoration-blue-500 underline-offset-4 font-bold text-blue-600">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function TeacherDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  // Student management state - MUST be at top level (not conditional)
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    classId: ''
  });
  
  // Coin gift state
  const [giftCoinsStudent, setGiftCoinsStudent] = useState<string | null>(null);
  const [giftCoinsAmount, setGiftCoinsAmount] = useState('');
  const [giftCoinsLoading, setGiftCoinsLoading] = useState(false);

  const { data: studentsOverview, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students-overview'],
    enabled: !authLoading && (user?.role === 'teacher' || user?.role === 'admin'),
  });

  const { data: studentStats, isLoading: statsLoading } = useQuery<StudentStats>({
    queryKey: [`/api/teacher/student-stats/${selectedStudent}`],
    enabled: !!selectedStudent,
  });

  // Fetch classes for dropdown - MUST be before any conditional returns
  const { data: classes } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['/api/classes'],
    enabled: !authLoading && (user?.role === 'teacher' || user?.role === 'admin'),
  });

  // Fetch game recommendations for each error type
  const { data: recommendationsMap } = useQuery<Record<string, PedagogicalRecommendation>>({
    queryKey: ['game-recommendations', selectedStudent],
    queryFn: async () => {
      if (!studentStats?.errors.byType) return {};
      
      const recommendations: Record<string, PedagogicalRecommendation> = {};
      
      for (const errorType of Object.keys(studentStats.errors.byType)) {
        try {
          const response = await fetch('/api/game-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ errorType, userId: selectedStudent }),
          });
          
          if (response.ok) {
            const data = await response.json();
            recommendations[errorType] = data.fullRecommendation;
          }
        } catch (error) {
          console.error(`Error fetching recommendation for ${errorType}:`, error);
        }
      }
      
      return recommendations;
    },
    enabled: !!studentStats?.errors.byType && Object.keys(studentStats.errors.byType).length > 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'teacher' && user.role !== 'admin'))) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  const toggleErrorExpansion = (errorType: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorType)) {
        newSet.delete(errorType);
      } else {
        newSet.add(errorType);
      }
      return newSet;
    });
  };

  if (authLoading || studentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentsOverview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Keine Schülerdaten verfügbar.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentForm),
        credentials: 'include',
      });

      if (response.ok) {
        // Reset form
        setNewStudentForm({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          classId: ''
        });
        // Refresh student list
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Fehler beim Erstellen des Schülers');
    }
  };

  const handleGiftCoins = async () => {
    if (!giftCoinsStudent || !giftCoinsAmount) return;
    
    const coins = parseInt(giftCoinsAmount, 10);
    if (isNaN(coins) || coins <= 0) {
      alert('Bitte geben Sie eine gültige Münzanzahl ein');
      return;
    }

    setGiftCoinsLoading(true);
    try {
      const response = await fetch('/api/zoo/teacher/gift-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: giftCoinsStudent,
          coins: coins,
          reason: 'Geschenk vom Lehrer'
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${coins} Zoomünzen erfolgreich verschenkt! Neuer Kontostand: ${data.newBalance}`);
        setGiftCoinsStudent(null);
        setGiftCoinsAmount('');
      } else {
        const error = await response.json();
        alert(`❌ Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error('Error gifting coins:', error);
      alert('Fehler beim Verschenken von Münzen');
    } finally {
      setGiftCoinsLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🎓 Lehrermodus Dashboard
                </h1>
                <p className="text-gray-600">
                  Wissenschaftlich fundierte Fehleranalyse und heilpädagogische Förderempfehlungen
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/teacher/homework">
                  <Button variant="default" size="lg" data-testid="button-homework-generator">
                    <FileText className="mr-2 h-4 w-4" />
                    Hausaufgaben generieren
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                      window.location.href = '/login';
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <BookOpen className="inline-block mr-2 h-4 w-4" />
                <strong>Wissenschaftliche Grundlage:</strong> Dieses Dashboard basiert auf aktueller mathematikdidaktischer Forschung 
                (Gaidoschik 2014, Radatz 1979, Scherer & Moser Opitz 2010, Dornheim 2008) und ermöglicht eine professionelle 
                Förderdiagnostik mit gezielten Interventionsvorschlägen.
              </p>
            </div>
          </div>

          {/* Student Management Section */}
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Users className="h-6 w-6 text-indigo-600" />
                    Schülerverwaltung
                  </CardTitle>
                  <CardDescription>Neue Schüler:innen erstellen und verwalten</CardDescription>
                </div>
                <Button
                  onClick={() => setShowStudentManagement(!showStudentManagement)}
                  variant={showStudentManagement ? "default" : "outline"}
                >
                  {showStudentManagement ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Schließen
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Öffnen
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showStudentManagement && (
              <CardContent>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="student-username" className="text-sm font-medium">Benutzername *</label>
                      <input
                        id="student-username"
                        name="username"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newStudentForm.username}
                        onChange={(e) => setNewStudentForm({...newStudentForm, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="student-password" className="text-sm font-medium">Passwort *</label>
                      <input
                        id="student-password"
                        name="password"
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newStudentForm.password}
                        onChange={(e) => setNewStudentForm({...newStudentForm, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="student-firstName" className="text-sm font-medium">Vorname *</label>
                      <input
                        id="student-firstName"
                        name="firstName"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newStudentForm.firstName}
                        onChange={(e) => setNewStudentForm({...newStudentForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="student-lastName" className="text-sm font-medium">Nachname</label>
                      <input
                        id="student-lastName"
                        name="lastName"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newStudentForm.lastName}
                        onChange={(e) => setNewStudentForm({...newStudentForm, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="student-classId" className="text-sm font-medium">Klasse *</label>
                      <select
                        id="student-classId"
                        name="classId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newStudentForm.classId}
                        onChange={(e) => setNewStudentForm({...newStudentForm, classId: e.target.value})}
                      >
                        <option value="">-- Klasse wählen --</option>
                        {classes?.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewStudentForm({
                        username: '',
                        password: '',
                        firstName: '',
                        lastName: '',
                        classId: ''
                      })}
                    >
                      Zurücksetzen
                    </Button>
                    <Button type="submit" variant="default">
                      <Users className="mr-2 h-4 w-4" />
                      Schüler:in erstellen
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Class Statistics Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Students */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Schüler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-900">{studentsOverview.length}</div>
                <p className="text-xs text-blue-600 mt-1">Gesamt</p>
              </CardContent>
            </Card>

            {/* Total Tasks Solved */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Aufgaben gelöst
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-900">
                  {studentsOverview.reduce((sum, s) => sum + s.totalTasks, 0)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {studentsOverview.reduce((sum, s) => sum + s.correctTasks, 0)} korrekt
                </p>
              </CardContent>
            </Card>

            {/* Average Success Rate */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Durchschn. Erfolgsrate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-900">
                  {studentsOverview.length > 0
                    ? (studentsOverview.reduce((sum, s) => sum + s.successRate, 0) / studentsOverview.length).toFixed(1)
                    : 0}%
                </div>
                <Progress 
                  value={studentsOverview.length > 0 
                    ? studentsOverview.reduce((sum, s) => sum + s.successRate, 0) / studentsOverview.length 
                    : 0} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            {/* Active Today */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Heute aktiv
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-900">
                  {studentsOverview.filter(s => {
                    if (!s.lastActive) return false;
                    const lastActiveDate = new Date(s.lastActive);
                    const today = new Date();
                    return lastActiveDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <p className="text-xs text-amber-600 mt-1">Schüler</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Overview */}
          <Card className="mb-8 bg-gradient-to-r from-slate-50 to-gray-100 border-2 border-slate-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-600" />
                Aktivitäts-Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Last 24 hours */}
                <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Letzte 24 Stunden</span>
                    <Badge className="bg-green-100 text-green-700">
                      {studentsOverview.filter(s => {
                        if (!s.lastActive) return false;
                        const lastActiveDate = new Date(s.lastActive);
                        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return lastActiveDate >= oneDayAgo;
                      }).length} Schüler
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {studentsOverview
                      .filter(s => {
                        if (!s.lastActive) return false;
                        const lastActiveDate = new Date(s.lastActive);
                        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return lastActiveDate >= oneDayAgo;
                      })
                      .reduce((sum, s) => sum + s.recentActivity, 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Aufgaben gelöst</p>
                </div>

                {/* Last 5 days */}
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Letzte 5 Tage</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {studentsOverview.filter(s => {
                        if (!s.lastActive) return false;
                        const lastActiveDate = new Date(s.lastActive);
                        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                        return lastActiveDate >= fiveDaysAgo;
                      }).length} Schüler
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {studentsOverview
                      .filter(s => {
                        if (!s.lastActive) return false;
                        const lastActiveDate = new Date(s.lastActive);
                        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                        return lastActiveDate >= fiveDaysAgo;
                      })
                      .reduce((sum, s) => sum + s.totalTasks, 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Aufgaben insgesamt</p>
                </div>

                {/* Inactive (>5 days) */}
                <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Länger inaktiv</span>
                    <Badge className="bg-orange-100 text-orange-700">
                      {studentsOverview.filter(s => {
                        if (!s.lastActive) return true;
                        const lastActiveDate = new Date(s.lastActive);
                        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                        return lastActiveDate < fiveDaysAgo;
                      }).length} Schüler
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {studentsOverview.filter(s => {
                      if (!s.lastActive) return true;
                      const lastActiveDate = new Date(s.lastActive);
                      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                      return lastActiveDate < fiveDaysAgo;
                    }).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">&gt; 5 Tage keine Aktivität</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Grid */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Alle Schüler</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studentsOverview
              .sort((a, b) => a.firstName.localeCompare(b.firstName, 'de'))
              .map((student) => (
              <Card 
                key={student.id}
                className="hover:shadow-xl transition-all border-2 hover:border-blue-400"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl cursor-pointer hover:text-blue-600" onClick={() => setSelectedStudent(student.id)}>
                      {student.firstName} {student.lastName}
                    </span>
                    {student.errorCount > 5 && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {student.errorCount} Fehler
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>@{student.username}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Success Rate */}
                    <div className="cursor-pointer hover:opacity-70" onClick={() => setSelectedStudent(student.id)}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Erfolgsrate</span>
                        <span className="text-sm font-bold text-blue-600">
                          {student.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={student.successRate} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2 cursor-pointer hover:opacity-70" onClick={() => setSelectedStudent(student.id)}>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-700">
                          {student.correctTasks}
                        </div>
                        <div className="text-xs text-green-600">Korrekt</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-700">
                          {student.errorCount}
                        </div>
                        <div className="text-xs text-red-600">Fehler</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-700">
                          {student.currentStage}
                        </div>
                        <div className="text-xs text-blue-600">Stufe</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-700">
                          {student.currentStreak}
                        </div>
                        <div className="text-xs text-purple-600">Serie</div>
                      </div>
                    </div>

                    {/* Last Active */}
                    {student.lastActive && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Zuletzt aktiv: {new Date(student.lastActive).toLocaleDateString('de-DE')}
                      </div>
                    )}

                    {/* Coin Gift Button */}
                    <div className="pt-2 border-t flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setGiftCoinsStudent(student.id)}
                        data-testid={`button-gift-coins-${student.id}`}
                      >
                        <Gift className="h-3 w-3 mr-1" />
                        Münzen schenken
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudent(student.id)}
                        data-testid={`button-view-details-${student.id}`}
                      >
                        Mehr
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coin Gift Dialog */}
          {giftCoinsStudent && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-yellow-600" />
                    Zoomünzen verschenken
                  </CardTitle>
                  <CardDescription>
                    {studentsOverview.find(s => s.id === giftCoinsStudent)?.firstName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Anzahl der Münzen</label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={giftCoinsAmount}
                      onChange={(e) => setGiftCoinsAmount(e.target.value)}
                      placeholder="z.B. 50"
                      className="mt-2"
                      data-testid="input-coin-amount"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGiftCoinsStudent(null);
                        setGiftCoinsAmount('');
                      }}
                      className="flex-1"
                      data-testid="button-cancel-coins"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={handleGiftCoins}
                      disabled={giftCoinsLoading || !giftCoinsAmount}
                      className="flex-1"
                      data-testid="button-confirm-coins"
                    >
                      {giftCoinsLoading ? 'Wird geschenkt...' : 'Bestätigen'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed Student View
  if (!studentStats || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Schülerstatistiken...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedStudent(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {studentStats.student.firstName} {studentStats.student.lastName}
              </h1>
              <p className="text-gray-600">@{studentStats.student.username}</p>
            </div>
            <Button variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              PDF-Bericht exportieren
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📊 Überblick</TabsTrigger>
            <TabsTrigger value="errors">🔍 Fehleranalyse</TabsTrigger>
            <TabsTrigger value="strategies">🧠 Strategien</TabsTrigger>
            <TabsTrigger value="recommendations">💡 Förderung</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Gesamtaufgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{studentStats.overview.totalTasks}</div>
                  <Progress value={(studentStats.overview.correctTasks / studentStats.overview.totalTasks) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {studentStats.overview.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Letzte 10: {studentStats.overview.recentSuccessRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Ø Zeit/Aufgabe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {studentStats.overview.avgTimePerTask.toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Serie: {studentStats.overview.currentStreak}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progression Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Lernfortschritt (Stufe {studentStats.progression.currentStage})</CardTitle>
                <CardDescription>Wissenschaftlich fundierte Fortschrittsindikatoren</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">RML (Rechenmeisterschaft)</div>
                    <Progress value={studentStats.progression.rml * 100} />
                    <div className="text-xs text-gray-500">{(studentStats.progression.rml * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">CLA (Kognitive Last)</div>
                    <Progress value={studentStats.progression.cla * 100} />
                    <div className="text-xs text-gray-500">{(studentStats.progression.cla * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">SMI (Strategie-Meisterung)</div>
                    <Progress value={studentStats.progression.smi * 100} />
                    <div className="text-xs text-gray-500">{(studentStats.progression.smi * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">TAL (Aufgaben-Niveau)</div>
                    <Progress value={studentStats.progression.tal * 100} />
                    <div className="text-xs text-gray-500">{(studentStats.progression.tal * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">MCA (Metakogn. Bewusstheit)</div>
                    <Progress value={studentStats.progression.mca * 100} />
                    <div className="text-xs text-gray-500">{(studentStats.progression.mca * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ERRORS TAB - NEW SCIENTIFIC ANALYSIS */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔬 Wissenschaftlich fundierte Fehleranalyse</CardTitle>
                <CardDescription>
                  Basierend auf Radatz (1979), Gaidoschik (2014), Scherer & Moser Opitz (2010)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(studentStats.errors.byType).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">Keine systematischen Fehler erkannt!</p>
                    <p className="text-sm">Hervorragende Leistung 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(studentStats.errors.byType)
                      .sort(([, a], [, b]) => b - a)
                      .map(([errorType, count]) => {
                        const info = ERROR_TYPE_INFO[errorType] || ERROR_TYPE_INFO['other'];
                        const isExpanded = expandedErrors.has(errorType);
                        const errorDetails = studentStats.errors.details.filter(
                          d => d.errorType === errorType
                        );
                        const recommendation = recommendationsMap?.[errorType];

                        return (
                          <Card key={errorType} className="border-l-4" style={{
                            borderLeftColor: info.severity === 'high' ? '#ef4444' : 
                                           info.severity === 'medium' ? '#f59e0b' : '#10b981'
                          }}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">{info.icon}</span>
                                    <span>{info.label}</span>
                                    <Badge variant={
                                      info.severity === 'high' ? 'destructive' : 
                                      info.severity === 'medium' ? 'default' : 'secondary'
                                    }>
                                      {count}x
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="mt-2">
                                    {info.didacticBackground}
                                  </CardDescription>
                                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                                    📚 {info.researchBase}
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleErrorExpansion(errorType)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardHeader>

                            {isExpanded && (
                              <CardContent className="space-y-6">
                                <Separator />
                                
                                {/* HEILPÄDAGOGISCHE EMPFEHLUNG */}
                                {recommendation && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                                    <h4 className="font-bold text-green-900 flex items-center gap-2">
                                      <Lightbulb className="h-5 w-5" />
                                      Heilpädagogische Förderempfehlung
                                    </h4>
                                    
                                    <div className="space-y-2">
                                      <p className="text-sm text-green-800">
                                        <strong>Didaktische Einschätzung:</strong> {recommendation.didacticExplanation}
                                      </p>
                                      <p className="text-sm text-green-800">
                                        <strong>Förderziel:</strong> {recommendation.developmentalGoal}
                                      </p>
                                    </div>

                                    {/* Game Recommendations */}
                                    {recommendation.gameRecommendations.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="font-semibold text-green-900">Empfohlene Spiele:</h5>
                                        {recommendation.gameRecommendations.slice(0, 2).map((game) => (
                                          <div key={game.gameId} className="bg-white rounded-lg p-3 border border-green-300">
                                            <div className="flex items-start gap-3">
                                              <span className="text-3xl">{game.emoji}</span>
                                              <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{game.gameName}</div>
                                                <div className="text-sm text-gray-600 mt-1">{game.reason}</div>
                                                {game.zooStory && (
                                                  <div className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                                                    {game.zooStory}
                                                  </div>
                                                )}
                                                {game.exampleTask && (
                                                  <div className="text-xs text-gray-500 mt-2">
                                                    💡 Beispiel: {game.exampleTask}
                                                  </div>
                                                )}
                                              </div>
                                              <Badge variant={game.priority === 'high' ? 'destructive' : 'default'}>
                                                {game.priority === 'high' ? 'Priorität!' : 'Empfohlen'}
                                              </Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Material Support */}
                                    {recommendation.materialSupport.length > 0 && (
                                      <div>
                                        <h5 className="font-semibold text-green-900 mb-2">Materialunterstützung:</h5>
                                        <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                                          {recommendation.materialSupport.map((material, idx) => (
                                            <li key={idx}>{material}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Teacher Script */}
                                    <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                                      <h5 className="font-semibold text-yellow-900 mb-1">💬 Lehrersprache:</h5>
                                      <p className="text-sm text-yellow-800 italic">"{recommendation.teacherScript}"</p>
                                    </div>
                                  </div>
                                )}

                                {/* FEHLER-DETAILS MIT PLATZHALTER-KONTEXT */}
                                <div>
                                  <h5 className="font-semibold mb-3">Konkrete Fehlerbeispiele:</h5>
                                  <div className="space-y-3">
                                    {errorDetails.slice(0, 5).map((detail, idx) => (
                                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="text-sm text-gray-500">
                                            {new Date(detail.createdAt).toLocaleDateString('de-DE', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                          {detail.timeTaken && (
                                            <Badge variant="outline">{detail.timeTaken.toFixed(1)}s</Badge>
                                          )}
                                        </div>
                                        
                                        {/* PLATZHALTER-KONTEXT ANZEIGE */}
                                        <div className="bg-white rounded p-3 mb-2 border-2 border-blue-200">
                                          <div className="text-xs text-gray-500 mb-1">Aufgabenstellung:</div>
                                          <div className="text-center">
                                            {formatPlaceholderContext(
                                              `${detail.number1} ${detail.operation === '+' ? '+' : '−'} ${detail.number2} = ${detail.correctAnswer}`
                                            )}
                                          </div>
                                          {detail.placeholderPosition && detail.placeholderPosition !== 'none' && (
                                            <div className="text-xs text-blue-600 mt-2 text-center">
                                              📍 Platzhalter-Position: <strong>
                                                {detail.placeholderPosition === 'start' ? 'Anfang (inverse Aufgabe!)' :
                                                 detail.placeholderPosition === 'middle' ? 'Mitte (Subtraktion!)' :
                                                 'Ende (Standard)'}
                                              </strong>
                                            </div>
                                          )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div>
                                            <span className="text-gray-500">Schülerantwort:</span>
                                            <span className="ml-2 font-bold text-red-600">
                                              {detail.studentAnswer ?? '—'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Korrekt:</span>
                                            <span className="ml-2 font-bold text-green-600">
                                              {detail.correctAnswer}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {errorDetails.length > 5 && (
                                      <div className="text-center text-sm text-gray-500">
                                        ...und {errorDetails.length - 5} weitere Fehler
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STRATEGIES TAB */}
          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🧠 Strategienutzung</CardTitle>
                <CardDescription>Präferierte Rechenstrategien des Schülers</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(studentStats.strategies.usage).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Keine Strategiedaten verfügbar</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(studentStats.strategies.usage)
                      .sort(([, a], [, b]) => b - a)
                      .map(([strategy, count]) => (
                        <div key={strategy}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium capitalize">{strategy.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-gray-500">{count}x</span>
                          </div>
                          <Progress 
                            value={(count / studentStats.overview.totalTasks) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cognitive Profile */}
            {studentStats.cognitiveProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Kognitives Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Stärken
                      </h4>
                      <ul className="space-y-1">
                        {studentStats.cognitiveProfile.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700">✓ {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Förderbereiche
                      </h4>
                      <ul className="space-y-1">
                        {studentStats.cognitiveProfile.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-gray-700">→ {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>💡 Gezielte Förderempfehlungen</CardTitle>
                <CardDescription>
                  Wissenschaftlich fundierte Interventionsvorschläge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(studentStats.errors.byType)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([errorType, count]) => {
                      const recommendation = recommendationsMap?.[errorType];
                      if (!recommendation) return null;

                      return (
                        <div key={errorType} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {recommendation.errorLabel} ({count}x)
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded p-4">
                              <h4 className="font-semibold text-blue-900 mb-2">Förderziel:</h4>
                              <p className="text-sm text-gray-700">{recommendation.developmentalGoal}</p>
                            </div>

                            {recommendation.gameRecommendations.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-purple-900 mb-3">Empfohlene Spiele:</h4>
                                <div className="grid gap-3">
                                  {recommendation.gameRecommendations.map((game) => (
                                    <div key={game.gameId} className="bg-white rounded-lg p-4 border-2 border-purple-200">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{game.emoji}</span>
                                        <div className="flex-1">
                                          <div className="font-bold text-gray-900">{game.gameName}</div>
                                          <div className="text-sm text-purple-600">{game.focusArea}</div>
                                        </div>
                                        <Badge variant={game.priority === 'high' ? 'destructive' : 'secondary'}>
                                          Level {game.recommendedLevel}
                                        </Badge>
                                      </div>
                                      {game.childExplanation && (
                                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded mt-2">
                                          👦 Für das Kind: {game.childExplanation}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {Object.keys(studentStats.errors.byType).length === 0 && (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto text-green-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Ausgezeichnete Leistung!
                      </h3>
                      <p className="text-gray-600">
                        Keine spezifischen Förderempfehlungen nötig. 
                        Weiter so! 🎉
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
