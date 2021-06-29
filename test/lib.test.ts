import { Line, Point, Rect } from "../src/interfaces";
import { distance, lineIntersect, rectOverlap } from "../src/lib";

const pointA: Point = { x: 0, y: 0 };
const pointB: Point = { x: 5, y: 5 };

const lineA: Line = { x1: 0, y1: 0, x2: 5, y2: 5 };
const lineB: Line = { x1: 1, y1: 0, x2: 5, y2: 10 };
const lineC: Line = { x1: 2, y1: 0, x2: 5, y2: 4 };

const rectA: Rect = { x1: 0, y1: 0, x2: 5, y2: 5 };
const rectB: Rect = { x1: 4, y1: 4, x2: 9, y2: 9 };
const rectC: Rect = { x1: 5, y1: 5, x2: 10, y2: 10 };
const rectD: Rect = { x1: 9, y1: 9, x2: 4, y2: 4 };

describe("distance function", () => {
  test("distance of sqrt 50", () => expect(distance(pointA, pointB)).toBe(Math.sqrt(50)));
  test("distance of 0", () => expect(distance(pointA, pointA)).toBe(0));
});

describe("lineIntersect function", () => {
  test("intersection", () => expect(lineIntersect(lineA, lineB)).toBe(true));
  test("no intersection", () => expect(lineIntersect(lineA, lineC)).toBe(false));
});

describe("rectOverlap function", () => {
  test("overlap", () => expect(rectOverlap(rectA, rectB)).toBe(1));
  test("no overlap", () => expect(rectOverlap(rectA, rectC)).toBe(0));
  test("with rect that has falsy coordinates", () =>
    expect(() => rectOverlap(rectA, rectD)).toThrow());
});