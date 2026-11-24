import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fieldErrors } from "./validation";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, errors?: Record<string, string>) {
  return NextResponse.json({ error: message, errors }, { status });
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Please check the highlighted fields.", errors: fieldErrors(error) },
    { status: 422 }
  );
}

export function serverError(error: unknown, context: string) {
  console.error(`[api:${context}]`, error);
  return NextResponse.json(
    { error: "Something went wrong on our side. Please try again." },
    { status: 500 }
  );
}

type DatabaseFailure = { code?: string; column?: string; constraint?: string };

/** Drizzle wraps driver errors, so the PostgreSQL code lives on the cause chain. */
function databaseFailure(error: unknown): DatabaseFailure | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const candidate = current as DatabaseFailure;
    if (typeof candidate.code === "string") return candidate;
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

/**
 * Turns common PostgreSQL constraint failures into actionable client errors.
 * Without this a missing required column or a duplicate slug reaches the
 * administrator as an opaque "something went wrong" 500.
 */
export function databaseError(error: unknown, context: string) {
  const failure = databaseFailure(error);

  if (failure?.code === "23502") {
    const field = failure.column ?? "value";
    return apiError(`The “${field.replace(/_/g, " ")}” field is required.`, 400, {
      [field]: "This field is required.",
    });
  }

  if (failure?.code === "23505") {
    const field = failure.constraint?.match(/_([a-z0-9_]+)_unique$/i)?.[1] ?? "value";
    const label = field.replace(/_/g, " ");
    return apiError(`That ${label} is already in use.`, 409, { [field]: "Already in use." });
  }

  if (failure?.code === "23503") {
    return apiError("That record refers to something that no longer exists.", 400);
  }

  return serverError(error, context);
}

export function normalizePhone(value: string) {
  return value.replace(/[\s()\-.]/g, "");
}
