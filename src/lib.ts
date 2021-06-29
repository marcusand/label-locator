import { Line, Point, Rect } from "./interfaces";

export function getRandomIndex(arrayLength: number): number {
  return Math.floor(Math.random() * arrayLength);
}

/**
 * linear cooling
 *
 * @param currT
 * @param initialT
 * @param sweeps
 * @returns
 */
export function coolingSchedule(currT: number, initialT: number, sweeps: number): number {
  return currT - initialT / sweeps;
}

/**
 * distance between two points
 *
 * @param pointA
 * @param pointB
 * @returns
 */
export function distance(pointA: Point, pointB: Point): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 *  returns true if two lines intersect, else false
 *  from http://paulbourke.net/geometry/lineline2d/
 *
 * @param lineA
 * @param lineB
 * @returns
 */
export function lineIntersect(lineA: Line, lineB: Line): boolean {
  const x1 = lineA.x1;
  const x2 = lineA.x2;
  const x3 = lineB.x1;
  const x4 = lineB.x2;
  const y1 = lineA.y1;
  const y2 = lineA.y2;
  const y3 = lineB.y1;
  const y4 = lineB.y2;

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  const numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  const numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

  /* Is the intersection along the the segments */
  const mua = numera / denom;
  const mub = numerb / denom;

  if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
    return true;
  }

  return false;
}

/**
 * returns the size of the overlap area of two rectangles
 *
 * @param rectA
 * @param rectB
 * @returns
 */
export function rectOverlap(rectA: Rect, rectB: Rect): number {
  if (
    rectA.x1 > rectA.x2 ||
    rectA.y1 > rectA.y2 ||
    rectB.x1 > rectB.x2 ||
    rectB.y1 > rectB.y2
  ) {
    throw new Error("Rect has negative size");
  }

  const xOverlap = Math.max(
    0,
    Math.min(rectA.x2, rectB.x2) - Math.max(rectA.x1, rectB.x1),
  );
  const yOverlap = Math.max(
    0,
    Math.min(rectA.y2, rectB.y2) - Math.max(rectA.y1, rectB.y1),
  );

  return xOverlap * yOverlap;
}
