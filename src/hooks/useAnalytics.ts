import { useState, useEffect } from "react";
import { useTimeTracking } from "../store";

interface AnalyticsData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  sessionChange: number;
  peakTimes: Array<{
    period: string;
    users: number;
    percentage: number;
  }>;
  newUsers: number;
  returningUsers: number;
  bounceRate: number;
  pagesPerSession: number;
  usageTrends: Array<{
    date: string;
    users: number;
  }>;
  heatMapData: {
    activity: number[][];
    sessions: number[][];
    duration: number[][];
  };
  topRegions: Array<{
    flag: string;
    country: string;
    percentage: number;
    users: string;
  }>;
  totalTime: number;
}

export function useAnalytics(dateRange: "7d" | "30d" | "90d") {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { sessions, currentSession, getMetrics } = useTimeTracking();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      // Get real metrics from time tracking
      const timeMetrics = getMetrics();

      // Convert time tracking data to analytics format
      const realAnalytics: AnalyticsData = convertTimeTrackingToAnalytics(
        timeMetrics,
        sessions,
        dateRange,
        currentSession
      );

      setAnalytics(realAnalytics);
      setLoading(false);
    };

    fetchAnalytics();
  }, [dateRange, sessions, currentSession, getMetrics]);

  const exportData = () => {
    if (!analytics) return;

    const dataToExport = {
      dateRange,
      exportDate: new Date().toISOString(),
      ...analytics,
      rawSessions: sessions,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { analytics, loading, exportData };
}

function convertTimeTrackingToAnalytics(
  timeMetrics: any,
  sessions: any[],
  dateRange: "7d" | "30d" | "90d",
  currentSession?: any
): AnalyticsData {
  const now = new Date();
  const daysBack = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const rangeStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const rangeSessions = sessions.filter(session => new Date(session.startTime) >= rangeStart && session.completed);

  // Include current session data if it exists
  let currentSessionData = 0;
  if (currentSession && currentSession.sessionType === "pomodoro") {
    currentSessionData = currentSession.currentElapsed || 0;
  }

  // Calculate basic metrics including current session
  const totalSessions = rangeSessions.length + (currentSession ? 1 : 0);
  const avgSessionDuration =
    totalSessions > 0 ? Math.round((timeMetrics.totalFocusTime + currentSessionData) / totalSessions) : 0;

  // Generate daily trends from actual data
  const usageTrends = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const dayStats = timeMetrics.dailyStats[dateStr];

    usageTrends.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: dayStats ? dayStats.sessionsCompleted : 0,
    });
  }

  // Generate peak times from session data
  const hourlyActivity = new Array(24).fill(0);
  rangeSessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyActivity[hour]++;
  });

  const maxActivity = Math.max(...hourlyActivity);
  const peakTimes = [
    {
      period: "9:00 AM - 11:00 AM",
      users: hourlyActivity[9] + hourlyActivity[10],
      percentage: maxActivity > 0 ? Math.round(((hourlyActivity[9] + hourlyActivity[10]) / maxActivity) * 100) : 0,
    },
    {
      period: "2:00 PM - 4:00 PM",
      users: hourlyActivity[14] + hourlyActivity[15],
      percentage: maxActivity > 0 ? Math.round(((hourlyActivity[14] + hourlyActivity[15]) / maxActivity) * 100) : 0,
    },
    {
      period: "7:00 PM - 9:00 PM",
      users: hourlyActivity[19] + hourlyActivity[20],
      percentage: maxActivity > 0 ? Math.round(((hourlyActivity[19] + hourlyActivity[20]) / maxActivity) * 100) : 0,
    },
    {
      period: "10:00 PM - 12:00 AM",
      users: hourlyActivity[22] + hourlyActivity[23],
      percentage: maxActivity > 0 ? Math.round(((hourlyActivity[22] + hourlyActivity[23]) / maxActivity) * 100) : 0,
    },
  ];

  // Generate heat map from session data
  const heatMapData = generateHeatMapFromSessions(rangeSessions);

  return {
    dailyActiveUsers: Math.round(totalSessions / daysBack),
    weeklyActiveUsers: totalSessions,
    monthlyActiveUsers: totalSessions,
    avgSessionDuration,
    dailyChange:
      timeMetrics.weeklyTrends.length > 1
        ? Math.round(
            (((timeMetrics.weeklyTrends[0]?.avgSessions || 0) - (timeMetrics.weeklyTrends[1]?.avgSessions || 0)) /
              (timeMetrics.weeklyTrends[1]?.avgSessions || 1)) *
              100
          )
        : 0,
    weeklyChange: Math.round(timeMetrics.productivity - 75), // Mock calculation
    monthlyChange: Math.round(timeMetrics.productivity - 70), // Mock calculation
    sessionChange: rangeSessions.length - rangeSessions.length * 0.9, // Mock calculation
    peakTimes,
    newUsers: Math.round(totalSessions * 0.3), // Mock - assume 30% are new
    returningUsers: Math.round(totalSessions * 0.7), // Mock - assume 70% are returning
    bounceRate: Math.round(100 - timeMetrics.productivity), // Inverse of productivity
    pagesPerSession: 1, // Not applicable for timer app
    usageTrends,
    heatMapData,
    topRegions: [{ flag: "🏠", country: "Local Device", percentage: 100, users: totalSessions.toString() }],
    totalTime: Math.round(timeMetrics.totalFocusTime / 3600), // Convert to hours
  };
}

function generateHeatMapFromSessions(sessions: any[]): {
  activity: number[][];
  sessions: number[][];
  duration: number[][];
} {
  const activity: number[][] = [];
  const sessionsMap: number[][] = [];
  const duration: number[][] = [];

  // Initialize arrays for 7 days x 24 hours
  for (let day = 0; day < 7; day++) {
    activity[day] = new Array(24).fill(0);
    sessionsMap[day] = new Array(24).fill(0);
    duration[day] = new Array(24).fill(0);
  }

  sessions.forEach(session => {
    const date = new Date(session.startTime);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const sessionDuration = session.actualDuration || 0;

    activity[dayOfWeek][hour] += 1;
    sessionsMap[dayOfWeek][hour] += 1;
    duration[dayOfWeek][hour] += sessionDuration;
  });

  // Normalize the data
  const maxActivity = Math.max(...activity.flat());
  const maxDuration = Math.max(...duration.flat());

  return {
    activity: activity.map(day => day.map(hour => (maxActivity > 0 ? hour / maxActivity : 0))),
    sessions: sessionsMap.map(day => day.map(hour => (maxActivity > 0 ? hour / maxActivity : 0))),
    duration: duration.map(day => day.map(hour => (maxDuration > 0 ? hour / maxDuration : 0))),
  };
}
