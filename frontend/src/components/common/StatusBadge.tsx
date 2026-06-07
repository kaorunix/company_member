import type { AccountStatus } from '@/lib/types';

const BADGE: Record<AccountStatus, { label: string; className: string }> = {
  active:   { label: '在籍',   className: 'bg-green-100  text-green-800' },
  on_leave: { label: '休職中', className: 'bg-yellow-100 text-yellow-800' },
  retired:  { label: '退職済', className: 'bg-gray-100   text-gray-600' },
};

export default function StatusBadge({
  status,
}: {
  status: AccountStatus;
}) {
  const { label, className } = BADGE[status] ?? BADGE.active;
  return (
    <span
      data-status={status}
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
