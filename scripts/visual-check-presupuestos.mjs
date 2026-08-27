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
await page.screenshot({ path: new URL("presupuestos-desktop.png", outputDir).pathname, fullPage: true });

for (const answer of [
  "Una web completa + chatbot",
  "Preparar presupuestos",
  "En mi página web",
  "Sí, con una herramienta",
  "Guiado, pero entendiendo texto libre",
]) {
  await page.getByRole("button", { name: answer }).click();
  await page.waitForTimeout(180);
}
await page.getByText("PRIMERA ESTIMACIÓN", { exact: true }).waitFor();
await page.screenshot({ path: new URL("presupuestos-resultado.png", outputDir).pathname });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: new URL("presupuestos-mobile.png", outputDir).pathname, fullPage: true });

if (errors.length) throw new Error(`Errores de navegador:\n${errors.join("\n")}`);
console.log("Visual check presupuestos OK");
await browser.close();
