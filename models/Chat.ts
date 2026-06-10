import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
