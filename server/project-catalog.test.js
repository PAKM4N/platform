import assert from "node:assert/strict";
import test from "node:test";
import {
  EXTERNAL_CONSUMPTIONS,
  HOSTING_PLANS,
  PROJECT_EXTRAS,
  PROJECT_PACKAGES,
} from "../src/project-catalog.js";

test("el catálogo mantiene la matriz comercial en una única configuración", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.values(PROJECT_PACKAGES).map(({ id, implementation }) => [
        id,
        implementation,
      ]),
    ),
    {
      "smart-form-simple": 590,
      "smart-form-advanced": 890,
      "flow-web": 590,
      "flow-telegram": 690,
      "flow-whatsapp": 790,
      "flow-web-whatsapp": 990,
      "ai-web": 1190,
      "ai-telegram": 1290,
      "ai-whatsapp": 1390,
      "ai-web-whatsapp": 1590,
      knowledge: 1990,
      agent: 2990,
      custom: 4990,
    },
  );
});

test("extras y alojamiento coinciden con la configuración comercial acordada", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.values(PROJECT_EXTRAS).map(({ id, implementation }) => [
        id,
        implementation,
      ]),
    ),
    {
      stock: 490,
      calendar: 490,
      admin: 590,
      pricing: 590,
      documents: 390,
      language: 290,
      rag: 690,
      payments: 690,
      api: 690,
      crm: 890,
      erp: 1290,
    },
  );

  assert.deepEqual(
    Object.fromEntries(
      Object.values(HOSTING_PLANS).map(({ id, monthly }) => [id, monthly]),
    ),
    { basic: 39, bot: 49, ai: 69, automation: 99, "local-ai": 149 },
  );
  assert.equal(HOSTING_PLANS["local-ai"].from, true);
});

test("el presupuesto siempre enumera los consumos externos excluidos", () => {
  assert.deepEqual(EXTERNAL_CONSUMPTIONS, [
    "OpenAI u otras APIs de inteligencia artificial",
    "WhatsApp Business / Meta",
    "SMS",
    "APIs externas",
    "Otros servicios de terceros",
  ]);
});
