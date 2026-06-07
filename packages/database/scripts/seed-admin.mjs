import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;
const PASSWORD_KEY_LENGTH = 64;

const databaseUrl = process.env.DATABASE_URL;
const name = process.env.ADMIN_NAME ?? "Operations Manager";
const email = (process.env.ADMIN_EMAIL ?? "manager@example.com")
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "admin123";
const role = process.env.ADMIN_ROLE ?? "admin";
const department = process.env.ADMIN_DEPARTMENT ?? "Operations";

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running seed:admin.");
}

function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto
    .scryptSync(value, salt, PASSWORD_KEY_LENGTH)
    .toString("base64url");

  return `scrypt:${salt}:${hash}`;
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(
    `
      insert into users (name, email, password_hash, role, department, active)
      values ($1, $2, $3, $4, $5, true)
      on conflict (email)
      do update set
        name = excluded.name,
        password_hash = excluded.password_hash,
        role = excluded.role,
        department = excluded.department,
        active = true
    `,
    [name, email, hashPassword(password), role, department],
  );

  console.log(`Seeded admin user: ${email}`);
} finally {
  await pool.end();
}
