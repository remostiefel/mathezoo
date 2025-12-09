import type { Task, CognitiveProfile } from "@shared/schema";
import type { StrategyLevel } from "./taskGenerator";

/**
 * Bayesianische Diagnose-Engine mit 5-Ebenen-Analyse:
 * 1. Prozessebene: Wie löst das Kind die Aufgabe? (Repräsentationen, Schrittfolge)
 * 2. Strategieebene: Welche mathematische Strategie wird verwendet?
 * 3. Zeitebene: Wie schnell/langsam arbeitet das Kind?
 * 4. Musterebene: Welche Aufgabentypen gelingen/misslingen?
 * 5. Emotionsebene: Frustration, Selbstvertrauen (abgeleitet aus Verhalten)
 */

export interface BayesianInference {
  // Prozessebene
  processProfile: {
    preferredRepresentations: string[];
    representationFlexibility: number; // 0-1
    stepSystematics: number; // 0-1 (wie systematisch sind die Schritte)
  };
  
  // Strategieebene
  strategyProfile: {
    dominantStrategy: StrategyLevel;
    strategyDistribution: Record<StrategyLevel, number>; // Wahrscheinlichkeiten
    strategyFlexibility: number; // 0-1
  };
  
  // Zeitebene
  timeProfile: {
    averageSpeed: number; // ms pro Aufgabe
    speedVariability: number; // Standardabweichung
    speedTrend: "improving" | "stable" | "declining";
  };
  
  // Musterebene
  patternProfile: {
    errorProbabilities: Record<string, number>; // Aufgabentyp -> Fehlerwahrscheinlichkeit
    masteredPatterns: string[];
    strugglingPatterns: string[];
  };
  
  // Emotionsebene
  emotionalProfile: {
    frustrationIndicators: number; // 0-1
    confidenceLevel: number; // 0-1
    persistenceLevel: number; // 0-1
  };

  // Gesamtbewertung
  zpdLevel: number; // 1-5 (Zone of Proximal Development)
  recommendedDifficulty: number; // 1-5
  recommendedStrategies: StrategyLevel[];
}

export class BayesianDiagnosticEngine {
  
  /**
   * Führt bayesianische Inferenz über alle Ebenen durch
   */
  async diagnose(
    userId: string,
    recentTasks: Task[],
    currentProfile?: CognitiveProfile
  ): Promise<BayesianInference> {
    
    if (recentTasks.length === 0) {
      return this.getDefaultInference();
    }

    // Ebene 1: Prozessanalyse
    const processProfile = this.analyzeProcess(recentTasks);
    
    // Ebene 2: Strategieanalyse
    const strategyProfile = this.analyzeStrategies(recentTasks);
    
    // Ebene 3: Zeitanalyse
    const timeProfile = this.analyzeTime(recentTasks);
    
    // Ebene 4: Musteranalyse
    const patternProfile = this.analyzePatterns(recentTasks);
    
    // Ebene 5: Emotionsanalyse
    const emotionalProfile = this.analyzeEmotions(recentTasks, timeProfile);
    
    // ZPD-Level berechnen (Bayesian Update)
    const zpdLevel = this.calculateZPD(
      processProfile,
      strategyProfile,
      timeProfile,
      patternProfile,
      emotionalProfile,
      currentProfile
    );

    // Empfehlungen ableiten
    const recommendedDifficulty = this.recommendDifficulty(zpdLevel, patternProfile);
    const recommendedStrategies = this.recommendStrategies(strategyProfile, patternProfile);

    return {
      processProfile,
      strategyProfile,
      timeProfile,
      patternProfile,
      emotionalProfile,
      zpdLevel,
      recommendedDifficulty,
      recommendedStrategies,
    };
  }

  /**
   * Prozessebene: Analyse der Repräsentationen und Schrittfolgen
   */
  private analyzeProcess(tasks: Task[]) {
    const allRepresentations: string[] = [];
    let systematicSteps = 0;

    tasks.forEach(task => {
      if (task.representationsUsed && task.representationsUsed.length > 0) {
        allRepresentations.push(...task.representationsUsed);
      }

      // Systematik: weniger Schritte bei gleicher Korrektheit = systematischer
      if (task.isCorrect && task.solutionSteps && task.solutionSteps.length > 0) {
        const efficiency = Math.max(0, 1 - (task.solutionSteps.length / 15));
        systematicSteps += efficiency;
      }
    });

    // Häufigste Repräsentationen
    const repCounts: Record<string, number> = {};
    allRepresentations.forEach(rep => {
      repCounts[rep] = (repCounts[rep] || 0) + 1;
    });

    const preferredRepresentations = Object.entries(repCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([rep]) => rep);

    // Flexibilität: Anzahl verschiedener Repräsentationen / mögliche Repräsentationen
    const uniqueReps = new Set(allRepresentations).size;
    const representationFlexibility = Math.min(1, uniqueReps / 4);

    const stepSystematics = tasks.length > 0 ? systematicSteps / tasks.length : 0.5;

    return {
      preferredRepresentations,
      representationFlexibility,
      stepSystematics,
    };
  }

  /**
   * Strategieebene: Bayesianische Strategie-Inferenz
   */
  private analyzeStrategies(tasks: Task[]) {
    const strategyCounts: Record<string, number> = {
      counting_all: 0,
      counting_on: 0,
      decomposition: 0,
      doubles: 0,
      near_doubles: 0,
      make_ten: 0,
      automatized: 0,
    };

    tasks.forEach(task => {
      if (task.strategyUsed) {
        strategyCounts[task.strategyUsed] = (strategyCounts[task.strategyUsed] || 0) + 1;
      }
    });

    const total = Object.values(strategyCounts).reduce((a, b) => a + b, 0);
    
    // Wahrscheinlichkeitsverteilung (Bayesian Prior Update)
    const strategyDistribution = {} as Record<StrategyLevel, number>;
    Object.entries(strategyCounts).forEach(([strategy, count]) => {
      strategyDistribution[strategy as StrategyLevel] = total > 0 ? count / total : 0;
    });

    // Dominante Strategie
    const dominantStrategy = Object.entries(strategyDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as StrategyLevel || "counting_on";

    // Flexibilität: Anzahl verwendeter Strategien
    const usedStrategies = Object.values(strategyCounts).filter(c => c > 0).length;
    const strategyFlexibility = Math.min(1, usedStrategies / 5);

    return {
      dominantStrategy,
      strategyDistribution,
      strategyFlexibility,
    };
  }

  /**
   * Zeitebene: Geschwindigkeitsanalyse
   */
  private analyzeTime(tasks: Task[]) {
    const times = tasks
      .filter(t => t.timeTaken != null)
      .map(t => t.timeTaken!);

    if (times.length === 0) {
      return {
        averageSpeed: 10000,
        speedVariability: 0,
        speedTrend: "stable" as const,
      };
    }

    const averageSpeed = times.reduce((a, b) => a + b, 0) / times.length;
    
    // Standardabweichung
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageSpeed, 2), 0) / times.length;
    const speedVariability = Math.sqrt(variance);

    // Trend: vergleiche erste Hälfte mit zweiter Hälfte
    const midpoint = Math.floor(times.length / 2);
    const firstHalf = times.slice(0, midpoint);
    const secondHalf = times.slice(midpoint);
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const speedTrend = 
      avgSecond < avgFirst * 0.9 ? "improving" :
      avgSecond > avgFirst * 1.1 ? "declining" :
      "stable";

    return {
      averageSpeed,
      speedVariability,
      speedTrend,
    };
  }

  /**
   * Musterebene: Fehlerwahrscheinlichkeiten nach Aufgabentyp
   * Erweitert um Wertziffern und Strukturkomplexität
   */
  private analyzePatterns(tasks: Task[]) {
    const patternStats: Record<string, { total: number; errors: number }> = {};
    const digitStats: Record<number, { total: number; errors: number }> = {}; // Nach Wertziffern
    const complexityStats: { complement: { total: number; errors: number }; transition: { total: number; errors: number } } = {
      complement: { total: 0, errors: 0 },
      transition: { total: 0, errors: 0 },
    };

    tasks.forEach(task => {
      const key = `${task.operation}_${task.taskType}`;
      
      if (!patternStats[key]) {
        patternStats[key] = { total: 0, errors: 0 };
      }
      
      patternStats[key].total += 1;
      if (!task.isCorrect) {
        patternStats[key].errors += 1;
      }
      
      // Wertziffern-Statistik
      const digitCount = task.digitCount || 2;
      if (!digitStats[digitCount]) {
        digitStats[digitCount] = { total: 0, errors: 0 };
      }
      digitStats[digitCount].total += 1;
      if (!task.isCorrect) {
        digitStats[digitCount].errors += 1;
      }
      
      // Ergänzung vs. Übergang
      const result = task.operation === '+' ? task.number1 + task.number2 : task.number1 - task.number2;
      const isComplement = result > 0 && result % 10 === 0;
      const hasTransition = !isComplement && (
        (task.operation === '+' && Math.floor(task.number1 / 10) !== Math.floor(result / 10)) ||
        (task.operation === '-' && Math.floor(task.number1 / 10) !== Math.floor(result / 10))
      );
      
      if (isComplement) {
        complexityStats.complement.total += 1;
        if (!task.isCorrect) complexityStats.complement.errors += 1;
      } else if (hasTransition) {
        complexityStats.transition.total += 1;
        if (!task.isCorrect) complexityStats.transition.errors += 1;
      }
    });

    const errorProbabilities: Record<string, number> = {};
    const masteredPatterns: string[] = [];
    const strugglingPatterns: string[] = [];

    Object.entries(patternStats).forEach(([pattern, stats]) => {
      const errorRate = stats.errors / stats.total;
      errorProbabilities[pattern] = errorRate;

      if (errorRate < 0.2 && stats.total >= 3) {
        masteredPatterns.push(pattern);
      } else if (errorRate > 0.5 && stats.total >= 3) {
        strugglingPatterns.push(pattern);
      }
    });
    
    // Erweiterte Muster für Wertziffern
    Object.entries(digitStats).forEach(([digits, stats]) => {
      const errorRate = stats.errors / stats.total;
      const digitPattern = `digits_${digits}`;
      errorProbabilities[digitPattern] = errorRate;
      
      if (errorRate > 0.6 && stats.total >= 3) {
        strugglingPatterns.push(`Wertziffern: ${digits}`);
      }
    });
    
    // Ergänzung/Übergang-Muster
    if (complexityStats.complement.total >= 3) {
      const complementErrorRate = complexityStats.complement.errors / complexityStats.complement.total;
      errorProbabilities['complement'] = complementErrorRate;
      if (complementErrorRate < 0.2) masteredPatterns.push('Zehnerergänzung');
      else if (complementErrorRate > 0.5) strugglingPatterns.push('Zehnerergänzung');
    }
    
    if (complexityStats.transition.total >= 3) {
      const transitionErrorRate = complexityStats.transition.errors / complexityStats.transition.total;
      errorProbabilities['transition'] = transitionErrorRate;
      if (transitionErrorRate < 0.2) masteredPatterns.push('Zehnerübergang');
      else if (transitionErrorRate > 0.5) strugglingPatterns.push('Zehnerübergang');
    }

    return {
      errorProbabilities,
      masteredPatterns,
      strugglingPatterns,
    };
  }

  /**
   * Emotionsebene: Ableitung aus Verhaltensdaten
   */
  private analyzeEmotions(tasks: Task[], timeProfile: any) {
    let frustrationIndicators = 0;
    let confidenceLevel = 0.5;
    let persistenceLevel = 0.5;

    // Frustration: Steigende Fehlerrate + steigende Zeit
    const recentErrors = tasks.slice(-5).filter(t => !t.isCorrect).length;
    if (recentErrors >= 3 && timeProfile.speedTrend === "declining") {
      frustrationIndicators = 0.7;
    } else if (recentErrors >= 2) {
      frustrationIndicators = 0.4;
    }

    // Confidence: Basiert auf Erfolgsrate
    const successRate = tasks.filter(t => t.isCorrect).length / tasks.length;
    confidenceLevel = successRate;

    // Persistence: Wenige Aufgaben bei hoher Fehlerrate = niedrige Persistenz
    if (tasks.length < 5 && successRate < 0.5) {
      persistenceLevel = 0.3;
    } else if (tasks.length >= 10) {
      persistenceLevel = 0.8;
    }

    return {
      frustrationIndicators,
      confidenceLevel,
      persistenceLevel,
    };
  }

  /**
   * ZPD-Level berechnen (Bayesian Update mit Prior)
   */
  private calculateZPD(
    processProfile: any,
    strategyProfile: any,
    timeProfile: any,
    patternProfile: any,
    emotionalProfile: any,
    currentProfile?: CognitiveProfile
  ): number {
    // Prior (bisheriges ZPD-Level)
    const prior = currentProfile?.currentZPDLevel || 3;

    // Likelihood basierend auf aktuellen Daten
    let likelihood = 3;

    // Strategie-Beitrag
    const strategyLevels: Record<StrategyLevel, number> = {
      counting_all: 1,
      counting_on: 2,
      decomposition: 3,
      doubles: 3,
      near_doubles: 4,
      make_ten: 4,
      automatized: 5,
    };
    
    const strategyContribution = strategyLevels[strategyProfile.dominantStrategy] || 3;

    // Zeit-Beitrag (schneller = höheres Level)
    const timeContribution = 
      timeProfile.averageSpeed < 5000 ? 1 :
      timeProfile.averageSpeed < 10000 ? 0 :
      -1;

    // Muster-Beitrag (weniger Fehler = höheres Level)
    const errorRate = Object.values(patternProfile.errorProbabilities).reduce((a: number, b: number) => a + b, 0) / 
                      Math.max(1, Object.keys(patternProfile.errorProbabilities).length);
    const patternContribution = errorRate < 0.2 ? 1 : errorRate > 0.5 ? -1 : 0;

    // Bayesian Update: gewichteter Durchschnitt aus Prior und Likelihood
    likelihood = strategyContribution + timeContribution + patternContribution;
    const posteriorZPD = (prior * 0.6 + likelihood * 0.4);

    return Math.max(1, Math.min(5, Math.round(posteriorZPD)));
  }

  /**
   * Schwierigkeitsempfehlung
   */
  private recommendDifficulty(zpdLevel: number, patternProfile: any): number {
    // ZPD: Nicht zu leicht, nicht zu schwer
    let difficulty = zpdLevel;

    // Anpassung bei struggling patterns
    if (patternProfile.strugglingPatterns.length > 2) {
      difficulty = Math.max(1, difficulty - 1);
    }

    return difficulty;
  }

  /**
   * Strategieempfehlungen
   */
  private recommendStrategies(strategyProfile: any, patternProfile: any): StrategyLevel[] {
    const recommendations: StrategyLevel[] = [];

    // Progression path
    const progression: StrategyLevel[] = [
      "counting_all",
      "counting_on",
      "doubles",
      "near_doubles",
      "decomposition",
      "make_ten",
      "automatized",
    ];

    const currentIndex = progression.indexOf(strategyProfile.dominantStrategy);
    
    // Empfehle aktuelle + nächste Strategie
    recommendations.push(strategyProfile.dominantStrategy);
    
    if (currentIndex < progression.length - 1 && strategyProfile.strategyDistribution[strategyProfile.dominantStrategy] > 0.6) {
      recommendations.push(progression[currentIndex + 1]);
    }

    return recommendations;
  }

  /**
   * Default-Inferenz für neue Nutzer
   */
  private getDefaultInference(): BayesianInference {
    return {
      processProfile: {
        preferredRepresentations: ["twenty_frame", "counters"],
        representationFlexibility: 0.3,
        stepSystematics: 0.5,
      },
      strategyProfile: {
        dominantStrategy: "counting_on",
        strategyDistribution: {
          counting_all: 0.4,
          counting_on: 0.6,
          decomposition: 0,
          doubles: 0,
          near_doubles: 0,
          make_ten: 0,
          automatized: 0,
        },
        strategyFlexibility: 0.2,
      },
      timeProfile: {
        averageSpeed: 10000,
        speedVariability: 3000,
        speedTrend: "stable",
      },
      patternProfile: {
        errorProbabilities: {},
        masteredPatterns: [],
        strugglingPatterns: [],
      },
      emotionalProfile: {
        frustrationIndicators: 0.2,
        confidenceLevel: 0.6,
        persistenceLevel: 0.7,
      },
      zpdLevel: 2,
      recommendedDifficulty: 2,
      recommendedStrategies: ["counting_on", "doubles"],
    };
  }

  /**
   * Update cognitive profile based on Bayesian inference
   */
  async updateCognitiveProfile(
    userId: string,
    inference: BayesianInference,
    storage: any
  ): Promise<void> {
    const profile = await storage.getCognitiveProfile(userId);

    const updateData = {
      strategyPreferences: inference.recommendedStrategies,
      currentZPDLevel: inference.zpdLevel,
      successRate: inference.emotionalProfile.confidenceLevel,
      averageTimePerTask: Math.round(inference.timeProfile.averageSpeed),
      errorProbabilities: inference.patternProfile.errorProbabilities,
      strategyUsage: inference.strategyProfile.strategyDistribution,
      lastDiagnosisDate: new Date(),
      strengths: inference.patternProfile.masteredPatterns,
      weaknesses: inference.patternProfile.strugglingPatterns,
    };

    if (profile) {
      await storage.updateCognitiveProfile(userId, updateData);
    } else {
      await storage.createCognitiveProfile({
        userId,
        ...updateData,
      });
    }
  }
}

export const bayesianEngine = new BayesianDiagnosticEngine();
