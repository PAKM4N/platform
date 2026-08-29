import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildServer } from "../server/app.js";
import { PostgresStore } from "../server/storage/postgres-store.js";

const database = process.env.POSTGRES_DB || "";
if (
  process.env.ALLOW_POSTGRES_INTEGRATION_TEST !== "YES" ||
  !/(?:test|check)/i.test(database)
) {
  throw new Error(
    "Esta prueba solo puede ejecutarse con ALLOW_POSTGRES_INTEGRATION_TEST=YES contra una base cuyo nombre contenga test o check.",
  );
}

const submissionId = randomUUID();
const store = new PostgresStore();
await store.initialize();
const app = await buildServer({
  store,
  logger: false,
  projectLeads: { notificationChannels: ["email"] },
});

try {
  const request = {
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: {
      submissionId,
      answers: {
        needs: ["quotes", "reservations"],
        channel: "whatsapp",
        interaction: "ai",
        extras: ["documents"],
        hosting: "managed",
        websiteScope: "complete",
      },
      contact: {
        name: "Cliente de integración",
        company: "Mercamicro Test",
        email: "integration-test@example.invalid",
        phone: "+34 600 000 000",
        observations: "Registro efímero para validar migraciones y outbox.",
        website: "",
      },
      pagePath: "/",
      locale: "es-ES",
    },
  };

  const first = await app.inject(request);
  const duplicate = await app.inject(request);
  assert.equal(first.statusCode, 202);
  assert.equal(duplicate.statusCode, 202);
  assert.equal(duplicate.json().reference, first.json().reference);
  assert.equal(first.json().quote.implementation.total, 2_860);
  assert.equal(first.json().quote.taxIncluded, false);

  const [leadCount] = await store.sql`
    SELECT count(*)::integer AS count
    FROM sales.budget_leads
    WHERE submission_id = ${submissionId}
  `;
  const [jobCount] = await store.sql`
    SELECT count(*)::integer AS count
    FROM sales.notification_jobs AS jobs
    JOIN sales.budget_leads AS leads ON leads.id = jobs.lead_id
    WHERE leads.submission_id = ${submissionId}
  `;
  const [notificationJob] = await store.sql`
    SELECT jobs.id
    FROM sales.notification_jobs AS jobs
    JOIN sales.budget_leads AS leads ON leads.id = jobs.lead_id
    WHERE leads.submission_id = ${submissionId}
  `;
  const migrations = await store.sql`
    SELECT filename FROM platform.schema_migrations ORDER BY filename
  `;

  assert.equal(leadCount.count, 1);
  assert.equal(jobCount.count, 1);
  await store.markNotificationSent({
    id: notificationJob.id,
    providerMessageId: "integration-check",
  });
  const [sentJob] = await store.sql`
    SELECT status, payload
    FROM sales.notification_jobs
    WHERE id = ${notificationJob.id}
  `;
  assert.equal(sentJob.status, "sent");
  assert.deepEqual(sentJob.payload, {});
  assert.deepEqual(
    migrations.map(({ filename }) => filename),
    ["001_chatbot.sql", "002_sales_leads.sql"],
  );
  console.log("PostgreSQL check OK: migraciones, lead idempotente y outbox saneado.");
} finally {
  await app.close();
}
