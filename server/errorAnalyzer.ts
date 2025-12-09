import { ensureCorrectArithmetic, validateArithmetic } from './arithmeticValidator';

/**
 * Systematischer Fehleranalysator für Addition und Subtraktion
 * Basierend auf wissenschaftlich fundierter Fehlerdiagnostik
 *
 * 8 Fehlerkategorien:
 * 1. Um-1-daneben (Zählfehler)
 * 2. Operations-Verwechslung
 * 3. Tippfehler (Ziffernwiederholung)
 * 4. Stellenwert-Fehler
 * 5. Um-10-daneben
 * 6. Verdopplungsfehler
 * 7. Zahlendreher
 * 8. Weitere Fehler
 */

export type ErrorType =
  | "counting_error_minus_1"  // Zählfehler: 1 zu wenig
  | "counting_error_plus_1"   // Zählfehler: 1 zu viel
  | "counting_error_minus_2"  // Zählfehler: 2 zu wenig
  | "counting_error_plus_2"   // Zählfehler: 2 zu viel
  | "operation_confusion"     // Operations-Verwechslung
  | "input_error"            // Tippfehler (Ziffernwiederholung)
  | "place_value"            // Stellenwert-Fehler
  | "off_by_ten_minus"       // Um-10-daneben: 10 zu wenig
  | "off_by_ten_plus"        // Um-10-daneben: 10 zu viel
  | "doubling_error"        // Verdopplungsfehler
  | "digit_reversal"        // Zahlendreher
  | "decade_boundary_confusion" // Zehner-Stopp-Fehler (Addition statt Subtraktion nach Zehner)
  | "subtraction_reversal_at_ten" // Kleinere-von-Größerer-Fehler beim Zehner
  | "other";                // Weitere Fehler

export type ErrorSeverity = "minor" | "moderate" | "severe";

export interface ErrorAnalysis {
  errorType: ErrorType;
  errorSeverity: ErrorSeverity;
  description: string;
  pedagogicalHint: string;
  difference: number;
  examples: string[];
  placeholderPosition?: 'none' | 'start' | 'middle' | 'end';
  placeholderContext?: string; // Formatted task showing placeholder position
}

// 🎯 8 FEHLERKATEGORIEN
// Mit einprägsamen deutschen Namen für Lehrpersonen

export const ERROR_TYPE_LABELS: Record<string, string> = {
  'counting_error_minus_1': 'Zählfehler: 1 zu wenig',
  'counting_error_plus_1': 'Zählfehler: 1 zu viel',
  'counting_error_minus_2': 'Zählfehler: 2 zu wenig',
  'counting_error_plus_2': 'Zählfehler: 2 zu viel',
  'operation_confusion': 'Zeichen verwechselt',
  'input_error': 'Vertippt',
  'place_value': 'Zehner-Problem',
  'off_by_ten_minus': 'Um-10-daneben: 10 zu wenig',
  'off_by_ten_plus': 'Um-10-daneben: 10 zu viel',
  'doubling_error': 'Kernaufgaben-Fehler',
  'digit_reversal': 'Zahlendreher',
  'decade_boundary_confusion': 'Zehner-Stopp-Fehler',
  'subtraction_reversal_at_ten': 'Kleinere-von-Größerer-Fehler',
  'other': 'Weitere Fehler'
};

// Detaillierte Beschreibungen für Lehrpersonen
export const ERROR_TYPE_DESCRIPTIONS: Record<string, string> = {
  'counting_error_minus_1': 'Kind verzählt sich um 1 nach unten (zu früh gestoppt beim Zählen)',
  'counting_error_plus_1': 'Kind verzählt sich um 1 nach oben (zu weit gezählt)',
  'counting_error_minus_2': 'Kind verzählt sich um 2 nach unten (größerer Zählfehler)',
  'counting_error_plus_2': 'Kind verzählt sich um 2 nach oben (größerer Zählfehler)',
  'operation_confusion': 'Plus und Minus werden verwechselt (Aufmerksamkeit, Zeichenverständnis)',
  'input_error': 'Ziffer versehentlich doppelt eingegeben (kein konzeptioneller Fehler)',
  'place_value': 'Probleme mit Zehnern und Einern (Stellenwertverständnis fehlt)',
  'off_by_ten_minus': 'Antwort ist 10 zu klein (Zehner vergessen oder falsch abgezogen)',
  'off_by_ten_plus': 'Antwort ist 10 zu groß (Zehner doppelt gezählt oder falsch addiert)',
  'doubling_error': 'Fehler bei Kernaufgaben wie 6+6, 14-7 (sollten automatisiert sein)',
  'digit_reversal': 'Ziffern werden vertauscht (z.B. 17 → 71, Leserichtung/Aufmerksamkeit)',
  'decade_boundary_confusion': 'Kind subtrahiert bis zum Zehner korrekt, addiert dann aber den Rest statt zu subtrahieren (z.B. 14-6: erst 14-4=10, dann 10+2=12 statt 10-2=8)',
  'subtraction_reversal_at_ten': 'Kind subtrahiert bis zum Zehner korrekt, vertauscht dann aber Minuend und Subtrahend beim Rest (z.B. 14-6: erst 14-4=10, dann rechnet es 2 statt 10-2=8) - bekannt als "Kleinere-von-Größerer-Fehler" nach Radatz (1979)',
  'other': 'Kein erkanntes Muster (individuelle Beobachtung nötig)'
};

// Förderempfehlungen für jeden Fehlertyp
export const ERROR_TYPE_INTERVENTIONS: Record<string, string[]> = {
  'counting_error_minus_1': [
    'Genaueres Zählen üben (nicht zu früh stoppen)',
    'Zählendes Rechnen durch Strategien ersetzen (Kraft der 5, Nachbaraufgaben)',
    'Kernaufgaben automatisieren (Blitzrechnen, Kopfrechenkarten)',
    'Zwanzigerfeld zur Visualisierung nutzen'
  ],
  'counting_error_plus_1': [
    'Genaueres Zählen üben (nicht zu weit zählen)',
    'Zählendes Rechnen durch Strategien ersetzen (Kraft der 5, Nachbaraufgaben)',
    'Kernaufgaben automatisieren (Blitzrechnen, Kopfrechenkarten)',
    'Zwanzigerfeld zur Visualisierung nutzen'
  ],
  'counting_error_minus_2': [
    'Intensives Zähltraining mit Selbstkontrolle',
    'Strategien statt Zählen: Verdopplungen, Nachbaraufgaben',
    'Material nutzen: Zwanzigerfeld, Rechenkette',
    'Kleinere Schritte: Erst im ZR 10 festigen'
  ],
  'counting_error_plus_2': [
    'Intensives Zähltraining mit Selbstkontrolle',
    'Strategien statt Zählen: Verdopplungen, Nachbaraufgaben',
    'Material nutzen: Zwanzigerfeld, Rechenkette',
    'Kleinere Schritte: Erst im ZR 10 festigen'
  ],
  'operation_confusion': [
    'Operation vor Rechnen laut benennen lassen',
    'Plus/Minus visuell unterscheidbar machen (Farben, Größe)',
    'Aufmerksamkeitstraining (bewusstes Lesen)'
  ],
  'input_error': [
    'Selbstkontrolle fördern (Ergebnis nochmal anschauen)',
    'Kein konzeptioneller Förderbedarf - nur Sorgfalt',
    'Eventuell motorische Unterstützung bei wiederholtem Auftreten'
  ],
  'place_value': [
    'Dienes-Blöcke oder Hunderterfeld nutzen',
    'Zehner und Einer getrennt rechnen üben',
    'Bündelungsverständnis aufbauen (10 Einer = 1 Zehner)'
  ],
  'off_by_ten_minus': [
    'Zahlen in Zehner und Einer zerlegen (z.B. 23 = 20 + 3)',
    'Zehner bewusst machen: "Wie viele Zehner hat die Zahl?"',
    'Rechenketten mit farbigen Zehnern nutzen',
    'Hunderterfeld zur Visualisierung von Zehnersprüngen',
    'Stellenwerttafel: Zehner- und Einerstelle getrennt betrachten'
  ],
  'off_by_ten_plus': [
    'Zehner nicht doppelt zählen üben',
    'Systematisches Zerlegen: erst Zehner, dann Einer',
    'Rechenketten: Zehnersprünge bewusst visualisieren',
    'Hunderterfeld: "Wo lande ich bei +10?"',
    'Kontrollfragen: "Macht das Ergebnis Sinn? Ist es zu groß?"'
  ],
  'doubling_error': [
    'Verdopplungen rhythmisch üben (6+6=12, 7+7=14, ...)',
    'Halbierungen als Umkehrung verstehen',
    'Spiele zum Einprägen (Memory mit Kernaufgaben)'
  ],
  'digit_reversal': [
    'Zahlen vor dem Rechnen laut vorlesen lassen',
    'Zahlen farbig hervorheben oder vergrößern',
    'Leserichtung bewusst machen (links → rechts)',
    'Bei häufigem Auftreten: Visuelle Wahrnehmung prüfen'
  ],
  'decade_boundary_confusion': [
    'Schrittweises Rechnen bewusst machen: "Erst bis 10, dann WEITER subtrahieren"',
    'Zahlenstrahl nutzen: Zeige visuelle Rückwärtsbewegung über den Zehner',
    'Sprachliche Begleitung: "Von 10 weg" statt "zu 10 hin"',
    'Rechenkette: Färbe den zweiten Subtraktionsschritt anders ein',
    'Zwanzigerfeld: Zeige beide Schritte mit Plättchen (erst 4 weg, dann nochmal 2 weg)',
    'Wichtig: Operation bleibt MINUS, auch nach dem Zehner!'
  ],
  'other': [
    'Kind beim Rechnen beobachten',
    'Lösungsweg erklären lassen',
    'Eventuell diagnostisches Gespräch'
  ]
};


export class ErrorAnalyzer {

  /**
   * Hauptanalyse-Funktion
   * Prüft Fehlerkategorien in wissenschaftlich fundierter Prioritätsreihenfolge
   */
  analyzeError(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    placeholderPosition: 'none' | 'start' | 'middle' | 'end' = 'none'
  ): ErrorAnalysis | null {

    // KRITISCH: Validiere correctAnswer zuerst!
    const validatedCorrectAnswer = ensureCorrectArithmetic(operation, number1, number2, correctAnswer);
    const validation = validateArithmetic(operation, number1, number2, correctAnswer);

    if (!validation.isValid) {
      console.error('🚨 CRITICAL: ErrorAnalyzer received WRONG correctAnswer!');
      console.error(validation.error);
      correctAnswer = validatedCorrectAnswer;
    }

    // Kein Fehler, wenn Antwort korrekt
    if (studentAnswer === correctAnswer) {
      return null;
    }

    const difference = studentAnswer - correctAnswer;
    const absDifference = Math.abs(difference);

    // Format placeholder context for display
    const placeholderContext = this.formatPlaceholderContext(
      operation,
      number1,
      number2,
      correctAnswer,
      placeholderPosition
    );

    // Prioritätsreihenfolge der Fehlerprüfung:
    // 1. Verdopplungsfehler (spezifischster Fehler)
    const doublingError = this.checkDoublingError(operation, number1, number2, correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (doublingError) return doublingError;

    // 2. Operations-Verwechslung (sehr eindeutig)
    const operationError = this.checkOperationConfusion(operation, number1, number2, correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (operationError) return operationError;

    // 2b. Zehner-Stopp-Fehler (spezifischer Subtraktionsfehler)
    const decadeBoundaryError = this.checkDecadeBoundaryConfusion(operation, number1, number2, correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (decadeBoundaryError) return decadeBoundaryError;

    // 2c. Kleinere-von-Größerer-Fehler beim Zehner
    const reversalAtTenError = this.checkSubtractionReversalAtTen(operation, number1, number2, correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (reversalAtTenError) return reversalAtTenError;

    // 3. Zahlendreher (vor Tippfehler, da spezifischer)
    const digitReversalError = this.checkDigitReversal(correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (digitReversalError) return digitReversalError;

    // 4. Tippfehler (charakteristisches Muster)
    const inputError = this.checkInputError(correctAnswer, studentAnswer, placeholderPosition, placeholderContext);
    if (inputError) return inputError;

    // 5. Zählfehler (differenziert: ±1, ±2)
    const countingError = this.checkCountingError(difference, placeholderPosition, placeholderContext);
    if (countingError) return countingError;

    // 6. Um-10-daneben (differenziert nach Richtung: ±10)
    const offByTenError = this.checkOffByTen(difference, placeholderPosition, placeholderContext);
    if (offByTenError) return offByTenError;

    // 7. Stellenwert-Fehler (komplexeres Muster)
    const placeValueError = this.checkPlaceValueError(operation, number1, number2, correctAnswer, studentAnswer, absDifference, placeholderPosition, placeholderContext);
    if (placeValueError) return placeValueError;

    // 8. Weitere Fehler
    return this.createOtherError(difference, placeholderPosition, placeholderContext);
  }

  /**
   * Formatiert die Aufgabe mit Unterstreichung des Platzhalters
   */
  private formatPlaceholderContext(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    placeholderPosition: 'none' | 'start' | 'middle' | 'end'
  ): string {
    const opSymbol = operation === '+' ? '+' : '−';

    if (placeholderPosition === 'start') {
      // Placeholder is the first number
      return `<u>${number1}</u> ${opSymbol} ${number2} = ${correctAnswer}`;
    } else if (placeholderPosition === 'middle') {
      // Placeholder is the second number
      return `${number1} ${opSymbol} <u>${number2}</u> = ${correctAnswer}`;
    } else if (placeholderPosition === 'end') {
      // Placeholder is the answer
      return `${number1} ${opSymbol} ${number2} = <u>${correctAnswer}</u>`;
    } else {
      // 'none' or any other case, default to underlining the answer
      return `${number1} ${opSymbol} ${number2} = <u>${correctAnswer}</u>`;
    }
  }

  /**
   * Fehlerkategorie 1: Zählfehler (differenziert nach Richtung und Größe)
   * Erkennung: Antwort weicht um 1 oder 2 vom korrekten Ergebnis ab
   */
  private checkCountingError(difference: number, placeholderPosition?: string, placeholderContext?: string): ErrorAnalysis | null {
    // 1a) 1 zu wenig (Antwort ist 1 kleiner als korrekt)
    if (difference === -1) {
      return {
        errorType: "counting_error_minus_1",
        errorSeverity: "minor",
        description: "Zählfehler (1 zu wenig): Das Kind hat zu früh aufgehört zu zählen.",
        pedagogicalHint: "Das Kind nutzt noch zählendes Rechnen und stoppt zu früh. Förderung von Rechenstrategien und Automatisierung empfohlen. Üben Sie Kernaufgaben und präzises Zählen mit Selbstkontrolle.",
        difference: 1,
        examples: ["3 + 5 = 7 (korrekt: 8)", "5 + 7 = 11 (korrekt: 12)", "14 - 6 = 7 (korrekt: 8)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // 1b) 1 zu viel (Antwort ist 1 größer als korrekt)
    if (difference === 1) {
      return {
        errorType: "counting_error_plus_1",
        errorSeverity: "minor",
        description: "Zählfehler (1 zu viel): Das Kind hat einen Schritt zu weit gezählt.",
        pedagogicalHint: "Das Kind nutzt noch zählendes Rechnen und zählt zu weit. Förderung von Rechenstrategien und Automatisierung empfohlen. Üben Sie Kernaufgaben und präzises Zählen mit Stoppkontrolle.",
        difference: 1,
        examples: ["3 + 4 = 8 (korrekt: 7)", "5 + 7 = 13 (korrekt: 12)", "14 - 6 = 9 (korrekt: 8)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // 1c) 2 zu wenig (Antwort ist 2 kleiner als korrekt)
    if (difference === -2) {
      return {
        errorType: "counting_error_minus_2",
        errorSeverity: "moderate",
        description: "Zählfehler (2 zu wenig): Das Kind hat sich beim Zählen um 2 verzählt (zu früh gestoppt).",
        pedagogicalHint: "Größerer Zählfehler deutet auf Unsicherheit hin. Dringend Strategien statt Zählen fördern. Intensives Training mit Material (Zwanzigerfeld, Rechenkette) und Automatisierung von Kernaufgaben.",
        difference: 2,
        examples: ["5 + 7 = 10 (korrekt: 12)", "8 + 6 = 12 (korrekt: 14)", "15 - 8 = 5 (korrekt: 7)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // 1d) 2 zu viel (Antwort ist 2 größer als korrekt)
    if (difference === 2) {
      return {
        errorType: "counting_error_plus_2",
        errorSeverity: "moderate",
        description: "Zählfehler (2 zu viel): Das Kind hat sich beim Zählen um 2 verzählt (zu weit gezählt).",
        pedagogicalHint: "Größerer Zählfehler deutet auf Unsicherheit hin. Dringend Strategien statt Zählen fördern. Intensives Training mit Material (Zwanzigerfeld, Rechenkette) und Automatisierung von Kernaufgaben.",
        difference: 2,
        examples: ["5 + 7 = 14 (korrekt: 12)", "8 + 6 = 16 (korrekt: 14)", "15 - 8 = 9 (korrekt: 7)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 2: Operations-Verwechslung
   * Erkennung: Kind hat + statt - oder - statt + gerechnet
   */
  private checkOperationConfusion(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    placeholderPosition?: string,
    placeholderContext?: string
  ): ErrorAnalysis | null {

    // Berechne das Ergebnis mit der umgekehrten Operation
    const wrongOperationResult = operation === "+"
      ? number1 - number2
      : number1 + number2;

    // Prüfe exakte Übereinstimmung mit der falschen Operation
    if (studentAnswer === wrongOperationResult) {
      return {
        errorType: "operation_confusion",
        errorSeverity: "severe",
        description: "Operationsverwechslung: Das Kind hat die falsche Rechenoperation ausgeführt.",
        pedagogicalHint: "Das Kind verwechselt die Operationszeichen Plus und Minus. Übungen zur bewussten Unterscheidung von + und - empfohlen. Möglicherweise unaufmerksames Lesen der Aufgabe. Nutzen Sie visuelle Unterstützung und lassen Sie das Kind die Operation vor dem Rechnen benennen.",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: ["6 + 4 = 2 (Kind rechnete 6 - 4)", "7 - 3 = 10 (Kind rechnete 7 + 3)", "12 + 5 = 7 (Kind rechnete 12 - 5)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // Zusätzlich: Prüfe Betrag für beide Operationen
    if (operation === "+" && studentAnswer === Math.abs(number1 - number2)) {
      return {
        errorType: "operation_confusion",
        errorSeverity: "severe",
        description: "Operationsverwechslung: Das Kind hat subtrahiert statt addiert (Betrag).",
        pedagogicalHint: "Das Kind verwechselt die Operationszeichen Plus und Minus. Übungen zur bewussten Unterscheidung von + und - empfohlen. Möglicherweise unaufmerksames Lesen der Aufgabe. Nutzen Sie visuelle Unterstützung und lassen Sie das Kind die Operation vor dem Rechnen benennen.",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: ["5 + 7 = 2 (Kind rechnete |5 - 7|)", "3 + 8 = 5 (Kind rechnete |3 - 8|)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    if (operation === "-" && studentAnswer === (number1 + number2)) {
      return {
        errorType: "operation_confusion",
        errorSeverity: "severe",
        description: "Operationsverwechslung: Das Kind hat addiert statt subtrahiert.",
        pedagogicalHint: "Das Kind verwechselt die Operationszeichen Plus und Minus. Übungen zur bewussten Unterscheidung von + und - empfohlen. Möglicherweise unaufmerksames Lesen der Aufgabe. Nutzen Sie visuelle Unterstützung und lassen Sie das Kind die Operation vor dem Rechnen benennen.",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: ["10 - 3 = 13 (Kind rechnete 10 + 3)", "15 - 8 = 23 (Kind rechnete 15 + 8)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 3: Tippfehler (Ziffernwiederholung)
   * Erkennung: Ziffer wurde versehentlich mehrfach eingegeben
   */
  private checkInputError(correctAnswer: number, studentAnswer: number, placeholderPosition?: string, placeholderContext?: string): ErrorAnalysis | null {
    const studentStr = String(studentAnswer);
    const correctStr = String(correctAnswer);

    // Muster A: Doppelte aufeinanderfolgende Ziffern (11, 22, 77, 122, 233, etc.)
    if (studentStr.length > correctStr.length) {
      const digits = studentStr.split('');

      // Zähle Vorkommen jeder Ziffer
      const digitCounts: Record<string, number> = {};
      for (const digit of digits) {
        digitCounts[digit] = (digitCounts[digit] || 0) + 1;
      }

      // Wenn eine Ziffer mehrfach vorkommt
      const duplicates = Object.entries(digitCounts).filter(([_, count]) => count > 1);

      if (duplicates.length > 0) {
        for (const [duplicateDigit, count] of duplicates) {
          let testStr = studentStr;
          for (let i = 0; i < count - 1; i++) {
            const index = testStr.lastIndexOf(duplicateDigit);
            if (index !== -1) {
              testStr = testStr.slice(0, index) + testStr.slice(index + 1);
            }
          }

          if (Number(testStr) === correctAnswer) {
            return {
              errorType: "input_error",
              errorSeverity: "minor",
              description: "Tippfehler: Eine Ziffer wurde versehentlich mehrfach eingegeben.",
              pedagogicalHint: "Wahrscheinlich ein Eingabefehler, kein konzeptioneller Rechenfehler. Ermutigung zu sorgfältiger Eingabe und Kontrolle der Antwort. Das mathematische Verständnis ist vorhanden.",
              difference: Math.abs(studentAnswer - correctAnswer),
              examples: ["6 + 6 = 122 (korrekt: 12, die '2' wurde verdoppelt)", "12 - 5 = 77 (korrekt: 7)", "15 + 8 = 233 (korrekt: 23)"],
              placeholderPosition: placeholderPosition as any,
              placeholderContext
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Fehlerkategorie 4: Stellenwert-Fehler
   * Erkennung: Probleme mit Übertrag, um 90/100 daneben, falsche Stellenstruktur
   */
  private checkPlaceValueError(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    absDifference: number,
    placeholderPosition?: string,
    placeholderContext?: string
  ): ErrorAnalysis | null {

    // Variante A: Um 90 daneben
    if (absDifference === 90) {
      return {
        errorType: "place_value",
        errorSeverity: "severe",
        description: "Stellenwert-Fehler: Differenz von 90 deutet auf fundamentales Stellenwertproblem hin.",
        pedagogicalHint: "Das Kind hat Schwierigkeiten mit dem Stellenwertsystem. Gezielte Übungen zum Zehnerübergang und Stellenwertverständnis dringend empfohlen. Verwenden Sie Materialien wie Dienes-Blöcke oder das Hunderterfeld.",
        difference: absDifference,
        examples: ["13 - 4 = 99 (korrekt: 9)", "3 + 9 = 102 (korrekt: 12)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // Variante B: Um 100 daneben
    if (absDifference === 100) {
      return {
        errorType: "place_value",
        errorSeverity: "severe",
        description: "Stellenwert-Fehler: Differenz von 100 zeigt Probleme beim Hunderterübergang.",
        pedagogicalHint: "Das Kind hat Schwierigkeiten mit dem Stellenwertsystem und Übertragungen im Hunderterbereich. Gezielte Übungen zum Stellenwertverständnis empfohlen.",
        difference: absDifference,
        examples: ["8 + 7 = 115 (korrekt: 15)", "3 + 9 = 102 (korrekt: 12)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // Variante C: Fehlerhafter Übertrag bei Zehnerübergang
    if (operation === "+" && correctAnswer > 10 && correctAnswer < 20) {
      const ones1 = number1 % 10;
      const ones2 = number2 % 10;

      if (ones1 + ones2 >= 10) {
        const expectedOnes = (ones1 + ones2) % 10;
        const studentStr = String(studentAnswer);

        // Check if the student's answer contains '1' (for the carried ten)
        // and the correct ones digit. This pattern often indicates writing digits next to each other.
        if (studentStr.includes('1') && studentStr.includes(String(expectedOnes))) {
          return {
            errorType: "place_value",
            errorSeverity: "moderate",
            description: "Stellenwert-Fehler: Übertrag wird nicht richtig verarbeitet, Ziffern werden nebeneinander geschrieben.",
            pedagogicalHint: "Das Kind erkennt den Zehnerübergang, versteht aber nicht, dass '1' und '5' zusammen '15' ergeben. Üben Sie das Bündeln von Einern zu Zehnern mit konkretem Material.",
            difference: absDifference,
            examples: ["7 + 8 = 115 (korrekt: 15)", "9 + 6 = 115 (korrekt: 15)", "8 + 7 = 115 (korrekt: 15)"],
            placeholderPosition: placeholderPosition as any,
            placeholderContext
          };
        }
      }
    }

    // Variante D: Stellenstruktur verzerrt
    if (correctAnswer >= 10 && studentAnswer >= 10) {
      const correctOnes = correctAnswer % 10;
      const correctTens = Math.floor(correctAnswer / 10);
      const studentOnes = studentAnswer % 10;
      const studentTens = Math.floor(studentAnswer / 10);

      // If ones digit is roughly correct, but tens digit is significantly off
      if (Math.abs(correctOnes - studentOnes) <= 2 && Math.abs(correctTens - studentTens) >= 1) {
        return {
          errorType: "place_value",
          errorSeverity: "moderate",
          description: "Stellenwert-Fehler: Die Zehnerstelle wurde falsch berechnet, Einerstelle ist ungefähr korrekt.",
          pedagogicalHint: "Das Kind hat Schwierigkeiten mit der Zehnerstelle beim Rechnen. Üben Sie getrennte Zehner- und Einerrechnung. Nutzen Sie das Hunderterfeld zur Visualisierung.",
          difference: absDifference,
          examples: ["26 - 8 = 22 (korrekt: 18, Fehler beim Borgen)", "47 + 8 = 45 (korrekt: 55)"],
          placeholderPosition: placeholderPosition as any,
          placeholderContext
        };
      }
    }

    return null;
  }

  /**
   * Fehlerkategorie 5: Um-10-daneben (differenziert: 5a = 10 zu wenig, 5b = 10 zu viel)
   * Erkennung: Antwort ist exakt ±10 vom korrekten Ergebnis
   */
  private checkOffByTen(difference: number, placeholderPosition?: string, placeholderContext?: string): ErrorAnalysis | null {
    // 5a) 10 zu wenig (Antwort ist 10 kleiner als korrekt)
    if (difference === -10) {
      return {
        errorType: "off_by_ten_minus",
        errorSeverity: "moderate",
        description: "Um-10-daneben (10 zu wenig): Das Kind hat einen Zehner zu wenig gerechnet.",
        pedagogicalHint: "Das Kind vergisst einen Zehner oder zieht ihn fälschlicherweise ab. Üben Sie das bewusste Zerlegen in Zehner und Einer. Nutzen Sie Rechenketten mit farbig markierten Zehnern und das Hunderterfeld zur Visualisierung.",
        difference: 10,
        examples: ["12 + 9 = 11 (korrekt: 21)", "22 - 6 = 6 (korrekt: 16)", "18 + 7 = 15 (korrekt: 25)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // 5b) 10 zu viel (Antwort ist 10 größer als korrekt)
    if (difference === 10) {
      return {
        errorType: "off_by_ten_plus",
        errorSeverity: "moderate",
        description: "Um-10-daneben (10 zu viel): Das Kind hat einen Zehner zu viel gerechnet.",
        pedagogicalHint: "Das Kind zählt einen Zehner doppelt oder addiert ihn fälschlicherweise. Üben Sie systematisches Zerlegen: erst Zehner, dann Einer. Nutzen Sie Kontrollfragen: 'Macht das Ergebnis Sinn?' Hunderterfeld hilft bei der Visualisierung.",
        difference: 10,
        examples: ["8 + 5 = 23 (korrekt: 13)", "14 - 7 = 17 (korrekt: 7)", "9 + 6 = 25 (korrekt: 15)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 6: Verdopplungsfehler
   * Erkennung: Fehler bei Aufgaben mit identischen Operanden (6+6, 14-7, etc.)
   */
  private checkDoublingError(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    placeholderPosition?: string,
    placeholderContext?: string
  ): ErrorAnalysis | null {

    // Bei Addition: Beide Zahlen identisch (Verdopplung)
    if (operation === "+" && number1 === number2) {
      return {
        errorType: "doubling_error",
        errorSeverity: "moderate",
        description: "Verdopplungsfehler: Fehler bei einer Verdopplungsaufgabe (z.B. 6+6, 7+7).",
        pedagogicalHint: "Verdopplungen sind Kernaufgaben der Mathematik und sollten automatisiert sein. Gezielte Übung dieser Aufgabentypen empfohlen, da sie als Basis für viele andere Rechenstrategien dienen. Nutzen Sie Spiele und rhythmische Übungen zum Einprägen.",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: ["6 + 6 = 11 (korrekt: 12)", "9 + 9 = 19 (korrekt: 18)", "8 + 8 = 15 (korrekt: 16)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    // Bei Subtraktion: Halbierung (z.B. 14-7, 18-9, 10-5)
    if (operation === "-" && number1 === number2 * 2) {
      return {
        errorType: "doubling_error",
        errorSeverity: "moderate",
        description: "Halbierungsfehler: Fehler bei einer Halbierungsaufgabe (z.B. 14-7, 18-9).",
        pedagogicalHint: "Halbierungen sind eng mit Verdopplungen verwandt und sollten als Kernaufgaben beherrscht werden. Üben Sie den Zusammenhang zwischen Verdoppeln und Halbieren. Diese Aufgaben sind fundamental für das Rechnen.",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: ["14 - 7 = 6 (korrekt: 7)", "18 - 9 = 8 (korrekt: 9)", "10 - 5 = 4 (korrekt: 5)"],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 7: Zahlendreher (NEU)
   * Erkennung: Ziffern wurden vertauscht (z.B. 17 → 71, 23 → 32)
   */
  private checkDigitReversal(correctAnswer: number, studentAnswer: number, placeholderPosition?: string, placeholderContext?: string): ErrorAnalysis | null {
    const correctStr = String(correctAnswer);
    const studentStr = String(studentAnswer);

    // Nur bei zweistelligen Zahlen prüfen (hauptsächlicher Anwendungsfall)
    if (correctStr.length === 2 && studentStr.length === 2) {
      // Prüfe ob die Ziffern vertauscht sind
      const reversedCorrect = correctStr.split('').reverse().join('');

      if (studentStr === reversedCorrect) {
        return {
          errorType: "digit_reversal",
          errorSeverity: "moderate",
          description: "Zahlendreher: Die Ziffern der Zahl wurden vertauscht.",
          pedagogicalHint: "Das Kind vertauscht die Ziffernreihenfolge beim Lesen oder Schreiben von Zahlen. Üben Sie das laute Vorlesen von Zahlen und betonen Sie die Leserichtung (von links nach rechts). Bei häufigem Auftreten sollte die visuelle Wahrnehmung überprüft werden.",
          difference: Math.abs(studentAnswer - correctAnswer),
          examples: ["7 + 10 = 71 (korrekt: 17)", "12 + 11 = 32 (korrekt: 23)", "8 + 6 = 41 (korrekt: 14)"],
          placeholderPosition: placeholderPosition as any,
          placeholderContext
        };
      }
    }

    return null;
  }

  /**
   * Fehlerkategorie 2b: Zehner-Stopp-Fehler (NEU)
   * Erkennung: Kind subtrahiert bis zum Zehner, addiert dann statt zu subtrahieren
   * Beispiel: 14-6 → Kind rechnet 14-4=10, dann 10+2=12 (statt 10-2=8)
   */
  private checkDecadeBoundaryConfusion(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    placeholderPosition?: string,
    placeholderContext?: string
  ): ErrorAnalysis | null {

    // Nur bei Subtraktion mit Zehnerübergang relevant
    if (operation !== "-") return null;
    if (number1 <= 10 || number2 <= 10) return null;

    // Prüfe ob Zehnerübergang vorliegt (korrekte Antwort < 10, Start > 10)
    const crossesTen = number1 > 10 && correctAnswer < 10;
    if (!crossesTen) return null;

    // Berechne erwartete Fehlerstruktur:
    // Beispiel 14-6: Schritt 1: 14-4=10 korrekt
    //                Schritt 2: 10+2=12 FALSCH (sollte 10-2=8 sein)
    const toTen = number1 % 10; // Wie viele bis zum Zehner? (14 → 4)
    const remaining = number2 - toTen; // Rest nach Zehner (6-4=2)

    if (remaining <= 0) return null; // Kein Zehnerübergang nötig

    // Erwartete falsche Antwort: 10 + remaining (statt 10 - remaining)
    const expectedWrongAnswer = 10 + remaining;

    if (studentAnswer === expectedWrongAnswer) {
      return {
        errorType: "decade_boundary_confusion",
        errorSeverity: "severe",
        description: "Zehner-Stopp-Fehler: Das Kind subtrahiert korrekt bis zum Zehner, addiert dann aber den Rest statt zu subtrahieren.",
        pedagogicalHint: "Schwerwiegender konzeptioneller Fehler! Das Kind verwechselt die Operation WÄHREND der Rechnung. Es versteht schrittweises Rechnen teilweise, aber die Operation bleibt nicht konstant. Intensive Förderung mit Visualisierung (Zahlenstrahl, Zwanzigerfeld) und sprachlicher Begleitung dringend nötig: 'Wir ziehen immer noch ab, auch nach dem Zehner!'",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: [
          "14 - 6: Kind rechnet 14-4=10 ✓, dann 10+2=12 ✗ (korrekt: 10-2=8)",
          "15 - 9: Kind rechnet 15-5=10 ✓, dann 10+4=14 ✗ (korrekt: 10-4=6)",
          "13 - 7: Kind rechnet 13-3=10 ✓, dann 10+4=14 ✗ (korrekt: 10-4=6)"
        ],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 2c: Kleinere-von-Größerer-Fehler beim Zehner (NEU)
   * Erkennung: Kind subtrahiert bis zum Zehner, nimmt dann den Rest statt 10-Rest
   * Beispiel: 14-6 → Kind rechnet 14-4=10, dann nimmt es 2 (statt 10-2=8)
   */
  private checkSubtractionReversalAtTen(
    operation: "+" | "-",
    number1: number,
    number2: number,
    correctAnswer: number,
    studentAnswer: number,
    placeholderPosition?: string,
    placeholderContext?: string
  ): ErrorAnalysis | null {

    // Nur bei Subtraktion mit Zehnerübergang relevant
    if (operation !== "-") return null;
    if (number1 <= 10 || number2 <= 10) return null;

    // Prüfe ob Zehnerübergang vorliegt (korrekte Antwort < 10, Start > 10)
    const crossesTen = number1 > 10 && correctAnswer < 10;
    if (!crossesTen) return null;

    // Berechne erwartete Fehlerstruktur:
    // Beispiel 14-6: Schritt 1: 14-4=10 korrekt
    //                Schritt 2: Kind nimmt 2 FALSCH (sollte 10-2=8 sein)
    const toTen = number1 % 10; // Wie viele bis zum Zehner? (14 → 4)
    const remaining = number2 - toTen; // Rest nach Zehner (6-4=2)

    if (remaining <= 0) return null; // Kein Zehnerübergang nötig

    // Erwartete falsche Antwort: remaining (statt 10 - remaining)
    if (studentAnswer === remaining) {
      return {
        errorType: "subtraction_reversal_at_ten",
        errorSeverity: "severe",
        description: "Kleinere-von-Größerer-Fehler: Das Kind subtrahiert korrekt bis zum Zehner, nimmt dann aber den Rest als Ergebnis statt 10 minus Rest zu rechnen.",
        pedagogicalHint: "Schwerwiegender konzeptioneller Fehler nach Radatz (1979)! Das Kind verwechselt beim zweiten Schritt Minuend und Subtrahend. Es versteht schrittweises Rechnen teilweise, aber die Richtung der Subtraktion bleibt nicht klar. Intensive Förderung mit sprachlicher Begleitung nötig: 'VON der 10 WEG, nicht die 2 nehmen!'",
        difference: Math.abs(studentAnswer - correctAnswer),
        examples: [
          "14 - 6: Kind rechnet 14-4=10 ✓, dann nimmt es 2 ✗ (korrekt: 10-2=8)",
          "15 - 9: Kind rechnet 15-5=10 ✓, dann nimmt es 4 ✗ (korrekt: 10-4=6)",
          "13 - 7: Kind rechnet 13-3=10 ✓, dann nimmt es 4 ✗ (korrekt: 10-4=6)"
        ],
        placeholderPosition: placeholderPosition as any,
        placeholderContext
      };
    }

    return null;
  }

  /**
   * Fehlerkategorie 8: Weitere Fehler (statt "unknown")
   * Wird verwendet wenn kein spezifisches Muster erkannt wurde
   */
  private createOtherError(difference: number, placeholderPosition?: string, placeholderContext?: string): ErrorAnalysis {
    const absDifference = Math.abs(difference);

    let severity: ErrorSeverity = "moderate";
    if (absDifference <= 3) severity = "minor";
    else if (absDifference >= 20) severity = "severe";

    return {
      errorType: "other",
      errorSeverity: severity,
      description: `Weitere Fehler: Die Antwort weicht um ${absDifference} vom korrekten Ergebnis ab.`,
      pedagogicalHint: "Es wurde kein bekanntes Fehlermuster erkannt. Beobachten Sie das Kind beim Rechnen, um die Ursache zu identifizieren. Lassen Sie sich den Lösungsweg erklären. Möglicherweise liegt ein individuelles Missverständnis vor.",
      difference: absDifference,
      examples: [],
      placeholderPosition: placeholderPosition as any,
      placeholderContext
    };
  }

  static getErrorTypeName(errorType: ErrorType): string {
    // Use the mapped label if available, otherwise return the errorType itself.
    return ERROR_TYPE_LABELS[errorType] || errorType;
  }

  static getAllErrorCategories(): Array<{type: ErrorType, name: string, description: string}> {
    return [
      {
        type: "counting_error_minus_1",
        name: "Zählfehler: 1 zu wenig",
        description: "Das Kind stoppt beim Zählen zu früh (z.B. 3+5=7)"
      },
      {
        type: "counting_error_plus_1",
        name: "Zählfehler: 1 zu viel",
        description: "Das Kind zählt einen Schritt zu weit (z.B. 3+4=8)"
      },
      {
        type: "counting_error_minus_2",
        name: "Zählfehler: 2 zu wenig",
        description: "Größerer Zählfehler nach unten"
      },
      {
        type: "counting_error_plus_2",
        name: "Zählfehler: 2 zu viel",
        description: "Größerer Zählfehler nach oben"
      },
      {
        type: "operation_confusion",
        name: "Operations-Verwechslung",
        description: "Plus und Minus werden verwechselt"
      },
      {
        type: "input_error",
        name: "Tippfehler",
        description: "Ziffern werden versehentlich mehrfach eingegeben"
      },
      {
        type: "place_value",
        name: "Stellenwert-Fehler",
        description: "Probleme mit dem Stellenwertsystem und Überträgen"
      },
      {
        type: "off_by_ten_minus",
        name: "Um-10-daneben: 10 zu wenig",
        description: "Das Kind hat 10 zu wenig gerechnet (Zehner vergessen)"
      },
      {
        type: "off_by_ten_plus",
        name: "Um-10-daneben: 10 zu viel",
        description: "Das Kind hat 10 zu viel gerechnet (Zehner doppelt gezählt)"
      },
      {
        type: "doubling_error",
        name: "Verdopplungs-/Halbierungsfehler",
        description: "Fehler bei Kernaufgaben wie 6+6 oder 14-7"
      },
      {
        type: "digit_reversal",
        name: "Zahlendreher",
        description: "Ziffern werden vertauscht (z.B. 17 → 71)"
      },
      {
        type: "decade_boundary_confusion",
        name: "Zehner-Stopp-Fehler",
        description: "Bis zum Zehner korrekt subtrahiert, dann addiert statt subtrahiert (z.B. 14-6=12)"
      },
      {
        type: "subtraction_reversal_at_ten",
        name: "Kleinere-von-Größerer-Fehler",
        description: "Bis zum Zehner korrekt subtrahiert, dann Rest genommen statt 10-Rest (z.B. 14-6=2)"
      },
      {
        type: "other",
        name: "Weitere Fehler",
        description: "Kein bekanntes Fehlermuster erkannt"
      }
    ];
  }
}

export const errorAnalyzer = new ErrorAnalyzer();