import { cn } from "@/lib/utils";
import { useState } from "react";

interface Counter {
  id: string;
  x: number;
  y: number;
  color: 'tens' | 'ones' | 'neutral';
}

interface DraggableCountersProps {
  count: number;
  onCountChange?: (count: number) => void;
  className?: string;
}

export function DraggableCounters({ 
  count, 
  onCountChange,
  className 
}: DraggableCountersProps) {
  const [counters, setCounters] = useState<Counter[]>(() => 
    Array.from({ length: count }, (_, i) => ({
      id: `counter-${i}`,
      x: (i % 10) * 40 + 20,
      y: Math.floor(i / 10) * 40 + 20,
      color: i < 10 ? 'tens' as const : 'ones' as const,
    }))
  );

  const [draggedCounter, setDraggedCounter] = useState<string | null>(null);

  const handleAddCounter = () => {
    if (onCountChange && count < 20) {
      onCountChange(count + 1);
      const newCounter: Counter = {
        id: `counter-${count}`,
        x: (count % 10) * 40 + 20,
        y: Math.floor(count / 10) * 40 + 20,
        color: count < 10 ? 'tens' : 'ones',
      };
      setCounters([...counters, newCounter]);
    }
  };

  const handleRemoveCounter = () => {
    if (onCountChange && count > 0) {
      onCountChange(count - 1);
      setCounters(counters.slice(0, -1));
    }
  };

  const getCounterColor = (color: Counter['color']) => {
    switch (color) {
      case 'tens':
        return 'bg-tens-zone border-tens-zone';
      case 'ones':
        return 'bg-ones-zone border-ones-zone';
      default:
        return 'bg-primary border-primary';
    }
  };

  return (
    <div className={cn("space-y-4", className)} data-testid="draggable-counters">
      {/* Counter Display Area */}
      <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 h-96 overflow-hidden">
        {counters.map((counter) => (
          <div
            key={counter.id}
            className={cn(
              "absolute w-8 h-8 rounded-full border-2 shadow-md",
              "transition-transform hover:scale-110 active:scale-95",
              "cursor-move",
              getCounterColor(counter.color),
              draggedCounter === counter.id && "opacity-50"
            )}
            style={{
              left: `${counter.x}px`,
              top: `${counter.y}px`,
            }}
            draggable={!!onCountChange}
            onDragStart={() => setDraggedCounter(counter.id)}
            onDragEnd={() => setDraggedCounter(null)}
            data-testid={`counter-${counter.id}`}
          />
        ))}

        {counters.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Klicken Sie auf '+', um Plättchen hinzuzufügen</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {onCountChange && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRemoveCounter}
            disabled={count === 0}
            className={cn(
              "h-10 w-10 rounded-full border-2 border-primary",
              "flex items-center justify-center",
              "text-xl font-bold text-primary",
              "hover-elevate active-elevate-2 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            data-testid="button-remove-counter"
          >
            −
          </button>

          <div className="text-center min-w-[60px]">
            <span className="text-2xl font-mono font-bold">{count}</span>
          </div>

          <button
            onClick={handleAddCounter}
            disabled={count === 20}
            className={cn(
              "h-10 w-10 rounded-full border-2 border-primary",
              "flex items-center justify-center",
              "text-xl font-bold text-primary",
              "hover-elevate active-elevate-2 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            data-testid="button-add-counter"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
