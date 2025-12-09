import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface HundredFieldProps {
  value: number;
  onChange?: (newValue: number) => void;
  highlightTens?: boolean;
  showNumbers?: boolean;
  className?: string;
}

export function HundredField({ 
  value, 
  onChange, 
  highlightTens = true,
  showNumbers = false,
  className 
}: HundredFieldProps) {
  
  useEffect(() => {
    // Trigger sync animation when value changes
    const element = document.getElementById('hundred-field-container');
    if (element) {
      element.classList.add('animate-sync-pulse');
      setTimeout(() => element.classList.remove('animate-sync-pulse'), 300);
    }
  }, [value]);

  const handleCellClick = (cellNumber: number) => {
    if (!onChange) return;
    
    // Toggle: if clicking on current value, decrease by 1, otherwise set to clicked value
    if (cellNumber === value) {
      onChange(Math.max(0, value - 1));
    } else if (cellNumber < value) {
      onChange(cellNumber);
    } else {
      onChange(cellNumber);
    }
  };

  return (
    <div 
      id="hundred-field-container"
      className={cn("relative", className)}
    >
      <div className="grid grid-cols-10 gap-0.5 bg-border p-2 rounded-md">
        {Array.from({ length: 100 }, (_, i) => {
          const cellNumber = i + 1;
          const isFilled = cellNumber <= value;
          const isAfterFifty = i >= 50;
          
          return (
            <button
              key={i}
              data-testid={`cell-hundred-${cellNumber}`}
              onClick={() => handleCellClick(cellNumber)}
              className={cn(
                "aspect-square flex items-center justify-center",
                "text-xs font-mono transition-all duration-200",
                "rounded-sm border",
                isFilled 
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover-elevate active-elevate-2",
                onChange && "cursor-pointer",
                isAfterFifty && i % 10 === 0 && "border-l-4 border-l-border"
              )}
            >
              {showNumbers && cellNumber}
            </button>
          );
        })}
      </div>
      
      {/* Value indicator */}
      <div className="mt-2 text-center font-mono text-lg text-foreground">
        {value}
      </div>
      
      {/* Place value breakdown */}
      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-tens-zone"></span>
          {Math.floor(value / 10)} Zehner
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-ones-zone"></span>
          {value % 10} Einer
        </span>
      </div>
    </div>
  );
}
