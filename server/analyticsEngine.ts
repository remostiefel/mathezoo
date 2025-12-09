import type { Task, User, CognitiveProfile } from "@shared/schema";
import type { StrategyLevel } from "./taskGenerator";

export interface ErrorHeatmap {
  taskType: string;
  operation: string;
  errorRate: number;
  totalAttempts: number;
  commonErrors: string[];
}

export interface StrategyTimeline {
  date: string;
  strategies: Record<StrategyLevel, number>;
  dominantStrategy: StrategyLevel;
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  errorHeatmap: ErrorHeatmap[];
  strategyTimeline: StrategyTimeline[];
  zpdProfile: {
    currentLevel: number;
    strengths: string[];
    weaknesses: string[];
    recommendedFocus: string[];
  };
  performanceMetrics: {
    totalTasks: number;
    correctTasks: number;
    successRate: number;
    averageTime: number;
    totalSessions: number;
  };
}

export class AnalyticsEngine {
  
  /**
   * Generate error heatmap for a student
   */
  generateErrorHeatmap(tasks: Task[]): ErrorHeatmap[] {
    const taskGroups: Record<string, Task[]> = {};

    // Group tasks by type and operation
    tasks.forEach(task => {
      const key = `${task.taskType}_${task.operation}`;
      if (!taskGroups[key]) {
        taskGroups[key] = [];
      }
      taskGroups[key].push(task);
    });

    const heatmap: ErrorHeatmap[] = [];

    Object.entries(taskGroups).forEach(([key, groupTasks]) => {
      const [taskType, operation] = key.split('_');
      const totalAttempts = groupTasks.length;
      const errors = groupTasks.filter(t => !t.isCorrect).length;
      const errorRate = totalAttempts > 0 ? errors / totalAttempts : 0;

      // Extract common error types
      const errorTypes = groupTasks
        .filter(t => t.errorType)
        .map(t => t.errorType!);
      
      const errorCounts: Record<string, number> = {};
      errorTypes.forEach(type => {
        errorCounts[type] = (errorCounts[type] || 0) + 1;
      });

      const commonErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);

      heatmap.push({
        taskType,
        operation,
        errorRate,
        totalAttempts,
        commonErrors,
      });
    });

    // Sort by error rate (highest first)
    return heatmap.sort((a, b) => b.errorRate - a.errorRate);
  }

  /**
   * Generate strategy development timeline
   */
  generateStrategyTimeline(tasks: Task[]): StrategyTimeline[] {
    // Group tasks by day
    const tasksByDay: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const date = new Date(task.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!tasksByDay[dateKey]) {
        tasksByDay[dateKey] = [];
      }
      tasksByDay[dateKey].push(task);
    });

    const timeline: StrategyTimeline[] = [];

    Object.entries(tasksByDay).forEach(([date, dayTasks]) => {
      const strategyCounts: Record<string, number> = {
        counting_all: 0,
        counting_on: 0,
        decomposition: 0,
        doubles: 0,
        near_doubles: 0,
        make_ten: 0,
        automatized: 0,
      };

      dayTasks.forEach(task => {
        if (task.strategyUsed) {
          strategyCounts[task.strategyUsed] = (strategyCounts[task.strategyUsed] || 0) + 1;
        }
      });

      const dominantStrategy = Object.entries(strategyCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] as StrategyLevel || "counting_on";

      timeline.push({
        date,
        strategies: strategyCounts as Record<StrategyLevel, number>,
        dominantStrategy,
      });
    });

    // Sort chronologically
    return timeline.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate comprehensive analytics for a student
   */
  async generateStudentAnalytics(
    student: User,
    tasks: Task[],
    profile: CognitiveProfile | undefined,
    sessions: any[]
  ): Promise<StudentAnalytics> {
    const errorHeatmap = this.generateErrorHeatmap(tasks);
    const strategyTimeline = this.generateStrategyTimeline(tasks);

    // Performance metrics
    const totalTasks = tasks.length;
    const correctTasks = tasks.filter(t => t.isCorrect).length;
    const successRate = totalTasks > 0 ? correctTasks / totalTasks : 0;
    
    const times = tasks.filter(t => t.timeTaken).map(t => t.timeTaken!);
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    // ZPD Profile
    const zpdProfile = {
      currentLevel: profile?.currentZPDLevel || 1,
      strengths: profile?.strengths || [],
      weaknesses: profile?.weaknesses || [],
      recommendedFocus: this.getRecommendedFocus(errorHeatmap, profile),
    };

    return {
      studentId: student.id,
      studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unbekannt',
      errorHeatmap,
      strategyTimeline,
      zpdProfile,
      performanceMetrics: {
        totalTasks,
        correctTasks,
        successRate,
        averageTime,
        totalSessions: sessions.length,
      },
    };
  }

  /**
   * Get recommended focus areas based on heatmap and profile
   */
  private getRecommendedFocus(
    heatmap: ErrorHeatmap[],
    profile: CognitiveProfile | undefined
  ): string[] {
    const recommendations: string[] = [];

    // Focus on high-error areas
    const problematicAreas = heatmap.filter(h => h.errorRate > 0.5).slice(0, 3);
    
    problematicAreas.forEach(area => {
      if (area.operation === 'addition' && area.taskType.includes('ten')) {
        recommendations.push('Zehnerübergang bei Addition üben');
      } else if (area.operation === 'subtraction') {
        recommendations.push('Subtraktion verstärken');
      } else if (area.commonErrors.includes('off_by_one')) {
        recommendations.push('Zählgenauigkeit verbessern');
      }
    });

    // Strategy recommendations
    if (profile && profile.strategyPreferences.length > 0) {
      const currentStrategy = profile.strategyPreferences[0];
      
      if (currentStrategy === 'counting_all' || currentStrategy === 'counting_on') {
        recommendations.push('Zerlegungsstrategien einführen');
      } else if (currentStrategy === 'decomposition') {
        recommendations.push('Automatisierung fördern');
      }
    }

    // If no specific recommendations, give general one
    if (recommendations.length === 0) {
      recommendations.push('Weiterhin verschiedene Strategien ausprobieren');
    }

    return recommendations.slice(0, 4);
  }

  /**
   * Generate class-wide analytics for teacher dashboard
   */
  async generateClassAnalytics(
    students: User[],
    allStudentAnalytics: StudentAnalytics[]
  ) {
    const classMetrics = {
      totalStudents: students.length,
      averageSuccessRate: 0,
      averageZPDLevel: 0,
      mostCommonErrors: [] as string[],
      strategyDistribution: {} as Record<StrategyLevel, number>,
    };

    if (allStudentAnalytics.length === 0) {
      return classMetrics;
    }

    // Average success rate
    const successRates = allStudentAnalytics.map(a => a.performanceMetrics.successRate);
    classMetrics.averageSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length;

    // Average ZPD level
    const zpdLevels = allStudentAnalytics.map(a => a.zpdProfile.currentLevel);
    classMetrics.averageZPDLevel = zpdLevels.reduce((a, b) => a + b, 0) / zpdLevels.length;

    // Most common errors across class
    const allErrors: string[] = [];
    allStudentAnalytics.forEach(analytics => {
      analytics.errorHeatmap.forEach(heatmap => {
        allErrors.push(...heatmap.commonErrors);
      });
    });

    const errorCounts: Record<string, number> = {};
    allErrors.forEach(error => {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

    classMetrics.mostCommonErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error]) => error);

    // Strategy distribution
    const allTimelines = allStudentAnalytics.flatMap(a => a.strategyTimeline);
    const strategyTotals: Record<string, number> = {
      counting_all: 0,
      counting_on: 0,
      decomposition: 0,
      doubles: 0,
      near_doubles: 0,
      make_ten: 0,
      automatized: 0,
    };

    allTimelines.forEach(timeline => {
      Object.entries(timeline.strategies).forEach(([strategy, count]) => {
        strategyTotals[strategy] = (strategyTotals[strategy] || 0) + count;
      });
    });

    classMetrics.strategyDistribution = strategyTotals as Record<StrategyLevel, number>;

    return classMetrics;
  }
}

export const analyticsEngine = new AnalyticsEngine();
