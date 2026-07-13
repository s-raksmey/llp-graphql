import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

const [, , sqlFileArg] = process.argv;

if (!sqlFileArg) {
  console.error("Missing SQL file path.");
  process.exit(1);
}

const rootDir = process.cwd();
const sqlFilePath = resolve(rootDir, sqlFileArg);

loadEnvFile(resolve(rootDir, ".env"));
loadEnvFile(resolve(rootDir, ".env.local"));

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Create .env.local first.");
  console.error("Example: DATABASE_URL=mysql://root:password@localhost:3306/llp_local");
  process.exit(1);
}

if (!existsSync(sqlFilePath)) {
  console.error(`SQL file not found: ${sqlFileArg}`);
  process.exit(1);
}

const sql = readFileSync(sqlFilePath, "utf8");
const connection = await mysql.createConnection({
  uri: databaseUrl,
  multipleStatements: true,
});

try {
  await connection.query(sql);
  console.log(`Done: ${sqlFileArg}`);
} finally {
  await connection.end();
}

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
