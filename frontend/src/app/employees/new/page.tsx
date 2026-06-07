'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { EmployeeFormData } from '@/lib/types';
import EmployeeForm from '@/components/employees/EmployeeForm';

export default function NewEmployeePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (data: EmployeeFormData) => {
    setServerError('');
    try {
      const emp = await api.employees.create(data);
      router.push(`/employees/${emp.id}`);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : '登録に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">社員登録</h2>
      {serverError && (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <EmployeeForm
          isNew
          onSubmit={handleSubmit}
          onCancel={() => router.push('/')}
        />
      </div>
    </div>
  );
}
