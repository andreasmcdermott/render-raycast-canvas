let lt;
let ctx;
let w, h;
let gameState;
let canvas;
let _Game;

function gameLoop(dt) {
  try {
    _Game.gameLoop(dt, gameState);
  } catch (err) {
    console.error(err);
  }
}

function loadGame(cb) {
  let loadFrom = "./game.mjs";
  if (IS_DEV) {
    loadFrom = `http://localhost:8000/game.mjs?t=${Date.now()}`;
  }
  import(loadFrom).then((module) => {
    _Game = module;
    if (cb) cb();
    else _Game.refresh(gameState);
  });
}

export function init(_canvas) {
  canvas = _canvas;
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.setAttribute("width", w);
  canvas.setAttribute("height", h);
  ctx = canvas.getContext("2d");

  loadGame(() => {
    gameState = _Game.initGame(w, h, ctx);
    if (IS_DEV) {
      window._gameState = gameState;
    }
    initEventListeners();
    lt = performance.now();
    requestAnimationFrame(nextFrame);
  });
}

function nextFrame(t) {
  let dt = t - lt; // dt is ~16ms
  lt = t;
  gameLoop(dt / 1000);
  requestAnimationFrame(nextFrame);
}

function initEventListeners() {
  if (IS_DEV) {
    // Reload the game on change:
    new EventSource("http://localhost:8000/esbuild").addEventListener(
      "change",
      () => {
        loadGame();
      }
    );
  }

  window.addEventListener(
    "resize",
    () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.setAttribute("width", w);
      canvas.setAttribute("height", h);
      gameState.win.set(w, h);
      _Game.onResize(gameState);
    },
    { passive: true }
  );

  window.addEventListener(
    "keydown",
    (e) => {
      gameState.input[e.key] = true;
    },
    { passive: true }
  );

  window.addEventListener(
    "keyup",
    (e) => {
      delete gameState.input[e.key];
      if (e.key === "Backspace") gameState.debug = !gameState.debug;
    },
    { passive: true }
  );

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
