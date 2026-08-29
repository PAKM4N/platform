#!/usr/bin/env bash
set -euo pipefail

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
sha="${1:-}"
if [[ -z "$sha" || "${CONFIRM_PRODUCTION:-}" != "YES" ]]; then
  echo "Uso: CONFIRM_PRODUCTION=YES ./scripts/promote-prod.sh <SHA completo>" >&2
  exit 1
fi

release_file="/srv/platform/dev/releases/${sha}/release.env"
[[ -f "$release_file" ]] || { echo "No existe la candidata ${sha}." >&2; exit 1; }
set -a
. "$release_file"
set +a
[[ "$GIT_SHA" == "$sha" ]]

[[ "$(docker image inspect -f '{{.Id}}' "$DEMO_WEB_IMAGE")" == "$DEMO_WEB_ID" ]]
[[ "$(docker image inspect -f '{{.Id}}' "$DEMO_API_IMAGE")" == "$DEMO_API_ID" ]]
[[ "$(docker image inspect -f '{{.Id}}' "$BUDGET_WEB_IMAGE")" == "$BUDGET_WEB_ID" ]]

prod_release_dir="/srv/platform/prod/releases/${sha}"
mkdir -p "$prod_release_dir"
chmod 700 /srv/platform/prod "$prod_release_dir"

docker exec platform-core-postgres-1 \
  pg_dump -U chatbot -d chatbot_platform --format=custom \
  > "$prod_release_dir/chatbot_platform.before.dump"
chmod 600 "$prod_release_dir/chatbot_platform.before.dump"
[[ -s "$prod_release_dir/chatbot_platform.before.dump" ]]

apply_caddy_file() {
  local source_file="$1"
  cp "$source_file" /srv/platform/config/caddy/Caddyfile
  chmod 640 /srv/platform/config/caddy/Caddyfile

  local host_hash container_hash
  host_hash="$(sha256sum /srv/platform/config/caddy/Caddyfile | cut -d' ' -f1)"
  container_hash="$(docker exec platform-edge-caddy-1 sha256sum /etc/caddy/Caddyfile | cut -d' ' -f1)"
  if [[ "$host_hash" != "$container_hash" ]]; then
    docker compose -f /srv/platform/stacks/edge/compose.yaml up -d --force-recreate --wait
  else
    docker exec platform-edge-caddy-1 caddy reload --config /etc/caddy/Caddyfile
  fi
}

previous_web="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-web-1)"
previous_api="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-api-1)"
previous_budget=""
if docker inspect mercamicro-presupuestos-budget_web-1 >/dev/null 2>&1; then
  previous_budget="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-budget_web-1)"
fi

container_env() {
  docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' mercamicro-presupuestos-api-1 |
    awk -v prefix="$1=" 'index($0, prefix) == 1 { print substr($0, length(prefix) + 1); exit }'
}

previous_notifications_enabled="$(container_env LEAD_NOTIFICATIONS_ENABLED)"
rollback_compose_options=(
  -p mercamicro-presupuestos
  -f "$repo_root/deploy/prod/compose.yaml"
)
if [[ "$previous_notifications_enabled" == "true" ]]; then
  previous_lead_email_from="$(container_env LEAD_EMAIL_FROM)"
  previous_lead_email_to="$(container_env LEAD_EMAIL_TO)"
  previous_lead_smtp_host="$(container_env LEAD_SMTP_HOST)"
  previous_lead_smtp_port="$(container_env LEAD_SMTP_PORT)"
  previous_lead_smtp_secure="$(container_env LEAD_SMTP_SECURE)"
  previous_lead_smtp_require_tls="$(container_env LEAD_SMTP_REQUIRE_TLS)"
  [[ -n "$previous_lead_email_from" && -n "$previous_lead_email_to" && -n "$previous_lead_smtp_host" ]] || {
    echo "No se puede preparar el rollback de la configuración SMTP activa." >&2
    exit 1
  }
  rollback_compose_options+=( -f "$repo_root/deploy/prod/compose.notifications.yaml" )
fi

cp /srv/platform/config/caddy/Caddyfile "$prod_release_dir/Caddyfile.before"
printf '%s\n' \
  "PREVIOUS_DEMO_WEB_IMAGE=${previous_web}" \
  "PREVIOUS_DEMO_API_IMAGE=${previous_api}" \
  "PREVIOUS_BUDGET_WEB_IMAGE=${previous_budget}" \
  "PREVIOUS_LEAD_NOTIFICATIONS_ENABLED=${previous_notifications_enabled:-false}" > "$prod_release_dir/previous.env"
chmod 600 "$prod_release_dir/previous.env"

docker run --rm -v "$repo_root/deploy/prod/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2.11.4-alpine caddy validate --config /etc/caddy/Caddyfile

export DEMO_WEB_IMAGE DEMO_API_IMAGE BUDGET_WEB_IMAGE
compose_options=(
  -p mercamicro-presupuestos
  -f "$repo_root/deploy/prod/compose.yaml"
)
if [[ "${ENABLE_LEAD_NOTIFICATIONS:-NO}" == "YES" ]]; then
  compose_options+=( -f "$repo_root/deploy/prod/compose.notifications.yaml" )
fi

restore_previous_services() {
  export DEMO_WEB_IMAGE="$previous_web" DEMO_API_IMAGE="$previous_api"
  if [[ "$previous_notifications_enabled" == "true" ]]; then
    export LEAD_EMAIL_FROM="$previous_lead_email_from"
    export LEAD_EMAIL_TO="$previous_lead_email_to"
    export LEAD_SMTP_HOST="$previous_lead_smtp_host"
    export LEAD_SMTP_PORT="${previous_lead_smtp_port:-587}"
    export LEAD_SMTP_SECURE="${previous_lead_smtp_secure:-false}"
    export LEAD_SMTP_REQUIRE_TLS="${previous_lead_smtp_require_tls:-true}"
  fi
  if [[ -n "$previous_budget" ]]; then
    export BUDGET_WEB_IMAGE="$previous_budget"
    docker compose "${rollback_compose_options[@]}" up -d --no-build --wait
  else
    docker compose "${rollback_compose_options[@]}" stop budget_web || true
    docker compose "${rollback_compose_options[@]}" rm -f budget_web || true
    docker compose "${rollback_compose_options[@]}" up -d --no-build --wait api web
  fi
}

if ! docker compose "${compose_options[@]}" up -d --no-build --wait; then
  echo "Falló la activación de la candidata. Restaurando las imágenes anteriores." >&2
  restore_previous_services || true
  exit 1
fi

if ! apply_caddy_file "$repo_root/deploy/prod/Caddyfile"; then
  echo "Falló la activación de Caddy. Restaurando configuración e imágenes." >&2
  apply_caddy_file "$prod_release_dir/Caddyfile.before" || true
  restore_previous_services || true
  exit 1
fi

tls_ready=false
for attempt in {1..24}; do
  if curl --fail --silent --show-error --max-time 10 "https://demos.mercamicro.es/health" >/dev/null 2>&1 && \
     curl --fail --silent --show-error --max-time 10 "https://presupuestos.mercamicro.es/" | grep -q "Webs y automatizaciones a medida"; then
    tls_ready=true
    break
  fi
  echo "Esperando certificados y rutas HTTPS (${attempt}/24)..."
  sleep 5
done

project_lead_route_responds() {
  local status
  status="$(curl --silent --show-error --max-time 10 --output /dev/null --write-out '%{http_code}' \
    --header 'Content-Type: application/json' \
    --request POST \
    --data '{"submissionId":"00000000-0000-4000-8000-000000000001","answers":{"needs":["support"],"channel":"web","interaction":"rules","extras":[],"hosting":"own","websiteScope":"existing"},"contact":{"name":"Smoke Test","email":"smoke@example.invalid","phone":"+34000000","website":"bot"}}' \
    "https://presupuestos.mercamicro.es/api/project-leads" || true)"
  [[ "$status" == "400" ]]
}

if [[ "$tls_ready" != true ]] || \
   ! "$repo_root/scripts/smoke-test.sh" "https://demos.mercamicro.es" || \
   ! curl --fail --silent --show-error "https://presupuestos.mercamicro.es/" | grep -q "Webs y automatizaciones a medida" || \
   ! project_lead_route_responds; then
  echo "Falló el smoke test. Restaurando Caddy y las imágenes anteriores." >&2
  apply_caddy_file "$prod_release_dir/Caddyfile.before" || true
  restore_previous_services || true
  exit 1
fi

cp "$release_file" "$prod_release_dir/release.env"
echo "Producción ejecuta ${GIT_SHA}."
