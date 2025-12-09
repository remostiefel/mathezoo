
/**
 * DYSKALKULIE-SCREENING nach Moser-Opitz (2013)
 * 
 * Kriterien für Rechenschwäche-Früherkennung:
 * 1. Zählendes Rechnen dominiert (>80% der Strategien)
 * 2. Keine Automatisierung nach 50+ Aufgaben
 * 3. Systematische Fehler (Muster erkennbar)
 * 4. Schwache Vorläuferfertigkeiten
 * 
 * Referenz: Moser-Opitz, E. (2013). Rechenschwäche/Dyskalkulie. 
 * Theoretische Klärungen und empirische Studien an betroffenen Schülerinnen und Schülern.
 */

import type { LearningProgression, Task } from "@shared/schema";

export interface DyscalculiaRiskProfile {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number; // 0-1
  indicators: DyscalculiaIndicator[];
  recommendations: InterventionRecommendation[];
  scientificBasis: string; // Literaturverweis
}

interface DyscalculiaIndicator {
  criterion: string;
  severity: 'minor' | 'moderate' | 'severe';
  evidence: string;
  moserOpitzReference: string; // z.B. "BMT Item 3.2"
}

interface InterventionRecommendation {
  priority: 'immediate' | 'high' | 'medium';
  intervention: string;
  duration: string; // "3x/Woche, 15min, 6 Wochen"
  materials: string[];
  expectedOutcome: string;
}

export class DyscalculiaScreener {
  
  /**
   * Hauptdiagnostik nach Moser-Opitz-Kriterien
   */
  screenForDyscalculia(
    progression: LearningProgression,
    recentTasks: Task[],
    sessionCount: number
  ): DyscalculiaRiskProfile {
    
    const indicators: DyscalculiaIndicator[] = [];
    
    // 1. ZÄHLENDES RECHNEN (Moser-Opitz 2013: Hauptindikator)
    const countingRate = this.calculateCountingStrategyRate(recentTasks);
    if (countingRate > 0.8 && sessionCount > 10) {
      indicators.push({
        criterion: 'Persistierendes zählendes Rechnen',
        severity: 'severe',
        evidence: `${(countingRate*100).toFixed(0)}% zählende Strategien nach ${sessionCount} Sessions`,
        moserOpitzReference: 'Moser-Opitz (2013), S. 87: "Zählendes Rechnen als Hauptmerkmal"'
      });
    }
    
    // 1a. SCHERER: Fehlendes quasi-simultanes Erfassen (Moser-Opitz & Scherer 2019)
    const simultaneousGraspingRate = this.checkSimultaneousGrasping(recentTasks);
    if (simultaneousGraspingRate < 0.3 && sessionCount > 8) {
      indicators.push({
        criterion: 'Fehlendes quasi-simultanes Mengenerfassen',
        severity: 'severe',
        evidence: `Nur ${(simultaneousGraspingRate*100).toFixed(0)}% strukturierte Wahrnehmung`,
        moserOpitzReference: 'Scherer (2019): Strukturierte Mengenauffassung als Basis'
      });
    }
    
    // 2. FEHLENDE AUTOMATISIERUNG (nach 50+ Aufgaben)
    const taskCount = recentTasks.length;
    const automatizationRate = this.calculateAutomatizationRate(recentTasks);
    if (taskCount > 50 && automatizationRate < 0.3) {
      indicators.push({
        criterion: 'Keine Automatisierung',
        severity: 'severe',
        evidence: `Nur ${(automatizationRate*100).toFixed(0)}% automatisiert nach ${taskCount} Aufgaben`,
        moserOpitzReference: 'Moser-Opitz (2013), S. 92: "Automatisierung als Lernziel"'
      });
    }
    
    // 3. VORLÄUFERFERTIGKEITEN (Dornheim/Moser-Opitz)
    const prerequisiteSkills = (progression as any).prerequisiteSkills || {};
    const avgPrerequisite = this.calculateAveragePrerequisiteLevel(prerequisiteSkills);
    if (avgPrerequisite < 0.4) {
      indicators.push({
        criterion: 'Schwache Vorläuferfertigkeiten',
        severity: 'moderate',
        evidence: `Durchschnitt: ${(avgPrerequisite*10).toFixed(1)}/10`,
        moserOpitzReference: 'Moser-Opitz & Grob (2017): Prädiktorwert von Vorläuferfertigkeiten'
      });
    }
    
    // 4. SYSTEMATISCHE FEHLER
    const errorPatterns = this.detectSystematicErrors(recentTasks);
    if (errorPatterns.length > 2) {
      indicators.push({
        criterion: 'Systematische Fehlermuster',
        severity: 'moderate',
        evidence: `${errorPatterns.length} Muster: ${errorPatterns.join(', ')}`,
        moserOpitzReference: 'Moser-Opitz (2013), S. 95: Fehleranalyse als Diagnostikum'
      });
    }
    
    // RISIKO-LEVEL berechnen
    const riskLevel = this.calculateRiskLevel(indicators);
    const confidence = Math.min(1.0, sessionCount / 20); // Mehr Daten = höhere Konfidenz
    
    // EMPFEHLUNGEN generieren
    const recommendations = this.generateInterventions(indicators, progression);
    
    return {
      riskLevel,
      confidence,
      indicators,
      recommendations,
      scientificBasis: 'Moser-Opitz, E. (2013). Rechenschwäche/Dyskalkulie. Haupt Verlag.'
    };
  }
  
  private calculateCountingStrategyRate(tasks: Task[]): number {
    const countingTasks = tasks.filter(t => 
      t.strategyUsed === 'counting_all' || 
      t.strategyUsed === 'counting_on'
    );
    return tasks.length > 0 ? countingTasks.length / tasks.length : 0;
  }
  
  private calculateAutomatizationRate(tasks: Task[]): number {
    // Automatisiert = schnell (<3s) UND korrekt
    const automatized = tasks.filter(t => 
      t.isCorrect && 
      t.timeTaken && 
      t.timeTaken < 3000
    );
    return tasks.length > 0 ? automatized.length / tasks.length : 0;
  }
  
  private calculateAveragePrerequisiteLevel(skills: any): number {
    const levels = Object.values(skills).map((s: any) => s?.level || 0);
    return levels.length > 0 
      ? levels.reduce((sum, l) => sum + l, 0) / levels.length / 10 
      : 0;
  }
  
  private detectSystematicErrors(tasks: Task[]): string[] {
    const patterns: string[] = [];
    
    // Muster 1: Immer +1/-1 Fehler
    const offByOne = tasks.filter(t => 
      !t.isCorrect && 
      t.studentAnswer && 
      Math.abs(t.studentAnswer - t.correctAnswer) === 1
    );
    if (offByOne.length > tasks.length * 0.3) {
      patterns.push('Off-by-one (30%+)');
    }
    
    // Muster 2: Zehnerübergang immer falsch
    const tenCrossingErrors = tasks.filter(t =>
      !t.isCorrect &&
      t.operation === '+' &&
      t.number1 < 10 &&
      t.correctAnswer > 10
    );
    if (tenCrossingErrors.length > 3) {
      patterns.push('Zehnerübergang');
    }
    
    // Muster 3: Scherer - Fehlende Teil-Ganzes-Beziehung
    const partWholeErrors = this.detectPartWholeDeficits(tasks);
    if (partWholeErrors > 0.4) {
      patterns.push('Teil-Ganzes-Verständnis fehlt');
    }
    
    return patterns;
  }
  
  /**
   * SCHERER: Quasi-simultanes Mengenerfassen
   * Erkennt, ob Kind strukturiert wahrnimmt (5er/10er Struktur)
   */
  private checkSimultaneousGrasping(tasks: Task[]): number {
    // Tasks mit 5er/10er Strukturen (schnell gelöst = strukturiert erfasst)
    const structuredTasks = tasks.filter(t => 
      t.isCorrect && 
      t.timeTaken && 
      t.timeTaken < 4000 &&
      (
        (t.number1 === 5 || t.number1 === 10 || t.number2 === 5 || t.number2 === 10) ||
        (t.correctAnswer === 10 || t.correctAnswer === 20)
      )
    );
    
    const relevantTasks = tasks.filter(t =>
      (t.number1 === 5 || t.number1 === 10 || t.number2 === 5 || t.number2 === 10) ||
      (t.correctAnswer === 10 || t.correctAnswer === 20)
    );
    
    return relevantTasks.length > 0 ? structuredTasks.length / relevantTasks.length : 0;
  }
  
  /**
   * SCHERER: Teil-Ganzes-Verständnis
   * Prüft ob Kind Zerlegungen flexibel nutzt
   */
  private detectPartWholeDeficits(tasks: Task[]): number {
    // Aufgaben wie 8+7 sollten als 8+2+5 erkannt werden
    const decompositionTasks = tasks.filter(t => 
      t.operation === '+' &&
      t.number1 + t.number2 > 10 &&
      t.number1 < 10 &&
      t.number2 < 10
    );
    
    const failedDecompositions = decompositionTasks.filter(t => 
      !t.isCorrect || (t.timeTaken && t.timeTaken > 8000)
    );
    
    return decompositionTasks.length > 0 
      ? failedDecompositions.length / decompositionTasks.length 
      : 0;
  }
  
  private calculateRiskLevel(indicators: DyscalculiaIndicator[]): 'low' | 'moderate' | 'high' | 'critical' {
    const severeCount = indicators.filter(i => i.severity === 'severe').length;
    const moderateCount = indicators.filter(i => i.severity === 'moderate').length;
    
    if (severeCount >= 2) return 'critical';
    if (severeCount === 1 && moderateCount >= 2) return 'high';
    if (severeCount === 1 || moderateCount >= 2) return 'moderate';
    return 'low';
  }
  
  private generateInterventions(
    indicators: DyscalculiaIndicator[],
    progression: LearningProgression
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];
    
    // Wenn zählendes Rechnen dominiert
    if (indicators.some(i => i.criterion.includes('zählend'))) {
      recommendations.push({
        priority: 'immediate',
        intervention: 'HEUREKA-Konzept: Handlungsorientiertes Rechnen mit Material',
        duration: '5x/Woche, 20min, 8 Wochen',
        materials: [
          'Rechenschiffchen (5er/10er-Struktur)',
          'Wendeplättchen (rot/blau)',
          'Zwanzigerfeld mit Magnetplättchen',
          'Schüttelbox'
        ],
        expectedOutcome: 'Ablösung vom zählenden Rechnen, Aufbau von Zerlegungsstrategien'
      });
    }
    
    // SCHERER: Quasi-simultanes Erfassen fehlt
    if (indicators.some(i => i.criterion.includes('quasi-simultan'))) {
      recommendations.push({
        priority: 'immediate',
        intervention: 'Scherer-Konzept: Strukturierte Mengenauffassung',
        duration: '4x/Woche, 15min, 6 Wochen',
        materials: [
          'Punktebilder in 5er/10er-Struktur (Würfelbilder, Fingerbilder)',
          'Blitzblick-Karten (kurze Präsentation 1-2 Sek)',
          'Strukturiertes Zwanzigerfeld (rot/blau getrennt)',
          'Spiel: "Wie viele siehst du?" mit strukturierten Mengen'
        ],
        expectedOutcome: 'Aufbau strukturierter Wahrnehmung, Basis für nicht-zählendes Rechnen'
      });
    }
    
    // SCHERER: Teil-Ganzes-Verständnis fehlt
    if (indicators.some(i => i.criterion.includes('Teil-Ganzes'))) {
      recommendations.push({
        priority: 'high',
        intervention: 'Scherer: Natürliche Differenzierung mit substanziellen Aufgaben',
        duration: '3x/Woche, 20min, 8 Wochen',
        materials: [
          'Zahlenhäuser (z.B. alle Zerlegungen der 10)',
          'Teil-Ganzes-Schachteln mit Plättchen',
          'Rechengeschichten: "8 Tiere, wie viele im/außerhalb Gehege?"',
          'Umkehraufgaben: 5+3=8, also 8-3=?'
        ],
        expectedOutcome: 'Flexible Zahlzerlegung, Verständnis von Additions-Subtraktion als Umkehrung'
      });
    }
    
    // Wenn Vorläuferfertigkeiten schwach
    if (indicators.some(i => i.criterion.includes('Vorläufer'))) {
      recommendations.push({
        priority: 'high',
        intervention: 'Vorläuferfertigkeiten-Training (Mengenvergleich, Seriation)',
        duration: '3x/Woche, 15min, 6 Wochen',
        materials: [
          'Mengen-Memory',
          'Zahlen-Treppe',
          'Teil-Ganzes-Schachteln'
        ],
        expectedOutcome: 'Stärkung des Zahl- und Mengenverständnisses'
      });
    }
    
    // MOSER-OPITZ & SCHERER: Fehlende Automatisierung
    if (indicators.some(i => i.criterion.includes('Automatisierung'))) {
      recommendations.push({
        priority: 'medium',
        intervention: 'Scherer: Operative Übungsformate (Päckchen, Zahlenmauern)',
        duration: '2x/Woche, 10min, fortlaufend',
        materials: [
          'Päckchen mit Mustern (3+4, 3+5, 3+6, ...)',
          'Zahlenmauern mit Nachbarzahlen',
          'Verdopplungsaufgaben als Anker (5+5, 6+6, ...)',
          'App-Spiele: Zerlegungs-Safari, 10 gewinnt!'
        ],
        expectedOutcome: 'Aufbau von Automatisierung durch Muster-Erkennung, nicht durch Drill'
      });
    }
    
    return recommendations;
  }
}

export const dyscalculiaScreener = new DyscalculiaScreener();
