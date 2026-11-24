/**
 * Builds the cinematic looping homepage video from the licensed photography:
 * slow Ken Burns moves, cross-faded scenes, H.264 + faststart, muted loop.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

const bin = process.env.FFMPEG_PATH || ffmpeg.path;
try {
  fs.chmodSync(bin, 0o755);
} catch {}

const root = process.cwd();
const media = (f) => path.join(root, "public", "media", f);
const out = media("hero.mp4");
const poster = media("hero-poster.jpg");

const scenes = [
  ["volcanoes.jpg", "in"],
  ["gorilla.jpg", "out"],
  ["akagera.jpg", "in"],
  ["elephants.jpg", "out"],
  ["canopy.jpg", "in"],
  ["kivu.jpg", "out"],
  ["culture.jpg", "in"],
  ["hills.jpg", "out"],
  ["kigali.jpg", "in"],
];

const DUR = 4.0;
const FPS = 24;
const W = 1280;
const H = 720;
const XF = 1.0;

const inputs = [];
  scenes.forEach(([file]) =>
  inputs.push("-loop", "1", "-framerate", String(FPS), "-t", String(DUR), "-i", media(file))
);

const filters = scenes.map(([, dir], i) => {
  const zoomIn = `zoompan=z='min(1.0+0.0011*on,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`;
  const zoomOut = `zoompan=z='if(lte(on,1),1.12,max(1.0,1.12-0.0011*on))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`;
  return `[${i}:v]scale=${W * 1.25}:${H * 1.25}:force_original_aspect_ratio=increase,crop=${W * 1.25}:${H * 1.25},${dir === "in" ? zoomIn : zoomOut},setsar=1,format=yuv420p[v${i}]`;
});

let chain = "[v0]";
let offset = 0;
for (let i = 1; i < scenes.length; i++) {
  offset += DUR - XF;
  const label = i === scenes.length - 1 ? `[vout]` : `[x${i}]`;
  filters.push(`${chain}[v${i}]xfade=transition=fade:duration=${XF}:offset=${offset.toFixed(2)}${label}`);
  chain = `[x${i}]`;
}

const args = [
  "-y",
  ...inputs,
  "-filter_complex",
  filters.join(";"),
  "-map",
  "[vout]",
  "-an",
  "-c:v",
  "libx264",
  "-profile:v",
  "high",
  "-preset",
  "slow",
  "-crf",
  "32",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "-r",
  String(FPS),
  out,
];

console.log(`Rendering ${scenes.length} scenes, ${(offset + XF).toFixed(1)}s ...`);
execFileSync(bin, args, { stdio: "inherit" });

execFileSync(
  bin,
  ["-y", "-i", media("volcanoes.jpg"), "-vf", "scale=1920:-2", "-q:v", "4", "-update", "1", poster],
  { stdio: "inherit" }
);

const stats = fs.statSync(out);
console.log(`hero.mp4 ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
