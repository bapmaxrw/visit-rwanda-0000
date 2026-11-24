"use client";

import { useEffect } from "react";
import { useCinematic } from "./CinematicLayer";
import { type SceneKey } from "@/lib/video-scenes";

/**
 * Registers the cinematic scene for the page it is rendered on. Optional video
 * and poster overrides let a record (e.g. a destination) supply its own film.
 */
export function SceneSetter({
  scene,
  video,
  poster,
  title,
}: {
  scene: SceneKey;
  video?: string | null;
  poster?: string | null;
  title?: string | null;
}) {
  const cinematic = useCinematic();
  const setScene = cinematic?.setScene;

  useEffect(() => {
    if (!setScene) return;
    setScene(scene, {
      video: video ?? undefined,
      poster: poster ?? undefined,
      title: title ?? undefined,
    });
  }, [setScene, scene, video, poster, title]);

  return null;
}
