import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 NEXORA Robotics Backend API started on port ${env.PORT}`);
  console.log(`📍 Environment:   ${env.NODE_ENV}`);
  console.log(`📑 Documentation: http://localhost:${env.PORT}/api-docs`);
  console.log(`❤️  Health Check:  http://localhost:${env.PORT}/api/health`);
  console.log(`⚡ Supabase:      ${env.isConfigured ? 'Connected' : 'Pending credentials in .env'}`);
  console.log(`======================================================\n`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
