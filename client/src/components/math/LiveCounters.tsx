import { cn } from "@/lib/utils";

interface LiveCountersProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  numberRange?: number;
  className?: string;
  showAnswer?: boolean;
  hideSolution?: boolean; // Added hideSolution prop
  placeholderPosition?: 'start' | 'middle' | 'end'; // Added placeholderPosition prop
}

export function LiveCounters({
  number1,
  number2,
  operation,
  numberRange = 20,
  className,
  showAnswer = false,
  hideSolution = false, // Added hideSolution prop with default value
  placeholderPosition = 'end' // Default to 'end' if not provided
}: LiveCountersProps) {
  // For start/middle placeholders, we must hide the solution completely
  const shouldHideSolution = hideSolution || placeholderPosition === 'start' || placeholderPosition === 'middle';
  const displayResult = shouldHideSolution ? null : (operation === '+' ? number1 + number2 : number1 - number2);

  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;
  const totalToShow = operation === '+' ? correctAnswer : number1;

  // For ZR100, use grouped tens representation
  if (numberRange === 100) {
    const getTensOnes = (num: number) => ({
      tens: Math.floor(num / 10),
      ones: num % 10
    });

    const renderGroupedCounters = () => {
      const { tens: tens1, ones: ones1 } = getTensOnes(number1);
      const { tens: tens2, ones: ones2 } = getTensOnes(number2);
      const { tens: tensResult, ones: onesResult } = getTensOnes(correctAnswer);

      if (operation === '+') {
        return (
          <div className="flex gap-6 items-center">
            {/* First number (red) */}
            <div className="flex flex-col gap-3">
              {/* Tens groups */}
              {tens1 > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: tens1 }).map((_, i) => (
                    <div
                      key={`ten1-${i}`}
                      className="h-12 w-24 rounded border-3 transition-all duration-300 flex items-center justify-center bg-red-500 border-red-600"
                      data-testid={`ten-group-1-${i}`}
                    >
                      <span className="text-sm font-bold text-white">10</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Ones */}
              {ones1 > 0 && (
                <div className="flex gap-1">
                  {Array.from({ length: ones1 }).map((_, i) => (
                    <div
                      key={`one1-${i}`}
                      className={cn(
                        "h-20 w-10 rounded-full border-4 transition-all duration-300 bg-red-500 border-red-800",
                        (i + 1) % 5 === 0 && i + 1 < ones1 && "mr-2"
                      )}
                      data-testid={`one-1-${i}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Second number (blue) */}
            <div className="flex flex-col gap-3">
              {/* Tens groups */}
              {tens2 > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: tens2 }).map((_, i) => (
                    <div
                      key={`ten2-${i}`}
                      className="h-12 w-24 rounded border-3 transition-all duration-300 flex items-center justify-center bg-blue-500 border-blue-600"
                      data-testid={`ten-group-2-${i}`}
                    >
                      <span className="text-sm font-bold text-white">10</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Ones */}
              {ones2 > 0 && (
                <div className="flex gap-1">
                  {Array.from({ length: ones2 }).map((_, i) => (
                    <div
                      key={`one2-${i}`}
                      className={cn(
                        "h-20 w-10 rounded-full border-4 transition-all duration-300 bg-blue-500 border-blue-800",
                        (i + 1) % 5 === 0 && i + 1 < ones2 && "mr-2"
                      )}
                      data-testid={`one-2-${i}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      } else {
        // Subtraktion: ROT als Basis, GRÜN Overlay für was bleibt, BLAU Overlay für was weggenommen wird
        // Zeige einfach alle number1-Elemente und färbe entsprechend dem Ergebnis
        // Für simplified view: Zeige alle Zehner/Einer von number1, färbe die ersten "result" grün, Rest blau
        const allCounters = Array.from({ length: number1 }, (_, i) => i);
        
        return (
          <div className="flex flex-wrap gap-2 justify-center items-center max-w-xl">
            {allCounters.map((i) => {
              const isRemaining = i < correctAnswer;
              const isAfterFive = (i + 1) % 5 === 0;
              
              return (
                <div
                  key={i}
                  className={cn(
                    "h-20 w-20 rounded-full border-4 transition-all duration-300 bg-red-500 border-red-800 relative",
                    isAfterFive && "mr-3"
                  )}
                  data-testid={`counter-${i}`}
                >
                  {isRemaining ? (
                    <div className="absolute inset-0 bg-green-500/70 rounded-full"></div>
                  ) : (
                    <div className="absolute inset-0 bg-blue-500/70 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
    };

    return (
      <div className={cn("w-full", className)} data-testid="live-counters">
        <div className="flex flex-col gap-3 items-center min-h-[100px] justify-center">
          {renderGroupedCounters()}
        </div>

        {showAnswer && !shouldHideSolution && ( // Conditionally render answer
          <div className="text-center text-xl font-bold mt-3 pt-3">
            <span className="text-red-600">{number1}</span>
            <span className="mx-2 text-foreground">{operation}</span>
            <span className="text-blue-600">{number2}</span>
            <span className="mx-2 text-foreground">=</span>
            <span className="text-green-600">{displayResult}</span>
          </div>
        )}
      </div>
    );
  }

  // Original ZR20 implementation
  const counters = Array.from({ length: Math.min(totalToShow, 20) }, (_, i) => i);

  const getCounterConfig = (index: number): { baseClass: string; overlayClass?: string } => {
    if (operation === '+') {
      // Addition: ROT für number1 (Ausgangsmenge), BLAU für number2 (hinzugefügt)
      if (index < number1) {
        return { baseClass: "bg-red-500 border-red-800" };
      } else if (index >= number1 && index < correctAnswer) {
        return { baseClass: "bg-blue-500 border-blue-800" };
      }
    } else {
      // Subtraktion: ROT als Basis, dann GRÜN oder BLAU als transparentes Overlay
      if (index < correctAnswer) {
        // Bleibt: ROT Basis + GRÜN Overlay (70% opacity)
        return {
          baseClass: "bg-red-500 border-red-800",
          overlayClass: "absolute inset-0 bg-green-500/70 rounded-full"
        };
      } else if (index < number1) {
        // Weggenommen: ROT Basis + BLAU Overlay (70% opacity)
        return {
          baseClass: "bg-red-500 border-red-800",
          overlayClass: "absolute inset-0 bg-blue-500/70 rounded-full"
        };
      }
    }
    return { baseClass: "bg-gray-200/50" };
  };


  return (
    <div className={cn("w-full", className)} data-testid="live-counters">
      <div className="flex flex-wrap gap-2 justify-center min-h-[100px] items-center max-w-xl">
        {counters.map((i) => {
            const isAfterFive = (i + 1) % 5 === 0;
            const isAfterTen = (i + 1) === 10;
            const counterConfig = getCounterConfig(i);

            return (
              <div
                key={i}
                className={cn(
                  "h-10 w-10 rounded-full border-4 transition-all duration-300 relative",
                  counterConfig.baseClass,
                  isAfterFive && !isAfterTen && "mr-3",
                  isAfterTen && "mr-8"
                )}
                data-testid={`counter-${i}`}
              >
                {counterConfig.overlayClass && (
                  <div className={counterConfig.overlayClass}></div>
                )}
              </div>
            );
          })}
      </div>

      {showAnswer && !shouldHideSolution && ( // Conditionally render answer
        <div className="text-center text-xl font-bold mt-3 pt-3">
          <span className="text-red-600">{number1}</span>
          <span className="mx-2 text-foreground">{operation}</span>
          <span className="text-blue-600">{number2}</span>
          <span className="mx-2 text-foreground">=</span>
          <span className="text-green-600">{displayResult}</span>
        </div>
      )}
    </div>
  );
}