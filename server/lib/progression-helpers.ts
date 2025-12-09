
import { errorAnalyzer } from "../errorAnalyzer";

// Helper method: Systematische Fehleranalyse mit neuem ErrorAnalyzer (6+1 Kategorien)
export const analyzeErrorSystematically = (result: any, studentAnswer: number) => {
    const analysis = errorAnalyzer.analyzeError(
        result.operation,
        result.number1,
        result.number2,
        result.correctAnswer,
        studentAnswer
    );

    return {
        errorType: analysis?.errorType || 'other', // Default to 'other' if unknown
        errorSeverity: analysis?.errorSeverity || 'moderate',
        description: analysis?.description || '',
        pedagogicalHint: analysis?.pedagogicalHint || ''
    };
};

// Helper method: Detect task pattern (not error pattern)
export const detectErrorPattern = (result: any): string => {
    const { operation, number1, number2, correctAnswer, studentAnswer } = result;
    const hasTransition = (operation === '+' && (number1 % 10) + (number2 % 10) >= 10) ||
        (operation === '-' && (number1 % 10) < (number2 % 10));

    if (hasTransition && operation === '+') return 'decade_transition_error';
    if (hasTransition && operation === '-') return 'decade_transition_error';
    if (operation === '-' && number1 <= 20) return 'subtraction_ZR20_error';
    if (operation === '+' && correctAnswer > 20) return 'addition_ZR20_error';
    if ((result as any).placeholderPosition === 'start') return 'inverse_thinking_start';
    if ((result as any).placeholderPosition === 'middle') return 'inverse_thinking_middle';

    // Check for digit reversal explicitly
    const studentStr = String(studentAnswer);
    const correctStr = String(correctAnswer);
    if (studentStr.length === correctStr.length && studentStr.split('').reverse().join('') === correctStr && studentStr !== correctStr) {
        return 'digit_reversal';
    }

    // Add more specific patterns based on error analysis
    if (Math.abs(correctAnswer - studentAnswer) === 1) return 'off_by_one';
    if (operation === '+' && (number1 % 10 + number2 % 10 >= 10 || Math.floor(number1 / 10) + Math.floor(number2 / 10) >= 1)) return 'decade_transition_error';
    if (operation === '-' && (number1 % 10 < number2 % 10 || Math.floor(number1 / 10) < Math.floor(number2 / 10))) return 'decade_transition_error';


    return 'other'; // Default to 'other' for unknown patterns
};

// Calculate overall level based on competencies
export const calculateOverallLevel = (prog: any): number => {
    const competencies = Object.values(prog.competencyProgress || {}) as any[];
    if (competencies.length === 0) return 0;

    const sorted = competencies.map(c => c.level || 0).sort((a, b) => b - a);
    const top5 = sorted.slice(0, Math.min(5, sorted.length));
    return top5.reduce((sum, level) => sum + level, 0) / top5.length;
};
