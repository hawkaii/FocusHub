/*
  # Create focus_sessions table for analytics

  1. New Tables
    - `focus_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (integer, in seconds)
      - `session_type` (text, 'focus' or 'break')
      - `task_id` (uuid, optional reference to tasks)
      - `task_category` (text, optional)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `focus_sessions` table
    - Add policy for users to manage their own sessions

  3. Indexes
    - Add indexes for better query performance
*/

CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer DEFAULT 0,
  session_type text NOT NULL CHECK (session_type IN ('focus', 'break')),
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  task_category text DEFAULT 'General',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own focus sessions
CREATE POLICY "Users can manage their own focus sessions"
  ON focus_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS focus_sessions_user_id_idx ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS focus_sessions_start_time_idx ON focus_sessions(start_time);
CREATE INDEX IF NOT EXISTS focus_sessions_session_type_idx ON focus_sessions(session_type);
CREATE INDEX IF NOT EXISTS focus_sessions_task_category_idx ON focus_sessions(task_category);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_focus_sessions_updated_at
  BEFORE UPDATE ON focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();