import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    await User.deleteMany();
    await Wallet.deleteMany();

    const users = await User.insertMany([
      { username: "Harshit" },
      { username: "Vivek" },
      { username: "Arnab" },
    ]);

    const wallets = users.map((user, idx) => ({
      playerId: user._id,
      BTC: 0.002 + idx * 0.001,
      ETH: 0.01 + idx * 0.005,
    }));

    await Wallet.insertMany(wallets);

    console.log("Sample users and wallets created:");
    users.forEach((u) => {
      console.log(`- ${u.username} (ID: ${u._id})`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seedData();
