import { randomUUID } from "node:crypto";

export class MemoryStore {
  constructor() {
    this.conversations = new Map();
    this.externalConversations = new Map();
    this.messages = [];
    this.estimates = new Map();
    this.updates = new Set();
    this.leads = new Map();
    this.leadSubmissions = new Map();
    this.notificationJobs = new Map();
  }

  async initialize() {}

  async getOrCreateConversation({
    id,
    tenantSlug,
    botSlug,
    channel,
    externalId,
    initialState,
    metadata = {},
  }) {
    const existing = id ? this.conversations.get(id) : null;
    if (
      existing &&
      existing.tenantSlug === tenantSlug &&
      existing.botSlug === botSlug &&
      existing.channel === channel
    ) {
      return structuredClone(existing);
    }

    const externalKey = externalId
      ? `${tenantSlug}:${botSlug}:${channel}:${externalId}`
      : null;
    const externalConversationId = externalKey
      ? this.externalConversations.get(externalKey)
      : null;
    if (externalConversationId) {
      return structuredClone(this.conversations.get(externalConversationId));
    }

    const conversation = {
      id: randomUUID(),
      tenantSlug,
      botSlug,
      channel,
      externalId: externalId || null,
      state: structuredClone(initialState),
      metadata: structuredClone(metadata),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(conversation.id, conversation);
    if (externalKey) this.externalConversations.set(externalKey, conversation.id);
    return structuredClone(conversation);
  }

  async addMessage({ conversationId, role, content, metadata = {} }) {
    this.messages.push({
      id: this.messages.length + 1,
      conversationId,
      role,
      content,
      metadata: structuredClone(metadata),
      createdAt: new Date().toISOString(),
    });
  }

  async saveState(conversationId, state) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;
    conversation.state = structuredClone(state);
    conversation.updatedAt = new Date().toISOString();
  }

  async saveEstimate({ conversationId, tenantSlug, serviceId, values, estimate }) {
    this.estimates.set(conversationId, {
      conversationId,
      tenantSlug,
      serviceId,
      values: structuredClone(values),
      estimate: structuredClone(estimate),
      createdAt: new Date().toISOString(),
    });
  }

  async claimUpdate({ tenantSlug, botSlug, updateId }) {
    const key = `${tenantSlug}:${botSlug}:${updateId}`;
    if (this.updates.has(key)) return false;
    this.updates.add(key);
    return true;
  }

  async saveCompletedLead({ lead, notificationJobs = [] }) {
    const key = `${lead.tenantSlug}:${lead.submissionId}`;
    const existingId = this.leadSubmissions.get(key);
    if (existingId) {
      const existing = this.leads.get(existingId);
      return { ...structuredClone(existing), created: false };
    }

    const stored = {
      ...structuredClone(lead),
      submittedAt: lead.submittedAt || new Date().toISOString(),
      reference: `MM-${lead.id.slice(0, 8).toUpperCase()}`,
    };
    this.leads.set(lead.id, stored);
    this.leadSubmissions.set(key, lead.id);

    for (const job of notificationJobs) {
      const id = randomUUID();
      this.notificationJobs.set(id, {
        id,
        leadId: lead.id,
        channel: job.channel,
        targetKey: job.targetKey,
        payload: structuredClone(job.payload),
        attempts: 0,
        status: "pending",
        nextAttemptAt: Date.now(),
        lockedAt: null,
      });
    }

    return { ...structuredClone(stored), created: true };
  }

  async claimNotificationJobs({ limit = 10 }) {
    const jobs = [];
    for (const job of this.notificationJobs.values()) {
      if (jobs.length >= limit) break;
      const stale = job.status === "processing" && job.lockedAt < Date.now() - 10 * 60 * 1_000;
      const ready = ["pending", "retry"].includes(job.status) && job.nextAttemptAt <= Date.now();
      if (!ready && !stale) continue;
      job.status = "processing";
      job.attempts += 1;
      job.lockedAt = Date.now();
      jobs.push(structuredClone(job));
    }
    return jobs;
  }

  async markNotificationSent({ id, providerMessageId = "" }) {
    const job = this.notificationJobs.get(id);
    if (!job) return;
    job.status = "sent";
    job.providerMessageId = providerMessageId;
    job.payload = {};
    job.lockedAt = null;
  }

  async markNotificationFailed({ id, error, dead = false, nextAttemptAt }) {
    const job = this.notificationJobs.get(id);
    if (!job) return;
    job.status = dead ? "dead" : "retry";
    job.lastError = String(error || "notification_failed").slice(0, 500);
    job.nextAttemptAt = new Date(nextAttemptAt).getTime();
    job.lockedAt = null;
  }

  async health() {
    return { ok: true, mode: "memory" };
  }

  async close() {}
}
