import React, { useMemo } from 'react'
import { IAnalyticsData } from '@App/interfaces'
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa'

interface DataVisualizationProps {
  data: IAnalyticsData
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Prepare data for line chart (last 30 days)
  const lineChartData = useMemo(() => {
    return data.progressData.slice(-30)
  }, [data.progressData])

  // Prepare data for bar chart (last 7 days)
  const barChartData = useMemo(() => {
    return data.progressData.slice(-7)
  }, [data.progressData])

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    const total = Object.values(data.taskCategoriesDistribution).reduce((sum, val) => sum + val, 0)
    return Object.entries(data.taskCategoriesDistribution).map(([category, duration]) => ({
      category,
      duration,
      percentage: total > 0 ? (duration / total) * 100 : 0
    }))
  }, [data.taskCategoriesDistribution])

  const maxFocusTime = Math.max(...lineChartData.map(d => d.focusTime), 1)
  const maxSessions = Math.max(...barChartData.map(d => d.sessions), 1)

  const colors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
    '#EF4444', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className="space-y-8">
      {/* Line Chart - Progress Over Time */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <FaChartLine className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Focus Time Progress (Last 30 Days)
          </h3>
        </div>

        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="60"
                y1={40 + (i * 32)}
                x2="760"
                y2={40 + (i * 32)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => (
              <text
                key={i}
                x="50"
                y={45 + (i * 32)}
                textAnchor="end"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {formatTime((maxFocusTime / 4) * (4 - i))}
              </text>
            ))}

            {/* Line chart */}
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              points={lineChartData.map((d, i) => {
                const x = 60 + (i * (700 / (lineChartData.length - 1)))
                const y = 168 - ((d.focusTime / maxFocusTime) * 128)
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Data points */}
            {lineChartData.map((d, i) => {
              const x = 60 + (i * (700 / (lineChartData.length - 1)))
              const y = 168 - ((d.focusTime / maxFocusTime) * 128)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3B82F6"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${formatDate(d.date)}: ${formatTime(d.focusTime)}`}</title>
                </circle>
              )
            })}

            {/* X-axis labels */}
            {lineChartData.filter((_, i) => i % 5 === 0).map((d, i) => {
              const originalIndex = i * 5
              const x = 60 + (originalIndex * (700 / (lineChartData.length - 1)))
              return (
                <text
                  key={originalIndex}
                  x={x}
                  y="190"
                  textAnchor="middle"
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {formatDate(d.date)}
                </text>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Bar Chart - Weekly Sessions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <FaChartBar className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Sessions (Last 7 Days)
          </h3>
        </div>

        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="60"
                y1={40 + (i * 32)}
                x2="760"
                y2={40 + (i * 32)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => (
              <text
                key={i}
                x="50"
                y={45 + (i * 32)}
                textAnchor="end"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {Math.round((maxSessions / 4) * (4 - i))}
              </text>
            ))}

            {/* Bars */}
            {barChartData.map((d, i) => {
              const barWidth = 80
              const x = 100 + (i * 100)
              const height = (d.sessions / maxSessions) * 128
              const y = 168 - height
              
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill="#10B981"
                    className="hover:fill-green-400 transition-colors cursor-pointer"
                  >
                    <title>{`${formatDate(d.date)}: ${d.sessions} sessions`}</title>
                  </rect>
                  <text
                    x={x + barWidth / 2}
                    y="190"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                  >
                    {formatDate(d.date)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Pie Chart - Task Categories */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <FaChartPie className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Categories Distribution
          </h3>
        </div>

        {pieChartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="flex justify-center">
              <svg className="w-64 h-64" viewBox="0 0 200 200">
                {(() => {
                  let currentAngle = 0
                  return pieChartData.map((item, i) => {
                    const angle = (item.percentage / 100) * 360
                    const startAngle = currentAngle
                    const endAngle = currentAngle + angle
                    currentAngle += angle

                    const startAngleRad = (startAngle * Math.PI) / 180
                    const endAngleRad = (endAngle * Math.PI) / 180

                    const largeArcFlag = angle > 180 ? 1 : 0

                    const x1 = 100 + 80 * Math.cos(startAngleRad)
                    const y1 = 100 + 80 * Math.sin(startAngleRad)
                    const x2 = 100 + 80 * Math.cos(endAngleRad)
                    const y2 = 100 + 80 * Math.sin(endAngleRad)

                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ')

                    return (
                      <path
                        key={i}
                        d={pathData}
                        fill={colors[i % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.category}: ${item.percentage.toFixed(1)}%`}</title>
                      </path>
                    )
                  })
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {pieChartData.map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(item.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaChartPie className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No task category data available. Start categorizing your tasks to see the distribution.
            </p>
          </div>
        )}
      </div>

      {/* Completion Rate Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-6">
          <FaChartLine className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Completion Rate Trend (Last 30 Days)
          </h3>
        </div>

        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(percentage => (
              <line
                key={percentage}
                x1="60"
                y1={40 + ((100 - percentage) * 1.28)}
                x2="760"
                y2={40 + ((100 - percentage) * 1.28)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map(percentage => (
              <text
                key={percentage}
                x="50"
                y={45 + ((100 - percentage) * 1.28)}
                textAnchor="end"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {percentage}%
              </text>
            ))}

            {/* Line chart */}
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              points={lineChartData.map((d, i) => {
                const x = 60 + (i * (700 / (lineChartData.length - 1)))
                const y = 168 - ((d.completionRate / 100) * 128)
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Data points */}
            {lineChartData.map((d, i) => {
              const x = 60 + (i * (700 / (lineChartData.length - 1)))
              const y = 168 - ((d.completionRate / 100) * 128)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#F59E0B"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${formatDate(d.date)}: ${d.completionRate.toFixed(1)}%`}</title>
                </circle>
              )
            })}

            {/* X-axis labels */}
            {lineChartData.filter((_, i) => i % 5 === 0).map((d, i) => {
              const originalIndex = i * 5
              const x = 60 + (originalIndex * (700 / (lineChartData.length - 1)))
              return (
                <text
                  key={originalIndex}
                  x={x}
                  y="190"
                  textAnchor="middle"
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {formatDate(d.date)}
                </text>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}