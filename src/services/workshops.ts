"use server";

import fs from "fs";
import path from "path";
import type { Workshop } from "@/types";
import { readJson, writeJson, fileExists, deleteByPrefix } from "./storage";

const WORKSHOPS_FILE = "workshops.json";
const WORKSHOPS_PREFIX = "workshops/";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "src", "data");

function workshopDir(id: string) {
  const dir = path.join(DATA_DIR, "workshops", id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function readWorkshops(): Promise<Workshop[]> {
  const data = await readJson(WORKSHOPS_FILE);
  return Array.isArray(data) ? data : [];
}

async function writeWorkshops(workshops: Workshop[]) {
  await writeJson(WORKSHOPS_FILE, workshops);
}

export async function getWorkshops(): Promise<Workshop[]> {
  return readWorkshops();
}

export async function getWorkshop(id: string): Promise<Workshop | null> {
  const workshops = await readWorkshops();
  return workshops.find((w) => w.id === id) || null;
}

export async function createWorkshop(data: {
  name: string;
  cohort: string;
  location: string;
  date: string;
  description: string;
}): Promise<Workshop> {
  const workshops = await readWorkshops();
  const id = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const workshop: Workshop = {
    id,
    ...data,
    status: "draft",
    preUploadedAt: null,
    postUploadedAt: null,
    analyzedAt: null,
    preCount: 0,
    postCount: 0,
    matchedCount: 0,
    createdAt: new Date().toISOString(),
  };
  workshops.unshift(workshop);
  await writeWorkshops(workshops);
  workshopDir(id);
  return workshop;
}

export async function deleteWorkshop(id: string): Promise<boolean> {
  const workshops = await readWorkshops();
  const filtered = workshops.filter((w) => w.id !== id);
  if (filtered.length === workshops.length) return false;
  await writeWorkshops(filtered);
  await deleteByPrefix(`${WORKSHOPS_PREFIX}${id}/`);
  return true;
}

export async function updateWorkshop(
  id: string,
  updates: Partial<Pick<Workshop, "name" | "cohort" | "location" | "date" | "description">>
): Promise<Workshop | null> {
  const workshops = await readWorkshops();
  const idx = workshops.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  workshops[idx] = { ...workshops[idx], ...updates };
  await writeWorkshops(workshops);
  return workshops[idx];
}

export async function updateWorkshopStatus(
  id: string,
  status: Workshop["status"],
  extra?: Partial<Workshop>
): Promise<void> {
  const workshops = await readWorkshops();
  const idx = workshops.findIndex((w) => w.id === id);
  if (idx === -1) return;
  workshops[idx] = { ...workshops[idx], status, ...extra };
  await writeWorkshops(workshops);
}

export async function getWorkshopFilePaths(id: string) {
  const base = `${WORKSHOPS_PREFIX}${id}`;
  return {
    preJson: `${base}/pre_responses.json`,
    postJson: `${base}/post_responses.json`,
    mergedJson: `${base}/survey_responses.json`,
    analysisJson: `${base}/analysis.json`,
  };
}

export async function readWorkshopFile(id: string, filename: string): Promise<any> {
  const key = `${WORKSHOPS_PREFIX}${id}/${filename}`;
  const data = await readJson(key);
  return data;
}

export async function writeWorkshopFile(
  id: string,
  filename: string,
  data: any
): Promise<void> {
  const key = `${WORKSHOPS_PREFIX}${id}/${filename}`;
  await writeJson(key, data);
}

export async function workshopHasData(id: string): Promise<{
  pre: boolean;
  post: boolean;
  analysis: boolean;
  preCount: number;
  postCount: number;
  matchedCount: number;
}> {
  const paths = await getWorkshopFilePaths(id);
  const pre = await fileExists(paths.preJson);
  const post = await fileExists(paths.postJson);
  const analysis = await fileExists(paths.analysisJson);

  let preCount = 0;
  let postCount = 0;
  let matchedCount = 0;

  if (pre) {
    const data = await readJson(paths.preJson);
    preCount = Array.isArray(data) ? data.length : 0;
  }
  if (post) {
    const data = await readJson(paths.postJson);
    postCount = Array.isArray(data) ? data.length : 0;
  }
  if (analysis) {
    const data = await readJson(paths.analysisJson);
    matchedCount = data?.participants || 0;
  }

  return { pre, post, analysis, preCount, postCount, matchedCount };
}
