
/**
 * CRITICAL ARITHMETIC VALIDATOR
 * 
 * Diese Schicht stellt ABSOLUT sicher, dass JEDE arithmetische Berechnung korrekt ist.
 * KEINE Aufgabe darf jemals mit einer falschen correctAnswer gespeichert werden.
 */

export interface ArithmeticValidation {
  isValid: boolean;
  error?: string;
  expectedResult: number;
  receivedResult: number;
}

/**
 * KRITISCH: Validiert JEDE arithmetische Operation
 */
export function validateArithmetic(
  operation: '+' | '-',
  number1: number,
  number2: number,
  claimedResult: number
): ArithmeticValidation {
  // Berechne das TATSÄCHLICHE Ergebnis
  const actualResult = operation === '+' 
    ? number1 + number2 
    : number1 - number2;

  // KRITISCHER CHECK: Stimmt die Behauptung?
  if (actualResult !== claimedResult) {
    console.error('🚨🚨🚨 CRITICAL ARITHMETIC ERROR DETECTED! 🚨🚨🚨');
    console.error(`Operation: ${number1} ${operation} ${number2}`);
    console.error(`Expected: ${actualResult}`);
    console.error(`Received: ${claimedResult}`);
    console.error(`DIFFERENCE: ${actualResult - claimedResult}`);
    console.error('🚨🚨🚨 THIS MUST NEVER HAPPEN! 🚨🚨🚨');

    return {
      isValid: false,
      error: `CRITICAL: ${number1} ${operation} ${number2} = ${actualResult}, but got ${claimedResult}`,
      expectedResult: actualResult,
      receivedResult: claimedResult
    };
  }

  return {
    isValid: true,
    expectedResult: actualResult,
    receivedResult: claimedResult
  };
}

/**
 * KRITISCH: Korrigiert fehlerhafte Berechnungen automatisch
 */
export function ensureCorrectArithmetic(
  operation: '+' | '-',
  number1: number,
  number2: number,
  claimedResult?: number
): number {
  const actualResult = operation === '+' 
    ? number1 + number2 
    : number1 - number2;

  if (claimedResult !== undefined && claimedResult !== actualResult) {
    console.error('⚠️ AUTO-CORRECTING ARITHMETIC ERROR!');
    console.error(`Was: ${number1} ${operation} ${number2} = ${claimedResult}`);
    console.error(`Now: ${number1} ${operation} ${number2} = ${actualResult}`);
  }

  return actualResult;
}

/**
 * KRITISCH: Validiert eine komplette Aufgabe
 */
export function validateTask(task: {
  operation: '+' | '-';
  number1: number;
  number2: number;
  correctAnswer: number;
}): ArithmeticValidation {
  return validateArithmetic(
    task.operation,
    task.number1,
    task.number2,
    task.correctAnswer
  );
}

/**
 * KRITISCH: Validiert Schülerantwort gegen korrekte Berechnung
 */
export function validateStudentAnswer(
  operation: '+' | '-',
  number1: number,
  number2: number,
  studentAnswer: number
): {
  isCorrect: boolean;
  correctAnswer: number;
  studentAnswer: number;
} {
  const correctAnswer = operation === '+' 
    ? number1 + number2 
    : number1 - number2;

  return {
    isCorrect: studentAnswer === correctAnswer,
    correctAnswer,
    studentAnswer
  };
}
