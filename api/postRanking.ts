import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as crypto from "crypto";
import { sql } from "./_db";
import { addOneMonth } from "./_resetUtils";

const SECRET = process.env.SECRET!;

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    if (!body) throw new Error("Missing request body");

    const { name, lastScore, lastGameTime, ts, hash } = body;

    const message = `${lastScore}|${ts}|${SECRET}`;
    const expected = sha256(message);

    if (expected !== hash) {
      return res.status(400).json({ enterRanking: false, reason: "Invalid signature" });
    }

    if (Date.now() - ts > 10000) {
      return res.status(400).json({ enterRanking: false, reason: "Expired signature" });
    }

    if (lastScore <= 0 || lastScore > 2000000) {
      return res.status(400).json({ enterRanking: false, reason: "Impossible score" });
    }

    // Check if reset is due
    const resets = await sql`SELECT reset_at FROM reset_config WHERE id = 1`;

    let resetAt: Date;

    if (resets.length === 0) {
      resetAt = addOneMonth(new Date());
      await sql`INSERT INTO reset_config (id, reset_at) VALUES (1, ${resetAt.toISOString()})`;
    } else {
      resetAt = new Date(resets[0].reset_at);
    }

    if (new Date() >= resetAt) {
      await sql`DELETE FROM ranking`;
      resetAt = addOneMonth(resetAt);
      await sql`UPDATE reset_config SET reset_at = ${resetAt.toISOString()} WHERE id = 1`;
    }

    // Check ranking
    const items = await sql`SELECT id, last_score FROM ranking ORDER BY last_score DESC`;

    let enterRanking = false;

    if (items.length < 10) {
      enterRanking = true;
      await sql`
        INSERT INTO ranking (name, last_score, last_game_time)
        VALUES (${name}, ${lastScore}, ${lastGameTime})
      `;
    } else {
      const lowest = items[items.length - 1];

      if (lastScore > lowest.last_score) {
        enterRanking = true;
        await sql`DELETE FROM ranking WHERE id = ${lowest.id}`;
        await sql`
          INSERT INTO ranking (name, last_score, last_game_time)
          VALUES (${name}, ${lastScore}, ${lastGameTime})
        `;
      }
    }

    return res.status(200).json({ enterRanking });
  } catch (err) {
    console.error("DB ERROR:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
