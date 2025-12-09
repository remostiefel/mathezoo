import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface Talent {
  id: string;
  name: string;
  effectType: string;
  effectValue: number;
}

interface AnimalData {
  id: string;
  animalCardId: string;
  friendshipLevel: number;
  animalCard: {
    talents: Talent[];
  };
}

export function useAnimalTeam() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: teamData } = useQuery<{
    success: boolean;
    activeTeam: string[];
  }>({
    queryKey: ["/api/animals/active-team"],
    enabled: !!user?.id,
  });

  const { data: animalsData } = useQuery<{
    success: boolean;
    animals: AnimalData[];
  }>({
    queryKey: ["/api/animals/user", user?.id],
    enabled: !!user?.id,
  });

  const activeTeam = teamData?.activeTeam || [];
  const allAnimals = animalsData?.animals || [];
  
  const teamAnimals = activeTeam
    .map((id) => allAnimals.find((a) => a.animalCardId === id))
    .filter(Boolean) as AnimalData[];

  // Get all talents from team
  const teamTalents = teamAnimals.flatMap((animal) => animal.animalCard.talents);

  // Calculate total XP reward based on team strength
  const calculateXPReward = (successRate: number, difficulty: number = 1) => {
    const baseXP = 10;
    const bonusXP = teamTalents
      .filter((t) => t.effectType === "xp_boost")
      .reduce((sum, t) => sum + t.effectValue, 0);
    
    const totalMultiplier = (100 + bonusXP) / 100;
    return Math.floor(baseXP * successRate * difficulty * totalMultiplier);
  };

  // Get talent effects for gameplay
  const getTalentEffects = () => {
    return {
      coinProtection: teamTalents
        .filter((t) => t.effectType === "coin_protection")
        .reduce((sum, t) => sum + t.effectValue, 0),
      difficultyReduction: teamTalents
        .filter((t) => t.effectType === "difficulty_reduction")
        .reduce((sum, t) => sum + t.effectValue, 0),
      hintBonus: teamTalents.some((t) => t.effectType === "hint_available"),
      speedBonus: teamTalents
        .filter((t) => t.effectType === "speed_bonus")
        .reduce((sum, t) => sum + t.effectValue, 0),
    };
  };

  // Add XP to all team animals
  const addXPToTeam = async (successRate: number, difficulty: number = 1) => {
    if (activeTeam.length === 0) return;

    const xpPerAnimal = calculateXPReward(successRate, difficulty);
    
    for (const animalId of activeTeam) {
      try {
        await fetch("/api/animals/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            animalCardId: animalId,
            xp: Math.max(1, Math.floor(xpPerAnimal / activeTeam.length)),
          }),
        });
      } catch (error) {
        console.error("Error adding XP:", error);
      }
    }

    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ["/api/animals/user", user?.id] });
  };

  return {
    activeTeam,
    teamAnimals,
    teamTalents,
    calculateXPReward,
    getTalentEffects,
    addXPToTeam,
  };
}
