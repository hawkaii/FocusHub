import React from 'react'
import { IAnalyticsData } from '@App/interfaces'
import { FaClock, FaCalendarWeek, FaCalendarAlt, FaChartLine } from 'react-icons/fa'
import { IoTimeOutline, IoTrendingUpOutline } from 'react-icons/io5'

interface TimeTrackingOverviewProps {
  data: IAnalyticsData
}

export const TimeTrackingOverview: React.FC<TimeTrackingOverviewProps> = ({ data }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className="space-y-6">
      {/* Time Tracking Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Daily Focus</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatTime(data.totalFocusTime.daily)}
              </p>
            </div>
            <FaClock className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
              <IoTrendingUpOutline className="mr-1 h-4 w-4" />
              <span>Today's progress</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Weekly Focus</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatTime(data.totalFocusTime.weekly)}
              </p>
            </div>
            <FaCalendarWeek className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-700 dark:text-green-300">
              <IoTrendingUpOutline className="mr-1 h-4 w-4" />
              <span>This week's total</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Monthly Focus</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatTime(data.totalFocusTime.monthly)}
              </p>
            </div>
            <FaCalendarAlt className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
              <IoTrendingUpOutline className="mr-1 h-4 w-4" />
              <span>This month's total</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Session</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatTime(data.averageSessionDuration)}
              </p>
            </div>
            <FaChartLine className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-orange-700 dark:text-orange-300">
              <IoTimeOutline className="mr-1 h-4 w-4" />
              <span>Average duration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Streak Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Focus Streak
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {data.longestStreak} days
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((data.longestStreak / 30) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep going! Consistency is key to building lasting habits.
            </p>
          </div>
        </div>

        {/* Peak Productivity Hours */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Peak Productivity Hours
          </h3>
          <div className="space-y-3">
            {data.peakProductivityHours.slice(0, 3).map((hour, index) => (
              <div key={hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-yellow-400' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    #{index + 1} Most Productive
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Schedule important tasks during these hours for maximum productivity.
          </p>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Progress Indicators
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Daily Goal Progress */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min(data.totalFocusTime.daily / 7200, 1))}`}
                  className="text-blue-500 transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(Math.min((data.totalFocusTime.daily / 7200) * 100, 100))}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Daily Goal</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2 hours target</p>
          </div>

          {/* Completion Rate */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - data.completionRate / 100)}`}
                  className="text-green-500 transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm font-bold text-gray-900 dark:text-white">
                {Math.round(data.completionRate)}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Completion</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Session success rate</p>
          </div>

          {/* Productivity Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - data.productivityScore / 100)}`}
                  className="text-purple-500 transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm font-bold text-gray-900 dark:text-white">
                {data.productivityScore}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Score</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overall productivity</p>
          </div>
        </div>
      </div>
    </div>
  )
}