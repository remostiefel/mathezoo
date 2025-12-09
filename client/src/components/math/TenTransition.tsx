import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface TenTransitionProps {
  number1: number;
  number2: number;
  onComplete?: (answer: number, steps: any[]) => void;
}

export function TenTransition({ number1, number2, onComplete }: TenTransitionProps) {
  const [stage, setStage] = useState<'step1' | 'step2' | 'result'>('step1');
  const [userInput, setUserInput] = useState('');
  const [steps, setSteps] = useState<any[]>([]);

  // Calculate decomposition for ten transition
  // For 8+4: first add 2 to reach 10, then add remaining 2
  const toTen = 10 - number1;
  const remaining = number2 - toTen;
  const correctAnswer = number1 + number2;

  useEffect(() => {
    setStage('step1');
    setUserInput('');
    setSteps([]);
  }, [number1, number2]);

  const handleInputSubmit = () => {
    const answer = parseInt(userInput);
    
    if (stage === 'step1') {
      // User should enter the first step: number1 + toTen
      const step1Answer = number1 + toTen; // Should equal 10
      if (answer === step1Answer) {
        setStage('step2');
        setSteps([...steps, { type: 'to_ten', expression: `${number1}+${toTen}`, value: step1Answer }]);
        setUserInput('');
      }
    } else if (stage === 'step2') {
      // User should enter: 10 + remaining
      const step2Answer = 10 + remaining;
      if (answer === step2Answer) {
        setStage('result');
        setSteps([...steps, { type: 'from_ten', expression: `10+${remaining}`, value: step2Answer }]);
        setUserInput('');
        onComplete?.(step2Answer, steps);
      }
    }
  };

  const renderDecomposition = () => {
    return (
      <div className="space-y-4">
        {/* Original Task */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <span className="text-3xl font-bold">{number1} + {number2}</span>
        </div>

        {/* Decomposition Visualization */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Step 1: To Ten */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            stage === 'step1' 
              ? "bg-blue-50 border-blue-500 dark:bg-blue-950" 
              : "bg-muted border-muted-foreground/20"
          )}>
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Schritt 1: Bis zur 10</div>
              <div className="text-2xl font-bold">
                {number1} + {toTen}
              </div>
              {stage !== 'step1' && (
                <div className="text-lg font-medium text-green-600 dark:text-green-400">
                  = 10 ✓
                </div>
              )}
            </div>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground" />

          {/* Step 2: Remaining */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            stage === 'step2' 
              ? "bg-blue-50 border-blue-500 dark:bg-blue-950" 
              : "bg-muted border-muted-foreground/20"
          )}>
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Schritt 2: Rest dazu</div>
              <div className="text-2xl font-bold">
                10 + {remaining}
              </div>
              {stage === 'result' && (
                <div className="text-lg font-medium text-green-600 dark:text-green-400">
                  = {correctAnswer} ✓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual: Dots reaching 10 */}
        <div className="p-6 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* First number */}
            {Array.from({ length: number1 }).map((_, i) => (
              <div
                key={`initial-${i}`}
                className="h-6 w-6 rounded-full bg-red-500"
              />
            ))}
            {/* To reach 10 */}
            {Array.from({ length: toTen }).map((_, i) => (
              <div
                key={`to-ten-${i}`}
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  stage === 'step1' ? "bg-blue-500 ring-2 ring-blue-300" : "bg-blue-400"
                )}
              />
            ))}
            {/* Separator after 10 */}
            <div className="w-4" />
            {/* Remaining */}
            {Array.from({ length: remaining }).map((_, i) => (
              <div
                key={`remaining-${i}`}
                className={cn(
                  "h-6 w-6 rounded-full transition-all",
                  stage === 'step2' || stage === 'result' 
                    ? "bg-green-500 ring-2 ring-green-300" 
                    : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2" data-testid="ten-transition">
      <CardHeader>
        <CardTitle>Zehnerübergang - Schrittweise</CardTitle>
        <CardDescription>
          Erst die 10 auffüllen, dann den Rest addieren
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderDecomposition()}

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder={
                stage === 'step1' 
                  ? `${number1} + ${toTen} = ?`
                  : `10 + ${remaining} = ?`
              }
              className="text-2xl text-center h-14 font-bold"
              data-testid="input-ten-transition"
              autoFocus
            />
            <Button
              onClick={handleInputSubmit}
              disabled={!userInput}
              size="lg"
              className="h-14 px-8"
              data-testid="button-submit-ten-transition"
            >
              Prüfen
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {stage === 'step1' && `Schritt 1: Wie viel ist ${number1} + ${toTen}?`}
            {stage === 'step2' && `Schritt 2: Wie viel ist 10 + ${remaining}?`}
            {stage === 'result' && `Fertig! ${number1} + ${number2} = ${correctAnswer}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
