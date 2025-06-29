import { useState, useEffect } from 'react'
import { IoCloseSharp, IoStatsChart, IoCalendar, IoTime, IoTrophy } from 'react-icons/io5'
import { FaFire, FaTarget, FaClock, FaChartLine } from 'react-icons/fa'
import { useAuth } from '@App/hooks/useAuth'
import { useAnalytics } from '@App/hooks/useAnalytics'
import { Button } from '@Components/Common/Button'
import { Heatmap } from './Heatmap'
import { StatsCard } from './StatsCard'
import { SessionChart } from './SessionChart'
import { formatTime, formatDate } from '@Utils/timeUtils'

interface ProfilePageProps {
  isVisible: boolean
  onClose: () => void
}

export const ProfilePage = ({ isVisible, onClose }: ProfilePageProps) => {
  const { user } = useAuth()
  const { userStats, heatmapData, sessions, loading, fetchSessions } = useAnalytics()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    if (isVisible && user) {
      fetchSessions()
    }
  }, [isVisible, user])

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
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-background-primary text-text-primary shadow-card-hover border border-border-light"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-primary border-b border-border-light p-6 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()!}
                  alt="Profile"
                  className="h-16 w-16 rounded-full border-2 border-accent-orange"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-accent-orange flex items-center justify-center text-white text-2xl font-bold">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{getUserDisplayName()}</h1>
                <p className="text-text-secondary">{user?.email}</p>
                <p className="text-sm text-text-muted">
                  Member since {formatDate(user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date())}
                </p>
              </div>
            </div>
            <IoCloseSharp
              className="cursor-pointer text-error hover:text-red-600 transition-colors duration-200 text-2xl"
              onClick={onClose}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Today's Sessions"
                value={userStats.sessionsToday}
                icon={<IoStatsChart className="text-accent-orange" />}
                subtitle={`${formatTime(userStats.focusTimeToday)} focused`}
              />
              <StatsCard
                title="Current Streak"
                value={userStats.currentStreak}
                icon={<FaFire className="text-orange-500" />}
                subtitle="days in a row"
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
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <FaChartLine className="mr-2 text-accent-orange" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background-secondary rounded-lg p-4 border border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{currentStats.label} Sessions</p>
                    <p className="text-2xl font-bold text-text-primary">{currentStats.sessions}</p>
                  </div>
                  <IoCalendar className="text-accent-orange text-2xl" />
                </div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4 border border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">{currentStats.label} Focus Time</p>
                    <p className="text-2xl font-bold text-text-primary">{formatTime(currentStats.focusTime)}</p>
                  </div>
                  <IoTime className="text-accent-orange text-2xl" />
                </div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4 border border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Average Session</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatTime(userStats.averageSessionLength)}
                    </p>
                  </div>
                  <FaClock className="text-accent-orange text-2xl" />
                </div>
              </div>
            </div>

            {/* Session Chart */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Session Activity</h3>
              <SessionChart sessions={sessions} timeRange={timeRange} />
            </div>

            {/* Activity Heatmap */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Activity Heatmap</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-background-primary border border-border-medium rounded-md px-3 py-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Heatmap data={heatmapData} year={selectedYear} />
            </div>

            {/* Recent Sessions */}
            <div className="bg-background-secondary rounded-lg p-6 border border-border-light">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Sessions</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-background-primary rounded-lg border border-border-light"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        session.type === 'work' ? 'bg-accent-orange' :
                        session.type === 'short-break' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-text-primary font-medium">
                          {session.type === 'work' ? 'Focus Session' :
                           session.type === 'short-break' ? 'Short Break' : 'Long Break'}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {formatDate(session.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary font-medium">{formatTime(session.duration)}</p>
                      <p className={`text-sm ${session.completed ? 'text-success' : 'text-warning'}`}>
                        {session.completed ? 'Completed' : 'Interrupted'}
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-text-secondary">
                    <IoStatsChart className="mx-auto text-4xl mb-2 opacity-50" />
                    <p>No sessions recorded yet</p>
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