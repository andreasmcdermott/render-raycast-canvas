import { Player } from "./player.mjs";
import { Vec2 } from "./utils.mjs";

export function initGame(w, h, ctx) {
  let gameState = {
    ctx,
    input: {},
    lastInput: {},
    debug: false,
    win: new Vec2(w, h),
    mapSize: 8,
    tileSize: 32,
    // prettier-ignore
    map: [
      1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,1,
      1,0,0,1,1,1,0,1,
      1,0,0,0,0,1,0,1,
      1,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,
      1,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,
    ],
    player: new Player(),
  };
  return gameState;
}

export function refresh(gameState) {
  gameState.player = new Player().copyFrom(gameState.player);
}

export function onResize(gameState) {}

export function gameLoop(dt, gameState) {
  let { ctx, win, tileSize } = gameState;

  if (!gameState.player.active) {
    gameState.player.activate(gameState, 2.5 * tileSize, 4.5 * tileSize);
  }

  ctx.clearRect(0, 0, win.w, win.h);

  gameState.player.update(dt, gameState);
  gameState.player.draw(ctx, gameState);

  if (gameState.debug) {
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "14px monospace";
    ctx.fillText(`FPS: ${Math.round(1 / dt)}`, win.w - 10, win.h - 10);
  }
}
