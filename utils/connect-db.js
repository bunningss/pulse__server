import mongoose from "mongoose";

export async function connectDb() {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    return;
  }

  if (connectionState === 2) {
    return;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database Connected.");
  } catch (err) {
    console.log(err);
    throw new Error("Error occurred while connecting to the database.");
  }
}
