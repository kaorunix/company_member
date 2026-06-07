import { test, expect } from './fixtures';

test.describe('人事履歴', () => {

  test('E2E-HST-001: 人事履歴リストが表示される', async ({ page }) => {
    await page.goto('/employees/1');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: '人事履歴' })).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-001.png' });
  });

  test('E2E-HST-002: 休職イベントを登録するとアカウント状態が変わる', async ({ page }) => {
    await page.goto('/employees/1');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-status="active"]')).toBeVisible();

    await page.getByRole('button', { name: '人事イベント追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-002_modal.png' });

    await page.locator('select[name="event_type"]').selectOption('on_leave');
    await page.locator('input[name="event_date"]').fill('2026-04-23');
    await page.getByRole('button', { name: '保存' }).click();

    // モーダルが閉じるまで待機
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    // SWR再フェッチを待機してからバッジ確認
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-status="on_leave"]')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-002_after.png' });
  });

  test('E2E-HST-004: 復職イベントを登録するとアカウント状態が在籍に戻る', async ({ page }) => {
    await page.goto('/employees/2');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-status="on_leave"]')).toBeVisible();

    await page.getByRole('button', { name: '人事イベント追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('select[name="event_type"]').selectOption('returned');
    await page.locator('input[name="event_date"]').fill('2026-04-23');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-status="active"]')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-004_after.png' });
  });

  test('E2E-HST-003: 退職イベントを登録するとアカウント状態が退職済に変わる', async ({ page }) => {
    await page.goto('/employees/3');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '人事イベント追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-003_modal.png' });

    const eventSelect = page.locator('select[name="event_type"]');
    await eventSelect.selectOption('retired');
    // React再レンダリング（異動フィールド消去）後の安定を待つ
    await expect(eventSelect).toHaveValue('retired');

    await page.locator('input[name="event_date"]').fill('2026-04-23');
    // 日付フォーカスを外してバリデーション確定
    await page.locator('input[name="event_date"]').blur();
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-status="retired"]')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-003_after.png' });
  });

  test('E2E-HST-006: キャンセルするとモーダルが閉じる', async ({ page }) => {
    await page.goto('/employees/1');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '人事イベント追加' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'キャンセル' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-HST-006.png' });
  });
});
