# Mercamicro — demo sectorial

Aplicación React con simuladores de presupuestos y reservas para siete sectores,
acompañada por un chatbot web guiado y operativo:

- alquiler de vehículos;
- alquiler de bicicletas;
- reservas de taller;
- mudanzas;
- limpieza;
- pintura;
- reformas de viviendas.

El repositorio contiene dos webs relacionadas:

- `presupuestos.mercamicro.es`: web comercial con estimador conversacional para
  proyectos de chatbot;
- `demos.mercamicro.es`: demostraciones sectoriales, formularios y chatbot
  operativo.

`demo.mercamicro.es` queda reservado como posible alias cuando exista también
su registro DNS.

Cada opción dispone de una ruta propia, un formulario específico y un cálculo
orientativo ejecutado íntegramente en el navegador. El asistente recoge cinco
variables clave, completa las restantes con los valores estándar de la demo y
devuelve una horquilla calculada por las mismas reglas. La Web utiliza el servicio
real; WhatsApp y Telegram se muestran como integraciones opcionales. El conector
de Telegram queda preparado en el repositorio, pero desactivado en el despliegue.

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

- `18080`: demos sectoriales y API;
- `18081`: web comercial de presupuestos.

Desde la ventana Remote SSH, abre el panel `Puertos`, reenvía el puerto `18080`
y visita `http://127.0.0.1:18080` en el navegador del PC. El tráfico viaja por
el túnel SSH existente y el puerto HTTP no queda expuesto en la LAN ni en
Internet.

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

## Estructura

- `src/RouterApp.jsx`: resolución de rutas estáticas.
- `src/HomeExperience.jsx`: portada y selector de sectores.
- `src/SectorExperience.jsx`: experiencia individual y chat sectorial.
- `src/App.jsx`: formulario y resultado compartidos.
- `src/service-models.js`: campos, reglas y cálculos de cada sector.
- `public/.htaccess`: compatibilidad con rutas SPA en Apache/Dinahosting.
- `public/sectors/`: imágenes editoriales.

Los formularios de los simuladores siguen calculándose localmente y no envían
los datos de contacto. El chatbot sí registra las conversaciones y estimaciones
cuando se ejecuta en producción con PostgreSQL; por eso su interfaz indica que
no deben introducirse datos personales o confidenciales durante la demo.

## Despliegue en la plataforma Mercamicro

`deploy/compose.yaml` crea dos contenedores sin publicar puertos en el host:

- `mercamicro-presupuestos-web`, con la web estática;
- `mercamicro-presupuestos-api`, conectado a PostgreSQL por la red interna.

Ambos se conectan a las redes externas `platform-edge` y `platform-backend` ya
creadas en `webserver01`. El bloque de Caddy está en
`deploy/presupuestos.Caddyfile`. Telegram se activa con el fichero adicional
`deploy/compose.telegram.yaml`, una vez creados sus dos secretos fuera del
repositorio.

El flujo seguro de publicación es: levantar los contenedores, conectarlos primero
a `ingress.chatbots.mercamicro.es` con `deploy/ingress.Caddyfile`, validar Web y
API por HTTPS y solo entonces cambiar el DNS de `presupuestos.mercamicro.es`.

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
