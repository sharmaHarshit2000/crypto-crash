import crypto from "crypto";
import Round from "../models/Round.js";
import { getCryptoPrice } from "../utils/cryptoUtils.js";
import { setIO } from "./socketInstance.js";

global.currentRound = null;
let currentMultiplier = 1;
let intervalId = null;
let ioGlobal = null;

const generateCrashPoint = (roundId) => {
  const seed = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(seed + roundId)
    .digest("hex");
  const raw = parseInt(hash.slice(0, 8), 16);
  const crash = Math.max(1.01, (raw % 10000) / 100);
  return { crash: parseFloat(crash.toFixed(2)), seed, hash };
};

const startNewRound = async () => {
  const roundId = Date.now().toString();
  const { crash, seed, hash } = generateCrashPoint(roundId);

  global.currentRound = new Round({
    roundId,
    crashPoint: crash,
    seed,
    hash,
    bets: [],
    cashouts: [],
  });

  await global.currentRound.save();

  console.log(`New round started: ${roundId}, Crash Point: ${crash}x`);

  ioGlobal.emit("round_start", {
    roundId,
    crashPoint: crash,
    seed,
    hash,
    startTime: Date.now(),
  });

  currentMultiplier = 1;
  const startTime = Date.now();

  intervalId = setInterval(async () => {
    const elapsed = (Date.now() - startTime) / 1000;
    currentMultiplier = 1 + elapsed * 0.05;

    ioGlobal.emit("multiplier_update", {
      multiplier: currentMultiplier.toFixed(2),
    });

    if (currentMultiplier >= crash) {
      console.log(`Round crashed at: ${currentMultiplier.toFixed(2)}x`);

      ioGlobal.emit("round_crash", {
        multiplier: currentMultiplier.toFixed(2),
        crashPoint: crash,
      });

      clearInterval(intervalId);
      setTimeout(startNewRound, 10000); // 10s delay
    }
  }, 100);
};

export const initGameSocket = (io) => {
  ioGlobal = io;
  setIO(io);

  io.on("connection", (socket) => {
    console.log("Player connected");

    socket.on("cashout_request", async ({ playerId }) => {
      console.log(`Cashout request received for playerId: ${playerId}`);

      if (!global.currentRound) {
        console.log("No active round running");
        return;
      }

      if (!playerId) {
        console.log("Missing playerId");
        return;
      }

      const bet = global.currentRound.bets.find(
        (b) => b.playerId.toString() === playerId && !b.cashedOut
      );

      if (!bet) {
        console.log("No active or uncased-out bet found for this player.");
        return;
      }

      console.log(`Bet found: ${JSON.stringify(bet)}`);
      console.log(
        `Current Multiplier: ${currentMultiplier.toFixed(2)} | Crash Point: ${
          global.currentRound.crashPoint
        }`
      );

      const payoutCrypto = bet.cryptoAmount * currentMultiplier;
      const price = await getCryptoPrice(bet.currency);

      global.currentRound.cashouts.push({
        playerId,
        multiplier: currentMultiplier,
        payoutCrypto,
      });

      bet.cashedOut = true;
      bet.payout = payoutCrypto;

      await global.currentRound.save();

      const cashoutPayload = {
        playerId,
        multiplier: currentMultiplier.toFixed(2),
        payoutCrypto: payoutCrypto.toFixed(8),
        usdEquivalent: (payoutCrypto * price).toFixed(2),
      };

      console.log("Emitting player_cashout:", cashoutPayload);

      ioGlobal.emit("player_cashout", cashoutPayload);
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected");
    });
  });

  startNewRound();
};
