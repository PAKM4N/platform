import {
  Bike,
  CarFront,
  Hammer,
  PaintRoller,
  SprayCan,
  Truck,
  Wrench,
} from "lucide-react";

export const SERVICES = {
  vehicles: {
    id: "vehicles",
    slug: "alquiler-de-vehiculos",
    image: "/sectors/vehiculos.png",
    name: "Alquiler de vehículos",
    shortName: "Vehículos",
    eyebrow: "MOVILIDAD",
    heroTitle: "Tu ruta empieza antes de arrancar.",
    heroLead:
      "Elige el vehículo, la cobertura y las condiciones del trayecto. La estimación cambia contigo, sin letra pequeña.",
    question: "¿Qué necesitas conducir?",
    highlights: ["categoría y duración", "cobertura y conductor", "recogida y devolución"],
    description:
      "Cotización por categoría, trayecto, conductor, cobertura y equipamiento.",
    chat: {
      customer: "Necesito un coche automático para tres días y viajo con un bebé.",
      bot: "Puedo ayudarte. Para tres días tienes compactos automáticos desde 168 €, antes de cobertura y extras.",
      followUp:
        "¿Lo recoges en el centro o en el aeropuerto? También puedo añadir una silla infantil.",
    },
    from: "desde 36 €/día",
    icon: CarFront,
    accent: "#3157d5",
    tint: "#e9eeff",
    timeline: "Confirmación inmediata",
    ruleCount: 14,
    factors: ["duración", "conductor", "cobertura", "devolución"],
    steps: {
      1: {
        label: "Alquiler",
        title: "Define el alquiler",
        description: "Vehículo, duración y puntos de recogida y devolución.",
      },
      2: {
        label: "Conductor",
        title: "Conductor y condiciones de uso",
        description: "Los datos que afectan a disponibilidad, riesgo y tarifa diaria.",
      },
      3: {
        label: "Extras",
        title: "Fecha, extras y contacto",
        description: "Ultima los detalles para preparar una solicitud completa.",
      },
    },
    fields: [
      {
        id: "vehicleType",
        label: "Categoría",
        type: "select",
        step: 1,
        default: "compact",
        options: [
          ["economy", "Económico · 3–4 plazas"],
          ["compact", "Compacto · 5 plazas"],
          ["suv", "SUV · maletero amplio"],
          ["van", "Furgoneta · hasta 8 m³"],
          ["premium", "Berlina premium"],
        ],
      },
      {
        id: "days",
        label: "Duración estimada",
        type: "number",
        step: 1,
        default: 3,
        min: 1,
        max: 60,
        suffix: "días",
      },
      {
        id: "pickup",
        label: "Recogida",
        type: "select",
        step: 1,
        default: "city",
        options: [
          ["city", "Oficina centro"],
          ["station", "Estación de tren"],
          ["airport", "Aeropuerto"],
          ["delivery", "Entrega en domicilio"],
        ],
      },
      {
        id: "dropoff",
        label: "Devolución",
        type: "select",
        step: 1,
        default: "same",
        options: [
          ["same", "Mismo punto de recogida"],
          ["other-city", "Otra oficina de la ciudad"],
          ["one-way", "Otra ciudad"],
        ],
      },
      {
        id: "transmission",
        label: "Cambio",
        type: "select",
        step: 2,
        default: "manual",
        options: [
          ["manual", "Manual"],
          ["automatic", "Automático"],
        ],
      },
      {
        id: "fuel",
        label: "Motorización preferida",
        type: "select",
        step: 2,
        default: "any",
        options: [
          ["any", "Sin preferencia"],
          ["petrol", "Gasolina"],
          ["diesel", "Diésel"],
          ["hybrid", "Híbrido"],
          ["electric", "Eléctrico"],
        ],
      },
      {
        id: "kmPlan",
        label: "Kilometraje previsto",
        type: "select",
        step: 2,
        default: "100",
        options: [
          ["100", "Hasta 100 km / día"],
          ["250", "Hasta 250 km / día"],
          ["unlimited", "Kilómetros ilimitados"],
        ],
      },
      {
        id: "insurance",
        label: "Cobertura",
        type: "select",
        step: 2,
        default: "plus",
        options: [
          ["basic", "Básica · franquicia alta"],
          ["plus", "Ampliada · franquicia reducida"],
          ["full", "Todo riesgo · sin franquicia"],
        ],
      },
      {
        id: "driverAge",
        label: "Edad del conductor principal",
        type: "number",
        step: 2,
        default: 35,
        min: 18,
        max: 85,
        suffix: "años",
      },
      {
        id: "additionalDriver",
        label: "Segundo conductor",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Añade otro conductor autorizado al contrato.",
      },
      {
        id: "startDate",
        label: "Fecha preferida",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "pickupTime",
        label: "Hora aproximada",
        type: "time",
        step: 3,
        default: "10:00",
      },
      {
        id: "childSeat",
        label: "Silla infantil",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Preparada en el vehículo al recogerlo.",
      },
      {
        id: "crossBorder",
        label: "Viaje fuera de España",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Incluye autorización y cobertura internacional.",
      },
      {
        id: "gps",
        label: "Navegador GPS",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Dispositivo físico con mapas europeos.",
      },
    ],
  },
  bicycles: {
    id: "bicycles",
    slug: "alquiler-de-bicicletas",
    image: "/sectors/bicicletas.png",
    name: "Alquiler de bicicletas",
    shortName: "Bicicletas",
    eyebrow: "MOVILIDAD",
    heroTitle: "Cada ruta empieza eligiendo bien la bicicleta.",
    heroLead:
      "Tipo de bicicleta, duración, recorrido y equipamiento se combinan para preparar un alquiler sin sorpresas.",
    question: "¿Qué ruta quieres recorrer?",
    highlights: ["tipo y cantidad", "ruta y autonomía", "protección y accesorios"],
    description:
      "Reserva por tipo de bicicleta, duración, recorrido, protección y accesorios.",
    chat: {
      customer: "Somos cuatro y queremos bicicletas eléctricas para recorrer la ciudad mañana.",
      bot: "Perfecto. Puedo preparar cuatro eléctricas urbanas con autonomía para una jornada completa.",
      followUp:
        "¿Qué altura tiene cada ciclista y preferís recogerlas o recibirlas en el alojamiento?",
    },
    from: "desde 18 €/día",
    icon: Bike,
    accent: "#668c18",
    tint: "#eff6dc",
    timeline: "Confirmación inmediata",
    ruleCount: 16,
    factors: ["modalidad", "duración", "recorrido", "equipamiento"],
    steps: {
      1: {
        label: "Alquiler",
        title: "Elige las bicicletas",
        description: "Modalidad, cantidad, duración y lugar de recogida.",
      },
      2: {
        label: "Ruta",
        title: "Define la ruta y los ciclistas",
        description: "Terreno, distancia, talla y protección durante el recorrido.",
      },
      3: {
        label: "Accesorios",
        title: "Completa el equipamiento",
        description: "Fecha, accesorios y servicios que deben estar preparados.",
      },
    },
    fields: [
      {
        id: "bikeType",
        label: "Tipo de bicicleta",
        type: "select",
        step: 1,
        default: "urban",
        options: [
          ["urban", "Urbana"],
          ["electric", "Eléctrica urbana"],
          ["mountain", "Montaña"],
          ["road", "Carretera"],
          ["cargo", "Cargo eléctrica"],
          ["kids", "Infantil"],
        ],
      },
      {
        id: "bikeCount",
        label: "Número de bicicletas",
        type: "number",
        step: 1,
        default: 2,
        min: 1,
        max: 20,
        suffix: "uds.",
      },
      {
        id: "days",
        label: "Duración",
        type: "number",
        step: 1,
        default: 1,
        min: 1,
        max: 30,
        suffix: "días",
      },
      {
        id: "pickup",
        label: "Recogida",
        type: "select",
        step: 1,
        default: "shop",
        options: [
          ["shop", "Tienda / punto de alquiler"],
          ["hotel", "Entrega en alojamiento"],
          ["station", "Estación o punto turístico"],
        ],
      },
      {
        id: "returnPlace",
        label: "Devolución",
        type: "select",
        step: 1,
        default: "same",
        options: [
          ["same", "Mismo punto"],
          ["other", "Otro punto de la ciudad"],
          ["collection", "Recogida en alojamiento"],
        ],
      },
      {
        id: "riderHeight",
        label: "Altura del ciclista principal",
        type: "select",
        step: 2,
        default: "medium",
        options: [
          ["small", "Hasta 165 cm"],
          ["medium", "166–180 cm"],
          ["large", "181–195 cm"],
          ["mixed", "Grupo con distintas alturas"],
        ],
      },
      {
        id: "routeType",
        label: "Tipo de recorrido",
        type: "select",
        step: 2,
        default: "city",
        options: [
          ["city", "Ciudad / carril bici"],
          ["mixed", "Mixto"],
          ["trail", "Pistas y caminos"],
          ["sport", "Ruta deportiva"],
        ],
      },
      {
        id: "kmPerDay",
        label: "Distancia estimada",
        type: "number",
        step: 2,
        default: 25,
        min: 1,
        max: 250,
        suffix: "km/día",
      },
      {
        id: "protection",
        label: "Cobertura por daños",
        type: "select",
        step: 2,
        default: "basic",
        options: [
          ["deposit", "Fianza estándar"],
          ["basic", "Protección básica"],
          ["full", "Protección ampliada"],
        ],
      },
      {
        id: "helmets",
        label: "Cascos para el grupo",
        type: "checkbox",
        step: 2,
        default: true,
        helper: "Preparados según las tallas indicadas.",
      },
      {
        id: "childSeat",
        label: "Silla infantil",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Silla homologada instalada antes de la recogida.",
      },
      {
        id: "startDate",
        label: "Fecha de inicio",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "startTime",
        label: "Hora de recogida",
        type: "time",
        step: 3,
        default: "10:00",
      },
      {
        id: "locks",
        label: "Candados reforzados",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Un candado por bicicleta.",
      },
      {
        id: "panniers",
        label: "Alforjas",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Juego impermeable para equipaje ligero.",
      },
      {
        id: "routePack",
        label: "Ruta recomendada y soporte",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Mapa digital y asistencia durante el alquiler.",
      },
    ],
  },
  workshop: {
    id: "workshop",
    slug: "reservas-de-taller",
    image: "/sectors/taller.png",
    name: "Reservas de taller",
    shortName: "Taller",
    eyebrow: "AUTOMOCIÓN",
    heroTitle: "Diagnosticar bien empieza por escuchar.",
    heroLead:
      "Cuéntanos qué hace el vehículo, cómo circula y qué prioridad necesitas. El taller recibe contexto antes de abrir el capó.",
    question: "¿Qué le pasa a tu vehículo?",
    highlights: ["vehículo y kilometraje", "síntomas y recambio", "prioridad y logística"],
    description:
      "Previsión de intervención según vehículo, síntomas, recambio y urgencia.",
    chat: {
      customer: "Se me ha encendido el testigo del motor y el coche pierde fuerza.",
      bot: "Conviene hacer una diagnosis antes de seguir circulando con normalidad. La comprobación inicial parte de 45 €.",
      followUp:
        "¿Qué marca, modelo y año es? ¿El testigo está fijo o parpadea?",
    },
    from: "desde 35 €",
    icon: Wrench,
    accent: "#d9583d",
    tint: "#fff0e9",
    timeline: "Hueco en 24–48 h",
    ruleCount: 16,
    factors: ["avería", "vehículo", "recambio", "urgencia"],
    steps: {
      1: {
        label: "Vehículo",
        title: "Identifica el vehículo",
        description: "Datos mínimos para ajustar tiempos de mano de obra y materiales.",
      },
      2: {
        label: "Intervención",
        title: "Describe la intervención",
        description: "Servicio, síntomas y condiciones de entrada al taller.",
      },
      3: {
        label: "Reserva",
        title: "Preferencias de reserva",
        description: "Fecha, logística y contacto para bloquear un hueco.",
      },
    },
    fields: [
      {
        id: "brand",
        label: "Marca",
        type: "text",
        step: 1,
        default: "",
        placeholder: "Ej. SEAT",
      },
      {
        id: "model",
        label: "Modelo",
        type: "text",
        step: 1,
        default: "",
        placeholder: "Ej. León",
      },
      {
        id: "year",
        label: "Año de matriculación",
        type: "number",
        step: 1,
        default: 2018,
        min: 1980,
        max: 2027,
        suffix: "año",
      },
      {
        id: "fuel",
        label: "Motorización",
        type: "select",
        step: 1,
        default: "petrol",
        options: [
          ["petrol", "Gasolina"],
          ["diesel", "Diésel"],
          ["hybrid", "Híbrido"],
          ["electric", "Eléctrico"],
          ["lpg", "GLP"],
        ],
      },
      {
        id: "mileage",
        label: "Kilometraje actual",
        type: "number",
        step: 1,
        default: 85000,
        min: 0,
        max: 600000,
        suffix: "km",
      },
      {
        id: "job",
        label: "Servicio principal",
        type: "select",
        step: 2,
        default: "maintenance",
        options: [
          ["diagnostic", "Diagnosis electrónica"],
          ["maintenance", "Revisión y mantenimiento"],
          ["brakes", "Frenos"],
          ["clutch", "Embrague"],
          ["tires", "Neumáticos"],
          ["battery", "Batería / sistema de carga"],
          ["ac", "Climatización"],
        ],
      },
      {
        id: "symptoms",
        label: "Síntomas o trabajo solicitado",
        type: "textarea",
        step: 2,
        default: "",
        placeholder:
          "Ej. vibra al frenar, se enciende un testigo o hace un ruido en frío…",
        width: "full",
      },
      {
        id: "canDrive",
        label: "¿El vehículo puede circular?",
        type: "select",
        step: 2,
        default: "yes",
        options: [
          ["yes", "Sí, con normalidad"],
          ["limited", "Sí, con precaución"],
          ["no", "No, necesita grúa"],
        ],
      },
      {
        id: "warningLight",
        label: "Hay un testigo encendido",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Se reserva tiempo de diagnosis adicional.",
      },
      {
        id: "parts",
        label: "Preferencia de recambio",
        type: "select",
        step: 2,
        default: "standard",
        options: [
          ["standard", "Equivalente de calidad"],
          ["premium", "Marca premium"],
          ["original", "Recambio original"],
        ],
      },
      {
        id: "urgency",
        label: "Prioridad",
        type: "select",
        step: 2,
        default: "normal",
        options: [
          ["normal", "Flexible · primer hueco ordinario"],
          ["express", "Prioritaria · 24–48 h"],
          ["same-day", "En el día, si hay disponibilidad"],
        ],
      },
      {
        id: "desiredDate",
        label: "Fecha preferida",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "timeWindow",
        label: "Franja de entrega",
        type: "select",
        step: 3,
        default: "morning",
        options: [
          ["morning", "08:00–11:00"],
          ["midday", "11:00–15:00"],
          ["afternoon", "15:00–18:00"],
        ],
      },
      {
        id: "pickupService",
        label: "Recogida y entrega",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Hasta 15 km alrededor del taller.",
      },
      {
        id: "replacementCar",
        label: "Vehículo de sustitución",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Reserva de turismo durante la intervención.",
      },
    ],
  },
  moving: {
    id: "moving",
    slug: "presupuesto-de-mudanza",
    image: "/sectors/mudanzas.png",
    name: "Presupuesto de mudanza",
    shortName: "Mudanzas",
    eyebrow: "HOGAR",
    heroTitle: "Mover una vida exige medir algo más que cajas.",
    heroLead:
      "Volumen, accesos, distancia y manipulación se convierten en una valoración comprensible antes del día de la mudanza.",
    question: "¿Qué te llevas contigo?",
    highlights: ["origen y destino", "volumen y accesos", "embalaje y montaje"],
    description:
      "Estimación por volumen, distancia, accesos, manipulación y fecha.",
    chat: {
      customer: "Me mudo de un piso de dos habitaciones a otra ciudad.",
      bot: "Puedo preparar una primera estimación con el volumen, la distancia y los accesos de ambas viviendas.",
      followUp:
        "¿Cuáles son los códigos postales y hay ascensor en el origen y el destino?",
    },
    from: "desde 240 €",
    icon: Truck,
    accent: "#137560",
    tint: "#e5f5ef",
    timeline: "Respuesta el mismo día",
    ruleCount: 18,
    factors: ["volumen", "distancia", "accesos", "manipulación"],
    steps: {
      1: {
        label: "Trayecto",
        title: "Dimensiona la mudanza",
        description: "Origen, destino y volumen que hay que transportar.",
      },
      2: {
        label: "Accesos",
        title: "Detalla accesos y carga",
        description: "La parte que más suele alterar personal, tiempo y vehículo.",
      },
      3: {
        label: "Servicios",
        title: "Servicios y fecha",
        description: "Embalaje, montaje, almacenaje y contacto final.",
      },
    },
    fields: [
      {
        id: "originPostcode",
        label: "Código postal de origen",
        type: "text",
        step: 1,
        default: "",
        placeholder: "Ej. 28015",
      },
      {
        id: "destinationPostcode",
        label: "Código postal de destino",
        type: "text",
        step: 1,
        default: "",
        placeholder: "Ej. 46001",
      },
      {
        id: "propertyType",
        label: "Vivienda de origen",
        type: "select",
        step: 1,
        default: "flat",
        options: [
          ["studio", "Estudio"],
          ["flat", "Piso"],
          ["house", "Casa / chalet"],
          ["office", "Oficina"],
          ["storage", "Trastero"],
        ],
      },
      {
        id: "rooms",
        label: "Estancias con mobiliario",
        type: "number",
        step: 1,
        default: 4,
        min: 1,
        max: 20,
        suffix: "est.",
      },
      {
        id: "volume",
        label: "Volumen aproximado",
        type: "number",
        step: 1,
        default: 18,
        min: 3,
        max: 150,
        suffix: "m³",
      },
      {
        id: "distance",
        label: "Distancia estimada",
        type: "number",
        step: 1,
        default: 24,
        min: 1,
        max: 2000,
        suffix: "km",
      },
      {
        id: "floorOrigin",
        label: "Planta de origen",
        type: "number",
        step: 2,
        default: 2,
        min: 0,
        max: 20,
        suffix: "ª",
      },
      {
        id: "elevatorOrigin",
        label: "Ascensor en origen",
        type: "checkbox",
        step: 2,
        default: true,
        helper: "Debe admitir muebles de tamaño medio.",
      },
      {
        id: "floorDestination",
        label: "Planta de destino",
        type: "number",
        step: 2,
        default: 1,
        min: 0,
        max: 20,
        suffix: "ª",
      },
      {
        id: "elevatorDestination",
        label: "Ascensor en destino",
        type: "checkbox",
        step: 2,
        default: true,
        helper: "Debe admitir muebles de tamaño medio.",
      },
      {
        id: "streetAccess",
        label: "Acceso del camión",
        type: "select",
        step: 2,
        default: "easy",
        options: [
          ["easy", "Puede estacionar en la puerta"],
          ["permit", "Requiere reserva de espacio"],
          ["difficult", "Más de 30 m hasta el portal"],
        ],
      },
      {
        id: "heavyItems",
        label: "Piezas pesadas o especiales",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Piano, caja fuerte, obra de arte o similar.",
      },
      {
        id: "fragile",
        label: "Carga frágil relevante",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Cristalería, cuadros o electrónica delicada.",
      },
      {
        id: "moveDate",
        label: "Fecha preferida",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "packing",
        label: "Embalaje completo",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Cajas, protección y embalaje por el equipo.",
      },
      {
        id: "assembly",
        label: "Desmontaje y montaje",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Para mobiliario de las estancias indicadas.",
      },
      {
        id: "boxes",
        label: "Cajas que debe aportar la empresa",
        type: "number",
        step: 3,
        default: 20,
        min: 0,
        max: 200,
        suffix: "cajas",
      },
      {
        id: "storageDays",
        label: "Almacenaje temporal",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 90,
        suffix: "días",
      },
    ],
  },
  cleaning: {
    id: "cleaning",
    slug: "presupuesto-de-limpieza",
    image: "/sectors/limpieza.png",
    name: "Presupuesto de limpieza",
    shortName: "Limpieza",
    eyebrow: "MANTENIMIENTO",
    heroTitle: "Cada espacio pide una limpieza distinta.",
    heroLead:
      "Superficie, uso, estado y tareas especiales definen un servicio realista, tanto si es puntual como recurrente.",
    question: "¿Qué espacio quieres poner a punto?",
    highlights: ["tipo de espacio", "estado y frecuencia", "tareas especiales"],
    description:
      "Cálculo por superficie, uso, estado, recurrencia y tareas especiales.",
    chat: {
      customer: "Necesito una limpieza a fondo de un piso de 90 m².",
      bot: "Para 90 m², la estimación inicial suele situarse entre 250 € y 300 €, según el estado y las tareas especiales.",
      followUp:
        "¿Cuántos baños tiene y quieres incluir ventanas, horno o frigorífico?",
    },
    from: "desde 59 €",
    icon: SprayCan,
    accent: "#087f96",
    tint: "#e2f5f8",
    timeline: "Disponibilidad en 48 h",
    ruleCount: 17,
    factors: ["superficie", "estado", "frecuencia", "tareas"],
    steps: {
      1: {
        label: "Espacio",
        title: "Describe el espacio",
        description: "Uso, superficie y distribución del inmueble.",
      },
      2: {
        label: "Estado",
        title: "Nivel de trabajo y frecuencia",
        description: "Estado actual, última limpieza y periodicidad deseada.",
      },
      3: {
        label: "Tareas",
        title: "Tareas especiales y fecha",
        description: "Añade solo los trabajos que realmente necesitas.",
      },
    },
    fields: [
      {
        id: "propertyType",
        label: "Tipo de inmueble",
        type: "select",
        step: 1,
        default: "home",
        options: [
          ["home", "Vivienda habitual"],
          ["holiday", "Apartamento turístico"],
          ["office", "Oficina"],
          ["commercial", "Local comercial"],
        ],
      },
      {
        id: "area",
        label: "Superficie",
        type: "number",
        step: 1,
        default: 90,
        min: 25,
        max: 1200,
        suffix: "m²",
      },
      {
        id: "bedrooms",
        label: "Dormitorios / despachos",
        type: "number",
        step: 1,
        default: 3,
        min: 0,
        max: 30,
        suffix: "uds.",
      },
      {
        id: "bathrooms",
        label: "Baños",
        type: "number",
        step: 1,
        default: 2,
        min: 0,
        max: 15,
        suffix: "uds.",
      },
      {
        id: "cleanType",
        label: "Tipo de servicio",
        type: "select",
        step: 1,
        default: "deep",
        options: [
          ["maintenance", "Mantenimiento"],
          ["deep", "Limpieza a fondo"],
          ["moveout", "Fin de alquiler"],
          ["renovation", "Después de obra"],
          ["turnover", "Cambio de huésped"],
        ],
      },
      {
        id: "condition",
        label: "Estado actual",
        type: "select",
        step: 2,
        default: "normal",
        options: [
          ["light", "Cuidado · suciedad ligera"],
          ["normal", "Uso normal"],
          ["heavy", "Suciedad acumulada"],
          ["extreme", "Requiere tratamiento intensivo"],
        ],
      },
      {
        id: "lastClean",
        label: "Última limpieza profesional",
        type: "select",
        step: 2,
        default: "month",
        options: [
          ["week", "Hace menos de 7 días"],
          ["month", "Hace menos de 1 mes"],
          ["quarter", "Hace 1–3 meses"],
          ["unknown", "Más de 3 meses / no lo sé"],
        ],
      },
      {
        id: "frequency",
        label: "Frecuencia",
        type: "select",
        step: 2,
        default: "once",
        options: [
          ["once", "Servicio puntual"],
          ["weekly", "Semanal"],
          ["biweekly", "Cada 2 semanas"],
          ["monthly", "Mensual"],
        ],
      },
      {
        id: "windows",
        label: "Ventanas accesibles",
        type: "number",
        step: 2,
        default: 6,
        min: 0,
        max: 60,
        suffix: "uds.",
      },
      {
        id: "pets",
        label: "Conviven mascotas",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Se contempla aspirado reforzado de pelo.",
      },
      {
        id: "desiredDate",
        label: "Fecha preferida",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "timeSlot",
        label: "Franja horaria",
        type: "select",
        step: 3,
        default: "morning",
        options: [
          ["morning", "Mañana · 08:00–12:00"],
          ["midday", "Mediodía · 12:00–16:00"],
          ["afternoon", "Tarde · 16:00–20:00"],
        ],
      },
      {
        id: "oven",
        label: "Interior de horno",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Desengrasado de horno, bandejas y rejillas.",
      },
      {
        id: "fridge",
        label: "Interior de frigorífico",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Limpieza con el electrodoméstico vacío.",
      },
      {
        id: "terraceArea",
        label: "Terraza o patio",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 300,
        suffix: "m²",
      },
      {
        id: "ironingHours",
        label: "Horas de plancha",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 8,
        suffix: "h",
      },
      {
        id: "supplies",
        label: "Productos y material incluidos",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Productos profesionales y maquinaria básica.",
      },
    ],
  },
  painting: {
    id: "painting",
    slug: "presupuesto-de-pintura",
    image: "/sectors/pintura.png",
    name: "Presupuesto de pintura",
    shortName: "Pintura",
    eyebrow: "REFORMA",
    heroTitle: "Un buen acabado se decide antes de abrir la pintura.",
    heroLead:
      "Medimos superficie, preparación, altura y elementos adicionales para que el color no sea la única decisión.",
    question: "¿Qué quieres transformar?",
    highlights: ["superficie y altura", "estado y acabado", "techos y elementos"],
    description:
      "Valoración por superficie, preparación, altura, acabado y elementos.",
    chat: {
      customer: "Quiero pintar un piso amueblado de unos 80 m² en color claro.",
      bot: "Puedo calcularlo teniendo en cuenta superficie de paredes, estado, protección del mobiliario y gama de pintura.",
      followUp:
        "¿Las paredes necesitan reparar grietas? ¿Quieres incluir techos y puertas?",
    },
    from: "desde 390 €",
    icon: PaintRoller,
    accent: "#8549ad",
    tint: "#f2e9f8",
    timeline: "Visita técnica opcional",
    ruleCount: 18,
    factors: ["superficie", "estado", "acabado", "protección"],
    steps: {
      1: {
        label: "Superficie",
        title: "Dimensiona el trabajo",
        description: "Tipo de inmueble, metros de pared y condiciones de ocupación.",
      },
      2: {
        label: "Acabado",
        title: "Estado y acabado deseado",
        description: "Preparación, gama de pintura y dificultad de cubrición.",
      },
      3: {
        label: "Elementos",
        title: "Elementos adicionales y fecha",
        description: "Techos, puertas, papel pintado, mobiliario y contacto.",
      },
    },
    fields: [
      {
        id: "propertyType",
        label: "Tipo de inmueble",
        type: "select",
        step: 1,
        default: "flat",
        options: [
          ["flat", "Piso"],
          ["house", "Casa / chalet"],
          ["office", "Oficina"],
          ["commercial", "Local comercial"],
        ],
      },
      {
        id: "area",
        label: "Superficie de paredes",
        type: "number",
        step: 1,
        default: 95,
        min: 20,
        max: 1600,
        suffix: "m²",
      },
      {
        id: "rooms",
        label: "Número de estancias",
        type: "number",
        step: 1,
        default: 4,
        min: 1,
        max: 40,
        suffix: "uds.",
      },
      {
        id: "ceilingHeight",
        label: "Altura de techo",
        type: "select",
        step: 1,
        default: "standard",
        options: [
          ["standard", "Hasta 2,7 m"],
          ["high", "Entre 2,7 y 3,5 m"],
          ["very-high", "Más de 3,5 m"],
        ],
      },
      {
        id: "occupied",
        label: "Estado del inmueble",
        type: "select",
        step: 1,
        default: "furnished",
        options: [
          ["empty", "Vacío"],
          ["furnished", "Amueblado"],
          ["occupied", "Habitado durante el trabajo"],
        ],
      },
      {
        id: "condition",
        label: "Estado de las paredes",
        type: "select",
        step: 2,
        default: "minor",
        options: [
          ["good", "Buen estado"],
          ["minor", "Agujeros o fisuras puntuales"],
          ["poor", "Grietas / desconchados"],
          ["very-poor", "Requiere alisado o reparación amplia"],
        ],
      },
      {
        id: "damp",
        label: "Hay manchas de humedad",
        type: "checkbox",
        step: 2,
        default: false,
        helper: "Incluye tratamiento aislante preventivo.",
      },
      {
        id: "currentTone",
        label: "Color actual",
        type: "select",
        step: 2,
        default: "light",
        options: [
          ["white", "Blanco"],
          ["light", "Tono claro"],
          ["medium", "Tono medio"],
          ["dark", "Tono oscuro / intenso"],
        ],
      },
      {
        id: "newTone",
        label: "Nuevo color",
        type: "select",
        step: 2,
        default: "light",
        options: [
          ["white", "Blanco"],
          ["light", "Tono claro"],
          ["medium", "Tono medio"],
          ["dark", "Tono oscuro / intenso"],
        ],
      },
      {
        id: "quality",
        label: "Gama de pintura",
        type: "select",
        step: 2,
        default: "washable",
        options: [
          ["standard", "Plástica estándar"],
          ["washable", "Lavable premium"],
          ["eco", "Ecológica sin olores"],
        ],
      },
      {
        id: "finish",
        label: "Acabado",
        type: "select",
        step: 2,
        default: "matte",
        options: [
          ["matte", "Mate"],
          ["eggshell", "Satinado suave"],
          ["washable", "Alta resistencia"],
        ],
      },
      {
        id: "desiredDate",
        label: "Fecha preferida",
        type: "date",
        step: 3,
        default: "",
      },
      {
        id: "ceilings",
        label: "Incluir techos",
        type: "checkbox",
        step: 3,
        default: false,
        helper: "Estimación proporcional a la superficie.",
      },
      {
        id: "doors",
        label: "Puertas a esmaltar",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 30,
        suffix: "uds.",
      },
      {
        id: "trimMeters",
        label: "Rodapié / moldura",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 500,
        suffix: "m",
      },
      {
        id: "wallpaperM2",
        label: "Retirada de papel pintado",
        type: "number",
        step: 3,
        default: 0,
        min: 0,
        max: 400,
        suffix: "m²",
      },
      {
        id: "furniture",
        label: "Mover y proteger mobiliario",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Incluye protección de suelos y enseres.",
      },
    ],
  },
  renovation: {
    id: "renovation",
    slug: "presupuesto-de-reforma-de-vivienda",
    image: "/sectors/reformas.png",
    name: "Presupuesto de reforma de vivienda",
    shortName: "Reformas",
    eyebrow: "VIVIENDA",
    heroTitle: "Una reforma se entiende mejor antes de empezar.",
    heroLead:
      "Superficie, alcance, instalaciones, materiales y estado actual construyen una primera horquilla realista.",
    question: "¿Qué vivienda quieres transformar?",
    highlights: ["alcance y superficie", "instalaciones y distribución", "calidades y plazos"],
    description:
      "Estimación por superficie, alcance, instalaciones, acabados, distribución y plazo.",
    chat: {
      customer: "Quiero hacer una reforma integral de un piso de 85 m².",
      bot: "Puedo preparar una horquilla inicial separando obra, instalaciones, cocina, baños y acabados.",
      followUp:
        "¿Cuántos baños tiene y quieres cambiar la distribución, la electricidad o la fontanería?",
    },
    from: "desde 450 €/m²",
    icon: Hammer,
    accent: "#b34f2e",
    tint: "#f8ebe4",
    timeline: "Valoración inicial inmediata",
    ruleCount: 20,
    factors: ["superficie", "alcance", "instalaciones", "calidades"],
    steps: {
      1: {
        label: "Vivienda",
        title: "Dimensiona la vivienda",
        description: "Tipo, superficie, estancias y condiciones durante la obra.",
      },
      2: {
        label: "Alcance",
        title: "Define el alcance de la reforma",
        description: "Distribución, cocina, baños, instalaciones y cerramientos.",
      },
      3: {
        label: "Calidades",
        title: "Acabados, plazo y logística",
        description: "Nivel de materiales, fecha objetivo y condiciones de acceso.",
      },
    },
    fields: [
      {
        id: "propertyType",
        label: "Tipo de vivienda",
        type: "select",
        step: 1,
        default: "flat",
        options: [
          ["flat", "Piso"],
          ["house", "Casa / chalet"],
          ["duplex", "Dúplex"],
          ["studio", "Estudio"],
        ],
      },
      {
        id: "area",
        label: "Superficie construida",
        type: "number",
        step: 1,
        default: 85,
        min: 25,
        max: 800,
        suffix: "m²",
      },
      {
        id: "rooms",
        label: "Dormitorios",
        type: "number",
        step: 1,
        default: 3,
        min: 0,
        max: 12,
        suffix: "uds.",
      },
      {
        id: "bathrooms",
        label: "Baños actuales",
        type: "number",
        step: 1,
        default: 2,
        min: 1,
        max: 8,
        suffix: "uds.",
      },
      {
        id: "occupied",
        label: "Estado durante la obra",
        type: "select",
        step: 1,
        default: "empty",
        options: [
          ["empty", "Vivienda vacía"],
          ["furnished", "Con mobiliario"],
          ["occupied", "Habitada durante la obra"],
        ],
      },
      {
        id: "scope",
        label: "Alcance principal",
        type: "select",
        step: 2,
        default: "integral",
        options: [
          ["refresh", "Actualización de acabados"],
          ["partial", "Reforma parcial"],
          ["integral", "Reforma integral"],
          ["kitchen", "Solo cocina"],
          ["bathroom", "Solo baño"],
        ],
      },
      {
        id: "layoutChanges",
        label: "Cambiar la distribución",
        type: "checkbox",
        step: 2,
        default: true,
        helper: "Demolición y construcción de tabiques interiores.",
      },
      {
        id: "kitchen",
        label: "Reformar la cocina",
        type: "checkbox",
        step: 2,
        default: true,
        helper: "Mobiliario, encimera, revestimientos e instalaciones.",
      },
      {
        id: "bathroomsToRenovate",
        label: "Baños a reformar",
        type: "number",
        step: 2,
        default: 2,
        min: 0,
        max: 8,
        suffix: "uds.",
      },
      {
        id: "electrical",
        label: "Instalación eléctrica",
        type: "select",
        step: 2,
        default: "full",
        options: [
          ["none", "Sin cambios"],
          ["partial", "Actualización parcial"],
          ["full", "Renovación completa"],
        ],
      },
      {
        id: "plumbing",
        label: "Fontanería",
        type: "select",
        step: 2,
        default: "wet-areas",
        options: [
          ["none", "Sin cambios"],
          ["wet-areas", "Cocina y baños"],
          ["full", "Renovación completa"],
        ],
      },
      {
        id: "windows",
        label: "Ventanas a sustituir",
        type: "number",
        step: 2,
        default: 4,
        min: 0,
        max: 30,
        suffix: "uds.",
      },
      {
        id: "flooring",
        label: "Pavimento",
        type: "select",
        step: 2,
        default: "laminate",
        options: [
          ["keep", "Conservar el actual"],
          ["laminate", "Laminado / vinílico"],
          ["ceramic", "Cerámico"],
          ["wood", "Madera natural"],
        ],
      },
      {
        id: "quality",
        label: "Nivel de calidades",
        type: "select",
        step: 3,
        default: "standard",
        options: [
          ["essential", "Esencial"],
          ["standard", "Media"],
          ["premium", "Alta"],
        ],
      },
      {
        id: "painting",
        label: "Pintura completa",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Preparación y pintura de paredes y techos.",
      },
      {
        id: "startWindow",
        label: "Cuándo te gustaría empezar",
        type: "select",
        step: 3,
        default: "three-months",
        options: [
          ["month", "En menos de 1 mes"],
          ["three-months", "En 1–3 meses"],
          ["six-months", "En 3–6 meses"],
          ["flexible", "Sin fecha definida"],
        ],
      },
      {
        id: "projectManagement",
        label: "Proyecto y dirección de obra",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Mediciones, coordinación de gremios y seguimiento.",
      },
      {
        id: "elevator",
        label: "Ascensor disponible",
        type: "checkbox",
        step: 3,
        default: true,
        helper: "Acceso para retirada de material y suministros.",
      },
    ],
  },
};

export const SERVICE_ORDER = [
  "vehicles",
  "bicycles",
  "workshop",
  "moving",
  "cleaning",
  "painting",
  "renovation",
];

export const SERVICES_BY_SLUG = Object.fromEntries(
  SERVICE_ORDER.map((id) => [SERVICES[id].slug, SERVICES[id]]),
);

export function initialValues(service) {
  return Object.fromEntries(
    service.fields.map((field) => [field.id, field.default]),
  );
}

export function calculateEstimate(serviceId, values) {
  const lines = [];
  let subtotal = 0;

  const add = (label, amount) => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    if (!label || safeAmount <= 0) return;
    subtotal += safeAmount;
    lines.push({ label, amount: safeAmount });
  };

  if (serviceId === "vehicles") {
    const rates = {
      economy: 36,
      compact: 46,
      suv: 72,
      van: 85,
      premium: 108,
    };
    const labels = {
      economy: "Categoría económica",
      compact: "Vehículo compacto",
      suv: "SUV",
      van: "Furgoneta",
      premium: "Berlina premium",
    };
    const days = Number(values.days) || 1;
    let rent = rates[values.vehicleType] * days;
    if (days >= 14) rent *= 0.82;
    else if (days >= 7) rent *= 0.9;
    add(`${labels[values.vehicleType]} · ${days} días`, rent);
    add(
      "Cambio automático",
      values.transmission === "automatic" ? 7 * days : 0,
    );
    add(
      values.fuel === "electric"
        ? "Preferencia eléctrica"
        : values.fuel === "hybrid"
          ? "Preferencia híbrida"
          : "",
      values.fuel === "electric" ? 9 * days : values.fuel === "hybrid" ? 6 * days : 0,
    );
    add(
      values.kmPlan === "unlimited"
        ? "Kilometraje ilimitado"
        : values.kmPlan === "250"
          ? "Ampliación a 250 km/día"
          : "",
      values.kmPlan === "unlimited"
        ? 12 * days
        : values.kmPlan === "250"
          ? 6 * days
          : 0,
    );
    add(
      values.insurance === "full"
        ? "Cobertura sin franquicia"
        : values.insurance === "plus"
          ? "Cobertura ampliada"
          : "",
      values.insurance === "full"
        ? 19 * days
        : values.insurance === "plus"
          ? 10 * days
          : 0,
    );
    add(
      "Suplemento de ubicación",
      values.pickup === "airport" ? 28 : values.pickup === "delivery" ? 32 : 0,
    );
    add(
      values.dropoff === "one-way"
        ? "Devolución en otra ciudad"
        : values.dropoff === "other-city"
          ? "Devolución en otra oficina"
          : "",
      values.dropoff === "one-way" ? 65 : values.dropoff === "other-city" ? 22 : 0,
    );
    const age = Number(values.driverAge);
    add(
      age < 25 ? "Conductor menor de 25" : age >= 70 ? "Cobertura sénior" : "",
      age < 25 ? 14 * days : age >= 70 ? 4 * days : 0,
    );
    add("Segundo conductor", values.additionalDriver ? 8 * days : 0);
    add("Silla infantil", values.childSeat ? 7 * days : 0);
    add("Navegador GPS", values.gps ? 5 * days : 0);
    add("Cobertura internacional", values.crossBorder ? 38 : 0);
  }

  if (serviceId === "bicycles") {
    const rates = {
      urban: 18,
      electric: 34,
      mountain: 28,
      road: 38,
      cargo: 52,
      kids: 14,
    };
    const labels = {
      urban: "Bicicleta urbana",
      electric: "Bicicleta eléctrica",
      mountain: "Bicicleta de montaña",
      road: "Bicicleta de carretera",
      cargo: "Bicicleta cargo eléctrica",
      kids: "Bicicleta infantil",
    };
    const count = Number(values.bikeCount) || 1;
    const days = Number(values.days) || 1;
    const discount = days >= 7 ? 0.78 : days >= 3 ? 0.88 : 1;
    add(
      `${labels[values.bikeType]} · ${count} uds. · ${days} días`,
      rates[values.bikeType] * count * days * discount,
    );
    add(
      values.pickup === "hotel"
        ? "Entrega en alojamiento"
        : values.pickup === "station"
          ? "Entrega en punto turístico"
          : "",
      values.pickup === "hotel" ? 24 : values.pickup === "station" ? 16 : 0,
    );
    add(
      values.returnPlace === "collection"
        ? "Recogida al finalizar"
        : values.returnPlace === "other"
          ? "Devolución en otro punto"
          : "",
      values.returnPlace === "collection" ? 24 : values.returnPlace === "other" ? 12 : 0,
    );
    add(
      values.protection === "full"
        ? "Protección ampliada"
        : values.protection === "basic"
          ? "Protección básica"
          : "",
      values.protection === "full"
        ? count * days * 6
        : values.protection === "basic"
          ? count * days * 3
          : 0,
    );
    add(
      "Preparación para ruta larga",
      Number(values.kmPerDay) > 70 ? count * 9 : Number(values.kmPerDay) > 40 ? count * 4 : 0,
    );
    add("Cascos", values.helmets ? count * 2 * days : 0);
    add("Silla infantil", values.childSeat ? 7 * days : 0);
    add("Candados reforzados", values.locks ? count * 1.5 * days : 0);
    add("Alforjas impermeables", values.panniers ? count * 5 * days : 0);
    add("Ruta recomendada y soporte", values.routePack ? 19 : 0);
  }

  if (serviceId === "workshop") {
    const bases = {
      diagnostic: 45,
      maintenance: 159,
      brakes: 280,
      clutch: 620,
      tires: 240,
      battery: 145,
      ac: 125,
    };
    const labels = {
      diagnostic: "Diagnosis electrónica",
      maintenance: "Revisión y mantenimiento",
      brakes: "Servicio de frenos",
      clutch: "Sustitución de embrague",
      tires: "Cambio de neumáticos",
      battery: "Batería / sistema de carga",
      ac: "Servicio de climatización",
    };
    const fuelFactor = {
      petrol: 1,
      diesel: 1.06,
      hybrid: 1.12,
      electric: 1.15,
      lpg: 1.08,
    }[values.fuel];
    const ageFactor = Number(values.year) < 2010 ? 1.12 : 1;
    const mileageFactor = Number(values.mileage) > 150000 ? 1.08 : 1;
    const partsFactor = {
      standard: 1,
      premium: 1.14,
      original: 1.28,
    }[values.parts];
    add(
      labels[values.job],
      bases[values.job] * fuelFactor * ageFactor * mileageFactor * partsFactor,
    );
    add("Diagnosis de testigo", values.warningLight && values.job !== "diagnostic" ? 32 : 0);
    add(
      values.canDrive === "no"
        ? "Traslado en grúa"
        : values.canDrive === "limited"
          ? "Comprobación de seguridad"
          : "",
      values.canDrive === "no" ? 68 : values.canDrive === "limited" ? 24 : 0,
    );
    add(
      values.urgency === "same-day"
        ? "Intervención en el día"
        : values.urgency === "express"
          ? "Atención prioritaria"
          : "",
      values.urgency === "same-day"
        ? subtotal * 0.3
        : values.urgency === "express"
          ? subtotal * 0.18
          : 0,
    );
    add("Recogida y entrega", values.pickupService ? 35 : 0);
    add("Vehículo de sustitución", values.replacementCar ? 48 : 0);
  }

  if (serviceId === "moving") {
    const volume = Number(values.volume) || 3;
    const distance = Number(values.distance) || 1;
    const propertyFactor = {
      studio: 0.92,
      flat: 1,
      house: 1.08,
      office: 1.12,
      storage: 0.9,
    }[values.propertyType];
    add(
      `Carga y transporte · ${volume} m³`,
      Math.max(150, volume * 24 * propertyFactor),
    );
    add(`Trayecto · ${distance} km`, distance * 1.1);
    add(
      `Acceso origen · planta ${values.floorOrigin || 0}`,
      !values.elevatorOrigin ? Number(values.floorOrigin || 0) * 24 : 0,
    );
    add(
      `Acceso destino · planta ${values.floorDestination || 0}`,
      !values.elevatorDestination ? Number(values.floorDestination || 0) * 27 : 0,
    );
    add(
      values.streetAccess === "difficult"
        ? "Acarreo desde zona de carga"
        : values.streetAccess === "permit"
          ? "Gestión de reserva de espacio"
          : "",
      values.streetAccess === "difficult" ? 78 : values.streetAccess === "permit" ? 46 : 0,
    );
    add("Manipulación de piezas pesadas", values.heavyItems ? 125 : 0);
    add("Protección reforzada de frágiles", values.fragile ? volume * 2.8 : 0);
    add("Embalaje completo", values.packing ? volume * 6.5 : 0);
    add(
      `Desmontaje y montaje · ${values.rooms} estancias`,
      values.assembly ? 55 + Number(values.rooms) * 16 : 0,
    );
    add(`Suministro de ${values.boxes} cajas`, Number(values.boxes) * 2.4);
    add(
      `Almacenaje temporal · ${values.storageDays} días`,
      Number(values.storageDays) * 12,
    );
    const date = values.moveDate ? new Date(`${values.moveDate}T12:00:00`) : null;
    const weekend = date && [0, 6].includes(date.getDay());
    add("Disponibilidad en fin de semana", weekend ? subtotal * 0.15 : 0);
  }

  if (serviceId === "cleaning") {
    const area = Number(values.area) || 25;
    const rates = {
      maintenance: 1.1,
      deep: 1.65,
      moveout: 1.85,
      renovation: 2.25,
      turnover: 1.4,
    };
    const typeLabels = {
      maintenance: "Limpieza de mantenimiento",
      deep: "Limpieza a fondo",
      moveout: "Limpieza fin de alquiler",
      renovation: "Limpieza después de obra",
      turnover: "Cambio de huésped",
    };
    const conditionFactor = {
      light: 0.9,
      normal: 1,
      heavy: 1.22,
      extreme: 1.48,
    }[values.condition];
    const propertyFactor = {
      home: 1,
      holiday: 1.04,
      office: 0.92,
      commercial: 1.12,
    }[values.propertyType];
    const frequencyFactor = {
      once: 1,
      weekly: 0.84,
      biweekly: 0.9,
      monthly: 0.95,
    }[values.frequency];
    const lastCleanFactor = {
      week: 0.92,
      month: 1,
      quarter: 1.08,
      unknown: 1.16,
    }[values.lastClean];
    add(
      `${typeLabels[values.cleanType]} · ${area} m²`,
      area *
        rates[values.cleanType] *
        conditionFactor *
        propertyFactor *
        frequencyFactor *
        lastCleanFactor,
    );
    add(`Baños · ${values.bathrooms}`, Number(values.bathrooms) * 9);
    add(`Dormitorios / despachos · ${values.bedrooms}`, Number(values.bedrooms) * 3.5);
    add(`Ventanas · ${values.windows}`, Number(values.windows) * 5.5);
    add("Aspirado reforzado por mascotas", values.pets ? 14 : 0);
    add("Limpieza interior de horno", values.oven ? 28 : 0);
    add("Limpieza interior de frigorífico", values.fridge ? 24 : 0);
    add(`Terraza o patio · ${values.terraceArea} m²`, Number(values.terraceArea) * 0.9);
    add(`Servicio de plancha · ${values.ironingHours} h`, Number(values.ironingHours) * 19);
    add("Productos y maquinaria", values.supplies ? 14 : 0);
  }

  if (serviceId === "painting") {
    const area = Number(values.area) || 20;
    const qualityRate = {
      standard: 6.8,
      washable: 8.8,
      eco: 10.6,
    }[values.quality];
    const conditionFactor = {
      good: 1,
      minor: 1.16,
      poor: 1.38,
      "very-poor": 1.65,
    }[values.condition];
    const heightFactor = {
      standard: 1,
      high: 1.12,
      "very-high": 1.28,
    }[values.ceilingHeight];
    const occupiedFactor = {
      empty: 0.96,
      furnished: 1.08,
      occupied: 1.18,
    }[values.occupied];
    const propertyFactor = {
      flat: 1,
      house: 1.05,
      office: 0.96,
      commercial: 1.1,
    }[values.propertyType];
    const finishFactor = {
      matte: 1,
      eggshell: 1.06,
      washable: 1.1,
    }[values.finish];
    add(
      `Preparación y pintura · ${area} m²`,
      area *
        qualityRate *
        conditionFactor *
        heightFactor *
        occupiedFactor *
        propertyFactor *
        finishFactor,
    );
    add(`Preparación de ${values.rooms} estancias`, Number(values.rooms) * 16);
    add("Tratamiento aislante de humedad", values.damp ? 95 : 0);
    const hardCover =
      values.currentTone === "dark" &&
      ["white", "light"].includes(values.newTone);
    add("Imprimación por cambio de tono", hardCover ? area * 1.45 : 0);
    add("Pintura de techos", values.ceilings ? area * qualityRate * 0.32 : 0);
    add(`Esmaltado de ${values.doors} puertas`, Number(values.doors) * 55);
    add(`Rodapié / moldura · ${values.trimMeters} m`, Number(values.trimMeters) * 3.2);
    add(
      `Retirada de papel · ${values.wallpaperM2} m²`,
      Number(values.wallpaperM2) * 7.5,
    );
    add("Protección y movimiento de mobiliario", values.furniture ? 72 : 0);
  }

  if (serviceId === "renovation") {
    const area = Number(values.area) || 25;
    const qualityFactor = {
      essential: 0.86,
      standard: 1,
      premium: 1.34,
    }[values.quality];
    const propertyFactor = {
      flat: 1,
      house: 1.08,
      duplex: 1.12,
      studio: 0.96,
    }[values.propertyType];

    if (values.scope === "kitchen") {
      add("Reforma completa de cocina", 9600 * qualityFactor);
    } else if (values.scope === "bathroom") {
      add("Reforma completa de baño", 6800 * qualityFactor);
    } else {
      const scopeRate = {
        refresh: 185,
        partial: 315,
        integral: 470,
      }[values.scope];
      const scopeLabels = {
        refresh: "Actualización de acabados",
        partial: "Base de reforma parcial",
        integral: "Base de reforma integral",
      };
      add(
        `${scopeLabels[values.scope]} · ${area} m²`,
        area * scopeRate * qualityFactor * propertyFactor,
      );
      add("Cocina", values.kitchen ? 8200 * qualityFactor : 0);
      add(
        `${values.bathroomsToRenovate} baños`,
        Number(values.bathroomsToRenovate) * 4800 * qualityFactor,
      );
    }

    add("Cambio de distribución", values.layoutChanges ? area * 62 : 0);
    add(
      values.electrical === "full"
        ? "Instalación eléctrica completa"
        : values.electrical === "partial"
          ? "Actualización eléctrica parcial"
          : "",
      values.electrical === "full"
        ? area * 58
        : values.electrical === "partial"
          ? area * 27
          : 0,
    );
    add(
      values.plumbing === "full"
        ? "Fontanería completa"
        : values.plumbing === "wet-areas"
          ? "Fontanería de cocina y baños"
          : "",
      values.plumbing === "full"
        ? area * 48
        : values.plumbing === "wet-areas"
          ? 2100 + Number(values.bathroomsToRenovate) * 850
          : 0,
    );
    add(
      `Sustitución de ${values.windows} ventanas`,
      Number(values.windows) * 620 * qualityFactor,
    );
    const flooringRates = {
      keep: 0,
      laminate: 34,
      ceramic: 49,
      wood: 82,
    };
    const flooringLabels = {
      laminate: "Pavimento laminado / vinílico",
      ceramic: "Pavimento cerámico",
      wood: "Pavimento de madera",
    };
    add(
      flooringLabels[values.flooring] || "",
      area * flooringRates[values.flooring] * qualityFactor,
    );
    add("Preparación y pintura completa", values.painting ? area * 18 : 0);
    add("Protección de vivienda amueblada", values.occupied === "furnished" ? 850 : 0);
    add("Trabajo por fases en vivienda habitada", values.occupied === "occupied" ? 2200 : 0);
    add("Proyecto y dirección de obra", values.projectManagement ? subtotal * 0.075 : 0);
    add("Logística sin ascensor", values.elevator ? 0 : Math.max(650, area * 12));
    add("Inicio prioritario", values.startWindow === "month" ? subtotal * 0.08 : 0);
  }

  subtotal = Math.max(subtotal, 35);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;
  const rangeMin = Math.round(total * 0.93);
  const rangeMax = Math.round(total * 1.09);

  return { lines, subtotal, tax, total, rangeMin, rangeMax };
}
