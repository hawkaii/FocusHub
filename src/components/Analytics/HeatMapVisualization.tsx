import { useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'

interface HeatMapVisualizationProps {
  analytics: any
}

export const HeatMapVisualization = ({ analytics }: HeatMapVisualizationProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'activity' | 'sessions' | 'duration'>('activity')
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const getHeatMapData = () => {
    return analytics?.heatMapData?.[selectedMetric] || generateMockHeatMapData()
  }

  const generateMockHeatMapData = () => {
    const data: number[][] = []
    for (let day = 0; day < 7; day++) {
      const dayData: number[] = []
      for (let hour = 0; hour < 24; hour++) {
        // Generate realistic usage patterns
        let intensity = 0
        if (day < 5) { // Weekdays
          if (hour >= 9 && hour <= 17) intensity = Math.random() * 0.8 + 0.2 // Work hours
          else if (hour >= 19 && hour <= 22) intensity = Math.random() * 0.6 + 0.1 // Evening
          else intensity = Math.random() * 0.3
        } else { // Weekends
          if (hour >= 10 && hour <= 14) intensity = Math.random() * 0.7 + 0.1 // Late morning/afternoon
          else if (hour >= 19 && hour <= 23) intensity = Math.random() * 0.5 + 0.1 // Evening
          else intensity = Math.random() * 0.2
        }
        dayData.push(intensity)
      }
      data.push(dayData)
    }
    return data
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (intensity < 0.2) return 'bg-blue-100 dark:bg-blue-900/30'
    if (intensity < 0.4) return 'bg-blue-200 dark:bg-blue-800/50'
    if (intensity < 0.6) return 'bg-yellow-200 dark:bg-yellow-700/50'
    if (intensity < 0.8) return 'bg-orange-300 dark:bg-orange-600/60'
    return 'bg-red-400 dark:bg-red-500/70'
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return 'No activity'
    if (intensity < 0.2) return 'Low activity'
    if (intensity < 0.4) return 'Moderate activity'
    if (intensity < 0.6) return 'High activity'
    if (intensity < 0.8) return 'Very high activity'
    return 'Peak activity'
  }

  const heatMapData = getHeatMapData()
  const maxIntensity = Math.max(...heatMapData.flat())

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Activity Heat Map</h3>
          <p className="text-text-secondary text-sm">
            Visualize user activity patterns across different times and days
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-text-secondary">Metric:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'activity' | 'sessions' | 'duration')}
            className="px-3 py-2 border border-border-medium rounded-lg bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
          >
            <option value="activity">User Activity</option>
            <option value="sessions">Session Count</option>
            <option value="duration">Session Duration</option>
          </select>
        </div>
      </div>

      {/* Heat Map */}
      <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-text-secondary">
                {hour === 0 ? '12a' : hour <= 12 ? `${hour}a` : `${hour - 12}p`}
              </div>
            ))}
          </div>
          
          {/* Heat map grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-sm font-medium text-text-secondary text-right pr-2">
                {day}
              </div>
              {hours.map(hour => {
                const intensity = heatMapData[dayIndex]?.[hour] || 0
                const normalizedIntensity = maxIntensity > 0 ? intensity / maxIntensity : 0
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`flex-1 h-8 mx-0.5 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative group ${getIntensityColor(normalizedIntensity)}`}
                    title={`${day} ${hour}:00 - ${getIntensityLabel(normalizedIntensity)}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      {day} {hour}:00<br />
                      {getIntensityLabel(normalizedIntensity)}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
          <div className="flex items-center space-x-2">
            <FaInfoCircle className="h-4 w-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Activity Level:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-secondary">Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-700/50 rounded-sm"></div>
              <div className="w-3 h-3 bg-orange-300 dark:bg-orange-600/60 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-400 dark:bg-red-500/70 rounded-sm"></div>
            </div>
            <span className="text-xs text-text-secondary">More</span>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Top Regions</h4>
          <div className="space-y-3">
            {analytics?.topRegions?.map((region: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{region.flag}</span>
                  <span className="text-text-primary">{region.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-border-light rounded-full h-2">
                    <div
                      className="bg-accent-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <span className="text-text-secondary text-sm">{region.users}</span>
                </div>
              </div>
            )) || [
              { flag: '🇺🇸', country: 'United States', percentage: 45, users: '1.2K' },
              { flag: '🇬🇧', country: 'United Kingdom', percentage: 20, users: '540' },
              { flag: '🇨🇦', country: 'Canada', percentage: 15, users: '405' },
              { flag: '🇩🇪', country: 'Germany', percentage: 12, users: '324' },
              { flag: '🇫🇷', country: 'France', percentage: 8, users: '216' }
            ]}
          </div>
        </div>

        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Device Types</h4>
          <div className="space-y-3">
            {[
              { type: 'Desktop', percentage: 65, users: '1.8K', color: 'bg-blue-500' },
              { type: 'Mobile', percentage: 30, users: '810', color: 'bg-green-500' },
              { type: 'Tablet', percentage: 5, users: '135', color: 'bg-purple-500' }
            ].map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-primary">{device.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-border-light rounded-full h-2">
                    <div
                      className={`${device.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <span className="text-text-secondary text-sm">{device.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}