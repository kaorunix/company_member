import { test, expect } from './fixtures';

test.describe('フィルタ機能', () => {

  test('E2E-FLT-001: 氏名（漢字）でフィルタできる', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('氏名で検索').fill('山田');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('cell', { name: '山田 太郎' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '鈴木 花子' })).not.toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-001.png' });
  });

  test('E2E-FLT-004: 部署でフィルタできる', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('部署で検索').fill('開発');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    const rows = page.locator('tbody tr').filter({ hasText: '開発' });
    await expect(rows.first()).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-004.png' });
  });

  test('E2E-FLT-005: 状態フィルタ（在籍）で在籍のみ表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('select').selectOption('active');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-status="on_leave"]')).not.toBeVisible();
    await expect(page.locator('[data-status="active"]').first()).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-005.png' });
  });

  test('E2E-FLT-006: 状態フィルタ（休職中）で休職中のみ表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('select').selectOption('on_leave');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-status="on_leave"]').first()).toBeVisible();
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-006.png' });
  });

  test('E2E-FLT-007: フィルタクリアで全件表示に戻る', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('氏名で検索').fill('田中');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    // クリアして再検索
    await page.getByPlaceholder('氏名で検索').fill('');
    await page.getByRole('button', { name: '検索' }).click();
    await page.waitForTimeout(300);
    const countText = await page.locator('p.text-sm.text-gray-500').textContent();
    expect(countText).toMatch(/全\d+件/);
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-007.png' });
  });

  test('E2E-FLT-008: 一致なしで0件表示', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('氏名で検索').fill('存在しない名前XYZ');
    await page.getByRole('button', { name: '検索' }).click();
    await expect(page.locator('p.text-sm.text-gray-500')).toHaveText('0件');
    await page.screenshot({ path: '../Docs/05_テスト証跡/04_E2Eテスト/screenshots/E2E-FLT-008.png' });
  });
});
