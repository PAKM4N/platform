# Revisión de experiencia de usuario — septiembre de 2026

## Cambios

- Biblioteca de 18 demos con búsqueda, filtros, estado sin resultados y enlaces
  al configurador comercial. Preguntas y resultados adaptados a cada intención:
  por ejemplo, comprar y devolver un pedido ya no siguen las mismas preguntas.
- Radio y selección múltiple accesibles, validación de fechas y cantidades,
  edición reversible, historial de retroceso y resultado con las respuestas.
- Siete simuladores con campos más legibles, valores de ejemplo editables,
  validación junto al campo y contacto opcional desplegable. Se distinguen
  claramente la simulación, el precio orientativo y una contratación real.
- Web comercial con muestra interactiva, explicación del desarrollo web,
  preguntas frecuentes, resumen imprimible y tratamiento de datos explicado.
  El configurador distingue importes calculados, web a valorar y costes externos.
- Contacto comercial con teléfono opcional, errores específicos y reintento que
  conserva la identidad de la solicitud. Cancelar una edición restaura la
  selección previa. Los datos personales no se guardan en el almacenamiento del
  configurador.
- Chat separado por sector, tolerante al bloqueo del almacenamiento y con plazo
  de espera. Permite reintentar cuando se alcanza el límite de mensajes; si un
  fallo de conexión impide confirmar el estado, pide reiniciar para no aplicar
  la misma respuesta a otra pregunta. Las respuestas ambiguas piden aclaración
  en lugar de seleccionar una opción o extra por accidente.
- Correos con etiquetas legibles, destinatario único y costes no incluidos
  identificados. La API confirma si se ha programado la copia del cliente, sin
  confundirlo con una entrega comprobada en su buzón.

## Verificación reproducible

- `npm run test:api`: pruebas de API, cálculo, motor y notificaciones.
- `scripts/check-postgres.mjs`: integración contra una base aislada; comprueba
  migraciones, teléfono opcional, dos trabajos independientes, idempotencia,
  conflictos y limpieza del contenido del trabajo después del envío simulado.
- `scripts/check-ux.mjs`: las 18 demos y los 7 simuladores en 1440 y 390 px
  (50 recorridos), más controles de desborde en 320, 768 y 1920 px, validación,
  búsqueda, retorno a la biblioteca y recuperación del chat sin almacenamiento.
- `scripts/visual-check-presupuestos.mjs`: cinco resoluciones, edición y
  cancelación, teclado, teléfono opcional, error/reintento, importes, impresión
  y almacenamiento bloqueado.
- `scripts/visual-check.mjs`: biblioteca, recorrido de inventario, enlaces
  sectoriales y desborde simétrico del carrusel en escritorio.
- Compilaciones de ambos sitios y exportación compatible con Sites.

Las pruebas de navegador interceptan los envíos. No mandan correos reales ni
crean solicitudes comerciales en producción. Las capturas se generan en
`.visual-check/` y no se versionan.

## Despliegue y compatibilidad

La migración `003_optional_lead_phone.sql` permite el teléfono vacío sin cambiar
los datos existentes. La versión anterior sigue funcionando con el esquema
ampliado. DEV continúa con SMTP desactivado; las notificaciones reales se
verificarán al promover la candidata aprobada.

Esta revisión comprueba los casos descritos en Chromium. No equivale a una
certificación de accesibilidad ni a una prueba manual en todos los navegadores,
dispositivos o proveedores de correo.
