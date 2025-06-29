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
  Timestamp
} from 'firebase/firestore'
import { db } from '@App/lib/firebase'
import { useAuth } from './useAuth'
import { IFocusSession, IAnalyticsData, IAnalyticsFilters } from '@App/interfaces'
import { successToast, failureToast } from '@Utils/toast'

export function useFocusAnalytics() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<IFocusSession[]>([])
  const [currentSession, setCurrentSession] = useState<IFocusSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<IAnalyticsData | null>(null)

  // Fetch sessions from Firestore
  const fetchSessions = async (filters?: IAnalyticsFilters) => {
    if (!user) return

    setLoading(true)
    try {
      const sessionsRef = collection(db, 'focus_sessions')
      let q = query(
        sessionsRef, 
        where('user_id', '==', user.uid),
        orderBy('start_time', 'desc')
      )

      if (filters?.dateRange) {
        q = query(q, 
          where('start_time', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('start_time', '<=', Timestamp.fromDate(filters.dateRange.end))
        )
      }

      const querySnapshot = await getDocs(q)
      const formattedSessions: IFocusSession[] = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          user_id: data.user_id,
          start_time: data.start_time.toDate(),
          end_time: data.end_time?.toDate(),
          duration: data.duration,
          session_type: data.session_type,
          task_id: data.task_id,
          task_category: data.task_category,
          completed: data.completed,
          created_at: data.created_at.toDate(),
        }
      })

      setSessions(formattedSessions)
      calculateAnalytics(formattedSessions)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      failureToast('Failed to fetch analytics data', false)
    } finally {
      setLoading(false)
    }
  }

  // Start a new focus session
  const startSession = async (type: 'focus' | 'break', taskId?: string, taskCategory?: string) => {
    if (!user) return

    try {
      const newSession: Omit<IFocusSession, 'id' | 'created_at'> = {
        user_id: user.uid,
        start_time: new Date(),
        end_time: new Date(), // Will be updated when session ends
        duration: 0,
        session_type: type,
        task_id: taskId,
        task_category: taskCategory || 'General',
        completed: false,
      }

      const sessionsRef = collection(db, 'focus_sessions')
      const docRef = await addDoc(sessionsRef, {
        ...newSession,
        start_time: Timestamp.fromDate(newSession.start_time),
        end_time: Timestamp.fromDate(newSession.end_time),
        created_at: serverTimestamp(),
      })

      const sessionWithId = { ...newSession, id: docRef.id, created_at: new Date() }
      setCurrentSession(sessionWithId)
      successToast(`${type === 'focus' ? 'Focus' : 'Break'} session started`, false)
    } catch (error) {
      console.error('Error starting session:', error)
      failureToast('Failed to start session', false)
    }
  }

  // End current session
  const endSession = async (completed: boolean) => {
    if (!user || !currentSession) return

    try {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - currentSession.start_time.getTime()) / 1000)

      const sessionRef = doc(db, 'focus_sessions', currentSession.id)
      await updateDoc(sessionRef, {
        end_time: Timestamp.fromDate(endTime),
        duration: duration,
        completed: completed,
      })

      setCurrentSession(null)
      await fetchSessions() // Refresh data
      successToast(`Session ${completed ? 'completed' : 'ended'}`, false)
    } catch (error) {
      console.error('Error ending session:', error)
      failureToast('Failed to end session', false)
    }
  }

  // Calculate analytics data
  const calculateAnalytics = (sessionData: IFocusSession[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Filter focus sessions only
    const focusSessions = sessionData.filter(s => s.session_type === 'focus')
    const breakSessions = sessionData.filter(s => s.session_type === 'break')

    // Total focus time
    const dailyFocus = focusSessions
      .filter(s => s.start_time >= today)
      .reduce((sum, s) => sum + s.duration, 0)

    const weeklyFocus = focusSessions
      .filter(s => s.start_time >= weekStart)
      .reduce((sum, s) => sum + s.duration, 0)

    const monthlyFocus = focusSessions
      .filter(s => s.start_time >= monthStart)
      .reduce((sum, s) => sum + s.duration, 0)

    // Average session duration
    const averageSessionDuration = focusSessions.length > 0 
      ? focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length 
      : 0

    // Completion rate
    const completionRate = focusSessions.length > 0 
      ? (focusSessions.filter(s => s.completed).length / focusSessions.length) * 100 
      : 0

    // Peak productivity hours
    const hourCounts: Record<number, number> = {}
    focusSessions.forEach(session => {
      const hour = session.start_time.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + session.duration
    })
    const peakProductivityHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))

    // Task categories distribution
    const taskCategoriesDistribution: Record<string, number> = {}
    focusSessions.forEach(session => {
      const category = session.task_category || 'General'
      taskCategoriesDistribution[category] = (taskCategoriesDistribution[category] || 0) + session.duration
    })

    // Break time analysis
    const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.duration, 0)
    const averageBreakDuration = breakSessions.length > 0 
      ? totalBreakTime / breakSessions.length 
      : 0

    // Heat map data
    const heatMapData = generateHeatMapData(focusSessions)

    // Progress data (last 30 days)
    const progressData = generateProgressData(focusSessions, 30)

    // Calculate longest streak
    const longestStreak = calculateLongestStreak(focusSessions)

    // Productivity score (0-100)
    const productivityScore = calculateProductivityScore({
      completionRate,
      averageSessionDuration,
      dailyFocus,
      longestStreak
    })

    const analytics: IAnalyticsData = {
      totalFocusTime: {
        daily: dailyFocus,
        weekly: weeklyFocus,
        monthly: monthlyFocus,
      },
      averageSessionDuration,
      longestStreak,
      peakProductivityHours,
      completionRate,
      breakTimeAnalysis: {
        averageBreakDuration,
        totalBreakTime,
        breakFrequency: breakSessions.length,
      },
      taskCategoriesDistribution,
      productivityScore,
      heatMapData,
      progressData,
    }

    setAnalyticsData(analytics)
  }

  // Generate heat map data
  const generateHeatMapData = (sessions: IFocusSession[]) => {
    const heatMap: Array<{
      date: string;
      hour: number;
      intensity: number;
      duration: number;
    }> = []

    const last365Days = Array.from({ length: 365 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    last365Days.forEach(date => {
      for (let hour = 0; hour < 24; hour++) {
        const sessionsInHour = sessions.filter(session => {
          const sessionDate = new Date(session.start_time)
          return sessionDate.toDateString() === date.toDateString() && 
                 sessionDate.getHours() === hour
        })

        const totalDuration = sessionsInHour.reduce((sum, s) => sum + s.duration, 0)
        const intensity = Math.min(totalDuration / 3600, 1) // Normalize to 0-1 (max 1 hour = intensity 1)

        heatMap.push({
          date: date.toISOString().split('T')[0],
          hour,
          intensity,
          duration: totalDuration,
        })
      }
    })

    return heatMap
  }

  // Generate progress data for charts
  const generateProgressData = (sessions: IFocusSession[], days: number) => {
    const progressData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time)
        return sessionDate.toDateString() === date.toDateString()
      })

      const focusTime = daySessions.reduce((sum, s) => sum + s.duration, 0)
      const completedSessions = daySessions.filter(s => s.completed).length
      const completionRate = daySessions.length > 0 ? (completedSessions / daySessions.length) * 100 : 0

      progressData.push({
        date: dateStr,
        focusTime,
        sessions: daySessions.length,
        completionRate,
      })
    }

    return progressData
  }

  // Calculate longest streak of consecutive focus days
  const calculateLongestStreak = (sessions: IFocusSession[]) => {
    const focusDays = new Set(
      sessions
        .filter(s => s.duration > 300) // At least 5 minutes
        .map(s => s.start_time.toDateString())
    )

    const sortedDays = Array.from(focusDays).sort()
    let longestStreak = 0
    let currentStreak = 0

    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        currentStreak = 1
      } else {
        const prevDate = new Date(sortedDays[i - 1])
        const currentDate = new Date(sortedDays[i])
        const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

        if (dayDiff === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
    }

    return Math.max(longestStreak, currentStreak)
  }

  // Calculate productivity score
  const calculateProductivityScore = (metrics: {
    completionRate: number;
    averageSessionDuration: number;
    dailyFocus: number;
    longestStreak: number;
  }) => {
    const {
      completionRate,
      averageSessionDuration,
      dailyFocus,
      longestStreak
    } = metrics

    // Normalize metrics to 0-25 scale
    const completionScore = (completionRate / 100) * 25
    const durationScore = Math.min((averageSessionDuration / 1800), 1) * 25 // 30 min = max
    const dailyScore = Math.min((dailyFocus / 7200), 1) * 25 // 2 hours = max
    const streakScore = Math.min((longestStreak / 30), 1) * 25 // 30 days = max

    return Math.round(completionScore + durationScore + dailyScore + streakScore)
  }

  // Export data
  const exportData = (format: 'json' | 'csv') => {
    if (!sessions.length) return

    const dataToExport = sessions.map(session => ({
      date: session.start_time.toISOString(),
      type: session.session_type,
      duration: session.duration,
      category: session.task_category,
      completed: session.completed,
    }))

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `focus-sessions-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } else {
      const csv = [
        'Date,Type,Duration (seconds),Category,Completed',
        ...dataToExport.map(row => 
          `${row.date},${row.type},${row.duration},${row.category},${row.completed}`
        )
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `focus-sessions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }

    successToast(`Data exported as ${format.toUpperCase()}`, false)
  }

  useEffect(() => {
    if (user) {
      fetchSessions()
    } else {
      setSessions([])
      setAnalyticsData(null)
    }
  }, [user])

  return {
    sessions,
    currentSession,
    loading,
    analyticsData,
    startSession,
    endSession,
    fetchSessions,
    exportData,
  }
}