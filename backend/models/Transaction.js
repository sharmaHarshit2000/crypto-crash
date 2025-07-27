import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  usdAmount: { type: Number, required: true },
  cryptoAmount: { type: Number, required: true },
  currency: { type: String, enum: ["BTC", "ETH"], required: true },
  transactionType: { type: String, enum: ["bet", "cashout"], required: true },
  transactionHash: { type: String, required: true },
  priceAtTime: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
