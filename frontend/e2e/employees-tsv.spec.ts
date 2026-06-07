import { test, expect } from './fixtures';

test.describe('TSV機能', () => {

  test('E2E-TSV-001/002/003: TSVコピーの内容を確認', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // 1行目のチェックボックスをON
    await page.locator('tbody tr:first-child td:first-child input[type="checkbox"]').check();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-TSV-001_checked.png' });

    await page.getByRole('button', { name: '選択行をTSVコピー' }).click();

    // クリップボードの内容を取得して検証
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const lines = clipboardText.split('\n').filter(l => l.trim());
    expect(lines.length).toBeGreaterThanOrEqual(2); // ヘッダ + 1データ行

    const dataColumns = lines[1].split('\t');
    expect(dataColumns.length).toBe(9); // 9列

    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-TSV-001.png' });
  });

  test('E2E-TSV-004/005: TSVペーストでフォームに反映される', async ({ page }) => {
    await page.goto('/employees/new');
    const tsv = '0099\t田中 テスト\tたなか てすと\tT.Tanaka\tT.Tanaka\te2e.test99@example.com\t開発部\t一般\t在籍';

    // ペーストエリアのtextareaにTSVを入力
    await page.locator('textarea').fill(tsv);
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-TSV-004_paste.png' });

    await page.getByRole('button', { name: 'フォームに反映' }).click();

    // フォームフィールドに値が反映されているか確認
    await expect(page.locator('input[name="employee_number"]')).toHaveValue('0099');
    await expect(page.locator('input[name="name_kanji"]')).toHaveValue('田中 テスト');
    await expect(page.locator('input[name="email"]')).toHaveValue('e2e.test99@example.com');
    await expect(page.locator('input[name="department"]')).toHaveValue('開発部');

    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-TSV-005.png' });
  });
});
