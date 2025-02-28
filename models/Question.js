import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
      },
    },
  ],
});

const Question =
  mongoose.models.question || mongoose.model("question", questionSchema);

export default Question;
