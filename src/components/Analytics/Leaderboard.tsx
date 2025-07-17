import { useState } from "react";
import { FaTrophy, FaMedal, FaAward, FaUser, FaClock, FaTasks, FaFire } from "react-icons/fa";
import { IoTrendingUp, IoTrendingDown } from "react-icons/io5";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  totalStudyTime: number; // in minutes
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  previousRank?: number;
  weeklyStudyTime: number;
  efficiency: number; // percentage
}

interface LeaderboardProps {
  analytics: any;
}

export const Leaderboard = ({ analytics }: LeaderboardProps) => {
  const [sortBy, setSortBy] = useState<"studyTime" | "tasks" | "streak" | "efficiency">("studyTime");
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "monthly">("all");

  // Mock data - replace with real data from analytics
  const users: LeaderboardUser[] = [
    {
      id: "1",
      username: "StudyMaster",
      totalStudyTime: 2450,
      tasksCompleted: 89,
      currentStreak: 23,
      longestStreak: 45,
      rank: 1,
      previousRank: 2,
      weeklyStudyTime: 420,
      efficiency: 94,
    },
    {
      id: "2",
      username: "FocusGuru",
      totalStudyTime: 2380,
      tasksCompleted: 92,
      currentStreak: 18,
      longestStreak: 38,
      rank: 2,
      previousRank: 1,
      weeklyStudyTime: 385,
      efficiency: 91,
    },
    {
      id: "3",
      username: "TaskNinja",
      totalStudyTime: 2290,
      tasksCompleted: 105,
      currentStreak: 15,
      longestStreak: 42,
      rank: 3,
      previousRank: 3,
      weeklyStudyTime: 350,
      efficiency: 88,
    },
    {
      id: "4",
      username: "DeepWork",
      totalStudyTime: 2150,
      tasksCompleted: 78,
      currentStreak: 31,
      longestStreak: 51,
      rank: 4,
      previousRank: 5,
      weeklyStudyTime: 325,
      efficiency: 92,
    },
    {
      id: "5",
      username: "Achiever",
      totalStudyTime: 2020,
      tasksCompleted: 67,
      currentStreak: 12,
      longestStreak: 29,
      rank: 5,
      previousRank: 4,
      weeklyStudyTime: 280,
      efficiency: 85,
    },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <FaMedal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <FaAward className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-text-secondary">#{rank}</span>;
    }
  };

  const getRankChange = (user: LeaderboardUser) => {
    if (!user.previousRank || user.previousRank === user.rank) {
      return <span className="text-text-secondary">-</span>;
    }

    const change = user.previousRank - user.rank;
    if (change > 0) {
      return (
        <div className="flex items-center text-success">
          <IoTrendingUp className="mr-1 h-4 w-4" />
          <span>+{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-error">
          <IoTrendingDown className="mr-1 h-4 w-4" />
          <span>{change}</span>
        </div>
      );
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "studyTime":
        return timeframe === "weekly" ? b.weeklyStudyTime - a.weeklyStudyTime : b.totalStudyTime - a.totalStudyTime;
      case "tasks":
        return b.tasksCompleted - a.tasksCompleted;
      case "streak":
        return b.currentStreak - a.currentStreak;
      case "efficiency":
        return b.efficiency - a.efficiency;
      default:
        return a.rank - b.rank;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {users.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className={`relative overflow-hidden rounded-xl border border-border-light bg-background-primary p-6 shadow-card ${
              index === 0 ? "ring-2 ring-yellow-500 ring-opacity-50" : ""
            }`}
          >
            {index === 0 && (
              <div className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-l from-yellow-500 to-yellow-400 px-3 py-1 text-xs font-bold text-white">
                CHAMPION
              </div>
            )}

            <div className="mb-4 flex items-center space-x-4">
              {getRankIcon(user.rank)}
              <div className="flex-1">
                <h3 className="font-bold text-text-primary">{user.username}</h3>
                <p className="text-sm text-text-secondary">{formatTime(user.totalStudyTime)} total</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <FaTasks className="h-4 w-4 text-blue-500" />
                <span className="text-text-secondary">{user.tasksCompleted} tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaFire className="h-4 w-4 text-orange-500" />
                <span className="text-text-secondary">{user.currentStreak} day streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="ml-2 rounded-lg border border-border-light bg-background-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
            >
              <option value="studyTime">Study Time</option>
              <option value="tasks">Tasks Completed</option>
              <option value="streak">Current Streak</option>
              <option value="efficiency">Efficiency</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary">Timeframe:</label>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as any)}
              className="ml-2 rounded-lg border border-border-light bg-background-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-xl border border-border-light bg-background-primary shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border-light bg-background-secondary">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Rank</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">User</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Study Time</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Tasks</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Streak</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Efficiency</th>
                <th className="px-6 py-4 text-left font-medium text-text-secondary">Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-border-light transition-colors hover:bg-background-secondary ${
                    user.rank <= 3 ? "bg-gradient-to-r from-accent-orange/5 to-transparent" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">{getRankIcon(user.rank)}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-orange to-hover-accent">
                        <FaUser className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-text-primary">{user.username}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FaClock className="h-4 w-4 text-blue-500" />
                      <span className="text-text-primary">
                        {formatTime(timeframe === "weekly" ? user.weeklyStudyTime : user.totalStudyTime)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FaTasks className="h-4 w-4 text-green-500" />
                      <span className="text-text-primary">{user.tasksCompleted}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FaFire className="h-4 w-4 text-orange-500" />
                      <span className="text-text-primary">{user.currentStreak} days</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 rounded-full bg-border-light">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-accent-orange to-hover-accent transition-all duration-300"
                          style={{ width: `${user.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-primary">{user.efficiency}%</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{getRankChange(user)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <h4 className="mb-2 text-sm font-medium text-text-secondary">Total Users</h4>
          <p className="text-2xl font-bold text-text-primary">{users.length}</p>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <h4 className="mb-2 text-sm font-medium text-text-secondary">Average Study Time</h4>
          <p className="text-2xl font-bold text-text-primary">
            {formatTime(Math.round(users.reduce((sum, user) => sum + user.totalStudyTime, 0) / users.length))}
          </p>
        </div>

        <div className="rounded-xl border border-border-light bg-background-primary p-4 shadow-card">
          <h4 className="mb-2 text-sm font-medium text-text-secondary">Highest Streak</h4>
          <p className="text-2xl font-bold text-text-primary">
            {Math.max(...users.map(user => user.longestStreak))} days
          </p>
        </div>
      </div>
    </div>
  );
};
