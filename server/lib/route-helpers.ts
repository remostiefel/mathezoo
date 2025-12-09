import { ERROR_TYPE_LABELS, type ErrorType } from './error-constants';

// Helper functions for milestones
export function getMilestoneName(milestoneId: string): string {
    const names: Record<string, string> = {
        'first_steps': 'Erste Schritte',
        'subtraction_start': 'Subtraktions-Start',
        'magic_ten': 'Die magische 10',
        'into_twenties': 'In den Zwanziger',
        'backwards_twenty': 'Rückwärts im Zwanziger',
        'twenty_mix': 'Mix im Zwanziger',
        'speed_counts': 'Schnelligkeit zählt',
        'first_transition': 'Erste Überquerung',
        'transition_larger': 'Übergang mit Größeren',
        'backwards_ten': 'Rückwärts über die 10',
        'twenty_mastery': 'Zwanzig-Beherrschung',
        'hundred_entry': 'Einstieg Hundert',
        'decade_jumps': 'Dekaden-Sprünge',
        'complex_two_digit': 'Komplexe Zweistelligkeit',
        'hundred_transition': 'Hunderterraum mit Übergang'
    };
    return names[milestoneId] || 'Meilenstein';
}

export function getMilestoneIcon(stage: number): string {
    const icons = ['🦁', '🐘', '🦒', '🐯', '🐻', '🐼', '😾', '🦓', '🦏', '🦛', '🐊', '🦈', '🐋', '🦕', '🦖'];
    return icons[Math.min(stage - 1, icons.length - 1)] || '🎉';
}

// Helper function to get overall level from competency progress
export function calculateOverallLevel(competencyProgress: Record<string, any>): number {
    const competencies = Object.values(competencyProgress || {}) as any[];
    if (competencies.length === 0) return 0;

    const sorted = competencies.map(c => c.level || 0).sort((a, b) => b - a);
    const top5 = sorted.slice(0, Math.min(5, sorted.length));
    return top5.reduce((sum, level) => sum + level, 0) / top5.length;
}

// Placeholder for getErrorLabel function
export function getErrorLabel(errorType: ErrorType | string): string {
    return ERROR_TYPE_LABELS[errorType as string] || 'Unbekannter Fehlertyp';
}

// Helper to classify legacy errors without errorType
export function classifyLegacyError(task: any): string {
    if (task.studentAnswer == null) return 'other';
    const diff = task.studentAnswer - task.correctAnswer; // Signed difference
    const absDiff = Math.abs(diff);

    // Differentiate off_by_ten by direction
    if (diff === -10) return 'off_by_ten_minus'; // 10 zu wenig
    if (diff === 10) return 'off_by_ten_plus';   // 10 zu viel

    // Differentiate counting errors by direction
    if (diff === -1) return 'counting_error_minus_1'; // 1 zu wenig
    if (diff === 1) return 'counting_error_plus_1';   // 1 zu viel
    if (diff === -2) return 'counting_error_minus_2'; // 2 zu wenig
    if (diff === 2) return 'counting_error_plus_2';   // 2 zu viel

    if (absDiff === 5) return 'half_decade_error'; // This remains as it's a specific pattern

    if (task.studentAnswer === task.number1 || task.studentAnswer === task.number2) {
        return 'operand_confusion';
    }

    // Check for digit reversal
    const studentStr = String(task.studentAnswer);
    const correctStr = String(task.correctAnswer);
    if (studentStr.length === correctStr.length && studentStr.split('').reverse().join('') === correctStr) {
        return 'digit_reversal';
    }

    if (absDiff > 10) return 'calculation_error_major';
    return 'calculation_error_minor';
}

export function classifyLegacyErrorSeverity(task: any): string | 'minor' | 'moderate' | 'severe' {
    if (task.studentAnswer == null) return 'severe';
    const diff = Math.abs(task.correctAnswer - task.studentAnswer);
    if (diff <= 2) return 'minor';
    if (diff <= 10) return 'moderate';
    return 'severe';
}

// Placeholder for generatePedagogicalRecommendation function
export function generatePedagogicalRecommendation(errorType: ErrorType, severity: string, studentLevel: number): any {
    // Mock implementation - replace with actual logic
    const mockRecommendations: Record<string, any> = {
        'counting_error_minus_1': {
            errorLabel: ERROR_TYPE_LABELS['counting_error_minus_1'],
            didacticExplanation: 'Das Kind hat Schwierigkeiten, die richtige Anzahl beim Zählen zu erfassen.',
            developmentalGoal: 'Verbesserung der Zählgenauigkeit und des Verständnisses für Mengen.',
            gameRecommendations: [
                { gameId: 'count_challenge', gameName: 'Zähl-Champion', recommendedLevel: studentLevel, priority: 'high', reason: 'Fördert präzises Zählen.', focusArea: 'Genauigkeit', emoji: ' 🏅' },
                { gameId: 'number_line_jump', gameName: 'Zahlenstrahl-Sprünge', recommendedLevel: studentLevel, priority: 'medium', reason: 'Visualisiert Zählschritte.', focusArea: 'Zählschritte', emoji: ' 🚶' },
            ],
            materialSupport: ['Zwanzigerfeld', 'Rechenkette'],
            teacherScript: 'Bitte übe mit dem Kind, bei jedem Schritt genau eins weiterzuzählen und erst dann zu stoppen.'
        },
        'operation_confusion': {
            errorLabel: ERROR_TYPE_LABELS['operation_confusion'],
            didacticExplanation: 'Das Kind verwechselt Additions- und Subtraktionszeichen.',
            developmentalGoal: 'Klare Unterscheidung der Operationen und deren Bedeutung.',
            gameRecommendations: [
                { gameId: 'operation_match', gameName: 'Operations-Paare', recommendedLevel: studentLevel, priority: 'high', reason: 'Trainiert die Unterscheidung der Symbole.', focusArea: 'Symbolverständnis', emoji: ' 🧮' },
                { gameId: 'plus_minus_race', gameName: 'Rechen-Rennen', recommendedLevel: studentLevel, priority: 'medium', reason: 'Schnelle Zuordnung von Aufgabe und Operation.', focusArea: 'Operationen', emoji: ' 🏁' },
            ],
            materialSupport: ['Farbige Operationskarten', 'Handzeichen'],
            teacherScript: 'Lass uns die Plus- und Minus-Zeichen genau anschauen. Was bedeutet dieses Zeichen? Was passiert, wenn wir plus rechnen? Was, wenn wir minus rechnen?'
        },
        'place_value': {
            errorLabel: ERROR_TYPE_LABELS['place_value'],
            didacticExplanation: 'Das Verständnis für Zehner und Einer sowie deren Wertigkeit fehlt.',
            developmentalGoal: 'Festigung des Stellenwertprinzips.',
            gameRecommendations: [
                { gameId: 'place_value_builder', gameName: 'Stellenwert-Baumeister', recommendedLevel: studentLevel, priority: 'high', reason: 'Baut Zahlen aus Zehnern und Einern auf.', focusArea: 'Stellenwert', emoji: ' 🏗️' },
                { gameId: 'digit_sort', gameName: 'Ziffern-Sortierer', recommendedLevel: studentLevel, priority: 'medium', reason: 'Ordnet Ziffern den richtigen Stellen zu.', focusArea: 'Positionierung', emoji: ' 🔢' },
            ],
            materialSupport: ['Dienes-Material', 'Stellenwerttafel'],
            teacherScript: 'Schau dir die Zahl 37 an. Wie viele Zehner sind das? Wie viele Einer sind das? Lass uns das mit den Bausteinen legen.'
        },
        // Add more mock recommendations for other error types
        'default': {
            errorLabel: 'Allgemeiner Fehler',
            didacticExplanation: 'Es gibt grundlegende Schwierigkeiten im Rechenprozess.',
            developmentalGoal: 'Stärkung der mathematischen Grundlagen.',
            gameRecommendations: [
                { gameId: 'adaptive_practice', gameName: 'Flexi-Mathe', recommendedLevel: studentLevel, priority: 'medium', reason: 'Passt sich den individuellen Bedürfnissen an.', focusArea: 'Allgemeine Festigung', emoji: ' 🧠' },
            ],
            materialSupport: ['Grundlegende Rechenhilfen'],
            teacherScript: 'Lass uns gemeinsam eine Aufgabe lösen und jeden Schritt genau besprechen.'
        }
    };

    return mockRecommendations[errorType] || mockRecommendations['default'];
}
