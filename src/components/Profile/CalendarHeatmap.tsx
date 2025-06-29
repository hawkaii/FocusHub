import { useState } from 'react'
import { IHeatmapData } from '@App/interfaces'
import { formatDate } from '@Utils/timeUtils'

interface CalendarHeatmapProps {
  data: IHeatmapData[]
  year: number
}

export const CalendarHeatmap = ({ data, year }: CalendarHeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<IHeatmapData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Get the intensity color based on level
  const getIntensityColor = (level: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700', // level 0
      'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800', // level 1
      'bg-green-300 dark:bg-green-700 border-green-400 dark:border-green-600', // level 2
      'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500', // level 3
      'bg-green-700 dark:bg-green-500 border-green-800 dark:border-green-400', // level 4
    ]
    return colors[level] || colors[0]
  }

  // Group data by weeks
  const getWeeksData = () => {
    const weeks: IHeatmapData[][] = []
    let currentWeek: IHeatmapData[] = []
    
    // Create a map for quick lookup
    const dataMap = new Map(data.map(d => [d.date, d]))
    
    // Start from the first day of the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    // Adjust to start from Sunday
    const firstSunday = new Date(startDate)
    firstSunday.setDate(startDate.getDate() - startDate.getDay())
    
    const currentDate = new Date(firstSunday)
    
    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr) || { date: dateStr, count: 0, level: 0 }
      
      currentWeek.push(dayData)
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
      
      // Break if we've gone past the year
      if (currentDate.getFullYear() > year) {
        break
      }
    }
    
    // Add remaining days if any
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    return weeks
  }

  const weeks = getWeeksData()
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const handleMouseEnter = (day: IHeatmapData, event: React.MouseEvent) => {
    setHoveredCell(day)
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredCell) {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  // Calculate month positions for labels
  const getMonthPositions = () => {
    const positions: { month: string; position: number }[] = []
    let currentMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0]
      if (firstDayOfWeek) {
        const date = new Date(firstDayOfWeek.date)
        const month = date.getMonth()
        
        if (month !== currentMonth && date.getFullYear() === year) {
          positions.push({
            month: months[month],
            position: weekIndex
          })
          currentMonth = month
        }
      }
    })
    
    return positions
  }

  const monthPositions = getMonthPositions()

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-3">
        <div className="w-6"></div> {/* Space for day labels */}
        <div className="flex-1 relative">
          {monthPositions.map(({ month, position }) => (
            <span 
              key={month} 
              className="absolute text-xs text-text-secondary font-medium"
              style={{ left: `${(position / weeks.length) * 100}%` }}
            >
              {month}
            </span>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col justify-between text-xs text-text-secondary mr-2 py-1">
          {days.map((day, index) => (
            <span key={day} className="h-3 flex items-center font-medium">
              {index % 2 === 1 ? day : ''}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const isCurrentYear = new Date(day.date).getFullYear() === year
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 border ${
                        isCurrentYear 
                          ? `${getIntensityColor(day.level)} hover:ring-2 hover:ring-accent-orange hover:scale-110` 
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-30'
                      }`}
                      onMouseEnter={(e) => isCurrentYear && handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                      title={isCurrentYear ? `${day.count} sessions on ${formatDate(new Date(day.date))}` : ''}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-text-secondary">
          <span className="font-medium">{data.filter(d => d.count > 0).length}</span> days with sessions in {year}
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-secondary font-medium">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm border ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary font-medium">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-primary-dark text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none border border-border-dark"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 50,
          }}
        >
          <div className="font-semibold">
            {hoveredCell.count} session{hoveredCell.count !== 1 ? 's' : ''}
          </div>
          <div className="text-xs opacity-90">
            {formatDate(new Date(hoveredCell.date))}
          </div>
        </div>
      )}
    </div>
  )
}