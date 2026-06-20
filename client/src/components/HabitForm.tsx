import { useState } from 'react';
import type { DifficultyLevel, FrequencyType } from '../types/index.ts';
import { ErrorMessage } from './ErrorMessage.tsx';

export interface HabitFormInitial {
  title?: string;
  description?: string;
  estimated_duration_minutes?: number;
  difficulty_level?: DifficultyLevel;
  frequency_type?: FrequencyType;
  target_frequency?: number;
  grace_period_hours?: number;
}

interface HabitFormProps {
  initial?: HabitFormInitial;
  onSubmit: (data: {
    title: string;
    description?: string;
    estimated_duration_minutes?: number;
    difficulty_level: DifficultyLevel;
    frequency_type: FrequencyType;
    target_frequency: number;
    grace_period_hours?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export const HabitForm = ({ initial, onSubmit, onCancel }: HabitFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initial?.difficulty_level ?? 'EASY');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initial?.frequency_type ?? 'DAILY');
  const [targetFrequency, setTargetFrequency] = useState(initial?.target_frequency ?? 1);
  const [duration, setDuration] = useState(initial?.estimated_duration_minutes ?? '');
  const [gracePeriod, setGracePeriod] = useState(initial?.grace_period_hours ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        difficulty_level: difficulty,
        frequency_type: frequencyType,
        target_frequency: targetFrequency,
        estimated_duration_minutes: duration ? Number(duration) : undefined,
        grace_period_hours: gracePeriod !== '' ? Number(gracePeriod) : undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <div>
        <label className={labelCls}>Title *</label>
        <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Practice Guitar" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Difficulty</label>
          <select className={inputCls} value={difficulty} onChange={e => setDifficulty(e.target.value as DifficultyLevel)}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Frequency</label>
          <select className={inputCls} value={frequencyType} onChange={e => { setFrequencyType(e.target.value as FrequencyType); setTargetFrequency(1); }}>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>
      </div>
      {frequencyType === 'WEEKLY' && (
        <div>
          <label className={labelCls}>Times per week</label>
          <input type="number" min={1} max={7} className={inputCls} value={targetFrequency} onChange={e => setTargetFrequency(Number(e.target.value))} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Est. Duration (min)</label>
          <input type="number" min={1} className={inputCls} value={duration} onChange={e => setDuration(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className={labelCls}>Grace Period (hours)</label>
          <input type="number" min={0} className={inputCls} value={gracePeriod} onChange={e => setGracePeriod(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
};
