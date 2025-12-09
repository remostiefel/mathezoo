
/**
 * TASK VALIDATION UTILITIES
 * 
 * STRIKTE Validierung für alle generierten Aufgaben.
 * Verhindert ABSOLUT:
 * - Negative Zahlen (number1 < 0 oder number2 < 0)
 * - Negative Ergebnisse bei Subtraktion
 * - NaN, Infinity, undefined
 */

export interface TaskNumbers {
  operation: '+' | '-';
  number1: number;
  number2: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  correctedTask?: TaskNumbers;
}

/**
 * STRIKTE Validierung - KEINE negativen Zahlen erlaubt!
 */
export function validateTask(task: TaskNumbers): ValidationResult {
  const { operation, number1, number2 } = task;

  // KRITISCH 1: ABSOLUT KEINE negativen Zahlen
  if (number1 < 0) {
    console.error(`❌ CRITICAL: number1 ist negativ: ${number1}`);
    return {
      isValid: false,
      error: `KRITISCH: number1 ist negativ: ${number1}`,
      correctedTask: {
        operation: '+',
        number1: Math.abs(number1) || 3,
        number2: Math.abs(number2) || 2
      }
    };
  }

  if (number2 < 0) {
    console.error(`❌ CRITICAL: number2 ist negativ: ${number2}`);
    return {
      isValid: false,
      error: `KRITISCH: number2 ist negativ: ${number2}`,
      correctedTask: {
        operation: '+',
        number1: Math.abs(number1) || 3,
        number2: Math.abs(number2) || 2
      }
    };
  }

  // KRITISCH 2: Zahlen dürfen nicht NaN, Infinity oder undefined sein
  if (!Number.isFinite(number1) || !Number.isFinite(number2)) {
    console.error(`❌ CRITICAL: Ungültige Zahl: number1=${number1}, number2=${number2}`);
    return {
      isValid: false,
      error: `Ungültige Zahl: number1=${number1}, number2=${number2}`,
      correctedTask: {
        operation: '+',
        number1: 5,
        number2: 3
      }
    };
  }

  // 3. Zahlen müssen mindestens 1 sein (keine Null)
  if (number1 === 0 || number2 === 0) {
    return {
      isValid: false,
      error: `Zahl ist 0: number1=${number1}, number2=${number2}`,
      correctedTask: {
        operation: '+',
        number1: Math.max(1, number1),
        number2: Math.max(1, number2)
      }
    };
  }

  // 4. Bei Subtraktion: Ergebnis darf NIEMALS negativ sein
  if (operation === '-') {
    const result = number1 - number2;
    if (result < 0) {
      console.error(`❌ CRITICAL: Subtraktion ergibt negatives Ergebnis: ${number1} - ${number2} = ${result}`);
      return {
        isValid: false,
        error: `Subtraktion ergibt negatives Ergebnis: ${number1} - ${number2} = ${result}`,
        correctedTask: {
          operation: '-',
          number1: Math.max(number1, number2),
          number2: Math.min(number1, number2)
        }
      };
    }
  }

  return { isValid: true };
}

/**
 * ABSOLUTE SICHERHEIT: Garantiert keine negativen Zahlen
 */
export function ensureValidTask(task: TaskNumbers): TaskNumbers {
  const validation = validateTask(task);
  
  if (!validation.isValid) {
    console.error(`🚨 TASK VALIDATION FAILED: ${validation.error}`);
    console.error(`🚨 Original task: ${task.number1} ${task.operation} ${task.number2}`);
    
    if (validation.correctedTask) {
      console.warn(`✓ Auto-corrected to: ${validation.correctedTask.number1} ${validation.correctedTask.operation} ${validation.correctedTask.number2}`);
      return validation.correctedTask;
    }
    
    // EMERGENCY FALLBACK: Sichere Standard-Aufgabe
    console.error(`❌ EMERGENCY: Using safe fallback task`);
    return {
      operation: '+',
      number1: 5,
      number2: 3
    };
  }
  
  return task;
}

/**
 * Validiere Ergebnis gegen maximalen Wert
 */
export function validateResult(result: number, maxResult: number = 100): boolean {
  if (result < 0) {
    console.error(`❌ CRITICAL: Ergebnis ist negativ: ${result}`);
    return false;
  }
  
  if (!Number.isFinite(result)) {
    console.error(`❌ CRITICAL: Ergebnis ist NaN oder Infinity: ${result}`);
    return false;
  }
  
  if (result > maxResult) {
    console.warn(`⚠️ Ergebnis ${result} überschreitet Maximum ${maxResult}`);
    return false;
  }
  
  return true;
}
