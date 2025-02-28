import quizRouter from "../routes/quiz.js";

export default (app) => {
  app.use("/api", quizRouter);
};
