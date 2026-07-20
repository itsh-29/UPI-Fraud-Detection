const API_BASE = "";
const POLL_INTERVAL_MS = 8000;

let usersMap = new Map(); // id -> name
let lastTransactionCount = 0;

const els = {
  statusDot: document.getElementById("statusDot"),
  statusLabel: document.getElementById("statusLabel"),
  latestRisk: document.getElementById("latestRisk"),
  waveLine: document.getElementById("waveLine"),
  waveMarker: document.getElementById("waveMarker"),
  statTotal: document.getElementById("statTotal"),
  statFlagged: document.getElementById("statFlagged"),
  statAvgRisk: document.getElementById("statAvgRisk"),
  statModel: document.getElementById("statModel"),
  feedList: document.getElementById("feedList"),
  feedEmpty: document.getElementById("feedEmpty"),
  senderSelect: document.getElementById("senderSelect"),
  receiverSelect: document.getElementById("receiverSelect"),
  amountInput: document.getElementById("amountInput"),
  timeInput: document.getElementById("timeInput"),
  simulateForm: document.getElementById("simulateForm"),
  simulateBtn: document.getElementById("simulateBtn"),
  simulateResult: document.getElementById("simulateResult"),
  refreshBtn: document.getElementById("refreshBtn"),
  distLowBar: document.getElementById("distLowBar"),
  distMedBar: document.getElementById("distMedBar"),
  distHighBar: document.getElementById("distHighBar"),
  distLowCount: document.getElementById("distLowCount"),
  distMedCount: document.getElementById("distMedCount"),
  distHighCount: document.getElementById("distHighCount"),
};

/* ---------- helpers ---------- */

function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function shortId(id) {
  if (!id) return "—";
  const s = String(id);
  return s.slice(0, 4) + "…" + s.slice(-4);
}

function nameFor(id) {
  return usersMap.get(String(id)) || shortId(id);
}

function riskTier(riskScore) {
  if (riskScore >= 50) return "high";
  if (riskScore >= 20) return "medium";
  return "low";
}

function animateCount(el, target) {
  const start = Number(el.dataset.raw || 0);
  const duration = 500;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  el.dataset.raw = target;
  requestAnimationFrame(step);
}

/* ---------- status ---------- */

function setStatus(state) {
  if (state === "live") {
    els.statusDot.className = "status-dot live";
    els.statusLabel.textContent = "Live";
  } else if (state === "down") {
    els.statusDot.className = "status-dot down";
    els.statusLabel.textContent = "Connection lost — retrying";
  } else {
    els.statusDot.className = "status-dot";
    els.statusLabel.textContent = "Connecting";
  }
}

/* ---------- data loading ---------- */

async function loadUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to load users");
  const users = await res.json();

  usersMap = new Map(users.map((u) => [String(u._id), u.name]));

  const options = users
    .map((u) => `<option value="${u._id}">${u.name}</option>`)
    .join("");

  els.senderSelect.innerHTML = options;
  els.receiverSelect.innerHTML = options;
  if (users.length > 1) els.receiverSelect.selectedIndex = 1;
}

async function loadTransactions() {
  const res = await fetch(`${API_BASE}/transactions`);
  if (!res.ok) throw new Error("Failed to load transactions");
  const transactions = await res.json();
  return transactions;
}

/* ---------- rendering: feed ---------- */

function renderFeed(transactions) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (sorted.length === 0) {
    els.feedEmpty.style.display = "block";
    return;
  }
  els.feedEmpty.style.display = "none";

  els.feedList.innerHTML = "";
  sorted.slice(0, 60).forEach((t) => {
    const riskScore = t.anomalyScore ? t.anomalyScore.riskScore : 0;
    const flagged = t.anomalyScore ? t.anomalyScore.flagged : false;
    const tier = riskTier(riskScore);
    const modelPct =
      typeof t.modelFraudProbability === "number"
        ? Math.round(t.modelFraudProbability * 100) + "%"
        : "—";

    const row = document.createElement("div");
    row.className = "feed-row" + (flagged ? " flagged" : "");
    row.innerHTML = `
      <span class="cell-time">${formatTime(t.timestamp)}</span>
      <span class="cell-route">${nameFor(t.senderId)} → ${nameFor(t.receiverId)}</span>
      <span class="cell-amount">${formatINR(t.amount)}</span>
      <span class="risk-badge risk-${tier}">${riskScore}</span>
      <span class="cell-model">${modelPct}</span>
    `;
    els.feedList.appendChild(row);
  });
}

/* ---------- rendering: stats ---------- */

function renderStats(transactions) {
  const total = transactions.length;
  const flagged = transactions.filter((t) => t.anomalyScore && t.anomalyScore.flagged).length;
  const avgRisk =
    total === 0
      ? 0
      : Math.round(
          transactions.reduce((sum, t) => sum + (t.anomalyScore ? t.anomalyScore.riskScore : 0), 0) / total
        );
  const modelScores = transactions
    .map((t) => t.modelFraudProbability)
    .filter((v) => typeof v === "number" && !Number.isNaN(v));
  const avgModel =
    modelScores.length === 0
      ? 0
      : Math.round((modelScores.reduce((a, b) => a + b, 0) / modelScores.length) * 100);

  animateCount(els.statTotal, total);
  animateCount(els.statFlagged, flagged);
  animateCount(els.statAvgRisk, avgRisk);
  els.statModel.textContent = avgModel + "%";
}

/* ---------- rendering: distribution ---------- */

function renderDistribution(transactions) {
  let low = 0, med = 0, high = 0;
  transactions.forEach((t) => {
    const score = t.anomalyScore ? t.anomalyScore.riskScore : 0;
    const tier = riskTier(score);
    if (tier === "high") high++;
    else if (tier === "medium") med++;
    else low++;
  });

  const total = Math.max(low + med + high, 1);
  els.distLowBar.style.width = (low / total) * 100 + "%";
  els.distMedBar.style.width = (med / total) * 100 + "%";
  els.distHighBar.style.width = (high / total) * 100 + "%";
  els.distLowCount.textContent = low;
  els.distMedCount.textContent = med;
  els.distHighCount.textContent = high;
}

/* ---------- rendering: waveform ---------- */

function renderWaveform(transactions) {
  const sorted = [...transactions]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-30);

  if (sorted.length === 0) {
    els.waveLine.setAttribute("points", "");
    els.latestRisk.textContent = "—";
    return;
  }

  const w = 1000;
  const h = 140;
  const padTop = 12;
  const padBottom = 12;
  const usableH = h - padTop - padBottom;
  const step = sorted.length > 1 ? w / (sorted.length - 1) : 0;

  const points = sorted.map((t, i) => {
    const score = t.anomalyScore ? t.anomalyScore.riskScore : 0;
    const x = sorted.length === 1 ? w / 2 : i * step;
    const y = padTop + usableH - (Math.min(score, 100) / 100) * usableH;
    return `${x},${y}`;
  });

  els.waveLine.setAttribute("points", points.join(" "));

  const last = sorted[sorted.length - 1];
  const lastScore = last.anomalyScore ? last.anomalyScore.riskScore : 0;
  const lastFlagged = last.anomalyScore ? last.anomalyScore.flagged : false;
  const [lastX, lastY] = points[points.length - 1].split(",");

  els.waveMarker.setAttribute("cx", lastX);
  els.waveMarker.setAttribute("cy", lastY);
  els.waveMarker.classList.toggle("alert", lastFlagged);
  els.latestRisk.textContent = lastScore;
}

/* ---------- simulate form ---------- */

function showSimulateResult(data) {
  const { anomalyScore, modelFraudProbability, transaction } = data;
  const flagged = anomalyScore.flagged;
  const modelPct = Math.round((modelFraudProbability || 0) * 100);

  const reasonsHtml = anomalyScore.reasons.length
    ? `<div class="result-reasons">${anomalyScore.reasons
        .map((r) => `<span class="reason-chip">${r}</span>`)
        .join("")}</div>`
    : "";

  els.simulateResult.innerHTML = `
    <div class="result-card ${flagged ? "flagged" : "clear"}">
      <p class="result-title">${flagged ? "Flagged" : "Cleared"} · ${formatINR(transaction.amount)}</p>
      <p class="result-score">${anomalyScore.riskScore}/100 <span style="font-size:13px; color: var(--text-dim); font-weight:500;">· model ${modelPct}%</span></p>
      ${reasonsHtml}
    </div>
  `;
  els.simulateResult.classList.add("show");
}

async function handleSimulateSubmit(e) {
  e.preventDefault();
  els.simulateBtn.disabled = true;
  els.simulateBtn.querySelector("span").textContent = "Scoring…";

  try {
    const body = {
      senderId: els.senderSelect.value,
      receiverId: els.receiverSelect.value,
      amount: Number(els.amountInput.value),
      timestamp: new Date(els.timeInput.value).toISOString(),
      note: "simulated from dashboard",
    };

    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();
    showSimulateResult(data);
    await refreshAll();
  } catch (err) {
    els.simulateResult.innerHTML = `<div class="result-card flagged"><p class="result-title">Error</p><p style="font-size:13px;">Could not reach the detection engine. Check the server is running.</p></div>`;
    els.simulateResult.classList.add("show");
  } finally {
    els.simulateBtn.disabled = false;
    els.simulateBtn.querySelector("span").textContent = "Run Detection";
  }
}

/* ---------- orchestration ---------- */

async function refreshAll() {
  try {
    const transactions = await loadTransactions();
    renderFeed(transactions);
    renderStats(transactions);
    renderDistribution(transactions);
    renderWaveform(transactions);
    setStatus("live");
  } catch (err) {
    setStatus("down");
  }
}

function setDefaultTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  els.timeInput.value = now.toISOString().slice(0, 16);
}

async function init() {
  setDefaultTime();
  setStatus("connecting");
  try {
    await loadUsers();
  } catch (err) {
    // users endpoint may not exist yet - dashboard still shows feed
  }
  await refreshAll();
  setInterval(refreshAll, POLL_INTERVAL_MS);
}

els.simulateForm.addEventListener("submit", handleSimulateSubmit);
els.refreshBtn.addEventListener("click", refreshAll);

init();