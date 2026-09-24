import { GoogleGenerativeAI, ChatSession, Part, SchemaType } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { executeTool } from '../tools/desktop';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ ADVERTENCIA: GEMINI_API_KEY no configurado en el archivo .env');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Definición de las herramientas (Function Calling)
const toolDeclarations: any[] = [
  {
    name: 'open_app',
    description: 'Abre una aplicación instalada en macOS (ej: Safari, Notes, Spotify, Terminal, Calculator).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        appName: {
          type: SchemaType.STRING,
          description: 'Nombre de la aplicación a abrir.'
        }
      },
      required: ['appName']
    }
  },
  {
    name: 'get_system_info',
    description: 'Obtiene información de estado del Mac (batería, volumen, almacenamiento, etc.).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    }
  },
  {
    name: 'set_system_volume',
    description: 'Ajusta el volumen del sistema del Mac.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        level: {
          type: SchemaType.NUMBER,
          description: 'Nivel de volumen del 0 al 100.'
        }
      },
      required: ['level']
    }
  },
  {
    name: 'run_command',
    description: 'Ejecuta un comando en la terminal de macOS de forma segura. Usa esto solo si el usuario pide explícitamente realizar una acción de terminal.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        command: {
          type: SchemaType.STRING,
          description: 'El comando de terminal a ejecutar.'
        }
      },
    }
  },
  {
    name: 'control_chrome',
    description: 'Controla el navegador Google Chrome local. Permite obtener la pestaña activa actual, abrir una nueva pestaña con una URL o hacer una búsqueda en Google.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        action: {
          type: SchemaType.STRING,
          description: 'La acción a realizar: "get_active_tab" (para leer la URL/título activa), "open_url" (para abrir una nueva pestaña con una URL), o "search" (para buscar algo en Google).'
        },
        url: {
          type: SchemaType.STRING,
          description: 'La URL a abrir (requerido si action es "open_url").'
        },
        query: {
          type: SchemaType.STRING,
          description: 'El término a buscar en Google (requerido si action es "search").'
        }
      },
      required: ['action']
    }
  }
];

const systemInstruction = `Eres OmniAgent, un asistente virtual de IA de última generación para macOS, inteligente y proactivo. 
Te ejecutas localmente en la computadora del usuario. Tienes acceso a herramientas del sistema (abrir apps, volumen, terminal).
Puedes comunicarte por chat y voz. Sé conciso y amigable en tus respuestas.
Siempre que uses una herramienta del sistema, informa al usuario brevemente de lo que has hecho.
Si el usuario te pide ejecutar un comando de terminal potencialmente peligroso (como borrar archivos importantes o apagar el equipo), adviértele y pide confirmación. Para comandos informativos o seguros (ej. listar archivos con ls, ver espacio en disco con df, verificar red), ejecútalos directamente.`;

// Almacén de sesiones de chat en memoria
const sessions = new Map<string, ChatSession>();

/**
 * Obtiene o crea una sesión de chat para un ID específico
 */
export function getOrCreateChatSession(sessionId: string): ChatSession {
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }

  // Inicializar modelo con gemini-2.0-flash
  const modelName = 'gemini-2.0-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction,
    tools: [{ functionDeclarations: toolDeclarations }]
  });

  const chat = model.startChat({
    history: []
  });

  sessions.set(sessionId, chat);
  return chat;
}

/**
 * Procesa la respuesta de Gemini y ejecuta las llamadas a funciones si existen.
 * Realiza llamadas recursivas si Gemini requiere ejecutar múltiples herramientas.
 */
async function processResponseAndTools(
  chat: ChatSession,
  messageContent: string | Array<string | Part>
): Promise<string> {
  let response = await chat.sendMessage(messageContent);
  let responseText = response.response.text();
  let functionCalls = response.response.functionCalls();

  // Si hay llamadas a funciones (herramientas)
  while (functionCalls && functionCalls.length > 0) {
    console.log(`🤖 Gemini llamó a las siguientes funciones:`, JSON.stringify(functionCalls, null, 2));
    const toolResponses: any[] = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      try {
        // Ejecutar la herramienta localmente
        const result = await executeTool(name, args);
        console.log(`✅ Resultado de la herramienta [${name}]:`, result);
        
        toolResponses.push({
          functionResponse: {
            name: name,
            response: { result: result }
          }
        });
      } catch (err: any) {
        console.error(`❌ Error al ejecutar herramienta [${name}]:`, err);
        toolResponses.push({
          functionResponse: {
            name: name,
            response: { error: err.message || 'Error desconocido' }
          }
        });
      }
    }

    // Enviar los resultados de las herramientas de vuelta a Gemini
    response = await chat.sendMessage(toolResponses);
    responseText = response.response.text();
    functionCalls = response.response.functionCalls();
  }

  return responseText;
}

/**
 * Envía un mensaje de texto al asistente
 */
export async function sendTextMessage(sessionId: string, text: string): Promise<string> {
  const chat = getOrCreateChatSession(sessionId);
  return await processResponseAndTools(chat, text);
}

/**
 * Envía un mensaje multimedia (como un archivo de audio) al asistente
 */
export async function sendAudioMessage(
  sessionId: string,
  audioBuffer: Buffer,
  mimeType: string = 'audio/mp3'
): Promise<string> {
  const chat = getOrCreateChatSession(sessionId);
  
  const audioPart: Part = {
    inlineData: {
      data: audioBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  const textPart = 'Escucha el audio adjunto y responde de forma adecuada:';
  
  return await processResponseAndTools(chat, [audioPart, textPart]);
}
