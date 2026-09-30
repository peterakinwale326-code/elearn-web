const mysql = require("mysql2/promise");

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "school",
    connectTimeout: 5000,
  });

  try {
    const [rows] = await connection.query("SELECT 1 AS ok");
    console.log(`Connected to ${process.env.DB_NAME ?? "school"}: SELECT 1 returned ${rows[0].ok}`);

    const [tables] = await connection.query(
      "SELECT TABLE_NAME AS tableName FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY TABLE_NAME"
    );
    console.log(`Tables: ${tables.map((table) => table.tableName).join(", ") || "none"}`);

    if (tables.some((table) => table.tableName === "courses")) {
      const [courseRows] = await connection.query("SELECT COUNT(*) AS total FROM courses");
      console.log(`Course rows: ${courseRows[0].total}`);
    }
  } finally {
    await connection.end();
  }
}

checkDatabase().catch((error) => {
  console.error(`Connection failed: ${error.code ?? "UNKNOWN_ERROR"}`);
  process.exitCode = 1;
});