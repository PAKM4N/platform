#!/usr/bin/env sh
set -eu

base_url="${1:-https://presupuestos.mercamicro.es}"
body="$(jq -cn '{message:"limpieza",pagePath:"/",locale:"es",website:""}')"

curl --fail --silent --show-error "${base_url}/health" >/dev/null
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --data "$body" \
  "${base_url}/api/chat/messages" | jq -e \
  '.conversationId and (.message | contains("cinco datos clave"))' >/dev/null

echo "Web y API responden correctamente en ${base_url}."
