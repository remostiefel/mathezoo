import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface NumberLineProps {
  value: number;
  max?: number;
  onValueChange?: (value: number) => void;
  showJumps?: boolean;
  jumps?: Array<{ from: number; to: number }>;
  className?: string;
}

export function NumberLine({ 
  value, 
  max = 20, 
  onValueChange,
  showJumps = false,
  jumps = [],
  className 
}: NumberLineProps) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const numbers = Array.from({ length: max + 1 }, (_, i) => i);

  const handleNumberClick = (num: number) => {
    if (onValueChange) {
      onValueChange(num);
    }
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="number-line">
      {/* Number Line */}
      <div className="relative">
        {/* Main Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2" />

        {/* Numbers and Tick Marks */}
        <div className="relative flex justify-between items-center">
          {numbers.map((num) => {
            const isInTensZone = num >= 10;
            const isCurrent = num === value;
            const isHovered = num === hoveredNumber;

            return (
              <div key={num} className="relative flex flex-col items-center">
                {/* Tick Mark */}
                <div className={cn(
                  "w-0.5 h-6 bg-border transition-all",
                  (isCurrent || isHovered) && "h-8 bg-primary"
                )} />

                {/* Number */}
                <button
                  onClick={() => handleNumberClick(num)}
                  onMouseEnter={() => setHoveredNumber(num)}
                  onMouseLeave={() => setHoveredNumber(null)}
                  className={cn(
                    "mt-2 text-sm font-mono transition-all",
                    "hover:scale-110 active:scale-95",
                    isCurrent && "font-bold text-lg",
                    isInTensZone ? "text-tens-zone" : "text-ones-zone",
                    onValueChange && "cursor-pointer"
                  )}
                  data-testid={`number-${num}`}
                >
                  {num}
                </button>

                {/* Current Position Indicator */}
                {isCurrent && (
                  <div className="absolute -top-4 animate-pulse">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      isInTensZone ? "bg-tens-zone" : "bg-ones-zone",
                      "shadow-lg"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Jump Arcs (SVG) */}
        {showJumps && jumps.length > 0 && (
          <svg 
            className="absolute -top-12 left-0 w-full h-16 pointer-events-none"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            {jumps.map((jump, idx) => {
              const startX = (jump.from / max) * 100;
              const endX = (jump.to / max) * 100;
              const midX = (startX + endX) / 2;
              const arcHeight = 15;

              return (
                <path
                  key={idx}
                  d={`M ${startX} 20 Q ${midX} ${20 - arcHeight} ${endX} 20`}
                  fill="none"
                  stroke="hsl(var(--discovery))"
                  strokeWidth="0.5"
                  className="animate-in fade-in duration-500"
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Value Display */}
      <div className="text-center">
        <span className="text-2xl font-mono font-bold">{value}</span>
      </div>
    </div>
  );
}
