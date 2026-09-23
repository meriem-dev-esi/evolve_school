export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export class ApiTimeoutError extends Error {
  constructor(message = "La requête vers l'API a expiré (délai dépassé).") {
    super(message);
    this.name = "ApiTimeoutError";
  }
}

export class ApiNetworkError extends Error {
  public status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiNetworkError";
    this.status = status;
  }
}

/**
 * Robust fetch wrapper with configurable timeout, automatic retry on transient
 * failures, and unified error handling.
 */
export async function resilientFetch<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeoutMs = 8000,
    retries = 2,
    retryDelayMs = 600,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Only retry server errors (5xx) or rate limit backoff (429)
        if (
          (response.status >= 500 || response.status === 429) &&
          attempt < retries
        ) {
          const delay = retryDelayMs * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        const errorBody = await response.json().catch(() => ({}));
        throw new ApiNetworkError(
          errorBody.error || `Erreur serveur (HTTP ${response.status})`,
          response.status,
        );
      }

      const data = await response.json();
      return data as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === "AbortError") {
        lastError = new ApiTimeoutError(
          `Délai d'attente de ${timeoutMs}ms dépassé pour ${url}`,
        );
      } else if (err instanceof Error) {
        lastError = err;
      } else {
        lastError = new Error("Une erreur réseau inconnue est survenue.");
      }

      // If it's a client error (4xx except 429), do not retry
      if (
        err instanceof ApiNetworkError &&
        err.status &&
        err.status < 500 &&
        err.status !== 429
      ) {
        throw err;
      }

      if (attempt < retries) {
        const delay = retryDelayMs * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw (
    lastError || new Error("Échec de la requête après plusieurs tentatives.")
  );
}
