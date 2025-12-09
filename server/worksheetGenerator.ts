/**
 * WORKSHEET GENERATOR
 * 
 * Generiert strukturierte Arbeitsblätter mit operativen Päckchen nach Wittmann.
 * Erstellt "schöne Päckchen" mit progressiver Schwierigkeit und Reflexionsfragen.
 * 
 * Nutzt: OperativePackageGenerator, HomeworkThemeRecommender
 */

import type { HomeworkTheme } from './homeworkThemeRecommender';
import type { OperativePattern } from './operativePackageGenerator';
import { OperativePackageGenerator } from './operativePackageGenerator';
import type { InsertHomeworkTask } from '@shared/schema';

export interface WorksheetSection {
  id: string;
  title: string;
  description: string;
  pattern: OperativePattern;
  tasks: Array<{
    taskType: string;
    operation: '+' | '-' | '*' | '/';
    number1: number;
    number2: number;
    correctAnswer: number;
    placeholderPosition: 'none' | 'start' | 'middle' | 'end';
  }>;
  reflectionQuestion: string;
  learningGoal: string;
  expectedInsight: string;
}

export interface Worksheet {
  id: string;
  number: number; // Worksheet 1 of N
  title: string;
  sections: WorksheetSection[];
  totalTasks: number;
  estimatedTime: number; // minutes
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface WorksheetSet {
  homeworkSetId: string;
  title: string;
  description: string;
  worksheets: Worksheet[];
  includeSolutions: boolean;
  metadata: {
    themes: string[];
    totalTasks: number;
    estimatedTotalTime: number;
  };
}

export class WorksheetGenerator {
  private packageGenerator: OperativePackageGenerator;

  constructor() {
    this.packageGenerator = new OperativePackageGenerator();
  }

  /**
   * Baut operative Päckchen um konkrete Fehleraufgaben herum
   * 
   * Generiert verwandte Aufgaben:
   * - Original-Fehleraufgabe (z.B. 5+_=12)
   * - Tauschaufgabe (_+5=12 oder 7+5=12)
   * - Umkehraufgaben (12-5=_, 12-7=_)
   * - Platzhalter-Varianten an allen Positionen
   */
  private buildPackageAroundFailedTask(
    failedTask: {
      operation: '+' | '-';
      number1: number;
      number2: number;
      correctAnswer: number;
      errorType: string;
      placeholderPosition: 'none' | 'start' | 'middle' | 'end';
    },
    packageSize: number = 6
  ): any[] {
    const tasks: any[] = [];
    const { operation, number1, number2 } = failedTask;
    const sum = operation === '+' ? number1 + number2 : failedTask.correctAnswer;
    
    // Nutze Originalwerte für die verwandten Aufgaben
    const addend1 = operation === '+' ? number1 : failedTask.correctAnswer;
    const addend2 = operation === '+' ? number2 : number2;
    const result = operation === '+' ? sum : number1;

    if (operation === '+') {
      // Beispiel: 6+4=10 (Fehler gemacht)
      // Verwandte: _+4=10, 4+_=10, 10-4=_, 10-_=6, 4+6=10
      
      // 1. Original mit Platzhalter am Ende: 6+4=_
      if (packageSize >= 1) {
        tasks.push({
          taskType: 'error_correction',
          operation: '+',
          number1: addend1,
          number2: addend2,
          correctAnswer: sum,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }

      // 2. Platzhalter VORNE: _+4=10
      if (packageSize >= 2) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '+',
          number1: addend1,
          number2: addend2,
          correctAnswer: sum,
          numberRange: 100,
          placeholderPosition: 'start',
        });
      }

      // 3. Platzhalter MITTE: 6+_=10
      if (packageSize >= 3) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '+',
          number1: addend1,
          number2: addend2,
          correctAnswer: sum,
          numberRange: 100,
          placeholderPosition: 'middle',
        });
      }

      // 4. Umkehraufgabe: 10-4=_
      if (packageSize >= 4) {
        tasks.push({
          taskType: 'inverse',
          operation: '-',
          number1: sum,
          number2: addend2,
          correctAnswer: addend1,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }

      // 5. Umkehraufgabe mit Platzhalter MITTE: 10-_=6
      if (packageSize >= 5) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '-',
          number1: sum,
          number2: addend1,
          correctAnswer: addend2,
          numberRange: 100,
          placeholderPosition: 'middle',
        });
      }

      // 6. Tauschaufgabe: 4+6=10
      if (packageSize >= 6 && addend1 !== addend2) {
        tasks.push({
          taskType: 'exchange',
          operation: '+',
          number1: addend2,
          number2: addend1,
          correctAnswer: sum,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }

    } else {
      // Bei Subtraktion: 12-5=7 (Fehler gemacht)
      // Verwandte: 12-_=7, _+5=12, 7+5=12, 7+_=12
      
      const minuend = number1;
      const subtrahend = number2;
      const difference = failedTask.correctAnswer;

      // 1. Original: 12-5=_
      if (packageSize >= 1) {
        tasks.push({
          taskType: 'error_correction',
          operation: '-',
          number1: minuend,
          number2: subtrahend,
          correctAnswer: difference,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }

      // 2. Platzhalter MITTE: 12-_=7
      if (packageSize >= 2) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '-',
          number1: minuend,
          number2: subtrahend,
          correctAnswer: difference,
          numberRange: 100,
          placeholderPosition: 'middle',
        });
      }

      // 3. Umkehraufgabe mit Platzhalter VORNE: _+5=12
      if (packageSize >= 3) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '+',
          number1: difference,
          number2: subtrahend,
          correctAnswer: minuend,
          numberRange: 100,
          placeholderPosition: 'start',
        });
      }

      // 4. Umkehraufgabe Addition: 7+5=12
      if (packageSize >= 4) {
        tasks.push({
          taskType: 'inverse',
          operation: '+',
          number1: difference,
          number2: subtrahend,
          correctAnswer: minuend,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }

      // 5. Umkehraufgabe mit Platzhalter MITTE: 7+_=12
      if (packageSize >= 5) {
        tasks.push({
          taskType: 'inverse_thinking',
          operation: '+',
          number1: difference,
          number2: subtrahend,
          correctAnswer: minuend,
          numberRange: 100,
          placeholderPosition: 'middle',
        });
      }

      // 6. Tauschaufgabe: 5+7=12
      if (packageSize >= 6 && difference !== subtrahend) {
        tasks.push({
          taskType: 'exchange',
          operation: '+',
          number1: subtrahend,
          number2: difference,
          correctAnswer: minuend,
          numberRange: 100,
          placeholderPosition: 'end',
        });
      }
    }

    // Begrenze auf packageSize
    return tasks.slice(0, packageSize);
  }

  /**
   * Generiert vollständige Hausaufgaben-Sets
   */
  async generate(params: {
    themes: HomeworkTheme[];
    worksheetCount: number;
    tasksPerWorksheet: number;
    title: string;
    description?: string;
    includeSolutions?: boolean;
    studentId?: string; // NEU: Für Fehler-Integration
    includeFailedTasks?: boolean; // NEU: Fehleraufgaben integrieren
  }): Promise<WorksheetSet> {
    const { 
      themes, 
      worksheetCount, 
      tasksPerWorksheet, 
      title, 
      description, 
      includeSolutions = true,
      studentId,
      includeFailedTasks = true
    } = params;

    // NEU: Hole fehlgeschlagene Aufgaben des Schülers
    let failedTasks: any[] = [];
    if (studentId && includeFailedTasks) {
      const { homeworkAnalyzer } = await import('./homeworkAnalyzer');
      failedTasks = await homeworkAnalyzer.getFailedTasksForHomework(studentId, {
        maxTasks: Math.min(10, Math.floor(tasksPerWorksheet / 3)),
        errorTypes: themes.flatMap(t => t.addressedErrors),
      });
    }

    if (themes.length === 0) {
      throw new Error('At least one theme is required');
    }

    // Count total patterns across all themes
    const totalPatterns = themes.reduce((sum, theme) => sum + theme.operativePatterns.length, 0);

    if (totalPatterns === 0) {
      throw new Error('At least one operative pattern is required across all themes');
    }

    // If more patterns than tasks, limit to tasksPerWorksheet patterns
    const effectiveThemes = this.selectEffectiveThemes(themes, tasksPerWorksheet);
    const effectiveTotalPatterns = effectiveThemes.reduce((sum, theme) => sum + theme.operativePatterns.length, 0);

    // Ensure at least 1 task per pattern, distribute remaining tasks proportionally
    const minTasksPerPattern = 1;
    const remainingTasks = Math.max(0, tasksPerWorksheet - effectiveTotalPatterns);
    const tasksPerPattern = Math.floor(remainingTasks / effectiveTotalPatterns) + minTasksPerPattern;

    // 1. Verteile Themen auf Arbeitsblätter
    const worksheets: Worksheet[] = [];

    for (let i = 0; i < worksheetCount; i++) {
      const worksheet = this.generateWorksheet({
        number: i + 1,
        themes: effectiveThemes,
        tasksPerPattern,
        totalTasks: tasksPerWorksheet,
        failedTasks, // NEU: Fehlende Aufgaben übergeben
        currentWorksheetIndex: i, // NEU: Index des aktuellen Arbeitsblatts
      });
      worksheets.push(worksheet);
    }

    // 2. Berechne Metadaten
    const totalTasks = worksheets.reduce((sum, ws) => sum + ws.totalTasks, 0);
    const estimatedTotalTime = worksheets.reduce((sum, ws) => sum + ws.estimatedTime, 0);

    return {
      homeworkSetId: `ws-${Date.now()}`,
      title: title || 'MatheZoo Hausaufgaben',
      description: description || 'Operative Päckchen zur Übung',
      worksheets,
      includeSolutions: includeSolutions,
      metadata: {
        themes: themes.map(t => t.name),
        totalTasks,
        estimatedTotalTime,
      },
    };
  }

  /**
   * Wählt effektive Themes basierend auf Task-Budget
   * Falls mehr Patterns als Tasks: Reduziere auf höchstpriorisierte Themes
   */
  private selectEffectiveThemes(themes: HomeworkTheme[], tasksPerWorksheet: number): HomeworkTheme[] {
    const totalPatterns = themes.reduce((sum, theme) => sum + theme.operativePatterns.length, 0);

    if (totalPatterns <= tasksPerWorksheet) {
      return themes; // Alle Themes passen
    }

    // Sortiere nach Priorität und nimm so viele wie möglich
    const sortedThemes = [...themes].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const selected: HomeworkTheme[] = [];
    let patternsCount = 0;

    for (const theme of sortedThemes) {
      if (patternsCount + theme.operativePatterns.length <= tasksPerWorksheet) {
        selected.push(theme);
        patternsCount += theme.operativePatterns.length;
      } else {
        // Versuche, Theme mit reduzierten Patterns hinzuzufügen
        const remainingSlots = tasksPerWorksheet - patternsCount;
        if (remainingSlots > 0) {
          const reducedTheme = {
            ...theme,
            operativePatterns: theme.operativePatterns.slice(0, remainingSlots),
          };
          selected.push(reducedTheme);
        }
        break;
      }
    }

    return selected.length > 0 ? selected : [sortedThemes[0]]; // Mindestens 1 Theme
  }

  /**
   * Generiert ein einzelnes Arbeitsblatt
   */
  private generateWorksheet(params: {
    number: number;
    themes: HomeworkTheme[];
    tasksPerPattern: number;
    totalTasks: number;
    failedTasks: any[]; // NEU
    currentWorksheetIndex: number; // NEU
  }): Worksheet {
    const { number, themes, tasksPerPattern, totalTasks, failedTasks, currentWorksheetIndex } = params;

    const sections: WorksheetSection[] = [];
    let taskCount = 0;
    let difficultySum = 0;
    let addedErrorPackage = false;
    const REQUIRED_TASKS = 45; // HARD REQUIREMENT: Always 45 tasks!

    // 1. Generiere Sections für jedes Theme
    themes.forEach((theme, themeIndex) => {
      theme.operativePatterns.forEach((pattern: OperativePattern, patternIndex) => {
        if (taskCount >= totalTasks) return; // Limit erreicht

        // Berechne Paket-Länge: Mindestens 1, maximal tasksPerPattern
        const packageLength = Math.max(
          1, // Mindestens 1 Aufgabe
          Math.min(
            tasksPerPattern,
            totalTasks - taskCount // Verbleibende Aufgaben
          )
        );

        // Wähle Basis-Aufgabe basierend auf Theme
        const baseTask = this.selectBaseTask(theme, pattern);

        try {
          // Erstelle Basis-Paket mit verschiedenen Platzhalter-Positionen
          const operativePackage = this.packageGenerator.generate(
            { 
              number1: baseTask.number1, 
              number2: baseTask.number2, 
              operation: baseTask.operation,
              placeholderPosition: 'end'
            },
            pattern,
            packageLength
          );

          // WICHTIG: Streue verschiedene Platzhalter-Positionen ein
          // Jedes 3. Task bekommt start, jedes 4. middle, Rest end
          operativePackage.tasks = operativePackage.tasks.map((task, idx) => {
            if (idx % 3 === 0) {
              return { ...task, placeholderPosition: 'start' as const };
            } else if (idx % 4 === 0) {
              return { ...task, placeholderPosition: 'middle' as const };
            } else {
              return { ...task, placeholderPosition: 'end' as const };
            }
          });

          const section: WorksheetSection = {
            id: `section-${number}-${theme.id}-${pattern}`,
            title: operativePackage.didacticFocus || `${theme.name} - ${pattern}`,
            description: theme.description,
            pattern,
            tasks: operativePackage.tasks,
            reflectionQuestion: operativePackage.reflectionQuestion || '',
            learningGoal: operativePackage.learningGoal,
            expectedInsight: operativePackage.expectedInsight,
          };

          sections.push(section);
          taskCount += section.tasks.length;

          // Schwierigkeit einschätzen
          difficultySum += this.estimatePatternDifficulty(pattern);

          // NEU: Fehleraufgaben-Päckchen hinzufügen, wenn noch Platz ist und es das erste Arbeitsblatt ist
          if (!addedErrorPackage && failedTasks.length > 0 && sections.length === 1 && taskCount < totalTasks) {
            const remainingSlots = totalTasks - taskCount;
            // Nimm max. 5 Fehleraufgaben, aber nur so viele wie noch Platz ist
            const errorTasksForTheme = failedTasks.filter(ft => 
              theme.addressedErrors.includes(ft.errorType as any)
            ).slice(0, Math.min(5, remainingSlots));

            if (errorTasksForTheme.length > 0) {
              const errorPackageTasks = errorTasksForTheme.flatMap(ft => 
                this.buildPackageAroundFailedTask(ft, 3) // Baue Päckchen mit 3 Aufgaben
              );
              
              // Nur hinzufügen, wenn Päckchen nicht zu groß wird
              if (taskCount + errorPackageTasks.length <= totalTasks) {
                sections.push({
                  id: `section-${number}-errors`,
                  title: '🎯 Deine Übungsaufgaben (aus früheren Fehlern)',
                  description: 'Diese Aufgaben helfen dir, frühere Schwierigkeiten zu meistern.',
                  pattern: 'error_correction' as any, // Typ kann angepasst werden
                  tasks: errorPackageTasks,
                  reflectionQuestion: 'Was hast du gelernt? Welche Strategie hilft dir bei diesen Aufgaben?',
                  learningGoal: 'Fehler verstehen und korrigieren',
                  expectedInsight: 'Ich kann aus meinen Fehlern lernen und es beim nächsten Mal richtig machen.',
                });
                taskCount += errorPackageTasks.length;
                addedErrorPackage = true; // Nur einmal pro Arbeitsblatt
              }
            }
          }
        } catch (error) {
          console.error(`Error generating package for pattern ${pattern}:`, error);
        }
      });
    });

    // 2. Füge ggf. noch ein Fehler-Päckchen hinzu, falls Platz ist
    if (!addedErrorPackage && failedTasks.length > 0 && taskCount < totalTasks) {
      const remainingSlots = totalTasks - taskCount;
      const errorTasks = failedTasks.slice(0, Math.min(5, remainingSlots)); // Nimm die ersten 5 verfügbaren Fehleraufgaben

      if (errorTasks.length > 0) {
        const errorPackageTasks = errorTasks.flatMap(ft => 
          this.buildPackageAroundFailedTask(ft, 3)
        );

        if (taskCount + errorPackageTasks.length <= totalTasks) {
          sections.push({
            id: `section-${number}-errors-fallback`,
            title: '🎯 Weitere Übungsaufgaben (aus früheren Fehlern)',
            description: 'Diese Aufgaben helfen dir, frühere Schwierigkeiten zu meistern.',
            pattern: 'error_correction' as any,
            tasks: errorPackageTasks,
            reflectionQuestion: 'Was hast du gelernt? Welche Strategie hilft dir bei diesen Aufgaben?',
            learningGoal: 'Fehler verstehen und korrigieren',
            expectedInsight: 'Ich kann aus meinen Fehlern lernen und es beim nächsten Mal richtig machen.',
          });
          taskCount += errorPackageTasks.length;
        }
      }
    }

    // 🚨 CRITICAL: Fill up to exactly 45 tasks if we're short
    if (taskCount < REQUIRED_TASKS) {
      const missingTasks = REQUIRED_TASKS - taskCount;
      console.log(`⚠️ Only ${taskCount} tasks generated, filling up ${missingTasks} tasks to reach ${REQUIRED_TASKS}`);
      
      // Generate standard filler tasks (simple additions/subtractions)
      const fillerTasks: any[] = [];
      for (let i = 0; i < missingTasks; i++) {
        const operation = Math.random() > 0.5 ? '+' : '-';
        let num1, num2, answer;
        
        if (operation === '+') {
          num1 = Math.floor(Math.random() * 9) + 1; // 1-9
          num2 = Math.floor(Math.random() * 9) + 1; // 1-9
          answer = num1 + num2;
        } else {
          num1 = Math.floor(Math.random() * 15) + 5; // 5-19
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to (num1-1)
          answer = num1 - num2;
        }
        
        // Vary placeholder positions
        const positions = ['end', 'start', 'middle'] as const;
        const placeholderPosition = positions[i % 3];
        
        fillerTasks.push({
          taskType: 'standard',
          operation,
          number1: num1,
          number2: num2,
          correctAnswer: answer,
          numberRange: 20,
          placeholderPosition,
        });
      }
      
      // Add as a new section
      sections.push({
        id: `section-${number}-filler`,
        title: 'Zusätzliche Übungen',
        description: 'Weitere Aufgaben zum Üben',
        pattern: 'plus_minus_one' as any,
        tasks: fillerTasks,
        reflectionQuestion: 'Welche Aufgaben waren am einfachsten?',
        learningGoal: 'Sicheres Rechnen im Zahlenraum 20',
        expectedInsight: 'Ich kann auch verschiedene Aufgaben sicher lösen.',
      });
      
      taskCount += fillerTasks.length;
    }

    // Berechne durchschnittliche Schwierigkeit
    const avgDifficulty = sections.length > 0 ? difficultySum / sections.length : 0;
    let difficultyLevel: 'easy' | 'medium' | 'hard';
    if (avgDifficulty < 2) difficultyLevel = 'easy';
    else if (avgDifficulty < 4) difficultyLevel = 'medium';
    else difficultyLevel = 'hard';

    // Schätze Zeit (1-2 Minuten pro Aufgabe)
    const estimatedTime = Math.ceil(taskCount * 1.5);

    console.log(`✅ Worksheet ${number} completed with ${taskCount} tasks (required: ${REQUIRED_TASKS})`);

    return {
      id: `worksheet-${number}`,
      number,
      title: `Arbeitsblatt ${number}`,
      sections,
      totalTasks: taskCount,
      estimatedTime,
      difficultyLevel,
    };
  }

  /**
   * Wählt eine passende Basis-Aufgabe für ein Theme und Pattern
   */
  private selectBaseTask(
    theme: HomeworkTheme,
    pattern: OperativePattern
  ): { number1: number; number2: number; operation: '+' | '-' } {
    const numberRange = theme.numberRange;

    // Wähle Zahlen basierend auf Pattern und Zahlenraum
    let number1: number, number2: number;

    // Standardwerte, falls keine spezielle Logik greift
    number1 = Math.floor(Math.random() * 8) + 3; // 3-10
    number2 = Math.floor(Math.random() * 8) + 3;

    if (numberRange <= 20) {
      // Kleine Zahlen für ZR20
      if (pattern === 'core_task_doubling') {
        number1 = 5;
        number2 = 5;
      } else if (pattern === 'core_task_to_ten') {
        number1 = 6;
        number2 = 4;
      } else if (pattern === 'decomposition') {
        number1 = 8;
        number2 = 5;
      } else {
        number1 = Math.floor(Math.random() * 8) + 3; // 3-10
        number2 = Math.floor(Math.random() * 8) + 3;
      }
    } else if (numberRange <= 100) {
      // Mittlere Zahlen für ZR100
      number1 = Math.floor(Math.random() * 30) + 20; // 20-50
      number2 = Math.floor(Math.random() * 20) + 5; // 5-25
    } else {
      // Große Zahlen für ZR1000
      number1 = Math.floor(Math.random() * 200) + 100; // 100-300
      number2 = Math.floor(Math.random() * 100) + 20; // 20-120
    }

    // Stelle sicher, dass die Zahlen Sinn ergeben (z.B. bei Subtraktion keine negativen Ergebnisse, falls gewünscht)
    // Hier nur ein einfaches Beispiel, komplexere Logik wäre nötig für z.B. Subtraktion
    if (pattern.includes('minus') && number1 < number2) {
      [number1, number2] = [number2, number1]; // Tausche, damit number1 >= number2
    }

    return {
      number1,
      number2,
      operation: '+', // Standardoperation, könnte dynamischer sein
    };
  }

  /**
   * Geschätzter Schwierigkeitsgrad eines Patterns (1-5)
   */
  private estimatePatternDifficulty(pattern: OperativePattern): number {
    const difficultyMap: Record<OperativePattern, number> = {
      'constant_sum': 2,
      'constant_difference': 2,
      'plus_minus_one': 1,
      'exchange': 1,
      'inverse': 4,
      'decade_steps': 3,
      'core_task_doubling': 2,
      'core_task_to_ten': 2,
      'analogy_place_value': 3,
      'derivation_multi_path': 4,
      'associative_grouping': 4,
      'distributive_decomposition': 5,
    };

    return difficultyMap[pattern] || 3;
  }

  /**
   * Deutscher Name für Pattern
   */
  private getPatternName(pattern: OperativePattern): string {
    const nameMap: Record<OperativePattern, string> = {
      'constant_sum': 'Summen-Konstanz',
      'constant_difference': 'Differenz-Konstanz',
      'plus_minus_one': 'Nachbar-Aufgaben',
      'exchange': 'Tausch-Aufgaben',
      'inverse': 'Umkehr-Aufgaben',
      'decade_steps': 'Zehner-Schritte',
      'core_task_doubling': 'Kernaufgaben Verdopplung',
      'core_task_to_ten': 'Partnerzahlen zur 10',
      'analogy_place_value': 'Analogie-Päckchen',
      'derivation_multi_path': 'Herleite-Päckchen',
      'associative_grouping': 'Geschicktes Gruppieren',
      'distributive_decomposition': 'Geschicktes Zerlegen',
    };

    return nameMap[pattern] || pattern;
  }

  /**
   * Konvertiert Worksheet zu Insert-fähigen HomeworkTasks
   */
  convertToHomeworkTasks(
    worksheetSet: WorksheetSet,
    homeworkSetId: string
  ): InsertHomeworkTask[] {
    const tasks: InsertHomeworkTask[] = [];
    let globalOrder = 0;

    worksheetSet.worksheets.forEach((worksheet) => {
      worksheet.sections.forEach((section, sectionIndex) => {
        const packageId = `pkg-${worksheet.number}-${sectionIndex}`;

        section.tasks.forEach((task, taskIndex) => {
          tasks.push({
            homeworkSetId,
            taskType: task.taskType,
            operation: task.operation,
            number1: task.number1,
            number2: task.number2,
            correctAnswer: task.correctAnswer,
            numberRange: 20, // Default, könnte dynamisch sein
            placeholderPosition: task.placeholderPosition,
            packageId,
            packagePattern: section.pattern,
            packagePosition: taskIndex + 1,
            reflectionQuestion: taskIndex === section.tasks.length - 1 ? section.reflectionQuestion : null,
            displayOrder: globalOrder++,
            worksheetNumber: worksheet.number,
            sectionTitle: section.title,
            studentAnswer: null,
            isCorrect: null,
            attemptedAt: null,
          });
        });
      });
    });

    return tasks;
  }
}

// Export singleton instance
export const worksheetGenerator = new WorksheetGenerator();