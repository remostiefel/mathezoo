
import { db } from './db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🔧 Running migrations...');
    
    // Run last_login_at migration
    console.log('  → Adding last_login_at column...');
    const migration1Path = path.join(process.cwd(), 'migrations', '0001_add_last_login_at.sql');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
    await db.execute(sql.raw(migration1SQL));
    console.log('  ✓ last_login_at added');
    
    // Run zoo_economy_stats migration
    console.log('  → Adding zoo_economy_stats column...');
    const migration2Path = path.join(process.cwd(), 'migrations', '0002_add_zoo_economy_stats.sql');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
    await db.execute(sql.raw(migration2SQL));
    console.log('  ✓ zoo_economy_stats added');
    
    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
