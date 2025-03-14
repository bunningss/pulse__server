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
        currentQuestion: topic?.questions[0],
      });

      const player = new Player({
        name: "game-host",
        score: 0,
        isHost: true,
      });

      try {
        game.players.push(player._id);
        await player.save();
        await game.save();

        socket.join(Number(code));
        socket.emit("game-created", {
          code,
          message: `Game Created. Game code: ${code}`,
          currentPlayer: "game-host",
        });
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to create game" });
      }
    });

    // Player join
    socket.on("join-game", async ({ gameCode, username }) => {
      try {
        const game = await Game.findOne({ code: gameCode });

        if (!game)
          return socket.emit("error", { message: "Invalid game PIN." });

        const player = new Player({
          name: username,
          score: 0,
          isHost: false,
        });

        await player.save();

        game.players.push(player._id);
        await game.save();

        const updatedGame = await Game.findById(game._id)
          .populate("players")
          .lean();

        socket.join(Number(gameCode));

        quiz.to(gameCode).emit("player-joined", {
          message: `${username} joined the game.`,
          code: gameCode,
          currentPlayer: username,
          players: updatedGame.players,
        });
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to join game." });
      }
    });

    // Game start
    socket.on("start-game", async ({ code }) => {
      try {
        const game = await Game.findOne({ code });
        if (!game) {
          return socket.emit("error", { message: "Game not found" });
        }

        game.isStarted = true;
        await game.save();

        // Emit the first question
        quiz.to(Number(code)).emit("game-started", {
          message: "Game starting. Please wait.",
          question: game.currentQuestion,
        });

        // Start the timer for the first question
        startQuestionTimer(code, game, game.currentQuestion.time);
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to start game" });
      }
    });

    // Function to start the question timer
    const startQuestionTimer = async (code, game, time) => {
      const qTimer = time * 1000;

      // Interval to send the current question every 10 seconds
      const questionInterval = setInterval(() => {
        quiz.to(Number(code)).emit("current-question", {
          question: game.currentQuestion,
        });
      }, 10000);

      const timer = setTimeout(async () => {
        try {
          // Clear the interval when the question changes
          clearInterval(questionInterval);

          // Increment the question index
          const updatedGame = await Game.findOneAndUpdate(
            { _id: game._id },
            { $inc: { currentQuestionIndex: 1 } },
            { new: true }
          );

          // Check if there are more questions
          if (updatedGame.currentQuestionIndex < updatedGame.questions.length) {
            // Update the current question
            updatedGame.currentQuestion =
              updatedGame.questions[updatedGame.currentQuestionIndex];
            await updatedGame.save();

            // Emit the next question
            quiz.to(Number(code)).emit("next-question", {
              currentQuestionIndex: updatedGame.currentQuestionIndex,
              question: updatedGame.currentQuestion,
            });

            // Start the timer for the next question
            startQuestionTimer(
              code,
              updatedGame,
              updatedGame.questions[updatedGame.currentQuestionIndex].time
            );
          } else {
            // No more questions, end the game
            quiz.to(Number(code)).emit("game-ended", {
              message: "Game over!",
            });
          }
        } catch (error) {
          console.log(error);
          quiz
            .to(Number(code))
            .emit("error", { message: "Failed to move to the next question" });
        }
      }, qTimer);
    };
  });
}
