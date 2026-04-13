import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./_db";
import { addOneMonth, formatTimeDiff } from "./_resetUtils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ensure tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS ranking (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        last_score INT NOT NULL,
        last_game_time TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS reset_config (
        id INT PRIMARY KEY DEFAULT 1,
        reset_at TIMESTAMPTZ NOT NULL
      )
    `;

    // Get or create reset date
    const resets = await sql`SELECT reset_at FROM reset_config WHERE id = 1`;

    let resetAt: Date;

    if (resets.length === 0) {
      resetAt = addOneMonth(new Date());
      await sql`INSERT INTO reset_config (id, reset_at) VALUES (1, ${resetAt.toISOString()})`;
    } else {
      resetAt = new Date(resets[0].reset_at);
    }

    // Check if reset is due
    if (new Date() >= resetAt) {
      await sql`DELETE FROM ranking`;
      resetAt = addOneMonth(resetAt);
      await sql`UPDATE reset_config SET reset_at = ${resetAt.toISOString()} WHERE id = 1`;
    }

    const ranking = await sql`
      SELECT name, last_score AS "lastScore", last_game_time AS "lastGameTime"
      FROM ranking
      ORDER BY last_score DESC
    `;

    const timeLeft = formatTimeDiff(resetAt);

    return res.status(200).json({ resetIn: timeLeft, ranking });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
