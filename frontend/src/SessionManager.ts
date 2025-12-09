import { SessionInfo } from "./core/managers/GameManager";

export interface RankingResponse {
  resetIn: string;
  ranking: SessionInfo[];
}

export async function sendScore(data: SessionInfo): Promise<boolean> {
  const { ts, hash } = await ScoreSigner.sign(data.lastScore);

  const payload = {
    ...data,
    ts,
    hash
  };

  const res = await fetch("/api/postRanking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
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

export const ScoreSigner=(()=>{function x(s:string,k:string){return s.split("").map((c,i)=>String.fromCharCode(c.charCodeAt(0)^k.charCodeAt(i%k.length))).join("")}const p=["G34+emYx","H3wPCDQ9","Jig/Cz8/","ORZzczU="],k="PIXIGAME",h=atob(p.join(""));const SECRET=x(h,k);return{sign:async(score:number)=>{const ts=Date.now(),msg=`${score}|${ts}|${SECRET}`,enc=new TextEncoder().encode(msg),digest=await crypto.subtle.digest("SHA-256",enc),hash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");return{score,ts,hash}}}})();
