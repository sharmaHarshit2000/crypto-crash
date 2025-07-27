import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Round from "../models/Round.js";
import { convertUsdToCrypto, getCryptoPrice } from "../utils/cryptoUtils.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { getIO } from "../sockets/socketInstance.js";

export const placeBet = async (req, res) => {
  try {
    let { playerId, usdAmount, currency } = req.body;

    if (!playerId || !usdAmount || !currency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid playerId" });
    }

    currency = currency.toUpperCase();

    const wallet = await Wallet.findOne({ playerId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const price = await getCryptoPrice(currency);
    const cryptoAmount = await convertUsdToCrypto(usdAmount, currency);

    if (wallet[currency] < cryptoAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet[currency] -= cryptoAmount;
    await wallet.save();

    if (!global.currentRound) {
      return res.status(400).json({ message: "No active round" });
    }

    const currentRound = await Round.findOne({
      roundId: global.currentRound.roundId,
    });
    if (!currentRound) {
      return res.status(400).json({ message: "Round not found in DB" });
    }

    currentRound.bets.push({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
    });

    await currentRound.save();

    await Transaction.create({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: "bet",
      transactionHash: crypto.randomBytes(16).toString("hex"),
      priceAtTime: price,
    });

    return res.status(200).json({
      message: "Bet placed successfully",
      cryptoAmount: cryptoAmount.toFixed(8),
    });
  } catch (err) {
    console.error("Bet error:", err.message);
    return res.status(500).json({ message: "Error placing bet" });
  }
};

export const cashout = async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId || !mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid playerId" });
    }

    if (!global.currentRound) {
      return res.status(400).json({ message: "No active round" });
    }

    const currentRound = await Round.findOne({
      roundId: global.currentRound.roundId,
    });
    if (!currentRound) {
      return res.status(400).json({ message: "No active round in DB" });
    }

    const bet = currentRound.bets.find(
      (b) => b.playerId.toString() === playerId && !b.cashedOut
    );

    if (!bet) {
      return res.status(400).json({ message: "No active bet to cash out" });
    }

    const multiplier = currentRound.crashPoint / 2; 
    const payout = bet.cryptoAmount * multiplier;
    const price = await getCryptoPrice(bet.currency);

    const wallet = await Wallet.findOne({ playerId });
    wallet[bet.currency.toUpperCase()] += payout;
    await wallet.save();

    bet.cashedOut = true;
    bet.payout = payout;

    currentRound.cashouts.push({
      playerId,
      multiplier,
      payoutCrypto: payout,
    });

    await currentRound.save();

    await Transaction.create({
      playerId,
      usdAmount: payout * price,
      cryptoAmount: payout,
      currency: bet.currency,
      transactionType: "cashout",
      transactionHash: crypto.randomBytes(16).toString("hex"),
      priceAtTime: price,
    });

    const io = getIO();
    io.emit("player_cashout", {
      playerId,
      multiplier: multiplier.toFixed(2),
      payoutCrypto: payout.toFixed(8),
      usdEquivalent: (payout * price).toFixed(2),
    });

    return res.status(200).json({
      message: "Cashed out successfully",
      payoutCrypto: payout.toFixed(8),
      usdEquivalent: (payout * price).toFixed(2),
      multiplier: multiplier.toFixed(2),
    });
  } catch (err) {
    console.error("Cashout error:", err.message);
    return res.status(500).json({ message: "Error processing cashout" });
  }
};
