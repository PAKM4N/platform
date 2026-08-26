#!/usr/bin/env sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$repo_root"

if [ -n "$(git status --porcelain)" ]; then
  echo "La candidata exige un working tree limpio." >&2
  exit 1
fi

branch="$(git branch --show-current)"
test "$branch" = main || { echo "La candidata solo puede construirse desde main." >&2; exit 1; }
git fetch --quiet origin main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" || {
  echo "main debe coincidir con origin/main." >&2
  exit 1
}

sha="$(git rev-parse HEAD)"
short_sha="$(git rev-parse --short=12 HEAD)"
tag="release-${short_sha}"
release_dir="/srv/platform/dev/releases/${sha}"
mkdir -p "$release_dir"

docker build --pull=false -f Dockerfile.web -t "mercamicro/presupuestos-web:${tag}" .
docker build --pull=false -f Dockerfile.api -t "mercamicro/presupuestos-api:${tag}" .
docker build --pull=false -f Dockerfile.presupuestos -t "mercamicro/presupuestos-marketing:${tag}" .

demo_web_id="$(docker image inspect -f '{{.Id}}' "mercamicro/presupuestos-web:${tag}")"
api_id="$(docker image inspect -f '{{.Id}}' "mercamicro/presupuestos-api:${tag}")"
budget_web_id="$(docker image inspect -f '{{.Id}}' "mercamicro/presupuestos-marketing:${tag}")"

printf '%s\n' \
  "GIT_SHA=${sha}" \
  "RELEASE_TAG=${tag}" \
  "DEMO_WEB_IMAGE=mercamicro/presupuestos-web:${tag}" \
  "DEMO_WEB_ID=${demo_web_id}" \
  "DEMO_API_IMAGE=mercamicro/presupuestos-api:${tag}" \
  "DEMO_API_ID=${api_id}" \
  "BUDGET_WEB_IMAGE=mercamicro/presupuestos-marketing:${tag}" \
  "BUDGET_WEB_ID=${budget_web_id}" > "${release_dir}/release.env"
chmod 600 "${release_dir}/release.env"

echo "Candidata construida: ${sha}"
echo "Manifiesto: ${release_dir}/release.env"
