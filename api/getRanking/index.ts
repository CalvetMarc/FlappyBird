import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

export async function getRankingHandler(req: HttpRequest): Promise<HttpResponseInit> {
  return {
    status: 200,
    jsonBody: { message: "Hello ranking!" }
  };
}

app.http("getRanking", {
  methods: ["GET"],
  route: "getRanking",
  handler: getRankingHandler
});
