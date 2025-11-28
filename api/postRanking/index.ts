import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const postRanking: AzureFunction = async function (context: Context, req: HttpRequest) {

  const body = req.body;

  context.res = {
    status: 200,
    body: { ok: true, received: body }
  };
};

export default postRanking;
