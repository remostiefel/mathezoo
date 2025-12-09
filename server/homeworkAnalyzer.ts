import { storage } from './storage';
import type { ErrorType } from './errorAnalyzer';
import { db } from './db';
import { learningSessions, tasks } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

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

interface AggregateReport {
  commonErrors: Array<{
    errorType: string;
    affectedStudents: number;
    totalOccurrences: number;
    averageSeverity: string;
  }>;
  averageSuccessRate: number;
  studentsNeedingSupport: Array<{
    studentId: string;
    studentName: string;
    primaryIssue: string;
  }>;
}

class HomeworkAnalyzer {
  /**
   * Extrahiert konkrete fehlgeschlagene Aufgaben eines Schülers für Hausaufgaben-Integration
   */
  async getFailedTasksForHomework(
    studentId: string,
    options: {
      maxTasks?: number;
      errorTypes?: string[];
    } = {}
  ): Promise<Array<{
    operation: '+' | '-';
    number1: number;
    number2: number;
    correctAnswer: number;
    studentAnswer: number;
    errorType: string;
    placeholderPosition: 'none' | 'start' | 'middle' | 'end';
  }>> {
    const { maxTasks = 10, errorTypes } = options;

    // Hole die letzten Sessions des Schülers
    const sessions = await db.query.learningSessions.findMany({
      where: eq(learningSessions.userId, studentId),
      orderBy: [desc(learningSessions.createdAt)],
      limit: 20,
    });

    const failedTasks: any[] = [];

    for (const session of sessions) {
      const sessionTasks = await db.query.tasks.findMany({
        where: eq(tasks.sessionId, session.id),
      });

      for (const task of sessionTasks) {
        if (task.isCorrect === false && task.errorType) {
          // Filter nach errorTypes falls angegeben
          if (!errorTypes || errorTypes.includes(task.errorType)) {
            failedTasks.push({
              operation: task.operation,
              number1: task.number1,
              number2: task.number2,
              correctAnswer: task.correctAnswer,
              studentAnswer: task.studentAnswer || 0,
              errorType: task.errorType,
              placeholderPosition: task.placeholderPosition || 'end',
            });
          }
        }
      }

      if (failedTasks.length >= maxTasks) break;
    }

    return failedTasks.slice(0, maxTasks);
  }

  /**
   * Aggregiert Berichte zu einem Gesamtbild
   */
  aggregateReports(reports: DiagnosticReport[]): AggregateReport {
    if (reports.length === 0) {
      return {
        commonErrors: [],
        averageSuccessRate: 0,
        studentsNeedingSupport: [],
      };
    }

    // Collect all errors across students
    const errorMap = new Map<string, { students: Set<string>; count: number; severities: string[] }>();

    reports.forEach(report => {
      report.errorPatterns.forEach(pattern => {
        const existing = errorMap.get(pattern.errorType) || {
          students: new Set(),
          count: 0,
          severities: [],
        };
        existing.students.add(report.studentId);
        existing.count += pattern.count;
        existing.severities.push(pattern.severity);
        errorMap.set(pattern.errorType, existing);
      });
    });

    // Create common errors list
    const commonErrors = Array.from(errorMap.entries())
      .map(([errorType, data]) => ({
        errorType,
        affectedStudents: data.students.size,
        totalOccurrences: data.count,
        averageSeverity: this.calculateAverageSeverity(data.severities),
      }))
      .sort((a, b) => b.affectedStudents - a.affectedStudents);

    // Calculate average success rate
    const averageSuccessRate = reports.reduce((sum, r) => sum + r.overallSuccessRate, 0) / reports.length;

    // Identify students needing support (success rate < 60%)
    const studentsNeedingSupport = reports
      .filter(r => r.overallSuccessRate < 0.6)
      .map(r => ({
        studentId: r.studentId,
        studentName: r.studentName,
        primaryIssue: r.priorityAreas[0]?.errorType || 'general_difficulty',
      }));

    return {
      commonErrors,
      averageSuccessRate,
      studentsNeedingSupport,
    };
  }

  /**
   * Analysiert mehrere Schüler basierend auf ihren letzten Sessions
   */
  async analyzeStudents(
    studentIds: string[],
    options: {
      sessionCount?: number;
      minTaskCount?: number;
    } = {}
  ): Promise<DiagnosticReport[]> {
    const { sessionCount = 10, minTaskCount = 20 } = options;

    console.log(`📊 Analyzing ${studentIds.length} students with sessionCount=${sessionCount}, minTaskCount=${minTaskCount}`);

    const reports: DiagnosticReport[] = [];

    for (const studentId of studentIds) {
      try {
        const report = await this.analyzeStudent(studentId, { sessionCount, minTaskCount });
        if (report) {
          reports.push(report);
        }
      } catch (error) {
        console.error(`Error analyzing student ${studentId}:`, error);
      }
    }

    console.log(`✅ Generated ${reports.length} diagnostic reports`);
    return reports;
  }

  /**
   * Analysiert einen einzelnen Schüler
   */
  private async analyzeStudent(
    studentId: string,
    options: { sessionCount: number; minTaskCount: number }
  ): Promise<DiagnosticReport | null> {
    const { sessionCount, minTaskCount } = options;

    // Get student info
    const student = await storage.getUser(studentId);
    if (!student) {
      console.warn(`Student ${studentId} not found`);
      return null;
    }

    // Get recent sessions
    const allSessions = await storage.getSessionsByUserId(studentId);
    const recentSessions = allSessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, sessionCount);

    if (recentSessions.length === 0) {
      console.warn(`No sessions found for student ${studentId}`);
      return null;
    }

    // Get tasks from recent sessions
    const taskArrays = await Promise.all(
      recentSessions.map(s => storage.getTasksBySessionId(s.id))
    );
    const tasks = taskArrays.flat();

    if (tasks.length < minTaskCount) {
      console.warn(`Student ${studentId} has only ${tasks.length} tasks (minimum: ${minTaskCount})`);
      // Return partial report if student has at least 3 tasks
      if (tasks.length >= 3) {
        console.log(`Generating partial report for student ${studentId} with ${tasks.length} tasks`);
      } else {
        return null;
      }
    }

    // Calculate statistics
    const totalTasks = tasks.length;
    const correctTasks = tasks.filter(t => t.isCorrect).length;
    const overallSuccessRate = totalTasks > 0 ? correctTasks / totalTasks : 0;

    // Analyze error patterns
    const errorCounts: Record<string, number> = {};
    const errorSeverities: Record<string, string[]> = {};

    tasks.forEach(task => {
      if (!task.isCorrect && task.errorType) {
        errorCounts[task.errorType] = (errorCounts[task.errorType] || 0) + 1;
        if (!errorSeverities[task.errorType]) {
          errorSeverities[task.errorType] = [];
        }
        if (task.errorSeverity) {
          errorSeverities[task.errorType].push(task.errorSeverity);
        }
      }
    });

    const errorPatterns = Object.entries(errorCounts).map(([errorType, count]) => {
      const percentage = (count / totalTasks) * 100;
      const severities = errorSeverities[errorType] || [];
      const avgSeverity = this.calculateAverageSeverity(severities);

      return {
        errorType,
        count,
        percentage,
        severity: avgSeverity,
      };
    }).sort((a, b) => b.count - a.count);

    // Identify priority areas
    const priorityAreas = errorPatterns
      .filter(ep => ep.percentage > 10) // Only errors that occur in >10% of tasks
      .map(ep => ({
        errorType: ep.errorType,
        priority: this.determinePriority(ep.percentage, ep.severity),
        reason: this.getErrorReason(ep.errorType, ep.count, ep.percentage),
      }))
      .slice(0, 5); // Top 5 priority areas

    return {
      studentId,
      studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
      totalTasks,
      correctTasks,
      overallSuccessRate,
      errorPatterns,
      priorityAreas,
    };
  }

  /**
   * Berechnet durchschnittliche Severity aus Array
   */
  private calculateAverageSeverity(severities: string[]): string {
    if (severities.length === 0) return 'moderate';

    const severityScores = { severe: 3, moderate: 2, minor: 1 };
    const avgScore = severities.reduce((sum, s) => {
      return sum + (severityScores[s as keyof typeof severityScores] || 2);
    }, 0) / severities.length;

    if (avgScore >= 2.5) return 'severe';
    if (avgScore >= 1.5) return 'moderate';
    return 'minor';
  }

  /**
   * Bestimmt Priorität basierend auf Häufigkeit und Schweregrad
   */
  private determinePriority(percentage: number, severity: string): 'high' | 'medium' | 'low' {
    if (percentage > 30 || severity === 'severe') return 'high';
    if (percentage > 15 || severity === 'moderate') return 'medium';
    return 'low';
  }

  /**
   * Generiert Begründung für Fehlertyp
   */
  private getErrorReason(errorType: string, count: number, percentage: number): string {
    const reasons: Record<string, string> = {
      counting_error_minus_1: `${count}x (${percentage.toFixed(1)}%) - Kind zählt zu früh auf`,
      counting_error_plus_1: `${count}x (${percentage.toFixed(1)}%) - Kind zählt zu weit`,
      operation_confusion: `${count}x (${percentage.toFixed(1)}%) - Plus/Minus werden verwechselt`,
      place_value: `${count}x (${percentage.toFixed(1)}%) - Stellenwertverständnis fehlt`,
      off_by_ten_minus: `${count}x (${percentage.toFixed(1)}%) - Zehner fehlt (10 zu wenig)`,
      off_by_ten_plus: `${count}x (${percentage.toFixed(1)}%) - Zehner doppelt (10 zu viel)`,
      doubling_error: `${count}x (${percentage.toFixed(1)}%) - Fehler bei Verdopplungsaufgaben`,
      digit_reversal: `${count}x (${percentage.toFixed(1)}%) - Zahlendreher`,
      input_error: `${count}x (${percentage.toFixed(1)}%) - Eingabefehler/Tippfehler`,
    };

    return reasons[errorType] || `${count}x (${percentage.toFixed(1)}%) - Systematischer Fehler`;
  }
}

// Export singleton instance
export const homeworkAnalyzer = new HomeworkAnalyzer();