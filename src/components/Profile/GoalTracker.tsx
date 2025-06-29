import { useState, useEffect } from 'react'
import { FaTarget, FaSave, FaEdit } from 'react-icons/fa'
import { IoTrophy, IoTime, IoCalendar } from 'react-icons/io5'
import { Button } from '@Components/Common/Button'
import { IUserStats } from '@App/interfaces'
import { formatTime } from '@Utils/timeUtils'
import { successToast } from '@Utils/toast'

interface GoalTrackerProps {
  userStats: IUserStats
}

interface UserGoals {
  dailySessions: number
  dailyFocusTime: number // in seconds
  weeklyFocusTime: number // in seconds
  monthlyFocusTime: number // in seconds
}

export const GoalTracker = ({ userStats }: GoalTrackerProps) => {
  const [goals, setGoals] = useState<UserGoals>({
    dailySessions: 4,
    dailyFocusTime: 2 * 60 * 60, // 2 hours
    weeklyFocusTime: 10 * 60 * 60, // 10 hours
    monthlyFocusTime: 40 * 60 * 60, // 40 hours
  })
  const [isEditing, setIsEditing] = useState(false)
  const [tempGoals, setTempGoals] = useState(goals)

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('focusstation-goals')
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals)
        setGoals(parsedGoals)
        setTempGoals(parsedGoals)
      } catch (error) {
        console.error('Error parsing saved goals:', error)
      }
    }
  }, [])

  // Save goals to localStorage
  const saveGoals = () => {
    setGoals(tempGoals)
    localStorage.setItem('focusstation-goals', JSON.stringify(tempGoals))
    setIsEditing(false)
    successToast('Goals updated successfully!', false)
  }

  const cancelEdit = () => {
    setTempGoals(goals)
    setIsEditing(false)
  }

  // Calculate progress percentages
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-success'
    if (percentage >= 75) return 'bg-accent-orange'
    if (percentage >= 50) return 'bg-warning'
    return 'bg-gray-400'
  }

  const formatGoalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <FaTarget className="mr-2 text-accent-orange" />
          Personal Goals
        </h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="secondary" size="small" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" size="small" onClick={saveGoals}>
                <FaSave className="mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="small" onClick={() => setIsEditing(true)}>
              <FaEdit className="mr-1" />
              Edit Goals
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Sessions Goal */}
        <div className="bg-background-primary rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <IoCalendar className="text-accent-orange mr-2" />
              <span className="text-sm font-medium text-text-secondary">Daily Sessions</span>
            </div>
            {isEditing && (
              <input
                type="number"
                min="1"
                max="20"
                value={tempGoals.dailySessions}
                onChange={(e) => setTempGoals({ ...tempGoals, dailySessions: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 text-xs border border-border-medium rounded bg-background-secondary text-text-primary"
              />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-text-primary">
                {userStats.sessionsToday} / {goals.dailySessions}
              </span>
              <span className="text-sm text-text-secondary">
                {Math.round(getProgress(userStats.sessionsToday, goals.dailySessions))}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  getProgress(userStats.sessionsToday, goals.dailySessions)
                )}`}
                style={{ width: `${getProgress(userStats.sessionsToday, goals.dailySessions)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Focus Time Goal */}
        <div className="bg-background-primary rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <IoTime className="text-accent-orange mr-2" />
              <span className="text-sm font-medium text-text-secondary">Daily Focus</span>
            </div>
            {isEditing && (
              <select
                value={tempGoals.dailyFocusTime / 3600}
                onChange={(e) => setTempGoals({ ...tempGoals, dailyFocusTime: parseInt(e.target.value) * 3600 })}
                className="px-2 py-1 text-xs border border-border-medium rounded bg-background-secondary text-text-primary"
              >
                <option value={0.5}>30m</option>
                <option value={1}>1h</option>
                <option value={1.5}>1.5h</option>
                <option value={2}>2h</option>
                <option value={3}>3h</option>
                <option value={4}>4h</option>
                <option value={6}>6h</option>
                <option value={8}>8h</option>
              </select>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-text-primary">
                {formatTime(userStats.focusTimeToday)} / {formatGoalTime(goals.dailyFocusTime)}
              </span>
              <span className="text-sm text-text-secondary">
                {Math.round(getProgress(userStats.focusTimeToday, goals.dailyFocusTime))}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  getProgress(userStats.focusTimeToday, goals.dailyFocusTime)
                )}`}
                style={{ width: `${getProgress(userStats.focusTimeToday, goals.dailyFocusTime)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Focus Time Goal */}
        <div className="bg-background-primary rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <IoCalendar className="text-accent-orange mr-2" />
              <span className="text-sm font-medium text-text-secondary">Weekly Focus</span>
            </div>
            {isEditing && (
              <select
                value={tempGoals.weeklyFocusTime / 3600}
                onChange={(e) => setTempGoals({ ...tempGoals, weeklyFocusTime: parseInt(e.target.value) * 3600 })}
                className="px-2 py-1 text-xs border border-border-medium rounded bg-background-secondary text-text-primary"
              >
                <option value={5}>5h</option>
                <option value={10}>10h</option>
                <option value={15}>15h</option>
                <option value={20}>20h</option>
                <option value={25}>25h</option>
                <option value={30}>30h</option>
                <option value={40}>40h</option>
              </select>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-text-primary">
                {formatTime(userStats.focusTimeThisWeek)} / {formatGoalTime(goals.weeklyFocusTime)}
              </span>
              <span className="text-sm text-text-secondary">
                {Math.round(getProgress(userStats.focusTimeThisWeek, goals.weeklyFocusTime))}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  getProgress(userStats.focusTimeThisWeek, goals.weeklyFocusTime)
                )}`}
                style={{ width: `${getProgress(userStats.focusTimeThisWeek, goals.weeklyFocusTime)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Focus Time Goal */}
        <div className="bg-background-primary rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <IoTrophy className="text-accent-orange mr-2" />
              <span className="text-sm font-medium text-text-secondary">Monthly Focus</span>
            </div>
            {isEditing && (
              <select
                value={tempGoals.monthlyFocusTime / 3600}
                onChange={(e) => setTempGoals({ ...tempGoals, monthlyFocusTime: parseInt(e.target.value) * 3600 })}
                className="px-2 py-1 text-xs border border-border-medium rounded bg-background-secondary text-text-primary"
              >
                <option value={20}>20h</option>
                <option value={30}>30h</option>
                <option value={40}>40h</option>
                <option value={50}>50h</option>
                <option value={60}>60h</option>
                <option value={80}>80h</option>
                <option value={100}>100h</option>
              </select>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-text-primary">
                {formatTime(userStats.focusTimeThisMonth)} / {formatGoalTime(goals.monthlyFocusTime)}
              </span>
              <span className="text-sm text-text-secondary">
                {Math.round(getProgress(userStats.focusTimeThisMonth, goals.monthlyFocusTime))}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                  getProgress(userStats.focusTimeThisMonth, goals.monthlyFocusTime)
                )}`}
                style={{ width: `${getProgress(userStats.focusTimeThisMonth, goals.monthlyFocusTime)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-background-primary rounded-lg p-4 border border-border-light">
        <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
          <IoTrophy className="mr-2 text-yellow-500" />
          Today's Progress
        </h4>
        <div className="flex flex-wrap gap-2">
          {userStats.sessionsToday >= goals.dailySessions && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success text-white">
              🎯 Daily Sessions Goal Achieved!
            </span>
          )}
          {userStats.focusTimeToday >= goals.dailyFocusTime && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success text-white">
              ⏰ Daily Focus Goal Achieved!
            </span>
          )}
          {userStats.currentStreak >= 7 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-orange text-white">
              🔥 Week Streak!
            </span>
          )}
          {userStats.currentStreak >= 30 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
              🏆 Month Streak!
            </span>
          )}
          {userStats.sessionsToday === 0 && userStats.focusTimeToday === 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-400 text-white">
              💪 Ready to start your first session?
            </span>
          )}
        </div>
      </div>
    </div>
  )
}