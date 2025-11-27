import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

app.http("getRanking", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (req: HttpRequest): Promise<HttpResponseInit> => {

        const client = new CosmosClient(process.env.COSMOS_CONN!);
        const container = client.database("flappy").container("ranking");

        const { resources } = await container.items
            .query("SELECT r.name, r.lastScore FROM r ORDER BY r.lastScore DESC")
            .fetchAll();

        return {
            status: 200,
            jsonBody: resources
        };
    }
});
