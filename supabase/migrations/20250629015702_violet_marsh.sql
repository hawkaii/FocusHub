/*
  # Create pomodoro sessions table for analytics

  1. New Tables
    - `pomodoro_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (integer, in seconds)
      - `type` (text, 'work' | 'short-break' | 'long-break')
      - `task_id` (uuid, optional foreign key to tasks)
      - `completed` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pomodoro_sessions` table
    - Add policy for users to manage their own sessions
*/

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  type text NOT NULL CHECK (type IN ('work', 'short-break', 'long-break')),
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can manage their own pomodoro sessions"
  ON pomodoro_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pomodoro_sessions_user_id_idx ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_start_time_idx ON pomodoro_sessions(start_time);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_type_idx ON pomodoro_sessions(type);
CREATE INDEX IF NOT EXISTS pomodoro_sessions_completed_idx ON pomodoro_sessions(completed);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pomodoro_sessions_updated_at
  BEFORE UPDATE ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();