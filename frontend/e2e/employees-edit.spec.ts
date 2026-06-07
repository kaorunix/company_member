import { test, expect } from './fixtures';

test.describe('社員編集', () => {

  test('E2E-EDT-001: 編集画面に現在値が入っている', async ({ page }) => {
    // シードデータ社員 (id=1: 山田 太郎) に直接アクセス
    await page.goto('/employees/1');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '山田 太郎' })).toBeVisible();

    await page.getByRole('button', { name: '編集' }).click();
    await page.waitForURL(/\/employees\/1\/edit/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 氏名フィールドに既存データが入っていることを確認
    await expect(page.locator('input[name="name_kanji"]')).toHaveValue('山田 太郎');
    await expect(page.locator('input[name="department"]')).toHaveValue('開発部');
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-EDT-001.png' });
  });

  test('E2E-EDT-002: 部署を変更して保存できる', async ({ page }) => {
    await page.goto('/employees/3');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '佐藤 次郎' })).toBeVisible();

    await page.getByRole('button', { name: '編集' }).click();
    await page.waitForURL(/\/employees\/3\/edit/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="department"]').fill('E2E更新部署');
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-EDT-002_before.png' });
    await page.getByRole('button', { name: '保存' }).click();

    await page.waitForURL(/\/employees\/3$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('E2E更新部署')).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-EDT-002_after.png' });
  });

  test('E2E-EDT-003: TSVペーストで編集フォームを上書きできる', async ({ page }) => {
    await page.goto('/employees/1/edit');
    await page.waitForLoadState('networkidle');
    // フォームがロードされるまで待機（SWR）
    await page.waitForSelector('input[name="name_kanji"]');

    const tsv = '0001\tTSV更新 太郎\tつしぶい たろう\tT.TSV\tT.TSV\ttsv.update@example.com\tTSV部署\t主任\t在籍';
    await page.locator('textarea').fill(tsv);
    await page.getByRole('button', { name: 'フォームに反映' }).click();

    await expect(page.locator('input[name="name_kanji"]')).toHaveValue('TSV更新 太郎');
    await expect(page.locator('input[name="department"]')).toHaveValue('TSV部署');
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-EDT-003.png' });
  });
});
