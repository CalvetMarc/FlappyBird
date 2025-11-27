import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

interface SessionInfo {
  name: string;
  lastScore: number;
  lastGameTime: number;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const body = req.body as SessionInfo;

    if (!body || !body.name || typeof body.lastScore !== "number") {
      context.res = { status: 400, body: { success: false, error: "Invalid input" } };
      return;
    }

    const client = new CosmosClient(process.env.COSMOS_CONN!);
    const container = client.database("flappy").container("ranking");

    // Get current top 10
    const topQuery = `
      SELECT * 
      FROM c 
      ORDER BY c.lastScore DESC 
      OFFSET 0 LIMIT 10
    `;
    const { resources: ranking } = await container.items.query(topQuery).fetchAll();

    let entersRanking = false;

    // Check if enters top 10
    if (ranking.length < 10 || body.lastScore > ranking[ranking.length - 1].lastScore) {
      entersRanking = true;

      // Insert new record
      await container.items.create({
        id: crypto.randomUUID(),
        ...body
      });

      // Remove extra items to keep 10
      const updated = await container.items
        .query(`SELECT * FROM c ORDER BY c.lastScore DESC`)
        .fetchAll();

      const extra = updated.resources.slice(10);
      for (const item of extra) {
        await container.item(item.id).delete();
      }
    }

    context.res = { status: 200, body: { success: true, entersRanking } };
  } catch (err) {
    context.res = { status: 500, body: { success: false, error: err } };
  }
};

export default httpTrigger;
