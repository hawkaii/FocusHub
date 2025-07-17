import { useState, useMemo } from "react";
import { FaClock, FaChartBar, FaDownload } from "react-icons/fa";
import { IoTimeOutline, IoTrendingUp } from "react-icons/io5";
import { useTimeTracking } from "../../store";

interface TimeMetricsProps {
  analytics?: any; // Keep for backwards compatibility but not used
}

export const TimeMetrics = ({}: TimeMetricsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"hour" | "day" | "week" | "month">("day");
  const { sessions, currentSession, getMetrics } = useTimeTracking();

  const metrics = useMemo(() => getMetrics(), [getMetrics, currentSession]);

  // Calculate time slots from real session data
  const timeSlots = useMemo(() => {
    const slots = [
      { period: "00:00 - 06:00", label: "Night", sessions: 0, avgDuration: 0, color: "bg-indigo-500" },
      { period: "06:00 - 12:00", label: "Morning", sessions: 0, avgDuration: 0, color: "bg-blue-500" },
      { period: "12:00 - 18:00", label: "Afternoon", sessions: 0, avgDuration: 0, color: "bg-green-500" },
      { period: "18:00 - 24:00", label: "Evening", sessions: 0, avgDuration: 0, color: "bg-orange-500" },
    ];

    sessions.forEach(session => {
      if (!session.completed) return;
      const hour = new Date(session.startTime).getHours();
      const duration = (session.actualDuration || 0) / 60; // Convert to minutes

      if (hour >= 0 && hour < 6) {
        slots[0].sessions++;
        slots[0].avgDuration += duration;
      } else if (hour >= 6 && hour < 12) {
        slots[1].sessions++;
        slots[1].avgDuration += duration;
      } else if (hour >= 12 && hour < 18) {
        slots[2].sessions++;
        slots[2].avgDuration += duration;
      } else {
        slots[3].sessions++;
        slots[3].avgDuration += duration;
      }
    });

    // Include current session if active
    if (currentSession && currentSession.sessionType === "pomodoro") {
      const hour = new Date(currentSession.startTime).getHours();
      const duration = (currentSession.currentElapsed || 0) / 60; // Convert to minutes

      if (hour >= 0 && hour < 6) {
        slots[0].sessions++;
        slots[0].avgDuration += duration;
      } else if (hour >= 6 && hour < 12) {
        slots[1].sessions++;
        slots[1].avgDuration += duration;
      } else if (hour >= 12 && hour < 18) {
        slots[2].sessions++;
        slots[2].avgDuration += duration;
      } else {
        slots[3].sessions++;
        slots[3].avgDuration += duration;
      }
    }

    // Calculate averages
    slots.forEach(slot => {
      if (slot.sessions > 0) {
        slot.avgDuration = Math.round(slot.avgDuration / slot.sessions);
      }
    });

    return slots;
  }, [sessions, currentSession]);

  // Calculate weekly trends from real data
  const weeklyTrends = useMemo(() => {
    const trends = [
      { day: "Monday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Tuesday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Wednesday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Thursday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Friday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Saturday", sessions: 0, avgDuration: 0, totalTime: 0 },
      { day: "Sunday", sessions: 0, avgDuration: 0, totalTime: 0 },
    ];

    sessions.forEach(session => {
      if (!session.completed) return;
      const dayOfWeek = new Date(session.startTime).getDay();
      const duration = (session.actualDuration || 0) / 60; // Convert to minutes

      trends[dayOfWeek === 0 ? 6 : dayOfWeek - 1].sessions++;
      trends[dayOfWeek === 0 ? 6 : dayOfWeek - 1].totalTime += duration;
    });

    // Calculate averages
    trends.forEach(trend => {
      if (trend.sessions > 0) {
        trend.avgDuration = Math.round(trend.totalTime / trend.sessions);
      }
    });

    return trends;
  }, [sessions]);

  // Find peak time from real data
  const peakTime = useMemo(() => {
    const hourlyActivity = new Array(24).fill(0);
    sessions.forEach(session => {
      if (session.completed) {
        const hour = new Date(session.startTime).getHours();
        hourlyActivity[hour]++;
      }
    });

    const maxActivityIndex = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const maxActivity = hourlyActivity[maxActivityIndex];

    return {
      hour: maxActivityIndex,
      sessions: maxActivity,
      time: `${maxActivityIndex.toString().padStart(2, "0")}:00`,
    };
  }, [sessions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const maxSessions = Math.max(...weeklyTrends.map(d => d.sessions), 1);

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-text-primary">Time-Based Analytics</h3>
          <p className="text-sm text-text-secondary">
            Analyze usage patterns and session durations across different time periods
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {["hour", "day", "week", "month"].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? "bg-accent-orange text-white shadow-md"
                  : "bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Time Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <FaClock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Avg Session</h4>
              <p className="text-sm text-text-secondary">Duration per user</p>
            </div>
          </div>
          <div className="mb-2 text-3xl font-bold text-text-primary">
            {formatDuration(metrics.avgSessionLength / 60)}
          </div>
          <div className="flex items-center space-x-1 text-sm text-success">
            <IoTrendingUp className="h-4 w-4" />
            <span>Productivity: {Math.round(metrics.productivity)}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <IoTimeOutline className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Peak Time</h4>
              <p className="text-sm text-text-secondary">Most active period</p>
            </div>
          </div>
          <div className="mb-2 text-3xl font-bold text-text-primary">{peakTime.time}</div>
          <div className="text-sm text-text-secondary">{peakTime.sessions} sessions</div>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <FaChartBar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Total Time</h4>
              <p className="text-sm text-text-secondary">This period</p>
            </div>
          </div>
          <div className="mb-2 text-3xl font-bold text-text-primary">{formatDuration(metrics.totalFocusTime / 60)}</div>
          <div className="text-sm text-text-secondary">{metrics.sessionsCompleted} total sessions</div>
        </div>
      </div>

      {/* Time Slot Analysis */}
      <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
        <h4 className="mb-6 text-lg font-semibold text-text-primary">Activity by Time of Day</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <div
                  className={`h-24 ${slot.color} relative flex items-end justify-center overflow-hidden rounded-lg p-2`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="z-10 text-lg font-bold text-white">{slot.sessions}</div>
                </div>
              </div>
              <h5 className="mb-1 font-semibold text-text-primary">{slot.label}</h5>
              <p className="mb-1 text-sm text-text-secondary">{slot.period}</p>
              <p className="text-xs text-text-secondary">Avg: {slot.avgDuration}m</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-text-primary">Weekly Usage Trends</h4>
          <button
            onClick={() => {
              // Export weekly trends data
              const csvContent =
                "data:text/csv;charset=utf-8," +
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
            className="flex items-center space-x-2 text-accent-orange transition-colors duration-200 hover:text-hover-accent"
          >
            <FaDownload className="h-4 w-4" />
            <span className="text-sm">Export Data</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Day</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Sessions</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Avg Duration</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Total Time</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">Activity</th>
              </tr>
            </thead>
            <tbody>
              {weeklyTrends.map((day, index) => (
                <tr
                  key={index}
                  className="border-b border-border-light transition-colors duration-200 hover:bg-background-secondary"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{day.day}</td>
                  <td className="px-4 py-3 text-text-primary">{day.sessions}</td>
                  <td className="px-4 py-3 text-text-primary">{day.avgDuration}m</td>
                  <td className="px-4 py-3 text-text-primary">{formatDuration(day.totalTime)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 rounded-full bg-border-light">
                        <div
                          className="h-2 rounded-full bg-accent-orange transition-all duration-300"
                          style={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary">
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
      <div className="rounded-xl border border-border-light bg-background-primary p-6 shadow-card">
        <h4 className="mb-6 text-lg font-semibold text-text-primary">Historical Usage Trends</h4>
        <div className="flex h-64 items-end justify-between space-x-1">
          {Array.from({ length: 30 }, (_, i) => {
            const height = Math.random() * 80 + 20;
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));

            return (
              <div key={i} className="group flex flex-1 flex-col items-center space-y-2">
                <div
                  className="w-full cursor-pointer rounded-t-sm bg-gradient-to-t from-accent-orange to-hover-accent transition-all duration-300 hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${date.toLocaleDateString()}: ${Math.round(height * 5)} sessions`}
                />
                {i % 5 === 0 && (
                  <span className="origin-center -rotate-45 transform text-xs text-text-secondary">
                    {date.getMonth() + 1}/{date.getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
