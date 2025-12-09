import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface SymbolicWithInputProps {
  number1: number;
  operation: '+' | '-';
  number2: number;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  showDecomposition?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  className?: string;
}

export const SymbolicWithInput = forwardRef<HTMLInputElement, SymbolicWithInputProps>(
  ({
    number1,
    operation,
    number2,
    value,
    onChange,
    onKeyDown,
    disabled = false,
    showDecomposition = false,
    feedback = null,
    className
  }, ref) => {
    const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;
    const isTenTransition = operation === '+' && number1 < 10 && correctAnswer > 10;

    // Ten transition decomposition
    const toTen = 10 - number1;
    const remaining = number2 - toTen;

    return (
      <div className={cn("w-full", className)} data-testid="symbolic-with-input">
        <div className="bg-card rounded-lg border-2 p-6">
          {/* Main equation with input placeholder */}
          <div className="flex items-center justify-center gap-3 text-4xl font-extrabold font-mono">
            <span className="text-red-600" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{number1}</span>
            <span className="text-muted-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{operation}</span>
            <span className="text-blue-600" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>{number2}</span>
            <span className="text-muted-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>=</span>
            <div className="relative">
              <input
                ref={ref}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={(e) => {
                  const newVal = e.target.value.replace(/[^0-9]/g, '');
                  onChange(newVal);
                }}
                onKeyDown={onKeyDown}
                disabled={disabled}
                className={cn(
                  "w-40 h-20 text-center border-0 border-b-4 rounded-none bg-transparent",
                  "focus:outline-none",
                  "text-4xl font-extrabold font-mono text-green-600",
                  "transition-colors",
                  "caret-primary",
                  feedback === 'correct' && "border-green-500",
                  feedback === 'incorrect' && "border-red-500",
                  !feedback && "border-green-600",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                placeholder=""
                style={{ textDecoration: 'none', fontFamily: 'Arial, Helvetica, sans-serif' }}
                data-testid="input-symbolic"
                autoFocus
              />
            </div>
          </div>

          {/* Ten transition decomposition (if applicable and shown) */}
          {showDecomposition && isTenTransition && (
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="text-xs text-muted-foreground text-center uppercase tracking-wide">
                Zehnerübergang-Strategie
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {number1} + {toTen} = 10
                </span>
                <span className="text-2xl text-muted-foreground">→</span>
                <span className="px-4 py-2 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  10 + {remaining} = {correctAnswer}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

SymbolicWithInput.displayName = "SymbolicWithInput";