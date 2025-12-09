import type { StrategyLevel } from "./taskGenerator";

export interface SolutionStep {
  timestamp: number;
  representation: "twenty_frame" | "hundred_field" | "number_line" | "counters" | "symbolic";
  action: string;
  value?: number;
  details?: any;
}

export interface StrategyAnalysis {
  detectedStrategy: StrategyLevel;
  confidence: number; // 0-1
  indicators: string[];
  timePattern: "fast" | "medium" | "slow";
  representationUsage: string[];
}

// Mögliche mathematische Strategien, die ein Kind nutzen kann
// (Basis für die Analyse und Förderempfehlungen)
export type StrategyType =
  | 'counting'
  | 'decomposition'
  | 'place_value'
  | 'neighbor_task'
  | 'doubling'
  | 'derivation' // NEUE STRATEGIE: Herleiten von Kernaufgaben (Wittmann/Gaidoschik)
  | 'inverse'
  | 'decade_transition'
  | 'retrieval'
  | 'associative_grouping' // NEU: Assoziativgesetz - geschicktes Gruppieren
  | 'commutative_exchange' // NEU: Kommutativgesetz - Tauschaufgaben nutzen
  | 'distributive_split' // NEU: Distributivgesetz - Zerlegen über Multiplikation (Vorstufe)
  
  // ===== MULTIPLIKATION & DIVISION =====
  | 'multiplication_repeated_addition' // 3×4 = 4+4+4
  | 'multiplication_skip_counting'     // 3×4: 4, 8, 12
  | 'multiplication_distributive'      // 7×8 = 7×5 + 7×3
  | 'multiplication_commutative'       // 3×7 = 7×3 (leichter)
  | 'multiplication_squares'           // Quadratzahlen
  | 'division_grouping'                // Aufteilen
  | 'division_sharing'                 // Verteilen
  | 'division_inverse_mult';           // Via Umkehrung

// Schnittstelle für die zu analysierende Aufgabe
interface Task {
  operation: "+" | "-";
  number1: number;
  number2: number;
  correctAnswer: number;
  timeTaken: number;
  numberRange?: number;
}

export class StrategyDetector {

  /**
   * Analyze solution steps to detect mathematical strategy
   */
  detectStrategy(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    solutionSteps: SolutionStep[],
    timeTaken: number,
    numberRange: number = 20
  ): StrategyAnalysis {
    const indicators: string[] = [];
    const representationUsage = Array.from(
      new Set(solutionSteps.map(s => s.representation))
    );

    // Time pattern analysis
    const timePattern = this.analyzeTimePattern(timeTaken);

    // Check for automatization (very fast, minimal steps)
    if (timeTaken < 3000 && solutionSteps.length <= 2) {
      indicators.push("Sehr schnelle Antwort");
      indicators.push("Minimale Schritte");
      return {
        detectedStrategy: "automatized",
        confidence: 0.9,
        indicators,
        timePattern,
        representationUsage,
      };
    }

    // ZR100: Check for place-value strategies
    if (numberRange === 100) {
      const placeValuePattern = this.detectPlaceValueStrategy(
        operation,
        number1,
        number2,
        solutionSteps
      );
      if (placeValuePattern) {
        return {
          detectedStrategy: placeValuePattern.strategy,
          confidence: placeValuePattern.confidence,
          indicators: [...indicators, ...placeValuePattern.indicators],
          timePattern,
          representationUsage,
        };
      }
    }

    // Check for counting strategies
    const countingPattern = this.detectCountingPattern(solutionSteps, number1, number2);
    if (countingPattern) {
      return {
        detectedStrategy: countingPattern.strategy,
        confidence: countingPattern.confidence,
        indicators: [...indicators, ...countingPattern.indicators],
        timePattern,
        representationUsage,
      };
    }

    // Check for decomposition strategies
    const decompositionPattern = this.detectDecomposition(
      operation,
      number1,
      number2,
      correctAnswer,
      solutionSteps
    );
    if (decompositionPattern) {
      return {
        detectedStrategy: decompositionPattern.strategy,
        confidence: decompositionPattern.confidence,
        indicators: [...indicators, ...decompositionPattern.indicators],
        timePattern,
        representationUsage,
      };
    }

    // Default: counting_on (most common beginner strategy)
    indicators.push("Standard-Strategie erkannt");
    return {
      detectedStrategy: "counting_on",
      confidence: 0.5,
      indicators,
      timePattern,
      representationUsage,
    };
  }

  /**
   * Detect place-value strategies for ZR100
   * e.g., 47 + 8 → 47 + 3 + 5 (split to next ten)
   */
  private detectPlaceValueStrategy(
    operation: "addition" | "subtraction",
    num1: number,
    num2: number,
    steps: SolutionStep[]
  ): { strategy: StrategyLevel; confidence: number; indicators: string[] } | null {
    const indicators: string[] = [];

    // Check for ten-transition with splitting
    if (operation === "addition") {
      const ones1 = num1 % 10;
      const ones2 = num2 % 10;

      // Zehnerübergang erkannt
      if (ones1 + ones2 >= 10) {
        const splitActions = steps.filter(s => 
          s.action.includes("split") || 
          s.action.includes("decompose") ||
          (s.details && s.details.intermediate)
        );

        if (splitActions.length > 0) {
          indicators.push(`Stellenwert-Strategie: ${num1} + ${num2}`);
          indicators.push(`Zerlegung über Zehner erkannt`);
          return {
            strategy: "make_ten",
            confidence: 0.85,
            indicators,
          };
        }
      }
    }

    // Check for tens-and-ones separate calculation
    const tensCalculation = steps.find(s => 
      s.action.includes("tens") || 
      s.representation === "hundred_field"
    );

    if (tensCalculation) {
      indicators.push("Stellenwert-getrennte Berechnung");
      indicators.push("Zehner und Einer separat");
      return {
        strategy: "decomposition",
        confidence: 0.8,
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect counting patterns (counting all vs counting on)
   */
  private detectCountingPattern(
    steps: SolutionStep[],
    num1: number,
    num2: number
  ): { strategy: StrategyLevel; confidence: number; indicators: string[] } | null {
    const indicators: string[] = [];

    // Count how many individual counting actions
    const countingActions = steps.filter(s => 
      s.action.includes("add_counter") || 
      s.action.includes("move_number_line") ||
      s.action.includes("fill_frame")
    );

    const totalCount = num1 + num2;

    // Counting all: counts both numbers from start
    if (countingActions.length >= totalCount - 2) {
      indicators.push(`Alle ${totalCount} Elemente gezählt`);
      indicators.push("Schrittweises Abzählen erkennbar");
      return {
        strategy: "counting_all",
        confidence: 0.85,
        indicators,
      };
    }

    // Counting on: starts from larger number and counts on
    if (countingActions.length >= Math.min(num1, num2) - 1 && 
        countingActions.length < totalCount - 2) {
      indicators.push(`Weitergezählt ab ${Math.max(num1, num2)}`);
      indicators.push(`${Math.min(num1, num2)} Schritte hinzugefügt`);
      return {
        strategy: "counting_on",
        confidence: 0.8,
        indicators,
      };
    }

    return null;
  }

  /**
   * Detect decomposition strategies (doubles, near-doubles, make-ten)
   */
  private detectDecomposition(
    operation: "addition" | "subtraction",
    num1: number,
    num2: number,
    correctAnswer: number,
    steps: SolutionStep[]
  ): { strategy: StrategyLevel; confidence: number; indicators: string[] } | null {
    const indicators: string[] = [];

    // Check for doubles strategy (5+5, 6+6, etc.)
    if (operation === "addition" && num1 === num2) {
      indicators.push(`Verdopplung erkannt: ${num1} + ${num2}`);
      indicators.push("Symmetrische Aufgabe");
      return {
        strategy: "doubles",
        confidence: 0.95,
        indicators,
      };
    }

    // Check for near-doubles (5+6 = 5+5+1)
    if (operation === "addition" && Math.abs(num1 - num2) === 1) {
      indicators.push(`Fast-Verdopplung: ${num1} + ${num2}`);
      indicators.push("Nachbaraufgabe zum Doppel");
      return {
        strategy: "near_doubles",
        confidence: 0.85,
        indicators,
      };
    }

    // Check for make-ten strategy (crossing 10)
    if (operation === "addition" && 
        ((num1 < 10 && num1 + num2 > 10) || (num2 < 10 && num1 + num2 > 10))) {

      // Look for intermediate step at 10
      const hasIntermediateStep = steps.some(s => 
        s.action.includes("10") || s.value === 10
      );

      if (hasIntermediateStep) {
        indicators.push("Zehnerübergang mit Zwischenschritt");
        indicators.push("Zerlegung zur 10 erkannt");
        return {
          strategy: "make_ten",
          confidence: 0.9,
          indicators,
        };
      }
    }

    // General decomposition pattern
    if (steps.length >= 3 && steps.some(s => s.action.includes("split") || s.action.includes("combine"))) {
      indicators.push("Zerlegungsstrategie verwendet");
      indicators.push("Mehrschrittige Lösung");
      return {
        strategy: "decomposition",
        confidence: 0.7,
        indicators,
      };
    }

    return null;
  }

  /**
   * Analyze time pattern
   */
  private analyzeTimePattern(timeTaken: number): "fast" | "medium" | "slow" {
    if (timeTaken < 5000) return "fast";
    if (timeTaken < 15000) return "medium";
    return "slow";
  }

  /**
   * Detect error patterns
   */
  detectErrorType(
    correctAnswer: number,
    studentAnswer: number,
    operation: "addition" | "subtraction",
    detectedStrategy: StrategyLevel
  ): { errorType: string; errorSeverity: "minor" | "moderate" | "severe" } | null {
    const difference = Math.abs(correctAnswer - studentAnswer);

    // Off-by-one errors (häufig bei Zählstrategien)
    if (difference === 1) {
      return {
        errorType: "off_by_one",
        errorSeverity: "minor",
      };
    }

    // Off-by-two errors
    if (difference === 2) {
      return {
        errorType: "off_by_two",
        errorSeverity: "minor",
      };
    }

    // Ten-crossing error (Fehler beim Zehnerübergang)
    if (operation === "addition" && correctAnswer > 10 && studentAnswer < 10) {
      return {
        errorType: "ten_crossing_error",
        errorSeverity: "severe",
      };
    }

    // Reversal error (addition/subtraction confusion)
    if (difference > 5) {
      return {
        errorType: "operation_confusion",
        errorSeverity: "severe",
      };
    }

    // Strategy mismatch error
    if (detectedStrategy === "counting_all" && difference > 3) {
      return {
        errorType: "counting_error",
        errorSeverity: "moderate",
      };
    }

    return {
      errorType: "unknown_error",
      errorSeverity: "moderate",
    };
  }

  /**
   * Detect specific strategies based on task and time taken
   * This is a more direct detection of a strategy without analyzing steps
   */
  private detectSpecificStrategy(task: Task): StrategyLevel | null {
    const { operation, number1, number2, timeTaken } = task;

    // Check for retrieval (automatized answers) - very fast
    if (timeTaken < 2000) { // Threshold for quick recall
      return "retrieval";
    }

    // Check for doubling strategies (doubles and near-doubles)
    if (operation === '+' && (number1 === number2 || Math.abs(number1 - number2) === 1)) {
      // Near-doubles might take slightly longer than pure doubles
      if (timeTaken < 6000) { // Threshold for doubling/near-doubling
        return "doubling";
      }
    }
    
    // Check for inverse operations (e.g., 10 - 3 = 7, then 7 + 3 = 10)
    // This is harder to detect without context of previous tasks
    // For now, we assume it's used if the numbers are related to a known fact
    if (operation === '-' && number1 > number2 && number1 <= 10 && number2 <= 10) {
      // If the numbers are part of a known fact (e.g., 10-3, 8-5) and solved relatively fast
      if (timeTaken < 7000) {
        return "inverse";
      }
    }

    // Check for decade transition (e.g., 12 - 5)
    if (operation === '-' && number1 > 10 && number2 > 0 && number2 <= number1 % 10 ) {
      if (timeTaken < 8000) { // Slightly slower than direct facts
        return "decade_transition";
      }
    }

    // Check for neighbor task (e.g., 7+5, using 7+3+2) - already covered by decomposition/make_ten
    // but we can add it if specific patterns emerge

    return null; // No specific strategy detected
  }

  /**
   * Detects the primary strategy used for a given task.
   * This method prioritizes certain strategies and uses time as a key indicator.
   */
  detectPrimaryStrategy(task: Task): { primary: StrategyLevel; confidence: number; evidence: string } {
    const { operation, number1, number2, timeTaken } = task;

    // 1. Automatized / Retrieval
    if (timeTaken < 2500) { // Very fast means likely retrieval
      return { primary: "retrieval", confidence: 0.9, evidence: "Sehr schnelle Antwort (Auswendig gelernt)" };
    }

    // 2. Herleiten von Kernaufgaben (Wittmann/Gaidoschik)
    // This strategy is characterized by mid-range times and specific number patterns
    if (this.detectDerivation(task, timeTaken)) {
      return { primary: "derivation", confidence: 0.85, evidence: "Von Kernaufgabe abgeleitet (Herleiten statt Auswendiglernen)" };
    }

    // 3. Verdopplung (z.B. 6+6 oder 6+7 als 6+6+1)
    // Fast-doubling is a specific case of derivation but also a core task itself
    if (this.detectDoubling(task, timeTaken)) {
      return { primary: "doubling", confidence: 0.8, evidence: "Fast-Verdopplung oder Verdopplung genutzt" };
    }

    // 4. Inverse Operation (e.g., 10 - 3)
    if (operation === '-' && number1 <= 10 && number2 < number1) {
      if (timeTaken < 6000) { // Relatively quick for known subtraction facts
        return { primary: "inverse", confidence: 0.8, evidence: "Umkehraufgabe / Bekannte Minusaufgabe genutzt" };
      }
    }
    
    // 5. Zehnerübergang (z.B. 12 - 5)
    if (operation === '-' && number1 > 10 && number2 > 0) {
      // If number2 is larger than the ones digit of number1, it requires crossing the ten
      if (number2 > number1 % 10) {
        if (timeTaken < 8000) { // Takes a bit longer than simple facts
          return { primary: "decade_transition", confidence: 0.75, evidence: "Zehnerübergang bei Subtraktion genutzt" };
        }
      }
    }

    // 6. Zerlegung / Stellenwert (z.B. 47 + 8 = 47 + 3 + 5)
    // These strategies involve splitting numbers and often take more time or steps
    if (operation === '+' && number1 > 10 && number2 > 0) {
      // Heuristic: If time is moderate and numbers are larger, likely decomposition
      if (timeTaken > 5000 && timeTaken < 12000) {
        return { primary: "decomposition", confidence: 0.7, evidence: "Zerlegung der Aufgabe (Zehner und Einer getrennt)" };
      }
    }
    
    // 7. Zählen (Counting On / Counting All)
    // This is often the slowest strategy for larger numbers
    if (timeTaken > 10000) { // Slowest responses often indicate counting
      return { primary: "counting", confidence: 0.6, evidence: "Schrittweises Zählen (vorwärts oder rückwärts)" };
    }

    // Default or fallback strategy if none of the above are clearly detected
    return { primary: "counting_on", confidence: 0.5, evidence: "Vermutlich schrittweises Weiterzählen" };
  }

  /**
   * Erkennt Verdopplungs-Strategien
   * z.B. 6+7 als 6+6+1
   */
  private detectDoubling(task: Task, timeTaken: number): boolean {
    const { number1, number2, operation } = task;

    if (operation !== '+') return false;

    // Verdopplung oder Fast-Verdopplung
    if (number1 === number2 || Math.abs(number1 - number2) === 1) {
      // Schnelle Antwort deutet auf Nutzung der Verdopplung hin
      return timeTaken < 5; // timeTaken in seconds
    }

    return false;
  }

  /**
   * NEUE STRATEGIE: Herleiten von Kernaufgaben (Wittmann/Gaidoschik)
   * Erkennt, ob das Kind von einer Kernaufgabe ableitet
   * 
   * Kernaufgaben (nach Wittmann):
   * - Verdopplungen: 1+1, 2+2, 3+3, ..., 10+10
   * - Partnerzahlen zur 10: 1+9, 2+8, 3+7, 4+6, 5+5
   * - Zehner-Übergänge: 9+1, 9+2, ..., 10+1, 10+2, ...
   * 
   * Herleiten (nach Gaidoschik):
   * - 6+7 = 6+6+1 (von Verdopplung ableiten)
   * - 7+5 = 5+5+2 (von 5+5=10 ableiten)
   * - 8+5 = 8+2+3 (zur 10, dann weiter)
   */
  private detectDerivation(task: Task, timeTaken: number): boolean {
    const { number1, number2, operation } = task;

    if (operation !== '+') return false;

    // Fastverdopplung: n+(n±1) oder n+(n±2)
    const diff = Math.abs(number1 - number2);
    if (diff >= 1 && diff <= 2) {
      // Mittlere Zeit: nicht auswendig (zu langsam), aber auch nicht zählend (zu schnell)
      // Deutet auf bewusstes Herleiten hin
      if (timeTaken >= 3 && timeTaken <= 8) { // timeTaken in seconds
        return true;
      }
    }

    // Herleiten von Partnerzahlen zur 10
    // z.B. 6+5 = 5+5+1 oder 7+4 = 5+5+1+1
    const sum = number1 + number2;
    if (sum >= 10 && sum <= 12) {
      const hasPartnerToTen = 
        (number1 + number2 === 10) || 
        (Math.abs(number1 - 5) <= 2 && Math.abs(number2 - 5) <= 2); // Check if numbers are close to 5 or sum to 10

      if (hasPartnerToTen && timeTaken >= 3 && timeTaken <= 8) { // timeTaken in seconds
        return true;
      }
    }

    // Analogiebildung: Wenn Kind größere Zahlen ähnlich schnell löst wie kleine
    // z.B. kennt 3+4=7, leitet 13+4=17 ab
    if (number1 > 10 || number2 > 10) {
      const ones1 = number1 % 10;
      const ones2 = number2 % 10;

      // Wenn Einer-Rechnung eine einfache Kernaufgabe ist
      const isSimpleCoreTask = (ones1 <= 5 && ones2 <= 5) || 
                               (ones1 === ones2) || 
                               (Math.abs(ones1 - ones2) === 1);

      if (isSimpleCoreTask && timeTaken >= 3 && timeTaken <= 10) { // timeTaken in seconds
        return true;
      }
    }

    return false;
  }
}

export const strategyDetector = new StrategyDetector();