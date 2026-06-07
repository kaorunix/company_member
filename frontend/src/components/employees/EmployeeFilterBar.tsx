'use client';

import type { ListEmployeesParams } from '@/lib/types';

interface Props {
  params: ListEmployeesParams;
  onChange: (params: ListEmployeesParams) => void;
  onSearch: () => void;
}

const STATUS_OPTIONS = [
  { value: '',         label: '全て' },
  { value: 'active',   label: '在籍' },
  { value: 'on_leave', label: '休職中' },
  { value: 'retired',  label: '退職済' },
];

export default function EmployeeFilterBar({ params, onChange, onSearch }: Props) {
  const set = (key: keyof ListEmployeesParams, val: string) =>
    onChange({ ...params, [key]: val || undefined, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-2 rounded bg-gray-50 p-3">
      <div>
        <label className="block text-xs text-gray-500">氏名</label>
        <input
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          placeholder="氏名で検索"
          value={params.name ?? ''}
          onChange={e => set('name', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">部署</label>
        <input
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          placeholder="部署で検索"
          value={params.department ?? ''}
          onChange={e => set('department', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">役職</label>
        <input
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          placeholder="役職で検索"
          value={params.position ?? ''}
          onChange={e => set('position', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500">状態</label>
        <select
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={params.account_status ?? ''}
          onChange={e => set('account_status', e.target.value)}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onSearch}
        className="rounded bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
      >
        検索
      </button>
    </div>
  );
}
