// TEMPORARY end-to-end verification (deleted after the run).
// Talks to the running dev server with a real tRPC client + its own cookie
// jar, so login/session/expiry are exercised exactly as the browser would.
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import oracledb from "oracledb";

const BASE = process.env.VERIFY_BASE || "http://127.0.0.1:3002";
const ADMIN = { username: "claude_verify_admin", password: "verify-trial-check-2026" };
const TRIAL = { username: "claude_verify_trial", password: "trial-prospect-pass-2026" };

let passed = 0;
const fails = [];
function check(label, cond, extra = "") {
  if (cond) {
    passed++;
    console.log("  PASS  " + label);
  } else {
    fails.push(label);
    console.log("  FAIL  " + label + (extra ? " -> " + extra : ""));
  }
}

async function db(sql, binds = {}) {
  const c = await oracledb.getConnection({
    user: process.env.LOCAL_ORACLE_USER,
    password: process.env.LOCAL_ORACLE_PASSWORD,
    connectString:
      process.env.LOCAL_ORACLE_HOST +
      ":" +
      process.env.LOCAL_ORACLE_PORT +
      "/" +
      process.env.LOCAL_ORACLE_SERVICE_NAME,
  });
  try {
    return await c.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
    });
  } finally {
    await c.close();
  }
}

/** One isolated browser-like client with its own cookie jar. */
function newSession() {
  let jar = [];
  const fetchWithJar = async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("origin", BASE);
    headers.set("sec-fetch-site", "same-origin");
    if (jar.length) headers.set("cookie", jar.join("; "));
    const res = await fetch(input, { ...init, headers });
    for (const raw of res.headers.getSetCookie()) {
      const pair = raw.split(";")[0];
      const name = pair.split("=")[0];
      jar = jar.filter(c => c.split("=")[0] !== name);
      jar.push(pair);
    }
    return res;
  };
  const client = createTRPCClient({
    links: [
      httpBatchLink({ url: BASE + "/api/trpc", transformer: superjson, fetch: fetchWithJar }),
    ],
  });
  return { client, clearCookies: () => (jar = []) };
}

export { check, db, newSession, passed, fails, BASE, ADMIN, TRIAL };