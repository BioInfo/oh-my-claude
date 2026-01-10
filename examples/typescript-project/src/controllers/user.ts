/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import { DatabaseService } from '../database/service.js';
import { AuthService } from '../auth/service.js';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export class UserController {
  constructor(
    private db: DatabaseService,
    private auth: AuthService
  ) {}

  async createUser(request: CreateUserRequest) {
    // Validate email
    if (!this.isValidEmail(request.email)) {
      throw new Error('Invalid email address');
    }

    // Hash password
    const hashedPassword = await this.auth.hashPassword(request.password);

    // Save to database
    const result = await this.db.query(
      'INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id',
      [request.email, request.name, hashedPassword]
    );

    return { id: result[0]?.id };
  }

  async getUser(id: string) {
    const users = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return users[0] || null;
  }

  async updateUser(id: string, updates: Partial<CreateUserRequest>) {
    // TODO: Implement user update logic
    return { success: true };
  }

  async deleteUser(id: string) {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return { success: true };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
