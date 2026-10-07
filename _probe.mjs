// Temporary local probe: reports the state of the APP_* tables needed by the
// trial-account feature. Not part of the application.
import oracledb from "oracledb";

const cs =
  process.env.LOCAL_ORACLE_HOST +
  ":" +
  process.env.LOCAL_ORACLE_PORT +
  "/" +
  process.env.LOCAL_ORACLE_SERVICE_NAME;
const c = await oracledb.getConnection({
  user: process.env.LOCAL_ORACLE_USER,
  password: process.env.LOCAL_ORACLE_PASSWORD,
  connectString: cs,
});
const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT };

try {
  const t = await c.execute(
    "SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME IN ('APP_USERS','APP_SESSIONS','APP_AUDIT_LOG','APP_WRITE_LOCK') ORDER BY TABLE_NAME",
    [],
    opts
  );
  console.log(
    "APP_ tables present: " + JSON.stringify(t.rows.map(r => r.TABLE_NAME))
  );

  const hasUsers = t.rows.some(r => r.TABLE_NAME === "APP_USERS");
  if (hasUsers) {
    const cols = await c.execute(
      "SELECT COLUMN_NAME,DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME='APP_USERS' ORDER BY COLUMN_ID",
      [],
      opts
    );
    console.log(
      "APP_USERS columns: " +
        cols.rows.map(r => r.COLUMN_NAME + ":" + r.DATA_TYPE).join(", ")
    );
    console.log(
      "EXPIRES_AT present: " +
        cols.rows.some(r => r.COLUMN_NAME === "EXPIRES_AT")
    );
    const n = await c.execute("SELECT COUNT(*) N FROM APP_USERS", [], opts);
    console.log("APP_USERS rows: " + n.rows[0].N);
  } else {
    console.log("APP_USERS missing -> audit install has never been applied.");
  }
} finally {
  await c.close();
}