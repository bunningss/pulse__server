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
          required: true,
          lowercase: true,
        },
      ],
      correctAnswer: {
        type: String,
        required: true,
        lowercase: true,
      },
      time: {
        type: Number,
        required: true,
        default: 10,
      },
      image: {
        type: String,
        required: false,
      },
    },
  ],
});

const Question =
  mongoose.models.question || mongoose.model("question", questionSchema);

export default Question;
