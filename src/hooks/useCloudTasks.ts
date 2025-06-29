import { useEffect, useState } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@App/lib/firebase'
import { useAuth } from './useAuth'
import { ITask } from '@App/interfaces'
import { successToast, failureToast } from '@Utils/toast'

export function useCloudTasks() {
  const { user } = useAuth()
  const [cloudTasks, setCloudTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef, 
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const formattedTasks: ITask[] = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          description: data.description,
          inProgress: data.in_progress,
          completed: data.completed,
          pomodoro: data.pomodoro,
          pomodoroCounter: data.pomodoro_counter,
          alerted: data.alerted,
          menuToggled: data.menu_toggled,
        }
      })

      setCloudTasks(formattedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      failureToast('Failed to fetch tasks from cloud', false)
    } finally {
      setLoading(false)
    }
  }

  // Save task to Firestore
  const saveTask = async (task: ITask) => {
    if (!user) return

    try {
      const tasksRef = collection(db, 'tasks')
      await addDoc(tasksRef, {
        user_id: user.uid,
        description: task.description,
        in_progress: task.inProgress,
        completed: task.completed,
        pomodoro: task.pomodoro,
        pomodoro_counter: task.pomodoroCounter,
        alerted: task.alerted,
        menu_toggled: task.menuToggled,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error saving task:', error)
      failureToast('Failed to save task to cloud', false)
    }
  }

  // Update task in Firestore
  const updateTask = async (taskId: string, updates: Partial<ITask>) => {
    if (!user) return

    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        description: updates.description,
        in_progress: updates.inProgress,
        completed: updates.completed,
        pomodoro: updates.pomodoro,
        pomodoro_counter: updates.pomodoroCounter,
        alerted: updates.alerted,
        menu_toggled: updates.menuToggled,
        updated_at: serverTimestamp(),
      })

      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error updating task:', error)
      failureToast('Failed to update task in cloud', false)
    }
  }

  // Delete task from Firestore
  const deleteTask = async (taskId: string) => {
    if (!user) return

    try {
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
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
      const batch = writeBatch(db)
      
      // First, delete all existing tasks for this user
      const tasksRef = collection(db, 'tasks')
      const q = query(tasksRef, where('user_id', '==', user.uid))
      const existingTasks = await getDocs(q)
      
      existingTasks.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // Then add all local tasks
      localTasks.forEach((task) => {
        const newTaskRef = doc(collection(db, 'tasks'))
        batch.set(newTaskRef, {
          user_id: user.uid,
          description: task.description,
          in_progress: task.inProgress,
          completed: task.completed,
          pomodoro: task.pomodoro,
          pomodoro_counter: task.pomodoroCounter,
          alerted: task.alerted,
          menu_toggled: task.menuToggled,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      })

      await batch.commit()
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