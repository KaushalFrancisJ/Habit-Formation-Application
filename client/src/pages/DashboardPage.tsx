import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboard } from '../api/habits.ts';
import type { DashboardSummary } from '../types/index.ts';
import { Spinner } from '../components/Spinner.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const chartData = data.habits.map((h) => ({
    name: `#${h.userHabitId}`,
    completed: h.weeklyProgress.completed,
    target: h.weeklyProgress.target,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Habits', value: data.totalActiveHabits },
          { label: 'Done Today', value: data.completedToday },
          { label: 'Weekly %', value: `${data.completionPercentage}%` },
          { label: 'Missed', value: data.habits.reduce((s, h) => s + h.missedCount, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly progress chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.completed >= entry.target ? '#6366f1' : '#a5b4fc'} />
                ))}
              </Bar>
              <Bar dataKey="target" name="Target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-habit streaks */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Habit Streaks</h3>
        {data.habits.length === 0 ? (
          <p className="text-sm text-gray-400">No active habits. <Link to="/habits" className="text-indigo-600 hover:underline">Create one</Link></p>
        ) : (
          <div className="space-y-3">
            {data.habits.map((h) => {
              const pct = Math.min(100, Math.round((h.weeklyProgress.completed / h.weeklyProgress.target) * 100));
              return (
                <div key={h.userHabitId}>
                  <div className="flex justify-between text-sm mb-1">
                    <Link to={`/habits/${h.userHabitId}`} className="text-gray-700 hover:text-indigo-600">
                      Habit #{h.userHabitId}
                      {h.completedToday && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done today</span>}
                    </Link>
                    <span className="text-gray-500">🔥 {h.currentStreak} streak</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{h.weeklyProgress.completed}/{h.weeklyProgress.target} this week · {h.missedCount} missed</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
