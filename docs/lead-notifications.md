# Notificaciones de leads comerciales

El stack base arranca con las notificaciones desactivadas y no crea trabajos de
outbox. De esta forma una instalación sin credenciales SMTP no acumula envíos
pendientes ni puede enviar por accidente correos desde DEV.

El overlay `deploy/prod/compose.notifications.yaml` activa el adaptador de email
sin guardar credenciales en Git ni en variables de entorno. Antes de utilizarlo
deben existir estos ficheros, con permisos `600`:

- `/srv/platform/secrets/mercamicro_lead_smtp_username`
- `/srv/platform/secrets/mercamicro_lead_smtp_password`

La configuración no secreta requerida es:

- `LEAD_EMAIL_FROM`: remitente verificado.
- `LEAD_EMAIL_TO`: buzón que recibe las solicitudes.
- `LEAD_SMTP_HOST`: servidor SMTP.
- `LEAD_SMTP_PORT`: `587` por defecto.
- `LEAD_SMTP_SECURE`: `false` para STARTTLS y `true` para TLS implícito.
- `LEAD_SMTP_REQUIRE_TLS`: `true` por defecto; impide continuar sin STARTTLS.

El servicio exige TLS 1.2 o superior, valida el certificado y bloquea en
Nodemailer el acceso a ficheros y URL. Si la configuración está activada pero
incompleta, la API falla al iniciar en vez de aceptar leads sin poder
notificarlos.

Cada reintento conserva un `Message-ID` determinista para reducir duplicados si
el proveedor aceptó un correo justo antes de una caída. Al confirmar el envío se
vacía la copia del payload en el outbox; la solicitud original y su presupuesto
siguen disponibles en `sales.budget_leads`. Antes de activar producción debe
definirse la política comercial de retención de esos leads y su procedimiento
de purga.

El script de promoción incluye el overlay únicamente cuando se confirma de forma
explícita con `ENABLE_LEAD_NOTIFICATIONS=YES`. Las variables no secretas deben
estar exportadas en esa misma sesión:

```bash
export LEAD_EMAIL_FROM='Mercamicro <presupuestos@mercamicro.es>'
export LEAD_EMAIL_TO='destinatario@mercamicro.es'
export LEAD_SMTP_HOST='smtp.example.net'
ENABLE_LEAD_NOTIFICATIONS=YES CONFIRM_PRODUCTION=YES \
  ./scripts/promote-prod.sh <SHA-completo>
```

El indicador debe conservarse en promociones posteriores mientras se quiera
mantener el email activo. No se deben probar destinatarios reales desde DEV: los
adaptadores de los tests son dobles en memoria y no abren conexiones SMTP.
