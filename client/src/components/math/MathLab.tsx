import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FingerHands } from "./FingerHands";
import { PlaceValueBars } from "./PlaceValueBars";
import { LiveTwentyFrame } from "./LiveTwentyFrame";
import { LiveHundredField } from "./LiveHundredField";
import { LiveNumberLine } from "./LiveNumberLine";
import { ExtendedNumberLine } from "./ExtendedNumberLine";
import { LiveCounters } from "./LiveCounters";
import { SymbolicWithInput } from "./SymbolicWithInput";
import { SentenceBuilder } from "./SentenceBuilder";
import { Card, CardContent } from "@/components/ui/card";


interface RepresentationConfig {
  twentyFrame?: boolean;
  numberLine?: boolean;
  counters?: boolean;
  fingers?: boolean;
  symbolic?: boolean;
}

interface MathLabProps {
  taskNumber1: number;
  taskNumber2: number;
  taskOperation: '+' | '-';
  numberRange?: number;
  onSolutionComplete?: (answer: number, solutionSteps: any[]) => void;
  className?: string;
  representationConfig?: RepresentationConfig;
}

export function MathLab({
  taskNumber1,
  taskNumber2,
  taskOperation,
  numberRange = 20,
  onSolutionComplete,
  className,
  representationConfig
}: MathLabProps) {
  // Default: show all representations if not specified
  const config = representationConfig || {
    twentyFrame: true,
    numberLine: true,
    counters: true,
    fingers: true,
    symbolic: true,
  };
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctAnswer = taskOperation === '+'
    ? taskNumber1 + taskNumber2
    : taskNumber1 - taskNumber2;

  // Reset when task changes
  useEffect(() => {
    setAnswer("");
    setFeedback(null);
    setShowAnswer(false);
    setSteps([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [taskNumber1, taskNumber2, taskOperation]);

  const logStep = (action: string, details: any = {}) => {
    setSteps(prev => [...prev, {
      timestamp: Date.now(),
      action,
      details,
    }]);
  };

  const handleSubmit = () => {
    if (!answer) return;

    const numAnswer = parseInt(answer, 10);
    const isCorrect = numAnswer === correctAnswer;

    logStep('submit_answer', { answer: numAnswer });
    setShowAnswer(true);


    if (isCorrect) {
      setFeedback('correct');
      logStep('correct_answer', { answer: numAnswer });

      // Wait a moment to show feedback, then move to next task
      setTimeout(() => {
        onSolutionComplete?.(numAnswer, steps);
      }, 800);
    } else {
      setFeedback('incorrect');
      logStep('incorrect_answer', {
        answer: numAnswer,
        correctAnswer
      });
      // Clear input after showing error briefly, then show same task again
      setTimeout(() => {
        setAnswer('');
        setFeedback(null);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 2500);
    }
  };

  // Auto-submit on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isZR100 = numberRange === 100;

  return (
    <div className={cn("w-full h-full flex flex-col", className)} data-testid="math-lab">
      {/* Grid Layout: Compact and scalable */}
      <div className="grid grid-cols-12 gap-1 flex-1">
        {/* Top Row - 20er-Feld/100er-Feld (spans full width) - Only show if enabled */}
        {config.twentyFrame && (
          <div className="col-span-12 h-24">
            <div className="scale-[0.65] origin-top h-full flex items-start justify-center w-full">
              {isZR100 ? (
                <LiveHundredField
                  number1={taskNumber1}
                  number2={taskNumber2}
                  operation={taskOperation}
                />
              ) : (
                <LiveTwentyFrame
                  number1={taskNumber1}
                  number2={taskNumber2}
                  operation={taskOperation}
                />
              )}
            </div>
          </div>
        )}

        {/* Left Column - Counters - Only show if enabled */}
        {config.counters && (
          <div className="col-span-4 h-32">
            <div className="scale-[0.6] origin-top-left h-full flex items-start">
              <LiveCounters
                number1={taskNumber1}
                number2={taskNumber2}
                operation={taskOperation}
                numberRange={numberRange}
                showAnswer={showAnswer}
              />
            </div>
          </div>
        )}

        {/* Center Column - Symbolic Equation with Input - Only show if enabled */}
        {config.symbolic && (
          <div className="col-span-4 space-y-2">
            <SymbolicWithInput
              ref={inputRef}
              number1={taskNumber1}
              operation={taskOperation}
              number2={taskNumber2}
              value={answer}
              onChange={setAnswer}
              onKeyDown={handleKeyDown}
              disabled={feedback === 'correct'}
              showDecomposition={false}
              feedback={feedback}
            />

            {/* Submit/Clear Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleSubmit}
                disabled={!answer || feedback === 'correct'}
                className="min-w-[100px] h-9"
                data-testid="button-submit"
              >
                Prüfen
              </Button>

            {answer && feedback !== 'correct' && (
              <Button
                variant="outline"
                onClick={() => {
                  setAnswer('');
                  setFeedback(null);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="h-9"
                data-testid="button-clear"
              >
                Löschen
              </Button>
            )}
          </div>
          </div>
        )}

        {/* Right Column - FingerHands representation - Only show if enabled */}
        {config.fingers && (
        <div className="col-span-4 h-36">
          <div className="scale-[0.6] origin-top-right h-full flex items-start justify-end">
            {isZR100 ? (
              <PlaceValueBars
                number1={taskNumber1}
                number2={taskNumber2}
                operation={taskOperation}
              />
            ) : (
              <FingerHands
                number1={taskNumber1}
                number2={taskNumber2}
                operation={taskOperation}
              />
            )}
          </div>
        </div>
        )}

        {/* Bottom Row - Number Line (spans full width, larger) - Only show if enabled */}
        {config.numberLine && (
        <div className="col-span-12 h-20">
          <div className="scale-[0.8] origin-top h-full flex items-start justify-center w-full">
            <LiveNumberLine
              number1={taskNumber1}
              number2={taskNumber2}
              operation={taskOperation}
              showAnswer={showAnswer}
              numberRange={isZR100 ? 100 : 20}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}