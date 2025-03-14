import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  isHost: {
    type: Boolean,
    required: true,
    default: false,
  },
  socketId: {
    type: String,
    required: true,
  },
});

const Player = mongoose.models.player || mongoose.model("player", playerSchema);

export default Player;
