CREATE SCHEMA IF NOT EXISTS sales;

CREATE TABLE IF NOT EXISTS sales.budget_leads (
  id uuid PRIMARY KEY,
  tenant_slug text NOT NULL,
  submission_id uuid NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 1 AND 120),
  company text CHECK (company IS NULL OR char_length(company) <= 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 6 AND 40),
  observations text CHECK (observations IS NULL OR char_length(observations) <= 2000),
  selected_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_extras jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL,
  recommended_package_id text NOT NULL,
  quote_snapshot jsonb NOT NULL,
  implementation_cents bigint NOT NULL CHECK (implementation_cents >= 0),
  monthly_cents bigint NOT NULL CHECK (monthly_cents >= 0),
  total_ex_vat_cents bigint NOT NULL CHECK (total_ex_vat_cents >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  pricing_catalog_version text NOT NULL,
  external_costs jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_path text NOT NULL DEFAULT '/',
  locale text NOT NULL DEFAULT 'es',
  UNIQUE (tenant_slug, submission_id)
);

CREATE INDEX IF NOT EXISTS budget_leads_tenant_submitted_idx
  ON sales.budget_leads (tenant_slug, submitted_at DESC);

CREATE TABLE IF NOT EXISTS sales.notification_jobs (
  id uuid PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES sales.budget_leads(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'telegram', 'webhook')),
  target_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'retry', 'sent', 'dead')),
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  last_error text,
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE (lead_id, channel, target_key)
);

CREATE INDEX IF NOT EXISTS notification_jobs_pending_idx
  ON sales.notification_jobs (next_attempt_at, created_at)
  WHERE status IN ('pending', 'retry');

COMMENT ON SCHEMA sales IS
  'Leads comerciales completados y trabajos de notificación desacoplados.';
