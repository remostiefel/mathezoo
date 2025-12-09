import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Task Type - Unified type for all task patterns (Wittmann operative packages + custom)
export type TaskType =
  // Operative Päckchen (Wittmann)
  | 'constant_sum'
  | 'constant_difference'
  | 'plus_minus_one'
  | 'exchange'
  | 'inverse'
  | 'decade_steps'
  | 'core_task_doubling'
  | 'core_task_to_ten'
  | 'analogy_place_value'
  | 'derivation_multi_path'
  | 'associative_grouping'
  | 'distributive_decomposition'
  // Legacy pattern names (still supported)
  | 'sum_constancy'
  | 'neighbor_tasks'
  | 'reversal'
  | 'analogy'
  | 'decomposition'
  | 'decomposition_step'
  | 'decade_transition'
  | 'inverse_problems'
  | 'difference_constancy'
  // Competency-based types
  | 'addition_ZR10_no_transition'
  | 'subtraction_ZR10_no_transition'
  | 'addition_to_10'
  | 'subtraction_from_10'
  | 'addition_ZR20_no_transition'
  | 'subtraction_ZR20_no_transition'
  | 'addition_with_transition'
  | 'subtraction_with_transition'
  | 'placeholder_end'
  | 'placeholder_middle'
  | 'placeholder_start'
  | 'doubles'
  | 'near_doubles'
  | 'decomposition_to_10'
  | 'number_bonds_10'
  | 'number_bonds_20'
  | 'inverse_operations'
  // Multiplication & Division
  | 'multiplication_prereq_doubling'
  | 'multiplication_prereq_groups'
  | 'multiplication_2er_row'
  | 'multiplication_5er_row'
  | 'multiplication_10er_row'
  | 'division_grouping'
  | 'division_sharing'
  // Generic
  | 'standard'
  | 'custom';

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "5s", "4b"
  teacherId: varchar("teacher_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Class Teachers Join Table (Many-to-Many)
export const classTeachers = pgTable("class_teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull().references(() => classes.id, { onDelete: 'cascade' }),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueAssignment: unique().on(table.classId, table.teacherId),
}));

// User storage table (teachers and students)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // bcrypt hashed
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role", { enum: ['teacher', 'student', 'admin'] }).notNull().default('student'),
  classId: varchar("class_id"), // For students: references their class
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  students: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  class: one(classes, {
    fields: [users.classId],
    references: [classes.id],
  }),
  cognitiveProfile: one(cognitiveProfiles, {
    fields: [users.id],
    references: [cognitiveProfiles.userId],
  }),
  progression: one(learningProgression, {
    fields: [users.id],
    references: [learningProgression.userId],
  }),
  userTeams: many(userTeams),
}));

export const cognitiveProfiles = pgTable("cognitive_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  strengths: text("strengths").notNull(),
  weaknesses: text("weaknesses").notNull(),
  strategyPreferences: jsonb("strategy_preferences").notNull().default(sql`'[]'::jsonb`),
  currentZPDLevel: integer("current_zpd_level").notNull().default(1),
  successRate: real("success_rate").notNull().default(0),
  averageTimePerTask: integer("average_time_per_task").notNull().default(0),
  errorProbabilities: jsonb("error_probabilities").notNull().default(sql`'{}'::jsonb`),
  strategyUsage: jsonb("strategy_usage").notNull().default(sql`'{}'::jsonb`),
  lastDiagnosisDate: timestamp("last_diagnosis_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  numberRange: integer("number_range").notNull().default(20),
});

export const cognitiveProfilesRelations = relations(
  cognitiveProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [cognitiveProfiles.userId],
      references: [users.id],
    }),
  })
);

export const learningSessions = pgTable("learning_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Module config
  moduleType: varchar("module_type").notNull().default("minusplus"), // 'minusplus', 'maldurch', etc.
  sessionType: varchar("session_type").notNull().default("practice"), // 'assessment', 'practice', 'challenge'
  difficulty: integer("difficulty").notNull().default(1), // 1-5
  numberRange: integer("number_range").notNull().default(20), // 20 or 100
  // Performance tracking
  totalProblems: integer("total_problems").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  duration: integer("duration").notNull().default(0), // seconds
  accuracy: real("accuracy").notNull().default(0), // percentage
  // Timestamps
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Homework task fields (nullable for adaptive learning)
  homeworkSetId: varchar("homework_set_id").references(
    () => homeworkSets.id,
    { onDelete: "cascade" }
  ),
  type: varchar("type", { enum: ["open_text", "image"] }).default("open_text"),
  taskPatternType: varchar("task_pattern_type"), // Nullable for adaptive tasks
  question: text("question"), // Nullable for adaptive tasks
  imageUrl: varchar("image_url"), // URL to image
  imageDescription: text("image_description"),
  hints: jsonb("hints").default(sql`'[]'::jsonb`),
  tags: text("tags"), // comma separated
  explanations: jsonb("explanations").default(sql`'[]'::jsonb`),
  skillTier: integer("skill_tier"),
  cognitiveLevel: varchar("cognitive_level", {
    enum: ["recall", "understand", "apply", "analyze", "evaluate", "create"],
  }),

  // Adaptive learning task fields
  sessionId: varchar("session_id").references(
    () => learningSessions.id,
    { onDelete: "cascade" }
  ),
  number1: integer("number1"),
  number2: integer("number2"),
  numberRange: integer("number_range"),
  operation: varchar("operation"), // '+', '-', '*', '/'
  studentAnswer: text("student_answer"),
  correctAnswer: text("correct_answer"),
  isCorrect: boolean("is_correct"),
  timeTaken: integer("time_taken"), // milliseconds
  errorType: varchar("error_type"),
  errorSeverity: varchar("error_severity"), // 'low', 'medium', 'high'
  strategyUsed: varchar("strategy_used"),
  taskType: varchar("task_type"), // 'basic_operation', etc.
  difficulty: integer("difficulty").default(1),
  placeholderPosition: varchar("placeholder_position"), // 'start', 'middle', 'end'

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  progress: integer("progress").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  objective: text("objective").notNull(),
  reward: integer("reward").notNull(), // Points/coins
  progress: integer("progress").notNull().default(0), // Current progress
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerZoos = pgTable("partner_zoos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Optional: associate with user
  name: varchar("name").notNull(),
  location: varchar("location"),
  description: text("description"),
  partnershipStart: timestamp("partnership_start"),
  animalsCount: integer("animals_count"),
  visitors: integer("visitors").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  ticketPrice: integer("ticket_price").notNull().default(1), // ZooMünzen
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bigGoals = pgTable("big_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goalName: varchar("goal_name").notNull(),
  description: text("description"),
  targetValue: integer("target_value").notNull(),
  currentProgress: integer("current_progress").notNull().default(0),
  category: varchar("category").notNull(), // 'learning', 'wellbeing', 'creativity'
  progress: real("progress").notNull().default(0), // 0-100
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  feedbackType: varchar("feedback_type").notNull(), // 'bug', 'feature', 'other'
  message: text("message").notNull(),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningProgression = pgTable("learning_progression", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  // Level progression
  currentLevel: integer("current_level").notNull().default(1),
  totalXP: integer("total_xp").notNull().default(0),
  xpToNextLevel: integer("xp_to_next_level").notNull().default(100),
  // Module progression tracking
  modulesAccessed: jsonb("modules_accessed").notNull().default(sql`'{}'::jsonb`), // { [moduleId]: { level, score } }
  // Plus-Minus (ZR20)
  plusMinusLevel: integer("plus_minus_level").notNull().default(0),
  plusMinusLeveledUp: boolean("plus_minus_leveled_up").notNull().default(false),
  // Multiplication (1x1)
  multiplicationLevel: integer("multiplication_level").notNull().default(0),
  multiplicationLeveledUp: boolean("multiplication_leveled_up").notNull().default(false),
  // Zahlenwaage balance
  zahlenwaageLeveledUp: boolean("zahlenwaage_leveled_up").notNull().default(false),
  zahlenwaageScore: integer("zahlenwaage_score").notNull().default(0),
  // Achievement badges
  badges: text("badges").notNull().default(""), // comma separated
  // ===== GAME & ZOO FIELDS =====
  gameCoins: integer("game_coins").notNull().default(0),
  gameAnimalsCollected: jsonb("game_animals_collected").notNull().default(sql`'[]'::jsonb`),
  gameShopItems: text("game_shop_items").array().notNull().default(sql`'{}'::text[]`),
  gameBadges: text("game_badges").array().notNull().default(sql`'{}'::text[]`),
  gameCorrectAnswers: integer("game_correct_answers").notNull().default(0),
  gameHighScore: integer("game_high_score").notNull().default(0),
  gamePartiesCount: integer("game_parties_count").notNull().default(0),
  gameLastPlayed: timestamp("game_last_played"),
  gameTotalAttempts: integer("game_total_attempts").notNull().default(0),
  // Zahlenwaage game stats
  gameZahlenwaageScore: integer("game_zahlenwaage_score").notNull().default(0),
  gameZahlenwaagePlayed: integer("game_zahlenwaage_played").notNull().default(0),
  gameZahlenwaageHighScore: integer("game_zahlenwaage_high_score").notNull().default(0),
  gameZahlenwaageLastPlayed: timestamp("game_zahlenwaage_last_played"),
  // Other game stats
  gameDecompositionScore: integer("game_decomposition_score").notNull().default(0),
  gameDecompositionPlayed: integer("game_decomposition_played").notNull().default(0),
  gameDecompositionHighScore: integer("game_decomposition_high_score").notNull().default(0),
  gameDoublingScore: integer("game_doubling_score").notNull().default(0),
  gameDoublingPlayed: integer("game_doubling_played").notNull().default(0),
  gameDoublingHighScore: integer("game_doubling_high_score").notNull().default(0),
  gameTenWinsScore: integer("game_ten_wins_score").notNull().default(0),
  gameTenWinsPlayed: integer("game_ten_wins_played").notNull().default(0),
  gameTenWinsHighScore: integer("game_ten_wins_high_score").notNull().default(0),
  gamePathfinderScore: integer("game_pathfinder_score").notNull().default(0),
  gamePathfinderPlayed: integer("game_pathfinder_played").notNull().default(0),
  gamePathfinderHighScore: integer("game_pathfinder_high_score").notNull().default(0),
  // Zoo related
  zooAnimals: jsonb("zoo_animals").notNull().default(sql`'[]'::jsonb`),
  zooEconomyStats: jsonb("zoo_economy_stats").notNull().default(sql`'{}'::jsonb`),
  // Level history tracking for adaptive learning
  levelHistory: jsonb("level_history").notNull().default(sql`'[]'::jsonb`),
  // Error statistics tracking for teachers/admins - CRITICAL FOR ANALYSIS
  errorStatistics: jsonb("error_statistics").notNull().default(sql`'{}'::jsonb`), // { errorHistory: [], errorPatterns: {}, lastUpdated: timestamp }

  // Competency & Adaptive Learning fields (New)
  taskMastery: jsonb("task_mastery").default(sql`'{}'::jsonb`),
  competencyProgress: jsonb("competency_progress").default(sql`'{}'::jsonb`),
  currentStage: varchar("current_stage"),
  stageHistory: jsonb("stage_history").default(sql`'[]'::jsonb`),
  milestones: jsonb("milestones").default(sql`'[]'::jsonb`),
  knowledgeGaps: jsonb("knowledge_gaps").default(sql`'[]'::jsonb`),
  dailyStats: jsonb("daily_stats").default(sql`'{}'::jsonb`),

  // Legacy or redundant fields accessed directly in code (should eventually migrate to errorStatistics)
  errorHistory: jsonb("error_history").default(sql`'[]'::jsonb`),
  errorPatterns: jsonb("error_patterns").default(sql`'{}'::jsonb`),

  ticketPrice: real("ticket_price").notNull().default(1.0),
  // Session & tracking
  totalCorrect: integer("total_correct").notNull().default(0),
  totalTasksSolved: integer("total_tasks_solved").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastLoginAt: timestamp("last_login_at"),
  lastActivityAt: timestamp("last_activity_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningProgressionRelations = relations(
  learningProgression,
  ({ one }) => ({
    user: one(users, {
      fields: [learningProgression.userId],
      references: [users.id],
    }),
  })
);

export const problemStatistics = pgTable("problem_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  taskType: varchar("task_type"),
  // Problem identification
  operation: varchar("operation"), // '+', '-', '*', '/'
  number1: integer("number1"),
  number2: integer("number2"),
  numberRange: integer("number_range"),
  correctAnswer: text("correct_answer"),
  // Statistics
  totalAttempts: integer("total_attempts").notNull().default(0),
  correctAttempts: integer("correct_attempts").notNull().default(0),
  incorrectAttempts: integer("incorrect_attempts").notNull().default(0),
  successRate: real("success_rate").notNull().default(0),
  averageTime: real("average_time").notNull().default(0), // milliseconds
  averageResponseTime: real("average_response_time").notNull().default(0), // seconds (legacy)
  fastestTime: integer("fastest_time"),
  slowestTime: integer("slowest_time"),
  lastAttemptedAt: timestamp("last_attempted_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homeworkSets = pgTable("homework_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id, { onDelete: "cascade" }), // Made optional as some sets might not be linked to a class structure directly
  teacherId: varchar("teacher_id").notNull(), // Added
  studentIds: jsonb("student_ids").notNull().default(sql`'[]'::jsonb`), // JSON array of student IDs
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  dueAt: timestamp("due_at"), // Alias for dueDate to match code usage? Code uses dueAt in validation but maybe maps to dueDate. Let's add dueAt.

  // Generation settings & metadata
  themes: jsonb("themes").notNull().default(sql`'[]'::jsonb`),
  worksheetCount: integer("worksheet_count").notNull().default(1),
  includesSolutions: boolean("includes_solutions").notNull().default(false),
  difficultyLevel: varchar("difficulty_level"),
  tasksPerWorksheet: integer("tasks_per_worksheet"),
  numberRange: integer("number_range"),
  status: varchar("status").notNull().default('draft'), // generated, assigned, etc.
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homeworkTasksRelations = relations(
  homeworkSets,
  ({ many }) => ({
    tasks: many(homeworkTasks),
  })
);

export const homeworkTasks = pgTable("homework_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkSetId: varchar("homework_set_id")
    .notNull()
    .references(() => homeworkSets.id, { onDelete: "cascade" }),
  studentId: varchar("student_id") // Made optional/nullable if task is template? No, routes say insert per student.
    .references(() => users.id, { onDelete: "cascade" }),

  // Organization
  displayOrder: integer("display_order").notNull().default(0),
  worksheetNumber: integer("worksheet_number").notNull().default(1),
  packageId: varchar("package_id"),
  sectionTitle: varchar("section_title"),

  // Content - Flattened for easier query as used in routes
  taskType: varchar("task_type").notNull(),
  operation: varchar("operation"),
  number1: integer("number1"),
  number2: integer("number2"),
  correctAnswer: text("correct_answer"),
  placeholderPosition: varchar("placeholder_position"),
  reflectionQuestion: text("reflection_question"),

  taskContent: jsonb("task_content").notNull().default(sql`'{}'::jsonb`), // Fallback for complex structure

  completed: boolean("completed").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  response: text("response"),
  correctness: boolean("correctness"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const zahlenwaageGameStats = pgTable("zahlenwaage_game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  gameType: varchar("game_type").notNull(), // 'zahlenwaage', 'plus_minus', 'one-times-one'
  mode: varchar("mode"), // 'student' or 'teacher_training'
  totalLevels: integer("total_levels").notNull().default(0),
  totalErrors: integer("total_errors").notNull().default(0),
  totalAttempts: integer("total_attempts").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  confettiStreaks: integer("confetti_streaks").notNull().default(0),
  animalsCollected: jsonb("animals_collected").notNull().default(sql`'[]'::jsonb`),
  gamesPlayed: integer("games_played").notNull().default(0),
  errors: jsonb("errors").notNull().default(sql`'[]'::jsonb`),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Animal Card System
export const animalCards = pgTable("animal_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  animalType: varchar("animal_type").notNull().unique(), // 'lion', 'elephant', 'panda', 'monkey', etc.
  name: varchar("name").notNull(), // 'Löwe', 'Elefant', etc.
  emoji: varchar("emoji").notNull().default('🦁'),

  // Talente (3 pro Tier)
  talents: jsonb("talents").notNull().default(sql`'[]'::jsonb`),

  // Unlock Requirements
  starterAnimal: boolean("starter_animal").notNull().default(false), // Bereits freigeschaltet
  unlockRequirement: jsonb("unlock_requirement").notNull().default(sql`'{}'::jsonb`),

  rarity: varchar("rarity", { enum: ['common', 'rare', 'epic', 'legendary'] }).notNull().default('common'),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const animalCardsRelations = relations(animalCards, ({ many }) => ({
  userAnimals: many(userAnimalCards),
}));

// User Animal Cards - User-spezifische Tier-Daten
export const userAnimalCards = pgTable("user_animal_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  animalCardId: varchar("animal_card_id").notNull().references(() => animalCards.id, { onDelete: 'cascade' }),

  // Persönlicher Name für dieses Tier (z.B. "König Leo", "Dumbo")
  individualName: varchar("individual_name"),

  // Freundschafts-System (1-5 Herzen)
  friendshipLevel: integer("friendship_level").notNull().default(1), // 1-5
  xp: integer("xp").notNull().default(0), // XP für dieses Tier
  xpToNextLevel: integer("xp_to_next_level").notNull().default(100), // XP benötigt für nächstes Level

  // Stats
  timesUsed: integer("times_used").notNull().default(0), // Wie oft wurde Tier in Games genutzt
  gamesWon: integer("games_won").notNull().default(0), // Spiele mit diesem Tier gewonnen

  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  lastUsedAt: timestamp("last_used_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserAnimal: unique().on(table.userId, table.animalCardId),
}));

export const userAnimalCardsRelations = relations(userAnimalCards, ({ one }) => ({
  user: one(users, {
    fields: [userAnimalCards.userId],
    references: [users.id],
  }),
  animalCard: one(animalCards, {
    fields: [userAnimalCards.animalCardId],
    references: [animalCards.id],
  }),
}));

// Team Bonuses
export const teamBonuses = pgTable("team_bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bonusName: varchar("bonus_name").notNull(),
  description: text("description"),
  requiredAnimals: jsonb("required_animals").notNull().default(sql`'[]'::jsonb`), // Array von animal types
  minFriendshipLevel: integer("min_friendship_level").notNull().default(1),
  bonusEffects: jsonb("bonus_effects").notNull().default(sql`'[]'::jsonb`),
  emoji: varchar("emoji"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// USER TEAMS - Neu für die Multi-Team Funktionalität!
export const userTeams = pgTable("user_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  teamName: varchar("team_name").notNull(), // Auto-generiert lustig: "Die Furchtlosen Giraffen", "Team Zebra-Dream"
  animalIds: jsonb("animal_ids").notNull(), // Array von animal card IDs
  description: text("description"), // Optional beschreibung
  synergy: text("synergy"), // Synergy-Harmonien: wie Tiere zusammenarbeiten
  isActive: boolean("is_active").notNull().default(false), // Aktuell aktives Team
  wins: integer("wins").notNull().default(0),
  usedInGames: integer("used_in_games").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index().on(table.userId),
}));

export const userTeamsRelations = relations(userTeams, ({ one }) => ({
  user: one(users, {
    fields: [userTeams.userId],
    references: [users.id],
  }),
}));

// Campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  difficulty: integer("difficulty").notNull(),
  levels: jsonb("levels").notNull().default(sql`'[]'::jsonb`),
  reward: jsonb("reward").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  userProgress: many(userCampaignProgress),
}));

export const userCampaignProgress = pgTable("user_campaign_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  currentLevel: integer("current_level").notNull().default(1),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserCampaign: unique().on(table.userId, table.campaignId),
}));

export const userCampaignProgressRelations = relations(userCampaignProgress, ({ one }) => ({
  user: one(users, {
    fields: [userCampaignProgress.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [userCampaignProgress.campaignId],
    references: [campaigns.id],
  }),
}));

// Core type exports - User & Sessions
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type CognitiveProfile = typeof cognitiveProfiles.$inferSelect;
export type InsertCognitiveProfile = typeof cognitiveProfiles.$inferInsert;

export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = typeof learningSessions.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type LearningProgression = typeof learningProgression.$inferSelect;
export type InsertLearningProgression = typeof learningProgression.$inferInsert;

export type ProblemStatistics = typeof problemStatistics.$inferSelect;
export type InsertProblemStatistics = typeof problemStatistics.$inferInsert;

export type ZahlenwaageGameStats = typeof zahlenwaageGameStats.$inferSelect;
export type InsertZahlenwaageGameStats = typeof zahlenwaageGameStats.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

export type PartnerZoo = typeof partnerZoos.$inferSelect;
export type InsertPartnerZoo = typeof partnerZoos.$inferInsert;

export type BigGoal = typeof bigGoals.$inferSelect;
export type InsertBigGoal = typeof bigGoals.$inferInsert;

export type HomeworkSet = typeof homeworkSets.$inferSelect;
export type InsertHomeworkSet = typeof homeworkSets.$inferInsert;

// Type exports für Tier-Kartensystem
export type InsertAnimalCard = typeof animalCards.$inferInsert;
export type AnimalCard = typeof animalCards.$inferSelect;

export type InsertUserAnimalCard = typeof userAnimalCards.$inferInsert;
export type UserAnimalCard = typeof userAnimalCards.$inferSelect;

export type InsertTeamBonus = typeof teamBonuses.$inferInsert;
export type TeamBonus = typeof teamBonuses.$inferSelect;

export type InsertCampaign = typeof campaigns.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertUserCampaignProgress = typeof userCampaignProgress.$inferInsert;
export type UserCampaignProgress = typeof userCampaignProgress.$inferSelect;

export type InsertUserTeam = typeof userTeams.$inferInsert;
export type UserTeam = typeof userTeams.$inferSelect;

// Zod schemas für Tier-Kartensystem
export const insertAnimalCardSchema = createInsertSchema(animalCards).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnimalCardSchema = createInsertSchema(userAnimalCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamBonusSchema = createInsertSchema(teamBonuses).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertUserCampaignProgressSchema = createInsertSchema(userCampaignProgress).omit({
  id: true,
  startedAt: true,
  updatedAt: true,
});

export const insertUserTeamSchema = createInsertSchema(userTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  animalIds: z.array(z.string()).min(2).max(3),
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const analyzeStudentsRequestSchema = z.object({
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
  sessionCount: z.number().int().min(1, "Session count must be at least 1"),
  minTaskCount: z.number().int().min(1, "Min task count must be at least 1"),
});

export const generateThemesRequestSchema = z.object({
  diagnosticReports: z.array(z.any()), // Typing this strictly would require deeper types
  maxThemes: z.number().optional().default(3),
  minRelevanceScore: z.number().optional().default(30),
});

export const generateHomeworkRequestSchema = z.object({
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
  themes: z.array(z.any()).optional(), // Theme definition
  worksheetCount: z.number().int().min(1).default(1),
  tasksPerWorksheet: z.number().int().min(1).default(10),
  includeSolutions: z.boolean().default(false),
  title: z.string().min(1),
  description: z.string().optional(),
  dueAt: z.string().or(z.date()).optional(), // Accept string from JSON
});
