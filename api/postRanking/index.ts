import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import crypto from "node:crypto";

const postRanking: AzureFunction = async (context: Context, req: HttpRequest) => {
  try {
    const conn = process.env.COSMOS_CONN;
    if (!conn) throw new Error("Missing COSMOS_CONN");

    const client = new CosmosClient(conn);
    const database = client.database("flappydb");
    const container = database.container("ranking");

    const body = req.body;
    if (!body) throw new Error("Missing request body");

    const { name, lastScore, lastGameTime } = body;

    const { resources: items } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();

    items.sort((a, b) => b.lastScore - a.lastScore);

    let enterRanking = false;

    if (items.length < 10) {
      enterRanking = true;

      const newItem = {
        id: crypto.randomUUID(),
        name,
        lastScore,
        lastGameTime,
        createdAt: new Date().toISOString()
      };

      await container.items.create(newItem);

    } else {
      const lowest = items[items.length - 1];

      if (lastScore > lowest.lastScore) {
        enterRanking = true;

        await container.item(lowest.id, lowest.id).delete();

        const newItem = {
          id: crypto.randomUUID(),
          name,
          lastScore,
          lastGameTime,
          createdAt: new Date().toISOString()
        };

        await container.items.create(newItem);
      }
    }

    context.res = {
      status: 200,
      body: { enterRanking }
    };

  } catch (err) {
    context.log("COSMOS ERROR RAW:", err);
    context.res = {
      status: 500,
      body: { error: (err as Error).message }
    };
  }
};

export default postRanking;
