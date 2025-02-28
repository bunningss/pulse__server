import Question from "../models/Question.js";

export async function createQuestion(request, response) {
  try {
    const body = request.body;

    const q = new Question(body);

    await q.save();

    return response.status(200).json({ msg: "Question added." });
  } catch (error) {
    return response.status(400).json({ msg: error.message });
  }
}

export async function fetchQuestions(request, response) {
  try {
    const questions = await Question.find();

    return response
      .status(200)
      .json({ msg: "Question added.", payload: questions });
  } catch (error) {
    return response.status(400).json({ msg: error.message });
  }
}
