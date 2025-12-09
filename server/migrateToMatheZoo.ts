
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_DATABASE_URL = process.env.DATABASE_URL;

if (!SOURCE_DATABASE_URL || !TARGET_DATABASE_URL) {
  console.error('❌ Beide DATABASE_URLs müssen gesetzt sein:');
  console.error('   SOURCE_DATABASE_URL - alte Mathemat DB');
  console.error('   DATABASE_URL - neue MatheZoo DB');
  process.exit(1);
}

const sourcePool = new Pool({ connectionString: SOURCE_DATABASE_URL });
const targetPool = new Pool({ connectionString: TARGET_DATABASE_URL });

async function copyTableBatch(tableName: string, columns: string[], batchSize = 100) {
  console.log(`\n📊 Kopiere Tabelle: ${tableName}`);
  
  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();
  
  try {
    const result = await sourceClient.query(`SELECT * FROM ${tableName}`);
    console.log(`   Gefunden: ${result.rows.length} Zeilen`);
    
    if (result.rows.length === 0) {
      console.log(`   ⚠️  Keine Daten zum Kopieren`);
      return;
    }
    
    const columnList = columns.join(', ');
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < result.rows.length; i += batchSize) {
      const batch = result.rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const values = columns.map(col => {
          const value = row[col];
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return JSON.stringify(value);
          }
          return value;
        });
        
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        
        try {
          await targetClient.query(
            `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
          inserted++;
          if (inserted % 100 === 0) {
            console.log(`   📝 Fortschritt: ${inserted}/${result.rows.length}`);
          }
        } catch (err: any) {
          errors++;
          if (errors <= 3) {
            console.error(`   ⚠️  Fehler:`, err.message.substring(0, 100));
          }
        }
      }
    }
    
    console.log(`   ✅ ${inserted} Zeilen erfolgreich kopiert${errors > 0 ? ` (${errors} Fehler)` : ''}`);
    
  } finally {
    sourceClient.release();
    targetClient.release();
  }
}

async function migrateDatabase() {
  console.log('🚀 Starte Datenbankmigration von Mathemat zu MatheZoo\n');
  console.log('Quelle:', SOURCE_DATABASE_URL.substring(0, 50) + '...');
  console.log('Ziel:', TARGET_DATABASE_URL.substring(0, 50) + '...\n');
  
  try {
    console.log('📝 Sessions werden übersprungen');
    
    await copyTableBatch('classes', ['id', 'name', 'teacher_id', 'created_at']);
    
    await copyTableBatch('users', [
      'id', 'username', 'password', 'first_name', 'last_name', 
      'role', 'class_id', 'created_at', 'updated_at'
    ]);
    
    console.log('\n⏭️  Cognitive Profiles übersprungen (werden neu generiert)');
    
    await copyTableBatch('learning_progression', [
      'id', 'user_id', 'current_level', 'level_history', 'milestones',
      'current_streak', 'total_tasks_solved', 'total_correct',
      'rml', 'cla', 'smi', 'tal', 'mca',
      'neuron_weights', 'neuron_activations', 'synaptic_strengths', 'memory_traces',
      'placeholder_performance', 'recent_performance', 'dimension_history',
      'strengths', 'gaps', 'strategic_goals',
      'current_cognitive_load', 'frustration_level', 'confidence', 'engagement',
      'dominant_strategy', 'emerging_strategies', 'strategy_flexibility',
      'support_requests_count', 'last_support_request',
      'last_analyzed', 'total_analyses', 'profile_version',
      'knowledge_gaps', 'error_history', 'error_patterns', 'daily_stats',
      'game_animals_collected', 'game_parties_count', 'game_total_attempts',
      'game_correct_answers', 'game_high_score', 'game_last_played',
      'task_mastery', 'competency_progress',
      'training_mode', 'custom_mode_config', 'blind_mode_config', 'mode_specific_tracking',
      'representation_config', 'representation_mastery', 'representation_progression',
      'game_coins', 'game_shop_items', 'game_badges',
      'game_zahlenwaage_played', 'game_zahlenwaage_score', 'game_zahlenwaage_high_score', 'game_zahlenwaage_last_played',
      'game_ten_wins_played', 'game_ten_wins_score', 'game_ten_wins_high_score', 'game_ten_wins_last_played',
      'game_decomposition_played', 'game_decomposition_score', 'game_decomposition_high_score', 'game_decomposition_last_played',
      'game_doubling_played', 'game_doubling_score', 'game_doubling_high_score', 'game_doubling_last_played',
      'game_pathfinder_played', 'game_pathfinder_score', 'game_pathfinder_high_score', 'game_pathfinder_last_played',
      'last_activity_at', 'created_at', 'updated_at'
    ], 50);
    
    await copyTableBatch('learning_sessions', [
      'id', 'user_id', 'session_type', 'started_at', 'completed_at', 'duration',
      'total_tasks', 'completed_tasks', 'correct_tasks', 'number_range',
      'emotional_state', 'language_data', 'created_at'
    ]);
    
    await copyTableBatch('tasks', [
      'id', 'session_id', 'task_type', 'operation', 'number1', 'number2',
      'correct_answer', 'number_range', 'placeholder_position', 'requires_inverse_thinking',
      'algebraic_complexity', 'digit_count', 'structural_complexity',
      'student_answer', 'is_correct', 'time_taken',
      'solution_steps', 'strategy_used', 'representations_used',
      'error_type', 'error_severity', 'created_at'
    ], 200);
    
    await copyTableBatch('achievements', [
      'id', 'user_id', 'achievement_type', 'title', 'description',
      'icon_name', 'progress', 'is_unlocked', 'unlocked_at', 'created_at'
    ]);
    
    await copyTableBatch('problem_statistics', [
      'id', 'operation', 'number1', 'number2', 'correct_answer', 'number_range',
      'total_attempts', 'correct_attempts', 'incorrect_attempts', 'success_rate',
      'average_time', 'fastest_time', 'slowest_time',
      'last_attempted_at', 'created_at', 'updated_at'
    ]);
    
    await copyTableBatch('zahlenwaage_game_stats', [
      'id', 'user_id', 'mode', 'total_attempts', 'correct_answers',
      'confetti_streaks', 'animals_collected', 'games_played',
      'last_played_at', 'created_at', 'updated_at'
    ]);
    
    console.log('\n✅ Migration abgeschlossen!');
    console.log('\n📋 Zusammenfassung:');
    console.log('   - Klassen und Benutzer migriert');
    console.log('   - Lernfortschritt und Statistiken übertragen');
    console.log('   - Aufgaben und Achievements kopiert');
    console.log('\n🚀 Die App ist bereit zum Publishen!');
    
  } catch (error) {
    console.error('\n❌ Fehler bei der Migration:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrateDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration fehlgeschlagen:', error);
    process.exit(1);
  });
