import { test, expect } from './fixtures';

test.describe('社員登録', () => {

  test('E2E-NEW-001: 正常に社員を登録できる', async ({ page }) => {
    // 一覧から「新規登録」ボタン経由でフォームへ遷移
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '新規登録' }).click();
    await page.waitForURL('/employees/new', { timeout: 15000 });

    await page.locator('input[name="employee_number"]').fill('0091');
    await page.locator('input[name="name_kanji"]').fill('E2E 太郎');
    await page.locator('input[name="name_kana"]').fill('いーつーいー たろう');
    await page.locator('input[name="email"]').fill('e2e.taro91@example.com');
    await page.locator('input[name="department"]').fill('テスト部');
    await page.locator('input[name="position"]').fill('一般');

    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-001_before.png' });
    await page.getByRole('button', { name: '保存' }).click();

    await page.waitForURL(/\/employees\/\d+/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'E2E 太郎' })).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-001_after.png' });
  });

  test('E2E-NEW-002: 社員番号が3桁の場合エラーが表示される', async ({ page }) => {
    await page.goto('/employees/new');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="employee_number"]').fill('001');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText(/4桁/)).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-002.png' });
  });

  test('E2E-NEW-003: メールアドレスが不正な場合エラーが表示される', async ({ page }) => {
    await page.goto('/employees/new');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="employee_number"]').fill('0092');
    await page.locator('input[name="name_kanji"]').fill('テスト 花子');
    await page.locator('input[name="name_kana"]').fill('てすと はなこ');
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('input[name="department"]').fill('開発部');
    await page.locator('input[name="position"]').fill('一般');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText(/メールアドレス/)).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-003.png' });
  });

  test('E2E-NEW-004: 必須フィールドが空の場合エラーが表示される', async ({ page }) => {
    await page.goto('/employees/new');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText(/社員番号は必須/)).toBeVisible();
    await expect(page.getByText(/氏名（漢字）は必須/)).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-004.png' });
  });

  test('E2E-NEW-006: キャンセルで一覧に戻る', async ({ page }) => {
    await page.goto('/employees/new');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'キャンセル' }).click();
    await page.waitForURL('/', { timeout: 10000 });
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-NEW-006.png' });
  });
});
