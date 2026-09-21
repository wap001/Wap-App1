import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/server/routes';
import { setupSocketIO } from './src/server/socket';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Create native HTTP server to host both Express and Socket.IO
  const server = http.createServer(app);

  // Initialize Socket.IO with permissive CORS for international clients
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Attach real-time driver dispatch & GPS location streaming engine
  setupSocketIO(io);

  // Body parser middleware for JSON payloads
  app.use(express.json());

  // Mount API routes FIRST before any static/Vite handler
  app.use(apiRouter);

  // Explicitly serve public static assets (e.g. /sw.js, /manifest.json, /icon.svg) with appropriate MIME types
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('Service-Worker-Allowed', '/');
      } else if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8');
      }
    }
  }));

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Wap Server] Running on http://0.0.0.0:${PORT} (Express 4 + Socket.IO Real-time Engine)`);
  });
}

startServer().catch((err) => {
  console.error('[Wap Server] Startup error:', err);
  process.exit(1);
});
