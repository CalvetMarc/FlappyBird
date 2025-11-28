import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const getRanking: AzureFunction = async (context: Context, req: HttpRequest) => {
  context.log("CONNECTION STRING:", process.env.COSMOS_CONN);
  try {
    const conn = process.env.COSMOS_CONN;
    context.log("CONNECTION STRING:", conn ? "OK" : "NOT FOUND");

    if (!conn) throw new Error("Missing COSMOS_CONN");

    const client = new CosmosClient(conn);
    const database = client.database("flappydp");
    const container = database.container("ranking");

    const { resources } = await container.items
      .query("SELECT * FROM c ORDER BY c.lastScore DESC")
      .fetchAll();

    context.res = {
      status: 200,
      body: resources
    };

  } catch (err) {
    const e = err as Error;
    context.res = {
      status: 500,
      body: { error: e.message }
    };
  }

};

export default getRanking;
