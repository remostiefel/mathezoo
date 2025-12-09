import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Sparkles, Lock } from "lucide-react";
import { RepresentationLevelIndicator } from "./RepresentationLevelIndicator";
import { cn } from "@/lib/utils"; // Assuming cn is available for utility functions like merging class names

interface LevelProgress {
  level: number;
  unlockedAt?: string | null;
  masteredAt: string | null;
  attemptsCount: number;
  correctCount: number;
  successRate?: number;
}

interface Milestone {
  milestoneId: string;
  stageTrigger: number;
  achievedAt: string;
  displayName: string;
  icon: string;
}

interface ProgressionVisualizerProps {
  currentLevel: number;
  levelHistory: LevelProgress[];
  milestones: Milestone[];
  currentProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  nextMilestone?: {
    title: string;
    tasksRemaining: number;
  };
  className?: string;
  // AMRS props
  representationLevel?: number;
  representationMessage?: string;
  consecutiveCorrect?: number;
  onRequestSupport?: () => void;
}

// Level names (simplified from backend)
const STAGE_NAMES: Record<number, string> = {
  1: "Erste Schritte",
  2: "Subtraktions-Start",
  3: "Die magische 10",
  4: "In den Zwanziger",
  5: "Rückwärts im Zwanziger",
  6: "Mix im Zwanziger",
  7: "Schnelligkeit zählt",
  8: "Erste Überquerung",
  9: "Übergang mit Größeren",
  10: "Rückwärts über die 10",
  11: "Vollständige Zwanzig-Beherrschung",
  12: "Einstieg Hundert",
  13: "Dekaden-Sprünge",
  14: "Komplexe Zweistelligkeit",
  15: "Hunderterraum mit Übergang",
};

export function ProgressionVisualizer({
  currentLevel,
  levelHistory,
  milestones,
  currentProgress,
  nextMilestone,
  className,
  representationLevel,
  representationMessage,
  consecutiveCorrect,
  onRequestSupport,
}: ProgressionVisualizerProps) {
  
  return (
    <div className={cn("flex items-center gap-3 bg-card border rounded-lg px-3 py-1.5", className)}>
      {/* Level indicator */}
      <Badge variant="outline" className="text-xs py-0 px-2 shrink-0">
        L{currentLevel}
      </Badge>
      
      {/* Progress bar */}
      <div className="flex-1 min-w-[120px] max-w-[200px]">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-xs font-medium truncate" data-testid="text-current-level-name">
            Level {currentLevel}
          </p>
          <p className="text-xs font-medium ml-2 shrink-0" data-testid="text-progress-fraction">
            {currentProgress.current}/{currentProgress.total}
          </p>
        </div>
        <Progress 
          value={currentProgress.percentage} 
          className="h-1" 
          data-testid="progress-current-level"
        />
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {milestones.slice(-2).reverse().map((milestone) => (
            <span key={milestone.milestoneId} className="text-sm">{milestone.icon}</span>
          ))}
        </div>
      )}

      {/* Representation Level Indicator - horizontal */}
      {representationLevel !== undefined && (
        <RepresentationLevelIndicator
          level={representationLevel}
          message={representationMessage || ""}
          consecutiveCorrect={consecutiveCorrect}
          onRequestSupport={onRequestSupport}
        />
      )}
    </div>
  );
}