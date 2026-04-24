import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth";
import { authService } from "../services/auth.service";

const registerSchema = z.object({
  email: z.string().min(1, "L'email est requis.").email("L'adresse email n'est pas valide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  first_name: z.string().min(1, "Le prénom est requis."),
  last_name: z.string().min(1, "Le nom est requis."),
  role: z.enum(["tenant", "owner"], { message: "Le rôle doit être 'tenant' ou 'owner'." }),
});

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis.").email("L'adresse email n'est pas valide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const authController = {
  async register(request: Request, response: Response) {
    try {
      const payload = registerSchema.parse(request.body);
      const result = await authService.register(payload);
      response.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        const messages = Object.values(fieldErrors).flat().filter(Boolean) as string[];
        return response.status(400).json({ message: messages.join(" "), fieldErrors });
      }

      return response.status(409).json({ message: error instanceof Error ? error.message : "L'inscription a échoué." });
    }
  },

  async login(request: Request, response: Response) {
    try {
      const payload = loginSchema.parse(request.body);
      const result = await authService.login(payload);
      response.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        const messages = Object.values(fieldErrors).flat().filter(Boolean) as string[];
        return response.status(400).json({ message: messages.join(" "), fieldErrors });
      }

      return response.status(401).json({ message: error instanceof Error ? error.message : "La connexion a échoué." });
    }
  },

  async me(request: AuthenticatedRequest, response: Response) {
    const userId = request.user?.sub;

    if (!userId) {
      return response.status(401).json({ message: "Authentication required." });
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return response.status(404).json({ message: "User not found." });
    }

    return response.json(user);
  },

  async getUserById(request: Request, response: Response) {
    const user = await authService.getUserById(Number(request.params.id));

    if (!user) {
      return response.status(404).json({ message: "User not found." });
    }

    return response.json(user);
  },
};
