import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          description: string
          in_progress: boolean
          completed: boolean
          pomodoro: number
          pomodoro_counter: number
          alerted: boolean
          menu_toggled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          in_progress?: boolean
          completed?: boolean
          pomodoro?: number
          pomodoro_counter?: number
          alerted?: boolean
          menu_toggled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          in_progress?: boolean
          completed?: boolean
          pomodoro?: number
          pomodoro_counter?: number
          alerted?: boolean
          menu_toggled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}