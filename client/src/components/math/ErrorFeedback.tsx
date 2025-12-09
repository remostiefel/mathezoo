import { cn } from "@/lib/utils";

interface ErrorFeedbackProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  userAnswer: number;
  correctAnswer: number;
}

export function ErrorFeedback({
  number1,
  number2,
  operation,
  userAnswer,
  correctAnswer
}: ErrorFeedbackProps) {
  const operationSymbol = operation === '+' ? '+' : '−';
  
  return (
    <div className="flex flex-col gap-4 mt-6 p-4 bg-muted/20 rounded-lg border-2 border-muted">
      {/* Falsche Antwort - klein, roter Hintergrund */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-muted-foreground font-medium">Du hast getippt:</div>
        <div className="bg-red-500/20 dark:bg-red-950/40 border-2 border-red-500 dark:border-red-600 rounded-lg px-4 py-2">
          <div className="text-lg font-mono">
            <span className="text-red-600 font-black">{number1}</span>
            <span className="text-muted-foreground font-black mx-1">{operationSymbol}</span>
            <span className="text-red-600 font-black">{number2}</span>
            <span className="text-muted-foreground font-black mx-1">=</span>
            <span className="text-red-600 font-black">{userAnswer}</span>
          </div>
        </div>
        <div className="text-sm font-bold text-red-600">Das ist falsch.</div>
      </div>

      {/* Richtige Antwort - groß, fett, grüner Hintergrund */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-muted-foreground font-medium">Richtig ist:</div>
        <div className="bg-green-500/20 dark:bg-green-950/40 border-2 border-green-600 dark:border-green-700 rounded-lg px-6 py-3">
          <div style={{ fontSize: '2rem' }} className="font-mono font-black">
            <span className="text-green-600 dark:text-green-400">{number1}</span>
            <span className="text-muted-foreground mx-2">{operationSymbol}</span>
            <span className="text-green-600 dark:text-green-400">{number2}</span>
            <span className="text-muted-foreground mx-2">=</span>
            <span className="text-green-600 dark:text-green-400">{correctAnswer}</span>
          </div>
        </div>
      </div>

      {/* Hinweis */}
      <div className="text-center text-sm text-muted-foreground italic mt-2">
        Schau die Darstellung noch einmal an!
      </div>
    </div>
  );
}
