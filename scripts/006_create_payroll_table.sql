-- Create payroll table for salary management
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  bonuses DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) GENERATED ALWAYS AS (base_salary + allowances + bonuses - deductions - tax) STORED,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processed', 'paid')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON payroll(month, year);

-- Enable RLS
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Policies for payroll
CREATE POLICY "Employees can view their own payroll"
  ON payroll FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "HR admins can view all payroll"
  ON payroll FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

CREATE POLICY "HR admins can manage payroll"
  ON payroll FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_payroll_updated_at
  BEFORE UPDATE ON payroll
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
