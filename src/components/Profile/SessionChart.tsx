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
    const groupedSessions = new Map<string, number>()
    filteredSessions.forEach(session => {
      const key = groupBy(session.startTime)
      groupedSessions.set(key, (groupedSessions.get(key) || 0) + 1)
    })

    // Generate chart data points
    const dataPoints: { label: string; value: number; date: Date }[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= now) {
      const key = groupBy(currentDate)
      const value = groupedSessions.get(key) || 0
      
      dataPoints.push({
        label: dateFormat(new Date(currentDate)),
        value,
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

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="flex items-end justify-between h-32 space-x-1">
        {chartData.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="flex-1 flex items-end w-full">
              <div
                className="w-full bg-accent-orange rounded-t-sm transition-all duration-300 hover:bg-hover-accent"
                style={{
                  height: `${(point.value / maxValue) * 100}%`,
                  minHeight: point.value > 0 ? '4px' : '0px'
                }}
                title={`${point.value} sessions on ${point.label}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-text-secondary">
        {chartData.map((point, index) => (
          <span key={index} className="text-center flex-1">
            {point.label}
          </span>
        ))}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center pt-2 border-t border-border-light">
        <span className="text-sm text-text-secondary">
          Total sessions: {chartData.reduce((sum, point) => sum + point.value, 0)}
        </span>
        <span className="text-sm text-text-secondary">
          Peak: {maxValue} sessions
        </span>
      </div>
    </div>
  )
}