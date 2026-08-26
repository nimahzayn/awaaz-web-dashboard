"use server";

import sql from "@/lib/db";
import type { Workshop } from "@/types";

export async function getWorkshops(): Promise<Workshop[]> {
  const rows = await sql`
    SELECT * FROM workshops ORDER BY created_at DESC
  `;
  return rows.map(rowToWorkshop);
}

export async function getWorkshop(id: string): Promise<Workshop | null> {
  const rows = await sql`SELECT * FROM workshops WHERE id = ${id}`;
  return rows.length > 0 ? rowToWorkshop(rows[0]) : null;
}

export async function createWorkshop(data: {
  name: string;
  cohort: string;
  location: string;
  date: string;
  description: string;
}): Promise<Workshop> {
  const id = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rows = await sql`
    INSERT INTO workshops (id, name, cohort, location, date, description)
    VALUES (${id}, ${data.name}, ${data.cohort}, ${data.location}, ${data.date}, ${data.description})
    RETURNING *
  `;
  return rowToWorkshop(rows[0]);
}

export async function deleteWorkshop(id: string): Promise<boolean> {
  const before = await sql`SELECT 1 FROM workshops WHERE id = ${id}`;
  if (before.length === 0) return false;
  await sql`DELETE FROM workshops WHERE id = ${id}`;
  return true;
}

export async function updateWorkshop(
  id: string,
  updates: Partial<Pick<Workshop, "name" | "cohort" | "location" | "date" | "description">>
): Promise<Workshop | null> {
  const fields: [string, string][] = [];
  if (updates.name !== undefined) fields.push(["name", updates.name]);
  if (updates.cohort !== undefined) fields.push(["cohort", updates.cohort]);
  if (updates.location !== undefined) fields.push(["location", updates.location]);
  if (updates.date !== undefined) fields.push(["date", updates.date]);
  if (updates.description !== undefined) fields.push(["description", updates.description]);

  if (fields.length === 0) return getWorkshop(id);

  const setClauses = fields.map(([col], i) => `${col} = $${i + 1}`).join(", ");
  const values = fields.map(([, v]) => v);
  values.push(id);

  const result = await sql.query(
    `UPDATE workshops SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`,
    values
  );
  const rows = (result as any).rows ?? result;
  return rows.length > 0 ? rowToWorkshop(rows[0]) : null;
}

export async function updateWorkshopStatus(
  id: string,
  status: Workshop["status"],
  extra?: Partial<Workshop>
): Promise<void> {
  const sets: string[] = ["status = $1"];
  const values: any[] = [status];
  let idx = 2;

  if (extra?.aUploadedAt !== undefined) { sets.push(`a_uploaded_at = $${idx++}`); values.push(extra.aUploadedAt); }
  if (extra?.bUploadedAt !== undefined) { sets.push(`b_uploaded_at = $${idx++}`); values.push(extra.bUploadedAt); }
  if (extra?.cUploadedAt !== undefined) { sets.push(`c_uploaded_at = $${idx++}`); values.push(extra.cUploadedAt); }
  if (extra?.analyzedAt !== undefined) { sets.push(`analyzed_at = $${idx++}`); values.push(extra.analyzedAt); }
  if (extra?.aCount !== undefined) { sets.push(`a_count = $${idx++}`); values.push(extra.aCount); }
  if (extra?.bCount !== undefined) { sets.push(`b_count = $${idx++}`); values.push(extra.bCount); }
  if (extra?.cCount !== undefined) { sets.push(`c_count = $${idx++}`); values.push(extra.cCount); }
  if (extra?.matchedCount !== undefined) { sets.push(`matched_count = $${idx++}`); values.push(extra.matchedCount); }

  values.push(id);
  await sql.query(
    `UPDATE workshops SET ${sets.join(", ")} WHERE id = $${idx}`,
    values
  );
}

function stageColumn(stage: "a" | "b" | "c"): string {
  return `form_${stage}_data`;
}

export async function saveFormData(id: string, stage: "a" | "b" | "c", data: Record<string, any>[], headers: Record<string, string>): Promise<void> {
  const col = stageColumn(stage);
  const payload = JSON.stringify({ headers, rows: data });
  await sql.query(`UPDATE workshops SET ${col} = $1::jsonb WHERE id = $2`, [payload, id]);
}

async function getFormDataRaw(id: string, stage: "a" | "b" | "c"): Promise<{ headers: Record<string, string>; rows: Record<string, any>[] } | null> {
  const col = stageColumn(stage);
  const result = await sql.query(`SELECT ${col} AS data FROM workshops WHERE id = $1`, [id]);
  const rows = (result as any).rows ?? result;
  if (!rows[0]?.data) return null;
  const parsed = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  return { headers: parsed.headers ?? {}, rows: parsed.rows ?? [] };
}

export async function saveDimensionMap(id: string, dimensions: any[]): Promise<void> {
  await sql.query(`UPDATE workshops SET dimension_map = $1::jsonb WHERE id = $2`, [JSON.stringify(dimensions), id]);
}

export async function getDimensionMap(id: string): Promise<any[] | null> {
  const rows = await sql`SELECT dimension_map FROM workshops WHERE id = ${id}`;
  if (!rows[0]?.dimension_map) return null;
  return typeof rows[0].dimension_map === "string" ? JSON.parse(rows[0].dimension_map) : rows[0].dimension_map;
}

export async function saveParticipantRecords(id: string, records: Array<{ participantId: string; name: string | null; answers: any }>): Promise<void> {
  await sql`DELETE FROM survey_responses WHERE workshop_id = ${id}`;
  for (const r of records) {
    await sql`
      INSERT INTO survey_responses (workshop_id, participant_id, name, answers)
      VALUES (${id}, ${r.participantId}, ${r.name}, ${JSON.stringify(r.answers)}::jsonb)
      ON CONFLICT (workshop_id, participant_id) DO UPDATE SET answers = ${JSON.stringify(r.answers)}::jsonb
    `;
  }
}

export async function getParticipantRecords(id: string): Promise<Array<{ participantId: string; name: string | null; answers: any }>> {
  const rows = await sql`SELECT participant_id, name, answers FROM survey_responses WHERE workshop_id = ${id}`;
  return rows.map((r) => ({
    participantId: r.participant_id,
    name: r.name ?? null,
    answers: typeof r.answers === "string" ? JSON.parse(r.answers) : r.answers,
  }));
}

export async function saveAnalytics(id: string, data: any): Promise<void> {
  await sql`
    INSERT INTO workshop_analytics (workshop_id, data, generated_at)
    VALUES (${id}, ${JSON.stringify(data)}::jsonb, NOW())
    ON CONFLICT (workshop_id) DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, generated_at = NOW()
  `;
}

export async function getAnalytics(id: string): Promise<any | null> {
  const rows = await sql`SELECT data FROM workshop_analytics WHERE workshop_id = ${id}`;
  if (!rows[0]?.data) return null;
  return typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
}

export async function getFormData(id: string, stage: "a" | "b" | "c") {
  return getFormDataRaw(id, stage);
}

export async function workshopHasData(id: string): Promise<{
  a: boolean;
  b: boolean;
  c: boolean;
  analysis: boolean;
  aCount: number;
  bCount: number;
  cCount: number;
  matchedCount: number;
}> {
  const rows = await sql`
    SELECT a_count, b_count, c_count, matched_count, form_a_data, form_b_data, form_c_data,
           EXISTS(SELECT 1 FROM workshop_analytics WHERE workshop_id = ${id}) AS analysis
    FROM workshops WHERE id = ${id}
  `;
  if (!rows[0]) {
    return { a: false, b: false, c: false, analysis: false, aCount: 0, bCount: 0, cCount: 0, matchedCount: 0 };
  }
  const r = rows[0];
  return {
    a: !!r.form_a_data,
    b: !!r.form_b_data,
    c: !!r.form_c_data,
    analysis: !!r.analysis,
    aCount: r.a_count ?? 0,
    bCount: r.b_count ?? 0,
    cCount: r.c_count ?? 0,
    matchedCount: r.matched_count ?? 0,
  };
}

function rowToWorkshop(row: any): Workshop {
  return {
    id: row.id,
    name: row.name,
    cohort: row.cohort,
    location: row.location,
    date: row.date,
    description: row.description ?? "",
    status: row.status,
    aUploadedAt: row.a_uploaded_at ?? null,
    bUploadedAt: row.b_uploaded_at ?? null,
    cUploadedAt: row.c_uploaded_at ?? null,
    analyzedAt: row.analyzed_at ?? null,
    aCount: row.a_count ?? 0,
    bCount: row.b_count ?? 0,
    cCount: row.c_count ?? 0,
    matchedCount: row.matched_count ?? 0,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at ?? new Date().toISOString(),
  };
}
