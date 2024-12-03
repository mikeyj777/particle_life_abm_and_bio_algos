import Agent from "./Agent";
import Vector2 from "./Vector2";

const K = 0.001;

export default class Particle extends Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = 5, mass = -1, maxMass = 360) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
    this.position = new Vector2(this.x, this.y);
    this.velocity = new Vector2(0, 0);
    if (velocity) this.velocity = new Vector2(velocity.x, velocity.y);
    this.mass = Math.floor(Math.random() * maxMass) + 1;
    if (mass) this.mass = mass;
    this.acceleration = new Vector2(0, 0);
  }

  applyForce(mouseCoords) {
    const mouseVect = new Vector2(mouseCoords.x, mouseCoords.y);
    let force = new Vector2(mouseCoords.x,mouseCoords.y);
    force = force.subtract(this.position);
    force = force.normalize();
    force = force.multiply(this.mass * this.mass * K);
    if (this.position.distance(mouseVect) < 50 + this.mass) {
      force = force.multiply(-1);
    }
    this.acceleration = force.divide(this.mass);
    this.velocity = this.velocity.add(this.acceleration);
    this.velocity = this.velocity.multiply(0.99);
    this.position = this.position.add(this.velocity);
  }

}