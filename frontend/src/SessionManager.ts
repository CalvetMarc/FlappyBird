// SessionManager.ts
import { hmacSHA256 } from "./security";

let currentSessionId: string | null = null;
let currentSeed: string | null = null;
let heartbeatInterval: number | null = null;

const SERVER = "https://flappy-backend-tqe2.onrender.com";
const PLAYER_ID = "guest"; 

export async function startSession() {
  const res = await fetch(`${SERVER}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    console.error("Error al start:", await res.text());
    return null;
  }

  const data = await res.json();
  currentSessionId = data.sessionId;
  currentSeed = data.seed;

  console.log("Sessió iniciada:", currentSessionId, currentSeed);

  startHeartbeat();
  return data;
}

function resetSession() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;
  currentSessionId = null;
  currentSeed = null;
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = window.setInterval(async () => {
    if (!currentSessionId) return;

    const res = await fetch(`${SERVER}/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: currentSessionId })
    });

    if (!res.ok) {
      console.warn("Heartbeat fallat → sessió expirada");
      resetSession();
      return;
    }

    const data = await res.json();
    currentSessionId = data.sessionId;
    currentSeed = data.seed;

  }, 8000);
}

export async function sendScore(score: number) {
  if (!currentSessionId || !currentSeed) {
    console.warn("No hi ha sessió vàlida per enviar score");
    return { ok: false, error: "no-session" };
  }

  const message = PLAYER_ID + score;
  const signature = await hmacSHA256(currentSeed, message);

  const res = await fetch(`${SERVER}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: currentSessionId,
      playerId: PLAYER_ID,
      score,
      signature
    })
  });

  resetSession();

  return await res.json();
}
