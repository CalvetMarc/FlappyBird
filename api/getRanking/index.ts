import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

app.http("getRanking", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const client = new CosmosClient(process.env.COSMOS_CONN!);
    const container = client.database("flappy").container("ranking");

    const query = "SELECT * FROM c ORDER BY c.score DESC OFFSET 0 LIMIT 10";
    const { resources } = await container.items.query(query).fetchAll();

    return {
      status: 200,
      jsonBody: resources
    };
  }
});
