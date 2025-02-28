import quizRouter from "../routes/quiz.js";
import questionRouter from "../routes/questions.js";

export default (app) => {
  app.use("/api/quiz", quizRouter);
  app.use("/api/questions", questionRouter);
};
