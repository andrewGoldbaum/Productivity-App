// ---- Task definitions (fixed defaults supplied by the user) ----
const TASKS = [
  { id: "getting-ready", name: "Fully Getting Ready", urgency: 0.73, interval: 1 },
  { id: "haircuts", name: "Haircuts", urgency: 0.35, interval: 28 },
  { id: "shopping", name: "Food / Toiletry / Other Supplies Shopping", urgency: 0.63, interval: 5 },
  { id: "medication", name: "Acquiring Medication", urgency: 0.9, interval: 20, isMedication: true },
  { id: "house-cleaning", name: "House Cleaning", urgency: 0.45, interval: 7 },
  { id: "laundry", name: "Laundry", urgency: 0.63, interval: 7 },
  { id: "fitting-clothes", name: "Making Sure I Have Fitting Clothes", urgency: 0.25, interval: 28 },
  { id: "email", name: "Checking Email", urgency: 0.8, interval: 1 },
  { id: "budgeting", name: "Budgeting", urgency: 0.5, interval: 14 },
];

const STORAGE_KEY = "life-logistics-tracker-state-v1";

// ---- Date helpers (local-date-only, no timezone drift) ----
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(dateStrEarlier, dateStrLater) {
  const [y1, m1, d1] = dateStrEarlier.split("-").map(Number);
  const [y2, m2, d2] = dateStrLater.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

function formatDateStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ---- State persistence ----
function loadState() {
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    stored = {};
  }
  const state = {};
  for (const task of TASKS) {
    const existing = stored[task.id];
    state[task.id] = {
      lastDone: existing && existing.lastDone ? existing.lastDone : todayStr(),
      doubled: existing && existing.doubled ? true : false,
    };
  }
  return state;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
saveState(state); // persist first-run defaults so a reload doesn't drift the dates

// ---- Derived values ----
function computeDerived(task, taskState) {
  const daysElapsed = Math.max(0, daysBetween(taskState.lastDone, todayStr()));
  const baseInterval = task.interval;
  const currentInterval = taskState.doubled ? baseInterval * 2 : baseInterval;
  const weight = (task.urgency * daysElapsed) / currentInterval;
  const overdue = daysElapsed >= currentInterval;
  return { daysElapsed, currentInterval, baseInterval, weight, overdue };
}

function levelFor(daysElapsed, currentInterval) {
  if (currentInterval <= 0) return "green";
  const ratio = daysElapsed / currentInterval;
  if (ratio >= 1) return "red";
  if (ratio >= 0.7) return "yellow";
  return "green";
}

// ---- Modal (used to confirm medication denominator doubling) ----
const modalOverlay = document.getElementById("modal-overlay");
const modalMessage = document.getElementById("modal-message");
const modalYes = document.getElementById("modal-yes");
const modalNo = document.getElementById("modal-no");

function showConfirm(message) {
  return new Promise((resolve) => {
    modalMessage.textContent = message;
    modalOverlay.classList.remove("hidden");

    function cleanup(result) {
      modalOverlay.classList.add("hidden");
      modalYes.removeEventListener("click", onYes);
      modalNo.removeEventListener("click", onNo);
      resolve(result);
    }
    function onYes() {
      cleanup(true);
    }
    function onNo() {
      cleanup(false);
    }
    modalYes.addEventListener("click", onYes);
    modalNo.addEventListener("click", onNo);
  });
}

// ---- Actions ----
function markDone(taskId) {
  state[taskId].lastDone = todayStr();
  state[taskId].doubled = false;
  saveState(state);
  render();
}

async function markPartial(taskId) {
  const task = TASKS.find((t) => t.id === taskId);

  if (task.isMedication) {
    const wasImportant = await showConfirm(
      "Was the medication you just got the one that was actually running low (the consequential one)? " +
        "Only confirm \"Yes\" if it was — this determines whether the app can safely wait longer before flagging this as urgent again."
    );
    state[taskId].lastDone = todayStr();
    state[taskId].doubled = wasImportant;
  } else {
    state[taskId].lastDone = todayStr();
    state[taskId].doubled = true;
  }

  saveState(state);
  render();
}

function updateLastDone(taskId, newDateStr) {
  if (!newDateStr) return;
  state[taskId].lastDone = newDateStr;
  saveState(state);
  render();
}

// ---- Rendering ----
const listEl = document.getElementById("task-list");
const summaryEl = document.getElementById("summary");
const sortSelect = document.getElementById("sort-select");

function getSortedTasks() {
  const sortBy = sortSelect.value;
  const enriched = TASKS.map((task) => {
    const derived = computeDerived(task, state[task.id]);
    return { task, derived };
  });

  enriched.sort((a, b) => {
    if (sortBy === "weight") return b.derived.weight - a.derived.weight;
    if (sortBy === "daysElapsed") return b.derived.daysElapsed - a.derived.daysElapsed;
    return a.task.name.localeCompare(b.task.name);
  });

  return enriched;
}

function render() {
  const enriched = getSortedTasks();
  const overdueCount = enriched.filter((e) => e.derived.overdue).length;
  summaryEl.textContent =
    overdueCount === 0
      ? "Nothing has hit its interval limit yet."
      : `${overdueCount} task${overdueCount === 1 ? "" : "s"} at or past its interval limit.`;

  listEl.innerHTML = "";

  for (const { task, derived } of enriched) {
    const taskState = state[task.id];
    const level = levelFor(derived.daysElapsed, derived.currentInterval);

    const card = document.createElement("div");
    card.className = `task-card level-${level}`;

    card.innerHTML = `
      <div class="task-header">
        <h2 class="task-name">${task.name}</h2>
        <span class="weight-badge">${derived.weight.toFixed(2)}</span>
      </div>
      <div class="task-meta">
        <div class="meta-item">
          <span class="label">Days since done</span>
          <span class="value">${derived.daysElapsed}</span>
        </div>
        <div class="meta-item">
          <span class="label">Interval</span>
          <span class="value">
            ${derived.currentInterval} day${derived.currentInterval === 1 ? "" : "s"}
            ${taskState.doubled ? `<span class="doubled-tag">(doubled from ${derived.baseInterval})</span>` : ""}
          </span>
        </div>
        ${derived.overdue ? `<div class="overdue-flag">&#9888; At/past interval limit</div>` : ""}
      </div>
      <div class="task-footer">
        <span class="last-done">
          Last done: ${formatDateStr(taskState.lastDone)}
          <button class="edit-date-btn" title="Edit last-done date">&#9998;</button>
          <input type="date" class="date-input hidden-input" value="${taskState.lastDone}" style="display:none" />
        </span>
        <div class="actions">
          <button class="btn partial">Partial</button>
          <button class="btn primary done">Done</button>
        </div>
      </div>
    `;

    const doneBtn = card.querySelector(".done");
    const partialBtn = card.querySelector(".partial");
    const editBtn = card.querySelector(".edit-date-btn");
    const dateInput = card.querySelector(".date-input");

    doneBtn.addEventListener("click", () => markDone(task.id));
    partialBtn.addEventListener("click", () => markPartial(task.id));

    editBtn.addEventListener("click", () => {
      dateInput.style.display = dateInput.style.display === "none" ? "inline-block" : "none";
      if (dateInput.style.display !== "none") dateInput.focus();
    });

    dateInput.addEventListener("change", () => {
      updateLastDone(task.id, dateInput.value);
    });

    listEl.appendChild(card);
  }
}

sortSelect.addEventListener("change", render);

// Re-render when the day rolls over while the tab stays open.
let lastRenderedDay = todayStr();
setInterval(() => {
  const now = todayStr();
  if (now !== lastRenderedDay) {
    lastRenderedDay = now;
    render();
  }
}, 60 * 1000);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") render();
});

render();
