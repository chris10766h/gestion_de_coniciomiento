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
      'A continuación iniciaremos la dinámica interactiva de preguntas.',
      '¡Ingresa tu nombre para unirte al tablero y competir por el 1.er lugar en el podio!'
    ]
  }
];

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '1. ¿Qué es la gestión del conocimiento?',
    options: [
      'Es un software contable para calcular los impuestos anuales de la empresa',
      'Es el proceso de capturar, desarrollar, compartir y utilizar eficazmente el conocimiento dentro de una organización',
      'Es una estrategia para archivar únicamente documentos físicos antiguos',
      'Es un programa de publicidad para aumentar seguidores en redes sociales'
    ],
    correctIndex: 1,
    explanation: 'Respuesta exacta: Es el proceso de capturar, desarrollar, compartir y utilizar eficazmente el conocimiento dentro de una organización.',
    timeLimit: 30
  },
  {
    id: 2,
    question: '2. ¿Cuál es la diferencia entre datos, información y conocimiento?',
    options: [
      'Los datos son decisiones tomadas; la información es suposiciones; y el conocimiento son números crudos',
      'No existe ninguna diferencia, los tres conceptos son exactamente iguales en una organización',
      'Los datos son números o hechos sueltos; la información organiza esos datos; y el conocimiento permite saber qué hacer con esa información para tomar decisiones',
      'Los datos se guardan en papel; la información son correos; y el conocimiento es una reunión informal'
    ],
    correctIndex: 2,
    explanation: 'Respuesta exacta: Los datos son números o hechos sueltos; la información organiza esos datos; y el conocimiento permite saber qué hacer con esa información para tomar decisiones.',
    timeLimit: 30
  },
  {
    id: 3,
    question: '3. ¿Qué es el conocimiento tácito?',
    options: [
      'Es el conocimiento que está en la mente de las personas, basado en su experiencia e intuición, y es difícil de escribir o transmitir',
      'Es todo documento oficial registrado en PDF dentro de la intranet de la empresa',
      'Es la lista pública de precios y productos ofertados en el mercado',
      'Es el manual de usuario que viene impreso con un equipo de computación'
    ],
    correctIndex: 0,
    explanation: 'Respuesta exacta: Es el conocimiento que está en la mente de las personas, basado en su experiencia e intuición, y es difícil de escribir o transmitir.',
    timeLimit: 30
  },
  {
    id: 4,
    question: '4. ¿Qué es el conocimiento explícito?',
    options: [
      'Es la intuición personal de cada empleado que nunca queda documentada',
      'Es el conocimiento que ya está registrado, por ejemplo, en manuales, libros o bases de datos',
      'Son las corazonadas o trucos no escritos del día a día de un trabajador',
      'Es la opinión informal que se comparte durante el almuerzo'
    ],
    correctIndex: 1,
    explanation: 'Respuesta exacta: Es el conocimiento que ya está registrado, por ejemplo, en manuales, libros o bases de datos.',
    timeLimit: 30
  },
  {
    id: 5,
    question: '5. ¿Cuáles son las etapas del ciclo de la gestión del conocimiento?',
    options: [
      'Comprar, vender, publicitar, facturar, enviar y cobrar',
      'Planear, imprimir, archivar, formatear y reiniciar el sistema',
      'Crear, capturar, organizar, almacenar, compartir y aplicar el conocimiento',
      'Memorizar, guardar en secreto, no compartir y borrar al finalizar'
    ],
    correctIndex: 2,
    explanation: 'Respuesta exacta: Las 6 etapas son Crear, capturar, organizar, almacenar, compartir y aplicar el conocimiento.',
    timeLimit: 30
  },
  {
    id: 6,
    question: '6. ¿Qué pasa si un empleado importante renuncia?',
    options: [
      'Una buena gestión del conocimiento ayuda a evitar que la organización pierda el conocimiento que tenía ese empleado',
      'La empresa se ve obligada a cerrar permanentemente todas sus actividades',
      'El conocimiento del empleado se elimina automáticamente de los servidores',
      'Se prohíbe que cualquier otro trabajador asuma las funciones vacantes'
    ],
    correctIndex: 0,
    explanation: 'Respuesta exacta: Una buena gestión del conocimiento ayuda a evitar que la organización pierda el conocimiento que tenía ese empleado.',
    timeLimit: 30
  },
  {
    id: 7,
    question: '7. ¿Qué herramientas tecnológicas pueden utilizar las empresas para gestionar el conocimiento?',
    options: [
      'Consolas de videojuegos y aplicaciones de mensajería informal personal',
      'Intranets, bases de datos compartidas, SharePoint, Notion, Confluence y wikis internas',
      'Memorias USB personales no respaldadas y blocs de notas en papel',
      'Redes sociales públicas sin control ni almacenamiento institucional'
    ],
    correctIndex: 1,
    explanation: 'Respuesta exacta: Intranets, bases de datos compartidas, SharePoint, Notion, Confluence y wikis internas.',
    timeLimit: 30
  },
  {
    id: 8,
    question: '8. ¿Qué estrategias humanas ayudan a compartir conocimiento?',
    options: [
      'Prohibir que los empleados conversen entre sí durante la jornada de trabajo',
      'Las mentorías, las comunidades de práctica y las capacitaciones constantes',
      'Entregar un libro sin ofrecer explicaciones, guías ni tutorías',
      'Aislar a los trabajadores antiguos para evitar distracciones en la oficina'
    ],
    correctIndex: 1,
    explanation: 'Respuesta exacta: Las mentorías, las comunidades de práctica y las capacitaciones constantes.',
    timeLimit: 30
  }
];
