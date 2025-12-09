import { cn } from "@/lib/utils";

interface PlaceValueBarsProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  className?: string;
  hideSolution?: boolean;
  placeholderPosition?: 'start' | 'middle' | 'end';
}

export function PlaceValueBars({ 
  number1, 
  number2, 
  operation, 
  className,
  hideSolution = false,
  placeholderPosition = 'end'
}: PlaceValueBarsProps) {
  const shouldHideSolution = hideSolution || placeholderPosition === 'start' || placeholderPosition === 'middle';
  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;
  
  // Break down numbers into tens and ones
  const getTensOnes = (num: number) => ({
    tens: Math.floor(num / 10),
    ones: num % 10
  });
  
  const num1Parts = getTensOnes(number1);
  const num2Parts = getTensOnes(number2);
  const answerParts = getTensOnes(correctAnswer);
  
  const renderBar = (count: number, type: 'tens' | 'ones', color: string) => {
    if (count === 0) return null;
    
    const height = type === 'tens' ? 'h-16' : 'h-8';
    const width = type === 'tens' ? 'w-4' : 'w-3';
    
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              width,
              height,
              "rounded-sm transition-all duration-300",
              color
            )}
            data-testid={`bar-${type}-${i}`}
          />
        ))}
      </div>
    );
  };
  
  const renderNumber = (parts: { tens: number; ones: number }, label: string, color: string, hideValue: boolean = false) => (
    <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg border-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="flex items-end gap-3">
        <div className="flex flex-col items-center gap-1">
          {renderBar(parts.tens, 'tens', color)}
          {parts.tens > 0 && (
            <span className="text-xs font-mono text-muted-foreground">{parts.tens}Z</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          {renderBar(parts.ones, 'ones', color)}
          {parts.ones > 0 && (
            <span className="text-xs font-mono text-muted-foreground">{parts.ones}E</span>
          )}
        </div>
      </div>
      {!hideValue && (
        <div className="text-lg font-bold font-mono">{parts.tens * 10 + parts.ones}</div>
      )}
    </div>
  );
  
  return (
    <div className={cn("w-full", className)} data-testid="place-value-bars">
      <div className="bg-muted/30 rounded-lg border-2 p-4">
        <div className="flex items-center justify-center gap-4">
          {renderNumber(num1Parts, 'Zahl 1', 'bg-red-500 border-red-600')}
          
          <div className="text-3xl font-bold text-muted-foreground px-2">
            {operation}
          </div>
          
          {renderNumber(num2Parts, 'Zahl 2', 'bg-blue-500 border-blue-600')}
          
          <div className="text-3xl font-bold text-muted-foreground px-2">
            =
          </div>
          
          {renderNumber(answerParts, 'Ergebnis', 'bg-green-500 border-green-600', shouldHideSolution)}
        </div>
      </div>
    </div>
  );
}
