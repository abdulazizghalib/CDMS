// Temporary local probe: lists operator accounts and validates the exact
// expiry SQL used by the application. Not part of the application.
import oracledb from "oracledb";

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
const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT };

try {
  // Verbatim from oracleOperations.users.
  const r = await c.execute(
    "SELECT ID,USERNAME,DISPLAY_NAME,ROLE,ACTIVE,TO_CHAR(EXPIRES_AT AT TIME ZONE '+03:00','YYYY-MM-DD') EXPIRES_AT,CASE WHEN EXPIRES_AT IS NOT NULL AND EXPIRES_AT<=SYSTIMESTAMP THEN 1 ELSE 0 END EXPIRED FROM APP_USERS ORDER BY ID",
    [],
    opts
  );
  console.log("accounts:");
  for (const row of r.rows) console.log("  " + JSON.stringify(row));

  const tz = await c.execute(
    "SELECT SESSIONTIMEZONE STZ, DBTIMEZONE DTZ, TO_CHAR(SYSTIMESTAMP AT TIME ZONE '+03:00','YYYY-MM-DD HH24:MI:SS') RIYADH FROM DUAL",
    [],
    opts
  );
  console.log("timezones: " + JSON.stringify(tz.rows[0]));
} finally {
  await c.close();
}