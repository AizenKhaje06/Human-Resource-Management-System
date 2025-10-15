-- Create performance evaluations table
CREATE TABLE IF NOT EXISTS performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES profiles(id),
  evaluation_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  overall_score DECIMAL(3, 2) CHECK (overall_score >= 0 AND overall_score <= 5),
  technical_skills DECIMAL(3, 2) CHECK (technical_skills >= 0 AND technical_skills <= 5),
  communication DECIMAL(3, 2) CHECK (communication >= 0 AND communication <= 5),
  teamwork DECIMAL(3, 2) CHECK (teamwork >= 0 AND teamwork <= 5),
  leadership DECIMAL(3, 2) CHECK (leadership >= 0 AND leadership <= 5),
  productivity DECIMAL(3, 2) CHECK (productivity >= 0 AND productivity <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_performance_employee_id ON performance_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_evaluations(evaluation_date);

-- Enable RLS
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies for performance evaluations
CREATE POLICY "Employees can view their own evaluations"
  ON performance_evaluations FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "HR admins can view all evaluations"
  ON performance_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

CREATE POLICY "HR admins can manage evaluations"
  ON performance_evaluations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_performance_updated_at
  BEFORE UPDATE ON performance_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
