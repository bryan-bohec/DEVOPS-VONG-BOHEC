import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthUser {
  sub: number;
  email: string;
  role: "tenant" | "owner";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required." });
  }

  try {
    request.user = jwt.verify(authorization.slice("Bearer ".length), env.JWT_SECRET) as unknown as AuthUser;
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}
