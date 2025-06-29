import React from 'react'
import { IAnalyticsFilters } from '@App/interfaces'
import { IoCalendarOutline, IoFunnelOutline } from 'react-icons/io5'

interface AnalyticsFiltersProps {
  filters: IAnalyticsFilters
  onFilterChange: (filters: Partial<IAnalyticsFilters>) => void
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ filters, onFilterChange }) => {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDate = new Date(value)
    onFilterChange({
      dateRange: {
        ...filters.dateRange,
        [field]: newDate
      }
    })
  }

  const setQuickDateRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    onFilterChange({
      dateRange: { start, end }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <IoFunnelOutline className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.start)}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.end)}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Session Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Session Type
          </label>
          <select
            value={filters.sessionType}
            onChange={(e) => onFilterChange({ sessionType: e.target.value as any })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Sessions</option>
            <option value="focus">Focus Only</option>
            <option value="break">Break Only</option>
          </select>
        </div>

        {/* Task Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Category
          </label>
          <select
            value={filters.taskCategory}
            onChange={(e) => onFilterChange({ taskCategory: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
            <option value="Exercise">Exercise</option>
            <option value="Reading">Reading</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="completion">Completion</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFilterChange({ sortOrder: e.target.value as any })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick select:</span>
        {[
          { label: 'Last 7 days', days: 7 },
          { label: 'Last 30 days', days: 30 },
          { label: 'Last 90 days', days: 90 },
          { label: 'Last year', days: 365 },
        ].map(({ label, days }) => (
          <button
            key={days}
            onClick={() => setQuickDateRange(days)}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}