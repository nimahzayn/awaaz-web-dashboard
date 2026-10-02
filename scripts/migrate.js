const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const url = match[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

async function run() {
  await sql`ALTER TABLE workshops
    ADD COLUMN IF NOT EXISTS data_config JSONB,
    ADD COLUMN IF NOT EXISTS a_uploaded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS b_uploaded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS c_uploaded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS a_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS b_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS c_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS form_a_data JSONB,
    ADD COLUMN IF NOT EXISTS form_b_data JSONB,
    ADD COLUMN IF NOT EXISTS form_c_data JSONB,
    ADD COLUMN IF NOT EXISTS dimension_map JSONB`;
  console.log("workshops columns updated");

  await sql`ALTER TABLE workshops
    DROP COLUMN IF EXISTS pre_uploaded_at,
    DROP COLUMN IF EXISTS post_uploaded_at,
    DROP COLUMN IF EXISTS pre_count,
    DROP COLUMN IF EXISTS post_count,
    DROP COLUMN IF EXISTS pre_data,
    DROP COLUMN IF EXISTS post_data`;
  console.log("old workshops columns dropped");

  await sql`DROP TABLE IF EXISTS survey_responses CASCADE`;
  await sql`CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id TEXT NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL,
    name TEXT,
    answers JSONB NOT NULL,
    UNIQUE(workshop_id, participant_id)
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_workshop ON survey_responses(workshop_id)`;
  console.log("survey_responses recreated");

  console.log("Migration complete!");
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
