import { Router } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {

  const sessionId = crypto.randomUUID();
  const seed = crypto.randomBytes(16).toString("hex");

  const expiresAt = new Date(Date.now() + 10_000);

  await prisma.gameSession.create({ data: { sessionId, seed, expiresAt }});

  return res.json({ sessionId, seed, expiresAt });
});

export default router;
