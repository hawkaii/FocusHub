import { useState, useCallback, useEffect } from "react";
import { ITimeSession, ITimeMetrics, IDailyStats, IWeeklyTrend } from "../interfaces";

const TIME_TRACKING_STORAGE_KEY = "studydesk_time_tracking";

export const useTimeTracking = () => {
  const [sessions, setSessions] = useState<ITimeSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ITimeSession | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);

  useEffect(() => {
    const savedData = localStorage.getItem(TIME_TRACKING_STORAGE_KEY);
    if (savedData) {
      try {
        const { sessions: savedSessions } = JSON.parse(savedData);
        setSessions(
          savedSessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : null,
          }))
        );
      } catch (error) {
        console.error("Error loading time tracking data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(TIME_TRACKING_STORAGE_KEY, JSON.stringify({ sessions }));
    }
  }, [sessions]);

  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  const startSession = useCallback(
    (sessionType: "pomodoro" | "shortBreak" | "longBreak", plannedDuration: number, taskId?: string) => {
      const newSession: ITimeSession = {
        id: generateSessionId(),
        startTime: new Date(),
        endTime: null,
        sessionType,
        plannedDuration,
        actualDuration: null,
        currentElapsed: 0,
        taskId: taskId || null,
        completed: false,
      };
      setCurrentSession(newSession);
      setPausedTime(0);
    },
    []
  );

  const endSession = useCallback(
    (completed: boolean) => {
      if (!currentSession) return;

      const endTime = new Date();
      const actualDuration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000) - pausedTime;

      const completedSession: ITimeSession = {
        ...currentSession,
        endTime,
        actualDuration,
        currentElapsed: actualDuration,
        completed,
      };
      setSessions(prev => [...prev, completedSession]);
      setCurrentSession(null);
      setPausedTime(0);

      return completedSession;
    },
    [currentSession, pausedTime]
  );

  const pauseSession = useCallback(() => {
    if (!currentSession) return;
    // For pause functionality, we'll track paused time
    // This is a simplified implementation - in a real app you might want more sophisticated pause tracking
  }, [currentSession]);

  const resumeSession = useCallback(() => {
    // Resume logic if needed
  }, []);

  const calculateMetrics = useCallback((): ITimeMetrics => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentSessions = sessions.filter(session => session.startTime >= thirtyDaysAgo && session.completed);

    const totalFocusTime = recentSessions
      .filter(session => session.sessionType === "pomodoro")
      .reduce((total, session) => total + (session.actualDuration || 0), 0);

    const totalBreakTime = recentSessions
      .filter(session => session.sessionType !== "pomodoro")
      .reduce((total, session) => total + (session.actualDuration || 0), 0);

    const sessionsCompleted = recentSessions.length;
    const avgSessionLength = sessionsCompleted > 0 ? totalFocusTime / sessionsCompleted : 0;

    // Calculate productivity as percentage of planned vs actual duration
    const productivity =
      recentSessions.length > 0
        ? (recentSessions.reduce((acc, session) => {
            const planned = session.plannedDuration;
            const actual = session.actualDuration || 0;
            return acc + Math.min(actual / planned, 1);
          }, 0) /
            recentSessions.length) *
          100
        : 0;

    // Calculate daily stats
    const dailyStats: { [date: string]: IDailyStats } = {};
    recentSessions.forEach(session => {
      const dateStr = session.startTime.toISOString().split("T")[0];
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          focusTime: 0,
          breakTime: 0,
          sessionsCompleted: 0,
          productivity: 0,
        };
      }

      if (session.sessionType === "pomodoro") {
        dailyStats[dateStr].focusTime += session.actualDuration || 0;
      } else {
        dailyStats[dateStr].breakTime += session.actualDuration || 0;
      }
      dailyStats[dateStr].sessionsCompleted += 1;
    });

    // Calculate productivity for each day
    Object.values(dailyStats).forEach(day => {
      const daySessions = recentSessions.filter(session => session.startTime.toISOString().split("T")[0] === day.date);
      if (daySessions.length > 0) {
        day.productivity =
          (daySessions.reduce((acc, session) => {
            const planned = session.plannedDuration;
            const actual = session.actualDuration || 0;
            return acc + Math.min(actual / planned, 1);
          }, 0) /
            daySessions.length) *
          100;
      }
    });

    // Calculate weekly trends (simplified)
    const weeklyTrends: IWeeklyTrend[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const weekSessions = recentSessions.filter(
        session => session.startTime >= weekStart && session.startTime < weekEnd
      );

      const weekFocusTime = weekSessions
        .filter(session => session.sessionType === "pomodoro")
        .reduce((total, session) => total + (session.actualDuration || 0), 0);

      weeklyTrends.unshift({
        week: `Week ${4 - i}`,
        avgFocusTime: weekFocusTime / 7,
        avgSessions: weekSessions.length / 7,
        productivity:
          weekSessions.length > 0
            ? (weekSessions.reduce((acc, session) => {
                const planned = session.plannedDuration;
                const actual = session.actualDuration || 0;
                return acc + Math.min(actual / planned, 1);
              }, 0) /
                weekSessions.length) *
              100
            : 0,
      });
    }

    return {
      totalFocusTime,
      totalBreakTime,
      sessionsCompleted,
      avgSessionLength,
      productivity,
      dailyStats,
      weeklyTrends,
    };
  }, [sessions]);

  const getDailyStats = useCallback(
    (date: string): IDailyStats => {
      const metrics = calculateMetrics();
      return (
        metrics.dailyStats[date] || {
          date,
          focusTime: 0,
          breakTime: 0,
          sessionsCompleted: 0,
          productivity: 0,
        }
      );
    },
    [calculateMetrics]
  );

  const clearHistory = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
    localStorage.removeItem(TIME_TRACKING_STORAGE_KEY);
  }, []);

  return {
    sessions,
    currentSession,
    metrics: calculateMetrics(),
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    getMetrics: calculateMetrics,
    getDailyStats,
    clearHistory,
  };
};
