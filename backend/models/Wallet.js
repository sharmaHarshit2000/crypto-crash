import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
