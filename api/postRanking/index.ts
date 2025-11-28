import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const postRanking: AzureFunction = async function (context: Context, req: HttpRequest) {
  
  const clientPrincipal = req.headers["x-ms-client-principal-id"];

  if (!clientPrincipal) {
    context.res = {
      status: 401,
      body: { error: "Unauthorized request" }
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
