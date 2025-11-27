import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

interface SessionInfo {
  name: string;
  lastScore: number;
  lastGameTime: number;
}

app.http("postRanking", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const body = await req.json() as SessionInfo;

    if (!body?.name || typeof body.lastScore !== "number") {
      return { status: 400, jsonBody: { success: false, error: "Invalid input" }};
    }

    const client = new CosmosClient(process.env.COSMOS_CONN!);
    const container = client.database("flappy").container("ranking");

    // agafar tots
    const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

    // ordenar
    const sorted = [...resources, body]
      .sort((a, b) => b.lastScore - a.lastScore)
      .slice(0, 10);

    // esborrem tot i tornem a escriure (simple)
    for (const r of resources) await container.item(r.id, r.id).delete();
    for (const r of sorted) await container.items.create(r);

    const hasEntered = sorted.some(x => x.name === body.name && x.lastScore === body.lastScore);

    return { status: 200, jsonBody: { success: hasEntered }};
  }
});
