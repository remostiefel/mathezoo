import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SymbolicNotationProps {
  number1?: number;
  number2?: number;
  operation: '+' | '-';
  result?: number;
  onResultChange?: (result: number) => void;
  showHints?: boolean;
  className?: string;
}

export function SymbolicNotation({ 
  number1,
  number2,
  operation,
  result,
  onResultChange,
  showHints = false,
  className 
}: SymbolicNotationProps) {
  const handleResultInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value.replace(/[^0-9]/g, '');
    if (onResultChange) {
      if (newVal === '') {
        onResultChange(undefined as any);
      } else {
        const numValue = parseInt(newVal);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
          onResultChange(numValue);
        }
      }
    }
  };

  const correctAnswer = operation === '+' 
    ? (number1 || 0) + (number2 || 0)
    : (number1 || 0) - (number2 || 0);

  const isCorrect = result !== undefined && result === correctAnswer;
  const isIncorrect = result !== undefined && result !== correctAnswer;

  return (
    <div className={cn("space-y-6", className)} data-testid="symbolic-notation">
      {/* Main Equation */}
      <div className="flex items-center justify-center gap-4 text-3xl font-mono font-bold">
        <span className={cn(
          number1 !== undefined && (number1 >= 10 ? "text-tens-zone" : "text-ones-zone")
        )}>
          {number1 ?? '?'}
        </span>

        <span className="text-discovery text-4xl">
          {operation}
        </span>

        <span className={cn(
          number2 !== undefined && (number2 >= 10 ? "text-tens-zone" : "text-ones-zone")
        )}>
          {number2 ?? '?'}
        </span>

        <span className="text-muted-foreground">=</span>

        {onResultChange ? (
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={result ?? ''}
            onChange={handleResultInput}
            className={cn(
              "w-20 text-center text-3xl font-mono font-bold h-16",
              isCorrect && "border-achievement text-achievement",
              isIncorrect && "border-discovery text-discovery"
            )}
            placeholder="_"
            data-testid="input-result"
          />
        ) : (
          <span className={cn(
            result !== undefined && (result >= 10 ? "text-tens-zone" : "text-ones-zone")
          )}>
            {result ?? '?'}
          </span>
        )}
      </div>

      {/* Feedback */}
      {isCorrect && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-achievement font-medium">
            ✓ Richtig!
          </p>
        </div>
      )}

      {isIncorrect && (
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-discovery font-medium">
            Lass uns das nochmal ansehen
          </p>
        </div>
      )}

      {/* Hints */}
      {showHints && number1 !== undefined && number2 !== undefined && (
        <div className="space-y-2 text-sm text-muted-foreground">
          {operation === '+' && number1 + number2 > 10 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">Tipp: Zehnerübergang</p>
              <p>Du kannst die {number2} zerlegen: {number2} = {10 - number1} + {number2 - (10 - number1)}</p>
              <p className="mt-1">Dann: {number1} + {10 - number1} = 10, und 10 + {number2 - (10 - number1)} = {number1 + number2}</p>
            </div>
          )}
        </div>
      )}

      {/* Synchronization Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-learning-teal animate-pulse" />
        <span>Synchronisiert mit allen Darstellungen</span>
      </div>
    </div>
  );
}
