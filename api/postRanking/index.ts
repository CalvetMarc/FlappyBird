import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING!);
const database = client.database("Flappy");
const container = database.container("Rankings");

interface RankingInput {
    name: string;
    score: number;
}

app.http("postRanking", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
        try {
            const body = await req.json() as RankingInput;

            if (!body || !body.name || typeof body.score !== "number") {
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Invalid body format" })
                };
            }

            const item = {
                id: crypto.randomUUID(),
                name: body.name,
                score: body.score,
                createdAt: new Date().toISOString()
            };

            await container.items.create(item);

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ success: true })
            };
        } catch (e: any) {
            return {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: e.message ?? String(e) })
            };
        }
    }
});
