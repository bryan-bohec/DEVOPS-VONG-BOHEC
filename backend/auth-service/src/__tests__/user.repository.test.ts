import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { userRepository } from "../repositories/user.repository";
import { prisma } from "../lib/prisma";

describe("userRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create delegates to prisma.user.create", async () => {
    const data = { email: "john@example.com" };
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 1 } as never);

    const result = await userRepository.create(data as never);

    expect(prisma.user.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual({ id: 1 });
  });

  it("findByEmail delegates to prisma.user.findUnique", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 2 } as never);

    const result = await userRepository.findByEmail("john@example.com");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "john@example.com" } });
    expect(result).toEqual({ id: 2 });
  });

  it("findById delegates to prisma.user.findUnique", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 3 } as never);

    const result = await userRepository.findById(3);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(result).toEqual({ id: 3 });
  });
});
