CREATE TYPE event_type AS ENUM (
    'hired',
    'transferred',
    'promoted',
    'on_leave',
    'returned',
    'retired'
);

CREATE TABLE personnel_histories (
    id              BIGSERIAL   PRIMARY KEY,
    employee_id     BIGINT      NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    event_type      event_type  NOT NULL,
    event_date      DATE        NOT NULL,
    dept_before     VARCHAR(100),
    dept_after      VARCHAR(100),
    position_before VARCHAR(100),
    position_after  VARCHAR(100),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_personnel_histories_employee_id ON personnel_histories (employee_id);
CREATE INDEX idx_personnel_histories_event_date  ON personnel_histories (event_date DESC);
