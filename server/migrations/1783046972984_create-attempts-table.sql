-- Up Migration

CREATE TABLE attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT attempts_status_check CHECK (status IN ('in_progress', 'completed'))
);

CREATE INDEX attempts_user_id_idx ON attempts (user_id);

-- Down Migration

DROP TABLE IF EXISTS attempts;
