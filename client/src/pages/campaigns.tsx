import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, Zap, Coins, Trophy, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface CampaignLevel {
  levelNumber: number;
  title: string;
  storyText: string;
  requirements: {
    gameType: string;
    gameLevel?: number;
    tasksToComplete: number;
    minSuccessRate?: number;
  };
}

interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  storyText: string;
  emoji: string;
  levels: CampaignLevel[];
  rewardAnimalType?: string;
  rewardCoins: number;
  rewardXP: number;
  unlockLevel: number;
  displayOrder: number;
}

interface UserCampaignProgress {
  id: string;
  userId: string;
  campaignId: string;
  currentLevel: number;
  isCompleted: boolean;
  completedAt?: string;
  levelProgress: Array<{
    levelNumber: number;
    tasksCompleted: number;
    tasksRequired: number;
    isCompleted: boolean;
    completedAt?: string;
  }>;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    campaignName: "Zahlenwaage-Abenteuer",
    description: "Lerne, Zahlen zu vergleichen und gewinne ein Löwe-Pärchen!",
    storyText: "Die wilden Löwen brauchen Hilfe bei der Balance! Kannst du die richtigen Gewichte finden?",
    emoji: "⚖️",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Meistere die Zahlenwaage!`,
      requirements: {
        gameType: "zahlenwaage",
        tasksToComplete: 10 * (i + 1),
        minSuccessRate: 70 + i * 5
      }
    })),
    rewardAnimalType: "lion",
    rewardCoins: 500,
    rewardXP: 250,
    unlockLevel: 1,
    displayOrder: 1
  },
  {
    id: "2",
    campaignName: "Zerlegungs-Safari",
    description: "Finde alle Zahlenzerlegungen und rette Affen!",
    storyText: "Die Affen haben ihre Bananen in Gruppen sortiert. Hilf ihnen, sie richtig zu zerlegen!",
    emoji: "🔢",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Zahlen zerlegen!`,
      requirements: {
        gameType: "decomposition",
        tasksToComplete: 8 * (i + 1),
        minSuccessRate: 75 + i * 3
      }
    })),
    rewardAnimalType: "monkey",
    rewardCoins: 400,
    rewardXP: 200,
    unlockLevel: 2,
    displayOrder: 2
  },
  {
    id: "3",
    campaignName: "10 Gewinnt! Challenge",
    description: "Ergänze zur 10 und befreie Elefanten!",
    storyText: "Die Elefanten sind im Zahlen-Labyrinth gefangen. Löse 10er-Aufgaben und rette sie!",
    emoji: "🎯",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - 10er-Challenge!`,
      requirements: {
        gameType: "ten-wins",
        tasksToComplete: 12 * (i + 1),
        minSuccessRate: 65 + i * 5
      }
    })),
    rewardAnimalType: "elephant",
    rewardCoins: 600,
    rewardXP: 300,
    unlockLevel: 3,
    displayOrder: 3
  },
  {
    id: "4",
    campaignName: "Verdopplungs-Expedition",
    description: "Meistere Verdopplungen und befreie Tiger!",
    storyText: "Tiger-Brüder brauchen Hilfe! Verdoppele Zahlen schnell, um sie freizukaufen!",
    emoji: "👯",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Verdopplungs-Power!`,
      requirements: {
        gameType: "doubling",
        tasksToComplete: 9 * (i + 1),
        minSuccessRate: 70 + i * 4
      }
    })),
    rewardAnimalType: "tiger",
    rewardCoins: 550,
    rewardXP: 275,
    unlockLevel: 2,
    displayOrder: 4
  },
  {
    id: "5",
    campaignName: "Giraffen-Höhen-Abenteuer",
    description: "Erreiche die Baumkronen und rette Giraffen!",
    storyText: "Giraffen sitzen zu hoch! Löse schwierige Rechenaufgaben, um sie herunterzubringen!",
    emoji: "🦒",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Höher geht's!`,
      requirements: {
        gameType: "zahlenwaage",
        tasksToComplete: 11 * (i + 1),
        minSuccessRate: 72 + i * 4
      }
    })),
    rewardAnimalType: "giraffe",
    rewardCoins: 450,
    rewardXP: 220,
    unlockLevel: 1,
    displayOrder: 5
  },
  {
    id: "6",
    campaignName: "Zebra-Streifen-Rätsel",
    description: "Finde die Muster und befreie Zebras!",
    storyText: "Zebras mögen Muster! Löse Muster-Rätsel und Zerlegungen, um ihre Streifen zu färben!",
    emoji: "🦓",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Muster erkennen!`,
      requirements: {
        gameType: "decomposition",
        tasksToComplete: 10 * (i + 1),
        minSuccessRate: 73 + i * 3
      }
    })),
    rewardAnimalType: "zebra",
    rewardCoins: 480,
    rewardXP: 240,
    unlockLevel: 3,
    displayOrder: 6
  },
  {
    id: "7",
    campaignName: "Pinguin-Eis-Expedition",
    description: "Schmelze das Eis und rette Pinguine!",
    storyText: "Arktische Pinguine frieren! Löse schnelle 10er-Aufgaben, um sie zu wärmen!",
    emoji: "🐧",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Schnell warm werden!`,
      requirements: {
        gameType: "ten-wins",
        tasksToComplete: 14 * (i + 1),
        minSuccessRate: 68 + i * 5
      }
    })),
    rewardAnimalType: "penguin",
    rewardCoins: 520,
    rewardXP: 260,
    unlockLevel: 2,
    displayOrder: 7
  },
  {
    id: "8",
    campaignName: "Panda-Bambus-Quest",
    description: "Zerlege Bambus-Zahlen und rette Pandas!",
    storyText: "Hungrige Pandas brauchen Bambus! Zerlege Nummern in Bambus-Portionen!",
    emoji: "🐼",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Bambus-Zerlegung!`,
      requirements: {
        gameType: "decomposition",
        tasksToComplete: 9 * (i + 1),
        minSuccessRate: 74 + i * 3
      }
    })),
    rewardAnimalType: "panda",
    rewardCoins: 530,
    rewardXP: 265,
    unlockLevel: 4,
    displayOrder: 8
  },
  {
    id: "9",
    campaignName: "Adler-Flug-Challenge",
    description: "Fliege hoch und rette Adler!",
    storyText: "Majestätische Adler sind gefangen! Meistere alle Rechenarten, um sie freizulassen!",
    emoji: "🦅",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - In die Luft!`,
      requirements: {
        gameType: "zahlenwaage",
        tasksToComplete: 13 * (i + 1),
        minSuccessRate: 71 + i * 4
      }
    })),
    rewardAnimalType: "eagle",
    rewardCoins: 540,
    rewardXP: 270,
    unlockLevel: 3,
    displayOrder: 9
  },
  {
    id: "10",
    campaignName: "Delfin-Ozean-Abenteuer",
    description: "Schwimme mit Delfinen und befreie sie!",
    storyText: "Delfine spielen im Meer! Verdopple und ergänze Zahlen, um ihre Freiheit zu gewinnen!",
    emoji: "🐬",
    levels: Array.from({ length: 5 }, (_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      storyText: `Stufe ${i + 1} - Meeres-Magie!`,
      requirements: {
        gameType: "ten-wins",
        tasksToComplete: 11 * (i + 1),
        minSuccessRate: 69 + i * 4
      }
    })),
    rewardAnimalType: "dolphin",
    rewardCoins: 560,
    rewardXP: 280,
    unlockLevel: 4,
    displayOrder: 10
  }
];

export default function CampaignsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Use mock campaigns instead of API
  const campaigns = MOCK_CAMPAIGNS;
  const campaignsLoading = false;
  const progressData: any = null;
  const userProgress: UserCampaignProgress[] = progressData?.progress || [];
  const userLearningProgress = 5; // Default to level 5 so all campaigns unlocked for testing

  const getProgressForCampaign = (campaignId: string) => {
    return userProgress.find((p: UserCampaignProgress) => p.campaignId === campaignId);
  };

  const isCampaignUnlocked = (campaign: Campaign) => {
    return userLearningProgress >= campaign.unlockLevel;
  };

  const getCompletionPercentage = (progress: UserCampaignProgress | undefined) => {
    if (!progress) return 0;
    const completedLevels = (progress.levelProgress || []).filter((lp: any) => lp.isCompleted).length;
    const totalLevels = 5;
    return (completedLevels / totalLevels) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              🗺️ Abenteuer-Kampagnen
            </h1>
            <p className="text-muted-foreground">
              Meistere epische Geschichten und sammle neue Tier-Freunde!
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

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const progress = getProgressForCampaign(campaign.id);
            const isUnlocked = isCampaignUnlocked(campaign);
            const completionPercent = getCompletionPercentage(progress);

            return (
              <Card
                key={campaign.id}
                className={`overflow-hidden hover-elevate cursor-pointer transition-all ${
                  !isUnlocked ? "opacity-60" : ""
                }`}
                onClick={() => isUnlocked && setLocation(`/campaigns/${campaign.id}`)}
                data-testid={`card-campaign-${campaign.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-3xl mb-2">{campaign.emoji}</div>
                      <CardTitle className="text-xl">{campaign.campaignName}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {campaign.description}
                      </CardDescription>
                    </div>
                    {!isUnlocked && (
                      <Badge variant="secondary" className="ml-2">
                        <Lock className="w-3 h-3 mr-1" />
                        Lvl {campaign.unlockLevel}
                      </Badge>
                    )}
                    {progress?.isCompleted && (
                      <Badge variant="default" className="ml-2 bg-green-600">
                        <Trophy className="w-3 h-3 mr-1" />
                        Fertig
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Story Text */}
                  <p className="text-sm text-muted-foreground italic">"{campaign.storyText}"</p>

                  {/* Progress Bar */}
                  {isUnlocked && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">Fortschritt</span>
                        <span className="text-muted-foreground">
                          {progress ? `Level ${progress.currentLevel}/5` : "Nicht gestartet"}
                        </span>
                      </div>
                      <Progress value={completionPercent} className="h-2" />
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-1 text-xs bg-background rounded p-2">
                      <Coins className="w-3 h-3 text-yellow-600" />
                      <span>{campaign.rewardCoins}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-background rounded p-2">
                      <Zap className="w-3 h-3 text-blue-600" />
                      <span>{campaign.rewardXP} XP</span>
                    </div>
                  </div>

                  {/* Level Overview */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold mb-2">5 Level:</p>
                    <div className="flex gap-1">
                      {campaign.levels.map((level) => {
                        const levelProgress = (progress?.levelProgress || []).find(
                          (lp) => lp.levelNumber === level.levelNumber
                        );
                        const isCompleted = levelProgress?.isCompleted;
                        const isCurrent = progress?.currentLevel === level.levelNumber;

                        return (
                          <div
                            key={level.levelNumber}
                            className={`flex-1 h-8 rounded text-xs font-semibold flex items-center justify-center transition-all ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isCurrent
                                ? "bg-blue-500 text-white animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}
                            data-testid={`level-badge-${level.levelNumber}`}
                            title={level.title}
                          >
                            {level.levelNumber}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Button */}
                  {isUnlocked && (
                    <Button
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/campaigns/${campaign.id}`);
                      }}
                      data-testid={`button-start-campaign-${campaign.id}`}
                    >
                      {progress
                        ? progress.isCompleted
                          ? "Zur Belohnung"
                          : `Level ${progress.currentLevel} fortsetzen`
                        : "Kampagne starten"}
                    </Button>
                  )}
                  {!isUnlocked && (
                    <Button variant="secondary" className="w-full mt-2" disabled>
                      Freischalten auf Level {campaign.unlockLevel}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {campaigns.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Keine Kampagnen verfügbar. Komm später zurück!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
