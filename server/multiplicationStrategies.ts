
/**
 * MULTIPLICATION & DIVISION STRATEGY DETECTOR
 * 
 * Erkennt verwendete Strategien analog zu strategyDetector.ts
 */

import type { MultiplicationStrategy, DivisionStrategy } from '../shared/multiplication-division-types';

export class MultiplicationStrategyDetector {
  
  detectMultiplicationStrategy(
    factor1: number,
    factor2: number,
    product: number,
    timeTaken: number,
    solutionSteps: any[]
  ): { strategy: MultiplicationStrategy; confidence: number; evidence: string } {
    
    // 1. Automatisiert (sehr schnell)
    if (timeTaken < 2000) {
      return {
        strategy: 'retrieval',
        confidence: 0.9,
        evidence: 'Sehr schnelle Antwort - Kernaufgabe automatisiert'
      };
    }
    
    // 2. Quadratzahlen
    if (factor1 === factor2) {
      return {
        strategy: 'square_numbers',
        confidence: 0.95,
        evidence: `Quadratzahl: ${factor1}×${factor1}`
      };
    }
    
    // 3. Verdopplung (2×n)
    if (factor1 === 2 || factor2 === 2) {
      if (timeTaken < 5000) {
        return {
          strategy: 'doubling',
          confidence: 0.85,
          evidence: 'Verdopplung (aus Addition bekannt)'
        };
      }
    }
    
    // 4. Kommutativgesetz (leichterer Weg)
    if (factor1 > factor2 && (factor2 === 2 || factor2 === 5 || factor2 === 10)) {
      return {
        strategy: 'commutative',
        confidence: 0.8,
        evidence: `Tauschaufgabe genutzt: ${factor2}×${factor1} statt ${factor1}×${factor2}`
      };
    }
    
    // 5. Distributivgesetz (Zerlegung erkannt)
    if (solutionSteps.some(s => s.action?.includes('split') || s.action?.includes('decompose'))) {
      return {
        strategy: 'distributive',
        confidence: 0.85,
        evidence: 'Zerlegung über Distributivgesetz (z.B. 7×8 = 7×5 + 7×3)'
      };
    }
    
    // 6. Nachbaraufgabe
    if (Math.abs(factor1 - factor2) === 1) {
      return {
        strategy: 'neighbor_task',
        confidence: 0.75,
        evidence: `Nachbaraufgabe: ${factor1}×${factor2} von Quadratzahl abgeleitet`
      };
    }
    
    // 7. Fortschreitende Addition (langsam)
    if (timeTaken > 10000) {
      return {
        strategy: 'repeated_addition',
        confidence: 0.7,
        evidence: 'Langsame Berechnung deutet auf wiederholte Addition hin'
      };
    }
    
    // Default
    return {
      strategy: 'skip_counting',
      confidence: 0.5,
      evidence: 'Vermutlich Zählen in Schritten'
    };
  }
  
  detectDivisionStrategy(
    dividend: number,
    divisor: number,
    quotient: number,
    timeTaken: number,
    solutionSteps: any[]
  ): { strategy: DivisionStrategy; confidence: number; evidence: string } {
    
    // 1. Automatisiert (kennt Umkehrung)
    if (timeTaken < 3000) {
      return {
        strategy: 'retrieval',
        confidence: 0.9,
        evidence: 'Sehr schnell - Umkehraufgabe automatisiert'
      };
    }
    
    // 2. Umkehr-Multiplikation (mittlere Zeit)
    if (timeTaken < 7000) {
      return {
        strategy: 'inverse_multiplication',
        confidence: 0.85,
        evidence: `${divisor}×? = ${dividend} genutzt`
      };
    }
    
    // 3. Halbierung
    if (divisor === 2 && timeTaken < 5000) {
      return {
        strategy: 'halving',
        confidence: 0.8,
        evidence: 'Halbierung (aus Verdopplung bekannt)'
      };
    }
    
    // 4. Wiederholte Subtraktion (langsam)
    if (timeTaken > 10000) {
      return {
        strategy: 'repeated_subtraction',
        confidence: 0.7,
        evidence: 'Langsam - vermutlich schrittweises Abziehen'
      };
    }
    
    // Default
    return {
      strategy: 'grouping',
      confidence: 0.6,
      evidence: 'Vermutlich Gruppierung/Aufteilung'
    };
  }
}

export const multiplicationStrategyDetector = new MultiplicationStrategyDetector();
