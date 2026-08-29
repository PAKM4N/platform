import assert from "node:assert/strict";
import test from "node:test";
import { calculateProjectQuote, normalizeProjectAnswers } from "../src/project-pricing.js";

test("recomienda un formulario sencillo sin inventar extras", () => {
  const quote = calculateProjectQuote({
    needs: ["forms"],
    channel: "web",
    interaction: "form",
    extras: [],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.equal(quote.package.id, "smart-form-simple");
  assert.equal(quote.implementation.total, 590);
  assert.equal(quote.monthly.total, 39);
  assert.equal(quote.taxIncluded, false);
});

test("convierte un formulario conversacional fuera de la web en Bot Flow", () => {
  const quote = calculateProjectQuote({
    needs: ["forms"],
    channel: "whatsapp",
    interaction: "form",
    extras: [],
    hosting: "managed",
    websiteScope: "none",
  });

  assert.equal(quote.package.id, "flow-whatsapp");
  assert.equal(quote.implementation.total, 790);
  assert.equal(quote.monthly.total, 49);
});

test("aplica la matriz exacta de canal para un Bot Flow", () => {
  const quote = calculateProjectQuote({
    needs: ["support"],
    channel: "web-whatsapp",
    interaction: "rules",
    extras: [],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.equal(quote.package.id, "flow-web-whatsapp");
  assert.equal(quote.implementation.total, 990);
  assert.equal(quote.monthly.total, 49);
});

test("resuelve todos los canales de Flow e IA desde la misma matriz", () => {
  const matrix = [
    ["rules", "web", "flow-web", 590],
    ["rules", "telegram", "flow-telegram", 690],
    ["rules", "whatsapp", "flow-whatsapp", 790],
    ["rules", "web-whatsapp", "flow-web-whatsapp", 990],
    ["ai", "web", "ai-web", 1190],
    ["ai", "telegram", "ai-telegram", 1290],
    ["ai", "whatsapp", "ai-whatsapp", 1390],
    ["ai", "web-whatsapp", "ai-web-whatsapp", 1590],
  ];

  for (const [interaction, channel, packageId, implementation] of matrix) {
    const quote = calculateProjectQuote({
      needs: ["support"],
      interaction,
      channel,
      extras: [],
      hosting: "own",
      websiteScope: "existing",
    });

    assert.equal(quote.package.id, packageId);
    assert.equal(quote.implementation.total, implementation);
    assert.equal(quote.monthly.total, 0);
  }
});

test("recomienda IA y suma únicamente los extras seleccionados o implícitos", () => {
  const quote = calculateProjectQuote({
    needs: ["quotes", "reservations"],
    channel: "whatsapp",
    interaction: "ai",
    extras: ["documents", "language"],
    hosting: "managed",
    websiteScope: "complete",
  });

  assert.equal(quote.package.id, "ai-whatsapp");
  assert.deepEqual(
    quote.extras.map(({ id }) => id).sort(),
    ["calendar", "documents", "language", "pricing"],
  );
  assert.equal(quote.implementation.total, 1390 + 490 + 590 + 390 + 290);
  assert.equal(quote.monthly.total, 69);
  assert.equal(quote.reviewRequired, true);
  assert.deepEqual(quote.quoteOnlyItems, ["Desarrollo de web completa"]);
});

test("no cobra dos veces la base documental en el paquete Knowledge", () => {
  const quote = calculateProjectQuote({
    needs: ["support"],
    channel: "web",
    interaction: "knowledge",
    extras: ["rag"],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.equal(quote.package.id, "knowledge");
  assert.equal(quote.extras.length, 0);
  assert.equal(quote.implementation.total, 1990);
});

test("deriva del objetivo los extras funcionales necesarios sin duplicarlos", () => {
  const quote = calculateProjectQuote({
    needs: ["quotes", "reservations", "availability", "stock"],
    channel: "web",
    interaction: "rules",
    extras: ["pricing", "calendar", "stock"],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.deepEqual(
    quote.extras.map(({ id }) => id).sort(),
    ["calendar", "pricing", "stock"],
  );
  assert.equal(quote.implementation.extras, 490 + 590 + 490);
});

test("escala las integraciones empresariales a proyecto a medida", () => {
  const quote = calculateProjectQuote({
    needs: ["stock", "orders"],
    channel: "web",
    interaction: "actions",
    extras: ["crm", "erp"],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.equal(quote.package.id, "custom");
  assert.equal(quote.implementation.total, 4990 + 490 + 890 + 1290);
  assert.equal(quote.monthly.total, 99);
});

test("normaliza valores desconocidos antes de calcular", () => {
  const answers = normalizeProjectAnswers({
    needs: ["support", "invalid"],
    channel: "invalid",
    interaction: "invalid",
    extras: ["calendar", "invalid"],
    hosting: "invalid",
    websiteScope: "invalid",
  });

  assert.deepEqual(answers, {
    needs: ["support"],
    channel: "web",
    interaction: "rules",
    extras: ["calendar"],
    hosting: "managed",
    websiteScope: "existing",
  });

  assert.equal(
    normalizeProjectAnswers({ channel: "web-whatsapp", websiteScope: "none" }).websiteScope,
    "existing",
  );
  assert.equal(
    normalizeProjectAnswers({ channel: "whatsapp", websiteScope: "none" }).websiteScope,
    "none",
  );
});
