import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ ok: false, error: "sessionId requerit" });
  }

  // Buscar sessió
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });

  if (!session) {
    return res.status(400).json({ ok: false, error: "sessió no trobada" });
  }

  if (session.expiresAt < new Date()) {
    return res.status(400).json({ ok: false, error: "sessió expirada" });
  }

  // Generar nova sessió
  const newSessionId = crypto.randomUUID();
  const newSeed = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 10_000);

  // Crear nova
  await prisma.gameSession.create({
    data: {
      sessionId: newSessionId,
      seed: newSeed,
      expiresAt
    }
  });

  // Esborrar l'antiga
  await prisma.gameSession.delete({
    where: { sessionId }
  });

  // Tornar nova sessió
  return res.json({
    sessionId: newSessionId,
    seed: newSeed,
    expiresAt
  });
});

export default router;
