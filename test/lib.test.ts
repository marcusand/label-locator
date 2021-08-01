import { Rect } from "../src/interfaces";
import { rectOverlap } from "../src/lib";

const rectA: Rect = { x1: 0, y1: 0, x2: 5, y2: 5 };
const rectB: Rect = { x1: 4, y1: 4, x2: 9, y2: 9 };
const rectC: Rect = { x1: 5, y1: 5, x2: 10, y2: 10 };
const rectD: Rect = { x1: 9, y1: 9, x2: 4, y2: 4 };

describe("rectOverlap function", () => {
  test("overlap", () => expect(rectOverlap(rectA, rectB)).toBe(1));
  test("no overlap", () => expect(rectOverlap(rectA, rectC)).toBe(0));
  test("with rect that has falsy coordinates", () =>
    expect(() => rectOverlap(rectA, rectD)).toThrow());
});
