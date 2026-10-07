// TEMPORARY end-to-end verification driver (deleted after the run).
import {
  check,
  db,
  newSession,
  passed,
  fails,
  BASE,
  ADMIN,
  TRIAL,
} from "./_verify-lib.mjs";

console.log("== Target: " + BASE + " ==");

// 1. Anonymous session.
{
  const anon = newSession();
  const s = await anon.client.oracleOperations.session.query();
  check("anonymous session has no actor", s.actor === null, JSON.stringify(s));
  check("canBootstrap is false (accounts exist)", s.canBootstrap === false);
}

// 2. Admin login through the real login flow.
const admin = newSession();
const login = await admin.client.oracleOperations.login.mutate(ADMIN);
check("admin login succeeds", login.ok === true, JSON.stringify(login));

const afterLogin = await admin.client.oracleOperations.session.query();
check("session reports the admin actor", afterLogin.actor?.ROLE === "admin");
check(
  "admin account is permanent (no expiry)",
  afterLogin.actor?.EXPIRES_AT === null,
  String(afterLogin.actor?.EXPIRES_AT)
);

// 3. Existing accounts are unaffected by the migration.
const before = await admin.client.oracleOperations.users.query();
const realAdmin = before.find(u => u.USERNAME === "admin");
check("migration left the real admin permanent", realAdmin?.EXPIRES_AT === null);
check("migration left the real admin active", realAdmin?.ACTIVE === 1);
check("users list exposes EXPIRED flag", before.every(u => "EXPIRED" in u));

// 4. Create the 30-day trial account (default length).
await admin.client.oracleOperations.addUser.mutate({
  username: TRIAL.username,
  displayName: "Trial Prospect",
  password: TRIAL.password,
  role: "viewer",
  accountType: "trial",
  trialDays: 30,
});
const trialRow = (
  await admin.client.oracleOperations.users.query()
).find(u => u.USERNAME === TRIAL.username);
check("trial account created", Boolean(trialRow));
check("trial account has an expiry date", Boolean(trialRow?.EXPIRES_AT), String(trialRow?.EXPIRES_AT));
check("trial account is not yet expired", trialRow?.EXPIRED === 0);

const expected = await db(
  "SELECT TO_CHAR(TO_DATE(:d,'YYYY-MM-DD')+30,'YYYY-MM-DD') PLUS30, (EXPIRES_AT-SYSTIMESTAMP) DELTA FROM APP_USERS WHERE USERNAME=:u",
  { d: trialRow.EXPIRES_AT, u: TRIAL.username }
);
const deltaDays = expected.rows[0].DELTA.days;
check(
  "expiry is ~30 days out (Oracle-side check)",
  deltaDays >= 29 && deltaDays <= 30,
  "days=" + deltaDays
);

// 5. A standard account stays permanent.
await admin.client.oracleOperations.addUser.mutate({
  username: "claude_verify_perm",
  displayName: "Permanent Staff",
  password: "permanent-staff-pass-2026",
  role: "editor",
  accountType: "standard",
  trialDays: 30,
});
const permRow = (
  await admin.client.oracleOperations.users.query()
).find(u => u.USERNAME === "claude_verify_perm");
check("standard account has no expiry", permRow?.EXPIRES_AT === null, String(permRow?.EXPIRES_AT));

globalThis.__ctx = { admin, trialId: trialRow.ID, permId: permRow.ID };

// 6. A live trial can sign in and reports its expiry.
const trialSess = newSession();
const tLogin = await trialSess.client.oracleOperations.login.mutate(TRIAL);
check("live trial can log in", tLogin.ok === true);
const tSession = await trialSess.client.oracleOperations.session.query();
check("trial session exposes EXPIRES_AT to the UI", Boolean(tSession.actor?.EXPIRES_AT), String(tSession.actor?.EXPIRES_AT));
check("trial session role is viewer", tSession.actor?.ROLE === "viewer");

// 7. A viewer cannot reach the admin-only user list.
let forbidden = null;
try {
  await trialSess.client.oracleOperations.users.query();
} catch (e) {
  forbidden = e;
}
check("trial (viewer) is forbidden from the users screen", forbidden?.data?.code === "FORBIDDEN" || forbidden?.message?.includes("FORBIDDEN"), String(forbidden?.data?.code ?? forbidden?.message));

globalThis.__ctx.trialSess = trialSess;

const { trialId, permId } = globalThis.__ctx;
console.log("\n== Phase 2: expiry enforcement ==");

// 8. Force-expire the trial exactly as the passage of time would.
await db(
  "UPDATE APP_USERS SET EXPIRES_AT=SYSTIMESTAMP-NUMTODSINTERVAL(1,'DAY') WHERE ID=:id",
  { id: trialId }
);
const expiredRow = (
  await admin.client.oracleOperations.users.query()
).find(u => u.ID === trialId);
check("expired trial is flagged EXPIRED in the admin list", expiredRow?.EXPIRED === 1);
check("expired trial still displays its date", Boolean(expiredRow?.EXPIRES_AT), String(expiredRow?.EXPIRES_AT));

// 8a. An already-open session must stop working (mid-session lockout).
const dead = await trialSess.client.oracleOperations.session.query();
check("existing trial session is rejected once expired", dead.actor === null, JSON.stringify(dead.actor));

// 8b. A fresh login is refused with the trial-specific message.
// Count sessions first: the earlier successful trial login left a row behind
// (inert, because actorFor filters it), so we assert on the *delta*.
const sessBefore = (
  await db("SELECT COUNT(*) N FROM APP_SESSIONS WHERE USER_ID=:id", { id: trialId })
).rows[0].N;
const fresh = newSession();
let trialErr = null;
try {
  await fresh.client.oracleOperations.login.mutate(TRIAL);
} catch (e) {
  trialErr = e;
}
check("expired trial cannot log in", Boolean(trialErr), "login unexpectedly succeeded");
check("expired-trial error says the trial ended", String(trialErr?.message ?? "").includes("تجريبي"), String(trialErr?.message));
check("expired-trial error is UNAUTHORIZED", trialErr?.data?.code === "UNAUTHORIZED", String(trialErr?.data?.code));
const sessAfter = (
  await db("SELECT COUNT(*) N FROM APP_SESSIONS WHERE USER_ID=:id", { id: trialId })
).rows[0].N;
check(
  "failed trial login created no session row",
  sessAfter === sessBefore,
  sessBefore + " -> " + sessAfter
);
check(
  "the stale session row from step 6 is ignored by actorFor",
  sessBefore === 1,
  "rows=" + sessBefore
);

// 9. Admin renews for another 30 days.
await admin.client.oracleOperations.setUserTrial.mutate({ id: trialId, days: 30 });
const renewed = (
  await admin.client.oracleOperations.users.query()
).find(u => u.ID === trialId);
check("renewal clears the expired flag", renewed?.EXPIRED === 0);
const renewedDelta = await db(
  "SELECT (EXPIRES_AT-SYSTIMESTAMP) DELTA FROM APP_USERS WHERE ID=:id",
  { id: trialId }
);
check(
  "renewal opens a ~30 day window",
  renewedDelta.rows[0].DELTA.days >= 29 && renewedDelta.rows[0].DELTA.days <= 30,
  "days=" + renewedDelta.rows[0].DELTA.days
);
const renewedLogin = await fresh.client.oracleOperations.login.mutate(TRIAL);
check("renewed trial can log in again", renewedLogin.ok === true);

// 10. Promote the trial to a permanent account.
await admin.client.oracleOperations.setUserTrial.mutate({ id: trialId, days: 0 });
const promoted = (
  await admin.client.oracleOperations.users.query()
).find(u => u.ID === trialId);
check("clearing the expiry makes the account permanent", promoted?.EXPIRES_AT === null, String(promoted?.EXPIRES_AT));
const promotedSess = newSession();
await promotedSess.client.oracleOperations.login.mutate(TRIAL);
const promotedActor = await promotedSess.client.oracleOperations.session.query();
check("promoted account logs in with no expiry badge", promotedActor.actor?.EXPIRES_AT === null, String(promotedActor.actor?.EXPIRES_AT));
check("promoted admin list shows no expiry", promoted?.EXPIRED === 0);

console.log("\n== Phase 3: validation, not-found, audit trail ==");

async function expectError(label, fn, code) {
  let err = null;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  check(label, Boolean(err), "call unexpectedly succeeded");
  if (err && code)
    check(
      label + " [" + code + "]",
      err?.data?.code === code,
      String(err?.data?.code ?? err?.message)
    );
}

await expectError(
  "trial length above 365 days is rejected",
  () => admin.client.oracleOperations.setUserTrial.mutate({ id: permId, days: 400 }),
  "BAD_REQUEST"
);
await expectError(
  "negative trial length is rejected",
  () => admin.client.oracleOperations.setUserTrial.mutate({ id: permId, days: -1 }),
  "BAD_REQUEST"
);
await expectError(
  "setUserTrial on a missing user reports NOT_FOUND",
  () => admin.client.oracleOperations.setUserTrial.mutate({ id: 999999, days: 30 }),
  "NOT_FOUND"
);
await expectError(
  "unknown accountType is rejected",
  () =>
    admin.client.oracleOperations.addUser.mutate({
      username: "claude_verify_bad",
      displayName: "Bad Type",
      password: "bad-type-password-2026",
      role: "viewer",
      accountType: "forever",
      trialDays: 30,
    }),
  "BAD_REQUEST"
);
await expectError(
  "trialDays above 365 on create is rejected",
  () =>
    admin.client.oracleOperations.addUser.mutate({
      username: "claude_verify_bad2",
      displayName: "Too Long",
      password: "too-long-password-2026",
      role: "viewer",
      accountType: "trial",
      trialDays: 999,
    }),
  "BAD_REQUEST"
);

// Date format the admin table renders.
const uiRow = (
  await admin.client.oracleOperations.users.query()
).find(u => u.ID === trialId);
check(
  "EXPIRES_AT is a plain YYYY-MM-DD for display",
  uiRow.EXPIRES_AT === null || /^\d{4}-\d{2}-\d{2}$/.test(uiRow.EXPIRES_AT),
  String(uiRow.EXPIRES_AT)
);

// Audit trail written by the trial endpoints.
const audit = await db(
  "SELECT ACTION,RECORD_ID,ACTOR_NAME,DB_USER,SOURCE,TO_CHAR(EVENT_AT AT TIME ZONE '+03:00','YYYY-MM-DD HH24:MI:SS') AT,DBMS_LOB.SUBSTR(AFTER_JSON,3900,1) AFTER_JSON FROM APP_AUDIT_LOG WHERE TABLE_NAME='APP_USERS' ORDER BY ID DESC FETCH FIRST 8 ROWS ONLY"
);
check("trial changes are written to APP_AUDIT_LOG", audit.rows.length > 0, "rows=" + audit.rows.length);
const auditText = JSON.stringify(audit.rows);
check(
  "audit rows name the acting admin",
  audit.rows.some(r => r.ACTOR_NAME === "Verify Admin" && r.SOURCE === "DEALER_WEB"),
  JSON.stringify(audit.rows.map(r => r.ACTOR_NAME + "/" + r.SOURCE))
);
check(
  "audit snapshot records the EXPIRES_AT column",
  auditText.includes("EXPIRES_AT"),
  "no EXPIRES_AT in snapshots"
);
check(
  "audit includes the trial create/update actions",
  audit.rows.some(r => r.ACTION === "INSERT") && audit.rows.some(r => r.ACTION === "UPDATE"),
  JSON.stringify(audit.rows.map(r => r.ACTION))
);

console.log("\n==== RESULT: " + passed + " passed, " + fails.length + " failed ====");
if (fails.length) {
  for (const f of fails) console.log("  FAILED: " + f);
  process.exitCode = 1;
}