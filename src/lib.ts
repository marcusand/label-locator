import { Rect } from "./interfaces";

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
