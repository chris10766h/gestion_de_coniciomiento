import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import * as dotenv from 'dotenv';
import { sendTextMessage } from './gemini';

dotenv.config();

let client: Client | null = null;
let currentStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
const ownerNumber = process.env.OWNER_PHONE_NUMBER;

if (!ownerNumber || ownerNumber === 'tu_numero_telefono_aqui') {
  console.warn('⚠️ ADVERTENCIA: OWNER_PHONE_NUMBER no configurado en el archivo .env. El asistente podría no responder a los mensajes por seguridad.');
}

/**
 * Inicializa el cliente de WhatsApp Web
 * @param onQrCode Callback para enviar la imagen QR en base64 al frontend
 * @param onStatus Callback para notificar cambios de estado
 */
export function initializeWhatsApp(
  onQrCode: (qrBase64: string) => void,
  onStatus: (status: 'disconnected' | 'connecting' | 'connected') => void
) {
  if (client) {
    onStatus(currentStatus);
    return;
  }

  console.log('📱 Inicializando cliente WhatsApp...');
  currentStatus = 'connecting';
  onStatus(currentStatus);

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', async (qr) => {
    console.log('📌 WhatsApp requiere vinculación. Código QR generado:');
    // Mostrar en consola (pequeño) para depuración
    qrcodeTerminal.generate(qr, { small: true });

    try {
      // Convertir el texto QR en una imagen Base64 para el Dashboard Web
      const qrBase64 = await QRCode.toDataURL(qr);
      onQrCode(qrBase64);
    } catch (err) {
      console.error('Error al generar imagen del QR:', err);
    }
    
    currentStatus = 'connecting';
    onStatus(currentStatus);
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp enlazado y listo!');
    currentStatus = 'connected';
    onStatus(currentStatus);
  });

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp autenticado con éxito.');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación en WhatsApp:', msg);
    currentStatus = 'disconnected';
    onStatus(currentStatus);
  });

  client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp desconectado:', reason);
    currentStatus = 'disconnected';
    onStatus(currentStatus);
  });

  // Procesar mensajes entrantes
  client.on('message', async (message) => {
    const sender = message.from;
    const isGroup = sender.endsWith('@g.us');
    
    // Ignorar mensajes de grupo por defecto para no saturar al asistente
    if (isGroup) return;

    // Formatear número de teléfono del dueño (ej: 573001234567@c.us)
    const formattedOwner = ownerNumber ? `${ownerNumber.replace(/[^0-9]/g, '')}@c.us` : '';

    // Seguridad: Verificar si el remitente es el dueño
    if (formattedOwner && sender !== formattedOwner) {
      console.log(`🔒 Intento de acceso denegado de WhatsApp desde: ${sender}`);
      // Opcional: responder educadamente una vez o ignorar
      // message.reply('Lo siento, soy un asistente privado y solo respondo a las peticiones de mi dueño.');
      return;
    }

    console.log(`📩 Mensaje de WhatsApp recibido de dueño [${sender}]: "${message.body}"`);

    // Indicar que está escribiendo
    const chat = await message.getChat();
    await chat.sendStateTyping();

    try {
      // 1. Manejar si es un mensaje de texto
      if (message.body) {
        // Enviar el mensaje a Gemini y obtener la respuesta
        const responseText = await sendTextMessage(`whatsapp-${sender}`, message.body);
        
        // Responder en el mismo chat de WhatsApp
        await message.reply(responseText);
      }
    } catch (error: any) {
      console.error('❌ Error al procesar mensaje en WhatsApp:', error);
      await message.reply(`Hubo un error al procesar tu solicitud: ${error.message || error}`);
    }
  });

  client.initialize().catch((err) => {
    console.error('Error al inicializar cliente de WhatsApp Web:', err);
    currentStatus = 'disconnected';
    onStatus(currentStatus);
  });
}

/**
 * Retorna el estado de conexión actual
 */
export function getWhatsAppStatus(): 'disconnected' | 'connecting' | 'connected' {
  return currentStatus;
}
