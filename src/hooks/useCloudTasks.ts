import { useEffect, useState } from 'react'
import { supabase } from '@App/lib/supabase'
import { useAuth } from './useAuth'
import { ITask } from '@App/interfaces'
import { successToast, failureToast } from '@Utils/toast'

export function useCloudTasks() {
  const { user } = useAuth()
  const [cloudTasks, setCloudTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedTasks: ITask[] = data.map(task => ({
        id: parseInt(task.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
        description: task.description,
        inProgress: task.in_progress,
        completed: task.completed,
        pomodoro: task.pomodoro,
        pomodoroCounter: task.pomodoro_counter,
        alerted: task.alerted,
        menuToggled: task.menu_toggled,
      }))

      setCloudTasks(formattedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      failureToast('Failed to fetch tasks from cloud', false)
    } finally {
      setLoading(false)
    }
  }

  // Save task to Supabase
  const saveTask = async (task: ITask) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          description: task.description,
          in_progress: task.inProgress,
          completed: task.completed,
          pomodoro: task.pomodoro,
          pomodoro_counter: task.pomodoroCounter,
          alerted: task.alerted,
          menu_toggled: task.menuToggled,
        })

      if (error) throw error
      
      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error saving task:', error)
      failureToast('Failed to save task to cloud', false)
    }
  }

  // Update task in Supabase
  const updateTask = async (taskId: number, updates: Partial<ITask>) => {
    if (!user) return

    try {
      // Find the task in cloudTasks to get the UUID
      const cloudTask = cloudTasks.find(t => t.id === taskId)
      if (!cloudTask) return

      const { error } = await supabase
        .from('tasks')
        .update({
          description: updates.description,
          in_progress: updates.inProgress,
          completed: updates.completed,
          pomodoro: updates.pomodoro,
          pomodoro_counter: updates.pomodoroCounter,
          alerted: updates.alerted,
          menu_toggled: updates.menuToggled,
        })
        .eq('user_id', user.id)
        .eq('description', cloudTask.description) // Use description as identifier

      if (error) throw error
      
      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error updating task:', error)
      failureToast('Failed to update task in cloud', false)
    }
  }

  // Delete task from Supabase
  const deleteTask = async (taskId: number) => {
    if (!user) return

    try {
      const cloudTask = cloudTasks.find(t => t.id === taskId)
      if (!cloudTask) return

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('description', cloudTask.description)

      if (error) throw error
      
      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error deleting task:', error)
      failureToast('Failed to delete task from cloud', false)
    }
  }

  // Sync local tasks to cloud
  const syncToCloud = async (localTasks: ITask[]) => {
    if (!user) return

    setSyncing(true)
    try {
      // Clear existing tasks for this user
      await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)

      // Insert all local tasks
      const tasksToInsert = localTasks.map(task => ({
        user_id: user.id,
        description: task.description,
        in_progress: task.inProgress,
        completed: task.completed,
        pomodoro: task.pomodoro,
        pomodoro_counter: task.pomodoroCounter,
        alerted: task.alerted,
        menu_toggled: task.menuToggled,
      }))

      if (tasksToInsert.length > 0) {
        const { error } = await supabase
          .from('tasks')
          .insert(tasksToInsert)

        if (error) throw error
      }

      await fetchTasks()
      successToast('Tasks synced to cloud successfully', false)
    } catch (error) {
      console.error('Error syncing to cloud:', error)
      failureToast('Failed to sync tasks to cloud', false)
    } finally {
      setSyncing(false)
    }
  }

  // Load tasks from cloud to local
  const loadFromCloud = async () => {
    if (!user) return cloudTasks

    await fetchTasks()
    return cloudTasks
  }

  useEffect(() => {
    if (user) {
      fetchTasks()
    } else {
      setCloudTasks([])
    }
  }, [user])

  return {
    cloudTasks,
    loading,
    syncing,
    saveTask,
    updateTask,
    deleteTask,
    syncToCloud,
    loadFromCloud,
    fetchTasks,
  }
}