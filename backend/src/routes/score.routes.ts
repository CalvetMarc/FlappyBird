import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const RANK_LIMIT = 10;

router.post("/", async (req, res) => {
  const { sessionId, playerId, score, signature } = req.body;

  if (!sessionId || !signature)
    return res.status(400).json({ ok: false, error: "sessionId o signature faltants" });

  // Buscar sessió
  const session = await prisma.gameSession.findUnique({
    where: { sessionId }
  });

  if (!session)
    return res.status(400).json({ ok: false, error: "sessió no vàlida" });

  if (session.expiresAt < new Date())
    return res.status(400).json({ ok: false, error: "sessió expirada" });

  // Validació signature (sense temps)
  const expectedSignature = crypto
    .createHmac("sha256", session.seed)
    .update(playerId + score)
    .digest("hex");

  if (expectedSignature !== signature)
    return res.status(400).json({ ok: false, error: "signature incorrecta" });

  // Un cop usada → destruir sessió
  await prisma.gameSession.delete({
    where: { sessionId }
  });

  // Ranking
  const ranking = await prisma.score.findMany({
    orderBy: { score: "desc" }
  });

  // Si encara no hi ha top10
  if (ranking.length < RANK_LIMIT) {
    await prisma.score.create({
      data: { playerId, score, serverHash: expectedSignature }
    });
    return res.json({ ok: true, inRanking: true });
  }

  const pitjor = ranking[ranking.length - 1];

  if (score <= pitjor.score)
    return res.json({ ok: true, inRanking: false });

  // Nou score i treure l’últim
  await prisma.score.create({
    data: { playerId, score, serverHash: expectedSignature }
  });

  await prisma.score.delete({ where: { id: pitjor.id } });

  res.json({ ok: true, inRanking: true });
});

export default router;
