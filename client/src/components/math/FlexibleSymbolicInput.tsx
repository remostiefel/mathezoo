import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface FlexibleSymbolicInputProps {
  number1?: number | null;
  operator?: '+' | '-' | null;
  number2?: number | null;
  result?: number | null;
  
  placeholderPosition: 'number1' | 'operator' | 'number2' | 'result' | 'none';
  
  inputValue: string;
  operatorValue?: '+' | '-';
  
  onChange: (value: string) => void;
  onOperatorChange?: (op: '+' | '-') => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  
  disabled?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  showDecomposition?: boolean;
  className?: string;
}

export const FlexibleSymbolicInput = forwardRef<HTMLInputElement, FlexibleSymbolicInputProps>(
  ({
    number1,
    operator,
    number2,
    result,
    placeholderPosition,
    inputValue,
    operatorValue,
    onChange,
    onOperatorChange,
    onKeyDown,
    disabled = false,
    feedback = null,
    showDecomposition = false,
    className
  }, ref) => {
    
    const renderNumber = (value: number | null | undefined, placeholder: string, colorClass: string) => {
      // WICHTIG: Bei Platzhalter-Aufgaben immer die bekannten Zahlen anzeigen!
      // Nur wenn der Wert wirklich fehlt (nicht an dieser Position der Platzhalter ist), 
      // dann zeige die Zahl an.
      if (value === null || value === undefined) {
        return (
          <span className="text-muted-foreground text-4xl font-mono font-extrabold">
            {placeholder}
          </span>
        );
      }
      return (
        <span className={`text-6xl font-black ${colorClass}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em' }}>
          {value}
        </span>
      );
    };

    const renderOperator = () => {
      if (placeholderPosition === 'operator' && onOperatorChange) {
        return (
          <div className="flex gap-1" data-testid="operator-selector">
            <Button
              type="button"
              size="icon"
              variant={operatorValue === '+' ? 'default' : 'outline'}
              onClick={() => onOperatorChange('+')}
              disabled={disabled}
              className="h-12 w-12"
              data-testid="button-operator-plus"
            >
              <Plus className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={operatorValue === '-' ? 'default' : 'outline'}
              onClick={() => onOperatorChange('-')}
              disabled={disabled}
              className="h-12 w-12"
              data-testid="button-operator-minus"
            >
              <Minus className="h-6 w-6" />
            </Button>
          </div>
        );
      }

      if (operator === null || operator === undefined) {
        return (
          <span className="text-muted-foreground text-3xl font-mono">?</span>
        );
      }

      return (
        <span className="text-6xl font-black text-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em' }}>
          {operator}
        </span>
      );
    };

    const renderInputField = (position: 'number1' | 'number2' | 'result') => {
      if (placeholderPosition !== position) {
        return null;
      }

      const colorClass = position === 'number1' ? 'text-red-600' : 
                         position === 'number2' ? 'text-blue-600' : 
                         'text-green-600';
      
      const borderColorClass = position === 'number1' ? 'border-red-600' : 
                               position === 'number2' ? 'border-blue-600' : 
                               'border-green-600';
      
      return (
        <input
          ref={position === placeholderPosition ? ref : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => {
            const newVal = e.target.value.replace(/[^0-9]/g, '');
            onChange(newVal);
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className={cn(
            "h-24 w-48 text-center text-6xl font-black border-0 border-b-4 rounded-none bg-transparent",
            "focus:outline-none",
            "caret-primary transition-colors",
            colorClass,
            feedback === 'correct' && "border-green-500",
            feedback === 'incorrect' && "border-red-500",
            !feedback && borderColorClass
          )}
          placeholder=""
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', textDecoration: 'none', letterSpacing: '0.02em' }}
          data-testid={`input-${position}`}
        />
      );
    };

    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        {/* Main equation display */}
        <div className="flex items-center gap-3 bg-card border rounded-lg p-4">
          {/* Number 1 */}
          {placeholderPosition === 'number1' || placeholderPosition === 'start' ? (
            renderInputField('number1')
          ) : (
            renderNumber(number1, '?', 'text-red-600')
          )}

          {/* Operator */}
          {renderOperator()}

          {/* Number 2 */}
          {placeholderPosition === 'number2' || placeholderPosition === 'middle' ? (
            renderInputField('number2')
          ) : (
            renderNumber(number2, '?', 'text-blue-600')
          )}

          {/* Equals sign */}
          <span className="text-6xl font-black text-foreground" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em' }}>=</span>

          {/* Result */}
          {placeholderPosition === 'result' || placeholderPosition === 'end' ? (
            renderInputField('result')
          ) : (
            renderNumber(result, '?', 'text-green-600')
          )}
        </div>

        {/* Decomposition hint (optional) */}
        {showDecomposition && operator && number1 !== null && number2 !== null && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5 max-w-md">
            <p className="font-medium mb-0.5">Zerlegung:</p>
            {operator === '+' ? (
              <p>{number1} + {number2} = {(number1 || 0) + (number2 || 0)}</p>
            ) : (
              <p>{number1} - {number2} = {(number1 || 0) - (number2 || 0)}</p>
            )}
          </div>
        )}

        {/* Feedback messages */}
        {feedback === 'correct' && (
          <div className="text-sm font-medium text-green-600 dark:text-green-400" data-testid="feedback-correct">
            ✓ Richtig!
          </div>
        )}
        {feedback === 'incorrect' && (
          <div className="text-sm font-medium text-red-600 dark:text-red-400" data-testid="feedback-incorrect">
            ✗ Nicht ganz...
          </div>
        )}
      </div>
    );
  }
);

FlexibleSymbolicInput.displayName = "FlexibleSymbolicInput";
