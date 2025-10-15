-- Create schedule change requests table
CREATE TABLE IF NOT EXISTS schedule_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('shift_change', 'day_off', 'schedule_swap', 'overtime', 'other')),
  current_schedule TEXT,
  requested_schedule TEXT NOT NULL,
  reason TEXT NOT NULL,
  request_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_schedule_requests_employee ON schedule_change_requests(employee_id);
CREATE INDEX idx_schedule_requests_status ON schedule_change_requests(status);
CREATE INDEX idx_schedule_requests_date ON schedule_change_requests(request_date);

-- Enable RLS
ALTER TABLE schedule_change_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Employees can view their own schedule requests"
  ON schedule_change_requests FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create schedule requests"
  ON schedule_change_requests FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "HR admins can view all schedule requests"
  ON schedule_change_requests FOR SELECT
  USING (public.is_hr_admin(auth.uid()));

CREATE POLICY "HR admins can manage schedule requests"
  ON schedule_change_requests FOR ALL
  USING (public.is_hr_admin(auth.uid()));

-- Trigger
CREATE TRIGGER update_schedule_requests_updated_at
  BEFORE UPDATE ON schedule_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
