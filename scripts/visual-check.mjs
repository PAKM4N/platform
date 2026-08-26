import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:4173";
const outputDir = new URL("../.visual-check/", import.meta.url);
const executablePath =
  process.env.BROWSER_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 1,
});
const runtimeErrors = [];

page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push(message.text());
});
page.on("pageerror", (error) => runtimeErrors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.locator("h1").waitFor();
if ((await page.locator(".sector-choice").count()) !== 7) {
  throw new Error("La portada no muestra los siete sectores.");
}
await page
  .getByText("Preguntas-respuestas predefinidas (FAQs)", { exact: true })
  .waitFor();
await page.getByText("Bot simple", { exact: true }).waitFor();
await page.getByText("Bot avanzado", { exact: true }).first().waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-home.png", outputDir)),
  fullPage: true,
});

const movingPanel = page.getByRole("link", {
  name: "Abrir demo de Presupuesto de mudanza",
});
await movingPanel.hover();
await page.waitForTimeout(600);
await movingPanel.scrollIntoViewIfNeeded();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-selector.png", outputDir)),
});

await page.goto(`${baseUrl}/presupuesto-de-mudanza`, {
  waitUntil: "networkidle",
});
await page
  .getByRole("heading", {
    name: "Presupuesto de mudanza",
  })
  .waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-sector-hero.png", outputDir)),
});

await page.getByRole("link", { name: /Abrir simulador/i }).click();
await page.locator("#calculadora").waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-estimator.png", outputDir)),
});

await page.getByRole("button", { name: "Continuar" }).click();
await page.getByText("Detalla accesos y carga").waitFor();
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByText("Servicios y fecha").waitFor();
await page.getByLabel("Nombre y apellidos", { exact: true }).fill("Cliente Demo");
await page.getByLabel("Email", { exact: true }).fill("demo@mercamicro.com");
await page.getByRole("button", { name: "Calcular estimación" }).click();
await page.getByText("Estimación preparada").waitFor();
await page.screenshot({
  path: fileURLToPath(new URL("desktop-result.png", outputDir)),
});

const modelChecks = [
  [
    "alquiler-de-vehiculos",
    "Define el alquiler",
    "Conductor y condiciones de uso",
    "Fecha, extras y contacto",
    "Necesito un coche automático para tres días y viajo con un bebé.",
  ],
  [
    "alquiler-de-bicicletas",
    "Elige las bicicletas",
    "Define la ruta y los ciclistas",
    "Completa el equipamiento",
    "Somos cuatro y queremos bicicletas eléctricas para recorrer la ciudad mañana.",
  ],
  [
    "reservas-de-taller",
    "Identifica el vehículo",
    "Describe la intervención",
    "Preferencias de reserva",
    "Se me ha encendido el testigo del motor y el coche pierde fuerza.",
  ],
  [
    "presupuesto-de-mudanza",
    "Dimensiona la mudanza",
    "Detalla accesos y carga",
    "Servicios y fecha",
    "Me mudo de un piso de dos habitaciones a otra ciudad.",
  ],
  [
    "presupuesto-de-limpieza",
    "Describe el espacio",
    "Nivel de trabajo y frecuencia",
    "Tareas especiales y fecha",
    "Necesito una limpieza a fondo de un piso de 90 m².",
  ],
  [
    "presupuesto-de-pintura",
    "Dimensiona el trabajo",
    "Estado y acabado deseado",
    "Elementos adicionales y fecha",
    "Quiero pintar un piso amueblado de unos 80 m² en color claro.",
  ],
  [
    "presupuesto-de-reforma-de-vivienda",
    "Dimensiona la vivienda",
    "Define el alcance de la reforma",
    "Acabados, plazo y logística",
    "Quiero hacer una reforma integral de un piso de 85 m².",
  ],
];

const smokePage = await browser.newPage({
  viewport: { width: 1280, height: 900 },
});
for (const [slug, firstStep, secondStep, thirdStep, chatExample] of modelChecks) {
  await smokePage.goto(`${baseUrl}/${slug}`, { waitUntil: "networkidle" });
  await smokePage.locator("#calculadora").scrollIntoViewIfNeeded();
  await smokePage.getByRole("heading", { name: firstStep }).waitFor();
  await smokePage.getByRole("button", { name: "Continuar" }).click();
  await smokePage.getByRole("heading", { name: secondStep }).waitFor();
  await smokePage.getByRole("button", { name: "Continuar" }).click();
  await smokePage.getByRole("heading", { name: thirdStep }).waitFor();
  await smokePage.getByText(chatExample, { exact: true }).waitFor();
}
await smokePage.close();

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${baseUrl}/presupuesto-de-reforma-de-vivienda`, {
  waitUntil: "networkidle",
});
await page.screenshot({
  path: fileURLToPath(new URL("desktop-renovation.png", outputDir)),
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({
  path: fileURLToPath(new URL("mobile-home.png", outputDir)),
  fullPage: true,
});
await page.goto(`${baseUrl}/presupuesto-de-limpieza`, {
  waitUntil: "networkidle",
});
await page.screenshot({
  path: fileURLToPath(new URL("mobile-sector.png", outputDir)),
  fullPage: true,
});

if (runtimeErrors.length) {
  throw new Error(`Errores de navegador:\n${runtimeErrors.join("\n")}`);
}

console.log("Visual check OK");
console.log("Pantallas guardadas en .visual-check/");
await browser.close();
