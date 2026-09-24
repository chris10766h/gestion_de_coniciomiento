import * as dotenv from 'dotenv';
import * as path from 'path';
import { sendTextMessage, getOrCreateChatSession } from '../src/services/gemini';

// Cargar .env desde el directorio raíz
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTest() {
  console.log('🏁 Iniciando prueba de conexión con Gemini...');
  console.log(`Clave API actual: ${process.env.GEMINI_API_KEY ? 'Configurada (empieza por ' + process.env.GEMINI_API_KEY.substring(0, 5) + '...)' : '❌ NO CONFIGURADA'}`);

  const sessionId = 'test-session';

  try {
    // 1. Probar una pregunta simple de texto
    console.log('\n💬 Enviando pregunta de texto: "Hola, preséntate brevemente."');
    const response1 = await sendTextMessage(sessionId, 'Hola, preséntate brevemente.');
    console.log('🤖 Respuesta de Gemini:\n', response1);

    // 2. Probar una pregunta que requiera herramientas
    console.log('\n⚙️ Enviando comando de herramienta: "¿Puedes consultar el estado de mi Mac (batería, volumen, disco)?"');
    const response2 = await sendTextMessage(sessionId, '¿Puedes consultar el estado de mi Mac (batería, volumen, disco)?');
    console.log('🤖 Respuesta de Gemini:\n', response2);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

runTest();
