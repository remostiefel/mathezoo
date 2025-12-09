import { cn } from "@/lib/utils";

interface LiveSymbolicProps {
  number1: number;
  operation: '+' | '-';
  number2: number;
  currentValue?: number;
  showDecomposition?: boolean;
  className?: string;
}

export function LiveSymbolic({ 
  number1, 
  operation, 
  number2, 
  currentValue,
  showDecomposition = false,
  className 
}: LiveSymbolicProps) {
  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;
  const isTenTransition = operation === '+' && number1 < 10 && correctAnswer > 10;
  
  // Ten transition decomposition
  const toTen = 10 - number1;
  const remaining = number2 - toTen;
  
  return (
    <div className={cn("w-full", className)} data-testid="live-symbolic">
      <div className="bg-muted/30 rounded-lg border-2 p-4 space-y-3">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Symbolische Darstellung</div>
          <div className="text-3xl font-bold">
            {number1} {operation} {number2} = 
            {currentValue !== undefined ? (
              <span className={cn(
                "ml-2 transition-colors",
                currentValue === correctAnswer ? "text-green-500" : "text-blue-500"
              )}>
                {currentValue}
              </span>
            ) : (
              <span className="ml-2 text-muted-foreground">?</span>
            )}
          </div>
        </div>
        
        {showDecomposition && isTenTransition && (
          <div className="pt-3 border-t space-y-2">
            <div className="text-xs text-muted-foreground text-center">Zehnerübergang</div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                {number1} + {toTen} = 10
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded">
                10 + {remaining} = {correctAnswer}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
