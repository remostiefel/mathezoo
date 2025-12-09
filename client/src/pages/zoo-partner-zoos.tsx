import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Building2, Lock, CheckCircle2, TrendingUp, Users, Home, LogOut } from "lucide-react";

interface PartnerZoo {
  id: string;
  name: string;
  continent: string;
  emoji: string;
  requiredAnimals: number;
  currentAnimals: number;
  bonusType: 'coin_bonus' | 'xp_bonus' | 'animal_chance';
  bonusValue: number;
  description: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
}

const DEFAULT_PARTNER_ZOOS: PartnerZoo[] = [
  {
    id: 'san-diego-zoo',
    name: 'San Diego Zoo',
    continent: 'Nordamerika',
    emoji: '🦒',
    requiredAnimals: 10,
    currentAnimals: 0,
    bonusType: 'coin_bonus',
    bonusValue: 20,
    description: 'Der berühmte Zoo in Kalifornien. Arbeite mit den San Diego Zoos zusammen und verdiene 20% mehr Münzen!',
    isUnlocked: false,
    unlockedAt: null,
  },
  {
    id: 'singapore-zoo',
    name: 'Singapore Zoo',
    continent: 'Asien',
    emoji: '🐯',
    requiredAnimals: 15,
    currentAnimals: 0,
    bonusType: 'xp_bonus',
    bonusValue: 25,
    description: 'Ein moderner Zoo in Südostasien. Erhalte 25% mehr XP bei jedem Training!',
    isUnlocked: false,
    unlockedAt: null,
  },
  {
    id: 'berlin-zoo',
    name: 'Berlin Zoo',
    continent: 'Europa',
    emoji: '🐼',
    requiredAnimals: 12,
    currentAnimals: 0,
    bonusType: 'animal_chance',
    bonusValue: 15,
    description: 'Deutschlands ältester Zoo. Erhöhe deine Chancen auf seltene Tiere um 15%!',
    isUnlocked: false,
    unlockedAt: null,
  },
  {
    id: 'taronga-zoo',
    name: 'Taronga Zoo',
    continent: 'Australien',
    emoji: '🦘',
    requiredAnimals: 14,
    currentAnimals: 0,
    bonusType: 'coin_bonus',
    bonusValue: 30,
    description: 'Der Zoo Down Under in Sydney. Verdiene 30% mehr Münzen durch Australien-Partnerschaft!',
    isUnlocked: false,
    unlockedAt: null,
  },
  {
    id: 'tokyo-zoo',
    name: 'Ueno Zoo Tokyo',
    continent: 'Asien',
    emoji: '🐅',
    requiredAnimals: 13,
    currentAnimals: 0,
    bonusType: 'xp_bonus',
    bonusValue: 20,
    description: 'Japans ältester Zoo. Trainiere mit dem Tokyo Zoo und erhalte 20% XP Bonus!',
    isUnlocked: false,
    unlockedAt: null,
  },
  {
    id: 'serengeti-wildlife',
    name: 'Serengeti Wildlife',
    continent: 'Afrika',
    emoji: '🦁',
    requiredAnimals: 20,
    currentAnimals: 0,
    bonusType: 'animal_chance',
    bonusValue: 25,
    description: 'Wilde Tiere Afrikas! Erhöhe deine Chancen auf epische Tiere um 25%!',
    isUnlocked: false,
    unlockedAt: null,
  },
];

export default function ZooPartnerZoos() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: apiPartnerZoos, isLoading } = useQuery<PartnerZoo[]>({
    queryKey: ['/api/zoo/partner-zoos', user?.id],
    enabled: !!user?.id,
  });

  // Verwende API-Daten wenn verfügbar, ansonsten Defaults
  const partnerZoos = apiPartnerZoos && apiPartnerZoos.length > 0 ? apiPartnerZoos : DEFAULT_PARTNER_ZOOS;

  const unlockMutation = useMutation({
    mutationFn: async (partnerZooId: string) => {
      return apiRequest(`/api/zoo/partner-zoos/${partnerZooId}/unlock`, {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
      });
    },
    onSuccess: (data, partnerZooId) => {
      const partnerZoo = partnerZoos?.find(p => p.id === partnerZooId);
      toast({
        title: "🏛️ Partner-Zoo freigeschaltet!",
        description: `${partnerZoo?.emoji} ${partnerZoo?.name} ist jetzt dein Partner!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/partner-zoos', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/zoo/profile', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Noch nicht bereit",
        description: error.message || "Du brauchst noch mehr Tiere!",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-partner-zoos" />
      </div>
    );
  }


  const bonusTypeLabels = {
    coin_bonus: '💰 Münz-Bonus',
    xp_bonus: '⭐ XP-Bonus',
    animal_chance: '🎯 Tier-Chance',
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <Building2 className="w-10 h-10 text-primary" />
            Zoo-Freunde weltweit
          </h1>
          <p className="text-muted-foreground text-lg">
            Verbinde dich mit berühmten Zoos und erhalte besondere Boni!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/student'}>
            <Home className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <Button variant="outline" onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
          }}>
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partnerZoos?.map((partnerZoo) => {
          const canUnlock = partnerZoo.currentAnimals >= partnerZoo.requiredAnimals && !partnerZoo.isUnlocked;
          const progress = Math.min(100, Math.round((partnerZoo.currentAnimals / partnerZoo.requiredAnimals) * 100));

          return (
            <Card
              key={partnerZoo.id}
              className={partnerZoo.isUnlocked ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:bg-gradient-to-br dark:from-yellow-950/40 dark:via-amber-950/40 dark:to-yellow-950/40 shadow-lg shadow-yellow-500/30' : 'border-gray-300 opacity-75'}
              data-testid={`card-partner-zoo-${partnerZoo.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl" data-testid={`text-emoji-${partnerZoo.id}`}>
                      {partnerZoo.emoji}
                    </span>
                    <div>
                      <CardTitle className="text-xl" data-testid={`text-name-${partnerZoo.id}`}>
                        {partnerZoo.name}
                      </CardTitle>
                      <CardDescription data-testid={`text-continent-${partnerZoo.id}`}>
                        {partnerZoo.continent.charAt(0).toUpperCase() + partnerZoo.continent.slice(1)}
                      </CardDescription>
                    </div>
                  </div>
                  {partnerZoo.isUnlocked ? (
                    <CheckCircle2 className="w-6 h-6 text-yellow-600" data-testid={`icon-unlocked-${partnerZoo.id}`} />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" data-testid={`icon-locked-${partnerZoo.id}`} />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground" data-testid={`text-description-${partnerZoo.id}`}>
                  {partnerZoo.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tiere benötigt</span>
                    <span className="font-medium" data-testid={`text-progress-${partnerZoo.id}`}>
                      {partnerZoo.currentAnimals} / {partnerZoo.requiredAnimals}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                      data-testid={`progress-bar-${partnerZoo.id}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <Badge variant="secondary" data-testid={`badge-bonus-${partnerZoo.id}`}>
                    {bonusTypeLabels[partnerZoo.bonusType]} +{partnerZoo.bonusValue}%
                  </Badge>
                </div>

                {partnerZoo.isUnlocked ? (
                  <div className="text-center py-2 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 dark:bg-gradient-to-r dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 rounded-md text-yellow-700 dark:text-yellow-400 font-bold" data-testid={`text-active-${partnerZoo.id}`}>
                    ✅ FREIGESCHALTET!
                  </div>
                ) : canUnlock ? (
                  <Button
                    onClick={() => unlockMutation.mutate(partnerZoo.id)}
                    disabled={unlockMutation.isPending}
                    className="w-full"
                    data-testid={`button-unlock-${partnerZoo.id}`}
                  >
                    {unlockMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Partner werden! 🤝'
                    )}
                  </Button>
                ) : (
                  <div className="text-center text-sm text-muted-foreground" data-testid={`text-locked-${partnerZoo.id}`}>
                    Noch {partnerZoo.requiredAnimals - partnerZoo.currentAnimals} Tiere sammeln
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}