import { Prisma, Property } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const propertyRepository = {
  list(where: Prisma.PropertyWhereInput): Promise<Property[]> {
    return prisma.property.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  },

  findById(id: number): Promise<Property | null> {
    return prisma.property.findUnique({ where: { id } });
  },

  create(data: Prisma.PropertyCreateInput): Promise<Property> {
    return prisma.property.create({ data });
  },

  update(id: number, data: Prisma.PropertyUpdateInput): Promise<Property> {
    return prisma.property.update({
      where: { id },
      data,
    });
  },

  delete(id: number): Promise<Property> {
    return prisma.property.delete({ where: { id } });
  },
};
