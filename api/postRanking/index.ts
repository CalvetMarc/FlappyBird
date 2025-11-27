import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

interface SessionInfo {
  name: string;
  lastScore: number;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const body = req.body as SessionInfo;

  if (!body?.name || typeof body.lastScore !== "number") {
    context.res = { status: 400, body: { error: "Invalid body" } };
    return;
  }

  const client = new CosmosClient(process.env.COSMOS_CONN!);
  const container = client.database("flappy").container("ranking");

  // obtenir existents
  const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

  const sorted = [...resources, body]
    .sort((a, b) => b.lastScore - a.lastScore)
    .slice(0, 10);

  // esborrar i reescriure
  for (const r of resources) {
    await container.item(r.id, r.id).delete();
  }

  for (const r of sorted) {
    await container.items.create(r);
  }

  const hasEntered = sorted.some(x => x.name === body.name && x.lastScore === body.lastScore);

  context.res = {
    status: 200,
    body: { success: hasEntered }
  };
};

export default httpTrigger;
