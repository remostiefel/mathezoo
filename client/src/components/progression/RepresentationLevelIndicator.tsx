import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, TrendingDown } from "lucide-react";

interface RepresentationLevelIndicatorProps {
  level: number; // 0-5
  message: string;
  consecutiveCorrect?: number;
  onRequestSupport?: () => void;
}

const RL_VISUALS = {
  5: { stars: '⭐⭐⭐⭐⭐', color: 'bg-blue-500/10 border-blue-500/30', name: 'Viele Hilfen' },
  4: { stars: '⭐⭐⭐⭐🌟', color: 'bg-green-500/10 border-green-500/30', name: 'Viele Hilfen' },
  3: { stars: '⭐⭐⭐🌟🌟', color: 'bg-yellow-500/10 border-yellow-500/30', name: 'Basis-Hilfen' },
  2: { stars: '⭐⭐🌟🌟🌟', color: 'bg-orange-500/10 border-orange-500/30', name: 'Wenig Hilfen' },
  1: { stars: '⭐🌟🌟🌟🌟', color: 'bg-purple-500/10 border-purple-500/30', name: 'Nur Rechnung' },
};

export function RepresentationLevelIndicator({
  level,
  message,
  consecutiveCorrect = 0,
  onRequestSupport,
}: RepresentationLevelIndicatorProps) {
  const visual = RL_VISUALS[level as keyof typeof RL_VISUALS];
  
  // Progress towards next level (5 consecutive correct needed)
  const progressToNext = level > 1 ? (consecutiveCorrect / 5) * 100 : 100;
  const tasksRemaining = level > 1 ? Math.max(0, 5 - consecutiveCorrect) : 0;
  
  return (
    <div 
      className="flex items-center gap-2 border rounded px-2 py-1 shrink-0"
      data-testid="card-representation-level"
    >
      {/* Stars display */}
      <div className="text-sm" data-testid="text-rl-stars">
        {visual.stars}
      </div>
      
      {/* Progress indicator (only if not at minimum) */}
      {level > 1 && (
        <div className="flex items-center gap-1">
          <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-achievement transition-all duration-300"
              style={{ width: `${progressToNext}%` }}
              data-testid="progress-rl-advancement"
            />
          </div>
          <span className="text-xs text-muted-foreground" data-testid="text-rl-progress">
            {consecutiveCorrect}/5
          </span>
        </div>
      )}
      
      {/* Support Request Button */}
      {level < 5 && onRequestSupport && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onRequestSupport}
          data-testid="button-request-support"
        >
          <Lightbulb className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
