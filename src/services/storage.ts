"use server";

import fs from "fs";
import path from "path";

const isVercel = !!process.env.VERCEL;
const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
const useBlob = isVercel && hasBlobToken;
const DATA_DIR = path.join(process.cwd(), "src", "data");

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function readJson(key: string): Promise<any> {
  const filePath = path.join(DATA_DIR, key);

  if (useBlob) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(key, { access: "private" });
      if (result && result.statusCode === 200) {
        const reader = result.stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const text = new TextDecoder().decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
        return JSON.parse(text);
      }
    } catch {}
  }

  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function writeJson(key: string, data: any): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const filePath = path.join(DATA_DIR, key);
  ensureDir(filePath);
  fs.writeFileSync(filePath, json);

  if (useBlob) {
    try {
      const { put } = await import("@vercel/blob");
      await put(key, json, { access: "private", allowOverwrite: true });
    } catch {}
  }
}

export async function fileExists(key: string): Promise<boolean> {
  if (useBlob) {
    try {
      const { head } = await import("@vercel/blob");
      await head(key);
      return true;
    } catch {}
  }
  return fs.existsSync(path.join(DATA_DIR, key));
}

export async function deleteFile(key: string): Promise<void> {
  const filePath = path.join(DATA_DIR, key);
  if (fs.existsSync(filePath)) fs.rmSync(filePath);

  if (useBlob) {
    try {
      const { del } = await import("@vercel/blob");
      await del(key);
    } catch {}
  }
}

export async function deleteByPrefix(prefix: string): Promise<void> {
  const dir = path.join(DATA_DIR, prefix);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

  if (useBlob) {
    try {
      const { list, del } = await import("@vercel/blob");
      let cursor: string | undefined;
      do {
        const result = await list({ prefix, cursor, limit: 1000 });
        if (result.blobs.length > 0) {
          await del(result.blobs.map((b) => b.url));
        }
        cursor = result.hasMore ? result.cursor : undefined;
      } while (cursor);
    } catch {}
  }
}
