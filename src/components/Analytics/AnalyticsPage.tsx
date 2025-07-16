import React, { useState, useEffect } from "react";
import {
  IoCloseSharp,
  IoDownloadOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaFire, FaChartLine, FaClock, FaBullseye } from "react-icons/fa";
import { useFocusAnalytics } from "@App/hooks/useFocusAnalytics";
import { useToggleAnalytics } from "@Store";
import { IAnalyticsFilters } from "@App/interfaces";
import { TimeTrackingOverview } from "./TimeTrackingOverview";
import { InteractiveHeatMap } from "./InteractiveHeatMap";
import { DetailedStatistics } from "./DetailedStatistics";
import { DataVisualization } from "./DataVisualization";
import { AnalyticsFilters } from "./AnalyticsFilters";
import clsx from "clsx";

export const AnalyticsPage = () => {
  const { setIsAnalyticsToggled } = useToggleAnalytics();
  const { analyticsData, loading, fetchSessions, exportData } = useFocusAnalytics();
  const [activeTab, setActiveTab] = useState<"overview" | "heatmap" | "statistics" | "charts">("overview");
  const [filters, setFilters] = useState<IAnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    },
    sessionType: "all",
    taskCategory: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchSessions(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<IAnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = (format: "json" | "csv") => {
    exportData(format);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8 dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
            <span className="text-gray-700 dark:text-gray-300">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50">
      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-7xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoStatsChartOutline className="h-8 w-8 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Analytics</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track your productivity and focus patterns</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Export Buttons */}
                <button
                  onClick={() => handleExport("json")}
                  className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <IoDownloadOutline className="h-4 w-4" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <IoDownloadOutline className="h-4 w-4" />
                  <span>CSV</span>
                </button>

                <IoCloseSharp
                  className="h-6 w-6 cursor-pointer rounded text-red-500 hover:bg-red-100"
                  onClick={() => setIsAnalyticsToggled(false)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            {analyticsData && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-violet-50 p-4 dark:bg-violet-900/20">
                  <div className="flex items-center space-x-2">
                    <FaClock className="h-5 w-5 text-violet-600" />
                    <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Today's Focus</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-violet-900 dark:text-violet-100">
                    {Math.floor(analyticsData.totalFocusTime.daily / 3600)}h{" "}
                    {Math.floor((analyticsData.totalFocusTime.daily % 3600) / 60)}m
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center space-x-2">
                    <FaBullseye className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Completion Rate</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">
                    {analyticsData.completionRate.toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                  <div className="flex items-center space-x-2">
                    <FaFire className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Current Streak</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {analyticsData.longestStreak} days
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-2">
                    <IoTrophyOutline className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Productivity Score</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {analyticsData.productivityScore}/100
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <AnalyticsFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: IoTimeOutline },
                { id: "heatmap", label: "Heat Map", icon: IoCalendarOutline },
                { id: "statistics", label: "Statistics", icon: IoStatsChartOutline },
                { id: "charts", label: "Charts", icon: FaChartLine },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex items-center space-x-2 border-b-2 py-4 text-sm font-medium",
                    activeTab === tab.id
                      ? "border-violet-500 text-violet-600 dark:text-violet-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {analyticsData ? (
              <>
                {activeTab === "overview" && <TimeTrackingOverview data={analyticsData} />}
                {activeTab === "heatmap" && <InteractiveHeatMap data={analyticsData.heatMapData} />}
                {activeTab === "statistics" && <DetailedStatistics data={analyticsData} />}
                {activeTab === "charts" && <DataVisualization data={analyticsData} />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <IoStatsChartOutline className="h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No data available</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Start using the focus timer to see your analytics here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
