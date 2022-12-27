import { Point } from "./Point";
import { Vector } from "./vector";

export class SpatialHash {
  grid: Point[][][];
  cellSize: number;
  gridSize: number;

  constructor(gridSize: number, canvasSize: number, points: Point[]) {
    this.grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => [])
    );
    this.cellSize = canvasSize / gridSize;
    this.gridSize = gridSize;

    points.forEach((point) => this.add(point));
  }

  add(point: Point): void {
    const gridCell = this.getGridCell(point.x, point.y);
    const bucket = this.grid[gridCell[0]][gridCell[1]];
    bucket.push(point);
  }

  remove(point: Point): void {
    const gridCell = this.getGridCell(point.x, point.y);
    const bucket = this.grid[gridCell[0]][gridCell[1]];
    this.grid[gridCell[0]][gridCell[1]] = bucket.filter(
      (p) => p.id !== point.id
    );
  }

  updatePoint(point: Point, oldX: number, oldY: number): void {
    const gridCell = this.getGridCell(point.x, point.y);
    const oldGridCell = this.getGridCell(oldX, oldY);

    if (gridCell[0] !== oldGridCell[0] || gridCell[1] !== oldGridCell[1]) {
      let oldBucket = this.grid[oldGridCell[0]][oldGridCell[1]];
      const newBucket = this.grid[gridCell[0]][gridCell[1]];

      this.grid[oldGridCell[0]][oldGridCell[1]] = oldBucket.filter(
        (p) => p.id !== point.id
      );
      newBucket.push(point);
    }
  }

  findNearestPoint(x: number, y: number): Point | null {
    if (this.getFlattenedList().length === 0) return null;

    let searchRadius = 0;
    const sourceGridCell = this.getGridCell(x, y);
    let gridCellsToSearch: number[][] = this.getGridGridCellsAround(
      sourceGridCell,
      searchRadius
    );

    while (
      !gridCellsToSearch.some((gridCell) => {
        const bucket = this.grid[gridCell[0]][gridCell[1]];
        return bucket.length > 0;
      })
    ) {
      searchRadius++;
      gridCellsToSearch = this.getGridGridCellsAround(
        sourceGridCell,
        searchRadius
      );
    }

    let nearestPoint: Point;
    gridCellsToSearch.forEach((gridCell) => {
      const bucket = this.grid[gridCell[0]][gridCell[1]];
      bucket.forEach((point) => {
        if (!nearestPoint) nearestPoint = point;
        else {
          const distanceToCurrentPoint = Vector.getVectorBetweenPoints(
            x,
            y,
            point.x,
            point.y
          ).getMagnitude();
          const distanceToNearestPoint = Vector.getVectorBetweenPoints(
            x,
            y,
            nearestPoint.x,
            nearestPoint.y
          ).getMagnitude();

          if (distanceToCurrentPoint < distanceToNearestPoint)
            nearestPoint = point;
        }
      });
    });

    return nearestPoint!;
  }

  findCollidingPoints(point: Point): Point[] {
    const boundingBox = point.getBoundingBox();
    let gridCells: number[][] = [];
    gridCells.push(this.getGridCell(boundingBox.x1, boundingBox.y1));
    gridCells.push(this.getGridCell(boundingBox.x1, boundingBox.y2));
    gridCells.push(this.getGridCell(boundingBox.x2, boundingBox.y1));
    gridCells.push(this.getGridCell(boundingBox.x2, boundingBox.y2));

    const discinctGridCells = new Set<string>();
    gridCells
      .filter(
        (gridCell) => gridCell[0] < this.gridSize && gridCell[1] < this.gridSize
      )
      .forEach((gridCell) => discinctGridCells.add(gridCell.join(",")));

    let collidingPoints: Point[] = [];
    discinctGridCells.forEach((gridCellString) => {
      const gridCell: number[] = gridCellString.split(",").map((str) => +str);
      const bucket = this.grid[gridCell[0]][gridCell[1]];
      collidingPoints = collidingPoints.concat(
        bucket.filter((pointToCheck) => point.checkCollision(pointToCheck))
      );
    });
    return collidingPoints;
  }

  getFlattenedList(): Point[] {
    let flattenedList: Point[] = [];
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        flattenedList = flattenedList.concat(this.grid[i][j]);
      }
    }
    return flattenedList;
  }

  private getGridCell(x: number, y: number): number[] {
    return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
  }

  private getGridGridCellsAround(
    sourceGridCell: number[],
    radius: number
  ): number[][] {
    if (radius === 0) return [sourceGridCell];

    const left =
      sourceGridCell[0] - radius < 0 ? 0 : sourceGridCell[0] - radius;
    const right =
      sourceGridCell[0] + radius > this.gridSize - 1
        ? this.gridSize - 1
        : sourceGridCell[0] + radius;
    const top = sourceGridCell[1] - radius < 0 ? 0 : sourceGridCell[1] - radius;
    const bottom =
      sourceGridCell[1] + radius > this.gridSize - 1
        ? this.gridSize - 1
        : sourceGridCell[1] + radius;

    const tl = [left, top];
    const tr = [right, top];
    const bl = [left, bottom];
    const br = [right, bottom];

    const gridCells: number[][] = [tl, tr, bl, br];

    // top edge
    for (let i = left + 1; i < right; i++) {
      gridCells.push([i, top]);
    }

    // bottom edge
    for (let i = left + 1; i < right; i++) {
      gridCells.push([i, bottom]);
    }

    // left edge
    for (let i = top + 1; i < bottom; i++) {
      gridCells.push([left, i]);
    }

    // right edge
    for (let i = top + 1; i < bottom; i++) {
      gridCells.push([right, i]);
    }

    return gridCells;
  }
}
