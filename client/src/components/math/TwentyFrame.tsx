import { cn } from "@/lib/utils";

interface TwentyFrameProps {
  filledCount: number;
  onCountChange?: (count: number) => void;
  highlightTens?: boolean;
  className?: string;
  operation?: '+' | '-';
  number1?: number;
  number2?: number;
}

export function TwentyFrame({
  filledCount,
  onCountChange,
  highlightTens = true,
  className,
  operation,
  number1,
  number2
}: TwentyFrameProps) {
  const circles = Array.from({ length: 20 }, (_, i) => i);
  const isFilled = (index: number) => index < filledCount;
  const isInTensZone = (index: number) => index >= 10;

  const handleCircleClick = (index: number) => {
    if (onCountChange) {
      // Toggle fill: if clicking on filled, decrease count; if empty, increase count
      if (isFilled(index)) {
        onCountChange(index);
      } else {
        onCountChange(index + 1);
      }
    }
  };

  const getCircleColor = (index: number) => {
    if (!isFilled(index)) {
      return "bg-background border-muted-foreground/30";
    }

    // For subtraction: remaining circles are red, subtracted circles are blue
    if (operation === '-' && number1 !== undefined) {
      if (index < filledCount) {
        return "bg-red-500 border-red-800 shadow-sm"; // Remaining (result)
      } else if (index < number1) {
        return "bg-blue-500 border-blue-800 shadow-sm"; // Subtracted
      }
    }

    // For addition: all filled circles get green border (result)
    if (operation === '+') {
      if (highlightTens) {
        return isInTensZone(index)
          ? "bg-ones-zone border-green-500 shadow-sm relative z-20"
          : "bg-tens-zone border-green-500 shadow-sm relative z-20";
      }
      return "bg-primary border-green-500 shadow-sm relative z-20";
    }

    // Default behavior
    if (highlightTens) {
      return isInTensZone(index)
        ? "bg-ones-zone border-ones-zone shadow-sm"
        : "bg-tens-zone border-tens-zone shadow-sm";
    }

    return "bg-primary border-primary shadow-sm";
  };

  return (
    <div className={cn("space-y-2", className)} data-testid="twenty-frame">
      {/* Top Row (0-9) */}
      <div className="grid grid-cols-10 gap-2">
        {circles.slice(0, 10).map((index) => (
          <button
            key={index}
            onClick={() => handleCircleClick(index)}
            className={cn(
              "aspect-square rounded-full border-4 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              getCircleColor(index),
              onCountChange && "cursor-pointer"
            )}
            aria-label={`Position ${index + 1}`}
            data-testid={`circle-${index}`}
          />
        ))}
      </div>

      {/* Bottom Row (10-19) */}
      <div className="grid grid-cols-10 gap-2">
        {circles.slice(10, 20).map((index) => (
          <button
            key={index}
            onClick={() => handleCircleClick(index)}
            className={cn(
              "aspect-square rounded-full border-4 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              getCircleColor(index),
              onCountChange && "cursor-pointer"
            )}
            aria-label={`Position ${index + 1}`}
            data-testid={`circle-${index}`}
          />
        ))}
      </div>

      {/* Count Display */}
      <div className="text-center">
        <span className="text-2xl font-mono font-bold">{filledCount}</span>
      </div>
    </div>
  );
}