import { Vector } from "./Vector";
import { v4 as uuidv4 } from "uuid";
import { SpatialHash } from "./SpatialHash";

export type RockPaperScissorsType = "🗿" | "📄" | "✂️";

export type BoundingBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export class Point {
  x: number;
  y: number;

  size: number;
  speed: number;
  wiggle: number;
  canvasSize: number;

  type: RockPaperScissorsType;
  id: string;

  constructor(
    type: RockPaperScissorsType,
    size: number,
    speed: number,
    wiggle: number,
    canvasSize: number
  ) {
    this.x = Math.random() * canvasSize;
    this.y = Math.random() * canvasSize;
    this.size = size;
    this.speed = speed;
    this.wiggle = wiggle;
    this.canvasSize = canvasSize;
    this.type = type;
    this.id = uuidv4();
  }

  update(preyPoints: SpatialHash, hunterPoints: SpatialHash): void {
    let moveVector: Vector;

    const nearestPrey = preyPoints.findNearestPoint(this.x, this.y);
    const nearestHunter = hunterPoints.findNearestPoint(this.x, this.y);

    const vectorToPrey = nearestPrey
      ? Vector.getVectorBetweenPoints(
          this.x,
          this.y,
          nearestPrey.x,
          nearestPrey.y
        )
      : null;
    const vectorToHunter = nearestHunter
      ? Vector.getVectorBetweenPoints(
          this.x,
          this.y,
          nearestHunter.x,
          nearestHunter.y
        )
      : null;

    const distanceToHunter = vectorToHunter
      ? vectorToHunter.getMagnitude()
      : Infinity;

    if ((distanceToHunter < this.size * 3 || !vectorToPrey) && vectorToHunter) {
      moveVector = vectorToHunter;
    } else if (vectorToPrey) {
      moveVector = vectorToPrey;
      moveVector.multiply(-1);
    } else {
      moveVector = new Vector(0, 0);
    }

    moveVector = moveVector.getUnitVector();
    moveVector.multiply(this.speed);

    // random wiggle vector
    const wiggleVector = new Vector(
      Math.random() * this.wiggle * 2 - this.wiggle,
      Math.random() * this.wiggle * 2 - this.wiggle
    );
    moveVector.add(wiggleVector);

    this.x += moveVector.x;
    this.y += moveVector.y;

    // prevent point going outside of canvas
    if (this.x > this.canvasSize - this.size) {
      this.x = this.canvasSize - this.size;
    } else if (this.x < 0) {
      this.x = 0;
    }
    if (this.y > this.canvasSize - this.size) {
      this.y = this.canvasSize - this.size;
    } else if (this.y < 0) {
      this.y = 0;
    }
  }

  checkCollision(point: Point): boolean {
    return (
      this.x < point.x + point.size &&
      this.x + this.size > point.x &&
      this.y < point.y + point.size &&
      this.y + this.size > point.y
    );
  }

  getBoundingBox(): BoundingBox {
    return {
      x1: this.x,
      y1: this.y,
      x2: this.x + this.size,
      y2: this.y + this.size,
    };
  }
}
