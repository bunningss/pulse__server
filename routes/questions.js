import express from "express";
import {
  createQuestion,
  fetchQuestions,
} from "../controller/question-controller.js";
const router = express.Router();

router.post("/", createQuestion);
router.get("/", fetchQuestions);

export default router;
