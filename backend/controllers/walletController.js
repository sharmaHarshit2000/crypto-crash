import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import { getCryptoPrice } from "../utils/cryptoUtils.js";

export const getWallet = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid playerId" });
    }

    const wallet = await Wallet.findOne({ playerId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const btcPrice = await getCryptoPrice("BTC");
    const ethPrice = await getCryptoPrice("ETH");

    return res.status(200).json({
      BTC: {
        balance: wallet.BTC.toFixed(8),
        usd: (wallet.BTC * btcPrice).toFixed(2),
      },
      ETH: {
        balance: wallet.ETH.toFixed(8),
        usd: (wallet.ETH * ethPrice).toFixed(2),
      },
    });
  } catch (err) {
    console.error("getWallet error:", err.message);
    return res.status(500).json({ message: "Error fetching wallet" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid playerId" });
    }

    const txs = await Transaction.find({ playerId }).sort({ timestamp: -1 });

    return res.status(200).json(
      txs.map((tx) => ({
        id: tx._id,
        usdAmount: tx.usdAmount.toFixed(2),
        cryptoAmount: tx.cryptoAmount.toFixed(8),
        currency: tx.currency.toUpperCase(),
        transactionType: tx.transactionType,
        transactionHash: tx.transactionHash,
        priceAtTime: tx.priceAtTime.toFixed(2),
        timestamp: tx.timestamp,
      }))
    );
  } catch (err) {
    console.error("getTransactions error:", err.message);
    return res.status(500).json({ message: "Error fetching transactions" });
  }
};
