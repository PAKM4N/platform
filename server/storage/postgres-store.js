import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { runMigrations } from "../migrations-runner.js";

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

    await runMigrations(this.sql, path.join(currentDirectory, "..", "migrations"));
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

  mapLead(row) {
    return {
      id: row.id,
      submissionId: row.submission_id,
      submittedAt: row.submitted_at,
      quote: row.quote_snapshot,
      reference: `MM-${String(row.id).slice(0, 8).toUpperCase()}`,
    };
  }

  async saveCompletedLead({ lead, notificationJobs = [] }) {
    return this.sql.begin(async (transaction) => {
      const [created] = await transaction`
        INSERT INTO sales.budget_leads (
          id, tenant_slug, submission_id, contact_name, company, email, phone,
          observations, selected_services, selected_channels, selected_extras,
          answers, recommended_package_id, quote_snapshot, implementation_cents,
          monthly_cents, total_ex_vat_cents, currency, pricing_catalog_version,
          external_costs, page_path, locale
        ) VALUES (
          ${lead.id}, ${lead.tenantSlug}, ${lead.submissionId}, ${lead.contact.name},
          ${lead.contact.company || null}, ${lead.contact.email}, ${lead.contact.phone},
          ${lead.contact.observations || null}, ${transaction.json(lead.selectedServices)},
          ${transaction.json(lead.selectedChannels)}, ${transaction.json(lead.selectedExtras)},
          ${transaction.json(lead.answers)}, ${lead.recommendedPackageId},
          ${transaction.json(lead.quote)}, ${lead.implementationCents},
          ${lead.monthlyCents}, ${lead.totalExVatCents}, ${lead.currency},
          ${lead.catalogVersion}, ${transaction.json(lead.externalCosts)},
          ${lead.pagePath}, ${lead.locale}
        )
        ON CONFLICT (tenant_slug, submission_id) DO NOTHING
        RETURNING id, submission_id, submitted_at, quote_snapshot
      `;

      let row = created;
      if (!row) {
        [row] = await transaction`
          SELECT id, submission_id, submitted_at, quote_snapshot
          FROM sales.budget_leads
          WHERE tenant_slug = ${lead.tenantSlug}
            AND submission_id = ${lead.submissionId}
        `;
      }

      if (created) {
        for (const job of notificationJobs) {
          await transaction`
            INSERT INTO sales.notification_jobs (
              id, lead_id, channel, target_key, payload
            ) VALUES (
              ${randomUUID()}, ${created.id}, ${job.channel}, ${job.targetKey},
              ${transaction.json(job.payload)}
            )
            ON CONFLICT (lead_id, channel, target_key) DO NOTHING
          `;
        }
      }

      return { ...this.mapLead(row), created: Boolean(created) };
    });
  }

  async claimNotificationJobs({ limit = 10 }) {
    return this.sql`
      WITH candidates AS (
        SELECT id
        FROM sales.notification_jobs
        WHERE (
          status IN ('pending', 'retry')
          AND next_attempt_at <= now()
        ) OR (
          status = 'processing'
          AND locked_at < now() - interval '10 minutes'
        )
        ORDER BY next_attempt_at, created_at
        FOR UPDATE SKIP LOCKED
        LIMIT ${limit}
      )
      UPDATE sales.notification_jobs AS jobs
      SET status = 'processing', locked_at = now(), attempts = jobs.attempts + 1
      FROM candidates
      WHERE jobs.id = candidates.id
      RETURNING jobs.id, jobs.channel, jobs.target_key, jobs.payload, jobs.attempts
    `;
  }

  async markNotificationSent({ id, providerMessageId = "" }) {
    await this.sql`
      UPDATE sales.notification_jobs
      SET status = 'sent', sent_at = now(), locked_at = NULL,
          provider_message_id = ${providerMessageId || null}, last_error = NULL,
          payload = '{}'::jsonb
      WHERE id = ${id}
    `;
  }

  async markNotificationFailed({ id, error, dead = false, nextAttemptAt }) {
    await this.sql`
      UPDATE sales.notification_jobs
      SET status = ${dead ? "dead" : "retry"}, locked_at = NULL,
          last_error = ${String(error || "notification_failed").slice(0, 500)},
          next_attempt_at = ${nextAttemptAt}
      WHERE id = ${id}
    `;
  }

  async health() {
    const [result] = await this.sql`SELECT 1 AS ok`;
    return { ok: result?.ok === 1, mode: "postgres" };
  }

  async close() {
    if (this.sql) await this.sql.end({ timeout: 5 });
  }
}
