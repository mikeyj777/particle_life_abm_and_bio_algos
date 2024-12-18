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
    agentTypes = 5
    ) {
    super(gridSize, id, color, x, y, radius, brownian, mobile, velocity, maxVelocity);

    this.maxForce = 0.1;
    this.separationWeight = 1.5;
    this.alignmentWeight = 1.0;
    this.cohesionWeight = 1.0;
    this.perceptionRadius = 50;
    this.desiredSeparation = 25;
    this.turnFactor = 0.3;
    this.minSpeed = 0;
    this.edgeMargin = 50;
    this.position = new Vector2(this.x, this.y);
    this.lowXvelocityInARow = 0;
    this.stepCounter = 0;
    this.maxLowXvelocityInARow = 0;
    this.agentTypes = agentTypes;
    this.agentType = this.id % this.agentTypes;
    this.getColor();
  }

  getColor() {
    this.color = this.colors[this.agentType % this.colors.length];
  }

  setVelocity() {
    // Create a random angle in radians
    const angle = Math.random() * Math.PI * 2;

    // Use trigonometry to get a random direction with consistent speed
    const speed = this.minSpeed + (Math.random() * (this.maxVelocity - this.minSpeed));
    this.velocity = new Vector2(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
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

    // const BASE_BOIDS_PARAMS = {
    //   maxForce: 0.1,
    //   separation: [0.25, 0.5, 1.0, 2.0, 3.0],
    //   alignment: [3.0, 2.0, 1.0, 0.5, 0.25],
    //   cohesion: [1.0, 2.0, 3.0, 0.5, 0.25],
    //   perceptionRadius: 50,
    //   desiredSeparation: [10, 20, 30, 40, 50],
    //   turnFactor: 0.1,
    //   minSpeed: 0.5,
    //   edgeMargin: 30
    // }

    if (flockingParams.maxForce) this.maxForce = parseFloat(flockingParams.maxForce);
    if (flockingParams.separation) this.separationWeight = parseFloat(flockingParams.separation[this.agentType % flockingParams.separation.length]);
    if (flockingParams.alignment) this.alignmentWeight = parseFloat(flockingParams.alignment[this.agentType % flockingParams.alignment.length]);
    if (flockingParams.cohesion) this.cohesionWeight = parseFloat(flockingParams.cohesion[this.agentType % flockingParams.cohesion.length]);
    if (flockingParams.perceptionRadius) this.perceptionRadius = parseFloat(flockingParams.perceptionRadius);
    if (flockingParams.desiredSeparation) this.desiredSeparation = parseFloat(flockingParams.desiredSeparation[this.agentType % flockingParams.desiredSeparation.length]);
    if (flockingParams.turnFactor) this.turnFactor = parseFloat(flockingParams.turnFactor);
    if (flockingParams.minSpeed) this.minSpeed = parseFloat(flockingParams.minSpeed);
    if (flockingParams.edgeMargin) this.edgeMargin = parseFloat(flockingParams.edgeMargin);

  }

  flockingControl(agents) {
    this.position = new Vector2(this.x, this.y);
    this.acceleration = new Vector2(0, 0);
    const separationForce = this.separate(agents).multiply(this.separationWeight);
    const alignmentForce = this.align(agents).multiply(this.alignmentWeight);
    const cohesionForce = this.cohere(agents).multiply(this.cohesionWeight);
    this.acceleration = separationForce;
    this.acceleration = this.acceleration.add(alignmentForce);
    this.acceleration = this.acceleration.add(cohesionForce);
    this.velocity = this.velocity.add(this.acceleration);
    // if (this.id === 0) {
    //   console.log("agent id: ", this.id, " | acceleration normal: ", this.acceleration.normalize(), " | velocity normal: ", this.velocity.normalize());
    // }
    this.velocity = this.velocity.limit(this.maxVelocity, false);
    // console.log("agent id: ", this.id, " | velocity: ", this.velocity);
    this.stepCounter++;

    if (Math.abs(this.velocity.x) < 0.1) {
      this.lowXvelocityInARow++;
    } else {
      this.lowXvelocityInARow = 0;
    }

    if (this.lowXvelocityInARow > this.maxLowXvelocityInARow) {
      this.maxLowXvelocityInARow = this.lowXvelocityInARow;
      // console.log("agent id: ", this.id, " | step: ", this.stepCounter, " | maxLowXvelocityInARow: ", this.maxLowXvelocityInARow);
    }

    this.position = this.position.add(this.velocity);
    this.position.x = (this.position.x + this.gridSize) % this.gridSize;
    this.position.y = (this.position.y + this.gridSize) % this.gridSize;
    this.x = this.position.x;
    this.y = this.position.y;
  }

  internalSteps(agents) {
    return;
  }

  separate(agents) {
    let steering = new Vector2(0, 0);
    let count = 0;
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      if (agent.id === this.id) {
        continue;
      }
      let distance = this.position.distance(agent.position, this.gridSize);
      if (distance > 0 && distance < this.desiredSeparation) {
        let diff = this.position.subtract(agent.position);
        // diff = diff.normalize();
        steering = steering.add(diff);
        count++;
      }
    }
    if (count > 0) {

      steering = steering.multiply(1 / count);
      // reynolds - steering = desired - velocity
      if (steering.magnitude() > 0) {
        steering = steering.normalize();
        steering = steering.multiply(this.maxVelocity);
        steering = steering.subtract(this.velocity);
        steering = steering.limit(this.maxForce, true, "separate");
      //   // console.log("agent id: ", this.id, " | normalized separation steering: ", steering.normalize());
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
      let distance = this.position.distance(agent.position, this.gridSize);
      if (distance > 0 && distance < this.perceptionRadius) {
        // Add slight random variation to alignment
        let neighborVelocity = agent.velocity;
        // let jitter = new Vector2(
        //   (Math.random() - 0.5) * 0.1 * this.maxForce,
        //   (Math.random() - 0.5) * 0.1 * this.maxForce
        // );
        // neighborVelocity = neighborVelocity.add(jitter);
        steering = steering.add(neighborVelocity);
        count++;
      }
    }
    if (count > 0) {
      steering = steering.multiply(1 / count);
      if (steering.magnitude() > 0) {
        steering = steering.normalize();
        steering = steering.multiply(this.maxVelocity);
        steering = steering.subtract(this.velocity);
        steering = steering.limit(this.maxForce, true, "align");
      //   // console.log("agent id: ", this.id, " | normalized alignment steering: ", steering.normalize());
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
      let distance = this.position.distance(agent.position, this.gridSize);
      if (distance > 0 && distance < this.perceptionRadius) {
        // Add slight offset to perceived positions
        let perceivedPos = new Vector2(
          agent.position.x + (Math.random() - 0.5) * this.desiredSeparation * 0.1,
          agent.position.y + (Math.random() - 0.5) * this.desiredSeparation * 0.1
        );
        centerOfMass = centerOfMass.add(agent.position);
        count++;
      }
    }
    if (count > 0) {
      centerOfMass = centerOfMass.divide(count);
      let desired = centerOfMass.subtract(this.position);
      
      // Add variability to desired velocity
      // let variation = new Vector2(
      //   (Math.random() - 0.5) * this.maxForce,
      //   (Math.random() - 0.5) * this.maxForce
      // );
      // desired = desired.add(variation);
      
      if (desired.magnitude() > 0) {
        desired = desired.normalize();
        desired = desired.multiply(this.maxVelocity);
        steering = desired.subtract(this.velocity);
        steering = steering.limit(this.maxForce, true, "cohesion");
        // console.log("agent id: ", this.id, " | normalized cohesion steering: ", steering.normalize());
      }
    }
    return steering;
  }
}