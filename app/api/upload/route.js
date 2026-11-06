import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "video/webm": "webm",
  "video/mp4": "mp4"
};

export async function POST(request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "Ֆայլ չկա" }, { status: 400 });
  }
  const ext = TYPES[String(file.type || "").split(";")[0]];
  if (!ext) return Response.json({ error: "Այս ֆայլի տեսակը չի ընդունվում" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!bytes.length) return Response.json({ error: "Ֆայլը դատարկ է" }, { status: 400 });
  if (bytes.length > 4 * 1024 * 1024) {
    return Response.json({ error: "Ֆայլը 4 ՄԲ-ից մեծ է" }, { status: 400 });
  }
  const name = `${randomBytes(9).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return Response.json({ url: `/uploads/${name}` });
}
