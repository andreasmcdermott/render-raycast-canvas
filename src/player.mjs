import { Entity } from "./entities.mjs";
import { DEG2RAD, PI, PI2, Vec2, keydown, wrapDeg } from "./utils.mjs";

export class Player extends Entity {
  constructor() {
    super();
    this.angle = 0;
    this.rays = Array.from({ length: 60 }, () => new Vec2());
  }

  activate(gameState, x, y) {
    super.activate(gameState, x, y);
    this.angle = 0;
    for (let i = 0; i < this.rays.lenth; ++i) {
      this.rays[i].set(0, 0);
    }
  }

  update(dt, gameState) {
    let dx = 0,
      dy = 0;
    if (keydown(gameState, "ArrowLeft")) dx = -100 * dt;
    // this.angle = wrapDeg(this.angle - 180 * dt);
    if (keydown(gameState, "ArrowRight")) dx = 100 * dt;
    // this.angle = wrapDeg(this.angle + 180 * dt);

    if (keydown(gameState, "ArrowUp")) dy = -100 * dt;
    if (keydown(gameState, "ArrowDown")) dy = 100 * dt;

    let cmx = Math.floor(this.p.x / gameState.tileSize);
    let cmy = Math.floor(this.p.y / gameState.tileSize);
    let mx = Math.floor((this.p.x + dx) / gameState.tileSize);
    let my = Math.floor((this.p.y + dy) / gameState.tileSize);
    if (gameState.map[cmy * gameState.mapSize + mx]) dx = 0;
    if (gameState.map[my * gameState.mapSize + cmx]) dy = 0;
    this.p.x += dx;
    this.p.y += dy;

    // for (let i = 0; i < this.rays.length; ++i) {
    //   let v = ray(
    //     gameState,
    //     this.p,
    //     wrapDeg(this.angle + i - (this.rays.length >> 1))
    //   );
    //   this.rays[i].set(v.x, v.y);
    // }
  }

  draw(ctx, gameState) {
    ctx.fillStyle = `rgba(255,255,0)`;
    ctx.strokeStyle = `rgba(100, 200, 255, 0.5)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < 360; ++i) {
      ctx.beginPath();
      ctx.moveTo(this.p.x, this.p.y);
      let p2 = ray(gameState, this.p, i);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(this.p.x, this.p.y, 5, 5, 0, 0, PI2);
    ctx.fill();
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

  return Vec2.fromAngle(deg)
    .scale(new Vec2(rx - p.x, ry - p.y).len())
    .add(p);
}
