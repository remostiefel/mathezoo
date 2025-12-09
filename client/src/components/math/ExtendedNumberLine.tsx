import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ExtendedNumberLineProps {
  value: number;
  onChange?: (newValue: number) => void;
  numberRange?: 20 | 100 | 200 | 300;
  showJumps?: boolean;
  number1?: number;
  number2?: number;
  operation?: '+' | '-';
  className?: string;
  hideSolution?: boolean; // Added hideSolution prop
}

export function ExtendedNumberLine({ 
  value, 
  onChange, 
  numberRange = 20,
  showJumps = true,
  number1,
  number2,
  operation,
  className,
  hideSolution = false // Default to false if not provided
}: ExtendedNumberLineProps) {
  // Always show full range - no zoom
  const zoomStart = 0;
  const zoomEnd = numberRange;

  useEffect(() => {
    // Trigger sync animation
    const element = document.getElementById('number-line-container');
    if (element) {
      element.classList.add('animate-sync-pulse');
      setTimeout(() => element.classList.remove('animate-sync-pulse'), 300);
    }
  }, [value, numberRange, number1]);

  const handleLineClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!onChange) return;

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickedValue = Math.round((x / rect.width) * (zoomEnd - zoomStart) + zoomStart);

    onChange(Math.max(0, Math.min(numberRange, clickedValue)));
  };

  // Calculate visible ticks - only show major milestones for 100+
  const visibleTicks = [];
  if (numberRange >= 100) {
    // For 100, 200, 300: only show 0, 50, 100, 150, 200, 250, 300, etc.
    for (let i = zoomStart; i <= zoomEnd; i += 50) {
      visibleTicks.push(i);
    }
  } else {
    // For 20: show all numbers
    for (let i = zoomStart; i <= zoomEnd; i += 1) {
      visibleTicks.push(i);
    }
  }

  // Position calculation
  const getPosition = (num: number) => {
    return ((num - zoomStart) / (zoomEnd - zoomStart)) * 100;
  };

  return (
    <div 
      id="number-line-container"
      className={cn("space-y-2 min-h-[100px]", className)}
      style={{ height: '100px' }}
    >
      {/* Number line SVG */}
      <svg
        onClick={handleLineClick}
        viewBox="0 0 100 12"
        className={cn(
          "w-full h-16",
          onChange && "cursor-pointer"
        )}
        data-testid="svg-number-line"
      >
        {/* Main line */}
        <line
          x1="0"
          y1="6"
          x2="100"
          y2="6"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-foreground"
        />

        {/* Tick marks */}
        {visibleTicks.map((tick) => {
          const pos = getPosition(tick);

          return (
            <g key={tick}>
              <line
                x1={pos}
                y1={3}
                x2={pos}
                y2={9}
                stroke="currentColor"
                strokeWidth="0.4"
                className="text-muted-foreground"
              />
              <text
                x={pos}
                y="11.5"
                textAnchor="middle"
                fontSize="3"
                className="fill-foreground font-sans font-bold"
                style={{ letterSpacing: '0.05em' }}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Current value marker */}
        {!hideSolution && ( // Only show current value marker if not hiding solution
          <circle
            cx={getPosition(value)}
            cy="6"
            r="1.2"
            className="fill-primary stroke-primary-foreground"
            strokeWidth="0.3"
          />
        )}

        {/* Blue lines and circles for visualization - MATCHING LiveNumberLine logic */}
        {number1 !== undefined && number2 !== undefined && operation !== undefined && (() => {
          // Determine visualization based on operation:
          // - Addition: TARGET is number1 + number2
          // - Subtraction: TARGET is number1 - number2
          const result = operation === '+' ? number1 + number2 : number1 - number2;
          const startValue = number1;
          const endValue = result;
          const startX = getPosition(startValue);
          const endX = getPosition(endValue);
          const lineY = 6;
          const distance = Math.abs(endValue - startValue);

          return (
            <>
              {/* Blue line connecting red to green - always show */}
              <line
                x1={startX}
                y1={lineY}
                x2={endX}
                y2={lineY}
                stroke="#3b82f6"
                strokeWidth="1.5"
                className="opacity-95"
              />

              {/* Blue arc and label - only if NOT hiding solution */}
              {!hideSolution && (
                <>
                  {/* Arc from center to center */}
                  {showJumps && (
                    <path
                      d={`M ${startX} ${lineY} Q ${(startX + endX) / 2} 2, ${endX} ${lineY}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="0.5"
                      className="opacity-70"
                    />
                  )}

                  {/* Blue line label - shows the distance */}
                  <text
                    x={(startX + endX) / 2}
                    y="2"
                    textAnchor="middle"
                    fontSize="1.5"
                    className="fill-blue-600 font-bold"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {operation === '+' ? `+${distance}` : `-${distance}`}
                  </text>
                </>
              )}

              {/* Red starting point - always show circle */}
              <circle cx={startX} cy={lineY} r="2.5" className="fill-red-500" />
              {/* Red number - only if NOT hiding solution */}
              {!hideSolution && (
                <text
                  x={startX}
                  y="6.7"
                  textAnchor="middle"
                  fontSize="1.4"
                  className="fill-white font-sans font-bold"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {startValue}
                </text>
              )}

              {/* Green end point - always show circle */}
              <circle cx={endX} cy={lineY} r="2.5" className="fill-green-500" />
              {/* Green number - only if NOT hiding solution */}
              {!hideSolution && (
                <text
                  x={endX}
                  y="6.7"
                  textAnchor="middle"
                  fontSize="1.4"
                  className="fill-white font-sans font-bold"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {endValue}
                </text>
              )}
            </>
          );
        })()}
      </svg>

      {/* Value display - always reserve space, but make invisible if hiding solution */}
      <div className="text-center h-12">
        <span className={cn(
          "font-mono text-4xl font-bold text-foreground",
          hideSolution && "invisible"
        )}>{value}</span>
        <span className={cn(
          "ml-2 text-xl text-muted-foreground",
          hideSolution && "invisible"
        )}>
          / {numberRange}
        </span>
      </div>
    </div>
  );
}