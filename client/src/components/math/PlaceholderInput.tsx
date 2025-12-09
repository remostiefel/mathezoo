/**
 * PlaceholderInput - Component for algebraic thinking tasks
 *
 * Supports three placeholder positions:
 * - start:  _+2=6  (hardest, requires inverse thinking)
 * - middle: 3+_=7  (medium difficulty)
 * - end:    5-2=_  (standard, easiest)
 */

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { ErrorFeedback } from "./ErrorFeedback";


interface PlaceholderInputProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  placeholderPosition: 'start' | 'middle' | 'end' | 'none';
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  correctAnswer?: number;
  userAnswer?: number;
}

export const PlaceholderInput = forwardRef<HTMLInputElement, PlaceholderInputProps>(({
  number1,
  number2,
  operation,
  placeholderPosition,
  value,
  onChange,
  onSubmit,
  disabled = false,
  feedback = null,
  correctAnswer = 0,
  userAnswer = 0
}, ref) => {

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      onSubmit();
    }
  };

  const renderEquation = () => {
    const getInputColor = () => {
      if (placeholderPosition === 'start') return 'text-red-600';
      if (placeholderPosition === 'middle') return 'text-blue-600';
      return 'text-green-600';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value.replace(/[^0-9]/g, '');
      onChange(newVal);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      handleKeyPress(e);
    };

    const renderNumber = (num: number, position: string) => {
      const color = position === 'number1' ? 'text-red-600' : 'text-blue-600';
      return (
        <span
          className={cn(
            "font-black transition-colors",
            color
          )}
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            letterSpacing: '0.02em',
            fontSize: '4.5rem'
          }}
        >
          {num}
        </span>
      );
    };

    const inputField = (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cn(
          "h-24 w-40 text-center font-black border-0 border-b-4 rounded-none bg-transparent",
          "focus:outline-none caret-primary transition-colors",
          feedback === 'correct' && "border-green-500",
          feedback === 'incorrect' && "border-red-500",
          !feedback && "border-green-600",
          getInputColor()
        )}
        placeholder=""
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          fontSize: '4.5rem'
        }}
        data-testid={`input-placeholder-${placeholderPosition}`}
      />
    );

    const operationSymbol = operation === '+' ? '+' : '−';
    const result = operation === '+' ? number1 + number2 : number1 - number2;

    if (placeholderPosition === 'start') {
      // _+2=6
      return (
        <div className="flex items-center gap-2 text-5xl">
          {inputField}
          <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{operationSymbol}</span>
          <span className="text-blue-600 font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{number2}</span>
          <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>=</span>
          <span className="text-green-600 font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{result}</span>
        </div>
      );
    }

    if (placeholderPosition === 'middle') {
      // 3+_=7
      return (
        <div className="flex items-center gap-2 text-5xl">
          {renderNumber(number1, 'number1')}
          <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{operationSymbol}</span>
          {inputField}
          <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>=</span>
          <span className="text-green-600 font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{result}</span>
        </div>
      );
    }

    // end position (standard)
    // 5-2=_
    return (
      <div className="flex items-center gap-2 text-5xl">
        {renderNumber(number1, 'number1')}
        <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>{operationSymbol}</span>
        {renderNumber(number2, 'number2')}
        <span className="text-muted-foreground font-black" style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em', fontSize: '4.5rem' }}>=</span>
        {inputField}
      </div>
    );
  };

  const getDifficultyBadge = () => {
    if (placeholderPosition === 'none' || placeholderPosition === 'end') {
      return null;
    }

    const difficulty = placeholderPosition === 'start'
      ? { label: 'Sehr schwer', color: 'bg-red-500' }
      : { label: 'Herausfordernd', color: 'bg-orange-500' };

    return (
      <Badge className={`${difficulty.color} text-white gap-1`} data-testid="badge-difficulty">
        <Brain className="w-3 h-3" />
        {difficulty.label}
      </Badge>
    );
  };

  const getHint = () => {
    if (placeholderPosition === 'none' || placeholderPosition === 'end') {
      return null;
    }

    const hints: Record<string, string> = {
      start: operation === '+'
        ? "Tipp: Welche Zahl plus " + number2 + " ergibt " + (number1 + number2) + "?"
        : "Tipp: Welche Zahl minus " + number2 + " ergibt " + (number1 - number2) + "?",
      middle: "Tipp: Was fehlt noch, um von " + number1 + " auf " +
        (operation === '+' ? (number1 + number2) : (number1 - number2)) + " zu kommen?"
    };

    return (
      <div className="flex items-start gap-2 mt-3 p-3 bg-accent/20 rounded-md border border-accent" data-testid="text-hint">
        <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {hints[placeholderPosition]}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
      {/* Difficulty Badge */}
      {getDifficultyBadge()}

      {/* Equation */}
      <div className="flex justify-center">
        {renderEquation()}
      </div>

      {/* Error Feedback - shown when answer is incorrect */}
      {feedback === 'incorrect' && userAnswer !== undefined && (
        <ErrorFeedback
          number1={number1}
          number2={number2}
          operation={operation}
          userAnswer={userAnswer}
          correctAnswer={correctAnswer}
        />
      )}

      {/* Hint */}
      {getHint()}
    </div>
  );
});

PlaceholderInput.displayName = "PlaceholderInput";