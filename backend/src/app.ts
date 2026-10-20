import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerDocument } from './docs/swagger';
import { healthRouter } from './routes/health.routes';
import { profileRouter } from './routes/profile.routes';

export const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI to render safely
}));

// CORS Configuration
const allowedOrigins = env.CORS_ORIGIN === '*'
  ? '*'
  : env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// HTTP Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// JSON body parsing with reasonable size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Swagger / OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Mounts
app.use('/api/health', healthRouter);
app.use('/api/v1/profile', profileRouter);

// Root Welcome Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'NEXORA Robotics Shared Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health',
  });
});

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});
