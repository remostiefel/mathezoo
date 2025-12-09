import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Sparkles, ArrowLeft, Home } from "lucide-react";

interface Talent {
  id: string;
  name: string;
  description: string;
  effectType: string;
  effectValue: number;
}

interface AnimalDetail {
  id: string;
  animalCardId: string;
  animalCard: {
    id: string;
    name: string;
    emoji: string;
    talents: Talent[];
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  friendshipLevel: number;
  xp: number;
  xpToNextLevel: number;
  timesUsed: number;
  gamesWon: number;
  isUnlocked: boolean;
}

const rarityColors = {
  common: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  rare: 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  epic: 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  legendary: 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
};

export default function AnimalDetailPage() {
  const [, setLocation] = useLocation();
  const { animalId } = useParams();

  const { data: animal, isLoading } = useQuery<{ success: boolean; animal: AnimalDetail }>({
    queryKey: ["/api/animals", animalId],
    enabled: !!animalId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Lade Tier-Details...</div>
      </div>
    );
  }

  const animalData = animal?.animal;

  if (!animalData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Tier nicht gefunden</div>
      </div>
    );
  }

  const xpProgress = (animalData.xp / animalData.xpToNextLevel) * 100;
  const card = animalData.animalCard;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Tier-Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/student")} data-testid="button-home">
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="text-8xl mb-4">{card.emoji}</div>
            <CardTitle className="text-4xl">{card.name}</CardTitle>
            <Badge className={rarityColors[card.rarity]}>
              {card.rarity === 'common' && 'Normal'}
              {card.rarity === 'rare' && 'Selten'}
              {card.rarity === 'epic' && 'Episch'}
              {card.rarity === 'legendary' && 'Legendär'}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Friendship Level */}
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Freundschaftslevel
              </h3>
              <div className="flex justify-center gap-2 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${
                      i < animalData.friendshipLevel
                        ? "fill-red-500 text-red-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-muted-foreground">Level {animalData.friendshipLevel} von 5</p>
            </div>

            {/* XP Progress */}
            <div>
              <h3 className="text-xl font-bold mb-2">XP-Fortschritt</h3>
              <div className="space-y-2">
                <Progress value={xpProgress} />
                <p className="text-center text-muted-foreground">
                  {animalData.xp} / {animalData.xpToNextLevel} XP
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{animalData.timesUsed}</p>
                  <p className="text-muted-foreground">Einsätze</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{animalData.gamesWon}</p>
                  <p className="text-muted-foreground">Gewonnene Spiele</p>
                </CardContent>
              </Card>
            </div>

            {/* Talents */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-500" />
                Talente
              </h3>
              <div className="space-y-3">
                {card.talents.map((talent) => (
                  <Card key={talent.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-lg">{talent.name}</h4>
                      <p className="text-muted-foreground text-sm mb-2">{talent.description}</p>
                      <Badge variant="secondary">
                        +{talent.effectValue} {talent.effectType}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
