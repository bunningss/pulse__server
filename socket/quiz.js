import Game from "../models/Game.js";
import Player from "../models/Player.js";

export default function QuizMode(io) {
  const quiz = io.of("/quiz");

  quiz.on("connection", (socket) => {
    // create game
    socket.on("create-game", async ({ host }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const game = new Game({
        code,
        host,
        players: [],
        questions: [],
        isStarted: false,
        currentQuestionIndex: 0,
      });

      try {
        await game.save();
        socket.join(code);
        socket.emit("game-created", { code, gameId: game._id });
      } catch (error) {
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
        await player.save();

        game.players.push(player._id);
        await game.save();

        socket.join(gameCode);
        quiz
          .to(gameCode)
          .emit("player-joined", { message: `${username} joined the game.` });
      } catch (error) {
        socket.emit("join-error", { message: "Failed to join game." });
      }
    });
  });
}
