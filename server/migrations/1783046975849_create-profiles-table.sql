-- Up Migration

CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  attempt_id INTEGER NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  holland_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_user_id_idx ON profiles (user_id);

-- Down Migration

DROP TABLE IF EXISTS profiles;
