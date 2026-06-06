CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE account_status AS ENUM ('active', 'on_leave', 'retired');

CREATE TABLE employees (
    id              BIGSERIAL       PRIMARY KEY,
    employee_number CHAR(4)         NOT NULL,
    name_kanji      VARCHAR(100)    NOT NULL,
    name_kana       VARCHAR(100)    NOT NULL,
    name_initial    VARCHAR(50),
    name_alphabet   VARCHAR(100),
    email           VARCHAR(255)    NOT NULL,
    department      VARCHAR(100)    NOT NULL,
    position        VARCHAR(100)    NOT NULL,
    account_status  account_status  NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_employees_number UNIQUE (employee_number),
    CONSTRAINT uq_employees_email  UNIQUE (email),
    CONSTRAINT chk_employee_number CHECK (employee_number ~ '^[0-9]{4}$')
);

CREATE INDEX idx_employees_department     ON employees (department);
CREATE INDEX idx_employees_account_status ON employees (account_status);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
