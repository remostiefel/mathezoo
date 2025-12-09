import { cn } from "@/lib/utils";

interface LiveHundredFieldProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  hideSolution?: boolean;
  className?: string;
  placeholderPosition?: 'start' | 'middle' | 'end';
}

export function LiveHundredField({ 
  number1, 
  number2, 
  operation, 
  hideSolution = false,
  className,
  placeholderPosition = 'end'
}: LiveHundredFieldProps) {
  const shouldHideSolution = hideSolution || placeholderPosition === 'start' || placeholderPosition === 'middle';
  const result = operation === '+' ? number1 + number2 : number1 - number2;

  // Bestimme die Anzahl der benötigten Hunderterfelder
  const maxValue = Math.max(number1, number2, result);
  const numberOfHundreds = Math.ceil(maxValue / 100);
  const displayRange = numberOfHundreds * 100;

  const getCellConfig = (cellNumber: number): { baseClass: string; overlayClass?: string } => {
    if (operation === '-') {
      // Subtraktion: ROT für Ergebnis (was übrig bleibt), BLAU für weggenommen
      const actualResult = number1 - number2;
      if (cellNumber <= actualResult) {
        // Bleibt: ROT
        return {
          baseClass: "bg-red-500 border-red-600"
        };
      } else if (cellNumber <= number1) {
        // Weggenommen: BLAU (nicht rot mit overlay!)
        return {
          baseClass: "bg-blue-500 border-blue-600"
        };
      }
    } else if (operation === '+') {
      // Addition: Rot = Ausgangszahl, Blau = hinzugefügt
      if (cellNumber <= number1) {
        return { baseClass: "bg-red-500 border-red-600" };
      } else if (cellNumber <= result) {
        return { baseClass: "bg-blue-500 border-blue-600" };
      }
    }
    return { baseClass: "bg-background border-muted-foreground/30" };
  };

  return (
    <div className={cn("w-full", className)} data-testid="live-hundred-field">
      <div className="bg-muted/30 rounded-lg border-2 p-2">
        <div className="flex gap-6 flex-wrap justify-center">
          {Array.from({ length: numberOfHundreds }, (_, hundredIndex) => (
            <div key={hundredIndex} className="inline-block">
              <div className="grid grid-cols-10 gap-1 bg-background/50 p-2 rounded-lg border-2 border-border">
                {Array.from({ length: 100 }, (_, i) => {
                  const cellNumber = hundredIndex * 100 + i + 1;
                  const cellConfig = getCellConfig(cellNumber);
                  
                  return (
                    <div
                      key={i}
                      data-testid={`hundred-cell-${cellNumber}`}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center relative",
                        "text-xs font-mono transition-all duration-200",
                        "rounded border-2",
                        cellConfig.baseClass
                      )}
                    >
                      {cellConfig.overlayClass && (
                        <div className={cellConfig.overlayClass}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {!shouldHideSolution && placeholderPosition === 'end' && (
          <div className="mt-2 text-center font-mono text-lg text-foreground">
            {result}
          </div>
        )}
        
        {!shouldHideSolution && operation === '+' && (
          <div className="mt-1 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-500"></span>
              Start: {number1}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
              Hinzugefügt: {number2}
            </span>
          </div>
        )}
        {!shouldHideSolution && operation === '-' && (
          <div className="mt-1 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm border border-red-600 bg-red-500"></span>
              Bleibt: {result}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm border border-blue-600 bg-blue-500"></span>
              Weggenommen: {number2}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
