'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import type { Employee, ListEmployeesParams } from '@/lib/types';
import { api } from '@/lib/api';
import { copyEmployeesAsTsv } from '@/lib/tsv';
import EmployeeFilterBar from '@/components/employees/EmployeeFilterBar';
import EmployeeTable from '@/components/employees/EmployeeTable';

const fetcher = (params: ListEmployeesParams) => api.employees.list(params);

export default function EmployeeListPage() {
  const router = useRouter();
  const [params, setParams]       = useState<ListEmployeesParams>({ page: 1, per_page: 50 });
  const [committed, setCommitted] = useState<ListEmployeesParams>({ page: 1, per_page: 50 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copyMsg, setCopyMsg] = useState('');

  const { data, isLoading } = useSWR(
    committed,
    fetcher,
    { keepPreviousData: true }
  );

  const handleSearch = useCallback(() => {
    setCommitted({ ...params, page: 1 });
    setSelectedIds(new Set());
  }, [params]);

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = (employees: Employee[]) => {
    const allSelected = employees.every(e => selectedIds.has(e.id));
    setSelectedIds(allSelected ? new Set() : new Set(employees.map(e => e.id)));
  };

  const handleCopy = async () => {
    const selected = (data?.employees ?? []).filter(e => selectedIds.has(e.id));
    if (selected.length === 0) return;
    await copyEmployeesAsTsv(selected);
    setCopyMsg(`${selected.length}件をコピーしました`);
    setTimeout(() => setCopyMsg(''), 2500);
  };

  const total = data?.total ?? 0;
  const page  = committed.page ?? 1;
  const perPage = committed.per_page ?? 50;
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">社員一覧</h2>
        <button
          onClick={() => router.push('/employees/new')}
          className="btn-primary"
        >
          新規登録
        </button>
      </div>

      <EmployeeFilterBar
        params={params}
        onChange={setParams}
        onSearch={handleSearch}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={selectedIds.size === 0}
            className="btn-secondary disabled:opacity-40"
          >
            選択行をTSVコピー
          </button>
          {copyMsg && <span className="text-sm text-green-600">{copyMsg}</span>}
        </div>
        <p className="text-sm text-gray-500">
          {isLoading
            ? '読み込み中...'
            : total === 0
            ? '0件'
            : `全${total}件 / ${start}-${end}表示`}
        </p>
      </div>

      <div className="rounded border border-gray-200 bg-white shadow-sm">
        <EmployeeTable
          employees={data?.employees ?? []}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onRowClick={id => router.push(`/employees/${id}`)}
        />
      </div>

      {/* ページネーション */}
      {total > perPage && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setCommitted(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
            className="btn-secondary disabled:opacity-40"
          >
            前へ
          </button>
          <span className="flex items-center text-sm text-gray-600">
            {page} / {Math.ceil(total / perPage)}
          </span>
          <button
            disabled={end >= total}
            onClick={() => setCommitted(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
            className="btn-secondary disabled:opacity-40"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
