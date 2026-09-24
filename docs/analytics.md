# Umami en Mercamicro

## Integración

Cada aplicación carga una sola etiqueta `script` con `defer` desde su HTML de
entrada. No hay inyección de scripts desde componentes React ni llamadas
manuales a `umami.track()` para cada render.

| Aplicación | Entrada | Website ID | Dominio permitido |
| --- | --- | --- | --- |
| Demos | `index.html` | `c244e78e-b481-4675-a1b4-e27f3c7585e3` | `demos.mercamicro.es` |
| Presupuestos | `presupuestos/index.html` | `9831d3ca-7211-4561-b68d-f934411deb74` | `presupuestos.mercamicro.es` |

El origen del tracker es `https://stats.mercamicro.es/script.js`. `data-domains`
compara el hostname exacto: localhost, IP y otros subdominios no registran visitas.
DEV descarga el script, pero **no envía estadísticas**. Las mismas imágenes se
pueden promover de DEV a PROD, sin cambiar el HTML ni reconstruirlas.

La versión instalada comprobada el 24 de septiembre de 2026 es **Umami 3.4.0**,
imagen `sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367`.
Los dos registros de website existen, con sus dominios correctos y grabación de
sesiones desactivada. No se instrumentan campos, respuestas, contactos ni
envíos de formularios. El tracker no usa cookies; las URL y referentes sí forman
parte de sus pageviews y no deben contener datos personales.

## Navegación SPA

El script instalado intercepta `history.pushState` y `history.replaceState`,
con un retardo de 300 ms, pero no escucha `popstate`. Por eso `usePathname` en
`src/RouterApp.jsx` sincroniza mediante `replaceState` la URL de los eventos
reales de atrás/adelante (`event.isTrusted`), solo si Umami está disponible.

Los eventos sintéticos que emite nuestro router después de `pushState` se
ignoran en ese puente: se evita duplicar visitas y sobrescribir el referente
antes del envío pendiente. Cambiar respuestas o avanzar en el configurador sin
cambiar la ruta no genera pageviews adicionales. Si se actualiza Umami, repetir
las pruebas de navegación y referentes; no asumir que sus hooks son idénticos.

## Caddy y separación del panel

El archivo versionado para la promoción es `deploy/prod/Caddyfile`.

- `stats.mercamicro.es`: solo `GET/HEAD /script.js` y
  `POST/OPTIONS /api/send`. Las demás rutas y métodos devuelven 403, también
  `/`, `/login`, `/dashboard` y las API administrativas.
- Umami responde a la preflight con 204 y cabeceras CORS propias. El tracker
  envía JSON con `x-umami-website-id`, `x-umami-hostname` y, desde el segundo
  envío, `x-umami-cache`, usando `credentials: omit`. No se duplican cabeceras
  CORS en Caddy ni se abre el comodín `/api/*`.
- `umami.mercamicro.es`: panel con `tls internal`, limitado por IP remota a
  `192.168.15.0/24` y `172.22.121.0/24`. Requiere resolución privada y confianza
  en la CA interna de Caddy. No se confía en un `X-Forwarded-For` enviado por
  el cliente para conceder acceso.
- Se conserva sin cambios funcionales el bloque de n8n activo, antes ausente
  de Git, para que la siguiente promoción no elimine ese servicio.

### Hallazgo previo a la promoción

El 24 de septiembre, el Caddy activo solo permitía `POST /api/send` y devolvía
403 a `OPTIONS`, impidiendo el tracking cross-origin. El Caddyfile de Git
tampoco incluía los bloques activos de stats, umami ni n8n. Se han incorporado
al repositorio; el único cambio funcional respecto al activo es permitir
`OPTIONS /api/send`. **No se aplica al servidor hasta autorizar la promoción.**

Las comprobaciones del tracker público usan su DNS y HTTPS reales desde el
servidor. La restricción del panel se comprueba desde una dirección permitida
y desde un cliente Docker en una red no autorizada, sin suplantar IP. Esto no
sustituye una comprobación independiente desde una conexión WAN ajena al host.

## Pruebas reproducibles

Con la candidata desplegada en DEV en 18080/18081:

```sh
docker build -f deploy/testing/Dockerfile.browser -t mercamicro/ux-browser:local .
docker run --rm --network host -v "$PWD:/app" -w /app \
  mercamicro/ux-browser:local node scripts/check-analytics.mjs
```

La prueba descarga el tracker público real y comprueba sus atributos y una
sola carga por documento; localhost/IP no envían eventos. Después simula los
dominios de producción **solo dentro del navegador de prueba**, sirviendo sus
documentos y assets desde DEV, e intercepta todos los envíos al colector público.
Comprueba primera visita, navegación SPA, atrás/adelante, referentes, ausencia
de duplicados y funcionamiento de ambas webs si el tracker no está disponible.
No visita el panel, envía leads ni registra estadísticas en producción.

Para comprobar recepción y persistencia en Umami sin contaminar los datos reales:

```sh
bash scripts/start-analytics-check.sh
docker run --rm --network host -v "$PWD:/app" -w /app \
  -e UMAMI_CHECK_URL=http://127.0.0.1:18083 \
  mercamicro/ux-browser:local node scripts/check-analytics.mjs
docker compose -f deploy/testing/compose.analytics.yaml exec -T postgres \
  psql -U analytics_check -d analytics_check -c \
  'SELECT website_id, url_path, count(*) FROM website_event GROUP BY website_id, url_path ORDER BY website_id, url_path;'
docker compose -f deploy/testing/compose.analytics.yaml down
```

El fixture usa la misma imagen de Umami y PostgreSQL efímero, sin datos,
credenciales, volúmenes ni redes de producción. Solo publica el puerto 18083
en loopback. Sus claves son de prueba y no deben reutilizarse. Al detenerlo se
pierden sus eventos sintéticos; no se elimina ningún dato de producción.

El modo de ingestión sustituye el origen del script **solo en el documento de
prueba** para dirigirlo a ese fixture. Usa el navegador real para verificar
preflight y POST cross-origin, respuesta 200 y eventos persistidos. El HTML
normal de DEV se verifica por separado sin alteraciones ni excepciones a
`data-domains`.

## Promoción

Usar el procedimiento existente: commit y push a `main`, `build-candidate.sh`,
`deploy-candidate-dev.sh <SHA>`, pruebas, autorización expresa y finalmente
`CONFIRM_PRODUCTION=YES ./scripts/promote-prod.sh <SHA>`.

La promoción debe incluir el Caddyfile candidato, no solo las imágenes web:
sin `OPTIONS /api/send`, el navegador no podrá registrar visitas. El script
habitual conserva copia de la base y Caddy anteriores y revierte las imágenes
y configuración si fallan sus comprobaciones.

Después de promover, verificar nuevamente script público, preflight desde
ambos orígenes, aislamiento del panel y primera visita real en cada web. La
ausencia de eventos al navegar DEV es el resultado esperado, no un fallo.

Referencias: [configuración del tracker](https://docs.umami.is/docs/tracker-configuration)
y [navegación SPA](https://docs.umami.is/docs/guides/track-single-page-apps).
El código de la versión instalada prevalece para los detalles de hooks y rutas.
