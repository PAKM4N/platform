import { randomUUID } from "node:crypto";

export class MemoryStore {
  constructor() {
    this.conversations = new Map();
    this.externalConversations = new Map();
    this.messages = [];
    this.estimates = new Map();
    this.updates = new Set();
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

  async health() {
    return { ok: true, mode: "memory" };
  }

  async close() {}
}
