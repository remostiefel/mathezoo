import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Trophy, CheckCircle2, Crown, Home, LogOut, ArrowLeft } from "lucide-react";
import { AppNavigation } from "@/components/ui/app-navigation";

interface BigGoal {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetProgress: number;
  currentProgress: number;
  measureType: 'animals' | 'coins' | 'xp' | 'games_played' | 'continents' | 'groups';
  hugereward: {
    coins: number;
    xp: number;
    badge: string;
  };
  isCompleted: boolean;
  completedAt: Date | null;
}

const DEFAULT_BIG_GOALS: BigGoal[] = [
  {
    id: 'world-collector',
    title: 'Welt-Sammler',
    description: 'Sammle Tiere von allen 6 Kontinenten!',
    emoji: '🌍',
    targetProgress: 6,
    currentProgress: 0,
    measureType: 'continents',
    hugereward: { coins: 5000, xp: 1000, badge: '🌎 Weltenbummler' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'zoo-champion',
    title: 'Zoo-Champion',
    description: 'Erreiche 10.000 Punkte im Training!',
    emoji: '👑',
    targetProgress: 10000,
    currentProgress: 0,
    measureType: 'xp',
    hugereward: { coins: 3000, xp: 500, badge: '👑 Champion' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'math-wizard',
    title: 'Rechen-Blitz',
    description: 'Löse 1000 Aufgaben fehlerfrei!',
    emoji: '⚡',
    targetProgress: 1000,
    currentProgress: 0,
    measureType: 'games_played',
    hugereward: { coins: 4000, xp: 800, badge: '⚡ Rechen-Magier' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'missions-master',
    title: 'Missionen-Meister',
    description: 'Schliesse alle 15 Tier-Rettungs-Missionen ab!',
    emoji: '🎯',
    targetProgress: 15,
    currentProgress: 0,
    measureType: 'animals',
    hugereward: { coins: 2500, xp: 600, badge: '🎯 Missionsmeister' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'animal-collector',
    title: 'Tier-Sammler',
    description: 'Sammle alle 50+ Tiere für deinen Zoo!',
    emoji: '🦁',
    targetProgress: 50,
    currentProgress: 0,
    measureType: 'animals',
    hugereward: { coins: 3500, xp: 700, badge: '🦁 Tier-König' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'legendary-explorer',
    title: 'Legendärer Forscher',
    description: 'Erreiche Mastery in 5 verschiedenen Spielen!',
    emoji: '💎',
    targetProgress: 5,
    currentProgress: 0,
    measureType: 'groups',
    hugereward: { coins: 6000, xp: 1500, badge: '💎 Legende' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'coin-king',
    title: 'Münz-König',
    description: 'Verdiene insgesamt 1 Million Münzen!',
    emoji: '💰',
    targetProgress: 1000000,
    currentProgress: 0,
    measureType: 'coins',
    hugereward: { coins: 50000, xp: 2000, badge: '💰 Millionär' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'game-master',
    title: 'Spiele-Meister',
    description: 'Spiele alle 9 Spiele und erreiche Level 5 in jedem!',
    emoji: '🎮',
    targetProgress: 9,
    currentProgress: 0,
    measureType: 'groups',
    hugereward: { coins: 7500, xp: 2500, badge: '🎮 Spiele-Gott' },
    isCompleted: false,
    completedAt: null,
  },
  {
    id: 'perfect-score',
    title: 'Perfektionist',
    description: 'Schliesse 50 aufeinanderfolgende Aufgaben ohne Fehler ab!',
    emoji: '✨',
    targetProgress: 50,
    currentProgress: 0,
    measureType: 'games_played',
    hugereward: { coins: 5500, xp: 1200, badge: '✨ Perfekt' },
    isCompleted: false,
    completedAt: null,
  },
];

export default function ZooBigGoals() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: apiGoals, isLoading } = useQuery<BigGoal[]>({
    queryKey: ['/api/zoo/big-goals', user?.id],
    enabled: !!user?.id,
  });

  // Verwende API-Daten wenn verfügbar, ansonsten Defaults
  const bigGoals = apiGoals && apiGoals.length > 0 ? apiGoals : DEFAULT_BIG_GOALS;

  const completeMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return apiRequest(`/api/zoo/big-goals/${goalId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
      });
    },
    onSuccess: (data, goalId) => {
      const goal = bigGoals?.find(g => g.id === goalId);
      toast({
        title: "🏆 Grosses Ziel erreicht!",
        description: `${goal?.emoji} ${goal?.title}! +${data.rewards.coins} Münzen`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/big-goals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Ziel konnte nicht abgeschlossen werden",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-big-goals" />
      </div>
    );
  }



  const measureTypeLabels = {
    animals: 'Tiere',
    coins: 'Münzen',
    xp: 'Erfahrung',
    games_played: 'Spiele',
    continents: 'Kontinente',
    groups: 'Tier-Gruppen',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AppNavigation />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3" data-testid="text-page-title">
            <Crown className="w-10 h-10 text-yellow-500" />
            Grosse Ziele
          </h1>
          <p className="text-muted-foreground text-lg">
            Meistere diese legendären Herausforderungen!
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bigGoals?.map((goal) => {
          const progressPercentage = Math.round((goal.currentProgress / goal.targetProgress) * 100);
          const canComplete = goal.currentProgress >= goal.targetProgress && !goal.isCompleted;

          return (
            <Card
              key={goal.id}
              className={goal.isCompleted 
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:bg-gradient-to-br dark:from-yellow-950/40 dark:via-amber-950/40 dark:to-yellow-950/40 shadow-lg shadow-yellow-500/30' 
                : 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 opacity-75'}
              data-testid={`card-big-goal-${goal.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-5xl ${goal.isCompleted ? '' : 'grayscale opacity-60'}`} data-testid={`text-emoji-${goal.id}`}>
                      {goal.emoji}
                    </span>
                    <div>
                      <CardTitle className={`text-xl ${goal.isCompleted ? '' : 'text-gray-600 dark:text-gray-300'}`} data-testid={`text-title-${goal.id}`}>
                        {goal.title}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className={`mt-1 ${goal.isCompleted ? '' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {measureTypeLabels[goal.measureType]}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  {goal.isCompleted && (
                    <CheckCircle2 className="w-6 h-6 text-yellow-600" data-testid={`icon-completed-${goal.id}`} />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className={`text-sm ${goal.isCompleted ? 'text-muted-foreground' : 'text-gray-500 dark:text-gray-400'}`} data-testid={`text-description-${goal.id}`}>
                  {goal.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="font-medium" data-testid={`text-progress-${goal.id}`}>
                      {goal.currentProgress} / {goal.targetProgress}
                    </span>
                  </div>
                  <Progress value={goal.isCompleted ? 100 : progressPercentage} className={`h-3 ${goal.isCompleted ? '' : '[&>div]:bg-gray-400'}`} data-testid={`progress-bar-${goal.id}`} />
                </div>

                <div className={`p-3 rounded-md space-y-1 ${goal.isCompleted ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <div className={`text-xs font-medium ${goal.isCompleted ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-300'}`}>BELOHNUNG:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`text-base ${goal.isCompleted ? '' : 'bg-gray-300 text-gray-700 dark:bg-gray-600'}`} data-testid={`badge-coin-reward-${goal.id}`}>
                      💰 {goal.hugereward.coins}
                    </Badge>
                    <Badge variant="secondary" className={`text-base ${goal.isCompleted ? '' : 'bg-gray-300 text-gray-700 dark:bg-gray-600'}`}>
                      ⭐ {goal.hugereward.xp} XP
                    </Badge>
                    <Badge variant="secondary" className={`text-base ${goal.isCompleted ? '' : 'bg-gray-300 text-gray-700 dark:bg-gray-600'}`}>
                      🏆 {goal.hugereward.badge}
                    </Badge>
                  </div>
                </div>

                {canComplete && (
                  <Button
                    onClick={() => completeMutation.mutate(goal.id)}
                    disabled={completeMutation.isPending}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    data-testid={`button-complete-${goal.id}`}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Belohnung abholen!
                      </>
                    )}
                  </Button>
                )}

                {!goal.isCompleted && !canComplete && (
                  <div className="text-center py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                    🎯 Im Fortschritt... {progressPercentage}%
                  </div>
                )}

                {goal.isCompleted && (
                  <div className="text-center py-2 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 dark:bg-gradient-to-r dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 rounded-md text-yellow-700 dark:text-yellow-400 font-bold animate-pulse" data-testid={`text-completed-${goal.id}`}>
                    ✅ LEGENDÄR ERREICHT!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}