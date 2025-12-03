import { SessionInfo } from "./core/managers/GameManager";

export async function sendScore(data: SessionInfo): Promise<boolean> {
  const res = await fetch("/api/postRanking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  return json.enterRanking;
}

export async function getRanking(): Promise<SessionInfo[]> {
  const res = await fetch("/api/getRanking", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json();

  if (!Array.isArray(json)) return [];

  return json.map(item => ({
    name: item.name,
    lastScore: item.lastScore,
    lastGameTime: item.lastGameTime
  })) as SessionInfo[];
}
