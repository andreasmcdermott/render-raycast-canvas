import { Player } from "./player.mjs";
import { Vec2 } from "./utils.mjs";

export function initGame(w, h, ctx) {
  let gameState = {
    ctx,
    debug: false,
    win: new Vec2(w, h),
    mapSize: new Vec2(8, 8),
    tileSize: new Vec2(32, 32),
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

export function refresh(gameState) {}

export function onResize(gameState) {}

export function gameLoop(dt, gameState) {
  let { ctx, win, mapSize, map, tileSize } = gameState;

  if (!gameState.player.active) {
    gameState.player.activate(gameState, 3.5 * tileSize.w, 3.5 * tileSize.h);
  }

  ctx.clearRect(0, 0, win.w, win.h);

  for (let y = 0; y < mapSize.h; ++y) {
    for (let x = 0; x < mapSize.w; ++x) {
      let tile = map[y * mapSize.w + x];
      ctx.fillStyle = tile ? "white" : "gray";
      ctx.fillRect(
        x * tileSize.w + 1,
        y * tileSize.h + 1,
        tileSize.w - 2,
        tileSize.h - 2
      );
    }
  }

  gameState.player.update(dt, gameState);
  gameState.player.draw(ctx, gameState);

  if (gameState.debug) {
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "14px monospace";
    ctx.fillText(`FPS: ${Math.round(1000 / dt)}`, win.w - 10, win.h - 10);
  }
}
