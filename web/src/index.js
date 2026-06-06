import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import cfg from './config.js';
import router from './routes.js';
import * as whatsapp from './whatsapp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

global.io = io;

io.on('connection', (socket) => {
  socket.on('join_session', (sessionId) => {
    socket.join(`session:${sessionId}`);
  });

  socket.on('leave_session', (sessionId) => {
    socket.leave(`session:${sessionId}`);
  });

  whatsapp.broadcastSessions(io);
});

app.use(cors());
app.use(express.json());
app.use(express.static(resolve(__dirname, '..', 'public')));
app.use('/api', router);

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'public', 'index.html'));
});

httpServer.listen(cfg.port, cfg.host, () => {
  console.log(`WhatsApp Web Platform running at http://${cfg.host}:${cfg.port}`);
});

process.on('SIGINT', async () => {
  await whatsapp.destroyAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await whatsapp.destroyAll();
  process.exit(0);
});
