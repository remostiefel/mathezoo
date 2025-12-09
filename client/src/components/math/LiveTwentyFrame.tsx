import { cn } from "@/lib/utils";

interface LiveTwentyFrameProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  onStepChange?: (steps: any[]) => void;
  hideSolution?: boolean; // Don't show result in placeholder tasks
  className?: string;
  placeholderPosition?: 'start' | 'middle' | 'end'; // Added to handle placeholder positions
}

// Define CellConfig interface to satisfy the return type of getCellConfig
interface CellConfig {
  baseClass: string;
  overlayClass?: string;
}

export function LiveTwentyFrame({ number1, number2, operation, onStepChange, hideSolution = false, className, placeholderPosition }: LiveTwentyFrameProps) {
  // For start/middle placeholders, we must hide the solution completely
  const shouldHideSolution = hideSolution || placeholderPosition === 'start' || placeholderPosition === 'middle';
  const displayResult = shouldHideSolution ? null : (operation === '+' ? number1 + number2 : number1 - number2);
  const result = operation === '+' ? number1 + number2 : number1 - number2;

  const getCellConfig = (index: number): CellConfig => {
    if (operation === '-') {
      // Subtraktion: ROT als Basis, dann GRÜN oder BLAU als transparentes Overlay
      const actualResult = number1 - number2;
      if (index < actualResult) {
        // Bleibt: ROT Basis + GRÜN Overlay (95% opacity für leuchtende Farbe)
        return {
          baseClass: "bg-red-500 border-red-800",
          overlayClass: "absolute inset-0 bg-green-400/95 rounded z-20"
        };
      } else if (index < number1) {
        // Weggenommen: ROT Basis + BLAU Overlay (95% opacity für leuchtende Farbe)
        return {
          baseClass: "bg-red-500 border-red-800",
          overlayClass: "absolute inset-0 bg-blue-400/95 rounded z-20"
        };
      }
    } else if (operation === '+') {
      // Addition: first number1 cells are RED with GREEN border, next number2 cells are BLUE with GREEN border
      if (index < number1) {
        return {
          baseClass: "bg-red-500 border-green-500 relative z-10"
        };
      } else if (index < number1 + number2) {
        return {
          baseClass: "bg-blue-500 border-green-500 relative z-20"
        };
      } else {
        return {
          baseClass: "bg-muted/30 border-muted-foreground/30"
        };
      }
    }

    return { baseClass: "bg-background border-muted-foreground/30" };
  };

  const renderTenFrame = (startIndex: number) => {
    return (
      <div className="border-4 border-muted-foreground/60 rounded-lg p-4 bg-muted/20">
        <div className="flex items-center justify-center gap-3">
          {/* Erste 5 Rechtecke */}
          {[0, 1, 2, 3, 4].map((i) => {
            const cellIndex = startIndex + i;
            const cellConfig = getCellConfig(cellIndex);
            return (
              <div
                key={cellIndex}
                className={cn(
                  "h-12 w-12 rounded border-4 transition-all duration-300 flex-shrink-0 relative",
                  cellConfig.baseClass
                )}
                data-testid={`frame-cell-${cellIndex}`}
              >
                {cellConfig.overlayClass && (
                  <div className={cellConfig.overlayClass}></div>
                )}
              </div>
            );
          })}

          {/* Trennlinie exakt in der Mitte */}
          <div className="w-1 h-12 bg-muted-foreground/60 flex-shrink-0" />

          {/* Letzte 5 Rechtecke */}
          {[5, 6, 7, 8, 9].map((i) => {
            const cellIndex = startIndex + i;
            const cellConfig = getCellConfig(cellIndex);
            return (
              <div
                key={cellIndex}
                className={cn(
                  "h-12 w-12 rounded border-4 transition-all duration-300 flex-shrink-0 relative",
                  cellConfig.baseClass
                )}
                data-testid={`frame-cell-${cellIndex}`}
              >
                {cellConfig.overlayClass && (
                  <div className={cellConfig.overlayClass}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex justify-center", className)} data-testid="live-twenty-frame">
      <div className="flex flex-col gap-3 items-center">
        {renderTenFrame(0)}
        {renderTenFrame(10)}
      </div>
    </div>
  );
}