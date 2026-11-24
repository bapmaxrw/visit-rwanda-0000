"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import {
  SCENES,
  isCinematicRoute,
  sceneForPath,
  type SceneKey,
  type SceneMap,
  type SceneMedia,
} from "@/lib/video-scenes";

type SceneOverride = { video?: string; poster?: string; title?: string };

type CinematicContextValue = {
  scene: SceneKey;
  setScene: (scene: SceneKey, override?: SceneOverride | null) => void;
  playing: boolean;
  muted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
};

const CinematicContext = createContext<CinematicContextValue | null>(null);

/** Lets any client component drive the shared background scene. */
export function useCinematic() {
  return useContext(CinematicContext);
}

type Slot = { id: number; media: SceneMedia };

/**
 * One persistent video layer for the whole site.
 *
 * The player is mounted once in the root layout and never unmounted while the
 * visitor scrolls or moves between sections, so playback is continuous. Scene
 * changes cross-fade: the incoming scene is decoded in a second slot, the fade
 * starts only when it can play, then the outgoing video is paused.
 */
export function CinematicLayer({
  scenes,
  children,
}: {
  scenes: SceneMap;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const cinematic = isCinematicRoute(pathname);
  const routeScene = sceneForPath(pathname) ?? "home";

  const [scene, setSceneKey] = useState<SceneKey>(routeScene);
  const [override, setOverride] = useState<{ scene: SceneKey; media: SceneOverride } | null>(null);

  const base = scenes[scene] ?? SCENES[scene];
  const media = useMemo<SceneMedia>(() => {
    const current = override && override.scene === scene ? override.media : null;
    return {
      video: current?.video || base.video,
      poster: current?.poster || base.poster,
      title: current?.title || base.title,
    };
  }, [base, override, scene]);

  const [slots, setSlots] = useState<[Slot, Slot]>(() => [
    { id: 0, media },
    { id: -1, media },
  ]);
  const [active, setActive] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const videoRefs = useMemo(() => [videoRefA, videoRefB], [videoRefA, videoRefB]);
  const lastVideo = useRef(media.video);

  const setScene = useCallback((next: SceneKey, nextOverride?: SceneOverride | null) => {
    setSceneKey(next);
    setOverride(nextOverride ? { scene: next, media: nextOverride } : null);
  }, []);

  useEffect(() => {
    setSceneKey(routeScene);
    setOverride(null);
  }, [routeScene]);

  // Respect reduced-motion and data-saving preferences.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const apply = () => setVideoEnabled(!query.matches && !connection?.saveData);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const activate = useCallback((index: number) => {
    setActive((current) => {
      if (current === index) return current;
      const element = videoRefs[index].current;
      if (element) {
        element.play().then(() => setPlaying(true)).catch(() => undefined);
      }
      return index;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stage the incoming scene in the idle slot, then cross-fade.
  useEffect(() => {
    if (lastVideo.current === media.video) return;
    const incoming = active === 0 ? 1 : 0;

    if (!videoEnabled) {
      lastVideo.current = media.video;
      setSlots((previous) => {
        const next: [Slot, Slot] = [previous[0], previous[1]];
        next[incoming] = { id: Date.now(), media };
        return next;
      });
      setActive(incoming);
      return;
    }

    lastVideo.current = media.video;
    setSlots((previous) => {
      const next: [Slot, Slot] = [previous[0], previous[1]];
      next[incoming] = { id: Date.now(), media };
      return next;
    });

    // If the video cannot play (slow network, decode error) still show its poster.
    const fallback = window.setTimeout(() => setActive(incoming), 4500);
    return () => window.clearTimeout(fallback);
    // `active` is intentionally read at staging time only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, videoEnabled]);

  // Release the outgoing player once the cross-fade has finished.
  useEffect(() => {
    if (!videoEnabled) return;
    const timer = window.setTimeout(() => {
      videoRefs[1 - active].current?.pause();
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, videoEnabled]);

  useEffect(() => {
    videoRefs.forEach((reference) => {
      if (reference.current) reference.current.muted = muted;
    });
  }, [muted, videoRefs]);

  // Never keep decoding a background video on a hidden tab.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        videoRefs.forEach((reference) => reference.current?.pause());
        setPlaying(false);
      } else if (cinematic && videoEnabled) {
        videoRefs[active].current?.play().then(() => setPlaying(true)).catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, cinematic, videoEnabled]);

  const togglePlay = useCallback(() => {
    const element = videoRefs[active].current;
    if (!element) return;
    if (element.paused) {
      element.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      element.pause();
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const toggleMute = useCallback(() => {
    setMuted((current) => !current);
  }, []);

  const value = useMemo<CinematicContextValue>(
    () => ({ scene, setScene, playing, muted, togglePlay, toggleMute }),
    [scene, setScene, playing, muted, togglePlay, toggleMute]
  );

  return (
    <CinematicContext.Provider value={value}>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-forest transition-opacity duration-700 ${
          cinematic ? "opacity-100" : "opacity-0"
        }`}
      >
        {slots.map((slot, index) => (
          <div
            key={`poster-${index}`}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-out"
            style={{
              backgroundImage: `url(${slot.media.poster})`,
              opacity: active === index ? 1 : 0,
            }}
          />
        ))}

        {videoEnabled &&
          cinematic &&
          slots.map((slot, index) =>
            slot.id >= 0 ? (
              <video
                key={`video-${slot.id}`}
                ref={videoRefs[index]}
                src={slot.media.video}
                poster={slot.media.poster}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                onCanPlay={() => activate(index)}
                onError={() => activate(index)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
                  active === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null
          )}

        <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/30 to-forest/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,rgba(18,119,90,0.30),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,35,28,0.38),transparent_55%,rgba(6,35,28,0.30))]" />
      </div>

      {children}

      {cinematic && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden justify-end px-5 pb-5 sm:flex sm:px-8">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-forest/45 px-2 py-1.5 text-cream backdrop-blur-md">
            <span className="hidden px-2 text-[0.6rem] uppercase tracking-[0.22em] text-cream/60 md:block">
              {media.title}
            </span>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause background film" : "Play background film"}
              className="grid h-8 w-8 place-items-center rounded-full text-cream transition hover:bg-white/15"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute background film" : "Mute background film"}
              className="grid h-8 w-8 place-items-center rounded-full text-cream transition hover:bg-white/15"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </CinematicContext.Provider>
  );
}
