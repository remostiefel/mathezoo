import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Sparkles, Star, Trophy, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Talent {
  id: string;
  name: string;
  description: string;
  effectType: string;
  effectValue: number;
}

interface AnimalCard {
  id: string;
  animalType: string;
  name: string;
  emoji: string;
  talents: Talent[];
  starterAnimal: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAnimalCard {
  id: string;
  animalCardId: string;
  friendshipLevel: number;
  xp: number;
  xpToNextLevel: number;
  timesUsed: number;
  gamesWon: number;
  isUnlocked: boolean;
  animalCard: AnimalCard;
}

const rarityColors = {
  common: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  rare: 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  epic: 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  legendary: 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
};

const talentIcons: Record<string, any> = {
  coin_protection: Trophy,
  difficulty_reduction: Star,
  xp_boost: Sparkles,
  hint_available: Heart,
  speed_bonus: Sparkles,
  pattern_reveal: Star,
};

export default function AnimalCardsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userAnimals, isLoading: isUserAnimalsLoading } = useQuery<{ success: boolean; animals: UserAnimalCard[] }>({
    queryKey: ["/api/animals/user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/animals/user/${user?.id}`, { credentials: 'include' });
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: allCardsData, isLoading: isAllCardsLoading } = useQuery<{ success: boolean; cards: AnimalCard[] }>({
    queryKey: ["/api/animals/cards"],
  });

  const isLoading = isUserAnimalsLoading || isAllCardsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const allCards = (allCardsData?.cards) || [];
  const userAnimalMap = new Map(
    (userAnimals?.animals ?? []).map((ua) => [ua.animalCardId, ua])
  );

  const cardsToDisplay = allCards.map((card) => {
    const userAnimal = userAnimalMap.get(card.id);
    return {
      ...card,
      userAnimal,
    };
  });

  // Check if user has any unlocked animals
  const unlockedAnimals = cardsToDisplay.filter(card => card.userAnimal?.isUnlocked);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">🐾 Meine Tier-Freunde</h1>
          <p className="text-muted-foreground">
            Sammle Tiere, entwickle Freundschaften und schalte mächtige Team-Boni frei!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/student")} data-testid="button-home">
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Action Card */}
      {unlockedAnimals.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 border-purple-300 dark:border-purple-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg">👥 Dein Tier-Team zusammenstellen</h3>
                <p className="text-sm text-muted-foreground">Wähle 2-3 Tiere und aktiviere mächtige Team-Boni!</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button onClick={() => setLocation('/team-manager')} variant="outline" size="sm" data-testid="button-team-manager">
                  Mein Team
                </Button>
                <Button onClick={() => setLocation('/team-builder')} data-testid="button-team-builder">
                  Neues Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {unlockedAnimals.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/30 p-12">
          <div className="text-center space-y-4">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold">Noch keine Tier-Freunde!</h2>
            <p className="text-lg text-muted-foreground">
              Spiele Spiele um Tiere freizuschalten!
            </p>
            <Button onClick={() => setLocation('/games')} className="mt-4">
              Zu den Spielen
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsToDisplay.map((card) => {
            const isUnlocked = card.userAnimal?.isUnlocked || false;
            const friendshipLevel = card.userAnimal?.friendshipLevel || 0;
            const xp = card.userAnimal?.xp || 0;
            const xpToNextLevel = card.userAnimal?.xpToNextLevel || 100;
            const xpProgress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

            return (
              <Card
                key={card.id}
                className={`relative overflow-hidden hover-elevate ${
                  !isUnlocked ? 'opacity-60' : ''
                }`}
                data-testid={`card-animal-${card.animalType}`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Lock className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Gesperrt</p>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-6xl" data-testid={`emoji-${card.animalType}`}>{card.emoji}</div>
                    <Badge className={rarityColors[card.rarity]} data-testid={`rarity-${card.animalType}`}>
                      {card.rarity === 'common' && 'Normal'}
                      {card.rarity === 'rare' && 'Selten'}
                      {card.rarity === 'epic' && 'Episch'}
                      {card.rarity === 'legendary' && 'Legendär'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl" data-testid={`name-${card.animalType}`}>{card.name}</CardTitle>
                  
                  {isUnlocked && (
                    <div className="flex items-center gap-1" data-testid={`friendship-${card.animalType}`}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Heart
                          key={level}
                          className={`w-5 h-5 ${
                            level <= friendshipLevel
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        Level {friendshipLevel}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {isUnlocked && friendshipLevel < 5 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">XP bis Level {friendshipLevel + 1}</span>
                        <span className="font-medium" data-testid={`xp-${card.animalType}`}>
                          {xp} / {xpToNextLevel}
                        </span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Talente:</h4>
                    {card.talents.map((talent, idx) => {
                      const Icon = talentIcons[talent.effectType] || Star;
                      return (
                        <div
                          key={talent.id}
                          className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/50"
                          data-testid={`talent-${card.animalType}-${idx}`}
                        >
                          <Icon className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                          <div>
                            <div className="font-medium">{talent.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {talent.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isUnlocked && (
                    <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
                      <div>
                        <div className="font-medium text-foreground" data-testid={`times-used-${card.animalType}`}>
                          {card.userAnimal?.timesUsed || 0}x
                        </div>
                        <div>Eingesetzt</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground" data-testid={`games-won-${card.animalType}`}>
                          {card.userAnimal?.gamesWon || 0}
                        </div>
                        <div>Siege</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
