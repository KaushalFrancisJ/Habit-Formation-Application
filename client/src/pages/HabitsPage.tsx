import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHabits, createHabit, deleteHabit, completeHabit, updateHabit } from '../api/habits.ts';
import type { Habit, HabitStatus } from '../types/index.ts';
import { Spinner } from '../components/Spinner.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { HabitForm } from '../components/HabitForm.tsx';

const STATUS_TABS: HabitStatus[] = ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

const difficultyColor: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
};

export const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [status, setStatus] = useState<HabitStatus>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = (s: HabitStatus) => {
    setLoading(true);
    setError('');
    getHabits(s)
      .then(setHabits)
      .catch(() => setError('Failed to load habits'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(status); }, [status]);

  const handleCreate = async (data: Parameters<typeof createHabit>[0]) => {
    await createHabit(data);
    setShowForm(false);
    load(status);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this habit?')) return;
    await deleteHabit(id);
    load(status);
  };

  const handleComplete = async (id: number) => {
    try {
      await completeHabit(id, new Date().toISOString());
      load(status);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to complete habit');
    }
  };

  const handleStatusChange = async (id: number, newStatus: HabitStatus) => {
    await updateHabit(id, { status: newStatus });
    load(status);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Habits</h2>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New Habit
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create Habit</h3>
            <HabitForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {loading ? <Spinner /> : habits.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">No {status.toLowerCase()} habits.</p>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <div key={h.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/habits/${h.id}`} className="font-medium text-gray-800 hover:text-indigo-600">
                      {h.habit_t.title}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[h.habit_t.difficulty_level]}`}>
                      {h.habit_t.difficulty_level}
                    </span>
                  </div>
                  {h.habit_t.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{h.habit_t.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {h.frequency_type === 'DAILY' ? 'Daily' : `${h.target_frequency}x/week`} · 🔥 {h.current_streak_count} streak
                  </p>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  {h.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => handleComplete(h.id)}
                        className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-100">
                        ✓ Done
                      </button>
                      <button onClick={() => handleStatusChange(h.id, 'PAUSED')}
                        className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-lg hover:bg-yellow-100">
                        Pause
                      </button>
                      <button onClick={() => handleStatusChange(h.id, 'ARCHIVED')}
                        className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100">
                        Archive
                      </button>
                    </>
                  )}
                  {h.status === 'PAUSED' && (
                    <button onClick={() => handleStatusChange(h.id, 'ACTIVE')}
                      className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-100">
                      Resume
                    </button>
                  )}
                  <Link to={`/habits/${h.id}/edit`}
                    className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(h.id)}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-100">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
