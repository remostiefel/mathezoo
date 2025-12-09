import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Zap, Coins, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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

interface TeamBonus {
  id: string;
  bonusName: string;
  description: string;
  requiredAnimals: string[];
  minFriendshipLevel: number;
  bonusEffects: Array<{
    effectType: string;
    effectValue: number;
    description: string;
  }>;
  emoji: string;
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  rare: "bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  epic: "bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  legendary: "bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
};

export default function TeamBuilderPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);

  const { data: userAnimalsData, isLoading } = useQuery<{
    success: boolean;
    animals: UserAnimalCard[];
  }>({
    queryKey: ["/api/animals/user", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/animals/user/${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch animals');
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: bonusesData } = useQuery<{
    success: boolean;
    teamBonuses: TeamBonus[];
  }>({
    queryKey: ["/api/animals/team-bonuses"],
    enabled: !!user?.id,
  });

  const saveTeamMutation = useMutation({
    mutationFn: async (teamIds: string[]) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ animalIds: teamIds }),
      });
      if (!res.ok) throw new Error("Failed to save team");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team erstellt! 🎉",
        description: "Dein Team mit lustigem Namen ist gespeichert!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setTimeout(() => setLocation("/team-manager"), 1500);
    },
  });

  const unlockedAnimals = (userAnimalsData?.animals || []).filter((ua) => ua.isUnlocked);

  const toggleAnimal = (animalId: string) => {
    if (selectedAnimals.includes(animalId)) {
      setSelectedAnimals(selectedAnimals.filter((id) => id !== animalId));
    } else if (selectedAnimals.length < 3) {
      setSelectedAnimals([...selectedAnimals, animalId]);
    }
  };

  const getActiveBonuses = () => {
    const bonuses: TeamBonus[] = [];
    const animalTypes = selectedAnimals
      .map((id) => {
        const animal = unlockedAnimals.find((ua) => ua.animalCardId === id);
        return animal ? animal.animalCard.animalType : null;
      })
      .filter(Boolean) as string[];

    (bonusesData?.teamBonuses || []).forEach((bonus) => {
      const hasAllAnimals = bonus.requiredAnimals.every((animal) =>
        animalTypes.includes(animal)
      );
      const minFriendshipMet = selectedAnimals.every((id) => {
        const animal = unlockedAnimals.find((ua) => ua.animalCardId === id);
        return animal && animal.friendshipLevel >= bonus.minFriendshipLevel;
      });

      if (hasAllAnimals && minFriendshipMet) {
        bonuses.push(bonus);
      }
    });

    return bonuses;
  };

  const activeBonuses = getActiveBonuses();

  // Calculate synergies based on selected animals
  const calculateSynergies = () => {
    if (selectedAnimals.length < 2) return null;
    
    const animals = selectedAnimals
      .map(id => unlockedAnimals.find(ua => ua.animalCardId === id)?.animalCard)
      .filter((a): a is AnimalCard => !!a);
    
    if (animals.length < 2) return null;
    
    // Create a simple synergy preview from personality combinations
    const adjectives = animals.flatMap((animal, idx) => {
      // Get first adjective from each animal based on personality data
      return [`${animal.name}: Mutig`]; // Placeholder - in real scenario would pull from personality data
    });

    return {
      compatibility: Math.random() * 30 + 70, // 70-100% for demo
      message: `${animals.map((a) => a.name).join(' + ')} bilden ein starkes Team zusammen! 🤝`,
    };
  };

  const synergies = calculateSynergies();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              👥 Dein Tier-Team
            </h1>
            <p className="text-muted-foreground">
              Wähle 2-3 Tiere für dein aktives Team und aktiviere mächtige Team-Boni!
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

        {/* Team Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((idx) => {
            const animalId = selectedAnimals[idx];
            const animal = unlockedAnimals.find((ua) => ua.animalCardId === animalId);

            return (
              <Card
                key={idx}
                className={`text-center p-6 transition-all ${
                  animal
                    ? "ring-2 ring-purple-500"
                    : "border-2 border-dashed border-muted-foreground/30"
                }`}
              >
                {animal ? (
                  <>
                    <div className="text-5xl mb-3">{animal.animalCard.emoji}</div>
                    <p className="font-bold text-lg">{animal.animalCard.name}</p>
                    <div className="flex justify-center gap-1 my-2">
                      {Array.from({ length: animal.friendshipLevel }).map((_, i) => (
                        <Heart key={i} className="w-4 h-4 fill-red-500 text-red-500" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Level {animal.friendshipLevel}/5
                    </p>
                  </>
                ) : (
                  <div className="py-8 text-muted-foreground">
                    <div className="text-3xl mb-2">+</div>
                    <p>Position {idx + 1}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Team Synergies Preview */}
        {synergies && (
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                🤝 Zusammen sind sie stark!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold text-amber-900 dark:text-amber-50">
                {synergies.message}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Team-Kompatibilität</span>
                    <span className="text-sm font-bold text-amber-900 dark:text-amber-50">{Math.round(synergies.compatibility)}%</span>
                  </div>
                  <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${synergies.compatibility}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-200">
                ✨ Ihre Persönlichkeitsmerkmale ergänzen sich perfekt!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Bonuses */}
        {activeBonuses.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Aktive Team-Boni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeBonuses.map((bonus) => (
                <div key={bonus.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        {bonus.emoji} {bonus.bonusName}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {bonus.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {bonus.bonusEffects.map((effect, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-green-200 dark:bg-green-800">
                        {effect.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - TOP */}
        <div className="flex gap-4 justify-between bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-lg mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/animal-cards")}
            data-testid="button-back-to-animals"
          >
            ← Zurück zu Tier-Freunde
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedAnimals([])}
              disabled={selectedAnimals.length === 0}
              data-testid="button-clear-team"
            >
              Zurücksetzen
            </Button>
            <Button
              onClick={() => saveTeamMutation.mutate(selectedAnimals)}
              disabled={selectedAnimals.length < 2 || saveTeamMutation.isPending}
              data-testid="button-save-team"
            >
              {saveTeamMutation.isPending ? "Speichert..." : "Team Speichern"}
            </Button>
          </div>
        </div>

        {/* Animal Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Verfügbare Tiere</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAnimals.map((userAnimal) => {
              const isSelected = selectedAnimals.includes(userAnimal.animalCardId);
              const animal = userAnimal.animalCard;

              return (
                <Card
                  key={userAnimal.id}
                  className={`cursor-pointer transition-all hover-elevate ${
                    isSelected ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950" : ""
                  }`}
                  onClick={() => toggleAnimal(userAnimal.animalCardId)}
                  data-testid={`card-animal-${userAnimal.animalCardId}`}
                >
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{animal.emoji}</div>
                      <div>
                        <p className="font-bold text-lg">{userAnimal.animalCard.name}</p>
                        <Badge className={rarityColors['common']}>
                          Freund
                        </Badge>
                      </div>

                      {/* Friendship Level */}
                      <div className="flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 ${
                              i < userAnimal.friendshipLevel
                                ? "fill-red-500 text-red-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {userAnimal.xp}/{userAnimal.xpToNextLevel} XP
                      </p>

                      {/* Talents */}
                      <div className="text-left space-y-1">
                        {animal.talents.map((talent) => (
                          <div
                            key={talent.id}
                            className="text-xs bg-muted rounded p-2 flex items-start gap-2"
                          >
                            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                            <div>
                              <p className="font-semibold text-foreground">{talent.name}</p>
                              <p className="text-muted-foreground">{talent.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <Badge variant="default" className="w-full justify-center">
                          ✓ Ausgewählt
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
