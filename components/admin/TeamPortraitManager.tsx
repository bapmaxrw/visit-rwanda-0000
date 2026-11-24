"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Check, ExternalLink, Loader2, Trash2, UserRound } from "lucide-react";
import { initials } from "@/lib/utils";

type Developer = {
  id: string;
  name: string;
  title: string;
  photoUrl: string | null;
};

/**
 * Portrait manager for the development team. Uploading stores the image in the
 * database through /api/upload, then writes the media URL onto that person's
 * personnel record, so the photo appears on their own profile everywhere on the
 * site without a deploy. Each card is bound to one person id — a photo can never
 * move between profiles.
 */
export function TeamPortraitManager({ developers }: { developers: Developer[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Record<string, string | null>>(
    () => Object.fromEntries(developers.map((d) => [d.id, d.photoUrl]))
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const savePhoto = async (developer: Developer, photoUrl: string | null) => {
    const response = await fetch(`/api/admin/personnel/${developer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: photoUrl ?? "" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Could not save the photograph.");
    setPhotos((previous) => ({ ...previous, [developer.id]: photoUrl }));
    setNotice(
      photoUrl
        ? `${developer.name}'s photograph is now on their profile.`
        : `${developer.name}'s photograph was removed.`
    );
    router.refresh();
  };

  const upload = async (developer: Developer, file: File) => {
    setBusyId(developer.id);
    setError(null);
    setNotice(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed.");
      await savePhoto(developer, data.url as string);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (developer: Developer) => {
    if (!window.confirm(`Remove ${developer.name}'s photograph from the website?`)) return;
    setBusyId(developer.id);
    setError(null);
    setNotice(null);
    try {
      await savePhoto(developer, null);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove the photograph.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-pine/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Team portraits</p>
          <h2 className="mt-1 font-display text-xl text-pine">Photographs on developer profiles</h2>
          <p className="mt-1 max-w-2xl text-[0.76rem] leading-relaxed text-muted">
            Upload each developer&rsquo;s own photograph — JPEG, PNG or WebP up to 4 MB. It is stored in
            the database and shown on their profile immediately. Only the person&rsquo;s own supplied
            photograph should be used.
          </p>
        </div>
        <Link
          href="/development-team"
          className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-emerald hover:underline"
        >
          View team page <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {(notice || error) && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-[0.76rem] ${
            error ? "bg-[#b23a2e]/10 text-[#b23a2e]" : "bg-emerald/8 text-emerald"
          }`}
        >
          {error ?? notice}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {developers.map((developer) => {
          const photo = photos[developer.id];
          const busy = busyId === developer.id;
          return (
            <article key={developer.id} className="overflow-hidden rounded-xl border border-pine/10">
              <div className="relative aspect-[4/3] bg-[linear-gradient(160deg,#0d3b2d,#061a15)]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={`${developer.name} portrait`} className="h-full w-full object-cover object-top" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="flex flex-col items-center gap-2 text-gold-light/80">
                      <span className="font-display text-3xl">{initials(developer.name)}</span>
                      <span className="flex items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-cream/45">
                        <UserRound className="h-3 w-3" /> No photograph yet
                      </span>
                    </span>
                  </span>
                )}
                {busy && (
                  <span className="absolute inset-0 grid place-items-center bg-forest/55">
                    <Loader2 className="h-5 w-5 animate-spin text-cream" />
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="font-display text-base leading-tight text-pine">{developer.name}</p>
                <p className="text-[0.68rem] uppercase tracking-[0.14em] text-faint">{developer.title}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputs.current[developer.id]?.click()}
                    className="btn btn-forest !px-3 !py-1.5 text-[0.7rem]"
                  >
                    {photo ? <Check className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                    {photo ? "Replace photo" : "Upload photo"}
                  </button>
                  {photo && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(developer)}
                      className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#8a3b2f] hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                  <input
                    ref={(element) => {
                      inputs.current[developer.id] = element;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) upload(developer, file);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
