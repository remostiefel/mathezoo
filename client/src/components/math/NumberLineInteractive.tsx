import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberLineInteractiveProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  onComplete?: (answer: number, steps: any[]) => void;
}

export function NumberLineInteractive({ 
  number1, 
  number2, 
  operation, 
  onComplete 
}: NumberLineInteractiveProps) {
  const [stage, setStage] = useState<'initial' | 'showing-step' | 'result'>('initial');
  const [userInput, setUserInput] = useState('');
  const [steps, setSteps] = useState<any[]>([]);

  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

  useEffect(() => {
    setStage('initial');
    setUserInput('');
    setSteps([]);
  }, [number1, number2, operation]);

  useEffect(() => {
    if (stage === 'initial') {
      const timer = setTimeout(() => {
        setStage('showing-step');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleInputSubmit = () => {
    const input = userInput.trim();
    
    if (stage === 'showing-step') {
      const expectedExpression = `${number1}${operation}${number2}`;
      if (input === expectedExpression || input === `${number1}+${number2}`) {
        setStage('result');
        setSteps([...steps, { type: 'expression', value: input }]);
        setUserInput('');
      }
    } else if (stage === 'result') {
      const answer = parseInt(input);
      if (answer === correctAnswer) {
        setSteps([...steps, { type: 'answer', value: answer }]);
        onComplete?.(answer, steps);
      }
    }
  };

  const renderNumberLine = () => {
    const max = 20;
    const points = [];
    
    for (let i = 0; i <= max; i++) {
      const isFive = i % 5 === 0;
      const isTen = i % 10 === 0;
      
      // Determine point color and size
      let pointClass = "h-2 w-2 bg-gray-300";
      if (stage === 'initial' && i === number1) {
        pointClass = "h-4 w-4 bg-red-500 ring-4 ring-red-200"; // Start point (red)
      } else if ((stage === 'showing-step' || stage === 'result') && i === number1) {
        pointClass = "h-3 w-3 bg-red-400"; // Start point dimmed
      } else if (stage === 'result' && i === correctAnswer) {
        pointClass = "h-4 w-4 bg-green-500 ring-4 ring-green-200"; // Result point (green)
      } else if (isTen) {
        pointClass = "h-3 w-3 bg-gray-500";
      } else if (isFive) {
        pointClass = "h-2.5 w-2.5 bg-gray-400";
      }
      
      // Check if this segment should be highlighted
      const isInRange = operation === '+' 
        ? (stage === 'showing-step' || stage === 'result') && i > number1 && i <= correctAnswer
        : (stage === 'showing-step' || stage === 'result') && i >= correctAnswer && i < number1;
      
      points.push(
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={cn(
            "rounded-full transition-all duration-300",
            pointClass
          )} />
          {isFive && (
            <span className="text-xs font-medium text-muted-foreground">
              {i}
            </span>
          )}
          {/* Highlight segment */}
          {i < max && isInRange && (
            <div className="absolute h-1 w-full bg-blue-400 -translate-y-3.5 left-0" 
                 style={{ 
                   width: `calc(100% / ${max})`,
                   marginLeft: '50%'
                 }} />
          )}
        </div>
      );
    }
    
    return points;
  };

  return (
    <Card className="border-2" data-testid="number-line-interactive">
      <CardHeader>
        <CardTitle>Zahlenstrahl-Schritte</CardTitle>
        <CardDescription>
          Beobachte die Bewegung auf dem Zahlenstrahl
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number Line */}
        <div className="relative">
          <div className="flex justify-between items-end px-2 py-6 bg-muted/50 rounded-lg overflow-x-auto">
            {renderNumberLine()}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Start ({number1})</span>
            </div>
            {(stage === 'showing-step' || stage === 'result') && (
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-400" />
                <span className="text-muted-foreground">+{number2}</span>
              </div>
            )}
            {stage === 'result' && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Ergebnis</span>
              </div>
            )}
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
                placeholder={stage === 'showing-step' ? `z.B. ${number1}${operation}${number2}` : "= ?"}
                className="text-2xl text-center h-14 font-bold"
                data-testid="input-numberline-interactive"
                autoFocus
              />
              <Button
                onClick={handleInputSubmit}
                disabled={!userInput}
                size="lg"
                className="h-14 px-8"
                data-testid="button-submit-numberline"
              >
                Prüfen
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {stage === 'showing-step' && `Gib die Rechnung ein`}
              {stage === 'result' && `Gib das Ergebnis ein`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
