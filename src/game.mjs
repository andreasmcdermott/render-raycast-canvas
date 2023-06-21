import { Vec2 } from "./utils.mjs";

export function initGame(w, h, ctx) {
  let gameState = {
    ctx,
    assets,
    debug: false,
    win: new Vec2(w, h),
  };
  return gameState;
}

export function refresh(gameState) {}

export function onResize(gameState) {}

export function gameLoop(dt, gameState) {
  let { ctx, win } = gameState;

  ctx.clearRect(0, 0, win.w, win.h);

  if (gameState.debug) {
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "14px monospace";
    ctx.fillText(`FPS: ${Math.round(1000 / dt)}`, win.w - 10, win.h - 10);
  }
}
