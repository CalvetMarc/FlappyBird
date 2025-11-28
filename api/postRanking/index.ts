import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const postRanking: AzureFunction = async function (context: Context, req: HttpRequest) {

  const allowedOrigin = "https://white-pebble-036454303.3.azurestaticapps.net";

  const origin = req.headers["origin"] || req.headers["referer"];

  if (!origin || !origin.startsWith(allowedOrigin)) {
    context.res = {
      status: 401,
      body: { error: "Unauthorized origin" }
    };
    return;
  }

  const body = req.body;

  context.res = {
    status: 200,
    body: { ok: true, received: body }
  };
};

export default postRanking;
