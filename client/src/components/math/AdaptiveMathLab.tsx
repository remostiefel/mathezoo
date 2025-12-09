import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FingerHands } from "./FingerHands";
import { PlaceValueBars } from "./PlaceValueBars";
import { LiveTwentyFrame } from "./LiveTwentyFrame";
import { HundredField } from "./HundredField";
import { LiveHundredField } from "./LiveHundredField";
import { LiveNumberLine } from "./LiveNumberLine";
import { ExtendedNumberLine } from "./ExtendedNumberLine";
import { LiveCounters } from "./LiveCounters";
import { FlexibleSymbolicInput } from "./FlexibleSymbolicInput";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { DiceDisplay, DiceGroup } from "./DiceDisplay";
import { motion } from 'framer-motion';
import { LiveSymbolic } from "./LiveSymbolic";
import { PlaceholderInput } from "./PlaceholderInput";


interface RepresentationConfig {
  twentyFrame: boolean;
  numberLine: boolean;
  counters: boolean;
  fingers: boolean;
  symbolic: boolean;
}

interface AdaptiveMathLabProps {
  taskNumber1?: number | null;
  taskNumber2?: number | null;
  taskOperation?: '+' | '-' | null;
  taskResult?: number | null;
  numberRange?: number;

  representationConfig: RepresentationConfig;

  placeholderInSymbolic?: 'number1' | 'operator' | 'number2' | 'result' | 'none';

  onSolutionComplete?: (answer: {
    number1?: number;
    operator?: '+' | '-';
    number2?: number;
    result?: number;
  }, solutionSteps: any[]) => void;

  className?: string;
  trainingMode?: 'adaptive' | 'custom' | 'blind';
}

export function AdaptiveMathLab({
  taskNumber1,
  taskNumber2,
  taskOperation,
  taskResult,
  numberRange = 20,
  representationConfig,
  placeholderInSymbolic = 'result',
  onSolutionComplete,
  className,
  trainingMode = 'adaptive',
}: AdaptiveMathLabProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [operatorValue, setOperatorValue] = useState<'+' | '-'>('+');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [lastUserAnswer, setLastUserAnswer] = useState<number>(0);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [errorUserAnswer, setErrorUserAnswer] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for blind/custom mode input
  const [inputNumber1, setInputNumber1] = useState('');
  const [inputNumber2, setInputNumber2] = useState('');
  const [inputOperation, setInputOperation] = useState<'+' | '-' | null>(null);
  const [inputResult, setInputResult] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [showBlindContinue, setShowBlindContinue] = useState(false);

  const num1 = taskNumber1 ?? 0;
  const num2 = taskNumber2 ?? 0;
  const op = taskOperation ?? '+';

  // CRITICAL: Berechne das tatsächliche Ergebnis der Rechnung
  const actualResult = op === '+' ? num1 + num2 : num1 - num2;

  // CRITICAL: Determine the correct answer based on placeholder position
  // - If placeholder is at START (number1 missing): answer = number1
  // - If placeholder is at MIDDLE (number2 missing): answer = number2
  // - If placeholder is at END (result missing): answer = actualResult
  let correctAnswer: number;

  if (placeholderInSymbolic === 'number1' || placeholderInSymbolic === 'start') {
    // Missing first number: answer IS number1
    correctAnswer = num1;

    // VALIDATION: Verify num1 + num2 = actualResult or num1 - num2 = actualResult
    const verifyResult = op === '+' ? num1 + num2 : num1 - num2;
    if (verifyResult !== actualResult) {
      console.error(`🚨 PLACEHOLDER START VALIDATION ERROR: ${num1} ${op} ${num2} should be ${verifyResult}, not ${actualResult}`);
    }
  } else if (placeholderInSymbolic === 'number2' || placeholderInSymbolic === 'middle') {
    // Missing second number: answer IS number2
    correctAnswer = num2;

    // VALIDATION: Verify num1 + num2 = actualResult or num1 - num2 = actualResult
    const verifyResult = op === '+' ? num1 + num2 : num1 - num2;
    if (verifyResult !== actualResult) {
      console.error(`🚨 PLACEHOLDER MIDDLE VALIDATION ERROR: ${num1} ${op} ${num2} should be ${verifyResult}, not ${actualResult}`);
    }
  } else {
    // Missing result: answer IS the calculated result
    correctAnswer = actualResult;
  }

  // Bei Platzhalter-Aufgaben (start/middle) muss das Ergebnis bekannt sein!
  const resultToShow = (placeholderInSymbolic === 'number1' || placeholderInSymbolic === 'number2')
    ? (op === '+' ? num1 + num2 : num1 - num2)
    : null;

  // Determine if solution should be hidden based on placeholder
  // WICHTIG: Bei Platzhaltern IMMER die Lösung in den Visualisierungen zeigen (Level 5)!
  const hideSolutionInRepresentations = false; // Immer alle Hilfen zeigen bei Platzhaltern

  useEffect(() => {
    console.log('AdaptiveMathLab effect:', {
      trainingMode,
      representationConfig,
      taskNumber1,
      taskNumber2,
      taskOperation
    });
    setInputValue("");
    setOperatorValue('+');
    setFeedback(null);
    setShowAnswer(false);
    setSteps([]);
    // Only show task input at the start of a new task in blind mode (not custom)
    const shouldShowInput = trainingMode === 'blind' && taskNumber1 !== null && taskNumber1 !== undefined;
    console.log('Setting showTaskInput:', shouldShowInput, { trainingMode, taskNumber1 });
    setShowTaskInput(shouldShowInput);
    setShowBlindContinue(false);
    setInputNumber1('');
    setInputNumber2('');
    setInputOperation(null);
    setInputResult('');
    // Don't auto-focus to prevent scroll-jump
  }, [taskNumber1, taskNumber2, taskOperation, trainingMode]);

  // GLOBAL ENTER KEY HANDLER - Dismiss error screen on ENTER
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showErrorScreen && e.key === 'Enter') {
        console.log('⌨️ ENTER pressed while error screen visible - advancing to next task');
        e.preventDefault();
        setShowErrorScreen(false);
        // NOW advance to next task
        if (onSolutionComplete && errorUserAnswer) {
          console.log('📤 Calling onSolutionComplete with:', errorUserAnswer);
          onSolutionComplete(errorUserAnswer, steps);
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showErrorScreen, errorUserAnswer, steps, onSolutionComplete]);

  const logStep = (action: string, details: any = {}) => {
    setSteps(prev => [...prev, {
      timestamp: Date.now(),
      action,
      details,
    }]);
  };

  const handleTaskInputSubmit = () => {
    if (!inputNumber1 || !inputNumber2 || !inputOperation || !inputResult) {
      return;
    }

    const num1 = parseInt(inputNumber1, 10);
    const num2 = parseInt(inputNumber2, 10);
    const result = parseInt(inputResult, 10);

    if (isNaN(num1) || isNaN(num2) || isNaN(result)) {
      return;
    }

    // Check if task matches
    const taskMatches =
      num1 === taskNumber1 &&
      num2 === taskNumber2 &&
      inputOperation === taskOperation;

    // Check if result is correct
    const expectedResult = inputOperation === '+' ? num1 + num2 : num1 - num2;
    const resultCorrect = result === expectedResult;

    if (taskMatches && resultCorrect) {
      // Task input is complete and correct - hide input form and show representations
      setShowTaskInput(false);
      setShowBlindContinue(true);
      setFeedback('correct');
      logStep('task_input_correct', {
        number1: num1, number2: num2, operator: inputOperation, result
      });
    } else {
      // Show feedback but don't advance
      setFeedback('incorrect');
      logStep('incorrect_answer', {
        userAnswer: { number1: num1, number2: num2, operator: inputOperation, result },
        correctAnswer: { number1: taskNumber1, number2: taskNumber2, operator: taskOperation, result: correctAnswer }
      });
      // Reset after 2 seconds
      setTimeout(() => {
        setFeedback(null);
        setInputNumber1('');
        setInputNumber2('');
        setInputOperation(null);
        setInputResult('');
      }, 2000);
    }
  };

  const handleBlindContinue = () => {
    // Call onSolutionComplete to advance to next task
    onSolutionComplete?.({ result: correctAnswer }, steps);
  };

  const handleSubmit = () => {
    if (!inputValue && placeholderInSymbolic !== 'operator') return;

    let isCorrect = false;
    let userAnswer: any = {};
    let numAnswer = 0;

    if (placeholderInSymbolic === 'result') {
      numAnswer = parseInt(inputValue, 10);
      isCorrect = numAnswer === correctAnswer;
      userAnswer = { result: numAnswer };
    } else if (placeholderInSymbolic === 'number1') {
      numAnswer = parseInt(inputValue, 10);
      isCorrect = numAnswer === num1;
      userAnswer = { number1: numAnswer };
    } else if (placeholderInSymbolic === 'number2') {
      numAnswer = parseInt(inputValue, 10);
      isCorrect = numAnswer === num2;
      userAnswer = { number2: numAnswer };
    } else if (placeholderInSymbolic === 'operator') {
      isCorrect = operatorValue === op;
      userAnswer = { operator: operatorValue };
    }

    // Track user answer for error display
    if (numAnswer > 0) {
      setLastUserAnswer(numAnswer);
    }

    logStep('submit_answer', userAnswer);
    setShowAnswer(true);

    if (isCorrect) {
      setFeedback('correct');
      logStep('correct_answer', userAnswer);

      // Bei korrekter Antwort zur nächsten Aufgabe weitergehen
      setTimeout(() => {
        if (onSolutionComplete) {
          onSolutionComplete(userAnswer, steps);
        }
      }, 800);
    } else {
      setFeedback('incorrect');
      setErrorUserAnswer(userAnswer);
      setShowErrorScreen(true);
      console.log('🔴 WRONG ANSWER - Setting showErrorScreen=true. Do NOT advance!', { userAnswer, correctAnswer });
      logStep('incorrect_answer', {
        userAnswer,
        correctAnswer
      });
      // DO NOT call onSolutionComplete - wait for user to press ENTER!
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine which representations to show based on config
  // CRITICAL: Check if ANY number in the calculation exceeds 20
  const maxNumber = Math.max(num1, num2, correctAnswer);
  const isZR100 = maxNumber > 20; // Use actual numbers, not just numberRange parameter

  // Calculate required number range for representations
  const requiredRange = maxNumber <= 20 ? 20 :
                       maxNumber <= 100 ? 100 :
                       maxNumber <= 200 ? 200 : 300;

  const config = {
    twentyFrame: representationConfig.twentyFrame ?? true, // Always show (TwentyFrame or HundredField)
    numberLine: representationConfig.numberLine ?? true,
    counters: isZR100 ? false : (representationConfig.counters ?? true),
    fingers: isZR100 ? false : (representationConfig.fingers ?? true),
    symbolic: representationConfig.symbolic ?? true,
  };

  const activeCount = Object.values(config).filter(Boolean).length;

  // Smart decision: Hide counters and fingers for numbers > 20
  const shouldHideCountersAndFingers = maxNumber > 20;

  // Calculate placeholderPosition from placeholderInSymbolic
  const placeholderPosition: 'start' | 'middle' | 'end' =
    placeholderInSymbolic === 'number1' ? 'start' :
    placeholderInSymbolic === 'number2' ? 'middle' :
    'end';

  // Define placeholder positions for different representations
  const placeholderPositions = {
    twentyFrame: 'result', // Example, adjust as needed
    counters: 'result', // Example, adjust as needed
    fingers: 'result', // Example, adjust as needed
    numberLine: 'result', // Example, adjust as needed
    symbolic: placeholderInSymbolic,
  };

  // Refs for inputs
  const symbolicInputRef = useRef<HTMLInputElement>(null);
  const placeholderInputRef = useRef<HTMLInputElement>(null);

  // Function to render symbolic input based on placeholder position
  const renderSymbolicInput = () => {
    if (!config.symbolic) return null;

    // Use the placeholderInputRef for the main input if it's a placeholder task
    const refToUse = placeholderPosition !== 'none' ? placeholderInputRef : symbolicInputRef;

    return (
      <PlaceholderInput
        ref={refToUse}
        number1={num1}
        number2={num2}
        operation={op}
        placeholderPosition={placeholderPosition}
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={feedback === 'correct'} // Disable input after correct answer
        feedback={feedback}
        correctAnswer={correctAnswer}
        userAnswer={lastUserAnswer}
      />
    );
  };

  // Focus input when task changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (placeholderPosition !== 'none' && placeholderInputRef.current) {
        placeholderInputRef.current.focus();
      } else if (symbolicInputRef.current) {
        symbolicInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [taskNumber1, taskNumber2, placeholderPosition]);


  // If in blind mode and user hasn't entered task yet, show input form
  if (trainingMode === 'blind' && showTaskInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Blind-Modus
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Tippe die Aufgabe und das Ergebnis ein
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Form */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Number 1 */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputNumber1}
                onChange={(e) => {
                  const newVal = e.target.value.replace(/[^0-9]/g, '');
                  setInputNumber1(newVal);
                }}
                placeholder=""
                className="w-24 h-16 text-center text-4xl font-bold font-mono border-0 border-b-4 rounded-none bg-transparent border-primary focus:outline-none focus:border-green-500 caret-primary transition-colors text-red-600"
                style={{ textDecoration: 'none' }}
                data-testid="input-task-number1"
              />

              {/* Operation Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant={inputOperation === '+' ? 'default' : 'outline'}
                  onClick={() => setInputOperation('+')}
                  className="h-16 w-16"
                  data-testid="button-operation-plus"
                >
                  <Plus className="h-8 w-8" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={inputOperation === '-' ? 'default' : 'outline'}
                  onClick={() => setInputOperation('-')}
                  className="h-16 w-16"
                  data-testid="button-operation-minus"
                >
                  <Minus className="h-8 w-8" />
                </Button>
              </div>

              {/* Number 2 */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputNumber2}
                onChange={(e) => {
                  const newVal = e.target.value.replace(/[^0-9]/g, '');
                  setInputNumber2(newVal);
                }}
                placeholder=""
                className="w-24 h-16 text-center text-4xl font-bold font-mono border-0 border-b-4 rounded-none bg-transparent border-primary focus:outline-none focus:border-green-500 caret-primary transition-colors text-red-600"
                style={{ textDecoration: 'none' }}
                data-testid="input-task-number2"
              />

              {/* Equals sign */}
              <span className="text-4xl font-extrabold text-muted-foreground">=</span>

              {/* Result */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputResult}
                onChange={(e) => {
                  const newVal = e.target.value.replace(/[^0-9]/g, '');
                  setInputResult(newVal);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputNumber1 && inputNumber2 && inputOperation && inputResult) {
                    handleTaskInputSubmit();
                  }
                }}
                placeholder=""
                className="w-24 h-16 text-center text-4xl font-bold font-mono border-0 border-b-4 rounded-none bg-transparent border-primary focus:outline-none focus:border-green-500 caret-primary transition-colors text-red-600"
                style={{ textDecoration: 'none' }}
                data-testid="input-task-result"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleTaskInputSubmit}
                disabled={!inputNumber1 || !inputNumber2 || !inputOperation || !inputResult}
                size="lg"
                className="w-full max-w-xs"
                data-testid="button-submit-task"
              >
                Überprüfen
              </Button>
            </div>

            {/* Feedback */}
            {feedback === 'incorrect' && (
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Das stimmt leider nicht. Versuche es noch einmal!
                </p>
              </div>
            )}

            {/* Hint */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Drücke ENTER im Ergebnis-Feld zum Absenden</p>
              <p className="font-medium">Im Blind-Modus siehst du keine symbolische Darstellung</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col gap-0 p-0", className)} data-testid="adaptive-math-lab">
      {/* ERROR SCREEN MODAL - FIRST in render - Shows on wrong answer, stays until ENTER pressed */}
      {showErrorScreen && (
        <>
          {console.log('🎨 Rendering Error Screen Modal')}
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] pointer-events-auto">
            <Card className="max-w-2xl w-full mx-4 shadow-2xl border-4 border-red-500 bg-white">
              <CardContent className="p-12 text-center space-y-8">
                <div className="text-8xl">❌</div>
              
              <div className="space-y-6">
                <h2 className="text-6xl font-bold text-red-600">Falsch!</h2>
                
                {errorUserAnswer && (
                  <div className="bg-red-50 rounded-lg p-8 space-y-4">
                    <p className="text-2xl font-semibold text-gray-700">
                      Du hast getippt:
                    </p>
                    <p className="text-5xl font-bold text-red-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {num1}{op}{num2}={errorUserAnswer.result}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 rounded-lg p-8 space-y-4">
                  <p className="text-2xl font-semibold text-gray-700">
                    Richtig ist:
                  </p>
                  <p className="text-5xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {num1}{op}{num2}={correctAnswer}
                  </p>
                </div>
              </div>

              <div className="text-2xl text-gray-600 font-semibold pt-4 border-t-2">
                Drücke ENTER zum Weitermachen →
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {showBlindContinue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader className="pb-10 pt-10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <CheckCircle2 style={{ width: '120px', height: '120px' }} className="text-green-600" />
                </div>
                <div style={{
                  fontSize: '8rem',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '0.02em'
                }} className="text-green-600 font-black">
                  Richtig!
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleBlindContinue}
                className="w-full h-16 text-xl font-bold"
                data-testid="button-blind-continue"
              >
                Weiter zur nächsten Aufgabe
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ZR20: 5-Panel Layout - Mitte: Eingabe, Oben: Zwanzigerfeld, Links: Würfel, Rechts: Finger, Unten: Zahlenstrahl */}
      {!isZR100 && !showErrorScreen && (
        <div className="grid grid-cols-3 gap-0 h-full p-0" style={{ gridTemplateRows: 'minmax(80px, auto) minmax(100px, auto) minmax(60px, auto)' }}>
          {/* TOP LEFT: Empty */}
          <div></div>

          {/* TOP CENTER: TwentyFrame */}
          <div className="flex items-center justify-center pb-0 -mb-2">
            <LiveTwentyFrame
              number1={num1}
              number2={num2}
              operation={op}
              className="scale-75"
              placeholderPosition={placeholderPosition}
              hideSolution={feedback !== 'correct'}
            />
          </div>

          {/* TOP RIGHT: Empty */}
          <div></div>

          {/* MIDDLE LEFT: Würfel */}
          <div className="flex items-center justify-center py-0 -my-2">
            <DiceGroup
              total={op === '+' ? num1 + num2 : num1 - num2}
              firstPart={num1}
              secondPart={num2}
              operation={op}
              firstColor="red"
              secondColor="blue"
              size="lg"
            />
          </div>

          {/* MIDDLE CENTER: Symbolic Input */}
          <div className="flex items-center justify-center py-0 -my-2">
            {renderSymbolicInput()}
          </div>

          {/* MIDDLE RIGHT: Finger/Hände */}
          <div className="flex items-center justify-center py-0 -my-2">
            <FingerHands
              number1={num1}
              number2={num2}
              operation={op}
              className="scale-90"
            />
          </div>

          {/* BOTTOM LEFT: Empty */}
          <div></div>

          {/* BOTTOM CENTER: NumberLine (full width) */}
          <div className="col-span-3 flex items-start justify-center pt-0 -mt-4">
            <LiveNumberLine
              number1={num1}
              number2={num2}
              operation={op}
              showAnswer={showAnswer}
              className="scale-90"
              placeholderPosition={placeholderPosition}
              hideSolution={feedback !== 'correct'}
              numberRange={20}
            />
          </div>
        </div>
      )}

      {/* ZR100: Vereinfachtes Layout - nur 100er-Feld und Zahlenstrahl */}
      {isZR100 && !showErrorScreen && (
        <div className="flex flex-col gap-4 h-full p-4">
          {/* OBEN: 100er-Feld */}
          <div className="flex justify-center" data-testid="rep-hundredfield">
            <div className="scale-[0.7] origin-center">
              <LiveHundredField
                number1={num1}
                number2={num2}
                operation={op}
                hideSolution={feedback !== 'correct'}
                placeholderPosition={placeholderPosition}
              />
            </div>
          </div>

          {/* MITTE: Symbolische Eingabe */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              {renderSymbolicInput()}
            </div>
          </div>

          {/* UNTEN: Zahlenstrahl */}
          <div className="flex justify-center mt-auto" data-testid="rep-numberline">
            <div className="w-full max-w-4xl scale-[0.7] origin-top">
              <div className="bg-muted/30 rounded-lg border p-1 w-full">
                <ExtendedNumberLine
                  value={correctAnswer}
                  numberRange={requiredRange as 20 | 100 | 200 | 300}
                  showJumps={true}
                  number1={num1}
                  number2={num2}
                  operation={op}
                  hideSolution={feedback !== 'correct'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}