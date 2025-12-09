import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionTrackerProps {
  studentId: number;
  className?: string;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  category: string;
}

export function MissionTracker({ studentId, className }: MissionTrackerProps) {
  const { data: missions, isLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions', studentId],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const activeMissions = missions?.filter(m => !m.isCompleted) || [];
  const completedMissions = missions?.filter(m => m.isCompleted) || [];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Missionen</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeMissions.length === 0 && completedMissions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Noch keine Missionen verfügbar
          </p>
        ) : (
          <>
            {activeMissions.map((mission) => {
              const progress = (mission.currentCount / mission.targetCount) * 100;
              
              return (
                <div
                  key={mission.id}
                  className="space-y-2 p-3 rounded-md bg-muted/50"
                  data-testid={`mission-${mission.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-sm font-medium">{mission.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        {mission.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {mission.currentCount}/{mission.targetCount}
                    </Badge>
                  </div>
                  <Progress
                    value={progress}
                    className="h-1.5"
                    data-testid={`progress-mission-${mission.id}`}
                  />
                </div>
              );
            })}

            {completedMissions.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Abgeschlossen</p>
                {completedMissions.slice(0, 3).map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center gap-2 py-1.5"
                    data-testid={`mission-completed-${mission.id}`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-achievement flex-shrink-0" />
                    <p className="text-xs text-muted-foreground line-through">
                      {mission.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
