import express from "express";
import cors from "cors";
import "dotenv/config";

import startRouter from "./routes/start.routes";
import heartbeatRouter from "./routes/heartbeat.routes";
import scoreRouter from "./routes/score.routes";
import rankingRouter from "./routes/ranking.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/start", startRouter);
app.use("/heartbeat", heartbeatRouter);
app.use("/score", scoreRouter);
app.use("/ranking", rankingRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend escoltant a http://localhost:" + PORT);
});
