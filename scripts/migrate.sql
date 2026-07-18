CREATE TABLE IF NOT EXISTS workshops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cohort TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  pre_uploaded_at TIMESTAMPTZ,
  post_uploaded_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  pre_count INT NOT NULL DEFAULT 0,
  post_count INT NOT NULL DEFAULT 0,
  matched_count INT NOT NULL DEFAULT 0,
  pre_data JSONB,
  post_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  pre JSONB NOT NULL,
  post JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_workshop ON survey_responses(workshop_id);

CREATE TABLE IF NOT EXISTS workshop_analytics (
  workshop_id TEXT PRIMARY KEY REFERENCES workshops(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
