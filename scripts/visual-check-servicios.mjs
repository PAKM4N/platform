import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:18084";
const outputDir = process.env.VISUAL_CHECK_OUTPUT || ".visual-check";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname), "La prueba usa solo un servidor local.");
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.equal(await page.locator("main").count(), 1);
    assert.equal(await page.locator(".hero-index > a").count(), 3);
    assert.equal(await page.locator(".model-section").count(), 3);
    assert.equal(await page.locator(".offering-list li").count(), 14);
    assert.ok(await page.getByRole("heading", { name: /Alojamiento y gestión de sistemas operativos y servicios/ }).isVisible());
    assert.ok(await page.getByRole("heading", { name: /Automatización de procesos y consultoría/ }).isVisible());
    assert.ok(await page.getByRole("heading", { name: /Diseño de páginas web y chatbots/ }).isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px: desbordamiento horizontal`);
    assert.ok(await page.locator(".services-brand img").first().evaluate((image) => image.complete && image.naturalWidth > 0));
    assert.equal(await page.locator('a[href="https://presupuestos.mercamicro.es"]').count() > 0, true);
    assert.equal(await page.locator('a[href="https://demos.mercamicro.es"]').count() > 0, true);
    await page.screenshot({ path: `${outputDir}/servicios-top-${width}.png` });

    await page.locator(".hero-index").getByRole("link", { name: /Procesos/ }).click();
    assert.equal(new URL(page.url()).hash, "#automatizacion");

    if (width <= 768) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      assert.equal(await page.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded"), "true");
      await page.locator("#services-nav").getByRole("link", { name: "Webs y chatbots" }).click();
      assert.equal(await page.getByRole("button", { name: "Abrir menú" }).getAttribute("aria-expanded"), "false");
      assert.equal(new URL(page.url()).hash, "#webs");
    }
    await page.getByText("¿Puedo contratar una sola línea de servicio?").click();
    assert.equal(await page.locator(".faq-list details").first().getAttribute("open"), "");
    await page.screenshot({ path: `${outputDir}/servicios-${width}.png`, fullPage: true });
    await page.close();
    console.log(`Servicios ${width}px: tres líneas, navegación y FAQ OK.`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
