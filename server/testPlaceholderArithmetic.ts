
import { competencyBasedGenerator } from './competencyBasedGenerator';
import { validateArithmetic, ensureCorrectArithmetic } from './arithmeticValidator';
import type { InsertTask } from '@shared/schema';

/**
 * KRITISCHER TEST: Validiere Arithmetik ALLER Platzhalter-Positionen
 * 
 * Testet 10 zufällige Aufgaben für JEDE Position:
 * - end (Standard: 3+5=?)
 * - middle (Inverses Denken: 3+?=8)
 * - start (Schwierigste: ?+5=8)
 */

interface TestResult {
  position: 'end' | 'middle' | 'start';
  taskNumber: number;
  task: string;
  operation: '+' | '-';
  number1: number;
  number2: number;
  correctAnswer: number;
  claimedAnswer: number;
  isValid: boolean;
  error?: string;
  verification: string;
}

function testPlaceholderArithmetic() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   KRITISCHER ARITHMETIK-TEST: PLATZHALTER-POSITIONEN    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const results: TestResult[] = [];
  let totalTests = 0;
  let failedTests = 0;

  // Mock progression für Generator
  const mockProgression = {
    userId: 'test-user',
    currentStage: 5,
    totalTasksSolved: 50,
    totalCorrect: 40,
    currentStreak: 5,
    taskMastery: {},
    competencyProgress: {},
    rml: 5,
    cla: 0.7,
    smi: 0.6,
    tal: 0.5,
    mca: 0.4,
    stageHistory: [],
    milestones: [],
    knowledgeGaps: [],
    dailyStats: {},
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Test JEDE Position mit 10 Aufgaben
  const positions: Array<'end' | 'middle' | 'start'> = ['end', 'middle', 'start'];

  for (const position of positions) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 TESTE POSITION: "${position.toUpperCase()}"${position === 'end' ? ' (Standard)' : position === 'middle' ? ' (Inverses Denken)' : ' (Schwierigste)'}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    for (let i = 1; i <= 10; i++) {
      totalTests++;

      // Generiere Aufgabe (forciere Position durch Kompetenz-Auswahl)
      let task: Omit<InsertTask, "sessionId"> | null = null;

      if (position === 'end') {
        // Standard-Aufgabe (kein Platzhalter oder 'end')
        task = (competencyBasedGenerator as any).generatePlaceholderEnd();
      } else if (position === 'middle') {
        // Middle Placeholder
        task = (competencyBasedGenerator as any).generatePlaceholderMiddle();
      } else {
        // Start Placeholder
        task = (competencyBasedGenerator as any).generatePlaceholderStart();
      }

      if (!task) {
        console.error(`❌ KRITISCH: Konnte Aufgabe ${i} für Position "${position}" nicht generieren!`);
        failedTests++;
        continue;
      }

      // Extrahiere Werte
      const { operation, number1, number2, correctAnswer, placeholderPosition } = task;

      // MANUELLE BERECHNUNG der korrekten Antwort
      let manualCorrectAnswer: number;
      let verificationString: string;

      if (placeholderPosition === 'end' || !placeholderPosition) {
        // Standard: num1 OP num2 = ?
        // correctAnswer sollte das Ergebnis sein
        const calculatedResult = operation === '+' ? number1 + number2 : number1 - number2;
        manualCorrectAnswer = calculatedResult;
        verificationString = `${number1} ${operation} ${number2} = ${calculatedResult}`;
      } else if (placeholderPosition === 'middle') {
        // Middle: num1 OP ? = result
        // correctAnswer sollte number2 sein
        // Verifikation: num1 OP correctAnswer = result
        const result = operation === '+' ? number1 + number2 : number1 - number2;
        manualCorrectAnswer = number2; // Die fehlende zweite Zahl
        verificationString = operation === '+'
          ? `${number1} + ${manualCorrectAnswer} = ${result} ✓`
          : `${number1} - ${manualCorrectAnswer} = ${result} ✓`;
      } else {
        // Start: ? OP num2 = result
        // correctAnswer sollte number1 sein
        // Verifikation: correctAnswer OP num2 = result
        const result = operation === '+' ? number1 + number2 : number1 - number2;
        manualCorrectAnswer = number1; // Die fehlende erste Zahl
        verificationString = operation === '+'
          ? `${manualCorrectAnswer} + ${number2} = ${result} ✓`
          : `${manualCorrectAnswer} - ${number2} = ${result} ✓`;
      }

      // Validiere: Stimmt correctAnswer mit manueller Berechnung überein?
      const isValid = correctAnswer === manualCorrectAnswer;

      // Erstelle lesbare Aufgabe
      const taskString = placeholderPosition === 'start'
        ? `_ ${operation} ${number2} = ${operation === '+' ? number1 + number2 : number1 - number2}`
        : placeholderPosition === 'middle'
        ? `${number1} ${operation} _ = ${operation === '+' ? number1 + number2 : number1 - number2}`
        : `${number1} ${operation} ${number2} = _`;

      const result: TestResult = {
        position,
        taskNumber: i,
        task: taskString,
        operation,
        number1,
        number2,
        correctAnswer,
        claimedAnswer: manualCorrectAnswer,
        isValid,
        verification: verificationString,
      };

      if (!isValid) {
        result.error = `FEHLER! Behauptet: ${correctAnswer}, Korrekt wäre: ${manualCorrectAnswer}`;
        failedTests++;
        console.error(`\n❌❌❌ KRITISCHER FEHLER! ❌❌❌`);
        console.error(`Position: ${position}`);
        console.error(`Aufgabe: ${taskString}`);
        console.error(`Behauptete Antwort: ${correctAnswer}`);
        console.error(`Korrekte Antwort: ${manualCorrectAnswer}`);
        console.error(`Differenz: ${correctAnswer - manualCorrectAnswer}`);
        console.error(`Verifikation: ${verificationString}\n`);
      } else {
        console.log(`✅ Test ${i}/10: ${taskString}`);
        console.log(`   → Antwort: ${correctAnswer} ✓`);
        console.log(`   → Verifikation: ${verificationString}\n`);
      }

      results.push(result);
    }
  }

  // ZUSAMMENFASSUNG
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    TEST-ZUSAMMENFASSUNG                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Gesamte Tests: ${totalTests}`);
  console.log(`✅ Erfolgreich: ${totalTests - failedTests}`);
  console.log(`❌ Fehlgeschlagen: ${failedTests}\n`);

  // Gruppiere nach Position
  const byPosition = {
    end: results.filter(r => r.position === 'end'),
    middle: results.filter(r => r.position === 'middle'),
    start: results.filter(r => r.position === 'start'),
  };

  for (const [pos, tests] of Object.entries(byPosition)) {
    const failed = tests.filter(t => !t.isValid).length;
    const success = tests.length - failed;
    console.log(`📌 Position "${pos.toUpperCase()}": ${success}/${tests.length} korrekt ${failed > 0 ? '❌' : '✅'}`);
  }

  if (failedTests > 0) {
    console.error('\n🚨🚨🚨 KRITISCH: FEHLER GEFUNDEN! 🚨🚨🚨');
    console.error('Das System hat FEHLERHAFTE Berechnungen generiert!');
    console.error('ALLE Generatoren müssen überprüft werden!\n');
    return false;
  } else {
    console.log('\n🎉🎉🎉 ERFOLG! ALLE TESTS BESTANDEN! 🎉🎉🎉');
    console.log('Alle 30 Aufgaben (10 pro Position) sind arithmetisch korrekt!\n');
    return true;
  }
}

// Führe Test aus
const success = testPlaceholderArithmetic();
process.exit(success ? 0 : 1);
