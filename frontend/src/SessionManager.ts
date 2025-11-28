export async function sendScore(data: { name: string; lastScore: number; lastGameTime: number;}) {
  const res = await fetch("/.auth/function/call/postRanking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  console.log("SERVER RESPONSE:", json);
}
