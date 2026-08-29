# Arquitectura modular de Mercamicro

La plataforma mantiene dos experiencias web separadas, pero comparte los
módulos de dominio que deben producir resultados idénticos en navegador y API:

- `presupuestos.mercamicro.es`: configurador comercial y captación de leads.
- `demo.mercamicro.es`: biblioteca de demostraciones interactivas.

## Límites de los módulos

| Responsabilidad | Fuente principal | Regla |
| --- | --- | --- |
| Catálogo comercial | `src/project-catalog.js` | Es el único lugar con importes y opciones comerciales. |
| Cálculo | `src/project-pricing.js` | Función pura; normaliza respuestas y genera el desglose sin IVA. |
| Configurador | `presupuestos/src/ProjectConfigurator.jsx` | Pregunta por necesidades; no permite elegir directamente un paquete. |
| API de leads | `server/project-leads.js` | Valida y recalcula siempre; nunca confía en un precio enviado por el navegador. |
| Persistencia | `server/storage/*` y `server/migrations/*` | Guarda únicamente solicitudes terminadas e idempotentes. |
| Notificaciones | `server/notifications/*` | Consume una cola transaccional; el email es un adaptador reemplazable. |
| Catálogo de demos | `src/demo-catalog.js` | Define textos y pasos; no duplica componentes por sector. |
| Motor de demos | `src/demo-flow-engine.js` y `src/GenericDemoExperience.jsx` | Interpretan cualquier configuración del catálogo. |
| Integraciones | adaptadores bajo `server/` | SMTP ahora; Telegram o webhooks pueden añadirse sin cambiar el configurador. |

## Flujo del presupuesto

1. El navegador guarda temporalmente en `sessionStorage` solo las selecciones
   no personales y calcula una vista previa con el motor compartido.
2. En la revisión final el usuario puede volver a cualquier bloque.
3. Solo al pulsar **Enviar solicitud** se envían respuestas y datos de contacto.
4. La API aplica un esquema estricto, normaliza las respuestas y vuelve a
   calcular el presupuesto con el catálogo del servidor.
5. Lead y trabajos de notificación se escriben en la misma transacción. El
   identificador de envío evita duplicados ante reintentos.
6. El despachador procesa la notificación fuera de la petición y aplica
   reintentos con espera creciente.

Los importes persistidos se guardan en céntimos. La instantánea conserva la
versión del catálogo utilizada y marca expresamente que el IVA no está incluido.

## Privacidad

No se cargan analítica, publicidad, píxeles ni rastreadores. El progreso técnico
de la sesión no contiene nombre, empresa, email, teléfono ni observaciones. Los
datos personales solo llegan al servidor en el envío final y no se escriben en
los logs de aplicación.

Si se incorpora analítica en el futuro, debe quedar detrás de una capa de
consentimiento independiente; no se añadirá directamente a los componentes.

## Modificar la oferta

Para cambiar productos, extras, alojamiento o importes se edita únicamente
`src/project-catalog.js` y se actualizan sus pruebas de contrato. Las reglas que
relacionan necesidades con paquete recomendado viven únicamente en
`src/project-pricing.js`. El frontend no debe contener copias de esos importes.

## Añadir una demo

Una nueva demostración se incorpora como una entrada de `src/demo-catalog.js`
con identificador, contenido y pasos. La ruta, navegación, progreso, retroceso y
reinicio los aporta el motor común. Solo se crea código específico cuando el
proceso requiere una interacción que el motor todavía no puede representar.
