// ------------------------------
// Types & Interfaces
// ------------------------------

/** Single score record stored in MockAPI */
export interface ScoreEntry {
  id: string;
  player: string;
  score: number;
  createdAt: string; // ISO date string
}

/** Response returned by submitScore() */
export interface SubmitScoreResult {
  result: "newRecord" | "notReached";
  ranking: ScoreEntry[];
}

// ------------------------------
// API Logic
// ------------------------------

const API_URL = "https://6911971e7686c0e9c20e21fc.mockapi.io/scores";

export async function submitScore(player: string, score: number): Promise<SubmitScoreResult> {
  // 1️⃣ Fetch current leaderboard (sorted by score descending)
  const res = await fetch(`${API_URL}?sortBy=score&order=desc`);
  const allScores: ScoreEntry[] = await res.json();

  const ranking = allScores.slice(0, 10);
  const minScore = ranking.at(-1)?.score ?? 0;

  // 2️⃣ Check if the new score qualifies for the Top 10
  const qualifies = ranking.length < 10 || score > minScore;
  if (!qualifies) {
    return { result: "notReached", ranking };
  }

  // 3️⃣ Post new score to the API
  const addRes = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player, score }),
  });
  const newEntry: ScoreEntry = await addRes.json();

  // 4️⃣ Fetch updated leaderboard and keep only top 10
  const updatedRes = await fetch(`${API_URL}?sortBy=score&order=desc`);
  const updatedScores: ScoreEntry[] = await updatedRes.json();
  const top10 = updatedScores.slice(0, 10);

  // 5️⃣ Remove scores beyond the top 10
  const toDelete = updatedScores.slice(10);
  for (const s of toDelete) {
    await fetch(`${API_URL}/${s.id}`, { method: "DELETE" });
  }

  // 6️⃣ Return result and leaderboard
  return {
    result: "newRecord",
    ranking: top10,
  };
}
