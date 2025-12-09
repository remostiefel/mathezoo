import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface PowerOfFiveProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  onComplete?: (answer: number, steps: any[]) => void;
}

export function PowerOfFive({ number1, number2, operation, onComplete }: PowerOfFiveProps) {
  const [stage, setStage] = useState<'initial' | 'adding' | 'result'>('initial');
  const [userInput, setUserInput] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [currentValue, setCurrentValue] = useState(number1);

  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

  useEffect(() => {
    setStage('initial');
    setUserInput('');
    setSteps([]);
    setCurrentValue(number1);
  }, [number1, number2, operation]);

  // Auto-transition from initial to adding stage after 1 second
  useEffect(() => {
    if (stage === 'initial') {
      const timer = setTimeout(() => {
        setStage('adding');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleInputSubmit = () => {
    const input = userInput.trim();
    
    if (stage === 'adding') {
      // Check if user entered the correct expression (e.g., "4+1" or "8+2")
      const expectedExpression = `${number1}${operation}${number2}`;
      if (input === expectedExpression) {
        setStage('result');
        setCurrentValue(correctAnswer);
        setSteps([...steps, { type: 'expression', value: input }]);
        setUserInput('');
      }
    } else if (stage === 'result') {
      // Check if user entered the correct answer
      const answer = parseInt(input);
      if (answer === correctAnswer) {
        setSteps([...steps, { type: 'answer', value: answer }]);
        onComplete?.(answer, steps);
      }
    }
  };

  const renderDots = () => {
    const dots = [];
    const targetCount = stage === 'initial' ? number1 : correctAnswer;
    
    for (let i = 0; i < targetCount; i++) {
      const isInAddedGroup = i >= number1;
      const isCompleteFive = (i + 1) % 5 === 0;
      
      let dotColor = 'bg-red-500'; // Initial dots
      if (stage === 'adding' && isInAddedGroup) {
        dotColor = 'bg-blue-500'; // Added dots
      } else if (stage === 'result') {
        dotColor = 'bg-green-500'; // Result dots
      }
      
      dots.push(
        <div
          key={i}
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-300",
            dotColor,
            isCompleteFive && "mr-10" // Add larger space after every 5th dot (always 5 in a row)
          )}
          data-testid={`dot-${i}`}
        />
      );
    }
    
    return dots;
  };

  return (
    <Card className="border-2" data-testid="power-of-five">
      <CardHeader>
        <CardTitle>Kraft der Fünf</CardTitle>
        <CardDescription>
          Beobachte die Punkte und gib die Rechnung ein
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dots Display */}
        <div className="flex flex-wrap gap-3 p-6 bg-muted/50 rounded-lg justify-center items-center min-h-[140px]">
          {renderDots()}
        </div>

        {/* Stage Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className={cn(
            "flex items-center gap-2 transition-opacity",
            stage === 'initial' ? "opacity-100" : "opacity-30"
          )}>
            <Circle className="h-4 w-4" />
            <span className="text-sm">Startzahl</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 transition-opacity",
            stage === 'adding' ? "opacity-100" : "opacity-30"
          )}>
            <Circle className="h-4 w-4" />
            <span className="text-sm">Rechnung</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 transition-opacity",
            stage === 'result' ? "opacity-100" : "opacity-30"
          )}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Ergebnis</span>
          </div>
        </div>

        {/* Input Area */}
        {stage !== 'initial' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                placeholder={stage === 'adding' ? `z.B. ${number1}+${number2}` : "= ?"}
                className="text-2xl text-center h-14 font-bold"
                data-testid="input-power-of-five"
                autoFocus
              />
              <Button
                onClick={handleInputSubmit}
                disabled={!userInput}
                size="lg"
                className="h-14 px-8"
                data-testid="button-submit-power-of-five"
              >
                Prüfen
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {stage === 'adding' && `Gib die Rechnung ein: ${number1} + ${number2}`}
              {stage === 'result' && `Gib das Ergebnis ein`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
