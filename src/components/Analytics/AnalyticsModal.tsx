import { useEffect, useState } from 'react'
import { IoCloseSharp, IoDownloadOutline, IoCalendarOutline } from 'react-icons/io5'
import { FaUsers, FaClock, FaChartLine, FaGlobe } from 'react-icons/fa'
import { UsageStats } from './UsageStats'
import { HeatMapVisualization } from './HeatMapVisualization'
import { TimeMetrics } from './TimeMetrics'
import { useAnalytics } from '@App/hooks/useAnalytics'
import { Button } from '@Components/Common/Button'

interface AnalyticsModalProps {
  isVisible: boolean
  onClose: () => void
}

export const AnalyticsModal = ({ isVisible, onClose }: AnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'metrics'>('overview')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const { analytics, loading, exportData } = useAnalytics(dateRange)

  const keydownHandler = ({ key }: KeyboardEvent) => {
    if (key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', keydownHandler)
      return () => document.removeEventListener('keydown', keydownHandler)
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleExport = () => {
    exportData()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-[90vh] mx-4 bg-background-primary rounded-xl shadow-2xl border border-border-light overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light bg-gradient-to-r from-accent-orange to-hover-accent">
          <div className="flex items-center space-x-3">
            <FaChartLine className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg p-2">
              <IoCalendarOutline className="h-4 w-4 text-white" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-transparent text-white text-sm font-medium focus:outline-none"
              >
                <option value="7d" className="text-gray-800">Last 7 days</option>
                <option value="30d" className="text-gray-800">Last 30 days</option>
                <option value="90d" className="text-gray-800">Last 90 days</option>
              </select>
            </div>
            
            {/* Export Button */}
            <Button
              onClick={handleExport}
              variant="secondary"
              size="small"
              className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30"
            >
              <IoDownloadOutline className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <IoCloseSharp className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-light bg-background-secondary">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'text-accent-orange border-b-2 border-accent-orange bg-background-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
            }`}
          >
            <FaUsers className="h-4 w-4" />
            <span>Usage Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === 'heatmap'
                ? 'text-accent-orange border-b-2 border-accent-orange bg-background-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
            }`}
          >
            <FaGlobe className="h-4 w-4" />
            <span>Activity Heat Map</span>
          </button>
          
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === 'metrics'
                ? 'text-accent-orange border-b-2 border-accent-orange bg-background-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-primary'
            }`}
          >
            <FaClock className="h-4 w-4" />
            <span>Time Metrics</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <UsageStats analytics={analytics} />}
              {activeTab === 'heatmap' && <HeatMapVisualization analytics={analytics} />}
              {activeTab === 'metrics' && <TimeMetrics analytics={analytics} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}