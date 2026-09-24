import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { sendTextMessage, sendAudioMessage } from './services/gemini';
import { initializeWhatsApp, getWhatsAppStatus } from './services/whatsapp';
import { initializeTelegram, getTelegramStatus } from './services/telegram';
import { executeTool } from './tools/desktop';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoints HTTP estándar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/api/system', async (req, res) => {
  try {
    const info = await executeTool('get_system_info', {});
    res.json(info);
  } catch (error: any) {
    console.error('Error al obtener info del sistema:', error);
    res.status(500).json({ error: error.message || 'Error al obtener info del sistema.' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId = 'web-default' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Falta el mensaje en la solicitud.' });
  }

  try {
    const reply = await sendTextMessage(sessionId, message);
    res.json({ response: reply });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
});

// Crear servidor HTTP para acoplar WebSockets
const server = http.createServer(app);

// Inicializar el Servidor WebSocket
const wss = new WebSocketServer({ server });

// Lista de clientes WS conectados
const connectedClients = new Set<WebSocket>();
let lastQrCode: string | null = null;

// Función para enviar mensajes a todos los clientes WebSocket activos
function broadcast(message: any) {
  const payload = JSON.stringify(message);
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 Nuevo cliente WebSocket conectado localmente.');
  connectedClients.add(ws);

  // Enviar estado actual de las conexiones al cliente recién conectado
  ws.send(JSON.stringify({ type: 'whatsapp_status', status: getWhatsAppStatus() }));
  if (getWhatsAppStatus() === 'connecting' && lastQrCode) {
    ws.send(JSON.stringify({ type: 'whatsapp_qr', qr: lastQrCode }));
  }
  ws.send(JSON.stringify({ type: 'telegram_status', status: getTelegramStatus() }));

  ws.on('message', async (data: Buffer) => {
    try {
      const parsedData = JSON.parse(data.toString());
      const { type, sessionId = 'web-ws-default' } = parsedData;

      if (type === 'text') {
        const { text } = parsedData;
        console.log(`💬 WS Mensaje de texto recibido: "${text}"`);
        
        ws.send(JSON.stringify({ type: 'status', status: 'thinking' }));
        const reply = await sendTextMessage(sessionId, text);
        
        ws.send(JSON.stringify({ type: 'response', text: reply }));
      } else if (type === 'audio') {
        const { audioBase64, mimeType = 'audio/webm' } = parsedData;
        console.log(`🎙️ WS Mensaje de audio recibido (mimeType: ${mimeType})`);
        
        ws.send(JSON.stringify({ type: 'status', status: 'thinking' }));
        
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const reply = await sendAudioMessage(sessionId, audioBuffer, mimeType);
        
        ws.send(JSON.stringify({ type: 'response', text: reply }));
      } else {
        ws.send(JSON.stringify({ type: 'error', error: 'Tipo de mensaje no reconocido.' }));
      }
    } catch (error: any) {
      console.error('❌ Error en procesamiento WebSocket:', error);
      ws.send(JSON.stringify({ type: 'error', error: error.message || 'Error interno en WS.' }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado.');
    connectedClients.delete(ws);
  });
});

// Inicializar canales de comunicación en segundo plano
// 1. WhatsApp
initializeWhatsApp(
  (qr) => {
    lastQrCode = qr;
    broadcast({ type: 'whatsapp_qr', qr });
  },
  (status) => {
    if (status === 'connected') lastQrCode = null;
    broadcast({ type: 'whatsapp_status', status });
  }
);

// 2. Telegram
initializeTelegram(
  (status) => {
    broadcast({ type: 'telegram_status', status });
  }
);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor OmniAgent ejecutándose en http://localhost:${port}`);
  console.log(`🔌 WebSockets escuchando en ws://localhost:${port}`);
  console.log(`======================================================\n`);
});
