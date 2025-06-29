import { useState } from 'react'
import { IHeatmapData } from '@App/interfaces'
import { formatDate } from '@Utils/timeUtils'

interface HeatmapProps {
  data: IHeatmapData[]
  year: number
}

export const Heatmap = ({ data, year }: HeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<IHeatmapData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Get the intensity color based on level
  const getIntensityColor = (level: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // level 0
      'bg-green-200 dark:bg-green-900', // level 1
      'bg-green-300 dark:bg-green-700', // level 2
      'bg-green-400 dark:bg-green-600', // level 3
      'bg-green-500 dark:bg-green-500', // level 4
    ]
    return colors[level] || colors[0]
  }

  // Group data by weeks
  const getWeeksData = () => {
    const weeks: IHeatmapData[][] = []
    let currentWeek: IHeatmapData[] = []
    
    // Start from the first Sunday of the year or the first day if it's not Sunday
    const startDate = new Date(year, 0, 1)
    const firstSunday = new Date(startDate)
    firstSunday.setDate(startDate.getDate() - startDate.getDay())
    
    data.forEach((day, index) => {
      const dayDate = new Date(day.date)
      const dayOfWeek = dayDate.getDay()
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Start new week on Sunday
        weeks.push([...currentWeek])
        currentWeek = []
      }
      
      currentWeek.push(day)
    })
    
    // Add the last week if it has data
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
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-2">
        <div className="w-8"></div> {/* Space for day labels */}
        <div className="flex-1 flex justify-between text-xs text-text-secondary">
          {months.map((month, index) => (
            <span key={month} className="text-center">
              {month}
            </span>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col justify-between text-xs text-text-secondary mr-2">
          {days.map((day, index) => (
            <span key={day} className="h-3 flex items-center">
              {index % 2 === 1 ? day : ''}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1">
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = week.find(d => new Date(d.date).getDay() === dayIndex)
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-accent-orange ${
                        day ? getIntensityColor(day.level) : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                      onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                      title={day ? `${day.count} sessions on ${formatDate(new Date(day.date))}` : ''}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-text-secondary">
          {data.filter(d => d.count > 0).length} days with sessions in {year}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-secondary">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-primary-dark text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 40,
          }}
        >
          <div className="font-medium">
            {hoveredCell.count} session{hoveredCell.count !== 1 ? 's' : ''}
          </div>
          <div className="text-xs opacity-75">
            {formatDate(new Date(hoveredCell.date))}
          </div>
        </div>
      )}
    </div>
  )
}