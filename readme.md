# 🚨 Signal - Real-Time UPI Fraud Detection Engine

<div align="center">

### AI-Powered Fraud Detection for UPI Transactions

A real-time fraud detection system that combines statistical anomaly detection with a TensorFlow.js neural network to identify suspicious UPI-style transactions based on user behaviour rather than static thresholds.

**🌐 Live Demo:** https://upi-fraud-detection-5wja.onrender.com/

> **Note:** Hosted on Render's free tier. The first request after inactivity may take a few seconds while the server wakes up.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

</div>

---

# 📖 Overview

Signal is a real-time fraud detection engine designed for UPI-style digital payments.

Unlike traditional fraud detection systems that rely on fixed thresholds (e.g. flag every transaction above ₹50,000), Signal builds a behavioural profile for every individual user and evaluates each transaction relative to that user's historical activity.

Every transaction is simultaneously analysed by:

- 📊 Statistical Rule Engine
- 🤖 TensorFlow.js Neural Network

Both scores are returned instantly to provide a comprehensive fraud assessment.

---

# ✨ Features

### 📈 Behaviour-Based Fraud Detection

Detects anomalies relative to each user's historical spending pattern rather than relying on fixed global limits.

### ⚡ Real-Time Transaction Scoring

Every transaction is analysed immediately after creation with both statistical and machine learning models.

### 🧠 Hybrid Fraud Detection

Combines:

- Rule-based anomaly detection
- Neural network probability prediction

for improved decision making.

### 📊 Statistical Risk Analysis

Calculates:

- Amount Z-Score
- Receiver Novelty
- Time-of-Day Behaviour

using user-specific historical data.

### 🤖 Machine Learning Prediction

Uses a TensorFlow.js feed-forward neural network trained on synthetically generated transaction data.

### 🌐 Interactive Dashboard

Provides:

- User management
- Transaction history
- Fraud probability
- Rule engine score
- Real-time analytics

---

# 🏗 System Architecture

```
                   ┌────────────────────────┐
                   │   Web Dashboard        │
                   │ HTML • CSS • JS        │
                   └──────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │     Express API          │
                 │                          │
                 │ • Rule Engine            │
                 │ • TensorFlow.js Model    │
                 │ • REST APIs              │
                 └──────────┬───────────────┘
                            │
                            ▼
                  ┌─────────────────────────┐
                  │     MongoDB Atlas       │
                  └─────────────────────────┘
```

---

# 🧠 Fraud Detection Engine

Every transaction generates three independent anomaly signals.

### 💰 Amount Anomaly

Calculates how many standard deviations the transaction amount is from the sender's historical average.

Uses **Welford's Online Algorithm** for O(1) running mean and variance updates.

---

### 👤 Receiver Novelty

Flags unusually large transfers made to recipients the sender has never interacted with before.

---

### 🕒 Time-of-Day Behaviour

Tracks how frequently users transact during different hours of the day.

Instead of averaging timestamps (which fails around midnight), Signal stores hourly frequency buckets for each user.

---

### 📊 Hybrid Risk Score

Every transaction receives:

- Rule-Based Risk Score (0–100)
- Machine Learning Fraud Probability (0–1)

allowing both deterministic and predictive fraud analysis.

---

# 🤖 Machine Learning Pipeline

Since publicly available labelled UPI fraud datasets are not available, Signal trains its model using synthetically generated data.

### Pipeline

1. Generate realistic transaction histories.
2. Inject labelled fraudulent transactions.
3. Compute production-level fraud features.
4. Normalize features.
5. Train TensorFlow.js Neural Network.
6. Export trained model.
7. Load model into Express server.

### Neural Network Architecture

```
Input Features (3)

↓

Dense (8, ReLU)

↓

Dense (4, ReLU)

↓

Dense (1, Sigmoid)
```

### Evaluation Metrics

- Precision
- Recall
- F1 Score

instead of relying solely on accuracy, making the evaluation more appropriate for imbalanced fraud datasets.

---

# 🔌 REST API

| Method | Endpoint | Description |
|----------|------------------|--------------------------------|
| POST | `/users` | Create a new user |
| GET | `/users` | Retrieve all users |
| GET | `/users/:id` | Retrieve user statistics |
| POST | `/transactions` | Create and score a transaction |
| GET | `/transactions` | Retrieve all transactions |

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Machine Learning

- TensorFlow.js
- Neural Networks

## Frontend

- HTML5
- CSS3
- JavaScript

## Deployment

- Render

---

# 📂 Project Structure

```
Signal
│
├── src/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── scripts/
│   ├── ml/
│   └── utils/
│
├── public/
│
├── models/
│
├── app.js
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/itsh-29/UPI-Fraud-Detection.git
```

```bash
cd UPI-Fraud-Detection
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

```env
MONGO_URI=your_mongodb_connection_string
```

---

## Start Development Server

```bash
npm run dev
```

The application runs on:

```
http://localhost:5000
```

---

## Generate Demo Data

```bash
node src/scripts/runSeed.js
```

---

## Retrain the Neural Network

```bash
node src/scripts/generateTrainingData.js

node src/scripts/trainModel.js
```

---

# 📸 Screenshots

> Add screenshots of your application here.

Example:

```
Dashboard

Users

Transaction Monitoring

Fraud Detection

Analytics

Mobile View
```

---

# 📦 Packages Used

- express
- mongoose
- dotenv
- tensorflow.js
- cors
- nodemon

---

# 💡 Future Improvements

- 💳 Live Payment Gateway Integration
- 📊 Fraud Analytics Dashboard
- 📈 Model Performance Monitoring
- ⚡ Kafka Event Streaming
- 🐳 Docker Deployment
- ☁️ Kubernetes Support
- 🔔 Email & SMS Fraud Alerts
- 📱 Mobile Application
- 🌍 Multi-Currency Support
- 🔍 Isolation Forest & XGBoost Comparison

---

# 📚 Learning Outcomes

This project helped me gain hands-on experience with:

- Machine Learning Integration in Web Applications
- Behaviour-Based Fraud Detection
- Online Statistical Algorithms
- TensorFlow.js Model Training
- Feature Engineering
- Synthetic Dataset Generation
- REST API Development
- MongoDB Data Modeling
- Real-Time Risk Analysis
- Production Deployment

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome!

Feel free to fork the repository and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ishan Meduri**

- GitHub: https://github.com/itsh-29
- LinkedIn: *(Add your LinkedIn profile here)*

---

<div align="center">

⭐ If you found this project interesting, consider giving it a star!

</div>
