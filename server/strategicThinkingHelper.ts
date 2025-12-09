
/**
 * Strategic Thinking Helper
 * 
 * Generiert didaktisch sinnvolle Zerlegungsstrategien für Rechenaufgaben
 * und bewertet User-Auswahl nach mathematischer Eleganz.
 * 
 * Didaktische Prinzipien:
 * - Zehnerübergang explizit machen
 * - Kraftaufgaben (Verdoppeln, zur 10 ergänzen) nutzen
 * - Umkehroperationen verstehen
 * - Tauschaufgaben als letztes Mittel
 */

export interface ThinkingStrategy {
  id: string;
  display: string;          // z.B. "8 + 2 + 1 = 11"
  type: StrategyType;
  elegance: number;         // 0-100 (höher = besser)
  explanation: string;      // Kind-freundliche Erklärung
  decompositionSteps: string[]; // Einzelschritte
}

export type StrategyType = 
  | 'ten_transition'      // Über die 10: 8+3 = 8+2+1
  | 'double_plus'         // Verdoppeln+: 8+3 = 5+5+1
  | 'to_ten'              // Zur 10 ergänzen: 8+3 = (8+2)+1 = 10+1
  | 'inverse'             // Umkehrung: 8+3=11, also 11-3=8
  | 'place_value'         // Stellenwert: 18+3 = 10+8+3 = 10+11
  | 'neighbor_task'       // Nachbaraufgabe: 8+3 = (8+2)+1
  | 'commutative'         // Tauschaufgabe: 8+3 = 3+8 (weniger elegant!)
  | 'counting'            // Zählen (ineffizient, aber valide)
  | 'creative';           // Andere Zerlegung

export class StrategicThinkingHelper {
  
  /**
   * Generiere alle sinnvollen Denkwege für eine Aufgabe
   */
  generateStrategies(
    num1: number,
    num2: number,
    operation: '+' | '-',
    numberRange: 10 | 20 | 100 = 20
  ): ThinkingStrategy[] {
    const strategies: ThinkingStrategy[] = [];
    const result = operation === '+' ? num1 + num2 : num1 - num2;

    if (operation === '+') {
      // 1. Zehnerübergang (wenn vorhanden)
      if (this.hasDecadeTransition(num1, num2)) {
        strategies.push(...this.generateTenTransitionStrategies(num1, num2));
      }

      // 2. Verdoppelungs-Strategien
      if (Math.abs(num1 - num2) <= 2) {
        strategies.push(...this.generateDoublingStrategies(num1, num2));
      }

      // 3. Zur 10 ergänzen (wenn sinnvoll)
      if (num1 < 10 && result >= 10) {
        strategies.push(this.generateToTenStrategy(num1, num2));
      }

      // 4. Nachbaraufgaben (Kraft der 5)
      if (num1 === 5 || num2 === 5 || num1 % 5 === 0 || num2 % 5 === 0) {
        strategies.push(...this.generateNeighborStrategies(num1, num2));
      }

      // 5. Umkehraufgabe
      strategies.push(this.generateInverseStrategy(num1, num2, result));

      // 6. Tauschaufgabe (niedrige Eleganz)
      if (num1 !== num2) {
        strategies.push(this.generateCommutativeStrategy(num1, num2));
      }

    } else { // Subtraktion
      // Subtraktions-spezifische Strategien
      strategies.push(...this.generateSubtractionStrategies(num1, num2));
    }

    // Sortiere nach Eleganz (beste zuerst)
    return strategies.sort((a, b) => b.elegance - a.elegance);
  }

  /**
   * Prüfe ob Zehnerübergang vorhanden
   */
  private hasDecadeTransition(num1: number, num2: number): boolean {
    const ones1 = num1 % 10;
    const ones2 = num2 % 10;
    return ones1 + ones2 >= 10;
  }

  /**
   * Generiere Zehnerübergangs-Strategien
   * Beispiel: 8+5 = 8+2+3 = 10+3 = 13
   */
  private generateTenTransitionStrategies(num1: number, num2: number): ThinkingStrategy[] {
    const strategies: ThinkingStrategy[] = [];
    const toTen = 10 - (num1 % 10);
    const rest = num2 - toTen;
    const result = num1 + num2;

    // Strategie 1: Erst zur 10, dann weiter
    strategies.push({
      id: `ten_trans_${num1}_${num2}`,
      display: `${num1} + ${toTen} + ${rest} = ${result}`,
      type: 'ten_transition',
      elegance: 95,
      explanation: `Erst zur 10, dann ${rest} weiter!`,
      decompositionSteps: [
        `${num1} + ${toTen} = 10`,
        `10 + ${rest} = ${result}`
      ]
    });

    return strategies;
  }

  /**
   * Generiere Verdoppelungs-Strategien
   * Beispiel: 7+8 = 7+7+1 = 14+1 = 15
   */
  private generateDoublingStrategies(num1: number, num2: number): ThinkingStrategy[] {
    const strategies: ThinkingStrategy[] = [];
    const result = num1 + num2;

    // Wenn Zahlen nah beieinander (Quasi-Verdopplung)
    if (Math.abs(num1 - num2) === 1) {
      const smaller = Math.min(num1, num2);
      const double = smaller * 2;
      
      strategies.push({
        id: `double_${num1}_${num2}`,
        display: `${smaller} + ${smaller} + 1 = ${result}`,
        type: 'double_plus',
        elegance: 90,
        explanation: `Verdoppeln und 1 dazu!`,
        decompositionSteps: [
          `${smaller} + ${smaller} = ${double}`,
          `${double} + 1 = ${result}`
        ]
      });
    }

    return strategies;
  }

  /**
   * Zur 10 ergänzen Strategie
   * Beispiel: 8+5 = (8+2)+(5-2) = 10+3
   */
  private generateToTenStrategy(num1: number, num2: number): ThinkingStrategy {
    const toTen = 10 - num1;
    const rest = num2 - toTen;
    const result = num1 + num2;

    return {
      id: `to_ten_${num1}_${num2}`,
      display: `(${num1} + ${toTen}) + ${rest} = ${result}`,
      type: 'to_ten',
      elegance: 92,
      explanation: `Erst zur 10, dann noch ${rest}!`,
      decompositionSteps: [
        `${num1} + ${toTen} = 10`,
        `10 + ${rest} = ${result}`
      ]
    };
  }

  /**
   * Nachbaraufgaben (Kraft der 5)
   * Beispiel: 6+3 = 5+1+3 = 5+4 = 9
   */
  private generateNeighborStrategies(num1: number, num2: number): ThinkingStrategy[] {
    const strategies: ThinkingStrategy[] = [];
    const result = num1 + num2;

    // Nutze 5er-Kraft
    if (num1 > 5 && num1 < 10) {
      const over5 = num1 - 5;
      strategies.push({
        id: `neighbor_5_${num1}_${num2}`,
        display: `5 + ${over5} + ${num2} = ${result}`,
        type: 'neighbor_task',
        elegance: 85,
        explanation: `Nutze die Kraft der 5!`,
        decompositionSteps: [
          `${num1} = 5 + ${over5}`,
          `5 + ${over5} + ${num2} = ${result}`
        ]
      });
    }

    return strategies;
  }

  /**
   * Umkehraufgabe
   * Beispiel: 8+5=13, also 13-5=8
   */
  private generateInverseStrategy(num1: number, num2: number, result: number): ThinkingStrategy {
    return {
      id: `inverse_${num1}_${num2}`,
      display: `${result} - ${num2} = ${num1}`,
      type: 'inverse',
      elegance: 80,
      explanation: `Umgedreht denken: Minus statt Plus!`,
      decompositionSteps: [
        `${num1} + ${num2} = ${result}`,
        `Also: ${result} - ${num2} = ${num1}`
      ]
    };
  }

  /**
   * Tauschaufgabe (niedrige Eleganz!)
   * Beispiel: 8+3 = 3+8
   */
  private generateCommutativeStrategy(num1: number, num2: number): ThinkingStrategy {
    const result = num1 + num2;
    
    return {
      id: `commutative_${num1}_${num2}`,
      display: `${num2} + ${num1} = ${result}`,
      type: 'commutative',
      elegance: 40, // NIEDRIG!
      explanation: `Tauschaufgabe - aber hilft das wirklich?`,
      decompositionSteps: [
        `${num2} + ${num1} = ${num1} + ${num2}`,
        `= ${result}`
      ]
    };
  }

  /**
   * Subtraktions-Strategien
   */
  private generateSubtractionStrategies(num1: number, num2: number): ThinkingStrategy[] {
    const strategies: ThinkingStrategy[] = [];
    const result = num1 - num2;

    // 1. Zurück zur 10
    if (num1 > 10 && result < 10) {
      const toTen = num1 % 10;
      const rest = num2 - toTen;
      
      strategies.push({
        id: `sub_to_ten_${num1}_${num2}`,
        display: `${num1} - ${toTen} - ${rest} = ${result}`,
        type: 'ten_transition',
        elegance: 95,
        explanation: `Erst zurück zur 10!`,
        decompositionSteps: [
          `${num1} - ${toTen} = 10`,
          `10 - ${rest} = ${result}`
        ]
      });
    }

    // 2. Umkehraufgabe
    strategies.push({
      id: `sub_inverse_${num1}_${num2}`,
      display: `${result} + ${num2} = ${num1}`,
      type: 'inverse',
      elegance: 85,
      explanation: `Umgedreht: Plus statt Minus!`,
      decompositionSteps: [
        `${num1} - ${num2} = ${result}`,
        `Probe: ${result} + ${num2} = ${num1}`
      ]
    });

    return strategies;
  }

  /**
   * Bewerte User-Auswahl
   */
  evaluateUserChoice(
    chosenStrategy: ThinkingStrategy,
    allStrategies: ThinkingStrategy[]
  ): StrategyFeedback {
    const eleganceRank = allStrategies
      .sort((a, b) => b.elegance - a.elegance)
      .findIndex(s => s.id === chosenStrategy.id) + 1;

    let feedback: string;
    let encouragement: string;
    let suggestionForNext: string | null = null;

    if (chosenStrategy.elegance >= 90) {
      feedback = "🌟 Super schlau gedacht!";
      encouragement = "Das ist ein sehr eleganter Rechenweg!";
    } else if (chosenStrategy.elegance >= 80) {
      feedback = "✅ Gut gemacht!";
      encouragement = "Das ist ein guter Weg!";
      if (allStrategies[0].elegance > chosenStrategy.elegance) {
        suggestionForNext = `Tipp: ${allStrategies[0].explanation}`;
      }
    } else if (chosenStrategy.elegance >= 60) {
      feedback = "👍 Das funktioniert!";
      encouragement = "Das ist korrekt, aber es gibt noch elegantere Wege.";
      suggestionForNext = `Versuch mal: ${allStrategies[0].display}`;
    } else {
      // Tauschaufgabe oder ineffizient
      feedback = "🤔 Hmm, hilft das wirklich?";
      encouragement = "Das ist richtig, aber macht es die Rechnung einfacher?";
      suggestionForNext = `Schau mal hier: ${allStrategies[0].display}`;
    }

    return {
      feedback,
      encouragement,
      eleganceScore: chosenStrategy.elegance,
      rank: eleganceRank,
      totalStrategies: allStrategies.length,
      suggestionForNext,
      shouldCelebrate: chosenStrategy.elegance >= 85
    };
  }
}

export interface StrategyFeedback {
  feedback: string;
  encouragement: string;
  eleganceScore: number;
  rank: number;
  totalStrategies: number;
  suggestionForNext: string | null;
  shouldCelebrate: boolean;
}

export const strategicThinkingHelper = new StrategicThinkingHelper();
