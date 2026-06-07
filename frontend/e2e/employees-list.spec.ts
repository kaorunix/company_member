import { test, expect } from './fixtures';

test.describe('社員一覧画面', () => {

  test('E2E-LST-001: ページタイトルが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/社員リスト管理/);
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-LST-001.png' });
  });

  test('E2E-LST-002: テーブルの全列が存在する', async ({ page }) => {
    await page.goto('/');
    const headers = ['社員番号', '氏名（漢字）', '氏名（かな）', 'イニシャル/AL', '部署', '役職', '状態'];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-LST-002.png' });
  });

  test('E2E-LST-003: シードデータが表示される', async ({ page }) => {
    await page.goto('/');
    // シードデータに含まれる社員名（migrations/seed）
    await expect(page.getByRole('cell', { name: '山田 太郎' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '鈴木 花子' })).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-LST-003.png' });
  });

  test('E2E-LST-004: アカウント状態バッジが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-status="active"]').first()).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-LST-004.png' });
  });

  test('E2E-LST-005: 新規登録ボタンが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '新規登録' })).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-LST-005.png' });
  });
});
