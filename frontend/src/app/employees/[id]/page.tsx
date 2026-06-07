'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import StatusBadge from '@/components/common/StatusBadge';
import PersonnelHistoryList from '@/components/employees/PersonnelHistoryList';
import HistoryModal from '@/components/common/Modal';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const empId   = Number(id);

  const { data: emp, mutate: mutateEmp } = useSWR(
    `employee-${empId}`,
    () => api.employees.get(empId)
  );
  const { data: histories, mutate: mutateHistories } = useSWR(
    `histories-${empId}`,
    () => api.histories.list(empId)
  );

  const [showModal, setShowModal] = useState(false);

  if (!emp) return <p className="text-gray-400">読み込み中...</p>;

  const fields: [string, string | null | undefined][] = [
    ['社員番号',           emp.employee_number],
    ['氏名（漢字）',       emp.name_kanji],
    ['氏名（かな）',       emp.name_kana],
    ['イニシャル',         emp.name_initial],
    ['アルファベット',     emp.name_alphabet],
    ['メールアドレス',     emp.email],
    ['部署',               emp.department],
    ['役職',               emp.position],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="btn-secondary">
          一覧に戻る
        </button>
        <h2 className="text-lg font-semibold">{emp.name_kanji}</h2>
        <StatusBadge status={emp.account_status} />
        <div className="ml-auto">
          <button
            onClick={() => router.push(`/employees/${empId}/edit`)}
            className="btn-primary"
          >
            編集
          </button>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">人事履歴</h3>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-sm"
          >
            人事イベント追加
          </button>
        </div>
        <PersonnelHistoryList histories={histories ?? []} />
      </div>

      {showModal && (
        <HistoryModal
          employeeId={empId}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            mutateEmp();
            mutateHistories();
          }}
        />
      )}
    </div>
  );
}
