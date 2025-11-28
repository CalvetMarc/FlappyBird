import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const getRanking: AzureFunction = async function (context: Context, req: HttpRequest) {
  context.res = {
    status: 200,
    body: { message: "Hello ranking!" }
  };
};

export default getRanking;
