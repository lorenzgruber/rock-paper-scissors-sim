export class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector): void {
    this.x += vector.x;
    this.y += vector.y;
  }

  multiply(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  getUnitVector(): Vector {
    const magnitude = this.getMagnitude() || 1;
    return new Vector(this.x / magnitude, this.y / magnitude);
  }

  getMagnitude(): number {
    // Return the length of the vector using the pythagoran therum
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  static getVectorBetweenPoints(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): Vector {
    return new Vector(x1 - x2, y1 - y2);
  }
}
