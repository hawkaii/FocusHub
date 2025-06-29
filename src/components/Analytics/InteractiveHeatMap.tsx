import React, { useState, useMemo } from 'react'
import { IAnalyticsData } from '@App/interfaces'

interface InteractiveHeatMapProps {
  data: Array<{
    date: string;
    hour: number;
    intensity: number;
    duration: number;
  }>
}

export const InteractiveHeatMap: React.FC<InteractiveHeatMapProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    hour: number;
    intensity: number;
    duration: number;
  } | null>(null)

  // Group data by date
  const groupedData = useMemo(() => {
    const grouped: Record<string, Record<number, { intensity: number; duration: number }>> = {}
    
    data.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = {}
      }
      grouped[item.date][item.hour] = {
        intensity: item.intensity,
        duration: item.duration
      }
    })
    
    return grouped
  }, [data])

  // Get last 365 days
  const dates = useMemo(() => {
    const result = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      result.push(date.toISOString().split('T')[0])
    }
    return result
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (intensity <= 0.2) return 'bg-green-100 dark:bg-green-900/30'
    if (intensity <= 0.4) return 'bg-green-200 dark:bg-green-800/50'
    if (intensity <= 0.6) return 'bg-green-300 dark:bg-green-700/70'
    if (intensity <= 0.8) return 'bg-green-400 dark:bg-green-600/80'
    return 'bg-green-500 dark:bg-green-500'
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Calculate weeks for proper grid layout
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < dates.length; i += 7) {
      result.push(dates.slice(i, i + 7))
    }
    return result
  }, [dates])

  return (
    <div className="space-y-6">
      {/* Heat Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Focus Activity Heat Map
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hover over cells to see detailed information
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(intensity => (
            <div
              key={intensity}
              className={`h-3 w-3 rounded-sm ${getIntensityColor(intensity)}`}
            />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
        </div>
      </div>

      {/* Heat Map */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Hour labels */}
          <div className="flex">
            <div className="w-16"></div> {/* Space for date labels */}
            {hours.map(hour => (
              <div
                key={hour}
                className="flex-1 min-w-[20px] text-center text-xs text-gray-500 dark:text-gray-400 pb-2"
              >
                {hour % 6 === 0 ? formatHour(hour) : ''}
              </div>
            ))}
          </div>

          {/* Heat map grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex">
                {/* Week start date label */}
                <div className="w-16 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  {weekIndex % 4 === 0 ? formatDate(week[0]) : ''}
                </div>
                
                {/* Days in week */}
                {week.map(date => (
                  <div key={date} className="flex flex-1">
                    {hours.map(hour => {
                      const cellData = groupedData[date]?.[hour]
                      const intensity = cellData?.intensity || 0
                      const duration = cellData?.duration || 0
                      
                      return (
                        <div
                          key={`${date}-${hour}`}
                          className={`
                            min-w-[20px] h-4 border border-gray-200 dark:border-gray-700 cursor-pointer
                            transition-all duration-200 hover:scale-110 hover:z-10 relative
                            ${getIntensityColor(intensity)}
                          `}
                          onMouseEnter={() => setHoveredCell({ date, hour, intensity, duration })}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="fixed z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-xs">
            <div className="font-semibold">
              {formatDate(hoveredCell.date)} at {formatHour(hoveredCell.hour)}
            </div>
            <div className="mt-1">
              {hoveredCell.duration > 0 ? (
                <>
                  <div>Duration: {formatTime(hoveredCell.duration)}</div>
                  <div>Intensity: {(hoveredCell.intensity * 100).toFixed(0)}%</div>
                </>
              ) : (
                <div>No focus activity</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Most Active Day
          </h4>
          <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
            {(() => {
              const dayTotals: Record<string, number> = {}
              data.forEach(item => {
                dayTotals[item.date] = (dayTotals[item.date] || 0) + item.duration
              })
              const maxDay = Object.entries(dayTotals).reduce((max, [date, duration]) => 
                duration > max.duration ? { date, duration } : max, 
                { date: '', duration: 0 }
              )
              return maxDay.date ? formatDate(maxDay.date) : 'No data'
            })()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Most Active Hour
          </h4>
          <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
            {(() => {
              const hourTotals: Record<number, number> = {}
              data.forEach(item => {
                hourTotals[item.hour] = (hourTotals[item.hour] || 0) + item.duration
              })
              const maxHour = Object.entries(hourTotals).reduce((max, [hour, duration]) => 
                duration > max.duration ? { hour: parseInt(hour), duration } : max, 
                { hour: 0, duration: 0 }
              )
              return formatHour(maxHour.hour)
            })()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Active Days
          </h4>
          <p className="mt-1 text-lg font-semibold text-purple-600 dark:text-purple-400">
            {(() => {
              const activeDays = new Set(
                data.filter(item => item.duration > 0).map(item => item.date)
              ).size
              return `${activeDays} / 365`
            })()}
          </p>
        </div>
      </div>
    </div>
  )
}