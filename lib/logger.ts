type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
  timestamp: string;
}

function sanitize(
  data?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const sanitized = { ...data };
  const sensitiveKeys = [
    "password",
    "secret",
    "token",
    "apiKey",
    "anonKey",
    "authorization",
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "******";
    }
  }
  return sanitized;
}

function formatLog(payload: LogPayload): string {
  const meta = {
    ...payload,
    data: sanitize(payload.data),
    error:
      payload.error instanceof Error
        ? {
            name: payload.error.name,
            message: payload.error.message,
            stack: payload.error.stack,
          }
        : payload.error,
  };
  return JSON.stringify(meta);
}

export const logger = {
  info(message: string, context?: string, data?: Record<string, unknown>) {
    console.log(
      formatLog({
        level: "info",
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  },

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    console.warn(
      formatLog({
        level: "warn",
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  },

  error(
    message: string,
    error?: Error | unknown,
    context?: string,
    data?: Record<string, unknown>,
  ) {
    console.error(
      formatLog({
        level: "error",
        message,
        context,
        error,
        data,
        timestamp: new Date().toISOString(),
      }),
    );
  },

  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        formatLog({
          level: "debug",
          message,
          context,
          data,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  },
};
