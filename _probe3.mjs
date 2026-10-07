// Temporary probe: dumps APP_USERS audit rows so the audit assertions can be
// debugged without going through the login rate limiter.
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
try {
  const r = await c.execute(
    "SELECT ACTION,RECORD_ID,ACTOR_NAME,DB_USER,SOURCE,TO_CHAR(EVENT_AT AT TIME ZONE '+03:00','YYYY-MM-DD HH24:MI:SS') AT,AFTER_JSON FROM APP_AUDIT_LOG WHERE TABLE_NAME='APP_USERS' ORDER BY ID DESC FETCH FIRST 8 ROWS ONLY",
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchAsString: [oracledb.CLOB] }
  );
  console.log("rows=" + r.rows.length);
  for (const row of r.rows) {
    console.log("----");
    for (const [k, v] of Object.entries(row)) {
      console.log(
        "  " +
          k +
          " (" +
          (v === null ? "null" : typeof v) +
          ") = " +
          (v === null ? "null" : String(v).slice(0, 220))
      );
    }
  }
} finally {
  await c.close();
}