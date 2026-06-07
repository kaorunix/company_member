'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { EmployeeFormData } from '@/lib/types';
import EmployeeForm from '@/components/employees/EmployeeForm';

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const empId   = Number(id);

  const { data: emp } = useSWR(
    `employee-edit-${empId}`,
    () => api.employees.get(empId)
  );

  const [serverError, setServerError] = useState('');

  const handleSubmit = async (data: EmployeeFormData) => {
    setServerError('');
    try {
      await api.employees.update(empId, data);
      router.push(`/employees/${empId}`);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : '更新に失敗しました');
    }
  };

  if (!emp) return <p className="text-gray-400">読み込み中...</p>;

  const defaultValues: Partial<EmployeeFormData> = {
    employee_number: emp.employee_number,
    name_kanji:      emp.name_kanji,
    name_kana:       emp.name_kana,
    name_initial:    emp.name_initial ?? '',
    name_alphabet:   emp.name_alphabet ?? '',
    email:           emp.email,
    department:      emp.department,
    position:        emp.position,
    account_status:  emp.account_status,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">社員編集 — {emp.name_kanji}</h2>
      {serverError && (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <EmployeeForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/employees/${empId}`)}
        />
      </div>
    </div>
  );
}
