import { Entity } from "./entities.mjs";
import { DEG2RAD, PI2, Vec2, clampMax, keydown, wrapDeg } from "./utils.mjs";

let fov = 60;
let sw = 480;
let sh = 320;

export class Player extends Entity {
  constructor() {
    super();
    this.angle = 0;
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
      let { rv } = ray(gameState, this.p, this.angle + i - fov / 2);
      ctx.lineTo(rv.x, rv.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(this.p.x, this.p.y, 5, 5, 0, 0, PI2);
    ctx.fill();
  }

  draw(ctx, gameState) {
    ctx.fillStyle = "white";
    ctx.fillRect(
      gameState.win.w / 2 - sw / 2,
      gameState.win.h / 2 - sh / 2,
      sw,
      sh
    );

    ctx.lineWidth = 480 / fov;
    ctx.fillStyle = "red";
    for (let i = 0; i < fov; ++i) {
      let a = this.angle + i - fov / 2;
      let { dist } = ray(gameState, this.p, a);
      dist *= Math.cos(i * DEG2RAD);
      let h = clampMax((sh * gameState.tileSize) / dist, sh);
      ctx.fillRect(
        gameState.win.w / 2 - sw / 2 + i * (sw / fov),
        gameState.win.h / 2 - h / 2,
        sw / fov,
        h
      );
    }

    this._drawMinimap(ctx, gameState);
  }
}

function ray(gameState, p, deg) {
  let { map, mapSize: ms, tileSize: ts } = gameState;

  let rad = DEG2RAD * deg;
  let tan,
    ry,
    rx,
    yo,
    xo,
    my,
    mx,
    mp,
    dof = 0,
    max_dof = ms,
    vx,
    vy,
    dh = ms * ts * 10,
    dv = ms * ts * 10;

  // Vertical lines
  tan = -Math.tan(rad);
  if (Math.cos(rad) > 0.0001) {
    //looking right
    rx = Math.floor(p.x / ts) * ts + ts;
    ry = (p.x - rx) * tan + p.y;
    xo = ts;
    yo = -xo * tan;
  } else if (Math.cos(rad) < -0.0001) {
    // looking left
    rx = Math.floor(p.x / ts) * ts - 0.001;
    ry = (p.x - rx) * tan + p.y;
    xo = -ts;
    yo = -xo * tan;
  } else {
    // Up or down
    rx = p.x;
    ry = p.y;
    dof = max_dof;
  }

  while (dof++ < max_dof) {
    mx = Math.floor(rx / ts);
    my = Math.floor(ry / ts);
    mp = my * ms + mx;
    if (mp >= 0 && mp < map.length && map[mp] == 1) {
      dv = new Vec2(rx - p.x, ry - p.y).len();
      break;
    } else {
      rx += xo;
      ry += yo;
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
    yo = ts;
    xo = -yo * tan;
  } else if (Math.sin(rad) < -0.0001) {
    // Looking up:
    ry = Math.floor(p.y / ts) * ts - 0.001;
    rx = (p.y - ry) * tan + p.x;
    yo = -ts;
    xo = -yo * tan;
  } else {
    // left or right
    rx = p.x;
    ry = p.y;
    dof = max_dof;
  }
  while (dof++ < max_dof) {
    mx = Math.floor(rx / ts);
    my = Math.floor(ry / ts);
    mp = my * ms + mx;

    if (mp >= 0 && mp < map.length && map[mp] === 1) {
      dh = new Vec2(rx - p.x, ry - p.y).len();
      break;
    } else {
      ry += yo;
      rx += xo;
    }
  }

  if (dv < dh) {
    rx = vx;
    ry = vy;
  }

  return {
    rv: Vec2.fromAngle(deg)
      .scale(new Vec2(rx - p.x, ry - p.y).len())
      .add(p),
    dist: new Vec2(rx - p.x, ry - p.y).len(),
  };
}
