
import { db } from "./db";
import { learningProgressions } from "@shared/schema";
import { sql } from "drizzle-orm";

async function fixInvalidStages() {
  console.log("🔧 Fixing invalid stages in database...");
  
  // Find all progressions with stage > 15
  const invalidProgressions = await db
    .select()
    .from(learningProgressions)
    .where(sql`${learningProgressions.currentStage} > 15`);

  console.log(`Found ${invalidProgressions.length} progressions with invalid stages`);

  for (const prog of invalidProgressions) {
    console.log(`Fixing user ${prog.userId}: stage ${prog.currentStage} -> 15`);
    
    await db
      .update(learningProgressions)
      .set({ currentStage: 15 })
      .where(sql`${learningProgressions.userId} = ${prog.userId}`);
  }

  console.log("✅ Done fixing invalid stages");
  process.exit(0);
}

fixInvalidStages().catch((error) => {
  console.error("Error fixing stages:", error);
  process.exit(1);
});
