export async function sendScore(sessionData: { name: string; lastScore: number; lastGameTime: number;}) {
  try {
    const res = await fetch("/api/postRanking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sessionData)
    });

    const json = await res.json();
    console.log("SERVER RESPONSE:", json);
  } catch (err) {
    console.error("Error enviant puntuació:", err);
  }
}
