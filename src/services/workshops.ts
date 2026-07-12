"use server";

import fs from "fs";
import path from "path";
import type { Workshop } from "@/types";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "src", "data");
const WORKSHOPS_FILE = path.join(DATA_DIR, "workshops.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readWorkshops(): Workshop[] {
  ensureDataDir();
  if (!fs.existsSync(WORKSHOPS_FILE)) return [];
  return JSON.parse(fs.readFileSync(WORKSHOPS_FILE, "utf-8"));
}

function writeWorkshops(workshops: Workshop[]) {
  ensureDataDir();
  fs.writeFileSync(WORKSHOPS_FILE, JSON.stringify(workshops, null, 2));
}

function workshopDir(id: string) {
  const dir = path.join(DATA_DIR, "workshops", id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function getWorkshops(): Promise<Workshop[]> {
  return readWorkshops();
}

export async function getWorkshop(id: string): Promise<Workshop | null> {
  const workshops = readWorkshops();
  return workshops.find((w) => w.id === id) || null;
}

export async function createWorkshop(data: {
  name: string;
  cohort: string;
  location: string;
  date: string;
  description: string;
}): Promise<Workshop> {
  const workshops = readWorkshops();
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
  writeWorkshops(workshops);
  workshopDir(id);
  return workshop;
}

export async function deleteWorkshop(id: string): Promise<boolean> {
  const workshops = readWorkshops();
  const filtered = workshops.filter((w) => w.id !== id);
  if (filtered.length === workshops.length) return false;
  writeWorkshops(filtered);
  const dir = path.join(DATA_DIR, "workshops", id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

export async function updateWorkshop(
  id: string,
  updates: Partial<Pick<Workshop, "name" | "cohort" | "location" | "date" | "description">>
): Promise<Workshop | null> {
  const workshops = readWorkshops();
  const idx = workshops.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  workshops[idx] = { ...workshops[idx], ...updates };
  writeWorkshops(workshops);
  return workshops[idx];
}

export async function updateWorkshopStatus(
  id: string,
  status: Workshop["status"],
  extra?: Partial<Workshop>
): Promise<void> {
  const workshops = readWorkshops();
  const idx = workshops.findIndex((w) => w.id === id);
  if (idx === -1) return;
  workshops[idx] = { ...workshops[idx], status, ...extra };
  writeWorkshops(workshops);
}

export async function getWorkshopFilePaths(id: string) {
  const dir = workshopDir(id);
  return {
    preJson: path.join(dir, "pre_responses.json"),
    postJson: path.join(dir, "post_responses.json"),
    mergedJson: path.join(dir, "survey_responses.json"),
    analysisJson: path.join(dir, "analysis.json"),
  };
}

export async function readWorkshopFile(id: string, filename: string): Promise<any> {
  const dir = workshopDir(id);
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function writeWorkshopFile(
  id: string,
  filename: string,
  data: any
): Promise<void> {
  const dir = workshopDir(id);
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2));
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
  const pre = fs.existsSync(paths.preJson);
  const post = fs.existsSync(paths.postJson);
  const analysis = fs.existsSync(paths.analysisJson);

  let preCount = 0;
  let postCount = 0;
  let matchedCount = 0;

  if (pre) {
    const data = JSON.parse(fs.readFileSync(paths.preJson, "utf-8"));
    preCount = Array.isArray(data) ? data.length : 0;
  }
  if (post) {
    const data = JSON.parse(fs.readFileSync(paths.postJson, "utf-8"));
    postCount = Array.isArray(data) ? data.length : 0;
  }
  if (analysis) {
    const data = JSON.parse(fs.readFileSync(paths.analysisJson, "utf-8"));
    matchedCount = data.participants || 0;
  }

  return { pre, post, analysis, preCount, postCount, matchedCount };
}
