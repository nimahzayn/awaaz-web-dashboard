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

  if (extra?.preUploadedAt !== undefined) { sets.push(`pre_uploaded_at = $${idx++}`); values.push(extra.preUploadedAt); }
  if (extra?.postUploadedAt !== undefined) { sets.push(`post_uploaded_at = $${idx++}`); values.push(extra.postUploadedAt); }
  if (extra?.analyzedAt !== undefined) { sets.push(`analyzed_at = $${idx++}`); values.push(extra.analyzedAt); }
  if (extra?.preCount !== undefined) { sets.push(`pre_count = $${idx++}`); values.push(extra.preCount); }
  if (extra?.postCount !== undefined) { sets.push(`post_count = $${idx++}`); values.push(extra.postCount); }
  if (extra?.matchedCount !== undefined) { sets.push(`matched_count = $${idx++}`); values.push(extra.matchedCount); }

  values.push(id);
  await sql.query(
    `UPDATE workshops SET ${sets.join(", ")} WHERE id = $${idx}`,
    values
  );
}

export async function savePreData(id: string, data: Record<string, any>[]): Promise<void> {
  await sql`UPDATE workshops SET pre_data = ${JSON.stringify(data)}::jsonb WHERE id = ${id}`;
}

export async function savePostData(id: string, data: Record<string, any>[]): Promise<void> {
  await sql`UPDATE workshops SET post_data = ${JSON.stringify(data)}::jsonb WHERE id = ${id}`;
}

export async function getPreData(id: string): Promise<Record<string, any>[] | null> {
  const rows = await sql`SELECT pre_data FROM workshops WHERE id = ${id}`;
  if (!rows[0]?.pre_data) return null;
  return typeof rows[0].pre_data === "string" ? JSON.parse(rows[0].pre_data) : rows[0].pre_data;
}

export async function getPostData(id: string): Promise<Record<string, any>[] | null> {
  const rows = await sql`SELECT post_data FROM workshops WHERE id = ${id}`;
  if (!rows[0]?.post_data) return null;
  return typeof rows[0].post_data === "string" ? JSON.parse(rows[0].post_data) : rows[0].post_data;
}

export async function saveSurveyResponses(id: string, responses: any[]): Promise<void> {
  await sql`DELETE FROM survey_responses WHERE workshop_id = ${id}`;
  for (const r of responses) {
    await sql`
      INSERT INTO survey_responses (workshop_id, email, pre, post)
      VALUES (${id}, ${r.email}, ${JSON.stringify(r.pre)}::jsonb, ${JSON.stringify(r.post)}::jsonb)
    `;
  }
}

export async function getSurveyResponses(id: string): Promise<any[]> {
  const rows = await sql`SELECT email, pre, post FROM survey_responses WHERE workshop_id = ${id}`;
  return rows.map((r) => ({
    email: r.email,
    pre: typeof r.pre === "string" ? JSON.parse(r.pre) : r.pre,
    post: typeof r.post === "string" ? JSON.parse(r.post) : r.post,
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

export async function workshopHasData(id: string): Promise<{
  pre: boolean;
  post: boolean;
  analysis: boolean;
  preCount: number;
  postCount: number;
  matchedCount: number;
}> {
  const rows = await sql`
    SELECT pre_count, post_count, matched_count, pre_data, post_data,
           EXISTS(SELECT 1 FROM workshop_analytics WHERE workshop_id = ${id}) AS analysis
    FROM workshops WHERE id = ${id}
  `;
  if (!rows[0]) {
    return { pre: false, post: false, analysis: false, preCount: 0, postCount: 0, matchedCount: 0 };
  }
  const r = rows[0];
  return {
    pre: !!r.pre_data,
    post: !!r.post_data,
    analysis: !!r.analysis,
    preCount: r.pre_count ?? 0,
    postCount: r.post_count ?? 0,
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
    preUploadedAt: row.pre_uploaded_at ?? null,
    postUploadedAt: row.post_uploaded_at ?? null,
    analyzedAt: row.analyzed_at ?? null,
    preCount: row.pre_count ?? 0,
    postCount: row.post_count ?? 0,
    matchedCount: row.matched_count ?? 0,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at ?? new Date().toISOString(),
  };
}
