export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  category?: string;
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  pyramidLevels?: { level: string; desc: string; color: string }[];
  cycleSteps?: { step: string; icon: string }[];
  highlights?: { title: string; desc: string; icon: string }[];
  presenters?: string[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timeLimit: number; // in seconds
}

export const PRESENTERS = [
  'Cristian David Acosta Hernandez',
  'Allyson Valeria Farfan Castillo',
  'Juan Camilo Godoy Montero'
];

export const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Gestión del Conocimiento',
    subtitle: 'Presentación Interactiva & Dinámica de Aprendizaje',
    category: 'Portada',
    presenters: PRESENTERS,
    highlights: [
      { title: 'Estrategia', desc: 'Capturar y utilizar el saber organizacional', icon: '🧠' },
      { title: 'Productividad', desc: 'Optimización en la toma de decisiones', icon: '⚡' },
      { title: 'Innovación', desc: 'Aprendizaje continuo a partir de la experiencia', icon: '💡' }
    ]
  },
  {
    id: 2,
    title: '1. ¿Qué es la gestión del conocimiento?',
    category: 'Concepto Fundamental',
    subtitle: 'Proceso Estratégico Organizacional',
    bullets: [
      'Proceso estratégico de capturar, desarrollar, compartir y utilizar eficazmente el conocimiento dentro de una organización.',
      'Su objetivo principal es mejorar la productividad, fomentar la innovación y optimizar la toma de decisiones.',
      'Transforma el aprendizaje individual en un activo intangible colectivo para la empresa.'
    ],
    highlights: [
      { title: 'Capturar', desc: 'Identificar el conocimiento clave', icon: '🔍' },
      { title: 'Desarrollar', desc: 'Fomentar nuevas habilidades y aprendizajes', icon: '🚀' },
      { title: 'Compartir', desc: 'Transmitir saberes entre equipos', icon: '🤝' },
      { title: 'Utilizar', desc: 'Aplicar el conocimiento en el día a día', icon: '⚙️' }
    ]
  },
  {
    id: 3,
    title: '2. La Pirámide del Valor',
    category: 'Modelo Conceptual',
    subtitle: 'Niveles de maduración de los activos intangibles',
    pyramidLevels: [
      { level: 'Sabiduría / Inteligencia', desc: 'Capacidad de tomar decisiones estratégicas basadas en el conocimiento profundo.', color: '#a855f7' },
      { level: 'Conocimiento', desc: 'Información analizada, contextualizada y lista para actuar.', color: '#06b6d4' },
      { level: 'Información', desc: 'Datos procesados y estructurados con significado y propósito.', color: '#3b82f6' },
      { level: 'Datos', desc: 'Hechos crudos, números y registros sin procesar ni contextualizar.', color: '#64748b' }
    ]
  },
  {
    id: 4,
    title: '3. Tipos de Conocimiento',
    category: 'Clasificación',
    subtitle: 'Conocimiento Explícito vs. Conocimiento Tácito',
    table: {
      headers: ['#', 'Tipo', 'Descripción'],
      rows: [
        ['1', 'Conocimiento Explícito', 'Todo lo que está escrito, estructurado y es fácil de transmitir, como manuales de procesos, bases de datos, normas o tutoriales.'],
        ['2', 'Conocimiento Tácito', 'Nace de la experiencia, la intuición y los "trucos" del día a día de un trabajador. Es personal y difícil de formalizar.']
      ]
    }
  },
  {
    id: 5,
    title: '4. Ciclo de la Gestión del Conocimiento',
    category: 'Proceso Continuo',
    subtitle: 'Las 6 fases clave para la circulación del conocimiento',
    cycleSteps: [
      { step: '1. Crear', icon: '✨' },
      { step: '2. Capturar', icon: '📥' },
      { step: '3. Organizar', icon: '🗂️' },
      { step: '4. Almacenar', icon: '💾' },
      { step: '5. Compartir', icon: '🔄' },
      { step: '6. Aplicar', icon: '🎯' }
    ]
  },
  {
    id: 6,
    title: '5. Beneficios de la Gestión del Conocimiento',
    category: 'Valor Organizacional',
    subtitle: '¿Por qué las organizaciones invierten en este proceso?',
    bullets: [
      '🛡️ Evita que el conocimiento crítico se pierda cuando los empleados se van.',
      '⚡ Acelera exponencialmente el aprendizaje y la curva de incorporación de nuevos empleados.',
      '💡 Estimula la innovación abierta y permite a la organización aprender rápidamente de los errores pasados.'
    ]
  },
  {
    id: 7,
    title: '6. Tipos de Planeación',
    category: 'Estrategia Empresarial',
    subtitle: 'Modelos estratégicos para alcanzar los objetivos de la empresa',
    highlights: [
      { title: 'Planeación Estratégica de Marketing', desc: 'Define la orientación del mercado y posicionado de marca.', icon: '📈' },
      { title: 'Planeación de Producto', desc: 'Desarrollo, innovación y ciclo de vida del producto.', icon: '📦' },
      { title: 'Planeación de Precios', desc: 'Definición de tarifas, ofertas y márgenes de ganancia.', icon: '🏷️' },
      { title: 'Planeación de Distribución', desc: 'Logística y canales para llevar el producto al consumidor.', icon: '🚚' }
    ]
  },
  {
    id: 8,
    title: '7. Diferencias entre Planeación de Producto y de Precios',
    category: 'Comparativa',
    subtitle: 'Análisis de objetivos, decisiones y herramientas',
    table: {
      headers: ['Aspecto', 'Planeación de Producto', 'Planeación de Precios'],
      rows: [
        ['Objetivo', 'Planear nuevos productos a desarrollar; enfocarse en innovar o retirar productos obsoletos.', 'Analizar los precios de oferta en el mercado, ofertas, descuentos y políticas de precios.'],
        ['Decisiones clave', 'Decidir si fabricar nuevos productos, mejorar los existentes o eliminar lo desfasado.', 'Planear estrategia de precios de venta, decidir ofertas y promociones.'],
        ['Herramientas comunes', 'Análisis de mercado, investigación de la competencia, desarrollo e innovación.', 'Investigación de precios competidores, fijar descuentos y balance costo-precio.']
      ]
    }
  },
  {
    id: 9,
    title: '8. Herramientas y Tecnología: Sistemas de Almacenamiento',
    category: 'Tecnología',
    subtitle: 'Plataformas para resguardar la memoria corporativa',
    bullets: [
      '🖥️ Intranet corporativa para comunicaciones centralizadas.',
      '☁️ Bases de datos compartidas en la nube.',
      '📝 SharePoint, Notion o Confluence para documentación colaborativa.',
      '🌐 Wikis internas para manuales dinámicos.'
    ]
  },
  {
    id: 10,
    title: '9. Herramientas y Tecnología: Colaboración y Estrategias Humanas',
    category: 'Tecnología & Personas',
    subtitle: 'Plataformas de comunicación y dinámicas entre personas',
    highlights: [
      { title: 'Herramientas Digitales', desc: 'Microsoft Teams, Slack y Trello para comunicación fluida y gestión de tareas.', icon: '💬' },
      { title: 'Mentorías', desc: 'Un trabajador con experiencia enseña y guía directamente a uno nuevo.', icon: '👨‍🏫' },
      { title: 'Comunidades de Práctica', desc: 'Grupos de empleados que comparten experiencias y resuelven dudas comunes.', icon: '👥' },
      { title: 'Capacitaciones', desc: 'Programas continuos para actualizar y fortalecer competencias.', icon: '🎓' }
    ]
  },
  {
    id: 11,
    title: '10. Preguntas y Juego Dinámico',
    category: 'Cierre & Evaluación',
    subtitle: '¡Es hora de poner a prueba lo aprendido!',
    bullets: [
      '¿Tienes alguna duda o pregunta sobre la presentación?',
      'A continuación iniciaremos la dinámica interactiva de 10 preguntas.',
      '¡Ingresa tu nombre para unirte al tablero y competir por el 1.er lugar en el podio!'
    ]
  }
];

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '¿Qué es la gestión del conocimiento dentro de una organización?',
    options: [
      'Un software para enviar correos masivos a clientes',
      'Un proceso estratégico de capturar, desarrollar, compartir y utilizar eficazmente el conocimiento',
      'Una técnica contable para reducir los impuestos anuales',
      'Un manual impreso que se entrega únicamente a la alta gerencia'
    ],
    correctIndex: 1,
    explanation: 'La Gestión del Conocimiento es el proceso estratégico para capturar, desarrollar, compartir y utilizar eficazmente el saber corporativo para mejorar productividad y decisiones.',
    timeLimit: 20
  },
  {
    id: 2,
    question: 'En la Pirámide del Valor, ¿cuál es el orden correcto de menor a mayor nivel de madurez?',
    options: [
      'Información ➔ Datos ➔ Sabiduría ➔ Conocimiento',
      'Datos ➔ Información ➔ Conocimiento ➔ Inteligencia / Sabiduría',
      'Conocimiento ➔ Datos ➔ Información ➔ Sabiduría',
      'Sabiduría ➔ Conocimiento ➔ Información ➔ Datos'
    ],
    correctIndex: 1,
    explanation: 'La Pirámide del Valor inicia en la base con Datos, luego Información, sube a Conocimiento y culmina en la cima con Inteligencia / Sabiduría.',
    timeLimit: 20
  },
  {
    id: 3,
    question: '¿Cuál de las siguientes características corresponde al Conocimiento Explícito?',
    options: [
      'Es difícil de transmitir y sólo está en la mente del trabajador',
      'Es fruto de la intuición no documentada',
      'Está escrito, estructurado y es fácil de transmitir (manuales, normas, tutoriales)',
      'Cambia todos los días sin dejar registro'
    ],
    correctIndex: 2,
    explanation: 'El conocimiento explícito está formalizado, escrito y estructurado en documentos, manuales, bases de datos o normas.',
    timeLimit: 20
  },
  {
    id: 4,
    question: '¿De dónde proviene el Conocimiento Tácito?',
    options: [
      'De la experiencia, intuición y los "trucos" del día a día del trabajador',
      'De manuales impresos comprados en una librería',
      'De un contrato formal de trabajo',
      'De las especificaciones técnicas de un servidor'
    ],
    correctIndex: 0,
    explanation: 'El conocimiento tácito reside en las personas; surge de su experiencia práctica, intuición y hábitos acumulados.',
    timeLimit: 20
  },
  {
    id: 5,
    question: '¿Cuál es la secuencia completa del Ciclo de la Gestión del Conocimiento?',
    options: [
      'Comprar ➔ Vender ➔ Guardar ➔ Borrar ➔ Repetir',
      'Crear ➔ Capturar ➔ Organizar ➔ Almacenar ➔ Compartir ➔ Aplicar',
      'Planear ➔ Ejecutar ➔ Evaluar ➔ Corregir',
      'Analizar ➔ Copiar ➔ Pegar ➔ Enviar'
    ],
    correctIndex: 1,
    explanation: 'El ciclo comprende 6 etapas: Crear, Capturar, Organizar, Almacenar, Compartir y Aplicar el conocimiento.',
    timeLimit: 20
  },
  {
    id: 6,
    question: '¿Cuál de las siguientes opciones es un BENEFICIO clave de la gestión del conocimiento?',
    options: [
      'Obliga a los empleados a memorizar datos sin entenderlos',
      'Evita que el conocimiento se pierda cuando alguien se retira y acelera el aprendizaje',
      'Remplaza completamente a los trabajadores por robots',
      'Aumenta los costos operativos duplicando tareas'
    ],
    correctIndex: 1,
    explanation: 'Permite retener la memoria corporativa, acelerar la inducción de nuevos colaboradores e impulsar la innovación.',
    timeLimit: 20
  },
  {
    id: 7,
    question: '¿En qué se centra la Planeación de Producto?',
    options: [
      'Fijar únicamente ofertas y descuentos de temporada',
      'Desarrollar nuevos productos, innovar o retirar productos obsoletos del mercado',
      'Contratar personal para el departamento de envíos',
      'Calcular los impuestos de importación'
    ],
    correctIndex: 1,
    explanation: 'La planeación de producto se encarga del ciclo de vida del producto: innovar, crear nuevos modelos o descontinuar los obsoletos.',
    timeLimit: 20
  },
  {
    id: 8,
    question: '¿Cuál es la diferencia principal de la Planeación de Precios frente a la de Producto?',
    options: [
      'La de precios investiga precios competidores, descuentos y balance costo-precio',
      'La de precios se dedica a diseñar el empaque físico',
      'La de precios solo aplica para servicios digitales',
      'No existe ninguna diferencia entre ambas'
    ],
    correctIndex: 0,
    explanation: 'La planeación de precios analiza las tarifas de mercado, margen costo-beneficio, descuentos y políticas de ventas.',
    timeLimit: 20
  },
  {
    id: 9,
    question: 'SharePoint, Notion y Confluence corresponden a la categoría de:',
    options: [
      'Estrategias humanas de mentoría',
      'Sistemas de almacenamiento y bases de datos compartidas',
      'Redes sociales para videojuegos',
      'Herramientas exclusivas de diseño 3D'
    ],
    correctIndex: 1,
    explanation: 'Son plataformas de almacenamiento, documentación y bases de conocimiento estructuradas en la nube.',
    timeLimit: 20
  },
  {
    id: 10,
    question: '¿Cuál de los siguientes es un ejemplo de Estrategia Humana de gestión del conocimiento?',
    options: [
      'Mentorías, Comunidades de práctica y Capacitaciones',
      'Instalar una red de fibra óptica en la oficina',
      'Formatear una computadora antigua',
      'Crear una hoja de cálculo en Excel sin compartir'
    ],
    correctIndex: 0,
    explanation: 'Las estrategias humanas conectan personas directamente para transferir saberes mediante mentorías, comunidades de práctica y programas de capacitación.',
    timeLimit: 20
  }
];
