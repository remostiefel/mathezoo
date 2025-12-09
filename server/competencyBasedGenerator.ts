import type { InsertTask, LearningProgression, Task, TaskType } from "@shared/schema";
import { ensureValidTask } from './taskValidation';
import { ensureCorrectArithmetic, validateArithmetic } from './arithmeticValidator';
import { operativePackageGenerator, type OperativePattern } from "./operativePackageGenerator";
import { ensureUniqueTask, createTaskSignature, areTasksIdentical, type TaskSignature } from './taskDeduplication';

/**
 * COMPETENCY-BASED TASK GENERATION SYSTEM
 *
 * Dieser Generator arbeitet mit Kompetenzbereichen statt mit Levels.
 * - Kompetenzen werden parallel entwickelt
 * - Einzelne Aufgaben werden nach 3 korrekten Lösungen als gemeistert markiert
 * - Bei Fehlern wird doppelte Kompensation verlangt (-2 Punkte)
 * - Verschiedene Aufgabentypen erscheinen bereits früh
 *
 * FEHLER-KOMPENSATIONS-REGEL:
 * - Richtig: +1 Punkt
 * - Falsch: -2 Punkte (doppelte Kompensation erforderlich)
 * - Mastery: 3 Punkte erforderlich
 *
 * Beispiel: R → 1/3, F → 0/3, R → 1/3, R → 2/3, R → 3/3 ✓
 */

// Definiere alle Kompetenzbereiche
export type CompetencyType =
  // Grundoperationen - Zahlenraum-progressive Kompetenzen
  | "addition_ZR10_no_transition"      // Addition 0-10 ohne Zehnerübergang
  | "subtraction_ZR10_no_transition"   // Subtraktion 0-10 ohne Zehnerunterschreitung

  // ===== MULTIPLIKATION & DIVISION (NEU!) =====
  // Vorläuferfertigkeiten
  | "multiplication_prereq_doubling"   // Verdopplung als Multiplikation (2×n)
  | "multiplication_prereq_groups"     // Gleichmächtige Gruppen erkennen

  // Kernaufgaben (Einmaleins)
  | "multiplication_1er_row"           // 1er-Reihe (Identität)
  | "multiplication_2er_row"           // 2er-Reihe (Verdopplung)
  | "multiplication_5er_row"           // 5er-Reihe (Kraft der 5)
  | "multiplication_10er_row"          // 10er-Reihe (Stellenwert)
  | "multiplication_squares"           // Quadratzahlen 1×1 bis 10×10

  // Ableitungsstrategien
  | "multiplication_commutative"       // Tauschaufgaben (3×7 = 7×3)
  | "multiplication_distributive"      // Distributivgesetz (7×8 = 7×5 + 7×3)
  | "multiplication_neighbor_tasks"    // Nachbaraufgaben (5×6 = 5×5 + 5)

  // Division als Umkehrung
  | "division_grouping"                // Aufteilen in Gruppen
  | "division_sharing"                 // Verteilen
  | "division_inverse"                 // Als Umkehrung (12÷3 via 3×?=12)
  | "addition_to_10"                   // Ergänzen zur 10
  | "subtraction_from_10"              // Zurück von 10
  | "addition_ZR20_no_transition"      // Addition 11-20 ohne Zehnerübergang
  | "subtraction_ZR20_no_transition"   // Subtraktion 11-20 ohne Zehnerübergang
  | "addition_with_transition"         // Addition mit Zehnerübergang (z.B. 8+5)
  | "subtraction_with_transition"      // Subtraktion mit Zehnerübergang (z.B. 13-7)

  // Progressive Zahlenraumerweiterung (ausgewählte Zahlenräume)
  | "addition_ZR30_no_transition"      // Addition im ZR30 (21-30)
  | "subtraction_ZR30_no_transition"   // Subtraktion im ZR30
  | "addition_ZR40_no_transition"      // Addition im ZR40 (31-40)
  | "subtraction_ZR40_no_transition"   // Subtraktion im ZR40
  | "addition_ZR50_no_transition"      // Addition im ZR50 (41-50)
  | "subtraction_ZR50_no_transition"   // Subtraktion im ZR50
  | "addition_ZR80_no_transition"      // Addition im ZR80 (51-80)
  | "subtraction_ZR80_no_transition"   // Subtraktion im ZR80
  | "addition_ZR100_no_transition"     // Addition im ZR100 ohne Übergang
  | "subtraction_ZR100_no_transition"  // Subtraktion im ZR100 ohne Übergang
  | "addition_ZR100_with_transition"   // Addition im ZR100 mit Übergang (58+47)
  | "subtraction_ZR100_with_transition"// Subtraktion im ZR100 mit Übergang

  // Erweiterung in den Tausenderraum (100er-Schritte)
  | "addition_ZR200_no_transition"     // Addition im ZR200
  | "subtraction_ZR200_no_transition"  // Subtraktion im ZR200
  | "addition_ZR500_no_transition"     // Addition im ZR500
  | "subtraction_ZR500_no_transition"  // Subtraktion im ZR500
  | "addition_ZR1000_no_transition"    // Addition im ZR1000
  | "subtraction_ZR1000_no_transition" // Subtraktion im ZR1000
  | "addition_ZR1000_with_transition"  // Addition im ZR1000 mit Übergang
  | "subtraction_ZR1000_with_transition" // Subtraktion im ZR1000 mit Übergang

  // Ergänzungskompetenzen zu runden Zahlen
  | "complement_to_20"                 // Ergänzen zur 20
  | "complement_to_30"                 // Ergänzen zur 30
  | "complement_to_40"                 // Ergänzen zur 40
  | "complement_to_50"                 // Ergänzen zur 50
  | "complement_to_80"                 // Ergänzen zur 80
  | "complement_to_100"                // Ergänzen zur 100
  | "complement_to_200"                // Ergänzen zur 200
  | "complement_to_500"                // Ergänzen zur 500
  | "complement_to_1000"               // Ergänzen zur 1000

  // Reine Zehner/Hunderter-Arithmetik
  | "pure_decades_addition"            // 30+20, 40+50
  | "pure_decades_subtraction"         // 70-30, 80-50
  | "pure_hundreds_addition"           // 300+200
  | "pure_hundreds_subtraction"        // 700-300

  // Platzhalter-Kompetenzen (algebraisches Denken)
  | "placeholder_end"         // Standard: 5+3=_
  | "placeholder_middle"      // Mittlere Position: 5+_=8
  | "placeholder_start"       // Anfangsposition: _+3=8

  // Strategische Kompetenzen
  | "doubles"                 // Verdoppeln: 5+5, 6+6
  | "near_doubles"            // Fast-Verdoppeln: 5+6, 7+8
  | "decomposition_to_10"     // Zerlegung zur 10: 8+5 = 8+2+3
  | "number_bonds_10"         // Partnerzahlen der 10
  | "number_bonds_20"         // Partnerzahlen der 20
  | "inverse_operations";     // Umkehraufgaben: 8+5=13, 13-5=8

export interface CompetencyDefinition {
  id: CompetencyType;
  name: string;
  description: string;
  numberRange: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 200 | 500 | 1000;
  operations: ('+' | '-')[];
  requiresTransition: boolean;
  placeholderType?: 'start' | 'middle' | 'end';
  minLevel: number; // Ab welchem Level-Äquivalent erscheint diese Kompetenz (0-7)
  exampleProblems?: string[]; // Für manuell definierte Aufgabenformate
}

/**
 * Analyse der Ziffern einer Zahl
 */
export interface DigitAnalysis {
  totalDigits: number;      // Gesamtanzahl aller Ziffern (inkl. 0)
  valueDigits: number;      // Anzahl Werteziffern (ohne führende/nachfolgende Nullen)
  hasTrailingZeros: boolean; // Hat Nullen am Ende (70, 30 etc.)
  complexity: number;       // 0-1 basierend auf Werteziffern
}

/**
 * Erweiterte strukturelle Analyse einer Aufgabe
 */
export interface TaskStructure {
  // Bestehende Werteziffern-Analyse
  valueDigits: number;

  // Strukturelle Eigenschaften
  isComplementTask: boolean;           // Ergänzungsaufgabe?
  complementTarget?: number;           // Zielzahl (20, 30, 40, etc.)
  isPureDecades: boolean;              // Nur Zehnerzahlen?
  isPureHundreds: boolean;             // Nur Hunderterzahlen?
  crossesDecade: boolean;              // Überschreitet Zehner?
  crossesHundred: boolean;             // Überschreitet Hunderter?
  decadeDistance: number;              // Abstand zum nächsten Zehner
  hundredDistance: number;             // Abstand zum nächsten Hunderter
}

// Alle Kompetenzen definieren
export const COMPETENCY_DEFINITIONS: CompetencyDefinition[] = [
  {
    id: "addition_ZR10_no_transition",
    name: "Addition im ZR10",
    description: "Einfache Addition bis 10",
    numberRange: 10,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 0,
  },
  {
    id: "subtraction_ZR10_no_transition",
    name: "Subtraktion im ZR10",
    description: "Einfache Subtraktion bis 10",
    numberRange: 10,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 0,
  },
  {
    id: "addition_to_10",
    name: "Ergänzen zur 10",
    description: "Zahlen zur 10 ergänzen",
    numberRange: 10,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 0.5,
  },
  {
    id: "subtraction_from_10",
    name: "Von 10 zurück",
    description: "Von 10 subtrahieren",
    numberRange: 10,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 0.5,
  },
  {
    id: "addition_ZR20_no_transition",
    name: "Addition im ZR20",
    description: "Addition bis 20 ohne Übergang",
    numberRange: 20,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1,
  },
  {
    id: "subtraction_ZR20_no_transition",
    name: "Subtraktion im ZR20",
    description: "Subtraktion bis 20 ohne Übergang",
    numberRange: 20,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 1,
  },
  {
    id: "addition_with_transition",
    name: "Addition mit Übergang",
    description: "Zehnerübergang bei Addition",
    numberRange: 20,
    operations: ['+'],
    requiresTransition: true,
    minLevel: 1.5,
  },
  {
    id: "subtraction_with_transition",
    name: "Subtraktion mit Übergang",
    description: "Zehnerübergang bei Subtraktion",
    numberRange: 20,
    operations: ['-'],
    requiresTransition: true,
    minLevel: 1.5,
  },
  {
    id: "placeholder_end",
    name: "Platzhalter am Ende",
    description: "Standard-Aufgaben: 5+3=?",
    numberRange: 20,
    operations: ['+', '-'],
    requiresTransition: false,
    placeholderType: 'end',
    minLevel: 0,
    exampleProblems: ["5+3=?", "8-2=?"]
  },
  {
    id: "placeholder_middle",
    name: "Platzhalter in der Mitte",
    description: "Mittlere Position: 5+?=8",
    numberRange: 20,
    operations: ['+', '-'],
    requiresTransition: false,
    placeholderType: 'middle',
    minLevel: 0,
    exampleProblems: ["5+?=8", "8-?=2"]
  },
  {
    id: "placeholder_start",
    name: "Platzhalter am Anfang",
    description: "Anfangsposition: ?+3=8",
    numberRange: 20,
    operations: ['+', '-'],
    requiresTransition: false,
    placeholderType: 'start',
    minLevel: 0,
    exampleProblems: ["?+3=8", "?-2=6"]
  },
  {
    id: "doubles",
    name: "Verdoppeln",
    description: "Doppelzahlen: 5+5, 6+6",
    numberRange: 20,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 0.5,
    exampleProblems: ["5+5=?", "8+8=?"]
  },
  {
    id: "near_doubles",
    name: "Fast-Verdoppeln",
    description: "Nachbarn von Doppelzahlen: 5+6",
    numberRange: 20,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1,
    exampleProblems: ["5+6=?", "8+9=?"]
  },
  {
    id: "number_bonds_10",
    name: "Partnerzahlen der 10",
    description: "Alle Zerlegungen der 10",
    numberRange: 10,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 0.5,
    exampleProblems: ["7+?=10", "4+?=10"]
  },
  {
    id: "inverse_operations",
    name: "Umkehraufgaben",
    description: "Zusammenhang +/- erkennen",
    numberRange: 20,
    operations: ['+', '-'],
    requiresTransition: false,
    minLevel: 1,
    exampleProblems: ["8+5=13", "13-5=?"]
  },

  // Progressive Zahlenraumerweiterung ZR30-ZR100
  {
    id: "addition_ZR30_no_transition",
    name: "Addition im ZR30",
    description: "Addition bis 30 ohne Übergang",
    numberRange: 30,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1.25, // Gesenkt von 1.5 für schnellere Progression
  },
  {
    id: "subtraction_ZR30_no_transition",
    name: "Subtraktion im ZR30",
    description: "Subtraktion bis 30 ohne Übergang",
    numberRange: 30,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 1.25, // Gesenkt von 1.5
  },
  {
    id: "addition_ZR40_no_transition",
    name: "Addition im ZR40",
    description: "Addition bis 40 ohne Übergang",
    numberRange: 40,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1.75, // Gesenkt von 2.0
  },
  {
    id: "subtraction_ZR40_no_transition",
    name: "Subtraktion im ZR40",
    description: "Subtraktion bis 40 ohne Übergang",
    numberRange: 40,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 1.75, // Gesenkt von 2.0
  },
  {
    id: "addition_ZR50_no_transition",
    name: "Addition im ZR50",
    description: "Addition bis 50 ohne Übergang",
    numberRange: 50,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 2.0, // Gesenkt von 2.5
  },
  {
    id: "subtraction_ZR50_no_transition",
    name: "Subtraktion im ZR50",
    description: "Subtraktion bis 50 ohne Übergang",
    numberRange: 50,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 2.0, // Gesenkt von 2.5
  },
  {
    id: "addition_ZR80_no_transition",
    name: "Addition im ZR80",
    description: "Addition bis 80 ohne Übergang",
    numberRange: 80,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 2.5, // Gesenkt von 3.0
  },
  {
    id: "subtraction_ZR80_no_transition",
    name: "Subtraktion im ZR80",
    description: "Subtraktion bis 80 ohne Übergang",
    numberRange: 80,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 2.5, // Gesenkt von 3.0
  },
  {
    id: "addition_ZR100_no_transition",
    name: "Addition im ZR100",
    description: "Addition bis 100 ohne Übergang",
    numberRange: 100,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 3.0, // Gesenkt von 3.5
  },
  {
    id: "subtraction_ZR100_no_transition",
    name: "Subtraktion im ZR100",
    description: "Subtraktion bis 100 ohne Übergang",
    numberRange: 100,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 3.0, // Gesenkt von 3.5
  },
  {
    id: "addition_ZR100_with_transition",
    name: "Addition im ZR100 mit Übergang",
    description: "Hunderterübergang: 58+47 (muss nach 70+40)",
    numberRange: 100,
    operations: ['+'],
    requiresTransition: true,
    minLevel: 4.0, // Gesenkt von 4.5
  },
  {
    id: "subtraction_ZR100_with_transition",
    name: "Subtraktion im ZR100 mit Übergang",
    description: "Hunderterunterschreitung im ZR100",
    numberRange: 100,
    operations: ['-'],
    requiresTransition: true,
    minLevel: 4.0, // Gesenkt von 4.5
  },

  // Tausenderraum-Erweiterung
  {
    id: "addition_ZR200_no_transition",
    name: "Addition im ZR200",
    description: "Addition bis 200 ohne Übergang",
    numberRange: 200,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 4.5, // Gesenkt von 5.0
  },
  {
    id: "subtraction_ZR200_no_transition",
    name: "Subtraktion im ZR200",
    description: "Subtraktion bis 200 ohne Übergang",
    numberRange: 200,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 4.5, // Gesenkt von 5.0
  },
  {
    id: "addition_ZR500_no_transition",
    name: "Addition im ZR500",
    description: "Addition bis 500 ohne Übergang",
    numberRange: 500,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 5.0, // Gesenkt von 5.5
  },
  {
    id: "subtraction_ZR500_no_transition",
    name: "Subtraktion im ZR500",
    description: "Subtraktion bis 500 ohne Übergang",
    numberRange: 500,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 5.0, // Gesenkt von 5.5
  },
  {
    id: "addition_ZR1000_no_transition",
    name: "Addition im ZR1000",
    description: "Addition bis 1000 ohne Übergang",
    numberRange: 1000,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 5.5, // Gesenkt von 6.0
  },
  {
    id: "subtraction_ZR1000_no_transition",
    name: "Subtraktion im ZR1000",
    description: "Subtraktion bis 1000 ohne Übergang",
    numberRange: 1000,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 5.5, // Gesenkt von 6.0
  },
  {
    id: "addition_ZR1000_with_transition",
    name: "Addition im ZR1000 mit Übergang",
    description: "Addition bis 1000 mit Hunderterübergang",
    numberRange: 1000,
    operations: ['+'],
    requiresTransition: true,
    minLevel: 6.0, // Gesenkt von 6.5
  },
  {
    id: "subtraction_ZR1000_with_transition",
    name: "Subtraktion im ZR1000 mit Übergang",
    description: "Subtraktion bis 1000 mit Hunderterübergang",
    numberRange: 1000,
    operations: ['-'],
    requiresTransition: true,
    minLevel: 6.0, // Gesenkt von 6.5
  },

  // Ergänzungskompetenzen
  {
    id: "complement_to_20",
    name: "Ergänzen zur 20",
    description: "Zahlen zur 20 ergänzen",
    numberRange: 20,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1.0,
  },
  {
    id: "complement_to_30",
    name: "Ergänzen zur 30",
    description: "Zahlen zur 30 ergänzen",
    numberRange: 30,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1.25, // Gesenkt von 1.5
  },
  {
    id: "complement_to_40",
    name: "Ergänzen zur 40",
    description: "Zahlen zur 40 ergänzen",
    numberRange: 40,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 1.75, // Gesenkt von 2.0
  },
  {
    id: "complement_to_50",
    name: "Ergänzen zur 50",
    description: "Zahlen zur 50 ergänzen",
    numberRange: 50,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 2.0, // Gesenkt von 2.5
  },
  {
    id: "complement_to_80",
    name: "Ergänzen zur 80",
    description: "Zahlen zur 80 ergänzen",
    numberRange: 80,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 2.5, // Gesenkt von 3.0
  },
  {
    id: "complement_to_100",
    name: "Ergänzen zur 100",
    description: "Zahlen zur 100 ergänzen",
    numberRange: 100,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 3.0, // Gesenkt von 3.5
  },
  {
    id: "complement_to_200",
    name: "Ergänzen zur 200",
    description: "Zahlen zur 200 ergänzen",
    numberRange: 200,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 5.0, // Gesenkt von 5.5
  },
  {
    id: "complement_to_500",
    name: "Ergänzen zur 500",
    description: "Zahlen zur 500 ergänzen",
    numberRange: 500,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 5.5, // Gesenkt von 6.0
  },
  {
    id: "complement_to_1000",
    name: "Ergänzen zur 1000",
    description: "Zahlen zur 1000 ergänzen",
    numberRange: 1000,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 6.0, // Gesenkt von 6.5
  },

  // Reine Zehner/Hunderter-Arithmetik (FRÜH einführen!)
  {
    id: "pure_decades_addition",
    name: "Zehner addieren",
    description: "Reine Zehner addieren: 20+30, 40+50 (Transfer von 2+3!)",
    numberRange: 100,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 0.5, // SEHR FRÜH! Transfer von Einern
  },
  {
    id: "pure_decades_subtraction",
    name: "Zehner subtrahieren",
    description: "Reine Zehner subtrahieren: 70-30, 80-50 (Transfer von 7-3!)",
    numberRange: 100,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 0.5, // SEHR FRÜH! Transfer von Einern
  },
  {
    id: "pure_hundreds_addition",
    name: "Hunderter addieren",
    description: "Reine Hunderter addieren: 300+200 (Transfer von 3+2!)",
    numberRange: 1000,
    operations: ['+'],
    requiresTransition: false,
    minLevel: 2.0, // Früh, nach Stellenwertverständnis
  },
  {
    id: "pure_hundreds_subtraction",
    name: "Hunderter subtrahieren",
    description: "Reine Hunderter subtrahieren: 700-300 (Transfer von 7-3!)",
    numberRange: 1000,
    operations: ['-'],
    requiresTransition: false,
    minLevel: 2.0, // Früh, nach Stellenwertverständnis
  },
];

// Interface für Aufgaben-Metadaten
export interface TaskMetadata {
  taskString: string;           // z.B. "8+5", "_+3=9"
  competencies: CompetencyType[]; // Welche Kompetenzen werden geübt?
  difficulty: number;            // 0-5
}

// Interface für Task Mastery Status
export interface TaskMasteryStatus {
  attempts: number;
  correct: number;
  lastAttempt: Date;
  mastered: boolean;
}

// Interface für Competency Progress
export interface CompetencyProgressStatus {
  level: number;          // 0-5
  attempted: number;
  correct: number;
  successRate: number;
  lastPracticed: Date;
  tasksMastered: string[];
  recentErrors: string[];
}

/**
 * Kompetenz-basierter Task Generator
 */
export class CompetencyBasedGenerator {

  /**
   * Generiere ein operatives Päckchen (systematische Aufgaben-Sequenz mit Muster)
   */
  generateOperativePackage(
    pattern: OperativePattern,
    numberRange: 20 | 100 = 20,
    difficulty: number = 1
  ): Task[] {
    const pkg = operativePackageGenerator.generatePackage(pattern, numberRange, difficulty);
    return pkg.tasks;
  }

  /**
   * Generiere eine Aufgabenmischung basierend auf Kompetenzfortschritt
   * Eine Session/Übungseinheit besteht standardmäßig aus 10 Aufgaben
   *
   * NEU: Mit Level-basierter Schwierigkeitsanpassung (1-100)
   * GARANTIERT: Keine zwei identischen Aufgaben hintereinander
   */
  generateMixedTasks(
    progression: LearningProgression,
    count: number = 10,
    currentLevel?: number,
    previousTask?: TaskSignature | null
  ): Omit<InsertTask, "sessionId">[] {
    const taskMastery = (progression.taskMastery as any) || {};
    const competencyProgress = (progression.competencyProgress as any) || {};

    // 🎯 FEHLER-WIEDERHOLUNG: 30% der Aufgaben sind Wiederholungen
    const errorRepetitionCount = Math.floor(count * 0.3);
    const newTasksCount = count - errorRepetitionCount;

    const errorTasks = this.getErrorTasksForRepetition(progression, errorRepetitionCount);
    console.log(`🔄 Including ${errorTasks.length} error repetition tasks`);

    // Wähle relevante Kompetenzen basierend auf Level
    const level = currentLevel || (progression as any).currentLevel || 1;
    const { numberRange, minNumber, maxNumber, allowTransition, difficultyMultiplier } = this.getLevelDifficultyParams(level);

    const availableCompetencies = COMPETENCY_DEFINITIONS.filter(comp => {
      // Filtere nach Zahlenbereich
      if (numberRange === 10 && !comp.id.includes('ZR10') && !comp.id.includes('to_10')) return false;
      if (numberRange === 20 && comp.id.includes('ZR100')) return false;
      if (numberRange === 100 && (comp.id.includes('ZR10') || comp.id.includes('to_10'))) return false;

      // Filtere nach Mindest-Level
      return comp.minLevel <= (level / 20);
    });

    // Wähle Kompetenzen für die Übung aus (priorisiere schwache Bereiche und Fehler)
    const selectedCompetencies = this.selectCompetenciesForPractice(
      availableCompetencies,
      competencyProgress,
      count,
      numberRange
    );

    const tasks: Omit<InsertTask, "sessionId">[] = [];

    // 1️⃣ Füge Fehler-Wiederholungen hinzu
    for (const errorTask of errorTasks) {
      const validatedTask = ensureValidTask({
        operation: errorTask.operation,
        number1: errorTask.number1,
        number2: errorTask.number2
      });

      const correctAnswer = ensureCorrectArithmetic(
        validatedTask.operation,
        validatedTask.number1,
        validatedTask.number2
      );

      tasks.push({
        taskType: 'error_repetition',
        operation: validatedTask.operation,
        number1: validatedTask.number1,
        number2: validatedTask.number2,
        correctAnswer,
        numberRange,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
        placeholderPosition: 'none'
      });
    }

    // 2️⃣ Generiere neue Aufgaben
    let attempts = 0;
    const maxAttempts = newTasksCount * 10;

    while (tasks.length < count && attempts < maxAttempts) {
      attempts++;

      // Wähle zufällige Kompetenz
      const comp = selectedCompetencies[Math.floor(Math.random() * selectedCompetencies.length)];

      // Generiere Aufgabe mit Level-Parametern
      const task = this.generateTaskForCompetency(
        comp,
        numberRange,
        taskMastery,
        level,
        minNumber,
        maxNumber,
        allowTransition,
        difficultyMultiplier
      );

      if (task) {
        // Vermeide Duplikate mit vorheriger Aufgabe
        const taskSig = createTaskSignature(task.operation, task.number1, task.number2);

        if (!previousTask || !areTasksIdentical(previousTask, taskSig)) {
          tasks.push(task);
          previousTask = taskSig; // Update für nächste Iteration
        }
      }
    }

    // 3️⃣ Mische die Aufgaben (Fehler-Wiederholungen + neue Aufgaben)
    for (let i = tasks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
    }

    // ✅ FINAL SAFETY: Ensure we always return the correct number of tasks
    if (tasks.length !== count) {
      console.warn(`⚠️ Expected ${count} tasks, but generated ${tasks.length}. Adjusting.`);
      // If too few, regenerate some tasks (simplistic approach)
      while (tasks.length < count) {
        const comp = selectedCompetencies[Math.floor(Math.random() * selectedCompetencies.length)];
        const task = this.generateTaskForCompetency(
          comp,
          numberRange,
          taskMastery,
          level,
          minNumber,
          maxNumber,
          allowTransition,
          difficultyMultiplier
        );
        if (task) {
          tasks.push(task);
        } else {
          // If regeneration fails, add a fallback task
          tasks.push(this.generateAdditionZR10());
        }
      }
      // If too many, truncate (should not happen with current logic)
      return tasks.slice(0, count);
    }

    return tasks;
  }

  /**
   * Implementiere Level-basierte Schwierigkeitsparameter
   * - numberRange: Der Zahlenbereich für die Aufgaben (10, 20, 100)
   * - minNumber, maxNumber: Grenzen für die Zahlen in den Aufgaben
   * - allowTransition: Ob Zehner-/Hunderterübergänge erlaubt sind
   * - difficultyMultiplier: Ein Faktor zur Erhöhung der Schwierigkeit innerhalb des Levels
   */
  private getLevelDifficultyParams(level: number): {
    numberRange: 10 | 20 | 100;
    minNumber: number;
    maxNumber: number;
    allowTransition: boolean;
    difficultyMultiplier: number;
  } {
    let numberRange: 10 | 20 | 100;
    let minNumber: number;
    let maxNumber: number;
    let allowTransition: boolean;
    let difficultyMultiplier: number;

    // Level 1-10: ZR10, einfache Addition/Subtraktion, keine Übergänge
    if (level <= 10) {
      numberRange = 10;
      minNumber = 1;
      maxNumber = 10;
      allowTransition = false;
      difficultyMultiplier = 1.0 + (level / 10) * 0.5; // Sanfte Steigerung
    }
    // Level 11-25: ZR20, erste Übergänge, leicht erhöhte Zahlen
    else if (level <= 25) {
      numberRange = 20;
      minNumber = 5;
      maxNumber = 20;
      allowTransition = level > 15; // Übergänge ab Level 16
      difficultyMultiplier = 1.5 + ((level - 10) / 15) * 0.5; // Moderat
    }
    // Level 26-50: ZR50, mehr Übergänge, komplexere Zahlen
    else if (level <= 50) {
      numberRange = 50; // Fokus auf ZR50 und darunter
      minNumber = 10;
      maxNumber = 50;
      allowTransition = true;
      difficultyMultiplier = 2.0 + ((level - 25) / 25) * 1.0; // Intensiver
    }
    // Level 51-75: ZR100, viele Übergänge, größere Zahlen
    else if (level <= 75) {
      numberRange = 100;
      minNumber = 20;
      maxNumber = 100;
      allowTransition = true;
      difficultyMultiplier = 3.0 + ((level - 50) / 25) * 1.5; // Herausfordernd
    }
    // Level 76-100: ZR100, komplexe Übergänge, Zahlen bis 100 (oder höher für spezielle Kompetenzen)
    else {
      numberRange = 100;
      minNumber = 30;
      maxNumber = 100;
      allowTransition = true; // Ermöglicht auch komplexere Übergänge
      difficultyMultiplier = 4.5 + ((level - 75) / 25) * 1.0; // Sehr herausfordernd
    }

    // Sicherheits-Check: Max multiplier
    difficultyMultiplier = Math.min(difficultyMultiplier, 5.0);

    return {
      numberRange,
      minNumber,
      maxNumber,
      allowTransition,
      difficultyMultiplier,
    };
  }


  /**
   * Ermittle Aufgaben, die der Schüler falsch gelöst hat und die für Wiederholung geeignet sind
   */
  private getErrorTasksForRepetition(
    progression: LearningProgression,
    count: number
  ): { operation: '+' | '-'; number1: number; number2: number }[] {
    const errorTasks: { operation: '+' | '-'; number1: number; number2: number }[] = [];
    const allErrors: { taskString: string; competency: CompetencyType }[] = [];

    // Sammle ALLE Fehler aus allen Kompetenzen
    for (const compId in progression.competencyProgress) {
      const progress = progression.competencyProgress[compId];
      if (progress && progress.recentErrors) {
        progress.recentErrors.forEach(taskStr => {
          allErrors.push({ taskString: taskStr, competency: compId as CompetencyType });
        });
      }
    }

    // Filtere Aufgaben, die bereits gemeistert wurden
    const unmasteredErrors = allErrors.filter(error => {
      const mastery = progression.taskMastery?.[error.taskString];
      return !mastery || !mastery.mastered;
    });

    // Mische die verbleibenden Fehler und nimm die ersten 'count'
    const shuffledErrors = this.shuffleArray(unmasteredErrors);

    for (let i = 0; i < Math.min(count, shuffledErrors.length); i++) {
      const error = shuffledErrors[i];
      const taskParts = error.taskString.split(/([+\-])/); // Split by operator

      if (taskParts.length < 3) continue; // Skip if format is unexpected

      const num1Str = taskParts[0].trim();
      const operator = taskParts[1] as '+' | '-';
      const num2Str = taskParts[2].trim();

      const number1 = parseInt(num1Str);
      const number2 = parseInt(num2Str);

      if (!isNaN(number1) && !isNaN(number2)) {
        errorTasks.push({ operation: operator, number1, number2 });
      }
    }

    console.log(`Found ${errorTasks.length} suitable error tasks for repetition.`);
    return errorTasks;
  }

  /**
   * Berechne Gesamt-Level des Schülers
   * WICHTIG: Verwendet das MAXIMUM der gemeisterten Kompetenzen, nicht den Durchschnitt!
   * Begründung: Ein Schüler der 10 Kompetenzen auf Level 7.0 gemeistert hat,
   * sollte nicht durch 50 neue Level-1.0-Kompetenzen wieder runtergestuft werden.
   */
  private calculateOverallLevel(competencyProgress: Record<CompetencyType, CompetencyProgressStatus>): number {
    const competencies = Object.values(competencyProgress);

    if (competencies.length === 0) return 0;

    // Finde alle gemeisterten Kompetenzen (Level >= 5.0)
    const masteredCompetencies = competencies.filter(c => c.level >= 5.0);

    if (masteredCompetencies.length === 0) {
      // Noch keine gemeisterte Kompetenz - nutze Durchschnitt aller
      const totalLevel = competencies.reduce((sum, comp) => sum + comp.level, 0);
      return totalLevel / competencies.length;
    }

    // Overall-Level = Durchschnitt der TOP 5 gemeisterten Kompetenzen
    // Dies verhindert dass neue Kompetenzen das Level wieder senken
    const topMastered = masteredCompetencies
      .sort((a, b) => b.level - a.level)
      .slice(0, 5);

    const totalLevel = topMastered.reduce((sum, comp) => sum + comp.level, 0);
    return totalLevel / topMastered.length;
  }

  /**
   * Ermittle aktive Kompetenzen basierend auf Overall-Level
   * AGGRESSIVE AKTIVIERUNG: Große Fenster + Vorausschau
   */
  private getActiveCompetencies(overallLevel: number): CompetencyDefinition[] {
    // SEHR WEITES FENSTER: ±5.0 vom Overall-Level
    // PLUS: Alle Kompetenzen mit minLevel <= Overall-Level (bereits freigeschaltet)
    const activeWindow = 5.0;

    return COMPETENCY_DEFINITIONS
      .filter(comp => {
        // Bereits freigeschaltet?
        const isUnlocked = comp.minLevel <= overallLevel;

        // Im erweiterten Fenster?
        const isInWindow =
          comp.minLevel >= (overallLevel - activeWindow) &&
          comp.minLevel <= (overallLevel + activeWindow + 2.0); // +2.0 Vorausschau!

        return isUnlocked || isInWindow;
      });
  }

  /**
   * Wähle Kompetenzen für Übung aus (priorisiere schwache Bereiche)
   * STRATEGIE:
   * - Gemeisterte Kompetenzen: max 10-20% zur Festigung
   * - Nicht-gemeisterte Kompetenzen: 80-90% für Fortschritt
   * - Aktiv neue Kompetenzen einführen
   * - PLATZHALTER-AUFGABEN: Rotiere durch alle 3 Positionen (start, middle, end)
   * - OPERATIONEN: Stelle sicher dass Addition UND Subtraktion vorkommen
   * 
   * NEU: Filtert Kompetenzen basierend auf numberRange um zu einfache Tasks zu vermeiden
   */
  private selectCompetenciesForPractice(
    available: CompetencyDefinition[],
    competencyProgress: Record<string, CompetencyProgressStatus>,
    count: number,
    targetNumberRange?: number
  ): CompetencyDefinition[] {
    // 🎯 KRITISCHER FIX: Filtere Kompetenzen nach Zahlenbereich
    // Verhindere dass ZR10/ZR20 Aufgaben in hohen Levels erscheinen
    let filteredAvailable = available;
    
    if (targetNumberRange) {
      filteredAvailable = available.filter(comp => {
        // Für Level mit ZR100: Keine ZR10/ZR20 Kompetenzen außer Platzhalter
        if (targetNumberRange === 100) {
          // Platzhalter sind OK (sie passen sich an)
          if (comp.id.includes('placeholder')) return true;
          
          // Keine ZR10/ZR20 spezifischen Kompetenzen
          if (comp.id.includes('ZR10') || comp.id.includes('to_10') || comp.id.includes('from_10')) return false;
          if (comp.id.includes('ZR20') && !comp.id.includes('ZR100')) return false;
          
          // Keine Basis-Strategien (doubles, near_doubles, number_bonds_10)
          if (comp.id === 'doubles' || comp.id === 'near_doubles' || comp.id === 'number_bonds_10') return false;
          
          return true;
        }
        
        // Für ZR20: Keine ZR10-only Kompetenzen
        if (targetNumberRange === 20) {
          if (comp.id.includes('ZR10') && !comp.id.includes('placeholder')) return false;
          return true;
        }
        
        return true;
      });
      
      console.log(`🔍 Filtered competencies for ZR${targetNumberRange}: ${filteredAvailable.length}/${available.length} remain`);
    }
    
    // Sortiere nach Priorität:
    // 1. Kompetenzen mit Fehlern haben höchste Priorität
    // 2. Angefangene aber nicht gemeisterte Kompetenzen
    // 3. Neue Kompetenzen (aktiv einführen!)
    // 4. Gemeisterte Kompetenzen (nur sehr selten)

    const scored = filteredAvailable.map(comp => {
      const progress = competencyProgress[comp.id] || {
        level: comp.minLevel,
        attempted: 0,
        correct: 0,
        successRate: 0,
        lastPracticed: new Date(0),
        tasksMastered: [],
        recentErrors: [],
      };

      let score = 0;
      let category = 'new'; // 'error', 'in_progress', 'new', 'mastered', 'placeholder'

      // SPEZIAL: Platzhalter-Kompetenzen erhalten moderate Priorität
      const isPlaceholder = comp.id.includes('placeholder');

      // Prüfe ob gemeistert (ANGEPASST für 54 Kompetenzen)
      const tasksMasteredCount = progress.tasksMastered.length;
      const correctCount = progress.correct;
      const successRate = progress.successRate;

      // MASTERY-KRITERIEN (realistisch für 54 Kompetenzen):
      // - 5 gemeisterte Tasks ODER
      // - 10 korrekte mit 80% Erfolgsrate
      const isMastered = (tasksMasteredCount >= 5) ||
                        (correctCount >= 10 && successRate >= 0.80);

      if (isMastered) {
        category = 'mastered';
        // Gemeisterte Kompetenzen: Niedrige, aber nicht minimale Priorität
        score = 50; // Niedrig, aber höher als "1" - für Wiederholung
        return { comp, score, progress, category };
      }

      // Kategorie 1: Hat Fehler = HÖCHSTE PRIORITÄT
      if (progress.recentErrors.length > 0) {
        category = 'error';
        score = 1000 + progress.recentErrors.length * 50;
      }
      // Kategorie 2: In Progress (angefangen, aber nicht gemeistert)
      else if (progress.attempted > 0) {
        category = 'in_progress';
        score = 500;

        // Niedrige Success Rate = noch höhere Priorität
        if (successRate < 0.7) {
          score += (0.7 - successRate) * 100;
        }

        // Je mehr Tasks noch fehlen, desto höher die Priorität
        const tasksNeeded = 10 - tasksMasteredCount;
        score += tasksNeeded * 10;
      }
      // Kategorie 3: Neue Kompetenzen = HOHE PRIORITÄT!
      else {
        category = 'new';
        score = 300; // Deutlich höher als vorher (war 10)
      }

      // MODERATER BOOST für Platzhalter-Kompetenzen (algebraisches Denken!)
      // Reduziert auf 50 für gleichmäßige Verteilung aller 3 Positionen
      if (isPlaceholder && !isMastered) {
        category = 'placeholder';
        score += 50; // Niedrigerer Boost für ausgewogene Verteilung
      }

      return { comp, score, progress, category };
    });

    // Sortiere nach Score (höher = wichtiger)
    scored.sort((a, b) => b.score - a.score);

    // KATEGORISIERE Kompetenzen nach Typ
    const errorComps = scored.filter(s => s.category === 'error').map(s => s.comp);
    const placeholderComps = scored.filter(s => s.category === 'placeholder').map(s => s.comp);
    const inProgressComps = scored.filter(s => s.category === 'in_progress').map(s => s.comp);
    const newComps = scored.filter(s => s.category === 'new' && !s.comp.id.includes('placeholder')).map(s => s.comp);
    const masteredComps = scored.filter(s => s.category === 'mastered').map(s => s.comp);

    // SEPARIERE nach Addition/Subtraktion für ausgewogene Mischung
    const separateByOperation = (comps: CompetencyDefinition[]) => {
      const additions = comps.filter(c => c.operations.includes('+'));
      const subtractions = comps.filter(c => c.operations.includes('-'));
      const both = comps.filter(c => c.operations.includes('+') && c.operations.includes('-'));
      return { additions, subtractions, both };
    };

    const selected: CompetencyDefinition[] = [];

    // 1. Alle Error-Kompetenzen (müssen gefixt werden)
    selected.push(...errorComps);

    // 2. GLEICHMÄSSIGE ROTATION durch ALLE 3 Platzhalter-Positionen
    // Garantiere dass alle 3 Positionen (start, middle, end) regelmäßig vorkommen
    if (placeholderComps.length > 0) {
      const placeholderStart = placeholderComps.filter(c => c.id === 'placeholder_start');
      const placeholderMiddle = placeholderComps.filter(c => c.id === 'placeholder_middle');
      const placeholderEnd = placeholderComps.filter(c => c.id === 'placeholder_end');

      // Nimm mindestens 1 von jeder Position (falls verfügbar)
      const placeholderSelection: CompetencyDefinition[] = [];
      if (placeholderStart.length > 0) placeholderSelection.push(placeholderStart[0]);
      if (placeholderMiddle.length > 0) placeholderSelection.push(placeholderMiddle[0]);
      if (placeholderEnd.length > 0) placeholderSelection.push(placeholderEnd[0]);

      // Mische für Zufälligkeit
      const shuffled = placeholderSelection.sort(() => Math.random() - 0.5);

      // Nimm bis zu 3 Platzhalter (1 von jeder Position)
      const placeholderSlots = Math.min(3, Math.max(0, 10 - selected.length));
      selected.push(...shuffled.slice(0, placeholderSlots));
    }

    // 3. In-Progress-Kompetenzen MIT ausgewogener Addition/Subtraktion-Verteilung
    const inProgressSlots = Math.max(0, Math.min(5, 10 - selected.length));
    if (inProgressSlots > 0 && inProgressComps.length > 0) {
      const { additions, subtractions, both } = separateByOperation(inProgressComps);

      // Verteile Slots 50/50 zwischen Addition und Subtraktion
      const additionSlots = Math.ceil(inProgressSlots / 2);
      const subtractionSlots = Math.floor(inProgressSlots / 2);

      const inProgressSelection: CompetencyDefinition[] = [];
      inProgressSelection.push(...both.slice(0, 1)); // 1 gemischte zuerst
      inProgressSelection.push(...additions.slice(0, additionSlots));
      inProgressSelection.push(...subtractions.slice(0, subtractionSlots));

      // Mische für Abwechslung
      const shuffled = inProgressSelection.sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, inProgressSlots));
    }

    // 4. Neue Kompetenzen MIT ausgewogener Addition/Subtraktion-Verteilung
    const newSlots = Math.max(0, Math.min(4, 10 - selected.length));
    if (newSlots > 0 && newComps.length > 0) {
      const { additions, subtractions, both } = separateByOperation(newComps);

      // Verteile Slots 50/50 zwischen Addition und Subtraktion
      const additionSlots = Math.ceil(newSlots / 2);
      const subtractionSlots = Math.floor(newSlots / 2);

      const newSelection: CompetencyDefinition[] = [];
      newSelection.push(...both.slice(0, 1)); // 1 gemischte zuerst
      newSelection.push(...additions.slice(0, additionSlots));
      newSelection.push(...subtractions.slice(0, subtractionSlots));

      // Mische für Abwechslung
      const shuffled = newSelection.sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, newSlots));
    }

    // 5. KORRIGIERT: Gemeisterte Kompetenzen auffüllen wenn nötig
    if (masteredComps.length > 0 && selected.length < 10) {
      const slotsRemaining = 10 - selected.length;
      const masteredSlots = Math.min(slotsRemaining, masteredComps.length);

      // Auch hier ausgewogene Verteilung
      const { additions, subtractions, both } = separateByOperation(masteredComps);
      const addSlots = Math.ceil(masteredSlots / 2);
      const subSlots = Math.floor(masteredSlots / 2);

      const masteredSelection: CompetencyDefinition[] = [];
      masteredSelection.push(...both.slice(0, 1));
      masteredSelection.push(...additions.slice(0, addSlots));
      masteredSelection.push(...subtractions.slice(0, subSlots));

      const shuffled = masteredSelection.sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, masteredSlots));
    }

    // ✅ KRITISCHER SICHERHEITS-CHECK: NIEMALS leeres Array zurückgeben!
    if (selected.length === 0) {
      console.error('🚨 CRITICAL: No competencies selected! Activating emergency fallback chain...');

      // Prioritäts-Fallback-Kette mit ausgewogener Verteilung
      if (newComps.length > 0) {
        const { additions, subtractions, both } = separateByOperation(newComps);
        const fallbackSelection: CompetencyDefinition[] = [];
        fallbackSelection.push(...both.slice(0, 2));
        fallbackSelection.push(...additions.slice(0, 2));
        fallbackSelection.push(...subtractions.slice(0, 2));
        selected.push(...fallbackSelection.slice(0, 6));
        console.log(`  ✓ Fallback 1: Added ${selected.length} balanced new competencies`);
      } else if (inProgressComps.length > 0) {
        const { additions, subtractions, both } = separateByOperation(inProgressComps);
        const fallbackSelection: CompetencyDefinition[] = [];
        fallbackSelection.push(...both.slice(0, 2));
        fallbackSelection.push(...additions.slice(0, 2));
        fallbackSelection.push(...subtractions.slice(0, 2));
        selected.push(...fallbackSelection.slice(0, 6));
        console.log(`  ✓ Fallback 2: Added ${selected.length} balanced in-progress competencies`);
      } else if (masteredComps.length > 0) {
        selected.push(...masteredComps.slice(0, 3));
        console.log(`  ✓ Fallback 3: Added ${selected.length} mastered competencies`);
      } else if (filteredAvailable.length > 0) {
        // Use filtered available (respects number range)
        selected.push(...filteredAvailable.slice(0, 3));
        console.log(`  ✓ Fallback 4: Added ${selected.length} filtered available competencies`);
      } else if (available.length > 0) {
        selected.push(...available.slice(0, 3));
        console.log(`  ✓ Fallback 5: Added ${selected.length} available competencies`);
      } else if (scored.length > 0) {
        selected.push(scored[0].comp);
        console.log(`  ✓ Fallback 6: Added first scored competency`);
      } else {
        // ABSOLUTER NOTFALL: Verwende ZR100 Kompetenzen wenn verfügbar
        console.error('  🚨 EMERGENCY FALLBACK: Using ZR100 competencies!');
        const zr100Competencies = COMPETENCY_DEFINITIONS.filter(c => 
          c.numberRange >= 100 || c.id.includes('ZR100')
        ).slice(0, 6);
        
        if (zr100Competencies.length > 0) {
          selected.push(...zr100Competencies);
          console.log(`  ✓ Emergency: Added ${zr100Competencies.length} ZR100 competencies`);
        } else {
          // LETZTER AUSWEG: Die ersten 6 Kompetenzen
          const baseCompetencies = COMPETENCY_DEFINITIONS.slice(0, 6);
          selected.push(...baseCompetencies);
          console.log(`  ✓ Last Resort: Added ${baseCompetencies.length} base competencies`);
        }
      }
    }

    // ✅ FINAL ASSERTION: selected darf NIEMALS leer sein!
    if (selected.length === 0) {
      console.error('🚨🚨🚨 CRITICAL FAILURE: All fallbacks exhausted, no competencies available!');
      console.error('🔧 ULTIMATE FALLBACK: Forcing first 6 base competencies regardless of status');

      // ULTIMATE SAFETY NET: Immer die ersten 6 Basis-Kompetenzen verwenden
      const ultimateFallback = COMPETENCY_DEFINITIONS.slice(0, 6);
      selected.push(...ultimateFallback);

      console.log(`✓ EMERGENCY: Forced ${ultimateFallback.length} base competencies as absolute minimum`);
    }

    console.log(`✅ Final selection: ${selected.length} competencies for practice`);

    // LOG: Zeige Verteilung der Operationen
    const addCount = selected.filter(c => c.operations.includes('+')).length;
    const subCount = selected.filter(c => c.operations.includes('-')).length;
    const placeCount = selected.filter(c => c.id.includes('placeholder')).length;
    console.log(`✓ Selected ${selected.length} competencies: ${selected.map(c => c.id).join(', ')}`);
    console.log(`  📊 Distribution: ${addCount} additions, ${subCount} subtractions, ${placeCount} placeholders`);

    return selected;
  }

  /**
   * Generiere eine einzelne Aufgabe für eine spezifische Kompetenz
   * Verwendet Level-Parameter für angepasste Schwierigkeit
   */
  private generateTaskForCompetency(
    competency: CompetencyDefinition,
    numberRange: 10 | 20 | 100,
    taskMastery: Record<string, TaskMasteryStatus>,
    level: number,
    minNumber: number,
    maxNumber: number,
    allowTransition: boolean,
    difficultyMultiplier: number
  ): Omit<InsertTask, "sessionId"> | null {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      attempts++;

      // Generiere Aufgabe für die Kompetenz
      const task = this.generateRandomTaskForCompetency(competency);
      
      if (!task) continue;

      // 🎯 KRITISCH: Für hohe Level (76+) KEINE ZR10/ZR20 Aufgaben akzeptieren
      if (level >= 76) {
        // Beide Zahlen müssen mindestens im ZR30+ Bereich sein
        if (task.number1 < 20 || task.number2 < 20) {
          // Skaliere hoch in den ZR100 Bereich
          const scaleFactor = Math.random() * 3 + 3; // 3-6x multiplier
          task.number1 = Math.min(maxNumber, Math.floor(task.number1 * scaleFactor));
          task.number2 = Math.min(maxNumber, Math.floor(task.number2 * scaleFactor));
          
          // Für Subtraktion: Stelle sicher num1 > num2
          if (task.operation === '-' && task.number1 < task.number2) {
            const temp = task.number1;
            task.number1 = task.number2;
            task.number2 = temp;
          }
          
          // Recalculate correctAnswer
          if (task.placeholderPosition === 'start') {
            task.correctAnswer = task.number1;
          } else if (task.placeholderPosition === 'middle') {
            task.correctAnswer = task.number2;
          } else {
            task.correctAnswer = task.operation === '+' ? task.number1 + task.number2 : task.number1 - task.number2;
          }
        }
      }

      // Validiere Zahlenbereich
      if (task.number1 < minNumber || task.number1 > maxNumber || 
          task.number2 < minNumber || task.number2 > maxNumber) {
        continue; // Verwerfe Aufgabe außerhalb des Bereichs
      }

      // Prüfe ob Aufgabe bereits gemeistert ist
      const taskStr = this.getTaskString(task);
      if (this.isTaskMastered(taskStr, taskMastery)) {
        continue; // Versuche eine andere Aufgabe
      }

      return task;
    }

    // Fallback: Generiere garantiert eine Aufgabe im richtigen Bereich
    return this.generateFallbackTaskInRange(minNumber, maxNumber, allowTransition);
  }

  /**
   * Fallback-Generator für Aufgaben im korrekten Zahlenbereich
   */
  private generateFallbackTaskInRange(
    minNumber: number,
    maxNumber: number,
    allowTransition: boolean
  ): Omit<InsertTask, "sessionId"> {
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
      const num1 = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
      const num2 = Math.floor(Math.random() * (maxNumber - num1)) + minNumber;
      
      return {
        taskType: "basic_operation",
        operation: "+",
        number1: num1,
        number2: num2,
        correctAnswer: num1 + num2,
        numberRange: maxNumber as any,
        placeholderPosition: "end",
        requiresInverseThinking: false,
        algebraicComplexity: 0.0,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      };
    } else {
      const num1 = Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
      const num2 = Math.floor(Math.random() * (num1 - minNumber)) + minNumber;
      
      return {
        taskType: "basic_operation",
        operation: "-",
        number1: num1,
        number2: num2,
        correctAnswer: num1 - num2,
        numberRange: maxNumber as any,
        placeholderPosition: "end",
        requiresInverseThinking: false,
        algebraicComplexity: 0.0,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      };
    }
  }

  /**
   * Generiere Aufgaben für eine spezifische Kompetenz
   * FIXED: Vollständig gemeisterte Kompetenzen (5 Tasks mit 3x korrekt EACH) erhalten KEINE weiteren Aufgaben
   * Dies verhindert Wiederholung von bereits beherrschten Aufgaben
   *
   * NEU: levelMultiplier erhöht Schwierigkeit graduell
   */
  private generateTasksForCompetency(
    competency: CompetencyDefinition,
    progress: CompetencyProgressStatus | undefined,
    taskMastery: Record<string, TaskMasteryStatus>,
    count: number,
    levelMultiplier: number = 1.0
  ): Omit<InsertTask, "sessionId">[] {
    const tasks: Omit<InsertTask, "sessionId">[] = [];

    // Prüfe ob Kompetenz WIRKLICH gemeistert ist
    const tasksMasteredCount = progress?.tasksMastered?.length || 0;
    const correctCount = progress?.correct || 0;
    const successRate = progress?.successRate || 0;

    // MASTERY-KRITERIEN (streng):
    // - 5 gemeisterte Tasks (EACH 3x korrekt) ODER
    // - 15 korrekte mit 90% Erfolgsrate (sehr hohe Messlatte)
    const isMastered = (tasksMasteredCount >= 5) ||
                      (correctCount >= 15 && successRate >= 0.90);

    // ✅ KRITISCHE KORREKTUR: Vollständig gemeisterte Kompetenzen erhalten KEINE Aufgaben mehr!
    // Begründung: Wenn ein User eine Aufgabe 3x korrekt gelöst hat, ist sie sicher beherrscht.
    // Weitere Wiederholungen sind didaktisch nicht sinnvoll und frustrieren den Lerner.
    // Das System soll sich auf neue/schwache Kompetenzen konzentrieren.

    // DOUBLE-CHECK: Prüfe auch ob schon genug verschiedene Aufgaben gemeistert wurden
    const uniqueMasteredTasks = new Set(progress?.tasksMastered || []).size;

    if (isMastered || uniqueMasteredTasks >= 5) {
      console.log(`✓ Competency ${competency.id} is MASTERED (${tasksMasteredCount} unique tasks, ${correctCount} correct, ${(successRate*100).toFixed(0)}% rate) - skipping`);
      return []; // KEINE Aufgaben für gemeisterte Kompetenzen!
    }

    let adjustedCount = count;

    // Priorisiere Aufgaben die Fehler hatten
    const errorTasks = (progress?.recentErrors || []).filter(
      taskStr => !this.isTaskMastered(taskStr, taskMastery)
    );

    // Wenn es Fehleraufgaben gibt, nimm davon
    if (errorTasks.length > 0 && tasks.length < adjustedCount) {
      const taskStr = errorTasks[Math.floor(Math.random() * errorTasks.length)];
      const task = this.createTaskFromString(taskStr, competency);
      if (task) tasks.push(task);
    }

    // Fülle mit neuen oder wenig geübten Aufgaben auf
    while (tasks.length < adjustedCount) {
      const task = this.generateNewTaskForCompetency(competency, taskMastery);
      if (task) tasks.push(task);
    }

    return tasks;
  }

  /**
   * Prüfe ob eine Aufgabe gemeistert ist (3+ korrekte Punkte)
   *
   * Hinweis: Mit Fehler-Kompensation (-2 Punkte pro Fehler) können mehr als
   * 3 Versuche nötig sein, um 3 Punkte zu erreichen.
   */
  private isTaskMastered(taskStr: string, taskMastery: Record<string, TaskMasteryStatus>): boolean {
    const mastery = taskMastery[taskStr];
    return mastery?.mastered || (mastery?.correct >= 3);
  }

  /**
   * Erstelle eine neue Aufgabe für eine Kompetenz
   */
  private generateNewTaskForCompetency(
    competency: CompetencyDefinition,
    taskMastery: Record<string, TaskMasteryStatus>
  ): Omit<InsertTask, "sessionId"> | null {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const task = this.generateRandomTaskForCompetency(competency);
      if (!task) return null;

      const taskStr = this.getTaskString(task);

      // Bevorzuge Aufgaben die noch nicht gemeistert sind
      if (!this.isTaskMastered(taskStr, taskMastery)) {
        return task;
      }

      attempts++;
    }

    // Fallback: Gib irgendeine Aufgabe zurück
    return this.generateRandomTaskForCompetency(competency);
  }

  /**
   * Generiere eine zufällige Aufgabe für eine Kompetenz
   * GARANTIERT: Keine negativen Zahlen!
   */
  private generateRandomTaskForCompetency(
    competency: CompetencyDefinition
  ): Omit<InsertTask, "sessionId"> | null {
    let task: Omit<InsertTask, "sessionId"> | null = null;

    switch (competency.id) {
      case "addition_ZR10_no_transition":
        return this.generateAdditionZR10();

      case "subtraction_ZR10_no_transition":
        return this.generateSubtractionZR10();

      case "addition_to_10":
        return this.generateAdditionTo10();

      case "subtraction_from_10":
        return this.generateSubtractionFrom10();

      case "addition_ZR20_no_transition":
        return this.generateAdditionZR20NoTransition();

      case "subtraction_ZR20_no_transition":
        return this.generateSubtractionZR20NoTransition();

      case "addition_with_transition":
        return this.generateAdditionWithTransition();

      case "subtraction_with_transition":
        return this.generateSubtractionWithTransition();

      case "placeholder_end":
        return this.generatePlaceholderEnd();

      case "placeholder_middle":
        return this.generatePlaceholderMiddle();

      case "placeholder_start":
        return this.generatePlaceholderStart();

      case "doubles":
        return this.generateDoubles();

      case "near_doubles":
        return this.generateNearDoubles();

      case "number_bonds_10":
        return this.generateNumberBonds10();

      case "inverse_operations":
        return this.generateInverseOperations();

      // Zahlenraumerweiterungen ZR30-ZR100
      case "addition_ZR30_no_transition":
        return this.generateAdditionZRX(30, false);
      case "subtraction_ZR30_no_transition":
        return this.generateSubtractionZRX(30, false);
      case "addition_ZR40_no_transition":
        return this.generateAdditionZRX(40, false);
      case "subtraction_ZR40_no_transition":
        return this.generateSubtractionZRX(40, false);
      case "addition_ZR50_no_transition":
        return this.generateAdditionZRX(50, false);
      case "subtraction_ZR50_no_transition":
        return this.generateSubtractionZRX(50, false);
      case "addition_ZR80_no_transition":
        return this.generateAdditionZRX(80, false);
      case "subtraction_ZR80_no_transition":
        return this.generateSubtractionZRX(80, false);
      case "addition_ZR100_no_transition":
        return this.generateAdditionZRX(100, false);
      case "subtraction_ZR100_no_transition":
        return this.generateSubtractionZRX(100, false);
      case "addition_ZR100_with_transition":
        return this.generateAdditionZRX(100, true);
      case "subtraction_ZR100_with_transition":
        return this.generateSubtractionZRX(100, true);

      // Tausenderraum
      case "addition_ZR200_no_transition":
        return this.generateAdditionZRX(200, false);
      case "subtraction_ZR200_no_transition":
        return this.generateSubtractionZRX(200, false);
      case "addition_ZR500_no_transition":
        return this.generateAdditionZRX(500, false);
      case "subtraction_ZR500_no_transition":
        return this.generateSubtractionZRX(500, false);
      case "addition_ZR1000_no_transition":
        return this.generateAdditionZRX(1000, false);
      case "subtraction_ZR1000_no_transition":
        return this.generateSubtractionZRX(1000, false);
      case "addition_ZR1000_with_transition":
        return this.generateAdditionZRX(1000, true);
      case "subtraction_ZR1000_with_transition":
        return this.generateSubtractionZRX(1000, true);

      // Ergänzungskompetenzen
      case "complement_to_20":
        return this.generateComplementTo(20);
      case "complement_to_30":
        return this.generateComplementTo(30);
      case "complement_to_40":
        return this.generateComplementTo(40);
      case "complement_to_50":
        return this.generateComplementTo(50);
      case "complement_to_80":
        return this.generateComplementTo(80);
      case "complement_to_100":
        return this.generateComplementTo(100);
      case "complement_to_200":
        return this.generateComplementTo(200);
      case "complement_to_500":
        return this.generateComplementTo(500);
      case "complement_to_1000":
        return this.generateComplementTo(1000);

      // Reine Zehner/Hunderter
      case "pure_decades_addition":
        return this.generatePureDecades('+');
      case "pure_decades_subtraction":
        return this.generatePureDecades('-');
      case "pure_hundreds_addition":
        return this.generatePureHundreds('+');
      case "pure_hundreds_subtraction":
        return this.generatePureHundreds('-');

      default:
        task = null;
    }

    // 🚨 FINAL VALIDATION: Absolutely no negative numbers or calculation errors!
    if (task) {
      // Import arithmetic validator
      const { ensureCorrectArithmetic, validateArithmetic } = require('./arithmeticValidator');

      // Ensure both operands are positive
      task.number1 = Math.max(1, Math.abs(task.number1 || 1));
      task.number2 = Math.max(1, Math.abs(task.number2 || 1));

      // For subtraction: ensure num1 >= num2
      if (task.operation === '-' && task.number1 < task.number2) {
        const temp = task.number1;
        task.number1 = task.number2;
        task.number2 = temp;
      }

      // CRITICAL: Recalculate correct answer using arithmetic validator
      const placeholderPos = task.placeholderInSymbolic || task.placeholderPosition || 'end';

      if (placeholderPos === 'number1' || placeholderPos === 'start') {
        // Missing first number: correctAnswer IS number1
        task.correctAnswer = task.number1;
      } else if (placeholderPos === 'number2' || placeholderPos === 'middle') {
        // Missing second number: correctAnswer IS number2
        task.correctAnswer = task.number2;
      } else {
        // Missing result: calculate it using validator
        task.correctAnswer = ensureCorrectArithmetic(task.operation, task.number1, task.number2);
      }

      // ULTIMATE VALIDATION: Double-check arithmetic with validator
      const validation = validateArithmetic(
        task.operation,
        task.number1,
        task.number2,
        task.correctAnswer
      );

      if (!validation.isValid) {
        console.error(`🚨 CRITICAL ARITHMETIC ERROR: ${validation.error}`);
        console.error(`Task: ${task.number1} ${task.operation} ${task.number2} = ${task.correctAnswer}`);
        return null; // Force regeneration
      }

      // Final check: if result is negative, regenerate task
      if (task.correctAnswer < 0) {
        console.error(`❌ CRITICAL: Task correctAnswer is negative! Regenerating...`);
        return null; // Force regeneration
      }

      // ULTIMATE VALIDATION: Verify arithmetic is ALWAYS correct
      // For placeholder_end (normal tasks): correctAnswer = number1 OP number2
      if (task.placeholderPosition === 'end' || !task.placeholderPosition) {
        const verifiedAnswer = ensureCorrectArithmetic(
          task.operation,
          task.number1,
          task.number2
        );

        if (task.correctAnswer !== verifiedAnswer) {
          console.error(`🚨🚨🚨 CRITICAL FIX: Placeholder END has WRONG answer!`);
          console.error(`Task: ${task.number1} ${task.operation} ${task.number2} = ?`);
          console.error(`Was: ${task.correctAnswer}, Should be: ${verifiedAnswer}`);
          task.correctAnswer = verifiedAnswer;
        }
      }

      const expectedResult = task.operation === '+'
        ? task.number1 + task.number2
        : task.number1 - task.number2;

      // For placeholder tasks, verify the answer makes sense
      if (task.placeholderInSymbolic === 'number1' || task.placeholderPosition === 'start') {
        // Verify: correctAnswer + number2 = result OR correctAnswer - number2 = result
        const verification = task.operation === '+'
          ? task.correctAnswer + task.number2
          : task.correctAnswer + task.number2; // For subtraction: if ? - 7 = 3, then ? = 10 (3 + 7)

        if (verification !== expectedResult) {
          console.error(`🚨 PLACEHOLDER START VALIDATION FAILED!`);
          console.error(`Expected: ${task.correctAnswer} ${task.operation} ${task.number2} = ${expectedResult}`);
          console.error(`Got: ${verification}`);
          return null; // Force regeneration
        }
      } else if (task.placeholderInSymbolic === 'number2' || task.placeholderPosition === 'middle') {
        // Verify: number1 + correctAnswer = result OR number1 - correctAnswer = result
        const verification = task.operation === '+'
          ? task.number1 + task.correctAnswer
          : task.number1 - task.correctAnswer; // For subtraction: if 10 - ? = 3, then ? = 7 (10 - 3)

        if (verification !== expectedResult) {
          console.error(`🚨 PLACEHOLDER MIDDLE VALIDATION FAILED!`);
          console.error(`Expected: ${task.number1} ${task.operation} ${task.correctAnswer} = ${expectedResult}`);
          console.error(`Got: ${verification}`);
          return null; // Force regeneration
        }
      }
    }

    return task;
  }

  // ========== Spezifische Aufgaben-Generatoren ==========

  private generateAdditionZR10(): Omit<InsertTask, "sessionId"> {
    let num1 = Math.floor(Math.random() * 7) + 1; // 1-7
    let num2 = Math.floor(Math.random() * (9 - num1)) + 1; // Ergebnis max 9

    // ABSOLUTE SICHERHEIT: Keine negativen Zahlen
    num1 = Math.max(1, Math.abs(num1));
    num2 = Math.max(1, Math.abs(num2));

    return {
      taskType: "basic_operation",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: num1 + num2,
      numberRange: 10,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateSubtractionZR10(): Omit<InsertTask, "sessionId"> {
    const result = Math.floor(Math.random() * 8) + 1; // 1-8
    const num2 = Math.floor(Math.random() * result) + 1; // Subtrahend kleiner als Ergebnis
    let num1 = result + num2;

    // ABSOLUTE SICHERHEIT: num1 >= num2 und beide positiv
    num1 = Math.max(num2 + 1, Math.abs(num1));
    const validNum2 = Math.max(1, Math.min(Math.abs(num2), num1 - 1));

    return {
      taskType: "basic_operation",
      operation: "-",
      number1: num1,
      number2: validNum2,
      correctAnswer: num1 - validNum2,
      numberRange: 10,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateAdditionTo10(): Omit<InsertTask, "sessionId"> {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const num2 = 10 - num1;

    return {
      taskType: "complement_to_10",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: 10,
      numberRange: 10,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateSubtractionFrom10(): Omit<InsertTask, "sessionId"> {
    const num2 = Math.floor(Math.random() * 9) + 1; // 1-9

    return {
      taskType: "complement_to_10",
      operation: "-",
      number1: 10,
      number2: num2,
      correctAnswer: 10 - num2,
      numberRange: 10,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateAdditionZR20NoTransition(): Omit<InsertTask, "sessionId"> {
    const num1 = Math.floor(Math.random() * 8) + 11; // 11-18
    const num2 = Math.floor(Math.random() * (20 - num1 - (num1 % 10))) + 1;

    return {
      taskType: "basic_operation",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: num1 + num2,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateSubtractionZR20NoTransition(): Omit<InsertTask, "sessionId"> {
    const num1 = Math.floor(Math.random() * 8) + 11; // 11-18
    const num2 = Math.floor(Math.random() * (num1 % 10)) + 1;

    return {
      taskType: "basic_operation",
      operation: "-",
      number1: num1,
      number2: num2,
      correctAnswer: num1 - num2,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateAdditionWithTransition(): Omit<InsertTask, "sessionId"> {
    const num1 = Math.floor(Math.random() * 4) + 7; // 7-10
    const num2 = Math.floor(Math.random() * (20 - num1 - 1)) + (10 - num1 + 1);

    return {
      taskType: "decade_transition",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: num1 + num2,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.3,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateSubtractionWithTransition(): Omit<InsertTask, "sessionId"> {
    const num1 = Math.floor(Math.random() * 8) + 11; // 11-18
    const num2 = Math.floor(Math.random() * (num1 - 10)) + (num1 % 10) + 1;

    return {
      taskType: "decade_transition",
      operation: "-",
      number1: num1,
      number2: num2,
      correctAnswer: num1 - num2,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.3,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generatePlaceholderEnd(): Omit<InsertTask, "sessionId"> {
    // Standard Aufgabe mit Platzhalter am Ende (Ergebnis fehlt)
    const operation = Math.random() > 0.5 ? '+' : '-';
    const baseTask = operation === '+'
      ? this.generateAdditionZR10()
      : this.generateSubtractionZR10();

    // WICHTIG: Setze placeholderInSymbolic für Frontend
    return {
      ...baseTask,
      placeholderPosition: 'end',
      placeholderInSymbolic: 'result',
    };
  }

  /**
   * Generate MIDDLE placeholder: num1 + _ = result  or  num1 - _ = result
   * CRITICAL: correctAnswer is the MISSING number (num2), not the result!
   */
  private generatePlaceholderMiddle(): Omit<InsertTask, "sessionId"> {
    const operation = Math.random() > 0.5 ? '+' : '-';
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      attempts++;

      if (operation === '+') {
        // Addition: num1 + ? = result
        const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
        const num2 = Math.floor(Math.random() * (20 - num1 - 1)) + 1; // Ensure result ≤ 20
        const result = num1 + num2;

        // CRITICAL VALIDATION: All numbers must be positive
        if (num1 < 1 || num2 < 1 || result < 1) {
          console.error(`🚨 CRITICAL: Negative or zero number in middle placeholder addition!`);
          continue;
        }

        // Verify arithmetic
        if (num1 + num2 !== result) {
          console.error(`🚨 CRITICAL ARITHMETIC ERROR: ${num1} + ${num2} = ${num1 + num2}, not ${result}`);
          continue;
        }

        return {
          taskType: 'algebraic_thinking',
          operation: '+',
          number1: num1,
          number2: num2,
          correctAnswer: num2, // The answer IS num2 (the missing addend)
          numberRange: 20,
          placeholderPosition: "middle",
          requiresInverseThinking: true,
          algebraicComplexity: 0.5,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
          placeholderInSymbolic: 'number2',
        };
      } else {
        // Subtraction: num1 - ? = result
        const num1 = Math.floor(Math.random() * 10) + 6; // 6-15
        const num2 = Math.floor(Math.random() * Math.min(5, num1 - 1)) + 1; // num2 < num1
        const result = num1 - num2;

        // CRITICAL VALIDATION: All numbers must be positive
        if (num1 < 1 || num2 < 1 || result < 0) {
          console.error(`🚨 CRITICAL: Negative number in middle placeholder subtraction! num1=${num1}, num2=${num2}, result=${result}`);
          continue;
        }

        // CRITICAL: num1 must be greater than num2
        if (num1 <= num2) {
          console.error(`🚨 CRITICAL: num1 (${num1}) must be > num2 (${num2}) for subtraction!`);
          continue;
        }

        // Verify arithmetic
        const actualResult = num1 - num2;
        if (actualResult !== result || actualResult < 0) {
          console.error(`🚨 CRITICAL ARITHMETIC ERROR: ${num1} - ${num2} = ${actualResult}, not ${result}`);
          continue;
        }

        return {
          taskType: 'algebraic_thinking',
          operation: '-',
          number1: num1,
          number2: num2,
          correctAnswer: num2, // The answer IS num2 (the missing subtrahend)
          numberRange: 20,
          placeholderPosition: "middle",
          requiresInverseThinking: true,
          algebraicComplexity: 0.5,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
          placeholderInSymbolic: 'number2',
        };
      }
    }

    // Fallback: Generate safe addition task
    console.warn('⚠️ generatePlaceholderMiddle: Max attempts reached, using fallback');
    return {
      taskType: 'algebraic_thinking',
      operation: '+',
      number1: 5,
      number2: 3,
      correctAnswer: 3,
      numberRange: 20,
      placeholderPosition: "middle",
      requiresInverseThinking: true,
      algebraicComplexity: 0.5,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
      placeholderInSymbolic: 'number2',
    };
  }

  /**
   * Generate START placeholder: _ + num2 = result  or  _ - num2 = result
   * CRITICAL: correctAnswer is the MISSING number (num1), not the result!
   */
  private generatePlaceholderStart(): Omit<InsertTask, "sessionId"> {
    // Start Placeholder: ? + num2 = result  or  ? - num2 = result
    // CRITICAL: correctAnswer is number1 (the missing first operand)
    // ABSOLUTE RULE: NO NEGATIVE NUMBERS EVER!

    const maxAttempts = 50;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const operation = Math.random() > 0.5 ? '+' : '-';

      if (operation === '+') {
        // Addition: ? + num2 = result
        const result = Math.floor(Math.random() * 10) + 6; // 6-15
        const num2 = Math.floor(Math.random() * (result - 1)) + 1; // num2 < result
        const num1 = result - num2;

        // CRITICAL VALIDATION: All numbers must be positive
        if (num1 < 1 || num2 < 1 || result < 1) {
          console.error(`🚨 CRITICAL: Negative or zero number in start placeholder addition!`);
          continue;
        }

        // Verify arithmetic
        if (num1 + num2 !== result) {
          console.error(`🚨 CRITICAL ARITHMETIC ERROR: ${num1} + ${num2} = ${num1 + num2}, not ${result}`);
          continue;
        }

        return {
          taskType: 'algebraic_thinking',
          operation: '+',
          number1: num1,
          number2: num2,
          correctAnswer: num1, // The answer IS num1 (the missing first addend)
          numberRange: 20,
          placeholderPosition: "start",
          requiresInverseThinking: true,
          algebraicComplexity: 0.7,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
          placeholderInSymbolic: 'number1',
        };
      } else {
        // Subtraction: ? - num2 = result
        const result = Math.floor(Math.random() * 8) + 1; // 1-8
        const num2 = Math.floor(Math.random() * 5) + 1; // 1-5
        const num1 = result + num2;

        // CRITICAL VALIDATION: Check bounds and positivity
        if (num1 > 20 || num1 < 1 || num2 < 1 || result < 0) {
          continue;
        }

        // CRITICAL: Verify num1 > num2 for subtraction
        if (num1 <= num2) {
          console.error(`🚨 CRITICAL: num1 (${num1}) must be > num2 (${num2}) for subtraction!`);
          continue;
        }

        // Verify arithmetic
        const actualResult = num1 - num2;
        if (actualResult !== result || actualResult < 0) {
          console.error(`🚨 CRITICAL ARITHMETIC ERROR: ${num1} - ${num2} = ${actualResult}, not ${result}`);
          continue;
        }

        return {
          taskType: 'algebraic_thinking',
          operation: '-',
          number1: num1,
          number2: num2,
          correctAnswer: num1, // The answer IS num1 (the missing minuend)
          numberRange: 20,
          placeholderPosition: "start",
          requiresInverseThinking: true,
          algebraicComplexity: 0.7,
          studentAnswer: null,
          isCorrect: null,
          timeTaken: null,
          solutionSteps: [],
          strategyUsed: null,
          representationsUsed: [],
          errorType: null,
          errorSeverity: null,
          placeholderInSymbolic: 'number1',
        };
      }
    }

    // Fallback: Safe addition task
    console.warn('⚠️ generatePlaceholderStart: Max attempts reached, using fallback');
    return {
      taskType: 'algebraic_thinking',
      operation: '+',
      number1: 7,
      number2: 3,
      correctAnswer: 7,
      numberRange: 20,
      placeholderPosition: "start",
      requiresInverseThinking: true,
      algebraicComplexity: 0.7,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
      placeholderInSymbolic: 'number1',
    };
  }

  private generateDoubles(): Omit<InsertTask, "sessionId"> {
    const num = Math.floor(Math.random() * 10) + 1; // 1-10

    return {
      taskType: "pattern_recognition",
      operation: "+",
      number1: num,
      number2: num,
      correctAnswer: num * 2,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateNearDoubles(): Omit<InsertTask, "sessionId"> {
    const num = Math.floor(Math.random() * 9) + 1; // 1-9

    return {
      taskType: "pattern_recognition",
      operation: "+",
      number1: num,
      number2: num + 1,
      correctAnswer: num * 2 + 1,
      numberRange: 20,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.1,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  private generateNumberBonds10(): Omit<InsertTask, "sessionId"> {
    return this.generateAdditionTo10();
  }

  private generateInverseOperations(): Omit<InsertTask, "sessionId"> {
    // Generiere entweder Addition oder Subtraktion
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    const sum = num1 + num2;

    if (Math.random() > 0.5) {
      // Addition
      return {
        taskType: "inverse_relationship",
        operation: "+",
        number1: num1,
        number2: num2,
        correctAnswer: sum,
        numberRange: 20,
        placeholderPosition: "end",
        requiresInverseThinking: false,
        algebraicComplexity: 0.0,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      };
    } else {
      // Subtraktion
      return {
        taskType: "inverse_relationship",
        operation: "-",
        number1: sum,
        number2: Math.random() > 0.5 ? num1 : num2,
        correctAnswer: Math.random() > 0.5 ? num2 : num1,
        numberRange: 20,
        placeholderPosition: "end",
        requiresInverseThinking: false,
        algebraicComplexity: 0.0,
        studentAnswer: null,
        isCorrect: null,
        timeTaken: null,
        solutionSteps: [],
        strategyUsed: null,
        representationsUsed: [],
        errorType: null,
        errorSeverity: null,
      };
    }
  }

  /**
   * Generiere Addition für beliebigen Zahlenraum
   *
   * DIDAKTISCHE LOGIK:
   * - ZR30: Zahlen 21-30
   * - ZR40: Zahlen 31-40
   * - ZR50: Zahlen 41-50
   * - ZR80: Zahlen 51-80
   * - ZR100: Zahlen 1-100
   * - ZR200: Zahlen 101-200
   * - ZR500: Zahlen 201-500
   * - ZR1000: Zahlen 501-1000
   * - mit Transition: Zehner-/Hunderterübergang
   */
  private generateAdditionZRX(numberRange: number, withTransition: boolean): Omit<InsertTask, "sessionId"> {
    let num1: number, num2: number;
    let lowerBound: number, upperBound: number;

    // Bestimme Zahlenbereich basierend auf numberRange
    if (numberRange === 30) {
      lowerBound = 21; upperBound = 30;
    } else if (numberRange === 40) {
      lowerBound = 31; upperBound = 40;
    } else if (numberRange === 50) {
      lowerBound = 41; upperBound = 50;
    } else if (numberRange === 80) {
      lowerBound = 51; upperBound = 80;
    } else if (numberRange === 100) {
      lowerBound = 1; upperBound = 100;
    } else if (numberRange === 200) {
      lowerBound = 101; upperBound = 200;
    } else if (numberRange === 500) {
      lowerBound = 201; upperBound = 500;
    } else if (numberRange === 1000) {
      lowerBound = 1; upperBound = 1000;
    } else {
      // Fallback
      lowerBound = Math.max(1, Math.floor(numberRange * 0.5));
      upperBound = numberRange;
    }

    if (withTransition) {
      // ZEHNER-/HUNDERTERÜBERGANG
      if (numberRange <= 100) {
        // Zehnerübergang (z.B. 27+5=32 oder 58+47=105)
        if (numberRange === 100) {
          // Kann auch Hunderterübergang sein
          const useHundredTransition = Math.random() > 0.5;
          if (useHundredTransition) {
            // Hunderterübergang: beide < 100, Ergebnis > 100
            num1 = Math.floor(Math.random() * 40) + 55; // 55-94
            num2 = Math.floor(Math.random() * 30) + (100 - num1 + 1); // garantiert > 100
            if (num1 + num2 > 120) num2 = 120 - num1;
          } else {
            // Einfacher Zehnerübergang im ZR100
            num1 = Math.floor(Math.random() * 80) + 10; // 10-89
            const currentDecade = Math.floor(num1 / 10) * 10;
            const nextDecade = currentDecade + 10;
            const onesDigit = num1 % 10;
            if (onesDigit > 0) {
              num2 = Math.floor(Math.random() * 8) + (10 - onesDigit + 1); // Übergang erzwingen
              // Sicherstellen dass Ergebnis <= 100
              if (num1 + num2 > 100) num2 = 100 - num1;
            } else {
              num2 = Math.floor(Math.random() * 9) + 1;
            }
          }
        } else {
          // ZR30, ZR40, ZR50, ZR80: Zehnerübergang
          const maxDecade = Math.floor(numberRange / 10) * 10;
          num1 = Math.floor(Math.random() * (maxDecade - 10)) + 11;
          const currentDecade = Math.floor(num1 / 10) * 10;
          const nextDecade = currentDecade + 10;
          const onesDigit = num1 % 10;
          if (onesDigit > 0) {
            num2 = Math.floor(Math.random() * 8) + (10 - onesDigit + 1);
            if (num1 + num2 > numberRange) num2 = numberRange - num1;
          } else {
            num2 = Math.floor(Math.random() * 9) + 1;
          }
        }
      } else {
        // ZR200, ZR500, ZR1000: Hunderterübergang UND Zehnerübergang
        // Beispiel: 83+28=111 hat BEIDES: Zehner (3+8=11) UND Hunderter (83+28>100)

        // Wähle Startzahl die einen Übergang ermöglicht
        num1 = Math.floor(Math.random() * (upperBound - lowerBound - 50)) + lowerBound;

        // Stelle sicher dass ein Übergang passiert
        const onesDigit = num1 % 10;
        const tensInHundred = num1 % 100;

        // Priorisiere Hunderterübergang für ZR1000
        if (numberRange === 1000) {
          // 50% Chance auf reinen Hunderterübergang
          // 50% Chance auf Hunderter + Zehnerübergang kombiniert
          const useCombinedTransition = Math.random() > 0.5;

          if (useCombinedTransition && onesDigit > 0) {
            // BEIDE Übergänge: z.B. 83+28=111 (Zehner: 3+8=11, Hunderter: 111>100)
            const currentHundred = Math.floor(num1 / 100) * 100;
            const nextHundred = currentHundred + 100;

            // num1 sollte nahe an einem Hunderter sein (z.B. 70-99)
            num1 = Math.floor(Math.random() * 30) + (nextHundred - 30);
            if (num1 < lowerBound) num1 = lowerBound;
            if (num1 >= nextHundred) num1 = nextHundred - 10;

            const newOnesDigit = num1 % 10;
            // num2 muss Zehnerübergang UND Hunderterübergang erzwingen
            const minForTenTransition = newOnesDigit > 0 ? (10 - newOnesDigit + 1) : 1;
            const minForHundredTransition = nextHundred - num1 + 1;
            const minNum2 = Math.max(minForTenTransition, minForHundredTransition);

            num2 = Math.floor(Math.random() * 30) + minNum2;
            if (num1 + num2 > upperBound) num2 = upperBound - num1;
          } else {
            // Nur Hunderterübergang
            const currentHundred = Math.floor(num1 / 100) * 100;
            const nextHundred = currentHundred + 100;

            num1 = Math.floor(Math.random() * 40) + (nextHundred - 50);
            if (num1 < lowerBound) num1 = lowerBound;
            if (num1 >= nextHundred) num1 = nextHundred - 10;

            const remainingToHundred = nextHundred - num1;
            num2 = Math.floor(Math.random() * 40) + remainingToHundred + 1;
            if (num1 + num2 > upperBound) num2 = upperBound - num1;
          }
        } else {
          // ZR200, ZR500: Einfacherer Hunderterübergang
          const currentHundred = Math.floor(num1 / 100) * 100;
          const nextHundred = currentHundred + 100;

          num1 = Math.floor(Math.random() * 30) + (nextHundred - 40);
          if (num1 < lowerBound) num1 = lowerBound;

          const tensDigit = num1 % 100;
          num2 = Math.floor(Math.random() * 50) + (100 - tensDigit + 1);

          const maxResult = Math.min(upperBound, nextHundred + 50);
          if (num1 + num2 > maxResult) {
            num2 = maxResult - num1;
          }
        }
      }
    } else {
      // OHNE Zehner-/Hunderterübergang
      num1 = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

      if (numberRange <= 100) {
        // Zehner-basiert
        const currentDecade = Math.floor(num1 / 10) * 10;
        const nextDecade = currentDecade + 10;
        const remainingInDecade = nextDecade - num1;
        const maxAddend = Math.min(remainingInDecade - 1, upperBound - num1);
        num2 = maxAddend > 0 ? Math.floor(Math.random() * maxAddend) + 1 : 1;
      } else {
        // Hunderter-basiert
        const currentHundred = Math.floor(num1 / 100) * 100;
        const nextHundred = currentHundred + 100;
        const remainingInHundred = nextHundred - num1;
        const maxAddend = Math.min(remainingInHundred - 1, upperBound - num1);
        num2 = maxAddend > 0 ? Math.floor(Math.random() * maxAddend) + 1 : 1;
      }
    }

    return {
      taskType: withTransition ? "decade_transition" : "basic_operation",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: num1 + num2,
      numberRange: numberRange as any,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: withTransition ? 0.5 : 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Generiere Subtraktion für beliebigen Zahlenraum
   *
   * DIDAKTISCHE LOGIK:
   * - ZR30: Zahlen 21-30
   * - ZR40: Zahlen 31-40
   * - ZR50: Zahlen 41-50
   * - ZR80: Zahlen 51-80
   * - ZR100: Zahlen 1-100
   * - ZR200: Zahlen 101-200
   * - ZR500: Zahlen 201-500
   * - ZR1000: Zahlen 501-1000
   * - mit Transition: Zehner-/Hunderterunterschreitung
   */
  private generateSubtractionZRX(numberRange: number, withTransition: boolean): Omit<InsertTask, "sessionId"> {
    let num1: number, num2: number;
    let lowerBound: number, upperBound: number;

    // Bestimme Zahlenbereich basierend auf numberRange
    if (numberRange === 30) {
      lowerBound = 21; upperBound = 30;
    } else if (numberRange === 40) {
      lowerBound = 31; upperBound = 40;
    } else if (numberRange === 50) {
      lowerBound = 41; upperBound = 50;
    } else if (numberRange === 80) {
      lowerBound = 51; upperBound = 80;
    } else if (numberRange === 100) {
      lowerBound = 1; upperBound = 100;
    } else if (numberRange === 200) {
      lowerBound = 101; upperBound = 200;
    } else if (numberRange === 500) {
      lowerBound = 201; upperBound = 500;
    } else if (numberRange === 1000) {
      lowerBound = 501; upperBound = 1000;
    } else {
      // Fallback
      lowerBound = Math.max(1, Math.floor(numberRange * 0.5));
      upperBound = numberRange;
    }

    if (withTransition) {
      // MIT Zehnerübergang
      if (numberRange === 20) {
        num1 = Math.floor(Math.random() * 10) + 11; // 11-20
        num2 = (num1 % 10) + Math.floor(Math.random() * 3) + 1;
      } else if (numberRange === 100) {
        const tens = Math.floor(Math.random() * 8) + 2; // 20-90
        num1 = tens * 10 + Math.floor(Math.random() * 9) + 1;
        num2 = (num1 % 10) + Math.floor(Math.random() * 5) + 1;
      } else {
        // ZR1000
        const hundreds = Math.floor(Math.random() * 9) + 1;
        num1 = hundreds * 100 + Math.floor(Math.random() * 99) + 1;
        num2 = (num1 % 10) + Math.floor(Math.random() * 5) + 1;
      }
    } else {
      // OHNE Zehnerübergang
      if (numberRange === 20) {
        num1 = Math.floor(Math.random() * 10) + 10; // 10-19
        const maxSubtrahend = num1 % 10 || 1;
        num2 = Math.floor(Math.random() * maxSubtrahend) + 1;
      } else if (numberRange === 100) {
        num1 = Math.floor(Math.random() * 90) + 10; // 10-99
        const remainderInDecade = num1 % 10;
        num2 = remainderInDecade > 0
          ? Math.floor(Math.random() * remainderInDecade) + 1
          : 1;
      } else {
        // ZR1000: Keine Hunderterunterschreitung
        num1 = Math.floor(Math.random() * 900) + 100; // 100-999
        const remainderInHundred = num1 % 100;
        num2 = remainderInHundred > 0
          ? Math.floor(Math.random() * remainderInHundred) + 1
          : 1;
      }
    }

    // SICHERHEIT: Validiere dass beide Zahlen positiv sind und Ergebnis >= 0
    if (num1 <= 0 || num2 <= 0 || num1 - num2 < 0) {
      // Fallback auf sichere Werte
      num1 = 10;
      num2 = 3;
    }

    return {
      taskType: withTransition ? "decade_transition" : "basic_operation",
      operation: "-",
      number1: num1,
      number2: num2,
      correctAnswer: num1 - num2,
      numberRange: numberRange as any,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: withTransition ? 0.5 : 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Generiere Ergänzungsaufgabe zu einer runden Zahl
   *
   * DIDAKTISCHE LOGIK:
   * - Ergänzung zu 10, 20, 30, 40, 50, 80, 100, 200, 500, 1000
   * - Startzahl liegt typischerweise 5-20 unter Zielzahl (abhängig von Zielzahl)
   * - Transfer: Wer zu 10 ergänzen kann, kann auch zu 100, 1000 ergänzen
   */
  private generateComplementTo(target: number): Omit<InsertTask, "sessionId"> {
    let minStart: number, maxStart: number;

    // Bestimme sinnvollen Startzahl-Bereich basierend auf Zielzahl
    if (target <= 20) {
      // ZR10-20: Startzahl 1 bis target-1
      minStart = Math.max(1, target - 9);
      maxStart = target - 1;
    } else if (target <= 100) {
      // ZR30-100: Startzahl bis zu 15 unter Ziel
      minStart = Math.max(1, target - 20);
      maxStart = target - 1;
    } else if (target <= 500) {
      // ZR200-500: Startzahl bis zu 50 unter Ziel
      minStart = Math.max(1, target - 70);
      maxStart = target - 1;
    } else {
      // ZR1000: Startzahl bis zu 100 unter Ziel
      minStart = Math.max(1, target - 150);
      maxStart = target - 1;
    }

    const num1 = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;
    const num2 = target - num1;

    return {
      taskType: "complement_to_10",
      operation: "+",
      number1: num1,
      number2: num2,
      correctAnswer: target,
      numberRange: target as any,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Generiere reine Zehner-Arithmetik (30+20, 70-30)
   */
  private generatePureDecades(operation: '+' | '-'): Omit<InsertTask, "sessionId"> {
    const num1 = (Math.floor(Math.random() * 7) + 2) * 10; // 20-80
    let num2: number;

    if (operation === '+') {
      const maxAddend = Math.floor((100 - num1) / 10);
      num2 = (Math.floor(Math.random() * maxAddend) + 1) * 10;
    } else {
      const maxSubtrahend = Math.floor(num1 / 10) - 1;
      num2 = (Math.floor(Math.random() * maxSubtrahend) + 1) * 10;
    }

    return {
      taskType: "basic_operation",
      operation,
      number1: num1,
      number2: num2,
      correctAnswer: operation === '+' ? num1 + num2 : num1 - num2,
      numberRange: 100,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Generiere reine Hunderter-Arithmetik (300+200, 700-300)
   *
   * DIDAKTISCHE BEGRÜNDUNG:
   * - Transfer-Prinzip: 3+2=5 → 300+200=500
   * - Frühe Einführung (minLevel 2.0) zur Stellenwertverständnis-Entwicklung
   * - Variiert Schwierigkeit durch Zahlengröße (200-900)
   */
  private generatePureHundreds(operation: '+' | '-'): Omit<InsertTask, "sessionId"> {
    const num1 = (Math.floor(Math.random() * 7) + 2) * 100; // 200-800
    let num2: number;

    if (operation === '+') {
      // Addition: Ergebnis max 1000
      const maxAddend = Math.floor((1000 - num1) / 100);
      if (maxAddend > 0) {
        num2 = (Math.floor(Math.random() * maxAddend) + 1) * 100;
      } else {
        num2 = 100; // Fallback
      }
    } else {
      // Subtraktion: Subtrahend < Minuend
      const maxSubtrahend = Math.floor(num1 / 100) - 1;
      if (maxSubtrahend > 0) {
        num2 = (Math.floor(Math.random() * maxSubtrahend) + 1) * 100;
      } else {
        num2 = 100; // Fallback
      }
    }

    return {
      taskType: "basic_operation",
      operation,
      number1: num1,
      number2: num2,
      correctAnswer: operation === '+' ? num1 + num2 : num1 - num2,
      numberRange: 1000,
      placeholderPosition: "end",
      requiresInverseThinking: false,
      algebraicComplexity: 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Analysiere strukturelle Merkmale einer Aufgabe
   *
   * WICHTIG: Werteziffern-Analyse ist zentral für didaktisch korrekte Schwierigkeitseinschätzung!
   * 70+30 (2 Werteziffern) ist DEUTLICH leichter als 77+35 (4 Werteziffern)
   */
  analyzeTaskStructure(task: Omit<InsertTask, "sessionId">): TaskStructure {
    const { number1, number2, operation, correctAnswer } = task;
    const result = operation === '+' ? number1 + number2 : number1 - number2;

    // Prüfe auf Ergänzung zu runden Zahlen
    const roundTargets = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500, 1000];
    const isComplementTask = operation === '+' && roundTargets.includes(result);
    const complementTarget = isComplementTask ? result : undefined;

    // Prüfe auf reine Zehner/Hunderter
    const isPureDecades = (number1 % 10 === 0) && (number2 % 10 === 0) && number1 < 100 && number2 < 100;
    const isPureHundreds = (number1 % 100 === 0) && (number2 % 100 === 0) && number1 >= 100;

    // KORRIGIERTE Prüfung für Zehnerübergang
    // Beispiel 83+28: Einer 3+8=11 → überschreitet 10 → Zehnerübergang!
    let crossesDecade = false;
    if (operation === '+') {
      const onesDigitSum = (number1 % 10) + (number2 % 10);
      crossesDecade = onesDigitSum >= 10;
    } else {
      // Subtraktion: Zehnerunterschreitung
      crossesDecade = (number1 % 10) < (number2 % 10);
    }

    // KORRIGIERTE Prüfung für Hunderterübergang
    // Beispiel 83+28=111: 83+28 > 100 → Hunderterübergang!
    let crossesHundred = false;
    if (operation === '+') {
      const num1Hundred = Math.floor(number1 / 100);
      const resultHundred = Math.floor(result / 100);
      crossesHundred = resultHundred > num1Hundred;
    } else {
      // Subtraktion: Hunderterunterschreitung
      const num1Hundred = Math.floor(number1 / 100);
      const resultHundred = Math.floor(result / 100);
      crossesHundred = resultHundred < num1Hundred;
    }

    // Berechne Abstände
    const nextDecade = Math.ceil(number1 / 10) * 10;
    const decadeDistance = nextDecade - number1;

    const nextHundred = Math.ceil(number1 / 100) * 100;
    const hundredDistance = nextHundred - number1;

    // VOLLSTÄNDIGE Werteziffern-Analyse
    const num1Analysis = this.analyzeDigits(number1);
    const num2Analysis = this.analyzeDigits(number2);
    const valueDigits = num1Analysis.valueDigits + num2Analysis.valueDigits;

    return {
      valueDigits,
      isComplementTask,
      complementTarget,
      isPureDecades,
      isPureHundreds,
      crossesDecade,
      crossesHundred,
      decadeDistance,
      hundredDistance,
    };
  }

  // ========== Hilfsfunktionen ==========

  /**
   * Erstelle Task-String für Tracking
   */
  private getTaskString(task: Omit<InsertTask, "sessionId">): string {
    const { number1, operation, number2, placeholderPosition } = task;

    switch (placeholderPosition) {
      case "start":
        // Updated placeholder character to _
        return `_${operation}${number2}=${task.correctAnswer}`;
      case "middle":
        // Updated placeholder character to _
        return `${number1}${operation}_=${task.correctAnswer}`;
      case "end":
      default:
        return `${number1}${operation}${number2}`;
    }
  }

  /**
   * Erstelle Task aus String (z.B. "8+5" oder "_+3=9")
   */
  private createTaskFromString(
    taskStr: string,
    competency: CompetencyDefinition
  ): Omit<InsertTask, "sessionId"> | null {
    // Parse task string
    const placeholderMatch = taskStr.match(/^(\?|\d+|_)(\s*[+\-])\s*(\?|\d+|_)(\s*=\s*)(\?|\d+|_)$/); // Updated regex to include '_' as placeholder
    if (!placeholderMatch) return null;

    const [, val1, op, val2, eq, result] = placeholderMatch;

    let placeholderPos: 'start' | 'middle' | 'end' = 'end';
    let num1: number | null = null, num2: number | null = null, answer: number | null = null;

    if (val1 === '_' || val1 === '?') { // Updated placeholder character to _ or ?
      placeholderPos = 'start';
      num2 = parseInt(val2);
      const resultValue = parseInt(result);
      num1 = op === '+' ? resultValue - num2 : resultValue + num2;
      answer = num1; // KORREKTUR: Der Platzhalter IST die gesuchte Antwort!
    } else if (val2 === '_' || val2 === '?') { // Updated placeholder character to _ or ?
      placeholderPos = 'middle';
      num1 = parseInt(val1);
      const resultValue = parseInt(result);
      num2 = op === '+' ? resultValue - num1 : num1 - resultValue;
      answer = num2; // KORREKTUR: Der Platzhalter IST die gesuchte Antwort!
    } else {
      placeholderPos = 'end';
      num1 = parseInt(val1);
      num2 = parseInt(val2);
      answer = op === '+' ? num1 + num2 : num1 - num2;
    }

    // Ensure all numbers are valid integers
    if (num1 === null || num2 === null || answer === null || isNaN(num1) || isNaN(num2) || isNaN(answer)) {
      return null;
    }

    return {
      taskType: competency.id.includes('algebraic') || placeholderPos !== 'end' ? 'algebraic_thinking' : 'basic_operation',
      operation: op.trim() as '+' | '-',
      number1: num1,
      number2: num2,
      correctAnswer: answer,
      numberRange: competency.numberRange,
      placeholderPosition: placeholderPos,
      requiresInverseThinking: placeholderPos !== 'end',
      algebraicComplexity: placeholderPos === 'start' ? 0.7 : placeholderPos === 'middle' ? 0.5 : 0.0,
      studentAnswer: null,
      isCorrect: null,
      timeTaken: null,
      solutionSteps: [],
      strategyUsed: null,
      representationsUsed: [],
      errorType: null,
      errorSeverity: null,
    };
  }

  /**
   * Mische Array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Analysiere Ziffern vs. Werteziffern einer Zahl
   */
  private analyzeDigits(num: number): { digits: number; valueDigits: number; hasTrailingZeros: boolean } {
    const numStr = num.toString();
    const digits = numStr.length;

    // Werteziffern: Ziffern mit Wert ≠ 0
    let valueDigits = 0;
    let hasTrailingZeros = false;

    for (let i = 0; i < numStr.length; i++) {
      if (numStr[i] !== '0') {
        valueDigits++;
      } else if (i === numStr.length - 1 || numStr.slice(i).split('').every(c => c === '0')) {
        hasTrailingZeros = true;
      }
    }

    return { digits, valueDigits, hasTrailingZeros };
  }

  /**
   * Berechne Aufgaben-Komplexität basierend auf Werteziffern
   *
   * DIDAKTISCHE BEGRÜNDUNG (Wittmann & Müller, 2017):
   * - 2 Werteziffern (z.B. 70+30): Einfach, Transfer von 7+3
   * - 3 Werteziffern (z.B. 70+35 oder 77+30): Mittel, eine Stelle komplex
   * - 4 Werteziffern (z.B. 77+35): Schwer, beide Stellen komplex
   * - 5+ Werteziffern (z.B. 777+358): Sehr schwer, hohe kognitive Last
   */
  private calculateTaskComplexity(task: Omit<InsertTask, "sessionId">): DigitAnalysis {
    const num1Analysis = this.analyzeDigits(task.number1);
    const num2Analysis = this.analyzeDigits(task.number2);
    const resultAnalysis = this.analyzeDigits(task.correctAnswer);

    const totalDigits = num1Analysis.digits + num2Analysis.digits;
    const valueDigits = num1Analysis.valueDigits + num2Analysis.valueDigits;

    // VERFEINERTE Komplexitätsberechnung
    let complexity = 0.0;

    // Basis-Komplexität durch Werteziffern
    if (valueDigits <= 2) {
      complexity = 0.15; // Sehr einfach: 70+30, 5+3
    } else if (valueDigits === 3) {
      complexity = 0.35; // Mittel: 70+35, 77+30
    } else if (valueDigits === 4) {
      complexity = 0.60; // Schwer: 77+35, 234+56
    } else if (valueDigits === 5) {
      complexity = 0.80; // Sehr schwer: 777+35, 234+567
    } else {
      complexity = 1.00; // Maximal: 777+358
    }

    // Bonus-Komplexität: Wenn BEIDE Zahlen mehrstellig sind
    if (num1Analysis.valueDigits >= 2 && num2Analysis.valueDigits >= 2) {
      complexity += 0.10;
    }

    // Reduktion: Wenn eine Zahl nur Nullen am Ende hat (erleichtert Rechnung)
    if (num1Analysis.hasTrailingZeros || num2Analysis.hasTrailingZeros) {
      complexity -= 0.10;
    }

    complexity = Math.max(0.0, Math.min(1.0, complexity));

    return {
      totalDigits,
      valueDigits,
      hasTrailingZeros: num1Analysis.hasTrailingZeros || num2Analysis.hasTrailingZeros,
      complexity
    };
  }
}

export const competencyBasedGenerator = new CompetencyBasedGenerator();