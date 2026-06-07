import { parseTsvToFormData } from './tsv';

describe('parseTsvToFormData', () => {
  const fullTsv = '0001\t山田 太郎\tやまだ たろう\tT.Yamada\tT.Yamada\tt.yamada@example.com\t開発部\t部長\t在籍';

  it('UT-TSV-010: 全列ペーストでフィールドにマッピングされる', () => {
    const result = parseTsvToFormData(fullTsv);
    expect(result.employee_number).toBe('0001');
    expect(result.name_kanji).toBe('山田 太郎');
    expect(result.name_kana).toBe('やまだ たろう');
    expect(result.name_initial).toBe('T.Yamada');
    expect(result.email).toBe('t.yamada@example.com');
    expect(result.department).toBe('開発部');
    expect(result.position).toBe('部長');
  });

  it('UT-TSV-011: 状態ラベル「在籍」→ active', () => {
    expect(parseTsvToFormData(fullTsv).account_status).toBe('active');
  });

  it('UT-TSV-012: 状態ラベル「休職中」→ on_leave', () => {
    const tsv = '0001\t山田\tやまだ\t\t\ttest@example.com\t開発部\t主任\t休職中';
    expect(parseTsvToFormData(tsv).account_status).toBe('on_leave');
  });

  it('UT-TSV-013: 状態ラベル「退職済」→ retired', () => {
    const tsv = '0001\t山田\tやまだ\t\t\ttest@example.com\t開発部\t主任\t退職済';
    expect(parseTsvToFormData(tsv).account_status).toBe('retired');
  });

  it('UT-TSV-014: 複数行入力では先頭行のみ', () => {
    const tsv = fullTsv + '\n0002\t鈴木\tすずき\t\t\tother@example.com\t営業部\t一般\t在籍';
    expect(parseTsvToFormData(tsv).employee_number).toBe('0001');
  });

  it('UT-TSV-015: 列数が少なくても存在する列のみマッピング', () => {
    const tsv = '0001\t山田 太郎\tやまだ たろう\tT.Yamada';
    const result = parseTsvToFormData(tsv);
    expect(result.employee_number).toBe('0001');
    expect(result.name_initial).toBe('T.Yamada');
    expect(result.email).toBeUndefined();
  });

  it('UT-TSV-016: 空文字列は空オブジェクトを返す', () => {
    expect(parseTsvToFormData('')).toEqual({});
  });
});
