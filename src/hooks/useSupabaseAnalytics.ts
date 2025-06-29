import { useEffect, useState, useCallback } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@App/lib/firebase'
import { useAuth } from './useAuth'
import { IPomodoroSession, IUserStats, IHeatmapData } from '@App/interfaces'
import { successToast, failureToast } from '@Utils/toast'
import { getStartOfDay, getStartOfWeek, getStartOfMonth, getStartOfYear, calculateDuration } from '@Utils/timeUtils'

export function useSupabaseAnalytics() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<IPomodoroSession[]>([])
  const [userStats, setUserStats] = useState<IUserStats>({
    totalSessions: 0,
    totalFocusTime: 0,
    averageSessionLength: 0,
    longestStreak: 0,
    currentStreak: 0,
    sessionsToday: 0,
    focusTimeToday: 0,
    sessionsThisWeek: 0,
    focusTimeThisWeek: 0,
    sessionsThisMonth: 0,
    focusTimeThisMonth: 0,
  })
  const [heatmapData, setHeatmapData] = useState<IHeatmapData[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch sessions from Supabase
  const fetchSessions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const sessionsData = await getDocs(
        query(
          collection(db, 'pomodoro_sessions'),
          where('user_id', '==', user.uid),
          orderBy('start_time', 'desc')
        )
      )

      const formattedSessions: IPomodoroSession[] = sessionsData.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.user_id,
          startTime: data.start_time.toDate(),
          endTime: data.end_time.toDate(),
          duration: data.duration,
          type: data.type,
          taskId: data.task_id,
          completed: data.completed,
          createdAt: data.created_at.toDate(),
        }
      })

      setSessions(formattedSessions)
      calculateStats(formattedSessions)
      generateHeatmapData(formattedSessions, new Date().getFullYear())
    } catch (error) {
      console.error('Error fetching sessions:', error)
      failureToast('Failed to fetch analytics data', false)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Add new session
  const addSession = async (sessionData: Omit<IPomodoroSession, 'id' | 'createdAt'>) => {
    if (!user) return

    try {
      const sessionsRef = collection(db, 'pomodoro_sessions')
      await addDoc(sessionsRef, {
        user_id: user.uid,
        start_time: Timestamp.fromDate(sessionData.startTime),
        end_time: Timestamp.fromDate(sessionData.endTime),
        duration: sessionData.duration,
        type: sessionData.type,
        task_id: sessionData.taskId || null,
        completed: sessionData.completed,
        created_at: serverTimestamp(),
      })

      await fetchSessions() // Refresh data
    } catch (error) {
      console.error('Error adding session:', error)
      failureToast('Failed to save session data', false)
    }
  }

  // Update existing session
  const updateSession = async (sessionId: string, updates: Partial<IPomodoroSession>) => {
    if (!user) return

    try {
      const sessionRef = doc(db, 'pomodoro_sessions', sessionId)
      const updateData: any = {}

      if (updates.startTime) updateData.start_time = Timestamp.fromDate(updates.startTime)
      if (updates.endTime) updateData.end_time = Timestamp.fromDate(updates.endTime)
      if (updates.duration !== undefined) updateData.duration = updates.duration
      if (updates.type) updateData.type = updates.type
      if (updates.taskId !== undefined) updateData.task_id = updates.taskId
      if (updates.completed !== undefined) updateData.completed = updates.completed

      await updateDoc(sessionRef, updateData)
      await fetchSessions() // Refresh data
    } catch (error) {
      console.error('Error updating session:', error)
      failureToast('Failed to update session data', false)
    }
  }

  // Calculate user statistics
  const calculateStats = (sessionData: IPomodoroSession[] = sessions) => {
    const now = new Date()
    const today = getStartOfDay(now)
    const thisWeekStart = getStartOfWeek(now)
    const thisMonthStart = getStartOfMonth(now)

    const workSessions = sessionData.filter(s => s.type === 'work' && s.completed)
    
    // Basic stats
    const totalSessions = workSessions.length
    const totalFocusTime = workSessions.reduce((sum, s) => sum + s.duration, 0)
    const averageSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0

    // Today's stats
    const todaySessions = workSessions.filter(s => s.startTime >= today)
    const sessionsToday = todaySessions.length
    const focusTimeToday = todaySessions.reduce((sum, s) => sum + s.duration, 0)

    // This week's stats
    const thisWeekSessions = workSessions.filter(s => s.startTime >= thisWeekStart)
    const sessionsThisWeek = thisWeekSessions.length
    const focusTimeThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0)

    // This month's stats
    const thisMonthSessions = workSessions.filter(s => s.startTime >= thisMonthStart)
    const sessionsThisMonth = thisMonthSessions.length
    const focusTimeThisMonth = thisMonthSessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(workSessions)

    setUserStats({
      totalSessions,
      totalFocusTime,
      averageSessionLength,
      longestStreak,
      currentStreak,
      sessionsToday,
      focusTimeToday,
      sessionsThisWeek,
      focusTimeThisWeek,
      sessionsThisMonth,
      focusTimeThisMonth,
    })
  }

  // Calculate streak data
  const calculateStreaks = (workSessions: IPomodoroSession[]) => {
    if (workSessions.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Group sessions by date
    const sessionsByDate = new Map<string, number>()
    workSessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0]
      sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) || 0) + 1)
    })

    const sortedDates = Array.from(sessionsByDate.keys()).sort()
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date()
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0]
      if (sessionsByDate.has(dateKey)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    let previousDate: Date | null = null
    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)
      
      if (previousDate) {
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      
      previousDate = currentDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
  }

  // Generate heatmap data for a specific year
  const generateHeatmapData = (sessionData: IPomodoroSession[] = sessions, year: number) => {
    const heatmap: IHeatmapData[] = []
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    // Group sessions by date
    const sessionsByDate = new Map<string, number>()
    sessionData
      .filter(s => s.type === 'work' && s.completed)
      .forEach(session => {
        const dateKey = session.startTime.toISOString().split('T')[0]
        sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) || 0) + 1)
      })

    // Generate data for each day of the year
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const count = sessionsByDate.get(dateKey) || 0
      
      // Calculate intensity level (0-4)
      let level = 0
      if (count > 0) level = 1
      if (count >= 3) level = 2
      if (count >= 6) level = 3
      if (count >= 10) level = 4

      heatmap.push({
        date: dateKey,
        count,
        level,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    setHeatmapData(heatmap)
    return heatmap
  }

  // Get sessions within a date range
  const getSessionsByDateRange = (startDate: Date, endDate: Date) => {
    return sessions.filter(session => 
      session.startTime >= startDate && session.startTime <= endDate
    )
  }

  // Export user data
  const exportUserData = () => {
    const exportData = {
      user: {
        id: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        exportDate: new Date().toISOString(),
      },
      statistics: userStats,
      sessions: sessions.map(session => ({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        createdAt: session.createdAt.toISOString(),
      })),
      heatmapData,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `focusstation-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    successToast('Data exported successfully', false)
  }

  useEffect(() => {
    if (user) {
      fetchSessions()
    } else {
      setSessions([])
      setUserStats({
        totalSessions: 0,
        totalFocusTime: 0,
        averageSessionLength: 0,
        longestStreak: 0,
        currentStreak: 0,
        sessionsToday: 0,
        focusTimeToday: 0,
        sessionsThisWeek: 0,
        focusTimeThisWeek: 0,
        sessionsThisMonth: 0,
        focusTimeThisMonth: 0,
      })
      setHeatmapData([])
    }
  }, [user, fetchSessions])

  return {
    sessions,
    userStats,
    heatmapData,
    loading,
    addSession,
    updateSession,
    getSessionsByDateRange,
    calculateStats: () => calculateStats(),
    generateHeatmapData: (year: number) => generateHeatmapData(sessions, year),
    fetchSessions,
    exportUserData,
  }
}