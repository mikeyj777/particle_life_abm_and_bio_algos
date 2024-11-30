export default class Agent {
  constructor(gridSize, id = 0, color = '#FF0000', x = -1, y = -1, radius = -1, brownian = false) {
    this.gridSize = gridSize;
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
    this.radius = radius;
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