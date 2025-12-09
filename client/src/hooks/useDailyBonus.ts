import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAnimalTeam } from "./useAnimalTeam";

export function useDailyBonus() {
  const { user } = useAuth();
  const { teamAnimals } = useAnimalTeam();

  const { data: bonusData, isLoading } = useQuery<{
    success: boolean;
    claimed: boolean;
    xpReward: number;
    coinReward: number;
    multiplier: number;
  }>({
    queryKey: ["/api/daily-bonus", user?.id],
    enabled: !!user?.id,
  });

  const claimDailyBonus = async () => {
    if (!user?.id) return;

    try {
      // Team-Multiplikator: +10% pro Tier im Team (max 30% für 3 Tiere)
      const teamMultiplier = 1 + (teamAnimals.length * 0.1);
      
      const response = await fetch("/api/daily-bonus/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          teamMultiplier,
          teamSize: teamAnimals.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to claim bonus");
      return await response.json();
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
      throw error;
    }
  };

  return {
    bonusData,
    isLoading,
    claimDailyBonus,
    hasClaimed: bonusData?.claimed || false,
    xpReward: bonusData?.xpReward || 50,
    coinReward: bonusData?.coinReward || 100,
    teamMultiplier: bonusData?.multiplier || 1,
  };
}
