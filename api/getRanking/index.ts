import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING!);
const database = client.database("Flappy");
const container = database.container("Rankings");

app.http("getRanking", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (): Promise<HttpResponseInit> => {
        try {
            const { resources } = await container.items.readAll().fetchAll();

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resources)
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
