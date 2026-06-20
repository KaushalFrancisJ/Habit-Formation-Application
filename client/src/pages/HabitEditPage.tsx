import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabit, updateHabit } from '../api/habits.ts';
import type { HabitWithStats } from '../types/index.ts';
import { HabitForm } from '../components/HabitForm.tsx';
import type { HabitFormInitial } from '../components/HabitForm.tsx';
import { Spinner } from '../components/Spinner.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';

export const HabitEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<HabitWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getHabit(Number(id))
      .then(setData)
      .catch(() => setError('Failed to load habit'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (input: HabitFormInitial) => {
    await updateHabit(Number(id), input);
    navigate(`/habits/${id}`);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Habit</h2>
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <HabitForm
          initial={{
            title: data.userHabit.habit_t.title,
            description: data.userHabit.habit_t.description ?? undefined,
            estimated_duration_minutes: data.userHabit.habit_t.estimated_duration_minutes ?? undefined,
            difficulty_level: data.userHabit.habit_t.difficulty_level,
            frequency_type: data.userHabit.frequency_type,
            target_frequency: data.userHabit.target_frequency,
            grace_period_hours: data.userHabit.grace_period_hours ?? undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/habits/${id}`)}
        />
      </div>
    </div>
  );
};
