import { asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { videoAssets } from "./db/schema";
import { SCENES, SCENE_ORDER, type SceneKey, type SceneMap } from "./video-scenes";

/**
 * Resolves the background film for each website section, preferring the
 * administrator-managed records and falling back to the shipped defaults.
 */
export async function getSceneMap(): Promise<SceneMap> {
  const map: SceneMap = { ...SCENES };

  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(videoAssets)
      .where(eq(videoAssets.enabled, true))
      .orderBy(asc(videoAssets.sortOrder));

    for (const row of rows) {
      const key = row.section as SceneKey;
      if (!SCENE_ORDER.includes(key) || !row.videoUrl) continue;
      map[key] = {
        video: row.videoUrl,
        poster: row.posterUrl || SCENES[key].poster,
        title: row.title || SCENES[key].title,
      };
    }
  } catch {
    // A missing table or database should never break page rendering.
  }

  return map;
}
