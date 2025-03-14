import mongoose, { Schema } from "mongoose";

const gameSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "player",
    },
  ],
  questions: [
    {
      type: Schema.Types.Mixed,
      required: true,
    },
  ],
  isStarted: {
    type: Boolean,
    default: false,
  },
  currentQuestion: {
    type: Schema.Types.Mixed,
    required: true,
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
});

const Game = mongoose.models.game || mongoose.model("game", gameSchema);

export default Game;
