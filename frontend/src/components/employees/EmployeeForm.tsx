'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { EmployeeFormData } from '@/lib/types';
import TsvPasteArea from '@/components/common/TsvPasteArea';

interface Props {
  defaultValues?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isNew?: boolean;
}

const STATUSES = [
  { value: 'active',   label: '在籍' },
  { value: 'on_leave', label: '休職中' },
  { value: 'retired',  label: '退職済' },
];

export default function EmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = '保存',
  isNew = false,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    defaultValues: {
      account_status: 'active',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) reset({ account_status: 'active', ...defaultValues });
  }, [defaultValues, reset]);

  const handleParsed = (data: Partial<EmployeeFormData>) => {
    Object.entries(data).forEach(([k, v]) =>
      setValue(k as keyof EmployeeFormData, v as string)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TsvPasteArea onParsed={handleParsed} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="社員番号" error={errors.employee_number?.message}>
          <input
            {...register('employee_number', {
              required: '社員番号は必須です',
              pattern: { value: /^[0-9]{4}$/, message: '4桁の数字で入力してください' },
            })}
            readOnly={!isNew}
            className={`input ${!isNew ? 'bg-gray-100' : ''}`}
          />
        </Field>

        <Field label="氏名（漢字）" error={errors.name_kanji?.message}>
          <input
            {...register('name_kanji', { required: '氏名（漢字）は必須です' })}
            className="input"
          />
        </Field>

        <Field label="氏名（かな）" error={errors.name_kana?.message}>
          <input
            {...register('name_kana', { required: '氏名（かな）は必須です' })}
            className="input"
          />
        </Field>

        <Field label="イニシャル">
          <input {...register('name_initial')} className="input" placeholder="T.Yamada" />
        </Field>

        <Field label="アルファベット">
          <input {...register('name_alphabet')} className="input" placeholder="T.Yamada" />
        </Field>

        <Field label="メールアドレス" error={errors.email?.message}>
          <input
            {...register('email', {
              required: 'メールアドレスは必須です',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'メールアドレスの形式が正しくありません' },
            })}
            type="email"
            className="input"
          />
        </Field>

        <Field label="部署" error={errors.department?.message}>
          <input
            {...register('department', { required: '部署は必須です' })}
            className="input"
          />
        </Field>

        <Field label="役職" error={errors.position?.message}>
          <input
            {...register('position', { required: '役職は必須です' })}
            className="input"
          />
        </Field>

        <Field label="アカウント状態">
          <select {...register('account_status')} className="input">
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          キャンセル
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
