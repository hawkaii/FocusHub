import { useState, useEffect } from 'react'

interface AnalyticsData {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  avgSessionDuration: number
  dailyChange: number
  weeklyChange: number
  monthlyChange: number
  sessionChange: number
  peakTimes: Array<{
    period: string
    users: number
    percentage: number
  }>
  newUsers: number
  returningUsers: number
  bounceRate: number
  pagesPerSession: number
  usageTrends: Array<{
    date: string
    users: number
  }>
  heatMapData: {
    activity: number[][]
    sessions: number[][]
    duration: number[][]
  }
  topRegions: Array<{
    flag: string
    country: string
    percentage: number
    users: string
  }>
  totalTime: number
}

export function useAnalytics(dateRange: '7d' | '30d' | '90d') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock data based on date range
      const mockData: AnalyticsData = generateMockAnalytics(dateRange)
      
      setAnalytics(mockData)
      setLoading(false)
    }

    fetchAnalytics()
  }, [dateRange])

  const exportData = () => {
    if (!analytics) return

    const dataToExport = {
      dateRange,
      exportDate: new Date().toISOString(),
      ...analytics
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { analytics, loading, exportData }
}

function generateMockAnalytics(dateRange: '7d' | '30d' | '90d'): AnalyticsData {
  const multiplier = dateRange === '7d' ? 0.3 : dateRange === '30d' ? 1 : 2.5
  
  return {
    dailyActiveUsers: Math.round(1250 * multiplier),
    weeklyActiveUsers: Math.round(3200 * multiplier),
    monthlyActiveUsers: Math.round(8500 * multiplier),
    avgSessionDuration: Math.round(28 + Math.random() * 10),
    dailyChange: Math.round((Math.random() - 0.5) * 20),
    weeklyChange: Math.round((Math.random() - 0.3) * 15),
    monthlyChange: Math.round((Math.random() - 0.2) * 25),
    sessionChange: Math.round((Math.random() - 0.4) * 12),
    peakTimes: [
      { period: '9:00 AM - 11:00 AM', users: Math.round(450 * multiplier), percentage: 85 },
      { period: '2:00 PM - 4:00 PM', users: Math.round(520 * multiplier), percentage: 95 },
      { period: '7:00 PM - 9:00 PM', users: Math.round(380 * multiplier), percentage: 70 },
      { period: '10:00 PM - 12:00 AM', users: Math.round(280 * multiplier), percentage: 50 }
    ],
    newUsers: Math.round(2100 * multiplier),
    returningUsers: Math.round(6400 * multiplier),
    bounceRate: Math.round(25 + Math.random() * 15),
    pagesPerSession: Math.round(3.2 + Math.random() * 1.5),
    usageTrends: Array.from({ length: parseInt(dateRange) }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: Math.round(800 + Math.random() * 400)
      }
    }).reverse(),
    heatMapData: {
      activity: generateHeatMapData(),
      sessions: generateHeatMapData(),
      duration: generateHeatMapData()
    },
    topRegions: [
      { flag: '🇺🇸', country: 'United States', percentage: 45, users: '1.2K' },
      { flag: '🇬🇧', country: 'United Kingdom', percentage: 20, users: '540' },
      { flag: '🇨🇦', country: 'Canada', percentage: 15, users: '405' },
      { flag: '🇩🇪', country: 'Germany', percentage: 12, users: '324' },
      { flag: '🇫🇷', country: 'France', percentage: 8, users: '216' }
    ],
    totalTime: Math.round(1572 * multiplier)
  }
}

function generateHeatMapData(): number[][] {
  const data: number[][] = []
  for (let day = 0; day < 7; day++) {
    const dayData: number[] = []
    for (let hour = 0; hour < 24; hour++) {
      let intensity = 0
      if (day < 5) { // Weekdays
        if (hour >= 9 && hour <= 17) intensity = Math.random() * 0.8 + 0.2
        else if (hour >= 19 && hour <= 22) intensity = Math.random() * 0.6 + 0.1
        else intensity = Math.random() * 0.3
      } else { // Weekends
        if (hour >= 10 && hour <= 14) intensity = Math.random() * 0.7 + 0.1
        else if (hour >= 19 && hour <= 23) intensity = Math.random() * 0.5 + 0.1
        else intensity = Math.random() * 0.2
      }
      dayData.push(intensity)
    }
    data.push(dayData)
  }
  return data
}