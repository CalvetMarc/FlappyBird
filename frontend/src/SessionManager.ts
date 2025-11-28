export async function sendScore(sessionData: { name: string; lastScore: number; lastGameTime: number;}) {
  try {
    const res = await fetch("/.auth/function/call/postRanking", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sessionData)
    });

    const out = await res.json();
    console.log("SERVER RESPONSE:", out);

  } catch (err) {
    console.error("Error enviant puntuació:", err);
  }
}
