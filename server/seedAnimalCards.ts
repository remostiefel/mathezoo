import { db } from "./db";
import { animalCards, teamBonuses } from "@shared/schema";
import { ANIMAL_DEFINITIONS, TEAM_BONUSES } from "@shared/animal-data";
import { eq } from "drizzle-orm";

export async function seedAnimalCards() {
  console.log("🌱 Seeding animal cards...");

  try {
    for (const animal of ANIMAL_DEFINITIONS) {
      const existing = await db.select().from(animalCards).where(eq(animalCards.animalType, animal.animalType));
      
      if (existing.length === 0) {
        await db.insert(animalCards).values({
          animalType: animal.animalType,
          name: animal.name,
          emoji: animal.emoji,
          talents: animal.talents as any,
          starterAnimal: animal.starterAnimal,
          unlockRequirement: animal.unlockRequirement as any,
          rarity: animal.rarity,
        });
        console.log(`  ✅ Created animal card: ${animal.emoji} ${animal.name}`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${animal.emoji} ${animal.name}`);
      }
    }

    for (const bonus of TEAM_BONUSES) {
      const existing = await db.select().from(teamBonuses);
      const alreadyExists = existing.some(b => b.bonusName === bonus.bonusName);
      
      if (!alreadyExists) {
        await db.insert(teamBonuses).values({
          bonusName: bonus.bonusName,
          description: bonus.description,
          requiredAnimals: bonus.requiredAnimals as any,
          minFriendshipLevel: bonus.minFriendshipLevel,
          bonusEffects: bonus.bonusEffects as any,
          emoji: bonus.emoji,
        });
        console.log(`  ✅ Created team bonus: ${bonus.emoji} ${bonus.bonusName}`);
      } else {
        console.log(`  ⏭️  Skipped (exists): ${bonus.emoji} ${bonus.bonusName}`);
      }
    }

    console.log("🎉 Animal cards seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding animal cards:", error);
    throw error;
  }
}

// Call seedAnimalCards() from server startup or API route
