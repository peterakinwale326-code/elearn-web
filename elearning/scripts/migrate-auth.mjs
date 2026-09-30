import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "school",
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
});

async function main() {
  const connection = await pool.getConnection();
  try {
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME AS columnName FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'password_hash'"
    );

    if (columns.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
      console.log("Added nullable users.password_hash for existing-account compatibility.");
    } else {
      console.log("users.password_hash already exists; no schema change needed.");
    }

    const [emailIndex] = await connection.query(
      "SELECT INDEX_NAME AS indexName FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email' AND non_unique = 0"
    );
    if (emailIndex.length === 0) {
      throw new Error("users.email needs a unique index before signup can safely prevent duplicate accounts.");
    }
    console.log("Verified unique users.email index.");
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Auth migration failed: ${error.code ?? error.message}`);
  process.exitCode = 1;
});
