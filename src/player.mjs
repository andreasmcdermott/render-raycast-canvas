import { Entity } from "./entities.mjs";
import { PI2 } from "./utils.mjs";

export class Player extends Entity {
  constructor() {
    super();
    this.angle = 0;
  }

  activate(gameState, x, y) {
    super.activate(gameState, x, y);
  }

  update(dt, gameState) {}

  draw(ctx, gameState) {
    ctx.fillStyle = "skyblue";
    ctx.beginPath();
    ctx.ellipse(this.p.x, this.p.y, 5, 5, 0, 0, PI2);
    ctx.fill();
  }
}
