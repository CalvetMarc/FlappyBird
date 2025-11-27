import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const client = new CosmosClient(process.env.COSMOS_CONN!);
  const container = client.database("flappy").container("ranking");

  const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

  context.res = {
    status: 200,
    body: resources
  };
};

export default httpTrigger;
