import Game from "../models/Game.js";
import Player from "../models/Player.js";
import Question from "../models/Question.js";

export default function QuizMode(io) {
  const quiz = io.of("socket/quiz");

  quiz.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`);
    // create game
    socket.on("create-game", async ({ host, questionId }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const topic = await Question.findById(questionId).lean();

      const game = new Game({
        code,
        host,
        players: [],
        questions: topic?.questions,
        isStarted: false,
        currentQuestionIndex: 0,
      });

      try {
        await game.save();
        socket.join(code);
        socket.emit("game-created", { code, message: "Game created." });
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to create game" });
      }
    });

    // Player join
    socket.on("join-game", async ({ gameCode, username }) => {
      try {
        const game = await Game.findOne({ code: gameCode });

        if (!game) return quiz.emit("error", { message: "Invalid game PIN." });

        const player = new Player({
          name: username,
          score: 0,
        });

        game.players.push(player._id);
        await game.save();

        const updatedGame = await Game.findById(game._id)
          .populate("players")
          .lean();

        socket.join(gameCode);
        socket.emit("player-joined", {
          message: `${username} joined the game.`,
          code: gameCode,
          players: updatedGame.players,
        });
      } catch (error) {
        console.log(error);
        socket.emit("join-error", { message: "Failed to join game." });
      }
    });
  });
}
