import { cn } from "@/lib/utils";

interface LiveNumberLineProps {
  number1: number;
  number2: number;
  operation: '+' | '-';
  showAnswer?: boolean;
  className?: string;
  hideSolution?: boolean;
  placeholderPosition?: 'start' | 'middle' | 'end';
  numberRange?: 20 | 100;
}

export function LiveNumberLine({
  number1,
  number2,
  operation,
  showAnswer = false,
  className,
  hideSolution = false,
  placeholderPosition = 'end',
  numberRange = 20
}: LiveNumberLineProps) {
  const max = numberRange;
  const result = operation === '+' ? number1 + number2 : number1 - number2;

  // Determine what to show based on placeholder position
  let startPoint: number;
  let endPoint: number;
  let showStartNumber: boolean;
  let showEndNumber: boolean;
  let blueLineLabel: string | null = null;

  if (placeholderPosition === 'start') {
    // Placeholder at start: _+4=10 or _-8=10
    if (operation === '+') {
      // _+4=10: start=6(hidden), end=10(shown), blue=+4
      startPoint = number1;
      endPoint = result;
      showStartNumber = false; // Don't show the solution!
      showEndNumber = true; // Show target
      blueLineLabel = `+${number2}`;
    } else {
      // _-8=2: start=10(hidden), end=2(shown), blue=-8
      startPoint = number1;
      endPoint = result;
      showStartNumber = false; // Don't show the solution!
      showEndNumber = true; // Show target
      blueLineLabel = `-${number2}`;
    }
  } else if (placeholderPosition === 'middle') {
    // Placeholder in middle: 7+_=14 or 10-_=2
    // Show both endpoints (start and result), but NO label on blue line
    if (operation === '+') {
      startPoint = number1;
      endPoint = result;
    } else {
      startPoint = number1;
      endPoint = result;
    }
    showStartNumber = true;
    showEndNumber = true;
    blueLineLabel = null; // Don't show label - would reveal the solution!
  } else {
    // Placeholder at end (standard): 6+4=_ or 10-8=_
    startPoint = operation === '+' ? number1 : number1;
    endPoint = result;
    showStartNumber = true;
    showEndNumber = showAnswer && !hideSolution;
    blueLineLabel = operation === '+' ? `+${number2}` : `-${number2}`;
  }

  // Create points - for ZR100 show every 5th, but always include start/end points
  const points: JSX.Element[] = [];
  const step = numberRange === 100 ? 5 : 1;
  const pointsToShow = new Set<number>();
  
  // Add regular grid points
  for (let i = step; i <= max; i += step) {
    pointsToShow.add(i);
  }
  
  // Always include start and end points for visualization
  if (startPoint >= 1 && startPoint <= max) pointsToShow.add(startPoint);
  if (endPoint >= 1 && endPoint <= max) pointsToShow.add(endPoint);
  
  // Sort points for rendering
  const sortedPoints = Array.from(pointsToShow).sort((a, b) => a - b);
  
  sortedPoints.forEach(i => {
    const isFive = i % 5 === 0;
    const isTen = i % 10 === 0;

    let pointClass = "h-2 w-2 bg-gray-300";
    let showNumber = false;
    let numberValue = "";

    if (i === startPoint) {
      // Red starting point
      pointClass = "h-12 w-12 bg-red-500 ring-2 ring-red-300";
      showNumber = showStartNumber;
      numberValue = String(startPoint);
    } else if (i === endPoint) {
      // Green end point
      pointClass = "h-12 w-12 bg-green-500 ring-2 ring-green-300";
      showNumber = showEndNumber;
      numberValue = String(endPoint);
    } else if (isTen) {
      pointClass = "h-3 w-3 bg-gray-500";
    } else if (isFive) {
      pointClass = "h-2.5 w-2.5 bg-gray-400";
    }

    points.push(
      <div key={i} className="relative flex flex-col items-center gap-1">
        <div className={cn(
          "rounded-full transition-all duration-300 flex items-center justify-center",
          pointClass
        )}>
          {showNumber && (
            <span className="text-white font-bold text-2xl">
              {numberValue}
            </span>
          )}
        </div>
        {isFive && (
          <span className="text-base font-bold text-muted-foreground">
            {i}
          </span>
        )}
      </div>
    );
  });

  // Calculate positions for blue line and label
  const lineStartPos = operation === '+' ? startPoint : endPoint;
  const lineEndPos = operation === '+' ? endPoint : startPoint;
  const lineLeft = ((Math.min(lineStartPos, lineEndPos) - 1) / (max - 1)) * 100;
  const lineWidth = ((Math.abs(lineEndPos - lineStartPos)) / (max - 1)) * 100;
  const lineMidpoint = lineLeft + (lineWidth / 2);

  return (
    <div className={cn("w-full", className)} data-testid="live-number-line">
      <div className="relative">
        {/* Number line base */}
        <div className="absolute w-full h-1 bg-gray-400 top-[13px]" style={{ zIndex: 1 }} />

          {/* Blue line with label */}
          {number2 > 0 && (
            <>
              <div
                className="absolute h-2 bg-blue-500 top-[12px] rounded-full"
                style={{
                  left: `${lineLeft}%`,
                  width: `${lineWidth}%`,
                  zIndex: 2
                }}
              />
              {blueLineLabel && (
                <div
                  className="absolute top-[-12px] transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded text-lg font-bold shadow-md"
                  style={{
                    left: `${lineMidpoint}%`,
                    zIndex: 3
                  }}
                >
                  {blueLineLabel}
                </div>
              )}
            </>
          )}

          {/* Number line points */}
        <div className="flex justify-between items-center pb-2 relative z-10">
          {points}
        </div>
      </div>
    </div>
  );
}