import { buildServer } from "./app.js";
import { MemoryStore } from "./storage/memory-store.js";
import { PostgresStore } from "./storage/postgres-store.js";

const storageMode = process.env.STORAGE_MODE || "memory";
const store = storageMode === "postgres" ? new PostgresStore() : new MemoryStore();

await store.initialize();
const app = await buildServer({ store });

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}
