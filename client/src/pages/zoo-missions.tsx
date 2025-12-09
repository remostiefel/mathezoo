import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, Target, Trophy, Globe } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";

interface Mission {
  id: string;
  type: 'continent' | 'group' | 'special';
  title: string;
  description: string;
  emoji: string;
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  completedAt: Date | null;
  coinReward: number;
  xpReward: number;
  badgeReward?: string;
  difficulty: number;
  unlockLevel: number;
}

export default function ZooMissions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: missions, isLoading } = useQuery<Mission[]>({
    queryKey: ['/api/zoo/missions', user?.id],
    enabled: !!user?.id,
  });

  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      return apiRequest(`/api/zoo/missions/${missionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
      });
    },
    onSuccess: (data, missionId) => {
      const mission = missions?.find(m => m.id === missionId);
      toast({
        title: "🎯 Mission geschafft!",
        description: `${mission?.emoji} ${mission?.title} abgeschlossen! +${data.rewards.coins} Münzen`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/missions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Mission konnte nicht abgeschlossen werden",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-missions" />
      </div>
    );
  }

  const continentMissions = missions?.filter(m => m.type === 'continent') || [];
  const groupMissions = missions?.filter(m => m.type === 'group') || [];
  const specialMissions = missions?.filter(m => m.type === 'special') || [];

  // Wenn keine Missionen verfügbar sind
  if (!missions || missions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <AppNavigation />

        <div className="container mx-auto p-6">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Target className="w-10 h-10 text-primary" />
              Tier-Rettungs-Missionen
            </h1>
            <p className="text-muted-foreground text-lg">
              Hilf mit, Tiere aus der ganzen Welt zu retten!
            </p>
          </div>

        <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">Noch keine Missionen freigeschaltet!</h3>
              <p className="text-muted-foreground mb-6">
                Beginne mit dem Mathe-Training, um deine ersten Tier-Rettungs-Missionen freizuschalten.
                Je mehr du übst, desto mehr spannende Missionen werden verfügbar!
              </p>
              <Button onClick={() => window.location.href = '/student'} size="lg">
                Zum Training 🚀
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AppNavigation />

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3" data-testid="text-page-title">
            <Target className="w-10 h-10 text-primary" />
            Tier-Rettungs-Missionen
          </h1>
          <p className="text-muted-foreground text-lg">
            Hilf mit, Tiere aus der ganzen Welt zu retten!
          </p>
        </div>

      <div className="space-y-6">
        {continentMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Kontinente erkunden
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {continentMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={() => completeMissionMutation.mutate(mission.id)}
                  isCompleting={completeMissionMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {groupMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Tier-Gruppen retten
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={() => completeMissionMutation.mutate(mission.id)}
                  isCompleting={completeMissionMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {specialMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Spezial-Missionen
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {specialMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={() => completeMissionMutation.mutate(mission.id)}
                  isCompleting={completeMissionMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function MissionCard({ 
  mission, 
  onComplete, 
  isCompleting 
}: { 
  mission: Mission; 
  onComplete: () => void; 
  isCompleting: boolean;
}) {
  const progressPercentage = Math.round((mission.currentProgress / mission.targetCount) * 100);
  const canComplete = mission.currentProgress >= mission.targetCount && !mission.isCompleted;

  const difficultyColors = {
    1: 'bg-green-500',
    2: 'bg-blue-500',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };

  return (
    <Card
      key={mission.id}
      className={mission.isCompleted ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:bg-gradient-to-br dark:from-yellow-950/40 dark:via-amber-950/40 dark:to-yellow-950/40 shadow-lg shadow-yellow-500/30' : 'hover-elevate'}
      data-testid={`card-mission-${mission.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl" data-testid={`text-emoji-${mission.id}`}>{mission.emoji}</span>
            <div>
              <CardTitle className="text-lg" data-testid={`text-title-${mission.id}`}>
                {mission.title}
              </CardTitle>
            </div>
          </div>
          {mission.isCompleted && (
            <CheckCircle2 className="w-6 h-6 text-yellow-600" />
          )}
        </div>
        <CardDescription data-testid={`text-description-${mission.id}`}>
          {mission.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium" data-testid={`text-progress-${mission.id}`}>
              {mission.currentProgress} / {mission.targetCount}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" data-testid={`progress-bar-${mission.id}`} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" data-testid={`badge-reward-${mission.id}`}>
            💰 {mission.coinReward}
          </Badge>
          <Badge variant="secondary">
            ⭐ {mission.xpReward} XP
          </Badge>
          <div className={`w-2 h-2 rounded-full ${difficultyColors[mission.difficulty as keyof typeof difficultyColors]}`} />
        </div>

        {canComplete && (
          <Button
            onClick={onComplete}
            disabled={isCompleting}
            className="w-full"
            data-testid={`button-complete-${mission.id}`}
          >
            {isCompleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Belohnung abholen! 🎁'
            )}
          </Button>
        )}

        {mission.isCompleted && (
          <div className="text-center py-2 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 dark:bg-gradient-to-r dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 rounded-md text-yellow-700 dark:text-yellow-400 font-bold">
            ✓ MISSION ERFÜLLT!
          </div>
        )}
      </CardContent>
    </Card>
  );
}