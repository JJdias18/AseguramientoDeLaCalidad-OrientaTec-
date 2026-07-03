-- Up Migration

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Down Migration

DROP EXTENSION IF EXISTS unaccent;
