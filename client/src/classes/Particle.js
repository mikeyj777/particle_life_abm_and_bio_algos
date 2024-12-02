import Agent from "./Agent";
import Vector2 from "./Vector2";

export default class Particle extends Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = 5, mass = -1, maxMass = 360) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
    this.position = new Vector2(this.x, this.y);
    this.velocity = new Vector2(0, 0);
    if (velocity) this.velocity = new Vector2(velocity.x, velocity.y);
    this.mass = Math.floor(Math.random() * maxMass) + 1;
    if (mass) this.mass = mass;
  }
}