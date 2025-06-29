import { useState, useEffect } from 'react'
import { IoCloseSharp, IoStatsChart, IoCalendar, IoTime, IoTrophy, IoDownload, IoSettings } from 'react-icons/io5'
import { FaFire, FaTarget, FaClock, FaChartLine, FaCalendarAlt } from 'react-icons/fa'
import { useAuth } from '@App/hooks/useAuth'
import { useRealtimeAnalytics } from '@App/hooks/useRealtimeAnalytics'
import { Button } from '@Components/Common/Button'
import { CalendarHeatmap } from './CalendarHeatmap'
import { StatsCard } from './StatsCard'
import { SessionChart } from './SessionChart'
import { GoalTracker } from './GoalTracker'
import { formatTime, formatDate } from '@Utils/timeUtils'

interface ProfilePageProps {
  isVisible: boolean
  onClose: () => void
}

export const ProfilePage = ({ isVisible, onClose }: ProfilePageProps) => {
  const { user } = useAuth()
  const { userStats, heatmapData, sessions, loading, exportUserData, generateHeatmapData } = useRealtimeAnalytics()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [showGoalSettings, setShowGoalSettings] = useState(false)

  useEffect(() => {
    if (selectedYear !== new Date().getFullYear()) {
      generateHeatmapData(selectedYear)
    }
  }, [selectedYear, generateHeatmapData])

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getUserAvatar = () => {
    if (user?.photoURL) return user.photoURL
    return null
  }

  const getTimeRangeStats = () => {
    switch (timeRange) {
      case 'week':
        return {
          sessions: userStats.sessionsThisWeek,
          focusTime: userStats.focusTimeThisWeek,
          label: 'This Week'
        }
      case 'month':
        return {
          sessions: userStats.sessionsThisMonth,
          focusTime: userStats.focusTimeThisMonth,
          label: 'This Month'
        }
      case 'year':
        return {
          sessions: userStats.totalSessions,
          focusTime: userStats.totalFocusTime,
          label: 'All Time'
        }
    }
  }

  const currentStats = getTimeRangeStats()

  if (!isVisible) return null

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-lg bg-background-primary text-text-primary shadow-card-hover border border-border-light"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-primary border-b border-border-light p-6 z-10 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()!}
                  alt="Profile"
                  className="h-16 w-16 rounded-full border-2 border-accent-orange shadow-md"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-accent-orange flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-text-primary">{getUserDisplayName()}</h1>
                <p className="text-text-secondary">{user?.email}</p>
                <p className="text-sm text-text-muted">
                  Member since {formatDate(user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date())}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="small"
                onClick={exportUserData}
                className="flex items-center space-x-2"
              >
                <IoDownload />
                <span>Export Data</span>
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowGoalSettings(!showGoalSettings)}
                className="flex items-center space-x-2"
              >
                <IoSettings />
                <span>Goals</span>
              </Button>
              <IoCloseSharp
                className="cursor-pointer text-error hover:text-red-600 transition-colors duration-200 text-2xl"
                onClick={onClose}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Goal Tracker */}
            {showGoalSettings && (
              <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
                <GoalTracker userStats={userStats} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Today's Sessions"
                value={userStats.sessionsToday}
                icon={<IoStatsChart className="text-accent-orange" />}
                subtitle={`${formatTime(userStats.focusTimeToday)} focused`}
                trend={userStats.sessionsToday > 0 ? { value: 12, isPositive: true } : undefined}
              />
              <StatsCard
                title="Current Streak"
                value={userStats.currentStreak}
                icon={<FaFire className="text-orange-500" />}
                subtitle="days in a row"
                trend={userStats.currentStreak > 0 ? { value: 8, isPositive: true } : undefined}
              />
              <StatsCard
                title="Longest Streak"
                value={userStats.longestStreak}
                icon={<IoTrophy className="text-yellow-500" />}
                subtitle="personal best"
              />
              <StatsCard
                title="Total Sessions"
                value={userStats.totalSessions}
                icon={<FaTarget className="text-green-500" />}
                subtitle={`${formatTime(userStats.totalFocusTime)} total`}
              />
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary flex items-center">
                <FaChartLine className="mr-3 text-accent-orange" />
                Productivity Overview
              </h2>
              <div className="flex space-x-2">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setTimeRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Period Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background-secondary rounded-lg p-6 border border-border-light hover:shadow-card transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">{currentStats.label} Sessions</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{currentStats.sessions}</p>
                  </div>
                  <IoCalendar className="text-accent-orange text-3xl" />
                </div>
              </div>
              <div className="bg-background-secondary rounded-lg p-6 border border-border-light hover:shadow-card transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">{currentStats.label} Focus Time</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{formatTime(currentStats.focusTime)}</p>
                  </div>
                  <IoTime className="text-accent-orange text-3xl" />
                </div>
              </div>
              <div className="bg-background-secondary rounded-lg p-6 border border-border-light hover:shadow-card transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Average Session</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatTime(userStats.averageSessionLength)}
                    </p>
                  </div>
                  <FaClock className="text-accent-orange text-3xl" />
                </div>
              </div>
            </div>

            {/* Session Chart */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                <FaChartLine className="mr-2 text-accent-orange" />
                Session Activity
              </h3>
              <SessionChart sessions={sessions} timeRange={timeRange} />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center">
                  <FaCalendarAlt className="mr-2 text-accent-orange" />
                  Activity Heatmap
                </h3>
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-text-secondary">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-background-primary border border-border-medium rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange transition-all duration-200"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <CalendarHeatmap data={heatmapData} year={selectedYear} />
            </div>

            {/* Recent Sessions */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                <IoStatsChart className="mr-2 text-accent-orange" />
                Recent Sessions
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sessions.slice(0, 15).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-background-primary rounded-lg border border-border-light hover:shadow-card transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        session.type === 'work' ? 'bg-accent-orange' :
                        session.type === 'short-break' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-text-primary font-medium">
                          {session.type === 'work' ? 'Focus Session' :
                           session.type === 'short-break' ? 'Short Break' : 'Long Break'}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {formatDate(session.startTime)} at {session.startTime.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary font-semibold">{formatTime(session.duration)}</p>
                      <p className={`text-sm font-medium ${session.completed ? 'text-success' : 'text-warning'}`}>
                        {session.completed ? 'Completed' : 'Interrupted'}
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    <IoStatsChart className="mx-auto text-6xl mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No sessions recorded yet</h4>
                    <p className="text-sm">Start a pomodoro session to see your analytics here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}