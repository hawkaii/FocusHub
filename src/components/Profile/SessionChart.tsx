import { useMemo } from 'react'
import { IPomodoroSession } from '@App/interfaces'

interface SessionChartProps {
  sessions: IPomodoroSession[]
  timeRange: 'week' | 'month' | 'year'
}

export const SessionChart = ({ sessions, timeRange }: SessionChartProps) => {
  const chartData = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let dateFormat: (date: Date) => string
    let groupBy: (date: Date) => string

    switch (timeRange) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6)
        dateFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' })
        groupBy = (date) => date.toDateString()
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFormat = (date) => date.getDate().toString()
        groupBy = (date) => date.toDateString()
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        dateFormat = (date) => date.toLocaleDateString('en-US', { month: 'short' })
        groupBy = (date) => `${date.getFullYear()}-${date.getMonth()}`
        break
    }

    // Filter sessions within the time range
    const filteredSessions = sessions.filter(session => 
      session.startTime >= startDate && session.type === 'work' && session.completed
    )

    // Group sessions by the specified time unit
    const groupedSessions = new Map<string, { count: number; totalTime: number }>()
    filteredSessions.forEach(session => {
      const key = groupBy(session.startTime)
      const existing = groupedSessions.get(key) || { count: 0, totalTime: 0 }
      groupedSessions.set(key, {
        count: existing.count + 1,
        totalTime: existing.totalTime + session.duration
      })
    })

    // Generate chart data points
    const dataPoints: { label: string; sessions: number; focusTime: number; date: Date }[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= now) {
      const key = groupBy(currentDate)
      const data = groupedSessions.get(key) || { count: 0, totalTime: 0 }
      
      dataPoints.push({
        label: dateFormat(new Date(currentDate)),
        sessions: data.count,
        focusTime: data.totalTime,
        date: new Date(currentDate)
      })

      // Increment date based on time range
      if (timeRange === 'week' || timeRange === 'month') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    return dataPoints
  }, [sessions, timeRange])

  const maxSessions = Math.max(...chartData.map(d => d.sessions), 1)
  const maxFocusTime = Math.max(...chartData.map(d => d.focusTime), 1)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Sessions Chart */}
      <div>
        <h4 className="text-lg font-semibold text-text-primary mb-4">Sessions per {timeRange === 'year' ? 'Month' : 'Day'}</h4>
        <div className="flex items-end justify-between h-40 space-x-1">
          {chartData.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full bg-accent-orange rounded-t-sm transition-all duration-300 hover:bg-hover-accent cursor-pointer"
                  style={{
                    height: `${(point.sessions / maxSessions) * 100}%`,
                    minHeight: point.sessions > 0 ? '4px' : '0px'
                  }}
                  title={`${point.sessions} sessions on ${point.label}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-2">
          {chartData.map((point, index) => (
            <span key={index} className="text-center flex-1">
              {point.label}
            </span>
          ))}
        </div>
      </div>

      {/* Focus Time Chart */}
      <div>
        <h4 className="text-lg font-semibold text-text-primary mb-4">Focus Time per {timeRange === 'year' ? 'Month' : 'Day'}</h4>
        <div className="flex items-end justify-between h-40 space-x-1">
          {chartData.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full bg-supporting-blue rounded-t-sm transition-all duration-300 hover:bg-hover-primary cursor-pointer"
                  style={{
                    height: `${(point.focusTime / maxFocusTime) * 100}%`,
                    minHeight: point.focusTime > 0 ? '4px' : '0px'
                  }}
                  title={`${formatTime(point.focusTime)} focus time on ${point.label}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-2">
          {chartData.map((point, index) => (
            <span key={index} className="text-center flex-1">
              {point.label}
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border-light">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {chartData.reduce((sum, point) => sum + point.sessions, 0)}
          </p>
          <p className="text-sm text-text-secondary">Total Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {formatTime(chartData.reduce((sum, point) => sum + point.focusTime, 0))}
          </p>
          <p className="text-sm text-text-secondary">Total Focus Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {maxSessions}
          </p>
          <p className="text-sm text-text-secondary">Peak Sessions</p>
        </div>
      </div>
    </div>
  )
}