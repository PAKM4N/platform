const choice = (value, label) => ({ value, label });

const single = (id, label, options, hint = "Selecciona una opción.") => ({
  id,
  label,
  type: "single",
  hint,
  required: true,
  options: options.map(([value, optionLabel]) => choice(value, optionLabel)),
});

const multi = (id, label, options, hint = "Puedes elegir varias opciones.") => ({
  id,
  label,
  type: "multi",
  hint,
  required: true,
  minSelections: 1,
  options: options.map(([value, optionLabel]) => choice(value, optionLabel)),
});

const text = (id, label, placeholder, hint = "No incluyas datos personales reales.") => ({
  id,
  label,
  type: "text",
  placeholder,
  hint,
  required: true,
  minLength: 3,
  maxLength: 500,
});

const number = (id, label, min, max, suffix = "") => ({
  id,
  label,
  type: "number",
  hint: `Indica un valor entre ${min} y ${max}${suffix ? ` ${suffix}` : ""}.`,
  required: true,
  integer: true,
  min,
  max,
  suffix,
});

const date = (id, label) => ({
  id,
  label,
  type: "date",
  hint: "Elige hoy o una fecha futura. No se realizará ninguna reserva.",
  required: true,
  minDate: "today",
});

const CHANNEL_OPTIONS = [
  ["email", "Email"],
  ["phone", "Llamada"],
  ["whatsapp", "WhatsApp"],
  ["web", "Continuar en la web"],
];

const URGENCY_OPTIONS = [
  ["today", "Lo antes posible"],
  ["week", "Durante esta semana"],
  ["month", "Durante este mes"],
  ["planning", "Solo estoy planificando"],
];

const FLEXIBILITY_OPTIONS = [
  ["exact", "Necesito esa fecha"],
  ["nearby", "Puedo moverla uno o dos días"],
  ["flexible", "Tengo flexibilidad total"],
];

export const DEMO_CATEGORIES = [
  { id: "agenda", label: "Reservas y agenda" },
  { id: "sales", label: "Captación y venta" },
  { id: "operations", label: "Operaciones" },
  { id: "support", label: "Atención y soporte" },
];

export const DEMO_CATALOG = [
  {
    id: "reservations",
    slug: "reservas",
    name: "Reservas",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "booking",
    icon: "calendar-check",
    accent: "#3157d5",
    tint: "#eaf0ff",
    description:
      "Recoge servicio, fecha y preferencias antes de comprobar una reserva.",
    capabilities: ["Disponibilidad", "Confirmación", "Recordatorios"],
    questions: [
      single("service", "¿Qué quieres reservar?", [
        ["activity", "Una actividad"],
        ["space", "Un espacio"],
        ["professional", "Tiempo con un profesional"],
        ["resource", "Un recurso o material"],
      ]),
      date("preferredDate", "¿Para qué fecha?"),
      single("timeWindow", "¿Qué franja prefieres?", [
        ["morning", "Mañana"],
        ["midday", "Mediodía"],
        ["afternoon", "Tarde"],
        ["any", "Me adapto"],
      ]),
      number("partySize", "¿Para cuántas personas?", 1, 30, "personas"),
    ],
    result: {
      title: "Solicitud de reserva preparada",
      description:
        "El sistema ya podría consultar agenda, ofrecer huecos y pedir confirmación.",
      status: "Pendiente de validar disponibilidad",
      nextSteps: ["Consultar agenda", "Proponer alternativas", "Confirmar al cliente"],
    },
  },
  {
    id: "quote-request",
    slug: "solicitud-presupuestos",
    name: "Solicitud de presupuestos",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "quote",
    icon: "calculator",
    accent: "#7b4cd4",
    tint: "#f2ebff",
    description:
      "Describe lo que necesitas y recibe un resumen claro para preparar una propuesta.",
    capabilities: ["Necesidades", "Plazos", "Resumen editable"],
    questions: [
      single("projectType", "¿Qué necesitas presupuestar?", [
        ["service", "Un servicio"],
        ["installation", "Una instalación"],
        ["repair", "Una reparación"],
        ["custom", "Un proyecto a medida"],
      ]),
      text("scope", "Describe brevemente el alcance", "Ejemplo: dos espacios de unos 40 m²"),
      single("urgency", "¿Cuándo lo necesitas?", URGENCY_OPTIONS),
      single("channel", "¿Cómo prefieres recibir la valoración?", CHANNEL_OPTIONS),
    ],
    result: {
      title: "Tu solicitud, lista para valorar",
      description:
        "Las respuestas quedan estructuradas para calcular, revisar o asignar la solicitud.",
      status: "Resumen de ejemplo · sin envío",
      nextSteps: ["Aplicar reglas de precio", "Revisión comercial", "Enviar propuesta"],
    },
  },
  {
    id: "appointments",
    slug: "citas",
    name: "Citas",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "appointment",
    icon: "calendar-clock",
    accent: "#087f96",
    tint: "#e3f7fa",
    description:
      "Organiza el motivo, profesional y horario de una cita sin intercambios innecesarios.",
    capabilities: ["Agenda", "Profesionales", "Reprogramación"],
    questions: [
      single("appointmentType", "¿Qué tipo de cita necesitas?", [
        ["initial", "Primera consulta"],
        ["followup", "Seguimiento"],
        ["assessment", "Valoración"],
        ["other", "Otro motivo"],
      ]),
      single("professional", "¿Tienes preferencia de profesional?", [
        ["any", "Primera persona disponible"],
        ["same", "La misma persona que me atendió"],
        ["specialist", "Un especialista concreto"],
      ]),
      date("preferredDate", "¿Qué día prefieres?"),
      single("timeWindow", "¿En qué horario?", [
        ["morning", "De 09:00 a 12:00"],
        ["midday", "De 12:00 a 16:00"],
        ["afternoon", "De 16:00 a 20:00"],
        ["any", "Cualquier horario"],
      ]),
    ],
    result: {
      title: "Petición de cita lista",
      description:
        "El siguiente paso sería cruzar preferencias con la agenda del centro.",
      status: "Preparada para buscar hueco",
      nextSteps: ["Consultar profesionales", "Ofrecer horarios", "Enviar recordatorio"],
    },
  },
  {
    id: "stock",
    slug: "consulta-stock",
    name: "Consulta de inventario y stock",
    eyebrow: "OPERACIONES",
    category: "operations",
    template: "lookup",
    icon: "boxes",
    accent: "#b86a16",
    tint: "#fff3df",
    description:
      "Simula una consulta de existencias por producto, cantidad y punto de entrega.",
    capabilities: ["Stock", "Alternativas", "Avisos"],
    questions: [
      text("product", "¿Qué producto buscas?", "Ejemplo: referencia AX-204 o silla ergonómica"),
      number("quantity", "¿Cuántas unidades necesitas?", 1, 500, "unidades"),
      single("location", "¿Dónde las necesitas?", [
        ["store", "Recogida en tienda"],
        ["warehouse", "Recogida en almacén"],
        ["delivery", "Envío a domicilio"],
        ["any", "Cualquier ubicación"],
      ]),
      single("alternatives", "Si no hay stock suficiente, ¿buscamos alternativas?", [
        ["similar", "Sí, productos similares"],
        ["partial", "Sí, una entrega parcial"],
        ["wait", "Prefiero esperar reposición"],
        ["no", "No, solo esa referencia"],
      ]),
    ],
    result: {
      title: "Consulta de stock simulada",
      description:
        "Una integración real devolvería unidades, ubicaciones y próxima reposición.",
      status: "Datos de inventario de demostración",
      nextSteps: ["Consultar ERP", "Comparar almacenes", "Avisar o reservar unidades"],
    },
  },
  {
    id: "customer-faq",
    slug: "atencion-cliente-faq",
    name: "Atención al cliente y preguntas frecuentes",
    eyebrow: "ATENCIÓN Y SOPORTE",
    category: "support",
    template: "faq",
    icon: "message-question",
    accent: "#17725d",
    tint: "#e5f6f0",
    description:
      "Responde preguntas habituales y deriva solo los casos que necesitan intervención.",
    capabilities: ["Preguntas frecuentes", "Ayuda", "Atención personal"],
    questions: [
      single("topic", "¿Sobre qué tema necesitas ayuda?", [
        ["hours", "Horarios y contacto"],
        ["services", "Servicios disponibles"],
        ["conditions", "Condiciones o políticas"],
        ["specific", "Una consulta específica"],
      ]),
      text("question", "Escribe la pregunta de ejemplo", "Ejemplo: ¿puedo cambiar una reserva?"),
      single("detailLevel", "¿Qué tipo de respuesta sería más útil?", [
        ["short", "Respuesta directa"],
        ["steps", "Instrucciones paso a paso"],
        ["document", "Enlace a documentación"],
        ["agent", "Hablar con una persona"],
      ]),
    ],
    result: {
      title: "Respuesta y siguiente paso preparados",
      description:
        "La demo clasifica la consulta; una base de conocimiento aportaría la respuesta real.",
      status: "Consulta clasificada",
      nextSteps: ["Consultar información del negocio", "Preparar una respuesta", "Derivar a una persona si hace falta"],
    },
  },
  {
    id: "lead-capture",
    slug: "captacion-leads",
    name: "Captación de clientes",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "lead",
    icon: "user-plus",
    accent: "#d44e6b",
    tint: "#ffedf1",
    description:
      "Detecta interés, encaje y momento de compra antes de entregar el contacto al equipo.",
    capabilities: ["Necesidades", "Interés", "Seguimiento"],
    questions: [
      single("interest", "¿Qué solución te interesa?", [
        ["information", "Quiero entender las opciones"],
        ["demo", "Quiero ver una demostración"],
        ["proposal", "Necesito una propuesta"],
        ["partner", "Busco una colaboración"],
      ]),
      single("businessSize", "¿Qué tamaño tiene el negocio de ejemplo?", [
        ["solo", "Profesional independiente"],
        ["small", "De 2 a 10 personas"],
        ["medium", "De 11 a 50 personas"],
        ["large", "Más de 50 personas"],
      ]),
      single("timeline", "¿En qué plazo se plantea el proyecto?", URGENCY_OPTIONS),
      single("channel", "¿Qué canal de contacto preferiría?", CHANNEL_OPTIONS),
    ],
    result: {
      title: "Una primera conversación bien encaminada",
      description:
        "El equipo tendría el contexto necesario para preparar una respuesta útil y acordar el siguiente paso.",
      status: "Demo: no se ha enviado ningún dato",
      nextSteps: ["Calcular encaje", "Asignar responsable", "Crear seguimiento"],
    },
  },
  {
    id: "information-request",
    slug: "solicitud-informacion",
    name: "Solicitud de información",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "lead",
    icon: "file-question",
    accent: "#4b68c8",
    tint: "#ebefff",
    description:
      "Encuentra qué información necesitas y cómo prefieres recibir una respuesta.",
    capabilities: ["Clasificación", "Documentación", "Seguimiento"],
    questions: [
      single("topic", "¿Qué información buscas?", [
        ["service", "Información sobre un servicio"],
        ["conditions", "Condiciones y requisitos"],
        ["technical", "Documentación técnica"],
        ["commercial", "Información comercial"],
      ]),
      text("detail", "¿Qué necesitas saber exactamente?", "Ejemplo: requisitos, plazos y documentación necesaria"),
      single("format", "¿Cómo sería más útil recibirla?", [
        ["answer", "Una respuesta breve"],
        ["guide", "Una guía paso a paso"],
        ["document", "Un documento descargable"],
        ["call", "Una explicación por llamada"],
      ]),
      single("channel", "¿Por qué canal continuarías?", CHANNEL_OPTIONS),
    ],
    result: {
      title: "Solicitud de información organizada",
      description:
        "El sistema sabe qué contenido entregar y cuándo debe intervenir una persona.",
      status: "Lista para responder",
      nextSteps: ["Localizar contenido", "Preparar respuesta", "Registrar seguimiento"],
    },
  },
  {
    id: "orders",
    slug: "pedidos",
    name: "Pedidos",
    eyebrow: "OPERACIONES",
    category: "operations",
    template: "order",
    icon: "shopping-bag",
    accent: "#9c5a24",
    tint: "#fff0e5",
    description:
      "Construye un pedido guiado y revisable antes de confirmar cantidades y entrega.",
    capabilities: ["Catálogo", "Cantidades", "Confirmación"],
    questions: [
      single("family", "¿Qué familia de producto buscas?", [
        ["consumables", "Consumibles"],
        ["equipment", "Equipamiento"],
        ["spares", "Recambios"],
        ["custom", "Producto personalizado"],
      ]),
      text("product", "Indica el producto o referencia", "Ejemplo: caja modelo Pro, color negro"),
      number("quantity", "¿Cuántas unidades?", 1, 500, "unidades"),
      single("delivery", "¿Cómo quieres recibirlo?", [
        ["pickup", "Recogida"],
        ["standard", "Envío estándar"],
        ["express", "Envío urgente"],
        ["scheduled", "Entrega programada"],
      ]),
    ],
    result: {
      title: "Pedido preparado para revisión",
      description:
        "Antes de cursarlo se mostrarían stock, impuestos, entrega y precio definitivo.",
      status: "Cesta simulada · sin pago",
      nextSteps: ["Validar stock", "Calcular entrega", "Confirmar pedido"],
    },
  },
  {
    id: "availability",
    slug: "consulta-disponibilidad",
    name: "Disponibilidad de productos o servicios",
    eyebrow: "OPERACIONES",
    category: "operations",
    template: "lookup",
    icon: "search-check",
    accent: "#13816c",
    tint: "#e5f7f2",
    description:
      "Indica qué necesitas, para qué fecha y si puedes considerar otras alternativas.",
    capabilities: ["Búsqueda", "Alternativas", "Reserva"],
    questions: [
      single("resourceType", "¿Qué quieres comprobar?", [
        ["product", "Un producto"],
        ["service", "Un servicio"],
        ["space", "Un espacio"],
        ["professional", "Un profesional"],
      ]),
      text("resource", "¿Qué recurso concreto?", "Ejemplo: sala grande, modelo X o instalación premium"),
      date("preferredDate", "¿Para qué fecha?"),
      single("flexibility", "¿Tienes flexibilidad?", FLEXIBILITY_OPTIONS),
    ],
    result: {
      title: "Búsqueda de disponibilidad preparada",
      description:
        "Una integración real consultaría el origen de datos y ordenaría las alternativas.",
      status: "Resultado simulado",
      nextSteps: ["Consultar disponibilidad", "Ordenar opciones", "Reservar o avisar"],
    },
  },
  {
    id: "restaurant",
    slug: "reserva-restaurante",
    name: "Restaurante y reserva de mesa",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "booking",
    icon: "utensils",
    accent: "#bf5638",
    tint: "#fff0e9",
    description:
      "Simula una reserva de mesa con comensales, fecha, turno y preferencias.",
    capabilities: ["Mesas", "Turnos", "Preferencias"],
    questions: [
      number("diners", "¿Cuántas personas seréis?", 1, 20, "comensales"),
      date("preferredDate", "¿Qué día queréis venir?"),
      single("time", "¿Qué turno preferís?", [
        ["lunch-early", "Comida · 13:30"],
        ["lunch-late", "Comida · 15:00"],
        ["dinner-early", "Cena · 20:30"],
        ["dinner-late", "Cena · 22:00"],
      ]),
      single("area", "¿Alguna preferencia de mesa?", [
        ["inside", "Interior"],
        ["terrace", "Terraza"],
        ["quiet", "Zona tranquila"],
        ["any", "Sin preferencia"],
      ]),
    ],
    result: {
      title: "Reserva lista para confirmar",
      description:
        "El restaurante recibiría una petición completa y podría ofrecer una mesa disponible.",
      status: "Petición de ejemplo · sin mesa reservada",
      nextSteps: ["Comprobar aforo", "Bloquear mesa", "Enviar confirmación"],
    },
  },
  {
    id: "workshop",
    slug: "cita-taller",
    name: "Taller y cita de reparación",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "appointment",
    icon: "wrench",
    accent: "#d9583d",
    tint: "#fff0e9",
    description:
      "Clasifica la avería y prepara una cita de taller con la información necesaria.",
    capabilities: ["Averías", "Mantenimiento", "Agenda"],
    legacyLinks: [{ path: "/reservas-de-taller", label: "Simulador detallado de taller" }],
    questions: [
      text("vehicle", "¿Qué vehículo es?", "Ejemplo: turismo híbrido de 2021"),
      multi("service", "¿Qué necesita?", [
        ["diagnosis", "Diagnosis"],
        ["maintenance", "Mantenimiento"],
        ["repair", "Reparación"],
        ["tires", "Neumáticos"],
      ]),
      text("symptoms", "¿Qué debe saber el taller?", "Ejemplo: toca revisión anual o vibra al frenar", "Si no hay una avería, indica el mantenimiento que necesitas. Usa un caso ficticio."),
      single("urgency", "¿Con qué urgencia?", URGENCY_OPTIONS),
    ],
    result: {
      title: "Entrada de taller preparada",
      description:
        "El taller puede priorizar el caso, estimar duración y ofrecer una cita adecuada.",
      status: "Pendiente de diagnosis y hueco",
      nextSteps: ["Clasificar intervención", "Estimar duración", "Asignar cita"],
    },
  },
  {
    id: "care-appointments",
    slug: "citas-clinica-estetica-peluqueria",
    name: "Clínica, estética y peluquería",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "appointment",
    icon: "stethoscope",
    accent: "#a54882",
    tint: "#faeaf4",
    description:
      "Elige el centro, el servicio y el día que te encaja para preparar una cita.",
    capabilities: ["Tratamientos", "Agenda", "Recordatorios"],
    questions: [
      single("business", "¿Qué centro quieres simular?", [
        ["clinic", "Clínica"],
        ["aesthetic", "Centro de estética"],
        ["hairdresser", "Peluquería"],
      ]),
      {
        ...single("service", "¿Qué tipo de atención necesitas?", [
        ["assessment", "Primera valoración"],
        ["short", "Servicio de hasta 30 minutos"],
        ["standard", "Servicio de unos 60 minutos"],
        ["extended", "Tratamiento largo"],
        ]),
        variants: [
          { when: { business: "clinic" }, options: [choice("assessment", "Primera consulta"), choice("followup", "Consulta de seguimiento"), choice("checkup", "Revisión programada")] },
          { when: { business: "aesthetic" }, options: [choice("assessment", "Primera valoración"), choice("facial", "Cuidado facial"), choice("body", "Cuidado corporal")] },
          { when: { business: "hairdresser" }, options: [choice("cut", "Corte de pelo"), choice("color", "Coloración"), choice("styling", "Peinado para un evento")] },
        ],
      },
      date("preferredDate", "¿Qué día prefieres?"),
      single("timeWindow", "¿Qué franja te encaja?", [
        ["morning", "Mañana"],
        ["midday", "Mediodía"],
        ["afternoon", "Tarde"],
        ["any", "Primera disponible"],
      ]),
    ],
    result: {
      title: "Cita lista para buscar hueco",
      description:
        "La duración y el tipo de servicio permiten consultar la agenda adecuada.",
      status: "Sin datos sanitarios reales",
      nextSteps: ["Seleccionar agenda", "Proponer hueco", "Programar recordatorio"],
    },
  },
  {
    id: "rental",
    slug: "alquiler",
    name: "Alquiler de bicicletas, vehículos o material",
    eyebrow: "RESERVAS Y AGENDA",
    category: "agenda",
    template: "booking",
    icon: "bike",
    accent: "#668c18",
    tint: "#eff6dc",
    description:
      "Prueba cómo solicitar una bicicleta, un vehículo o material para los días que necesitas.",
    capabilities: ["Flota", "Duración", "Entrega"],
    legacyLinks: [
      { path: "/alquiler-de-vehiculos", label: "Simulador de vehículos" },
      { path: "/alquiler-de-bicicletas", label: "Simulador de bicicletas" },
    ],
    questions: [
      single("rentalType", "¿Qué quieres alquilar?", [
        ["bike", "Una bicicleta"],
        ["vehicle", "Un vehículo"],
        ["tool", "Herramientas o maquinaria"],
        ["event", "Material para un evento"],
      ]),
      date("startDate", "¿Cuándo empieza el alquiler?"),
      number("duration", "¿Durante cuántos días?", 1, 60, "días"),
      single("delivery", "¿Cómo quieres recibirlo?", [
        ["pickup", "Recogida en el establecimiento"],
        ["delivery", "Entrega en una dirección"],
        ["other", "Recogida en otro punto"],
      ]),
    ],
    result: {
      title: "Solicitud de alquiler preparada",
      description:
        "Una conexión con la flota devolvería unidades, tarifa y condiciones disponibles.",
      status: "Disponibilidad simulada",
      nextSteps: ["Consultar flota", "Calcular tarifa", "Bloquear recurso"],
    },
  },
  {
    id: "real-estate",
    slug: "inmobiliaria",
    name: "Inmobiliaria",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "lead",
    icon: "building",
    accent: "#3c669f",
    tint: "#e8f1fc",
    description:
      "Prepara una búsqueda, una visita o la valoración de un inmueble según tu objetivo.",
    capabilities: ["Criterios", "Inmuebles", "Visitas"],
    questions: [
      single("operation", "¿Qué operación te interesa?", [
        ["buy", "Comprar"],
        ["rent", "Alquilar"],
        ["sell", "Vender"],
        ["valuation", "Solicitar valoración"],
      ]),
      single("property", "¿Qué tipo de inmueble?", [
        ["flat", "Piso"],
        ["house", "Casa"],
        ["commercial", "Local u oficina"],
        ["land", "Terreno"],
      ]),
      text("area", "¿En qué zona?", "Ejemplo: centro y barrios próximos"),
      {
        ...single("nextStep", "¿Cuál sería el siguiente paso ideal?", [
        ["list", "Ver propiedades"],
        ["visit", "Concertar una visita"],
        ["call", "Hablar con un agente"],
        ["alerts", "Crear una alerta"],
        ]),
        variants: [{
          when: { operation: ["sell", "valuation"] },
          label: "¿Cómo prefieres empezar la valoración?",
          options: [choice("estimate", "Recibir una valoración orientativa"), choice("property-visit", "Concertar una visita al inmueble"), choice("agent-call", "Hablar con un agente")],
        }],
      },
    ],
    result: {
      title: "Tu búsqueda inmobiliaria, preparada",
      description:
        "Los criterios pueden cruzarse con cartera, agenda y alertas automáticas.",
      status: "Búsqueda de ejemplo preparada",
      nextSteps: ["Buscar coincidencias", "Priorizar inmuebles", "Proponer visita"],
      variants: [{
        when: { operation: ["sell", "valuation"] },
        title: "Tu petición de valoración, preparada",
        description: "La agencia tendría el tipo de inmueble, la zona y tu preferencia para organizar una valoración.",
        status: "Valoración de ejemplo · sin contacto real",
        nextSteps: ["Revisar las características del inmueble", "Analizar propiedades comparables", "Acordar una valoración con el propietario"],
      }],
    },
  },
  {
    id: "moving",
    slug: "mudanzas",
    name: "Empresa de mudanzas",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "quote",
    icon: "truck",
    accent: "#137560",
    tint: "#e5f5ef",
    description:
      "Dimensiona una mudanza antes de preparar una estimación o visita técnica.",
    capabilities: ["Volumen", "Accesos", "Presupuesto"],
    legacyLinks: [{ path: "/presupuesto-de-mudanza", label: "Simulador detallado de mudanza" }],
    questions: [
      single("property", "¿Qué quieres trasladar?", [
        ["studio", "Estudio o pocas pertenencias"],
        ["flat", "Piso"],
        ["house", "Casa"],
        ["office", "Oficina o negocio"],
      ]),
      text("route", "Indica origen y destino de ejemplo", "Ejemplo: Madrid centro → Toledo"),
      number("rooms", "¿Cuántas estancias tienen mobiliario?", 1, 20, "estancias"),
      {
        ...multi("extras", "¿Necesitas algún servicio adicional?", [
        ["packing", "Embalaje"],
        ["assembly", "Desmontaje y montaje"],
        ["storage", "Almacenaje temporal"],
        ["lift", "Plataforma elevadora"],
        ], "Opcional. Marca lo que necesites o continúa sin extras."),
        required: false,
        minSelections: 0,
      },
    ],
    result: {
      title: "Mudanza dimensionada",
      description:
        "La solicitud reúne los factores principales para calcular una horquilla útil.",
      status: "Pendiente de validar accesos y volumen",
      nextSteps: ["Estimar volumen", "Calcular trayecto", "Preparar presupuesto"],
    },
  },
  {
    id: "technical-service",
    slug: "servicio-tecnico",
    name: "Servicios técnicos",
    eyebrow: "ATENCIÓN Y SOPORTE",
    category: "support",
    template: "ticket",
    icon: "headphones",
    accent: "#4459a5",
    tint: "#ebeeff",
    description:
      "Describe el problema y elige entre ayuda guiada, asistencia remota o visita técnica.",
    capabilities: ["Diagnóstico inicial", "Soporte", "Visitas"],
    questions: [
      single("equipment", "¿Qué equipo necesita asistencia?", [
        ["computer", "Equipo informático"],
        ["appliance", "Electrodoméstico"],
        ["installation", "Instalación"],
        ["machinery", "Maquinaria"],
      ]),
      text("symptom", "¿Qué ocurre?", "Ejemplo: se detiene después de varios minutos"),
      single("status", "¿El equipo sigue funcionando?", [
        ["yes", "Sí, con limitaciones"],
        ["intermittent", "De forma intermitente"],
        ["no", "No funciona"],
        ["unsafe", "Puede existir un riesgo"],
      ]),
      single("support", "¿Qué tipo de ayuda prefieres?", [
        ["instructions", "Instrucciones guiadas"],
        ["remote", "Asistencia remota"],
        ["visit", "Visita técnica"],
        ["unsure", "Que lo decida el técnico"],
      ]),
    ],
    result: {
      title: "Caso técnico clasificado",
      description:
        "El sistema podría aplicar protocolos, asignar prioridad y reservar una intervención.",
      status: "Consulta de ejemplo · sin técnico asignado",
      nextSteps: ["Aplicar protocolo", "Asignar prioridad", "Resolver o programar visita"],
      variants: [{
        when: { status: "unsafe" },
        title: "Este caso necesita revisión profesional",
        description: "La posible situación de riesgo se señalaría al equipo técnico antes de ofrecer ayuda. Esta demo no evalúa averías ni presta asistencia real.",
        status: "Riesgo indicado · pendiente de revisión humana",
        nextSteps: ["Dar prioridad a la revisión profesional", "Evaluar el caso con un técnico", "Acordar la intervención adecuada"],
      }],
    },
  },
  {
    id: "ecommerce",
    slug: "ecommerce",
    name: "Comercio y ecommerce",
    eyebrow: "CAPTACIÓN Y VENTA",
    category: "sales",
    template: "order",
    icon: "shopping-cart",
    accent: "#2769b0",
    tint: "#e8f3ff",
    description:
      "Ayuda a encontrar productos y guía compra, seguimiento o devolución.",
    capabilities: ["Recomendación", "Pedidos", "Postventa"],
    questions: [
      single("intent", "¿Qué quieres hacer?", [
        ["discover", "Encontrar un producto"],
        ["compare", "Comparar opciones"],
        ["track", "Consultar un pedido"],
        ["return", "Gestionar una devolución"],
      ]),
      {
        ...text("product", "¿Qué producto buscas?", "Ejemplo: mochila para portátil de 15 pulgadas"),
        variants: [{
          when: { intent: ["track", "return"] },
          label: "¿Qué pedido usamos en la demo?",
          placeholder: "Ejemplo: PED-DEMO-2048",
          hint: "Inventa una referencia. No consultaremos ningún pedido real.",
        }],
      },
      {
        ...multi("priorities", "¿Qué es importante para ti?", [
        ["price", "Precio"],
        ["availability", "Disponibilidad"],
        ["delivery", "Entrega rápida"],
        ["quality", "Calidad o prestaciones"],
        ]),
        variants: [
          {
            when: { intent: "track" }, type: "single", label: "¿Qué quieres saber del envío?", hint: "Elige la información que necesitas.",
            options: [choice("delivery-status", "Estado actual"), choice("delivery-date", "Fecha prevista de entrega"), choice("delivery-change", "Cambiar datos de entrega")],
          },
          {
            when: { intent: "return" }, type: "single", label: "¿Cuál es el motivo de la devolución?", hint: "Usa un caso de ejemplo.",
            options: [choice("damaged", "Ha llegado dañado"), choice("wrong", "He recibido otro producto"), choice("fit", "No es lo que esperaba"), choice("other", "Otro motivo")],
          },
        ],
      },
      single("channel", "¿Dónde continuarías el proceso?", [
        ["web", "En la tienda web"],
        ["whatsapp", "Por WhatsApp"],
        ["agent", "Con una persona"],
      ]),
    ],
    result: {
      title: "Recorrido ecommerce preparado",
      description:
        "La intención determina si consultar catálogo, pedido, logística o postventa.",
      status: "Sin compra ni transacción real",
      nextSteps: ["Consultar catálogo", "Personalizar respuesta", "Continuar operación"],
      variants: [
        {
          when: { intent: "track" }, title: "Consulta de envío preparada",
          description: "Una tienda conectada podría consultar el pedido y ofrecer información del transportista. Aquí solo mostramos el resumen de tu ejemplo.",
          status: "Sin consulta real al transportista",
          nextSteps: ["Verificar el pedido y su titular", "Consultar el seguimiento del envío", "Informar o gestionar la solicitud"],
        },
        {
          when: { intent: "return" }, title: "Petición de devolución preparada",
          description: "La tienda revisaría el pedido, el motivo y sus condiciones antes de indicar cómo devolverlo. Esta prueba no inicia una devolución.",
          status: "Ejemplo · sin devolución tramitada",
          nextSteps: ["Verificar el pedido y su titular", "Revisar condiciones y motivo", "Indicar las opciones y los pasos disponibles"],
        },
      ],
    },
  },
  {
    id: "incidents",
    slug: "gestion-incidencias",
    name: "Gestión de incidencias",
    eyebrow: "ATENCIÓN Y SOPORTE",
    category: "support",
    template: "ticket",
    icon: "siren",
    accent: "#c64444",
    tint: "#ffeded",
    description:
      "Explica qué ha ocurrido para que el equipo adecuado pueda atenderlo con el contexto necesario.",
    capabilities: ["Incidencias", "Prioridad", "Seguimiento"],
    questions: [
      single("category", "¿Qué tipo de incidencia quieres simular?", [
        ["access", "Acceso o credenciales"],
        ["service", "Servicio no disponible"],
        ["billing", "Facturación"],
        ["other", "Otro problema"],
      ]),
      text("description", "Describe qué sucede", "Ejemplo: el panel muestra un error al guardar"),
      single("impact", "¿A cuántas personas afecta?", [
        ["one", "A una persona"],
        ["team", "A un equipo"],
        ["company", "A toda la empresa"],
        ["customers", "También a clientes"],
      ]),
      single("severity", "¿Puedes seguir trabajando?", [
        ["low", "Sí, existe alternativa"],
        ["medium", "Solo parcialmente"],
        ["high", "No, el trabajo está bloqueado"],
        ["critical", "Existe riesgo o pérdida de datos"],
      ]),
    ],
    result: {
      title: "Resumen de la incidencia preparado",
      description:
        "El equipo recibiría el problema, el impacto y la urgencia para organizar la atención.",
      status: "Simulación · no se ha abierto una incidencia real",
      nextSteps: ["Asignar prioridad", "Enrutar al equipo", "Notificar seguimiento"],
      variants: [{
        when: { severity: ["high", "critical"] },
        title: "Incidencia con atención prioritaria",
        description: "El bloqueo o riesgo que has indicado se destacaría para que el equipo responsable valore la urgencia. Esta demo no avisa a un equipo de soporte.",
        status: "Prioridad sugerida · requiere revisión humana",
        nextSteps: ["Avisar al equipo responsable", "Revisar alcance y prioridad", "Comunicar el plan de actuación"],
      }],
    },
  },
];

export const DEMOS_BY_SLUG = Object.fromEntries(
  DEMO_CATALOG.map((demo) => [demo.slug, demo]),
);

export const DEMOS_BY_ID = Object.fromEntries(
  DEMO_CATALOG.map((demo) => [demo.id, demo]),
);

const SUPPORTED_QUESTION_TYPES = new Set([
  "single",
  "multi",
  "text",
  "number",
  "date",
]);

export function validateDemoCatalog(catalog = DEMO_CATALOG) {
  if (!Array.isArray(catalog) || catalog.length !== 18) {
    throw new Error("El catálogo debe contener exactamente 18 demos.");
  }

  const ids = new Set();
  const slugs = new Set();

  for (const demo of catalog) {
    if (!demo.id || !demo.slug || !demo.name || !demo.description) {
      throw new Error("Cada demo necesita id, slug, nombre y descripción.");
    }
    if (ids.has(demo.id) || slugs.has(demo.slug)) {
      throw new Error(`Demo duplicada: ${demo.id} / ${demo.slug}`);
    }
    ids.add(demo.id);
    slugs.add(demo.slug);

    if (!DEMO_CATEGORIES.some((category) => category.id === demo.category)) {
      throw new Error(`Categoría desconocida en ${demo.id}.`);
    }
    if (!Array.isArray(demo.questions) || demo.questions.length < 2) {
      throw new Error(`La demo ${demo.id} necesita al menos dos preguntas.`);
    }

    const questionIds = new Set();
    for (const question of demo.questions) {
      if (!question.id || !question.label || !SUPPORTED_QUESTION_TYPES.has(question.type)) {
        throw new Error(`Pregunta inválida en ${demo.id}.`);
      }
      if (questionIds.has(question.id)) {
        throw new Error(`Pregunta duplicada ${question.id} en ${demo.id}.`);
      }
      questionIds.add(question.id);
      if (["single", "multi"].includes(question.type) && !question.options?.length) {
        throw new Error(`La pregunta ${question.id} necesita opciones.`);
      }
    }
  }

  return true;
}

validateDemoCatalog();
