
import { competencyBasedGenerator, COMPETENCY_DEFINITIONS } from './competencyBasedGenerator';
import type { LearningProgression } from '@shared/schema';

/**
 * KOMPETENZ-SYSTEM VALIDIERUNGS-TEST
 * 
 * Testet alle kritischen Edge-Cases:
 * 1. Neue User (keine Progression)
 * 2. Fortgeschrittene User (Level 50)
 * 3. Experten-User (alle Kompetenzen gemeistert)
 * 4. Boundary-Tests (Level 1, Level 100)
 */

console.log('🧪 STARTING COMPETENCY SYSTEM VALIDATION TEST...\n');

// Test 1: Neuer User
console.log('TEST 1: Neuer User (Level 1)');
const newUserProgression: LearningProgression = {
  id: 'test-new-user',
  userId: 'test-new-user',
  currentStage: 1,
  currentLevel: 1,
  stageHistory: [],
  levelHistory: [{
    level: 1,
    attemptsCount: 0,
    correctCount: 0,
    masteredAt: null,
    unlockedAt: new Date().toISOString(),
    totalAttempts: 0,
    successRate: 0,
    averageTime: 0,
    lastAttemptAt: null,
  }],
  milestones: [],
  currentStreak: 0,
  totalTasksSolved: 0,
  totalCorrect: 0,
  knowledgeGaps: [],
  dailyStats: {},
  lastActivityAt: new Date(),
  taskMastery: {},
  competencyProgress: {},
};

try {
  const tasks1 = competencyBasedGenerator.generateMixedTasks(newUserProgression, 10, 1);
  console.log(`✅ Generated ${tasks1.length} tasks for new user`);
  console.log(`   Operations: ${tasks1.filter(t => t.operation === '+').length} additions, ${tasks1.filter(t => t.operation === '-').length} subtractions`);
  console.log(`   Number ranges: ${[...new Set(tasks1.map(t => t.numberRange))].join(', ')}`);
} catch (error) {
  console.error('❌ FAILED for new user:', error);
}

// Test 2: Fortgeschrittener User (Level 50)
console.log('\nTEST 2: Fortgeschrittener User (Level 50)');
const advancedUserProgression: LearningProgression = {
  ...newUserProgression,
  id: 'test-advanced-user',
  userId: 'test-advanced-user',
  currentLevel: 50,
  levelHistory: Array.from({ length: 50 }, (_, i) => ({
    level: i + 1,
    attemptsCount: 10,
    correctCount: 10,
    masteredAt: new Date().toISOString(),
    unlockedAt: new Date().toISOString(),
    totalAttempts: 10,
    successRate: 1.0,
    averageTime: 5,
    lastAttemptAt: new Date().toISOString(),
  })),
  competencyProgress: Object.fromEntries(
    COMPETENCY_DEFINITIONS.filter(c => c.minLevel <= 3.0).map(comp => [
      comp.id,
      {
        level: 7.0,
        attempted: 15,
        correct: 14,
        successRate: 0.93,
        lastPracticed: new Date(),
        tasksMastered: ['8+5', '7+6', '9+4', '6+7', '8+8'],
        recentErrors: [],
      }
    ])
  ),
};

try {
  const tasks2 = competencyBasedGenerator.generateMixedTasks(advancedUserProgression, 10, 50);
  console.log(`✅ Generated ${tasks2.length} tasks for advanced user`);
  console.log(`   Number ranges: ${[...new Set(tasks2.map(t => t.numberRange))].join(', ')}`);
} catch (error) {
  console.error('❌ FAILED for advanced user:', error);
}

// Test 3: Experten-User (alle Kompetenzen gemeistert)
console.log('\nTEST 3: Experten-User (alle Kompetenzen gemeistert)');
const expertUserProgression: LearningProgression = {
  ...newUserProgression,
  id: 'test-expert-user',
  userId: 'test-expert-user',
  currentLevel: 100,
  competencyProgress: Object.fromEntries(
    COMPETENCY_DEFINITIONS.map(comp => [
      comp.id,
      {
        level: 7.0,
        attempted: 20,
        correct: 19,
        successRate: 0.95,
        lastPracticed: new Date(),
        tasksMastered: ['task1', 'task2', 'task3', 'task4', 'task5'],
        recentErrors: [],
      }
    ])
  ),
};

try {
  const tasks3 = competencyBasedGenerator.generateMixedTasks(expertUserProgression, 10, 100);
  console.log(`✅ Generated ${tasks3.length} tasks for expert user`);
  if (tasks3.length > 0) {
    console.log(`   ⚠️ WARNING: Expert with all mastered competencies still got tasks (expected for review)`);
  }
} catch (error) {
  console.error('❌ FAILED for expert user:', error);
}

// Test 4: Boundary Test - Level 1
console.log('\nTEST 4: Boundary Test - Level 1');
try {
  const tasks4 = competencyBasedGenerator.generateMixedTasks(newUserProgression, 10, 1);
  console.log(`✅ Level 1 works: ${tasks4.length} tasks`);
} catch (error) {
  console.error('❌ FAILED at Level 1:', error);
}

// Test 5: Boundary Test - Level 100
console.log('\nTEST 5: Boundary Test - Level 100');
try {
  const tasks5 = competencyBasedGenerator.generateMixedTasks(newUserProgression, 10, 100);
  console.log(`✅ Level 100 works: ${tasks5.length} tasks`);
} catch (error) {
  console.error('❌ FAILED at Level 100:', error);
}

// Test 6: Mastered Tasks sind wirklich gemeistert
console.log('\nTEST 6: Überprüfe dass gemeisterte Tasks nicht wiederholt werden');
const masteredProgression: LearningProgression = {
  ...newUserProgression,
  taskMastery: {
    '5+3': { attempts: 3, correct: 3, lastAttempt: new Date(), mastered: true },
    '8+2': { attempts: 3, correct: 3, lastAttempt: new Date(), mastered: true },
  },
  competencyProgress: {
    'addition_ZR10_no_transition': {
      level: 5.0,
      attempted: 10,
      correct: 9,
      successRate: 0.9,
      lastPracticed: new Date(),
      tasksMastered: ['5+3', '8+2', '7+1', '6+2', '9+1'],
      recentErrors: [],
    }
  },
};

try {
  const tasks6 = competencyBasedGenerator.generateMixedTasks(masteredProgression, 10, 1);
  const hasMasteredTask = tasks6.some(t => 
    (t.number1 === 5 && t.number2 === 3) || (t.number1 === 8 && t.number2 === 2)
  );
  
  if (hasMasteredTask) {
    console.log('⚠️ WARNING: Mastered task appeared in new task list');
  } else {
    console.log('✅ Mastered tasks correctly excluded');
  }
} catch (error) {
  console.error('❌ FAILED mastery test:', error);
}

console.log('\n🏁 COMPETENCY SYSTEM VALIDATION COMPLETE');
