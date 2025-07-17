import { useState } from "react";
import { FaInfoCircle, FaTrophy, FaFire, FaClock, FaTasks, FaCalendarCheck } from "react-icons/fa";

interface HeatMapVisualizationProps {
  analytics: any;
}

export const HeatMapVisualization = ({ analytics }: HeatMapVisualizationProps) => {
  const [selectedMetric, setSelectedMetric] = useState<"sessions" | "duration" | "tasks">("sessions");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getHeatMapData = () => {
    try {
      return analytics?.userActivity?.[selectedMetric] || generateMockActivityData();
    } catch (error) {
      console.warn("Error loading heat map data, using mock data:", error);
      return generateMockActivityData();
    }
  };

  const generateMockActivityData = () => {
    const data: number[][] = [];
    for (let day = 0; day < 7; day++) {
      const dayData: number[] = [];
      for (let hour = 0; hour < 24; hour++) {
        let intensity = 0;
        if (day < 5) {
          // Weekdays - study patterns
          if (hour >= 8 && hour <= 11) intensity = Math.random() * 0.9 + 0.3; // Morning study
          else if (hour >= 14 && hour <= 17) intensity = Math.random() * 0.8 + 0.2; // Afternoon study
          else if (hour >= 19 && hour <= 22) intensity = Math.random() * 0.7 + 0.2; // Evening study
          else intensity = Math.random() * 0.2;
        } else {
          // Weekends - more flexible study times
          if (hour >= 10 && hour <= 15) intensity = Math.random() * 0.6 + 0.1;
          else if (hour >= 19 && hour <= 23) intensity = Math.random() * 0.5 + 0.1;
          else intensity = Math.random() * 0.15;
        }
        dayData.push(intensity);
      }
      data.push(dayData);
    }
    return data;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
    if (intensity < 0.2) return "bg-green-100 dark:bg-green-900/30";
    if (intensity < 0.4) return "bg-green-200 dark:bg-green-800/50";
    if (intensity < 0.6) return "bg-green-300 dark:bg-green-700/60";
    if (intensity < 0.8) return "bg-green-400 dark:bg-green-600/70";
    return "bg-green-500 dark:bg-green-500/80";
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity === 0) return "No activity";
    if (intensity < 0.2) return "Light activity";
    if (intensity < 0.4) return "Moderate activity";
    if (intensity < 0.6) return "High activity";
    if (intensity < 0.8) return "Very high activity";
    return "Peak activity";
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "sessions":
        return "study sessions";
      case "duration":
        return "minutes studied";
      case "tasks":
        return "tasks completed";
      default:
        return "activities";
    }
  };

  const heatMapData = getHeatMapData();
  const maxIntensity = heatMapData && heatMapData.length > 0 ? Math.max(...heatMapData.flat()) : 1;

  // Mock user achievements
  const achievements = [
    {
      id: 1,
      title: "First Session",
      description: "Complete your first study session",
      icon: FaCalendarCheck,
      completed: true,
      unlockedAt: "2024-01-15",
    },
    {
      id: 2,
      title: "10 Sessions Strong",
      description: "Complete 10 study sessions",
      icon: FaTasks,
      completed: true,
      unlockedAt: "2024-01-22",
    },
    {
      id: 3,
      title: "Week Warrior",
      description: "Study for 7 consecutive days",
      icon: FaFire,
      completed: true,
      unlockedAt: "2024-01-29",
    },
    {
      id: 4,
      title: "Hour Master",
      description: "Study for 50 total hours",
      icon: FaClock,
      completed: true,
      unlockedAt: "2024-02-05",
    },
    {
      id: 5,
      title: "Century Club",
      description: "Complete 100 study sessions",
      icon: FaTrophy,
      completed: false,
      progress: 67,
    },
    {
      id: 6,
      title: "Night Owl",
      description: "Complete 10 study sessions after 10 PM",
      icon: FaFire,
      completed: false,
      progress: 4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-text-primary">Your Activity</h3>
          <p className="text-sm text-text-secondary">Track your daily study patterns and consistency over time</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-text-secondary">Show:</label>
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value as "sessions" | "duration" | "tasks")}
            className="rounded-lg border border-border-medium bg-background-primary px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
          >
            <option value="sessions">Study Sessions</option>
            <option value="duration">Study Duration</option>
            <option value="tasks">Tasks Completed</option>
          </select>
        </div>
      </div>

      {/* Activity Heat Map */}
      <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Hour labels */}
            <div className="mb-2 flex">
              <div className="w-12"></div>
              {hours.map(hour => (
                <div key={hour} className="flex-1 text-center text-xs text-text-secondary">
                  {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                </div>
              ))}
            </div>

            {/* Heat map grid */}
            {heatMapData && heatMapData.length > 0 ? (
              days.map((day, dayIndex) => (
                <div key={day} className="mb-1 flex items-center">
                  <div className="w-12 pr-2 text-right text-sm font-medium text-text-secondary">{day}</div>
                  {hours.map(hour => {
                    const intensity = heatMapData[dayIndex]?.[hour] || 0;
                    const normalizedIntensity = maxIntensity > 0 ? intensity / maxIntensity : 0;

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`group relative mx-0.5 h-8 flex-1 cursor-pointer rounded-sm transition-all duration-200 hover:z-10 hover:scale-110 ${getIntensityColor(
                          normalizedIntensity
                        )}`}
                        title={`${day} ${hour}:00 - ${getIntensityLabel(normalizedIntensity)}`}
                      >
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {day} {hour}:00
                          <br />
                          {Math.round(intensity * 10)} {getMetricLabel()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-secondary">Loading activity data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between border-t border-border-light pt-4">
          <div className="flex items-center space-x-2">
            <FaInfoCircle className="h-4 w-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">Less</span>
          </div>

          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
            <div className="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-900/30"></div>
            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-800/50"></div>
            <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-700/60"></div>
            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-600/70"></div>
            <div className="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-500/80"></div>
          </div>

          <span className="text-sm text-text-secondary">More</span>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
        <h4 className="mb-4 text-lg font-semibold text-text-primary">Achievements</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map(achievement => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`relative rounded-lg border p-4 transition-all duration-200 ${
                  achievement.completed
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-border-light bg-background-secondary"
                }`}
              >
                {achievement.completed && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1">
                    <FaTrophy className="h-3 w-3 text-white" />
                  </div>
                )}

                <div className="mb-3 flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-2 ${
                      achievement.completed ? "bg-green-100 dark:bg-green-800" : "bg-background-tertiary"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        achievement.completed ? "text-green-600 dark:text-green-400" : "text-text-secondary"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-text-primary">{achievement.title}</h5>
                    <p className="text-sm text-text-secondary">{achievement.description}</p>
                  </div>
                </div>

                {achievement.completed ? (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Unlocked on {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>Progress</span>
                      <span>{achievement.progress}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border-light">
                      <div
                        className="h-1.5 rounded-full bg-accent-orange transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <FaTasks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-secondary">Total Sessions</h4>
              <p className="text-2xl font-bold text-text-primary">67</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <FaClock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-secondary">Total Time</h4>
              <p className="text-2xl font-bold text-text-primary">42h 15m</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <FaFire className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-secondary">Current Streak</h4>
              <p className="text-2xl font-bold text-text-primary">7 days</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <FaTrophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-secondary">Achievements</h4>
              <p className="text-2xl font-bold text-text-primary">4/6</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
