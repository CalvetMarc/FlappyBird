import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const postRanking: AzureFunction = async function (context: Context, req: HttpRequest) {
  context.res = {
    status: 200,
    body: { received: req.body }
  };
};

export default postRanking;
