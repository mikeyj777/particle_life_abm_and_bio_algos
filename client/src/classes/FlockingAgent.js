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

    this.maxForce = 0.1;
    this.separationWeight = 1.5;
    this.alignmentWeight = 1.0;
    this.cohesionWeight = 1.0;
    this.perceptionRadius = 50;
    this.desiredSeparation = 25;
    this.turnFactor = 0.3;
    this.minSpeed = 2.0;
    this.edgeMargin = 50;
  }

  setVelocity() {
    this.velocity = new Vector2(0, 0);
    this.velocity.x = Math.floor(Math.random() * this.maxVelocity);
    this.velocity.y = Math.floor(Math.random() * this.maxVelocity);
  }

  setFlockingParams(flockingParams) {
    this.setVelocity();
    if (!flockingParams) {
      return;
    }

    // self.max_speed = 4.0         # Maximum speed
    // self.max_force = 0.1         # Maximum steering force
    // self.perception_radius = 50   # How far a boid can see others
    
    // # Behavior weights
    // self.separation_weight = 1.5  # Weight for separation force
    // self.alignment_weight = 1.0   # Weight for alignment force
    // self.cohesion_weight = 1.0    # Weight for cohesion force
    
    // # Separation parameters
    // self.desired_separation = 25  # Minimum distance between boids
    
    // # Additional tuning parameters
    // self.turn_factor = 0.3       # How sharply boids can turn
    // self.min_speed = 2.0         # Minimum speed to maintain
    // self.edge_margin = 50        # Margin to avoid edges

    if (flockingParams.maxForce) this.maxForce = parseFloat(flockingParams.maxForce);
    if (flockingParams.separation) this.separationWeight = parseFloat(flockingParams.separation);
    if (flockingParams.alignment) this.alignmentWeight = parseFloat(flockingParams.alignment);
    if (flockingParams.cohesion) this.cohesionWeight = parseFloat(flockingParams.cohesion);
    if (flockingParams.perceptionRadius) this.perceptionRadius = parseFloat(flockingParams.perceptionRadius);
    if (flockingParams.desiredSeparation) this.desiredSeparation = parseFloat(flockingParams.desiredSeparation);
    if (flockingParams.turnFactor) this.turnFactor = parseFloat(flockingParams.turnFactor);
    if (flockingParams.minSpeed) this.minSpeed = parseFloat(flockingParams.minSpeed);
    if (flockingParams.edgeMargin) this.edgeMargin = parseFloat(flockingParams.edgeMargin);

  }

  flockingSteps(agents) {
    this.position = new Vector2(this.x, this.y);
    this.acceleration = new Vector2(0, 0);
    const separationForce = this.separate(agents).multiply(this.separationWeight);
    const alignmentForce = this.align(agents).multiply(this.alignmentWeight);
    const cohesionForce = this.cohere(agents).multiply(this.cohesionWeight);
    this.acceleration = separationForce;
    this.acceleration = this.acceleration.add(alignmentForce);
    this.acceleration = this.acceleration.add(cohesionForce);
    this.velocity = this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position = this.position.add(this.velocity);
    this.x = this.position.x;
    this.y = this.position.y;
  }

  separate(agents) {
    let steering = new Vector2(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      if (agent.id === this.id) {
        continue;
      }
      let distance = this.position.distance(agent.position);
      if (distance > 0 && distance < this.desiredSeparation) {
        let diff = this.position.subtract(agent.position);
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
        steering = steering.multiply(this.maxVelocity);
        steering = steering.subtract(this.velocity);
        steering = steering.limit(this.maxForce);
      }
    }
    return steering;
  }

  align(agents) {
    let steering = new Vector2(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      if (agent.id === this.id) {
        continue;
      }
      let distance = this.position.distance(agent.position);
      if (distance > 0 && distance < this.perceptionRadius) {
        steering = steering.add(agent.velocity);
        count++;
      }
    }
    if (count > 0) {
      steering = steering.divide(count);
      if (steering.magnitude() > 0) {
        steering = steering.normalize();
        steering = steering.multiply(this.maxVelocity);
        steering = steering.subtract(this.velocity);
        steering = steering.limit(this.maxForce);
      }
    }
    return steering;
  }
  

  cohere(agents) {
    let steering = new Vector2(0, 0);
    let count = 0;
    let centerOfMass = new Vector2(0, 0);
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      if (agent.id === this.id) {
        continue;
      }
      let distance = this.position.distance(agent.position);
      if (distance > 0 && distance < this.perceptionRadius) {
        centerOfMass = centerOfMass.add(agent.position);
        count++;
      }
    }
    if (count > 0) {
      centerOfMass = centerOfMass.divide(count);
      let desired = centerOfMass.subtract(this.position); 
      if (desired.magnitude() > 0) {
        desired = desired.normalize();
        desired = desired.multiply(this.maxVelocity);
        steering = desired.subtract(this.velocity);
        steering = steering.limit(this.maxForce);
      }
    }
    return steering;
  }


}