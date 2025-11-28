import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

export async function postRankingHandler(req: HttpRequest): Promise<HttpResponseInit> {
  const body = await req.json();
  return {
    status: 200,
    jsonBody: { received: body }
  };
}

app.http("postRanking", {
  methods: ["POST"],
  route: "postRanking",
  handler: postRankingHandler
});
