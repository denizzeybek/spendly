import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
