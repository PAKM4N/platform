import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:18081";
const outputDir = new URL("../.visual-check/", import.meta.url);
const executablePath = process.env.BROWSER_PATH || "/usr/bin/chromium-browser";

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Una web que explica bien/i }).waitFor();
if ((await page.locator(`a[href="https://demos.mercamicro.es"]`).count()) < 3) {
  throw new Error("La web no ofrece suficientes enlaces claros hacia las demos.");
}
await page.getByRole("cell", { name: "5.000–20.000 € o más" }).waitFor();
await page.screenshot({ path: new URL("presupuestos-desktop.png", outputDir).pathname, fullPage: true });

for (const answer of [
  "Chatbot con inteligencia artificial",
  "En una web completa nueva",
  "Preparar presupuestos",
  "Página web",
  "Sí, con una herramienta",
]) {
  await page.getByRole("button", { name: answer }).click();
  await page.waitForTimeout(180);
}
await page.getByText("REFERENCIA ORIENTATIVA", { exact: true }).waitFor();
await page.getByLabel("Estimador de proyecto").getByText("2.500–10.000 €", { exact: true }).waitFor();
await page.getByLabel("Estimador de proyecto").getByText("300–1.500 €", { exact: true }).waitFor();
await page.getByRole("button", { name: "Revisar respuestas" }).click();
await page.getByText("¿Necesita conectarse con otras herramientas?", { exact: true }).waitFor();
if (!(await page.getByRole("button", { name: "Sí, con una herramienta" }).getAttribute("class"))?.includes("selected")) {
  throw new Error("La navegación hacia atrás no conserva la respuesta anterior.");
}
await page.getByRole("button", { name: "Sí, con una herramienta" }).click();
await page.getByText("REFERENCIA ORIENTATIVA", { exact: true }).waitFor();
await page.screenshot({ path: new URL("presupuestos-resultado.png", outputDir).pathname });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: new URL("presupuestos-mobile.png", outputDir).pathname, fullPage: true });

if (errors.length) throw new Error(`Errores de navegador:\n${errors.join("\n")}`);
console.log("Visual check presupuestos OK");
await browser.close();
