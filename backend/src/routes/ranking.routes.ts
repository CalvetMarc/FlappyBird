import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const ranking = await prisma.score.findMany({
    orderBy: { score: "desc" }
  });

  res.json(ranking);
});

export default router;
