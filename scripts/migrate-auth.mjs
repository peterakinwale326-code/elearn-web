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

    const [verificationColumn] = await connection.query(
      "SELECT COLUMN_NAME AS columnName FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email_verified_at'"
    );
    if (verificationColumn.length === 0) {
      await connection.query(
        "ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER password_hash"
      );
      console.log("Added users.email_verified_at; existing accounts are treated as verified.");
    } else {
      console.log("users.email_verified_at already exists; no schema change needed.");
    }

    const [emailIndex] = await connection.query(
      "SELECT INDEX_NAME AS indexName FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email' AND non_unique = 0"
    );
    if (emailIndex.length === 0) {
      throw new Error("users.email needs a unique index before signup can safely prevent duplicate accounts.");
    }
    console.log("Verified unique users.email index.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_2fa_challenges (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        code_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
        purpose ENUM('login', 'signup') NOT NULL DEFAULT 'login',
        expires_at DATETIME NOT NULL,
        attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
        sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_email_2fa_token_hash (token_hash),
        KEY idx_email_2fa_user_sent (user_id, sent_at),
        CONSTRAINT fk_email_2fa_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    const [purposeColumn] = await connection.query(
      "SELECT COLUMN_NAME AS columnName FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'email_2fa_challenges' AND column_name = 'purpose'"
    );
    if (purposeColumn.length === 0) {
      await connection.query(
        "ALTER TABLE email_2fa_challenges ADD COLUMN purpose ENUM('login', 'signup') NOT NULL DEFAULT 'login' AFTER code_hash"
      );
    }
    console.log("Verified email_2fa_challenges table.");
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Auth migration failed: ${error.code ?? error.message}`);
  process.exitCode = 1;
});
