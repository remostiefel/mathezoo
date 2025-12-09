
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Migration: Add game-related columns to learning_progression table
 * Run this once to add the missing columns that are causing the "column does not exist" error
 */
async function addGameColumns() {
  console.log("🔧 Adding game columns to learning_progression table...");

  try {
    // Add game_coins column
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_coins INTEGER DEFAULT 0
    `);
    console.log("✅ Added game_coins column");

    // Add game_shop_items column
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_shop_items TEXT[] DEFAULT '{}'
    `);
    console.log("✅ Added game_shop_items column");

    // Add game_badges column
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_badges TEXT[] DEFAULT '{}'
    `);
    console.log("✅ Added game_badges column");

    // Add Zahlenwaage game stats columns
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_zahlenwaage_played INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_zahlenwaage_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_zahlenwaage_high_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_zahlenwaage_last_played TIMESTAMP
    `);
    console.log("✅ Added Zahlenwaage game stats columns");

    // Add Ten Wins game stats columns
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_ten_wins_played INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_ten_wins_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_ten_wins_high_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_ten_wins_last_played TIMESTAMP
    `);
    console.log("✅ Added Ten Wins game stats columns");

    // Add Decomposition game stats columns
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_decomposition_played INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_decomposition_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_decomposition_high_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_decomposition_last_played TIMESTAMP
    `);
    console.log("✅ Added Decomposition game stats columns");

    // Add Doubling game stats columns
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_doubling_played INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_doubling_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_doubling_high_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_doubling_last_played TIMESTAMP
    `);
    console.log("✅ Added Doubling game stats columns");

    // Add Pathfinder game stats columns
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_pathfinder_played INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_pathfinder_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_pathfinder_high_score INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE learning_progression 
      ADD COLUMN IF NOT EXISTS game_pathfinder_last_played TIMESTAMP
    `);
    console.log("✅ Added Pathfinder game stats columns");

    console.log("\n🎉 Migration completed successfully!");
    console.log("All game columns have been added to learning_progression table.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
  
  process.exit(0);
}

// Run migration
addGameColumns().catch(console.error);
