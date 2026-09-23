#!/usr/bin/env node

/**
 * Simultaneous Users & Concurrency Load Test Script
 * Simulates concurrent users accessing Evolve Academy endpoints,
 * measures response latencies (p50, p95, p99) and verifies rate limiting.
 *
 * Usage:
 *   node scripts/test_simultaneous_users.mjs [baseUrl] [concurrency]
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";
const CONCURRENCY = Number.parseInt(process.argv[3] || "50", 10);
const TARGET_PATH = "/api/health";

console.log("=================================================");
console.log("  EVOLVE ACADEMY - SIMULTANEOUS USERS LOAD TEST  ");
console.log("=================================================");
console.log(`Target URL:       ${BASE_URL}${TARGET_PATH}`);
console.log(`Simultaneous:     ${CONCURRENCY} concurrent users`);
console.log("-------------------------------------------------");

async function runLoadTest() {
  const latencies = [];
  const statusCounts = {};
  const startTime = Date.now();

  const requests = Array.from({ length: CONCURRENCY }, async (_, index) => {
    const reqStart = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${TARGET_PATH}`, {
        headers: {
          "User-Agent": `EvolveLoadTester/1.0 User-${index}`,
          "X-Forwarded-For": `192.168.1.${(index % 10) + 1}`,
        },
      });

      const duration = Date.now() - reqStart;
      latencies.push(duration);

      const status = res.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      return { ok: res.ok, status, duration };
    } catch (err) {
      const duration = Date.now() - reqStart;
      latencies.push(duration);
      statusCounts.ERROR = (statusCounts.ERROR || 0) + 1;
      return { ok: false, error: err.message, duration };
    }
  });

  const results = await Promise.all(requests);
  const totalDurationMs = Date.now() - startTime;

  latencies.sort((a, b) => a - b);

  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = Math.round(
    latencies.reduce((a, b) => a + b, 0) / latencies.length,
  );

  const successful = results.filter((r) => r.ok).length;
  const failed = results.length - successful;
  const reqPerSec = (CONCURRENCY / (totalDurationMs / 1000) || 0).toFixed(1);

  console.log("\nResults Summary:");
  console.log(`  Total Requests:     ${results.length}`);
  console.log(`  Total Duration:     ${totalDurationMs} ms`);
  console.log(`  Throughput:         ${reqPerSec} req/sec`);
  console.log(`  Successful:         ${successful}`);
  console.log(`  Failed / Errors:    ${failed}`);
  console.log("\nHTTP Status Breakdown:");
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(
      `  HTTP ${status}: ${count} (${((count / CONCURRENCY) * 100).toFixed(1)}%)`,
    );
  }

  console.log("\nLatency Distribution:");
  console.log(`  Min:  ${min} ms`);
  console.log(`  Avg:  ${avg} ms`);
  console.log(`  p50:  ${p50} ms`);
  console.log(`  p90:  ${p90} ms`);
  console.log(`  p95:  ${p95} ms`);
  console.log(`  p99:  ${p99} ms`);
  console.log(`  Max:  ${max} ms`);
  console.log("=================================================\n");
}

runLoadTest().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
