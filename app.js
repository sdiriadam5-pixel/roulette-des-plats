const dishes = [
  "Pâtes",
  "Lasagnes",
  "Couscous",
  "Nwasar",
  "Dwayda",
  "7lelem",
  "Mo9li",
  "Tortilla",
  "Fast food",
  "Mar9a",
  "Kafteji",
  "Mloukhia",
  "Kamounia",
  "Sibia",
  "3ejja",
  "Chorba w brike",
  "Chapati",
  "Mlewi",
  "Pizza",
  "Riz",
  "Makloub",
  "Baguette farcie",
  "Fricassée"
];

const slicePalette = [
  { background: "#CE6245", text: "#FFF9EE" },
  { background: "#EDC777", text: "#26483F" },
  { background: "#2F6B60", text: "#FFF9EE" },
  { background: "#F3E5C9", text: "#26483F" },
  { background: "#8FA184", text: "#193F39" }
];

const STORAGE_KEY = "roue-des-saveurs-v1";
const TAU = Math.PI * 2;
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const wheelPanel = document.getElementById("wheel-panel");
const spinButton = document.getElementById("spin-button");
const spinButtonLabel = document.getElementById("spin-button-label");
const centerSpinButton = document.getElementById("center-spin");
const resultContent = document.getElementById("result-content");
const resultEyebrow = document.getElementById("result-eyebrow");
const statusText = document.getElementById("status-text");
const noRepeatInput = document.getElementById("no-repeat");
const remainingText = document.getElementById("remaining-text");
const resetCycleButton = document.getElementById("reset-cycle");
const dishList = document.getElementById("dish-list");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");
const confettiContainer = document.getElementById("confetti");
const toast = document.getElementById("toast");

let rotation = 0;
let spinning = false;
let hasResult = false;
let history = [];
let noRepeat = false;
let remaining = dishes.map((_, index) => index);
let toastTimer;

loadState();
noRepeatInput.checked = noRepeat;
renderDishList();
renderHistory();
updateOptions();
drawWheel();

spinButton.addEventListener("click", spinWheel);
centerSpinButton.addEventListener("click", spinWheel);

noRepeatInput.addEventListener("change", () => {
  noRepeat = noRepeatInput.checked;
  remaining = dishes.map((_, index) => index);
  saveState();
  updateOptions();
  showToast(noRepeat
    ? "Mode sans répétition activé : nouveau tour complet."
    : "Tous les plats participent à nouveau à chaque tirage.");
});

resetCycleButton.addEventListener("click", () => {
  remaining = dishes.map((_, index) => index);
  saveState();
  updateOptions();
  showToast("Le compteur est remis à zéro : les 23 plats sont disponibles.");
});

clearHistoryButton.addEventListener("click", () => {
  history = [];
  saveState();
  renderHistory();
  renderDishList();
  showToast("Historique effacé.");
});

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat || spinning) return;
  const activeTag = document.activeElement?.tagName;
  if (["INPUT", "BUTTON", "TEXTAREA", "SELECT"].includes(activeTag)) return;
  event.preventDefault();
  spinWheel();
});

function spinWheel() {
  if (spinning) return;

  if (noRepeat && remaining.length === 0) {
    remaining = dishes.map((_, index) => index);
    showToast("Tour complet ! Les 23 plats sont de nouveau dans la roue.");
  }

  const pool = noRepeat ? remaining : dishes.map((_, index) => index);
  const selectedIndex = pool[secureRandomIndex(pool.length)];

  if (noRepeat) {
    remaining = remaining.filter(index => index !== selectedIndex);
  }

  spinning = true;
  setSpinningState(true);
  saveState();
  updateOptions();

  resultEyebrow.textContent = "LA ROUE RÉFLÉCHIT…";
  resultContent.innerHTML = `
    <div class="result-loading">
      <div class="loading-wheel" aria-hidden="true"></div>
      <h2>Ça tourne…</h2>
      <p>Les saveurs se disputent la première place.</p>
    </div>`;

  const segmentAngle = TAU / dishes.length;
  const jitter = (Math.random() - 0.5) * segmentAngle * 0.55;
  const targetRotation = -selectedIndex * segmentAngle + jitter;
  const startRotation = rotation;
  const currentNormalized = positiveModulo(startRotation, TAU);
  const alignment = positiveModulo(targetRotation - currentNormalized, TAU);
  const fullTurns = 6 + Math.floor(Math.random() * 3);
  const endRotation = startRotation + fullTurns * TAU + alignment;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 450 : 5200;
  const startedAt = performance.now();

  function animate(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    rotation = startRotation + (endRotation - startRotation) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = positiveModulo(endRotation, TAU);
      drawWheel();
      finishSpin(selectedIndex);
    }
  }

  requestAnimationFrame(animate);
}

function finishSpin(selectedIndex) {
  spinning = false;
  hasResult = true;
  setSpinningState(false);
  updateOptions();

  const dish = dishes[selectedIndex];
  resultEyebrow.textContent = "LE VERDICT EST TOMBÉ";
  resultContent.innerHTML = `
    <div class="result-winner">
      <span class="winner-badge">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        CE SOIR, C’EST
      </span>
      <h2>${escapeHTML(dish)}</h2>
      <p>La décision est prise. Plus qu’à passer en cuisine — bon appétit&nbsp;!</p>
    </div>`;

  spinButtonLabel.textContent = "Relancer la roue";
  statusText.textContent = "Le plat est choisi !";

  history.unshift({ index: selectedIndex, timestamp: Date.now() });
  history = history.slice(0, 8);
  saveState();
  renderHistory();
  renderDishList();
  launchConfetti();
}

function setSpinningState(isSpinning) {
  wheelPanel.classList.toggle("is-spinning", isSpinning);
  spinButton.classList.toggle("is-spinning", isSpinning);
  spinButton.disabled = isSpinning;
  centerSpinButton.disabled = isSpinning;
  noRepeatInput.disabled = isSpinning;
  spinButtonLabel.textContent = isSpinning ? "Ça tourne…" : (hasResult ? "Relancer la roue" : "Faire tourner la roue");
  statusText.textContent = isSpinning ? "La roue tourne…" : (hasResult ? "Le plat est choisi !" : "La roue est prête");
}

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = 323;
  const segmentAngle = TAU / dishes.length;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  ctx.beginPath();
  ctx.arc(0, 0, 334, 0, TAU);
  ctx.fillStyle = "#FFFAF0";
  ctx.fill();

  ctx.save();
  ctx.rotate(rotation);

  for (let index = 0; index < dishes.length; index++) {
    const startAngle = -Math.PI / 2 - segmentAngle / 2 + index * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const middleAngle = startAngle + segmentAngle / 2;
    const palette = slicePalette[index % slicePalette.length];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = palette.background;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 250, 240, 0.65)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.save();
    ctx.rotate(middleAngle);
    ctx.fillStyle = palette.text;
    ctx.font = '600 16px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = "middle";

    // Le texte suit les rayons et reste lisible des deux côtés de la roue.
    if (Math.cos(middleAngle) < 0) {
      ctx.rotate(Math.PI);
      ctx.textAlign = "left";
      ctx.fillText(dishes[index], -(radius - 29), 1, 150);
    } else {
      ctx.textAlign = "right";
      ctx.fillText(dishes[index], radius - 29, 1, 150);
    }
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 327, 0, TAU);
  ctx.strokeStyle = "#FFF9EE";
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 313, 0, TAU);
  ctx.strokeStyle = "rgba(255, 249, 238, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let index = 0; index < dishes.length; index++) {
    const angle = -Math.PI / 2 - segmentAngle / 2 + index * segmentAngle;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 326, Math.sin(angle) * 326, 3.1, 0, TAU);
    ctx.fillStyle = "#D8B778";
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, TAU);
  ctx.fillStyle = "#FFF9EE";
  ctx.fill();
  ctx.strokeStyle = "rgba(25, 63, 57, 0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

function renderDishList() {
  const lastDrawnIndex = history[0]?.index;
  dishList.replaceChildren();

  dishes.forEach((dish, index) => {
    const item = document.createElement("div");
    item.className = "dish-item" + (index === lastDrawnIndex ? " last-drawn" : "");
    if (index === lastDrawnIndex) item.title = "Dernier plat tiré";

    const number = document.createElement("span");
    number.className = "dish-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const name = document.createElement("span");
    name.className = "dish-name";
    name.textContent = dish;
    name.title = dish;

    item.append(number, name);
    dishList.appendChild(item);
  });
}

function renderHistory() {
  historyList.replaceChildren();
  clearHistoryButton.hidden = history.length === 0;

  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.innerHTML = `
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 9v7l4 2M7 6 4 9l3 3M5 9a11 11 0 1 1 1 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <strong>Aucun tirage pour le moment</strong>
      <span>Les plats choisis par la roue apparaîtront ici.</span>`;
    historyList.appendChild(empty);
    return;
  }

  history.slice(0, 5).forEach((entry, position) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const icon = document.createElement("span");
    icon.className = "history-icon";
    icon.innerHTML = position === 0
      ? '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 11 2 2 5-5M3 5l6-2 6 2v4c0 4-2.3 6.7-6 8-3.7-1.3-6-4-6-8V5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 3v6M4 3v4a2 2 0 0 0 4 0V3M6 9v8M14 3c-2 1.4-3 3.4-3 5.8 0 1.5.8 2.2 2.3 2.2V17M14 3v14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const info = document.createElement("span");
    info.className = "history-info";
    const name = document.createElement("strong");
    name.textContent = dishes[entry.index];
    const detail = document.createElement("span");
    detail.textContent = position === 0 ? "Dernier plat tiré" : formatDay(entry.timestamp);
    info.append(name, detail);

    const time = document.createElement("span");
    time.className = "history-time";
    time.textContent = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(entry.timestamp));

    item.append(icon, info, time);
    historyList.appendChild(item);
  });
}

function updateOptions() {
  if (!noRepeat) {
    remainingText.textContent = "Tous les plats participent";
  } else if (remaining.length === 0) {
    remainingText.textContent = "Tour complet · relance pour recommencer";
  } else {
    remainingText.textContent = `${remaining.length} plat${remaining.length > 1 ? "s" : ""} encore disponible${remaining.length > 1 ? "s" : ""}`;
  }

  resetCycleButton.disabled = spinning || !noRepeat || remaining.length === dishes.length;
}

function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confettiContainer.replaceChildren();
  const colors = ["#CE6245", "#EDC777", "#2F6B60", "#F3E5C9", "#8FA184"];

  for (let index = 0; index < 42; index++) {
    const piece = document.createElement("span");
    const angle = Math.random() * TAU;
    const distance = 140 + Math.random() * 230;
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-x", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--confetti-y", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--confetti-r", `${Math.floor(Math.random() * 720 - 360)}deg`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.12}s`);
    piece.style.width = `${5 + Math.random() * 5}px`;
    piece.style.height = `${8 + Math.random() * 7}px`;
    confettiContainer.appendChild(piece);
  }

  window.setTimeout(() => confettiContainer.replaceChildren(), 1900);
}

function secureRandomIndex(max) {
  if (max <= 1) return 0;

  if (window.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const values = new Uint32Array(1);
    do {
      window.crypto.getRandomValues(values);
    } while (values[0] >= limit);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return;

    noRepeat = saved.noRepeat === true;

    if (Array.isArray(saved.history)) {
      history = saved.history
        .filter(entry => Number.isInteger(entry.index) && entry.index >= 0 && entry.index < dishes.length && Number.isFinite(entry.timestamp))
        .slice(0, 8);
    }

    if (Array.isArray(saved.remaining)) {
      const validRemaining = [...new Set(saved.remaining)]
        .filter(index => Number.isInteger(index) && index >= 0 && index < dishes.length);
      remaining = validRemaining;
    }

    if (!noRepeat) remaining = dishes.map((_, index) => index);
  } catch {
    // Un stockage indisponible ou corrompu ne doit jamais empêcher la roulette de fonctionner.
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ noRepeat, remaining, history }));
  } catch {
    // La roulette reste utilisable même si le navigateur bloque le stockage local.
  }
}

function formatDay(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear();

  if (isToday) return "Aujourd’hui";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3000);
}

// Une fois hébergée en HTTPS, l’application peut être installée et utilisée hors ligne.
if ("serviceWorker" in navigator && (
  location.protocol === "https:"
  || location.hostname === "localhost"
  || location.hostname === "127.0.0.1"
)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // L’application reste pleinement utilisable en ligne si l’installation hors ligne échoue.
    });
  });
}
