import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

interface VerticalArithmeticProps {
  number1: number;
  operation: '+' | '-';
  number2: number;
  result?: number;
  userInput?: string;
  onInputChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  showInput?: boolean;
  className?: string;
}

export const VerticalArithmetic = forwardRef<HTMLInputElement, VerticalArithmeticProps>(
  ({
    number1,
    operation,
    number2,
    result,
    userInput = '',
    onInputChange,
    onKeyDown,
    disabled = false,
    feedback = null,
    showInput = true,
    className
  }, ref) => {
    // Add null safety checks
    if (number1 === undefined || number1 === null || number2 === undefined || number2 === null) {
      return null;
    }

    const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;
    const maxDigits = Math.max(
      number1.toString().length,
      number2.toString().length,
      correctAnswer.toString().length
    );

    const formatNumber = (num: number) => {
      return num.toString().padStart(maxDigits, ' ');
    };

    return (
      <div className={cn("inline-flex flex-col items-end gap-1", className)} data-testid="vertical-arithmetic">
        {/* First number */}
        <div className="flex items-center gap-3">
          <span className="text-5xl font-bold font-mono text-red-600" style={{ fontFamily: 'Courier New, monospace' }}>
            {formatNumber(number1)}
          </span>
        </div>

        {/* Operation and second number */}
        <div className="flex items-center gap-3 border-b-4 border-foreground pb-2">
          <span className="text-5xl font-bold text-muted-foreground mr-2" style={{ fontFamily: 'Courier New, monospace' }}>
            {operation}
          </span>
          <span className="text-5xl font-bold font-mono text-blue-600" style={{ fontFamily: 'Courier New, monospace' }}>
            {formatNumber(number2)}
          </span>
        </div>

        {/* Result line */}
        <div className="flex items-center gap-3 mt-2">
          {showInput && onInputChange ? (
            <input
              ref={ref}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => {
                const newVal = e.target.value.replace(/[^0-9]/g, '');
                onInputChange(newVal);
              }}
              onKeyDown={onKeyDown}
              disabled={disabled}
              className={cn(
                "w-48 h-20 text-right pr-4 text-5xl font-bold font-mono",
                "border-0 border-b-4 rounded-none bg-transparent",
                "focus:outline-none focus:ring-0",
                "text-green-600",
                "caret-primary transition-colors",
                feedback === 'correct' && "border-green-500",
                feedback === 'incorrect' && "border-red-500",
                !feedback && "border-green-600"
              )}
              placeholder="_"
              style={{ fontFamily: 'Courier New, monospace' }}
              data-testid="input-vertical-result"
            />
          ) : (
            <span className="text-5xl font-bold font-mono text-green-600 w-48 text-right" style={{ fontFamily: 'Courier New, monospace' }}>
              {result !== undefined ? formatNumber(result) : '_'}
            </span>
          )}
        </div>

        {/* Feedback */}
        {feedback === 'correct' && (
          <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-2" data-testid="feedback-correct">
            ✓ Richtig!
          </div>
        )}
        {feedback === 'incorrect' && (
          <div className="text-sm font-medium text-red-600 dark:text-red-400 mt-2" data-testid="feedback-incorrect">
            ✗ Versuche es nochmal
          </div>
        )}
      </div>
    );
  }
);

VerticalArithmetic.displayName = "VerticalArithmetic";