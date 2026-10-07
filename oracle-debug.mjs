import oracledb from "oracledb";

try {
  const connection = await oracledb.getConnection({
    user: process.env.LOCAL_ORACLE_USER,
    password: process.env.LOCAL_ORACLE_PASSWORD,
    connectString: "//127.0.0.1:1521/ORCLPDB",
  });

  const result = await connection.execute(
    "SELECT USER, SYSDATE FROM DUAL"
  );

  console.log(result.rows);

  await connection.close();
} catch (error) {
  console.error(error);
}
