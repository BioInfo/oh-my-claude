/**
 * Example TypeScript Application
 * This is a sample project for testing The Oh-My-Claude Council
 */

import { createServer } from './server.js';
import { DatabaseService } from './database/service.js';
import { AuthService } from './auth/service.js';
import { UserController } from './controllers/user.js';

async function main() {
  console.log('Starting application...');

  // Initialize services
  const db = new DatabaseService();
  await db.connect();

  const auth = new AuthService();
  const userController = new UserController(db, auth);

  // Create server
  const server = createServer({
    port: 3000,
    controllers: [userController],
  });

  // Start server
  await server.start();

  console.log('Application started successfully');
}

main().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
