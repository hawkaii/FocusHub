import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: ReactNode
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export const StatsCard = ({ title, value, icon, subtitle, trend }: StatsCardProps) => {
  return (
    <div className="bg-background-secondary rounded-lg p-4 border border-border-light hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <div className="text-xl">{icon}</div>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        
        {subtitle && (
          <p className="text-text-muted text-sm">{subtitle}</p>
        )}
        
        {trend && (
          <div className="flex items-center space-x-1">
            <span className={`text-sm ${trend.isPositive ? 'text-success' : 'text-error'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-text-muted text-xs">vs last period</span>
          </div>
        )}
      </div>
    </div>
  )
}