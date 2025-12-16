import { prisma } from "@/lib/prisma";

export async function listAiTools() {
  return prisma.aiTool.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });
}
