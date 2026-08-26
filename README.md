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

### Visual Studio Code

Abre la carpeta local `C:\Users\Eric\Git\demo_presupuestos` como fuente de verdad.
Las tareas incluidas permiten iniciar Web y API, ejecutar las pruebas y compilar
desde `Terminal > Ejecutar tarea`.

Para inspeccionar el despliegue también se puede usar la extensión Remote - SSH:

1. conecta con `eric@172.22.121.10`;
2. abre `/srv/platform/stacks/mercamicro-presupuestos`;
3. usa esa vista para logs y comprobaciones, no como copia principal de edición.

El servidor contiene una copia de despliegue sin historial Git. Los cambios se
hacen y validan en local, se confirman en Git y después se publican en el servidor.

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
