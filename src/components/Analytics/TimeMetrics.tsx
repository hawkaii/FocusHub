import { useState } from 'react'
import { FaClock, FaCalendarAlt, FaChartBar, FaDownload } from 'react-icons/fa'
import { IoTimeOutline, IoTrendingUp } from 'react-icons/io5'

interface TimeMetricsProps {
  analytics: any
}

export const TimeMetrics = ({ analytics }: TimeMetricsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day')
  
  const timeSlots = [
    { period: '00:00 - 06:00', label: 'Night', sessions: 45, avgDuration: 12, color: 'bg-indigo-500' },
    { period: '06:00 - 12:00', label: 'Morning', sessions: 180, avgDuration: 25, color: 'bg-blue-500' },
    { period: '12:00 - 18:00', label: 'Afternoon', sessions: 320, avgDuration: 35, color: 'bg-green-500' },
    { period: '18:00 - 24:00', label: 'Evening', sessions: 280, avgDuration: 28, color: 'bg-orange-500' }
  ]

  const weeklyTrends = [
    { day: 'Monday', sessions: 450, avgDuration: 32, totalTime: 240 },
    { day: 'Tuesday', sessions: 520, avgDuration: 28, totalTime: 243 },
    { day: 'Wednesday', sessions: 480, avgDuration: 35, totalTime: 280 },
    { day: 'Thursday', sessions: 510, avgDuration: 30, totalTime: 255 },
    { day: 'Friday', sessions: 380, avgDuration: 25, totalTime: 158 },
    { day: 'Saturday', sessions: 290, avgDuration: 40, totalTime: 193 },
    { day: 'Sunday', sessions: 320, avgDuration: 38, totalTime: 203 }
  ]

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const maxSessions = Math.max(...weeklyTrends.map(d => d.sessions))
  const maxDuration = Math.max(...weeklyTrends.map(d => d.avgDuration))

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Time-Based Analytics</h3>
          <p className="text-text-secondary text-sm">
            Analyze usage patterns and session durations across different time periods
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['hour', 'day', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-accent-orange text-white shadow-md'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaClock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Avg Session</h4>
              <p className="text-text-secondary text-sm">Duration per user</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatDuration(analytics?.avgSessionDuration || 28)}
          </div>
          <div className="flex items-center space-x-1 text-success text-sm">
            <IoTrendingUp className="h-4 w-4" />
            <span>+12% from last period</span>
          </div>
        </div>

        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <IoTimeOutline className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Peak Time</h4>
              <p className="text-text-secondary text-sm">Most active period</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            2:00 PM
          </div>
          <div className="text-text-secondary text-sm">
            320 active sessions
          </div>
        </div>

        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FaChartBar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Total Time</h4>
              <p className="text-text-secondary text-sm">This period</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatDuration(analytics?.totalTime || 1572)}
          </div>
          <div className="text-text-secondary text-sm">
            Across all users
          </div>
        </div>
      </div>

      {/* Time Slot Analysis */}
      <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
        <h4 className="text-lg font-semibold text-text-primary mb-6">Activity by Time of Day</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <div className={`h-24 ${slot.color} rounded-lg flex items-end justify-center p-2 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="text-white font-bold text-lg z-10">{slot.sessions}</div>
                </div>
              </div>
              <h5 className="font-semibold text-text-primary mb-1">{slot.label}</h5>
              <p className="text-text-secondary text-sm mb-1">{slot.period}</p>
              <p className="text-text-secondary text-xs">Avg: {slot.avgDuration}m</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-text-primary">Weekly Usage Trends</h4>
          <button 
            onClick={() => {
              // Export weekly trends data
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Day,Sessions,Avg Duration (min),Total Time (min)\n" +
                weeklyTrends.map(day => `${day.day},${day.sessions},${day.avgDuration},${day.totalTime}`).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "weekly-trends.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center space-x-2 text-accent-orange hover:text-hover-accent transition-colors duration-200"
          >
            <FaDownload className="h-4 w-4" />
            <span className="text-sm">Export Data</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Day</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Sessions</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Avg Duration</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Total Time</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Activity</th>
              </tr>
            </thead>
            <tbody>
              {weeklyTrends.map((day, index) => (
                <tr key={index} className="border-b border-border-light hover:bg-background-secondary transition-colors duration-200">
                  <td className="py-3 px-4 font-medium text-text-primary">{day.day}</td>
                  <td className="py-3 px-4 text-text-primary">{day.sessions}</td>
                  <td className="py-3 px-4 text-text-primary">{day.avgDuration}m</td>
                  <td className="py-3 px-4 text-text-primary">{formatDuration(day.totalTime)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-border-light rounded-full h-2">
                        <div
                          className="bg-accent-orange h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                        />
                      </div>
                      <span className="text-text-secondary text-sm">
                        {Math.round((day.sessions / maxSessions) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trends Chart */}
      <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
        <h4 className="text-lg font-semibold text-text-primary mb-6">Historical Usage Trends</h4>
        <div className="h-64 flex items-end justify-between space-x-1">
          {Array.from({ length: 30 }, (_, i) => {
            const height = Math.random() * 80 + 20
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            
            return (
              <div key={i} className="flex flex-col items-center space-y-2 flex-1 group">
                <div
                  className="bg-gradient-to-t from-accent-orange to-hover-accent rounded-t-sm w-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${date.toLocaleDateString()}: ${Math.round(height * 5)} sessions`}
                />
                {i % 5 === 0 && (
                  <span className="text-xs text-text-secondary transform -rotate-45 origin-center">
                    {date.getMonth() + 1}/{date.getDate()}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}