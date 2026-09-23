import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatency = 0;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const dbStart = Date.now();
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.from("categories").select("id").limit(1);

      dbLatency = Date.now() - dbStart;
      dbStatus = error ? `degraded: ${error.message}` : "connected";
    } else {
      dbStatus = "missing_credentials";
    }
  } catch (err: unknown) {
    dbStatus = err instanceof Error ? `error: ${err.message}` : "error";
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    responseTimeMs: Date.now() - startTime,
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
  };

  const isHealthy =
    dbStatus === "connected" || dbStatus === "missing_credentials";
  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
