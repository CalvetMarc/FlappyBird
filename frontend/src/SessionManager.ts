import { SessionInfo } from "./core/managers/GameManager";

export interface RankingResponse {
  resetIn: string;
  ranking: SessionInfo[];
}

export async function sendScore(data: SessionInfo): Promise<boolean> {
  const res = await fetch("/api/postRanking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  return json.enterRanking;
}

export async function getRanking(): Promise<RankingResponse> {
  const res = await fetch("/api/getRanking", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json();

  if (!json || !Array.isArray(json.ranking)) {
    return { resetIn: "0 s", ranking: [] };
  }

  const ranking = json.ranking.map((item: any) => ({
    name: item.name,
    lastScore: item.lastScore,
    lastGameTime: item.lastGameTime
  })) as SessionInfo[];

  return {
    resetIn: json.resetIn,
    ranking
  };
}
