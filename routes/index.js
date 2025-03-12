import quizRouter from "../routes/quiz.js";
import questionRouter from "../routes/questions.js";

export default (app) => {
  app.use("/quiz", quizRouter);
  app.use("/questions", questionRouter);
};
