import express from "express";
import { getWallet, getTransactions } from "../controllers/walletController.js";

const router = express.Router();

router.get("/:playerId", getWallet);
router.get("/:playerId/transactions", getTransactions);

export default router;