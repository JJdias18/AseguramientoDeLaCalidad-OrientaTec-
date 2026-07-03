-- Up Migration

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions (id) ON DELETE RESTRICT,
  value SMALLINT NOT NULL CHECK (value > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT answers_attempt_question_unique UNIQUE (attempt_id, question_id)
);

CREATE INDEX answers_attempt_id_idx ON answers (attempt_id);

-- Down Migration

DROP TABLE IF EXISTS answers;
