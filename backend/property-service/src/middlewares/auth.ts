import { createAuthMiddleware } from "@vong-bohec/shared";
import { env } from "../config/env";

export type { AuthUser, AuthenticatedRequest } from "@vong-bohec/shared";

export const { requireAuth, requireOwner } = createAuthMiddleware(env.JWT_SECRET);
