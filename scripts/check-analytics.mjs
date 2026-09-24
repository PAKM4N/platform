import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const tracker = "https://stats.mercamicro.es/script.js";
const sites = [
  { name: "demos", domain: "demos.mercamicro.es", id: "c244e78e-b481-4675-a1b4-e27f3c7585e3", dev: process.env.DEMOS_CHECK_URL || "http://127.0.0.1:18080" },
  { name: "presupuestos", domain: "presupuestos.mercamicro.es", id: "9831d3ca-7211-4561-b68d-f934411deb74", dev: process.env.BUDGET_CHECK_URL || "http://127.0.0.1:18081" },
];
// Optional real ingestion is allowed ONLY in the disposable local Umami fixture.
// Production hosts are virtual browser origins: all their documents/assets come
// from DEV. Production /api/send is always mocked, never contacted by this test.
const fixture = process.env.UMAMI_CHECK_URL;
if (fixture) {
  const url = new URL(fixture);
  assert.equal(url.protocol, "http:");
  assert.equal(url.port, "18083", "La ingestión real se limita al puerto de compose.analytics.yaml, nunca al proxy de producción.");
  assert.equal(url.pathname, "/");
}
for (const url of [...sites.map((site) => site.dev), ...(fixture ? [fixture] : [])]) {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(url).hostname), "Las pruebas requieren endpoints locales.");
}

const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`;

async function settle(page) {
  // Tracker 3.4 debounces route changes by 300 ms.
  await page.waitForTimeout(750);
}

async function scriptContract(page, site, source = tracker) {
  const script = page.locator("script[data-website-id]");
  assert.equal(await script.count(), 1, `${site.name}: un único tracker por documento`);
  assert.equal(await script.getAttribute("src"), source);
  assert.equal(await script.getAttribute("data-website-id"), site.id);
  assert.equal(await script.getAttribute("data-domains"), site.domain);
  assert.equal(await script.evaluate((element) => element.defer), true);
}

async function navigateDemo(page) {
  await page.getByRole("link", { name: "Abrir demo de Reservas", exact: true }).click();
  await page.getByRole("heading", { level: 1, name: "Reservas", exact: true }).waitFor();
}

async function checkDev(site, hostname) {
  const context = await browser.newContext({ userAgent, reducedMotion: "reduce" });
  const events = [];
  const failures = [];
  const scripts = [];
  // Defence in depth: even a broken data-domains guard cannot pollute PROD.
  await context.route("https://stats.mercamicro.es/api/**", async (route) => {
    events.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"cache":"qa-cache"}', headers: { "access-control-allow-origin": "*" } });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => { if (response.url() === tracker) scripts.push(response.status()); });
  const url = new URL(site.dev);
  url.hostname = hostname;
  try {
    await page.goto(url.href, { waitUntil: "networkidle" });
    await scriptContract(page, site);
    await settle(page);
    if (site.name === "demos") {
      await navigateDemo(page);
      await settle(page);
      await page.goBack();
    } else {
      await page.getByRole("button", { name: "Preparar presupuestos", exact: true }).click();
      await page.getByRole("button", { name: /^Continuar/ }).click();
    }
    await settle(page);
    assert.deepEqual(scripts, [200], `${site.name}: script descargado una sola vez`);
    assert.deepEqual(events, [], `${site.name}: DEV no envía estadísticas`);
    assert.deepEqual(failures, []);
    console.log(`${site.name} en ${hostname}: script 200, una carga, cero envíos de DEV.`);
  } finally {
    await context.close();
  }
}

async function checkVirtualProduction(site, ingest = false) {
  const context = await browser.newContext({ userAgent, reducedMotion: "reduce" });
  // HTTP is used only for the virtual fixture to exercise real cross-origin
  // browser preflights to localhost, without changing production certificates.
  const origin = `${ingest ? "http" : "https"}://${site.domain}`;
  const source = ingest ? `${fixture}/script.js` : tracker;
  const collection = ingest ? `${fixture}/api/send` : "https://stats.mercamicro.es/api/send";
  const events = [];
  const responses = [];
  const failures = [];
  let scriptLoads = 0;
  await context.route(`${origin}/**`, async (route) => {
    const request = route.request();
    assert.equal(request.method(), "GET", "No se envían formularios ni datos a producción");
    const url = new URL(request.url());
    assert.ok(!url.pathname.startsWith("/api/"), "Las pruebas de analítica no llaman a la API comercial");
    const response = await route.fetch({ url: `${site.dev}${url.pathname}${url.search}` });
    if (ingest && request.resourceType() === "document") {
      // Test fixture only. The actual DEV HTML is checked unchanged above.
      const body = (await response.text()).replace(`src="${tracker}"`, `src="${source}"`);
      await route.fulfill({ response, body });
    } else await route.fulfill({ response });
  });
  await context.route("https://stats.mercamicro.es/api/**", async (route) => {
    assert.equal(ingest, false, "La prueba real nunca utiliza el colector de producción");
    assert.equal(route.request().url(), collection, "Solo se usa /api/send");
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"cache":"qa-cache"}', headers: { "access-control-allow-origin": "*" } });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
  page.on("request", (request) => {
    if (request.url() === source) scriptLoads++;
    if (request.url() === collection && request.method() === "POST") {
      events.push({ body: request.postDataJSON(), headers: request.headers() });
    }
  });
  page.on("response", (response) => {
    if (response.url() === collection && response.request().method() === "POST") responses.push(response.status());
  });
  const checkPageviews = async (paths) => {
    await settle(page);
    assert.deepEqual(events.map(({ body }) => body.payload.url), paths);
    for (const { body, headers } of events) {
      assert.equal(body.type, "event");
      assert.equal(body.payload.website, site.id);
      assert.equal(body.payload.hostname, site.domain);
      assert.equal(headers["x-umami-website-id"], site.id);
      assert.equal(headers["x-umami-hostname"], site.domain);
      assert.equal(body.payload.data, undefined, "No se mandan respuestas ni datos de contacto");
    }
    assert.deepEqual(responses, paths.map(() => 200), "Todos los envíos son aceptados");
    assert.equal(scriptLoads, 1, "La navegación no recarga el tracker");
    assert.deepEqual(failures, [], "Sin errores de CORS ni de aplicación");
  };
  try {
    await page.goto(origin, { waitUntil: "networkidle" });
    await scriptContract(page, site, source);
    await checkPageviews(["/"]);
    if (site.name === "demos") {
      await navigateDemo(page);
      await checkPageviews(["/", "/demos/reservas"]);
      assert.equal(new URL(events[1].body.payload.referrer, origin).pathname, "/");
      await page.goBack();
      await page.getByRole("heading", { level: 1, name: /¿Qué quieres automatizar/ }).waitFor();
      await checkPageviews(["/", "/demos/reservas", "/"]);
      assert.equal(new URL(events[2].body.payload.referrer, origin).pathname, "/demos/reservas");
      await page.goForward();
      await page.getByRole("heading", { level: 1, name: "Reservas", exact: true }).waitFor();
      await checkPageviews(["/", "/demos/reservas", "/", "/demos/reservas"]);
      assert.equal(new URL(events[3].body.payload.referrer, origin).pathname, "/");
      await page.getByRole("radio", { name: "Una actividad", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await checkPageviews(["/", "/demos/reservas", "/", "/demos/reservas"]);
    } else {
      await page.getByRole("button", { name: "Preparar presupuestos", exact: true }).click();
      await page.getByRole("button", { name: /^Continuar/ }).click();
      await page.getByRole("heading", { name: "¿Cómo debería trabajar la solución?", exact: true }).waitFor();
      await checkPageviews(["/"]);
    }
    assert.equal((await context.cookies()).length, 0, "El tracker no crea cookies");
    if (site.name === "demos") assert.ok(events[1].headers["x-umami-cache"], "Se comprueba también el envío posterior con caché");
    console.log(`${site.name}: ${ingest ? "ingestión real en Umami aislado y CORS de navegador" : "origen de producción simulado, colector interceptado"}; SPA sin duplicados, formularios no instrumentados.`);
  } finally {
    await context.close();
  }
}

async function checkTrackerUnavailable(site) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await context.route("https://stats.mercamicro.es/**", (route) => route.abort());
  try {
    await page.goto(site.dev, { waitUntil: "networkidle" });
    if (site.name === "demos") await navigateDemo(page);
    else {
      await page.getByRole("button", { name: "Preparar presupuestos", exact: true }).click();
      await page.getByRole("button", { name: /^Continuar/ }).click();
    }
    assert.deepEqual(failures, [], "Una caída/bloqueo del tracker no rompe la web");
  } finally {
    await context.close();
  }
}

try {
  for (const site of sites) {
    for (const hostname of ["127.0.0.1", "localhost"]) await checkDev(site, hostname);
    await checkVirtualProduction(site);
    if (fixture) await checkVirtualProduction(site, true);
    await checkTrackerUnavailable(site);
  }
  console.log("Analítica OK. No se han enviado estadísticas a producción.");
} finally {
  await browser.close();
}
