# 💥 Crypto Crash – Real-Time Multiplayer Game Backend

A full-featured backend for a real-time "Crash Game" with crypto integration, provably fair algorithm, and multiplayer WebSocket support.

---

## 🚀 Project Overview

Crypto Crash is a backend game server that:

- Lets users bet in **USD**, converts to **crypto (BTC/ETH)** using real-time prices.
- Starts a new round every 10s with a **provably fair crash point**.
- Sends **real-time multiplier updates** via WebSockets.
- Allows players to **cash out before the crash** to win.
- Simulates crypto **wallets, transactions**, and **round history**.

---

## ⚙️ Setup & Installation

```bash
git clone https://github.com/sharmaHarshit2000/crypto-crash.git
cd crypto-crash
npm install

```

### Run Server:

```bash
npm run dev
```

---

## 🔐 .env Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/crypto-crash
```

---

## 🔧 Seeding Test Data

```bash
node backend/data/seed.js
```

Creates 3 test users with funded wallets.

---

## 📡 WebSocket Events

| Event Name          | Direction       | Payload                                                 |
| ------------------- | --------------- | ------------------------------------------------------- |
| `round_start`       | Server → Client | `{ roundId, crashPoint, seed, hash }`                   |
| `multiplier_update` | Server → Client | `{ multiplier }`                                        |
| `player_cashout`    | Server → Client | `{ playerId, payoutCrypto, usdEquivalent, multiplier }` |
| `round_crash`       | Server → Client | `{ multiplier, crashPoint }`                            |
| `cashout_request`   | Client → Server | `{ playerId }`                                          |

---

## 🔌 REST API Endpoints

### 🎯 Place Bet

`POST /api/game/bet`

```json
{
  "playerId": "USER_ID",
  "usdAmount": 10,
  "currency": "BTC"
}
```

### 💸 Cash Out

`POST /api/game/cashout`

```json
{
  "playerId": "USER_ID"
}
```

### 👛 Get Wallet

`GET /api/wallet/:playerId`

### 📜 Get Transactions

`GET /api/wallet/:playerId/transactions`

---

## 🧠 Provably Fair Crash Algorithm

```js
hash = sha256(seed + roundId);
crash = (hash % 10000) / 100;
```

---

## 💱 USD ↔ Crypto Conversion Logic

Price is fetched via **CoinGecko API**, cached for 10s:

- `convertUsdToCrypto($10 @ $60,000 BTC) = 0.00016667 BTC`
- `Cashout at 3x = 0.0005 BTC → $30`

---

## 🧪 Testing with Postman

Import the provided collection:

📁 `/postman/CryptoCrashAPI.postman_collection.json`

---

## 📁 Folder Structure

```
- backend/
  - controllers/
  - models/
  - routes/
  - sockets/
  - utils/
  - data/seed.js
- public/client.html (WebSocket tester)
```

---

## 🧰 Tech Stack

- Node.js + Express.js
- MongoDB (Mongoose)
- Socket.IO
- CoinGecko API
- Postman

---
