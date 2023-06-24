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
      1,0,0,0,1,1,0,1,
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
  let { ctx, win, mapSize, map, tileSize } = gameState;

  if (!gameState.player.active) {
    gameState.player.activate(gameState, 3.5 * tileSize, 3.5 * tileSize);
  }

  ctx.clearRect(0, 0, win.w, win.h);

  for (let y = 0; y < mapSize; ++y) {
    for (let x = 0; x < mapSize; ++x) {
      let tile = map[y * mapSize + x];
      ctx.fillStyle = tile ? "white" : "gray";
      ctx.fillRect(
        x * tileSize + 1,
        y * tileSize + 1,
        tileSize - 2,
        tileSize - 2
      );
    }
  }

  gameState.player.update(dt, gameState);
  gameState.player.draw(ctx, gameState);

  if (gameState.debug) {
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "14px monospace";
    // ctx.fillText(`FPS: ${Math.round(1 / dt)}`, win.w - 10, win.h - 10);
    ctx.fillText(
      `Angle: ${gameState.player.angle.toFixed(2)}`,
      win.w - 10,
      win.h - 10
    );
  }
}
