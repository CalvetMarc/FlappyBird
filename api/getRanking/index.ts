import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const getRanking: AzureFunction = async (context: Context, req: HttpRequest) => {
  try {
    const conn = process.env.COSMOS_CONN;
    if (!conn) throw new Error("Missing COSMOS_CONN");

    const client = new CosmosClient(conn);
    const database = client.database("flappydb"); 
    const container = database.container("ranking");

    const query = `
      SELECT 
        c.name, 
        c.lastScore, 
        c.lastGameTime
      FROM c
      ORDER BY c.lastScore DESC
    `;

    const { resources } = await container.items.query(query).fetchAll();

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
