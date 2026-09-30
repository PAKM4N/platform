import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:18084";
const outputDir = process.env.VISUAL_CHECK_OUTPUT || ".visual-check";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname), "La prueba usa solo un servidor local.");
await fs.mkdir(outputDir, { recursive: true });

const areas = ["sistemas", "automatizacion", "webs"];
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];

async function assertActiveArea(page, id, width) {
  await page.waitForFunction((areaId) => document.getElementById(`tab-${areaId}`)?.getAttribute("aria-selected") === "true", id);
  assert.equal(await page.getByRole("tab", { selected: true }).count(), 1, `${width}px: solo una pestaña seleccionada`);
  assert.equal(await page.getByRole("tabpanel").count(), 1, `${width}px: solo un panel visible`);
  assert.equal(await page.getByRole("tabpanel").getAttribute("id"), id);
  assert.equal(await page.locator('[role="tab"][tabindex="0"]').count(), 1);
  assert.equal(await page.locator(`#tab-${id}`).getAttribute("tabindex"), "0");
  assert.equal(await page.locator(`#${id}`).getAttribute("aria-labelledby"), `tab-${id}`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px: desbordamiento horizontal en ${id}`);
}

async function assertTabKey(page, key, id, width) {
  await page.keyboard.press(key);
  await assertActiveArea(page, id, width);
  assert.equal(await page.evaluate(() => document.activeElement?.id), `tab-${id}`, `${width}px: foco tras ${key}`);
}

try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(`${width}px: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") errors.push(`${width}px: ${message.text()}`); });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.equal(await page.getByRole("main").count(), 1);
    assert.equal(await page.getByRole("tablist").count(), 1);
    assert.equal(await page.getByRole("tab").count(), 3);
    assert.equal(await page.locator('[role="tabpanel"]').count(), 3);
    await assertActiveArea(page, "sistemas", width);
    await page.screenshot({ path: `${outputDir}/servicios-top-${width}.png` });

    // Every area must reveal its own content and update its shareable URL.
    for (const id of areas) {
      await page.locator(`#tab-${id}`).click();
      await assertActiveArea(page, id, width);
      assert.equal(new URL(page.url()).hash, `#${id}`);
      assert.ok(await page.locator(`#${id}`).getByRole("heading", { level: 2 }).isVisible());
      assert.ok(await page.locator(`#${id} .capability-list li`).count() > 0);
    }
    await page.locator("#tab-sistemas").click();
    await assertActiveArea(page, "sistemas", width);
    const systemsHref = await page.locator("#sistemas").getByRole("link", { name: "Consultar sistemas y alojamiento" }).getAttribute("href");
    assert.equal(new URL(systemsHref).protocol, "mailto:");
    assert.equal(new URL(systemsHref).pathname, "presupuestos@mercamicro.es");
    await page.locator("#tab-webs").click();
    await assertActiveArea(page, "webs", width);
    assert.equal(await page.locator("#webs").getByRole("link", { name: "Calcular presupuesto orientativo" }).getAttribute("href"), "https://presupuestos.mercamicro.es");
    assert.equal(await page.getByRole("link", { name: "Explorar las demos" }).getAttribute("href"), "https://demos.mercamicro.es");

    // The keyboard direction follows the actual tab layout, including wrapping.
    const orientation = await page.getByRole("tablist").getAttribute("aria-orientation");
    assert.equal(orientation, width <= 620 ? "vertical" : "horizontal");
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    await page.locator("#tab-webs").focus();
    await assertTabKey(page, "Home", "sistemas", width);
    await assertTabKey(page, nextKey, "automatizacion", width);
    await assertTabKey(page, previousKey, "sistemas", width);
    await assertTabKey(page, previousKey, "webs", width);
    await assertTabKey(page, nextKey, "sistemas", width);
    await assertTabKey(page, "End", "webs", width);

    await page.goto(new URL("#webs", baseUrl).href, { waitUntil: "networkidle" });
    await assertActiveArea(page, "webs", width);
    await page.reload({ waitUntil: "networkidle" });
    await assertActiveArea(page, "webs", width);
    assert.equal(new URL(page.url()).hash, "#webs");

    const menuButton = page.getByRole("button", { name: "Abrir menú" });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      assert.equal(await page.getByRole("button", { name: "Cerrar menú" }).getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
      assert.ok(await menuButton.evaluate((element) => element === document.activeElement));
      await menuButton.click();
      await page.locator("#services-nav").getByRole("link", { name: "Nuestro trabajo" }).click();
      assert.equal(await menuButton.getAttribute("aria-expanded"), "false");
      assert.equal(new URL(page.url()).hash, "#demostraciones");
      assert.equal(await page.locator("#services-nav").isVisible(), false);
    }

    const questions = page.locator(".faq-list details");
    assert.equal(await questions.count(), 3);
    for (let index = 0; index < await questions.count(); index += 1) {
      const question = questions.nth(index);
      await question.locator("summary").click();
      assert.equal(await question.getAttribute("open"), "");
      assert.ok(await question.locator("p").isVisible());
      await question.locator("summary").click();
      assert.equal(await question.getAttribute("open"), null);
    }

    await page.locator(".work-preview").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
    const demoImage = page.locator(".work-preview img");
    assert.ok((await demoImage.evaluate((image) => image.currentSrc)).endsWith(width <= 620 ? "services-demo-presupuesto-mobile.png" : "services-demo-presupuesto.png"));
    await page.locator("#tab-sistemas").click();
    await assertActiveArea(page, "sistemas", width);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${outputDir}/servicios-${width}.png`, fullPage: true });
    await page.close();
    console.log(`Servicios ${width}px: pestañas, teclado, enlaces, menú, FAQ, imágenes y diseño OK.`);
  }
  assert.deepEqual(errors, [], "La web no debe generar errores de consola ni JavaScript.");
} finally {
  await browser.close();
}
