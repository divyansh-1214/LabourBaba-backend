import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt.
 * @param password The plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hash.
 * @param password The plain text password
 * @param hash The stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT for a user payload.
 * @param payload Object containing user identifiers (e.g. { id, role })
 * @param expiresIn Expiration duration (defaults to '24h')
 */
export function generateToken(payload: object, expiresIn: any = "24h"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT and decode its payload.
 * @param token The JWT string
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

