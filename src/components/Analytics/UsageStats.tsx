import { FaUsers, FaClock, FaChartLine, FaCalendarAlt } from 'react-icons/fa'
import { IoTrendingUp, IoTrendingDown } from 'react-icons/io5'

interface UsageStatsProps {
  analytics: any
}

export const UsageStats = ({ analytics }: UsageStatsProps) => {
  const stats = [
    {
      title: 'Daily Active Users',
      value: analytics?.dailyActiveUsers || 0,
      change: analytics?.dailyChange || 0,
      icon: FaUsers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Weekly Active Users',
      value: analytics?.weeklyActiveUsers || 0,
      change: analytics?.weeklyChange || 0,
      icon: FaCalendarAlt,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Monthly Active Users',
      value: analytics?.monthlyActiveUsers || 0,
      change: analytics?.monthlyChange || 0,
      icon: FaChartLine,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Avg Session Duration',
      value: `${analytics?.avgSessionDuration || 0}m`,
      change: analytics?.sessionChange || 0,
      icon: FaClock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0
          const TrendIcon = isPositive ? IoTrendingUp : IoTrendingDown
          
          return (
            <div
              key={index}
              className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-success' : 'text-error'
                }`}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">
                  {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                </h3>
                <p className="text-text-secondary text-sm">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Usage Times */}
        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Peak Usage Times</h3>
          <div className="space-y-3">
            {analytics?.peakTimes?.map((time: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-secondary">{time.period}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-border-light rounded-full h-2">
                    <div
                      className="bg-accent-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${time.percentage}%` }}
                    />
                  </div>
                  <span className="text-text-primary font-medium">{time.users}</span>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">User Engagement</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">New Users</span>
              <span className="text-text-primary font-medium">{analytics?.newUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Returning Users</span>
              <span className="text-text-primary font-medium">{analytics?.returningUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Bounce Rate</span>
              <span className="text-text-primary font-medium">{analytics?.bounceRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Pages per Session</span>
              <span className="text-text-primary font-medium">{analytics?.pagesPerSession || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Trends Chart */}
      <div className="bg-background-primary border border-border-light rounded-xl p-6 shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Usage Trends</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analytics?.usageTrends?.map((day: any, index: number) => (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div
                className="bg-gradient-to-t from-accent-orange to-hover-accent rounded-t-md w-full transition-all duration-300 hover:opacity-80"
                style={{ height: `${(day.users / Math.max(...analytics.usageTrends.map((d: any) => d.users))) * 100}%` }}
              />
              <span className="text-xs text-text-secondary transform -rotate-45 origin-center">
                {day.date}
              </span>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  )
}