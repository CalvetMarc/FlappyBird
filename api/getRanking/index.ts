import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { addOneMonth, formatTimeDiff } from "../resetUtils";

const getRanking: AzureFunction = async (context: Context, req: HttpRequest) => {
  try {
    const conn = process.env.COSMOS_CONN;
    if (!conn) throw new Error("Missing COSMOS_CONN");

    const client = new CosmosClient(conn);
    const database = client.database("flappydb");
    const container = database.container("ranking");

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
      const { resources: allScores } = await container.items
        .query("SELECT * FROM c WHERE c.type != 'reset'")
        .fetchAll();

      for (const s of allScores) {
        await container.item(s.id, s.id).delete();
      }

      resetDoc.resetAt = addOneMonth(resetAt).toISOString();
      await container.item(resetDoc.id, resetDoc.id).replace(resetDoc);
    }

    const query = `
      SELECT c.name, c.lastScore, c.lastGameTime
      FROM c
      WHERE c.type = 'score'
      ORDER BY c.lastScore DESC
    `;

    const { resources: ranking } = await container.items.query(query).fetchAll();

    const timeLeft = formatTimeDiff(new Date(resetDoc.resetAt));

    context.res = {
      status: 200,
      body: {
        resetIn: timeLeft,
        ranking
      }
    };

  } catch (err) {
    context.res = {
      status: 500,
      body: { error: (err as Error).message }
    };
  }
};

export default getRanking;
