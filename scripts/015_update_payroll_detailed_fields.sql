-- Drop the old payroll table and recreate with new structure
DROP TABLE IF EXISTS payroll CASCADE;

-- Create enhanced payroll table with detailed fields
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  
  -- Income fields
  base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  overtime_pay DECIMAL(12, 2) DEFAULT 0,
  bonuses DECIMAL(12, 2) DEFAULT 0,
  holiday_pay DECIMAL(12, 2) DEFAULT 0,
  
  -- Deduction fields
  sss DECIMAL(12, 2) DEFAULT 0,
  philhealth DECIMAL(12, 2) DEFAULT 0,
  pagibig DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  late_deduction DECIMAL(12, 2) DEFAULT 0,
  cash_advance DECIMAL(12, 2) DEFAULT 0,
  other_deductions DECIMAL(12, 2) DEFAULT 0,
  
  -- Computed fields
  total_income DECIMAL(12, 2) GENERATED ALWAYS AS (base_salary + allowances + overtime_pay + bonuses + holiday_pay) STORED,
  total_deductions DECIMAL(12, 2) GENERATED ALWAYS AS (sss + philhealth + pagibig + tax + late_deduction + cash_advance + other_deductions) STORED,
  net_salary DECIMAL(12, 2) GENERATED ALWAYS AS (base_salary + allowances + overtime_pay + bonuses + holiday_pay - sss - philhealth - pagibig - tax - late_deduction - cash_advance - other_deductions) STORED,
  
  -- Payment details
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processed', 'paid')),
  payment_method VARCHAR(20) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash', 'check')),
  payment_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Create indexes
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_payroll_payment_status ON payroll(payment_status);

-- Enable RLS
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Policies for payroll
CREATE POLICY "Employees can view their own payroll"
  ON payroll FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "HR admins can view all payroll"
  ON payroll FOR SELECT
  USING (public.is_hr_admin(auth.uid()));

CREATE POLICY "HR admins can manage payroll"
  ON payroll FOR ALL
  USING (public.is_hr_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_payroll_updated_at
  BEFORE UPDATE ON payroll
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
