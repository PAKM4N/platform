export const TENANT = {
  slug: "mercamicro-presupuestos",
  name: "Mercamicro Presupuestos",
  botSlug: "asistente-presupuestos",
  botName: "Asistente Mercamicro",
  allowedHosts: [
    "presupuestos.mercamicro.es",
    "demo.mercamicro.es",
    "demos.mercamicro.es",
    "ingress.chatbots.mercamicro.es",
    "localhost",
    "127.0.0.1",
  ],
  projectLeadAllowedHosts: [
    "presupuestos.mercamicro.es",
    "localhost",
    "127.0.0.1",
  ],
  telegram: {
    enabled: process.env.TELEGRAM_ENABLED === "true",
  },
};

export function hostWithoutPort(value = "") {
  const firstValue = String(value).split(",")[0].trim().toLowerCase();
  if (firstValue.startsWith("[")) {
    return firstValue.replace(/^\[|\](?::\d+)?$/g, "");
  }
  return firstValue.replace(/:\d+$/, "");
}

export function isAllowedHost(value) {
  return TENANT.allowedHosts.includes(hostWithoutPort(value));
}
