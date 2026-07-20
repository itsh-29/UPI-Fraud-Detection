# Signal — UPI Payment Anomaly Detection Engine

A real-time fraud detection system for UPI-style transactions, combining a hand-built statistical rules engine with a trained neural network. Every transaction is scored live by both systems the moment it's created.

**Live demo:** https://upi-fraud-detection-5wja.onrender.com/

> Note: hosted on Render's free tier — the first request after a period of inactivity may take a few seconds to wake the server.

---

## What it does

Most simple fraud-detection demos flag transactions against a fixed threshold (e.g. "amount > ₹50,000"). Signal doesn't — every signal is computed **relative to that specific user's own transaction history**, not a global rule. A ₹50,000 transaction is unremarkable for a business account that transacts in that range daily, and highly anomalous for someone who has never sent more than ₹2,000.

Each incoming transaction is scored on three independent statistical signals, then separately scored again by a trained neural network trained on the same underlying features:

- **Amount anomaly (z-score)** — how many standard deviations this amount is from the sender's own historical average, calculated incrementally via **Welford's online algorithm** so the running mean/variance update in O(1) per transaction without ever re-scanning transaction history.
- **Receiver novelty** — flags large payments to a receiver the sender has no prior relationship with.
- **Time-of-day anomaly** — flags transactions in an hour-of-day bucket the sender rarely transacts in, using per-user bucket counts rather than naive clock-time averaging (averaging raw hours breaks at midnight — 11pm and 1am are two hours apart but average to noon).

A combined rule-based risk score (0–100) and a separately-trained model probability are both surfaced on every transaction.

---

## Architecture

```
┌─────────────┐      ┌──────────────────────┐      ┌─────────────┐
│  Dashboard  │◄────►│   Express API         │◄────►│  MongoDB    │
│ (vanilla JS)│      │  - Rule engine        │      │  Atlas      │
└─────────────┘      │  - TensorFlow.js model│      └─────────────┘
                      └──────────────────────┘
```

- **Backend**: Node.js / Express / Mongoose
- **Database**: MongoDB Atlas
- **ML**: TensorFlow.js (pure-JS build), trained offline on synthetically generated + labeled transaction data, loaded into the live server at startup
- **Frontend**: Static HTML/CSS/JS dashboard served directly by Express (`express.static`) — no build step, no separate frontend deployment
- **Deployment**: Render (single web service), kept warm via an external cron ping

---

## The ML pipeline

The model wasn't trained on real fraud-labeled data (none exists for a portfolio project) — instead:

1. A seed script generates realistic per-user transaction histories using Gaussian-distributed amounts around a random per-user mean.
2. A second generator deliberately injects labeled "fraud-pattern" transactions — combining an extreme amount (5–10 standard deviations above the sender's mean), a forced brand-new receiver, and a forced late-night timestamp — mirroring real fraud typologies (large payment + unfamiliar recipient + unusual hour).
3. Both sets are run through the *same* feature-computation functions the live API uses (z-score, novelty flag, time-bucket percentage), then normalized (min-max scaling) and used to train a small feed-forward network (`Dense(8, relu) → Dense(4, relu) → Dense(1, sigmoid)`).
4. Evaluated with **precision, recall, and F1** on a held-out test split — not accuracy alone, since the dataset is intentionally imbalanced (~85% normal transactions) and accuracy alone is misleading under class imbalance. The classification threshold is a named, tunable constant, since fraud detection generally favors recall (catching more fraud) over precision (fewer false alarms).

---

## API

| Method | Route              | Description                                      |
|--------|---------------------|---------------------------------------------------|
| POST   | `/users`            | Create a user                                     |
| GET    | `/users`            | List all users                                     |
| GET    | `/users/:id`        | Get a single user's current stats                  |
| POST   | `/transactions`     | Create + score a transaction (rule engine + model) |
| GET    | `/transactions`     | List all transactions                              |

---

## Running locally

```bash
git clone https://github.com/itsh-29/UPI-Fraud-Detection.git
cd UPI-Fraud-Detection
npm install
```

Create a `.env` file:
```
MONGO_URI=your_mongodb_connection_string
```

Start the server:
```bash
npm run dev
```

Visit `http://localhost:5000` for the dashboard.

**Optional — generate demo data:**
```bash
node src/scripts/runSeed.js
```

**Optional — retrain the model:**
```bash
node src/scripts/generateTrainingData.js
node src/scripts/trainModel.js
```

---

## Tech stack

Node.js · Express · MongoDB / Mongoose · TensorFlow.js · Vanilla JS/HTML/CSS · Render

---

## Author

Ishan Meduri — [GitHub](https://github.com/itsh-29)