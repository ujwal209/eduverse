import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    chunks: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent compile error if model is already compiled
export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
