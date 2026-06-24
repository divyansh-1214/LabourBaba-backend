import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/authUtils";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: string;
  };
}

/**
 * Express middleware to authenticate requests using JWT Bearer token.
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid (expected Bearer <token>)",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: "Authorization token has expired or is invalid",
    });
    return;
  }

  req.user = decoded;
  next();
}
