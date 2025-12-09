
-- Add zoo_economy_stats column to learningProgression table for idle economy system
ALTER TABLE "learning_progression" 
ADD COLUMN IF NOT EXISTS "zoo_economy_stats" jsonb NOT NULL DEFAULT '{
  "passiveIncomePerHour": 0,
  "maintenanceCostPerHour": 0,
  "totalVisitorsPerHour": 0,
  "netIncomePerHour": 0,
  "zooLevel": 1,
  "totalLifetimeVisitors": 0,
  "totalLifetimeIncome": 0
}'::jsonb;
