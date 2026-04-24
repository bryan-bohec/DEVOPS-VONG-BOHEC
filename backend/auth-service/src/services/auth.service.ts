import { User, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";

interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "tenant" | "owner";
}

interface LoginInput {
  email: string;
  password: string;
}

function toSafeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    created_at: user.created_at,
  };
}

function signToken(user: User) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    options,
  );
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error("Un compte existe déjà avec cet email.");
    }

    const password_hash = await bcrypt.hash(input.password, 10);

    const user = await userRepository.create({
      email: input.email,
      password_hash,
      first_name: input.first_name,
      last_name: input.last_name,
      role: input.role as UserRole,
    });

    return {
      accessToken: signToken(user),
      user: toSafeUser(user),
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    return {
      accessToken: signToken(user),
      user: toSafeUser(user),
    };
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    return user ? toSafeUser(user) : null;
  },
};
