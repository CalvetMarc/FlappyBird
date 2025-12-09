import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import crypto from "node:crypto";
import { addOneMonth } from "../resetUtils";

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

    const { resources: resets } = await container.items
      .query("SELECT * FROM c WHERE c.type = 'reset'")
      .fetchAll();

    let resetDoc = resets[0];

    if (!resetDoc) {
      resetDoc = {
        id: "reset-date",
        type: "reset",
        resetAt: addOneMonth(new Date()).toISOString()
      };
      await container.items.create(resetDoc);
    }

    const now = new Date();
    const resetAt = new Date(resetDoc.resetAt);

    if (now >= resetAt) {
      const { resources: all } = await container.items
        .query("SELECT * FROM c WHERE c.type != 'reset'")
        .fetchAll();

      for (const item of all) {
        await container.item(item.id, item.id).delete();
      }

      resetDoc.resetAt = addOneMonth(resetAt).toISOString();
      await container.item(resetDoc.id, resetDoc.id).replace(resetDoc);
    }

    const { resources: items } = await container.items
      .query("SELECT * FROM c WHERE c.type = 'score'")
      .fetchAll();

    items.sort((a, b) => b.lastScore - a.lastScore);

    let enterRanking = false;

    if (items.length < 10) {
      enterRanking = true;

      await container.items.create({
        id: crypto.randomUUID(),
        type: "score",
        name,
        lastScore,
        lastGameTime,
        createdAt: new Date().toISOString()
      });

    } else {
      const lowest = items[items.length - 1];

      if (lastScore > lowest.lastScore) {
        enterRanking = true;

        await container.item(lowest.id, lowest.id).delete();

        await container.items.create({
          id: crypto.randomUUID(),
          type: "score",
          name,
          lastScore,
          lastGameTime,
          createdAt: new Date().toISOString()
        });
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
