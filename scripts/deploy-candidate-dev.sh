#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
sha="${1:-$(git -C "$repo_root" rev-parse HEAD)}"
release_file="/srv/platform/dev/releases/${sha}/release.env"
test -f "$release_file" || { echo "No existe la candidata ${sha}." >&2; exit 1; }

set -a
. "$release_file"
set +a

test "$(docker image inspect -f '{{.Id}}' "$DEMO_WEB_IMAGE")" = "$DEMO_WEB_ID"
test "$(docker image inspect -f '{{.Id}}' "$DEMO_API_IMAGE")" = "$DEMO_API_ID"
test "$(docker image inspect -f '{{.Id}}' "$BUDGET_WEB_IMAGE")" = "$BUDGET_WEB_ID"

export DEV_IMAGE_TAG="$RELEASE_TAG"
docker compose -f "$repo_root/deploy/dev/compose.yaml" up -d --no-build --wait
docker compose -f "$repo_root/deploy/dev/compose.yaml" up -d --no-build --no-deps --force-recreate --wait gateway
"$repo_root/scripts/smoke-test.sh" "http://127.0.0.1:${DEV_HTTP_PORT:-18080}"
curl --fail --silent --show-error "http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}/" | grep -q "Webs y automatizaciones a medida"
lead_options_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
  --request OPTIONS \
  --header "Origin: http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}" \
  --header 'Access-Control-Request-Method: POST' \
  "http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}/api/project-leads")"
test "$lead_options_status" = 204 || {
  echo "La API de solicitudes de presupuesto no responde a través del gateway DEV (HTTP ${lead_options_status})." >&2
  exit 1
}

echo "DEV ejecuta la candidata ${GIT_SHA} con las imágenes verificadas."
