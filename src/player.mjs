import { Entity } from "./entities.mjs";
import { DEG2RAD, PI2, Vec2, clampMax, keydown, wrapDeg } from "./utils.mjs";

let fov = 60;
let sw = 480;
let sh = 320;

export class Player extends Entity {
  constructor() {
    super();
    this.angle = 0;
    this.canvas = new OffscreenCanvas(sw, sh);
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) throw new Error("Could not get 2d context");
  }

  activate(gameState, x, y) {
    super.activate(gameState, x, y);
    this.angle = 0;
  }

  update(dt, gameState) {
    if (keydown(gameState, "ArrowLeft"))
      this.angle = wrapDeg(this.angle - 180 * dt);
    if (keydown(gameState, "ArrowRight"))
      this.angle = wrapDeg(this.angle + 180 * dt);

    let v;
    if (keydown(gameState, "ArrowUp")) {
      v = Vec2.fromAngle(this.angle).scale(100 * dt);
    } else if (keydown(gameState, "ArrowDown")) {
      v = Vec2.fromAngle(this.angle).scale(-100 * dt);
    }

    if (v) {
      let cmx = Math.floor(this.p.x / gameState.tileSize);
      let cmy = Math.floor(this.p.y / gameState.tileSize);
      let mx = Math.floor((this.p.x + v.x) / gameState.tileSize);
      let my = Math.floor((this.p.y + v.y) / gameState.tileSize);
      if (gameState.map[cmy * gameState.mapSize + mx]) v.x = 0;
      if (gameState.map[my * gameState.mapSize + cmx]) v.y = 0;
      this.p.x += v.x;
      this.p.y += v.y;
    }
  }

  _drawMinimap(ctx, gameState) {
    ctx.fillStyle = "black";
    ctx.fillRect(
      0,
      0,
      gameState.tileSize * gameState.mapSize + 2,
      gameState.tileSize * gameState.mapSize + 2
    );

    for (let y = 0; y < gameState.mapSize; ++y) {
      for (let x = 0; x < gameState.mapSize; ++x) {
        let tile = gameState.map[y * gameState.mapSize + x];
        ctx.fillStyle = tile ? "#aaa" : "#666";
        ctx.fillRect(
          x * gameState.tileSize,
          y * gameState.tileSize,
          gameState.tileSize,
          gameState.tileSize
        );
      }
    }

    ctx.fillStyle = `rgba(255,255,0)`;
    ctx.strokeStyle = `rgba(100, 200, 255, 0.5)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < fov; ++i) {
      ctx.beginPath();
      ctx.moveTo(this.p.x, this.p.y);
      let { v } = ray(gameState, this.p, this.angle + i - fov / 2);
      v.add(this.p);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(this.p.x, this.p.y, 5, 5, 0, 0, PI2);
    ctx.fill();
  }

  draw(ctx, gameState) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, sw, sh);

    for (let i = 0; i < fov * 2; ++i) {
      let a = this.angle + i / 2 - fov / 2;
      let { v, dir } = ray(gameState, this.p, a);
      let dist = v.len() * Math.cos((i / 2) * DEG2RAD);

      let wh = clampMax((sh * gameState.tileSize) / dist, sh);
      let wt = sh / 2 - wh / 2;
      let wl = i * (sw / fov / 2);
      let ww = sw / fov / 2;

      // Draw walls
      this.ctx.fillStyle = dir === "v" ? "#999" : "#777";
      this.ctx.fillRect(wl, wt, ww, wh);

      // Draw ceiling
      this.ctx.fillStyle = "skyblue";
      this.ctx.fillRect(wl, 0, ww, wt);

      // Draw floor
      this.ctx.fillStyle = "darkblue";
      this.ctx.fillRect(wl, wt + wh, sw / fov / 2, sw - wt - wh);
    }

    let scale = Math.min(gameState.win.w / sw, gameState.win.h / sh);
    let tw = scale * sw;
    let th = scale * sh;
    ctx.drawImage(
      this.canvas,
      0,
      0,
      sw,
      sh,
      (gameState.win.w - tw) / 2,
      (gameState.win.h - th) / 2,
      tw,
      th
    );

    if (gameState.debug) {
      this._drawMinimap(ctx, gameState);
    }
  }
}

function ray(gameState, p, deg) {
  let { map, mapSize: ms, tileSize: ts } = gameState;
  let rad = DEG2RAD * deg;
  // prettier-ignore
  let rx, ry,
      dx, dy,
      dof = 0, max_dof = ms,
      vx, vy,
      hdist = ms * ts * 10,
      vdist = ms * ts * 10;

  // Vertical lines
  let tan = -Math.tan(rad);
  if (Math.cos(rad) > 0.0001) {
    //looking right
    rx = Math.floor(p.x / ts) * ts + ts;
    ry = (p.x - rx) * tan + p.y;
    dy = ts;
    dx = -dy * tan;
  } else if (Math.cos(rad) < -0.0001) {
    // looking left
    rx = Math.floor(p.x / ts) * ts - 0.001;
    ry = (p.x - rx) * tan + p.y;
    dy = -ts;
    dx = -dy * tan;
  } else {
    // Up or down
    rx = p.x;
    ry = p.y;
    dof = max_dof;
  }

  while (dof++ < max_dof) {
    let mx = Math.floor(rx / ts);
    let my = Math.floor(ry / ts);
    let mp = my * ms + mx;
    if (mp >= 0 && mp < map.length && map[mp] == 1) {
      vdist = new Vec2(rx - p.x, ry - p.y).len();
      break;
    } else {
      rx += dy;
      ry += dx;
    }
  }
  vx = rx;
  vy = ry;

  // Horizontal lines
  dof = 0;
  tan = -1 / Math.tan(rad);
  if (Math.sin(rad) > 0.0001) {
    // Looking down:
    ry = Math.floor(p.y / ts) * ts + ts;
    rx = (p.y - ry) * tan + p.x;
    dx = ts;
    dy = -dx * tan;
  } else if (Math.sin(rad) < -0.0001) {
    // Looking up:
    ry = Math.floor(p.y / ts) * ts - 0.001;
    rx = (p.y - ry) * tan + p.x;
    dx = -ts;
    dy = -dx * tan;
  } else {
    // left or right
    rx = p.x;
    ry = p.y;
    dof = max_dof;
  }
  while (dof++ < max_dof) {
    let mx = Math.floor(rx / ts);
    let my = Math.floor(ry / ts);
    let mp = my * ms + mx;

    if (mp >= 0 && mp < map.length && map[mp] === 1) {
      hdist = new Vec2(rx - p.x, ry - p.y).len();
      break;
    } else {
      ry += dx;
      rx += dy;
    }
  }

  if (vdist < hdist) {
    rx = vx;
    ry = vy;
  }

  return {
    v: Vec2.fromAngle(deg).scale(new Vec2(rx - p.x, ry - p.y).len()),
    dir: vdist < hdist ? "v" : "h",
  };
}
