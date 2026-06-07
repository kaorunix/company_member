'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateHistoryData, EventType } from '@/lib/types';
import { api } from '@/lib/api';

const EVENT_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'hired',       label: '入社' },
  { value: 'transferred', label: '異動' },
  { value: 'promoted',    label: '昇進' },
  { value: 'on_leave',    label: '休職' },
  { value: 'returned',    label: '復職' },
  { value: 'retired',     label: '退職' },
];

interface Props {
  employeeId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HistoryModal({ employeeId, onClose, onSuccess }: Props) {
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } =
    useForm<CreateHistoryData>({
      defaultValues: { event_type: 'transferred' },
    });

  const eventType = watch('event_type');

  const onSubmit = async (data: CreateHistoryData) => {
    setServerError('');
    try {
      await api.histories.create(employeeId, data);
      onSuccess();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : '登録に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div role="dialog" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">人事イベント追加</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">イベント種別</label>
            <select {...register('event_type')} className="input">
              {EVENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">発令日</label>
            <input
              type="date"
              {...register('event_date', { required: '発令日は必須です' })}
              className="input"
            />
            {errors.event_date && (
              <p className="text-xs text-red-600">{errors.event_date.message}</p>
            )}
          </div>

          {(eventType === 'transferred') && (
            <>
              <div>
                <label className="label">異動前部署</label>
                <input {...register('dept_before')} className="input" />
              </div>
              <div>
                <label className="label">異動後部署</label>
                <input {...register('dept_after')} className="input" />
              </div>
            </>
          )}

          {(eventType === 'promoted' || eventType === 'transferred') && (
            <>
              <div>
                <label className="label">変更前役職</label>
                <input {...register('position_before')} className="input" />
              </div>
              <div>
                <label className="label">変更後役職</label>
                <input {...register('position_after')} className="input" />
              </div>
            </>
          )}

          <div>
            <label className="label">備考</label>
            <textarea {...register('note')} className="input" rows={2} />
          </div>

          {serverError && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
