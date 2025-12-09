CREATE TABLE "achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"icon_name" varchar,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "big_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"goal_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"emoji" varchar DEFAULT '🏆' NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"target_progress" integer DEFAULT 100 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"teacher_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cognitive_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weaknesses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategy_preferences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_zpd_level" integer DEFAULT 1 NOT NULL,
	"success_rate" real DEFAULT 0.5 NOT NULL,
	"average_time_per_task" integer DEFAULT 60 NOT NULL,
	"number_range" integer DEFAULT 20 NOT NULL,
	"error_probabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"strategy_usage" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_diagnosis_date" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progression" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"level_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"total_tasks_solved" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"rml" real DEFAULT 0 NOT NULL,
	"cla" real DEFAULT 0.5 NOT NULL,
	"smi" real DEFAULT 0 NOT NULL,
	"tal" real DEFAULT 0.5 NOT NULL,
	"mca" real DEFAULT 0 NOT NULL,
	"neuron_weights" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"neuron_activations" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"synaptic_strengths" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"memory_traces" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"placeholder_performance" jsonb DEFAULT '{
    "start": {"attempted": 0, "correct": 0, "avgTime": 0},
    "middle": {"attempted": 0, "correct": 0, "avgTime": 0},
    "end": {"attempted": 0, "correct": 0, "avgTime": 0}
  }'::jsonb NOT NULL,
	"recent_performance" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dimension_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gaps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategic_goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_cognitive_load" real DEFAULT 0.5 NOT NULL,
	"frustration_level" real DEFAULT 0 NOT NULL,
	"confidence" real DEFAULT 0.5 NOT NULL,
	"engagement" real DEFAULT 0.8 NOT NULL,
	"dominant_strategy" varchar DEFAULT 'counting',
	"emerging_strategies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategy_flexibility" real DEFAULT 0 NOT NULL,
	"support_requests_count" integer DEFAULT 0 NOT NULL,
	"last_support_request" timestamp,
	"last_analyzed" timestamp,
	"total_analyses" integer DEFAULT 0 NOT NULL,
	"profile_version" varchar DEFAULT '2.0.0' NOT NULL,
	"knowledge_gaps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_patterns" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"daily_stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"game_animals_collected" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"game_parties_count" integer DEFAULT 0 NOT NULL,
	"game_total_attempts" integer DEFAULT 0 NOT NULL,
	"game_correct_answers" integer DEFAULT 0 NOT NULL,
	"game_high_score" integer DEFAULT 0 NOT NULL,
	"game_last_played" timestamp,
	"task_mastery" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"competency_progress" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"training_mode" varchar DEFAULT 'adaptive' NOT NULL,
	"custom_mode_config" jsonb DEFAULT '{
    "twentyFrame": true,
    "numberLine": true,
    "counters": true,
    "fingers": true,
    "symbolic": true
  }'::jsonb NOT NULL,
	"blind_mode_config" jsonb DEFAULT '{
    "twentyFrame": true,
    "numberLine": true,
    "counters": true,
    "fingers": true,
    "symbolic": false
  }'::jsonb NOT NULL,
	"mode_specific_tracking" jsonb DEFAULT '{
    "adaptive": {
      "tasksCompleted": 0,
      "totalCorrect": 0,
      "lastUsed": null
    },
    "custom": {
      "tasksCompleted": 0,
      "totalCorrect": 0,
      "lastUsed": null,
      "selectedRepresentations": ["twentyFrame", "numberLine", "counters", "fingers", "symbolic"]
    },
    "blind": {
      "tasksCompleted": 0,
      "totalCorrect": 0,
      "lastUsed": null,
      "selectedRepresentations": ["twentyFrame", "numberLine", "counters", "fingers"]
    }
  }'::jsonb NOT NULL,
	"representation_config" jsonb DEFAULT '{
    "twentyFrame": true,
    "numberLine": true,
    "counters": true,
    "fingers": true,
    "symbolic": true
  }'::jsonb NOT NULL,
	"representation_mastery" jsonb DEFAULT '{
    "twentyFrame": {"consecutiveCorrect": 0, "consecutiveErrors": 0, "totalUsed": 0, "successRate": 1.0},
    "numberLine": {"consecutiveCorrect": 0, "consecutiveErrors": 0, "totalUsed": 0, "successRate": 1.0},
    "counters": {"consecutiveCorrect": 0, "consecutiveErrors": 0, "totalUsed": 0, "successRate": 1.0},
    "fingers": {"consecutiveCorrect": 0, "consecutiveErrors": 0, "totalUsed": 0, "successRate": 1.0},
    "symbolic": {"consecutiveCorrect": 0, "consecutiveErrors": 0, "totalUsed": 0, "successRate": 1.0}
  }'::jsonb NOT NULL,
	"representation_progression" jsonb DEFAULT '{
    "stage": 1,
    "activeCount": 5,
    "lastReduction": null,
    "reductionHistory": []
  }'::jsonb NOT NULL,
	"game_coins" integer DEFAULT 0,
	"game_shop_items" text[],
	"game_badges" text[],
	"zoo_animals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"game_zahlenwaage_played" integer DEFAULT 0,
	"game_zahlenwaage_score" integer DEFAULT 0,
	"game_zahlenwaage_high_score" integer DEFAULT 0,
	"game_zahlenwaage_last_played" timestamp,
	"game_ten_wins_played" integer DEFAULT 0,
	"game_ten_wins_score" integer DEFAULT 0,
	"game_ten_wins_high_score" integer DEFAULT 0,
	"game_ten_wins_last_played" timestamp,
	"game_decomposition_played" integer DEFAULT 0,
	"game_decomposition_score" integer DEFAULT 0,
	"game_decomposition_high_score" integer DEFAULT 0,
	"game_decomposition_last_played" timestamp,
	"game_doubling_played" integer DEFAULT 0,
	"game_doubling_score" integer DEFAULT 0,
	"game_doubling_high_score" integer DEFAULT 0,
	"game_doubling_last_played" timestamp,
	"game_pathfinder_played" integer DEFAULT 0,
	"game_pathfinder_score" integer DEFAULT 0,
	"game_pathfinder_high_score" integer DEFAULT 0,
	"game_pathfinder_last_played" timestamp,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learning_progression_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_type" varchar NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"correct_tasks" integer DEFAULT 0 NOT NULL,
	"number_range" integer DEFAULT 20 NOT NULL,
	"emotional_state" varchar,
	"language_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mission_type" varchar NOT NULL,
	"target_continent" varchar,
	"target_group" varchar,
	"target_animal_count" integer DEFAULT 5 NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"emoji" varchar DEFAULT '🎯' NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"coin_reward" integer DEFAULT 100 NOT NULL,
	"xp_reward" integer DEFAULT 50 NOT NULL,
	"badge_reward" varchar,
	"difficulty_level" integer DEFAULT 1 NOT NULL,
	"unlock_level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_zoos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"partner_name" varchar NOT NULL,
	"continent" varchar NOT NULL,
	"emoji" varchar DEFAULT '🏛️' NOT NULL,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"required_animals" integer DEFAULT 10 NOT NULL,
	"bonus_type" varchar NOT NULL,
	"bonus_value" integer DEFAULT 15 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_statistics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation" varchar NOT NULL,
	"number1" integer NOT NULL,
	"number2" integer NOT NULL,
	"correct_answer" integer NOT NULL,
	"number_range" integer NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"correct_attempts" integer DEFAULT 0 NOT NULL,
	"incorrect_attempts" integer DEFAULT 0 NOT NULL,
	"success_rate" real DEFAULT 0 NOT NULL,
	"average_time" real DEFAULT 0 NOT NULL,
	"fastest_time" real,
	"slowest_time" real,
	"last_attempted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problem_statistics_operation_number1_number2_number_range_unique" UNIQUE("operation","number1","number2","number_range")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"task_type" varchar NOT NULL,
	"operation" varchar NOT NULL,
	"number1" integer NOT NULL,
	"number2" integer NOT NULL,
	"correct_answer" integer NOT NULL,
	"number_range" integer DEFAULT 20 NOT NULL,
	"placeholder_position" text DEFAULT 'end' NOT NULL,
	"requires_inverse_thinking" boolean DEFAULT false NOT NULL,
	"algebraic_complexity" real DEFAULT 0 NOT NULL,
	"digit_count" integer DEFAULT 2,
	"structural_complexity" real DEFAULT 0,
	"student_answer" integer,
	"is_correct" boolean,
	"time_taken" real,
	"solution_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategy_used" varchar,
	"representations_used" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_type" varchar,
	"error_severity" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"role" varchar DEFAULT 'student' NOT NULL,
	"class_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "zahlenwaage_game_stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mode" varchar DEFAULT 'student' NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"confetti_streaks" integer DEFAULT 0 NOT NULL,
	"animals_collected" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"last_played_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "zahlenwaage_game_stats_user_id_mode_unique" UNIQUE("user_id","mode")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "big_goals" ADD CONSTRAINT "big_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cognitive_profiles" ADD CONSTRAINT "cognitive_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_progression" ADD CONSTRAINT "learning_progression_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_zoos" ADD CONSTRAINT "partner_zoos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zahlenwaage_game_stats" ADD CONSTRAINT "zahlenwaage_game_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");