import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabit, completeHabit, getCompletions, deleteHabit } from '../api/habits.ts';
import type { HabitWithStats, HabitCompletion } from '../types/index.ts';
import { Spinner } from '../components/Spinner.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';

export const HabitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<HabitWithStats | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([getHabit(Number(id)), getCompletions(Number(id))])
      .then(([habit, comps]) => { setData(habit); setCompletions(comps); })
      .catch(() => setError('Failed to load habit'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleComplete = async () => {
    if (!id) return;
    setCompleting(true);
    try {
      await completeHabit(Number(id), new Date().toISOString());
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this habit?')) return;
    await deleteHabit(Number(id));
    navigate('/habits');
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const { userHabit, streak, missed } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{userHabit.habit_t.title}</h2>
          {userHabit.habit_t.description && <p className="text-gray-500 text-sm mt-1">{userHabit.habit_t.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => navigate(`/habits/${id}/edit`)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
          <button onClick={handleDelete} className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Streak', value: `🔥 ${streak.current}` },
          { label: 'Longest Streak', value: `🏆 ${streak.longest}` },
          { label: 'Missed', value: `❌ ${missed}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border rounded-xl p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-white border rounded-xl p-4 shadow-sm text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Frequency:</span> {userHabit.frequency_type === 'DAILY' ? 'Daily' : `${userHabit.target_frequency}x per week`}</p>
        <p><span className="font-medium">Difficulty:</span> {userHabit.habit_t.difficulty_level}</p>
        <p><span className="font-medium">Status:</span> {userHabit.status}</p>
        {userHabit.habit_t.estimated_duration_minutes && <p><span className="font-medium">Est. Duration:</span> {userHabit.habit_t.estimated_duration_minutes} min</p>}
      </div>

      {userHabit.status === 'ACTIVE' && (
        <button onClick={handleComplete} disabled={completing} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
          {completing ? 'Logging...' : '✓ Mark as Done'}
        </button>
      )}

      {/* Completion history */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Completion History</h3>
        {completions.length === 0 ? (
          <p className="text-sm text-gray-400">No completions yet.</p>
        ) : (
          <div className="space-y-2">
            {[...completions].reverse().slice(0, 20).map((c) => (
              <div key={c.id} className="bg-white border rounded-lg px-4 py-2 flex justify-between text-sm shadow-sm">
                <span className="text-gray-700">{c.completion_date}</span>
                <span className="text-gray-400">{c.duration_minutes ? `${c.duration_minutes} min` : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
