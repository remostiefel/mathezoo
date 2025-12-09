
-- Create homework_sets table
CREATE TABLE IF NOT EXISTS homework_sets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  title VARCHAR NOT NULL,
  description TEXT,
  themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  worksheet_count INTEGER NOT NULL DEFAULT 1,
  includes_solutions BOOLEAN NOT NULL DEFAULT true,
  difficulty_level VARCHAR NOT NULL DEFAULT 'adaptive',
  tasks_per_worksheet INTEGER NOT NULL DEFAULT 30,
  number_range INTEGER NOT NULL DEFAULT 20,
  status VARCHAR NOT NULL DEFAULT 'generated',
  assigned_at TIMESTAMP,
  due_at TIMESTAMP,
  completed_at TIMESTAMP,
  pdf_url TEXT,
  solution_pdf_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create homework_tasks table
CREATE TABLE IF NOT EXISTS homework_tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_set_id VARCHAR NOT NULL REFERENCES homework_sets(id) ON DELETE CASCADE,
  task_type VARCHAR NOT NULL,
  operation VARCHAR NOT NULL,
  number1 INTEGER NOT NULL,
  number2 INTEGER NOT NULL,
  correct_answer INTEGER NOT NULL,
  number_range INTEGER NOT NULL DEFAULT 20,
  placeholder_position VARCHAR NOT NULL DEFAULT 'none',
  package_id VARCHAR,
  package_pattern VARCHAR,
  package_position INTEGER,
  reflection_question TEXT,
  display_order INTEGER NOT NULL,
  worksheet_number INTEGER NOT NULL DEFAULT 1,
  section_title VARCHAR,
  student_answer INTEGER,
  is_correct BOOLEAN,
  attempted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_homework_sets_teacher_id ON homework_sets(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_sets_status ON homework_sets(status);
CREATE INDEX IF NOT EXISTS idx_homework_tasks_homework_set_id ON homework_tasks(homework_set_id);
CREATE INDEX IF NOT EXISTS idx_homework_tasks_display_order ON homework_tasks(display_order);
