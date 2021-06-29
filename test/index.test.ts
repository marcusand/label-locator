import overlapsRemove from "../src/index";

const labels = [
  { x: 0, y: 0, width: 10, height: 10 },
  { x: 30, y: 30, width: 10, height: 10 },
  { x: 60, y: 60, width: 10, height: 10 },
];

const anchors = [
  { x: 0, y: 0, length: 1 },
  { x: 30, y: 30, length: 1 },
  { x: 60, y: 60, length: 1 },
];

describe("overlaps remove", () => {
  let remover;

  beforeEach(() => {
    remover = overlapsRemove({
      labels,
      anchors,
      containerHeight: 100,
      containerWidth: 100,
    });
  });

  test("to return object", () => expect(remover).toBeInstanceOf(Object));
  test("to return start function", () => expect(remover.start).toBeInstanceOf(Function));
  test("start function to return array of same length", () =>
    expect(remover.start(1000)).toHaveLength(labels.length));
  test("start function to return new array", () =>
    expect(remover.start(1000)).not.toBe(labels));
});
