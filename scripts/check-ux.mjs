import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { DEMO_CATALOG } from "../src/demo-catalog.js";
import { SERVICES, SERVICE_ORDER } from "../src/service-models.js";

const baseUrl = process.env.VISUAL_CHECK_URL || "http://127.0.0.1:18080";
if (!['127.0.0.1', 'localhost'].includes(new URL(baseUrl).hostname)) throw new Error("Estas pruebas se ejecutan solo en DEV local.");
await fs.mkdir(".visual-check", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const errors = [];
const apiRequests = [];
const context = await browser.newContext({ reducedMotion: "reduce" });
await context.route('**/api/**', (route) => {
  apiRequests.push(route.request().url());
  return route.abort();
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

async function noOverflow(label) {
  const measure = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, window: innerWidth }));
  assert.ok(measure.page <= measure.window + 1, `${label}: desborde ${JSON.stringify(measure)}`);
  assert.equal(await page.locator('main').count(), 1, `${label}: un único contenido principal`);
}

async function completeGeneric(demo) {
  await page.goto(`${baseUrl}/demos/${demo.slug}`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").innerText(), demo.name);
  const form = page.locator('.generic-demo-question-form');
  for (let index = 0; index < demo.questions.length; index++) {
    await form.waitFor();
    if (await form.locator('.generic-demo-option').count()) await form.locator('.generic-demo-option').first().click();
    else if (await form.locator('textarea').count()) await form.locator('textarea').fill('Consulta de ejemplo para mi negocio');
    else if (await form.locator('input[type=date]').count()) await form.locator('input[type=date]').fill('2030-10-20');
    else {
      const input = form.locator('input[type=number]');
      const minimum = Number(await input.getAttribute('min')) || 1;
      await input.fill(String(Math.max(minimum, 2)));
    }
    await form.locator('button[type=submit]').click();
    assert.equal(await page.locator('.generic-demo-error').count(), 0, `${demo.id}: paso ${index + 1}`);
  }
  await page.locator('.generic-demo-summary').waitFor();
  const beforeEdit = await page.locator('.generic-demo-summary').innerText();
  await page.getByRole('button', {name: /^Modificar /}).first().click();
  if (await form.locator('textarea').count()) await form.locator('textarea').fill('Cambio que debe cancelarse');
  else if ((await form.locator('.generic-demo-option').count()) > 1) await form.locator('.generic-demo-option').nth(1).click();
  await page.getByRole('button', {name:'Cancelar edición'}).click();
  assert.equal(await page.locator('.generic-demo-summary').innerText(), beforeEdit, `${demo.id}: cancelar restaura respuestas`);
  await page.getByRole('button', {name:'Ver resultado de ejemplo'}).click();
  await page.locator('.generic-demo-complete').waitFor();
  assert.doesNotMatch(await page.locator('.generic-demo-complete').innerText(), /undefined|NaN|\[object Object\]/);
  await noOverflow(`demo ${demo.id}`);
}

async function checkChatRecovery({ storageBlocked }) {
  const chatContext = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  if (storageBlocked) {
    await chatContext.addInitScript(() => Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}}));
  }
  const calls = [];
  const conversationId = '12345678-1234-4000-8000-123456789012';
  let failure = null;
  await chatContext.route('**/api/chat/messages', route => {
    calls.push(route.request().postDataJSON());
    if (failure === 'network') return route.abort('failed');
    if (failure === 'server') return route.fulfill({status:503,contentType:'application/json',body:'{}'});
    if (failure === 'malformed') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({message:'Respuesta incompleta',quickReplies:[]})});
    if (calls.length === 2) return route.fulfill({status:429,contentType:'application/json',body:'{}'});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      conversationId,
      message: calls.length === 1 ? 'Pregunta de demostración recibida.' : `Respuesta confirmada ${calls.length}.`,
      quickReplies:['Otra opción'],
    })});
  });
  const chatPage = await chatContext.newPage();
  chatPage.on('pageerror',error=>errors.push(error.message));
  try {
    await chatPage.goto(`${baseUrl}/presupuesto-de-mudanza`,{waitUntil:'networkidle'});
    await chatPage.getByRole('button',{name:'Abrir asistente de presupuestos'}).click();
    await chatPage.getByRole('button',{name:'Empezar',exact:true}).click();
    await chatPage.getByText('Pregunta de demostración recibida.',{exact:true}).waitFor();
    await chatPage.getByRole('button',{name:'Otra opción',exact:true}).click();
    await chatPage.getByText('Hemos recibido varios mensajes seguidos.',{exact:false}).waitFor();
    assert.equal(await chatPage.locator('#real-chat-input').inputValue(),'Otra opción');
    assert.equal(await chatPage.locator('#real-chat-input').isEnabled(),true,'429 permite un reintento seguro');
    await chatPage.getByRole('button',{name:'Enviar mensaje'}).click();
    await chatPage.getByText('Respuesta confirmada 3.',{exact:true}).waitFor();
    assert.equal(calls[1].conversationId,conversationId);
    assert.deepEqual(calls[2],calls[1],'El reintento tras429 conserva mensaje y conversación');

    for (const failureMode of ['network','server','malformed']) {
      failure = failureMode;
      await chatPage.getByRole('button',{name:'Otra opción',exact:true}).click();
      await chatPage.getByRole('alert').filter({hasText:'No podemos confirmar el estado'}).waitFor();
      assert.equal(calls.at(-1).conversationId,conversationId,'El fallo sucede con una conversación existente');
      assert.equal(await chatPage.locator('#real-chat-input').isDisabled(),true);
      assert.equal(await chatPage.getByRole('button',{name:'Enviar mensaje'}).isDisabled(),true);
      assert.equal(await chatPage.getByRole('button',{name:'Otra opción',exact:true}).count(),0,'No quedan respuestas rápidas del estado ambiguo');
      assert.ok(await chatPage.locator('.real-chat-message.is-user').count(),'Se conserva el historial visible');
      const callsBeforeRestart = calls.length;
      await chatPage.locator('.real-chat-compose').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
      assert.equal(calls.length,callsBeforeRestart,'El bloqueo también protege el manejador de envío');

      if (!storageBlocked) {
        await chatPage.reload({waitUntil:'networkidle'});
        await chatPage.getByRole('button',{name:'Abrir asistente de presupuestos'}).click();
        await chatPage.getByRole('alert').filter({hasText:'No podemos confirmar el estado'}).waitFor();
        assert.equal(await chatPage.locator('#real-chat-input').isDisabled(),true,'La recuperación pendiente persiste al recargar');
        assert.ok(await chatPage.locator('.real-chat-message.is-user').count(),'La recarga conserva el historial');
      }
      await chatPage.locator('.real-chat-recovery').getByRole('button',{name:'Reiniciar conversación'}).click();
      assert.equal(calls.length,callsBeforeRestart,'Reiniciar no envía otro mensaje a la conversación incierta');
      assert.equal(await chatPage.locator('#real-chat-input').isEnabled(),true);
      assert.equal(await chatPage.locator('.real-chat-recovery').count(),0);
      assert.equal(await chatPage.locator('.real-chat-message.is-user').count(),0,'El reinicio limpia el historial anterior');
      failure = null;
      await chatPage.getByRole('button',{name:'Empezar',exact:true}).click();
      await chatPage.getByText(`Respuesta confirmada ${callsBeforeRestart + 1}.`,{exact:true}).waitFor();
      assert.equal(Object.hasOwn(calls.at(-1),'conversationId'),false,'Tras reiniciar se solicita una conversación nueva');
    }

    await chatPage.keyboard.press('Escape');
    assert.equal(await chatPage.getByRole('dialog').count(),0);
    assert.equal(await chatPage.locator(':focus').getAttribute('aria-label'),'Abrir asistente de presupuestos');
    console.log(`Chat OK:429 reintentable; red,503 y respuesta inválida requieren reinicio${storageBlocked ? '; almacenamiento bloqueado' : '; estado persistente'}.`);
  } catch (error) {
    await chatPage.screenshot({path:`.visual-check/ux-chat-failure-${storageBlocked ? 'blocked' : 'persistent'}.png`,fullPage:true});
    throw error;
  } finally {
    await chatContext.close();
  }
}

try {
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height: 1000});
    await page.goto(baseUrl, {waitUntil:'networkidle'});
    await noOverflow(`inicio ${width}`);
    assert.equal(await page.locator('.demo-library-card').count(),18);
    assert.equal(await page.locator('.sector-choice').count(),7);
    await page.getByRole('searchbox',{name:'Buscar una demostración'}).fill('zzzz-no-existe');
    assert.equal(await page.locator('.demo-library-card').count(),0);
    await page.getByRole('button',{name:'Quitar filtros'}).click();
    assert.equal(await page.locator('.demo-library-card').count(),18);
    await page.screenshot({path:`.visual-check/ux-home-${width}.png`,fullPage:true});
    for (const demo of DEMO_CATALOG) await completeGeneric(demo);
    await page.screenshot({path:`.visual-check/ux-demo-result-${width}.png`,fullPage:true});
    for (const id of SERVICE_ORDER) {
      const service = SERVICES[id];
      await page.goto(`${baseUrl}/${service.slug}#calculadora`,{waitUntil:'networkidle'});
      const estimator = page.locator('#calculadora');
      for (let step = 1; step <= 3; step++) {
        await estimator.locator('button[type=submit]').click();
        assert.equal(await page.locator('.sector-field-error').count(),0, `${id}: valores de ejemplo válidos`);
      }
      await page.locator('.final-result').waitFor();
      assert.doesNotMatch(await page.locator('.final-result').innerText(), /NaN|undefined/);
      await noOverflow(`sector ${id} ${width}`);
      await page.getByRole('button',{name:'Simular envío'}).click();
      await page.getByText('Has probado el paso de envío.',{exact:false}).waitFor();
      await page.getByRole('button',{name:'Modificar solicitud'}).click();
      assert.ok((await page.locator('.progress-labels [aria-current=step]').innerText()).includes(service.steps[1].label));
    }
    await page.screenshot({path:`.visual-check/ux-sector-${width}.png`,fullPage:true});
    console.log(`${width}px: 18 demos y 7 simuladores completados, revisión y ausencia de desborde comprobadas.`);
  }

  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${baseUrl}/alquiler-de-vehiculos#calculadora`,{waitUntil:'networkidle'});
  await page.locator('#field-days').fill('0');
  await page.locator('#calculadora button[type=submit]').click();
  await page.locator('#field-days-error').waitFor();
  assert.equal(await page.locator('#field-days').getAttribute('aria-invalid'),'true');
  await page.locator('#field-days').fill('13');
  assert.equal(await page.locator('#field-days').inputValue(),'13');
  await page.locator('#calculadora button[type=submit]').click();
  await page.locator('#field-driverAge').fill('3');
  await page.locator('#field-driverAge').fill('35');
  assert.equal(await page.locator('#field-driverAge').inputValue(),'35');
  await page.locator('#calculadora button[type=submit]').click();
  await page.locator('#field-startDate').fill('2000-01-01');
  await page.locator('#calculadora button[type=submit]').click();
  await page.locator('#field-startDate-error').waitFor();

  for (const width of [320,768,1920]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(baseUrl,{waitUntil:'networkidle'});
    await noOverflow(`inicio ${width}`);
    await page.goto(`${baseUrl}/presupuesto-de-mudanza#calculadora`,{waitUntil:'networkidle'});
    await noOverflow(`mudanza ${width}`);
    await page.goto(`${baseUrl}/demos/${DEMO_CATALOG[0].slug}`,{waitUntil:'networkidle'});
    await noOverflow(`demo ${width}`);
  }

  await page.getByRole('link',{name:'Volver a la biblioteca de demos'}).click();
  await page.waitForFunction(()=>location.hash==='#biblioteca-demos' && Math.abs(document.getElementById('biblioteca-demos').getBoundingClientRect().top)<150);
  await page.goto(`${baseUrl}/no-existe`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Esta demo no existe.'}).waitFor();
  assert.equal(await page.locator('.real-chat').count(),0);
  assert.equal(apiRequests.length,0,'Los recorridos de ejemplo no envían datos');
  assert.deepEqual(errors,[], 'Sin errores en navegador');
  await checkChatRecovery({storageBlocked:false});
  await checkChatRecovery({storageBlocked:true});
  assert.deepEqual(errors,[], 'El chat funciona sin acceso al almacenamiento');
  console.log('UX OK: 50 recorridos completos, cinco resoluciones, validación y enlaces. Cero peticiones de las demos a la API.');
} catch(error) {
  await page.screenshot({path:'.visual-check/ux-failure.png',fullPage:true});
  throw error;
} finally {
  await browser.close();
}
