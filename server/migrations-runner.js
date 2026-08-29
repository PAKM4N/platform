import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const LOCK_KEY = 734_280_611;

function checksum(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

export async function runMigrations(sql, migrationsDirectory) {
  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => /^\d+.*\.sql$/.test(filename))
    .sort();
  const migrations = await Promise.all(
    filenames.map(async (filename) => {
      const contents = await readFile(path.join(migrationsDirectory, filename), "utf8");
      return { filename, contents, digest: checksum(contents) };
    }),
  );

  await sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(${LOCK_KEY})`;
    await transaction`CREATE SCHEMA IF NOT EXISTS platform`;
    await transaction`
      CREATE TABLE IF NOT EXISTS platform.schema_migrations (
        filename text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    for (const { filename, contents, digest } of migrations) {
      const [applied] = await transaction`
        SELECT checksum
        FROM platform.schema_migrations
        WHERE filename = ${filename}
      `;

      if (applied) {
        if (applied.checksum !== digest) {
          throw new Error(`La migración ${filename} cambió después de aplicarse.`);
        }
        continue;
      }

      await transaction.unsafe(contents);
      await transaction`
        INSERT INTO platform.schema_migrations (filename, checksum)
        VALUES (${filename}, ${digest})
      `;
    }
  });
}
