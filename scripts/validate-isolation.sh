#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
compose_file="${1:-${repo_root}/deploy/dev/compose.yaml}"

test -f "$compose_file"

for forbidden in \
  /srv/platform/prod \
  /srv/platform/secrets \
  platform-postgres-data \
  platform-valkey-data \
  platform-backend \
  platform-edge
do
  if grep -Fq "$forbidden" "$compose_file"; then
    echo "Configuración DEV rechazada: referencia prohibida: $forbidden" >&2
    exit 1
  fi
done

docker compose -f "$compose_file" config >/dev/null
echo "Aislamiento DEV validado."
