import {
  CHANNEL_OPTIONS,
  EXTERNAL_CONSUMPTIONS,
  HOSTING_OPTIONS,
  HOSTING_PLANS,
  INTERACTION_OPTIONS,
  NEED_OPTIONS,
  PROJECT_EXTRAS,
  PROJECT_CATALOG_VERSION,
  PROJECT_PACKAGES,
  WEBSITE_SCOPE_OPTIONS,
} from "./project-catalog.js";

const VALID_CHANNELS = new Set(CHANNEL_OPTIONS.map(({ id }) => id));
const VALID_NEEDS = new Set(NEED_OPTIONS.map(({ id }) => id));
const VALID_INTERACTIONS = new Set(INTERACTION_OPTIONS.map(({ id }) => id));
const VALID_HOSTING = new Set(HOSTING_OPTIONS.map(({ id }) => id));
const VALID_EXTRAS = new Set(Object.keys(PROJECT_EXTRAS));
const VALID_WEBSITE_SCOPES = new Set(WEBSITE_SCOPE_OPTIONS.map(({ id }) => id));

const NEED_TO_EXTRA = {
  quotes: "pricing",
  reservations: "calendar",
  availability: "stock",
  stock: "stock",
};

export function automaticProjectExtraIds(needs = []) {
  return [
    ...new Set(
      uniqueAllowed(needs, VALID_NEEDS)
        .map((need) => NEED_TO_EXTRA[need])
        .filter(Boolean),
    ),
  ];
}

function uniqueAllowed(values, allowed) {
  return [...new Set(Array.isArray(values) ? values : [])].filter((value) =>
    allowed.has(value),
  );
}

export function normalizeProjectAnswers(input = {}) {
  const channel = VALID_CHANNELS.has(input.channel) ? input.channel : "web";
  const websiteScope = VALID_WEBSITE_SCOPES.has(input.websiteScope)
    ? input.websiteScope
    : "existing";

  return {
    needs: uniqueAllowed(input.needs, VALID_NEEDS),
    channel,
    interaction: VALID_INTERACTIONS.has(input.interaction)
      ? input.interaction
      : "rules",
    extras: uniqueAllowed(input.extras, VALID_EXTRAS),
    hosting: VALID_HOSTING.has(input.hosting) ? input.hosting : "managed",
    websiteScope:
      channel.includes("web") && websiteScope === "none" ? "existing" : websiteScope,
  };
}

function packageFor(answers, extras) {
  const enterpriseExtras = extras.filter((id) => ["api", "crm", "erp"].includes(id));
  const isComplexEnterprise =
    enterpriseExtras.length >= 2 || extras.length >= 5 || answers.needs.includes("other");

  if (isComplexEnterprise) return PROJECT_PACKAGES.custom;
  if (answers.interaction === "actions") return PROJECT_PACKAGES.agent;
  if (answers.interaction === "knowledge") return PROJECT_PACKAGES.knowledge;

  if (answers.interaction === "form" && answers.channel === "web") {
    const advanced = answers.needs.length > 1 || extras.length > 0;
    return PROJECT_PACKAGES[advanced ? "smart-form-advanced" : "smart-form-simple"];
  }

  const family = answers.interaction === "ai" ? "ai" : "flow";
  return PROJECT_PACKAGES[`${family}-${answers.channel}`];
}

function hostingFor(packageFamily, preference) {
  if (preference === "own") return null;
  if (preference === "local-ai") return HOSTING_PLANS["local-ai"];
  if (packageFamily === "form") return HOSTING_PLANS.basic;
  if (packageFamily === "flow") return HOSTING_PLANS.bot;
  if (packageFamily === "ai" || packageFamily === "knowledge") return HOSTING_PLANS.ai;
  return HOSTING_PLANS.automation;
}

export function calculateProjectQuote(input = {}) {
  const answers = normalizeProjectAnswers(input);
  const automaticExtras = automaticProjectExtraIds(answers.needs);
  const extraIds = [...new Set([...answers.extras, ...automaticExtras])];

  if (answers.interaction === "knowledge") {
    const ragIndex = extraIds.indexOf("rag");
    if (ragIndex >= 0) extraIds.splice(ragIndex, 1);
  }

  const recommendedPackage = packageFor(answers, extraIds);
  const extras = extraIds.map((id) => PROJECT_EXTRAS[id]).filter(Boolean);
  const hosting = hostingFor(recommendedPackage.family, answers.hosting);
  const extrasTotal = extras.reduce((total, extra) => total + extra.implementation, 0);
  const implementationTotal = recommendedPackage.implementation + extrasTotal;
  const monthlyTotal = hosting?.monthly || 0;
  const channel = CHANNEL_OPTIONS.find(({ id }) => id === answers.channel);
  const needs = NEED_OPTIONS.filter(({ id }) => answers.needs.includes(id));
  const websiteScope = WEBSITE_SCOPE_OPTIONS.find(({ id }) => id === answers.websiteScope);
  const websiteRequiresQuote = ["landing", "complete"].includes(answers.websiteScope);

  return {
    version: PROJECT_CATALOG_VERSION,
    currency: "EUR",
    taxIncluded: false,
    taxLabel: "SIN IVA",
    answers,
    needs,
    channel,
    websiteScope,
    reviewRequired: websiteRequiresQuote,
    quoteOnlyItems: websiteRequiresQuote
      ? [answers.websiteScope === "landing" ? "Desarrollo de landing" : "Desarrollo de web completa"]
      : [],
    package: recommendedPackage,
    extras,
    hosting,
    implementation: {
      base: recommendedPackage.implementation,
      extras: extrasTotal,
      total: implementationTotal,
      from: Boolean(recommendedPackage.from || extras.some((extra) => extra.from)),
    },
    monthly: {
      total: monthlyTotal,
      label: hosting?.label || "Alojamiento no incluido",
      from: Boolean(hosting?.from),
    },
    externalConsumptions: EXTERNAL_CONSUMPTIONS,
  };
}

export const projectPricingInternals = {
  hostingFor,
  packageFor,
};
