"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import type { AdminField } from "@/lib/admin-config";

export type AdminRow = Record<string, unknown> & { id?: string; key?: string };

type ManagerConfig = {
  resource: string;
  label: string;
  description: string;
  fields: AdminField[];
  rows: AdminRow[];
  readOnly?: boolean;
};

const isTrue = (value: unknown) => value === true || value === "true";
const showValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

export function ResourceManager({
  resource,
  label,
  description,
  fields,
  rows,
  destinations = [],
}: ManagerConfig & { destinations?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string | boolean>>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadAccept, setUploadAccept] = useState("image/jpeg,image/png,image/webp");

  const listFields = useMemo(() => fields.filter((field) => field.list), [fields]);
  const isSettings = resource === "settings";

  const openCreate = () => {
    setDraft(Object.fromEntries(fields.map((field) => [field.key, field.type === "checkbox" ? true : ""])));
    setCreating(true);
    setEditing(null);
    setError(null);
  };

  const openEdit = (row: AdminRow) => {
    const next: Record<string, string | boolean> = {};
    fields.forEach((field) => {
      const value = row[field.key];
      if (field.type === "checkbox") next[field.key] = isTrue(value);
      else if (field.type === "list" && Array.isArray(value)) next[field.key] = value.join(", ");
      else if (value === null || value === undefined) next[field.key] = "";
      else next[field.key] = String(value);
    });
    setDraft(next);
    setEditing(row);
    setCreating(false);
    setError(null);
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
    setError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = editing ? (editing.id ?? editing.key) : undefined;
      const response = await fetch(`/api/admin/${resource}${id ? `/${id}` : ""}`, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this record.");
      close();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this record.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: AdminRow) => {
    const id = row.id ?? row.key;
    if (!id || !window.confirm("Delete this record permanently?")) return;
    setError(null);
    const response = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not delete this record.");
      return;
    }
    router.refresh();
  };

  const uploadImage = async (file: File) => {
    if (!uploadTarget) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      setDraft((previous) => ({ ...previous, [uploadTarget]: data.url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const active = creating || editing;
  const destinationName = (id: unknown) => destinations.find((d) => d.id === id)?.name ?? String(id ?? "—");

  return (
    <section className="rounded-2xl border border-pine/10 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-pine/10 px-5 py-4">
        <div>
          <h2 className="font-display text-xl text-pine">{label}</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">{description}</p>
        </div>
        {!isSettings && (
          <button type="button" onClick={openCreate} className="btn btn-forest !px-4 !py-2 text-xs">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        )}
      </header>

      {error && <p className="mx-5 mt-4 rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.75rem] text-[#b23a2e]">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[0.78rem]">
          <thead>
            <tr className="border-b border-pine/8 text-[0.62rem] uppercase tracking-[0.12em] text-faint">
              {listFields.map((field) => (
                <th key={field.key} className="px-4 py-2.5 font-semibold">
                  {field.label}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={listFields.length + 1} className="px-4 py-8 text-center text-faint">
                  No records yet.
                </td>
              </tr>
            )}
            {rows.map((row, index) => {
              const id = String(row.id ?? row.key ?? index);
              return (
                <tr key={id} className="border-b border-pine/6 last:border-0 hover:bg-pine/[0.02]">
                  {listFields.map((field) => (
                    <td key={field.key} className="px-4 py-2.5 align-top text-body">
                      {field.type === "checkbox" ? (
                        <span className={isTrue(row[field.key]) ? "text-emerald" : "text-faintest"}>
                          {isTrue(row[field.key]) ? "Yes" : "No"}
                        </span>
                      ) : field.key === "destinationId" ? (
                        destinationName(row[field.key])
                      ) : field.type === "media" && typeof row[field.key] === "string" && row[field.key] ? (
                        field.accept === "video" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-pine/8 px-2 py-1 text-[0.66rem] font-medium text-pine">
                            ▶ Video
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={String(row[field.key])} alt="" className="h-9 w-12 rounded object-cover" />
                        )
                      ) : (
                        <span className="line-clamp-2 max-w-[220px]">{showValue(row[field.key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                        className="grid h-7 w-7 place-items-center rounded-lg text-pine hover:bg-pine/8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        aria-label="Delete"
                        className="grid h-7 w-7 place-items-center rounded-lg text-[#8a3b2f] hover:bg-[#8a3b2f]/8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest/60 px-3 py-10 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="w-full max-w-3xl rounded-2xl border border-pine/10 bg-cream p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{creating ? "Create" : "Edit"}</p>
                <h3 className="mt-1 font-display text-2xl text-pine">{label}</h3>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-pine/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.wide || field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="field-label" htmlFor={`${resource}-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-[#b23a2e]"> *</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={`${resource}-${field.key}`}
                      className="input min-h-24"
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                      required={field.required}
                    />
                  ) : field.type === "checkbox" ? (
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-pine/12 bg-white px-3 py-2.5 text-[0.8rem]">
                      <input
                        id={`${resource}-${field.key}`}
                        type="checkbox"
                        checked={Boolean(draft[field.key])}
                        onChange={(event) => setDraft({ ...draft, [field.key]: event.target.checked })}
                        className="h-4 w-4 accent-[#12775a]"
                      />
                      Enabled
                    </label>
                  ) : field.type === "select" ? (
                    <select
                      id={`${resource}-${field.key}`}
                      className="input"
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                      required={field.required}
                    >
                      <option value="">Select…</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "destination" ? (
                    <select
                      id={`${resource}-${field.key}`}
                      className="input"
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                      required
                    >
                      <option value="">Select a destination</option>
                      {destinations.map((destination) => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "media" ? (
                    <div className="flex gap-2">
                      <input
                        id={`${resource}-${field.key}`}
                        className="input"
                        value={String(draft[field.key] ?? "")}
                        onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                        placeholder="/media/… or upload"
                        required={field.required}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTarget(field.key);
                          setUploadAccept(
                            field.accept === "video"
                              ? "video/mp4,video/webm"
                              : "image/jpeg,image/png,image/webp"
                          );
                          fileInput.current?.click();
                        }}
                        className="btn btn-ghost !px-3 !py-2 text-xs"
                        aria-label="Upload image"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <input
                      id={`${resource}-${field.key}`}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      className="input"
                      value={String(draft[field.key] ?? "")}
                      onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                      required={field.required}
                    />
                  )}
                  {field.help && <p className="mt-1 text-[0.64rem] text-faint">{field.help}</p>}
                  {field.type === "media" && typeof draft[field.key] === "string" && draft[field.key] &&
                    (field.accept === "video" || /\.(mp4|webm)(\?|$)/i.test(String(draft[field.key]))) ? (
                      <video
                        src={String(draft[field.key])}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="mt-2 h-36 w-full rounded-lg border border-pine/10 bg-forest object-cover"
                      />
                    ) : null}
                  {field.type === "media" && typeof draft[field.key] === "string" && draft[field.key] &&
                    field.accept !== "video" &&
                    !/\.(mp4|webm)(\?|$)/i.test(String(draft[field.key])) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(draft[field.key])} alt="" className="mt-2 h-16 w-24 rounded object-cover" />
                    )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={close} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn btn-forest">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Create record" : "Save changes"}
              </button>
            </div>
          </form>
          <input
            ref={fileInput}
            type="file"
            accept={uploadAccept}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadImage(file);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </section>
  );
}

export function ResourceTabs({ managers }: { managers: (ManagerConfig & { destinations?: { id: string; name: string }[] })[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      {managers.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {managers.map((manager, index) => (
            <button
              key={manager.resource}
              type="button"
              onClick={() => setActive(index)}
              className={`rounded-full px-4 py-2 text-[0.75rem] font-medium transition ${
                active === index ? "bg-pine text-cream" : "bg-white text-body-soft hover:text-pine"
              }`}
            >
              {manager.label}
            </button>
          ))}
        </div>
      )}
      {managers.map((manager, index) => (
        <div key={manager.resource} className={index === active ? "" : "hidden"}>
          <ResourceManager {...manager} />
        </div>
      ))}
    </div>
  );
}
