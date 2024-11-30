export default class Agent {
  constructor(gridSize, id = 0, color = -1, x = -1, y = -1, radius = -1, brownian = false) {
    this.gridSize = gridSize;
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.brownian = brownian;
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
    if (this.color === -1) {
      this.getColor();
    }
  }

  getColor() {
    const colors = [
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
    
    if (this.id < 0) {
      this.color = Math.floor(Math.random() * colors.length);
      return;
    }
    this.color = colors[this.id % colors.length];
    
  }
  
  internalSteps() {
    if (this.brownian) {
      this.applyBrownianMotion();
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
}