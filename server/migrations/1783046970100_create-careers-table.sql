-- Up Migration

CREATE TABLE careers (
  id SERIAL PRIMARY KEY,
  area_id INTEGER NOT NULL REFERENCES areas (id) ON DELETE RESTRICT,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  field_of_work VARCHAR(150) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  profile_desc TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX careers_area_id_idx ON careers (area_id);

-- Down Migration

DROP TABLE IF EXISTS careers;
