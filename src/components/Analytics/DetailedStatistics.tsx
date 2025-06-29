import React from 'react'
import { IAnalyticsData } from '@App/interfaces'
import { FaCheckCircle, FaCoffee, FaTasks, FaChartPie } from 'react-icons/fa'
import { IoTimeOutline, IoStatsChartOutline } from 'react-icons/io5'

interface DetailedStatisticsProps {
  data: IAnalyticsData
}

export const DetailedStatistics: React.FC<DetailedStatisticsProps> = ({ data }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProductivityScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600 dark:text-green-400' }
    if (score >= 80) return { grade: 'A', color: 'text-green-600 dark:text-green-400' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400' }
    return { grade: 'F', color: 'text-red-600 dark:text-red-400' }
  }

  const productivityGrade = getProductivityScoreGrade(data.productivityScore)

  return (
    <div className="space-y-6">
      {/* Focus Session Completion Rate */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <FaCheckCircle className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Focus Session Completion Rate
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overall Completion Rate</span>
              <span className={`text-2xl font-bold ${getCompletionRateColor(data.completionRate)}`}>
                {data.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.completionRate}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {data.completionRate >= 80 
                ? "Excellent! You're consistently completing your focus sessions."
                : data.completionRate >= 60
                ? "Good progress! Try to maintain focus for the full session duration."
                : "Consider shorter sessions or removing distractions to improve completion rate."
              }
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round((data.completionRate / 100) * 100)} / 100
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Session Length</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatTime(data.averageSessionDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Break Time Analysis */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <FaCoffee className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Break Time Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(data.breakTimeAnalysis.totalBreakTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Break Time</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatTime(data.breakTimeAnalysis.averageBreakDuration)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Break</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.breakTimeAnalysis.breakFrequency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Breaks</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Break Recommendations</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Ideal break length: 5-15 minutes for short breaks, 15-30 minutes for long breaks</li>
            <li>• Take a break every 25-50 minutes of focused work</li>
            <li>• Use breaks for physical movement, hydration, or brief relaxation</li>
          </ul>
        </div>
      </div>

      {/* Task Categories Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <FaTasks className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Categories Distribution
          </h3>
        </div>

        <div className="space-y-4">
          {Object.entries(data.taskCategoriesDistribution)
            .sort(([,a], [,b]) => b - a)
            .map(([category, duration], index) => {
              const totalDuration = Object.values(data.taskCategoriesDistribution).reduce((sum, d) => sum + d, 0)
              const percentage = totalDuration > 0 ? (duration / totalDuration) * 100 : 0
              const colors = [
                'bg-blue-500',
                'bg-green-500', 
                'bg-purple-500',
                'bg-orange-500',
                'bg-red-500',
                'bg-yellow-500',
                'bg-pink-500',
                'bg-indigo-500'
              ]
              
              return (
                <div key={category} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(duration)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {Object.keys(data.taskCategoriesDistribution).length === 0 && (
          <div className="text-center py-8">
            <FaChartPie className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No task categories data available. Start categorizing your tasks to see distribution.
            </p>
          </div>
        )}
      </div>

      {/* Productivity Score Breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <IoStatsChartOutline className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Productivity Score Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="text-center">
            <div className={`text-6xl font-bold ${productivityGrade.color} mb-2`}>
              {data.productivityScore}
            </div>
            <div className={`text-2xl font-bold ${productivityGrade.color} mb-2`}>
              Grade: {productivityGrade.grade}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Overall Productivity Score
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="text-sm font-medium">{((data.completionRate / 100) * 25).toFixed(1)}/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${data.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Session Duration</span>
                <span className="text-sm font-medium">
                  {(Math.min((data.averageSessionDuration / 1800), 1) * 25).toFixed(1)}/25
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((data.averageSessionDuration / 1800) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Focus</span>
                <span className="text-sm font-medium">
                  {(Math.min((data.totalFocusTime.daily / 7200), 1) * 25).toFixed(1)}/25
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((data.totalFocusTime.daily / 7200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Consistency</span>
                <span className="text-sm font-medium">
                  {(Math.min((data.longestStreak / 30), 1) * 25).toFixed(1)}/25
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${Math.min((data.longestStreak / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Score Explanation</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your productivity score is calculated based on completion rate (25%), average session duration (25%), 
            daily focus time (25%), and consistency streak (25%). Aim for regular, completed sessions to improve your score.
          </p>
        </div>
      </div>
    </div>
  )
}