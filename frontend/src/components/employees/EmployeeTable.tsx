'use client';

import type { Employee } from '@/lib/types';
import StatusBadge from '@/components/common/StatusBadge';

interface Props {
  employees: Employee[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (all: Employee[]) => void;
  onRowClick: (id: number) => void;
}

export default function EmployeeTable({
  employees,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
}: Props) {
  const allSelected =
    employees.length > 0 && employees.every(e => selectedIds.has(e.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-8 px-2 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleSelectAll(employees)}
              />
            </th>
            {[
              '社員番号', '氏名（漢字）', '氏名（かな）',
              'イニシャル/AL', '部署', '役職', '状態',
            ].map(h => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {employees.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-400">
                0件
              </td>
            </tr>
          )}
          {employees.map(emp => (
            <tr
              key={emp.id}
              className="cursor-pointer hover:bg-indigo-50"
              onClick={() => onRowClick(emp.id)}
            >
              <td
                className="px-2 py-2"
                onClick={e => { e.stopPropagation(); onToggleSelect(emp.id); }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(emp.id)}
                  onChange={() => {}}
                />
              </td>
              <td className="px-3 py-2 font-mono">{emp.employee_number}</td>
              <td className="px-3 py-2">{emp.name_kanji}</td>
              <td className="px-3 py-2 text-gray-500">{emp.name_kana}</td>
              <td className="px-3 py-2 text-gray-500">
                {[emp.name_initial, emp.name_alphabet]
                  .filter(Boolean)
                  .join(' / ') || '—'}
              </td>
              <td className="px-3 py-2">{emp.department}</td>
              <td className="px-3 py-2">{emp.position}</td>
              <td className="px-3 py-2">
                <StatusBadge status={emp.account_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
