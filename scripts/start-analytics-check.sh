#!/usr/bin/env bash
# Starts a disposable Umami acceptance fixture, never the production stack.
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
fixture_file="$repo_root/deploy/testing/compose.analytics.yaml"
fixture_project=mercamicro-analytics-check
fixture_image=docker.umami.is/umami-software/umami@sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367

if [[ -n "$(docker ps -aq --filter "label=com.docker.compose.project=$fixture_project")" ]]; then
  echo "Existing analytics-check containers found; inspect or remove that fixture before restarting." >&2
  exit 1
fi
if [[ -n "$(ss -H -ltn '( sport = :18083 )')" ]]; then
  echo "Port 18083 is already in use; no containers were started." >&2
  exit 1
fi

# Local images only: this test does not update or pull a production image.
docker image inspect "$fixture_image" >/dev/null
docker image inspect postgres:17-alpine >/dev/null
docker compose -f "$fixture_file" -p "$fixture_project" up -d --wait --wait-timeout 120

# These website identifiers exist only in the new, tmpfs-backed fixture DB.
# No production rows, users, sessions, credentials or events are copied.
docker compose -f "$fixture_file" -p "$fixture_project" exec -T postgres \
  psql -X -v ON_ERROR_STOP=1 -U analytics_check -d analytics_check <<'SQL'
INSERT INTO website (website_id, name, domain) VALUES
  ('c244e78e-b481-4675-a1b4-e27f3c7585e3', 'Fixture Demos', 'demos.mercamicro.es'),
  ('9831d3ca-7211-4561-b68d-f934411deb74', 'Fixture Presupuestos', 'presupuestos.mercamicro.es');
SELECT count(*) AS applied_migrations FROM _prisma_migrations WHERE finished_at IS NOT NULL;
SELECT website_id, domain, recorder_enabled FROM website ORDER BY domain;
SELECT count(*) AS initial_events FROM website_event;
SQL

docker compose -f "$fixture_file" -p "$fixture_project" exec -T umami \
  node -p '"Umami " + require("./package.json").version'

curl --fail --silent --show-error http://127.0.0.1:18083/api/heartbeat >/dev/null
echo "Isolated fixture ready: http://127.0.0.1:18083"
echo "Cleanup (discards synthetic data): docker compose -f deploy/testing/compose.analytics.yaml down"
