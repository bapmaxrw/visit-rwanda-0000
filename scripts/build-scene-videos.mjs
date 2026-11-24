/**
 * Builds the cinematic background scenes used by the persistent video layer.
 *
 * Every tourism scene is assembled only from the licensed photography already
 * shipped in public/media (see MEDIA_CREDITS.md): slow Ken Burns moves,
 * cross-faded, H.264 + faststart, muted loop. The technology scene is generated
 * as an abstract motion graphic (no stock footage, no invented places/people).
 *
 * Usage: node scripts/build-scene-videos.mjs [scene ...]
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const media = (file) => path.join(root, "public", "media", file);

function resolveFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    "/tmp/ffmpeg-7.0.2-amd64-static/ffmpeg",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    path.join(root, "node_modules", "@ffmpeg-installer", "linux-x64", "ffmpeg"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        fs.chmodSync(candidate, 0o755);
      } catch {}
      return candidate;
    }
  }
  throw new Error("ffmpeg not found. Set FFMPEG_PATH.");
}

const bin = resolveFfmpeg();

const W = 1280;
const H = 720;
const FPS = 24;
const DUR = 4;
const XF = 1;

/** Tourism scenes: only licensed photography already in the repository. */
const SCENES = {
  destinations: {
    poster: "destinations-poster.jpg",
    photos: [
      "volcanoes.jpg",
      "akagera.jpg",
      "giraffe.jpg",
      "nyungwe.jpg",
      "kivu.jpg",
      "hills-2.jpg",
      "gishwati.jpg",
    ],
  },
  culture: {
    poster: "culture-poster.jpg",
    photos: [
      "culture.jpg",
      "inema.jpg",
      "crafts.jpg",
      "heritage-hut.jpg",
      "king-palace.jpg",
      "culture-2.jpg",
    ],
  },
  leadership: {
    poster: "leadership-poster.jpg",
    photos: ["convention.jpg", "kigali.jpg", "gorilla-portrait.jpg", "hills.jpg", "bamboo.jpg"],
  },
  gallery: {
    poster: "gallery-poster.jpg",
    photos: [
      "canopy.jpg",
      "elephants.jpg",
      "gorilla.jpg",
      "kivu-boats.jpg",
      "kigali-street.jpg",
      "memorial.jpg",
      "volcanoes.jpg",
    ],
  },
};

function buildPhotoScene(name, { photos, poster }) {
  const out = media(`${name}.mp4`);
  const inputs = [];
  photos.forEach((photo) => {
    const file = media(photo);
    if (!fs.existsSync(file)) throw new Error(`Missing photo: ${photo}`);
    inputs.push("-loop", "1", "-framerate", String(FPS), "-t", String(DUR), "-i", file);
  });

  const filters = photos.map((_, i) => {
    const zoomIn = `zoompan=z='min(1.0+0.0010*on,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`;
    const zoomOut = `zoompan=z='if(lte(on,1),1.10,max(1.0,1.10-0.0010*on))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`;
    const move = i % 2 === 0 ? zoomIn : zoomOut;
    return `[${i}:v]scale=${W * 1.3}:${H * 1.3}:force_original_aspect_ratio=increase,crop=${W * 1.3}:${H * 1.3},${move},setsar=1,format=yuv420p[v${i}]`;
  });

  let chain = "[v0]";
  let offset = 0;
  for (let i = 1; i < photos.length; i++) {
    offset += DUR - XF;
    const label = i === photos.length - 1 ? "[vout]" : `[x${i}]`;
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
    "-preset",
    "veryfast",
    "-crf",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-r",
    String(FPS),
    out,
  ];

  console.log(`→ ${name}.mp4 (${photos.length} scenes)`);
  execFileSync(bin, args, { stdio: "inherit" });
  execFileSync(bin, ["-y", "-ss", "2", "-i", out, "-frames:v", "1", "-q:v", "4", media(poster)], {
    stdio: "inherit",
  });
  const size = (fs.statSync(out).size / 1e6).toFixed(2);
  console.log(`✓ ${name}.mp4 ${size} MB · ${poster}`);
}

/** Abstract "digital innovation" backdrop: emerald gradients, gold grid, grain. */
function buildTechnologyScene() {
  const out = media("developers.mp4");
  const poster = media("developers-poster.jpg");
  const filter = [
    `gradients=s=${W}x${H}:r=${FPS}:d=14:c0=0x061a14:c1=0x0e4a38:c2=0x12775a:c3=0x06231c:x0=0:y0=${H}:x1=${W}:y1=0:speed=0.06`,
    `drawbox=x='-420+mod(t*270,2200)':y=0:w=340:h=ih:c=0xc9a44c@0.26:t=fill`,
    `drawbox=x='-420+mod(t*270,2200)':y=0:w=3:h=ih:c=0xf0d79a@0.55:t=fill`,
    `drawbox=x='-1100+mod(t*160,2600)':y=0:w=200:h=ih:c=0xf0d79a@0.14:t=fill`,
    `drawbox=x=0:y='mod(t*80,ih)':w=iw:h=1:c=0xf0d79a@0.40:t=fill`,
    `drawgrid=w=80:h=80:t=1:c=0x1a9a71@0.20`,
    `drawgrid=w=320:h=320:t=1:c=0xc9a44c@0.14`,
    `noise=alls=7:allf=t+u`,
    `vignette=PI/7`,
    `format=yuv420p`,
  ].join(",");

  console.log("→ developers.mp4 (generated motion graphic)");
  execFileSync(
    bin,
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      filter,
      "-t",
      "14",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-r",
      String(FPS),
      out,
    ],
    { stdio: "inherit" }
  );
  execFileSync(bin, ["-y", "-ss", "2", "-i", out, "-frames:v", "1", "-q:v", "4", poster], {
    stdio: "inherit",
  });
  const size = (fs.statSync(out).size / 1e6).toFixed(2);
  console.log(`✓ developers.mp4 ${size} MB · ${poster}`);
}

const requested = process.argv.slice(2);
const wanted = requested.length ? requested : [...Object.keys(SCENES), "developers"];

for (const name of wanted) {
  if (name === "developers") buildTechnologyScene();
  else if (SCENES[name]) buildPhotoScene(name, SCENES[name]);
  else throw new Error(`Unknown scene: ${name}`);
}
console.log("All scenes built.");
