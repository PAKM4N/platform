# Mercamicro — presupuestos y demos de automatización

Plataforma con un configurador comercial y una biblioteca de automatizaciones
interactivas. Las 18 demos de procesos reutilizan un único motor declarativo y
conviven con los siete simuladores sectoriales detallados ya existentes.

El repositorio contiene dos webs relacionadas:

- `presupuestos.mercamicro.es`: web comercial para configurar webs, chatbots y
  automatizaciones según necesidades reales;
- `demos.mercamicro.es`: biblioteca de 18 recorridos configurables, siete
  simuladores con cálculo detallado y chatbot sectorial operativo.

El configurador comercial no expone una tabla ni obliga a escoger paquetes:
pregunta por objetivos, funcionamiento, canales, extras, web y alojamiento. El
catálogo y el cálculo están centralizados, el resumen es editable y la API
recalcula siempre el importe antes de guardar el lead. Todos los importes se
presentan sin IVA y separan implantación, cuota y consumos externos.

No se carga analítica, publicidad ni tracking. El configurador conserva durante
la sesión únicamente selecciones no personales; nombre, email, teléfono y
observaciones solo se envían al terminar.

## Desarrollo

```bash
npm install
npm run dev
```

En otra terminal, inicia la API local:

```bash
npm run dev:api
```

Vite reenvía `/api` a `http://127.0.0.1:3100`. El servicio local utiliza memoria
y no necesita PostgreSQL. Las pruebas del motor y de la API se ejecutan
con `npm run test:api`.

### DEV aislado en webserver01

El entorno DEV se despliega desde el repositorio remoto con:

```bash
./scripts/deploy-dev.sh
```

El comando crea redes, secretos, PostgreSQL, Valkey e imágenes exclusivos de
DEV. El gateway escucha inicialmente solo en `127.0.0.1:18080`; puede abrirse
desde VS Code Remote SSH mediante un puerto reenviado. No comparte redes,
volúmenes ni secretos con producción.

DEV expone por el túnel dos puertos:

- `18080`: biblioteca de demos, simuladores sectoriales y API;
- `18081`: web comercial de presupuestos.

Desde la ventana Remote SSH, abre el panel `Puertos`, reenvía `18080` y `18081`
y visita ambas direcciones en el navegador del PC. El tráfico viaja por el túnel
SSH existente y los puertos HTTP no quedan expuestos en la LAN ni en Internet.

`scripts/validate-isolation.sh` rechaza referencias conocidas de producción
antes de cualquier despliegue DEV. Un working tree modificado recibe una
etiqueta temporal `dev-dirty-*` y nunca debe promocionarse a producción.

### Candidatas y promoción

Una release promocionable se construye una sola vez desde `main` limpio:

```bash
./scripts/build-candidate.sh
./scripts/deploy-candidate-dev.sh <SHA-completo>
```

Después de validarla en DEV, la promoción reutiliza exactamente las mismas
imágenes y exige confirmación explícita:

```bash
CONFIRM_PRODUCTION=YES ./scripts/promote-prod.sh <SHA-completo>
```

El script conserva la configuración y referencias anteriores, valida Caddy,
espera los healthchecks y restaura la versión previa si falla el smoke test.

### Visual Studio Code

Usa VS Code Remote SSH para trabajar directamente en `webserver01`:

1. conecta con `eric@172.22.121.10`;
2. abre `/srv/platform/repos/platform`;
3. modifica y valida el código únicamente desde este repositorio.

GitHub `PAKM4N/platform` es la fuente de verdad. La ruta
`/srv/platform/stacks/mercamicro-presupuestos` pertenece al runtime heredado de
producción y no debe editarse directamente.

## Compilación para Dinahosting

```bash
npm run build
```

El resultado se genera en `dist/` y no necesita Node.js, procesos persistentes
ni una base de datos. Para publicarlo:

1. Sube **el contenido** de `dist/` al directorio público del dominio mediante
   FTP o SFTP.
2. Comprueba que también se haya transferido `dist/.htaccess`; algunos clientes
   FTP ocultan los archivos cuyo nombre comienza por un punto.
3. Abre la portada y después prueba directamente una ruta como
   `/presupuesto-de-limpieza`.

El `.htaccess` resuelve todas las rutas mediante `index.html`, añade compresión y
configura caché larga para los recursos versionados.

La configuración incluida está preparada para publicar la demo en la raíz de un
dominio o subdominio. Si se necesitara alojarla dentro de una subcarpeta, habría
que adaptar también la base de las rutas y el `RewriteBase` del `.htaccess`.

## Rutas

Las rutas configurables siguen el patrón `/demos/<slug>` y se generan desde
`src/demo-catalog.js`; entre ellas están `/demos/reservas`,
`/demos/consulta-stock`, `/demos/reserva-restaurante` y
`/demos/gestion-incidencias`. Se mantienen además las siete rutas históricas:

- `/alquiler-de-vehiculos`
- `/alquiler-de-bicicletas`
- `/reservas-de-taller`
- `/presupuesto-de-mudanza`
- `/presupuesto-de-limpieza`
- `/presupuesto-de-pintura`
- `/presupuesto-de-reforma-de-vivienda`

## Validación

Con la compilación servida en `http://127.0.0.1:4173`:

```bash
npm run preview -- --port 4173
npm run check:visual
```

La web comercial se compila y comprueba por separado:

```bash
npm run build:presupuestos
VISUAL_CHECK_URL=http://127.0.0.1:18081 npm run check:visual:presupuestos
```

## Estructura

- `src/project-catalog.js`: catálogo comercial único con productos e importes.
- `src/project-pricing.js`: normalización, recomendación y cálculo puro.
- `presupuestos/src/ProjectConfigurator.jsx`: flujo comercial y revisión final.
- `src/demo-catalog.js`: configuración declarativa de las 18 demos.
- `src/demo-flow-engine.js`: navegación, validación, edición y resumen compartidos.
- `src/GenericDemoExperience.jsx`: interfaz común de los recorridos configurables.
- `src/RouterApp.jsx`: resolución de rutas configurables y sectoriales.
- `src/HomeExperience.jsx`: portada, biblioteca y selector sectorial.
- `src/SectorExperience.jsx`: experiencia individual y chat sectorial.
- `src/App.jsx`: formulario y resultado compartidos.
- `src/service-models.js`: campos, reglas y cálculos de cada sector.
- `server/project-leads.js`: validación y captación de solicitudes completadas.
- `server/notifications/`: cola y adaptador SMTP desacoplado.
- `server/migrations/`: esquema versionado de conversaciones y leads.
- `public/.htaccess`: compatibilidad con rutas SPA en Apache/Dinahosting.
- `public/sectors/`: imágenes editoriales.

Las 18 demos nuevas y los formularios de los simuladores se resuelven localmente
y no envían respuestas. El chatbot sectorial sí registra conversaciones y
estimaciones cuando usa PostgreSQL; por eso indica que no deben introducirse
datos personales o confidenciales.

## Despliegue en la plataforma Mercamicro

`deploy/prod/compose.yaml` ejecuta tres servicios sin publicar sus puertos en el
host:

- `web`, con la biblioteca de demos;
- `budget_web`, con la web comercial;
- `api`, conectado a PostgreSQL por la red interna.

Los servicios se conectan a las redes externas `platform-edge` y
`platform-backend` ya
creadas en `webserver01`. Las rutas de ambos dominios están en
`deploy/prod/Caddyfile`. El email de leads se activa exclusivamente mediante el
overlay y los secretos descritos en `docs/lead-notifications.md`; el stack base
permanece desactivado hasta disponer de remitente, destinatario y SMTP.

La publicación normal sigue el flujo de candidata: construir una vez, validar
las mismas imágenes en DEV y promocionar únicamente con confirmación explícita.
La configuración activa nunca se edita directamente.

## Publicación estática heredada en Dinahosting

El workflow `Publicar en Dinahosting` se conserva para la versión estática anterior
y permite compilar y publicar la web por
FTPS sin copiar manualmente `dist/`. Solo se ejecuta bajo petición y exige marcar
una confirmación antes de desplegar en producción.

### Configuración inicial

En GitHub, abre `Settings > Secrets and variables > Actions` y crea estos cuatro
secretos del repositorio:

- `DINAHOSTING_HOST`: servidor indicado en el panel FTP de Dinahosting;
- `DINAHOSTING_USER`: usuario principal de FTP/FTPS;
- `DINAHOSTING_PASSWORD`: contraseña de FTP/FTPS;
- `DINAHOSTING_PATH`: directorio remoto de la web, normalmente `www`.

El acceso FTP SSL debe estar activado en Dinahosting. El workflow utiliza FTPS
explícito en el puerto 21, compila desde cero y comprueba que existen `index.html`, `.htaccess`,
`assets/` y `sectors/` antes de transferir nada.

### Publicar una versión

1. Guarda los cambios, crea un commit y sincronízalo con GitHub desde el panel de
   Control de código fuente de VS Code.
2. En GitHub, abre `Actions > Publicar en Dinahosting > Run workflow`.
3. Selecciona la rama, marca la confirmación de producción y pulsa `Run workflow`.

La extensión oficial GitHub Actions recomendada por el proyecto permite ver y
ejecutar el mismo workflow desde VS Code. Las credenciales permanecen en los
secretos de GitHub y no se guardan en el equipo ni en el repositorio.

Durante el despliegue se suben o reemplazan únicamente los archivos generados
en `dist/`. No se elimina ningún otro archivo del alojamiento. Los recursos
antiguos con nombre versionado pueden permanecer en `assets/`, pero no se cargan
ni afectan al funcionamiento de la web.
