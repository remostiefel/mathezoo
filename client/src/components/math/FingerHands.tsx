import { cn } from "@/lib/utils";

interface FingerHandsProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  className?: string;
}

export function FingerHands({ number1, number2, operation, className }: FingerHandsProps) {
  const correctAnswer = operation === '+' ? number1 + number2 : number1 - number2;

  const getFingerColor = (fingerIndex: number): string => {
    if (operation === '+') {
      // Addition: rot für number1, blau für number2
      if (fingerIndex < number1) {
        return "#ef4444"; // red-500
      } else if (fingerIndex >= number1 && fingerIndex < correctAnswer) {
        return "#3b82f6"; // blue-500
      }
    } else {
      // Subtraktion: grün für das was bleibt, blau für das was weggenommen wird
      if (fingerIndex < correctAnswer) {
        return "#22c55e"; // green-500 (bleibt)
      } else if (fingerIndex < number1) {
        return "#3b82f6"; // blue-500 (wird weggenommen)
      }
    }
    return "#e5e7eb"; // gray-200
  };

  const isFingerExtended = (fingerIndex: number): boolean => {
    // Bei Subtraktion: Zeige number1 Finger (die Ausgangszahl)
    // Bei Addition: Zeige correctAnswer Finger (das Ergebnis)
    if (operation === '-') {
      return fingerIndex < number1;
    }
    return fingerIndex < correctAnswer;
  };

  const getFingerBorderColor = (fingerIndex: number): string => {
    // Für Addition: aktive Finger bekommen grüne Umrandung (Resultat)
    if (operation === '+' && fingerIndex < correctAnswer) {
      return "#22c55e"; // green-500 border for addition result
    }
    // Für Subtraktion: aktive Finger bekommen rote Umrandung
    if (operation === '-' && fingerIndex < correctAnswer) {
      return "#ef4444"; // red border for subtraction result
    }
    // Inaktive Finger: graue Umrandung für graue Füllung
    const color = getFingerColor(fingerIndex);
    return color === "#e5e7eb" ? "#d1d5db" : "#ef4444";
  };

  const renderSVGHand = (isLeft: boolean, startIndex: number) => {
    const fingerIndices = isLeft ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9];

    // For ZR > 20, use smaller squares instead of long fingers
    const isSmallSquares = correctAnswer > 20;
    const fingerWidth = isSmallSquares ? 12 : 18;
    const fingerGap = isSmallSquares ? 4 : 6;
    const spacing = fingerWidth + fingerGap;

    const palmWidth = 5 * fingerWidth + 4 * fingerGap + 8;
    const firstFingerX = isLeft ? 15 : 15;
    const palmX = firstFingerX - 4;

    return (
      <svg width="140" height="160" viewBox="0 0 140 160" className="mx-auto">
        <rect
          x={palmX}
          y="110"
          width={palmWidth}
          height="45"
          rx="15"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />

        {fingerIndices.map((globalIndex, localIndex) => {
          const actualIndex = startIndex + globalIndex;
          const isExtended = isFingerExtended(actualIndex);
          const color = getFingerColor(actualIndex);

          let fingerX = firstFingerX + (localIndex * spacing);

          // Small squares for ZR > 20, almost square fingers for ZR <= 20
          const fingerY = isSmallSquares ? 100 : (isExtended ? 70 : 90);
          const fingerHeight = isSmallSquares ? 20 : (isExtended ? 80 : 40);

          const borderColor = getFingerBorderColor(actualIndex);

          return (
            <g key={globalIndex}>
              <rect
                x={fingerX}
                y={fingerY}
                width={fingerWidth}
                height={fingerHeight}
                rx={isSmallSquares ? "1" : "2"}
                fill={color}
                stroke={borderColor}
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  const renderHandPair = (pairIndex: number) => {
    const baseIndex = pairIndex * 10;
    // Show hands based on the MAXIMUM number in the calculation, not just the result
    const maxNumberInCalculation = Math.max(number1, number2, correctAnswer);
    const showPair = maxNumberInCalculation > baseIndex;

    if (!showPair) return null;

    return (
      <div key={pairIndex} className="flex gap-1 justify-center items-center">
        <div className="flex flex-col items-center">
          {renderSVGHand(true, baseIndex)}
        </div>
        <div className="flex flex-col items-center">
          {renderSVGHand(false, baseIndex)}
        </div>
      </div>
    );
  };

  // Bestimme die Anzahl der anzuzeigenden Finger basierend auf der Operation
  const displayCount = operation === '-' ? number1 : correctAnswer;

  return (
    <div className={cn("w-full", className)} data-testid="finger-hands">
      {/* Für Zahlen 1-10: Ein Handpaar */}
      {displayCount <= 10 && (
        <div className="flex justify-center">
          {renderHandPair(0)}
        </div>
      )}

      {/* Für Zahlen 11-20: Zwei Handpaare nebeneinander */}
      {displayCount > 10 && (
        <div className="flex gap-8 justify-center items-center flex-wrap">
          {renderHandPair(0)}
          {renderHandPair(1)}
        </div>
      )}
    </div>
  );
}