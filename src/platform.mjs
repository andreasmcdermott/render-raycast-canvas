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
  gameLoop(dt);
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

  // window.addEventListener(
  //   "keydown",
  //   (e) => {
  //     gameState.active_input = "keyboard";
  //     gameState.input[e.key] = true;
  //   },
  //   { passive: true }
  // );

  // window.addEventListener(
  //   "keyup",
  //   (e) => {
  //     delete gameState.input[e.key];
  //     if (e.key === "Backspace") gameState.debug = !gameState.debug;
  //   },
  //   { passive: true }
  // );

  // window.addEventListener(
  //   "mousemove",
  //   ({ movementX, movementY }) => {
  //     if (gameState.has_mouse_lock) {
  //       gameState.input["MouseX"] = movementX;
  //       gameState.input["MouseY"] = movementY;
  //       gameState.active_input = "mouse";
  //     }
  //   },
  //   { passive: true }
  // );

  // window.addEventListener(
  //   "mousedown",
  //   (e) => {
  //     if (gameState.has_mouse_lock) {
  //       gameState.active_input = "mouse";
  //       gameState.input[`Mouse${e.button}`] = true;
  //     }
  //   },
  //   { passive: true }
  // );

  // window.addEventListener(
  //   "mouseup",
  //   (e) => {
  //     delete gameState.input[`Mouse${e.button}`];
  //   },
  //   { passive: true }
  // );

  // window.addEventListener("blur", (e) => {
  //   if (gameState.screen === "play" && !IS_DEV) gameState.screen = "pause";
  // });

  // window.addEventListener("gamepadconnected", (e) => {
  //   let gp = navigator.getGamepads()[e.gamepad.index];
  //   if (gp.mapping === "standard") {
  //     gamepad = e.gamepad.index;
  //     gameState.gamepad = gp;
  //   } else {
  //     gamepad = -1;
  //     console.log("Unsupported gamepad", gp);
  //   }
  // });

  // window.addEventListener("gamepaddisconnected", (e) => {
  //   gameState.gamepad = null;
  //   gamepad = -1;
  // });

  // document.addEventListener(
  //   "pointerlockchange",
  //   () => {
  //     gameState.has_mouse_lock = document.pointerLockElement === canvas;
  //   },
  //   { passive: true }
  // );

  // canvas.addEventListener("click", async () => {
  //   if (!document.pointerLockElement) {
  //     await canvas.requestPointerLock({ unadjustedMovement: true });
  //   }
  // });

  // canvas.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  // });
}
