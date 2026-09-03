/*
 * Simulates the ShortShout workload:
 * - 1,000,000 cache-first reads
 * - 1,000 writes
 * - asynchronous analytics event handling
 *
 * Safe by default: uses an in-memory cache and does not touch databases.
 * Use --scenario <name> to run one scenario, or --scenario all (default).
 * Use --live-redis for warm-cache and mixed-traffic Redis benchmarks.
 */
const { performance } = require("node:perf_hooks");
const { redis, checkConnection } = require("../config/redis");

const READS = Number(process.env.SIM_READS || 1_000_000);
const WRITES = Number(process.env.SIM_WRITES || 1_000);
const EVENT_BATCH_SIZE = 1_000;
const LIVE_REDIS = process.argv.includes("--live-redis");
const CACHE_ENTRIES = 10_000;
const CACHE_PREFIX = "shortshout:load-test:";
const scenarioArgumentIndex = process.argv.indexOf("--scenario");
const requestedScenario =
  scenarioArgumentIndex >= 0
    ? process.argv[scenarioArgumentIndex + 1]
    : undefined;
const SCENARIOS = [
  "warm-cache",
  "cold-cache",
  "stampede",
  "mixed",
  "failures",
  "event-failures",
];
const LOG_INTERVAL = Number(process.env.SIM_LOG_INTERVAL || 100_000);

const cache = new Map();
let pendingEvents = [];
let processedEvents = 0;
let failedEvents = 0;
let eventFailuresEnabled = false;
let flushScheduled = false;
let currentScenario = "idle";
let lastEventLog = 0;

function log(message) {
  console.log(`[load-test] ${message}`);
}

function resetState() {
  cache.clear();
  pendingEvents = [];
  processedEvents = 0;
  failedEvents = 0;
  flushScheduled = false;
  lastEventLog = 0;
}

async function seedCache() {
  const entries = [];
  for (let index = 0; index < CACHE_ENTRIES; index += 1) {
    const key = `${CACHE_PREFIX}${index}`;
    const value = JSON.stringify({
      id: String(index),
      short_code: `load${index}`,
      original_url: `https://example.com/load-test/${index}`,
    });
    if (LIVE_REDIS) entries.push([key, value]);
    else cache.set(key, value);
  }
  if (LIVE_REDIS) {
    const pipeline = redis.pipeline();
    for (const [key, value] of entries) pipeline.setex(key, 60, value);
    await pipeline.exec();
  }
}

function enqueueEvent(event) {
  pendingEvents.push(event);
  if (!flushScheduled) {
    flushScheduled = true;
    setImmediate(flushEvents);
  }
}

function flushEvents() {
  flushScheduled = false;
  const batch = pendingEvents.splice(0, EVENT_BATCH_SIZE);
  if (batch.length === 0) return;
  setImmediate(() => {
    try {
      if (eventFailuresEnabled) throw new Error("simulated analytics failure");
      processedEvents += batch.length;
      if (processedEvents - lastEventLog >= LOG_INTERVAL) {
        lastEventLog = processedEvents;
        log(
          `${currentScenario}: processed ${processedEvents.toLocaleString()} analytics events`,
        );
      }
    } catch {
      failedEvents += batch.length;
      if (failedEvents - lastEventLog >= LOG_INTERVAL) {
        lastEventLog = failedEvents;
        log(
          `${currentScenario}: failed ${failedEvents.toLocaleString()} analytics events (simulated)`,
        );
      }
    }
    if (pendingEvents.length > 0 && !flushScheduled) {
      flushScheduled = true;
      setImmediate(flushEvents);
    }
  });
}

async function readFromCache(key) {
  if (LIVE_REDIS) return redis.get(key);
  return cache.get(key) || null;
}

async function runReads() {
  let hits = 0;
  let misses = 0;
  const startedAt = performance.now();

  for (let index = 0; index < READS; index += 1) {
    const key = `${CACHE_PREFIX}${index % CACHE_ENTRIES}`;
    const value = await readFromCache(key);
    if (value) {
      hits += 1;
      enqueueEvent({ key, at: Date.now() });
    } else {
      misses += 1;
    }
    if ((index + 1) % LOG_INTERVAL === 0) {
      log(
        `${currentScenario}: reads ${(((index + 1) / READS) * 100).toFixed(1)}% | hits=${hits.toLocaleString()} misses=${misses.toLocaleString()}`,
      );
    }
  }

  return { hits, misses, elapsedMs: performance.now() - startedAt };
}

async function runWrites() {
  const startedAt = performance.now();
  for (let index = 0; index < WRITES; index += 1) {
    const key = `${CACHE_PREFIX}${index % CACHE_ENTRIES}`;
    const value = JSON.stringify({
      id: `write-${index}`,
      short_code: `write${index}`,
      original_url: `https://example.com/write/${index}`,
    });
    if (LIVE_REDIS) {
      await redis.setex(key, 60, value);
    } else {
      cache.set(key, value);
    }
    if ((index + 1) % Math.max(1, Math.floor(LOG_INTERVAL / 100)) === 0) {
      log(`${currentScenario}: writes ${index + 1}/${WRITES}`);
    }
  }
  return performance.now() - startedAt;
}

function waitForEvents(expectedEvents) {
  return new Promise((resolve) => {
    const check = () => {
      if (
        pendingEvents.length === 0 &&
        processedEvents + failedEvents >= expectedEvents
      ) {
        resolve();
      } else {
        setImmediate(check);
      }
    };
    check();
  });
}

async function runStampede() {
  const key = `${CACHE_PREFIX}stampede`;
  let databaseFetches = 0;
  let lockHeld = false;
  const read = async () => {
    if (cache.has(key)) return "hit";
    if (!lockHeld) {
      lockHeld = true;
      databaseFetches += 1;
      await new Promise((resolve) => setImmediate(resolve));
      cache.set(key, JSON.stringify({ short_code: "stampede" }));
      lockHeld = false;
      return "miss";
    }
    return "waited";
  };
  const results = await Promise.all(Array.from({ length: READS }, read));
  return {
    hits: results.filter((result) => result === "hit").length,
    misses: results.filter((result) => result === "miss").length,
    waited: results.filter((result) => result === "waited").length,
    database_fetches: databaseFetches,
  };
}

async function runFailures() {
  let hits = 0;
  let misses = 0;
  let destinationFailures = 0;
  for (let index = 0; index < READS; index += 1) {
    if (index % 10 === 0) {
      destinationFailures += 1;
      continue;
    }
    const value = await readFromCache(
      `${CACHE_PREFIX}${index % CACHE_ENTRIES}`,
    );
    if (value) hits += 1;
    else misses += 1;
  }
  return { hits, misses, destination_failures: destinationFailures };
}

async function runScenario(scenario) {
  resetState();
  currentScenario = scenario;
  log(
    `${scenario}: starting (${READS.toLocaleString()} reads, ${WRITES.toLocaleString()} writes configured)`,
  );
  eventFailuresEnabled = scenario === "event-failures";
  if (["warm-cache", "mixed", "failures", "event-failures"].includes(scenario))
    await seedCache();
  if (LIVE_REDIS && !["warm-cache", "mixed"].includes(scenario)) {
    throw new Error(
      "--live-redis supports only warm-cache and mixed scenarios",
    );
  }

  const startedAt = performance.now();
  let readResult;
  let writeElapsedMs = 0;
  if (scenario === "stampede") readResult = await runStampede();
  else if (scenario === "failures") readResult = await runFailures();
  else {
    readResult = await runReads();
    if (scenario === "mixed") writeElapsedMs = await runWrites();
  }
  const expectedEvents = readResult.hits || 0;
  await waitForEvents(expectedEvents);
  const elapsedMs = performance.now() - startedAt;
  const result = {
    scenario,
    reads: READS,
    writes: scenario === "mixed" ? WRITES : 0,
    ...readResult,
    cache_hit_rate: `${((readResult.hits / READS) * 100).toFixed(2)}%`,
    events_queued: expectedEvents,
    events_processed: processedEvents,
    events_failed: failedEvents,
    total_ms: Number(elapsedMs.toFixed(2)),
    reads_per_second: Math.round(READS / (elapsedMs / 1000)),
    writes_per_second: writeElapsedMs
      ? Math.round(WRITES / (writeElapsedMs / 1000))
      : 0,
  };
  log(
    `${scenario}: complete in ${result.total_ms}ms | hit rate ${result.cache_hit_rate} | events processed=${result.events_processed.toLocaleString()} failed=${result.events_failed.toLocaleString()}`,
  );
  return result;
}

async function main() {
  const scenario = requestedScenario || "all";
  const scenarios = scenario === "all" ? SCENARIOS : [scenario];
  if (!scenarios.every((item) => SCENARIOS.includes(item))) {
    throw new Error(`Unknown scenario. Choose: ${SCENARIOS.join(", ")}, all`);
  }
  if (LIVE_REDIS) await checkConnection();
  log(
    `mode=${LIVE_REDIS ? "live-redis" : "in-memory"} | scenarios=${scenarios.join(", ")}`,
  );
  const results = [];
  for (const item of scenarios) results.push(await runScenario(item));
  console.log(
    JSON.stringify(
      { mode: LIVE_REDIS ? "live-redis" : "in-memory", results },
      null,
      2,
    ),
  );
  if (LIVE_REDIS) await redis.quit();
}

main().catch(async (error) => {
  console.error("Load simulation failed:", error.message);
  if (LIVE_REDIS) await redis.quit().catch(() => {});
  process.exitCode = 1;
});
