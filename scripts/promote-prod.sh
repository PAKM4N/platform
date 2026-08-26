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

previous_web="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-web-1)"
previous_api="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-api-1)"
previous_budget=""
if docker inspect mercamicro-presupuestos-budget_web-1 >/dev/null 2>&1; then
  previous_budget="$(docker inspect -f '{{.Config.Image}}' mercamicro-presupuestos-budget_web-1)"
fi

cp /srv/platform/config/caddy/Caddyfile "$prod_release_dir/Caddyfile.before"
printf '%s\n' \
  "PREVIOUS_DEMO_WEB_IMAGE=${previous_web}" \
  "PREVIOUS_DEMO_API_IMAGE=${previous_api}" \
  "PREVIOUS_BUDGET_WEB_IMAGE=${previous_budget}" > "$prod_release_dir/previous.env"
chmod 600 "$prod_release_dir/previous.env"

docker run --rm -v "$repo_root/deploy/prod/Caddyfile:/etc/caddy/Caddyfile:ro" caddy:2.11.4-alpine caddy validate --config /etc/caddy/Caddyfile

export DEMO_WEB_IMAGE DEMO_API_IMAGE BUDGET_WEB_IMAGE
docker compose -p mercamicro-presupuestos -f "$repo_root/deploy/prod/compose.yaml" up -d --no-build --wait

install -m 640 "$repo_root/deploy/prod/Caddyfile" /srv/platform/config/caddy/Caddyfile
docker exec platform-edge-caddy-1 caddy reload --config /etc/caddy/Caddyfile

tls_ready=false
for attempt in {1..24}; do
  if curl --fail --silent --show-error --max-time 10 "https://demos.mercamicro.es/health" >/dev/null 2>&1 && \
     curl --fail --silent --show-error --max-time 10 "https://presupuestos.mercamicro.es/" | grep -q "Presupuesta tu chatbot"; then
    tls_ready=true
    break
  fi
  echo "Esperando certificados y rutas HTTPS (${attempt}/24)..."
  sleep 5
done

if [[ "$tls_ready" != true ]] || \
   ! "$repo_root/scripts/smoke-test.sh" "https://demos.mercamicro.es" || \
   ! curl --fail --silent --show-error "https://presupuestos.mercamicro.es/" | grep -q "Presupuesta tu chatbot"; then
  echo "Falló el smoke test. Restaurando Caddy y las imágenes anteriores." >&2
  install -m 640 "$prod_release_dir/Caddyfile.before" /srv/platform/config/caddy/Caddyfile
  docker exec platform-edge-caddy-1 caddy reload --config /etc/caddy/Caddyfile || true

  export DEMO_WEB_IMAGE="$previous_web" DEMO_API_IMAGE="$previous_api"
  if [[ -n "$previous_budget" ]]; then
    export BUDGET_WEB_IMAGE="$previous_budget"
    docker compose -p mercamicro-presupuestos -f "$repo_root/deploy/prod/compose.yaml" up -d --no-build --wait || true
  else
    docker compose -p mercamicro-presupuestos -f "$repo_root/deploy/prod/compose.yaml" stop budget_web || true
    docker compose -p mercamicro-presupuestos -f "$repo_root/deploy/prod/compose.yaml" rm -f budget_web || true
    export BUDGET_WEB_IMAGE="$BUDGET_WEB_IMAGE"
    docker compose -p mercamicro-presupuestos -f "$repo_root/deploy/prod/compose.yaml" up -d --no-build --wait api web || true
  fi
  exit 1
fi

cp "$release_file" "$prod_release_dir/release.env"
echo "Producción ejecuta ${GIT_SHA}."
