import type { ErrorType } from './errorAnalyzer';
import { competencyBasedGenerator, type OperativePattern } from './competencyBasedGenerator';

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
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

export interface HomeworkTheme {
  id: string;
  name: string;
  description: string;

  // Didaktischer Kontext
  focusArea: string;
  competencyGoals: string[];
  operativePatterns: OperativePattern[];

  // Fehler-Bezug
  addressedErrors: ErrorType[];

  // Priorisierung
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  applicableStudents: string[];

  // Aufgaben-Konfiguration
  recommendedTaskCount: number;
  numberRange: number;
}

class HomeworkThemeRecommender {
  /**
   * Generiert Themen basierend auf diagnostischen Berichten
   */
  generateThemes(
    diagnosticReports: DiagnosticReport[],
    options: {
      maxThemes?: number;
      minRelevanceScore?: number;
    } = {}
  ): HomeworkTheme[] {
    const { maxThemes = 8, minRelevanceScore = 10 } = options;

    console.log(`🎯 Generating themes for ${diagnosticReports.length} students`);

    // Sammle alle Error-Patterns von allen Schülern
    const allErrorPatterns: Array<{
      errorType: string;
      priority: 'high' | 'medium' | 'low';
      studentIds: string[];
      totalOccurrences: number;
    }> = [];

    diagnosticReports.forEach(report => {
      report.priorityAreas.forEach(area => {
        const existing = allErrorPatterns.find(p => p.errorType === area.errorType);
        if (existing) {
          existing.studentIds.push(report.studentId);
          existing.totalOccurrences += 1;
        } else {
          allErrorPatterns.push({
            errorType: area.errorType,
            priority: area.priority,
            studentIds: [report.studentId],
            totalOccurrences: 1,
          });
        }
      });
    });

    console.log(`📊 Found ${allErrorPatterns.length} error priorities:`, allErrorPatterns.map(p => p.errorType));

    const themes: HomeworkTheme[] = [];

    // IMMER Standard-Themen generieren (auch wenn Fehler gefunden wurden)
    // Dies stellt sicher, dass immer Aufgaben vorhanden sind
    themes.push(...this.generateDefaultPracticeThemes(diagnosticReports));

    // Wenn zusätzlich Fehler gefunden wurden → füge fehler-spezifische Themen hinzu
    if (allErrorPatterns.length > 0) {
      // Für jedes Error-Pattern: Generiere zusätzliche fehler-spezifische Themen
      allErrorPatterns.forEach(pattern => {
        const themeForError = this.createThemeForErrorPattern(pattern, diagnosticReports);
        if (themeForError) {
          themes.push(themeForError);
        }
      });
    }

    // Sortiere nach Relevanz und nehme die besten
    const sortedThemes = themes.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topThemes = sortedThemes.slice(0, maxThemes);

    console.log(`✅ Total themes created: ${topThemes.length} (best ${maxThemes} by relevanceScore)`);

    return topThemes;
  }

  /**
   * Aggregiert Fehler-Prioritäten über alle Schüler
   */
  private aggregateErrorPriorities(reports: DiagnosticReport[]) {
    const errorMap = new Map<string, {
      students: string[];
      priorities: string[];
      percentages: number[];
    }>();

    reports.forEach(report => {
      report.priorityAreas.forEach(area => {
        const existing = errorMap.get(area.errorType) || {
          students: [],
          priorities: [],
          percentages: [],
        };

        existing.students.push(report.studentId);
        existing.priorities.push(area.priority);

        const errorPattern = report.errorPatterns.find(ep => ep.errorType === area.errorType);
        if (errorPattern) {
          existing.percentages.push(errorPattern.percentage);
        }

        errorMap.set(area.errorType, existing);
      });
    });

    return Array.from(errorMap.entries()).map(([errorType, data]) => ({
      errorType,
      students: data.students,
      priority: this.calculateOverallPriority(data.priorities),
      avgPercentage: data.percentages.reduce((sum, p) => sum + p, 0) / data.percentages.length,
    }));
  }

  /**
   * Erstellt ein Thema für einen spezifischen Fehlertyp
   */
  private createThemeForError(
    errorType: string,
    students: string[],
    priority: 'high' | 'medium' | 'low',
    avgPercentage: number
  ): HomeworkTheme | null {
    const themeConfigs: Record<string, Partial<HomeworkTheme>> = {
      counting_error_minus_1: {
        name: 'Zählfehler: Ablösung vom zählenden Rechnen',
        description: 'Strategisches Rechnen statt Zählen - Aufbau strukturierter Rechenwege durch Kraft der 5',
        focusArea: 'Ablösung vom zählenden Rechnen',
        competencyGoals: ['Kraft der 5 nutzen', 'Nachbaraufgaben ableiten', 'Kernaufgaben automatisieren'],
        operativePatterns: ['constant_sum', 'neighbor_tasks', 'doubling'],
        addressedErrors: ['counting_error_minus_1', 'counting_error_plus_1'],
        numberRange: 20,
        recommendedTaskCount: 12,
      },
      counting_error_plus_1: {
        name: 'Zählfehler: Nachbaraufgaben statt weiterzählen',
        description: 'Vom Zählen zu Nachbaraufgaben - strukturierte Rechenwege aufbauen',
        focusArea: 'Ablösung vom zählenden Rechnen',
        competencyGoals: ['Nachbaraufgaben nutzen', 'Kernaufgaben erkennen', 'Herleiten statt zählen'],
        operativePatterns: ['neighbor_tasks', 'constant_sum', 'core_task_doubling'],
        addressedErrors: ['counting_error_plus_1', 'counting_error_minus_1'],
        numberRange: 20,
        recommendedTaskCount: 12,
      },
      operation_confusion: {
        name: 'Operationsverwechslung: Plus und Minus unterscheiden',
        description: 'Sichere Unterscheidung von Addition und Subtraktion',
        focusArea: 'Operationsverständnis',
        competencyGoals: ['Operationen unterscheiden', 'Aufgaben bewusst lesen', 'Symbole zuordnen'],
        operativePatterns: ['inverse', 'exchange'],
        addressedErrors: ['operation_confusion'],
        numberRange: 20,
        recommendedTaskCount: 10,
      },
      place_value: {
        name: 'Stellenwert: Zehner und Einer verstehen',
        description: 'Stellenwertverständnis aufbauen - Zahlen in Zehner und Einer zerlegen',
        focusArea: 'Stellenwertverständnis',
        competencyGoals: ['Zehner erkennen', 'Zahlen zerlegen', 'Bündelung verstehen'],
        operativePatterns: ['analogy_place_value', 'decade_steps'],
        addressedErrors: ['place_value', 'off_by_ten_minus', 'off_by_ten_plus'],
        numberRange: 100,
        recommendedTaskCount: 15,
      },
      off_by_ten_minus: {
        name: 'Zehnerübergang: Addition über die Zehn',
        description: 'Sicherer Übergang über die Zehn beim Addieren - schrittweises Rechnen',
        focusArea: 'Zehnerübergang Addition',
        competencyGoals: ['Zehner bilden', 'Schrittweises Rechnen', 'Zerlegungsstrategien'],
        operativePatterns: ['decade_transition', 'decomposition'],
        addressedErrors: ['off_by_ten_minus', 'off_by_ten_plus'],
        numberRange: 20,
        recommendedTaskCount: 12,
      },
      off_by_ten_plus: {
        name: 'Zehnerübergang: Subtraktion über die Zehn',
        description: 'Sicherer Übergang über die Zehn beim Subtrahieren - Ergänzungsstrategien',
        focusArea: 'Zehnerübergang Subtraktion',
        competencyGoals: ['Rückwärts über die 10', 'Ergänzungsstrategien', 'Umkehraufgaben'],
        operativePatterns: ['decade_transition', 'inverse'],
        addressedErrors: ['off_by_ten_minus', 'off_by_ten_plus'],
        numberRange: 20,
        recommendedTaskCount: 12,
      },
      doubling_error: {
        name: 'Verdopplungsaufgaben: Kernaufgaben automatisieren',
        description: 'Verdopplungen und wichtige Grundaufgaben sicher beherrschen',
        focusArea: 'Kernaufgaben & Verdoppeln',
        competencyGoals: ['Verdopplungen automatisieren', 'Halbierungen ableiten', 'Blitzrechnen'],
        operativePatterns: ['core_task_doubling', 'neighbor_tasks'],
        addressedErrors: ['doubling_error'],
        numberRange: 20,
        recommendedTaskCount: 10,
      },
      digit_reversal: {
        name: 'Zahlendreher: Zahlen richtig erfassen',
        description: 'Zahlen korrekt lesen und schreiben - Stellenwert beachten',
        focusArea: 'Zahlenerfassung',
        competencyGoals: ['Zahlen genau lesen', 'Stellenwert beachten', 'Selbstkontrolle'],
        operativePatterns: ['analogy_place_value', 'constant_sum'],
        addressedErrors: ['digit_reversal'],
        numberRange: 100,
        recommendedTaskCount: 10,
      },
      input_error: {
        name: 'Eingabefehler: Genauigkeit und Selbstkontrolle',
        description: 'Sorgfältiges Arbeiten und Selbstkontrolle trainieren',
        focusArea: 'Sorgfalt & Kontrolle',
        competencyGoals: ['Genau arbeiten', 'Ergebnis prüfen', 'Selbstkontrolle'],
        operativePatterns: ['exchange', 'inverse'],
        addressedErrors: ['input_error'],
        numberRange: 20,
        recommendedTaskCount: 8,
      },
      // Neue Konfigurationen für verwandte Aufgaben
      related_tasks_sum: {
        name: 'Verwandte Aufgaben (Addition)',
        description: 'Aufgabenfamilien zur Addition: Umkehr-, Tausch- und Platzhalteraufgaben',
        focusArea: 'Aufgabenfamilien Addition',
        competencyGoals: ['Addition und Subtraktion verbinden', 'Rechengesetze verstehen', 'Platzhalter nutzen'],
        operativePatterns: ['inverse', 'exchange', 'missing_addend', 'missing_subtrahend'],
        addressedErrors: ['operation_confusion', 'place_value', 'input_error'], // Könnte auf verschiedene Fehler zutreffen
        numberRange: 20,
        recommendedTaskCount: 10,
      },
      related_tasks_subtraction: {
        name: 'Verwandte Aufgaben (Subtraktion)',
        description: 'Aufgabenfamilien zur Subtraktion: Umkehr-, Tausch- und Platzhalteraufgaben',
        focusArea: 'Aufgabenfamilien Subtraktion',
        competencyGoals: ['Addition und Subtraktion verbinden', 'Rechengesetze verstehen', 'Platzhalter nutzen'],
        operativePatterns: ['inverse', 'exchange', 'missing_addend', 'missing_subtrahend'],
        addressedErrors: ['operation_confusion', 'place_value', 'input_error'], // Könnte auf verschiedene Fehler zutreffen
        numberRange: 20,
        recommendedTaskCount: 10,
      },
    };

    const config = themeConfigs[errorType];
    if (!config) {
      console.warn(`No theme config found for error type: ${errorType}`);
      return null;
    }

    // Berechne Relevanz-Score - DEUTLICH GESENKT für mehr Themen
    const relevanceScore = this.calculateRelevanceScore(students.length, priority, avgPercentage);

    return {
      id: `theme-${errorType}-${Date.now()}`,
      ...config,
      addressedErrors: config.addressedErrors || [errorType as ErrorType],
      operativePatterns: config.operativePatterns || [],
      priority,
      relevanceScore,
      applicableStudents: students,
    } as HomeworkTheme;
  }

  /**
   * Erstellt ein Thema für ein spezifisches Fehler-Pattern aus der Analyse.
   * Nimmt die gesammelten Muster (Pattern) und die originalen Berichte.
   */
  private createThemeForErrorPattern(
    pattern: {
      errorType: string;
      priority: 'high' | 'medium' | 'low';
      studentIds: string[];
      totalOccurrences: number;
    },
    diagnosticReports: DiagnosticReport[]
  ): HomeworkTheme | null {
    // Finde den relevantesten Diagnosebericht für diesen Fehlertyp, um Durchschnittswerte zu erhalten.
    // Wenn mehrere Berichte denselben Fehlertyp haben, nehmen wir den ersten.
    const relevantReport = diagnosticReports.find(report =>
      report.priorityAreas.some(area => area.errorType === pattern.errorType)
    );

    if (!relevantReport) {
      console.warn(`Could not find a relevant diagnostic report for error type: ${pattern.errorType}`);
      return null; // Sollte nicht passieren, wenn pattern korrekt generiert wurde
    }

    // Finde das spezifische errorPattern im gefundenen Report, um den Prozentsatz zu bekommen
    const errorPatternInReport = relevantReport.errorPatterns.find(ep => ep.errorType === pattern.errorType);
    const avgPercentage = errorPatternInReport ? errorPatternInReport.percentage : 0;

    return this.createThemeForError(
      pattern.errorType,
      pattern.studentIds,
      pattern.priority,
      avgPercentage
    );
  }

  /**
   * Berechnet Gesamt-Priorität aus Array
   */
  private calculateOverallPriority(priorities: string[]): 'high' | 'medium' | 'low' {
    const highCount = priorities.filter(p => p === 'high').length;
    const mediumCount = priorities.filter(p => p === 'medium').length;

    if (highCount >= priorities.length / 2) return 'high';
    if (mediumCount + highCount >= priorities.length / 2) return 'medium';
    return 'low';
  }

  /**
   * Berechnet Relevanz-Score (0-100)
   * GESENKT: Selbst einzelne Fehler bekommen mindestens Score 15
   */
  private calculateRelevanceScore(
    studentCount: number,
    priority: string,
    avgPercentage: number
  ): number {
    const studentScore = Math.min(studentCount * 15, 30); // Gesenkt: Max 30 Punkte
    const priorityScore = priority === 'high' ? 25 : priority === 'medium' ? 15 : 10; // Gesenkt
    const frequencyScore = Math.min(avgPercentage / 3, 20); // Gesenkt: Max 20 Punkte

    // Mindest-Score von 15 für jedes erkannte Muster
    const baseScore = Math.round(studentScore + priorityScore + frequencyScore);
    return Math.max(15, baseScore);
  }

  /**
   * Generiert Standard-Themen wenn keine Fehler gefunden wurden
   */
  private generateDefaultPracticeThemes(diagnosticReports: DiagnosticReport[]): HomeworkTheme[] {
    console.log('⚠️ No specific errors found or generating default themes for all students');

    // Identifiziere alle Schüler, die noch nicht mit MatheZoo gerechnet haben,
    // oder für die keine spezifischen Fehler gemeldet wurden.
    const studentsWithoutSpecificErrors = diagnosticReports
      .filter(report => report.priorityAreas.length === 0)
      .map(report => report.studentId);

    // Wenn alle Schüler spezifische Fehler haben, füge alle Schüler hinzu.
    // Ansonsten füge nur die Schüler hinzu, die keine spezifischen Fehler haben.
    const applicableStudentsForDefaults = studentsWithoutSpecificErrors.length === 0 ?
      diagnosticReports.map(report => report.studentId) :
      studentsWithoutSpecificErrors;

    return [
      {
        id: `theme-default-addition-${Date.now()}`,
        name: 'Addition im Zahlenraum 20',
        description: 'Grundlegende Additionsaufgaben mit erkennbaren Mustern',
        focusArea: 'Addition ZR20',
        competencyGoals: ['Addition festigen', 'Muster erkennen', 'Strategien nutzen'],
        operativePatterns: ['constant_sum', 'neighbor_tasks'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-subtraction-${Date.now()}`,
        name: 'Subtraktion im Zahlenraum 20',
        description: 'Grundlegende Subtraktionsaufgaben mit erkennbaren Mustern',
        focusArea: 'Subtraktion ZR20',
        competencyGoals: ['Subtraktion festigen', 'Umkehraufgaben nutzen', 'Muster erkennen'],
        operativePatterns: ['constant_difference', 'inverse'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-core-doubling-${Date.now()}`,
        name: 'Verdopplungsaufgaben',
        description: 'Kernaufgaben mit Verdoppeln automatisieren',
        focusArea: 'Kernaufgaben Verdoppeln',
        competencyGoals: ['Verdopplungen', 'Halbierungen ableiten'],
        operativePatterns: ['core_task_doubling'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-core-ten-${Date.now()}`,
        name: 'Partnerzahlen zur 10',
        description: 'Zerlegungen der 10 festigen',
        focusArea: 'Partnerzahlen zur 10',
        competencyGoals: ['Partnerzahlen zur 10', 'Ergänzen zur 10'],
        operativePatterns: ['core_task_to_ten'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-transition-${Date.now()}`,
        name: 'Zehnerübergang',
        description: 'Rechnen über die 10 hinweg',
        focusArea: 'Zehnerübergang',
        competencyGoals: ['Zehnerübergang Addition', 'Zehnerübergang Subtraktion'],
        operativePatterns: ['decade_steps'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-exchange-${Date.now()}`,
        name: 'Tauschaufgaben',
        description: 'Kommutativität nutzen (a+b = b+a)',
        focusArea: 'Tauschaufgaben',
        competencyGoals: ['Kommutativität verstehen', 'Flexibles Rechnen'],
        operativePatterns: ['exchange'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      },
      {
        id: `theme-default-analogy-${Date.now()}`,
        name: 'Analogie-Aufgaben',
        description: 'Muster auf größere Zahlen übertragen',
        focusArea: 'Analogien',
        competencyGoals: ['Analogien erkennen', 'Strukturen übertragen'],
        operativePatterns: ['analogy_place_value'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 100,
      },
      {
        id: `theme-default-mixed-${Date.now()}`,
        name: 'Gemischte Aufgaben',
        description: 'Addition und Subtraktion kombiniert',
        focusArea: 'Gemischte Übungen',
        competencyGoals: ['Flexibilität', 'Alle Strategien anwenden'],
        operativePatterns: ['plus_minus_one', 'neighbor_tasks'],
        addressedErrors: [],
        priority: 'medium' as const,
        relevanceScore: 50,
        applicableStudents: applicableStudentsForDefaults,
        recommendedTaskCount: 15,
        numberRange: 20,
      }
    ];
  }
}

// Export singleton instance
export const homeworkThemeRecommender = new HomeworkThemeRecommender();