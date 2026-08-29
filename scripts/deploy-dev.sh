#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
compose_file="${repo_root}/deploy/dev/compose.yaml"
secret_dir=/srv/platform/dev/secrets

"${repo_root}/scripts/validate-isolation.sh" "$compose_file"

mkdir -p "$secret_dir"
chmod 700 /srv/platform/dev "$secret_dir"

for secret in postgres_password valkey_password
do
  secret_path="${secret_dir}/${secret}"
  if [ ! -s "$secret_path" ]; then
    umask 077
    openssl rand -base64 36 > "$secret_path"
  fi
  chmod 600 "$secret_path"
done

if [ -z "$(git -C "$repo_root" status --porcelain)" ]; then
  DEV_IMAGE_TAG="dev-$(git -C "$repo_root" rev-parse --short=12 HEAD)"
else
  DEV_IMAGE_TAG="dev-dirty-$(date -u +%Y%m%dT%H%M%SZ)"
fi
export DEV_IMAGE_TAG

docker compose -f "$compose_file" up -d --build --wait
"${repo_root}/scripts/smoke-test.sh" "http://127.0.0.1:${DEV_HTTP_PORT:-18080}"
curl --fail --silent --show-error "http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}/health" >/dev/null
curl --fail --silent --show-error "http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}/" | grep -q "Webs y automatizaciones a medida"

echo "DEV desplegado con etiqueta ${DEV_IMAGE_TAG}."
echo "Demo: http://127.0.0.1:${DEV_HTTP_PORT:-18080}"
echo "Presupuestos: http://127.0.0.1:${DEV_BUDGET_HTTP_PORT:-18081}"
