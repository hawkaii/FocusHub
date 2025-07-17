import { useEffect, useState } from "react";
import { IoCloseSharp, IoDownloadOutline, IoCalendarOutline } from "react-icons/io5";
import { FaClock, FaChartLine, FaGlobe, FaTrophy } from "react-icons/fa";
import { Leaderboard } from "./Leaderboard";
import { HeatMapVisualization } from "./HeatMapVisualization";
import { TimeMetrics } from "./TimeMetrics";
import { useAnalytics } from "@Utils/hooks/useAnalytics";
import { Button } from "@Components/Common/Button";

interface AnalyticsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AnalyticsModal = ({ isVisible, onClose }: AnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "heatmap" | "metrics">("leaderboard");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const { analytics, loading, exportData } = useAnalytics(dateRange);

  const keydownHandler = ({ key }: KeyboardEvent) => {
    if (key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", keydownHandler);
      return () => document.removeEventListener("keydown", keydownHandler);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-border-light bg-background-primary shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border-light bg-gradient-to-r from-accent-orange to-hover-accent p-6">
          <div className="flex items-center space-x-3">
            <FaChartLine className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2 rounded-lg bg-white bg-opacity-20 p-2">
              <IoCalendarOutline className="h-4 w-4 text-white" />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as "7d" | "30d" | "90d")}
                className="bg-transparent text-sm font-medium text-white focus:outline-none"
              >
                <option value="7d" className="text-gray-800">
                  Last 7 days
                </option>
                <option value="30d" className="text-gray-800">
                  Last 30 days
                </option>
                <option value="90d" className="text-gray-800">
                  Last 90 days
                </option>
              </select>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              variant="secondary"
              size="small"
              className="border-white border-opacity-30 bg-white bg-opacity-20 text-white hover:bg-opacity-30"
            >
              <IoDownloadOutline className="mr-2 h-4 w-4" />
              Export
            </Button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg bg-white bg-opacity-20 p-2 transition-all duration-200 hover:bg-opacity-30"
            >
              <IoCloseSharp className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-shrink-0 border-b border-border-light bg-background-secondary">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === "leaderboard"
                ? "border-b-2 border-accent-orange bg-background-primary text-accent-orange"
                : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
            }`}
          >
            <FaTrophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === "heatmap"
                ? "border-b-2 border-accent-orange bg-background-primary text-accent-orange"
                : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
            }`}
          >
            <FaGlobe className="h-4 w-4" />
            <span>Activity Heat Map</span>
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
              activeTab === "metrics"
                ? "border-b-2 border-accent-orange bg-background-primary text-accent-orange"
                : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
            }`}
          >
            <FaClock className="h-4 w-4" />
            <span>Time Metrics</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-accent-orange"></div>
              </div>
            ) : (
              <>
                {activeTab === "leaderboard" && <Leaderboard analytics={analytics} />}
                {activeTab === "heatmap" && <HeatMapVisualization analytics={analytics} />}
                {activeTab === "metrics" && <TimeMetrics analytics={analytics} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
