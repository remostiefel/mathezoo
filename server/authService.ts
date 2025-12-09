import bcrypt from 'bcrypt';
import { storage } from './storage';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';

const SALT_ROUNDS = 10;

export const authService = {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Authenticate user with username and password
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.password);
    
    if (!isValid) {
      return null;
    }

    return user;
  },

  /**
   * Create a new user with hashed password
   */
  async createUser(userData: {
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: 'student' | 'teacher' | 'admin';
    classId?: string;
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    
    return storage.createUser({
      ...userData,
      password: hashedPassword,
    });
  },
};

/**
 * Session-based authentication middleware
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).userId) {
    return next();
  }
  
  res.status(401).json({ message: 'Unauthorized' });
}

/**
 * Check if a user (sessionUserId) has authorization to access another user's (targetUserId) data
 * Returns true if:
 * - User is accessing their own data
 * - User is an admin
 * - User is a teacher and target is a student in one of their classes
 */
export async function canAccessUserData(sessionUserId: string, targetUserId: string): Promise<boolean> {
  // Always allow access to own data
  if (sessionUserId === targetUserId) {
    return true;
  }

  const sessionUser = await storage.getUser(sessionUserId);

  if (!sessionUser) {
    return false;
  }

  // Admins have access to all data
  if (sessionUser.role === 'admin') {
    return true;
  }

  // Teachers can access students in their classes
  if (sessionUser.role === 'teacher') {
    // Get target user to check if they're a student
    const targetUser = await storage.getUser(targetUserId);

    if (!targetUser || targetUser.role !== 'student') {
      return false;
    }

    // Get all classes taught by this teacher
    const { db } = await import('./db');
    const { classes } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const teacherClasses = await db.query.classes.findMany({
      where: eq(classes.teacherId, sessionUserId),
    });

    const teacherClassIds = teacherClasses.map(c => c.id);

    // Check if student is in one of the teacher's classes
    return targetUser.classId !== null && teacherClassIds.includes(targetUser.classId);
  }

  // Students can only access their own data
  return false;
}

/**
 * Extend Express Request type to include user
 */
declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: User;
  }
}
