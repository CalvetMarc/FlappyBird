// SessionManager.ts
import { hmacSHA256 } from "./security";

let currentSessionId: string | null = null;
let currentSeed: string | null = null;
let heartbeatInterval: number | null = null;

const SERVER = "https://flappy-backend-tqe2.onrender.com";
const PLAYER_ID = "guest"; // Pots canviar-ho si vols

export async function startSession() {
  const res = await fetch(`${SERVER}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    console.error("Error al start");
    return false;
  }

  const data = await res.json();

  currentSessionId = data.sessionId;
  currentSeed = data.seed;

  console.log("Sessió iniciada:", currentSessionId, currentSeed);

  startHeartbeat();
  return true;
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
      console.warn("Sessió expirada o invàlida");

      clearInterval(heartbeatInterval!);
      heartbeatInterval = null;

      currentSessionId = null;
      currentSeed = null;

      return;
    }

    const data = await res.json();
    currentSessionId = data.sessionId;
    currentSeed = data.seed;

  }, 8000); // cada 8 segons
}

export async function sendScore(score: number) {
  if (!currentSessionId || !currentSeed) {
    console.warn("No hi ha sessió vàlida per enviar score");
    return;
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

  // Reset de sessió i heartbeat
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = null;

  currentSessionId = null;
  currentSeed = null;

  return await res.json();
}
