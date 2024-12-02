export default class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  add(vector) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }
  
  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const magnitude = this.magnitude();
    if (magnitude === 0) return new Vector2(0, 0);
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  distance(vector, gridSize = 0) {
    const dx = Math.min(
      (this.x - vector.x + gridSize) % gridSize,
      (vector.x - this.x + gridSize) % gridSize
    );
    const dy = Math.min(
      (this.y - vector.y + gridSize) % gridSize,
      (vector.y - this.y + gridSize) % gridSize
    );
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  limit(max, logIt = false, descr = "") {
    const magnitude = this.magnitude();
    // console.log("magnitude: ", magnitude);
    if (magnitude > max) {
      const norm = this.normalize();
      const mult = norm.multiply(max);
      // console.log("scaled norm:", mult);
      //  if (logIt) console.log("Description: ", descr, "normalized vector: ", norm, " | normalized vector length: ", norm.magnitude());
      return this.normalize().multiply(max);
    } else {
      return this;
    }
  }
}