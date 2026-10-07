// TEMPORARY verification helper (deleted after the run).
// Seeds a clearly-named admin so the admin-only trial endpoints can be
// exercised through the real login flow, without touching the real admin.
import oracledb from "oracledb";
import { oracleConnection, passwordHash } from "./server/oracleSession";

const USERNAME = "claude_verify_admin";
const PASSWORD = "verify-trial-check-2026";

await oracleConnection(async c => {
  await c.execute(
    "DELETE FROM APP_SESSIONS WHERE USER_ID IN (SELECT ID FROM APP_USERS WHERE USERNAME LIKE 'claude_verify%')"
  );
  await c.execute(
    "DELETE FROM APP_USERS WHERE USERNAME LIKE 'claude_verify%'"
  );
  const r = await c.execute(
    "INSERT INTO APP_USERS(USERNAME,DISPLAY_NAME,PASSWORD_HASH,ROLE) VALUES(:u,:n,:h,'admin') RETURNING ID INTO :id",
    {
      u: USERNAME,
      n: "Verify Admin",
      h: await passwordHash(PASSWORD),
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    }
  );
  await c.commit();
  console.log("seeded " + USERNAME + " id=" + (r.outBinds!.id as number[])[0]);
});