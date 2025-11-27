import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const client = new CosmosClient(process.env.COSMOS_CONN!);
    const container = client.database("flappy").container("ranking");

    const query = `
      SELECT * 
      FROM c 
      ORDER BY c.lastScore DESC 
      OFFSET 0 LIMIT 10
    `;

    const { resources } = await container.items.query(query).fetchAll();

    context.res = {
      status: 200,
      body: resources
    };

  } catch (err) {
    context.res = {
      status: 500,
      body: { error: "Error getting ranking", details: err }
    };
  }
};

export default httpTrigger;
