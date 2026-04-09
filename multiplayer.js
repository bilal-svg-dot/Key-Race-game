// ============================================================
//  KEY RACE — ONLINE MULTIPLAYER  (Firebase Realtime Database)
//  File: multiplayer.js
//  ➜ Add this ONE line just before </body> in index.html:
//      <script type="module" src="multiplayer.js"></script>
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  update,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ─────────────────────────────────────────────────────────────
//  🔥 PASTE YOUR FIREBASE CONFIG HERE
//  Firebase Console → Project Settings → Your Apps → Web (</>)
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
// ─────────────────────────────────────────────────────────────

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ══════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════
const mp = {
  roomId:       null,
  playerId:     null,
  playerName:   "Player",
  isHost:       false,
  gameActive:   false,   // false | "countdown" | true
  score:        0,
  wordIndex:    0,
  correctWords: 0,
  wordsTyped:   0,
  streak:       0,
  bestStreak:   0,
  timeLeft:     60,
  startTime:    null,
  roomWords:    [],
  difficulty:   "medium",
  category:     "general",
  _roomUnsub:   null,
  _gameTimer:   null,
};

// ══════════════════════════════════════════════════════════════
//  HELPERS — read values saved by the existing script.js
// ══════════════════════════════════════════════════════════════
function getStoredName() {
  return (
    localStorage.getItem("keyRacePlayerName") ||
    document.getElementById("currentPlayerName")?.textContent ||
    "Player"
  );
}
function getStoredDifficulty() {
  return localStorage.getItem("keyRaceDifficulty") || "medium";
}
function getStoredCategory() {
  return localStorage.getItem("keyRaceCategory") || "general";
}
function genId(len = 6) {
  return Math.random().toString(36).substr(2, len).toUpperCase();
}

// Reuse the game's own words.js word banks
async function getWordBank() {
  try {
    const mod     = await import("./words.js");
    const cat     = mp.category;
    const bank    = mod.wordBanks?.[cat] || mod.wordBanks?.general || [];
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    // Triple the list so a race never runs dry
    return [...shuffled, ...shuffled, ...shuffled];
  } catch {
    return [
      "sprint","swift","laser","blaze","turbo","storm","flash","rapid",
      "nerve","chaos","pixel","viral","quest","craft","ninja","cyber",
      "surge","brave","vivid","sharp","logic","power","focus","lucky",
      "magic","pulse","radar","boost","speed","flame","spark","drift",
    ].sort(() => Math.random() - 0.5);
  }
}

function getDifficultyTime() {
  return mp.difficulty === "easy" ? 30 : mp.difficulty === "hard" ? 15 : 20;
}
function calcPoints() {
  return mp.difficulty === "hard" ? 15 : mp.difficulty === "easy" ? 8 : 10;
}

// ══════════════════════════════════════════════════════════════
//  SCREEN MANAGEMENT  (compatible with existing hideAllScreens)
// ══════════════════════════════════════════════════════════════
function hideAll() {
  [
    "mainMenu","singlePlayerScreen","gameOverScreen","howToPlayScreen",
    "mpLobbyScreen","mpGameScreen","mpResultScreen",
  ].forEach((id) => document.getElementById(id)?.classList.add("hide"));
}
function show(id) {
  hideAll();
  document.getElementById(id)?.classList.remove("hide");
}

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
function toast(msg, type = "info") {
  let el = document.getElementById("mp-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "mp-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className   = `mp-toast mp-toast-${type} mp-toast-visible`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("mp-toast-visible"), 3000);
}

// ══════════════════════════════════════════════════════════════
//  CSS
// ══════════════════════════════════════════════════════════════
function injectCSS() {
  const s = document.createElement("style");
  s.textContent = `
    /* ── Toast ──────────────────────────────────────────────── */
    #mp-toast {
      position:fixed; bottom:24px; left:50%;
      transform:translateX(-50%) translateY(60px);
      background:#1e293b; color:#f1f5f9;
      padding:12px 28px; border-radius:12px;
      font-size:14px; font-weight:600;
      z-index:9999; transition:transform .3s ease;
      box-shadow:0 4px 24px rgba(0,0,0,.5);
      white-space:nowrap; pointer-events:none;
    }
    #mp-toast.mp-toast-visible { transform:translateX(-50%) translateY(0); }
    #mp-toast.mp-toast-error   { background:#7f1d1d; }
    #mp-toast.mp-toast-success { background:#14532d; }

    /* ── Shared screen wrapper ───────────────────────────────── */
    #mpLobbyScreen, #mpGameScreen, #mpResultScreen {
      min-height:100vh; display:flex;
      align-items:center; justify-content:center;
      background:var(--bg-color,#0f172a);
    }

    /* ── Base card ───────────────────────────────────────────── */
    .mp-card {
      background:var(--card-bg,#1e293b); border-radius:20px;
      padding:36px; max-width:520px; width:92%;
      box-shadow:0 8px 40px rgba(0,0,0,.5); text-align:center;
    }
    .mp-card h2  { color:#38bdf8; font-size:1.8rem; margin:0 0 6px; }
    .mp-card > p { color:#94a3b8; margin:0 0 28px; font-size:15px; }

    /* ── Tabs ────────────────────────────────────────────────── */
    .mp-tabs { display:flex; gap:8px; margin-bottom:22px; }
    .mp-tab {
      flex:1; padding:10px; border:2px solid #334155; border-radius:10px;
      background:transparent; color:#94a3b8; cursor:pointer;
      font-weight:700; font-size:14px; transition:all .2s;
    }
    .mp-tab.active { border-color:#38bdf8; color:#38bdf8; background:#0f2942; }
    .mp-panel        { display:none; }
    .mp-panel.active { display:block; }

    /* ── Form controls ───────────────────────────────────────── */
    .mp-input {
      width:100%; padding:13px 16px; border-radius:10px;
      border:2px solid #334155; background:#0f172a; color:#f1f5f9;
      font-size:16px; margin-bottom:12px; box-sizing:border-box;
      transition:border-color .2s;
    }
    .mp-input:focus { outline:none; border-color:#38bdf8; }
    .mp-btn {
      width:100%; padding:13px; border:none; border-radius:10px;
      font-size:16px; font-weight:700; cursor:pointer;
      transition:opacity .2s; margin-top:6px;
    }
    .mp-btn:hover    { opacity:.85; }
    .mp-btn-primary  { background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; }
    .mp-btn-secondary{ background:#334155; color:#f1f5f9; }
    .mp-btn:disabled { opacity:.35; cursor:not-allowed; }

    /* ── Room code box ───────────────────────────────────────── */
    #mp-room-code-box {
      font-size:2.6rem; font-weight:900; letter-spacing:.35em;
      color:#38bdf8; background:#0f172a; border-radius:12px;
      padding:16px; margin:16px 0; cursor:pointer; user-select:all;
      border:2px dashed #334155; transition:border-color .2s;
    }
    #mp-room-code-box:hover { border-color:#38bdf8; }

    /* ── Lobby player list ───────────────────────────────────── */
    .mp-player-row {
      display:flex; align-items:center; gap:10px;
      padding:10px 14px; background:#0f172a; border-radius:10px;
      margin-bottom:8px; color:#e2e8f0; font-weight:600; font-size:15px;
      text-align:left;
    }
    .mp-dot   { width:8px; height:8px; border-radius:50%; background:#22c55e; flex-shrink:0; }
    .mp-waiting-note { color:#64748b; font-style:italic; font-size:13px; margin:8px 0 4px; }

    /* ── Countdown ───────────────────────────────────────────── */
    #mp-countdown-wrap {
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:16px; min-height:220px;
    }
    .mp-cd-num {
      font-size:6rem; font-weight:900; color:#38bdf8;
      animation:mp-pop .4s ease;
    }
    .mp-cd-label { color:#94a3b8; font-size:1.1rem; font-weight:600; }
    @keyframes mp-pop { from{transform:scale(1.7)} to{transform:scale(1)} }

    /* ── Race card ───────────────────────────────────────────── */
    .mp-game-card {
      background:var(--card-bg,#1e293b); border-radius:20px;
      padding:28px; max-width:700px; width:96%;
      box-shadow:0 8px 40px rgba(0,0,0,.5);
    }
    .mp-race-header {
      display:flex; justify-content:space-between;
      align-items:center; margin-bottom:14px;
    }
    .mp-live-badge {
      background:#ef4444; color:#fff; font-size:11px; font-weight:800;
      padding:4px 10px; border-radius:20px; letter-spacing:.08em;
      animation:mp-blink 1.2s infinite;
    }
    @keyframes mp-blink { 0%,100%{opacity:1} 50%{opacity:.4} }
    .mp-timer-pill {
      background:#0f172a; border-radius:10px; padding:6px 18px;
      color:#38bdf8; font-weight:800; font-size:1.1rem; transition:color .3s;
    }
    .mp-timer-pill.danger { color:#ef4444; }

    /* Timer bar */
    .mp-bar-wrap {
      background:#0f172a; border-radius:8px; height:8px;
      overflow:hidden; margin-bottom:18px;
    }
    .mp-bar {
      height:100%; border-radius:8px;
      background:linear-gradient(90deg,#38bdf8,#6366f1);
      transition:width .8s linear, background .4s;
    }
    .mp-bar.danger { background:linear-gradient(90deg,#f97316,#ef4444); }

    /* ── Scoreboard ──────────────────────────────────────────── */
    .mp-scoreboard {
      display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;
    }
    .mp-sc-card {
      flex:1; min-width:130px; background:#0f172a; border-radius:12px;
      padding:12px 14px; border:2px solid #1e3a5f; transition:border-color .3s;
    }
    .mp-sc-card.sc-me     { border-color:#38bdf8; }
    .mp-sc-card.sc-leader { border-color:#fbbf24; }
    .mp-sc-name  { font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px; }
    .mp-sc-score { font-size:1.7rem; font-weight:900; color:#f1f5f9; line-height:1; }
    .mp-sc-meta  { font-size:11px; color:#94a3b8; margin-top:4px; }

    /* ── Word zone ───────────────────────────────────────────── */
    .mp-word-zone { text-align:center; margin:14px 0 18px; }
    .mp-word {
      font-size:2.8rem; font-weight:900; letter-spacing:.06em;
      color:#f1f5f9; display:block; margin-bottom:8px; transition:color .15s;
    }
    .mp-word.mp-correct { color:#22c55e; }
    .mp-word.mp-wrong   { color:#ef4444; animation:mp-shake .25s ease; }
    @keyframes mp-shake {
      0%,100%{transform:translateX(0)}
      25%{transform:translateX(-7px)} 75%{transform:translateX(7px)}
    }
    .mp-hint { color:#475569; font-size:13px; }
    kbd {
      background:#334155; color:#94a3b8; padding:2px 6px;
      border-radius:5px; font-size:12px; font-family:monospace;
    }

    /* ── Game input ──────────────────────────────────────────── */
    .mp-game-input {
      width:100%; padding:14px 18px; border-radius:12px;
      border:2px solid #334155; background:#0f172a; color:#f1f5f9;
      font-size:1.1rem; box-sizing:border-box; transition:border-color .2s;
    }
    .mp-game-input:focus       { outline:none; border-color:#38bdf8; }
    .mp-game-input.mp-wrong-in { border-color:#ef4444; }
    .mp-game-input:disabled    { opacity:.4; }

    /* ── Results podium ──────────────────────────────────────── */
    .mp-podium-row {
      display:flex; align-items:center; gap:12px;
      padding:12px 18px; background:#0f172a; border-radius:12px;
      margin-bottom:8px; color:#e2e8f0; font-weight:700; font-size:15px;
    }
    .mp-podium-row:nth-child(1){ border:2px solid #fbbf24; }
    .mp-podium-row:nth-child(2){ border:2px solid #94a3b8; }
    .mp-podium-row:nth-child(3){ border:2px solid #b45309; }
    .mp-medal { font-size:1.4rem; flex-shrink:0; }
    .mp-pod-stats { margin-left:auto; color:#38bdf8; font-size:13px; font-weight:600; }
    .mp-you {
      background:#1e3a5f; color:#38bdf8; font-size:11px;
      font-weight:800; padding:2px 8px; border-radius:20px; margin-left:6px;
    }
  `;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════
//  HTML
// ══════════════════════════════════════════════════════════════
function injectHTML() {
  // ── Lobby ──────────────────────────────────────────────────
  document.body.insertAdjacentHTML("beforeend", `
    <div id="mpLobbyScreen" class="hide">
      <div class="mp-card">
        <h2>🌐 Online Multiplayer</h2>
        <p>Race against friends in real time — same words, same clock</p>

        <div class="mp-tabs">
          <button class="mp-tab active" data-tab="create">Create Room</button>
          <button class="mp-tab"        data-tab="join">Join Room</button>
        </div>

        <!-- Create panel -->
        <div class="mp-panel active" id="mp-create-panel">
          <button class="mp-btn mp-btn-primary" id="mp-create-btn">⚡ Create Room</button>

          <div id="mp-created-info" style="display:none;margin-top:20px">
            <p style="color:#94a3b8;font-size:13px;margin-bottom:4px">
              Share this code — tap to copy 📋
            </p>
            <div id="mp-room-code-box">——</div>
            <div id="mp-players-list" style="margin-top:10px"></div>
            <p class="mp-waiting-note" id="mp-waiting-note">Waiting for players…</p>
            <button class="mp-btn mp-btn-primary" id="mp-start-btn" disabled>
              🚀 Start Race
            </button>
          </div>
        </div>

        <!-- Join panel -->
        <div class="mp-panel" id="mp-join-panel">
          <input id="mp-join-code" class="mp-input"
            placeholder="Room code (e.g. A3F7K2)" maxlength="6"
            style="text-transform:uppercase;letter-spacing:.25em;
                   text-align:center;font-size:1.5rem;font-weight:900">
          <button class="mp-btn mp-btn-primary" id="mp-join-btn">🔗 Join Room</button>
        </div>

        <button class="mp-btn mp-btn-secondary" id="mp-back-btn" style="margin-top:14px">
          ← Back to Menu
        </button>
      </div>
    </div>
  `);

  // ── Game screen ─────────────────────────────────────────────
  document.body.insertAdjacentHTML("beforeend", `
    <div id="mpGameScreen" class="hide">
      <div class="mp-game-card">

        <div id="mp-countdown-wrap">
          <div class="mp-cd-num" id="mp-cd-num">3</div>
          <div class="mp-cd-label">Get ready…</div>
        </div>

        <div id="mp-race-ui" style="display:none">
          <div class="mp-race-header">
            <span class="mp-live-badge">● LIVE</span>
            <div class="mp-timer-pill" id="mp-timer-pill">—</div>
          </div>
          <div class="mp-bar-wrap">
            <div class="mp-bar" id="mp-bar" style="width:100%"></div>
          </div>
          <div class="mp-scoreboard" id="mp-scoreboard"></div>
          <div class="mp-word-zone">
            <span class="mp-word" id="mp-word">—</span>
            <div class="mp-hint">Type the word then press <kbd>Enter</kbd></div>
          </div>
          <input class="mp-game-input" id="mp-game-input"
            autocomplete="off" spellcheck="false"
            placeholder="Start typing…" disabled>
        </div>

      </div>
    </div>
  `);

  // ── Result screen ───────────────────────────────────────────
  document.body.insertAdjacentHTML("beforeend", `
    <div id="mpResultScreen" class="hide">
      <div class="mp-card">
        <h2>🏆 Race Over!</h2>
        <p>Final standings</p>
        <div id="mp-podium" style="margin:20px 0;text-align:left"></div>
        <button class="mp-btn mp-btn-primary"   id="mp-rematch-btn">🔄 Back to Lobby</button>
        <button class="mp-btn mp-btn-secondary" id="mp-result-menu-btn">🏠 Main Menu</button>
      </div>
    </div>
  `);
}

// ══════════════════════════════════════════════════════════════
//  EVENT WIRING
// ══════════════════════════════════════════════════════════════
function wireEvents() {
  // Tabs
  document.querySelectorAll(".mp-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mp-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".mp-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`mp-${tab.dataset.tab}-panel`).classList.add("active");
    });
  });

  document.getElementById("mp-create-btn").addEventListener("click", createRoom);
  document.getElementById("mp-join-btn").addEventListener("click", joinRoom);
  document.getElementById("mp-start-btn").addEventListener("click", hostStartCountdown);
  document.getElementById("mp-back-btn").addEventListener("click", () => {
    cleanup(); show("mainMenu");
  });
  document.getElementById("mp-room-code-box").addEventListener("click", () => {
    navigator.clipboard?.writeText(mp.roomId)
      .then(() => toast("Code copied! 📋", "success"));
  });

  // Game input
  const input = document.getElementById("mp-game-input");
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitWord(); });
  input.addEventListener("input", liveHighlight);

  // Result actions
  document.getElementById("mp-rematch-btn").addEventListener("click", () => {
    cleanup();
    document.getElementById("mp-created-info").style.display = "none";
    document.getElementById("mp-create-btn").style.display   = "block";
    document.getElementById("mp-join-code").value            = "";
    document.querySelector('[data-tab="create"]').click();
    show("mpLobbyScreen");
  });
  document.getElementById("mp-result-menu-btn").addEventListener("click", () => {
    cleanup(); show("mainMenu");
  });
}

// ══════════════════════════════════════════════════════════════
//  CREATE ROOM
// ══════════════════════════════════════════════════════════════
async function createRoom() {
  mp.playerName = getStoredName();
  mp.difficulty  = getStoredDifficulty();
  mp.category    = getStoredCategory();
  mp.playerId    = genId(8);
  mp.roomId      = genId(6);
  mp.isHost      = true;

  const words = await getWordBank();

  await set(ref(db, `rooms/${mp.roomId}`), {
    host: mp.playerId,
    status: "waiting",
    createdAt: serverTimestamp(),
    difficulty: mp.difficulty,
    category: mp.category,
    words,
    players: {
      [mp.playerId]: {
        name: mp.playerName, score: 0,
        wordIndex: 0, wpm: 0, correctWords: 0, done: false,
      },
    },
  });

  document.getElementById("mp-room-code-box").textContent = mp.roomId;
  document.getElementById("mp-created-info").style.display = "block";
  document.getElementById("mp-create-btn").style.display   = "none";

  listenRoom();
  toast(`Room ${mp.roomId} created! 🎉`, "success");
}

// ══════════════════════════════════════════════════════════════
//  JOIN ROOM
// ══════════════════════════════════════════════════════════════
async function joinRoom() {
  const code = document.getElementById("mp-join-code").value.trim().toUpperCase();
  if (code.length !== 6) { toast("Enter a valid 6-character code", "error"); return; }

  const snap = await get(ref(db, `rooms/${code}`));
  if (!snap.exists())                  { toast("Room not found!", "error"); return; }
  if (snap.val().status !== "waiting") { toast("That race already started!", "error"); return; }

  mp.playerName = getStoredName();
  mp.difficulty  = snap.val().difficulty || "medium";
  mp.category    = snap.val().category   || "general";
  mp.playerId    = genId(8);
  mp.roomId      = code;
  mp.isHost      = false;

  await update(ref(db, `rooms/${code}/players/${mp.playerId}`), {
    name: mp.playerName, score: 0,
    wordIndex: 0, wpm: 0, correctWords: 0, done: false,
  });

  document.getElementById("mp-room-code-box").textContent  = code;
  document.getElementById("mp-created-info").style.display = "block";
  document.getElementById("mp-create-btn").style.display   = "none";
  document.querySelector('[data-tab="create"]').click();

  listenRoom();
  toast(`Joined room ${code}! 🎮`, "success");
}

// ══════════════════════════════════════════════════════════════
//  REALTIME LISTENER
// ══════════════════════════════════════════════════════════════
function listenRoom() {
  const roomRef = ref(db, `rooms/${mp.roomId}`);
  mp._roomUnsub = onValue(roomRef, (snap) => {
    if (!snap.exists()) { toast("Room closed.", "error"); cleanup(); show("mainMenu"); return; }
    const room    = snap.val();
    const players = room.players || {};
    const count   = Object.keys(players).length;

    // Refresh lobby list while waiting
    if (!mp.gameActive) renderLobbyPlayers(players, room.host);

    // Gate start button
    const startBtn = document.getElementById("mp-start-btn");
    if (startBtn) {
      startBtn.disabled = !(mp.isHost && count >= 2);
      document.getElementById("mp-waiting-note").textContent =
        count < 2 ? "Waiting for at least 1 more player…" : `${count} players ready — host can start!`;
    }

    // Status machine
    if (room.status === "countdown" && mp.gameActive === false) {
      mp.roomWords  = room.words || [];
      mp.difficulty = room.difficulty || "medium";
      runCountdown();
    }
    if (room.status === "playing" && mp.gameActive === "countdown") {
      beginRace();
    }
    if (room.status === "playing" && mp.gameActive === true) {
      renderScoreboard(players);
    }
    if (room.status === "finished") {
      showResults(players);
    }
  });
}

// ══════════════════════════════════════════════════════════════
//  LOBBY PLAYER LIST
// ══════════════════════════════════════════════════════════════
function renderLobbyPlayers(players, hostId) {
  document.getElementById("mp-players-list").innerHTML = Object.entries(players)
    .map(([id, p]) => `
      <div class="mp-player-row">
        <div class="mp-dot"></div>
        ${id === hostId ? "👑 " : ""}
        <span>${p.name}${id === mp.playerId ? " <b>(You)</b>" : ""}</span>
      </div>
    `).join("");
}

// ══════════════════════════════════════════════════════════════
//  HOST TRIGGERS START
// ══════════════════════════════════════════════════════════════
async function hostStartCountdown() {
  await update(ref(db, `rooms/${mp.roomId}`), {
    status: "countdown",
    countdownStart: Date.now(),
  });
}

// ══════════════════════════════════════════════════════════════
//  3-2-1 COUNTDOWN
// ══════════════════════════════════════════════════════════════
function runCountdown() {
  mp.gameActive = "countdown";
  show("mpGameScreen");
  document.getElementById("mp-race-ui").style.display        = "none";
  document.getElementById("mp-countdown-wrap").style.display = "flex";

  let n = 3;
  const el = document.getElementById("mp-cd-num");
  el.textContent = n;

  const tick = setInterval(() => {
    n--;
    if (n > 0) {
      el.textContent = n;
      el.className   = "";
      void el.offsetWidth; // re-trigger animation
      el.className   = "mp-cd-num";
    } else {
      clearInterval(tick);
      el.textContent = "GO!";
      el.className   = "mp-cd-num";
      if (mp.isHost) {
        setTimeout(
          () => update(ref(db, `rooms/${mp.roomId}`), { status: "playing" }),
          700
        );
      }
    }
  }, 1000);
}

// ══════════════════════════════════════════════════════════════
//  BEGIN RACE
// ══════════════════════════════════════════════════════════════
function beginRace() {
  mp.gameActive   = true;
  mp.score        = 0;
  mp.wordIndex    = 0;
  mp.correctWords = 0;
  mp.wordsTyped   = 0;
  mp.streak       = 0;
  mp.bestStreak   = 0;
  mp.timeLeft     = getDifficultyTime();
  mp.startTime    = Date.now();

  document.getElementById("mp-countdown-wrap").style.display = "none";
  document.getElementById("mp-race-ui").style.display        = "block";

  showWord();

  const input = document.getElementById("mp-game-input");
  input.disabled = false;
  input.value    = "";
  input.focus();

  const totalTime = mp.timeLeft;
  updateTimerUI(totalTime);

  mp._gameTimer = setInterval(() => {
    mp.timeLeft--;
    updateTimerUI(totalTime);
    if (mp.timeLeft <= 0) {
      clearInterval(mp._gameTimer);
      localTimeUp();
    }
  }, 1000);
}

function updateTimerUI(total) {
  const pill = document.getElementById("mp-timer-pill");
  const bar  = document.getElementById("mp-bar");
  pill.textContent = `${mp.timeLeft}s`;
  pill.className   = `mp-timer-pill${mp.timeLeft <= 5 ? " danger" : ""}`;
  bar.style.width  = `${Math.max(0, (mp.timeLeft / total) * 100)}%`;
  bar.className    = `mp-bar${mp.timeLeft <= 5 ? " danger" : ""}`;
}

// ══════════════════════════════════════════════════════════════
//  WORD DISPLAY
// ══════════════════════════════════════════════════════════════
function showWord() {
  const word = mp.roomWords[mp.wordIndex % mp.roomWords.length];
  const el   = document.getElementById("mp-word");
  el.textContent = word;
  el.className   = "mp-word";
  const input    = document.getElementById("mp-game-input");
  input.value    = "";
  input.className = "mp-game-input";
}

function liveHighlight() {
  const val  = document.getElementById("mp-game-input").value;
  const word = mp.roomWords[mp.wordIndex % mp.roomWords.length];
  document.getElementById("mp-game-input").className =
    word.startsWith(val) ? "mp-game-input" : "mp-game-input mp-wrong-in";
}

// ══════════════════════════════════════════════════════════════
//  SUBMIT WORD  (fires on Enter)
// ══════════════════════════════════════════════════════════════
function submitWord() {
  if (mp.gameActive !== true) return;
  const typed  = document.getElementById("mp-game-input").value.trim();
  const word   = mp.roomWords[mp.wordIndex % mp.roomWords.length];
  const wordEl = document.getElementById("mp-word");
  mp.wordsTyped++;

  if (typed === word) {
    mp.correctWords++;
    mp.wordIndex++;
    mp.streak++;
    if (mp.streak > mp.bestStreak) mp.bestStreak = mp.streak;
    mp.score += calcPoints();

    wordEl.className = "mp-word mp-correct";
    setTimeout(showWord, 150);

    const elapsed = (Date.now() - mp.startTime) / 60000;
    const wpm     = elapsed > 0 ? Math.round(mp.wordIndex / elapsed) : 0;

    update(ref(db, `rooms/${mp.roomId}/players/${mp.playerId}`), {
      score: mp.score, wordIndex: mp.wordIndex,
      correctWords: mp.correctWords, wpm, done: false,
    });
  } else {
    mp.streak = 0;
    wordEl.className = "mp-word mp-wrong";
    setTimeout(() => { wordEl.className = "mp-word"; }, 280);
    document.getElementById("mp-game-input").value    = "";
    document.getElementById("mp-game-input").className = "mp-game-input";
  }
}

// ══════════════════════════════════════════════════════════════
//  TIMER EXPIRED LOCALLY
// ══════════════════════════════════════════════════════════════
async function localTimeUp() {
  mp.gameActive = false;
  document.getElementById("mp-game-input").disabled = true;

  const elapsed = (Date.now() - mp.startTime) / 60000;
  const wpm     = elapsed > 0 ? Math.round(mp.wordIndex / elapsed) : 0;

  await update(ref(db, `rooms/${mp.roomId}/players/${mp.playerId}`), {
    score: mp.score, wordIndex: mp.wordIndex,
    correctWords: mp.correctWords, wpm, done: true,
  });

  if (mp.isHost) {
    setTimeout(async () => {
      const snap    = await get(ref(db, `rooms/${mp.roomId}/players`));
      const players = snap.val() || {};
      if (Object.values(players).every((p) => p.done)) {
        update(ref(db, `rooms/${mp.roomId}`), { status: "finished" });
      } else {
        // Force-finish after 8 seconds to avoid infinite waiting
        setTimeout(
          () => update(ref(db, `rooms/${mp.roomId}`), { status: "finished" }),
          8000
        );
      }
    }, 1500);
  }
}

// ══════════════════════════════════════════════════════════════
//  LIVE SCOREBOARD
// ══════════════════════════════════════════════════════════════
function renderScoreboard(players) {
  const sorted   = Object.entries(players).sort(([, a], [, b]) => b.score - a.score);
  const leaderId = sorted[0]?.[0];
  const multi    = Object.keys(players).length > 1;

  document.getElementById("mp-scoreboard").innerHTML = sorted.map(([id, p]) => `
    <div class="mp-sc-card
      ${id === mp.playerId ? " sc-me" : ""}
      ${multi && id === leaderId ? " sc-leader" : ""}">
      <div class="mp-sc-name">
        ${multi && id === leaderId ? "👑 " : ""}${p.name}${id === mp.playerId ? " (You)" : ""}
      </div>
      <div class="mp-sc-score">${p.score ?? 0}</div>
      <div class="mp-sc-meta">${p.wpm ?? 0} WPM · ${p.wordIndex ?? 0} words</div>
    </div>
  `).join("");
}

// ══════════════════════════════════════════════════════════════
//  RESULTS PODIUM
// ══════════════════════════════════════════════════════════════
function showResults(players) {
  clearInterval(mp._gameTimer);
  mp.gameActive = false;

  const sorted = Object.entries(players).sort(([, a], [, b]) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉"];

  document.getElementById("mp-podium").innerHTML = sorted.map(([id, p], i) => `
    <div class="mp-podium-row">
      <span class="mp-medal">${medals[i] ?? `#${i + 1}`}</span>
      <span>${p.name}${id === mp.playerId ? `<span class="mp-you">YOU</span>` : ""}</span>
      <span class="mp-pod-stats">
        ${p.score} pts &nbsp;·&nbsp; ${p.wpm} WPM &nbsp;·&nbsp; ${p.wordIndex} words
      </span>
    </div>
  `).join("");

  show("mpResultScreen");
}

// ══════════════════════════════════════════════════════════════
//  CLEANUP
// ══════════════════════════════════════════════════════════════
function cleanup() {
  if (mp.roomId) { try { off(ref(db, `rooms/${mp.roomId}`)); } catch {} }
  clearInterval(mp._gameTimer);
  mp._roomUnsub = null;
  mp._gameTimer = null;
  mp.gameActive = false;
  mp.roomId     = null;
  mp.isHost     = false;
  mp.playerId   = null;
}

// ══════════════════════════════════════════════════════════════
//  PATCH THE MAIN MENU "MULTIPLAYER" BUTTON
//  The existing index.html has: id="startMultiplayer" disabled
//  We un-disable it and wire it here
// ══════════════════════════════════════════════════════════════
function patchMenuButton() {
  const btn  = document.getElementById("startMultiplayer");
  const card = document.getElementById("multiplayerCard");
  if (!btn) return;

  btn.disabled  = false;
  btn.innerHTML = '<i class="fas fa-wifi"></i> Play Online';

  if (card) {
    const p = card.querySelector("p");
    if (p) p.textContent = "Race against friends online";
  }

  btn.addEventListener("click", () => {
    mp.playerName = getStoredName();
    mp.difficulty  = getStoredDifficulty();
    mp.category    = getStoredCategory();
    // Reset lobby to clean state
    document.getElementById("mp-created-info").style.display = "none";
    document.getElementById("mp-create-btn").style.display   = "block";
    document.getElementById("mp-join-code").value            = "";
    document.querySelector('[data-tab="create"]').click();
    show("mpLobbyScreen");
  });
}

// ══════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════
injectCSS();
injectHTML();
wireEvents();
patchMenuButton();
