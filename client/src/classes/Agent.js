const COLOR_ARRAY = [
  '#FF4500', // OrangeRed - A vibrant, energetic orange
  '#4B0082', // Indigo - Deep, mysterious purple
  '#00CED1', // DarkTurquoise - Bright aqua blue
  '#FF1493', // DeepPink - Intense hot pink
  '#32CD32', // LimeGreen - Fresh, vibrant green
  '#8B4513', // SaddleBrown - Rich earth tone
  '#9932CC', // DarkOrchid - Deep, royal purple
  '#FFD700', // Gold - Bright, metallic yellow
  '#DC143C', // Crimson - Deep, passionate red
  '#20B2AA', // LightSeaGreen - Calming teal
  '#FF6347', // Tomato - Bright coral red
  '#4169E1', // RoyalBlue - Classic rich blue
  '#DAA520', // Goldenrod - Warm, antique gold
  '#8A2BE2', // BlueViolet - Rich violet purple
  '#2E8B57', // SeaGreen - Deep forest green
  '#FF8C00', // DarkOrange - Rich sunset orange
  '#BA55D3', // MediumOrchid - Bright lavender
  '#CD853F', // Peru - Warm terracotta
  '#00FA9A', // MediumSpringGreen - Bright mint
  '#C71585'  // MediumVioletRed - Deep magenta
];

export default class Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false, mobile = false, velocity = null, maxVelocity = 5) {
    this.gridSize = gridSize;
    this.id = id;
    this.color = color;
    this.originalColor = color;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.brownian = brownian;
    this.velocity = velocity;
    this.maxVelocity = maxVelocity;
    this.mobile = mobile;
    this.colors = COLOR_ARRAY;
    this.colorRgb = null;
    this.initialize()
  }

  initialize() {
    if (this.x === -1) {
      this.x = Math.floor(Math.random() * this.gridSize);
    }
    if (this.y === -1) {
      this.y = Math.floor(Math.random() * this.gridSize);
    }
    if (this.radius === -1) {
      const maxRadius = Math.floor(this.gridSize / 10);
      const minRadius = Math.floor(this.gridSize / 100);
      this.radius = Math.floor(Math.random() * (maxRadius - minRadius)) + minRadius;
    }
    // console.log("in base initialize.  this.color: ", this.color);
    if (this.color === -1) {
      // console.log("in base initialize.  this.color: ", this.color);
      this.getColorBase();
      // console.log("this.color: ", this.color);
    }

    if (this.brownian !== true) {
      this.brownian = false;
    }

    if (this.mobile && !this.velocity) {
      this.setVelocity();
    }
  }

  getColorBase() {

    if (this.id < 0) {
      this.color = Math.floor(Math.random() * this.colors.length);
      return;
    }
    this.color = this.colors[this.id % this.colors.length];
    this.originalColor = this.color;
  }
  
  internalSteps() {
    if (this.brownian) {
      this.applyBrownianMotion();
    }
    if (this.mobile) {
      this.move();
    }
  }

  applyBrownianMotion() {
    const xNew = this.x + Math.floor(Math.random() * 3) - 1;
    const yNew = this.y + Math.floor(Math.random() * 3) - 1;
    if (xNew >= 0 && xNew < this.gridSize) {
      this.x = xNew;
    }
    if (yNew >= 0 && yNew < this.gridSize) {
      this.y = yNew;
    }
  }

  setVelocity() {
    this.velocity = {
      x: Math.floor(Math.random() * this.maxVelocity),
      y: Math.floor(Math.random() * this.maxVelocity)
    };
  }

  move(gravity = 0, wrap = false, bounce = false) {
    // Calculate new position
    this.velocity.y += gravity;
    
    if (this.position) {
      this.x = this.position.x;
      this.y = this.position.y;
    }
    
    let newX = this.x + this.velocity.x;
    let newY = this.y + this.velocity.y;
    
    if (bounce) {
      if (newX < 0) {
        newX = 0;
        this.velocity.x *= -1;
      } else if (newX >= this.gridSize) {
        newX = this.gridSize - 1;
        this.velocity.x *= -1;
      }
      if (newY < 0) {
          newY = 0;
          this.velocity.y *= -1;
      } else if (newY >= this.gridSize) {
          newY = this.gridSize - 1;
          this.velocity.y *= -1;
      }
    }
    
    if (wrap) {
      newX = (newX + this.gridSize) % this.gridSize;
      newY = (newY + this.gridSize) % this.gridSize;
    }

    // Update position
    this.x = newX;
    this.y = newY;
    if (this.position) {
      this.position.x = this.x;
      this.position.y = this.y;
    }
  }
}