import "dotenv/config";
import express from "express";
import route from "./routes/index.js";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDb } from "./utils/connect-db.js";
import QuizMode from "./socket/quiz.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors());

connectDb();

route(app);

// Socket connections
QuizMode(io);

server.listen(process.env.PORT, () => {
  console.log(`Server online on port ${process.env.PORT}`);
});
