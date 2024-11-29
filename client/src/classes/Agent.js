class Agent {
  constructor(gridSize, id = 0, color = '#FF0000', x = -1, y = -1, diameter = -1) {
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.initialize(gridSize)
  }

  initialize(gridSize) {
    if (this.x === -1) {
      this.x = Math.floor(Math.random() * gridSize);
    }
    if (this.y === -1) {
      this.y = Math.floor(Math.random() * gridSize);
    }
    if (this.diameter === -1) {
      const max_diameter = Math.floor(gridSize / 10);
      const min_diameter = Math.floor(gridSize / 100);
      this.diameter = Math.floor(Math.random() * (max_diameter - min_diameter)) + min_diameter;
    }
  }
}