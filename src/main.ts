// simulation constants

import { Point, RockPaperScissorsType } from "./Point";
import { SpatialHash } from "./SpatialHash";

const canvasSize = Math.round(
  (window.innerHeight > window.innerWidth
    ? window.innerWidth
    : window.innerHeight) * 0.75
); // width and height of the canvas in px
const gridSize = 10; // amount of rows and colls in the spatial hash grid
const pointSize = canvasSize * 0.04; // width and height of each point in px
const pointSpeed = pointSize / 10; // speed at which each point moves
const pointWiggle = pointSpeed / 3; // amount of random wiggle each point experiences
const initialPointsPerType = 50; // initial amount of points for each type (i.e Rock, Paper, Scissors)
const fps = 60; // frame rate of the simulation

// setup

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const ctx = canvas.getContext("2d")!;
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;
ctx.font = `${pointSize}px serfif`;
ctx.fillStyle = "#fdfff1";
ctx.strokeStyle = "#eecaaf";
ctx.shadowColor = "rgba(0,0,0,0.15)";
ctx.shadowBlur = 5;
ctx.shadowOffsetY = 5;

let rocks: SpatialHash;
let papers: SpatialHash;
let scissors: SpatialHash;

initializeRockPaperScissors();

const rockCountElement = document.querySelector<HTMLSpanElement>("#🗿")!;
const paperCountElement = document.querySelector<HTMLSpanElement>("#📄")!;
const scissorsCountElement = document.querySelector<HTMLSpanElement>("#✂️")!;
let lastRockCount = rocks!.size;
let lastPaperCount = papers!.size;
let lastScissorsCount = scissors!.size;

const restartButton = document.querySelector<HTMLButtonElement>("#restart")!;
restartButton.addEventListener("click", initializeRockPaperScissors);

let lastRender: number | null = null;
const timeBetweenRenders = 1000 / fps;

function update(): void {
  const elapsedTime: number | null =
    lastRender !== null ? Date.now() - lastRender : null;

  requestAnimationFrame(update);

  if (elapsedTime === null || elapsedTime > timeBetweenRenders) {
    const allPoints: Point[] = [
      ...rocks.getFlattenedList(),
      ...papers.getFlattenedList(),
      ...scissors.getFlattenedList(),
    ];

    // update positions of all points
    allPoints.forEach((point) => {
      switch (point.type) {
        case "🗿":
          updatePointPosition(point, scissors, papers, rocks);
          break;
        case "📄":
          updatePointPosition(point, rocks, scissors, papers);
          break;
        case "✂️":
          updatePointPosition(point, papers, rocks, scissors);
          break;
        default:
          break;
      }
    });

    allPoints.forEach((point) => {
      switch (point.type) {
        case "🗿":
          updatePointCollisions(point, scissors, rocks);
          break;
        case "📄":
          updatePointCollisions(point, rocks, papers);
          break;
        case "✂️":
          updatePointCollisions(point, papers, scissors);
          break;
        default:
          break;
      }
    });

    if (lastRockCount !== rocks.size) {
      rockCountElement.innerText = `🗿 ${rocks.size}`;
      lastRockCount = rocks.size;
    }
    if (lastPaperCount !== papers.size) {
      paperCountElement.innerText = `📄 ${papers.size}`;
      lastPaperCount = papers.size;
    }
    if (lastScissorsCount !== scissors.size) {
      scissorsCountElement.innerText = `✂️ ${scissors.size}`;
      lastScissorsCount = scissors.size;
    }

    render(allPoints);
  }
}

function updatePointPosition(
  point: Point,
  prey: SpatialHash,
  hunters: SpatialHash,
  peers: SpatialHash
): void {
  const oldX = point.x;
  const oldY = point.y;
  point.update(prey, hunters);
  peers.updatePoint(point, oldX, oldY);
}

function updatePointCollisions(
  point: Point,
  prey: SpatialHash,
  peers: SpatialHash
): void {
  const collidingPoints = prey.findCollidingPoints(point);
  collidingPoints.forEach((collidingPoint) => {
    collidingPoint.type = point.type;
    prey.remove(collidingPoint);
    peers.add(collidingPoint);
  });
}

function render(allPoints: Point[]): void {
  lastRender = Date.now();

  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.shadowColor = "transparent";
  const cellSize = canvasSize / 20;
  for (let i = 1; i < 20; i++) {
    ctx.strokeRect(cellSize * i, 0, 1, canvasSize);
    ctx.strokeRect(0, cellSize * i, canvasSize, 1);
  }

  ctx.shadowColor = "rgba(0,0,0,0.15)";
  allPoints.forEach((point) => {
    ctx.fillText(point.type, point.x, point.y + point.size);
  });
}

// initial call of the update() function to start the simulation
update();

function initializeRockPaperScissors(): void {
  rocks = new SpatialHash(gridSize, canvasSize, generatePoints("🗿"));
  papers = new SpatialHash(gridSize, canvasSize, generatePoints("📄"));
  scissors = new SpatialHash(gridSize, canvasSize, generatePoints("✂️"));
}

function generatePoints(type: RockPaperScissorsType): Point[] {
  return Array.from(
    { length: initialPointsPerType },
    () => new Point(type, pointSize, pointSpeed, pointWiggle, canvasSize)
  );
}
