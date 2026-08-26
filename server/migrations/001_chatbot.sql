CREATE SCHEMA IF NOT EXISTS chatbot;

CREATE TABLE IF NOT EXISTS chatbot.conversations (
  id uuid PRIMARY KEY,
  tenant_slug text NOT NULL,
  bot_slug text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('web', 'telegram')),
  external_id text,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS conversations_external_channel_unique
  ON chatbot.conversations (tenant_slug, bot_slug, channel, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS conversations_tenant_updated_idx
  ON chatbot.conversations (tenant_slug, updated_at DESC);

CREATE TABLE IF NOT EXISTS chatbot.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id uuid NOT NULL
    REFERENCES chatbot.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (char_length(content) <= 4000),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON chatbot.messages (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS chatbot.estimates (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL UNIQUE
    REFERENCES chatbot.conversations(id) ON DELETE CASCADE,
  tenant_slug text NOT NULL,
  service_id text NOT NULL,
  input_values jsonb NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS estimates_tenant_created_idx
  ON chatbot.estimates (tenant_slug, created_at DESC);

CREATE TABLE IF NOT EXISTS chatbot.webhook_updates (
  tenant_slug text NOT NULL,
  bot_slug text NOT NULL,
  update_id bigint NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_slug, bot_slug, update_id)
);

COMMENT ON SCHEMA chatbot IS
  'Conversaciones aisladas por tenant para la plataforma de chatbots Mercamicro.';
