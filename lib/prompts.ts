import { prisma } from "@/lib/prisma";
import type { PromptType, Prisma } from "@prisma/client";

type PriceFilter = "all" | "free" | "premium";
type SortFilter = "new" | "price_asc" | "price_desc";

export type ListPromptsInput = {
  type?: PromptType;
  aiSlug?: string;
  price?: PriceFilter;
  sort?: SortFilter;
  q?: string;
};

function buildOrderBy(sort: SortFilter): Prisma.PromptOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceMx: "asc" };
    case "price_desc":
      return { priceMx: "desc" };
    case "new":
    default:
      return { createdAt: "desc" };
  }
}

export async function listPrompts(input: ListPromptsInput = {}) {
  const {
    type,
    aiSlug,
    price = "all",
    sort = "new",
    q,
  } = input;

  const where: Prisma.PromptWhereInput = {
    isPublished: true,
    ...(type ? { type } : {}),
    ...(price === "free" ? { isFree: true } : {}),
    ...(price === "premium" ? { isFree: false } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(aiSlug
      ? {
          aiTools: {
            some: {
              aiTool: { slug: aiSlug },
            },
          },
        }
      : {}),
  };

  return prisma.prompt.findMany({
    where,
    orderBy: buildOrderBy(sort),
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      isFree: true,
      priceMx: true,
      contentPreview: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,

      // ✅ IMPORTANTE: siempre incluir aiTools para que exista en TS
      aiTools: {
        select: {
          aiTool: {
            select: { slug: true, name: true },
          },
        },
      },
    },
  });
}

// ✅ Tipo reusable para tu UI (cards / list)
export type PromptListItem = Prisma.PromiseReturnType<typeof listPrompts>[number];

export async function getPromptById(id: string) {
  return prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      isFree: true,
      priceMx: true,
      contentPreview: true,
      contentFull: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      aiTools: {
        select: {
          aiTool: { select: { slug: true, name: true } },
        },
      },
    },
  });
}

export type PromptDetail = Prisma.PromiseReturnType<typeof getPromptById>;
