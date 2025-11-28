export async function sendScore(data: { name: string; lastScore: number; lastGameTime: number;}) {
  console.log(JSON.stringify(data))
  const res = await fetch("/api/postRanking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  console.log("SERVER RESPONSE:", json);
}
