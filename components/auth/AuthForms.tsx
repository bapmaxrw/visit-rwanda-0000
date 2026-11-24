"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

type ApiResult = {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string>;
  message?: string;
  devResetUrl?: string;
  redirect?: string;
};

async function postJson(url: string, body: unknown): Promise<{ response: Response; data: ApiResult }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as ApiResult;
  return { response, data };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[0.7rem] text-[#b23a2e]">{message}</p>;
}

function PasswordInput({
  name,
  value,
  onChange,
  placeholder = "••••••••",
  id,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={name === "password" ? "current-password" : "new-password"}
        className="input pr-11"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-3 grid place-items-center text-faint hover:text-pine"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { response, data } = await postJson("/api/auth/login", { identifier, password, remember });
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }
      const target = next && next.startsWith("/") ? next : data.redirect ?? "/dashboard";
      // A full navigation, not router.push(): refreshing the old route right
      // after a push cancels the pending transition and leaves the visitor on
      // the sign-in page, and the header reads its signed-in state on the server.
      window.location.assign(target);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="identifier">
          Email, username or telephone number
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          className="input"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="you@example.com, admin or +250 7…"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="mb-1 text-[0.68rem] font-medium text-emerald hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" name="password" value={password} onChange={setPassword} />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-[0.78rem] text-body-soft">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 rounded border-pine/25 accent-[#12775a]"
        />
        Remember me on this device
      </label>

      {error && (
        <p className="rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.78rem] text-[#b23a2e]">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn btn-forest w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-[0.78rem] text-body-soft">
        New to Visit Rwanda Academy?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-semibold text-emerald hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    nationality: "Rwanda",
  });
  const [noNationalId, setNoNationalId] = useState(true);
  const [nationalId, setNationalId] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    try {
      const { response, data } = await postJson("/api/auth/register", {
        ...form,
        hasNationalId: !noNationalId,
        nationalId: noNationalId ? "" : nationalId,
      });
      if (!response.ok) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Unable to create your account.");
        return;
      }

      if (avatar) {
        const body = new FormData();
        body.append("avatar", avatar);
        await fetch("/api/account/avatar", { method: "POST", body });
      }

      window.location.assign(next && next.startsWith("/") ? next : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className="input"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          autoComplete="name"
          required
        />
        <FieldError message={errors.fullName} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            required
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">
            Telephone number
          </label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+250 7…"
            autoComplete="tel"
            required
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <PasswordInput id="password" name="password" value={form.password} onChange={(value) => update("password", value)} />
          <p className="mt-1 text-[0.64rem] text-faint">At least 8 characters, letters and numbers.</p>
          <FieldError message={errors.password} />
        </div>
        <div>
          <label className="field-label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(value) => update("confirmPassword", value)}
          />
          <FieldError message={errors.confirmPassword} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="dob">
            Date of birth
          </label>
          <input
            id="dob"
            type="date"
            className="input"
            max={new Date(Date.now() - 16 * 365.25 * 86400_000).toISOString().slice(0, 10)}
            value={form.dateOfBirth}
            onChange={(event) => update("dateOfBirth", event.target.value)}
            required
          />
          <FieldError message={errors.dateOfBirth} />
        </div>
        <div>
          <label className="field-label" htmlFor="nationality">
            Nationality
          </label>
          <input
            id="nationality"
            className="input"
            value={form.nationality}
            onChange={(event) => update("nationality", event.target.value)}
            required
          />
          <FieldError message={errors.nationality} />
        </div>
      </div>

      <div className="rounded-xl border border-pine/12 bg-pine/[0.03] p-4">
        <label className="flex cursor-pointer items-center gap-2 text-[0.8rem] font-medium text-pine">
          <input
            type="checkbox"
            checked={noNationalId}
            onChange={(event) => setNoNationalId(event.target.checked)}
            className="h-4 w-4 rounded accent-[#12775a]"
          />
          I do not have a national ID
        </label>
        {!noNationalId && (
          <div className="mt-3">
            <label className="field-label" htmlFor="nationalId">
              National ID number
            </label>
            <input
              id="nationalId"
              className="input"
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              placeholder="National ID number"
            />
            <FieldError message={errors.nationalId} />
            <p className="mt-1 text-[0.64rem] text-faint">
              Stored encrypted-at-rest in the database and never displayed in full on your profile.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="avatar">
          Profile picture (optional)
        </label>
        <label
          htmlFor="avatar"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-pine/25 bg-white px-4 py-3 text-[0.78rem] text-body-soft hover:border-emerald/50"
        >
          <Camera className="h-4 w-4 text-emerald" />
          {avatar ? avatar.name : "Upload a photo (JPEG, PNG or WebP, max 4 MB)"}
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
        />
        <FieldError message={errors.avatar} />
      </div>

      {error && (
        <p className="rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.78rem] text-[#b23a2e]">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn btn-gold w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Creating your account…" : "Create account"}
      </button>

      <p className="text-center text-[0.7rem] leading-relaxed text-faint">
        Your password is hashed with scrypt and never stored or displayed in readable form.
      </p>

      <p className="text-center text-[0.78rem] text-body-soft">
        Already registered?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-semibold text-emerald hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDevLink(null);
    setLoading(true);
    try {
      const { response, data } = await postJson("/api/auth/forgot-password", { identifier });
      if (!response.ok) {
        setError(data.error ?? "Unable to send a reset link.");
        return;
      }
      setMessage(data.message ?? "Check your email for the reset link.");
      if (data.devResetUrl) setDevLink(data.devResetUrl);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="forgot-identifier">
          Email address or telephone number
        </label>
        <input
          id="forgot-identifier"
          className="input"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
      </div>
      {message && (
        <div className="rounded-lg bg-emerald/8 px-3 py-2 text-[0.78rem] text-emerald">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
          </p>
          {devLink && (
            <p className="mt-2 break-all text-[0.7rem] text-body-soft">
              Email is not configured locally, so use this link directly:{" "}
              <a href={devLink} className="font-semibold text-emerald underline">
                reset password
              </a>
            </p>
          )}
        </div>
      )}
      {error && <p className="rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.78rem] text-[#b23a2e]">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-forest w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
      <p className="text-center text-[0.78rem] text-body-soft">
        <Link href="/login" className="font-semibold text-emerald hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { response, data } = await postJson("/api/auth/reset-password", { token, password });
      if (!response.ok) {
        setError(data.error ?? "Unable to reset your password.");
        return;
      }
      setMessage("Password updated. Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-sm text-[#b23a2e]">
        This reset link is missing a token.{" "}
        <Link href="/forgot-password" className="font-semibold underline">
          Request a new one
        </Link>
        .
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="new-password">
          New password
        </label>
        <PasswordInput id="new-password" name="newPassword" value={password} onChange={setPassword} />
        <p className="mt-1 text-[0.64rem] text-faint">At least 8 characters, letters and numbers.</p>
      </div>
      <div>
        <label className="field-label" htmlFor="confirm-new-password">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-new-password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>
      {message && <p className="rounded-lg bg-emerald/8 px-3 py-2 text-[0.78rem] text-emerald">{message}</p>}
      {error && <p className="rounded-lg bg-[#b23a2e]/10 px-3 py-2 text-[0.78rem] text-[#b23a2e]">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-forest w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Set new password
      </button>
    </form>
  );
}
