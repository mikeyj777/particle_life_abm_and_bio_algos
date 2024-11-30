import Agent from "./Agent";
import Vector2 from "./Vector2";

export default class FlockingAgent extends Agent {
  constructor(
    gridSize, 
    id = 0, 
    color = -1, 
    x = -1, 
    y = -1, 
    radius = -1, 
    brownian = false, 
    mobile = false, 
    velocity = null, 
    maxVelocity = 5, 
    ) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);
  }

  setVelocity() {
    this.velocity = new Vector2(0, 0);
    this.velocity.x = Math.floor(Math.random() * this.maxVelocity);
    this.velocity.y = Math.floor(Math.random() * this.maxVelocity);
  }

  setFlockingParams(flockingParams) {
    this.setVelocity();
    self.acceleration = new Vector2(0, 0);
    this.position = new Vector2(this.x, this.y);
    if (!flockingParams) {
      return;
    }
    if (flockingParams.maxForce) {
      this.maxForce = parseFloat(flockingParams.maxForce);
    }
    if (flockingParams.separation) {
      this.separation = parseFloat(flockingParams.separation);
    }
    if (flockingParams.alignment) {
      this.alignment = parseFloat(flockingParams.alignment);
    }
    if (flockingParams.cohesion) {
      this.cohesion = parseFloat(flockingParams.cohesion);
    }
    if (flockingParams.perceptionRadius) {
      this.perceptionRadius = parseFloat(flockingParams.perceptionRadius);
    }
    if (flockingParams.desiredSeparation) {
      this.desiredSeparation = parseFloat(flockingParams.desiredSeparation);
    }
    if (flockingParams.turnFactor) {
      this.turnFactor = parseFloat(flockingParams.turnFactor);
    }
    if (flockingParams.minSpeed) {
      this.minSpeed = parseFloat(flockingParams.minSpeed);
    }
    if (flockingParams.edgeMargin) {
      this.edgeMargin = parseFloat(flockingParams.edgeMargin);
    }
    
  }

  flockingSteps(agents) {
    const separation = this.separate(agents);
    this.align(agents);
    this.cohere(agents);
    self.velocity = self.velocity.add(self.acceleration);
    self.velocity.limit(self.maxVelocity);
  }

  separate(agents) {
    steering = new Vector2(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      if (agent.id === self.id) {
        continue;
      }
      let distance = self.position.distance(agent.position);
      if (distance > 0 && distance < self.desiredSeparation) {
        let diff = self.position.subtract(agent.position);
        diff = diff.normalize();
        steering = steering.add(diff);
        count++;
      }
    }
    if (count > 0) {

      steering.multiply(1 / count);
      // reynolds - steering = desired - velocity
      if (steering.magnitude() > 0) {
        steering = steering.normalize();
        steering = steering.multiply(self.maxVelocity);
        steering = steering.subtract(self.velocity);
        steering.limit(self.maxForce);
      }
      self.acceleration = self.acceleration.divide(count);
      self.acceleration = self.acceleration.normalize();
      self.acceleration = self.acceleration.multiply(self.maxForce);
    }
    return steering;
  }


}