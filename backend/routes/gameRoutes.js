import express from "express";
import { placeBet, cashout } from "../controllers/gameController.js";

const router = express.Router();

router.post("/bet", placeBet);
router.post("/cashout", cashout);

export default router;