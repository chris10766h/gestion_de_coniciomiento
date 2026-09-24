import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { sendTextMessage, sendAudioMessage } from './gemini';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerChatId = process.env.TELEGRAM_CHAT_ID;

let bot: Telegraf | null = null;
let currentStatus: 'disconnected' | 'connected' = 'disconnected';

/**
 * Inicializa el bot de Telegram
 */
export function initializeTelegram(onStatus: (status: 'disconnected' | 'connected') => void) {
  if (!token || token === 'tu_telegram_bot_token_aqui') {
    console.warn('⚠️ Telegram Bot desactivado: TELEGRAM_BOT_TOKEN no configurado en el archivo .env');
    onStatus('disconnected');
    return;
  }

  try {
    console.log('✈️ Inicializando bot de Telegram...');
    bot = new Telegraf(token);

    // Middleware de seguridad: Validar que el Chat ID coincida con el dueño
    bot.use(async (ctx, next) => {
      const chatId = ctx.chat?.id.toString();
      
      // Si no hay dueño configurado todavía, permitimos el primer mensaje pero avisamos
      if (!ownerChatId || ownerChatId === 'tu_telegram_user_id_para_seguridad') {
        console.warn(`🔒 ADVERTENCIA: TELEGRAM_CHAT_ID no configurado. Escríbele al bot para ver tu Chat ID.`);
        
        if (ctx.message && 'text' in ctx.message && ctx.message.text === '/start') {
          await ctx.reply(`¡Hola! Bienvenido a tu OmniAgent. Tu Chat ID de Telegram es: ${chatId}\nCopia este número y colócalo en el campo TELEGRAM_CHAT_ID de tu archivo .env, luego reinicia el servidor para activar la seguridad.`);
        }
        return; // No continuar por seguridad
      }

      if (chatId !== ownerChatId) {
        console.log(`🔒 Acceso denegado en Telegram de ChatID no autorizado: ${chatId}`);
        await ctx.reply('No estás autorizado para usar este asistente privado.');
        return;
      }

      return next();
    });

    // Comando de inicio
    bot.start((ctx) => {
      ctx.reply('🤖 ¡OmniAgent activado y listo! Escríbeme comandos de texto o mándame notas de voz para controlar tu Mac y realizar consultas.');
    });

    // Manejar mensajes de texto
    bot.on('text', async (ctx) => {
      const text = ctx.message.text;
      const chatId = ctx.chat.id.toString();

      console.log(`📩 Mensaje de Telegram recibido [${chatId}]: "${text}"`);
      await ctx.sendChatAction('typing');

      try {
        const reply = await sendTextMessage(`telegram-${chatId}`, text);
        await ctx.reply(reply);
      } catch (err: any) {
        console.error('Error procesando mensaje de texto en Telegram:', err);
        await ctx.reply(`Error al procesar: ${err.message || err}`);
      }
    });

    // Manejar notas de voz (Audio)
    bot.on('voice', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      const voice = ctx.message.voice;

      console.log(`🎙️ Nota de voz de Telegram recibida de [${chatId}]`);
      await ctx.sendChatAction('typing');

      try {
        // Obtener el link de descarga del archivo desde los servidores de Telegram
        const fileId = voice.file_id;
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        
        console.log(`📥 Descargando archivo de audio desde Telegram...`);
        const response = await fetch(fileUrl.toString());
        if (!response.ok) throw new Error('Fallo al descargar el archivo de audio.');
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        // Telegram usa formato .ogg/.oga para notas de voz. Gemini lo soporta directamente!
        const reply = await sendAudioMessage(`telegram-${chatId}`, audioBuffer, 'audio/ogg');
        await ctx.reply(reply);

      } catch (err: any) {
        console.error('Error procesando nota de voz en Telegram:', err);
        await ctx.reply(`Error al procesar nota de voz: ${err.message || err}`);
      }
    });

    bot.launch()
      .then(() => {
        console.log('✅ Bot de Telegram en funcionamiento!');
        currentStatus = 'connected';
        onStatus('connected');
      })
      .catch((err) => {
        console.error('❌ Error al lanzar el bot de Telegram:', err);
        currentStatus = 'disconnected';
        onStatus('disconnected');
      });

    // Manejo de cierres limpios
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));

  } catch (error) {
    console.error('❌ Error general al inicializar Telegram:', error);
    currentStatus = 'disconnected';
    onStatus('disconnected');
  }
}

/**
 * Retorna el estado de conexión actual de Telegram
 */
export function getTelegramStatus(): 'disconnected' | 'connected' {
  return currentStatus;
}
