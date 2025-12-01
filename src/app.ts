import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import unknownEndpoint from './middlewares/unknownEndpoint.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use(cors());

// Simple request logger
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/', (_req, res) => {
  res.json({ service: 'medcore-prescription', status: 'ok' });
});

// API routes
app.use('/api/v1', router);

// Error handling
app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
