import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { calculateProjectQuote } from "../src/project-pricing.js";

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

page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));
page.on("request", (request) => requestedHosts.add(new URL(request.url()).hostname));
await page.route("**/api/project-leads", async (route) => {
  const payload = route.request().postDataJSON();
  leadRequests.push(payload);
  await route.fulfill({
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({
      accepted: true,
      reference: "MM-VISUAL01",
      submittedAt: "2026-08-28T12:00:00.000Z",
      quote: calculateProjectQuote(payload.answers),
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
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-desktop.png", outputDir)),
  fullPage: true,
});

await page.getByRole("button", { name: "Preparar presupuestos" }).click();
await page.getByRole("button", { name: "Automatizar reservas o citas" }).click();
await page.getByRole("button", { name: /Continuar/ }).click();
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

await page.getByRole("button", { name: "Editar canales" }).click();
await page.getByRole("radio", { name: "Web + WhatsApp" }).click();
await page.getByRole("button", { name: "Guardar cambio" }).click();
await page.getByText(/3\.?060\s*€/).first().waitFor();

await page.getByLabel("Nombre *").fill("Ana García");
await page.getByLabel("Empresa").fill("Ejemplo SL");
await page.getByLabel("Email *").fill("ana@example.com");
await page.getByLabel("Teléfono *").fill("+34 600 000 000");
await page.getByLabel("Observaciones").fill("Necesitamos revisar plazos.");
const storedProgress = await page.evaluate(() =>
  sessionStorage.getItem("mercamicro-project-configurator-v1") || "",
);
if (/ana@example\.com|Ana García|\+34 600 000 000/i.test(storedProgress)) {
  throw new Error("El progreso técnico contiene datos personales.");
}

await page.getByRole("button", { name: "Enviar solicitud" }).click();
await page.getByRole("heading", { name: "Ya tenemos la información necesaria." }).waitFor();
if (leadRequests.length !== 1) {
  throw new Error("El envío final no generó exactamente una solicitud.");
}
if ("quote" in leadRequests[0] || "price" in leadRequests[0] || "implementationTotal" in leadRequests[0]) {
  throw new Error("El navegador intentó enviar un precio en vez de dejar que lo calcule la API.");
}
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-resultado.png", outputDir)),
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Una web que explica bien/i }).waitFor();
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
  throw new Error("La web comercial desborda horizontalmente en móvil.");
}
await page.screenshot({
  path: fileURLToPath(new URL("presupuestos-mobile.png", outputDir)),
  fullPage: true,
});

const forbiddenTrackingHosts = [...requestedHosts].filter((host) =>
  /google-analytics|googletagmanager|facebook|connect\.facebook|hotjar|clarity/i.test(host),
);
if (forbiddenTrackingHosts.length) {
  throw new Error(`Se detectaron peticiones de tracking: ${forbiddenTrackingHosts.join(", ")}`);
}
if (runtimeErrors.length) {
  throw new Error(`Errores de navegador:\n${runtimeErrors.join("\n")}`);
}

console.log("Visual check presupuestos OK: flujo editable, sin tabla y sin tracking.");
await browser.close();
