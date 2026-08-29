export const PROJECT_CATALOG_VERSION = "2026-08-29";

export const PROJECT_PACKAGES = {
  "smart-form-simple": {
    id: "smart-form-simple",
    family: "form",
    name: "Formulario inteligente",
    variant: "Formulario web sencillo",
    implementation: 590,
  },
  "smart-form-advanced": {
    id: "smart-form-advanced",
    family: "form",
    name: "Formulario inteligente",
    variant: "Formulario avanzado",
    implementation: 890,
  },
  "flow-web": {
    id: "flow-web",
    family: "flow",
    name: "Bot automatizado / Bot Flow",
    variant: "Web",
    implementation: 590,
  },
  "flow-telegram": {
    id: "flow-telegram",
    family: "flow",
    name: "Bot automatizado / Bot Flow",
    variant: "Telegram",
    implementation: 690,
  },
  "flow-whatsapp": {
    id: "flow-whatsapp",
    family: "flow",
    name: "Bot automatizado / Bot Flow",
    variant: "WhatsApp",
    implementation: 790,
  },
  "flow-web-whatsapp": {
    id: "flow-web-whatsapp",
    family: "flow",
    name: "Bot automatizado / Bot Flow",
    variant: "Web + WhatsApp",
    implementation: 990,
  },
  "ai-web": {
    id: "ai-web",
    family: "ai",
    name: "Asistente IA",
    variant: "Web",
    implementation: 1190,
  },
  "ai-telegram": {
    id: "ai-telegram",
    family: "ai",
    name: "Asistente IA",
    variant: "Telegram",
    implementation: 1290,
  },
  "ai-whatsapp": {
    id: "ai-whatsapp",
    family: "ai",
    name: "Asistente IA",
    variant: "WhatsApp",
    implementation: 1390,
  },
  "ai-web-whatsapp": {
    id: "ai-web-whatsapp",
    family: "ai",
    name: "Asistente IA",
    variant: "Web + WhatsApp",
    implementation: 1590,
  },
  knowledge: {
    id: "knowledge",
    family: "knowledge",
    name: "Asistente IA Profesional / Knowledge",
    variant: "IA + conocimiento de empresa",
    implementation: 1990,
    from: true,
  },
  agent: {
    id: "agent",
    family: "agent",
    name: "Agente IA",
    variant: "Conversación + acciones e integraciones",
    implementation: 2990,
    from: true,
  },
  custom: {
    id: "custom",
    family: "custom",
    name: "Automatización avanzada / proyecto a medida",
    variant: "Sistemas e integraciones complejas",
    implementation: 4990,
    from: true,
  },
};

export const NEED_OPTIONS = [
  { id: "forms", label: "Recibir solicitudes o formularios" },
  { id: "support", label: "Atender consultas frecuentes" },
  { id: "quotes", label: "Preparar presupuestos" },
  { id: "reservations", label: "Automatizar reservas o citas" },
  { id: "availability", label: "Consultar disponibilidad de productos o stock" },
  { id: "stock", label: "Consultar inventario o stock" },
  { id: "orders", label: "Recoger o gestionar pedidos" },
  { id: "leads", label: "Captar y cualificar contactos" },
  { id: "incidents", label: "Registrar y gestionar incidencias" },
  { id: "other", label: "Otro proceso o automatización" },
];

export const CHANNEL_OPTIONS = [
  { id: "web", label: "Web" },
  { id: "telegram", label: "Telegram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "web-whatsapp", label: "Web + WhatsApp" },
];

export const INTERACTION_OPTIONS = [
  {
    id: "form",
    label: "Recoger datos mediante un formulario claro",
    description: "Campos, validaciones y lógica condicional.",
  },
  {
    id: "rules",
    label: "Guiar mediante botones, menús y reglas",
    description: "Sin inteligencia artificial.",
  },
  {
    id: "ai",
    label: "Entender preguntas escritas con lenguaje natural",
    description: "IA, contexto del negocio y recopilación inteligente.",
  },
  {
    id: "knowledge",
    label: "Responder utilizando documentación de la empresa",
    description: "Base documental y flujos avanzados.",
  },
  {
    id: "actions",
    label: "Realizar acciones en otros sistemas",
    description: "Reservas, stock, CRM, ERP, pagos u otras integraciones.",
  },
];

export const PROJECT_EXTRAS = {
  stock: { id: "stock", label: "Consulta / control de stock", implementation: 490 },
  calendar: { id: "calendar", label: "Calendario / reservas / citas", implementation: 490 },
  admin: { id: "admin", label: "Panel de administración", implementation: 590 },
  pricing: { id: "pricing", label: "Cálculo automático de precios", implementation: 590 },
  documents: { id: "documents", label: "Generación de PDF / documentos", implementation: 390 },
  language: { id: "language", label: "Segundo idioma", implementation: 290 },
  rag: { id: "rag", label: "Base documental / RAG", implementation: 690 },
  payments: { id: "payments", label: "Pasarela de pago", implementation: 690 },
  api: { id: "api", label: "Integración API externa", implementation: 690, from: true },
  crm: { id: "crm", label: "Integración con CRM", implementation: 890, from: true },
  erp: { id: "erp", label: "Integración con ERP", implementation: 1290, from: true },
};

export const EXTRA_OPTIONS = Object.values(PROJECT_EXTRAS);

export const HOSTING_PLANS = {
  basic: { id: "basic", label: "Hosting básico", monthly: 39 },
  bot: { id: "bot", label: "Hosting + base de datos / bot", monthly: 49 },
  ai: { id: "ai", label: "Hosting para solución IA mediante API", monthly: 69 },
  automation: { id: "automation", label: "Agente / automatización", monthly: 99 },
  "local-ai": { id: "local-ai", label: "IA local", monthly: 149, from: true },
};

export const HOSTING_OPTIONS = [
  {
    id: "managed",
    label: "Quiero que Mercamicro gestione el alojamiento",
    description: "Aplicaremos el plan adecuado a la solución recomendada.",
  },
  {
    id: "own",
    label: "Ya tengo infraestructura o alojamiento",
    description: "No añadiremos una cuota de hosting al cálculo.",
  },
  {
    id: "local-ai",
    label: "Quiero valorar IA local",
    description: "Desde 149 €/mes según modelo y recursos necesarios.",
  },
];

export const WEBSITE_SCOPE_OPTIONS = [
  { id: "existing", label: "Ya tengo una web donde integrarlo" },
  { id: "none", label: "No necesito web; funcionará en mensajería" },
  { id: "landing", label: "Necesito una landing nueva" },
  { id: "complete", label: "Necesito una web completa nueva" },
];

export const EXTERNAL_CONSUMPTIONS = [
  "OpenAI u otras APIs de inteligencia artificial",
  "WhatsApp Business / Meta",
  "SMS",
  "APIs externas",
  "Otros servicios de terceros",
];
