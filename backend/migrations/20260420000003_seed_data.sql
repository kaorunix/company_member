INSERT INTO employees
    (employee_number, name_kanji, name_kana, name_initial, name_alphabet, email, department, position, account_status)
VALUES
    ('0001', '山田 太郎', 'やまだ たろう', 'T.Yamada', 'T.Yamada', 't.yamada@example.com', '開発部', '部長',   'active'),
    ('0002', '鈴木 花子', 'すずき はなこ', 'H.Suzuki', 'H.Suzuki', 'h.suzuki@example.com', '営業部', '一般',   'on_leave'),
    ('0003', '佐藤 次郎', 'さとう じろう', 'J.Sato',   'J.Sato',   'j.sato@example.com',   '総務部', '主任',   'active'),
    ('0004', '田中 美咲', 'たなか みさき', 'M.Tanaka', 'M.Tanaka', 'm.tanaka@example.com', '開発部', '一般',   'retired');

INSERT INTO personnel_histories
    (employee_id, event_type, event_date, dept_after, position_after, note)
VALUES
    (1, 'hired',   '2020-04-01', '開発部', '一般', '新卒入社'),
    (1, 'promoted','2023-04-01', NULL,     '部長', '昇進'),
    (2, 'hired',   '2021-04-01', '営業部', '一般', '新卒入社'),
    (2, 'on_leave','2025-06-01', NULL,     NULL,   '育児休職'),
    (3, 'hired',   '2019-04-01', '総務部', '一般', '新卒入社'),
    (3, 'promoted','2024-04-01', NULL,     '主任', '昇進'),
    (4, 'hired',   '2018-04-01', '開発部', '一般', '新卒入社'),
    (4, 'retired', '2025-03-31', NULL,     NULL,   '自己都合退職');
