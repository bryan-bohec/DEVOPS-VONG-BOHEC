import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthUser {
  sub: number;
  email: string;
  role: "tenant" | "owner";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

function extractBearerToken(request: Request) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function toAuthUser(payload: string | JwtPayload): AuthUser | null {
  if (typeof payload === "string") {
    return null;
  }

  const sub = payload.sub;
  const email = payload.email;
  const role = payload.role;

  let normalizedSub: number | null = null;
  if (typeof sub === "number") {
    normalizedSub = sub;
  } else if (typeof sub === "string" && /^\d+$/.test(sub)) {
    normalizedSub = Number(sub);
  }
  if (normalizedSub === null || typeof email !== "string" || (role !== "tenant" && role !== "owner")) {
    return null;
  }

  return {
    sub: normalizedSub,
    email,
    role,
  };
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const token = extractBearerToken(request);

  if (!token) {
    return response.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = toAuthUser(decoded);

    if (!user) {
      return response.status(401).json({ message: "Invalid or expired token." });
    }

    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...allowedRoles: Array<AuthUser["role"]>) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: "Access denied." });
    }

    return next();
  };
}
