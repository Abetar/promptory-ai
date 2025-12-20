// lib/packs.ts
import { prisma } from "@/lib/prisma";

type PackPriceFilter = "all" | "free" | "premium";
type PackSortFilter = "new" | "price_asc" | "price_desc";

export async function listPacks(params?: {
  price?: PackPriceFilter;
  sort?: PackSortFilter;
  q?: string;
}) {
  const price = params?.price ?? "all";
  const sort = params?.sort ?? "new";
  const q = params?.q?.trim();

  const where: any = {
    isPublished: true,
  };

  if (price === "free") where.isFree = true;
  if (price === "premium") where.isFree = false;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "price_asc"
      ? [{ priceMx: "asc" as const }, { createdAt: "desc" as const }]
      : sort === "price_desc"
        ? [{ priceMx: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  return prisma.pack.findMany({
    where,
    orderBy,
    include: {
      prompts: {
        select: { promptId: true }, // solo para contar rápido
      },
    },
  });
}

export async function getPackBySlug(slug: string) {
  return prisma.pack.findUnique({
    where: { slug },
    include: {
      prompts: {
        include: {
          prompt: {
            include: {
              aiTools: {
                include: { aiTool: true },
              },
            },
          },
        },
      },
    },
  });
}
