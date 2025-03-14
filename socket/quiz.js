import Game from "../models/Game.js";
import Player from "../models/Player.js";
import Question from "../models/Question.js";

export default function QuizMode(io) {
  const quiz = io.of("socket/quiz");

  quiz.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`);

    // Create game
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
        socketId: socket.id,
      });

      try {
        game.players.push(player._id);
        await player.save();
        await game.save();

        socket.join(Number(code));
        socket.emit("game-created", {
          code,
          message: `New Game Created.`,
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
          socketId: socket.id,
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

        // Star 10 second countdown
        let countdown = 10;
        quiz.to(Number(code)).emit("countdown-started", {
          message: "Game starting in...",
          countdown,
        });

        const countdownInterval = setInterval(() => {
          countdown--;
          quiz.to(Number(code)).emit("countdown-update", {
            countdown,
          });

          if (countdown <= 0) {
            clearInterval(countdownInterval);

            // Start game after countdown
            game.isStarted = true;
            game.save();

            // Emit first question
            quiz.to(Number(code)).emit("game-started", {
              message: "Game starting. Please wait.",
              question: game.currentQuestion,
            });

            // timer for the first question
            startQuestionTimer(code, game, game.currentQuestion.time);
          }
        }, 1000);
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to start game" });
      }
    });

    // question timer function
    const startQuestionTimer = async (code, game, time) => {
      const qTimer = time * 1000;

      const timer = setTimeout(async () => {
        try {
          // intermission
          quiz.to(Number(code)).emit("intermission-started", {
            message: "Intermission: Please wait for the next question.",
            duration: 10,
          });

          // Wait 10 sec before next question
          setTimeout(async () => {
            // Increment the question index
            const updatedGame = await Game.findOneAndUpdate(
              { _id: game._id },
              { $inc: { currentQuestionIndex: 1 } },
              { new: true }
            );

            // Check if there are more questions
            if (
              updatedGame.currentQuestionIndex < updatedGame.questions.length
            ) {
              // Update  current question
              updatedGame.currentQuestion =
                updatedGame.questions[updatedGame.currentQuestionIndex];
              await updatedGame.save();

              // Emit  next question
              quiz.to(Number(code)).emit("next-question", {
                currentQuestionIndex: updatedGame.currentQuestionIndex,
                question: updatedGame.currentQuestion,
              });

              // Start  timer for next question
              startQuestionTimer(
                code,
                updatedGame,
                updatedGame.questions[updatedGame.currentQuestionIndex].time
              );
            } else {
              // No more questions, end  game
              quiz.to(Number(code)).emit("game-ended", {
                message: "Game over!",
              });
            }
          }, 10000);
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
