import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:4173";
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

page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /¿Qué quieres automatizar\?/i }).waitFor();

if ((await page.locator(".demo-library-card").count()) !== 18) {
  throw new Error("La biblioteca no muestra exactamente las 18 demos configurables.");
}
if ((await page.locator(".sector-choice").count()) !== 7) {
  throw new Error("No se conservaron los siete simuladores sectoriales detallados.");
}
await page.getByText("Bot guiado", { exact: true }).waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("demos-desktop-home.png", outputDir)),
  fullPage: true,
});

await page.getByRole("link", { name: "Abrir demo de Consulta de inventario y stock" }).click();
await page.getByRole("heading", { name: "Consulta de inventario y stock" }).waitFor();
if ((await page.locator(".real-chat").count()) !== 0) {
  throw new Error("El chatbot sectorial antiguo no debe mostrarse dentro de las demos genéricas.");
}

await page.getByLabel("¿Qué producto buscas?").fill("Referencia AX-204");
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByLabel("¿Cuántas unidades necesitas?").fill("12");
await page.getByRole("button", { name: "Anterior" }).click();
if ((await page.getByLabel("¿Qué producto buscas?").inputValue()) !== "Referencia AX-204") {
  throw new Error("El retroceso no conservó la respuesta de la demo.");
}
await page.getByRole("button", { name: "Continuar" }).click();
if ((await page.getByLabel("¿Cuántas unidades necesitas?").inputValue()) !== "12") {
  throw new Error("La cantidad no se conservó después de retroceder.");
}
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("radio", { name: "Envío a domicilio" }).click();
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("radio", { name: "Sí, productos similares" }).click();
await page.getByRole("button", { name: "Revisar respuestas" }).click();
await page.getByRole("heading", { name: /Comprueba las respuestas/i }).waitFor();

await page.getByRole("button", { name: "Modificar ¿Cuántas unidades necesitas?" }).click();
await page.getByLabel("¿Cuántas unidades necesitas?").fill("24");
await page.getByRole("button", { name: "Guardar cambio" }).click();
await page.getByText("24 unidades", { exact: true }).waitFor();
await page.getByRole("button", { name: "Completar demostración" }).click();
await page.getByRole("heading", { name: "Consulta de stock simulada" }).waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("demos-desktop-flow.png", outputDir)),
  fullPage: true,
});

await page.goto(`${baseUrl}/presupuesto-de-mudanza`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Presupuesto de mudanza" }).waitFor();
await page.locator("#calculadora").scrollIntoViewIfNeeded();
await page.getByRole("heading", { name: "Dimensiona la mudanza" }).waitFor();

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /¿Qué quieres automatizar\?/i }).waitFor();
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
  throw new Error("La biblioteca de demos desborda horizontalmente en móvil.");
}
await page.screenshot({
  path: fileURLToPath(new URL("demos-mobile-home.png", outputDir)),
  fullPage: true,
});

if (runtimeErrors.length) {
  throw new Error(`Errores de navegador:\n${runtimeErrors.join("\n")}`);
}

console.log("Visual check demos OK: 18 demos configurables y 7 simuladores heredados.");
await browser.close();
