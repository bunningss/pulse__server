import Question from "../models/Question.js";
import Game from "../models/Game.js";

export async function createQuiz(request, response) {
  try {
    const body = request.body;

    const topic = await Question.findById(body.topicId).lean();

    const game = new Game({
      code: Math.floor(100000 + Math.random() * 900000),
      host: "admin",
      players: [],
      questions: topic?.questions,
      isStarted: false,
    });

    await game.save();

    return response
      .status(200)
      .json({ msg: "Game created.", payload: game.code });
  } catch (error) {
    return response.status(400).json({ msg: error.message });
  }
}
