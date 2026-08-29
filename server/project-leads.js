import { randomUUID } from "node:crypto";
import {
  CHANNEL_OPTIONS,
  EXTRA_OPTIONS,
  HOSTING_OPTIONS,
  INTERACTION_OPTIONS,
  NEED_OPTIONS,
  WEBSITE_SCOPE_OPTIONS,
} from "../src/project-catalog.js";
import { calculateProjectQuote } from "../src/project-pricing.js";
import { TENANT, hostWithoutPort } from "./tenant-config.js";

const ids = (options) => options.map(({ id }) => id);
const NOTIFICATION_CHANNELS = new Set(["email", "telegram", "webhook"]);

export const PROJECT_LEAD_BODY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["submissionId", "answers", "contact"],
  properties: {
    submissionId: { type: "string", format: "uuid" },
    answers: {
      type: "object",
      additionalProperties: false,
      required: ["needs", "channel", "interaction", "extras", "hosting", "websiteScope"],
      properties: {
        needs: {
          type: "array",
          minItems: 1,
          maxItems: NEED_OPTIONS.length,
          uniqueItems: true,
          items: { type: "string", enum: ids(NEED_OPTIONS) },
        },
        channel: { type: "string", enum: ids(CHANNEL_OPTIONS) },
        interaction: { type: "string", enum: ids(INTERACTION_OPTIONS) },
        extras: {
          type: "array",
          maxItems: EXTRA_OPTIONS.length,
          uniqueItems: true,
          items: { type: "string", enum: ids(EXTRA_OPTIONS) },
        },
        hosting: { type: "string", enum: ids(HOSTING_OPTIONS) },
        websiteScope: { type: "string", enum: ids(WEBSITE_SCOPE_OPTIONS) },
      },
    },
    contact: {
      type: "object",
      additionalProperties: false,
      required: ["name", "email", "phone"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          pattern: "^(?=.*\\S)[^\\u0000-\\u001F\\u007F]+$",
        },
        company: {
          type: "string",
          maxLength: 160,
          pattern: "^[^\\u0000-\\u001F\\u007F]*$",
        },
        email: { type: "string", minLength: 3, maxLength: 254, format: "email" },
        phone: {
          type: "string",
          minLength: 6,
          maxLength: 40,
          pattern: "^[0-9+(). /-]+$",
        },
        observations: {
          type: "string",
          maxLength: 2000,
          pattern: "^[^\\u0000\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]*$",
        },
        website: { type: "string", maxLength: 200 },
      },
    },
    pagePath: {
      type: "string",
      maxLength: 500,
      pattern: "^/[^\\u0000-\\u001F\\u007F]*$",
    },
    locale: {
      type: "string",
      minLength: 2,
      maxLength: 20,
      pattern: "^[A-Za-z0-9-]+$",
    },
  },
};

function requestHost(request) {
  return hostWithoutPort(request.headers["x-forwarded-host"] || request.headers.host);
}

function singleLine(value = "") {
  return String(value).trim().replace(/\s+/g, " ");
}

function normalizeContact(input) {
  return {
    name: singleLine(input.name),
    company: singleLine(input.company),
    email: singleLine(input.email).toLowerCase(),
    phone: singleLine(input.phone),
    observations: String(input.observations || "").trim(),
  };
}

function cents(amount) {
  return Math.round(Number(amount) * 100);
}

function publicReference(id) {
  return `MM-${id.slice(0, 8).toUpperCase()}`;
}

function notificationPayload(lead) {
  return {
    schemaVersion: 1,
    reference: publicReference(lead.id),
    submittedAt: lead.submittedAt,
    contact: lead.contact,
    answers: lead.answers,
    selectedServices: lead.selectedServices,
    selectedChannels: lead.selectedChannels,
    selectedExtras: lead.selectedExtras,
    quote: lead.quote,
    pagePath: lead.pagePath,
    locale: lead.locale,
  };
}

export async function registerProjectLeadRoutes(
  app,
  {
    store,
    notificationChannels = [],
    notificationTargetKey = "sales",
  },
) {
  const channels = [...new Set(notificationChannels)].filter((channel) =>
    NOTIFICATION_CHANNELS.has(channel),
  );
  const allowedHosts = new Set(TENANT.projectLeadAllowedHosts);

  app.post(
    "/api/project-leads",
    {
      config: { rateLimit: { max: 6, timeWindow: "1 minute" } },
      schema: { body: PROJECT_LEAD_BODY_SCHEMA },
    },
    async (request, reply) => {
      if (!allowedHosts.has(requestHost(request))) {
        return reply.code(421).send({ error: "host_not_allowed" });
      }
      if (request.body.contact.website?.trim()) {
        return reply.code(400).send({ error: "invalid_request" });
      }

      const contact = normalizeContact(request.body.contact);
      if (!contact.name || !contact.email || !contact.phone) {
        return reply.code(400).send({ error: "invalid_request" });
      }

      const quote = calculateProjectQuote(request.body.answers);
      const id = randomUUID();
      const submittedAt = new Date().toISOString();
      const lead = {
        id,
        tenantSlug: TENANT.slug,
        submissionId: request.body.submissionId,
        submittedAt,
        contact,
        answers: quote.answers,
        selectedServices: quote.needs,
        selectedChannels: quote.channel ? [quote.channel] : [],
        selectedExtras: quote.extras,
        recommendedPackageId: quote.package.id,
        quote,
        implementationCents: cents(quote.implementation.total),
        monthlyCents: cents(quote.monthly.total),
        totalExVatCents: cents(quote.implementation.total),
        currency: quote.currency,
        catalogVersion: quote.version,
        externalCosts: quote.externalConsumptions,
        pagePath: request.body.pagePath || "/",
        locale: request.body.locale || "es",
      };
      const payload = notificationPayload(lead);
      const stored = await store.saveCompletedLead({
        lead,
        notificationJobs: channels.map((channel) => ({
          channel,
          targetKey: notificationTargetKey,
          payload,
        })),
      });

      return reply.code(202).send({
        accepted: true,
        reference: stored.reference,
        submittedAt: stored.submittedAt,
        quote: stored.quote,
      });
    },
  );
}
