import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const schema = z.object({
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  duration_minutes: z.coerce.number().int().positive('Duration must be positive'),
  word_count: z.coerce.number().int().min(0, 'Word count cannot be negative'),
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 500,
  color: '#374151',
  fontSize: '14px',
};

export function SessionForm({ onSubmit, isLoading }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      session_date: today,
      duration_minutes: undefined,
      word_count: undefined,
      topic: '',
    },
  });

  async function handleFormSubmit(data: FormData) {
    await onSubmit(data);
    reset({ session_date: today });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <label style={labelStyle} htmlFor="session_date">Session Date</label>
        <input
          id="session_date"
          type="date"
          max={today}
          style={inputStyle}
          {...register('session_date')}
        />
        {errors.session_date && (
          <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.session_date.message}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle} htmlFor="duration_minutes">Duration (minutes)</label>
          <input
            id="duration_minutes"
            type="number"
            min="1"
            placeholder="e.g. 30"
            style={inputStyle}
            {...register('duration_minutes')}
          />
          {errors.duration_minutes && (
            <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.duration_minutes.message}</span>
          )}
        </div>

        <div>
          <label style={labelStyle} htmlFor="word_count">Word Count</label>
          <input
            id="word_count"
            type="number"
            min="0"
            placeholder="e.g. 500"
            style={inputStyle}
            {...register('word_count')}
          />
          {errors.word_count && (
            <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.word_count.message}</span>
          )}
        </div>
      </div>

      <div>
        <label style={labelStyle} htmlFor="topic">Topic / What you worked on</label>
        <input
          id="topic"
          type="text"
          placeholder="e.g. Chapter 3, short story, blog post..."
          style={inputStyle}
          {...register('topic')}
        />
        {errors.topic && (
          <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.topic.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: '12px',
          backgroundColor: isLoading ? '#a78bfa' : '#7c3aed',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {isLoading ? 'Logging...' : 'Log Session'}
      </button>
    </form>
  );
}
