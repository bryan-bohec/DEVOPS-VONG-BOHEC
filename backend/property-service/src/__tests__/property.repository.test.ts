import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { propertyRepository } from "../repositories/property.repository";
import { prisma } from "../lib/prisma";

describe("propertyRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list delegates to prisma.findMany with sort", async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValue([{ id: 1 }] as never);

    const result = await propertyRepository.list({ city: "Paris" });

    expect(prisma.property.findMany).toHaveBeenCalledWith({
      where: { city: "Paris" },
      orderBy: { created_at: "desc" },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("findById delegates to prisma.findUnique", async () => {
    vi.mocked(prisma.property.findUnique).mockResolvedValue({ id: 2 } as never);

    const result = await propertyRepository.findById(2);

    expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(result).toEqual({ id: 2 });
  });

  it("create/update/delete delegate to prisma", async () => {
    vi.mocked(prisma.property.create).mockResolvedValue({ id: 3 } as never);
    vi.mocked(prisma.property.update).mockResolvedValue({ id: 3 } as never);
    vi.mocked(prisma.property.delete).mockResolvedValue({ id: 3 } as never);

    await propertyRepository.create({ title: "x" } as never);
    await propertyRepository.update(3, { title: "y" } as never);
    await propertyRepository.delete(3);

    expect(prisma.property.create).toHaveBeenCalledWith({ data: { title: "x" } });
    expect(prisma.property.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { title: "y" } });
    expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });
});
