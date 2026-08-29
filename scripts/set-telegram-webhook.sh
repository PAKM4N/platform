#!/usr/bin/env sh
set -eu

token_file="${TELEGRAM_BOT_TOKEN_FILE:-/srv/platform/secrets/mercamicro_presupuestos_telegram_token}"
secret_file="${TELEGRAM_WEBHOOK_SECRET_FILE:-/srv/platform/secrets/mercamicro_presupuestos_telegram_webhook_secret}"
webhook_url="${TELEGRAM_WEBHOOK_URL:-https://demo.mercamicro.es/api/telegram/mercamicro-presupuestos/asistente-presupuestos/webhook}"

if [ ! -s "$token_file" ] || [ ! -s "$secret_file" ]; then
  echo "Falta el token de Telegram o el secreto del webhook." >&2
  exit 1
fi

token="$(tr -d '\r\n' < "$token_file")"
secret="$(tr -d '\r\n' < "$secret_file")"

curl --fail --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "$(jq -cn --arg url "$webhook_url" --arg secret "$secret" \
    '{url:$url,secret_token:$secret,allowed_updates:["message"],drop_pending_updates:true}')" \
  "https://api.telegram.org/bot${token}/setWebhook" | jq

curl --fail --silent --show-error \
  "https://api.telegram.org/bot${token}/getWebhookInfo" | jq
