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
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGIN,
    credentials: true,
  })
);

connectDb();

route(app);

// Socket connections
QuizMode(io);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server online on port ${port}`);
});
