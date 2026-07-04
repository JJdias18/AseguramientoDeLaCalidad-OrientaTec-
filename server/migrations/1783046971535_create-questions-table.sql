-- Up Migration

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  riasec_type CHAR(1) NOT NULL,
  scale_min SMALLINT NOT NULL DEFAULT 1,
  scale_max SMALLINT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT questions_riasec_type_check CHECK (riasec_type IN ('R', 'I', 'A', 'S', 'E', 'C'))
);

CREATE INDEX questions_is_active_idx ON questions (is_active);

-- Down Migration

DROP TABLE IF EXISTS questions;
