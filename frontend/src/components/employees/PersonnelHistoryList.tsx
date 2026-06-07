import type { PersonnelHistory } from '@/lib/types';

const EVENT_LABEL: Record<string, string> = {
  hired:       '入社',
  transferred: '異動',
  promoted:    '昇進',
  on_leave:    '休職',
  returned:    '復職',
  retired:     '退職',
};

export default function PersonnelHistoryList({
  histories,
}: {
  histories: PersonnelHistory[];
}) {
  if (histories.length === 0) {
    return <p className="text-sm text-gray-400">履歴はありません</p>;
  }
  return (
    <ul className="space-y-2">
      {histories.map(h => (
        <li key={h.id} className="flex items-start gap-3 text-sm">
          <span className="w-24 shrink-0 text-gray-400">{h.event_date}</span>
          <span className="w-12 shrink-0 font-semibold text-indigo-700">
            {EVENT_LABEL[h.event_type] ?? h.event_type}
          </span>
          <span className="text-gray-700">
            {h.dept_before && `${h.dept_before} → `}
            {h.dept_after}
            {h.position_before && ` / ${h.position_before} → `}
            {h.position_after}
            {h.note && <span className="ml-2 text-gray-400">({h.note})</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
