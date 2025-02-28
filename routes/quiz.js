import express from "express";
import { createQuiz } from "../controller/quiz-controller.js";
const router = express.Router();

router.post("/", createQuiz);

export default router;
