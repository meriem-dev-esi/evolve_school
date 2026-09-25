/**
 * Server-side input validation utilities for API routes.
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(val: unknown): val is string {
  return typeof val === "string" && UUID_REGEX.test(val.trim());
}

export function validateCheckoutInput(body: unknown): ValidationResult<{
  courseId: string;
  locale: "fr" | "ar" | "en";
}> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Corps de requête invalide (JSON attendu)." };
  }

  const { courseId, locale } = body as Record<string, unknown>;

  if (!courseId || typeof courseId !== "string" || !isValidUuid(courseId)) {
    return {
      success: false,
      error: "Identifiant de cours invalide ou manquant (UUID attendu).",
    };
  }

  let cleanLocale: "fr" | "ar" | "en" = "fr";
  if (locale === "ar" || locale === "en" || locale === "fr") {
    cleanLocale = locale;
  }

  return {
    success: true,
    data: {
      courseId: courseId.trim(),
      locale: cleanLocale,
    },
  };
}

export function validateEnrollmentInput(body: unknown): ValidationResult<{
  courseId: string;
}> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Corps de requête invalide." };
  }

  const { courseId } = body as Record<string, unknown>;

  if (!courseId || typeof courseId !== "string" || !isValidUuid(courseId)) {
    return {
      success: false,
      error: "L'identifiant du cours (UUID) est requis.",
    };
  }

  return {
    success: true,
    data: {
      courseId: courseId.trim(),
    },
  };
}
