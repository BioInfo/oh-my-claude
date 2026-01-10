/**
 * HTTP Server Configuration
 */

import express, { Express } from 'express';

export interface ServerConfig {
  port: number;
  controllers: unknown[];
}

export interface Server {
  app: Express;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createServer(config: ServerConfig): Server {
  const app = express();

  app.use(express.json());

  // Register controllers
  for (const controller of config.controllers) {
    // Controller registration logic
  }

  return {
    app,
    async start() {
      return new Promise((resolve) => {
        app.listen(config.port, () => {
          console.log(`Server listening on port ${config.port}`);
          resolve();
        });
      });
    },
    async stop() {
      // Graceful shutdown logic
    },
  };
}
