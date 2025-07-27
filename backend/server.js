import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import gameRoutes from "./routes/gameRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { initGameSocket } from "./sockets/gameSocket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

//Test Route
app.get("/", (req, res) =>
  res.status(200).json({ Message: "Crypto-Crash-Server is running" })
);

// Routes
app.use("/api/game", gameRoutes);
app.use("/api/wallet", walletRoutes);

// WebSocket
initGameSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
