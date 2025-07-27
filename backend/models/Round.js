import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    roundId: { type: String, required: true, unique: true },
    crashPoint: { type: Number, required: true },
    seed: { type: String, required: true },
    hash: { type: String, required: true },
    startTime: { type: Date, default: Date.now },

    bets: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        usdAmount: { type: Number, required: true },
        cryptoAmount: { type: Number, required: true },
        currency: { type: String, enum: ["BTC", "ETH"], required: true },
        cashedOut: { type: Boolean, default: false },
        payout: { type: Number, default: 0 },
      },
    ],

    cashouts: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        multiplier: { type: Number, required: true },
        payoutCrypto: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Round", roundSchema);
