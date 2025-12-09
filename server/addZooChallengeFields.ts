
import { db } from "./db";
import { sql } from "drizzle-orm";

async function addZooChallengeFields() {
  try {
    console.log("Adding Zoo Challenge fields to zoo_progress table...");

    // Füge neue Felder hinzu, falls sie nicht existieren
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'zoo_progress' AND column_name = 'completed_missions'
        ) THEN
          ALTER TABLE zoo_progress 
          ADD COLUMN completed_missions JSONB NOT NULL DEFAULT '[]'::jsonb;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'zoo_progress' AND column_name = 'unlocked_partner_zoos'
        ) THEN
          ALTER TABLE zoo_progress 
          ADD COLUMN unlocked_partner_zoos JSONB NOT NULL DEFAULT '[]'::jsonb;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'zoo_progress' AND column_name = 'completed_big_goals'
        ) THEN
          ALTER TABLE zoo_progress 
          ADD COLUMN completed_big_goals JSONB NOT NULL DEFAULT '[]'::jsonb;
        END IF;
      END $$;
    `);

    console.log("✅ Zoo Challenge fields added successfully!");
  } catch (error) {
    console.error("Error adding Zoo Challenge fields:", error);
    throw error;
  }
}

addZooChallengeFields()
  .then(() => {
    console.log("Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
