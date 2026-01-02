// lib/audit.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AuditEventInput = {
  userId?: string | null;
  email?: string | null;
  event: string; // ej: "auth.login"
  entityType?: string | null; // ej: "prompt", "tool"
  entityId?: string | null; // ej: promptId
  meta?: Prisma.InputJsonValue | null; // ✅ JSON válido para Prisma
};

export async function logEvent(input: AuditEventInput) {
  if (!input.event || typeof input.event !== "string") return;

  try {
    await prisma.auditEvent.create({
      data: {
        event: input.event,
        emailSnapshot: input.email ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        ...(input.meta != null ? { meta: input.meta } : {}),
        ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
      },
    });
  } catch {
    // analytics nunca debe tumbar flujos principales
  }
}
