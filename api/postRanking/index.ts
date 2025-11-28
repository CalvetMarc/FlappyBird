import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuid } from "uuid";

const postRanking: AzureFunction = async (context: Context, req: HttpRequest) => {
  try {
    const conn = process.env.COSMOS_CONN;
    if (!conn) throw new Error("Missing COSMOS_CONN");

    const client = new CosmosClient(conn);
    const database = client.database("flappydb"); 
    const container = database.container("ranking");

    const body = req.body;

    const item = {
      id: uuid(),
      name: body.name,
      lastScore: body.lastScore,
      lastGameTime: body.lastGameTime,
      createdAt: new Date().toISOString()
    };

    await container.items.create(item);

    context.res = {
      status: 200,
      body: { ok: true }
    };

  } catch (err) {
    const e = err as Error;
    context.res = {
      status: 500,
      body: { error: e.message }
    };
  }
};

export default postRanking;
