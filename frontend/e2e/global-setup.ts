import { execSync } from 'child_process';

export default async function globalSetup() {
  const queries = [
    // E2Eテストで追加された人事履歴を削除
    "DELETE FROM personnel_histories WHERE event_date >= '2026-01-01'",
    // E2Eテストで追加された社員を削除
    "DELETE FROM employees WHERE id NOT IN (1, 2, 3, 4)",
    // 社員1〜3のアカウント状態をシードデータに戻す
    "UPDATE employees SET account_status = 'active' WHERE id = 1",
    "UPDATE employees SET account_status = 'on_leave' WHERE id = 2",
    "UPDATE employees SET account_status = 'active' WHERE id = 3",
    // 社員3の部署をシードデータに戻す
    "UPDATE employees SET department = '総務部' WHERE id = 3",
  ];

  for (const query of queries) {
    execSync(
      `docker exec company_member_db psql -U app_user -d company_member -c "${query}"`,
    );
  }
}
