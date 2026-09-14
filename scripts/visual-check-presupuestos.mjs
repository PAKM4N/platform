import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { calculateProjectQuote } from "../src/project-pricing.js";
import { PROJECT_CATALOG_VERSION } from "../src/project-catalog.js";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:18081";
const outputDir = new URL("../.visual-check/", import.meta.url);
const executablePath =
  process.env.BROWSER_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/usr/bin/chromium-browser");

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: process.platform === "win32" ? [] : ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const runtimeErrors = [];
const leadRequests = [];
const requestedHosts = new Set();
let failNextSubmission = false;

page.on("console", (message) => {
  if (message.type() === "error" && !(/api\/project-leads/.test(message.location().url || "") && /503/.test(message.text()))) runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("request", (request) => requestedHosts.add(new URL(request.url()).hostname));
await page.route("**/api/project-leads", async (route) => {
  const payload = route.request().postDataJSON();
  leadRequests.push(payload);
  if (failNextSubmission) {
    failNextSubmission = false;
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "temporarily_unavailable" }) });
    return;
  }
  await route.fulfill({
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({
      accepted: true,
      reference: "MM-VISUAL01",
      submittedAt: "2026-08-28T12:00:00.000Z",
      quote: calculateProjectQuote(payload.answers),
      customerCopyQueued: true,
    }),
  });
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Una web que explica bien/i }).waitFor();
if ((await page.locator('a[href="https://demos.mercamicro.es"]').count()) < 3) {
  throw new Error("La web comercial no enlaza claramente con demos.mercamicro.es.");
}
if ((await page.locator("table, .pricing-section, .pricing-table-wrap").count()) !== 0) {
  throw new Error("La tabla pública de precios sigue presente.");
}
if ((await page.getByText("5.000–20.000 € o más", { exact: true }).count()) !== 0) {
  throw new Error("Se sigue mostrando públicamente la antigua tabla orientativa.");
}
for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
    throw new Error(`La portada comercial desborda a ${width}px.`);
  }
}
await page.getByRole("button", { name: "Citas", exact: true }).click();
await page.getByText("Me gustaría reservar una primera visita.", { exact: true }).waitFor();
await page.getByRole("button", { name: "Presupuestos", exact: true }).click();
await page.getByText("¿La estimación es un presupuesto cerrado?", { exact: true }).click();
await page.getByText(/Es un punto de partida para hablar de tu proyecto/).waitFor();
await page.getByText("¿La estimación es un presupuesto cerrado?", { exact: true }).click();
if (!(await page.getByRole("button", { name: /Continuar/ }).isDisabled())) {
  throw new Error("El configurador permite avanzar sin objetivos.");
}
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-desktop.png", outputDir)),
  fullPage: true,
});

await page.getByRole("button", { name: "Preparar presupuestos" }).click();
await page.getByRole("button", { name: "Automatizar reservas o citas" }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("radio", { name: /Guiar mediante botones/ }).focus();
await page.keyboard.press("ArrowDown");
if ((await page.getByRole("radio", { name: /Entender preguntas escritas/ }).getAttribute("aria-checked")) !== "true") {
  throw new Error("La selección con flechas no funciona en el grupo de opciones.");
}
await page.getByRole("radio", { name: /Entender preguntas escritas con lenguaje natural/ }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("button", { name: "Respuesta anterior" }).click();
if ((await page.getByRole("radio", { name: /Entender preguntas escritas con lenguaje natural/ }).getAttribute("aria-checked")) !== "true") {
  throw new Error("El retroceso del configurador no conserva la respuesta anterior.");
}
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("radio", { name: /^WhatsApp$/ }).click();
await page.getByRole("button", { name: /Continuar/ }).click();

const automaticPricing = page.getByRole("button", { name: /Cálculo automático de precios/ });
const automaticCalendar = page.getByRole("button", { name: /Calendario.*reservas.*citas/ });
if (!(await automaticPricing.isDisabled()) || !(await automaticCalendar.isDisabled())) {
  throw new Error("Los extras derivados de objetivos no están identificados como automáticos.");
}
await page.getByRole("button", { name: /Generación de PDF.*documentos/ }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("radio", { name: "Necesito una web completa nueva" }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("button", { name: "Revisar presupuesto" }).click();

await page.getByRole("heading", { name: "Revisa el alcance antes de enviarlo." }).waitFor();
await page.getByText("Asistente IA", { exact: true }).first().waitFor();
await page.getByText("Presupuesto personalizado", { exact: true }).first().waitFor();
await page.getByText(/2\.?860\s*€/).first().waitFor();
if ((await page.getByText(/SIN IVA/i).count()) < 2) {
  throw new Error("El resumen no destaca suficientemente que los importes son sin IVA.");
}
if (leadRequests.length !== 0) {
  throw new Error("Se generó un lead antes del envío final.");
}

await page.getByRole("button", { name: "Editar objetivos" }).click();
await page.getByRole("button", { name: "Preparar presupuestos" }).click();
await page.getByRole("button", { name: "Automatizar reservas o citas" }).click();
if (!(await page.getByRole("button", { name: "Guardar cambio" }).isDisabled())) throw new Error("Se permite guardar una revisión sin objetivos.");
const persistedReview = await page.evaluate(() => JSON.parse(sessionStorage.getItem("mercamicro-project-configurator-v1")));
if (persistedReview.step !== 6 || persistedReview.answers.needs.length !== 2) throw new Error("Una edición incompleta ha sobrescrito el resumen guardado.");
await page.getByRole("button", { name: "Cancelar cambios" }).click();
await page.getByText(/2\.?860\s*€/).first().waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Revisa el alcance antes de enviarlo." }).waitFor();
await page.getByText(/Hemos recuperado tus selecciones/).waitFor();

await page.getByRole("button", { name: "Editar canales" }).click();
await page.getByRole("radio", { name: "Web + WhatsApp" }).click();
await page.getByRole("button", { name: "Cancelar cambios" }).click();
await page.getByText(/2\.?860\s*€/).first().waitFor();

await page.getByRole("button", { name: "Editar canales" }).click();
await page.getByRole("radio", { name: "Web + WhatsApp" }).click();
await page.getByRole("button", { name: "Guardar cambio" }).click();
await page.getByText(/3\.?060\s*€/).first().waitFor();

await page.getByRole("button", { name: "Enviar solicitud" }).click();
if (leadRequests.length !== 0) throw new Error("Se envió una solicitud con los campos obligatorios vacíos.");
if ((await page.locator("#project-contact-name").getAttribute("aria-invalid")) !== "true" || (await page.locator("#project-contact-email").getAttribute("aria-invalid")) !== "true") throw new Error("Los campos obligatorios no muestran errores accesibles.");
if ((await page.evaluate(() => document.activeElement?.id)) !== "project-contact-name") throw new Error("La validación no centra el primer campo incorrecto.");
await page.getByLabel("Nombre *").fill("Ana García");
await page.getByLabel("Empresa (opcional)").fill("Ejemplo SL");
await page.getByLabel("Email *").fill("ana@example.com");
await page.getByLabel("Teléfono (opcional)").fill("123");
await page.getByRole("button", { name: "Enviar solicitud" }).click();
await page.getByText(/Indica entre 6 y 15 dígitos/).waitFor();
if (leadRequests.length !== 0) throw new Error("Se envió una solicitud con un teléfono inválido.");
await page.getByLabel("Teléfono (opcional)").fill("");
await page.getByLabel("Observaciones (opcional)").fill("Necesitamos revisar plazos.");
const storedProgress = await page.evaluate(() =>
  sessionStorage.getItem("mercamicro-project-configurator-v1") || "",
);
if (/ana@example\.com|Ana García|\+34 600 000 000/i.test(storedProgress)) {
  throw new Error("El progreso técnico contiene datos personales.");
}

for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error(`El resumen o formulario desborda a ${width}px.`);
}
await page.screenshot({ path: fileURLToPath(new URL("presupuestos-resumen.png", outputDir)), fullPage: true });
failNextSubmission = true;
await page.getByRole("button", { name: "Enviar solicitud" }).click();
await page.getByRole("alert").filter({ hasText: /No hemos podido confirmar el envío/ }).waitFor();
if ((await page.getByLabel("Nombre *").inputValue()) !== "Ana García") throw new Error("Se pierden los datos después de un fallo de envío.");
await page.getByRole("button", { name: "Enviar solicitud" }).click();
await page.getByRole("heading", { name: "Ya tenemos la información necesaria." }).waitFor();
if (leadRequests.length !== 2 || leadRequests[0].submissionId !== leadRequests[1].submissionId) {
  throw new Error("El reintento no reutiliza el identificador para evitar solicitudes duplicadas.");
}
if (leadRequests[1].contact.phone !== "") throw new Error("No se ha permitido completar la solicitud sin teléfono.");
await page.getByText(/Hemos programado el envío de una copia a ana@example.com/).waitFor();
if (await page.evaluate(() => sessionStorage.getItem("mercamicro-project-configurator-v1"))) throw new Error("El envío completado no limpia el progreso temporal.");
if ("quote" in leadRequests[0] || "price" in leadRequests[0] || "implementationTotal" in leadRequests[0]) {
  throw new Error("El navegador intentó enviar un precio en vez de dejar que lo calcule la API.");
}
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-resultado.png", outputDir)),
  fullPage: true,
});
await page.emulateMedia({ media: "print" });
if (await page.locator(".budget-header").isVisible() || await page.locator(".configurator-print").isVisible()) throw new Error("La impresión incluye navegación o controles ajenos al presupuesto.");
if (!(await page.getByText("REFERENCIA MM-VISUAL01", { exact: true }).isVisible())) throw new Error("La impresión no conserva la referencia del presupuesto.");
await page.emulateMedia({ media: "screen" });

await page.evaluate((catalogVersion) => sessionStorage.setItem("mercamicro-project-configurator-v1", JSON.stringify({ catalogVersion, savedAt: Date.now(), step: 6, answers: { needs: ["support"], channel: "web", interaction: "knowledge", extras: ["rag"], hosting: "own", websiteScope: "existing" } })), PROJECT_CATALOG_VERSION);
await page.reload({ waitUntil: "networkidle" });
await page.getByText("Base documental incluida en la solución", { exact: true }).waitFor();
if (await page.locator(".quote-breakdown-line").filter({ hasText: "Base documental / RAG" }).count()) throw new Error("La documentación incluida se cobra otra vez como extra.");
if (await page.locator(".quote-scope-warning").filter({ hasText: /web completa|landing/ }).count()) throw new Error("El asistente documental incluye un aviso de web nueva no solicitada.");

await page.evaluate((catalogVersion) => sessionStorage.setItem("mercamicro-project-configurator-v1", JSON.stringify({ catalogVersion, savedAt: Date.now(), step: 6, answers: { needs: ["other"], channel: "web", interaction: "actions", extras: [], hosting: "managed", websiteScope: "existing" } })), PROJECT_CATALOG_VERSION);
await page.reload({ waitUntil: "networkidle" });
await page.getByText(/Tu proyecto necesita una revisión a medida/).waitFor();
if (await page.getByText("La nueva web se presupuesta aparte", { exact: true }).count()) throw new Error("El proyecto a medida sin web nueva muestra costes de web no solicitada.");

await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => sessionStorage.clear());
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Una web que explica bien/i }).waitFor();
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
  throw new Error("La web comercial desborda horizontalmente en móvil.");
}
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-mobile.png", outputDir)),
  fullPage: true,
});

await page.addInitScript(() => Object.defineProperty(window, "sessionStorage", { get() { throw new DOMException("Storage disabled", "SecurityError"); } }));
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Preparar presupuestos" }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
await page.getByRole("heading", { name: "¿Cómo debería trabajar la solución?" }).waitFor();

const forbiddenTrackingHosts = [...requestedHosts].filter((host) =>
  /google-analytics|googletagmanager|facebook|connect\.facebook|hotjar|clarity/i.test(host),
);
if (forbiddenTrackingHosts.length) {
  throw new Error(`Se detectaron peticiones de tracking: ${forbiddenTrackingHosts.join(", ")}`);
}
if (runtimeErrors.length) {
  throw new Error(`Errores de navegador:\n${runtimeErrors.join("\n")}`);
}

console.log("Visual check presupuestos OK: escritorio/móvil, edición y cancelación, validación, teléfono opcional, reintento sin duplicados, precios contextualizados, impresión y almacenamiento opcional.");
await browser.close();
