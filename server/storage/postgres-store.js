import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

async function readSecret(filePath, fallback = "") {
  if (!filePath) return fallback;
  return (await readFile(filePath, "utf8")).trim();
}

export class PostgresStore {
  constructor(options = {}) {
    this.options = options;
    this.sql = null;
  }

  async initialize() {
    const password = await readSecret(
      this.options.passwordFile || process.env.POSTGRES_PASSWORD_FILE,
      process.env.POSTGRES_PASSWORD || "",
    );

    this.sql = postgres({
      host: this.options.host || process.env.POSTGRES_HOST || "postgres",
      port: Number(this.options.port || process.env.POSTGRES_PORT || 5432),
      database:
        this.options.database || process.env.POSTGRES_DB || "chatbot_platform",
      username: this.options.username || process.env.POSTGRES_USER || "chatbot",
      password,
      max: Number(process.env.POSTGRES_POOL_SIZE || 10),
      idle_timeout: 20,
      connect_timeout: 10,
    });

    const migration = await readFile(
      path.join(currentDirectory, "..", "migrations", "001_chatbot.sql"),
      "utf8",
    );
    await this.sql.unsafe(migration);
  }

  async getOrCreateConversation({
    id,
    tenantSlug,
    botSlug,
    channel,
    externalId,
    initialState,
    metadata = {},
  }) {
    if (id) {
      const [existing] = await this.sql`
        SELECT id, tenant_slug, bot_slug, channel, external_id, state, metadata,
               created_at, updated_at
        FROM chatbot.conversations
        WHERE id = ${id}
          AND tenant_slug = ${tenantSlug}
          AND bot_slug = ${botSlug}
          AND channel = ${channel}
      `;
      if (existing) return this.mapConversation(existing);
    }

    if (externalId) {
      const [existing] = await this.sql`
        SELECT id, tenant_slug, bot_slug, channel, external_id, state, metadata,
               created_at, updated_at
        FROM chatbot.conversations
        WHERE tenant_slug = ${tenantSlug}
          AND bot_slug = ${botSlug}
          AND channel = ${channel}
          AND external_id = ${externalId}
      `;
      if (existing) return this.mapConversation(existing);
    }

    const conversationId = randomUUID();
    const [created] = await this.sql`
      INSERT INTO chatbot.conversations (
        id, tenant_slug, bot_slug, channel, external_id, state, metadata
      ) VALUES (
        ${conversationId}, ${tenantSlug}, ${botSlug}, ${channel},
        ${externalId || null}, ${this.sql.json(initialState)}, ${this.sql.json(metadata)}
      )
      ON CONFLICT (tenant_slug, bot_slug, channel, external_id)
      WHERE external_id IS NOT NULL
      DO UPDATE SET updated_at = now()
      RETURNING id, tenant_slug, bot_slug, channel, external_id, state, metadata,
                created_at, updated_at
    `;
    return this.mapConversation(created);
  }

  mapConversation(row) {
    return {
      id: row.id,
      tenantSlug: row.tenant_slug,
      botSlug: row.bot_slug,
      channel: row.channel,
      externalId: row.external_id,
      state: row.state,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async addMessage({ conversationId, role, content, metadata = {} }) {
    await this.sql`
      INSERT INTO chatbot.messages (conversation_id, role, content, metadata)
      VALUES (${conversationId}, ${role}, ${content}, ${this.sql.json(metadata)})
    `;
  }

  async saveState(conversationId, state) {
    await this.sql`
      UPDATE chatbot.conversations
      SET state = ${this.sql.json(state)}, updated_at = now()
      WHERE id = ${conversationId}
    `;
  }

  async saveEstimate({ conversationId, tenantSlug, serviceId, values, estimate }) {
    await this.sql`
      INSERT INTO chatbot.estimates (
        id, conversation_id, tenant_slug, service_id, input_values, result
      ) VALUES (
        ${randomUUID()}, ${conversationId}, ${tenantSlug}, ${serviceId},
        ${this.sql.json(values)}, ${this.sql.json(estimate)}
      )
      ON CONFLICT (conversation_id)
      DO UPDATE SET
        service_id = EXCLUDED.service_id,
        input_values = EXCLUDED.input_values,
        result = EXCLUDED.result,
        updated_at = now()
    `;
  }

  async claimUpdate({ tenantSlug, botSlug, updateId }) {
    const rows = await this.sql`
      INSERT INTO chatbot.webhook_updates (tenant_slug, bot_slug, update_id)
      VALUES (${tenantSlug}, ${botSlug}, ${updateId})
      ON CONFLICT DO NOTHING
      RETURNING update_id
    `;
    return rows.length === 1;
  }

  async health() {
    const [result] = await this.sql`SELECT 1 AS ok`;
    return { ok: result?.ok === 1, mode: "postgres" };
  }

  async close() {
    if (this.sql) await this.sql.end({ timeout: 5 });
  }
}
