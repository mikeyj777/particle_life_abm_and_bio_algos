class Vector2 {
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
    return new Vector2(this.x / scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const magnitude = this.magnitude();
    if (magnitude === 0) return new Vector2(0, 0);
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  distance(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  limit(max) {
    const magnitude = this.magnitude();
    if (magnitude > max) {
      return this.normalize().multiply(max);
    } else {
      return this;
    }
  }
}