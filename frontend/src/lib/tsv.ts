import type { AccountStatus, Employee, EmployeeFormData } from './types';

// TSV出力カラム順（ペースト側と一致させる）
const TSV_COLUMNS: (keyof Employee)[] = [
  'employee_number',
  'name_kanji',
  'name_kana',
  'name_initial',
  'name_alphabet',
  'email',
  'department',
  'position',
  'account_status',
];

const TSV_HEADERS = [
  '社員番号',
  '氏名（漢字）',
  '氏名（かな）',
  'イニシャル',
  'アルファベット',
  'メール',
  '部署',
  '役職',
  '状態',
];

const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  active:   '在籍',
  on_leave: '休職中',
  retired:  '退職済',
};

const LABEL_TO_STATUS: Record<string, AccountStatus> = {
  '在籍':   'active',
  '休職中': 'on_leave',
  '退職済': 'retired',
};

// ペースト受け付けカラム順（コピー側と一致）
const PASTE_COLUMNS: (keyof EmployeeFormData)[] = [
  'employee_number',
  'name_kanji',
  'name_kana',
  'name_initial',
  'name_alphabet',
  'email',
  'department',
  'position',
  'account_status',
];

/**
 * 選択した社員リストを TSV 文字列に変換してクリップボードにコピーする
 */
export async function copyEmployeesAsTsv(employees: Employee[]): Promise<void> {
  const header = TSV_HEADERS.join('\t');
  const rows = employees.map(emp =>
    TSV_COLUMNS.map(col => {
      const val = emp[col];
      if (col === 'account_status')
        return ACCOUNT_STATUS_LABEL[val as AccountStatus] ?? '';
      return val ?? '';
    }).join('\t')
  );
  const tsv = [header, ...rows].join('\n');
  await navigator.clipboard.writeText(tsv);
}

/**
 * TSV文字列をパースして EmployeeFormData に変換する（先頭行のみ）
 */
export function parseTsvToFormData(tsv: string): Partial<EmployeeFormData> {
  const firstLine = tsv.trim().split('\n')[0];
  if (!firstLine) return {};
  const values = firstLine.split('\t');
  const result: Partial<EmployeeFormData> = {};
  PASTE_COLUMNS.forEach((key, i) => {
    const raw = values[i]?.trim() ?? '';
    if (!raw) return;
    if (key === 'account_status') {
      result[key] = LABEL_TO_STATUS[raw] ?? 'active';
    } else {
      (result as Record<string, string>)[key] = raw;
    }
  });
  return result;
}
