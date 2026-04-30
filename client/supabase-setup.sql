-- Create n8n_error_tracking table
CREATE TABLE IF NOT EXISTS n8n_error_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  error_message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE n8n_error_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to do all operations
CREATE POLICY "Allow all operations for authenticated users" ON n8n_error_tracking
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anon users to do all operations
CREATE POLICY "Allow all operations for anon users" ON n8n_error_tracking
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);